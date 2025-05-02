const { User, Product } = require("../models");
const Favorite = require("../models/favoriteModel");

const addFavorite = async (req, res) => {
  const { user_id, item_id } = req.body;

  try {
    // Cek apakah favorite sudah ada (opsional, untuk mencegah duplikat)
    const existing = await Favorite.findOne({ where: { user_id, item_id } });
    if (existing) {
      return res.status(400).json({ message: "Favorite already exists" });
    }

    // Simpan favorite baru
    const newFavorite = await Favorite.create({ user_id, item_id });

    return res.status(201).json({
      message: "Favorite added successfully",
      data: newFavorite,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { addFavorite };
