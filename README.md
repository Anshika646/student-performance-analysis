# EduPulse — Student Performance Prediction & Analytics System

End-to-end **Machine Learning & Data Analytics System** built on the official **UCI Student Performance Dataset** (`student-mat.csv` and `student-por.csv`).

## Architecture & Module Structure

- **`data_loader.py`** — Loads UCI Mathematics (`student-mat.csv`, 395 students) and Portuguese (`student-por.csv`, 649 students) datasets or custom uploaded CSVs, auto-detects `;` vs `,` delimiters, removes exact duplicate records, imputes missing values, infers column data types, and computes descriptive statistics and Pearson correlation matrices.
- **`preprocessing.py`** — Leakage-free train/test split and preprocessing pipeline (`StudentPreprocessor`). Fits imputation medians/modes and `StandardScaler` parameters strictly on `X_train` after partitioning to eliminate test-set data leakage. Supports two prediction modes:
  1. **With G1 & G2**: Full academic trajectory including first and second period grades.
  2. **Without G1 & G2**: Early-warning prediction using demographics, family education, support, and study habits only.
- **`model_training.py`** — Trains and evaluates **Linear Regression**, **Random Forest Regressor**, and **Decision Tree Regressor** on unseen test data (`R² Score`, `MAE`, `RMSE`, Actual vs. Predicted scatter, Residual histogram, and Feature Importance).
- **`prediction.py`** — Runs live inference on student profiles, computes per-feature marginal contributions relative to the training cohort average, classifies academic standing, and synthesizes personalized improvement recommendations.
- **`visualization.py`** — Computes cohort EDA distributions and provides glassmorphism Plotly & Seaborn chart builders.
- **`app.py`** — Standalone Streamlit dashboard (`streamlit run app.py`).
- **`server.ts` + `src/`** — Full-stack interactive web dashboard executing the Python ML modules live via `/api/*`.

## Dataset Source

 Cortez, P. (2008). *Student Performance* [Dataset]. UCI Machine Learning Repository. https://archive.ics.uci.edu/dataset/320/student+performance

## Running Locally

### Option A: Interactive Web Application (Express + Python ML Engine + React)
```bash
npm install
npm run dev
```

### Option B: Standalone Python Streamlit Dashboard
```bash
pip install -r requirements.txt
streamlit run app.py
```
