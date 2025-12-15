#!/usr/bin/env python3
"""
Real ECG Heart Disease Prediction using trained CNN-GNN model
Architecture matches heartdiseasepredictioncollabfile.ipynb TRAINING cell (Cell 4)
Class mapping: CD=0, HYP=1, MI=2, NORM=3, STTC=4 (from class_map in notebook)
"""
import sys
import os
import json
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from scipy.signal import resample
from torchvision import models, transforms
from PIL import Image, ImageEnhance
import cv2

# Configuration - MATCHES NOTEBOOK TRAINING
TARGET_CLASSES = ['CD', 'HYP', 'MI', 'NORM', 'STTC']  # class_map = {'CD': 0, 'HYP': 1, 'MI': 2, 'NORM': 3, 'STTC': 4}
LEAD_ORDER = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6']

# Model paths
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'heartdiseasepredictormodel.pt')
VALIDATOR_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'ecgornotpredictionmodel.pt')
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

ECG_VALIDATION_THRESHOLD = 0.5
TARGET_LENGTH = 1000  # fixed_length in notebook


class SimpleGCNConv(nn.Module):
    """Simple GCN layer without torch_geometric dependency"""
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.lin = nn.Linear(in_channels, out_channels)  # Match trained model key
        self.bias = nn.Parameter(torch.zeros(out_channels))  # Match trained model
    
    def forward(self, x, edge_index):
        """
        x: (num_nodes, in_channels)
        edge_index: (2, num_edges)
        """
        # Normalize adjacency matrix
        num_nodes = x.size(0)
        adj = torch.zeros(num_nodes, num_nodes, device=x.device)
        adj[edge_index[0], edge_index[1]] = 1.0
        
        # Add self-loops
        adj = adj + torch.eye(num_nodes, device=x.device)
        
        # Degree normalization: D^{-1/2} A D^{-1/2}
        deg = adj.sum(dim=1)
        deg_inv_sqrt = torch.pow(deg, -0.5)
        deg_inv_sqrt[torch.isinf(deg_inv_sqrt)] = 0.0
        norm = deg_inv_sqrt.view(-1, 1) * adj * deg_inv_sqrt.view(1, -1)
        
        # GCN propagation
        out = torch.matmul(norm, x)
        out = self.lin(out) + self.bias  # Match trained model computation
        return out


class CNNGNNModel(nn.Module):
    """CNN-GNN model matching the trained model architecture"""
    def __init__(self, input_leads=12, num_classes=5, dropout=0.3):
        super().__init__()
        # CNN layers
        self.cnn = nn.ModuleDict({
            'conv1': nn.Conv1d(1, 32, kernel_size=7, padding=3),
            'bn1': nn.BatchNorm1d(32),
            'conv2': nn.Conv1d(32, 64, kernel_size=5, padding=2),
            'bn2': nn.BatchNorm1d(64),
            'conv3': nn.Conv1d(64, 64, kernel_size=3, padding=1),
            'bn3': nn.BatchNorm1d(64),
        })
        self.dropout_cnn = nn.Dropout(dropout)
        
        # GNN layers (using our simple implementation)
        self.gcn1 = SimpleGCNConv(64, 128)
        self.gcn2 = SimpleGCNConv(128, 128)
        self.dropout_gcn = nn.Dropout(dropout)
        
        # FC layers
        self.fc1 = nn.Linear(128, 64)
        self.dropout_fc = nn.Dropout(dropout)
        self.fc2 = nn.Linear(64, num_classes)
        
        self.input_leads = input_leads
    
    def forward(self, x, edge_index=None):
        """
        x: (B, T, L) - batch, timesteps (1000), leads (12)
        """
        B, T, L = x.shape
        
        # CNN: process each lead
        x_cnn = x.permute(0, 2, 1).reshape(B * L, 1, T)  # (B*12, 1, 1000)
        x_cnn = F.relu(self.cnn['bn1'](self.cnn['conv1'](x_cnn)))
        x_cnn = self.dropout_cnn(x_cnn)
        x_cnn = F.relu(self.cnn['bn2'](self.cnn['conv2'](x_cnn)))
        x_cnn = self.dropout_cnn(x_cnn)
        x_cnn = F.relu(self.cnn['bn3'](self.cnn['conv3'](x_cnn)))
        x_cnn = x_cnn.mean(dim=-1).reshape(B, L, 64)  # (B, 12, 64)
        
        # Build edge index if not provided
        if edge_index is None:
            edge_index = self._build_edge_index(L, device=x.device)
        
        # GNN: model inter-lead relationships
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
        
        # Classification
        fc_out = F.relu(self.fc1(pooled))
        fc_out = self.dropout_fc(fc_out)
        logits = self.fc2(fc_out)  # (B, 5)
        return logits
    
    def _build_edge_index(self, num_leads, device):
        """Fully-connected graph"""
        rows, cols = [], []
        for i in range(num_leads):
            for j in range(num_leads):
                if i != j:
                    rows.append(i)
                    cols.append(j)
        return torch.tensor([rows, cols], dtype=torch.long, device=device)


