# Student Performance Analysis Dashboard

A beginner-friendly Data Analysis and Machine Learning project built with **Python**, **Pandas**, **NumPy**, **Matplotlib**, **Seaborn**, **Scikit-learn**, and **Streamlit**.

> **Dataset Notice:** The file `data/student_performance.csv` contains **synthetic sample data** (600 cleaned student records after removing duplicates and filling missing values) created for learning and portfolio demonstration. It does **not** contain real student records.

---

## Project Structure

- `app.py` — Main Streamlit dashboard with data cleaning, analysis, Matplotlib/Seaborn charts, and Linear Regression prediction.
- `data/student_performance.csv` — Synthetic student performance dataset (`Student ID`, `Gender`, `Study Hours`, `Attendance Percentage`, `Assignment Score`, `Previous Exam Score`, `Final Exam Score`, `Performance Category`).
- `requirements.txt` — Basic Python libraries needed to run the project.
- `README.md` — Project documentation, VS Code instructions, and interview preparation guide.

---

## How to Run in VS Code

1. **Open the project folder** in VS Code (`File` → `Open Folder...`).
2. **Open the integrated terminal** (`Ctrl + ~` on Windows/Linux or `Cmd + ~` on Mac).
3. **(Recommended) Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
4. **Install required libraries:**
   ```bash
   pip install -r requirements.txt
   ```
5. **Run the Streamlit dashboard:**
   ```bash
   streamlit run app.py
   ```
6. Your browser will open automatically at `http://localhost:8501`.

---

## Libraries & ML Concepts Explained Simply

- **Pandas (`pd`)**: Loads the CSV file into a table (DataFrame), checks missing values (`isnull().sum()`), checks duplicates (`duplicated().sum()`), removes duplicates (`drop_duplicates()`), and calculates group averages.
- **NumPy (`np`)**: Quickly computes summary numbers like mean (`np.mean`), minimum (`np.min`), and maximum (`np.max`).
- **Matplotlib (`plt`)**: The base Python plotting library used to create figure canvases, titles, and axis labels.
- **Seaborn (`sns`)**: Built on top of Matplotlib to make statistical charts (bar charts, histograms, scatter plots, box plots, and correlation heatmaps) cleaner and easier to read.
- **Scikit-learn (`sklearn`)**:
  - **Train-Test Split (`train_test_split`)**: Splits the data into 80% training data (to teach the model) and 20% testing data (to check how accurately it predicts unseen students).
  - **Linear Regression (`LinearRegression`)**: Finds the best straight-line relationship between input features (`Study Hours`, `Attendance Percentage`, `Assignment Score`, `Previous Exam Score`) and the target (`Final Exam Score`).
  - **MAE (Mean Absolute Error)**: The average difference (in marks) between the predicted score and the actual score. Lower is better.
  - **R² Score**: Measures how much of the variation in final exam scores is explained by the model (from `0` to `1`; closer to `1` is better).
- **Streamlit (`st`)**: Turns a plain Python script into an interactive web dashboard without needing HTML, CSS, or backend APIs.
