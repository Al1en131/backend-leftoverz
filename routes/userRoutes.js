const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 

const routes = express.Router();
const { register, login } = require("../controllers/authController");
const { getAllUsers, getUserById } = require("../controllers/userController");
const { route } = require(".");

routes.post("/login", login);
routes.post("/register", register);
routes.get("/users", authMiddleware, getAllUsers);
routes.get("/user/:id", getUserById)

module.exports = routes;