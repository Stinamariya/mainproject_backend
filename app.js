// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const fetch = require("node-fetch");
// const morgan = require("morgan");
// const { userModel } = require("./models/Users");
// const auth = require("./middleware/auth");
// const Prediction = require("./models/Prediction");
// const Product = require("./models/Product");
// const PredictionModel = require('./models/PredictionModel');
// const { predictSkinType, predictSkinCondition } = require("./utils/prediction.js");
// const { predictSkinTypeAndCondition } = require("./utils/prediction");







// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors({
//     origin: "http://localhost:3000", // Allow frontend requests
//     methods: ["GET", "POST"], // Allow specific methods
//     allowedHeaders: ["Content-Type", "Authorization"] // Allow necessary headers
//   }));
  
// app.use(morgan("dev"));


// // MongoDB Connection
// mongoose.connect("mongodb+srv://stina:stina2006@cluster0.rfrzosg.mongodb.net/skinCaredb?retryWrites=true&w=majority&appName=Cluster0")
// .then(() => console.log("MongoDB connected"))
// .catch(err => console.error(" MongoDB connection error: ", err));

// // Signup API
// app.post("/SignUp", async (req, res) => {
//     console.log(" Signup request received:", req.body);

//     const { username, email, password } = req.body;
//     if (!username || !email || !password) {
//         return res.status(400).json({ status: "error", message: "All fields are required" });
//     }

//     try {
//         const existingUser = await userModel.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ status: "error", message: "Email already exists" });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new userModel({ username, email, password: hashedPassword });
//         await newUser.save();

//         console.log("User registered:", username);
//         res.status(201).json({ status: "success", message: "User registered successfully" });
//     } catch (error) {
//         console.error(" Signup Error:", error);
//         res.status(500).json({ status: "error", message: "Server error. Please try again." });
//     }
// });

// // Login API
// app.post("/Login", async (req, res) => {
//   console.log("🔹 Login request received:", req.body);

//   const { email, password } = req.body;

//   if (!email || !password) {
//       return res.status(400).json({ status: "error", message: "All fields are required" });
//   }

//   try {
//       // Find user by email
//       const user = await userModel.findOne({ email });
//       if (!user) {
//           return res.status(401).json({ status: "error", message: "Invalid email or password" });
//       }

//       // Compare passwords
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//           return res.status(401).json({ status: "error", message: "Invalid email or password" });
//       }

//       // Generate JWT token
//       const token = jwt.sign(
//           { userId: user._id, role: user.role },
//           process.env.JWT_SECRET || "your_secret_key",
//           { expiresIn: "1h" }
//       );

//       console.log(" Login successful for:", email);
//       res.json({
//           status: "success",
//           message: "Login successful",
//           token,
//           userId: user._id,
//           role: user.role,
//           username: user.username
//       });

//   } catch (error) {
//       console.error(" Login Error:", error);
//       res.status(500).json({ status: "error", message: "Server error. Please try again." });
//   }
// });

// // Prediction API (Express) - Integrate with Flask API
// app.post("/predict", async (req, res) => {
//     try {
//         // Assuming Flask API is running on http://localhost:5000
//         const flaskApiUrl = "http://127.0.0.1:5000/predict";
//         const response = await fetch(flaskApiUrl, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(req.body) // Send data to Flask API
//         });

//         const data = await response.json();

//         if (data.error) {
//             return res.status(500).json({ error: "Failed to process prediction." });
//         }

//         // Send response from Flask API back to client
//         res.json({
//             predictedSkinType: data.skinType,
//             predictedSkinCondition: data.condition
//         });

//     } catch (error) {
//         console.error("❌ Prediction Error:", error);
//         res.status(500).json({ error: "Failed to process prediction." });
//     }
// });

// // API to get recommended products based on skin type and concern
// app.post("/recommend", async (req, res) => {
//     const { skin_type, skin_condition } = req.body;
  
//     if (!skin_type || !skin_condition) {
//       return res.status(400).json({ error: "Missing skin type or concern" });
//     }
  
//     try {
//       // Fetch products from MongoDB that match the skin type and concern
//       const recommendedProducts = await Product.find({
//         "Skin type": skin_type,
//         Concern: skin_condition,
//       });
  
//       res.json({
//         recommended_products: recommendedProducts,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "An error occurred while fetching products" });
//     }
//   });
  
//   // Routes for products
// app.get('/api/products', async (req, res) => {
//     try {
//       const products = await Product.find();
//       res.json(products);
//     } catch (err) {
//       res.status(500).send('Server error');
//     }
//   });
  
//   // Route for creating an order
//   app.post('/api/orders', async (req, res) => {
//     try {
//       const { products, userId, totalPrice } = req.body;
//       const newOrder = new Order({ products, userId, totalPrice });
//       await newOrder.save();
//       res.json(newOrder);
//     } catch (err) {
//       res.status(500).send('Server error');
//     }
//   });



  
//   // Start Server
//   const PORT = 5000;
// // Start Server
// app.listen(3031, () => console.log(" Server started"));












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

// Prediction API (Connects to Flask)
app.post("/predict", async (req, res) => {
  try {
      const flaskApiUrl = "http://127.0.0.1:5000/predict";
      const response = await fetch(flaskApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body)
      });

      const data = await response.json();
      if (data.error) return res.status(500).json({ error: data.error });

      res.json({
          predictedSkinType: data.skin_type,
          predictedSkinCondition: data.skin_condition
      });

  } catch (error) {
      console.error("Prediction Error:", error);
      res.status(500).json({ error: "Prediction failed" });
  }
});

// Recommendation API
app.post('/recommend', async (req, res) => {
const { skin_type, concern } = req.body;
try {
  const recommendedProducts = await Product.find({ skin_type, concern });
  res.json({ recommended_products: recommendedProducts });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Error fetching products" });
}
});









// Get all products
app.get("/", async (req, res) => {
  try {
      const products = await Product.find();
      res.json(products);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// Add to cart
app.post("/add", async (req, res) => {
  const { userId, productId, name, price, quantity, image } = req.body;

  try {
      let cart = await Cart.findOne({ userId });

      if (!cart) {
          cart = new Cart({ userId, products: [] });
      }

      const productIndex = cart.products.findIndex(p => p.productId === productId);

      if (productIndex > -1) {
          cart.products[productIndex].quantity += quantity;
      } else {
          cart.products.push({ productId, name, price, quantity, image });
      }

      await cart.save();
      res.json(cart);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// Get user cart
app.get("/:userId", async (req, res) => {
  try {
      const cart = await Cart.findOne({ userId: req.params.userId });
      res.json(cart);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});
// Create order
app.post("/create", async (req, res) => {
  const { userId, products, totalAmount } = req.body;

  try {
      const order = new Order({ userId, products, totalAmount });
      await order.save();
      res.json(order);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// Get user orders
app.get("/:userId", async (req, res) => {
  try {
      const orders = await Order.find({ userId: req.params.userId });
      res.json(orders);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
