const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 

const routes = express.Router();
const { getAllProducts } = require("../controllers/productController");

routes.get("/products", authMiddleware, getAllProducts);

module.exports = routes;