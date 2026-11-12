import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";
import connectDB from "./src/config/db.js";
import authRouter from "./src/routes/authRouter.js";
import userRouter from "./src/routes/userRouter.js";
import messageRouter from "./src/routes/messageRouter.js";
import publicRouter from "./src/routes/publicRouter.js";
import chatRouter from "./src/routes/chatRouter.js";
import statusRouter from "./src/routes/statusRouter.js";
import http from "http";
import { initSocket } from "./src/socket/socket.js";

dotenv.config();
import "./src/cron/cleanup.js";
const port = process.env.PORT || 5000;
const app = express();

// Trust proxy for secure cookies behind Render's load balancer
app.set("trust proxy", 1);

// ── Rate Limiting ──────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use(generalLimiter);

// ── Performance Middleware ──────────────────────────────────────────────────
// Gzip/Brotli response compression for APIs & static assets
app.use(
  compression({
    level: 6,
    threshold: 1024, // Compress responses above 1 KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);

// ── Standard Middleware ─────────────────────────────────────────────────────
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/chats", chatRouter);
app.use("/api/status", statusRouter);
app.use("/api/public", publicRouter);

app.get("/", (req, res) => {
  res.json({ message: "VibeChat API is running", status: "ok" });
});

// ── Production Setup ───────────────────────────────────────────────────────
const __dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(path.join(__dirname, "../client/dist"), {
      maxAge: "1y", // Aggressive caching for hashed assets
      etag: true,
    })
  );
  // Catch-all route for frontend
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      return next(); // Let API 404s fall through
    }
    res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
  });
}

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error Handler ──────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ── Start ──────────────────────────────────────────────────────────────────
const server = http.createServer(app);
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

initSocket(server);

server.listen(port, () => {
  connectDB();
  console.log(`VibeChat server running on port ${port}`);
});
