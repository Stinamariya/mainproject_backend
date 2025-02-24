const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { userModel } = require("./models/Users");
const SkinAnalysis = require("./models/SkinAnalysis");
const auth = require("./middleware/auth");


const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

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

// Save Skin Analysis Response
app.post("/submit", auth, async (req, res) => {
    try {
      const { responses } = req.body;
      const newAnalysis = new SkinAnalysis({ userId: req.user.id, responses });
      await newAnalysis.save();
      res.status(201).json({ message: "Analysis submitted successfully" });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get User's Past Skin Analyses
  app.get("/history", auth, async (req, res) => {
    try {
      const analyses = await SkinAnalysis.find({ userId: req.user.id }).sort({ createdAt: -1 });
      res.json(analyses);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  


// Start Server
app.listen(3031, () => console.log(" Server started"));