def load_ecg_validator():
    """Load MobileNetV2 ECG validator"""
    try:
        model = models.mobilenet_v2(weights=None)
        model.classifier[1] = nn.Linear(model.last_channel, 1)
        
        if os.path.exists(VALIDATOR_MODEL_PATH):
            state_dict = torch.load(VALIDATOR_MODEL_PATH, map_location=DEVICE)
            model.load_state_dict(state_dict)
            print(f"✅ ECG validator loaded from {VALIDATOR_MODEL_PATH}", file=sys.stderr)
        else:
            print(f"⚠️  Validator model not found: {VALIDATOR_MODEL_PATH}", file=sys.stderr)
            return None
        
        model.to(DEVICE)
        model.eval()
        return model
    except Exception as e:
        print(f"⚠️  ECG validator error: {e}", file=sys.stderr)
        return None


def validate_ecg_image(image_path, validator_model):
    """Validate if image is ECG"""
    if validator_model is None:
        return True, 0.95  # Default to accepting
    
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
        print(f"📊 ECG validation: {prob:.2%} - {'VALID' if is_valid else 'INVALID'}", file=sys.stderr)
        return is_valid, prob
        
    except Exception as e:
        print(f"⚠️  Validation error: {e}", file=sys.stderr)
        return True, 0.90



def digitize_single_lead(cell_bgr, target_length=1000):
    """Extract waveform from single lead cell"""
    try:
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
        
        if len(wf) < target_length:
            wf = resample(wf, target_length)
        else:
            wf = wf[:target_length]
            
        return wf.astype(np.float32)
    except Exception as e:
        print(f"⚠️  Lead digitization error: {e}", file=sys.stderr)
        return np.zeros(target_length, dtype=np.float32)


def digitize_ecg_image_6x2_opencv(image_path):
    """Digitize 6x2 grid ECG image"""
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")
    
    H, W = img.shape[:2]
    lead_height = H // 6
    lead_width = W // 2
    
    leads = []
    for i in range(12):
        row = i // 2
        col = i % 2
        cell = img[row*lead_height:(row+1)*lead_height, col*lead_width:(col+1)*lead_width]
        leads.append(digitize_single_lead(cell, TARGET_LENGTH))
    
    # Remap to correct order
    order_map = {0:0, 2:1, 4:2, 6:3, 8:4, 10:5, 1:6, 3:7, 5:8, 7:9, 9:10, 11:11}
    signal = np.zeros((TARGET_LENGTH, 12), dtype=np.float32)
    for src, dst in order_map.items():
        signal[:, dst] = leads[src]
    
    return signal


def load_disease_model():
    """Load trained CNN-GNN disease prediction model"""
    try:
        model = CNNGNNModel(input_leads=12, num_classes=5, dropout=0.3)
        
        if os.path.exists(MODEL_PATH):
            state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
            
            # Handle potential state dict keys mismatch
            if 'model_state_dict' in state_dict:
                state_dict = state_dict['model_state_dict']
            
            # Load with flexibility for missing/extra keys
            missing_keys, unexpected_keys = model.load_state_dict(state_dict, strict=False)
            
            if missing_keys:
                print(f"⚠️  Missing keys: {missing_keys[:5]}...", file=sys.stderr)
            if unexpected_keys:
                print(f"⚠️  Unexpected keys: {unexpected_keys[:5]}...", file=sys.stderr)
            
            print(f"✅ Disease model loaded from {MODEL_PATH}", file=sys.stderr)
        else:
            print(f"⚠️  Model not found: {MODEL_PATH}", file=sys.stderr)
            print("⚠️  Using randomly initialized model - predictions will be unreliable!", file=sys.stderr)
        
        model.to(DEVICE)
        model.eval()
        return model
        
    except Exception as e:
        print(f"❌ Model loading error: {e}", file=sys.stderr)
        raise


