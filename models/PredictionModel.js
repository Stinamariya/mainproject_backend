const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
    skinType: String,
    condition: String,
    recommendations: [String] 
});

const PredictionModel = mongoose.models.Prediction || mongoose.model('Prediction', PredictionSchema);

module.exports = PredictionModel;
