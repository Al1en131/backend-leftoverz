const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const routes = express.Router();
const {
  getAllTransactions,
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
} = require("../controllers/transactionController");
const { uploadMiddleware } = require("../controllers/productController");

routes.get("/transactions/user/:userId", getTransactionsByUserId);
routes.get("/transactions", authMiddleware, getAllTransactions);
routes.post("/create-midtrans-token", authMiddleware, createMidtransToken);
routes.post("/create/transaction", authMiddleware, saveTransaction);
routes.post("/:order_id/refund", uploadMiddleware, refundTransaction);
routes.post("/midtrans/webhook", handleMidtransWebhook);
routes.get("/:userId/transaction/:transactionId", getTransactionByUserIdById);
routes.put("/transactions/:id", editTransactionByUserId);
routes.get("/refund/:transaction_id", getRefundByTransactionId);
routes.put("/refund/shipping/:id", updateShippingInfo);
routes.put("/:id/status-package", updateShipping);
routes.put("/:id/transaction/status-package", updateTransactionStatusPackage);
routes.get("/refunds", getAllRefund);
routes.get("/seller/:seller_id/refund", getAllRefundBySellerId);
routes.put("/refund/:id", updateRefundStatus);

module.exports = routes;
