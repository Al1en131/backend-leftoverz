const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 

const routes = express.Router();
const { getAllChats } = require("../controllers/chatController");

routes.get("/chats", authMiddleware, getAllChats);

module.exports = routes;