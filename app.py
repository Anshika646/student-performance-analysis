"""
Student Performance Analysis Dashboard
--------------------------------------
A beginner-friendly Data Analysis and Machine Learning dashboard built with
Python, Streamlit, Pandas, NumPy, Matplotlib, Seaborn, and Scikit-learn.

Note: The dataset used in this project (data/student_performance.csv) is
synthetic sample data created for learning and portfolio demonstration.
It does not contain real student records.
"""

import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score

# ---------------------------------------------------------
# 1. Page Configuration & Soft Blue / White / Purple Styling
# ---------------------------------------------------------
st.set_page_config(
    page_title="Student Performance Analysis",
    page_icon="🎓",
    layout="wide",
)

# Set a clean Seaborn visual style using soft blue and purple colors
sns.set_theme(style="whitegrid")
BLUE_COLOR = "#3B82F6"
PURPLE_COLOR = "#8B5CF6"
PALETTE_CATEGORIES = ["#7C3AED", "#3B82F6", "#60A5FA", "#A78BFA"]

# Simple CSS for clean white cards, soft blue/purple accents, and readable text
st.markdown(
    """
    <style>
    .stApp {
        background-color: #F8FAFC;
        color: #1E293B;
    }
    .kpi-card {
        background-color: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 18px 20px;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.06);
    }
    .kpi-label {
        font-size: 13px;
        color: #64748B;
        font-weight: 600;
        margin-bottom: 4px;
    }
    .kpi-value {
        font-size: 28px;
        color: #1E293B;
        font-weight: 700;
    }
    .info-box {
        background-color: #EFF6FF;
        border: 1px solid #BFDBFE;
        border-radius: 10px;
        padding: 14px 18px;
        color: #1E3A8A;
        font-size: 14px;
        margin-bottom: 16px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------
# 2. Load the Dataset with Pandas
# ---------------------------------------------------------
raw_df = pd.read_csv("data/student_performance.csv")

# Check missing values and duplicate rows BEFORE cleaning
missing_before = raw_df.isnull().sum()
total_missing_before = int(missing_before.sum())
duplicates_before = int(raw_df.duplicated().sum())

# Clean the data:
# Step A: Remove exact duplicate student rows
df = raw_df.drop_duplicates().copy()

# Step B: Fill missing numerical values with the column median
numeric_cols = [
    "Study Hours",
    "Attendance Percentage",
    "Assignment Score",
    "Previous Exam Score",
    "Final Exam Score",
]
for col in numeric_cols:
    if df[col].isnull().sum() > 0:
        median_val = df[col].median()
        df[col] = df[col].fillna(median_val)

# Verify missing values and duplicates AFTER cleaning
total_missing_after = int(df.isnull().sum().sum())
duplicates_after = int(df.duplicated().sum())

# ---------------------------------------------------------
# 3. Train a Simple Linear Regression Model (Scikit-learn)
# ---------------------------------------------------------
feature_cols = [
    "Study Hours",
    "Attendance Percentage",
    "Assignment Score",
    "Previous Exam Score",
]
target_col = "Final Exam Score"

model_trained = False
model = None
mae = 0.0
r2 = 0.0
train_count = 0
test_count = 0

try:
    X = df[feature_cols]
    y = df[target_col]

    # Split data: 80% for training the model, 20% for testing how well it generalizes
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    train_count = len(X_train)
    test_count = len(X_test)

    # Create and train the Linear Regression model
    model = LinearRegression()
    model.fit(X_train, y_train)

    # Predict on the unseen test data
    y_pred = model.predict(X_test)

    # Evaluate model accuracy with MAE and R² Score
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))
    model_trained = True
except Exception as err:
    st.error(f"Model training error: {err}")

# ---------------------------------------------------------
# 4. Sidebar Navigation
# ---------------------------------------------------------
st.sidebar.title("🎓 Student Analytics")
st.sidebar.caption("Beginner Data Analysis & ML Project")

page = st.sidebar.radio(
    "Choose a Section",
    [
        "Overview",
        "Data Cleaning & Analysis",
        "Visualizations",
        "Predict Final Score",
    ],
)

st.sidebar.markdown("---")
st.sidebar.info(
    "**Dataset Note:** This dashboard uses synthetic sample data "
    f"({len(df)} cleaned student records) created for learning and interviews, "
    "not real student records."
)

# ---------------------------------------------------------
# 5. Page 1: Overview
# ---------------------------------------------------------
if page == "Overview":
    st.title("Student Performance Analysis Dashboard")
    st.markdown(
        '<div class="info-box">'
        "<strong>Synthetic Data Notice:</strong> This dataset contains "
        f"<strong>{len(df)}</strong> synthetic student records created specifically for "
        "academic analysis and Machine Learning practice."
        "</div>",
        unsafe_allow_html=True,
    )

    # 4 KPI Cards using NumPy / Pandas averages
    total_students = len(df)
    avg_final = float(np.mean(df["Final Exam Score"]))
    avg_attendance = float(np.mean(df["Attendance Percentage"]))
    avg_study_hours = float(np.mean(df["Study Hours"]))

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(
            f'<div class="kpi-card"><div class="kpi-label">Total Students</div>'
            f'<div class="kpi-value">{total_students}</div></div>',
            unsafe_allow_html=True,
        )
    with col2:
        st.markdown(
            f'<div class="kpi-card"><div class="kpi-label">Average Final Score</div>'
            f'<div class="kpi-value">{avg_final:.1f} / 100</div></div>',
            unsafe_allow_html=True,
        )
    with col3:
        st.markdown(
            f'<div class="kpi-card"><div class="kpi-label">Average Attendance</div>'
            f'<div class="kpi-value">{avg_attendance:.1f}%</div></div>',
            unsafe_allow_html=True,
        )
    with col4:
        st.markdown(
            f'<div class="kpi-card"><div class="kpi-label">Average Study Hours</div>'
            f'<div class="kpi-value">{avg_study_hours:.1f} hrs/day</div></div>',
            unsafe_allow_html=True,
        )

    st.subheader("Sample Student Records")
    st.write("Here are the first 10 cleaned student records from our CSV file:")
    st.dataframe(df.head(10), use_container_width=True)

    st.subheader("Performance Category Breakdown")
    cat_counts = (
        df["Performance Category"]
        .value_counts()
        .reindex(["Excellent", "Good", "Average", "Needs Support"])
        .reset_index()
    )
    cat_counts.columns = ["Performance Category", "Number of Students"]
    st.dataframe(cat_counts, use_container_width=True)

# ---------------------------------------------------------
# 6. Page 2: Data Cleaning & Basic Analysis
# ---------------------------------------------------------
elif page == "Data Cleaning & Analysis":
    st.title("Data Cleaning & Exploratory Analysis")

    # Missing Values & Duplicate Records Check
    st.subheader("1. Data Cleaning Checks (Missing Values & Duplicates)")
    c1, c2 = st.columns(2)
    with c1:
        st.write(f"**Missing values found in raw CSV:** {total_missing_before}")
        st.write(f"**Missing values after median fill:** {total_missing_after}")
        st.dataframe(
            missing_before.reset_index().rename(
                columns={"index": "Column", 0: "Missing Values Found"}
            ),
            use_container_width=True,
        )
    with c2:
        st.write(f"**Raw rows loaded:** {len(raw_df)}")
        st.write(f"**Duplicate rows detected & removed:** {duplicates_before}")
        st.write(f"**Clean rows remaining:** {len(df)}")
        st.caption(
            "Simple explanation: We checked every column with `df.isnull().sum()` and "
            "filled missing numbers with the median (middle value). We checked for repeated "
            "rows using `df.duplicated().sum()` and removed them with `df.drop_duplicates()`."
        )

    st.markdown("---")

    # Average, Maximum, Minimum Marks
    st.subheader("2. Average, Maximum, and Minimum Marks")
    avg_score = float(np.mean(df["Final Exam Score"]))
    max_score = float(np.max(df["Final Exam Score"]))
    min_score = float(np.min(df["Final Exam Score"]))

    m1, m2, m3 = st.columns(3)
    m1.metric("Average Final Score", f"{avg_score:.2f}")
    m2.metric("Highest Final Score (Max)", f"{max_score:.1f}")
    m3.metric("Lowest Final Score (Min)", f"{min_score:.1f}")
    st.caption(
        "Simple explanation: Using NumPy (`np.mean`, `np.max`, `np.min`), we measure the "
        "typical class performance and the full range from lowest to highest score."
    )

    st.markdown("---")

    # Attendance & Study Hours Analysis
    st.subheader("3. Attendance & Study Hours Analysis")
    a1, a2 = st.columns(2)
    with a1:
        high_att = df[df["Attendance Percentage"] >= 75]["Final Exam Score"].mean()
        low_att = df[df["Attendance Percentage"] < 75]["Final Exam Score"].mean()
        st.write("**Attendance Impact**")
        st.write(f"- Students with ≥ 75% attendance average: **{high_att:.1f}**")
        st.write(f"- Students with < 75% attendance average: **{low_att:.1f}**")
        st.caption(
            "Students who attend class regularly tend to score noticeably higher on the final exam."
        )
    with a2:
        high_study = df[df["Study Hours"] >= 5]["Final Exam Score"].mean()
        low_study = df[df["Study Hours"] < 5]["Final Exam Score"].mean()
        st.write("**Study Hours Impact**")
        st.write(f"- Students studying ≥ 5 hrs/day average: **{high_study:.1f}**")
        st.write(f"- Students studying < 5 hrs/day average: **{low_study:.1f}**")
        st.caption(
            "Consistent daily study time shows a clear positive relationship with exam marks."
        )

    st.markdown("---")

    # Compare Performance Across Categories & Gender
    st.subheader("4. Performance Comparison")
    comp_cat = (
        df.groupby("Performance Category")[
            ["Study Hours", "Attendance Percentage", "Assignment Score", "Final Exam Score"]
        ]
        .mean()
        .round(1)
        .reindex(["Excellent", "Good", "Average", "Needs Support"])
    )
    st.dataframe(comp_cat, use_container_width=True)

    st.markdown("---")

    # Identify Students Needing Academic Support
    st.subheader("5. Students Who May Need Academic Support")
    support_df = df[
        (df["Final Exam Score"] < 50) | (df["Attendance Percentage"] < 75)
    ].sort_values(by="Final Exam Score")

    st.write(
        f"Found **{len(support_df)} students** with a Final Exam Score below 50 or "
        "Attendance below 75%."
    )
    st.dataframe(support_df.head(15), use_container_width=True)
    st.caption(
        "Simple explanation: Filtering with Pandas lets teachers quickly spot students "
        "with low attendance or low scores early so they can receive extra tutoring."
    )

# ---------------------------------------------------------
# 7. Page 3: Visualizations (Matplotlib & Seaborn)
# ---------------------------------------------------------
elif page == "Visualizations":
    st.title("Visualizations with Matplotlib & Seaborn")

    order_cats = ["Excellent", "Good", "Average", "Needs Support"]

    col1, col2 = st.columns(2)

    # Chart 1: Bar chart - Average marks by performance category
    with col1:
        st.subheader("1. Average Marks by Performance Category")
        fig1, ax1 = plt.subplots(figsize=(6, 4))
        sns.barplot(
            data=df,
            x="Performance Category",
            y="Final Exam Score",
            order=order_cats,
            palette=PALETTE_CATEGORIES,
            errorbar=None,
            ax=ax1,
        )
        ax1.set_title("Average Final Exam Score by Category", fontsize=12, fontweight="bold")
        ax1.set_xlabel("Performance Category")
        ax1.set_ylabel("Average Final Exam Score")
        st.pyplot(fig1)
        st.caption(
            "What this tells us: Compares the average final score across the four groups, "
            "clearly showing the gap between Excellent and Needs Support students."
        )

    # Chart 2: Histogram - Distribution of final exam scores
    with col2:
        st.subheader("2. Distribution of Final Exam Scores")
        fig2, ax2 = plt.subplots(figsize=(6, 4))
        sns.histplot(
            data=df,
            x="Final Exam Score",
            bins=15,
            kde=True,
            color=BLUE_COLOR,
            ax=ax2,
        )
        ax2.set_title("Distribution of Final Exam Scores", fontsize=12, fontweight="bold")
        ax2.set_xlabel("Final Exam Score")
        ax2.set_ylabel("Number of Students")
        st.pyplot(fig2)
        st.caption(
            "What this tells us: Shows how student exam scores are spread out and where most "
            "students fall (around the 60–80 range)."
        )

    col3, col4 = st.columns(2)

    # Chart 3: Scatter plot - Study hours vs final exam scores
    with col3:
        st.subheader("3. Study Hours vs Final Exam Scores")
        fig3, ax3 = plt.subplots(figsize=(6, 4))
        sns.scatterplot(
            data=df,
            x="Study Hours",
            y="Final Exam Score",
            hue="Performance Category",
            hue_order=order_cats,
            palette=PALETTE_CATEGORIES,
            alpha=0.75,
            ax=ax3,
        )
        ax3.set_title("Study Hours vs Final Exam Score", fontsize=12, fontweight="bold")
        ax3.set_xlabel("Study Hours (per day)")
        ax3.set_ylabel("Final Exam Score")
        st.pyplot(fig3)
        st.caption(
            "What this tells us: As daily study hours increase, final exam scores generally "
            "move upward — a clear positive relationship."
        )

    # Chart 4: Box plot - Scores across performance categories
    with col4:
        st.subheader("4. Scores Across Performance Categories")
        fig4, ax4 = plt.subplots(figsize=(6, 4))
        sns.boxplot(
            data=df,
            x="Performance Category",
            y="Final Exam Score",
            order=order_cats,
            palette=PALETTE_CATEGORIES,
            ax=ax4,
        )
        ax4.set_title("Score Spread Across Performance Categories", fontsize=12, fontweight="bold")
        ax4.set_xlabel("Performance Category")
        ax4.set_ylabel("Final Exam Score")
        st.pyplot(fig4)
        st.caption(
            "What this tells us: Displays the median (middle line), middle 50% range (box), "
            "and minimum/maximum spread inside each category."
        )

    # Chart 5: Correlation heatmap of numerical columns
    st.subheader("5. Correlation Heatmap of Numerical Columns")
    fig5, ax5 = plt.subplots(figsize=(8, 4.5))
    corr_matrix = df[numeric_cols].corr()
    sns.heatmap(
        corr_matrix,
        annot=True,
        fmt=".2f",
        cmap="BuPu",
        linewidths=0.5,
        ax=ax5,
    )
    ax5.set_title("Correlation Heatmap of Student Metrics", fontsize=12, fontweight="bold")
    st.pyplot(fig5)
    st.caption(
        "What this tells us: Correlation ranges from -1 to +1. Values close to +1 mean two "
        "variables rise together (for example, Previous Exam Score and Study Hours with Final Exam Score)."
    )

# ---------------------------------------------------------
# 8. Page 4: Basic Machine Learning (Linear Regression)
# ---------------------------------------------------------
elif page == "Predict Final Score":
    st.title("Linear Regression Score Predictor")
    st.write(
        "We use a single beginner-friendly **Linear Regression** model from Scikit-learn "
        "to predict a student's Final Exam Score."
    )

    if not model_trained or model is None:
        st.error("The Linear Regression model is not trained yet. Prediction is disabled.")
    else:
        # Show Train/Test Split & Evaluation Metrics
        k1, k2, k3, k4 = st.columns(4)
        k1.metric("Training Rows (80%)", train_count)
        k2.metric("Testing Rows (20%)", test_count)
        k3.metric("MAE (Mean Absolute Error)", f"{mae:.2f} pts")
        k4.metric("R² Score", f"{r2:.3f}")

        st.info(
            f"**How well did the model perform?** On average, predictions are within "
            f"**±{mae:.2f} marks** of the true exam score (MAE), and the model explains "
            f"**{r2 * 100:.1f}%** of the score variation (R² Score)."
        )

        # Interactive Prediction Form
        st.subheader("Predict a Student's Final Exam Score")
        with st.form("prediction_form"):
            c1, c2 = st.columns(2)
            with c1:
                study_hours_in = st.slider("Study Hours (per day)", 0.5, 10.0, 5.0, 0.5)
                attendance_in = st.slider("Attendance Percentage (%)", 40.0, 100.0, 85.0, 1.0)
            with c2:
                assignment_in = st.slider("Assignment Score (0–100)", 20.0, 100.0, 75.0, 1.0)
                prev_exam_in = st.slider("Previous Exam Score (0–100)", 20.0, 100.0, 72.0, 1.0)

            submitted = st.form_submit_button("Predict Final Exam Score")

        if submitted:
            user_input = pd.DataFrame(
                [[study_hours_in, attendance_in, assignment_in, prev_exam_in]],
                columns=feature_cols,
            )
            predicted_score = float(model.predict(user_input)[0])
            predicted_score = max(0.0, min(100.0, predicted_score))

            if predicted_score >= 80:
                pred_cat = "Excellent"
            elif predicted_score >= 65:
                pred_cat = "Good"
            elif predicted_score >= 50:
                pred_cat = "Average"
            else:
                pred_cat = "Needs Support"

            st.success(
                f"**Predicted Final Exam Score:** {predicted_score:.1f} / 100  "
                f"·  **Expected Category:** {pred_cat}"
            )
