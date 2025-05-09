const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 

const routes = express.Router();
const { getAllChats, getChatsByUserId, getMessagesBetweenUsers, readMessage, sendMessage, getMessagesByProductId, sendMessageByProductId } = require("../controllers/chatController");

routes.get("/chats", authMiddleware, getAllChats);
routes.get('/chats/user/:userId', getChatsByUserId);
routes.get("/messages/:user1/:user2", getMessagesBetweenUsers);
routes.put("/chats/:id/read", readMessage);
routes.post('/send/messages/:user1Id/:user2Id',authMiddleware, sendMessage);
routes.get('/chats/product/:productId/:user1/:user2', getMessagesByProductId);
routes.post("/send/:productId/:user1Id/:user2Id", sendMessageByProductId, authMiddleware);


module.exports = routes;