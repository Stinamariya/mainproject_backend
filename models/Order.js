const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  status: { type: String, default: "pending" } // 'pending', 'shipped', 'delivered'
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
