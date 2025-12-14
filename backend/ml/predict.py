#!/usr/bin/env python3
"""
ECG Heart Disease Prediction Script
Two-stage pipeline:
  1. MobileNetV2 validates image is valid ECG
  2. CNN-GNN model predicts disease using ECGtizer digitization
"""
import sys
import os
import json
import numpy as np
import torch 
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GCNConv
from scipy.signal import resample_poly
from torchvision import models, transforms
from PIL import Image, ImageEnhance
from pathlib import Path

# Configuration
TARGET_CLASSES = ['CD', 'HYP', 'MI', 'NORM', 'STTC']  # Model output order
CLASS_NAMES_DISPLAY = {
    'CD': 'Conduction Disturbance',
    'HYP': 'Hypertrophy', 
    'MI': 'Myocardial Infarction',
    'NORM': 'Normal',
    'STTC': 'ST-T Change'
}
DISEASE_CLASSES = ['MI', 'STTC', 'HYP', 'CD']
LEAD_ORDER = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6']

# Calibrated thresholds (adjust based on validation)
CALIBRATED_THRESHOLDS = {
    'MI': 0.92,
    'STTC': 0.78,
    'HYP': 0.92,
    'CD': 0.91
}

# Model paths
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'heartdiseasepredictormodel.pt')
VALIDATOR_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'ecgornotpredictionmodel.pt')
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# ECG validation threshold
ECG_VALIDATION_THRESHOLD = 0.5

# Signal processing config
SOURCE_FS = 500  # ECGtizer extraction frequency
TARGET_FS = 100  # Model training frequency
DURATION_SEC = 10  # Signal duration
TARGET_LENGTH = 1000  # TARGET_FS * DURATION_SEC


def load_ecg_validator():
    """Load MobileNetV2 binary classifier for ECG validation"""
    try:
        model = models.mobilenet_v2(weights=None)
        model.classifier[1] = nn.Linear(model.last_channel, 1)
        
        state_dict = torch.load(VALIDATOR_MODEL_PATH, map_location=DEVICE)
        model.load_state_dict(state_dict)
        
        model.to(DEVICE)
        model.eval()
        return model
    except Exception as e:
        print(f"Warning: ECG validator not loaded: {e}", file=sys.stderr)
        return None


def validate_ecg_image(image_path, validator_model):
    """
    Validate if image is a valid ECG using MobileNetV2 binary classifier
    Returns: (is_valid, confidence)
    """
    if validator_model is None:
        return True, 1.0
    
    try:
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        img = Image.open(image_path).convert('RGB')
        img_tensor = transform(img).unsqueeze(0).to(DEVICE)
        
        with torch.no_grad():
            logit = validator_model(img_tensor)
            prob = torch.sigmoid(logit).item()
        
        is_valid = prob >= ECG_VALIDATION_THRESHOLD
        return is_valid, prob
        
    except Exception as e:
        print(f"Warning: ECG validation failed: {e}", file=sys.stderr)
        return True, 1.0


