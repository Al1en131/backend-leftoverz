const User = require("../models/userModel");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "No users found"
      });
    }
    const usersData = users.map(user => user.toJSON());

    return res.status(200).json({
      message: "Users retrieved successfully",
      users: usersData
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return res.status(500).json({
      message: "An error occurred while retrieving users",
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers
};
