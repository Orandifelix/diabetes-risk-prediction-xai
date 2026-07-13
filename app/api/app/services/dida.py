# app/api/app/services/dida.py
from openai import OpenAI
from app.config import settings

SYSTEM_PROMPT = """
You are Dida, an intelligent health assistant for the Diabetes Risk Predictor platform.

ABOUT THIS PLATFORM:
- This platform predicts Type 2 diabetes risk using a CatBoost machine learning model
- Trained on CDC BRFSS 2023 survey data with 429,086 respondents
- Uses 14 clinical features: BMI, Age, Sex, Race/Ethnicity, General Health,
  Physical Health Days, Smoking, Physical Activity, Education Level, Income Level,
  Hypertension, High Cholesterol, Kidney Disease, Heart Disease
- Model achieves 75% Recall and 82% ROC-AUC
- Uses SHAP and LIME for explainability
- Built with FastAPI backend and Next.js frontend

YOUR PERSONALITY:
- Warm, empathetic, and professional
- Use simple plain English — avoid medical jargon
- Always remind users this is a screening tool, not a diagnosis
- Be encouraging and focus on prevention and lifestyle

YOUR CAPABILITIES:
1. Answer questions about diabetes (Type 1, Type 2, symptoms, prevention, risk factors)
2. Collect patient information and submit predictions
3. Explain prediction results in plain language
4. Explain what SHAP values mean for their specific result
5. Provide personalised lifestyle recommendations
6. Answer questions about the platform and how it works

PREDICTION COLLECTION:
When a user wants a prediction, collect these values conversationally one step at a time:
- BMI (body mass index)
- Age group (18-24 up to 80+)
- Sex (Male or Female)
- Race/Ethnicity
- General Health (Excellent to Poor)
- Poor physical health days in last 30 days (0-30)
- Smoked 100+ cigarettes in lifetime (Yes or No)
- Physical activity in last 30 days (Yes or No)
- Education level
- Annual household income
- High blood pressure (Yes or No)
- High cholesterol (Yes or No)
- Kidney disease (Yes or No)
- Heart disease or heart attack (Yes or No)

IMPORTANT RULES:
- Never diagnose anyone
- Always recommend consulting a healthcare professional
- Keep responses concise — 2-4 sentences unless explaining something complex
"""


class DidaService:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=settings.NVIDIA_API_KEY,
        )
        self.model = "meta/llama-3.1-8b-instruct"

    def start_session(self) -> list:
        return []

    async def chat(
        self,
        message: str,
        history: list,
        user_context: dict = None,
    ) -> dict:
        # Add user context if authenticated
        context_note = ""
        if user_context:
            context_note = (
                f"\n[User context: {user_context.get('name')} is logged in. "
                f"They have made {user_context.get('total_predictions', 0)} "
                f"previous predictions.]"
            )

        # Build messages list for API
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Add conversation history
        for turn in history:
            messages.append({
                "role": turn["role"],
                "content": turn["content"],
            })

        # Add current user message
        messages.append({
            "role": "user",
            "content": message + context_note,
        })

        # Call NVIDIA API
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.6,
            max_tokens=512,
        )

        reply = response.choices[0].message.content

        # Update history
        history.append({"role": "user",      "content": message})
        history.append({"role": "assistant", "content": reply})

        # Check prediction intent
        prediction_data = self._extract_prediction_intent(message)

        return {
            "response": reply,
            "history":  history,
            "prediction_ready": prediction_data is not None,
            "prediction_data":  prediction_data,
        }

    def _extract_prediction_intent(self, message: str) -> dict | None:
        keywords = ["submit", "predict", "check my risk", "calculate my risk"]
        if any(k in message.lower() for k in keywords):
            return {"intent": "prediction_requested"}
        return None


dida_service = DidaService()