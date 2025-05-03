const { User, Product, Favorite } = require("../models");

async function handleCreateFavorite(req, res) {
  try {
    // Mendapatkan user_id dan item_id dari body request
    const { user_id, item_id } = req.body;

    // Validasi: Pastikan user_id dan item_id ada dan bertipe number
    if (typeof user_id !== "number" || typeof item_id !== "number") {
      return res
        .status(400)
        .json({ message: "User ID dan item ID harus berupa angka" });
    }

    // Pastikan user_id dan item_id diisi
    if (!user_id || !item_id) {
      return res
        .status(400)
        .json({ message: "User ID dan item ID wajib diisi" });
    }

    // Log data untuk debugging
    console.log(
      "Membuat favorite untuk user:",
      user_id,
      "dan produk:",
      item_id
    );

    // Cek apakah user dan produk ada di database
    const user = await User.findByPk(user_id);
    const product = await Product.findByPk(item_id);

    // Jika user atau produk tidak ditemukan
    if (!user) {
      console.log("User tidak ditemukan dengan ID:", user_id);
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    if (!product) {
      console.log("Produk tidak ditemukan dengan ID:", item_id);
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Membuat entri favorite baru
    const favorite = await Favorite.create({
      user_id: user.id,
      item_id: product.id,
    });

    // Kembalikan response sukses dengan data favorite
    return res.status(201).json({
      message: "Produk berhasil ditambahkan ke favorit",
      data: favorite,
    });
  } catch (error) {
    // Log error lengkap untuk debugging
    console.error("Gagal membuat favorit:", error);

    // Kembalikan response error server
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

const getFavoriteStatus = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const favorite = await Favorite.findOne({ where: { userId, productId } });
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ message: "Failed to get favorite status" });
  }
};

const removeFavorite = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    await Favorite.destroy({ where: { userId, productId } });
    res.json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove favorite" });
  }
};

module.exports = { handleCreateFavorite, getFavoriteStatus, removeFavorite };
