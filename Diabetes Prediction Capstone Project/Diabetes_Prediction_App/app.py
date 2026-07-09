import streamlit as st
import pandas as pd
import joblib
import shap
# Load model
model = joblib.load("tuned_xgboost.pkl")

st.set_page_config(
    page_title="Type 2 Diabetes Prediction",
    page_icon="🩺",
    layout="wide"
)

st.title("🩺 Type 2 Diabetes Prediction")

st.write("Enter the patient's information below.")

st.sidebar.header("Patient Information")

# User Inputs
bmi = st.sidebar.number_input("BMI", 10.0, 60.0, 25.0)

age = st.sidebar.slider("Age", 18, 80, 40)

sex = st.sidebar.selectbox(
    "Sex",
    [1, 2],
    format_func=lambda x: "Male" if x == 1 else "Female"
)

race = st.sidebar.selectbox(
    "Race",
    [1, 2, 3, 4, 5, 6],
    format_func=lambda x: {
        1: "White",
        2: "Black",
        3: "American Indian / Alaska Native",
        4: "Asian",
        5: "Other race",
        6: "Multiracial"
    }[x]
)

general_health = st.sidebar.selectbox(
    "General Health",
    [1, 2, 3, 4, 5],
    format_func=lambda x: {
        1: "Excellent",
        2: "Very Good",
        3: "Good",
        4: "Fair",
        5: "Poor"
    }[x]
)

physical_health = st.sidebar.slider(
    "Days Physical Health Not Good",
    0,
    30,
    0
)

smoking = st.sidebar.selectbox(
    "Ever Smoked?",
    [0, 1],
    format_func=lambda x: "Yes" if x == 1 else "No"
)

physical_activity = st.sidebar.selectbox(
    "Physical Activity",
    [0, 1],
    format_func=lambda x: "Yes" if x == 1 else "No"
)

education = st.sidebar.selectbox(
    "Education",
    [1, 2, 3, 4, 5, 6],
    format_func=lambda x: {
        1: "Never Attended",
        2: "Elementary",
        3: "Some High School",
        4: "High School Graduate",
        5: "Some College",
        6: "College Graduate"
    }[x]
)

income = st.sidebar.selectbox(
    "Income",
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    format_func=lambda x: {
        1: "< $10,000",
        2: "$10k–15k",
        3: "$15k–20k",
        4: "$20k–25k",
        5: "$25k–35k",
        6: "$35k–50k",
        7: "$50k–75k",
        8: "$75k–100k",
        9: "$100k–150k",
        10: "$150k–200k",
        11: "≥ $200k"
    }[x]
)

hypertension = st.sidebar.selectbox(
    "Hypertension",
    [0, 1],
    format_func=lambda x: "Yes" if x == 1 else "No"
)

cholesterol = st.sidebar.selectbox(
    "High Cholesterol",
    [0, 1],
    format_func=lambda x: "Yes" if x == 1 else "No"
)

kidney = st.sidebar.selectbox(
    "Kidney Disease",
    [0, 1],
    format_func=lambda x: "Yes" if x == 1 else "No"
)

heart = st.sidebar.selectbox(
    "Heart Disease",
    [0, 1],
    format_func=lambda x: "Yes" if x == 1 else "No"
)
# Create input dataframe
input_df = pd.DataFrame({
    "_BMI5": [bmi],
    "_AGE80": [age],
    "SEXVAR": [sex],
    "_IMPRACE": [race],
    "GENHLTH": [general_health],
    "PHYSHLTH": [physical_health],
    "SMOKE100": [smoking],
    "_TOTINDA": [physical_activity],
    "EDUCA": [education],
    "INCOME3": [income],
    "_RFHYPE6": [hypertension],
    "_RFCHOL3": [cholesterol],
    "CHCKDNY2": [kidney],
    "_MICHD": [heart],
    "INCOME3_missing": [0],
    "_RFCHOL3_missing": [0],
    "_BMI5_missing": [0],
    "SMOKE100_missing": [0]
})
if st.button("Predict Diabetes Risk"):


    # Make prediction
    prediction = model.predict(input_df)[0]
    probability = model.predict_proba(input_df)[0][1]

    # Display prediction
    st.subheader("Prediction Result")

    if prediction == 1:
        st.error("🔴 High Risk of Type 2 Diabetes")
    else:
        st.success("🟢 Low Risk of Type 2 Diabetes")

    st.metric("Probability", f"{probability:.2%}")

    st.subheader("Factors Contributing to the Prediction")


    reasons = []

    # BMI
    if bmi >= 30:
        reasons.append(f"High BMI ({bmi:.1f}) increased the risk.")
    elif bmi < 18.5:
        reasons.append(f"Low BMI ({bmi:.1f}) reduced the risk.")

    # Age
    if age >= 60:
        reasons.append(f"Older age ({age} years) increased the risk.")
    elif age < 40:
        reasons.append(f"Younger age ({age} years) reduced the risk.")

    # General Health
    if general_health >= 4:
        reasons.append("Poor general health increased the risk.")
    elif general_health <= 2:
        reasons.append("Good general health reduced the risk.")

    # Hypertension
    if hypertension == 1:
        reasons.append("Hypertension increased the risk.")

    # High Cholesterol
    if cholesterol == 1:
        reasons.append("High cholesterol increased the risk.")

    # Physical Activity
    if physical_activity == 0:
        reasons.append("Lack of regular physical activity increased the risk.")
    else:
        reasons.append("Regular physical activity reduced the risk.")

    # Smoking
    if smoking == 1:
        reasons.append("History of smoking increased the risk.")

    # Kidney Disease
    if kidney == 1:
        reasons.append("Kidney disease increased the risk.")

    # Heart Disease
    if heart == 1:
        reasons.append("Heart disease increased the risk.")

    # Display explanations
    if reasons:
        for reason in reasons:
            st.write(f"• {reason}")
    else:
        st.write("No major risk factors were identified from the information provided.")