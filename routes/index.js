const express = require("express");
const app = express();

const users = require("./userRoutes");
const products = require("./productRoutes");
const Transaction = require("./transactionRoutes");
const chat = require("./chatRoutes");
const dashboard = require("./dashboardRoutes");
const favorite = require("./favoriteRoutes")
const apiUrl = "/api/v1";

app.use(apiUrl, users);
app.use(apiUrl, products);
app.use(apiUrl, Transaction);
app.use(apiUrl, chat);
app.use(apiUrl, dashboard);
app.use(apiUrl, favorite);

module.exports = app;