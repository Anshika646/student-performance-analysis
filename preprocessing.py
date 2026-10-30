"""
preprocessing.py
----------------
Leakage-free train/test split and feature preprocessing pipeline for the
Student Performance Prediction System.

Supports two prediction modes:
1. 'with_grades': Uses demographic, behavioral, and prior period grades (G1, G2).
2. 'without_grades': Uses only demographic, family education, support, and study habits.

CRITICAL ML INVARIANT:
Imputation statistics (median/mode) and feature standardization parameters (mean/std)
are fitted EXCLUSIVELY on the training partition (X_train) after splitting, preventing
any test-set data leakage.
"""

import math
import random
from collections import Counter
from typing import Any, Dict, List, Tuple

BASE_FEATURES = [
    "age",
    "sex",
    "studytime",
    "failures",
    "absences",
    "Medu",
    "Fedu",
    "internet",
    "schoolsup",
]

GRADE_FEATURES = ["G1", "G2"]

FEATURE_LABELS = {
    "age": "Student Age",
    "sex": "Gender (Male=1)",
    "studytime": "Weekly Study Time",
    "failures": "Past Class Failures",
    "absences": "School Absences",
    "Medu": "Mother's Education",
    "Fedu": "Father's Education",
    "internet": "Home Internet Access",
    "schoolsup": "School Extra Support",
    "G1": "First Period Grade (G1)",
    "G2": "Second Period Grade (G2)",
}

CATEGORICAL_BINARY_MAPS = {
    "sex": {"F": 0.0, "M": 1.0},
    "internet": {"no": 0.0, "yes": 1.0},
    "schoolsup": {"no": 0.0, "yes": 1.0},
}


def get_feature_list(include_grades: bool, available_columns: List[str]) -> List[str]:
    """Return active feature list filtered to columns available in the dataset."""
    candidates = list(BASE_FEATURES) + (list(GRADE_FEATURES) if include_grades else [])
    selected = [f for f in candidates if f in available_columns]
    if not selected:
        # Fallback if custom CSV has distinct numeric columns besides G3
        selected = [c for c in available_columns if c != "G3"][:10]
    return selected


def train_test_split_rows(
    rows: List[Dict[str, Any]],
    test_size: float = 0.2,
    random_state: int = 42,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Deterministic shuffled train-test split performed BEFORE fitting any imputer or scaler.
    """
    test_ratio = max(0.1, min(0.4, float(test_size)))
    indices = list(range(len(rows)))
    rng = random.Random(int(random_state))
    rng.shuffle(indices)

    n_test = max(5, int(round(len(rows) * test_ratio)))
    test_indices = set(indices[:n_test])

    train_rows = [rows[i] for i in range(len(rows)) if i not in test_indices]
    test_rows = [rows[i] for i in range(len(rows)) if i in test_indices]
    return train_rows, test_rows


class StudentPreprocessor:
    """
    Leakage-free feature transformer that learns medians, modes, means, and standard
    deviations strictly from X_train, and transforms X_train, X_test, or live student inputs.
    """

    def __init__(self, features: List[str]):
        self.features = features
        self.medians: Dict[str, float] = {}
        self.category_maps: Dict[str, Dict[str, float]] = {}
        self.means: Dict[str, float] = {}
        self.stds: Dict[str, float] = {}
        self.raw_means: Dict[str, float] = {}
        self.is_fitted = False

    def _encode_raw_value(self, col: str, val: Any, fit_mode: bool = False) -> float:
        if col in CATEGORICAL_BINARY_MAPS:
            sval = str(val).strip()
            cmap = CATEGORICAL_BINARY_MAPS[col]
            if sval in cmap:
                return cmap[sval]
            sval_lower = sval.lower()
            for k, v in cmap.items():
                if k.lower() == sval_lower:
                    return v
            return 0.0

        if col in self.category_maps and not fit_mode:
            return self.category_maps[col].get(str(val).strip(), 0.0)

        try:
            return float(val)
        except (ValueError, TypeError):
            return self.medians.get(col, 0.0)

    def fit(self, train_rows: List[Dict[str, Any]]) -> "StudentPreprocessor":
        """Fit imputation and StandardScaler parameters exclusively on training data."""
        n = len(train_rows)
        if n == 0:
            raise ValueError("Cannot fit preprocessor on empty training set.")

        for col in self.features:
            if col in CATEGORICAL_BINARY_MAPS:
                encoded = [self._encode_raw_value(col, r.get(col)) for r in train_rows]
            else:
                numeric_vals = []
                is_numeric = True
                for r in train_rows:
                    try:
                        numeric_vals.append(float(r.get(col)))
                    except (ValueError, TypeError):
                        is_numeric = False
                        break

                if is_numeric and numeric_vals:
                    s_vals = sorted(numeric_vals)
                    mid = len(s_vals) // 2
                    self.medians[col] = (
                        s_vals[mid]
                        if len(s_vals) % 2 == 1
                        else (s_vals[mid - 1] + s_vals[mid]) / 2.0
                    )
                    encoded = numeric_vals
                else:
                    # Ordinal encoding learned from training frequencies
                    str_vals = [str(r.get(col, "")).strip() for r in train_rows]
                    uniq = [k for k, _ in Counter(str_vals).most_common()]
                    self.category_maps[col] = {k: float(idx) for idx, k in enumerate(uniq)}
                    encoded = [self.category_maps[col][v] for v in str_vals]

            mean_v = sum(encoded) / n
            var_v = sum((x - mean_v) ** 2 for x in encoded) / max(1, n)
            std_v = math.sqrt(var_v) if var_v > 1e-12 else 1.0

            self.raw_means[col] = mean_v
            self.means[col] = mean_v
            self.stds[col] = std_v

        self.is_fitted = True
        return self

    def transform_standardized(self, rows: List[Dict[str, Any]]) -> List[List[float]]:
        """Return standardized feature matrix (zero mean, unit variance using train stats)."""
        if not self.is_fitted:
            raise RuntimeError("StudentPreprocessor must be fitted on X_train before transform.")
        matrix: List[List[float]] = []
        for r in rows:
            vec = []
            for col in self.features:
                raw_v = self._encode_raw_value(col, r.get(col))
                vec.append((raw_v - self.means[col]) / self.stds[col])
            matrix.append(vec)
        return matrix

    def transform_raw_numeric(self, rows: List[Dict[str, Any]]) -> List[List[float]]:
        """Return encoded unscaled numeric feature matrix (useful for tree splits & interpretation)."""
        if not self.is_fitted:
            raise RuntimeError("StudentPreprocessor must be fitted on X_train before transform.")
        matrix: List[List[float]] = []
        for r in rows:
            vec = [self._encode_raw_value(col, r.get(col)) for col in self.features]
            matrix.append(vec)
        return matrix
