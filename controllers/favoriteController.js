const { Favorite, User, Product } = require("../models"); // Pastikan model sudah di-import dengan benar

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
  const { user_id, item_id } = req.body;

  if (!user_id || !item_id) {
    return res.status(400).json({ message: "User ID dan item ID wajib diisi" });
  }

  try {
    const deleted = await Favorite.destroy({
      where: {
        user_id,
        item_id,
      },
    });

    if (deleted === 0) {
      return res.status(404).json({ message: "Favorite tidak ditemukan" });
    }

    res.json({ message: "Produk berhasil dihapus dari favorit" });
  } catch (error) {
    console.error("Gagal menghapus favorit:", error);
    res.status(500).json({ message: "Gagal menghapus dari favorit" });
  }
};

const getAllFavoritesByUserId = async (req, res) => {
  const { user_id } = req.params; // Mengambil user_id dari params

  try {
    // Cek apakah user ada di database
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    console.log("Mencari favorit untuk user_id:", user_id);

    const favorites = await Favorite.findAll({
      where: { user_id: user_id },
      include: [
        {
          model: Product,
          as: "product", // Alias yang harus sesuai dengan asosiasi di model Favorite
          attributes: ["id", "user_id", "name", "price", "image"], // Pastikan image termasuk dalam atribut
          include: [
            {
              model: User,
              attributes: ["id", "name", "subdistrict"], // Ambil nama penjual
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "name",
            "subdistrict",
            "regency",
            "ward",
            "province",
          ],
        },
      ],
    });

    console.log("Favorites ditemukan:", favorites);

    // Jika tidak ada favorit ditemukan
    if (favorites.length === 0) {
      return res.status(404).json({ message: "Tidak ada favorit ditemukan" });
    }

    // Menyusun data untuk response
    const result = favorites.map((fav) => {
      const seller = fav.product.User;
      const product = fav.product; // Produk terkait dari Favorite
      const user = fav.user; // User terkait dari Favorite

      return {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          user_id: product.user_id,
          seller_name: seller ? seller.name : null,
          subdistrict: seller ? seller.subdistrict : null,
          image: product.image ? `${product.image}` : null, // Menangani kemungkinan null atau string array
        },
        user: {
          name: user.name, // Ambil nama user
          subdistrict: user.subdistrict,
          ward: user.ward,
          regency: user.regency,
          province: user.province,
        },
      };
    });

    return res.status(200).json({
      message: "Berhasil mendapatkan data favorit",
      data: result,
    });
  } catch (error) {
    console.error("Gagal mendapatkan data favorit:", error); // Logging error untuk debugging
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

module.exports = {
  handleCreateFavorite,
  getFavoriteStatus,
  removeFavorite,
  getAllFavoritesByUserId,
};
