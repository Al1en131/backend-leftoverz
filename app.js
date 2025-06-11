require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const routes = require("./routes");
const path = require("path");

const app = express();

app.use(cors({
  origin: "https://leftoverz-production.up.railway.app", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.options("*", cors());

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(routes); 

sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

const PORT = process.env.PORT || 1031;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
