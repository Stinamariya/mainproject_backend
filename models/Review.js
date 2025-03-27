const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    username: { type: String, required: true }, // ✅ Ensure `required: true`
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    rating: { type: Number, required: true },
    comment: { type: String, required: true }
});

module.exports = mongoose.model("Review", reviewSchema);
