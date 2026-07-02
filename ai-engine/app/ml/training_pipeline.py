from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


def train_admission_models(students_csv: Path, output_dir: Path) -> dict[str, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(students_csv)

    required = {"orientation_score", "admission_score_min", "admission_score_last", "capacity", "competition_level", "admitted"}
    missing = required.difference(df.columns)
    if missing:
        raise ValueError(f"Missing required columns in students.csv: {sorted(missing)}")

    x = df[["orientation_score", "admission_score_min", "admission_score_last", "capacity", "competition_level"]].fillna(0)
    y = df["admitted"].astype(int)

    x_train, _, y_train, _ = train_test_split(x, y, test_size=0.2, random_state=42, stratify=y)

    logistic = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=1000)),
    ])
    logistic.fit(x_train, y_train)

    rf = RandomForestClassifier(n_estimators=300, random_state=42)
    rf.fit(x_train, y_train)

    logistic_path = output_dir / "logistic_admission.joblib"
    rf_path = output_dir / "rf_admission.joblib"

    joblib.dump(logistic, logistic_path)
    joblib.dump(rf, rf_path)

    return {"logistic": logistic_path, "random_forest": rf_path}
