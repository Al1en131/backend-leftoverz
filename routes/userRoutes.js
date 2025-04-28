const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 

const routes = express.Router();
const { register, login } = require("../controllers/authController");
const { getAllUsers } = require("../controllers/userController");

routes.post("/login", login);
routes.post("/register", register);
routes.get("/users", authMiddleware, getAllUsers);

module.exports = routes;