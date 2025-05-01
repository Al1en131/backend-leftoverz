const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 

const routes = express.Router();
const { countPenjual, countPembeli } = require("../controllers/dashboardController");
const { countProducts } = require("../controllers/productController");
const { countTransactions } = require("../controllers/transactionController");

routes.get("/count/seller", authMiddleware, countPenjual);
routes.get("/count/buyer", authMiddleware, countPembeli);
routes.get('/count/product', authMiddleware, countProducts);
routes.get('/count/transaction', authMiddleware, countTransactions);

module.exports = routes;