from typing import Dict, Any


# Feature-driven recommendations
# Based on top SHAP contributor + raw feature value
# Incorporates health equity awareness (income, education)

RECOMMENDATIONS = {
    "_BMI5": {
        "high": "Your BMI is a key risk factor. Consider consulting a nutritionist for a personalised weight management plan.",
        "default": "Maintaining a healthy BMI significantly reduces diabetes risk.",
    },
    "_AGE80": {
        "high": "Age increases diabetes risk. Regular screening every 1–2 years is strongly recommended.",
        "default": "Annual health checks become more important as you age.",
    },
    "GENHLTH": {
        "high": "Your general health status is contributing to your risk. A full health assessment with your doctor is advised.",
        "default": "Improving general health reduces diabetes risk significantly.",
    },
    "PHYSHLTH": {
        "high": "Frequent poor physical health days are linked to elevated diabetes risk. Speak to your doctor about underlying conditions.",
        "default": "Addressing recurring health issues early can prevent complications.",
    },
    "SMOKE100": {
        "high": "Smoking increases diabetes risk. Resources are available to help you quit — ask your healthcare provider.",
        "default": "Quitting smoking improves overall metabolic health.",
    },
    "_TOTINDA": {
        "high": "Physical inactivity is a major modifiable risk factor. Aim for 30 minutes of moderate activity at least 5 days a week.",
        "default": "Regular physical activity is one of the most effective ways to reduce diabetes risk.",
    },
    "_RFHYPE6": {
        "high": "Hypertension is closely linked to diabetes. Monitor your blood pressure regularly and follow your doctor's guidance.",
        "default": "Managing blood pressure is an important part of diabetes prevention.",
    },
    "_RFCHOL3": {
        "high": "High cholesterol and diabetes share metabolic pathways. A lipid panel test and dietary review are recommended.",
        "default": "Reducing cholesterol through diet and exercise lowers diabetes risk.",
    },
    "CHCKDNY2": {
        "high": "Kidney disease and diabetes are strongly associated. Regular kidney function tests are essential.",
        "default": "Protecting kidney health is a priority in diabetes prevention.",
    },
    "_MICHD": {
        "high": "Heart disease shares major risk factors with diabetes. A cardiovascular review with your doctor is important.",
        "default": "Heart-healthy habits directly reduce diabetes risk.",
    },
    "INCOME3": {
        "high": "Financial barriers to healthcare are real. Ask your provider about free or subsidised screening programmes in your area.",
        "default": "Free community health screenings are available in many areas.",
    },
    "EDUCA": {
        "high": "Community health programmes offer free diabetes education and screening. Ask your local clinic for referrals.",
        "default": "Diabetes education programmes are widely available and free.",
    },
    "_IMPRACE": {
        "high": "Some ethnic groups have higher genetic predisposition to diabetes. Earlier and more frequent screening is recommended.",
        "default": "Understanding your genetic risk helps with early intervention.",
    },
    "SEXVAR": {
        "default": "Diabetes affects both sexes differently. Discuss sex-specific risk factors with your healthcare provider.",
    },
}

GENERAL_HIGH_RISK = (
    "Your risk score is high. We strongly recommend scheduling an appointment "
    "with a healthcare professional for a fasting blood glucose test or HbA1c test. "
    "Early intervention can prevent or significantly delay Type 2 diabetes."
)

GENERAL_MODERATE_RISK = (
    "Your risk is moderate. Lifestyle changes — improved diet, regular physical activity, "
    "and routine screening — can substantially reduce this risk. Consider speaking to your doctor."
)

GENERAL_LOW_RISK = (
    "Your current risk is low. Maintaining a healthy lifestyle and getting regular "
    "health checks will help keep it that way."
)

DISCLAIMER = (
    "This is a risk estimate based on population-level data, not a clinical diagnosis. "
    "Always consult a qualified healthcare professional for medical advice."
)


def get_recommendation(top_feature: str, probability: float, features: Dict[str, Any]) -> str:
    """
    Returns a personalised recommendation based on:
    - Top SHAP-contributing feature
    - Risk level from probability
    - Feature value (high vs default message)
    """
    feature_rec = RECOMMENDATIONS.get(top_feature, {})

    # Determine if value is 'high concern'
    high_concern = False
    value = features.get(top_feature)
    if top_feature == "_BMI5" and value and float(value) > 30:
        high_concern = True
    elif top_feature == "_TOTINDA" and value == 2:
        high_concern = True
    elif top_feature == "SMOKE100" and value == 1:
        high_concern = True
    elif top_feature in ["_RFHYPE6", "_RFCHOL3"] and value == 2:
        high_concern = True
    elif top_feature in ["CHCKDNY2", "_MICHD"] and value in [1, 2]:
        high_concern = True
    elif top_feature == "GENHLTH" and value and int(value) >= 4:
        high_concern = True
    elif top_feature == "INCOME3" and value and int(value) <= 3:
        high_concern = True

    specific = feature_rec.get("high" if high_concern else "default", "")

    if probability >= 0.70:
        return f"{GENERAL_HIGH_RISK} {specific}".strip()
    elif probability >= 0.40:
        return f"{GENERAL_MODERATE_RISK} {specific}".strip()
    else:
        return f"{GENERAL_LOW_RISK} {specific}".strip()
