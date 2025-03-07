from flask import Flask, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)


skin_type_model = joblib.load("skin_type_model.pkl")
skin_condition_model = joblib.load("skin_condition_model.pkl")
feature_names = joblib.load("feature_names.pkl")
le_skin_type = joblib.load("le_skin_type.pkl")
le_skin_condition = joblib.load("le_skin_condition.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        user_input = pd.DataFrame([data])

        print("\n🔹 Received Input Data:\n", user_input, "\n")  

        
        user_input["Water_Intake_Glasses"] = pd.to_numeric(user_input["Water_Intake_Glasses"], errors="coerce")

        
        user_input_encoded = pd.get_dummies(user_input)

        
        for col in feature_names:
            if col not in user_input_encoded:
                user_input_encoded[col] = 0  

        
        user_input_encoded = user_input_encoded[feature_names]

        print("✅ Final Processed Input for Model:\n", user_input_encoded, "\n")  

        
        predicted_skin_type_index = skin_type_model.predict(user_input_encoded)[0]
        predicted_skin_type = le_skin_type.inverse_transform([predicted_skin_type_index])[0]

        
        predicted_skin_condition_index = skin_condition_model.predict(user_input_encoded)[0]
        predicted_skin_condition = le_skin_condition.inverse_transform([predicted_skin_condition_index])[0]

        print(f"🔹 Predicted Skin Type: {predicted_skin_type}")
        print(f"🔹 Predicted Skin Condition: {predicted_skin_condition}\n")

        return jsonify({
            "predictedSkinType": predicted_skin_type,
            "predictedSkinCondition": predicted_skin_condition
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(port=5001, debug=True)
