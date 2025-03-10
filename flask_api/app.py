# import os
# import joblib
# import numpy as np
# from flask import Flask, request, jsonify
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# # Directory where models and encoders are stored
# MODEL_DIR = "flask_api/models"
# os.makedirs(MODEL_DIR, exist_ok=True)

# # Load product dataset
# product_dataset = [
#     {"Skin type": "dry", "Product": "Hydrating Lotion", "Concern": "Dryness", "product_url": "/products/hydrating-lotion", "product_pic": "/images/hydrating-lotion.jpg"},
#     {"Skin type": "oily", "Product": "Oil Control Cream", "Concern": "Oiliness", "product_url": "/products/oil-control-cream", "product_pic": "/images/oil-control-cream.jpg"},
#     {"Skin type": "combination", "Product": "Combination Skin Serum", "Concern": "Combination", "product_url": "/products/combination-skin-serum", "product_pic": "/images/combination-skin-serum.jpg"},
#     {"Skin type": "normal", "Product": "Moisturizing Cream", "Concern": "Normal skin", "product_url": "/products/moisturizing-cream", "product_pic": "/images/moisturizing-cream.jpg"},
#     {"Skin type": "dry", "Product": "Deep Hydration Mask", "Concern": "Dryness", "product_url": "/products/deep-hydration-mask", "product_pic": "/images/deep-hydration-mask.jpg"},
#     {"Skin type": "oily", "Product": "Acne Gel", "Concern": "Acne", "product_url": "/products/acne-gel", "product_pic": "/images/acne-gel.jpg"},
# ]

# # List of feature names
# feature_names = [
#     "Gender", "Water_Intake_Glasses", "Diet_Quality", "Sleep_Hours", "Exercise_Frequency",
#     "Stress_Level", "Sun_Exposure", "Hydration_Level", "Acne_History", "Redness",
#     "Sensitivity_to_Products", "Wrinkles_Fine_Lines", "Dark_Spots"
# ]

# # Load encoders for features
# feature_encoders = joblib.load(os.path.join(MODEL_DIR, "feature_encoders.pkl")) if os.path.exists(os.path.join(MODEL_DIR, "feature_encoders.pkl")) else {}

# # Load models
# skin_type_model_path = os.path.join(MODEL_DIR, "skin_type_model.pkl")
# skin_condition_model_path = os.path.join(MODEL_DIR, "skin_condition_model.pkl")

# skin_type_model = joblib.load(skin_type_model_path) if os.path.exists(skin_type_model_path) else None
# skin_condition_model = joblib.load(skin_condition_model_path) if os.path.exists(skin_condition_model_path) else None

# # Load scaler
# scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
# scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None

# @app.route("/predict", methods=["POST"])
# def predict():
#     try:
#         if not skin_type_model or not skin_condition_model:
#             return jsonify({"error": "One or both models are missing. Train and save the models first!"}), 500
        
#         if not scaler:
#             return jsonify({"error": "Scaler is missing. Train and save the scaler first!"}), 500

#         form_data = request.json
#         print(f"📥 Received Data: {form_data}")

#         # Feature encoding
#         encoded_data = []

#         # Encode Age (already numeric, no need to encode)
#         encoded_data.append(int(form_data['Age']))

#         # Encode categorical features
#         for feature in feature_names:
#             value = form_data.get(feature, None)
#             if feature in feature_encoders and feature_encoders[feature]:
#                 encoder = feature_encoders[feature]
#                 if value in encoder.classes_:
#                     encoded_value = encoder.transform([value])[0]
#                 else:
#                     # Default to first class if value is not found
#                     encoded_value = encoder.transform([encoder.classes_[0]])[0]
#             else:
#                 encoded_value = 0  # Fallback for missing encoder or value
#             encoded_data.append(encoded_value)

#         # Convert to numpy array and scale input data
#         X_input = np.array(encoded_data).reshape(1, -1)
#         print(f"🔄 Transformed Input (before scaling): {X_input}")

#         # Apply scaling
#         X_input = scaler.transform(X_input)

#         # Cast scaled values to native Python types (int or float)
#         X_input = X_input.astype(float)

#         # Make predictions
#         skin_type_pred = skin_type_model.predict(X_input)[0]
#         skin_condition_pred = skin_condition_model.predict(X_input)[0]

#         # Load the label encoders for skin type and skin condition
#         le_skin_type = joblib.load(os.path.join(MODEL_DIR, "skin_type_encoder.pkl"))
#         le_skin_condition = joblib.load(os.path.join(MODEL_DIR, "skin_condition_encoder.pkl"))

#         # Decode the predictions
#         decoded_skin_type = le_skin_type.inverse_transform([skin_type_pred])[0] if le_skin_type else "Unknown"
#         decoded_skin_condition = le_skin_condition.inverse_transform([skin_condition_pred])[0] if le_skin_condition else "Unknown"

