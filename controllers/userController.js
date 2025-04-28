const User = require("../models/userModel");

const getAllUsers = async (req, res) => {
  try {
    // Mengambil semua pengguna dari database
    const users = await User.findAll();

    // Mengembalikan data pengguna dalam response
    return res.status(200).json({
      message: "Users retrieved successfully",
      users: users
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers
};
