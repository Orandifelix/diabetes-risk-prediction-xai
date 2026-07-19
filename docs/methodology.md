# Methodology

This document explains the modelling decisions, preprocessing choices, and evaluation strategy used in the Diabetes Risk Predictor.

> **Note:** this document supersedes the earlier draft, which described a different, smaller dataset (Pima Indians, 768 samples, 8 features) used in an early phase of the project. It now reflects the actual dataset and modelling approach used in the shipped system.

---

## Table of Contents

- [Problem Framing](#problem-framing)
- [Dataset](#dataset)
- [Feature Selection](#feature-selection)
- [Data Preprocessing](#data-preprocessing)
- [Exploratory Data Analysis](#exploratory-data-analysis)
- [Model Selection](#model-selection)
- [Threshold Tuning](#threshold-tuning)
- [Evaluation Strategy](#evaluation-strategy)
- [Explainability](#explainability)
- [Handling Class Imbalance](#handling-class-imbalance)
- [References](#references)

---

## Problem Framing

This is a **binary classification** problem: given fourteen self-reportable behavioural, demographic, and health-status survey responses, predict whether a respondent is at risk of Type 2 diabetes.

The primary objective is **recall on the positive class**. In a screening context, missing a genuinely at-risk respondent (a false negative) is materially more costly than flagging a healthy respondent for unnecessary follow-up (a false positive). This framing drives model selection, threshold tuning, and the choice of headline evaluation metric throughout — accuracy alone is treated as a secondary, supporting metric rather than the optimisation target.

---

## Dataset

| Property | Value |
|---|---|
| Source | CDC Behavioral Risk Factor Surveillance System (BRFSS), 2023 release |
| Population | U.S. adults (non-institutionalised), national telephone survey |
| Samples | 429,086 |
| Features used | 14 (selected subset — see below) |
| Target | Binary — prior diabetes diagnosis (self-reported) |
| Class balance | Imbalanced, consistent with population-level diabetes prevalence (~1 in 8–9 U.S. adults) |

BRFSS is an annual, large-scale, self-reported survey — it is not a laboratory or clinical dataset. All fourteen input features are things a respondent can report themselves, without a blood draw or clinic visit, which is precisely what makes the resulting model usable as a low-friction screening tool rather than a diagnostic one.

---

## Feature Selection

From BRFSS's full variable set (several hundred candidate columns), fourteen features were retained for the production model:

| BRFSS Code | Feature | Category |
|---|---|---|
| `_BMI5` | Body mass index | Anthropometric |
| `_AGE80` | Age group (13-level) | Demographic |
| `SEXVAR` | Sex | Demographic |
| `_IMPRACE` | Race / ethnicity | Demographic |
| `GENHLTH` | Self-rated general health | Health status |
| `PHYSHLTH` | Poor physical health days (30d) | Health status |
| `SMOKE100` | Smoked ≥100 cigarettes lifetime | Behavioural |
| `_TOTINDA` | Physical activity (30d) | Behavioural |
| `EDUCA` | Education level | Socio-economic |
| `INCOME3` | Household income bracket | Socio-economic |
| `_RFHYPE6` | Hypertension | Clinical history |
| `_RFCHOL3` | High cholesterol | Clinical history |
| `CHCKDNY2` | Kidney disease | Clinical history |
| `_MICHD` | Coronary heart disease / heart attack | Clinical history |

Selection criteria, in order of priority:

1. **Established association with diabetes risk** in the epidemiological/ML literature (see [References](#references) and the project's research paper).
2. **Self-reportability** — no laboratory value (e.g. fasting glucose, HbA1c) is used, so the tool never depends on data the respondent doesn't already have.
3. **Minimal respondent burden** — fourteen fields keeps both the structured web form and Dida's conversational assessment short enough to complete in one sitting, deliberately narrower than the twenty-to-twenty-five-feature sets used in some comparable BRFSS studies.

No additional derived/engineered features are added on top of these fourteen; feature importance (via SHAP, see below) is used to interpret the model rather than to justify adding or dropping inputs post hoc.

---

## Data Preprocessing

### Missing / Unknown Values

BRFSS uses reserved codes for "don't know," "refused," and "not asked" responses. These are treated as missing rather than as valid category levels.

- **Categorical/ordinal features** (e.g. `GENHLTH`, `EDUCA`, `INCOME3`): mode imputation.
- **Continuous features** (`_BMI5`, `PHYSHLTH`): median imputation, since these features contain outliers that would skew a mean-based fill.

### Categorical Handling

Unlike the project's earlier phase (which used one-hot encoding for a small Pima-style feature set), the production pipeline relies on **CatBoost's native ordered categorical handling**. Ordinal and categorical BRFSS codes are passed through largely as-is rather than one-hot encoded, avoiding unnecessary dimensionality expansion and letting the model exploit ordinal structure (e.g. `GENHLTH` running from 1=Excellent to 5=Poor) directly.

### Pipeline

The fitted preprocessing pipeline is saved to `models/preprocessor.joblib` so that training-time and inference-time transformations are guaranteed identical.

---

## Exploratory Data Analysis

EDA precedes modelling and directly informs the feature-selection and preprocessing decisions above. Key analyses:

| Analysis | Purpose |
|---|---|
| Summary statistics | Identify reserved/missing codes, ranges, and distributions per feature |
| Class distribution | Quantify diabetes prevalence in the sample |
| Feature distributions | Distribution of BMI, age group, general health, etc. |
| Correlation / association checks | Screen for redundancy among the fourteen selected features |
| Risk by subgroup | Diabetes rate broken down by age group and BMI range — the same breakdowns later surfaced live in the batch analytics dashboard |

All EDA figures are saved under `images/`.

---

## Model Selection

CatBoost was selected as the final classifier after comparison against alternative boosting frameworks, on the following grounds:

| Consideration | Why CatBoost |
|---|---|
| Categorical features | Native, ordered handling — no manual one-hot encoding needed for BRFSS's mostly-ordinal/categorical columns |
| Overfitting resistance | Symmetric tree-growing strategy reduces prediction variance relative to standard XGBoost/LightGBM trees |
| Explainability compatibility | First-class support for `shap.TreeExplainer`, enabling exact (not approximated) Shapley value computation at production scale |
| Comparative performance | Competitive-to-superior discriminative performance against XGBoost/LightGBM on tabular, largely categorical survey data in the literature this project draws on |

The final model is serialized to `models/final_model.joblib`.

---

## Threshold Tuning

Rather than using the default 0.5 probability cutoff, the decision threshold is tuned on a held-out validation split specifically to **favour recall** — deliberately accepting a higher false-positive rate in exchange for fewer missed at-risk respondents. This is consistent with the project's problem framing (see above) and with the design philosophy of comparable recall-optimised BRFSS explainable-AI screening tools in the literature.

---

## Evaluation Strategy

### Train / Validation / Test Split

The dataset is partitioned into training, validation, and held-out test splits. Hyperparameters and the decision threshold are tuned against the validation split only; final performance is reported strictly on the untouched test split.

### Metrics

| Metric | Role |
|---|---|
| **Recall (Sensitivity)** | Primary metric — fraction of true at-risk respondents correctly flagged |
| **ROC-AUC** | Primary metric — overall discriminative ability across thresholds |
| Precision | Secondary — supports interpreting the recall/false-positive trade-off |
| F1-score | Secondary |
| Accuracy | Reported for completeness only; not the optimisation target given class imbalance |

**Current test-set results: 75% recall, 82% ROC-AUC.**

---

## Explainability

### SHAP (Global + Local)

`shap.TreeExplainer` runs directly against the CatBoost model for exact, efficient Shapley value computation.

- **Global** — feature importance aggregated across the full population (or a specific batch), surfaced in the analytics dashboard.
- **Local** — per-prediction attribution, showing exactly how much each of the fourteen features pushed one respondent's probability up or down; surfaced alongside every individual result.

### LIME (Local)

`lime.lime_tabular.LimeTabularExplainer` independently builds a locally faithful linear surrogate around each individual prediction. Because it is computed via a completely different mechanism from SHAP, agreement between the two provides an informal robustness check on any single patient-level explanation.

---

## Handling Class Imbalance

Diabetes prevalence in the general population — and therefore in BRFSS — is naturally imbalanced (roughly one in eight to one in nine U.S. adults). This project deliberately handles that imbalance **without synthetic oversampling (e.g. SMOTE)**, to avoid the distributional distortion risk that resampling can introduce on a dataset this large. Instead:

- **Class weighting** is applied during CatBoost training.
- **Recall-favouring threshold tuning** (see above) directly targets the cost asymmetry between false negatives and false positives, rather than relying on resampling to indirectly achieve the same goal.

---

## References

Carvalho, D. V., Pereira, E. M., & Cardoso, J. S. (2019). Machine learning interpretability: A survey on methods and metrics. *Electronics, 8*(8), 832.

International Diabetes Federation. (2021). *IDF Diabetes Atlas* (10th ed.). https://www.diabetesatlas.org

Lundberg, S. M., & Lee, S. I. (2017). A unified approach to interpreting model predictions. *Advances in Neural Information Processing Systems, 30*, 4765–4774.

Obermeyer, Z., & Emanuel, E. J. (2016). Predicting the future — big data, machine learning, and clinical medicine. *New England Journal of Medicine, 375*(13), 1216–1219.

Rajkomar, A., Dean, J., & Kohane, I. (2019). Machine learning in medicine. *New England Journal of Medicine, 380*(14), 1347–1358.

Ribeiro, M. T., Singh, S., & Guestrin, C. (2016). "Why should I trust you?" Explaining the predictions of any classifier. *Proceedings of the 22nd ACM SIGKDD*, 1135–1144.

---

*Last updated: 2026-07-17 — rewritten for the BRFSS 2023 / CatBoost pipeline, superseding the earlier Pima-dataset draft.*