#         print(f"🔮 Predicted Skin Type: {decoded_skin_type}, Predicted Skin Condition: {decoded_skin_condition}")

#         # Get the recommended products
#         recommended_products = get_recommended_products(decoded_skin_type, decoded_skin_condition)

#         # Return decoded results with recommendations
#         return jsonify({
#             "skin_type": decoded_skin_type,
#             "skin_condition": decoded_skin_condition,
#             "recommended_products": recommended_products
#         })

#     except Exception as e:
#         print(f"❌ Error: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# @app.route("/recommend", methods=["POST"])
# def recommend():
#     try:
#         form_data = request.json
#         print(f"📥 Received Data for Recommendation: {form_data}")

#         # Get skin type and skin condition from the request
#         skin_type = form_data.get("skin_type")
#         skin_condition = form_data.get("skin_condition")

#         if not skin_type or not skin_condition:
#             return jsonify({"error": "Missing skin type or condition for recommendation"}), 400

#         # Fetch recommended products based on skin type and condition
#         recommended_products = get_recommended_products(skin_type, skin_condition)

#         # Return recommended products
#         return jsonify({
#             "recommended_products": recommended_products
#         })

#     except Exception as e:
#         print(f"❌ Error: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# # Define the get_recommended_products function
# def get_recommended_products(skin_type, skin_condition):
#     # Filter products based on skin type and condition
#     filtered_products = [product for product in product_dataset if product["Skin type"] == skin_type]
    
#     return filtered_products

# if __name__ == "__main__":
#     app.run(debug=True)












# import os
# import joblib
# import numpy as np
# import pandas as pd
# from flask import Flask, request, jsonify
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


# # Define the correct path to the models folder
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# MODEL_DIR = os.path.join(BASE_DIR, "flask_api", "models")
# # Directory where models and encoders are stored
# os.makedirs(MODEL_DIR, exist_ok=True)

# # Load product dataset from CSV
# def load_product_dataset():
#     try:
#         df = pd.read_csv("skinproduct.csv")
#         # Convert DataFrame to a list of dictionaries
#         return df.to_dict(orient="records")
#     except Exception as e:
#         print(f"Error loading dataset: {e}")
#         return []

# # Load dataset at the start
# product_dataset = load_product_dataset()

# # List of feature names
# feature_names = [
#     "Gender", "Water_Intake_Glasses", "Diet_Quality", "Sleep_Hours", "Exercise_Frequency",
#     "Stress_Level", "Sun_Exposure", "Hydration_Level", "Acne_History", "Redness",
#     "Sensitivity_to_Products", "Wrinkles_Fine_Lines", "Dark_Spots"
# ]

# # Load encoders for features from the 'encoders' directory
# gender_encoder = joblib.load(os.path.join(MODEL_DIR, "gender_encoder.pkl"))
# # Repeat for other encoders as needed
# # Example for encoding other features
# # age_encoder = joblib.load(os.path.join(MODEL_DIR, "age_encoder.pkl"))
# # ... similarly load other feature encoders here

# # Load models
# skin_type_model_path = os.path.join(MODEL_DIR, "skin_type_model.pkl")
# skin_condition_model_path = os.path.join(MODEL_DIR, "skin_condition_model.pkl")

# skin_type_model = joblib.load(skin_type_model_path) if os.path.exists(skin_type_model_path) else None
# skin_condition_model = joblib.load(skin_condition_model_path) if os.path.exists(skin_condition_model_path) else None

# # Load scaler
# scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
# scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None

# @app.route("/predict", methods=["POST"])
# def predict():
#     try:
#         if not skin_type_model or not skin_condition_model:
#             return jsonify({"error": "One or both models are missing. Train and save the models first!"}), 500
        
#         if not scaler:
#             return jsonify({"error": "Scaler is missing. Train and save the scaler first!"}), 500

#         form_data = request.json
#         print(f"📥 Received Data: {form_data}")

#         # Feature encoding
#         encoded_data = []

#         # Encode Age (already numeric, no need to encode)
#         encoded_data.append(int(form_data['Age']))

#         # Encode categorical features
#         for feature in feature_names:
#             value = form_data.get(feature, None)
#             if feature == "Gender" and gender_encoder:
#                 encoded_value = gender_encoder.transform([value])[0] if value in gender_encoder.classes_ else gender_encoder.transform([gender_encoder.classes_[0]])[0]
#             else:
#                 encoded_value = 0  # Fallback for missing encoder or value
#             encoded_data.append(encoded_value)

#         # Convert to numpy array and scale input data
#         X_input = np.array(encoded_data).reshape(1, -1)
#         print(f"🔄 Transformed Input (before scaling): {X_input}")

#         # Apply scaling
#         X_input = scaler.transform(X_input)

