const Transaction = require("../models/transactionModel");
const Refund = require("../models/refundModel");
const { User, Product } = require("../models");
const axios = require("axios");
const midtransClient = require("midtrans-client");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }).array("image");

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

async function refundTransaction(req, res) {
  const { order_id } = req.params;
  const { amount, reason } = req.body;

  // Handle multiple image upload (from req.files)
  const imagePaths =
    req.files?.map((file) => `/uploads/${file.filename}`) || [];

  if (!order_id || !amount || !reason) {
    return res.status(400).json({
      message: "order_id, amount, dan reason diperlukan.",
    });
  }

  try {
    // ✅ Cari transaksi berdasarkan order_id
    const transaction = await Transaction.findOne({ where: { order_id } });

    if (!transaction) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });
    }

    const user_id = transaction.buyer_id;
    const refundData = await Refund.create({
      transaction_id: transaction.id,
      reason,
      amount,
      status: "requested",
      image: JSON.stringify(imagePaths),
    });

    return res.status(200).json({
      message: "Permintaan refund berhasil diajukan.",
      refund: refundData,
      user_id,
    });
  } catch (error) {
    console.error("Refund Request Error:", error);
    return res.status(500).json({
      message: "Gagal mengajukan refund.",
      error: error?.message || error,
    });
  }
}
const getRefundByTransactionId = async (req, res) => {
  const { transaction_id } = req.params;

  if (!transaction_id) {
    return res.status(400).json({ message: "transaction_id diperlukan." });
  }

  try {
    const refund = await Refund.findOne({
      where: { transaction_id },
    });

    if (!refund) {
      return res.status(404).json({ message: "Data refund tidak ditemukan." });
    }

    await Transaction.update(
      { status_package: "refund" },
      { where: { id: transaction_id } }
    );

    return res.status(200).json({ refund });
  } catch (error) {
    console.error("Error getRefundByTransactionId:", error);
    return res.status(500).json({ message: "Terjadi kesalahan.", error });
  }
};
const getAllRefundBySellerId = async (req, res) => {
  const { seller_id } = req.params;

  if (!seller_id) {
    return res.status(400).json({ message: "seller_id diperlukan." });
  }

  try {
    const refunds = await Refund.findAll({
      include: [
        {
          model: Transaction,
          where: { seller_id },
          include: [
            {
              model: Product,
              as: "item",
              attributes: ["name", "image", "price"],
            },
            {
              model: User,
              as: "buyer",
              attributes: ["name"],
            },
            {
              model: User,
              as: "seller",
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const result = refunds.map((refund) => ({
      ...refund.toJSON(),
      item: refund.Transaction?.item || null,
      buyer: refund.Transaction?.buyer || null,
      seller: refund.Transaction?.seller || null,
    }));

    return res.status(200).json({ refunds: result });
  } catch (error) {
    console.error("Error getAllRefundBySellerId:", error);
    return res.status(500).json({ message: "Terjadi kesalahan.", error });
  }
};

const getAllRefund = async (req, res) => {
  try {
    const refunds = await Refund.findAll({
      include: [
        {
          model: Transaction,
          include: [
            {
              model: User,
              as: "buyer",
              attributes: ["name"],
            },
            {
              model: User,
              as: "seller",
              attributes: ["name"],
            },
            {
              model: Product,
              as: "item",
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const result = refunds.map((refund) => ({
      ...refund.toJSON(),
      item: refund.Transaction?.item || null,
      buyer: refund.Transaction?.buyer || null,
      seller: refund.Transaction?.seller || null,
    }));

    // ✅ Ubah 'result' menjadi 'refunds' agar cocok dengan frontend
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Error getAllRefund:", error);
    return res.status(500).json({ message: "Terjadi kesalahan.", error });
  }
};

const updateRefundStatus = async (req, res) => {
  const { id } = req.params; // ID refund, bukan ID transaksi
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const refund = await Refund.findByPk(id);
    if (!refund) {
      return res.status(404).json({ message: "Refund not found" });
    }

    // Ambil transaksi yang berhubungan dengan refund ini
    const transaction = await Transaction.findByPk(refund.transaction_id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Update status refund
    refund.status = status;
    await refund.save();

    // Jika status refund berubah ke "refunded", ubah juga status transaksi
    if (status === "refunded") {
      transaction.status = "refund";
      await transaction.save();
    }

    return res.status(200).json({ message: "Refund status updated", refund });
  } catch (error) {
    console.error("Error updating refund status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateShippingInfo = async (req, res) => {
  const { id } = req.params;
  const { tracking_number, courir } = req.body;

  if (!tracking_number || !courir) {
    return res
      .status(400)
      .json({ message: "Tracking number dan courier harus diisi." });
  }

  try {
    const refund = await Refund.findByPk(id);

    if (!refund) {
      return res.status(404).json({ message: "Refund tidak ditemukan." });
    }

    if (refund.status !== "approved") {
      return res
        .status(400)
        .json({ message: "Refund belum disetujui oleh admin." });
    }

    refund.tracking_number = tracking_number;
    refund.courir = courir;
    refund.status = "shipping";
    refund.status_package = "processed";
    refund.refunded_at = new Date();
    await refund.save();

    return res
      .status(200)
      .json({ message: "Data pengiriman berhasil disimpan.", refund });
  } catch (error) {
    console.error("Gagal update refund shipping:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

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

const updateShipping = async (req, res) => {
  const { id } = req.params;
  const { status_package } = req.body;

  try {
    const refund = await Refund.findByPk(id);

    if (!refund) {
      return res.status(404).json({ message: "Refund tidak ditemukan" });
    }

    // Gunakan data dari req.body, bukan hardcode
    refund.status_package = status_package;
    await refund.save();

    return res.status(200).json({
      message: "Status berhasil diperbarui",
      refund, // kirim sebagai 'refund' agar di frontend bisa pakai result.refund
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Gagal memperbarui status",
      error: err.message || err,
    });
  }
};

const updateTransactionStatusPackage = async (req, res) => {
  const { id } = req.params;
  const { status_package } = req.body;

  try {
    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({ message: "transaction tidak ditemukan" });
    }

    transaction.status_package = status_package;
    await transaction.save();

    return res.status(200).json({
      message: "Status berhasil diperbarui",
      transaction,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Gagal memperbarui status",
      error: err.message || err,
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
            "phone_number",
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
            "phone_number",
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
    transaction.status_package = "processed";

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
  refundTransaction,
  getRefundByTransactionId,
  updateShippingInfo,
  updateShipping,
  updateTransactionStatusPackage,
  getAllRefund,
  getAllRefundBySellerId,
  updateRefundStatus,
};
