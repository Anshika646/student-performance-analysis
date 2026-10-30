"""
cli_bridge.py
-------------
Persistent JSON-lines RPC worker & CLI bridge invoked by `server.ts` so the live web
dashboard executes real Python ML pipelines (`data_loader.py`, `preprocessing.py`,
`model_training.py`, `prediction.py`, `visualization.py`) directly on the UCI Student
Performance datasets (`student-mat.csv`, `student-por.csv`) or user-uploaded CSVs.

Maintains an in-memory cache of fitted Python models (`MODEL_CACHE`) so live student
predictions run directly against already-trained models in < 3ms without retraining.
"""

import hashlib
import json
import os
import sys
import traceback
from typing import Any, Dict, Tuple

from data_loader import load_and_clean_dataset
from model_training import train_and_evaluate_all_models
from prediction import predict_student_grade
from visualization import compute_eda_aggregates

DATASET_CACHE: Dict[str, Dict[str, Any]] = {}
MODEL_CACHE: Dict[str, Tuple[Dict[str, Any], Dict[str, Any]]] = {}

PYTHON_SOURCE_FILES = [
    "app.py",
    "data_loader.py",
    "preprocessing.py",
    "model_training.py",
    "visualization.py",
    "prediction.py",
    "requirements.txt",
    "README.md",
]


def _dataset_cache_key(dataset_key: str, custom_csv: Any) -> str:
    if custom_csv and str(custom_csv).strip():
        digest = hashlib.sha256(str(custom_csv).encode("utf-8")).hexdigest()[:16]
        return f"custom:{digest}"
    return "por" if dataset_key == "por" else "mat"


def _get_dataset(dataset_key: str, custom_csv: Any) -> Dict[str, Any]:
    ck = _dataset_cache_key(dataset_key, custom_csv)
    if ck not in DATASET_CACHE:
        DATASET_CACHE[ck] = load_and_clean_dataset(
            dataset_key=dataset_key,
            custom_csv_text=str(custom_csv) if custom_csv else None,
        )
    return DATASET_CACHE[ck]


def _get_trained_models(
    dataset: Dict[str, Any],
    ds_ck: str,
    include_grades: bool,
    test_size: float,
    random_state: int,
    max_depth: int,
    n_estimators: int,
    force_retrain: bool = False,
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    mkey = f"{ds_ck}|g={int(include_grades)}|ts={test_size:.2f}|rs={random_state}|md={max_depth}|ne={n_estimators}"
    if force_retrain or mkey not in MODEL_CACHE:
        MODEL_CACHE[mkey] = train_and_evaluate_all_models(
            dataset["rows"],
            dataset["columns"],
            include_grades=include_grades,
            test_size=test_size,
            random_state=random_state,
            max_depth=max_depth,
            n_estimators=n_estimators,
        )
    return MODEL_CACHE[mkey]


def handle_action(payload: dict) -> dict:
    action = payload.get("action", "full_bundle")

    if action == "python_sources":
        files_out = []
        for fname in PYTHON_SOURCE_FILES:
            if os.path.exists(fname):
                with open(fname, "r", encoding="utf-8") as f:
                    files_out.append({"name": fname, "content": f.read()})
        return {"ok": True, "files": files_out}

    dataset_key = payload.get("datasetKey", "mat")
    custom_csv = payload.get("customCsvText")
    include_grades = bool(payload.get("includeGrades", True))
    test_size = float(payload.get("testSize", 0.2))
    random_state = int(payload.get("randomState", 42))
    max_depth = int(payload.get("maxDepth", 6))
    n_estimators = int(payload.get("nEstimators", 40))
    force_retrain = bool(payload.get("forceRetrain", False))

    ds_ck = _dataset_cache_key(dataset_key, custom_csv)
    dataset = _get_dataset(dataset_key, custom_csv)

    if action == "full_bundle":
        eval_with, _ = _get_trained_models(
            dataset, ds_ck, True, test_size, random_state, max_depth, n_estimators, force_retrain
        )
        eval_without, _ = _get_trained_models(
            dataset, ds_ck, False, test_size, random_state, max_depth, n_estimators, force_retrain
        )
        eda = compute_eda_aggregates(dataset["rows"])
        return {
            "ok": True,
            "dataset": dataset,
            "eda": eda,
            "evaluations": {
                "with_grades": eval_with,
                "without_grades": eval_without,
            },
        }

    if action == "train":
        eval_with, _ = _get_trained_models(
            dataset, ds_ck, True, test_size, random_state, max_depth, n_estimators, True
        )
        eval_without, _ = _get_trained_models(
            dataset, ds_ck, False, test_size, random_state, max_depth, n_estimators, True
        )
        return {
            "ok": True,
            "evaluations": {
                "with_grades": eval_with,
                "without_grades": eval_without,
            },
        }

    if action == "predict":
        student_input = payload.get("studentInput", {})
        model_key = payload.get("modelKey", "random_forest")
        eval_report, models_runtime = _get_trained_models(
            dataset, ds_ck, include_grades, test_size, random_state, max_depth, n_estimators, False
        )
        pred_result = predict_student_grade(
            student_input=student_input,
            model_key=model_key,
            models_runtime=models_runtime,
            models_report=eval_report["models"],
        )
        return {
            "ok": True,
            "prediction": pred_result,
        }

    raise ValueError(f"Unsupported action: {action}")


def run_daemon():
    """Long-lived line-delimited JSON RPC worker for instant server.ts queries."""
    import threading

    lock = threading.Lock()

    def _warm():
        try:
            with lock:
                handle_action({"action": "full_bundle", "datasetKey": "mat"})
            with lock:
                handle_action({"action": "full_bundle", "datasetKey": "por"})
        except Exception:
            pass

    threading.Thread(target=_warm, daemon=True).start()

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        req_id = None
        try:
            msg = json.loads(line)
            req_id = msg.get("id")
            with lock:
                res = handle_action(msg.get("payload", {}))
            out = {"id": req_id, **res}
        except Exception as exc:
            out = {
                "id": req_id,
                "ok": False,
                "error": str(exc),
                "trace": traceback.format_exc(),
            }
        sys.stdout.write(json.dumps(out) + "\n")
        sys.stdout.flush()


def main():
    if "--daemon" in sys.argv:
        run_daemon()
        return

    try:
        raw_in = sys.stdin.read()
        payload = json.loads(raw_in) if raw_in.strip() else {}
        result = handle_action(payload)
        sys.stdout.write(json.dumps(result))
    except Exception as exc:
        sys.stdout.write(
            json.dumps({
                "ok": False,
                "error": str(exc),
            })
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
