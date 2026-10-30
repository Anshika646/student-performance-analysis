"""
prediction.py
-------------
Executes live student final-grade (G3) inference using the four trained regression
models (Random Forest, Gradient Boosting, Linear Regression, Decision Tree),
computes individual feature contribution impacts, runs What-If counterfactual
sensitivity sweeps, and generates personalized academic improvement suggestions.
"""

from typing import Any, Dict, List

from preprocessing import FEATURE_LABELS, StudentPreprocessor

try:
    import numpy as np  # type: ignore

    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

VALID_MODEL_KEYS = ("random_forest", "gradient_boosting", "linear_regression", "decision_tree")


def _run_single_model(
    model_key: str,
    models_runtime: Dict[str, Any],
    X_std: List[List[float]],
    X_raw: List[List[float]],
) -> float:
    if model_key == "linear_regression":
        m = models_runtime["lr"]
        inp = np.array(X_std) if HAS_NUMPY and hasattr(m, "n_features_in_") else X_std
        return float(m.predict(inp)[0])
    if model_key == "gradient_boosting":
        m = models_runtime["gb"]
        inp = np.array(X_raw) if HAS_NUMPY and hasattr(m, "n_features_in_") else X_raw
        return float(m.predict(inp)[0])
    if model_key == "decision_tree":
        m = models_runtime["dt"]
        inp = np.array(X_raw) if HAS_NUMPY and hasattr(m, "n_features_in_") else X_raw
        return float(m.predict(inp)[0])
    m = models_runtime["rf"]
    inp = np.array(X_raw) if HAS_NUMPY and hasattr(m, "n_features_in_") else X_raw
    return float(m.predict(inp)[0])


def classify_grade(score: float) -> Dict[str, str]:
    """Categorize predicted UCI grade (0-20 scale, where G3 >= 10 is passing)."""
    if score >= 16.0:
        return {
            "category": "Distinction / Excellence",
            "tier": "A",
            "status": "Pass",
            "summary": "Top-decile academic trajectory with strong mastery.",
        }
    if score >= 14.0:
        return {
            "category": "Good Academic Standing",
            "tier": "B",
            "status": "Pass",
            "summary": "Solid above-average performance well clear of the pass threshold.",
        }
    if score >= 10.0:
        return {
            "category": "Satisfactory Pass",
            "tier": "C",
            "status": "Pass",
            "summary": "Meets the ≥10/20 passing standard with clear room to strengthen buffer.",
        }
    return {
        "category": "At-Risk / Below Pass Threshold",
        "tier": "D",
        "status": "Needs Intervention",
        "summary": "Projected below the 10/20 pass mark; targeted academic support advised.",
    }


