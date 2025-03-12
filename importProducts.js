const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const Product = require("./models/product");

mongoose
  .connect("mongodb+srv://stina:stina2006@cluster0.rfrzosg.mongodb.net/skinCaredb?retryWrites=true&w=majority&appName=Cluster0")
  .then(async () => {
      console.log("✅ MongoDB connected");

      // Delete previous dataset entries
      await Product.deleteMany({});
      console.log("✅ Previous dataset cleared");

      importCSV();
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

async function importCSV() {
  try {
    const products = [];
    fs.createReadStream("skinproductdata.csv")
  .pipe(csv())
  .on("data", (data) => {
    products.push({
      skinType: data["Skin type"],
      productName: data["Product"],
      concern: data["Concern"],
      productUrl: data["product_url"],
      productPic: data["product_pic"],
      price: parseFloat(data["Price"].replace('$', '').trim()),  // Remove '$' and convert to number
      stock: data["Stock"] || 0,  // Ensure stock is available, if needed
      description: data["Description"] || "No description available",  // Ensure description is handled
    });
  })
  .on("end", async () => {
    try {
      await Product.insertMany(products);
      console.log(`✅ Imported ${products.length} products.`);
      mongoose.connection.close();
    } catch (err) {
      console.error("❌ Error inserting products:", err);
    }
  })
  .on("error", (err) => {
    console.error("❌ Error reading CSV:", err);
  });

  } catch (err) {
    console.error("❌ Error in importCSV:", err);
  }
}
