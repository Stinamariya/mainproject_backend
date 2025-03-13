import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import pickle

def train_model():

    df = pd.read_csv("realistic_skin_prediction_dataset.csv")
    
    
    
    target_columns = ["Skin_Type", "Skin_Condition"]
    feature_columns = [col for col in df.columns if col not in target_columns]
    
    
    le_dict = {}
    for col in feature_columns:
        if df[col].dtype == object:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            le_dict[col] = le
            
    
    le_target = {}
    for col in target_columns:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        le_target[col] = le

    
    X = df[feature_columns]
    y = df[target_columns]
    

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    
    base_model = RandomForestClassifier(n_estimators=100, random_state=42)
    multi_model = MultiOutputClassifier(base_model)
    multi_model.fit(X_train, y_train)
    
    
    predictions = multi_model.predict(X_test)
    for idx, col in enumerate(target_columns):
        print(f"Classification report for {col}:")
        print(classification_report(y_test[col], predictions[:, idx]))
    
    
    with open("skin_multi_model.pkl", "wb") as f:
        pickle.dump((multi_model, le_target, le_dict, feature_columns), f)
    
    print("Multi-output model trained and saved as skin_multi_model.pkl")
    return multi_model, le_target, le_dict, feature_columns

def load_model():
    try:
        with open("skin_multi_model.pkl", "rb") as f:
            multi_model, le_target, le_dict, feature_columns = pickle.load(f)
        return multi_model, le_target, le_dict, feature_columns
    except FileNotFoundError:
        print("Trained model not found. Training a new one...")
        return train_model()

def preprocess_input(formData, le_dict, feature_columns):
    """
    Convert the incoming formData (a dictionary) into a feature vector.
    The formData should contain keys matching the feature_columns.
    Categorical features are encoded using the provided label encoders.
    """
    features = []
    for col in feature_columns:
        val = formData.get(col)
        
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
    return np.array([features])  

def predict(formData):
    """
    Predicts both skin type and skin condition from formData.
    Returns a dictionary with keys 'skinType' and 'skinCondition'.
    """
    multi_model, le_target, le_dict, feature_columns = load_model()
    features = preprocess_input(formData, le_dict, feature_columns)
    prediction_encoded = multi_model.predict(features)[0]
    
    
    Skin_Type = le_target["Skin_Type"].inverse_transform([prediction_encoded[0]])[0]
    Skin_Condition = le_target["Skin_Condition"].inverse_transform([prediction_encoded[1]])[0]
    
    return {"skinType": Skin_Type, "skinCondition": Skin_Condition}

if __name__ == "__main__":
   
    train_model()
    
    
    sampleData = {
    "Age": "30",
    "Gender": "Female",
    "Water_Intake_Glasses": "4",
    "Diet_Quality": "Healthy",
    "Sleep_Hours": "6",
    "Exercise_Frequency": "Regularly",
    "Stress_Level": "Medium",
    "Sun_Exposure": "High",
    "Hydration_Level": "Medium",
    "Acne_History": "Yes",
    "Redness": "No",
    "Sensitivity_to_Products": "Yes",
    "Wrinkles_Fine_Lines": "No",
    "Dark_Spots": "Yes"
}

    
    result = predict(sampleData)
    print("Prediction result:", result)
