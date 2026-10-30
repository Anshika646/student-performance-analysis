"""
model_training.py
-----------------
Trains and evaluates four supervised regression algorithms on the UCI Student
Performance dataset to predict G3 (final grade, 0-20):
1. Linear Regression (Ordinary Least Squares on standardized training features)
2. Random Forest Regressor (Bootstrap aggregating ensemble of CART trees)
3. Decision Tree Regressor (CART variance-reduction recursive binary partitioning)
4. Gradient Boosting Regressor (Stagewise additive regression trees fitting residuals)

Includes 5-Fold Cross-Validation strictly within the training split (zero test-set leakage),
held-out test evaluation (R², MAE, RMSE), residual diagnostics, and feature importances.
"""

import math
import random
from typing import Any, Dict, List, Optional, Tuple

from preprocessing import FEATURE_LABELS, StudentPreprocessor, get_feature_list, train_test_split_rows

try:
    import numpy as np  # type: ignore
    from sklearn.ensemble import (  # type: ignore
        GradientBoostingRegressor as SklearnGBR,
        RandomForestRegressor as SklearnRF,
    )
    from sklearn.linear_model import LinearRegression as SklearnLR  # type: ignore
    from sklearn.model_selection import KFold  # type: ignore
    from sklearn.tree import DecisionTreeRegressor as SklearnDT  # type: ignore

    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


# ============================================================================
# Exact Mathematical Regression Implementations
# ============================================================================

class PureLinearRegression:
    """Ordinary Least Squares Linear Regressor solved via Gaussian elimination with partial pivoting."""

    def __init__(self):
        self.coef_: List[float] = []
        self.intercept_: float = 0.0

    def fit(self, X: List[List[float]], y: List[float]) -> "PureLinearRegression":
        n = len(X)
        p = len(X[0])
        dim = p + 1
        A = [[0.0] * dim for _ in range(dim)]
        b = [0.0] * dim

        for i in range(n):
            row = [1.0] + X[i]
            yi = y[i]
            for j in range(dim):
                b[j] += row[j] * yi
                rj = row[j]
                for k in range(j, dim):
                    A[j][k] += rj * row[k]

        for j in range(dim):
            for k in range(j):
                A[j][k] = A[k][j]
            if j > 0:
                A[j][j] += 1e-6

        beta = _solve_linear_system(A, b)
        self.intercept_ = beta[0]
        self.coef_ = beta[1:]
        return self

    def predict(self, X: List[List[float]]) -> List[float]:
        return [
            self.intercept_ + sum(c * xj for c, xj in zip(self.coef_, row))
            for row in X
        ]


def _solve_linear_system(A: List[List[float]], b: List[float]) -> List[float]:
    n = len(b)
    M = [row[:] + [b[i]] for i, row in enumerate(A)]
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(M[r][col]))
        M[col], M[pivot] = M[pivot], M[col]
        denom = M[col][col]
        if abs(denom) < 1e-12:
            continue
        for j in range(col, n + 1):
            M[col][j] /= denom
        for r in range(n):
            if r != col and abs(M[r][col]) > 0:
                factor = M[r][col]
                for j in range(col, n + 1):
                    M[r][j] -= factor * M[col][j]
    return [M[i][n] for i in range(n)]


class _CARTNode:
    __slots__ = ("value", "feature", "threshold", "left", "right")

    def __init__(
        self,
        value: float,
        feature: Optional[int] = None,
        threshold: Optional[float] = None,
        left: Optional["_CARTNode"] = None,
        right: Optional["_CARTNode"] = None,
    ):
        self.value = value
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right


