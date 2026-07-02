from __future__ import annotations

import json
import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("train_model")

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

INSTITUTIONS_PATH = DATA_DIR / "institutions.json"
STUDENTS_PATH = DATA_DIR / "students.csv"

RANDOM_STATE = 42


def load_institutions(path: Path) -> list[dict]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    logger.info("Loaded %d institutions from %s", len(data), path)
    return data


def load_students(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    logger.info("Loaded %d student records from %s", len(df), path)
    return df


def generate_competitiveness_label(
    row: dict, cap_thresh: float, score_thresh: float
) -> int:
    score_last = row.get("admission_score_last")
    score_min = row.get("admission_score_min")
    capacity = row.get("capacity")

    if score_last is None or score_min is None or score_last <= 0 or score_min <= 0:
        return 0
    if capacity is None or capacity <= 0:
        capacity = 100

    band_width = score_last - score_min
    if band_width <= 0:
        band_width = 2.0

    low_capacity = capacity < cap_thresh
    high_cutoff = score_last > score_thresh
    tight_band = band_width < 15.0

    return 1 if (low_capacity + high_cutoff + tight_band) >= 2 else 0


def build_training_data(institutions: list[dict], students: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
    rows = []
    labels = []
    valid_scores = []
    valid_caps = []

    for inst in institutions:
        score_last = inst.get("admission_score_last")
        score_min = inst.get("admission_score_min")
        if score_last is not None and score_last > 0:
            valid_scores.append(score_last)
        cap = inst.get("capacity")
        if cap is not None and cap > 0:
            valid_caps.append(cap)

    cap_thresh = float(np.median(valid_caps)) if valid_caps else 200.0
    score_thresh = float(np.median(valid_scores)) if valid_scores else 120.0
    logger.info("Using capacity threshold=%.1f  score threshold=%.1f", cap_thresh, score_thresh)

    for inst in institutions:
        score_last = inst.get("admission_score_last")
        score_min = inst.get("admission_score_min")
        duration = inst.get("study_duration_years", 3)
        capacity = inst.get("capacity", 100)
        field = inst.get("field", "")
        inst_type = inst.get("institution_type", "University")
        city = inst.get("city", "Tunis")

        if score_last is None or score_min is None:
            continue
        if score_last <= 0 or score_min <= 0:
            continue

        band_width = max(score_last - score_min, 2.0)
        label = generate_competitiveness_label(inst, cap_thresh, score_thresh)

        rows.append({
            "score_last": float(score_last),
            "score_min": float(score_min),
            "band_width": float(band_width),
            "duration": float(duration),
            "capacity": float(capacity),
            "field": field,
            "institution_type": inst_type,
            "city": city,
        })
        labels.append(label)

    X = pd.DataFrame(rows)
    y = np.array(labels)

    logger.info("Built training set: %d samples, %d positive (%.1f%%), %d negative",
                len(X), y.sum(), 100 * y.mean(), (1 - y).sum())
    return X, y


def train(X: pd.DataFrame, y: np.ndarray) -> tuple[xgb.XGBClassifier, dict[str, LabelEncoder]]:
    cat_cols = ["field", "institution_type", "city"]
    encoders = {}

    for col in cat_cols:
        le = LabelEncoder()
        X[col + "_encoded"] = le.fit_transform(X[col].astype(str))
        encoders[col + "_encoder"] = le

    feature_cols = ["score_last", "score_min", "band_width", "duration", "capacity",
                    "field_encoded", "institution_type_encoded", "city_encoded"]
    X_feat = X[feature_cols].values

    X_train, X_test, y_train, y_test = train_test_split(
        X_feat, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    model = xgb.XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=RANDOM_STATE,
        eval_metric="logloss",
        use_label_encoder=False,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    train_acc = (model.predict(X_train) == y_train).mean()
    test_acc = (model.predict(X_test) == y_test).mean()
    logger.info("XGBoost train accuracy: %.4f | test accuracy: %.4f", train_acc, test_acc)

    return model, encoders


def save_artifacts(model: xgb.XGBClassifier, encoders: dict[str, LabelEncoder]) -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    model_path = MODELS_DIR / "admission_xgb.joblib"
    joblib.dump(model, model_path)
    logger.info("Saved XGBoost model to %s", model_path)

    encoders_path = MODELS_DIR / "label_encoders.joblib"
    joblib.dump(encoders, encoders_path)
    logger.info("Saved label encoders to %s", encoders_path)


def main() -> None:
    logger.info("=" * 60)
    logger.info("XGBoost Admission Model Training")
    logger.info("=" * 60)

    institutions = load_institutions(INSTITUTIONS_PATH)
    students = load_students(STUDENTS_PATH)

    X, y = build_training_data(institutions, students)
    model, encoders = train(X, y)
    save_artifacts(model, encoders)

    logger.info("Training complete. Model & encoders saved to %s", MODELS_DIR)


if __name__ == "__main__":
    main()