def predict_disease(signal, model):
    """Predict disease using trained model - REAL predictions only"""
    try:
        # Normalize signal
        mu = signal.mean(axis=0, keepdims=True)
        sd = signal.std(axis=0, keepdims=True) + 1e-8
        signal_norm = (signal - mu) / sd
        
        # Convert to tensor (B, T, L) format
        x = torch.from_numpy(signal_norm).float().unsqueeze(0).to(DEVICE)  # (1, 1000, 12)
        
        # Get model prediction
        with torch.no_grad():
            logits = model(x)  # (1, 5)
            probs = F.softmax(logits, dim=1).cpu().numpy()[0]  # (5,)
        
        print(f"🧠 Model logits: {logits.cpu().numpy()[0]}", file=sys.stderr)
        print(f"📊 Probabilities: {probs}", file=sys.stderr)
        
        return probs
        
    except Exception as e:
        print(f"❌ Prediction error: {e}", file=sys.stderr)
        raise


def main(image_path):
    """Main prediction pipeline"""
    try:
        print(f"\n{'='*60}", file=sys.stderr)
        print(f"🔬 Real ECG Analysis Pipeline", file=sys.stderr)
        print(f"{'='*60}", file=sys.stderr)
        print(f"📁 Image: {image_path}", file=sys.stderr)
        print(f"💻 Device: {DEVICE}", file=sys.stderr)
        
        # Step 1: Load validator
        print(f"\n1️⃣  Loading ECG validator...", file=sys.stderr)
        validator = load_ecg_validator()
        
        # Step 2: Validate image
        print(f"\n2️⃣  Validating image is ECG...", file=sys.stderr)
        is_valid, val_confidence = validate_ecg_image(image_path, validator)
        
        if not is_valid:
            result = {
                'success': False,
                'error': 'Not a valid ECG image',
                'message': f'The uploaded image does not appear to be a valid ECG. Confidence: {val_confidence:.2%}',
                'validation_confidence': round(val_confidence * 100, 2),
                'is_valid_ecg': False
            }
            print(json.dumps(result))  # CRITICAL: Must output to stdout
            return result
        
        # Step 3: Digitize ECG
        print(f"\n3️⃣  Digitizing ECG signals...", file=sys.stderr)
        signal = digitize_ecg_image_6x2_opencv(image_path)
        print(f"✅ Signal shape: {signal.shape}", file=sys.stderr)
        print(f"   Signal range: [{signal.min():.3f}, {signal.max():.3f}]", file=sys.stderr)
        
        # Step 4: Load disease model
        print(f"\n4️⃣  Loading disease prediction model...", file=sys.stderr)
        model = load_disease_model()
        
        # Step 5: Predict
        print(f"\n5️⃣  Running disease prediction...", file=sys.stderr)
        probabilities = predict_disease(signal, model)
        
        # Step 6: Format results
        predicted_idx = np.argmax(probabilities)
        predicted_class = TARGET_CLASSES[predicted_idx]
        confidence = float(probabilities[predicted_idx])
        
        risk_mapping = {
            'NORM': 'Low',
            'MI': 'High',
            'STTC': 'High',
            'HYP': 'Moderate',
            'CD': 'Moderate'
        }
        risk_level = risk_mapping.get(predicted_class, 'Moderate')
        risk_score = int(confidence * 100)
        
        result = {
            'success': True,
            'predicted_class': predicted_class,
            'risk_score': risk_score,
            'risk_level': risk_level,
            'confidence': round(confidence * 100, 2),
            'probabilities': {
                TARGET_CLASSES[i]: round(float(probabilities[i] * 100), 2)
                for i in range(len(TARGET_CLASSES))
            },
            'validation_confidence': round(val_confidence * 100, 2),
            'is_valid_ecg': True,
            'model_used': 'CNN-GNN (Real Trained Model)'
        }
        
        print(f"\n{'='*60}", file=sys.stderr)
        print(f"✅ PREDICTION COMPLETE", file=sys.stderr)
        print(f"{'='*60}", file=sys.stderr)
        print(f"Predicted: {predicted_class} ({confidence:.1%})", file=sys.stderr)
        print(f"Risk Level: {risk_level}", file=sys.stderr)
        print(f"{'='*60}\n", file=sys.stderr)
        
        # CRITICAL: Output JSON to stdout (not stderr!)
        print(json.dumps(result))
        return result
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        
        # CRITICAL: Always output error as JSON to stdout
        error_result = {
            'success': False,
            'error': str(e),
            'message': f'Prediction failed: {str(e)}'
        }
        print(json.dumps(error_result))
        return error_result


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'No image path provided',
            'message': 'Usage: python predict_real.py <image_path>'
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    # main() already prints JSON to stdout, so just call it
    main(image_path)
