const express = require("express");
const app = express.Router();

const users = require("./userRoutes");
const products = require("./productRoutes");
const Transaction = require("./transactionRoutes");
const chat = require("./chatRoutes");
const dashboard = require("./dashboardRoutes");
const favorite = require("./favoriteRoutes");
const clips = require("./clipRoutes");
const apiUrl = "/api/v1";

app.use(apiUrl, users);
app.use(apiUrl, products);
app.use(apiUrl, Transaction);
app.use(apiUrl, chat);
app.use(apiUrl, dashboard);
app.use(apiUrl, favorite);
app.use(apiUrl, clips);

module.exports = app;