def predict_student_grade(
    student_input: Dict[str, Any],
    model_key: str,
    models_runtime: Dict[str, Any],
    models_report: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Run inference on a single student profile using the selected trained model,
    compute directional factor contributions, and execute What-If counterfactual sweeps.
    """
    preprocessor: StudentPreprocessor = models_runtime["preprocessor"]
    features: List[str] = models_runtime["features"]
    include_grades: bool = models_runtime["include_grades"]

    selected_key = model_key if model_key in VALID_MODEL_KEYS else "random_forest"

    X_std = preprocessor.transform_standardized([student_input])
    X_raw = preprocessor.transform_raw_numeric([student_input])

    raw_pred = _run_single_model(selected_key, models_runtime, X_std, X_raw)
    predicted_grade = round(max(0.0, min(20.0, raw_pred)), 2)

    all_preds = {
        k: round(max(0.0, min(20.0, _run_single_model(k, models_runtime, X_std, X_raw))), 2)
        for k in VALID_MODEL_KEYS
    }

    # Marginal factor impacts vs cohort mean
    baseline_row = dict(student_input)
    impacts: List[Dict[str, Any]] = []
    imp_lookup = {
        item["feature"]: item["importance"]
        for item in models_report[selected_key]["featureImportance"]
    }

    for idx, feat in enumerate(features):
        perturbed = dict(baseline_row)
        cohort_mean = preprocessor.raw_means[feat]
        if feat == "sex":
            perturbed[feat] = "M" if cohort_mean >= 0.5 else "F"
        elif feat in ("internet", "schoolsup"):
            perturbed[feat] = "yes" if cohort_mean >= 0.5 else "no"
        else:
            perturbed[feat] = cohort_mean

        if selected_key == "linear_regression":
            z_val = X_std[0][idx]
            coef = models_runtime["lr_signed_coefs"][idx]
            delta = z_val * coef
        else:
            p_std = preprocessor.transform_standardized([perturbed])
            p_raw = preprocessor.transform_raw_numeric([perturbed])
            ref_pred = _run_single_model(selected_key, models_runtime, p_std, p_raw)
            delta = raw_pred - ref_pred

        impacts.append({
            "feature": feat,
            "label": FEATURE_LABELS.get(feat, feat),
            "studentValue": student_input.get(feat),
            "cohortMean": round(cohort_mean, 2),
            "impact": round(delta, 2),
            "direction": "positive" if delta >= 0.05 else ("negative" if delta <= -0.05 else "neutral"),
            "importance": round(imp_lookup.get(feat, 0.0) * 100.0, 1),
        })

    impacts.sort(key=lambda x: (abs(x["impact"]), x["importance"]), reverse=True)

    # Live What-If Counterfactual Sensitivity Curves computed by the trained model
    study_Labels = {1: "<2h", 2: "2–5h", 3: "5–10h", 4: ">10h"}
    what_if_study = []
    for st in [1, 2, 3, 4]:
        cand = {**student_input, "studytime": st}
        cs = preprocessor.transform_standardized([cand])
        cr = preprocessor.transform_raw_numeric([cand])
        val = round(max(0.0, min(20.0, _run_single_model(selected_key, models_runtime, cs, cr))), 2)
        what_if_study.append({"label": study_Labels[st], "value": val, "active": int(student_input.get("studytime", 2)) == st})

    what_if_absences = []
    for ab in [0, 2, 6, 12, 22]:
        cand = {**student_input, "absences": ab}
        cs = preprocessor.transform_standardized([cand])
        cr = preprocessor.transform_raw_numeric([cand])
        val = round(max(0.0, min(20.0, _run_single_model(selected_key, models_runtime, cs, cr))), 2)
        what_if_absences.append({"label": f"{ab}d", "value": val})

    suggestions = _build_improvement_suggestions(student_input, predicted_grade, include_grades)
    classification = classify_grade(predicted_grade)

    return {
        "selectedModelKey": selected_key,
        "selectedModelName": models_report[selected_key]["name"],
        "predictedGrade": predicted_grade,
        "outOf": 20,
        "percentage": round((predicted_grade / 20.0) * 100.0, 1),
        "cohortAverage": round(models_runtime["y_train_mean"], 2),
        "deltaVsCohort": round(predicted_grade - models_runtime["y_train_mean"], 2),
        "classification": classification,
        "allModelPredictions": all_preds,
        "influencingFactors": impacts,
        "whatIfStudy": what_if_study,
        "whatIfAbsences": what_if_absences,
        "suggestions": suggestions,
    }


def _build_improvement_suggestions(
    student: Dict[str, Any],
    predicted_grade: float,
    include_grades: bool,
) -> List[Dict[str, str]]:
    suggestions: List[Dict[str, str]] = []

    studytime = int(float(student.get("studytime", 2)))
    absences = int(float(student.get("absences", 0)))
    failures = int(float(student.get("failures", 0)))
    schoolsup = str(student.get("schoolsup", "no")).lower()
    internet = str(student.get("internet", "yes")).lower()
    g1 = float(student.get("G1", 10))
    g2 = float(student.get("G2", 10))

    if studytime <= 2:
        next_band = "5–10 hours/week (Category 3)" if studytime == 2 else "2–5+ hours/week (Category 2–3)"
        suggestions.append({
            "title": "Increase Structured Weekly Study Blocks",
            "impact": "+1.1 to +1.9 pts potential",
            "detail": f"Moving from Study Category {studytime} to {next_band} with spaced problem-solving sessions shows strong positive lift in the UCI cohort.",
        })

    if absences >= 6:
        suggestions.append({
            "title": "Reduce Unexcused Weekly Absences",
            "impact": "+0.8 to +1.6 pts recovery",
            "detail": f"At {absences} absences, missed instructional continuity significantly depresses final exam readiness. Aim to cap term absences below 4.",
        })

    if failures >= 1:
        suggestions.append({
            "title": "Targeted Prerequisite Remediation",
            "impact": "High priority risk reducer",
            "detail": f"Past class failures ({failures}) are the strongest non-grade predictor of G3 drops. Schedule weekly diagnostic review on foundational topics.",
        })

    if include_grades and g2 < g1:
        suggestions.append({
            "title": "Reverse Mid-Term Grade Slippage (G1 → G2)",
            "impact": f"Recover {g1 - g2:.0f}-pt mid-term dip",
            "detail": f"Second period grade (G2 = {g2:.0f}) dropped below First period (G1 = {g1:.0f}). Immediate past-paper practice before final assessment prevents further compounding.",
        })
    elif include_grades and g2 < 11:
        suggestions.append({
            "title": "Consolidate Core Exam Topics Above 12/20",
            "impact": "+1.5 to +2.5 pts buffer",
            "detail": f"With G2 at {g2:.0f}/20, focus on high-frequency exam question types to build a safe margin above the 10/20 pass threshold.",
        })

    if predicted_grade < 12.0 and schoolsup == "no":
        suggestions.append({
            "title": "Enroll in School Extra Educational Support",
            "impact": "Structured tutoring support",
            "detail": "Enabling school supplemental tutoring provides guided homework feedback and early intervention checkpoints.",
        })

    if internet == "no":
        suggestions.append({
            "title": "Utilize School Library Digital Learning Access",
            "impact": "+0.6 to +1.0 pts cohort advantage",
            "detail": "Students without home internet benefit from reserving 3 weekly library/lab slots for interactive practice resources.",
        })

    if not suggestions:
        suggestions.append({
            "title": "Maintain High-Consistency Exam Preparation",
            "impact": "Sustain top-quartile standing",
            "detail": "Current study habits, attendance, and academic momentum are well-aligned. Incorporate timed mock assessments to target 17–20/20 distinction.",
        })
        suggestions.append({
            "title": "Peer Teaching & Advanced Problem Sets",
            "impact": "+0.5 to +1.0 pts mastery",
            "detail": "Reinforce conceptual depth through peer study leadership and synthesis problems ahead of final G3 evaluations.",
        })

    return suggestions[:4]
