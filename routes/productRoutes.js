const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const routes = express.Router();
const {
  getAllProducts,
  createProduct,
  uploadMiddleware,
  editProduct,
  getProductById,
  deleteProduct,
  getProductDetail,
  getProductsByUserId,
  addProductByUserId,
  editProductByUserId,
  getProductByUserIdAndProductId,
} = require("../controllers/productController");

routes.get("/products", authMiddleware, getAllProducts);
routes.get("/allproducts", getAllProducts);
routes.post("/product/create", authMiddleware, uploadMiddleware, createProduct);
routes.put("/product/edit/:id", authMiddleware, uploadMiddleware, editProduct);
routes.get("/product/:id", getProductById);
routes.delete("/products/:id", authMiddleware, deleteProduct);
routes.get("/product/detail/:id", getProductDetail);
routes.get("/products/user/:user_id", getProductsByUserId);
routes.post(
  "/products/add/user/:user_id",
  uploadMiddleware,
  authMiddleware,
  addProductByUserId
);
routes.put(
  "/products/edit/user/:user_id/:product_id",
  uploadMiddleware,
  authMiddleware,
  editProductByUserId
);
routes.get(
  "/products/get/:user_id/:product_id",
  getProductByUserIdAndProductId
);

module.exports = routes;
