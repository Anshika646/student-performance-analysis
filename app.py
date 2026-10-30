"""
app.py
------
Streamlit interactive dashboard entrypoint for local Python execution (`streamlit run app.py`).
Connects `data_loader.py`, `preprocessing.py`, `model_training.py`, `visualization.py`,
and `prediction.py` in a glassmorphism multi-page interface.
"""

import pandas as pd  # type: ignore
import plotly.express as px  # type: ignore
import streamlit as st  # type: ignore

from data_loader import load_and_clean_dataset
from model_training import train_and_evaluate_all_models
from prediction import predict_student_grade
from visualization import (
    apply_glass_plotly_layout,
    compute_eda_aggregates,
    plot_grade_gauge,
    plot_seaborn_correlation_heatmap,
)

st.set_page_config(
    page_title="EduPulse — Student Performance ML & Analytics",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .stApp {
        background: radial-gradient(circle at 15% 15%, #2a202f 0%, #1c1621 55%, #141018 100%);
        color: #f8f2f6;
    }
    .glass-card {
        background: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 20px;
        padding: 20px 24px;
        margin-bottom: 16px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


@st.cache_data
def get_dataset(dataset_key: str, custom_csv: str = ""):
    return load_and_clean_dataset(dataset_key=dataset_key, custom_csv_text=custom_csv or None)


def main():
    st.sidebar.markdown("## EduPulse ML")
    page = st.sidebar.radio(
        "Navigation",
        [
            "Overview",
            "Dataset Explorer",
            "Exploratory Data Analysis",
            "Model Training",
            "Student Prediction",
            "Model Insights",
        ],
    )

    st.sidebar.markdown("---")
    ds_choice = st.sidebar.selectbox(
        "Active Dataset",
        [("mat", "Mathematics (student-mat.csv)"), ("por", "Portuguese (student-por.csv)")],
        format_func=lambda x: x[1],
    )[0]

    uploaded = st.sidebar.file_uploader("Or Upload Custom CSV", type=["csv"])
    custom_text = uploaded.getvalue().decode("utf-8") if uploaded else ""

    dataset = get_dataset(ds_choice, custom_text)
    df = pd.DataFrame(dataset["rows"])

    # Global sidebar filters
    st.sidebar.markdown("### Cohort Filters")
    schools = ["All"] + sorted(df["school"].unique().tolist()) if "school" in df.columns else ["All"]
    sel_school = st.sidebar.selectbox("School", schools)
    sel_sex = st.sidebar.selectbox("Gender", ["All", "F", "M"])
    min_age, max_age = int(df["age"].min()), int(df["age"].max())
    sel_age = st.sidebar.slider("Age Range", min_age, max_age, (min_age, max_age))
    sel_study = st.sidebar.multiselect("Study Time Category", [1, 2, 3, 4], default=[1, 2, 3, 4])

    filtered_df = df.copy()
    if sel_school != "All" and "school" in filtered_df.columns:
        filtered_df = filtered_df[filtered_df["school"] == sel_school]
    if sel_sex != "All" and "sex" in filtered_df.columns:
        filtered_df = filtered_df[filtered_df["sex"] == sel_sex]
    filtered_df = filtered_df[(filtered_df["age"] >= sel_age[0]) & (filtered_df["age"] <= sel_age[1])]
    if sel_study and "studytime" in filtered_df.columns:
        filtered_df = filtered_df[filtered_df["studytime"].isin(sel_study)]

    eda = compute_eda_aggregates(filtered_df.to_dict(orient="records"))

    include_grades = st.sidebar.toggle("Include Prior Grades (G1 & G2)", value=True)
    eval_report, models_runtime = train_and_evaluate_all_models(
        dataset["rows"],
        dataset["columns"],
        include_grades=include_grades,
        test_size=0.2,
        random_state=42,
    )

    if page == "Overview":
        st.title("Student Performance Overview")
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Total Students", eda.get("totalStudents", 0))
        c2.metric("Average Final Grade (G3)", f"{eda.get('avgG3', 0):.2f} / 20")
        c3.metric("Pass Percentage (G3 >= 10)", f"{eda.get('passRate', 0):.1f}%")
        c4.metric("Highest Final Grade", f"{eda.get('highestG3', 0):.0f} / 20")

        dist_df = pd.DataFrame(eda.get("gradeDistribution", []))
        if not dist_df.empty:
            fig = px.bar(
                dist_df,
                x="grade",
                y="count",
                color="status",
                color_discrete_map={"Pass": "#F3A8CD", "Fail": "#8A6D8B"},
            )
            st.plotly_chart(apply_glass_plotly_layout(fig, "Final Grade (G3) Distribution"), use_container_width=True)

    elif page == "Dataset Explorer":
        st.title("Dataset Explorer")
        st.caption(
            f"{dataset['datasetLabel']} · {dataset['rowCount']} rows · {dataset['columnCount']} columns · "
            f"Duplicates removed: {dataset['duplicatesRemoved']} · Missing imputed: {dataset['totalMissingImputed']}"
        )
        st.dataframe(filtered_df, use_container_width=True)
        st.subheader("Summary Statistics & Data Types")
        st.dataframe(pd.DataFrame(dataset["columnStats"]), use_container_width=True)

    elif page == "Exploratory Data Analysis":
        st.title("Exploratory Data Analysis")
        col1, col2 = st.columns(2)
        with col1:
            fig1 = px.bar(pd.DataFrame(eda["studyVsGrade"]), x="label", y="avgG3", color_discrete_sequence=["#F3A8CD"])
            st.plotly_chart(apply_glass_plotly_layout(fig1, "Study Time vs Average Final Grade"), use_container_width=True)

            fig3 = px.bar(pd.DataFrame(eda["failuresVsGrade"]), x="failures", y="avgG3", color_discrete_sequence=["#D58AB5"])
            st.plotly_chart(apply_glass_plotly_layout(fig3, "Previous Failures vs Final Grade"), use_container_width=True)

            fig5 = px.line(pd.DataFrame(eda["agePerformance"]), x="age", y="avgG3", markers=True)
            st.plotly_chart(apply_glass_plotly_layout(fig5, "Age-wise Performance"), use_container_width=True)

        with col2:
            fig2 = px.bar(pd.DataFrame(eda["absencesBinned"]), x="bracket", y="avgG3", color_discrete_sequence=["#C084FC"])
            st.plotly_chart(apply_glass_plotly_layout(fig2, "Absences vs Final Grade"), use_container_width=True)

            fig4 = px.bar(pd.DataFrame(eda["genderPerformance"]), x="label", y="avgG3", color_discrete_sequence=["#F9A8D4"])
            st.plotly_chart(apply_glass_plotly_layout(fig4, "Gender-wise Performance"), use_container_width=True)

            fig6 = px.bar(pd.DataFrame(eda["internetPerformance"]), x="label", y="avgG3", color_discrete_sequence=["#67E8F9"])
            st.plotly_chart(apply_glass_plotly_layout(fig6, "Internet Access vs Performance"), use_container_width=True)

        st.subheader("Correlation Heatmap (Seaborn)")
        hm_fig = plot_seaborn_correlation_heatmap(filtered_df, dataset["correlationColumns"])
        if hm_fig is not None:
            st.pyplot(hm_fig)

    elif page == "Model Training":
        st.title("Supervised Model Training & Evaluation")
        st.info(eval_report["bestModelExplanation"])
        comp_rows = [
            {
                "Model": m["name"],
                "Test R²": m["testMetrics"]["r2"],
                "Test MAE": m["testMetrics"]["mae"],
                "Test RMSE": m["testMetrics"]["rmse"],
                "Train R²": m["trainMetrics"]["r2"],
            }
            for m in eval_report["models"].values()
        ]
        comp_df = pd.DataFrame(comp_rows)
        st.dataframe(comp_df, use_container_width=True)
        fig = px.bar(comp_df, x="Model", y=["Test R²", "Test MAE", "Test RMSE"], barmode="group")
        st.plotly_chart(apply_glass_plotly_layout(fig, "Model Comparison on Unseen Test Split"), use_container_width=True)

    elif page == "Student Prediction":
        st.title("Interactive Student Grade Prediction")
        with st.form("pred_form"):
            c1, c2, c3 = st.columns(3)
            model_sel = c1.selectbox(
                "Regression Algorithm",
                [
                    ("random_forest", "Random Forest Regressor"),
                    ("linear_regression", "Linear Regression"),
                    ("decision_tree", "Decision Tree Regressor"),
                ],
                format_func=lambda x: x[1],
            )[0]
            age = c1.slider("Age", 15, 22, 17)
            sex = c1.selectbox("Gender", ["F", "M"])
            studytime = c2.selectbox("Study Hours Category", [1, 2, 3, 4], index=1)
            absences = c2.slider("Term Absences", 0, 50, 4)
            failures = c2.selectbox("Previous Failures", [0, 1, 2, 3], index=0)
            medu = c3.selectbox("Mother's Education (0-4)", [0, 1, 2, 3, 4], index=3)
            fedu = c3.selectbox("Father's Education (0-4)", [0, 1, 2, 3, 4], index=2)
            internet = c3.selectbox("Internet Access", ["yes", "no"])
            schoolsup = c3.selectbox("School Extra Support", ["no", "yes"])

            g1, g2 = 12, 12
            if include_grades:
                gc1, gc2 = st.columns(2)
                g1 = gc1.slider("First Period Grade (G1)", 0, 20, 12)
                g2 = gc2.slider("Second Period Grade (G2)", 0, 20, 13)

            submitted = st.form_submit_button("Predict Final Grade")

        if submitted:
            res = predict_student_grade(
                {
                    "age": age,
                    "sex": sex,
                    "studytime": studytime,
                    "absences": absences,
                    "failures": failures,
                    "Medu": medu,
                    "Fedu": fedu,
                    "internet": internet,
                    "schoolsup": schoolsup,
                    "G1": g1,
                    "G2": g2,
                },
                model_sel,
                models_runtime,
                eval_report["models"],
            )
            st.plotly_chart(plot_grade_gauge(res["predictedGrade"]), use_container_width=True)
            st.success(f"Category: {res['classification']['category']} — {res['classification']['summary']}")
            for s in res["suggestions"]:
                st.write(f"- **{s['title']}** ({s['impact']}): {s['detail']}")

    elif page == "Model Insights":
        st.title("Model Diagnostics & Feature Importance")
        sel = st.selectbox(
            "Inspect Model",
            ["random_forest", "linear_regression", "decision_tree"],
        )
        mdata = eval_report["models"][sel]
        fi_df = pd.DataFrame(mdata["featureImportance"])
        fig_fi = px.bar(fi_df, x="percentage", y="label", orientation="h", color_discrete_sequence=["#F3A8CD"])
        st.plotly_chart(apply_glass_plotly_layout(fig_fi, f"Feature Importance (%) — {mdata['name']}"), use_container_width=True)

        avp_df = pd.DataFrame(mdata["actualVsPredicted"])
        fig_sc = px.scatter(avp_df, x="actual", y="predicted", color_discrete_sequence=["#F9A8D4"])
        st.plotly_chart(apply_glass_plotly_layout(fig_sc, "Actual vs Predicted G3 (Test Split)"), use_container_width=True)


if __name__ == "__main__":
    main()
