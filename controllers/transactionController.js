const Transaction = require("../models/transactionModel");
const { User, Product } = require("../models");
const midtransClient = require("midtrans-client");

const snap = new midtransClient.Snap({
  isProduction: true,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

async function createMidtransToken(req, res) {
  try {
    const parameter = {
      transaction_details: {
        order_id: req.body.order_id,
        gross_amount: req.body.gross_amount,
      },
      customer_details: req.body.customer,
    };

    console.log("Midtrans Snap Parameter:", JSON.stringify(parameter, null, 2));

    const transaction = await snap.createTransaction(parameter);

    console.log("Midtrans Snap Response:", transaction);

    res.json({ token: transaction.token });
  } catch (error) {
    console.error("Midtrans Snap Error:", error);

    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
}
async function saveTransaction(req, res) {
  try {
    const {
      buyer_id,
      seller_id,
      item_id,
      payment_method,
      status,
      total,
      order_id,
    } = req.body;

    if (
      !buyer_id ||
      !seller_id ||
      !item_id ||
      !payment_method ||
      !status ||
      !total ||
      !order_id
    ) {
      return res.status(400).json({ message: "Data transaksi tidak lengkap." });
    }

    const newTransaction = await Transaction.create({
      buyer_id,
      seller_id,
      item_id,
      payment_method,
      status,
      total,
      order_id,
    });

    await Product.update({ status: "sold" }, { where: { id: item_id } });

    res.status(201).json({
      message: "Transaksi berhasil disimpan dan produk ditandai sebagai sold",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Gagal menyimpan transaksi:", error);
    res.status(500).json({ message: "Gagal menyimpan transaksi" });
  }
}
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
    const buyerTransactions = await Transaction.findAll({
      where: { buyer_id: userId },
      include: [
        {
          model: User,
          as: "buyer",
          attributes: [
            "id",
            "name",
            "email",
            "address",
            "ward",
            "regency",
            "province",
            "subdistrict",
            "postal_code",
            "no_hp",
          ],
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

    const sellerTransactions = await Transaction.findAll({
      where: { seller_id: userId },
      include: [
        {
          model: User,
          as: "buyer",
          attributes: [
            "id",
            "name",
            "email",
            "address",
            "ward",
            "regency",
            "province",
            "subdistrict",
            "postal_code",
            "no_hp",
          ],
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

const handleMidtransWebhook = async (req, res) => {
  try {
    const { order_id, transaction_status, fraud_status } = req.body;

    console.log("📩 Webhook received:", req.body);

    const transaction = await Transaction.findOne({ where: { order_id } });

    if (!transaction) {
      console.log(`❌ Transaction with order_id ${order_id} not found`);
      return res.status(404).json({ message: "Transaction not found" });
    }

    console.log(
      `🔁 Updating transaction ${order_id} with status: ${transaction_status}`
    );

    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {
      if (fraud_status === "challenge") {
        transaction.status = "challenge";
      } else {
        transaction.status = "success";
      }
    } else if (transaction_status === "pending") {
      transaction.status = "pending";
    } else if (
      transaction_status === "deny" ||
      transaction_status === "expire" ||
      transaction_status === "cancel"
    ) {
      transaction.status = "failed";
    } else {
      transaction.status = transaction_status;
    }

    await transaction.save();

    console.log(`✅ Transaction ${order_id} updated to ${transaction.status}`);

    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("🔥 Error in Midtrans webhook:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTransactionByUserIdById = async (req, res) => {
  const { userId, transactionId } = req.params;

  try {
    const transaction = await Transaction.findOne({
      where: {
        id: transactionId,
      },
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "seller",
          attributes: [
            "id",
            "name",
            "email",
            "ward",
            "address",
            "province",
            "regency",
            "subdistrict",
            "postal_code",
          ],
        },
        {
          model: Product,
          as: "item",
          attributes: ["id", "name", "price", "image"],
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }
    if (
      transaction.buyer_id.toString() !== userId &&
      transaction.seller_id.toString() !== userId
    ) {
      return res.status(403).json({
        message: "You are not authorized to view this transaction",
      });
    }

    return res.status(200).json({
      message: "Transaction retrieved successfully",
      transaction: transaction.toJSON(),
    });
  } catch (error) {
    console.error("Error fetching transaction:", error.message);
    return res.status(500).json({
      message: "An error occurred while retrieving the transaction",
      error: error.message,
    });
  }
};

const editTransactionByUserId = async (req, res) => {
  const transactionId = req.params.id;
  const userId = req.body.user_id;
  const { awb, courir } = req.body;

  try {
    if (!awb || !courir) {
      return res.status(400).json({ message: "awb dan courir harus diisi" });
    }

    const transaction = await Transaction.findOne({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ message: "Transaksi tidak ditemukan atau bukan milik user" });
    }

    transaction.awb = awb;
    transaction.courir = courir;

    await transaction.save();

    return res
      .status(200)
      .json({ message: "Transaksi berhasil diupdate", transaction });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllTransactions,
  countTransactions,
  getTransactionsByUserId,
  createMidtransToken,
  saveTransaction,
  handleMidtransWebhook,
  getTransactionByUserIdById,
  editTransactionByUserId,
};