class CNNGNNModel(nn.Module):
    """
    CNN-GNN Hybrid Model from heartdiseasepredictioncollabfile.ipynb
    Architecture matches the notebook's training cell
    """
    def __init__(self, input_leads=12, num_classes=5, dropout=0.3):
        super().__init__()
        # CNN layers with ModuleDict (matches notebook architecture)
        self.cnn = nn.ModuleDict({
            'conv1': nn.Conv1d(1, 32, kernel_size=7, padding=3),
            'bn1': nn.BatchNorm1d(32),
            'conv2': nn.Conv1d(32, 64, kernel_size=5, padding=2),
            'bn2': nn.BatchNorm1d(64),
            'conv3': nn.Conv1d(64, 64, kernel_size=3, padding=1),
            'bn3': nn.BatchNorm1d(64),
        })
        self.dropout_cnn = nn.Dropout(dropout)
        
        # GNN layers
        self.gcn1 = GCNConv(64, 128)
        self.gcn2 = GCNConv(128, 128)
        self.dropout_gcn = nn.Dropout(dropout)
        
        # Fully connected layers
        self.fc1 = nn.Linear(128, 64)
        self.dropout_fc = nn.Dropout(dropout)
        self.fc2 = nn.Linear(64, num_classes)
        
        self.input_leads = input_leads
    
    def forward(self, x, edge_index=None):
        """
        Forward pass
        x: (B, T, L) where B=batch, T=time steps (1000), L=leads (12)
        """
        B, T, L = x.shape
        
        # CNN processing: process each lead independently
        x_cnn = x.permute(0, 2, 1).reshape(B * L, 1, T)  # (B*12, 1, 1000)
        x_cnn = F.relu(self.cnn['bn1'](self.cnn['conv1'](x_cnn)))
        x_cnn = self.dropout_cnn(x_cnn)
        x_cnn = F.relu(self.cnn['bn2'](self.cnn['conv2'](x_cnn)))
        x_cnn = self.dropout_cnn(x_cnn)
        x_cnn = F.relu(self.cnn['bn3'](self.cnn['conv3'](x_cnn)))
        x_cnn = x_cnn.mean(dim=-1).reshape(B, L, 64)  # Global avg pool: (B, 12, 64)
        
        # Build edge index if not provided
        if edge_index is None:
            edge_index = self._build_edge_index(L, device=x.device)
        
        # GNN processing: model inter-lead relationships
        gcn_outs = []
        for i in range(B):
            gnn_input = x_cnn[i]  # (12, 64)
            gcn_out = F.relu(self.gcn1(gnn_input, edge_index))
            gcn_out = self.dropout_gcn(gcn_out)
            gcn_out = F.relu(self.gcn2(gcn_out, edge_index))
            gcn_out = self.dropout_gcn(gcn_out)
            pooled = gcn_out.mean(dim=0)  # (128,)
            gcn_outs.append(pooled)
        
        pooled = torch.stack(gcn_outs)  # (B, 128)
        
        # Classification head
        fc_out = F.relu(self.fc1(pooled))
        fc_out = self.dropout_fc(fc_out)
        logits = self.fc2(fc_out)  # (B, 5)
        return logits
    
    def _build_edge_index(self, num_leads, device):
        """Build fully-connected graph for lead relationships"""
        rows, cols = [], []
        for i in range(num_leads):
            for j in range(num_leads):
                if i != j:
                    rows.append(i)
                    cols.append(j)
        return torch.tensor([rows, cols], dtype=torch.long, device=device)


def preprocess_image(image_path, contrast_factor=2.0):
    """Enhance contrast for better digitization"""
    img = Image.open(image_path).convert("L")
    enhancer = ImageEnhance.Contrast(img)
    img_enhanced = enhancer.enhance(contrast_factor)
    return img_enhanced


def digitize_with_ecgtizer(image_path):
    """
    Digitize ECG image using ECGtizer library
    Returns: (T, 12) signal array where T is variable length
    """
    try:
        from ecgtizer import ECGtizer
        
        # Preprocess image
        img = preprocess_image(image_path)
        temp_path = "/tmp/temp_ecg_enhanced.png"
        img.save(temp_path)
        
        # Run ECGtizer
        ecg = ECGtizer(temp_path, dpi=500, extraction_method="full", verbose=False, DEBUG=False)
        
        # Find maximum length across all leads
        max_len = 0
        for lead in LEAD_ORDER:
            if lead in ecg.extracted_lead:
                max_len = max(max_len, len(ecg.extracted_lead[lead]))
        
        if max_len == 0:
            raise ValueError("ECGtizer failed to extract any leads")
        
        # Align all leads to same length
        lead_arrays = []
        for lead in LEAD_ORDER:
            if lead in ecg.extracted_lead:
                arr = np.array(ecg.extracted_lead[lead])
                if len(arr) < max_len:
                    arr = np.pad(arr, (0, max_len - len(arr)), mode='edge')
            else:
                # Missing lead: initialize with zeros
                arr = np.zeros(max_len)
            lead_arrays.append(arr)
        
        signal = np.column_stack(lead_arrays).astype(np.float32)  # (T, 12)
        
        # Impute missing leads by averaging neighbors
        for i, lead in enumerate(LEAD_ORDER):
            if np.all(signal[:, i] == 0):
                left = max(i - 1, 0)
                right = min(i + 1, len(LEAD_ORDER) - 1)
                signal[:, i] = (signal[:, left] + signal[:, right]) / 2
                print(f"Imputed missing lead {lead}", file=sys.stderr)
        
        return signal
        
    except ImportError:
        print("ECGtizer not available, falling back to OpenCV", file=sys.stderr)
        return digitize_ecg_image_6x2_opencv(image_path)
    except Exception as e:
        print(f"ECGtizer failed: {e}, falling back to OpenCV", file=sys.stderr)
        return digitize_ecg_image_6x2_opencv(image_path)


