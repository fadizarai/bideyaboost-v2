from __future__ import annotations

from fastapi import APIRouter, Depends

from app.config import get_settings
from app.dependencies import get_engine
from app.models.recommendation import RecommendationResponse
from app.models.student import StudentInput
from app.services.orientation_rules import filter_compatible_institutions
from app.services.recommendation_engine import RecommendationEngine
from app.services.recommendation_input import resolve_recommendation_input

router = APIRouter(tags=["recommendations"])


async def _run_recommendations(
    student: StudentInput,
    engine: RecommendationEngine,
) -> RecommendationResponse:
    top_k = get_settings().top_k
    payload = resolve_recommendation_input(student)
    recommendations = engine.recommend(payload, top_k=top_k)
    compatible = filter_compatible_institutions(student.bac_type, engine.list_institutions())
    return RecommendationResponse(
        recommendations=recommendations,
        total_candidates=len(compatible),
    )


@router.post("/api/recommand", response_model=RecommendationResponse)
async def recommend_institutions(
    student: StudentInput,
    engine: RecommendationEngine = Depends(get_engine),
) -> RecommendationResponse:
    """Primary recommendation endpoint (RIASEC + academic scoring)."""
    return await _run_recommendations(student, engine)


# Backward-compatible aliases
@router.post("/recommendations", response_model=RecommendationResponse, include_in_schema=False)
@router.post("/recommend", response_model=RecommendationResponse, include_in_schema=False)
@router.post("/api/recommend", response_model=RecommendationResponse, include_in_schema=False)
async def recommend_institutions_legacy(
    student: StudentInput,
    engine: RecommendationEngine = Depends(get_engine),
) -> RecommendationResponse:
    return await _run_recommendations(student, engine)
