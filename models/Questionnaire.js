const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema({
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  waterIntake: { type: Number, required: true },
  dietQuality: { type: String, required: true },
  sleepHours: { type: Number, required: true },
  exerciseFrequency: { type: String, required: true },
  stressLevel: { type: String, required: true },
  sunExposure: { type: String, required: true },
  hydrationLevel: { type: String, required: true },
  acneHistory: { type: Boolean, required: true },
  redness: { type: Boolean, required: true },
  sensitivityToProducts: { type: Boolean, required: true },
  wrinklesFineLines: { type: Boolean, required: true },
  darkSpots: { type: Boolean, required: true },
});

const Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);

module.exports = Questionnaire;
