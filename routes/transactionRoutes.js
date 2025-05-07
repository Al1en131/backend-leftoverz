const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 

const routes = express.Router();
const { getAllTransactions, getTransactionsByUserId } = require("../controllers/transactionController");

routes.get('/transactions/user/:userId', getTransactionsByUserId);
routes.get("/transactions", authMiddleware, getAllTransactions);

module.exports = routes;