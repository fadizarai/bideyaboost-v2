from __future__ import annotations

from fastapi import APIRouter, Depends

from app.dependencies import get_engine
from app.models.recommendation import ServiceHealth
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter(tags=["health"])


@router.get("/health", response_model=ServiceHealth)
async def health(engine: RecommendationEngine = Depends(get_engine)) -> ServiceHealth:
    return ServiceHealth(
        status="ok",
        institutions_loaded=len(engine.list_institutions()),
        model_loaded=engine.predictor.registry.xgb_model is not None,
        gnn_enabled=engine.gnn.enabled,
    )
