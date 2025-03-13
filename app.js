require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const axios = require("axios");
const fs = require("fs");
const csv = require("csv-parser");






const User = require("./models/Users"); // Ensure correct path

const Product = require("./models/product");















const Admin = require('./models/Admin');


const app = express();

// ✅ Middleware
app.use(express.json());





// Allow DELETE method in CORS settings
app.use(cors({
    origin: "http://localhost:3000", // Adjust if frontend is deployed elsewhere
    methods: ["GET", "POST", "PUT", "DELETE"], // Ensure DELETE is included
    allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(morgan("dev"));

// 🔐 Secure JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key"; // Use environment variables in production

// MongoDB Connection
mongoose.connect("mongodb+srv://stina:stina2006@cluster0.rfrzosg.mongodb.net/skinCaredb?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(" MongoDB connection error: ", err));




// ====================================================
// ✅ COMMON AUTH MIDDLEWARE FOR USERS & ADMINS
// ====================================================
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: "No token provided" });
  }

  jwt.verify(token, "skinapp", (err, user) => {
    if (err) {
      console.error('Token verification error:', err); // Log the error for debugging
      return res.status(403).json({ status: "Invalid Authentication" });
    }
    if (!user._id) {
      console.error('No user ID in token:', user); // Check if user._id is missing
      return res.status(403).json({ status: "Invalid Authentication: No user ID found" });
    }

    req.user = user; // Attach the user info to the request object
    next(); // Call next to pass control to the next middleware
  });
};

module.exports = authenticateToken;

// ====================================================
// ✅ USER AUTHENTICATION
// ====================================================


// Signup API


app.post("/Signup", async (req, res) => {
    try {
      const { username, email, password, role } = req.body;

      // Check if it's an admin role and use the correct model for saving
      if (role === 'admin') {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
          return res.status(400).json({ message: 'Admin email already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newAdmin = new Admin({ username, email, password: hashedPassword, role });

        // Save the admin in the 'admins' collection
        const savedAdmin = await newAdmin.save();

        // Generate token using the saved admin data
        const token = jwt.sign({ _id: savedAdmin._id, role: savedAdmin.role }, "skinapp", { expiresIn: "1d" });

        // Respond with the token
        return res.status(201).json({ token, role: savedAdmin.role });
      }

      // For normal users, handle using userModel (if this is required as well)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = new User({ username, email, password: hashedPassword, role });

      // Save the user in the database
      const savedUser = await newUser.save();

      // Generate token using the saved user data
      const token = jwt.sign({ _id: savedUser._id, role: savedUser.role }, "skinapp", { expiresIn: "1d" });

      // Respond with the token
      return res.status(201).json({ token, role: savedUser.role });

    } catch (error) {
      console.error('Signup error:', error.message);
      res.status(500).json({ message: 'Server error during signup' });
    }
});

  
  // User Login Route
  app.post("/login", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) return res.status(400).json({ status: "Invalid Email Id" });
  
      const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(400).json({ status: "Incorrect Password" });
  
      const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET || 'skinapp', { expiresIn: "1d" });
      
      res.json({
        status: "success",
        token,
        role: user.role,
        userId: user._id,
        username: user.username,
      });
    } catch (error) {
      console.error('Error during login:', error.message);
      res.status(500).json({ status: "error", errorMessage: error.message });
    }
  });
  

  // Models


const Order = mongoose.model("Order", new mongoose.Schema({ userId: String, products: Array }));

// Middleware to Verify Admin
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
  
  
  // Admin creation route
  app.post("/create-admin", async (req, res) => {
    try {
      const { email, username, password } = req.body;
  
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ status: "Admin already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({ email, username, password: hashedPassword });
  
      // Save the new admin to the database and log the result
      await newAdmin.save()
        .then(admin => {
          console.log("Admin saved successfully:", admin);  // Log the saved admin data
          res.status(201).json({ status: "Admin created successfully", email: admin.email });
        })
        .catch(error => {
          console.error("Error saving admin:", error.message);  // Log any error during saving
          res.status(500).json({ status: "error", errorMessage: error.message });
        });
  
    } catch (error) {
      console.error('Error creating admin:', error.message);
      res.status(500).json({ status: "error", errorMessage: error.message });
    }
  });
  
  
  

