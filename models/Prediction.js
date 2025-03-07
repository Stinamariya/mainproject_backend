const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    skinType: String,
    skinCondition: String,
});

module.exports = mongoose.models.Prediction || mongoose.model("Prediction", predictionSchema);
