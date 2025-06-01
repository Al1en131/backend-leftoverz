const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    used_duration: {
      type: DataTypes.ENUM(
        "New",
        "1-3 months",
        "4-6 months",
        "7-12 months",
        "1-2 years",
        "3-4 years",
        "5+ years"
      ),
      allowNull: true,
      defaultValue: "New",
    },
    original_price: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    image: {
      type: DataTypes.JSON, 
    },
    embedding: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("available", "sold"),
      allowNull: true,
      defaultValue: "available",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "products",
    timestamps: false,
  }
);

module.exports = Product;
