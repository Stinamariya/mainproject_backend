













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
//   price: { type: Number, required: true },  // ✅ Add price field
//   reviews: [reviewSchema], // Add reviews array
// });

// module.exports = mongoose.model("Product", productSchema);






const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  skinType: { type: String, required: true, index: true },
  concern: { type: String, required: true, index: true },
  productUrl: { type: String, required: true },
  productPic: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  ingredients: { type: String, required: true },
  usageInstructions: { type: String, required: true },
  benefits: { type: String, required: true },
  reviews: [reviewSchema], 
});

module.exports = mongoose.model("Product", productSchema);


