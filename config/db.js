const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("marketplace_leftoverz", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
