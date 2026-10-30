"""
data_loader.py
--------------
Handles loading, delimiter detection, missing-value imputation, duplicate removal,
type inference, and descriptive statistics for the UCI Student Performance Dataset
(Mathematics `student-mat.csv` and Portuguese `student-por.csv`) as well as custom
user-uploaded CSV datasets.
"""

import csv
import io
import math
import os
from collections import Counter
from typing import Any, Dict, List, Optional, Tuple

NUMERIC_COLUMNS_DEFAULT = {
    "age", "Medu", "Fedu", "traveltime", "studytime", "failures",
    "famrel", "freetime", "goout", "Dalc", "Walc", "health",
    "absences", "G1", "G2", "G3"
}

DATASET_PATHS = {
    "mat": "data/student-mat.csv",
    "por": "data/student-por.csv",
}


def detect_delimiter(sample_text: str) -> str:
    """Detect whether the CSV file uses semicolon (UCI default) or comma delimiter."""
    first_line = sample_text.splitlines()[0] if sample_text.splitlines() else ""
    if first_line.count(";") > first_line.count(","):
        return ";"
    return ","


def _try_parse_number(val: Any) -> Optional[float]:
    if val is None:
        return None
    s = str(val).strip().strip('"').strip("'")
    if s == "" or s.lower() in {"na", "nan", "null", "none", "?"}:
        return None
    try:
        return float(s)
    except ValueError:
        return None


def load_raw_csv_text(dataset_key: str = "mat", custom_csv_text: Optional[str] = None) -> Tuple[str, str]:
    """Load raw CSV text from disk or custom uploaded CSV payload."""
    if custom_csv_text and custom_csv_text.strip():
        return custom_csv_text, "Custom Uploaded Dataset"

    key = "por" if dataset_key == "por" else "mat"
    path = DATASET_PATHS[key]
    if not os.path.exists(path):
        alt_path = os.path.join("public", path)
        path = alt_path

    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    label = "UCI Mathematics (student-mat.csv)" if key == "mat" else "UCI Portuguese (student-por.csv)"
    return text, label


