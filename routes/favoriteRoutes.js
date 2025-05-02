const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); 
const { addFavorite } = require("../controllers/favoriteController");

const routes = express.Router();

routes.post("/favorite/create", authMiddleware, addFavorite);

module.exports = routes;
