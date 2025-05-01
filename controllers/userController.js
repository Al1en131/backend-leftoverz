const User = require("../models/userModel");
const bcrypt = require('bcrypt');

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
const saltRounds = 10; // Jumlah salt untuk bcrypt (semakin tinggi, semakin aman namun lebih lambat)

// Fungsi untuk mengenkripsi password
const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const addUser = async (req, res) => {
  const { name, email, password, role, no_hp, address, province, regency, subdistrict, ward } = req.body;

  // Validasi data
  if (!name || !email || !password || !role || !no_hp) {
    return res.status(400).json({
      message: "Name, email, password, role, and no_hp are required",
    });
  }

  try {
    // Enkripsi password
    const hashedPassword = await encryptPassword(password);

    // Membuat pengguna baru dengan password terenkripsi
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      no_hp,
      address,
      province,
      regency,
      subdistrict,
      ward
    });

    // Mengirimkan response sukses
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
  const { name, email, password, role, no_hp, address, province, regency, subdistrict, ward } = req.body;

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

    // Enkripsi password jika diberikan
    let hashedPassword = user.password;
    if (password) {
      hashedPassword = await encryptPassword(password);
    }

    // Update user dengan password yang sudah terenkripsi
    await user.update({
      name: name ?? user.name,
      email: email ?? user.email,
      password: hashedPassword,
      role: role ?? user.role,
      no_hp: no_hp ?? user.no_hp,
      address: address ?? user.address,
      province : province ?? user.province,
      regency : regency ?? user.regency,
      subdistrict : subdistrict ?? user.subdistrict,
      ward : ward ?? user.ward
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
    // Cari pengguna berdasarkan ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Hapus pengguna
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
  deleteUser
};
