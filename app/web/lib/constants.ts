// ── Feature definitions ───────────────────────────────────────
export const FEATURE_LABELS: Record<string, string> = {
  _BMI5:    "BMI",
  _AGE80:   "Age",
  SEXVAR:   "Sex",
  _IMPRACE: "Race/Ethnicity",
  GENHLTH:  "General Health",
  PHYSHLTH: "Physical Health Days",
  SMOKE100: "Smoking",
  _TOTINDA: "Physical Activity",
  EDUCA:    "Education Level",
  INCOME3:  "Income Level",
  _RFHYPE6: "Hypertension",
  _RFCHOL3: "High Cholesterol",
  CHCKDNY2: "Kidney Disease",
  _MICHD:   "Heart Disease",
};

export const FEATURE_TOOLTIPS: Record<string, string> = {
  _BMI5:    "Body Mass Index — calculated from your height and weight.",
  _AGE80:   "Your age category from 1 (18–24) to 13 (80+).",
  SEXVAR:   "Biological sex assigned at birth.",
  _IMPRACE: "Race and ethnicity category (1–6).",
  GENHLTH:  "How would you rate your general health? 1 = Excellent, 5 = Poor.",
  PHYSHLTH: "Number of days in the past 30 days your physical health was not good.",
  SMOKE100: "Have you smoked at least 100 cigarettes in your lifetime?",
  _TOTINDA: "Did you participate in any physical activity or exercise in the past 30 days?",
  EDUCA:    "Highest level of education completed (1–6).",
  INCOME3:  "Annual household income level (1–11).",
  _RFHYPE6: "Have you ever been told you have high blood pressure?",
  _RFCHOL3: "Have you ever been told your cholesterol is high?",
  CHCKDNY2: "Have you ever been told you have kidney disease?",
  _MICHD:   "Have you ever been told you have coronary heart disease or had a heart attack?",
};

// ── Risk thresholds ───────────────────────────────────────────
export const RISK_THRESHOLDS = {
  HIGH:     0.70,
  MODERATE: 0.40,
} as const;

export const RISK_CONFIG = {
  "High Risk": {
    label:    "High Risk",
    color:    "#EF4444",
    bgColor:  "#FEF2F2",
    badge:    "destructive",
    emoji:    "🔴",
  },
  "Moderate Risk": {
    label:    "Moderate Risk",
    color:    "#F59E0B",
    bgColor:  "#FFFBEB",
    badge:    "warning",
    emoji:    "🟡",
  },
  "Low Risk": {
    label:    "Low Risk",
    color:    "#10B981",
    bgColor:  "#ECFDF5",
    badge:    "success",
    emoji:    "🟢",
  },
} as const;

// ── Form options ──────────────────────────────────────────────
export const AGE_OPTIONS = [
  { value: 1,  label: "18–24" },
  { value: 2,  label: "25–29" },
  { value: 3,  label: "30–34" },
  { value: 4,  label: "35–39" },
  { value: 5,  label: "40–44" },
  { value: 6,  label: "45–49" },
  { value: 7,  label: "50–54" },
  { value: 8,  label: "55–59" },
  { value: 9,  label: "60–64" },
  { value: 10, label: "65–69" },
  { value: 11, label: "70–74" },
  { value: 12, label: "75–79" },
  { value: 13, label: "80+"   },
];

export const SEX_OPTIONS = [
  { value: 1, label: "Male"   },
  { value: 2, label: "Female" },
];

export const RACE_OPTIONS = [
  { value: 1, label: "White only, non-Hispanic" },
  { value: 2, label: "Black only, non-Hispanic" },
  { value: 3, label: "American Indian or Alaskan Native only" },
  { value: 4, label: "Asian only, non-Hispanic" },
  { value: 5, label: "Hispanic" },
  { value: 6, label: "Other race only, non-Hispanic" },
];

export const GENHEALTH_OPTIONS = [
  { value: 1, label: "Excellent" },
  { value: 2, label: "Very good" },
  { value: 3, label: "Good"      },
  { value: 4, label: "Fair"      },
  { value: 5, label: "Poor"      },
];

