const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({
  userId: String,
  skinType: String,
  skinCondition: String,
});

module.exports = mongoose.model("Prediction", PredictionSchema);
