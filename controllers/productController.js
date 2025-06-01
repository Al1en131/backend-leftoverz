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

  const {
    name,
    price,
    description,
    user_id,
    status,
    used_duration,
    original_price,
    embedding, 
  } = req.body;

  if (!name || !price || !description || !user_id || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

  try {
    let parsedEmbedding = null;
    if (embedding) {
      if (typeof embedding === "string") {
        parsedEmbedding = JSON.parse(embedding);
      } else if (Array.isArray(embedding)) {
        parsedEmbedding = embedding;
      }
    }

    const newProduct = await Product.create({
      name,
      price,
      description,
      user_id,
      status,
      image: imagePaths,
      used_duration,
      original_price,
      embedding: parsedEmbedding, 
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
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

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
  const {
    name,
    description,
    price,
    status,
    used_duration,
    original_price,
    embedding,
  } = req.body;

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
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

    let parsedEmbedding = null;
    if (embedding) {
      if (typeof embedding === "string") {
        parsedEmbedding = JSON.parse(embedding);
      } else if (Array.isArray(embedding)) {
        parsedEmbedding = embedding;
      }
    }

    const newProduct = await Product.create({
      user_id,
      name,
      description,
      price,
      image: imagePaths,
      status,
      used_duration,
      original_price,
      embedding: parsedEmbedding, 
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

const editProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    price,
    description,
    user_id,
    status,
    removedImages = "[]",
    keptImages = "[]",
    used_duration,
    original_price,
    embedding, 
  } = req.body;

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
    product.used_duration = used_duration;
    product.original_price = original_price;

    if (embedding) {
      try {
        product.embedding =
          typeof embedding === "string" ? JSON.parse(embedding) : embedding;
      } catch (err) {
        return res.status(400).json({ message: "Invalid embedding format." });
      }
    }

    const removedList = JSON.parse(removedImages);
    const keptList = JSON.parse(keptImages);

    removedList.forEach((img) => {
      const filePath = path.join(__dirname, `../public${img}`);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn(`Failed to delete ${img}:`, err.message);
      }
    });

    let currentImages = keptList;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);

      if (currentImages.length + newImages.length > 5) {
        newImages.forEach((img) => {
          const filePath = path.join(__dirname, `../public${img}`);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });

        return res.status(400).json({
          message:
            "A maximum of 5 images is allowed (including existing and new images).",
        });
      }

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
    return res.status(500).json({
      message: "Server error while updating product.",
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
    keptImages = "[]",
    used_duration,
    original_price,
    embedding,
  } = req.body;

  if (!name || !price || !description || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const product = await Product.findOne({
      where: {
        id: product_id,
        user_id,
      },
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or not owned by user." });
    }

    product.name = name;
    product.price = price;
    product.description = description;
    product.status = status;
    product.used_duration = used_duration;
    product.original_price = original_price;

    if (embedding) {
      try {
        product.embedding =
          typeof embedding === "string" ? JSON.parse(embedding) : embedding;
      } catch (err) {
        return res.status(400).json({ message: "Invalid embedding format." });
      }
    }

    const removedList = JSON.parse(removedImages);
    const keptList = JSON.parse(keptImages);

    removedList.forEach((img) => {
      const filePath = path.join(__dirname, `../public${img}`);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn(`Failed to delete ${img}:`, err.message);
      }
    });

    let currentImages = keptList;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);

      if (currentImages.length + newImages.length > 5) {
        newImages.forEach((img) => {
          const filePath = path.join(__dirname, `../public${img}`);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });

        return res.status(400).json({
          message:
            "A maximum of 5 images is allowed (including existing and new images).",
        });
      }

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
    return res.status(500).json({
      message: "Server error while updating product.",
    });
  }
};

const getProductByUserIdAndProductId = async (req, res) => {
  const { user_id, product_id } = req.params;

  if (!user_id || !product_id) {
    return res.status(400).json({
      message: "User ID and Product ID are required.",
    });
  }

  try {
    const product = await Product.findOne({
      where: {
        id: product_id,
        user_id,
      },
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
        message: "Product not found or does not belong to the user.",
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

    return res.status(200).json({
      message: "Product retrieved successfully",
      product: productJSON,
    });
  } catch (error) {
    console.error(
      "Error fetching product by user_id and product_id:",
      error.message
    );
    return res.status(500).json({
      message: "An error occurred while retrieving the product",
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
  editProductByUserId,
  getProductByUserIdAndProductId,
};
