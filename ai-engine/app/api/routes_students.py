from __future__ import annotations

from fastapi import APIRouter, Depends

from app.dependencies import get_engine
from app.models.institution import InstitutionShort
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter(tags=["students"])


@router.get("/institutions", response_model=list[InstitutionShort])
async def list_institutions(engine: RecommendationEngine = Depends(get_engine)) -> list[InstitutionShort]:
    return [
        InstitutionShort(
            institution=i.institution,
            city=i.city,
            field=i.field,
            university=i.university,
        )
        for i in engine.list_institutions()
    ]