// Admin Login Route
app.post("/admin-login", async (req, res) => {
  try {
    console.log('Login request received:', req.body);  // Log the incoming login request

    const { email, password } = req.body;

    const user = await Admin.findOne({ email });
    if (!user) {
      console.log('Admin not found for email:', email); // Log if no user found
      return res.status(400).json({ status: "Invalid Email Id" });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      console.log('Incorrect password for user:', email); // Log incorrect password attempts
      return res.status(400).json({ status: "Incorrect Password" });
    }

    const token = jwt.sign({ _id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      status: "success",
      token,
      role: user.role,
      userId: user._id,
      username: user.username,
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ status: "error", errorMessage: error.message });
  }
});

// Get Users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    console.log("Users Sent to Frontend:", users); // Debugging
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});


// GET all orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    console.log("Orders Sent to Frontend:", orders); // Debugging
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



// ✅ POST - Add new product
app.post("/api/products", async (req, res) => {
  try {
      const { skinType, productName, concern, productUrl, productPic, price } = req.body;

      if (!skinType || !productName || !concern || !productUrl || !productPic || !price) {
          return res.status(400).json({ message: "All fields are required!" });
      }

      const newProduct = new Product({
          skinType,
          productName,
          concern,
          productUrl,
          productPic,
          price,
      });

      await newProduct.save();
      res.status(201).json({ message: "Product added successfully!", product: newProduct });
  } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});
// ✅ GET Route to Fetch Products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    console.log("Products Sent to Frontend:", products); // Debugging
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



// Update a product
app.put("/api/products/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
      

      if (!updatedProduct) {
          return res.status(404).json({ message: "Product not found" });
      }

      res.json(updatedProduct);
  } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});



app.put("/admin/products/:id", verifyAdmin, async (req, res) => {
  try {
    const { skinType, productName, concern, productURL, imageURL, price } = req.body;

    // Construct the update object with only allowed fields
    const updateFields = {};
    if (skinType !== undefined) updateFields.skinType = skinType;
    if (productName !== undefined) updateFields.productName = productName;
    if (concern !== undefined) updateFields.concern = concern;
    if (productURL !== undefined) updateFields.productURL = productURL;
    if (imageURL !== undefined) updateFields.imageURL = imageURL;
    if (price !== undefined) updateFields.price = price;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields }, // Update only selected fields
      { new: true, runValidators: true } // Return updated product & validate input
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Delete a product
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
});



app.get("/admin/orders", async (req, res) => {
  try {
      // Fetch all orders and populate user and product details
      const orders = await Order.find()
          .populate("userId", "username email") // Get user details
          .populate("cart.productId", "name price imageURL"); // Get product details

      res.json({ status: "success", orders });
  } catch (error) {
      res.status(500).json({ error: "Error fetching orders" });
  }
});





app.post("/predict-skin", async (req, res) => {
  try {
    console.log("Received request from frontend:", req.body); // Debug log

    const response = await axios.post("http://localhost:5000/predict-skin", req.body);
    
    console.log("Response from Flask API:", response.data); // Debug log

    const recommendations = await getRecommendations(response.data);

    res.json({
      ...response.data,
      recommendedProducts: recommendations
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});


async function getRecommendations(prediction) {
  try {
    const { skinType, skinCondition } = prediction;

    console.log("Searching products for Skin Type:", skinType, "and Concern:", skinCondition);

    const recommendedProducts = await Product.find({
      $or: [
        { skinType: skinType },
        { concern: skinCondition }
      ]
    });

    console.log("Fetched Products:", recommendedProducts); // Debugging

    return recommendedProducts.length > 0 ? recommendedProducts : []; // Ensure an array is returned
  } catch (error) {
    console.error("Error fetching recommendations:", error.message);
    return []; // Return an empty array in case of an error
  }
}



// Fetch all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch products based on skin type & concern
app.get("/api/products/recommend", async (req, res) => {
  const { skinType, concern } = req.query;
  try {
    const products = await Product.find({
      skinType: { $in: [skinType] },
      concern: { $in: [concern] },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { userId, items, totalAmount } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const newOrder = new Order({ userId, items, totalAmount });
    await newOrder.save();

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


  
// ====================================================
// ✅ Default Route
// ====================================================
app.get("/", (req, res) => res.send("✅ API Running..."));

// ✅ Start Server
const PORT = process.env.PORT || 3031;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));