class PureDecisionTreeRegressor:
    """Exact CART Regression Tree minimizing Mean Squared Error."""

    def __init__(
        self,
        max_depth: int = 6,
        min_samples_split: int = 8,
        min_samples_leaf: int = 3,
        max_features: Optional[int] = None,
        random_state: int = 42,
    ):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.min_samples_leaf = min_samples_leaf
        self.max_features = max_features
        self.rng = random.Random(random_state)
        self.root: Optional[_CARTNode] = None
        self.feature_importances_: List[float] = []

    def fit(self, X: List[List[float]], y: List[float]) -> "PureDecisionTreeRegressor":
        n_features = len(X[0])
        self._raw_importances = [0.0] * n_features
        indices = list(range(len(X)))
        self.root = self._build(X, y, indices, depth=0)
        total_imp = sum(self._raw_importances)
        if total_imp > 0:
            self.feature_importances_ = [imp / total_imp for imp in self._raw_importances]
        else:
            self.feature_importances_ = [1.0 / n_features] * n_features
        return self

    def _build(self, X: List[List[float]], y: List[float], idxs: List[int], depth: int) -> _CARTNode:
        n = len(idxs)
        sum_y = sum(y[i] for i in idxs)
        mean_y = sum_y / n
        if depth >= self.max_depth or n < self.min_samples_split:
            return _CARTNode(value=mean_y)

        sum_sq_y = sum(y[i] * y[i] for i in idxs)
        parent_sse = sum_sq_y - (sum_y * sum_y) / n
        if parent_sse <= 1e-9:
            return _CARTNode(value=mean_y)

        n_features = len(X[0])
        if self.max_features and self.max_features < n_features:
            candidate_features = self.rng.sample(range(n_features), self.max_features)
        else:
            candidate_features = list(range(n_features))

        best_gain = 0.0
        best_feat = None
        best_thresh = None
        best_left: List[int] = []
        best_right: List[int] = []

        for feat in candidate_features:
            sorted_idxs = sorted(idxs, key=lambda i: X[i][feat])
            left_sum = 0.0
            left_sq = 0.0
            for k in range(n - 1):
                i_curr = sorted_idxs[k]
                yi = y[i_curr]
                left_sum += yi
                left_sq += yi * yi
                n_left = k + 1
                n_right = n - n_left

                if n_left < self.min_samples_leaf or n_right < self.min_samples_leaf:
                    continue
                v_curr = X[i_curr][feat]
                v_next = X[sorted_idxs[k + 1]][feat]
                if v_curr == v_next:
                    continue

                right_sum = sum_y - left_sum
                right_sq = sum_sq_y - left_sq

                left_sse = left_sq - (left_sum * left_sum) / n_left
                right_sse = right_sq - (right_sum * right_sum) / n_right
                gain = parent_sse - (left_sse + right_sse)

                if gain > best_gain:
                    best_gain = gain
                    best_feat = feat
                    best_thresh = 0.5 * (v_curr + v_next)
                    best_left = sorted_idxs[:n_left]
                    best_right = sorted_idxs[n_left:]

        if best_feat is None or best_thresh is None or best_gain <= 1e-9:
            return _CARTNode(value=mean_y)

        self._raw_importances[best_feat] += best_gain
        left_child = self._build(X, y, best_left, depth + 1)
        right_child = self._build(X, y, best_right, depth + 1)
        return _CARTNode(
            value=mean_y,
            feature=best_feat,
            threshold=best_thresh,
            left=left_child,
            right=right_child,
        )

    def _predict_one(self, row: List[float]) -> float:
        node = self.root
        while node is not None and node.feature is not None and node.threshold is not None:
            if row[node.feature] <= node.threshold:
                node = node.left
            else:
                node = node.right
        return node.value if node is not None else 0.0

    def predict(self, X: List[List[float]]) -> List[float]:
        return [self._predict_one(row) for row in X]


