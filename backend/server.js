import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import logger from "./utils/logger.js";
import { requestIdMiddleware } from "./middleware/requestId.js";

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

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================
// CORS CONFIG
// ======================
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  logger.warn("No FRONTEND_URL configured; defaulting to http://localhost:5173");
  allowedOrigins.push("http://localhost:5173");
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);

    logger.error(`CORS blocked origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// ======================
// MIDDLEWARE
// ======================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

app.use(requestIdMiddleware);
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static uploads (ephemeral on Render)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ======================
// RATE LIMITING
// ======================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: "error", message: "Too many auth requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

const predictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { status: "error", message: "Too many prediction requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ======================
// ROUTES
// ======================
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/predict", predictLimiter, predictRoutes);
app.use("/api", saveRoute);
app.use("/api", reportRoute);
app.use("/api", updatePasswordRoute);
app.use("/api", dashboardStatsRoute);

// Root route
app.get("/", (req, res) => {
  res.send("🔥 GNN-HF Backend API Running");
});

// Health check (Render)
app.get("/health", (req, res) => {
  res.status(200).json({
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    memory: process.memoryUsage(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  const log = req.log || logger;
  log.error("Global error handler", { error: err.message, stack: err.stack });

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Max 10MB."
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// ======================
// START SERVER **AFTER DB**
// ======================
const PORT = process.env.PORT || 10000;
let server;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    logger.info("MongoDB Connected");

    // Seed users once
    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) await User.create(u);
    }

    server = app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error("MongoDB connection failed", { error: err.message });
    process.exit(1);
  });

// ======================
// GRACEFUL SHUTDOWN
// ======================
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down`);

  if (server) {
    server.close(() => {
      mongoose.connection.close(false, () => {
        logger.info("MongoDB disconnected");
        process.exit(0);
      });
    });
  }

  setTimeout(() => {
    logger.error("Force shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", err => {
  logger.error("Uncaught Exception", err);
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", reason => {
  logger.error("Unhandled Rejection", reason);
  gracefulShutdown("unhandledRejection");
});
