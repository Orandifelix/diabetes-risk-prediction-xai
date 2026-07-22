# Contributing to Diabetes Risk Predictor

Thank you for your interest in contributing to this project. This guide covers everything you need to get the repository running locally, understand the project workflow, and submit changes correctly.

---

## Table of Contents

- [Team](#team)
- [Getting Started](#getting-started)
- [Reproducing the Pipeline](#reproducing-the-pipeline)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Workflow](#project-workflow)
- [Code Style](#code-style)
- [Reporting Issues](#reporting-issues)

---

## Team

| Name | GitHub | Area |
|---|---|---|
| Stephen Mwaura | [@S-Mwaura](https://github.com/S-Mwaura) | Project Lead · Modeling |
| Angela Masaki | [@MoonwaMasaki](https://github.com/MoonwaMasaki) | Data Engineering · EDA |
| Diana Byegon | [@byegond-beep](https://github.com/byegond-beep) | Feature Engineering · Evaluation |
| Kevin Kisengu | [@K-OK27](https://github.com/K-OK27) | Explainability · XAI |
| Orandi Felix | [@Orandifelix](https://github.com/Orandifelix) | Documentation · Reporting |

---

## Getting Started

### Prerequisites

- Python 3.12+
- [Conda](https://docs.conda.io/en/latest/) (recommended) or pip
- Git

### 1. Fork and clone the repository

```bash
git clone https://github.com/Orandifelix/diabetes-risk-prediction-xai.git
cd diabetes-risk-prediction-xai
```

### 2. Set up the environment

**With Conda (recommended):**

```bash
conda env create -f environment.yml
conda activate diabetes-xai
```

**With pip:**

```bash
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

pip install -r requirements.txt
```

### 3. Register the Jupyter kernel

```bash
python -m ipykernel install --user --name diabetes-xai --display-name "Python (diabetes-xai)"
```

### 4. Verify the setup

```bash
python -c "import sklearn, xgboost, shap, lime; print('Environment OK')"
```

---

## Reproducing the Pipeline

All technical steps required to replicate this pipeline are listed here in order.

### Step 1 — Download the dataset

Place the raw dataset file inside `datasets/raw/`. The dataset used is the
[Diabetes Prediction Dataset](https://drive.google.com/drive/folders/1AEyBCBPiPwVOYJfuQxNHFuYbA_v3KdTB?usp=drive_link) from Google Drive.

```bash
datasets/raw/diabetes.csv
```

### Step 2 — Open the notebook

```bash
jupyter notebook notebooks/diabetes_prediction.ipynb
```

Make sure the active kernel is **Python (diabetes-xai)** before running any cells.

### Step 3 — Run all cells in order

The notebook covers the full pipeline end-to-end:

| Section | Description |
|---|---|
| 1. Data Understanding | Load dataset, inspect shape, dtypes, missing values |
| 2. Exploratory Data Analysis | Distributions, correlations, class balance |
| 3. Feature Engineering | Encoding, scaling, feature selection |
| 4. Model Training | Train and compare six classifiers |
| 5. Hyperparameter Tuning | Optuna optimization for XGBoost |
| 6. Model Evaluation | Accuracy, F1, ROC-AUC, confusion matrix |
| 7. Explainability | SHAP global importance, LIME local explanations |

### Step 4 — Saved artifacts

After running the notebook, the following files will be updated:

```
models/final_model.joblib       # Trained XGBoost classifier
models/preprocessor.joblib      # Fitted preprocessing pipeline
models/metadata.json            # Metrics, version, feature names
images/                         # All figures saved by phase
```

---

## Branch Naming Conventions

All work must happen on a feature branch. Never commit directly to `main`.

| Branch Type | Pattern | Example |
|---|---|---|
| Feature | `feature/short-description` | `feature/shap-explainability` |
| Bug fix | `fix/short-description` | `fix/missing-value-imputation` |
| Documentation | `docs/short-description` | `docs/update-readme` |
| Notebook work | `notebook/short-description` | `notebook/eda-analysis` |
| Experiment | `experiment/short-description` | `experiment/catboost-tuning` |
| Release | `release/vX.Y.Z` | `release/v1.0.0` |

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Push to remote
git push origin feature/your-feature-name
```

---

## Commit Message Guidelines

Use the following format for all commit messages:

```
<type>: <short summary in present tense>
```

| Type | When to use |
|---|---|
| `feat` | Adding a new feature or notebook section |
| `fix` | Fixing a bug or incorrect result |
| `docs` | Documentation changes only |
| `data` | Adding or updating datasets |
| `model` | Training, saving, or updating model artifacts |
| `ci` | Changes to GitHub Actions workflows |
| `refactor` | Code restructuring without behaviour change |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks (dependencies, configs) |

**Examples:**

```bash
git commit -m "feat: add SHAP waterfall plot to explainability section"
git commit -m "fix: handle missing values in insulin column"
git commit -m "docs: update architecture.md with inference pipeline"
git commit -m "model: save final XGBoost pipeline to models/"
git commit -m "ci: add notebook format validation step"
```

---

## Pull Request Process

1. Make sure your branch is up to date with `main` before opening a PR

```bash
git fetch origin
git rebase origin/main
```

2. Ensure CI passes locally before pushing

```bash
# Check Python files
ruff check .

# Validate notebook
python -c "import nbformat; nb = nbformat.read(open('notebooks/diabetes_prediction.ipynb'), 4); nbformat.validate(nb); print('OK')"
```

3. Open a pull request against `main` with:
   - A clear title describing what changed
   - A short description of what was done and why
   - Screenshots or output if the change affects visualizations or results

4. At least one team member must review and approve before merging

5. Squash and merge is preferred to keep the commit history clean

---

## Project Workflow

```
main
 └── develop (optional integration branch)
      ├── feature/eda-analysis          ← Angela
      ├── feature/model-training        ← Diana
      ├── feature/shap-explainability   ← Kevin
      ├── docs/update-methodology       ← Orandi
      └── feature/preprocessing         ← Stephen
```

---

## Code Style

- All Python code must pass `ruff check` with no errors
- Notebook cells should be re-runnable from top to bottom without errors
- Clear all notebook outputs before committing (keep file sizes small)
- Use descriptive variable names — avoid single-letter names outside of loop indices
- Add a markdown cell before each major notebook section explaining what it does

**Clear notebook outputs before committing:**

```bash
jupyter nbconvert --clear-output --inplace notebooks/diabetes_prediction.ipynb
```

---

## Reporting Issues

If you encounter a bug, a failing CI check, or have a suggestion:

1. Check the [existing issues](https://github.com/Orandifelix/diabetes-risk-prediction-xai/issues) first
2. Open a new issue using the appropriate template (Bug Report or Feature Request)
3. Include as much detail as possible — error messages, environment info, steps to reproduce

For urgent team issues, reach out directly through your team communication channel.

---

*This project is licensed under the [MIT License](LICENSE).*