export const EDUCATION_OPTIONS = [
  { value: 1, label: "Never attended school" },
  { value: 2, label: "Elementary school"     },
  { value: 3, label: "Some high school"      },
  { value: 4, label: "High school graduate"  },
  { value: 5, label: "Some college"          },
  { value: 6, label: "College graduate"      },
];

export const INCOME_OPTIONS = [
  { value: 1,  label: "Less than $10,000"        },
  { value: 2,  label: "$10,000 – $14,999"        },
  { value: 3,  label: "$15,000 – $19,999"        },
  { value: 4,  label: "$20,000 – $24,999"        },
  { value: 5,  label: "$25,000 – $34,999"        },
  { value: 6,  label: "$35,000 – $49,999"        },
  { value: 7,  label: "$50,000 – $74,999"        },
  { value: 8,  label: "$75,000 – $99,999"        },
  { value: 9,  label: "$100,000 – $149,999"      },
  { value: 10, label: "$150,000 – $199,999"      },
  { value: 11, label: "$200,000 or more"         },
];

export const YES_NO_OPTIONS = [
  { value: 1, label: "Yes" },
  { value: 2, label: "No"  },
];

export const YES_NO_BINARY = [
  { value: 1, label: "Yes" },
  { value: 0, label: "No"  },
];

export const HYPERTENSION_OPTIONS = [
  { value: 2, label: "Yes — I have been told I have high blood pressure" },
  { value: 1, label: "No"  },
];

export const CHOLESTEROL_OPTIONS = [
  { value: 2, label: "Yes — I have been told my cholesterol is high" },
  { value: 1, label: "No" },
];

// ── CSV required columns ──────────────────────────────────────
export const CSV_REQUIRED_COLUMNS = [
  "_BMI5", "_AGE80", "SEXVAR", "_IMPRACE",
  "GENHLTH", "PHYSHLTH", "SMOKE100", "_TOTINDA",
  "EDUCA", "INCOME3", "_RFHYPE6", "_RFCHOL3",
  "CHCKDNY2", "_MICHD",
];

// ── Navigation ────────────────────────────────────────────────
export const NAV_PUBLIC = [
  { label: "Home",             href: "/"                              },
  { label: "About Diabetes",   href: "/about"                         },
  { label: "Research",         href: "/research"                      },
  { label: "Risk Assessment",  href: "/risk-assessment"               },
];

export const NAV_DASHBOARD = [
  { label: "Overview",         href: "/dashboard",         icon: "LayoutDashboard" },
  { label: "Single Prediction",href: "/dashboard/predict", icon: "Activity"        },
  { label: "Batch Prediction", href: "/dashboard/batch",   icon: "Upload"          },
  { label: "Analytics",        href: "/dashboard/analytics",icon: "BarChart2"      },
  { label: "History",          href: "/dashboard/history", icon: "Clock"           },
  { label: "Reports",          href: "/dashboard/reports", icon: "FileText"        },
  { label: "Profile",          href: "/dashboard/profile", icon: "User"            },
  { label: "Settings",         href: "/dashboard/settings",icon: "Settings"        },
];

