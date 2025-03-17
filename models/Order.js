// const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   name: { type: String, required: true },
//   phone: { type: String, required: true },
//   address: { type: String, required: true },
//   paymentMethod: { type: String, required: true },
//   products: { type: Array, required: true },
//   totalPrice: { type: Number, required: true },
//   paymentStatus: { type: String, default: "Paid" },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Order", OrderSchema);





const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  products: { type: Array, required: true },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, default: "Paid" },
  status: { type: String, default: "Pending" }, // Add status field
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Order", OrderSchema);