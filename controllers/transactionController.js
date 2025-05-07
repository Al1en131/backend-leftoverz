const Transaction = require("../models/transactionModel");
const { User, Product } = require("../models");

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "seller",
          attributes: ["id", "name", "email"],
        },
        {
          model: Product,
          as: "item",
          attributes: ["id", "name", "price", "image"],
        },
      ],
    });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        message: "No transactions found",
      });
    }

    const transactionsData = transactions.map((transaction) =>
      transaction.toJSON()
    );

    return res.status(200).json({
      message: "Transactions retrieved successfully",
      transactions: transactionsData,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    return res.status(500).json({
      message: "An error occurred while retrieving transactions",
      error: error.message,
    });
  }
};
const countTransactions = async (req, res) => {
  try {
    const totalTransactions = await Transaction.count();

    res.status(200).json({
      message: "Total product count retrieved successfully",
      count: totalTransactions,
    });
  } catch (error) {
    console.error("Error counting Transactions:", error);
    res.status(500).json({
      message: "Error counting Transactions",
      error: error.message,
    });
  }
};
const getTransactionsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Transaksi sebagai buyer
    const buyerTransactions = await Transaction.findAll({
      where: { buyer_id: userId },
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "seller",
          attributes: ["id", "name", "email"],
        },
        {
          model: Product,
          as: "item",
          attributes: ["id", "name", "price", "image"],
        },
      ],
    });

    // Transaksi sebagai seller
    const sellerTransactions = await Transaction.findAll({
      where: { seller_id: userId },
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "seller",
          attributes: ["id", "name", "email"],
        },
        {
          model: Product,
          as: "item",
          attributes: ["id", "name", "price", "image"],
        },
      ],
    });

    const allTransactions = [...buyerTransactions, ...sellerTransactions].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (allTransactions.length === 0) {
      return res.status(404).json({
        message: "No transactions found for this user",
      });
    }

    const transactionsData = allTransactions.map((transaction) =>
      transaction.toJSON()
    );

    return res.status(200).json({
      message: "User transactions retrieved successfully",
      transactions: transactionsData,
    });
  } catch (error) {
    console.error("Error fetching user transactions:", error.message);
    return res.status(500).json({
      message: "An error occurred while retrieving user transactions",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTransactions,
  countTransactions,
  getTransactionsByUserId,
};
