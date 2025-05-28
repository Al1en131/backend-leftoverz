const express = require("express");
const multer = require("multer");
const { embedLocalController, embedFormLocalController } = require("../controllers/clipController");

const routes = express.Router();
const upload = multer({ dest: "uploads/" });

routes.post("/embed-local", upload.single("file"), embedLocalController);
routes.post("/embed-local/create", upload.single("image"), embedFormLocalController);


module.exports = routes;
