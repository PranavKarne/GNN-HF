import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// =====================================================
// ⭐ UPDATE PASSWORD ROUTE
// =====================================================
router.post("/update-password", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Validate current password using bcrypt
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // 3. Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password
    user.password = hashedNewPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully!",
    });

  } catch (err) {
    console.error("Update Password Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating password",
    });
  }
});

export default router;
