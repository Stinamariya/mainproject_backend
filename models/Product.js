const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    skinType: { type: String, required: true },
    skinCondition: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String } 
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
