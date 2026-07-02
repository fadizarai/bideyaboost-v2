from app.services.recommendation_engine import RecommendationEngine, create_engine
from app.config import get_settings
from app.models.registry import ModelRegistry

_registry = ModelRegistry()
# Will be loaded in main.py startup event, or we can load it lazily
try:
    _registry.load_all()
except Exception:
    pass

_recommendation_engine = None

def get_engine() -> RecommendationEngine:
    global _recommendation_engine
    if _recommendation_engine is None:
        _recommendation_engine = create_engine(get_settings())
    return _recommendation_engine

def set_engine(engine: RecommendationEngine) -> None:
    global _recommendation_engine
    _recommendation_engine = engine
