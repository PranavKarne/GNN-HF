import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { authMiddleware } from "./middleware/auth.js";
import PQueue from "p-queue";
import logger from "./utils/logger.js";

const router = express.Router();

// ML Prediction Queue - limit concurrent Python spawns
const mlQueue = new PQueue({ concurrency: 2 }); // max 2 concurrent predictions

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================
// 📁 Ensure Upload Folder Exists (backend/uploads)
// =============================================================
const uploadFolder = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
  logger.info("Upload folder created", { path: uploadFolder });
} else {
  logger.info("Upload folder exists", { path: uploadFolder });
}

// Initial cleanup on startup
cleanOldUploads();

// =============================================================
// 📸 Multer Storage Config
// =============================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const uniquePrefix = crypto.randomBytes(12).toString("hex");
    const cleanExt = path.extname(file.originalname).toLowerCase() || "";
    cb(null, `${Date.now()}-${uniquePrefix}${cleanExt}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, JPG, PNG, GIF) are allowed"));
    }
  },
});

const MAX_FILE_AGE_MS = 24 * 60 * 60 * 1000; // one day

function cleanOldUploads() {
  fs.readdir(uploadFolder, (err, files) => {
    if (err) {
      logger.error("Upload cleanup read error", { error: err.message });
      return;
    }

    const cutoff = Date.now() - MAX_FILE_AGE_MS;
    files.forEach((file) => {
      const filePath = path.join(uploadFolder, file);
      fs.stat(filePath, (statErr, stats) => {
        if (statErr) return;
        if (stats.mtimeMs < cutoff) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) logger.error("Upload cleanup delete error", { error: unlinkErr.message, file });
          });
        }
      });
    });
  });
}

// Periodic cleanup to avoid disk bloat
setInterval(cleanOldUploads, 12 * 60 * 60 * 1000).unref();

// =============================================================
// 🐍 Python Execution Helper
// =============================================================
function runPython(script, args = []) {
  return new Promise((resolve, reject) => {
    logger.debug("Running Python script", { script, args });

    // Detect Python executable: Windows uses 'python', Unix uses 'python3'
    // Can override with PYTHON_PATH env variable
    let pythonPath = process.env.PYTHON_PATH;
    if (!pythonPath) {
      pythonPath = process.platform === "win32" ? "python" : "python3";
    }
    
    const py = spawn(pythonPath, [script, ...args], {
      cwd: process.cwd(),
      shell: false,
    });

    let output = "";
    let errors = "";

    py.stdout.on("data", (data) => (output += data.toString()));
    py.stderr.on("data", (data) => {
      const errMsg = data.toString();
      errors += errMsg;
      logger.debug("Python Stderr", { message: errMsg });
    });

    py.on("error", (err) => {
      logger.error("Python spawn error", { error: err.message });
      reject(`Failed to spawn Python: ${err.message}`);
    });

    py.on("close", (code) => {
      if (code !== 0) reject(`Python exited with code ${code}\n${errors}`);
      else resolve(output.trim());
    });
  });
}

// =============================================================
// 🚀 FINAL PREDICT ROUTE (Does NOT save to DB)
// Returns:
// - result from Python (JSON)
// - imagePath (public URL)
// - imageBase64 (for MongoDB storage)
// =============================================================
router.post("/", authMiddleware, upload.single("ecgImage"), async (req, res) => {
  const log = req.log || logger;
  
  try {
    if (!req.file)
      return res.status(400).json({
        status: "error",
        message: "No ECG image uploaded",
      });

    // FULL OS FILE PATH (Python needs this)
    const imgOSPath = req.file.path;

    // PUBLIC FRONTEND URL PATH
    const imgPublicPath = "/uploads/" + req.file.filename;

    log.info("Image uploaded for prediction", { imagePath: imgPublicPath });

    // Convert image → Base64 for MongoDB
    const imageBase64 =
      "data:image/png;base64," +
      fs.readFileSync(imgOSPath, { encoding: "base64" });

    // Path to Python script - USE REAL MODEL
    const scriptPath = path.join(process.cwd(), "ml", "predict_real.py");

    // Execute Python with concurrency control
    const rawOutput = await mlQueue.add(async () => {
      log.info("Running ML prediction", { queueSize: mlQueue.size, pending: mlQueue.pending });
      return await runPython(scriptPath, [imgOSPath]);
    });

    log.debug("Python output received", { output: rawOutput.substring(0, 200) });

    let jsonData;
    try {
      jsonData = JSON.parse(rawOutput);
    } catch (err) {
      log.error("Invalid JSON from Python", { output: rawOutput });
      return res.status(500).json({
        status: "error",
        message: "Invalid JSON returned by Python",
        pythonOutput: rawOutput,
      });
    }

    const validationError = validatePredictionResult(jsonData);
    if (validationError) {
      log.error("Prediction validation failed", { error: validationError });
      return res.status(500).json({
        status: "error",
        message: "Invalid prediction payload",
        details: validationError,
      });
    }

    // Attach image paths
    jsonData.imagePath = imgPublicPath;   // for UI
    jsonData.imageBase64 = imageBase64;   // for MongoDB

    log.info("Prediction successful", { predictedClass: jsonData.predictedClass, confidence: jsonData.confidence });

    return res.json({
      status: "success",
      result: jsonData,
    });

  } catch (err) {
    log.error("Predict route error", { error: err.message, stack: err.stack });
    return res.status(500).json({
      status: "error",
      message: "Prediction failed",
      details: err.toString(),
    });
  }
});

export default router;

// Basic shape validation for Python prediction output
function validatePredictionResult(data) {
  if (!data || typeof data !== 'object') return 'Result is not an object';

  const { predicted_class, predictedClass, risk_level, riskLevel, risk_score, riskScore, confidence, probabilities } = data;

  const cls = predictedClass || predicted_class;
  const lvl = riskLevel || risk_level;
  const score = riskScore ?? risk_score;

  if (!cls || typeof cls !== 'string') return 'predictedClass missing or invalid';
  if (!lvl || typeof lvl !== 'string') return 'riskLevel missing or invalid';
  if (score === undefined || isNaN(Number(score))) return 'riskScore missing or invalid';
  if (confidence === undefined || isNaN(Number(confidence))) return 'confidence missing or invalid';

  if (probabilities && typeof probabilities !== 'object') return 'probabilities must be an object when provided';

  return null;
}
