require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Route imports
const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contacts");
const transactionRoutes = require("./routes/transactions");
const workerRoutes = require("./routes/workers");
const inventoryRoutes = require("./routes/inventory");
const notificationRoutes = require("./routes/notifications");
const sseRoutes = require("./routes/sse");
const cronRoutes = require("./routes/cron");

const app = express();
const PORT = process.env.SERVER_PORT || 4000;

// ─── Security & Parsing Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), service: "hisab-kitab-api" });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/contacts",      contactRoutes);
app.use("/api/transactions",  transactionRoutes);
app.use("/api/workers",       workerRoutes);
app.use("/api/inventory",     inventoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/sse",           sseRoutes);
app.use("/api/cron",          cronRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[Server Error]", err);

  if (err.name === "ZodError") {
    return res.status(400).json({ error: err.errors[0]?.message || "Validation error" });
  }
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Hisab Kitab API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

module.exports = app;
