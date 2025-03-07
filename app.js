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






const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));
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

app.post("/api/predict", async (req, res) => {
    try {
        let { Water_Intake_Glasses, Sleep_Hours, ...otherData } = req.body;
  
        // Convert Water Intake and Sleep Hours to numeric values
        if (typeof Water_Intake_Glasses === "string") {
            Water_Intake_Glasses = parseFloat(Water_Intake_Glasses.split('-').reduce((a, b) => (parseFloat(a) + parseFloat(b)) / 2, 0));
        }
  
        if (typeof Sleep_Hours === "string") {
            Sleep_Hours = Sleep_Hours.includes("+") ? parseFloat(Sleep_Hours.replace("+", "")) : parseFloat(Sleep_Hours);
        }
  
        // **Run ML model to predict skin type & condition**
        const predictedSkinType = predictSkinType(Water_Intake_Glasses, Sleep_Hours, otherData);
        const predictedSkinCondition = predictSkinCondition(Water_Intake_Glasses, Sleep_Hours, otherData);
  
        // **Save to database**
        const prediction = new PredictionModel({
            Water_Intake_Glasses,
            Sleep_Hours,
            ...otherData,
            predictedSkinType, // Ensure this is stored
            predictedSkinCondition // Ensure this is stored
        });
  
        await prediction.save();
  
        // **✅ Send correct response**
        res.status(201).json({
            message: "Prediction saved successfully",
            prediction: {
                userId: prediction.userId,  
                predictedSkinType,  
                predictedSkinCondition,  
                _id: prediction._id  
            }
        });
  
    } catch (error) {
        console.error("❌ Prediction Error:", error);
        res.status(500).json({ error: "Prediction failed", details: error.message });
    }
  });
  


// Fetch User Prediction History
app.get("/api/predictions/:userId", async (req, res) => {
  try {
      const userPredictions = await Prediction.find({ userId: req.params.userId }).sort({ createdAt: -1 });
      res.json(userPredictions);
  } catch (error) {
      console.error("❌ Error fetching predictions:", error);
      res.status(500).json({ error: "Error fetching user history" });
  }
});

// Product Recommendations API
app.get("/api/recommend", async (req, res) => {
  try {
      const { skinType, skinCondition } = req.query;
      if (!skinType || !skinCondition) {
          return res.status(400).json({ error: "skinType and skinCondition are required" });
      }

      const recommendedProducts = await Product.find({ skinType, skinCondition });
      res.json(recommendedProducts);
  } catch (error) {
      console.error("❌ Recommendation Error:", error);
      res.status(500).json({ error: "Error fetching recommendations" });
  }
});




// Start Server
app.listen(3031, () => console.log(" Server started"));
