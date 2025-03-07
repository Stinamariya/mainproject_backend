import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder


df = pd.read_csv("realistic_skin_prediction_dataset.csv")


df = df.fillna(0)


le_skin_type = LabelEncoder()
le_skin_condition = LabelEncoder()

df["Skin_Type"] = le_skin_type.fit_transform(df["Skin_Type"])
df["Skin_Condition"] = le_skin_condition.fit_transform(df["Skin_Condition"])


X = df.drop(columns=["Skin_Type", "Skin_Condition"])  
y_skin_type = df["Skin_Type"]
y_skin_condition = df["Skin_Condition"]


X_encoded = pd.get_dummies(X)


feature_names = X_encoded.columns.tolist()


X_train, X_test, y_skin_type_train, y_skin_type_test = train_test_split(
    X_encoded, y_skin_type, test_size=0.2, random_state=42
)
X_train, X_test, y_skin_condition_train, y_skin_condition_test = train_test_split(
    X_encoded, y_skin_condition, test_size=0.2, random_state=42
)


skin_type_model = RandomForestClassifier(n_estimators=100, random_state=42)
skin_condition_model = RandomForestClassifier(n_estimators=100, random_state=42)

skin_type_model.fit(X_train, y_skin_type_train)
skin_condition_model.fit(X_train, y_skin_condition_train)


joblib.dump(skin_type_model, "skin_type_model.pkl")
joblib.dump(skin_condition_model, "skin_condition_model.pkl")
joblib.dump(le_skin_type, "le_skin_type.pkl")
joblib.dump(le_skin_condition, "le_skin_condition.pkl")
joblib.dump(feature_names, "feature_names.pkl")  

print("✅ Model training complete. Files saved!")
