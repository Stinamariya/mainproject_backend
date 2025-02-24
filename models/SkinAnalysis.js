const mongoose = require("mongoose");

const SkinAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  responses: [{ question: String, answer: String }], // Store question and answer
}, { timestamps: true });

module.exports = mongoose.model("SkinAnalysis", SkinAnalysisSchema);
