const express = require("express");
const app = express();

const users = require("./userRoutes");
const products = require("./productRoutes");

const apiUrl = "/api/v1";

app.use(apiUrl, users);
app.use(apiUrl, products);

module.exports = app;