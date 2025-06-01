const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const routes = require("./routes");
const path = require("path");

// INIT
const app = express();

// CORS
app.use(cors({
  origin: "https://leftoverz-app.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.options("*", cors());

// Static & JSON
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());

// Routes
app.use(routes);

// Sequelize Connect
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

// ✅ Export sebagai handler ke Vercel
module.exports = app;
