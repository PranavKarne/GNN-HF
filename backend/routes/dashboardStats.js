import express from "express";
import PatientReport from "../models/PatientReport.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/* =========================================================================
   📊 DASHBOARD STATISTICS ROUTE
   =========================================================================
   Returns:
   - totalReports
   - highRisk
   - moderateRisk
   - lowRisk
   - totalPatients
   - latestReport
   ========================================================================= */

router.get("/dashboard-stats", authMiddleware, async (req, res) => {
  try {
    // Get email from authenticated user
    const email = req.user.email;

    /* ================================
       📌 1. Get all reports
       ================================ */
    const reports = await PatientReport.find({ userEmail: email }).sort({
      timestamp: -1,
    });

    /* ================================
       📌 2. Calculate statistics
       ================================ */

    const totalReports = reports.length;

    const highRisk = reports.filter((r) => r.riskLevel === "high").length;
    const moderateRisk = reports.filter((r) => r.riskLevel === "moderate").length;
    const lowRisk = reports.filter((r) => r.riskLevel === "low").length;

    // Count unique patients by patient name (or by patientId)
    const totalPatients = new Set(reports.map((r) => r.patientId)).size;

    const latestReport = reports[0] || null;

    /* ================================
       📌 3. Return response
       ================================ */
    return res.json({
      status: "success",
      stats: {
        totalReports,
        highRisk,
        moderateRisk,
        lowRisk,
        totalPatients,
      },
      latestReport,
    });
  } catch (error) {
    console.error("❌ DASHBOARD STATS ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Error generating dashboard stats",
    });
  }
});

export default router;
