const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const DEPLOY_VERSION = "cors-fix-2026-03-05-01";
const connectDB = require("./config/db");
const productsRoutes = require("./routes/products");
const uploadRoutes = require("./routes/upload.js");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// ----- Body parsers -----
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ----- CORS -----
// IMPORTANT: We MERGE env origins with defaults (do NOT override defaults)
const defaultAllowed = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://kolifish.com",
  "https://www.kolifish.com",
];

const envAllowed = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Merge + dedupe
const allowedOrigins = Array.from(new Set([...defaultAllowed, ...envAllowed]));

// Allow any *.netlify.app preview deploys too
const isNetlify = (origin) => {
  try {
    const u = new URL(origin);
    return u.hostname.endsWith(".netlify.app");
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, cb) => {
    // allow requests with no origin (curl/postman/server-to-server)
    if (!origin) return cb(null, true);

    // allow known origins + netlify previews
    if (allowedOrigins.includes(origin) || isNetlify(origin)) {
      return cb(null, true);
    }

    // IMPORTANT: throw an error so you can SEE which origin is blocked,
    // and avoid the "no CORS header" confusion.
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// Apply CORS BEFORE routes
app.use(cors(corsOptions));

// Preflight handling for all routes
app.options("*", cors(corsOptions));

// ----- Routes -----
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "kolifish-backend",
    time: new Date().toISOString(),
    version: DEPLOY_VERSION,
    cors_origins: allowedOrigins,
  });
});
app.use("/api/products", productsRoutes);
app.use("/api/upload", uploadRoutes);

// ----- Errors -----
// Handle CORS error nicely (so frontend gets a clear message)
app.use((err, req, res, next) => {
  if (err && err.message && err.message.startsWith("CORS blocked")) {
    return res.status(403).json({ success: false, message: err.message });
  }
  return next(err);
});

app.use(notFound);
app.use(errorHandler);

// ----- Start -----
const PORT = process.env.PORT || 5000;

(async function start() {
  try {
    await connectDB(process.env.MONGO_URI);

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("✅ Allowed CORS origins:", allowedOrigins);
      console.log("✅ Netlify *.netlify.app allowed:", true);
    });

    const shutdown = async (signal) => {
      console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
      try {
        const mongoose = require("mongoose");
        await mongoose.connection.close();
        server.close(() => process.exit(0));
      } catch (e) {
        console.log("❌ Error during shutdown:", e.message);
        process.exit(1);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.log("❌ Failed to start server:", err.message);
    process.exit(1);
  }
})();