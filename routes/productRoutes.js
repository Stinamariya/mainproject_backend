const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get recommended products by skin type and condition
router.get("/recommend", async (req, res) => {
    const { skinType, condition } = req.query;
    try {
        const recommendedProducts = await Product.find({
            skinType: skinType,
            concern: condition,
        });
        res.json(recommendedProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
