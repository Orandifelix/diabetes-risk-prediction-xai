# Diabetes Risk Predictor — Early Detection of Type 2 Diabetes Using Machine Learning and Explainable AI

> _"Know your risk before it becomes your reality."_
> An end-to-end clinical decision-support system that predicts Type 2 diabetes risk and explains every prediction using Explainable AI.

[![CI](https://github.com/S-Mwaura/diabetes-risk-prediction-xai/actions/workflows/ci.yml/badge.svg)](https://github.com/S-Mwaura/diabetes-risk-prediction-xai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-ML-orange?logo=python&logoColor=white)](https://xgboost.readthedocs.io/)
[![SHAP](https://img.shields.io/badge/XAI-SHAP%20%7C%20LIME-purple)](https://shap.readthedocs.io/)

---

![Diabetes Risk Predictor](images/08_presentation/header.png)

---

## Overview

Type 2 diabetes affects over **500 million people worldwide** and is one of the fastest-growing chronic diseases globally (International Diabetes Federation, 2021). Early identification of at-risk individuals is critical — intervention at the pre-diabetic stage can delay or prevent full onset entirely, reducing both patient burden and long-term healthcare costs.

Traditional clinical screening is time-consuming, inconsistent, and does not scale to population-level prevention. This project addresses that gap by building a **machine learning system** trained on routine health indicators that predicts diabetes risk with high accuracy — and critically, **explains why** through SHAP and LIME, making predictions actionable for healthcare professionals.

---

## Business Understanding and Data Understanding

Chronic disease prediction is one of the highest-impact applications of machine learning in healthcare. Research has shown that ML models can match or exceed clinician accuracy in risk stratification tasks when trained on structured clinical data (Rajkomar et al., 2019). However, adoption in clinical settings remains limited by the "black box" problem — healthcare professionals cannot act on predictions they cannot understand or verify.

This project bridges that gap using Explainable AI (XAI). SHAP (SHapley Additive exPlanations) provides global and local feature attributions — showing which variables most influence a prediction for any individual patient. LIME (Local Interpretable Model-Agnostic Explanations) generates human-readable decision explanations for each case. Together, these techniques transform a predictive model into a transparent decision-support tool (Lundberg & Lee, 2017; Ribeiro et al., 2016).

<!-- Uncomment and update once EDA is complete -->
<!-- ### Key Findings from EDA -->
<!-- ![Class Distribution](images/02_eda/class_distribution.png) -->
<!-- ![Correlation Heatmap](images/02_eda/correlation_heatmap.png) -->
<!-- ![Feature Distributions](images/02_eda/feature_distributions.png) -->

**Dataset:** The [Diabetes Prediction Dataset](https://www.kaggle.com/) sourced from Kaggle contains **N patients** with clinical features including glucose levels, BMI, age, blood pressure, insulin, skin thickness, diabetes pedigree function, and number of pregnancies. The target variable is a binary diabetes diagnosis outcome.

| Feature           | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| Glucose           | Plasma glucose concentration (2-hour oral glucose tolerance test) |
| BMI               | Body mass index (weight in kg / height in m²)                     |
| Age               | Patient age in years                                              |
| Blood Pressure    | Diastolic blood pressure (mm Hg)                                  |
| Insulin           | 2-hour serum insulin (µU/ml)                                      |
| Skin Thickness    | Triceps skinfold thickness (mm)                                   |
| Pregnancies       | Number of times pregnant                                          |
| Diabetes Pedigree | Diabetes pedigree function (family history score)                 |
| **Outcome**       | **1 = Diabetic, 0 = Non-diabetic (target variable)**              |

---

## Modeling and Evaluation

We trained and compared six classification algorithms, with Logistic Regression as the interpretable baseline.

<!-- Replace — with actual values after training is complete -->

| Model                            | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| -------------------------------- | -------- | --------- | ------ | -------- | ------- |
| Logistic Regression _(baseline)_ | —        | —         | —      | —        | —       |
| Decision Tree                    | —        | —         | —      | —        | —       |
| Random Forest                    | —        | —         | —      | —        | —       |
| **XGBoost** _(final)_            | **—**    | **—**     | **—**  | **—**    | **—**   |
| LightGBM                         | —        | —         | —      | —        | —       |
| CatBoost                         | —        | —         | —      | —        | —       |

The final selected model (**XGBoost**) achieved an accuracy of **—%** and ROC-AUC of **—**, outperforming the logistic regression baseline by **—** points on F1-Score. Cross-validation (5-fold) was applied to ensure robustness, and SMOTE was used to address class imbalance in the training set.

<!-- Uncomment once evaluation images are saved -->
<!-- ![Confusion Matrix](images/05_evaluation/confusion_matrix.png) -->
<!-- ![ROC Curve](images/05_evaluation/roc_curve.png) -->
<!-- ![Model Comparison](images/05_evaluation/model_comparison.png) -->

### Explainability

SHAP global feature importance identified the top predictors of diabetes risk. LIME was applied to generate patient-level decision explanations for individual predictions.

<!-- ![SHAP Summary Plot](images/06_interpretability/shap_summary.png) -->
<!-- ![SHAP Waterfall](images/06_interpretability/shap_waterfall.png) -->
<!-- ![LIME Local Explanation](images/06_interpretability/lime_local.png) -->

---

## Conclusion

<!-- Update with final results after model evaluation is complete -->

This project demonstrates that Type 2 diabetes risk can be predicted from routine clinical indicators with high accuracy, and that Explainable AI techniques make those predictions interpretable and actionable for clinical stakeholders. The system is intended as a **screening support tool** — not a diagnostic replacement — to flag high-risk individuals for follow-up clinical evaluation.

**Recommendations for use:**

- Deploy in primary care settings to assist clinicians with early screening
- Use SHAP explanations to communicate risk drivers to patients
- Retrain the model periodically as new patient data becomes available

**Future work:**

- Real-time deployment with patient authentication and prediction history
- Integration with electronic health record (EHR) systems
- Automated retraining pipeline for model drift detection
- Mobile application for broader accessibility

---

## System Architecture

```
Patient Input (Web UI)
        │
        ▼
  Next.js Frontend
        │  HTTP / REST
        ▼
  FastAPI Backend  ──────────────────────────────────┐
        │                                             │
        ▼                                             ▼
  Inference Pipeline                      Analytics Endpoint
  (XGBoost + Preprocessor)               (Batch statistics)
        │
        ├── Single Prediction  →  Risk score + SHAP explanation
        └── Batch Prediction   →  CSV upload + bulk results + LIME
```

---

## Repository Navigation

```
diabetes-risk-prediction-xai/
│
├── notebooks/              → Jupyter notebooks (EDA through evaluation)
├── models/                 → Trained model and preprocessing artifacts
├── datasets/               → Raw and processed data
│   ├── raw/
│   └── processed/
├── images/                 → All figures organized by project phase
│   ├── 01_data_understanding/
│   ├── 02_eda/
│   ├── 03_feature_engineering/
│   ├── 04_modeling/
│   ├── 05_evaluation/
│   ├── 06_interpretability/
│   ├── 07_dashboard/
│   └── 08_presentation/
├── app/                    → FastAPI backend + Next.js frontend
├── reports/                → Final report and project proposal
├── presentations/          → Slides and speaker notes
├── docs/                   → Architecture and methodology docs
├── scripts/                → Dev, training, and monitoring scripts
└── .github/workflows/      → CI/CD and model monitoring pipelines
```

| Resource          | Link                                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| 📓 Final Notebook | [notebooks/diabetes_prediction.ipynb](notebooks/diabetes_prediction.ipynb) |
| 📊 Presentation   | [presentations/presentation.pdf](presentations/presentation.pdf)           |
| 📄 Final Report   | [reports/final_report.pdf](reports/final_report.pdf)                       |
| 🏛 Architecture   | [docs/architecture.md](docs/architecture.md)                               |
| 🔌 API Docs       | [docs/dashboard.md](docs/dashboard.md)                                     |

---

## Reproducing This Project

### Prerequisites

- Python 3.10+
- Conda _(recommended)_ or pip
- Node.js 18+ _(for the frontend dashboard)_
- Git

### Setup

**1. Clone the repository**

```bash
git clone https://github.com/S-Mwaura/diabetes-risk-prediction-xai.git
cd diabetes-risk-prediction-xai
```

**2. Create and activate the environment**

```bash
# With Conda (recommended)
conda env create -f environment.yml
conda activate diabetes-xai

# Or with pip
pip install -r requirements.txt
```

**3. Download the dataset**

```bash
bash scripts/download_dataset.sh
```

**4. Train and save the model**

```bash
bash scripts/train_and_save.sh
```

**5. Launch the full application**

```bash
bash scripts/run_dev.sh
```

| Service            | URL                        |
| ------------------ | -------------------------- |
| Frontend dashboard | http://localhost:3000      |
| FastAPI backend    | http://localhost:8000      |
| API docs (Swagger) | http://localhost:8000/docs |

---

## Contributors

| Name           | GitHub                                           | Role                   |
| -------------- | ------------------------------------------------ | ---------------------- |
| Stephen Mwaura | [@S-Mwaura](https://github.com/S-Mwaura)         | Project Lead · Backend |
| Angela Masaki  | [@MoonwaMasaki](https://github.com/MoonwaMasaki) | Data Engineering · EDA |
| Diana Byegon   | [@byegond-beep](https://github.com/byegond-beep) | Modeling · Evaluation  |
| Kevin Kisengu  | [@K-OK27](https://github.com/K-OK27)             | Explainability · XAI   |
| Orandi Felix   | [@Orandifelix](https://github.com/Orandifelix)   | Frontend · Dashboard   |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## References

International Diabetes Federation. (2021). _IDF Diabetes Atlas_ (10th ed.). https://www.diabetesatlas.org

Lundberg, S. M., & Lee, S. I. (2017). A unified approach to interpreting model predictions. _Advances in Neural Information Processing Systems, 30_, 4765–4774.

Obermeyer, Z., & Emanuel, E. J. (2016). Predicting the future — big data, machine learning, and clinical medicine. _New England Journal of Medicine, 375_(13), 1216–1219.

Rajkomar, A., Dean, J., & Kohane, I. (2019). Machine learning in medicine. _New England Journal of Medicine, 380_(14), 1347–1358.

Ribeiro, M. T., Singh, S., & Guestrin, C. (2016). "Why should I trust you?" Explaining the predictions of any classifier. _Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining_, 1135–1144.

Carvalho, D. V., Pereira, E. M., & Cardoso, J. S. (2019). Machine learning interpretability: A survey on methods and metrics. _Electronics, 8_(8), 832.
