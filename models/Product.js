const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  skinType: String,
  productName: String,
  concern: String,
  productUrl: String,
  productPic: String,
  price: {
    type: Number,  // Ensure it's a Number type
    required: true, // You can remove 'required' if it's optional
  },
  // stock: {
  //   type: Number,
  //   required: true,
  // },
  // description: {
  //   type: String,
  //   required: true,
  // },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
