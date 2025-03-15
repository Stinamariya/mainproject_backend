const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema({
  productName: String,
  productURL: String,
  productImageURL: String,
  concern: String,
  // add any other fields for your recommendations
});

const questionnaireSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Add userId field
  age: Number,
  gender: String,
  waterIntake: Number,
  dietQuality: String,
  sleepHours: Number,
  exerciseFrequency: String,
  stressLevel: String,
  sunExposure: String,
  hydrationLevel: String,
  acneHistory: Boolean,
  redness: Boolean,
  sensitivityToProducts: Boolean,
  wrinklesFineLines: Boolean,
  darkSpots: Boolean,
  prediction: {
    skinType: String,
    skinCondition: String,
  },
  recommendedProducts: [recommendationSchema], // Array of recommended products
  createdAt: { type: Date, default: Date.now },
});

const Questionnaire = mongoose.model("Questionnaire", questionnaireSchema);

module.exports = Questionnaire;
