import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  patientId: { type: String, unique: true, sparse: true }, // Auto-generated patient ID for system use (sparse allows null)
  // Patient Information (user-provided data)
  patientInfo: {
    patientName: String,
    age: Number,
    gender: { type: String, enum: ["Male", "Female"] },
    patientId: String, // User-provided unique patient ID
    contactNumber: String,
    patientEmail: String,
    symptoms: String,
    medicalHistory: String,
    isCompleted: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ "patientInfo.patientId": 1 }, { unique: true, sparse: true });

export default mongoose.model("User", userSchema);
