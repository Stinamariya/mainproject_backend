import os
import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler

# Load dataset
dataset_path = "realistic_skin_prediction_dataset.csv"
df = pd.read_csv(dataset_path)

# Print dataset columns to debug
print(f"Columns in dataset: {df.columns}")

# Define encoders directory
ENCODERS_DIR = "encoders"

# Create directory if it doesn't exist
if not os.path.exists(ENCODERS_DIR):
    os.makedirs(ENCODERS_DIR)
    print(f"📁 Created '{ENCODERS_DIR}' directory.")

# Columns that need encoding
categorical_columns = [
    "Gender", "Water_Intake_Glasses", "Diet_Quality", "Sleep_Hours",
    "Exercise_Frequency", "Stress_Level", "Sun_Exposure", "Hydration_Level",
    "Acne_History", "Redness", "Sensitivity_to_Products",
    "Wrinkles_Fine_Lines", "Dark_Spots"
]

# Save encoders for categorical columns
for col in categorical_columns:
    if col in df.columns:
        encoder = LabelEncoder()
        df[col] = encoder.fit_transform(df[col].astype(str))  # Ensure all data is string before encoding
        encoder_path = os.path.join(ENCODERS_DIR, f"{col.lower()}_encoder.pkl")
        joblib.dump(encoder, encoder_path)
        print(f"✅ Saved encoder for {col}")
    else:
        print(f"❌ Warning: Column '{col}' is missing in the dataset!")

# Scale numerical features
numerical_columns = ["Age"]
if all(col in df.columns for col in numerical_columns):
    scaler = StandardScaler()
    df[numerical_columns] = scaler.fit_transform(df[numerical_columns])
    scaler_path = os.path.join(ENCODERS_DIR, "scaler.pkl")
    joblib.dump(scaler, scaler_path)
    print("✅ Saved scaler for numerical features")
else:
    print("❌ Warning: Some numerical columns are missing in the dataset!")

print("🎉 Encoding process completed successfully!")
