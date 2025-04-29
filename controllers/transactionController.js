const Transaction = require('../models/transactionModel');
const { User, Product } = require('../models');

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Product,
          as: 'item',
          attributes: ['id', 'name', 'price']
        }
      ]
    });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        message: "No transactions found"
      });
    }

    const transactionsData = transactions.map(transaction => transaction.toJSON());

    return res.status(200).json({
      message: "Transactions retrieved successfully",
      transactions: transactionsData
    });
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    return res.status(500).json({
      message: "An error occurred while retrieving transactions",
      error: error.message
    });
  }
};

module.exports = {
  getAllTransactions
};
