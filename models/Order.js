const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: String,
    products: [
        {
            productId: String,
            name: String,
            price: Number,
            quantity: Number,
            image: String,
        },
    ],
    totalAmount: Number,
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
