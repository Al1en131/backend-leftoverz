const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Chat = sequelize.define("Chat", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read_status: {
      type: DataTypes.ENUM("0", "1"),
      defaultValue: "0",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "chats",
    timestamps: false, // karena kamu pakai manual created_at
  });
module.exports = Chat;
  