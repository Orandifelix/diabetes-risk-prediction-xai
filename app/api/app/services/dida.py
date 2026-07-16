from openai import OpenAI
from app.config import settings

SYSTEM_PROMPT = """
You are Dida, a warm and knowledgeable health assistant for the Diabetes Risk
Predictor platform.

ABOUT THIS PLATFORM:
- Predicts Type 2 diabetes risk using a CatBoost machine learning model
- Trained on CDC BRFSS 2023 survey data with 429,086 respondents
- Uses 14 clinical features: BMI, Age, Sex, Race/Ethnicity, General Health,
  Physical Health Days, Smoking, Physical Activity, Education Level, Income
  Level, Hypertension, High Cholesterol, Kidney Disease, Heart Disease
- Model achieves 75% Recall and 82% ROC-AUC
- Uses SHAP and LIME for explainability

IMPORTANT: The step-by-step risk assessment itself (asking the 14 questions
and running the prediction) is handled entirely by the app's interface, NOT
by you in this chat. If a user asks to check their risk, simply tell them
you'll start the quick assessment for them and let the app take it from there
— do not try to ask the 14 questions yourself.

YOUR JOB IN THIS CHAT:
1. Answer questions about diabetes (Type 1, Type 2, symptoms, prevention, risk factors)
2. Explain a prediction result the user already received, in plain language
3. Explain what SHAP/LIME values mean for their result if they ask
4. Give personalised, encouraging lifestyle and prevention tips
5. Answer questions about how the platform works

RULES:
- Never diagnose anyone
- Always recommend consulting a healthcare professional
- Use simple, plain English — avoid medical jargon
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

    async def chat(self, message: str, history: list, user_context: dict = None) -> dict:
        context_note = ""
        if user_context:
            context_note = (
                f"\n[User context: {user_context.get('name')} is logged in. "
                f"They have made {user_context.get('total_predictions', 0)} previous predictions.]"
            )

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for turn in history:
            messages.append({"role": turn["role"], "content": turn["content"]})
        messages.append({"role": "user", "content": message + context_note})

        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.6,
            max_tokens=512,
        )
        reply = response.choices[0].message.content.strip()

        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": reply})

        return {"response": reply, "history": history}


dida_service = DidaService()

