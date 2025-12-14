import mongoose from "mongoose";

const PatientReportSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },

    // User's unique patient ID (e.g., "P0001")
    patientId: { type: String, required: true },

    // Patient Info (from user profile)
    name: String,
    age: Number,
    gender: String,
    symptoms: String,
    medicalHistory: String,

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

// Indexes for performance and uniqueness
PatientReportSchema.index({ userEmail: 1, timestamp: -1 });
PatientReportSchema.index({ patientId: 1 }, { unique: true });

export default mongoose.model("PatientReport", PatientReportSchema);
