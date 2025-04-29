const express = require("express");
const app = express();

const users = require("./userRoutes");
const products = require("./productRoutes");
const Transaction = require("./transactionRoutes");
const chat = require("./chatRoutes");

const apiUrl = "/api/v1";

app.use(apiUrl, users);
app.use(apiUrl, products);
app.use(apiUrl, Transaction);
app.use(apiUrl, chat);

module.exports = app;