require("dotenv").config();
const express = require("express");
const path = require("path");
const sequelize = require("./config/db");
const routes = require("./routes");

const app = express();

// Serve static files from /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// JSON parser
app.use(express.json());

// ✅ Manual CORS setup — WAJIB untuk Vercel
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://leftoverz-app.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // tangani preflight
  }

  next();
});

// Gunakan routing
app.use(routes);

// Test koneksi ke database
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = app;
