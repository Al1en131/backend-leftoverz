const Product = require('../models/productModel');
const User = require('../models/userModel');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: {
        model: User,
        attributes: ['id', 'name', 'email'] 
      }
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found"
      });
    }

    const productsData = products.map(product => product.toJSON());

    return res.status(200).json({
      message: "Products retrieved successfully",
      products: productsData
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return res.status(500).json({
      message: "An error occurred while retrieving products",
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts
};
