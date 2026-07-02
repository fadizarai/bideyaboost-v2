from __future__ import annotations

import logging

from fastapi import FastAPI

from app.api.routes_health import router as health_router
from app.api.routes_predictions import router as predictions_router
from app.api.routes_recommendations import router as recommendations_router
from app.api.routes_students import router as students_router
from app.api.routes_riasec import router as riasec_router
from app.config import get_settings
from app.dependencies import set_engine
from app.services.recommendation_engine import create_engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("ai-orientation-engine")

settings = get_settings()
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="BideyaBoost AI Orientation Engine API", 
    version=settings.app_version, 
    debug=settings.debug,
    description="""
## Premium Orientation Predictions

Powered by a hybrid Machine Learning Architecture:
* **XGBoost**: Predicts exact admission probabilities based on live institutional capacities, difficulty boundaries, and regional identifiers.
* **PyTorch LSTM**: Sequentially maps 4-year sliding window history to predict up-coming cutoff trends (`rising`, `falling`, `stable`).

Provides REST endpoints for RIASEC psychometric analysis, real-time student recommendations, and raw admission score predictions.
    """
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
async def on_startup() -> None:
    engine = create_engine(settings)
    set_engine(engine)
    logger.info("Engine started with %d institutions", len(engine.list_institutions()))


app.include_router(health_router)
app.include_router(students_router)
app.include_router(recommendations_router)
app.include_router(predictions_router)
app.include_router(riasec_router, prefix="/api/v1/riasec", tags=["RIASEC"])
