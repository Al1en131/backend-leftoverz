const express = require("express");
const app = express();

const users = require("./userRoutes");

const apiUrl = "/api/v1";

app.use(apiUrl, users);

module.exports = app;