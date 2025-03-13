const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  skinType: String,
  productName: String,
  concern: String,
  productUrl: String,
  productPic: String,
  price: {
    type: Number,  
    required: true, 
  },
  
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;