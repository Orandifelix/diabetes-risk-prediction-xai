# Methodology

This document explains the modelling decisions, preprocessing choices, and evaluation strategy used in the Diabetes Risk Predictor.

---

## Table of Contents

- [Problem Framing](#problem-framing)
- [Dataset](#dataset)
- [Data Preprocessing](#data-preprocessing)
- [Exploratory Data Analysis](#exploratory-data-analysis)
- [Feature Engineering](#feature-engineering)
- [Model Selection](#model-selection)
- [Hyperparameter Tuning](#hyperparameter-tuning)
- [Evaluation Strategy](#evaluation-strategy)
- [Explainability](#explainability)
- [Handling Class Imbalance](#handling-class-imbalance)

---

## Problem Framing

This is a **binary classification** problem. Given a set of routine clinical measurements, the model predicts whether a patient is at risk of Type 2 diabetes (`Outcome = 1`) or not (`Outcome = 0`).

The primary objective is **recall on the positive class** — it is more costly to miss a diabetic patient (false negative) than to flag a healthy patient for follow-up (false positive). This framing influences both model selection and the choice of evaluation metrics.

---

## Dataset

| Property | Value |
|---|---|
| Source | Kaggle — Diabetes Prediction Dataset |
| Origin | National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK) |
| Population | Pima Indian women aged 21 and older |
| Samples | 768 |
| Features | 8 clinical features |
| Target | Binary — `Outcome` (1 = diabetic, 0 = non-diabetic) |
| Class balance | ~35% positive, ~65% negative |

### Features

| Feature | Type | Description |
|---|---|---|
| Pregnancies | Integer | Number of times pregnant |
| Glucose | Integer | Plasma glucose (2-hr oral glucose tolerance test) |
| BloodPressure | Integer | Diastolic blood pressure (mm Hg) |
| SkinThickness | Integer | Triceps skinfold thickness (mm) |
| Insulin | Integer | 2-hour serum insulin (µU/ml) |
| BMI | Float | Body mass index (kg/m²) |
| DiabetesPedigreeFunction | Float | Genetic diabetes risk score |
| Age | Integer | Age in years |

---

## Data Preprocessing

### Missing Values

Several features contain biologically impossible zero values that represent missing data — a glucose level of 0, BMI of 0, or blood pressure of 0 is not physiologically valid. These are treated as missing.

Affected features: `Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI`

**Strategy:** Replace zeros with `NaN`, then apply median imputation per feature. Median is preferred over mean because these features contain outliers that would skew the mean.

### Outlier Treatment

Outliers are detected using the Interquartile Range (IQR) method:

```
Lower bound = Q1 − 1.5 × IQR
Upper bound = Q3 + 1.5 × IQR
```

Values outside these bounds are capped (Winsorized) rather than removed, to preserve sample size.

### Feature Scaling

`StandardScaler` is applied to all numerical features after imputation and outlier treatment:

```
z = (x − μ) / σ
```

Scaling is fitted on the training set only and applied to the test set using the same fitted parameters — preventing data leakage.

### Pipeline

All preprocessing steps are wrapped in a single `sklearn.pipeline.Pipeline` object:

```python
preprocessor = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])
```

The fitted pipeline is saved to `models/preprocessor.joblib` to ensure training and inference transformations are identical.

---

## Exploratory Data Analysis

EDA is conducted before any modelling to understand the data and guide preprocessing decisions. Key analyses include:

| Analysis | Purpose |
|---|---|
| Summary statistics | Identify impossible values, ranges, and distributions |
| Class distribution | Quantify imbalance between diabetic and non-diabetic |
| Feature distributions | Histograms and KDE plots per feature |
| Correlation matrix | Identify multicollinearity between features |
| Boxplots by outcome | Visualize feature separation between classes |
| Missing value heatmap | Identify patterns in missing data |

All EDA figures are saved to `images/02_eda/`.

---

## Feature Engineering

The dataset uses its original eight features without adding derived features, as the clinical variables are well-defined and domain literature supports their predictive value (Rajkomar et al., 2019).

Feature selection is evaluated using:

- **Correlation with target** — Pearson correlation for initial screening
- **Feature importance from Random Forest** — tree-based importance scores
- **SHAP values** — post-hoc feature attribution from the final model

No features are dropped before training. Feature importance analysis informs interpretation rather than elimination.

---

## Model Selection

Six classifiers are trained and compared to identify the best performer for this dataset:

| Model | Rationale |
|---|---|
| Logistic Regression | Interpretable baseline; establishes a performance floor |
| Decision Tree | Non-linear baseline; reveals if tree structure helps |
| Random Forest | Reduces overfitting of single trees via bagging |
| XGBoost | State-of-the-art gradient boosting; handles tabular data well |
| LightGBM | Fast gradient boosting; efficient on small datasets |
| CatBoost | Robust gradient boosting; handles outliers well |

All models are trained on the same preprocessed training split and evaluated on the same held-out test split to ensure fair comparison.

---

## Hyperparameter Tuning

Hyperparameter tuning is applied to the final selected model using **Optuna**, a hyperparameter optimization framework based on Tree-structured Parzen Estimator (TPE) sampling.

Tuning is performed with **5-fold stratified cross-validation** to preserve class proportions across folds.

Key hyperparameters tuned for XGBoost:

| Parameter | Search Range |
|---|---|
| `n_estimators` | 100 – 1000 |
| `max_depth` | 3 – 10 |
| `learning_rate` | 0.01 – 0.3 |
| `subsample` | 0.6 – 1.0 |
| `colsample_bytree` | 0.6 – 1.0 |
| `min_child_weight` | 1 – 10 |
| `reg_alpha` | 0 – 1 |
| `reg_lambda` | 0 – 1 |

---

## Evaluation Strategy

### Train / Test Split

- **80% training**, 20% test
- Stratified split to preserve class balance in both sets
- Random seed fixed for reproducibility

### Metrics

Given the recall-prioritised framing of this problem, the following metrics are reported:

| Metric | Why it matters |
|---|---|
| Accuracy | Overall correctness |
| Precision | Of predicted positives, how many are truly diabetic |
| Recall | Of true diabetics, how many did the model catch |
| F1-Score | Harmonic mean of precision and recall |
| ROC-AUC | Model's ability to discriminate between classes |

**Primary metric: F1-Score and ROC-AUC**, since accuracy alone is misleading with class imbalance.

### Cross-Validation

5-fold stratified cross-validation is used during:
- Model comparison (to reduce variance in metric estimates)
- Hyperparameter tuning (as the optimization objective)

### Success Criteria

The project targets:
- Accuracy ≥ 85% on the test set
- F1-Score and ROC-AUC exceeding the logistic regression baseline

---

## Explainability

### SHAP (Global + Local)

`shap.TreeExplainer` is used for efficiency with tree-based models. SHAP values quantify each feature's contribution to a prediction relative to the expected model output.

- **Global explanations** — SHAP summary plot showing feature importance across all predictions
- **Local explanations** — SHAP waterfall plot for individual patient predictions

### LIME (Local)

`lime.lime_tabular.LimeTabularExplainer` approximates the model locally around a single prediction using a linear surrogate model. This produces a ranked list of features and their directional influence for each individual case.

---

## Handling Class Imbalance

The dataset has approximately 35% positive cases. Strategies applied:

- **SMOTE** (Synthetic Minority Oversampling Technique) applied to the training set only — never to the test set, to avoid evaluation bias
- **Class weight parameter** set to `balanced` during model training as an alternative to SMOTE
- **Stratified splits** and **stratified cross-validation** to preserve class proportions

---

## References

International Diabetes Federation. (2021). *IDF Diabetes Atlas* (10th ed.). https://www.diabetesatlas.org

Lundberg, S. M., & Lee, S. I. (2017). A unified approach to interpreting model predictions. *Advances in Neural Information Processing Systems, 30*, 4765–4774.

Rajkomar, A., Dean, J., & Kohane, I. (2019). Machine learning in medicine. *New England Journal of Medicine, 380*(14), 1347–1358.

Ribeiro, M. T., Singh, S., & Guestrin, C. (2016). "Why should I trust you?" Explaining the predictions of any classifier. *Proceedings of the 22nd ACM SIGKDD*, 1135–1144.

---

*Last updated: 2026-06-30*