class PureRandomForestRegressor:
    """Bootstrap Aggregating + Random Subspace Ensemble of CART Regression Trees."""

    def __init__(
        self,
        n_estimators: int = 35,
        max_depth: int = 8,
        min_samples_split: int = 6,
        min_samples_leaf: int = 2,
        random_state: int = 42,
    ):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.min_samples_leaf = min_samples_leaf
        self.random_state = random_state
        self.trees: List[PureDecisionTreeRegressor] = []
        self.feature_importances_: List[float] = []

    def fit(self, X: List[List[float]], y: List[float]) -> "PureRandomForestRegressor":
        n_samples = len(X)
        n_features = len(X[0])
        max_feat = max(2, int(round(n_features * 0.75)))
        rng = random.Random(self.random_state)

        self.trees = []
        agg_imp = [0.0] * n_features

        for t in range(self.n_estimators):
            boot_idxs = [rng.randrange(n_samples) for _ in range(n_samples)]
            X_boot = [X[i] for i in boot_idxs]
            y_boot = [y[i] for i in boot_idxs]

            tree = PureDecisionTreeRegressor(
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split,
                min_samples_leaf=self.min_samples_leaf,
                max_features=max_feat,
                random_state=self.random_state + t * 17 + 1,
            )
            tree.fit(X_boot, y_boot)
            self.trees.append(tree)
            for j, imp in enumerate(tree.feature_importances_):
                agg_imp[j] += imp

        total_imp = sum(agg_imp)
        self.feature_importances_ = (
            [v / total_imp for v in agg_imp] if total_imp > 0 else [1.0 / n_features] * n_features
        )
        return self

    def predict(self, X: List[List[float]]) -> List[float]:
        n_trees = len(self.trees)
        all_preds = [tree.predict(X) for tree in self.trees]
        return [
            sum(all_preds[t][i] for t in range(n_trees)) / n_trees
            for i in range(len(X))
        ]


class PureGradientBoostingRegressor:
    """
    Stagewise Additive Gradient Boosted Regression Trees minimizing Squared Error Loss
    via sequential pseudo-residual fitting: F_m(x) = F_{m-1}(x) + lr * h_m(x).
    """

    def __init__(
        self,
        n_estimators: int = 35,
        learning_rate: float = 0.12,
        max_depth: int = 3,
        min_samples_leaf: int = 4,
        random_state: int = 42,
    ):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.min_samples_leaf = min_samples_leaf
        self.random_state = random_state
        self.init_mean_: float = 0.0
        self.trees: List[PureDecisionTreeRegressor] = []
        self.feature_importances_: List[float] = []

    def fit(self, X: List[List[float]], y: List[float]) -> "PureGradientBoostingRegressor":
        n_samples = len(X)
        n_features = len(X[0])
        self.init_mean_ = sum(y) / n_samples
        current_pred = [self.init_mean_] * n_samples
        self.trees = []
        agg_imp = [0.0] * n_features

        for m in range(self.n_estimators):
            residuals = [y[i] - current_pred[i] for i in range(n_samples)]
            tree = PureDecisionTreeRegressor(
                max_depth=self.max_depth,
                min_samples_split=max(6, self.min_samples_leaf * 2),
                min_samples_leaf=self.min_samples_leaf,
                random_state=self.random_state + m * 13,
            ).fit(X, residuals)
            step_pred = tree.predict(X)
            for i in range(n_samples):
                current_pred[i] += self.learning_rate * step_pred[i]
            self.trees.append(tree)
            for j, imp in enumerate(tree.feature_importances_):
                agg_imp[j] += imp

        total_imp = sum(agg_imp)
        self.feature_importances_ = (
            [v / total_imp for v in agg_imp] if total_imp > 0 else [1.0 / n_features] * n_features
        )
        return self

    def predict(self, X: List[List[float]]) -> List[float]:
        out = [self.init_mean_] * len(X)
        for tree in self.trees:
            t_preds = tree.predict(X)
            for i in range(len(X)):
                out[i] += self.learning_rate * t_preds[i]
        return out


# ============================================================================
# Evaluation Metrics, K-Fold Cross Validation & Unified Training Pipeline
# ============================================================================

def compute_regression_metrics(y_true: List[float], y_pred: List[float]) -> Dict[str, float]:
    """Compute exact R² Score, Mean Absolute Error (MAE), and Root Mean Squared Error (RMSE)."""
    n = len(y_true)
    mean_true = sum(y_true) / n
    ss_tot = sum((yt - mean_true) ** 2 for yt in y_true)
    ss_res = sum((yt - yp) ** 2 for yt, yp in zip(y_true, y_pred))
    mae = sum(abs(yt - yp) for yt, yp in zip(y_true, y_pred)) / n
    rmse = math.sqrt(ss_res / n)
    r2 = 1.0 - (ss_res / ss_tot) if ss_tot > 1e-12 else 0.0
    return {
        "r2": round(r2, 4),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
    }


