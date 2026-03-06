const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const DEPLOY_VERSION = "api-route-check-2026-03-07-01";
const connectDB = require("./config/db");
const productsRoutes = require("./routes/products");
const uploadRoutes = require("./routes/upload.js");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// ----- Body parsers -----
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ----- CORS -----
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

const allowedOrigins = Array.from(new Set([...defaultAllowed, ...envAllowed]));

const isNetlify = (origin) => {
  try {
    const u = new URL(origin);
    return u.hostname.endsWith(".netlify.app");
  } catch {
    return false;
  }
};

const isVercel = (origin) => {
  try {
    const u = new URL(origin);
    return u.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    if (
      allowedOrigins.includes(origin) ||
      isNetlify(origin) ||
      isVercel(origin)
    ) {
      return cb(null, true);
    }

    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ----- Basic routes -----
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "KoliFish backend is running",
    version: DEPLOY_VERSION,
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "kolifish-backend",
    time: new Date().toISOString(),
    version: DEPLOY_VERSION,
    cors_origins: allowedOrigins,
  });
});

// ----- API routes -----
app.use("/api/products", productsRoutes);
app.use("/api/upload", uploadRoutes);

// ----- Errors -----
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
      console.log(`✅ Deploy version: ${DEPLOY_VERSION}`);
      console.log("✅ Allowed CORS origins:", allowedOrigins);
      console.log("✅ Netlify previews allowed:", true);
      console.log("✅ Vercel previews allowed:", true);
      console.log("✅ Products route mounted at: /api/products");
      console.log("✅ Upload route mounted at: /api/upload");
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