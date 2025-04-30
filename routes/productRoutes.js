const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 
const upload = require("../middlewares/upload"); 

const routes = express.Router();
const { getAllProducts, createProduct, uploadMiddleware, editProduct, getProductById } = require("../controllers/productController");

routes.get("/products", authMiddleware, getAllProducts);

routes.post("/product/create", authMiddleware, uploadMiddleware, createProduct);
routes.put("/product/edit/:id", uploadMiddleware, authMiddleware, editProduct);
routes.get('/product/:id', authMiddleware, getProductById);

module.exports = routes;