def digitize_single_lead(cell_bgr, target_length=1000):
    """Extract waveform from single lead image cell (OpenCV fallback)"""
    import cv2
    from scipy.signal import resample
    
    gray = cv2.cvtColor(cell_bgr, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 120, 255, cv2.THRESH_BINARY_INV)
    height, width = thresh.shape
    
    ys = []
    for x in range(width):
        rows = np.where(thresh[:, x] > 0)[0]
        if len(rows) > 0:
            ys.append(np.mean(rows))
        else:
            ys.append(ys[-1] if ys else height / 2)
    
    wf = height - np.array(ys, dtype=np.float32)
    wf -= wf.mean()
    scale = np.max(np.abs(wf)) + 1e-8
    wf = 1.5 * (wf / scale)
    
    return resample(wf, target_length).astype(np.float32)


def digitize_ecg_image_6x2_opencv(image_path):
    """
    OpenCV fallback: Digitize 6x2 grid ECG image layout
    Returns: (1000, 12) numpy array
    """
    import cv2
    
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")
    
    H, W, _ = img.shape
    lead_height = H // 6
    lead_width = W // 2
    
    leads = []
    for i in range(12):
        row = i // 2
        col = i % 2
        cell = img[row*lead_height:(row+1)*lead_height, col*lead_width:(col+1)*lead_width]
        leads.append(digitize_single_lead(cell, 1000))
    
    # Remap to correct lead order
    order_map = {0:0, 2:1, 4:2, 6:3, 8:4, 10:5, 1:6, 3:7, 5:8, 7:9, 9:10, 11:11}
    signal = np.zeros((1000, 12), dtype=np.float32)
    for src, dst in order_map.items():
        signal[:, dst] = leads[src]
    
    return signal


