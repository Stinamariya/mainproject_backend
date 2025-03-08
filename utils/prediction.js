const { RandomForestClassifier } = require("ml-random-forest");

// ✅ Check: Ensure training data is not empty
const trainingData = [
  { age: 25, gender: "Female", waterIntakeGlasses: "5", skinType: "Oily", skinCondition: "Acne-Prone" },
  { age: 30, gender: "Male", waterIntakeGlasses: "7", skinType: "Dry", skinCondition: "Sensitive" },
  { age: 22, gender: "Female", waterIntakeGlasses: "6", skinType: "Combination", skinCondition: "Normal" }
];

// ✅ Check: Convert data properly
const X_train = trainingData.map(d => [
  d.age,
  d.gender === "Male" ? 1 : 0,
  parseInt(d.waterIntakeGlasses)
]);

const y_train_skinType = trainingData.map(d => d.skinType);
const y_train_skinCondition = trainingData.map(d => d.skinCondition);

if (X_train.length === 0 || y_train_skinType.length === 0 || y_train_skinCondition.length === 0) {
  throw new Error("Training data is empty! Check training dataset.");
}

const model_skinType = new RandomForestClassifier();
const model_skinCondition = new RandomForestClassifier();

// ✅ Check: Ensure correct training data format before training
try {
  model_skinType.train(X_train, y_train_skinType);
  model_skinCondition.train(X_train, y_train_skinCondition);
} catch (error) {
  console.error("Error training model:", error);
}

function predictSkinTypeAndCondition(data) {
  const inputFeatures = [data.age, data.gender === "Male" ? 1 : 0, parseInt(data.waterIntakeGlasses)];

  if (X_train.length === 0) {
    throw new Error("Model training failed due to missing training data.");
  }

  const predictedSkinType = model_skinType.predict([inputFeatures])[0];
  const predictedSkinCondition = model_skinCondition.predict([inputFeatures])[0];

  return {
    skinType: predictedSkinType,
    skinCondition: predictedSkinCondition,
  };
}

module.exports = { predictSkinTypeAndCondition };
