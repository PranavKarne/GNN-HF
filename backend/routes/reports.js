import express from "express";
import PatientReport from "../models/PatientReport.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { authMiddleware } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validation.js";

const router = express.Router();

/* =========================================================================
   ⭐ GET ALL REPORTS OF LOGGED-IN USER  (History Page)
   ========================================================================= */
router.get("/get-reports", authMiddleware, async (req, res) => {
  try {
    const email = req.user.email; // Get from authenticated user
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      PatientReport.find({ userEmail: email })
        .select("-imageBase64")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PatientReport.countDocuments({ userEmail: email })
    ]);

    return res.json({
      status: "success",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
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
router.get("/get-report/:id", authMiddleware, validateObjectId('id'), async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await PatientReport.findById(reportId).lean();

    if (!report) {
      return res.status(404).json({
        status: "error",
        message: "Report not found",
      });
    }

    // Verify user owns this report
    if (report.userEmail !== req.user.email) {
      return res.status(403).json({
        status: "error",
        message: "Access denied",
      });
    }

    const shapeError = validateReportShape(report);
    if (shapeError) {
      return res.status(400).json({
        status: "error",
        message: "Report is missing required fields",
        details: shapeError,
      });
    }

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

/* =========================================================================
   ⭐ DOWNLOAD REPORT AS PDF
   ========================================================================= */
router.get("/download-report/:id", authMiddleware, validateObjectId('id'), async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await PatientReport.findById(reportId).lean();

    if (!report) {
      return res.status(404).json({
        status: "error",
        message: "Report not found",
      });
    }

    // Verify user owns this report
    if (report.userEmail !== req.user.email) {
      return res.status(403).json({
        status: "error",
        message: "Access denied",
      });
    }

    // Provide safe defaults to avoid failing old/partial records
    const patientId = report.patientId || report._id.toString();
    const patientName = (report.name || "Patient").replace(/[^a-zA-Z0-9]/g, "_");
    const reportDate = new Date(report.timestamp).toISOString().split('T')[0];
    const predictedClass = report.predictedClass || "Unknown";
    const confidence = typeof report.confidence === "number" ? report.confidence : Number(report.confidence) || 0;
    const riskLevel = report.riskLevel || "low";
    const riskScore = typeof report.riskScore === "number" ? report.riskScore : Number(report.riskScore) || 0;

    // Create PDF document
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    const renderTimeout = setTimeout(() => {
      console.error("⚠️ PDF generation timed out for report", report._id.toString());
      try { doc.end(); } catch (err) { /* noop */ }
      if (!res.headersSent) {
        return res.status(504).json({ status: "error", message: "PDF generation timed out" });
      }
    }, 10000);

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${patientName}_HeartAnalysisReport_${reportDate}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Handle pipe errors
    doc.on('error', (err) => {
      console.error("❌ PDF Stream Error:", err);
    });

    res.on('error', (err) => {
      console.error("❌ Response Stream Error:", err);
    });

    const clearPdfTimer = () => clearTimeout(renderTimeout);
    doc.on('end', clearPdfTimer);
    res.on('close', clearPdfTimer);

    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);

    // ============ HEADER WITH GRADIENT EFFECT ============
    doc
      .rect(0, 0, pageWidth, 120)
      .fillAndStroke("#dc2626", "#dc2626");

    // Accent line
    doc
      .rect(0, 120, pageWidth, 3)
      .fillAndStroke("#ef4444", "#ef4444");

    // Logo (optional - skip if not found)
    try {
      // Try multiple possible locations for logo
      const possibleLogoPaths = [
        path.join(process.cwd(), "assets", "logo.png"),
        path.join(process.cwd(), "..", "frontend", "src", "assets", "hero-heart.png"),
        path.join(process.cwd(), "..", "frontend", "public", "hero-heart.png"),
        path.join(process.cwd(), "frontend", "public", "logo.png"),
      ];
      
      console.log("🔍 Searching for logo in paths:", possibleLogoPaths);
      const logoPath = possibleLogoPaths.find(p => fs.existsSync(p));
      
      if (logoPath) {
        console.log("✅ Logo found at:", logoPath);
        try {
          doc.image(logoPath, margin, 20, { 
            fit: [80, 80],
            align: 'center',
            valign: 'center'
          });
          console.log("✅ Logo successfully added to PDF");
        } catch (imgErr) {
          console.error("❌ Error embedding logo image:", imgErr.message);
          console.error("Stack:", imgErr.stack);
          // Use text logo as fallback
          doc
            .fontSize(24)
            .fillColor("#ffffff")
            .font("Helvetica-Bold")
            .text("❤️", margin + 30, 30);
        }
      } else {
        console.warn("⚠️ Logo not found in any of these paths:", possibleLogoPaths);
        // Use text logo as fallback
        doc
          .fontSize(24)
          .fillColor("#ffffff")
          .font("Helvetica-Bold")
          .text("❤️", margin + 30, 30);
      }
    } catch (err) {
      console.error("⚠️ Logo error (using text fallback):", err.message);
      console.error("Stack:", err.stack);
      // Fallback to emoji logo
      doc
        .fontSize(24)
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .text("❤️", margin + 30, 30);
    }

    // Title
    doc
      .fontSize(28)
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .text("GNN-HF", 0, 30, { align: "center" });

    doc
      .fontSize(13)
      .fillColor("#fee2e2")
      .font("Helvetica")
      .text("Graph Neural Network - Heart Failure Detection", 0, 65, { align: "center" });

    doc
      .fontSize(11)
      .fillColor("#fecaca")
      .text("AI-Powered ECG Analysis Report", 0, 85, { align: "center" });

    // ============ PATIENT INFO CARD ============
    const patientY = 145;
    
    // Card background
    doc
      .roundedRect(margin, patientY, contentWidth, 110, 8)
      .fillAndStroke("#f8fafc", "#e2e8f0");

    doc
      .fontSize(14)
      .fillColor("#dc2626")
      .font("Helvetica-Bold")
      .text("Patient Information", margin + 15, patientY + 15);

    // Divider line
    doc
      .moveTo(margin + 15, patientY + 35)
      .lineTo(pageWidth - margin - 15, patientY + 35)
      .strokeColor("#cbd5e1")
      .lineWidth(1)
      .stroke();

    // Patient details in two columns
    doc.fontSize(10).fillColor("#334155").font("Helvetica");
    const col1X = margin + 15;
    const col2X = margin + 280;
    let infoY = patientY + 50;

    doc.font("Helvetica-Bold").text("Name:", col1X, infoY);
    doc.font("Helvetica").text(report.name || "N/A", col1X + 100, infoY);

    doc.font("Helvetica-Bold").text("Patient ID:", col2X, infoY);
    doc.font("Helvetica").text(patientId, col2X + 70, infoY);

    infoY += 20;
    doc.font("Helvetica-Bold").text("Age:", col1X, infoY);
    doc.font("Helvetica").text(`${report.age || "N/A"} years`, col1X + 100, infoY);

    doc.font("Helvetica-Bold").text("Gender:", col2X, infoY);
    doc.font("Helvetica").text(report.gender || "N/A", col2X + 70, infoY);

    infoY += 20;
    doc.font("Helvetica-Bold").text("Analysis Date:", col1X, infoY);
    doc.font("Helvetica").text(new Date(report.timestamp).toLocaleDateString(), col1X + 100, infoY);

    doc.font("Helvetica-Bold").text("Analysis Time:", col2X, infoY);
    doc.font("Helvetica").text(new Date(report.timestamp).toLocaleTimeString(), col2X + 70, infoY);

    // ============ DIAGNOSIS SUMMARY CARD ============
    const diagnosisY = 285;
    
    // Determine risk color
    const riskColor = report.riskLevel === "high" ? "#ef4444" : 
                      report.riskLevel === "moderate" ? "#f59e0b" : "#10b981";
    const riskBgColor = report.riskLevel === "high" ? "#fee2e2" : 
                        report.riskLevel === "moderate" ? "#fef3c7" : "#d1fae5";

    doc
      .roundedRect(margin, diagnosisY, contentWidth, 90, 8)
      .fillAndStroke("#ffffff", "#e2e8f0");

    doc
      .fontSize(14)
      .fillColor("#dc2626")
      .font("Helvetica-Bold")
      .text("Diagnosis Summary", margin + 15, diagnosisY + 15);

    doc
      .moveTo(margin + 15, diagnosisY + 35)
      .lineTo(pageWidth - margin - 15, diagnosisY + 35)
      .strokeColor("#cbd5e1")
      .lineWidth(1)
      .stroke();

    // Three stats boxes
    const boxY = diagnosisY + 50;
    const boxWidth = (contentWidth - 60) / 3;

    // Box 1: Predicted Condition
    doc
      .roundedRect(margin + 15, boxY, boxWidth, 50, 5)
      .fillAndStroke("#f0f9ff", "#bae6fd");
    
    doc.fontSize(8).fillColor("#0369a1").font("Helvetica").text("PREDICTED CONDITION", margin + 15, boxY + 8, { width: boxWidth, align: "center" });
    doc.fontSize(12).fillColor("#0c4a6e").font("Helvetica-Bold").text(report.predictedClass, margin + 15, boxY + 24, { width: boxWidth, align: "center" });

    // Box 2: Confidence Level
    doc
      .roundedRect(margin + 30 + boxWidth, boxY, boxWidth, 50, 5)
      .fillAndStroke("#fef3c7", "#fde047");
    
    doc.fontSize(8).fillColor("#a16207").font("Helvetica").text("CONFIDENCE LEVEL", margin + 30 + boxWidth, boxY + 8, { width: boxWidth, align: "center" });
    doc.fontSize(12).fillColor("#854d0e").font("Helvetica-Bold").text(`${report.confidence}%`, margin + 30 + boxWidth, boxY + 24, { width: boxWidth, align: "center" });

    // Box 3: Risk Level
    doc
      .roundedRect(margin + 45 + (boxWidth * 2), boxY, boxWidth, 50, 5)
      .fillAndStroke(riskBgColor, riskColor);
    
    doc.fontSize(8).fillColor(riskColor).font("Helvetica").text("RISK ASSESSMENT", margin + 45 + (boxWidth * 2), boxY + 8, { width: boxWidth, align: "center" });
    doc.fontSize(12).fillColor(riskColor).font("Helvetica-Bold").text(`${report.riskLevel.toUpperCase()} (${report.riskScore}%)`, margin + 45 + (boxWidth * 2), boxY + 24, { width: boxWidth, align: "center" });

    // ============ ECG IMAGE SECTION ============
    const ecgY = 395;
    
    doc
      .fontSize(14)
      .fillColor("#1e293b")
      .font("Helvetica-Bold")
      .text("ECG Analysis", margin, ecgY);

    if (report.imageBase64) {
      try {
        console.log("📸 Processing ECG image for PDF. Base64 length:", report.imageBase64.length);
        // Strip the data URL prefix to get pure base64
        const base64Data = report.imageBase64.replace(/^data:image\/\w+;base64,/, '');
        console.log("✂️ Stripped base64 length:", base64Data.length);
        const imageBuffer = Buffer.from(base64Data, "base64");
        console.log("✅ Image buffer created, size:", imageBuffer.length, "bytes");
        const imgY = ecgY + 25;
        
        // White background with shadow effect
        doc
          .roundedRect(margin, imgY, contentWidth, 200, 8)
          .fillAndStroke("#ffffff", "#cbd5e1");
        
        doc.image(imageBuffer, margin + 10, imgY + 10, {
          fit: [contentWidth - 20, 180],
          align: "center",
        });
        console.log("✅ ECG image added to PDF successfully");
      } catch (err) {
        console.error("❌ Error adding ECG image to PDF:", err.message);
        console.error("Stack:", err.stack);
        doc.fontSize(10).fillColor("#ef4444").font("Helvetica").text("ECG image could not be loaded: " + err.message, margin, ecgY + 25);
      }
    } else {
      console.warn("⚠️ No imageBase64 in report");
      doc.fontSize(10).fillColor("#64748b").font("Helvetica").text("No ECG image available", margin, ecgY + 25);
    }

    // ============ NEW PAGE FOR DETAILED RESULTS ============
    doc.addPage();

    // Header on new page
    doc
      .fontSize(20)
      .fillColor("#dc2626")
      .font("Helvetica-Bold")
      .text("Detailed Analysis Results", margin, 50);

    doc
      .moveTo(margin, 80)
      .lineTo(pageWidth - margin, 80)
      .strokeColor("#cbd5e1")
      .lineWidth(2)
      .stroke();

    // ============ CLASS PROBABILITIES ============
    let currentY = 100;
    
    doc
      .fontSize(14)
      .fillColor("#1e293b")
      .font("Helvetica-Bold")
      .text("Condition Probability Distribution", margin, currentY);

    currentY += 30;

    if (report.probabilities) {
      // Sort by probability descending
      const sortedProbs = Object.entries(report.probabilities).sort((a, b) => b[1] - a[1]);
      
      sortedProbs.forEach(([label, value], index) => {
        // Alternate row colors
        const rowBg = index % 2 === 0 ? "#f8fafc" : "#ffffff";
        doc.rect(margin, currentY, contentWidth, 35).fillAndStroke(rowBg, "#e2e8f0");

        // Condition name
        doc.fontSize(11).fillColor("#334155").font("Helvetica-Bold");
        doc.text(label, margin + 15, currentY + 8);

        // Description
        const descriptions = {
          "CD": "Conduction Disorder",
          "HYP": "Hypertrophy",
          "MI": "Myocardial Infarction",
          "NORM": "Normal ECG",
          "STTC": "ST-T Change"
        };
        doc.fontSize(8).fillColor("#64748b").font("Helvetica");
        doc.text(descriptions[label] || "", margin + 15, currentY + 22);

        // Progress bar background
        const barX = margin + 200;
        const barWidth = 250;
        doc.rect(barX, currentY + 12, barWidth, 12).fillAndStroke("#e2e8f0", "#e2e8f0");

        // Progress bar fill
        const fillWidth = (value / 100) * barWidth;
        const barColor = value > 50 ? "#dc2626" : "#94a3b8";
        doc.rect(barX, currentY + 12, fillWidth, 12).fillAndStroke(barColor, barColor);

        // Percentage
        doc.fontSize(11).fillColor("#1e293b").font("Helvetica-Bold");
        doc.text(`${value.toFixed(2)}%`, barX + barWidth + 15, currentY + 10);

        currentY += 35;
      });
    }

    // ============ CLINICAL NOTES ============
    currentY += 20;
    
    if (report.symptoms || report.medicalHistory) {
      doc
        .fontSize(14)
        .fillColor("#1e293b")
        .font("Helvetica-Bold")
        .text("Clinical Information", margin, currentY);

      currentY += 25;

      if (report.symptoms) {
        doc
          .roundedRect(margin, currentY, contentWidth, 60, 5)
          .fillAndStroke("#fef3c7", "#fde047");

        doc.fontSize(10).fillColor("#92400e").font("Helvetica-Bold");
        doc.text("Reported Symptoms:", margin + 15, currentY + 12);

        doc.fontSize(9).fillColor("#451a03").font("Helvetica");
        doc.text(report.symptoms, margin + 15, currentY + 28, { width: contentWidth - 30 });

        currentY += 75;
      }

      if (report.medicalHistory) {
        doc
          .roundedRect(margin, currentY, contentWidth, 60, 5)
          .fillAndStroke("#dbeafe", "#93c5fd");

        doc.fontSize(10).fillColor("#1e3a8a").font("Helvetica-Bold");
        doc.text("Medical History:", margin + 15, currentY + 12);

        doc.fontSize(9).fillColor("#1e40af").font("Helvetica");
        doc.text(report.medicalHistory, margin + 15, currentY + 28, { width: contentWidth - 30 });

        currentY += 75;
      }
    }

    // ============ FOOTER WITH DISCLAIMER ============
    const footerY = pageHeight - 70;
    
    doc
      .rect(0, footerY, pageWidth, 70)
      .fillAndStroke("#f1f5f9", "#f1f5f9");

    doc
      .fontSize(8)
      .fillColor("#64748b")
      .font("Helvetica-Oblique")
      .text(
        "DISCLAIMER: This report is generated by AI-based analysis and should be used as a supplementary tool only. " +
        "It does not replace professional medical diagnosis. Please consult a qualified healthcare provider for proper evaluation and treatment.",
        margin,
        footerY + 15,
        { align: "center", width: contentWidth }
      );

    doc
      .fontSize(9)
      .fillColor("#475569")
      .font("Helvetica-Bold")
      .text(
        `GNN-HF Report | Generated on ${new Date().toLocaleString()} | Report ID: ${reportId.slice(-8)}`,
        margin,
        footerY + 45,
        { align: "center", width: contentWidth }
      );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("❌ PDF GENERATION ERROR:", error);
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);
    
    // Only send JSON error if headers haven't been sent yet
    if (!res.headersSent) {
      return res.status(500).json({
        status: "error",
        message: "Error generating PDF report",
        error: error.message
      });
    }
  }
});

