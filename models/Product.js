// const mongoose = require("mongoose");

// const reviewSchema = new mongoose.Schema({
//   user: { type: String, required: true }, // Store username or userId
//   rating: { type: Number, required: true },
//   comment: { type: String, required: true },
// });

// const productSchema = new mongoose.Schema({
//   productName: { type: String, required: true },
//   skinType: String,
//   concern: String,
//   productUrl: String,
//   productPic: String,
//   reviews: [reviewSchema], // Add reviews array
// });

// module.exports = mongoose.model("Product", productSchema);













const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true }, // Store username or userId
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
});

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  skinType: String,
  concern: String,
  productUrl: String,
  productPic: String,
  price: { type: Number, required: true },  // ✅ Add price field
  reviews: [reviewSchema], // Add reviews array
});

module.exports = mongoose.model("Product", productSchema);