#         # Cast scaled values to native Python types (int or float)
#         X_input = X_input.astype(float)

#         # Make predictions
#         skin_type_pred = skin_type_model.predict(X_input)[0]
#         skin_condition_pred = skin_condition_model.predict(X_input)[0]

#         # Load the label encoders for skin type and skin condition
#         le_skin_type = joblib.load(os.path.join(MODEL_DIR, "skin_type_encoder.pkl"))
#         le_skin_condition = joblib.load(os.path.join(MODEL_DIR, "skin_condition_encoder.pkl"))

#         # Decode the predictions
#         decoded_skin_type = le_skin_type.inverse_transform([skin_type_pred])[0] if le_skin_type else "Unknown"
#         decoded_skin_condition = le_skin_condition.inverse_transform([skin_condition_pred])[0] if le_skin_condition else "Unknown"

#         print(f"🔮 Predicted Skin Type: {decoded_skin_type}, Predicted Skin Condition: {decoded_skin_condition}")

#         # Get the recommended products
#         recommended_products = get_recommended_products(decoded_skin_type, decoded_skin_condition)

#         # Return decoded results with recommendations
#         return jsonify({
#             "skin_type": decoded_skin_type,
#             "skin_condition": decoded_skin_condition,
#             "recommended_products": recommended_products
#         })

#     except Exception as e:
#         print(f"❌ Error: {str(e)}")
#         return jsonify({"error": str(e)}), 500



# # Function to get recommended products based on skin type and condition
# def get_recommended_products(skin_type, skin_condition):
#     # Ensure product dataset is loaded
#     global product_dataset  # Make sure we use the loaded dataset

#     # Filter products based on skin type and concern (condition)
#     recommended_products = [
#         product for product in product_dataset
#         if product["Skin type"].lower() == skin_type.lower() and product["Concern"].lower() == skin_condition.lower()
#     ]

#     return recommended_products  # Return the filtered list

    

# @app.route('/recommend', methods=['POST'])
# def recommend_products():
#     data = request.get_json()
#     skin_type = data.get('skin_type')
#     skin_condition = data.get('skin_condition')

#     # Dummy data for the example
#     recommended_products = [
#         {
#             "product": "Saslic Foaming Face Wash",
#             "product_pic": "https://dermatics.in/cdn/shop/files/saslic-foam-face-wash.jpg?v=1701779458&width=823",
#             "product_url": "https://dermatics.in/products/cipla-saslic-foaming-face-wash-60-ml?variant=40862564909218&currency=INR&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic&gad_source=1",
#             "skin_condition": "Acne",
#             "skin_type": "Oily",
#             "concern": "Whitehead/Blackhead"
#         }
#     ]
    
#     return jsonify({"recommended_products": recommended_products})

# if __name__ == "__main__":
#     app.run(debug=True)





def load_product_dataset():
    try:
        df = pd.read_csv("skinproduct.csv")
        return df.to_dict(orient="records")
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return []

# Load product dataset
product_dataset = load_product_dataset()

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if not skin_type_model or not skin_condition_model or not scaler:
            return jsonify({"error": "Model or scaler missing. Train and save them first!"}), 500

        form_data = request.json
        feature_names = [
            "Age", "Gender", "Water_Intake_Glasses", "Diet_Quality", "Sleep_Hours", "Exercise_Frequency",
            "Stress_Level", "Sun_Exposure", "Hydration_Level", "Acne_History", "Redness",
            "Sensitivity_to_Products", "Wrinkles_Fine_Lines", "Dark_Spots"
        ]

        encoded_data = [int(form_data['Age'])]  # Age is numeric, no encoding needed
        
        for feature in feature_names[1:]:  # Encode categorical features
            value = form_data.get(feature, None)
            encoded_data.append(0 if value is None else value)  # Placeholder for categorical encoding
        
        X_input = np.array(encoded_data).reshape(1, -1)
        X_input = scaler.transform(X_input).astype(float)

        skin_type_pred = skin_type_model.predict(X_input)[0]
        skin_condition_pred = skin_condition_model.predict(X_input)[0]

        decoded_skin_type = le_skin_type.inverse_transform([skin_type_pred])[0]
        decoded_skin_condition = le_skin_condition.inverse_transform([skin_condition_pred])[0]

        recommended_products = get_recommended_products(decoded_skin_type, decoded_skin_condition)

        return jsonify({
            "skin_type": decoded_skin_type,
            "skin_condition": decoded_skin_condition,
            "recommended_products": recommended_products
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


def get_recommended_products(skin_type, skin_condition):
    return [
        product for product in product_dataset
        if product["Skin type"].lower() == skin_type.lower() and product["Concern"].lower() == skin_condition.lower()
    ]

if __name__ == "__main__":
    app.run(debug=True)

