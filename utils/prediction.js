function predictSkinType(Water_Intake_Glasses, Sleep_Hours, data) {
    if (Water_Intake_Glasses >= 8 && Sleep_Hours >= 7 && data.Diet_Quality === "Good") {
        return "Normal";
    } else if (Water_Intake_Glasses < 5 || data.Stress_Level === "High") {
        return "Dry";
    } else if (data.Sun_Exposure === "High" || data.Acne_History === "Yes") {
        return "Oily";
    } else {
        return "Combination"; 
    }
}


function predictSkinCondition(Water_Intake_Glasses, Sleep_Hours, data) {
    if (data.Stress_Level === "High" || data.Diet_Quality === "Poor") {
        return "Acne";
    } else if (data.Sun_Exposure === "High" || data.Sleep_Hours < 5) {
        return "Hyperpigmentation";
    } else if (Water_Intake_Glasses < 5 || data.Skin_Sensitivity === "High") {
        return "Dryness & Sensitivity";
    } else {
        return "Healthy Skin";
    }
}


module.exports = { predictSkinType, predictSkinCondition };
