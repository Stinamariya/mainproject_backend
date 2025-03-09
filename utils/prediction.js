const { randomForestModel, randomForestConditionModel } = require("../models/PredictionModel");

function preprocessInput(data) {
    return {
        Age: Number(data.Age),
        Gender: data.Gender === "Male" ? 1 : 0,
        Water_Intake_Glasses: convertWaterIntake(data.Water_Intake_Glasses),
        Diet_Quality: convertDietQuality(data.Diet_Quality),
        Sleep_Hours: isNaN(Number(data.Sleep_Hours)) ? 7 : Number(data.Sleep_Hours), // Default to 7 hours if NaN
        Exercise_Frequency: convertExerciseFrequency(data.Exercise_Frequency),
        Stress_Level: convertStressLevel(data.Stress_Level),
        Sun_Exposure: convertSunExposure(data.Sun_Exposure),
        Hydration_Level: convertHydrationLevel(data.Hydration_Level),
        Acne_History: data.Acne_History === "Yes" ? 1 : 0,
        Redness: data.Redness === "Yes" ? 1 : 0,
        Sensitivity_to_Products: data.Sensitivity_to_Products === "Yes" ? 1 : 0,
        Wrinkles_Fine_Lines: data.Wrinkles_Fine_Lines === "Yes" ? 1 : 0,
        Dark_Spots: data.Dark_Spots === "Yes" ? 1 : 0
    };
}

// Mapping functions
function convertWaterIntake(value) {
    const mapping = { "0-2": 1, "3-4": 2, "4-6": 3, "7-8": 4, "9+": 5 };
    return mapping[value] || 0;
}

function convertDietQuality(value) {
    const mapping = { "Poor": 1, "Average": 2, "Good": 3, "Excellent": 4 };
    return mapping[value] || 0;
}

function convertExerciseFrequency(value) {
    const mapping = { "Never": 1, "Rarely": 2, "Sometimes": 3, "Often": 4, "Daily": 5 };
    return mapping[value] || 0;
}

function convertStressLevel(value) {
    const mapping = { "Low": 1, "Medium": 2, "High": 3 };
    return mapping[value] || 0;
}

function convertSunExposure(value) {
    const mapping = { "Low": 1, "Moderate": 2, "High": 3 };
    return mapping[value] || 0;
}

function convertHydrationLevel(value) {
    const mapping = { "Dehydrated": 1, "Normal": 2, "Well-Hydrated": 3 };
    return mapping[value] || 0;
}

async function predictSkinTypeAndCondition(data) {
    console.log("🔹 Raw Input Data:", data);
    
    const processedData = preprocessInput(data);
    console.log("✅ Processed Data for Model:", processedData);

    try {
        const inputArray = Object.values(processedData);

        // Ensure models are loaded before prediction
        if (!randomForestModel || !randomForestConditionModel) {
            throw new Error("Model is not loaded properly. Check the model path and initialization.");
        }

        const predictedSkinType = randomForestModel.predict([inputArray])[0];
        const predictedSkinCondition = randomForestConditionModel.predict([inputArray])[0];

        console.log("✅ Prediction Output:", { predictedSkinType, predictedSkinCondition });
        return { predictedSkinType, predictedSkinCondition };
    } catch (error) {
        console.error("❌ Prediction Function Error:", error);
        throw error;
    }
}

module.exports = { predictSkinTypeAndCondition };
