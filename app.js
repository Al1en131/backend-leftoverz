require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const routes = require("./routes"); // Import routes

const app = express();
app.use(express.json());
app.use(cors());
app.use(routes);

const PORT = process.env.PORT || 1031;

// Koneksi database
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = app;
