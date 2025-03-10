const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("Cart", cartSchema);
