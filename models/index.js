const User = require("./userModel");
const Product = require("./productModel");
const Transaction = require("./transactionModel");
const Chat = require("./chatModel");
const Favorite = require("./favoriteModel");

const db = {
  User,
  Product,
  Transaction,
  Chat,
  Favorite,
};

// Relasi manual (bisa juga didefinisikan via .associate di masing-masing model)
User.hasMany(Product, { foreignKey: "user_id" });
Product.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Transaction, { foreignKey: "buyer_id", as: "purchases" });
User.hasMany(Transaction, { foreignKey: "seller_id", as: "sales" });
Transaction.belongsTo(User, { foreignKey: "buyer_id", as: "buyer" });
Transaction.belongsTo(User, { foreignKey: "seller_id", as: "seller" });

Product.hasMany(Transaction, { foreignKey: "item_id", as: "transactions" });
Transaction.belongsTo(Product, { foreignKey: "item_id", as: "item" });

// Relasi Chat
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
    as: "product", // Pastikan alias 'product' sesuai
  });
};

Product.hasOne(Favorite, { foreignKey: "item_id" });
User.hasMany(Favorite, { foreignKey: "user_id" });
Product.belongsTo(User, { as: 'owner', foreignKey: 'user_id' });


// Atau kalau masing-masing model punya Chat.associate:
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
