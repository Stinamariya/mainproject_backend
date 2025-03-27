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

const User = require("./models/Users"); 
const Product = require("./models/product");
const Admin = require('./models/Admin');
const Questionnaire = require('./models/Questionnaire'); 
const Review = require("./models/Review"); 



const Order = require("./models/Order");

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
const JWT_SECRET = process.env.JWT_SECRET || "skinapp"; // Use environment variables in production

// MongoDB Connection
mongoose.connect("mongodb+srv://stina:stina2006@cluster0.rfrzosg.mongodb.net/skinCaredb?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// ====================================================
// ✅ COMMON AUTH MIDDLEWARE FOR USERS & ADMINS
// ====================================================
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err); // Log the error for debugging
      return res.status(403).json({ status: "Invalid Authentication" });
    }
    req.user = user;
    next();
  });
};

// ====================================================
// ✅ USER AUTHENTICATION
// ====================================================

// User Signup
app.post('/Signup', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ username, email, password: hashedPassword, role });
      await user.save();

      res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// // User Login
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       JWT_SECRET, 
//       { expiresIn: '1h' }
//     );

//     res.status(200).json({ token, userId: user._id, role: user.role });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });




// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // ✅ Now returning username in the response
    res.status(200).json({ 
      token, 
      userId: user._id, 
      username: user.username,  // ✅ Include username 
      role: user.role 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Middleware to Verify Admin
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
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
  
    await newAdmin.save()
      .then(admin => {
        res.status(201).json({ status: "Admin created successfully", email: admin.email });
      })
      .catch(error => {
        res.status(500).json({ status: "error", errorMessage: error.message });
      });
  } catch (error) {
    res.status(500).json({ status: "error", errorMessage: error.message });
  }
});

// Get Users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE User
app.delete("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Fetch Products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST - Add new product
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
      res.status(500).json({ message: "Internal Server Error" });
  }
});

