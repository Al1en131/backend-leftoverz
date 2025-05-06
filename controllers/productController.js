const multer = require("multer");
const path = require("path");
const Product = require("../models/productModel");
const { User } = require("../models");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }).array("image");
const createProduct = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      message: "No files uploaded. Please upload at least one image.",
    });
  }

  const { name, price, description, user_id, status } = req.body;
  if (!name || !price || !description || !user_id || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

  try {
    const newProduct = await Product.create({
      name,
      price,
      description,
      user_id,
      status,
      image: imagePaths,
    });

    return res.status(201).json({
      message: "Product created successfully!",
      product: newProduct,
      images: newProduct.image,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res
      .status(500)
      .json({ message: "Error creating product, please try again." });
  }
};

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res
        .status(500)
        .json({ message: "File upload error", error: err.message });
    }
    next();
  });
};

const editProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    price,
    description,
    user_id,
    status,
    removedImages = "[]",
  } = req.body;

  // Validasi input dasar
  if (!name || !price || !description || !user_id || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    product.name = name;
    product.price = price;
    product.description = description;
    product.user_id = user_id;
    product.status = status;

    const removedList = JSON.parse(removedImages);
    let currentImages = Array.isArray(product.image) ? product.image : [];

    removedList.forEach((img) => {
      const filePath = path.join(__dirname, `../public${img}`);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        currentImages = currentImages.filter((x) => x !== img);
      } catch (err) {
        console.warn(`Failed to delete ${img}:`, err.message);
      }
    });

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      currentImages.push(...newImages);
    }

    product.image = currentImages;
    await product.save();

    return res.status(200).json({
      message: "Product updated successfully!",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating product." });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: {
        model: User,
        attributes: [
          "id",
          "name",
          "email",
          "subdistrict",
          "ward",
          "regency",
          "province",
          "address",
        ],
      },
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found",
      });
    }

    const productsData = products.map((product) => {
      const productJSON = product.toJSON();
      productJSON.seller = {
        name: productJSON.User.name,
      };
      productJSON.user = {
        subdistrict: productJSON.User.subdistrict,
      };
      delete productJSON.User;
      return productJSON;
    });

    return res.status(200).json({
      message: "Products retrieved successfully",
      products: productsData,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return res.status(500).json({
      message: "An error occurred while retrieving products",
      error: error.message,
    });
  }
};

const countProducts = async (req, res) => {
  try {
    const totalProducts = await Product.count();

    res.status(200).json({
      message: "Total product count retrieved successfully",
      count: totalProducts,
    });
  } catch (error) {
    console.error("Error counting products:", error);
    res.status(500).json({
      message: "Error counting products",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Cari produk berdasarkan ID
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // (Opsional) Hapus file gambar dari sistem file
    const fs = require("fs");
    if (product.image && Array.isArray(product.image)) {
      product.image.forEach((imgPath) => {
        const filePath = path.join(__dirname, "..", imgPath);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.warn(`Failed to delete image: ${imgPath}`, err.message);
          }
        });
      });
    }

    // Hapus produk dari database
    await product.destroy();

    return res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res
      .status(500)
      .json({ message: "Error deleting product, please try again." });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: User,
          attributes: [
            "id",
            "name",
            "email",
            "subdistrict",
            "ward",
            "regency",
            "province",
            "address",
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const productJSON = product.toJSON();
    productJSON.seller = {
      name: productJSON.User.name,
    };
    productJSON.user = {
      subdistrict: productJSON.User.subdistrict,
      ward: productJSON.User.ward,
      regency: productJSON.User.regency,
      province: productJSON.User.province,
      address: productJSON.User.address,
    };
    delete productJSON.User;

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      product: productJSON,
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const getProductsByUserId = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const products = await Product.findAll({
      where: { user_id },
      include: {
        model: User,
        attributes: [
          "id",
          "name",
          "email",
          "subdistrict",
          "ward",
          "regency",
          "province",
          "address",
        ],
      },
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found for this user.",
      });
    }

    const productsData = products.map((product) => {
      const productJSON = product.toJSON();
      productJSON.seller = {
        name: productJSON.User.name,
      };
      productJSON.user = {
        subdistrict: productJSON.User.subdistrict,
        ward: productJSON.User.ward,
        regency: productJSON.User.regency,
        province: productJSON.User.province,
        address: productJSON.User.address,
      };
      delete productJSON.User;
      return productJSON;
    });

    return res.status(200).json({
      message: "Products retrieved successfully",
      products: productsData,
    });
  } catch (error) {
    console.error("Error fetching user's products:", error.message);
    return res.status(500).json({
      message: "An error occurred while retrieving user's products",
      error: error.message,
    });
  }
};

const addProductByUserId = async (req, res) => {
  const { user_id } = req.params;
  const { name, description, price, status } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  if (!name || !description || !price || !status) {
    return res.status(400).json({
      message: "All product fields are required.",
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      message: "No images uploaded. Please upload at least one image.",
    });
  }

  try {
    // Cek apakah user valid
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

    const newProduct = await Product.create({
      user_id,
      name,
      description,
      price,
      image: imagePaths,
      status,
    });

    return res.status(201).json({
      message: "Product created successfully.",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error.message);
    return res.status(500).json({
      message: "An error occurred while creating the product",
      error: error.message,
    });
  }
};

const editProductByUserId = async (req, res) => {
  const { user_id, product_id } = req.params;
  const {
    name,
    price,
    description,
    status,
    removedImages = "[]",
  } = req.body;

  // Validasi data
  if (!name || !price || !description || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Cek apakah user valid
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Cari produk berdasarkan user_id dan product_id
    const product = await Product.findOne({
      where: {
        id: product_id,
        user_id,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found or not owned by user." });
    }

    product.name = name;
    product.price = price;
    product.description = description;
    product.status = status;

    // Hapus gambar lama jika diminta
    const removedList = JSON.parse(removedImages);
    let currentImages = Array.isArray(product.image) ? product.image : [];

    removedList.forEach((img) => {
      const filePath = path.join(__dirname, `../public${img}`);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        currentImages = currentImages.filter((x) => x !== img);
      } catch (err) {
        console.warn(`Failed to delete ${img}:`, err.message);
      }
    });

    // Tambah gambar baru jika ada
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      currentImages.push(...newImages);
    }

    product.image = currentImages;
    await product.save();

    return res.status(200).json({
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    return res.status(500).json({
      message: "An error occurred while updating the product.",
      error: error.message,
    });
  }
};


module.exports = {
  getProductsByUserId,
  addProductByUserId,
  getAllProducts,
  createProduct,
  uploadMiddleware,
  editProduct,
  getProductById,
  deleteProduct,
  countProducts,
  getProductDetail,
  editProductByUserId
};
