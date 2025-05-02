const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 

const routes = express.Router();
const { register, login, logout } = require("../controllers/authController");
const { getAllUsers, getUserById, addUser, updateUser, deleteUser } = require("../controllers/userController");
const { route } = require(".");

routes.post("/login", login);
routes.post("/register", register);
routes.get("/users", authMiddleware, getAllUsers);
routes.get("/user/:id", getUserById);
routes.post("/user/create", addUser, authMiddleware);
routes.put("/user/update/:id", updateUser, authMiddleware); 
routes.delete('/user/delete/:id', deleteUser);
routes.post("/logout", logout);
module.exports = routes;