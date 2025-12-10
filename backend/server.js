import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/auth.js";
import predictRoutes from "./predict.js";
import saveRoute from "./routes/save.js";
import reportRoute from "./routes/reports.js";
import updatePasswordRoute from "./routes/updatePassword.js";
import dashboardStatsRoute from "./routes/dashboardStats.js";

// Models
import User from "./models/User.js";
import users from "./data/users.js";

dotenv.config();
const app = express();

// Fix dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded ECG images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // Add default users only once
    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) await User.create(u);
    }
  })
  .catch((err) => console.error("❌ Mongo Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", predictRoutes);
app.use("/api", saveRoute);
app.use("/api", reportRoute);
app.use("/api", updatePasswordRoute);
app.use("/api", dashboardStatsRoute); // ⭐ NEW dashboard stats route

// Default route
app.get("/", (req, res) => {
  res.send("🔥 GNN-HF Backend API Running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
