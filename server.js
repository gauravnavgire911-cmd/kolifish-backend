const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// --------------------------------------------------
// Constants
// --------------------------------------------------
const DEPLOY_VERSION = "api-route-check-2026-03-07-02";
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// Local imports
// --------------------------------------------------
const connectDB = require("./config/db");
const productsRoutes = require("./routes/products");
const uploadRoutes = require("./routes/upload.js");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// --------------------------------------------------
// App init
// --------------------------------------------------
const app = express();

// --------------------------------------------------
// Body parsers
// --------------------------------------------------
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// --------------------------------------------------
// CORS config
// --------------------------------------------------
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

function isNetlify(origin) {
  try {
    const url = new URL(origin);
    return url.hostname.endsWith(".netlify.app");
  } catch {
    return false;
  }
}

function isVercel(origin) {
  try {
    const url = new URL(origin);
    return url.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin, cb) {
    // Allow requests without Origin header
    // (Postman, curl, server-to-server)
    if (!origin) return cb(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      isNetlify(origin) ||
      isVercel(origin);

    if (isAllowed) return cb(null, true);

    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// --------------------------------------------------
// Basic routes
// --------------------------------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "KoliFish backend is running",
    version: DEPLOY_VERSION,
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "kolifish-backend",
    version: DEPLOY_VERSION,
    time: new Date().toISOString(),
    cors_origins: allowedOrigins,
  });
});

// --------------------------------------------------
// API routes
// --------------------------------------------------
app.use("/api/products", productsRoutes);
app.use("/api/upload", uploadRoutes);

// --------------------------------------------------
// CORS error handler
// --------------------------------------------------
app.use((err, req, res, next) => {
  if (err?.message?.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }
  return next(err);
});

// --------------------------------------------------
// App error handlers
// --------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// --------------------------------------------------
// Graceful shutdown
// --------------------------------------------------
async function gracefulShutdown(signal, server) {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);

  try {
    const mongoose = require("mongoose");

    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed");
    }

    console.log("✅ Server shut down cleanly");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err.message);
    process.exit(1);
  }
}

// --------------------------------------------------
// Start server
// --------------------------------------------------
async function startServer() {
  try {
    // Works whether connectDB takes MONGO_URI arg
    // or reads process.env internally
    await connectDB(process.env.MONGO_URI);

    const server = app.listen(PORT, () => {
      console.log("======================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`✅ Deploy version: ${DEPLOY_VERSION}`);
      console.log("✅ MongoDB connected");
      console.log("✅ Products route mounted at: /api/products");
      console.log("✅ Upload route mounted at: /api/upload");
      console.log("✅ Netlify preview domains allowed");
      console.log("✅ Vercel preview domains allowed");
      console.log("✅ Allowed CORS origins:", allowedOrigins);
      console.log("======================================");
    });

    process.on("SIGINT", () => gracefulShutdown("SIGINT", server));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM", server));
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();