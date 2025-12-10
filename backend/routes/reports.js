import express from "express";
import PatientReport from "../models/PatientReport.js";

const router = express.Router();

/* =========================================================================
   ⭐ GET ALL REPORTS OF LOGGED-IN USER  (History Page)
   ========================================================================= */
router.get("/get-reports", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    // Fetch reports belonging only to this user
    const reports = await PatientReport.find({ userEmail: email })
      .sort({ timestamp: -1 })
      .lean();

    return res.json({
      status: "success",
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("❌ REPORT FETCH ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error while retrieving reports",
    });
  }
});

/* =========================================================================
   ⭐ GET SINGLE REPORT BY ID (For Eye Button)
   ========================================================================= */
router.get("/get-report/:id", async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await PatientReport.findById(reportId).lean();

    if (!report) {
      return res.status(404).json({
        status: "error",
        message: "Report not found",
      });
    }

    return res.json({
      status: "success",
      report,
    });
  } catch (error) {
    console.error("❌ SINGLE REPORT ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving report",
    });
  }
});

export default router;
