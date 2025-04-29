const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 

const routes = express.Router();
const { getAllTransactions } = require("../controllers/transactionController");

routes.get("/transactions", authMiddleware, getAllTransactions);

module.exports = routes;