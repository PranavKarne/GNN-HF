import express from "express";
import PatientReport from "../models/PatientReport.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ===================================================================
// ⭐ SAVE REPORT API (Now stores Base64 + ImagePath)
// ===================================================================
router.post("/save-report", authMiddleware, async (req, res) => {
  try {
    const email = req.user.email; // Get from authenticated user
    const {
      imagePath,
      predictedClass,
      riskLevel,
      riskScore,
      confidence,
      probabilities,
      patientData, // New: patient data from upload form
    } = req.body;

    if (!imagePath) {
      return res.status(400).json({
        status: "error",
        message: "Image path missing",
      });
    }

    if (!patientData) {
      return res.status(400).json({
        status: "error",
        message: "Patient data is required",
      });
    }

    // ===================================================================
    // ⭐ GET USER'S DATA FROM DATABASE
    // ===================================================================
    const user = await User.findOne({ email }).lean();
    
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (!user.patientId) {
      return res.status(400).json({
        status: "error",
        message: "User does not have a patient ID assigned",
      });
    }

    // Extract patient info from the upload form data
    const name = patientData.patientName || "Unknown";
    const age = parseInt(patientData.age) || 0;
    const gender = patientData.gender || "Not specified";
    const symptoms = patientData.symptoms || "";
    const medicalHistory = patientData.medicalHistory || "";

    // ===================================================================
    // ⭐ SAVE NEW REPORT
    // ===================================================================
    const report = await PatientReport.create({
      userEmail: email,
      patientId: user.patientId, // Use user's unique patient ID
      name,
      age,
      gender,
      symptoms,
      medicalHistory,
      
      // ⭐ BOTH STORED
      imagePath,
      // imageBase64 intentionally omitted to avoid DB bloat

      predictedClass,
      riskLevel,
      riskScore,
      confidence,
      probabilities,
    });

    return res.json({
      status: "success",
      message: "Report saved successfully",
      patientId: user.patientId,
      report,
    });

  } catch (error) {
    console.error("❌ SAVE REPORT ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error while saving report",
      details: error.toString(),
    });
  }
});

export default router;
