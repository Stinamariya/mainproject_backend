from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load trained models and encoders
model_skin_type = joblib.load("skin_type_model.pkl")
model_skin_condition = joblib.load("skin_condition_model.pkl")
le_skin_type = joblib.load("skin_type_encoder.pkl")
le_skin_condition = joblib.load("skin_condition_encoder.pkl")
label_encoders = joblib.load("feature_encoders.pkl")

# Load Product Dataset
try:
    product_df = pd.read_csv("Skinpro_dataset.csv")  # Update filename if needed
    print("Dataset Loaded Successfully!")
    print(product_df.head())  # Debugging: Print first few rows
except Exception as e:
    print(f"Error loading dataset: {e}")

# Function to convert ranges into numerical values
def convert_range_to_number(column_name, value):
    mapping = {
        "Age": {
            "Under 18": 16,
            "18-25": 21,
            "26-35": 30,
            "36-45": 40,
            "46+": 50
        },
        "Water_Intake_Glasses": {
            "Less than 4": 3,
            "4-6": 5,
            "7-9": 8,
            "10+": 10
        },
        "Sleep_Hours": {
            "Less than 4": 3,
            "4-6": 5,
            "7-9": 8,
            "10+": 10
        }
    }
    return mapping.get(column_name, {}).get(value, value)  # Convert range or return original value

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        df = pd.DataFrame([data])

        # Convert range-based values to numerical values
        for col in ["Age", "Water_Intake_Glasses", "Sleep_Hours"]:
            if col in df:
                df[col] = df[col].apply(lambda x: convert_range_to_number(col, x))

        # Encode categorical inputs using stored label encoders
        for col in label_encoders:
            if col in df:
                known_classes = set(label_encoders[col].classes_)
                df[col] = df[col].apply(lambda x: x if x in known_classes else max(known_classes))
                df[col] = label_encoders[col].transform(df[col])

        # Make predictions
        skin_type_pred = model_skin_type.predict(df)[0]
        skin_condition_pred = model_skin_condition.predict(df)[0]

        # Convert predictions back to original labels
        skin_type_label = le_skin_type.inverse_transform([skin_type_pred])[0]
        skin_condition_label = le_skin_condition.inverse_transform([skin_condition_pred])[0]

        return jsonify({
            "predicted_skin_type": skin_type_label,
            "predicted_skin_condition": skin_condition_label
        })

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/recommend', methods=['POST'])
def recommend_products():
    # Get the data from the frontend
    data = request.get_json()
    skin_type = data.get('skin_type')
    skin_condition = data.get('skin_condition')

    if not skin_type or not skin_condition:
        return jsonify({"error": "Skin type and condition are required!"}), 400

    # Debugging: Check the received data
    print("Received Data:", data)

    # Filtering the products based on skin type and condition
    try:
        filtered_products = product_df[
            (product_df['Skin type'].str.contains(skin_type, case=False, na=False)) & 
            (product_df['Concern'].str.contains(skin_condition, case=False, na=False))
        ]

        if filtered_products.empty:
            return jsonify({"recommended_products": [], "error": "No products found matching your criteria."}), 200

        # Prepare the list of recommended products to send back
        recommended_products = filtered_products.to_dict(orient='records')
        return jsonify({"recommended_products": recommended_products}), 200

    except Exception as e:
        print("Error during filtering:", e)
        return jsonify({"error": "An error occurred while processing your request."}), 500

if __name__ == '__main__':
    app.run(debug=True)
