











from flask import Flask, request, jsonify
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)


with open("skin_multi_model.pkl", "rb") as f:
    multi_model, le_target, le_dict, feature_columns = pickle.load(f)

def preprocess_input(formData, le_dict, feature_columns):
    features = []
    
    for col in feature_columns:
        val = formData.get(col)

    
        if val is None or val == "":
            print(f"Missing value for {col}, replacing with default.")
            val = "Unknown" if col in le_dict else 0  

        if col in le_dict:  
            try:
                encoded_val = le_dict[col].transform([val])[0]
                features.append(encoded_val)
            except Exception as e:
                print(f"Error encoding {col} with value {val}: {e}")
                features.append(0)  
        else: 
            try:
                features.append(float(val))
            except Exception as e:
                print(f"Error converting {col} with value {val} to float: {e}")
                features.append(0.0)  
    
    
    input_df = pd.DataFrame([features], columns=feature_columns)
    
    return input_df

@app.route("/predict-skin", methods=["POST"])
def predict_skin():
    formData = request.json
    
    
    features = preprocess_input(formData, le_dict, feature_columns)


    prediction_encoded = multi_model.predict(features)[0]
    
    
    try:
        Skin_Type = le_target["Skin_Type"].inverse_transform([prediction_encoded[0]])[0]
        Skin_Condition = le_target["Skin_Condition"].inverse_transform([prediction_encoded[1]])[0]
    except Exception as e:
        print(f"Error decoding prediction: {e}")
        return jsonify({"error": "Prediction decoding failed"}), 500

    return jsonify({
        "skinType": Skin_Type,
        "skinCondition": Skin_Condition
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)









