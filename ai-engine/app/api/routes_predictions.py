from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_engine
from app.models.recommendation import AdmissionPredictionRequest, AdmissionPredictionResponse
from app.models.student import StudentInput
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter(tags=["predictions"])


@router.post("/predict-admission", response_model=AdmissionPredictionResponse)
async def predict_admission(
    payload: AdmissionPredictionRequest,
    engine: RecommendationEngine = Depends(get_engine),
) -> AdmissionPredictionResponse:
    try:
        student = StudentInput(
            bac_type=payload.bac_type,  # validated by StudentInput literal mapping
            bac_score=payload.bac_score,
            region=payload.region,
            preferred_city=payload.preferred_city,
            subjects_scores=payload.subjects_scores,
            interests=payload.interests,
        )
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    try:
        institution, probability, score = engine.predict_single_institution(student, payload.institution_name)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return AdmissionPredictionResponse(
        institution=institution,
        probability=probability,
        estimated_orientation_score=score,
    )
