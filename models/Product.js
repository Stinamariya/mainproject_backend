// const mongoose = require("mongoose");

// const ProductSchema = new mongoose.Schema({
//   "Skin type": { type: String, required: true }, // Skin type (e.g., Dry, Oily)
//   Product: { type: String, required: true }, // Product name
//   Concern: { type: String, required: true }, // Concern related to skin (e.g., Acne, Dryness)
//   product_url: { type: String, required: true }, // URL for the product
//   product_pic: { type: String, required: true }, // Image URL for the product
// });

// module.exports = mongoose.model("Product", ProductSchema);









const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  skin_type: { type: String, required: true },
  product: { type: String, required: true },
  concern: { type: String, required: true },
  product_url: { type: String, required: true },
  product_pic: { type: String, required: true },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
