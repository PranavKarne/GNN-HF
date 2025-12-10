import express from "express";
import PatientReport from "../models/PatientReport.js";
import fs from "fs";

const router = express.Router();

// ===================================================================
// ⭐ SAVE REPORT API (Now stores Base64 + ImagePath)
// ===================================================================
router.post("/save-report", async (req, res) => {
  try {
    const {
      email,
      name,
      age,
      gender,
      bloodPressure,
      bloodSugar,
      symptoms,
      imagePath,          // /uploads/xxxx.png
      predictedClass,
      riskLevel,
      riskScore,
      confidence,
      probabilities,
    } = req.body;

    // ===================================================================
    // ❗ Validate required fields
    // ===================================================================
    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    if (!imagePath) {
      return res.status(400).json({
        status: "error",
        message: "Image path missing",
      });
    }

    // ===================================================================
    // ⭐ Read image and convert to Base64
    // ===================================================================
    let imageBase64 = "";
    try {
      const fullPath = process.cwd() + imagePath; // convert public URL → real path
      const fileData = fs.readFileSync(fullPath);
      imageBase64 = fileData.toString("base64");
    } catch (err) {
      console.error("⚠ Error reading image for Base64:", err);
    }

    // ===================================================================
    // ⭐ AUTO-INCREMENT PATIENT ID PER USER
    // ===================================================================
    const lastRecord = await PatientReport.findOne({ userEmail: email })
      .sort({ patientId: -1 })
      .lean();

    let nextPatientId = lastRecord ? lastRecord.patientId + 1 : 0;

    // ===================================================================
    // ⭐ SAVE NEW REPORT
    // ===================================================================
    const report = await PatientReport.create({
      userEmail: email,

      patientId: nextPatientId,

      name,
      age,
      gender,
      bloodPressure,
      bloodSugar,
      symptoms,

      // ⭐ BOTH STORED
      imagePath,
      imageBase64,

      predictedClass,
      riskLevel,
      riskScore,
      confidence,
      probabilities,
    });

    return res.json({
      status: "success",
      message: "Report saved successfully",
      patientId: nextPatientId,
      patientIdDisplay: String(nextPatientId).padStart(4, "0"),
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
