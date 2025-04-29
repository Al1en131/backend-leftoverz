const User = require('./userModel');
const Product = require('./productModel');
const Transaction = require('./transactionModel');

User.hasMany(Product, { foreignKey: 'user_id' });
Product.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Transaction, { foreignKey: 'buyer_id', as: 'purchases' });
User.hasMany(Transaction, { foreignKey: 'seller_id', as: 'sales' });

Transaction.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });
Transaction.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });

Product.hasMany(Transaction, { foreignKey: 'item_id', as: 'transactions' });
Transaction.belongsTo(Product, { foreignKey: 'item_id', as: 'item' });

module.exports = {
  User,
  Product,
  Transaction
};
