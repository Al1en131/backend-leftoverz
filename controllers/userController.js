const User = require("../models/userModel");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "No users found",
      });
    }
    const usersData = users.map((user) => user.toJSON());

    return res.status(200).json({
      message: "Users retrieved successfully",
      users: usersData,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return res.status(500).json({
      message: "An error occurred while retrieving users",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
    });
  }

  try {
    // Cari pengguna berdasarkan ID
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Mengubah data pengguna menjadi format JSON dan mengirimkan respons
    return res.status(200).json({
      message: "User retrieved successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return res.status(500).json({
      message: "An error occurred while retrieving the user",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
};
