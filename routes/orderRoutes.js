const express = require("express");
const Razorpay = require("razorpay");

const router = express.Router();

const razorpay = new Razorpay({
    key_id: "YOUR_KEY_ID",
    key_secret: "YOUR_SECRET_KEY",
});

router.post("/", async (req, res) => {
    const { items } = req.body;

    const order = await razorpay.orders.create({
        amount: items.reduce((total, item) => total + item.price, 0) * 100,
        currency: "INR",
        payment_capture: 1,
    });

    res.json({ paymentUrl: `https://checkout.razorpay.com/v1/checkout.js?order_id=${order.id}` });
});

module.exports = router;
