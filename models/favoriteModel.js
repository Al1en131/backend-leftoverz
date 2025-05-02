const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Pastikan Anda menyesuaikan path untuk koneksi database

const Favorite = sequelize.define(
  "Favorite",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true, // Menyimpan kolom createdAt dan updatedAt
    tableName: "favorites", // Nama tabel di database
  }
);

module.exports = Favorite;
