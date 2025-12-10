import express from "express";
import User from "../models/User.js";

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

    // 2. Validate current password
    if (user.password !== currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // 3. Update password
    user.password = newPassword;
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
