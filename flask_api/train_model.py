import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib

# Load dataset
df = pd.read_csv("realistic_skin_prediction_dataset.csv")  # Update with actual filename

# Strip whitespace from column names
df.columns = df.columns.str.strip()

# Handle missing values
df = df.dropna()

# Identify categorical columns
categorical_columns = ['Gender', 'Diet_Quality', 'Exercise_Frequency', 'Stress_Level', 
                        'Sun_Exposure', 'Hydration_Level', 'Acne_History', 'Redness',
                        'Sensitivity_to_Products', 'Wrinkles_Fine_Lines', 'Dark_Spots']

# Encode categorical features using Label Encoding
label_encoders = {}
for col in categorical_columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le  # Save encoder for later use

# Define features (X) and target variables (y)
X = df.drop(columns=['Skin_Type', 'Skin_Condition'])  # Features
y_skin_type = df['Skin_Type']
y_skin_condition = df['Skin_Condition']

# Encode target variables
le_skin_type = LabelEncoder()
le_skin_condition = LabelEncoder()

y_skin_type = le_skin_type.fit_transform(y_skin_type)
y_skin_condition = le_skin_condition.fit_transform(y_skin_condition)

# Split dataset into train and test sets (80% train, 20% test)
X_train, X_test, y_train_skin, y_test_skin = train_test_split(X, y_skin_type, test_size=0.2, random_state=42)
X_train, X_test, y_train_condition, y_test_condition = train_test_split(X, y_skin_condition, test_size=0.2, random_state=42)

# Train Random Forest models for Skin Type & Skin Condition
model_skin_type = RandomForestClassifier(n_estimators=100, random_state=42)
model_skin_condition = RandomForestClassifier(n_estimators=100, random_state=42)

model_skin_type.fit(X_train, y_train_skin)
model_skin_condition.fit(X_train, y_train_condition)

# Make predictions
y_pred_skin = model_skin_type.predict(X_test)
y_pred_condition = model_skin_condition.predict(X_test)

# Print accuracy
print(f"Skin Type Prediction Accuracy: {accuracy_score(y_test_skin, y_pred_skin):.2f}")
print(f"Skin Condition Prediction Accuracy: {accuracy_score(y_test_condition, y_pred_condition):.2f}")

# Save models and encoders
joblib.dump(model_skin_type, "skin_type_model.pkl")
joblib.dump(model_skin_condition, "skin_condition_model.pkl")
joblib.dump(le_skin_type, "skin_type_encoder.pkl")
joblib.dump(le_skin_condition, "skin_condition_encoder.pkl")
joblib.dump(label_encoders, "feature_encoders.pkl")

print("Models trained and saved successfully!")
