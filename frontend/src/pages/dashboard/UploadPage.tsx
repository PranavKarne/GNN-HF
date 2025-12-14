import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BackToHome } from "@/components/BackToHome";
import { API_ENDPOINTS } from "@/config/api";
import { getAuthHeadersForFormData, getAuthHeaders } from "@/config/apiUtils";

import {
  Upload,
  Save,
  FileText,
  Image as ImageIcon,
  X,
  Brain,
  Loader2,
  User,
} from "lucide-react";

type AnalysisState = "idle" | "analyzing" | "complete";

interface AnalysisResult {
  riskLevel: string;
  riskScore: number;
  confidence: number;
  predictedClass: string;
  probabilities: Record<string, number>;
  imagePath?: string;
}

interface PatientData {
  patientName: string;
  age: string;
  gender: string;
  patientId: string;
  contactNumber: string;
  patientEmail: string;
  symptoms: string;
  medicalHistory: string;
}

export default function UploadPage() {
  const email = localStorage.getItem("email") || "";
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<AnalysisState>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Patient data for this specific upload
  const [patientData, setPatientData] = useState<PatientData>({
    patientName: "",
    age: "",
    gender: "",
    patientId: "",
    contactNumber: "",
    patientEmail: "",
    symptoms: "",
    medicalHistory: "",
  });

  // ======================================================
  // ⭐ DRAG & DROP HANDLERS
  // ======================================================
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
      setState("idle");
      setResult(null);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    setState("idle");
    setResult(null);
  };

  // ======================================================
  // ⭐ RUN ANALYSIS
  // ======================================================
  const runAnalysis = async () => {
    if (!file) return;

    setState("analyzing");
    setProgress(10);

    const formData = new FormData();
    formData.append("ecgImage", file);

    try {
      const res = await fetch(API_ENDPOINTS.PREDICT, {
        method: "POST",
        headers: getAuthHeadersForFormData(),
        body: formData,
      });

      const data = await res.json();
      console.log("🔍 Prediction Response:", data);

      if (data.status !== "success") {
        alert("Prediction error: " + data.message);
        setState("idle");
        return;
      }

      const r = data.result;

      setProgress(80);

      // ⭐ Updated result mapping
      setResult({
        riskLevel: r.risk_level?.toLowerCase() ?? "low",
        riskScore: r.risk_score ?? 0,
        confidence: r.confidence ?? 0,
        predictedClass: r.predicted_class ?? "Unknown",
        probabilities: r.probabilities ?? {},
        imagePath: r.imagePath, // ⭐ Correct backend image path
      });

      setProgress(100);
      setState("complete");
    } catch (err) {
      console.error(err);
      alert("Server Error: Could not analyze ECG");
      setState("idle");
    }
  };

  // ======================================================
  // ⭐ SAVE REPORT
  // ======================================================
  const handleSave = async () => {
    if (!result) return alert("Analyze ECG before saving!");
    if (!email) return alert("User not logged in!");

    // Validate patient data
    if (!patientData.patientName || !patientData.age || !patientData.gender || 
        !patientData.patientId || !patientData.contactNumber || !patientData.patientEmail ||
        !patientData.symptoms || !patientData.medicalHistory) {
      return alert("⚠️ Please fill all patient information fields before saving!");
    }

    const body = {
      email,
      imagePath: result.imagePath,
      predictedClass: result.predictedClass,
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      confidence: result.confidence,
      probabilities: result.probabilities,
      // Include patient data
      patientData,
    };

    try {
      const res = await fetch(API_ENDPOINTS.SAVE_REPORT, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("💾 Save Response:", data);

      if (data.status === "success") {
        alert("✅ Report saved successfully!");
        // Reset form
        setFile(null);
        setPreview(null);
        setState("idle");
        setResult(null);
        setPatientData({
          patientName: "",
          age: "",
          gender: "",
          patientId: "",
          contactNumber: "",
          patientEmail: "",
          symptoms: "",
          medicalHistory: "",
        });
      } else {
        alert("❌ Save failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error while saving report");
    }
  };

  // ======================================================
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-600";
      case "moderate":
        return "text-yellow-600";
      default:
        return "text-green-600";
    }
  };

  // ======================================================
  // ⭐ UI
  // ======================================================
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Upload ECG for Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Upload ECG image and provide patient details for analysis
            </p>
          </div>
          <BackToHome />
        </div>
      </motion.div>

      {/* Patient Information Form */}
      <Card variant="glass">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                value={patientData.patientName}
                onChange={(e) => setPatientData({ ...patientData, patientName: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={patientData.age}
                onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                placeholder="Enter age"
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                value={patientData.gender}
                onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <Label htmlFor="patientId">Patient ID *</Label>
              <Input
                id="patientId"
                value={patientData.patientId}
                onChange={(e) => setPatientData({ ...patientData, patientId: e.target.value })}
                placeholder="Enter patient ID"
              />
            </div>
            <div>
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                value={patientData.contactNumber}
                onChange={(e) => setPatientData({ ...patientData, contactNumber: e.target.value })}
                placeholder="Enter contact number"
              />
            </div>
            <div>
              <Label htmlFor="patientEmail">Email *</Label>
              <Input
                id="patientEmail"
                type="email"
                value={patientData.patientEmail}
                onChange={(e) => setPatientData({ ...patientData, patientEmail: e.target.value })}
                placeholder="Enter email"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="symptoms">Symptoms *</Label>
            <Textarea
              id="symptoms"
              value={patientData.symptoms}
              onChange={(e) => setPatientData({ ...patientData, symptoms: e.target.value })}
              placeholder="Describe symptoms..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="medicalHistory">Medical History *</Label>
            <Textarea
              id="medicalHistory"
              value={patientData.medicalHistory}
              onChange={(e) => setPatientData({ ...patientData, medicalHistory: e.target.value })}
              placeholder="Previous conditions, medications, etc."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
          {/* ECG Upload Section */}
          <Card variant="glass" className="max-w-2xl mx-auto">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                ECG Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!preview ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer ${
                  dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("ecg-input")?.click()}
              >
                <input
                  id="ecg-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Drop ECG image or click to upload</p>
              </div>
            ) : (
              <>
                <div className="relative rounded-xl overflow-hidden border">
                  <img src={preview} className="w-full h-48 object-contain bg-muted/20" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white/70 rounded-full p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {state === "analyzing" && (
                  <div className="mt-4">
                    <Loader2 className="animate-spin text-primary w-5 h-5 mb-3" />
                    <Progress value={progress} />
                  </div>
                )}

                {state === "idle" && (
                  <Button className="w-full mt-4" onClick={runAnalysis}>
                    <Brain className="w-5 h-5 mr-2" />
                    Analyze ECG
                  </Button>
                )}

                {state === "complete" && result && (
                  <div className="mt-4 p-4 bg-muted/20 rounded-xl">
                    <div className="flex justify-between mb-3">
                      <p className="text-sm text-muted-foreground">Risk Assessment</p>
                      <Badge variant="default">{result.riskLevel}</Badge>
                    </div>

                    <div className="grid grid-cols-3 text-center">
                      <div>
                        <p className={`text-xl font-bold ${getRiskColor(result.riskLevel)}`}>
                          {result.riskScore}
                        </p>
                        <p className="text-xs">Risk Score</p>
                      </div>

                      <div>
                        <p className="text-xl font-bold">{result.confidence}%</p>
                        <p className="text-xs">Confidence</p>
                      </div>

                      <div>
                        <p className="font-medium">{result.predictedClass}</p>
                        <p className="text-xs">Prediction</p>
                      </div>
                    </div>

                    <div className="mt-5 text-sm">
                      <p className="font-medium mb-2">Class Probabilities</p>
                      {Object.entries(result.probabilities).map(([label, value]) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs">
                            <span>{label}</span>
                            <span>{value.toFixed(2)}%</span>
                          </div>
                          <Progress value={value} className="h-2 mb-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            </CardContent>
          </Card>

        {/* Save Button */}
        {state === "complete" && result && (
          <Button className="w-full max-w-2xl mx-auto h-12 text-lg" onClick={handleSave}>
            <Save className="w-5 h-5 mr-2" />
            Save ECG Analysis Report
          </Button>
        )}
    </div>
  );
}
