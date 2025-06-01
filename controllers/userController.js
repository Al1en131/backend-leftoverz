const User = require("../models/userModel");
const bcrypt = require("bcrypt");

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
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

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
const saltRounds = 10; 

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const addUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    phone_number,
    address,
    province,
    regency,
    subdistrict,
    ward,
    postal_code,
    payment_account_number,
    account_holder_name,
    payment_type,
  } = req.body;

  if (!name || !email || !password || !role || !phone_number) {
    return res.status(400).json({
      message: "Name, email, password, role, and phone_number are required",
    });
  }

  try {
    const hashedPassword = await encryptPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone_number,
      address,
      province,
      regency,
      subdistrict,
      ward,
      postal_code,
      payment_account_number,
      account_holder_name,
      payment_type,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error("Error adding user:", error.message);
    return res.status(500).json({
      message: "An error occurred while adding the user",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const {
    name,
    email,
    role,
    phone_number,
    address,
    province,
    regency,
    subdistrict,
    ward,
    postal_code,
    payment_account_number,
    account_holder_name,
    payment_type,
  } = req.body;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
    });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    await user.update({
      name: name ?? user.name,
      email: email ?? user.email,
      role: role ?? user.role,
      phone_number: phone_number ?? user.phone_number,
      address: address ?? user.address,
      province: province ?? user.province,
      regency: regency ?? user.regency,
      subdistrict: subdistrict ?? user.subdistrict,
      ward: ward ?? user.ward,
      postal_code: postal_code ?? user.postal_code,
      payment_account_number: payment_account_number ?? user.payment_account_number,
      payment_type: payment_type ?? user.payment_type,
      account_holder_name: account_holder_name ?? user.account_holder_name,
    });

    return res.status(200).json({
      message: "User updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    return res.status(500).json({
      message: "An error occurred while updating the user",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
    });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.destroy();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    return res.status(500).json({
      message: "An error occurred while deleting the user",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
};
