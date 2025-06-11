const User = require("./userModel");
const Product = require("./productModel");
const Transaction = require("./transactionModel");
const Chat = require("./chatModel");
const Favorite = require("./favoriteModel");
const Refund = require("./refundModel")

const db = {
  User,
  Product,
  Transaction,
  Chat,
  Favorite,
};

User.hasMany(Product, { foreignKey: "user_id" });
User.hasMany(Transaction, { foreignKey: "buyer_id", as: "purchases" });
User.hasMany(Transaction, { foreignKey: "seller_id", as: "sales" });
User.hasMany(Favorite, { foreignKey: "user_id" });
Product.hasOne(Favorite, { foreignKey: "item_id" });
Product.belongsTo(User, { as: 'owner', foreignKey: 'user_id' });
Product.belongsTo(User, { foreignKey: "user_id" });
Product.hasOne(Transaction, { foreignKey: "item_id", as: "transactions" });
Transaction.belongsTo(Product, { foreignKey: "item_id", as: "item" });
Transaction.belongsTo(User, { foreignKey: "buyer_id", as: "buyer" });
Transaction.belongsTo(User, { foreignKey: "seller_id", as: "seller" });
Refund.belongsTo(Transaction, { foreignKey: "transaction_id" });
Chat.belongsTo(User, { as: "sender", foreignKey: "sender_id" });
Chat.belongsTo(User, { as: "receiver", foreignKey: "receiver_id" });
Chat.belongsTo(Product, { foreignKey: "item_id" });
Favorite.associate = (models) => {
  Favorite.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });

  Favorite.belongsTo(models.Product, {
    foreignKey: "item_id",
    as: "product", 
  });
};

Refund.associate = (models) => {
  Refund.belongsTo(models.Transaction, {
    foreignKey: "transaction_id",
    as: "transaction"
  });
};


Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
