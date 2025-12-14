import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateUniquePatientId } from "../utils/generatePatientId.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// SIGNUP ROUTE
// ============================================
router.post("/signup", async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Passwords do not match" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "Email already registered. Please login." 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique patient ID
    const patientId = await generateUniquePatientId();

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      patientId,
      patientInfo: { isCompleted: false }
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { email: newUser.email, userId: newUser._id, patientId: newUser.patientId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: { email: newUser.email, patientId: newUser.patientId }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during signup" 
    });
  }
});

// ============================================
// LOGIN ROUTE
// ============================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Email not found" 
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: "Incorrect password" 
      });
    }

    // ⭐ AUTO-FIX: Generate patientId for existing users who don't have one
    if (!user.patientId) {
      const patientId = await generateUniquePatientId();
      user.patientId = patientId;
      await user.save();
      console.log(`✅ Auto-generated patientId for existing user: ${email}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, userId: user._id, patientId: user.patientId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: { 
        email: user.email, 
        patientId: user.patientId,
        patientInfoCompleted: user.patientInfo?.isCompleted 
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during login" 
    });
  }
});

// ============================================
// CHECK PATIENT ID UNIQUENESS
// ============================================
router.get("/check-patient-id", async (req, res) => {
  try {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ 
        available: false,
        message: "Patient ID is required" 
      });
    }

    // Check if patient ID already exists in User collection
    const existingUser = await User.findOne({ 
      'patientInfo.patientId': patientId 
    });

    if (existingUser) {
      return res.json({
        available: false,
        message: "Patient ID already in use"
      });
    }

    return res.json({
      available: true,
      message: "Patient ID is available"
    });
  } catch (error) {
    console.error("Check patient ID error:", error);
    return res.status(500).json({ 
      available: false,
      message: "Server error checking patient ID" 
    });
  }
});

// ============================================
// SAVE PATIENT INFORMATION ROUTE
// ============================================
router.post("/patient-info", async (req, res) => {
  try {
    const { 
      email, 
      patientName, 
      age, 
      gender, 
      patientId,
      contactNumber,
      patientEmail,
      symptoms,
      medicalHistory 
    } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    // Validate all required fields
    if (!patientName || !age || !gender || !patientId || 
        !contactNumber || !patientEmail || !symptoms || !medicalHistory) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Update patient info with all fields
    user.patientInfo = {
      patientName,
      age,
      gender,
      patientId,
      contactNumber,
      patientEmail,
      symptoms,
      medicalHistory,
      isCompleted: true
    };

    await user.save();

    return res.json({
      success: true,
      message: "Patient information saved successfully",
      user: { email: user.email, patientInfoCompleted: true }
    });
  } catch (error) {
    console.error("Patient info error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error saving patient information" 
    });
  }
});

// ============================================
// GET USER PROFILE
// ============================================
// Lightweight in-memory rate limiter for profile lookups
const profileRateLimit = (() => {
  const hits = new Map();
  const WINDOW_MS = 60_000; // 1 minute
  const MAX_REQUESTS = 30;
  return (req, res, next) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const entry = hits.get(ip) || { count: 0, start: now };
    if (now - entry.start > WINDOW_MS) {
      entry.count = 0;
      entry.start = now;
    }
    entry.count += 1;
    hits.set(ip, entry);
    if (entry.count > MAX_REQUESTS) {
      return res.status(429).json({ success: false, message: "Too many requests" });
    }
    next();
  };
})();

router.get("/profile", authMiddleware, profileRateLimit, async (req, res) => {
  try {
    // Get email from authenticated user
    const email = req.user.email;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.json({
      success: true,
      user: {
        email: user.email,
        patientId: user.patientId,
        patientInfo: user.patientInfo
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error fetching profile" 
    });
  }
});

// ============================================
// UPDATE USER PROFILE
// ============================================
router.put("/profile", async (req, res) => {
  try {
    const { email, patientName, age, gender, contactNumber, symptoms, medicalHistory } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Update patient info (preserve existing patientId and email)
    user.patientInfo = {
      patientName: patientName || user.patientInfo?.patientName,
      age: age || user.patientInfo?.age,
      gender: gender || user.patientInfo?.gender,
      patientId: user.patientInfo?.patientId, // Keep existing patient ID
      contactNumber: contactNumber !== undefined ? contactNumber : user.patientInfo?.contactNumber,
      patientEmail: user.patientInfo?.patientEmail, // Keep existing email
      symptoms: symptoms !== undefined ? symptoms : user.patientInfo?.symptoms,
      medicalHistory: medicalHistory !== undefined ? medicalHistory : user.patientInfo?.medicalHistory,
      isCompleted: true
    };

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        email: user.email,
        patientId: user.patientId,
        patientInfo: user.patientInfo
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error updating profile" 
    });
  }
});

export default router;
