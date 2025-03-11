const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    skinType: String,
    productName: String,
    concern: String,
    productUrl: String,
    productPic: String
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
