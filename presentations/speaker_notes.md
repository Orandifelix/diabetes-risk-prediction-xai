# Presentation Speaker Notes

These notes accompany `presentation.pdf` and `presentation.pptx` for the capstone defence.

---

## Slide-by-Slide Notes

### Slide 1 — Title Slide

_"Good morning/afternoon. Our project is the Diabetes Risk Predictor — an end-to-end machine learning system that predicts Type 2 diabetes risk and explains every prediction using Explainable AI. I'm [Name], presenting on behalf of our team: Stephen, Angela, Diana, Kevin, and Orandi."_

---

### Slide 2 — Problem Statement

_"Type 2 diabetes affects over 500 million people worldwide. Early detection is critical — catching the disease at the pre-diabetic stage can delay or prevent full onset. The challenge is that traditional screening relies on manual clinical assessment, which doesn't scale. We built a system that can analyze routine health indicators, predict risk, and — importantly — explain why."_

---

### Slide 3 — Dataset

_"We used the Pima Indians Diabetes Dataset, sourced from the National Institute of Diabetes and Digestive and Kidney Diseases. It contains 768 patient records with 8 clinical features — including glucose, BMI, age, and insulin — and a binary diabetes outcome. About 35% of patients in the dataset are diabetic, so class imbalance was something we had to address."_

---

### Slide 4 — Methodology Overview

_"Our pipeline follows a standard data science workflow. We started with data understanding and EDA, moved through feature engineering and preprocessing, trained and compared six classification algorithms, tuned the best model using Optuna, evaluated performance, and finally applied SHAP and LIME for explainability."_

---

### Slide 5 — Exploratory Data Analysis

_"EDA revealed a few important things. Several features had biologically impossible zero values — a glucose of zero or a BMI of zero isn't physiologically valid — so we treated these as missing and applied median imputation. We also found moderate correlations between glucose and the outcome, and between BMI and the outcome, which gave us confidence that the features were predictive."_

---

### Slide 6 — Model Comparison

_"We trained six models — from a logistic regression baseline up to gradient boosting ensembles. XGBoost outperformed the others on F1-score and ROC-AUC, which is why we selected it as our final model. The full comparison table is in the report."_

---

### Slide 7 — Final Model Performance

_"After hyperparameter tuning with Optuna over [N] trials, our final XGBoost model achieved [accuracy]% accuracy and a ROC-AUC of [score] on the held-out test set — beating the logistic regression baseline by [delta] points on F1-score. We used 5-fold stratified cross-validation to ensure these results are robust."_

---

### Slide 8 — Explainability: SHAP

_"One of the core contributions of this project is interpretability. Using SHAP — SHapley Additive exPlanations — we can show which features drove each prediction. Globally, glucose is by far the most important feature, followed by BMI and age. For individual patients, a waterfall plot shows exactly how each feature pushed the prediction higher or lower."_

---

### Slide 9 — Explainability: LIME

_"LIME complements SHAP by generating a local explanation for any individual prediction. It fits a simple linear model around the prediction point and produces a ranked list of features with their directional influence. This is the kind of explanation a clinician can actually read and act on."_

---

### Slide 10 — Conclusion

_"To summarize — we built a system that predicts Type 2 diabetes risk with [accuracy]% accuracy, that is interpretable through SHAP and LIME, and that is documented end-to-end. We're not positioning this as a diagnostic tool — it's a screening support system to flag high-risk patients for follow-up. Future work includes a deployed web dashboard, EHR integration, and an automated retraining pipeline."_

---

### Slide 11 — Q&A

_"Thank you. We're happy to take questions."_

**Anticipated questions and suggested answers:**

**Q: Why XGBoost over Random Forest?**
XGBoost consistently outperformed Random Forest on F1-score and ROC-AUC in our comparison. It also supports native handling of missing values and is more computationally efficient with Optuna tuning.

**Q: How did you handle class imbalance?**
We applied SMOTE to the training set only — never to the test set — to avoid evaluation bias. We also used stratified splits and stratified cross-validation to preserve class proportions.

**Q: Is SHAP the same as feature importance from XGBoost?**
No — XGBoost's built-in feature importance is based on how often a feature is used in splits. SHAP values are theoretically grounded in cooperative game theory and measure the actual contribution of each feature to each individual prediction, making them more reliable and interpretable.

**Q: Could this be used in a real clinical setting?**
With appropriate validation on a larger and more diverse dataset, yes. Currently the model is trained on the Pima Indians dataset which has demographic limitations. Real deployment would require regulatory approval and integration with EHR systems.

---

_Last updated: 2026-06-30_
