import {
    AGE_OPTIONS, SEX_OPTIONS, RACE_OPTIONS, GENHEALTH_OPTIONS,
    EDUCATION_OPTIONS, INCOME_OPTIONS, YES_NO_OPTIONS,
    HYPERTENSION_OPTIONS, CHOLESTEROL_OPTIONS, YES_NO_BINARY,
  } from "@/lib/constants";
  
  export type DidaFieldType = "choice" | "numeric";
  
  export interface DidaFieldOption {
    value: number;
    label: string;
  }
  
  export interface DidaField {
    key: string;
    question: string;
    type: DidaFieldType;
    options?: DidaFieldOption[];
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    showBmiCalculator?: boolean;
  }
  
  // Single source of truth for the collection flow — same order/labels
  // as the step-by-step PredictionForm, so both stay in sync.
  export const DIDA_FIELDS: DidaField[] = [
    { key: "_AGE80",  question: "Let's start easy — what age group are you in?", type: "choice", options: AGE_OPTIONS },
    { key: "SEXVAR",  question: "Got it. What's your sex?", type: "choice", options: SEX_OPTIONS },
    { key: "_IMPRACE", question: "Which race/ethnicity best describes you?", type: "choice", options: RACE_OPTIONS },
    {
      key: "_BMI5", question: "Now, do you know your BMI? Type it in, or use the calculator below if not.",
      type: "numeric", min: 10, max: 100, step: 0.1, placeholder: "e.g. 25.4", showBmiCalculator: true,
    },
    {
      key: "PHYSHLTH", question: "In the last 30 days, on how many days was your physical health NOT good?",
      type: "numeric", min: 0, max: 30, step: 1, placeholder: "0–30",
    },
    { key: "GENHLTH", question: "Overall, how would you rate your general health?", type: "choice", options: GENHEALTH_OPTIONS },
    { key: "SMOKE100", question: "Have you smoked at least 100 cigarettes in your life?", type: "choice", options: YES_NO_OPTIONS },
    {
      key: "_TOTINDA", question: "Have you done any physical activity in the last 30 days (outside of work)?",
      type: "choice", options: [{ value: 1, label: "Yes" }, { value: 2, label: "No" }],
    },
    { key: "EDUCA", question: "What's the highest level of education you've completed?", type: "choice", options: EDUCATION_OPTIONS },
    { key: "INCOME3", question: "Which range best fits your annual household income?", type: "choice", options: INCOME_OPTIONS },
    { key: "_RFHYPE6", question: "Has a doctor ever told you that you have high blood pressure?", type: "choice", options: HYPERTENSION_OPTIONS },
    { key: "_RFCHOL3", question: "Has a doctor ever told you that your cholesterol is high?", type: "choice", options: CHOLESTEROL_OPTIONS },
    { key: "CHCKDNY2", question: "Has a doctor ever told you that you have kidney disease?", type: "choice", options: YES_NO_OPTIONS },
    { key: "_MICHD", question: "Lastly — have you ever had coronary heart disease or a heart attack?", type: "choice", options: YES_NO_BINARY },
  ];
  
  // Loose intent detector so typed messages like "check my risk please"
  // also kick off the flow, not just the quick-action button.
  export function looksLikeRiskCheckIntent(text: string): boolean {
    const t = text.toLowerCase();
    return ["check my risk", "calculate my risk", "predict my risk", "assess my risk", "start the assessment", "diabetes risk check"]
      .some((phrase) => t.includes(phrase));
  }
  
  function bmiCategory(bmi: number): { label: string; className: string } {
    if (bmi < 18.5) return { label: "Underweight", className: "text-sky-500" };
    if (bmi < 25) return { label: "Normal weight", className: "text-emerald-500" };
    if (bmi < 30) return { label: "Overweight", className: "text-amber-500" };
    return { label: "Obese", className: "text-red-500" };
  }
  
  export { bmiCategory };
  
  