/* =========================================================================
   ⭐ DELETE REPORT BY ID
   ========================================================================= */
router.delete("/delete-report/:id", authMiddleware, validateObjectId('id'), async (req, res) => {
  try {
    const reportId = req.params.id;
    const email = req.user.email; // Get from authenticated user

    // Find the report
    const report = await PatientReport.findById(reportId);

    if (!report) {
      return res.status(404).json({
        status: "error",
        message: "Report not found",
      });
    }

    // Verify the report belongs to the user
    if (report.userEmail !== email) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized to delete this report",
      });
    }

    // Delete the associated image file if it exists
    if (report.imagePath) {
      try {
        const fullPath = path.join(process.cwd(), report.imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`✅ Deleted image file: ${fullPath}`);
        }
      } catch (err) {
        console.error("⚠️ Error deleting image file:", err);
        // Continue with report deletion even if file deletion fails
      }
    }

    // Delete the report from database
    await PatientReport.findByIdAndDelete(reportId);

    return res.json({
      status: "success",
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("❌ DELETE REPORT ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Error deleting report",
    });
  }
});

function validateReportShape(report) {
  if (!report || typeof report !== "object") return "Report payload is empty";
  if (!report._id) return "Missing report id";
  if (!report.timestamp) return "Missing timestamp";
  return null;
}

export default router;
