const multer = require('multer');
const path = require('path');
const Product = require("../models/productModel");
const { User } = require("../models");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }).array('image'); 
const createProduct = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded. Please upload at least one image." });
  }

  const { name, price, location, description, user_id, status } = req.body;
  if (!name || !price || !location || !description || !user_id || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const imagePaths = req.files.map((file) => `/uploads/${file.filename}`); 

  try {
    const newProduct = await Product.create({
      name,
      price,
      location,
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
    return res.status(500).json({ message: "Error creating product, please try again." });
  }
};

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(500).json({ message: "File upload error", error: err.message });
    }
    next(); 
  });
};

const editProduct = async (req, res) => {
  const { id } = req.params; // Mengambil id product dari parameter URL
  const { name, price, location, description, user_id, status } = req.body;

  // Validasi input
  if (!name || !price || !location || !description || !user_id || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Mencari produk berdasarkan ID
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Mengupdate product dengan data baru
    product.name = name;
    product.price = price;
    product.location = location;
    product.description = description;
    product.user_id = user_id;
    product.status = status;

    // Jika ada gambar baru, upload dan update gambar
    let imagePaths = product.image; // Pertahankan gambar lama
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => `/uploads/${file.filename}`); // Menyimpan path gambar baru
    }

    // Update gambar dan informasi produk di database
    product.image = imagePaths;
    
    // Simpan perubahan ke database
    await product.save();

    return res.status(200).json({
      message: "Product updated successfully!",
      product,
      images: product.image,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Error updating product, please try again." });
  }
};


const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: {
        model: User,
        attributes: ["id", "name", "email"],
      },
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found",
      });
    }

    const productsData = products.map((product) => product.toJSON());

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

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  uploadMiddleware,
  editProduct,
  getProductById
};