def _compute_5fold_cv(
    train_rows: List[Dict[str, Any]],
    features: List[str],
    random_state: int,
    max_depth: int,
) -> Dict[str, Dict[str, float]]:
    """
    Run leakage-free 5-Fold Cross-Validation strictly inside train_rows.
    Each fold fits its own StudentPreprocessor strictly on the 4 training folds.
    """
    n = len(train_rows)
    k = 5
    idxs = list(range(n))
    rng = random.Random(random_state + 99)
    rng.shuffle(idxs)
    fold_size = max(1, n // k)

    scores: Dict[str, List[float]] = {
        "linear_regression": [],
        "random_forest": [],
        "decision_tree": [],
        "gradient_boosting": [],
    }

    for fold in range(k):
        start = fold * fold_size
        end = n if fold == k - 1 else (fold + 1) * fold_size
        val_set = set(idxs[start:end])
        tr_sub = [train_rows[i] for i in range(n) if i not in val_set]
        va_sub = [train_rows[i] for i in range(n) if i in val_set]
        if len(va_sub) < 4 or len(tr_sub) < 10:
            continue

        prep = StudentPreprocessor(features=features).fit(tr_sub)
        X_tr_s = prep.transform_standardized(tr_sub)
        X_va_s = prep.transform_standardized(va_sub)
        X_tr_r = prep.transform_raw_numeric(tr_sub)
        X_va_r = prep.transform_raw_numeric(va_sub)
        y_tr = [float(r["G3"]) for r in tr_sub]
        y_va = [float(r["G3"]) for r in va_sub]

        lr_p = [max(0.0, min(20.0, v)) for v in PureLinearRegression().fit(X_tr_s, y_tr).predict(X_va_s)]
        rf_p = [
            max(0.0, min(20.0, v))
            for v in PureRandomForestRegressor(
                n_estimators=10, max_depth=max_depth + 1, random_state=random_state + fold
            )
            .fit(X_tr_r, y_tr)
            .predict(X_va_r)
        ]
        dt_p = [
            max(0.0, min(20.0, v))
            for v in PureDecisionTreeRegressor(max_depth=max_depth, random_state=random_state + fold)
            .fit(X_tr_r, y_tr)
            .predict(X_va_r)
        ]
        gb_p = [
            max(0.0, min(20.0, v))
            for v in PureGradientBoostingRegressor(
                n_estimators=14, learning_rate=0.14, max_depth=3, random_state=random_state + fold
            )
            .fit(X_tr_r, y_tr)
            .predict(X_va_r)
        ]

        scores["linear_regression"].append(compute_regression_metrics(y_va, lr_p)["r2"])
        scores["random_forest"].append(compute_regression_metrics(y_va, rf_p)["r2"])
        scores["decision_tree"].append(compute_regression_metrics(y_va, dt_p)["r2"])
        scores["gradient_boosting"].append(compute_regression_metrics(y_va, gb_p)["r2"])

    out: Dict[str, Dict[str, float]] = {}
    for key, arr in scores.items():
        if not arr:
            out[key] = {"meanR2": 0.0, "stdR2": 0.0}
        else:
            m = sum(arr) / len(arr)
            std = math.sqrt(sum((x - m) ** 2 for x in arr) / max(1, len(arr) - 1))
            out[key] = {"meanR2": round(m, 4), "stdR2": round(std, 4)}
    return out


def build_residual_histogram(residuals: List[float], bins: int = 11) -> List[Dict[str, Any]]:
    """Bin test-set residuals (Actual - Predicted) for residual normality diagnostics."""
    if not residuals:
        return []
    lo = min(residuals)
    hi = max(residuals)
    spread = max(abs(lo), abs(hi), 2.5)
    lo_b, hi_b = -spread, spread
    step = (hi_b - lo_b) / bins
    counts = [0] * bins
    for r in residuals:
        idx = int((r - lo_b) / step)
        idx = max(0, min(bins - 1, idx))
        counts[idx] += 1
    result = []
    for b in range(bins):
        b_start = lo_b + b * step
        b_end = b_start + step
        center = 0.5 * (b_start + b_end)
        result.append({
            "binLabel": f"{center:+.1f}",
            "binCenter": round(center, 2),
            "range": f"[{b_start:+.1f}, {b_end:+.1f})",
            "count": counts[b],
        })
    return result


def train_and_evaluate_all_models(
    rows: List[Dict[str, Any]],
    available_columns: List[str],
    include_grades: bool = True,
    test_size: float = 0.2,
    random_state: int = 42,
    max_depth: int = 6,
    n_estimators: int = 40,
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Execute leakage-free train/test split, 5-fold cross-validation on X_train,
    and test-set evaluation for Linear Regression, Random Forest, Decision Tree,
    and Gradient Boosting Regressors.
    """
    features = get_feature_list(include_grades=include_grades, available_columns=available_columns)

    # 1. Split BEFORE fitting preprocessing to strictly prevent test leakage
    train_rows, test_rows = train_test_split_rows(rows, test_size=test_size, random_state=random_state)

    preprocessor = StudentPreprocessor(features=features).fit(train_rows)

    X_train_std = preprocessor.transform_standardized(train_rows)
    X_test_std = preprocessor.transform_standardized(test_rows)

    X_train_raw = preprocessor.transform_raw_numeric(train_rows)
    X_test_raw = preprocessor.transform_raw_numeric(test_rows)

    y_train = [float(r["G3"]) for r in train_rows]
    y_test = [float(r["G3"]) for r in test_rows]

    cv_summary = _compute_5fold_cv(train_rows, features, int(random_state), int(max_depth))

    models_runtime: Dict[str, Any] = {}
    models_report: Dict[str, Any] = {}

    if HAS_SKLEARN:
        X_tr_std_np = np.array(X_train_std)
        X_te_std_np = np.array(X_test_std)
        X_tr_raw_np = np.array(X_train_raw)
        X_te_raw_np = np.array(X_test_raw)
        y_tr_np = np.array(y_train)

        lr = SklearnLR().fit(X_tr_std_np, y_tr_np)
        lr_train_pred = [float(x) for x in lr.predict(X_tr_std_np)]
        lr_test_pred = [float(x) for x in lr.predict(X_te_std_np)]
        abs_coefs = [abs(float(c)) for c in lr.coef_]
        coef_sum = sum(abs_coefs) or 1.0
        lr_imp = [c / coef_sum for c in abs_coefs]
        lr_signed_coefs = [float(c) for c in lr.coef_]

        rf = SklearnRF(
            n_estimators=int(n_estimators),
            max_depth=int(max_depth) + 2,
            min_samples_split=6,
            min_samples_leaf=2,
            random_state=int(random_state),
        ).fit(X_tr_raw_np, y_tr_np)
        rf_train_pred = [float(x) for x in rf.predict(X_tr_raw_np)]
        rf_test_pred = [float(x) for x in rf.predict(X_te_raw_np)]
        rf_imp = [float(x) for x in rf.feature_importances_]

        dt = SklearnDT(
            max_depth=int(max_depth),
            min_samples_split=8,
            min_samples_leaf=3,
            random_state=int(random_state),
        ).fit(X_tr_raw_np, y_tr_np)
        dt_train_pred = [float(x) for x in dt.predict(X_tr_raw_np)]
        dt_test_pred = [float(x) for x in dt.predict(X_te_raw_np)]
        dt_imp = [float(x) for x in dt.feature_importances_]

        gb = SklearnGBR(
            n_estimators=max(25, int(n_estimators)),
            learning_rate=0.12,
            max_depth=3,
            min_samples_leaf=4,
            random_state=int(random_state),
        ).fit(X_tr_raw_np, y_tr_np)
        gb_train_pred = [float(x) for x in gb.predict(X_tr_raw_np)]
        gb_test_pred = [float(x) for x in gb.predict(X_te_raw_np)]
        gb_imp = [float(x) for x in gb.feature_importances_]
    else:
        lr = PureLinearRegression().fit(X_train_std, y_train)
        lr_train_pred = lr.predict(X_train_std)
        lr_test_pred = lr.predict(X_test_std)
        abs_coefs = [abs(c) for c in lr.coef_]
        coef_sum = sum(abs_coefs) or 1.0
        lr_imp = [c / coef_sum for c in abs_coefs]
        lr_signed_coefs = list(lr.coef_)

        rf = PureRandomForestRegressor(
            n_estimators=int(n_estimators),
            max_depth=int(max_depth) + 2,
            min_samples_split=6,
            min_samples_leaf=2,
            random_state=int(random_state),
        ).fit(X_train_raw, y_train)
        rf_train_pred = rf.predict(X_train_raw)
        rf_test_pred = rf.predict(X_test_raw)
        rf_imp = rf.feature_importances_

        dt = PureDecisionTreeRegressor(
            max_depth=int(max_depth),
            min_samples_split=8,
            min_samples_leaf=3,
            random_state=int(random_state),
        ).fit(X_train_raw, y_train)
        dt_train_pred = dt.predict(X_train_raw)
        dt_test_pred = dt.predict(X_test_raw)
        dt_imp = dt.feature_importances_

        gb = PureGradientBoostingRegressor(
            n_estimators=max(25, int(n_estimators)),
            learning_rate=0.12,
            max_depth=3,
            min_samples_leaf=4,
            random_state=int(random_state),
        ).fit(X_train_raw, y_train)
        gb_train_pred = gb.predict(X_train_raw)
        gb_test_pred = gb.predict(X_test_raw)
        gb_imp = gb.feature_importances_

    models_runtime = {
        "preprocessor": preprocessor,
        "features": features,
        "include_grades": include_grades,
        "lr": lr,
        "rf": rf,
        "dt": dt,
        "gb": gb,
        "lr_signed_coefs": lr_signed_coefs,
        "y_train_mean": sum(y_train) / len(y_train),
    }

    spec_list = [
        ("random_forest", "Random Forest Regressor", rf_train_pred, rf_test_pred, rf_imp),
        ("gradient_boosting", "Gradient Boosting Regressor", gb_train_pred, gb_test_pred, gb_imp),
        ("linear_regression", "Linear Regression", lr_train_pred, lr_test_pred, lr_imp),
        ("decision_tree", "Decision Tree Regressor", dt_train_pred, dt_test_pred, dt_imp),
    ]

    for key, name, tr_pred, te_pred, imp in spec_list:
        clipped_te_pred = [max(0.0, min(20.0, p)) for p in te_pred]
        clipped_tr_pred = [max(0.0, min(20.0, p)) for p in tr_pred]

        test_metrics = compute_regression_metrics(y_test, clipped_te_pred)
        train_metrics = compute_regression_metrics(y_train, clipped_tr_pred)
        residuals = [round(yt - yp, 3) for yt, yp in zip(y_test, clipped_te_pred)]

        scatter_points = [
            {
                "id": idx + 1,
                "actual": round(yt, 2),
                "predicted": round(yp, 2),
                "residual": round(yt - yp, 2),
                "age": test_rows[idx].get("age", ""),
                "sex": test_rows[idx].get("sex", ""),
                "studytime": test_rows[idx].get("studytime", ""),
                "absences": test_rows[idx].get("absences", ""),
            }
            for idx, (yt, yp) in enumerate(zip(y_test, clipped_te_pred))
        ]

        feat_imp_sorted = sorted(
            [
                {
                    "feature": f,
                    "label": FEATURE_LABELS.get(f, f),
                    "importance": round(w, 4),
                    "percentage": round(w * 100.0, 2),
                }
                for f, w in zip(features, imp)
            ],
            key=lambda item: item["importance"],
            reverse=True,
        )

        models_report[key] = {
            "key": key,
            "name": name,
            "testMetrics": test_metrics,
            "trainMetrics": train_metrics,
            "cvMetrics": cv_summary[key],
            "actualVsPredicted": scatter_points,
            "residualHistogram": build_residual_histogram(residuals),
            "residualMean": round(sum(residuals) / len(residuals), 3),
            "residualStd": round(
                math.sqrt(
                    sum((r - sum(residuals) / len(residuals)) ** 2 for r in residuals)
                    / max(1, len(residuals) - 1)
                ),
                3,
            ),
            "featureImportance": feat_imp_sorted,
        }

    ranked = sorted(
        models_report.values(),
        key=lambda m: (m["testMetrics"]["r2"], -m["testMetrics"]["rmse"]),
        reverse=True,
    )
    best = ranked[0]
    runner_up = ranked[1]

    mode_desc = (
        "with prior period grades (G1 & G2)"
        if include_grades
        else "using background & study-habit features only (without G1 & G2)"
    )

    why = (
        f"{best['name']} achieves the highest held-out accuracy {mode_desc} with Test R² = "
        f"{best['testMetrics']['r2']:.3f}, RMSE = {best['testMetrics']['rmse']:.2f} pts, and "
        f"5-Fold CV R² = {best['cvMetrics']['meanR2']:.3f} ± {best['cvMetrics']['stdR2']:.3f} "
        f"(outperforming {runner_up['name']} at Test R² = {runner_up['testMetrics']['r2']:.3f}). "
        f"Ensemble tree partitioning captures non-linear grade thresholds and absence interactions without test-set leakage."
    )

    # Also score the full cohort with the best model to power Cohort Early-Warning & Batch Export
    X_all_std = preprocessor.transform_standardized(rows)
    X_all_raw = preprocessor.transform_raw_numeric(rows)
    best_key = best["key"]
    best_obj = (
        models_runtime["lr"]
        if best_key == "linear_regression"
        else models_runtime["gb"]
        if best_key == "gradient_boosting"
        else models_runtime["dt"]
        if best_key == "decision_tree"
        else models_runtime["rf"]
    )
    X_for_best = X_all_std if best_key == "linear_regression" else X_all_raw
    raw_cohort_preds = (
        [float(x) for x in best_obj.predict(np.array(X_for_best))]
        if HAS_SKLEARN and hasattr(best_obj, "n_features_in_")
        else best_obj.predict(X_for_best)
    )

    at_risk_students: List[Dict[str, Any]] = []
    for idx, (r, pred_v) in enumerate(zip(rows, raw_cohort_preds)):
        cp = round(max(0.0, min(20.0, pred_v)), 2)
        actual_g3 = float(r.get("G3", 0))
        if cp < 10.0:
            at_risk_students.append({
                "rowNumber": idx + 1,
                "school": r.get("school", "GP"),
                "sex": r.get("sex", "F"),
                "age": int(float(r.get("age", 17))),
                "studytime": int(float(r.get("studytime", 2))),
                "failures": int(float(r.get("failures", 0))),
                "absences": int(float(r.get("absences", 0))),
                "Medu": int(float(r.get("Medu", 2))),
                "Fedu": int(float(r.get("Fedu", 2))),
                "internet": str(r.get("internet", "yes")),
                "schoolsup": str(r.get("schoolsup", "no")),
                "G1": int(float(r.get("G1", 8))),
                "G2": int(float(r.get("G2", 8))),
                "actualG3": int(round(actual_g3)),
                "predictedG3": cp,
                "gapToPass": round(10.0 - cp, 2),
            })

    # Sort at-risk students closest to recoverable pass margin first (e.g. predicted 7.0 - 9.9)
    at_risk_students.sort(key=lambda s: abs(9.0 - s["predictedG3"]))

    evaluation_payload = {
        "includeGrades": include_grades,
        "modeLabel": "With G1 & G2 (Full Academic Trajectory)" if include_grades else "Without G1 & G2 (Habits & Demographics Only)",
        "features": [{"key": f, "label": FEATURE_LABELS.get(f, f)} for f in features],
        "trainSize": len(train_rows),
        "testSize": len(test_rows),
        "testSplitRatio": round(len(test_rows) / (len(train_rows) + len(test_rows)), 2),
        "randomState": int(random_state),
        "maxDepth": int(max_depth),
        "nEstimators": int(n_estimators),
        "engineBackend": "scikit-learn" if HAS_SKLEARN else "python-cart-ols-gbr",
        "bestModelKey": best["key"],
        "bestModelName": best["name"],
        "bestModelExplanation": why,
        "atRiskCount": len(at_risk_students),
        "atRiskSample": at_risk_students[:16],
        "models": models_report,
    }

    return evaluation_payload, models_runtime
