from typing import Dict, List, Optional
from pydantic import BaseModel
from app.models.student import BacType

class RiasecAnswer(BaseModel):
    question_id: int           # 1–60
    answer: bool               # True = yes, False = no

class RiasecScores(BaseModel):
    R: float  # Realistic       (0.0–1.0 normalized)
    I: float  # Investigative
    A: float  # Artistic
    S: float  # Social
    E: float  # Enterprising
    C: float  # Conventional
    dominant_code: str         # e.g. "RIA" (top 3 letters, sorted desc)
    profile_label: str         # human-readable label (see 8.3)

class RiasecRequest(BaseModel):
    from pydantic import Field
    # Frontend psychometric test uses 30 questions (5 per dimension); legacy flow uses 60.
    answers: List[RiasecAnswer] = Field(..., min_length=30, max_length=60)

    model_config = {
        "json_schema_extra": {
            "example": {
                "answers": [{"question_id": i, "answer": True} for i in range(1, 31)]
            }
        }
    }

class RecommendationRequest(BaseModel):
    bac_type: BacType
    bac_score: float
    region: str
    preferred_city: Optional[str]
    subjects_scores: Dict[str, float]
    riasec: RiasecScores       # replaces the old `interests: List[str]`

    model_config = {
        "json_schema_extra": {
            "example": {
                "bac_type": "Math",
                "bac_score": 17.5,
                "region": "Tunis",
                "preferred_city": "Ariana",
                "subjects_scores": {
                    "math": 18.0,
                    "physics": 17.5,
                    "science": 14.0,
                    "french": 15.0,
                    "english": 16.5
                },
                "riasec": {
                    "R": 0.85,
                    "I": 0.70,
                    "A": 0.15,
                    "S": 0.20,
                    "E": 0.40,
                    "C": 0.35,
                    "dominant_code": "RIE",
                    "profile_label": "Ingénieur entrepreneur"
                }
            }
        }
    }
