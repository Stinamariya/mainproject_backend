import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import os

# Load dataset
df = pd.read_csv("realistic_skin_prediction_dataset.csv")  # Ensure this file exists

# Strip whitespace from column names
df.columns = df.columns.str.strip()

# Handle missing values
df = df.dropna()

# Identify categorical columns
categorical_columns = [
    'Gender', 'Water_Intake_Glasses', 'Diet_Quality', 'Sleep_Hours', 'Exercise_Frequency',
    'Stress_Level', 'Sun_Exposure', 'Hydration_Level', 'Acne_History', 'Redness',
    'Sensitivity_to_Products', 'Wrinkles_Fine_Lines', 'Dark_Spots'
]

# Encode categorical features
label_encoders = {}
for col in categorical_columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le  # Save encoders for future use

# Define features (X) and target variables (y)
X = df.drop(columns=['Skin_Type', 'Skin_Condition'])  # Features
y_skin_type = df['Skin_Type']
y_skin_condition = df['Skin_Condition']

# Encode target variables
le_skin_type = LabelEncoder()
le_skin_condition = LabelEncoder()
y_skin_type_encoded = le_skin_type.fit_transform(y_skin_type)
y_skin_condition_encoded = le_skin_condition.fit_transform(y_skin_condition)

# Standardize numerical features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train-test split (same split for both models)
X_train, X_test, y_train_type, y_test_type, y_train_condition, y_test_condition = train_test_split(
    X_scaled, y_skin_type_encoded, y_skin_condition_encoded, test_size=0.2, random_state=42
)

# Train Random Forest models
model_skin_type = RandomForestClassifier(n_estimators=100, random_state=42)
model_skin_condition = RandomForestClassifier(n_estimators=100, random_state=42)

model_skin_type.fit(X_train, y_train_type)
model_skin_condition.fit(X_train, y_train_condition)

# Make predictions
y_pred_skin = model_skin_type.predict(X_test)
y_pred_condition = model_skin_condition.predict(X_test)

# Print evaluation metrics
print(f"✅ Skin Type Prediction Accuracy: {accuracy_score(y_test_type, y_pred_skin):.2f}")
print(f"✅ Skin Condition Prediction Accuracy: {accuracy_score(y_test_condition, y_pred_condition):.2f}")

print("\n📊 Skin Type Classification Report:\n", classification_report(y_test_type, y_pred_skin))
print("\n📊 Skin Condition Classification Report:\n", classification_report(y_test_condition, y_pred_condition))

# Confusion matrix
print("\n🔍 Skin Type Confusion Matrix:\n", confusion_matrix(y_test_type, y_pred_skin))
print("\n🔍 Skin Condition Confusion Matrix:\n", confusion_matrix(y_test_condition, y_pred_condition))

# Create 'models' directory if not exists
models_dir = "flask_api/models"
os.makedirs(models_dir, exist_ok=True)

# Save models and encoders
joblib.dump(model_skin_type, f"{models_dir}/skin_type_model.pkl")
joblib.dump(model_skin_condition, f"{models_dir}/skin_condition_model.pkl")
joblib.dump(le_skin_type, f"{models_dir}/skin_type_encoder.pkl")
joblib.dump(le_skin_condition, f"{models_dir}/skin_condition_encoder.pkl")
joblib.dump(label_encoders, f"{models_dir}/feature_encoders.pkl")
joblib.dump(scaler, f"{models_dir}/scaler.pkl")

print("✅ Models and encoders trained & saved successfully!")
