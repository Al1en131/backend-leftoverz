const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 

const routes = express.Router();
const { getAllTransactions, getTransactionsByUserId, createMidtransToken } = require("../controllers/transactionController");

routes.get('/transactions/user/:userId', getTransactionsByUserId);
routes.get("/transactions", authMiddleware, getAllTransactions);
routes.post("/create-midtrans-token",  authMiddleware, createMidtransToken);

module.exports = routes;