// ── Prior research papers ─────────────────────────────────────
export const RESEARCH_PAPERS = [
  {
    authors: "Rajkomar, A., Dean, J., & Kohane, I.",
    year: 2019,
    title: "Machine Learning in Medicine",
    journal: "New England Journal of Medicine",
    volume: "380(14), 1347–1358",
    keyFinding: "ML models can match or exceed clinician accuracy in risk stratification tasks when trained on structured clinical data.",
    relevance: "Justifies our choice of supervised classification over rule-based clinical screening approaches.",
    url: "https://doi.org/10.1056/NEJMra1814259",
    tags: ["ML in Healthcare", "Clinical AI"],
  },
  {
    authors: "Lundberg, S. M., & Lee, S. I.",
    year: 2017,
    title: "A Unified Approach to Interpreting Model Predictions",
    journal: "Advances in Neural Information Processing Systems",
    volume: "30, 4765–4774",
    keyFinding: "SHAP values provide theoretically grounded, consistent feature attribution that is superior to prior interpretability methods.",
    relevance: "SHAP is our primary explainability method — this is the foundational paper we implement directly.",
    url: "https://proceedings.neurips.cc/paper/2017/hash/8a20a8621978632d76c43dfd28b67767-Abstract.html",
    tags: ["Explainable AI", "SHAP"],
  },
  {
    authors: "Ribeiro, M. T., Singh, S., & Guestrin, C.",
    year: 2016,
    title: '"Why Should I Trust You?": Explaining the Predictions of Any Classifier',
    journal: "Proceedings of the 22nd ACM SIGKDD",
    volume: "1135–1144",
    keyFinding: "LIME generates locally faithful, interpretable explanations for individual predictions of any black-box model.",
    relevance: "LIME is our secondary explainability method used for patient-level decision interpretation.",
    url: "https://doi.org/10.1145/2939672.2939778",
    tags: ["Explainable AI", "LIME"],
  },
  {
    authors: "Obermeyer, Z., & Emanuel, E. J.",
    year: 2016,
    title: "Predicting the Future — Big Data, Machine Learning, and Clinical Medicine",
    journal: "New England Journal of Medicine",
    volume: "375(13), 1216–1219",
    keyFinding: "Big data and ML have the potential to transform clinical medicine by improving prediction, diagnosis, and personalised treatment.",
    relevance: "Provides the foundational motivation for applying ML to population-level diabetes risk stratification.",
    url: "https://doi.org/10.1056/NEJMp1606181",
    tags: ["Big Data", "Clinical Medicine"],
  },
  {
    authors: "Carvalho, D. V., Pereira, E. M., & Cardoso, J. S.",
    year: 2019,
    title: "Machine Learning Interpretability: A Survey on Methods and Metrics",
    journal: "Electronics",
    volume: "8(8), 832",
    keyFinding: "A comprehensive survey of XAI methods showing that SHAP and LIME are the most widely adopted for tabular healthcare data.",
    relevance: "Informed our choice of SHAP and LIME over alternative XAI approaches.",
    url: "https://doi.org/10.3390/electronics8080832",
    tags: ["Survey", "Explainable AI"],
  },
  {
    authors: "Kavakiotis, I., Tsave, O., Salifoglou, A., et al.",
    year: 2017,
    title: "Machine Learning and Data Mining Methods in Diabetes Research",
    journal: "Computational and Structural Biotechnology Journal",
    volume: "15, 104–116",
    keyFinding: "XGBoost and Random Forest consistently outperform other classifiers for diabetes prediction across multiple datasets.",
    relevance: "Directly supports our selection of XGBoost as the final model for diabetes risk prediction.",
    url: "https://doi.org/10.1016/j.csbj.2016.12.005",
    tags: ["Diabetes ML", "Domain Research"],
  },
  {
    authors: "International Diabetes Federation",
    year: 2021,
    title: "IDF Diabetes Atlas, 10th Edition",
    journal: "International Diabetes Federation",
    volume: "Brussels, Belgium",
    keyFinding: "Over 537 million adults live with diabetes globally, with Type 2 accounting for over 90% of cases. Prevalence is highest in low- and middle-income countries.",
    relevance: "Provides the epidemiological scale and public health urgency that motivates this project.",
    url: "https://diabetesatlas.org",
    tags: ["Epidemiology", "Public Health"],
  },
  {
    authors: "Zou, Q., Qu, K., Luo, Y., et al.",
    year: 2018,
    title: "Predicting Diabetes Mellitus with Machine Learning Techniques",
    journal: "Frontiers in Genetics",
    volume: "9, 515",
    keyFinding: "Ensemble methods achieve AUC > 0.85 for diabetes prediction using BRFSS-derived clinical features.",
    relevance: "Closest prior work to our exact approach — same feature set, same problem framing, validates our methodology.",
    url: "https://doi.org/10.3389/fgene.2018.00515",
    tags: ["Diabetes Prediction", "BRFSS"],
  },
];
