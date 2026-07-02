from fastapi import APIRouter, Depends, HTTPException

from app.config import get_settings
from app.dependencies import get_engine
from app.models.riasec import RecommendationRequest, RiasecRequest, RiasecScores
from app.services.recommendation_engine import RecommendationEngine
from app.services.riasec_scorer import compute_riasec_scores

router = APIRouter()


@router.post("/score", response_model=RiasecScores)
async def score_riasec(request: RiasecRequest) -> RiasecScores:
    try:
        return compute_riasec_scores(request.answers)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/recommend", response_model=dict)
async def recommend_riasec(
    request: RecommendationRequest,
    engine: RecommendationEngine = Depends(get_engine),
) -> dict:
    top_k = get_settings().top_k
    recs = engine.recommend(request, top_k=top_k)
    return {
        "riasec": request.riasec.model_dump(),
        "recommendations": [rec.model_dump() for rec in recs],
    }
