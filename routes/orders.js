const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Create an order
router.post("/orders", async (req, res) => {
    try {
        const { cart, name, address, phone, email, paymentMethod } = req.body;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        const newOrder = new Order({
            name,
            address,
            phone,
            email,
            cart,
            paymentMethod,
            status: "Pending", // Default status
        });

        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to place order" });
    }
});

module.exports = router;
