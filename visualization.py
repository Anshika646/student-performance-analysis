"""
visualization.py
----------------
Plotly, Matplotlib, and Seaborn chart builders for the Student Performance
Analytics & Prediction Dashboard (used when running via `streamlit run app.py`,
and also provides pre-aggregated EDA analytical summaries for interactive rendering).
"""

from collections import defaultdict
from typing import Any, Dict, List

try:
    import matplotlib.pyplot as plt  # type: ignore
    import pandas as pd  # type: ignore
    import plotly.express as px  # type: ignore
    import plotly.graph_objects as go  # type: ignore
    import seaborn as sns  # type: ignore

    HAS_VIZ_LIBS = True
except ImportError:
    HAS_VIZ_LIBS = False


STUDY_LABELS = {
    1: "< 2 hrs",
    2: "2–5 hrs",
    3: "5–10 hrs",
    4: "> 10 hrs",
}

EDU_LABELS = {
    0: "None (0)",
    1: "Primary (1)",
    2: "5th–9th (2)",
    3: "Secondary (3)",
    4: "Higher Ed (4)",
}


def compute_eda_aggregates(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compute exact data-driven chart series directly from the filtered UCI dataset rows
    so every visualization reflects real student observations.
    """
    if not rows:
        return {}

    n = len(rows)
    g3_vals = [float(r["G3"]) for r in rows]
    pass_count = sum(1 for g in g3_vals if g >= 10)

    # 1. Grade distribution (0..20)
    grade_bins = {g: 0 for g in range(21)}
    for g in g3_vals:
        ig = max(0, min(20, int(round(g))))
        grade_bins[ig] += 1
    grade_distribution = [
        {"grade": g, "count": grade_bins[g], "status": "Pass" if g >= 10 else "Fail"}
        for g in range(21)
    ]

    # 2. Study time vs Final Grade
    by_study = defaultdict(list)
    for r in rows:
        st = int(float(r.get("studytime", 2)))
        by_study[st].append(float(r["G3"]))
    study_vs_grade = []
    for st in sorted(by_study.keys()):
        arr = sorted(by_study[st])
        study_vs_grade.append({
            "studytime": st,
            "label": STUDY_LABELS.get(st, f"Level {st}"),
            "avgG3": round(sum(arr) / len(arr), 2),
            "medianG3": round(arr[len(arr) // 2], 2),
            "passRate": round(sum(1 for x in arr if x >= 10) * 100.0 / len(arr), 1),
            "count": len(arr),
        })

    # 3. Absences vs Performance (binned + scatter sample)
    absence_brackets = [
        ("0 days", lambda a: a == 0),
        ("1–3 days", lambda a: 1 <= a <= 3),
        ("4–7 days", lambda a: 4 <= a <= 7),
        ("8–14 days", lambda a: 8 <= a <= 14),
        ("15+ days", lambda a: a >= 15),
    ]
    absences_binned = []
    for label, pred in absence_brackets:
        arr = [float(r["G3"]) for r in rows if pred(int(float(r.get("absences", 0))))]
        if arr:
            absences_binned.append({
                "bracket": label,
                "avgG3": round(sum(arr) / len(arr), 2),
                "passRate": round(sum(1 for x in arr if x >= 10) * 100.0 / len(arr), 1),
                "count": len(arr),
            })

    # 4. Previous Failures vs Grades
    by_fail = defaultdict(list)
    for r in rows:
        fl = int(float(r.get("failures", 0)))
        by_fail[fl].append(float(r["G3"]))
    failures_vs_grade = [
        {
            "failures": f"{fl} failure{'s' if fl != 1 else ''}",
            "raw": fl,
            "avgG3": round(sum(arr) / len(arr), 2),
            "passRate": round(sum(1 for x in arr if x >= 10) * 100.0 / len(arr), 1),
            "count": len(arr),
        }
        for fl, arr in sorted(by_fail.items())
    ]

    # 5. Gender-wise performance
    by_sex = defaultdict(list)
    for r in rows:
        sx = str(r.get("sex", "F"))
        by_sex[sx].append(float(r["G3"]))
    gender_performance = [
        {
            "sex": sx,
            "label": "Female" if sx == "F" else ("Male" if sx == "M" else sx),
            "avgG3": round(sum(arr) / len(arr), 2),
            "passRate": round(sum(1 for x in arr if x >= 10) * 100.0 / len(arr), 1),
            "count": len(arr),
        }
        for sx, arr in sorted(by_sex.items())
    ]

    # 6. Age-wise performance
    by_age = defaultdict(list)
    for r in rows:
        ag = int(float(r.get("age", 17)))
        by_age[ag].append(float(r["G3"]))
    age_performance = [
        {
            "age": ag,
            "avgG3": round(sum(arr) / len(arr), 2),
            "passRate": round(sum(1 for x in arr if x >= 10) * 100.0 / len(arr), 1),
            "count": len(arr),
        }
        for ag, arr in sorted(by_age.items())
    ]

    # 7. Family education (Mother & Father max/avg education level) vs performance
    by_medu = defaultdict(list)
    by_fedu = defaultdict(list)
    for r in rows:
        if "Medu" in r:
            by_medu[int(float(r["Medu"]))].append(float(r["G3"]))
        if "Fedu" in r:
            by_fedu[int(float(r["Fedu"]))].append(float(r["G3"]))
    all_edu_levels = sorted(set(by_medu.keys()) | set(by_fedu.keys()))
    family_edu_performance = [
        {
            "level": lvl,
            "label": EDU_LABELS.get(lvl, f"Level {lvl}"),
            "motherAvgG3": round(sum(by_medu[lvl]) / len(by_medu[lvl]), 2) if by_medu[lvl] else 0.0,
            "fatherAvgG3": round(sum(by_fedu[lvl]) / len(by_fedu[lvl]), 2) if by_fedu[lvl] else 0.0,
            "motherCount": len(by_medu[lvl]),
            "fatherCount": len(by_fedu[lvl]),
        }
        for lvl in all_edu_levels
    ]

    # 8. Internet access vs performance
    by_net = defaultdict(list)
    for r in rows:
        net = str(r.get("internet", "yes")).lower()
        by_net[net].append(float(r["G3"]))
    internet_performance = [
        {
            "internet": k,
            "label": "Home Internet" if k == "yes" else "No Home Internet",
            "avgG3": round(sum(arr) / len(arr), 2),
            "passRate": round(sum(1 for x in arr if x >= 10) * 100.0 / len(arr), 1),
            "count": len(arr),
        }
        for k, arr in sorted(by_net.items(), reverse=True)
    ]

    return {
        "totalStudents": n,
        "avgG3": round(sum(g3_vals) / n, 2),
        "passRate": round(pass_count * 100.0 / n, 1),
        "highestG3": round(max(g3_vals), 1),
        "lowestG3": round(min(g3_vals), 1),
        "gradeDistribution": grade_distribution,
        "studyVsGrade": study_vs_grade,
        "absencesBinned": absences_binned,
        "failuresVsGrade": failures_vs_grade,
        "genderPerformance": gender_performance,
        "agePerformance": age_performance,
        "familyEduPerformance": family_edu_performance,
        "internetPerformance": internet_performance,
    }


# ============================================================================
# Plotly & Seaborn Figure Builders (Used by Streamlit `app.py`)
# ============================================================================

def apply_glass_plotly_layout(fig: Any, title: str = "") -> Any:
    """Apply transparent glassmorphism styling to Plotly figures."""
    fig.update_layout(
        title=dict(text=title, font=dict(size=15, color="#FFFFFF")),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Plus Jakarta Sans, sans-serif", color="#E2D9E8", size=12),
        margin=dict(l=24, r=24, t=44, b=24),
        xaxis=dict(gridcolor="rgba(255,255,255,0.07)", zerolinecolor="rgba(255,255,255,0.1)"),
        yaxis=dict(gridcolor="rgba(255,255,255,0.07)", zerolinecolor="rgba(255,255,255,0.1)"),
    )
    return fig


def plot_grade_gauge(predicted_grade: float) -> Any:
    """Build Plotly gauge chart for student predicted G3 out of 20."""
    if not HAS_VIZ_LIBS:
        return None
    fig = go.Figure(
        go.Indicator(
            mode="gauge+number",
            value=predicted_grade,
            number={"suffix": " / 20", "font": {"size": 34, "color": "#FFFFFF"}},
            gauge={
                "axis": {"range": [0, 20], "tickwidth": 1, "tickcolor": "#B8AABF"},
                "bar": {"color": "#F3A8CD"},
                "bgcolor": "rgba(255,255,255,0.05)",
                "borderwidth": 1,
                "bordercolor": "rgba(255,255,255,0.15)",
                "steps": [
                    {"range": [0, 10], "color": "rgba(244,63,94,0.22)"},
                    {"range": [10, 14], "color": "rgba(232,145,188,0.22)"},
                    {"range": [14, 20], "color": "rgba(52,211,153,0.22)"},
                ],
                "threshold": {
                    "line": {"color": "#FFFFFF", "width": 3},
                    "thickness": 0.75,
                    "value": 10.0,
                },
            },
        )
    )
    return apply_glass_plotly_layout(fig, "Predicted Final Grade (G3)")


def plot_seaborn_correlation_heatmap(df: Any, cols: List[str]) -> Any:
    """Build Matplotlib + Seaborn annotated correlation heatmap with transparent background."""
    if not HAS_VIZ_LIBS:
        return None
    fig, ax = plt.subplots(figsize=(8, 6), facecolor="none")
    ax.set_facecolor("none")
    corr = df[cols].corr()
    sns.heatmap(
        corr,
        annot=True,
        fmt=".2f",
        cmap="RdPu",
        vmin=-0.5,
        vmax=1.0,
        cbar=True,
        ax=ax,
        annot_kws={"size": 9},
    )
    ax.tick_params(colors="#FFFFFF")
    plt.tight_layout()
    return fig
