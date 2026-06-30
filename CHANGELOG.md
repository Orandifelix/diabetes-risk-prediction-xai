# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- FastAPI backend with single and batch prediction endpoints
- Next.js frontend dashboard
- SHAP and LIME explainability integration
- Batch analytics and CSV upload
- GitHub Actions CD pipeline
- Docker and cloud deployment

---

## [0.1.0] — 2026-06-30

### Added
- Initial repository structure and monorepo layout
- `README.md` with project overview, business context, and reproduction instructions
- `LICENSE` — MIT License for all five contributors
- `.gitignore` covering Python, Jupyter, Node.js, data files, and OS artifacts
- `requirements.txt` — pinned dependencies for the full data science pipeline
- `environment.yml` — Conda environment specification (`diabetes-xai`)
- `CHANGELOG.md` — this file
- `CONTRIBUTING.md` — contribution guide, branch naming, and setup instructions
- `ci.yml` — GitHub Actions CI workflow with structure validation and Python quality checks
- `docs/architecture.md` — system design and component overview
- `docs/dashboard.md` — dashboard usage and API reference
- `docs/methodology.md` — modelling decisions and rationale
- `models/metadata.json` — model metadata stub
- `datasets/raw/` and `datasets/processed/` — empty directories with `.gitkeep`
- `images/` — eight phase subfolders for figures and visualizations
- `notebooks/diabetes_prediction.ipynb` — main project notebook
- `reports/proposal.pdf` — approved capstone project proposal
- `presentations/speaker_notes.md` — presenter notes stub

---

[Unreleased]: https://github.com/Orandifelix/diabetes-risk-prediction-xai/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Orandifelix/diabetes-risk-prediction-xai/releases/tag/v0.1.0
