require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const routes = require("./routes");
const path = require("path");

const app = express();

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Body parser middleware
app.use(express.json());

// ✅ Middleware manual untuk mengatur CORS secara eksplisit (WAJIB di Vercel)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://leftoverz-app.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Tangani preflight request (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Optional: tetap bisa pakai cors() untuk local dev
app.use(
  cors({
    origin: "https://leftoverz-app.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Gunakan routes kamu
app.use(routes);

// Test koneksi ke database
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = app;
