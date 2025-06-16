const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("penjual", "pembeli", "admin"),
      defaultValue: "pembeli",
    },
    payment_type: {
      type: DataTypes.ENUM(
        "gopay",
        "shopee pay",
        "bank bri",
        "bank muamalat",
        "bank mandiri",
        "dana"
      ),
      defaultValue: "gopay",
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment_account_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    account_holder_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postal_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    regency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subdistrict: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ward: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

module.exports = User;
