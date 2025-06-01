require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const routes = require("./routes");
const path = require("path");

const app = express();

// CORS Setup - HARUS SEBELUM ROUTES
app.use(cors({
  origin: "https://leftoverz-app.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Preflight untuk semua OPTIONS request
app.options("*", cors());

// Untuk upload folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Body parser
app.use(express.json());

// Routes
app.use(routes);

// DB Connection
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = app;