def load_and_clean_dataset(
    dataset_key: str = "mat",
    custom_csv_text: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Parse CSV, infer column types, remove exact duplicate rows, impute missing values
    (median for numeric columns, mode for categorical columns), and compute dataset
    diagnostics and summary statistics.
    """
    raw_text, dataset_label = load_raw_csv_text(dataset_key, custom_csv_text)
    delimiter = detect_delimiter(raw_text)

    reader = csv.DictReader(io.StringIO(raw_text), delimiter=delimiter)
    if not reader.fieldnames:
        raise ValueError("Uploaded CSV contains no header columns.")

    columns = [c.strip().strip('"') for c in reader.fieldnames if c and c.strip()]
    raw_rows: List[Dict[str, str]] = []
    for r in reader:
        cleaned_row = {}
        for k, v in r.items():
            if k is None:
                continue
            ck = k.strip().strip('"')
            if ck in columns:
                cleaned_row[ck] = "" if v is None else str(v).strip().strip('"')
        if any(val != "" for val in cleaned_row.values()):
            raw_rows.append(cleaned_row)

    if len(raw_rows) < 15:
        raise ValueError("Dataset must contain at least 15 valid student records.")
    if "G3" not in columns:
        raise ValueError("Dataset must include target column 'G3' (final grade).")

    initial_row_count = len(raw_rows)

    # 1. Remove exact duplicate rows
    seen_signatures = set()
    deduped_rows: List[Dict[str, str]] = []
    for row in raw_rows:
        sig = tuple(row.get(col, "") for col in columns)
        if sig not in seen_signatures:
            seen_signatures.add(sig)
            deduped_rows.append(row)
    duplicates_removed = initial_row_count - len(deduped_rows)

    # 2. Infer column types (numeric vs categorical) & count missing values
    col_types: Dict[str, str] = {}
    missing_counts: Dict[str, int] = {}

    for col in columns:
        non_empty = [r.get(col, "") for r in deduped_rows if r.get(col, "").lower() not in {"", "na", "nan", "null", "none", "?"}]
        missing_counts[col] = len(deduped_rows) - len(non_empty)

        parsed_nums = [_try_parse_number(v) for v in non_empty]
        numeric_ratio = sum(1 for x in parsed_nums if x is not None) / max(1, len(non_empty))

        if col in NUMERIC_COLUMNS_DEFAULT or numeric_ratio >= 0.9:
            # Determine int64 vs float64
            valid_nums = [x for x in parsed_nums if x is not None]
            if all(abs(x - round(x)) < 1e-9 for x in valid_nums):
                col_types[col] = "int64"
            else:
                col_types[col] = "float64"
        else:
            col_types[col] = "categorical"

    # 3. Compute imputation values (median for numeric, mode for categorical)
    imputation_values: Dict[str, Any] = {}
    for col in columns:
        if col_types[col] in ("int64", "float64"):
            vals = sorted(
                x for x in (_try_parse_number(r.get(col)) for r in deduped_rows) if x is not None
            )
            if not vals:
                med = 0.0
            else:
                mid = len(vals) // 2
                med = vals[mid] if len(vals) % 2 == 1 else (vals[mid - 1] + vals[mid]) / 2.0
            imputation_values[col] = int(round(med)) if col_types[col] == "int64" else round(med, 4)
        else:
            vals = [
                r.get(col, "")
                for r in deduped_rows
                if r.get(col, "").lower() not in {"", "na", "nan", "null", "none", "?"}
            ]
            imputation_values[col] = Counter(vals).most_common(1)[0][0] if vals else "unknown"

    # 4. Build typed, clean rows
    clean_rows: List[Dict[str, Any]] = []
    total_missing_imputed = 0
    for r in deduped_rows:
        typed_row: Dict[str, Any] = {}
        for col in columns:
            raw_val = r.get(col, "")
            if col_types[col] in ("int64", "float64"):
                num = _try_parse_number(raw_val)
                if num is None:
                    typed_row[col] = imputation_values[col]
                    total_missing_imputed += 1
                else:
                    typed_row[col] = int(round(num)) if col_types[col] == "int64" else float(num)
            else:
                if raw_val.lower() in {"", "na", "nan", "null", "none", "?"}:
                    typed_row[col] = imputation_values[col]
                    total_missing_imputed += 1
                else:
                    typed_row[col] = raw_val
        clean_rows.append(typed_row)

    # 5. Compute descriptive statistics per column
    column_stats: List[Dict[str, Any]] = []
    for col in columns:
        ctype = col_types[col]
        if ctype in ("int64", "float64"):
            vals = sorted(float(row[col]) for row in clean_rows)
            n = len(vals)
            mean_val = sum(vals) / n
            variance = sum((x - mean_val) ** 2 for x in vals) / max(1, n - 1)
            std_val = math.sqrt(variance)

            def percentile(p: float) -> float:
                idx = (n - 1) * p
                lo = int(math.floor(idx))
                hi = int(math.ceil(idx))
                if lo == hi:
                    return vals[lo]
                return vals[lo] + (vals[hi] - vals[lo]) * (idx - lo)

            column_stats.append({
                "column": col,
                "dtype": ctype,
                "missing": missing_counts[col],
                "count": n,
                "mean": round(mean_val, 2),
                "std": round(std_val, 2),
                "min": round(vals[0], 2),
                "q25": round(percentile(0.25), 2),
                "median": round(percentile(0.50), 2),
                "q75": round(percentile(0.75), 2),
                "max": round(vals[-1], 2),
            })
        else:
            vals = [str(row[col]) for row in clean_rows]
            counts = Counter(vals)
            top_val, top_freq = counts.most_common(1)[0]
            column_stats.append({
                "column": col,
                "dtype": ctype,
                "missing": missing_counts[col],
                "count": len(vals),
                "unique": len(counts),
                "top": top_val,
                "freq": top_freq,
            })

    # 6. Compute Pearson correlation matrix across key numeric columns
    corr_cols = [c for c in ["age", "Medu", "Fedu", "studytime", "failures", "absences", "G1", "G2", "G3"] if c in columns and col_types[c] in ("int64", "float64")]
    correlation_matrix = compute_correlation_matrix(clean_rows, corr_cols)

    return {
        "datasetLabel": dataset_label,
        "datasetKey": "custom" if (custom_csv_text and custom_csv_text.strip()) else ("por" if dataset_key == "por" else "mat"),
        "delimiter": delimiter,
        "initialRows": initial_row_count,
        "rowCount": len(clean_rows),
        "columnCount": len(columns),
        "duplicatesRemoved": duplicates_removed,
        "totalMissingImputed": total_missing_imputed,
        "columns": columns,
        "columnTypes": col_types,
        "missingByColumn": missing_counts,
        "columnStats": column_stats,
        "correlationColumns": corr_cols,
        "correlationMatrix": correlation_matrix,
        "rows": clean_rows,
    }


def compute_correlation_matrix(rows: List[Dict[str, Any]], cols: List[str]) -> List[List[float]]:
    """Compute exact Pearson r correlation matrix for numerical attributes."""
    n = len(rows)
    if n < 2 or not cols:
        return []
    vectors = {c: [float(r[c]) for r in rows] for c in cols}
    means = {c: sum(vectors[c]) / n for c in cols}
    stds = {}
    for c in cols:
        m = means[c]
        s = math.sqrt(sum((x - m) ** 2 for x in vectors[c]))
        stds[c] = s

    matrix: List[List[float]] = []
    for c1 in cols:
        row_corr: List[float] = []
        for c2 in cols:
            if c1 == c2:
                row_corr.append(1.0)
            elif stds[c1] == 0 or stds[c2] == 0:
                row_corr.append(0.0)
            else:
                cov = sum(
                    (vectors[c1][i] - means[c1]) * (vectors[c2][i] - means[c2])
                    for i in range(n)
                )
                r = cov / (stds[c1] * stds[c2])
                row_corr.append(round(max(-1.0, min(1.0, r)), 3))
        matrix.append(row_corr)
    return matrix
