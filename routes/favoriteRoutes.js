const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { handleCreateFavorite, getFavoriteStatus, removeFavorite, getAllFavoritesByUserId } = require("../controllers/favoriteController");

const routes = express.Router();

routes.post("/favorite/create", authMiddleware, handleCreateFavorite);
routes.get("/get/:productId", authMiddleware, getFavoriteStatus);
routes.delete("/delete/:productId", authMiddleware, removeFavorite);
routes.get("/favorite/user/:user_id", getAllFavoritesByUserId, authMiddleware);
module.exports = routes;
