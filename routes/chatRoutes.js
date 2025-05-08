const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 

const routes = express.Router();
const { getAllChats, getChatsByUserId, getMessagesBetweenUsers, readMessage, sendMessage } = require("../controllers/chatController");

routes.get("/chats", authMiddleware, getAllChats);
routes.get('/chats/user/:userId', getChatsByUserId);
routes.get("/messages/:user1/:user2", getMessagesBetweenUsers);
routes.put("/chats/:id/read", readMessage);
routes.post('/send/messages/:user1Id/:user2Id',authMiddleware, sendMessage);


module.exports = routes;