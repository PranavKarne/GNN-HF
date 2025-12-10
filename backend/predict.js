import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const router = express.Router();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================
// 📁 Ensure Upload Folder Exists (backend/uploads)
// =============================================================
const uploadFolder = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
  console.log("📁 Upload folder created:", uploadFolder);
} else {
  console.log("📁 Upload folder exists:", uploadFolder);
}

// =============================================================
// 📸 Multer Storage Config
// =============================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});

const upload = multer({ storage });

// =============================================================
// 🐍 Python Execution Helper
// =============================================================
function runPython(script, args = []) {
  return new Promise((resolve, reject) => {
    console.log("🐍 Running Python script:", script);

    const py = spawn("python", [script, ...args], {
      cwd: process.cwd(),
      shell: false,
    });

    let output = "";
    let errors = "";

    py.stdout.on("data", (data) => (output += data.toString()));
    py.stderr.on("data", (data) => {
      const errMsg = data.toString();
      errors += errMsg;
      console.log("🐍 Python Error:", errMsg);
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
router.post("/predict", upload.single("ecgImage"), async (req, res) => {
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

    console.log("📸 Image uploaded:", imgPublicPath);

    // Convert image → Base64 for MongoDB
    const imageBase64 =
      "data:image/png;base64," +
      fs.readFileSync(imgOSPath, { encoding: "base64" });

    // Path to Python script
    const scriptPath = path.join(process.cwd(), "ml", "predict.py");

    // Execute Python
    let rawOutput = await runPython(scriptPath, [imgOSPath]);

    console.log("🔍 Python Output:", rawOutput);

    let jsonData;
    try {
      jsonData = JSON.parse(rawOutput);
    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: "Invalid JSON returned by Python",
        pythonOutput: rawOutput,
      });
    }

    // Attach image paths
    jsonData.imagePath = imgPublicPath;   // for UI
    jsonData.imageBase64 = imageBase64;   // for MongoDB

    return res.json({
      status: "success",
      result: jsonData,
    });

  } catch (err) {
    console.error("❌ Predict Route Error:", err);
    return res.status(500).json({
      status: "error",
      message: "Prediction failed",
      details: err.toString(),
    });
  }
});

export default router;
