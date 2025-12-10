import mongoose from "mongoose";

const PatientReportSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },

    // Auto-increment patient ID per user
    patientId: { type: Number, required: true },

    // Patient Info
    name: String,
    age: Number,
    gender: String,
    bloodPressure: String,
    bloodSugar: String,
    symptoms: String,

    // Image Storage
    imagePath: String,        // public URL path → /uploads/xxx.png
    imageBase64: String,      // FULL base64 string → stored safely in DB

    // AI Prediction
    predictedClass: String,
    riskLevel: String,
    riskScore: Number,
    confidence: Number,
    probabilities: Object,   // class probabilities

    // Time
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model("PatientReport", PatientReportSchema);
