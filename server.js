const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const productsRoutes = require("./routes/products");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// ----- Middlewares -----
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS (set CORS_ORIGINS in Render Env Vars)
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, cb) {
      // allow Postman/curl (no origin)
      if (!origin) return cb(null, true);

      // if no CORS_ORIGINS set, allow all (ok for testing)
      if (!allowedOrigins.length) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

// ----- Routes -----

// ✅ Root route (so base URL works)
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "kolifish-backend",
    time: new Date().toISOString(),
  });
});

app.use("/api/products", productsRoutes);

// ----- Error handling -----
app.use(notFound);
app.use(errorHandler);

// ----- Start -----
const PORT = process.env.PORT || 5000;

(async function start() {
  try {
    await connectDB(process.env.MONGO_URI);

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
      try {
        const mongoose = require("mongoose");
        await mongoose.connection.close();

        server.close(() => {
          console.log("✅ Server closed. Bye!");
          process.exit(0);
        });
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