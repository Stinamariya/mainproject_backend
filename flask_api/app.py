import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Directory where models and encoders are stored
MODEL_DIR = "flask_api/models"
os.makedirs(MODEL_DIR, exist_ok=True)

# Load product dataset
product_dataset = [
    {"Skin type": "dry", "Product": "Hydrating Lotion", "Concern": "Dryness", "product_url": "/products/hydrating-lotion", "product_pic": "/images/hydrating-lotion.jpg"},
    {"Skin type": "oily", "Product": "Oil Control Cream", "Concern": "Oiliness", "product_url": "/products/oil-control-cream", "product_pic": "/images/oil-control-cream.jpg"},
    {"Skin type": "combination", "Product": "Combination Skin Serum", "Concern": "Combination", "product_url": "/products/combination-skin-serum", "product_pic": "/images/combination-skin-serum.jpg"},
    {"Skin type": "normal", "Product": "Moisturizing Cream", "Concern": "Normal skin", "product_url": "/products/moisturizing-cream", "product_pic": "/images/moisturizing-cream.jpg"},
    {"Skin type": "dry", "Product": "Deep Hydration Mask", "Concern": "Dryness", "product_url": "/products/deep-hydration-mask", "product_pic": "/images/deep-hydration-mask.jpg"},
    {"Skin type": "oily", "Product": "Acne Gel", "Concern": "Acne", "product_url": "/products/acne-gel", "product_pic": "/images/acne-gel.jpg"},
]

# List of feature names
feature_names = [
    "Gender", "Water_Intake_Glasses", "Diet_Quality", "Sleep_Hours", "Exercise_Frequency",
    "Stress_Level", "Sun_Exposure", "Hydration_Level", "Acne_History", "Redness",
    "Sensitivity_to_Products", "Wrinkles_Fine_Lines", "Dark_Spots"
]

# Load encoders for features
feature_encoders = joblib.load(os.path.join(MODEL_DIR, "feature_encoders.pkl")) if os.path.exists(os.path.join(MODEL_DIR, "feature_encoders.pkl")) else {}

# Load models
skin_type_model_path = os.path.join(MODEL_DIR, "skin_type_model.pkl")
skin_condition_model_path = os.path.join(MODEL_DIR, "skin_condition_model.pkl")

skin_type_model = joblib.load(skin_type_model_path) if os.path.exists(skin_type_model_path) else None
skin_condition_model = joblib.load(skin_condition_model_path) if os.path.exists(skin_condition_model_path) else None

# Load scaler
scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if not skin_type_model or not skin_condition_model:
            return jsonify({"error": "One or both models are missing. Train and save the models first!"}), 500
        
        if not scaler:
            return jsonify({"error": "Scaler is missing. Train and save the scaler first!"}), 500

        form_data = request.json
        print(f"📥 Received Data: {form_data}")

        # Feature encoding
        encoded_data = []

        # Encode Age (already numeric, no need to encode)
        encoded_data.append(int(form_data['Age']))

        # Encode categorical features
        for feature in feature_names:
            value = form_data.get(feature, None)
            if feature in feature_encoders and feature_encoders[feature]:
                encoder = feature_encoders[feature]
                if value in encoder.classes_:
                    encoded_value = encoder.transform([value])[0]
                else:
                    # Default to first class if value is not found
                    encoded_value = encoder.transform([encoder.classes_[0]])[0]
            else:
                encoded_value = 0  # Fallback for missing encoder or value
            encoded_data.append(encoded_value)

        # Convert to numpy array and scale input data
        X_input = np.array(encoded_data).reshape(1, -1)
        print(f"🔄 Transformed Input (before scaling): {X_input}")

        # Apply scaling
        X_input = scaler.transform(X_input)

        # Cast scaled values to native Python types (int or float)
        X_input = X_input.astype(float)

        # Make predictions
        skin_type_pred = skin_type_model.predict(X_input)[0]
        skin_condition_pred = skin_condition_model.predict(X_input)[0]

        # Load the label encoders for skin type and skin condition
        le_skin_type = joblib.load(os.path.join(MODEL_DIR, "skin_type_encoder.pkl"))
        le_skin_condition = joblib.load(os.path.join(MODEL_DIR, "skin_condition_encoder.pkl"))

        # Decode the predictions
        decoded_skin_type = le_skin_type.inverse_transform([skin_type_pred])[0] if le_skin_type else "Unknown"
        decoded_skin_condition = le_skin_condition.inverse_transform([skin_condition_pred])[0] if le_skin_condition else "Unknown"

        print(f"🔮 Predicted Skin Type: {decoded_skin_type}, Predicted Skin Condition: {decoded_skin_condition}")

        # Get the recommended products
        recommended_products = get_recommended_products(decoded_skin_type, decoded_skin_condition)

        # Return decoded results with recommendations
        return jsonify({
            "skin_type": decoded_skin_type,
            "skin_condition": decoded_skin_condition,
            "recommended_products": recommended_products
        })

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        form_data = request.json
        print(f"📥 Received Data for Recommendation: {form_data}")

        # Get skin type and skin condition from the request
        skin_type = form_data.get("skin_type")
        skin_condition = form_data.get("skin_condition")

        if not skin_type or not skin_condition:
            return jsonify({"error": "Missing skin type or condition for recommendation"}), 400

        # Fetch recommended products based on skin type and condition
        recommended_products = get_recommended_products(skin_type, skin_condition)

        # Return recommended products
        return jsonify({
            "recommended_products": recommended_products
        })

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Define the get_recommended_products function
def get_recommended_products(skin_type, skin_condition):
    # Filter products based on skin type and condition
    filtered_products = [product for product in product_dataset if product["Skin type"] == skin_type]
    
    return filtered_products

if __name__ == "__main__":
    app.run(debug=True)
