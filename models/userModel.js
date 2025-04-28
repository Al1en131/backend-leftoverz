const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require("./productModel");

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('penjual', 'pembeli'),
    defaultValue: 'pembeli'
  },
  no_hp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: false
});
User.hasMany(Product, { foreignKey: 'user_id' }); 
Product.belongsTo(User, { foreignKey: 'user_id' }); 
module.exports = User;
