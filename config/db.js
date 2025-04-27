const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("marketplace_kost", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
