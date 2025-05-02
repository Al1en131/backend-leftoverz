const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 
const upload = require("../middlewares/upload"); 

const routes = express.Router();
const { getAllProducts, createProduct, uploadMiddleware, editProduct, getProductById, deleteProduct } = require("../controllers/productController");

routes.get("/products", authMiddleware, getAllProducts);
routes.get("/allproducts", getAllProducts);
routes.post("/product/create", authMiddleware, uploadMiddleware, createProduct);
routes.put("/product/edit/:id", uploadMiddleware, authMiddleware, editProduct);
routes.get('/product/:id', getProductById);
routes.delete('/products/:id', deleteProduct, authMiddleware);

module.exports = routes;