def standardize_signal(signal, fs_src=SOURCE_FS, target_fs=TARGET_FS, duration_sec=DURATION_SEC):
    """
    Standardize signal to fixed length (notebook preprocessing)
    - Resample from fs_src to target_fs
    - Pad or truncate to duration_sec * target_fs samples
    """
    # Resample if frequencies differ
    if fs_src != target_fs:
        from math import gcd
        up, down = target_fs, fs_src
        g = gcd(up, down)
        signal = resample_poly(signal, up // g, down // g, axis=0)
    
    # Fix length to target_samples
    target_samples = target_fs * duration_sec
    if signal.shape[0] > target_samples:
        signal = signal[:target_samples]
    elif signal.shape[0] < target_samples:
        signal = np.pad(signal, ((0, target_samples - signal.shape[0]), (0, 0)), mode='edge')
    
    return signal.astype(np.float32)


def load_model(model_path):
    """Load the CNN-GNN model from notebook"""
    model = CNNGNNModel(num_classes=len(TARGET_CLASSES), dropout=0.3).to(DEVICE)
    
    state = torch.load(model_path, map_location=DEVICE)
    
    # Handle different state dict formats
    if isinstance(state, dict) and 'state_dict' in state:
        state = state['state_dict']
    
    # Handle 'module.' prefix from DataParallel
    from collections import OrderedDict
    cleaned_state = OrderedDict()
    for k, v in state.items():
        cleaned_state[k.replace('module.', '')] = v
    
    model.load_state_dict(cleaned_state, strict=False)
    model.eval()
    return model


@torch.no_grad()
def predict_probs(model, signal):
    """
    Get probability predictions
    signal: (1000, 12) numpy array
    Returns: (5,) probability array for [CD, HYP, MI, NORM, STTC]
    """
    # Per-lead normalization (notebook preprocessing)
    mu = signal.mean(axis=0, keepdims=True)
    sd = signal.std(axis=0, keepdims=True) + 1e-8
    signal_norm = (signal - mu) / sd
    
    # Convert to tensor: (1, 1000, 12)
    x = torch.from_numpy(signal_norm).float().unsqueeze(0).to(DEVICE)
    
    # Get logits
    logits = model(x)
    
    # Apply softmax to get probabilities
    probs = F.softmax(logits, dim=1)[0].cpu().numpy()
    
    return probs


def apply_calibrated_decision(probs, thresholds):
    """
    Apply calibrated thresholds to make final prediction
    probs: [CD, HYP, MI, NORM, STTC] probabilities
    Returns: (predicted_class, details_list)
    """
    passed = []
    for disease_class in DISEASE_CLASSES:
        idx = TARGET_CLASSES.index(disease_class)
        if probs[idx] >= thresholds[disease_class]:
            passed.append({
                'class': disease_class,
                'probability': float(probs[idx]),
                'threshold': thresholds[disease_class]
            })
    
    # If no disease exceeds threshold, predict NORM
    if not passed:
        return 'NORM', passed
    
    # Return disease with highest (prob - threshold) margin
    passed.sort(key=lambda x: (x['probability'] - x['threshold']), reverse=True)
    return passed[0]['class'], passed


def predict_image(image_path, model, validator_model, thresholds):
    """
    Full prediction pipeline for an ECG image
    Step 1: Validate image is valid ECG (MobileNetV2)
    Step 2: Digitize image (ECGtizer or OpenCV fallback)
    Step 3: Standardize signal (resample + fixed length)
    Step 4: Run disease classification (CNN-GNN)
    Returns dict with prediction results
    """
    # Step 1: Validate ECG image
    is_valid_ecg, validation_confidence = validate_ecg_image(image_path, validator_model)
    
    if not is_valid_ecg:
        return {
            'success': False,
            'error': 'Invalid ECG image',
            'message': f'The uploaded image does not appear to be a valid ECG. Confidence: {validation_confidence:.2%}',
            'validation_confidence': round(validation_confidence * 100, 2),
            'is_valid_ecg': False
        }
    
    # Step 2: Digitize image
    try:
        signal = digitize_with_ecgtizer(image_path)  # Returns (T, 12) with variable T
    except Exception as e:
        print(f"Digitization failed: {e}", file=sys.stderr)
        return {
            'success': False,
            'error': 'Digitization failed',
            'message': f'Failed to extract ECG signals from image: {str(e)}'
        }
    
    # Step 3: Standardize signal to 1000 samples @ 100Hz
    signal = standardize_signal(signal)  # Now (1000, 12)
    
    # Step 4: Get probabilities
    probs = predict_probs(model, signal)
    
    # Apply calibrated thresholds
    predicted_class, details = apply_calibrated_decision(probs, thresholds)
    
    # Map to risk level
    risk_mapping = {
        'NORM': 'Low',
        'MI': 'High',
        'STTC': 'High',
        'HYP': 'Moderate',
        'CD': 'Moderate'
    }
    
    risk_level = risk_mapping.get(predicted_class, 'Moderate')
    
    # Calculate risk score (0-100)
    if predicted_class == 'NORM':
        # Low risk for normal
        risk_score = int(probs[TARGET_CLASSES.index('NORM')] * 30)  # Max 30 for normal
    else:
        # Higher risk for disease classes
        disease_idx = TARGET_CLASSES.index(predicted_class)
        risk_score = int(probs[disease_idx] * 100)
    
    # Calculate confidence
    confidence = float(probs[TARGET_CLASSES.index(predicted_class)] * 100)
    
    return {
        'success': True,
        'predicted_class': predicted_class,
        'risk_score': risk_score,
        'risk_level': risk_level,
        'confidence': round(confidence, 2),
        'probabilities': {TARGET_CLASSES[i]: round(float(probs[i] * 100), 2) for i in range(len(TARGET_CLASSES))},
        'threshold_details': details,
        'validation_confidence': round(validation_confidence * 100, 2),
        'is_valid_ecg': True
    }


def main():
    """CLI entry point"""
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No image path provided'}))
        sys.exit(1)
    
    image_path = sys.argv[1] 
    
    try:
        # Verify image exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # Verify main model exists
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found: {MODEL_PATH}. Please place heartdiseasepredictormodel.pt in {os.path.dirname(MODEL_PATH)}")
        
        # Load validator model (binary classifier)
        validator_model = load_ecg_validator()
        
        # Load main model (CNN-GNN)
        model = load_model(MODEL_PATH)
        
        # Run prediction with validation
        result = predict_image(image_path, model, validator_model, CALIBRATED_THRESHOLDS)
        
        # Output JSON result
        print(json.dumps(result))
        
        # Exit with error code if validation failed
        if not result.get('success', False):
            sys.exit(1)
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)


if __name__ == '__main__':
    main()
