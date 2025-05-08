const { Chat, User, Product } = require("../models"); // Pastikan model sudah di-import dengan benar

const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.findAll({
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "name", "email"],
        },
        {
          model: Product,
          attributes: ["id", "name"], // sesuaikan dengan kolom item yang kamu butuhkan
        },
      ],
    });

    if (!chats || chats.length === 0) {
      return res.status(404).json({
        message: "No chats found",
      });
    }

    const chatsData = chats.map((chat) => chat.toJSON());

    return res.status(200).json({
      message: "Chats retrieved successfully",
      chats: chatsData,
    });
  } catch (error) {
    console.error("Error fetching chats:", error.message);
    return res.status(500).json({
      message: "An error occurred while retrieving chats",
      error: error.message,
    });
  }
};

const getChatsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const chats = await Chat.findAll({
      where: { receiver_id: userId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "name", "email"],
        },
        {
          model: Product,
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    if (!chats || chats.length === 0) {
      return res.status(404).json({
        message: "No chats found for this user",
      });
    }

    const chatsData = chats.map((chat) => chat.toJSON());

    return res.status(200).json({
      message: "Chats retrieved successfully",
      chats: chatsData,
    });
  } catch (error) {
    console.error("Error fetching chats by user ID:", error.message);
    return res.status(500).json({
      message: "An error occurred while retrieving chats",
      error: error.message,
    });
  }
};

const getMessagesBetweenUsers = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Chat.findAll({
      where: {},
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    // Filter manual di JavaScript
    const filteredMessages = messages.filter(
      (msg) =>
        (String(msg.sender_id) === user1 &&
          String(msg.receiver_id) === user2) ||
        (String(msg.sender_id) === user2 && String(msg.receiver_id) === user1)
    );

    res.status(200).json(filteredMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const readMessage = async (req, res) => {
  const chatId = req.params.id; // Ambil ID dari parameter tanpa konversi

  try {
    // Temukan chat berdasarkan ID
    const chat = await Chat.findByPk(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat tidak ditemukan" });
    }

    // Update read_status menjadi 1
    chat.read_status = "1";

    // Simpan perubahan
    await chat.save();

    // Kirim response berhasil
    return res.status(200).json({ message: "Chat telah dibaca", chat });
  } catch (error) {
    console.error("Error updating read_status:", error.message || error.stack);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat memperbarui status chat" });
  }
};

const sendMessage = async (req, res) => {
  const { message } = req.body;
  const sender_id = req.params.user1Id;
  const receiver_id = req.params.user2Id;

  console.log("Sender ID:", sender_id, "Receiver ID:", receiver_id);

  try {
    if (!message) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    if (String(sender_id) === String(receiver_id)) {
      return res
        .status(400)
        .json({ message: "Tidak bisa mengirim pesan ke diri sendiri" });
    }

    const newMessage = await Chat.create({
      sender_id,
      receiver_id,
      message,
      read_status: "0",
    });

    return res.status(201).json({
      message: "Pesan berhasil dikirim",
      chat: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error.message || error.stack);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengirim pesan" });
  }
};

module.exports = {
  getAllChats,
  getChatsByUserId,
  getMessagesBetweenUsers,
  readMessage,
  sendMessage,
};
