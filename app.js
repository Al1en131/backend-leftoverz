require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const routes = require("./routes"); 
const path = require('path');

// Deklarasikan app dulu baru gunakan middleware
const app = express();

// Serve folder 'uploads' secara publik
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(cors());
app.use(routes);

const PORT = process.env.PORT || 1031;

sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = app;
