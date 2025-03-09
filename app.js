require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const morgan = require("morgan");
const { userModel } = require("./models/Users");
const auth = require("./middleware/auth");
const Prediction = require("./models/Prediction");
const Product = require("./models/Product");
const PredictionModel = require('./models/PredictionModel');
const { predictSkinType, predictSkinCondition } = require("./utils/prediction.js");
const { predictSkinTypeAndCondition } = require("./utils/prediction");







const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000", // Allow frontend requests
    methods: ["GET", "POST"], // Allow specific methods
    allowedHeaders: ["Content-Type", "Authorization"] // Allow necessary headers
  }));
  
app.use(morgan("dev"));


// MongoDB Connection
mongoose.connect("mongodb+srv://stina:stina2006@cluster0.rfrzosg.mongodb.net/skinCaredb?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(" MongoDB connection error: ", err));

// Signup API
app.post("/SignUp", async (req, res) => {
    console.log(" Signup request received:", req.body);

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ status: "error", message: "All fields are required" });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: "error", message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({ username, email, password: hashedPassword });
        await newUser.save();

        console.log("User registered:", username);
        res.status(201).json({ status: "success", message: "User registered successfully" });
    } catch (error) {
        console.error(" Signup Error:", error);
        res.status(500).json({ status: "error", message: "Server error. Please try again." });
    }
});

// Login API
app.post("/Login", async (req, res) => {
  console.log("🔹 Login request received:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ status: "error", message: "All fields are required" });
  }

  try {
      // Find user by email
      const user = await userModel.findOne({ email });
      if (!user) {
          return res.status(401).json({ status: "error", message: "Invalid email or password" });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ status: "error", message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET || "your_secret_key",
          { expiresIn: "1h" }
      );

      console.log(" Login successful for:", email);
      res.json({
          status: "success",
          message: "Login successful",
          token,
          userId: user._id,
          role: user.role,
          username: user.username
      });

  } catch (error) {
      console.error(" Login Error:", error);
      res.status(500).json({ status: "error", message: "Server error. Please try again." });
  }
});

// Prediction API (Express) - Integrate with Flask API
app.post("/predict", async (req, res) => {
    try {
        // Assuming Flask API is running on http://localhost:5000
        const flaskApiUrl = "http://127.0.0.1:5000/predict";
        const response = await fetch(flaskApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req.body) // Send data to Flask API
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: "Failed to process prediction." });
        }

        // Send response from Flask API back to client
        res.json({
            predictedSkinType: data.skinType,
            predictedSkinCondition: data.condition
        });

    } catch (error) {
        console.error("❌ Prediction Error:", error);
        res.status(500).json({ error: "Failed to process prediction." });
    }
});

// API to get recommended products based on skin type and concern
app.post("/recommend", async (req, res) => {
    const { skin_type, skin_condition } = req.body;
  
    if (!skin_type || !skin_condition) {
      return res.status(400).json({ error: "Missing skin type or concern" });
    }
  
    try {
      // Fetch products from MongoDB that match the skin type and concern
      const recommendedProducts = await Product.find({
        "Skin type": skin_type,
        Concern: skin_condition,
      });
  
      res.json({
        recommended_products: recommendedProducts,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching products" });
    }
  });
  
  
  // Start Server
  const PORT = 5000;
// Start Server
app.listen(3031, () => console.log(" Server started"));
