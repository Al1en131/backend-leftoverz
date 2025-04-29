const { Chat, User, Product } = require("../models"); // Pastikan model sudah di-import dengan benar

const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.findAll({
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Product,
          attributes: ['id', 'name'] // sesuaikan dengan kolom item yang kamu butuhkan
        }
      ]
    });

    if (!chats || chats.length === 0) {
      return res.status(404).json({
        message: "No chats found"
      });
    }

    const chatsData = chats.map(chat => chat.toJSON());

    return res.status(200).json({
      message: "Chats retrieved successfully",
      chats: chatsData
    });
  } catch (error) {
    console.error("Error fetching chats:", error.message);
    return res.status(500).json({
      message: "An error occurred while retrieving chats",
      error: error.message
    });
  }
};

module.exports = {
  getAllChats,
};
