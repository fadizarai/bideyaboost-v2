from __future__ import annotations

import logging
from pathlib import Path
from app.models.registry import ModelRegistry

from app.services.admission_predictor import AdmissionPredictor

logger = logging.getLogger(__name__)


from typing import Optional

def load_admission_predictor(model_dir: Path, registry: Optional[ModelRegistry] = None) -> AdmissionPredictor:
    if registry is None:
        from app.dependencies import _registry
        registry = _registry
    predictor = AdmissionPredictor(registry=registry)

    preferred_paths = [
        model_dir / "xgboost_admission.joblib",
        model_dir / "rf_admission.joblib",
        model_dir / "logistic_admission.joblib",
    ]

    for candidate in preferred_paths:
        if candidate.exists():
            try:
                predictor.load(candidate)
                logger.info("Loaded admission model from %s", candidate)
                return predictor
            except Exception as exc:
                logger.warning("Failed loading model %s: %s", candidate, exc)

    logger.info("No trained admission model found; heuristic predictor enabled")
    return predictor
