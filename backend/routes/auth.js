import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "Email not found" });
  }

  // Check password (plain — since you did not add bcrypt)
  if (user.password !== password) {
    return res.status(400).json({ success: false, message: "Incorrect password" });
  }

  return res.json({
    success: true,
    message: "Login successful",
    user: { email: user.email }
  });
});

export default router;