// Fetch Product Recommendations
app.get("/api/products/recommend", async (req, res) => {
  const { skinType, concern } = req.query;
  try {
    const products = await Product.find({
      skinType: { $in: [skinType] },
      concern: { $in: [concern] },
    });
    console.log("Fetched Products: ", products);  // Log the fetched products
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Order
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
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Sample function to get product recommendations based on skin type and condition
async function getRecommendations(skinType, skinCondition) {
  try {
    const products = await Product.find({
      skinType: { $in: [skinType] },
      concern: { $in: [skinCondition] }, // Use skinCondition instead of concern for more precise filtering
    });
    console.log("Fetched Products for Recommendations: ", products); // Log fetched products for debugging
    return products;
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    return [];
  }
}

app.post("/predict-skin", async (req, res) => {
  try {
    const { userId, ...questionnaireData } = req.body;

    // Ensure userId is provided
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Request to Flask API for skin prediction (assuming it's running on localhost:5000)
    const response = await axios.post("http://localhost:5000/predict-skin", req.body);
    console.log("Response from Flask API:", response.data);

    // Check if the response from Flask API is valid
    if (!response.data || !response.data.skinType || !response.data.skinCondition) {
      throw new Error("Invalid data received from Flask API");
    }

    // Get product recommendations based on the skin prediction
    const recommendations = await getRecommendations(response.data.skinType, response.data.skinCondition);

    if (recommendations.length === 0) {
      return res.status(404).json({ message: "No products found for your skin type/condition" });
    }

    // Save the questionnaire data
    const newQuestionnaire = new Questionnaire({
      userId,
      skinType: response.data.skinType,
      skinCondition: response.data.skinCondition,
      ...questionnaireData,
    });

    await newQuestionnaire.save();

    res.status(200).json({
      message: "Skin prediction and recommendations successful",
      skinType: response.data.skinType,
      skinCondition: response.data.skinCondition,
      recommendedProducts: recommendations,
    });
  } catch (error) {
    console.error("Error predicting skin:", error);
    res.status(500).json({ error: error.message });
  }
});


// 📌 Place Order Route (Fix Included)
app.post("/api/place-order", async (req, res) => {
  try {
    console.log("Received Order Data:", req.body); // Debugging

    if (!req.body.userId || !req.body.products || !req.body.totalPrice) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newOrder = new Order({
      userId: req.body.userId,
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      paymentMethod: req.body.paymentMethod,
      products: req.body.products,
      totalPrice: req.body.totalPrice,
      paymentStatus: "Paid", // Default to Paid
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: "✅ Order placed successfully", order: savedOrder });
  } catch (error) {
    console.error("❌ Error saving order:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// 📌 Fetch User Orders
// app.get("/api/orders/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const orders = await Order.find({ userId }); // Fetch orders from DB

//     if (!orders || orders.length === 0) {
//       return res.status(200).json({ orders: [] }); // Return empty array instead of null
//     }

//     res.status(200).json({ orders });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });




// Fetch the latest order for a user
app.get("/api/orders/latest/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const latestOrder = await Order.findOne({ userId }).sort({ createdAt: -1 }); // Fetch the latest order

    if (!latestOrder) {
      return res.status(200).json({ order: null }); // Return null if no order is found
    }

    res.status(200).json({ order: latestOrder });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// 📌 Fetch User Orders
// Backend Route (Ensure this is correctly defined)
app.get("/api/orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }); // Fetch orders from DB for the specific user

    if (!orders || orders.length === 0) {
      return res.status(200).json({ orders: [] }); // Return empty array if no orders are found
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});





// ✅ Middleware for authentication
const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};


// ✅ GET /api/user/me - Fetch logged-in user details
app.get("/api/user/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("username email");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("User API Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});









// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};





// // ➤ **Add Review**
// app.post("/api/reviews/add", verifyToken, async (req, res) => {
//   try {
//     console.log("🔹 Received Review Data:", req.body);

//     const { productId, rating, comment } = req.body;
//     const { id: userId, username } = req.user; // Extract from token

//     if (!username) {
//       return res.status(400).json({ error: "Username is required" });
//     }

//     const newReview = new Review({ userId, username, productId, rating, comment });
//     await newReview.save();

//     res.status(201).json({
//       message: "Review added successfully",
//       reviewId: newReview._id,
//     });
//   } catch (error) {
//     console.error("Error adding review:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });








// // ➤ **Get All Reviews for a Product**
// app.get('/api/reviews/:productId', async (req, res) => {
//   try {
//     const reviews = await Review.find({ productId: req.params.productId });

//     if (!reviews.length) {
//       return res.status(404).json({ message: "No reviews found for this product" });
//     }

//     console.log("🔹 Reviews Retrieved:", reviews);

//     res.json(reviews);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });




// app.delete("/api/reviews/delete/:reviewId", verifyToken, async (req, res) => {
//   try {
//     console.log("🔹 Received delete request for:", req.params.reviewId);

//     if (!mongoose.Types.ObjectId.isValid(req.params.reviewId)) {
//       return res.status(400).json({ message: "Invalid review ID format" });
//     }

//     const review = await Review.findById(req.params.reviewId);
//     if (!review) {
//       return res.status(404).json({ message: "Review not found" });
//     }

//     if (review.userId.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Unauthorized: Cannot delete this review" });
//     }

//     await review.deleteOne();
//     res.status(200).json({ message: "Review deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting review:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });







// ➤ **Add a Review**
app.post("/api/reviews/add", verifyToken, async (req, res) => {
  try {
    console.log("🔹 Received Review Data:", req.body);
    const { productId, rating, comment } = req.body;
    const { id: userId, username } = req.user; // Extract from token

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid Product ID" });
    }

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const newReview = new Review({ userId, username, productId, rating, comment });
    await newReview.save();

    res.status(201).json({
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ➤ **Get All Reviews for a Product**
app.get("/api/reviews/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID format" });
    }

    const reviews = await Review.find({ productId });

    res.json(reviews.length ? reviews : { message: "No reviews found for this product" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ➤ **Delete a Review**
app.delete("/api/reviews/delete/:reviewId", verifyToken, async (req, res) => {
  try {
    console.log("🔹 Received delete request for:", req.params.reviewId);

    if (!mongoose.Types.ObjectId.isValid(req.params.reviewId)) {
      return res.status(400).json({ message: "Invalid review ID format" });
    }

    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: Cannot delete this review" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});








// ✅ GET Reviews by Product ID
app.get("/api/reviews", async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const reviews = await Review.find({ productId });

    if (reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for this product" });
    }

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});







app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});













// Get total counts for dashboard
app.get("/api/admin/dashboard-stats", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    res.json({ totalProducts, totalUsers, totalOrders });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});




/* ======== Manage Products ======== */
// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new product
app.post("/api/products", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json({ message: "Product added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a product
app.put("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a product
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======== Manage Users ======== */
// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a user
app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======== Manage Orders ======== */
// Get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "username email")
      .populate("products.productId", "name price");

    console.log(orders); // Log orders to inspect the populated result

    if (!orders) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

//update order status
app.put("/api/orders/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).send("Order not found");
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error });
  }
});

//delete order
app.delete("/api/orders/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).send("Order not found");
    }
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
});


// Get orders for a specific user
app.get("/api/orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    console.log("Fetched Orders:", orders); // Debugging
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});







// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});



// Order Schema
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      productName: String,
      productImage: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});



// Middleware for Authentication
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to the request
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};



// ✅ GET Orders by User ID
app.get("/api/orders/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});



app.post("/api/orders", async (req, res) => {
  try {
    console.log("Received order:", req.body);  // Debug input data

    const { userId, name, phone, address, paymentMethod, products, totalPrice } = req.body;

    // Check for missing fields
    if (!userId || !name || !phone || !address || !paymentMethod || !products || totalPrice === undefined) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Save order
    const newOrder = new Order({
      userId,
      name,
      phone,
      address,
      paymentMethod,
      products,
      totalPrice,
      paymentStatus: "Paid",
    });

    await newOrder.save();
    console.log("✅ Order saved:", newOrder);

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("❌ Order creation failed:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});















// API to fetch recommended products based on skin type and concern
app.get("/api/recommended-products", async (req, res) => {
  const { skinType, skinCondition } = req.query;

  if (!skinType || !skinCondition) {
    return res.status(400).json({ error: "Missing required parameters: skinType or skinCondition" });
  }

  try {
    const products = await Product.find({
      skinType: { $regex: new RegExp(skinType, "i") },
      concern: { $regex: new RegExp(skinCondition, "i") },
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// API: Get Product Details (including Reviews)
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




// API: Add a Review to a Product
app.post("/api/product/:id/review", async (req, res) => {
  try {
    const { user, rating, comment } = req.body;
    if (!user || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Add new review
    const newReview = { user, rating, comment, date: new Date() };
    product.reviews.push(newReview);
    await product.save();

    res.status(201).json({ message: "Review added successfully!", product });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});





// Start the server
app.listen(3031, () => {
  console.log("Server running on port 3031");
});
