const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.MYSQL_PUBLIC_URL, {
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,  // ini bisa kamu sesuaikan, terkadang harus false di beberapa provider
    },
  },
  logging: false, // optional, matikan log SQL agar log lebih bersih
});

module.exports = sequelize;
