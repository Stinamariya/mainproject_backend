const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: String,
  skinType: String,
  skinCondition: String,
  description: String,
  price: Number,
  imageUrl: String,
});

module.exports = mongoose.model("Product", ProductSchema);
