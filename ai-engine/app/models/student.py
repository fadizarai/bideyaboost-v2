from __future__ import annotations

from typing import Dict, List, Literal
from pydantic import BaseModel, Field


BacType = Literal["Sciences", "Math", "Economie", "Lettres", "Technique", "Informatique"]


class SubjectScores(BaseModel):
    math: float | None = Field(default=None, ge=0, le=20)
    physics: float | None = Field(default=None, ge=0, le=20)
    science: float | None = Field(default=None, ge=0, le=20)
    algo: float | None = Field(default=None, ge=0, le=20)
    tech: float | None = Field(default=None, ge=0, le=20)
    economie: float | None = Field(default=None, ge=0, le=20)
    gestion: float | None = Field(default=None, ge=0, le=20)
    philosophy: float | None = Field(default=None, ge=0, le=20)
    history_geo: float | None = Field(default=None, ge=0, le=20)
    arabic: float | None = Field(default=None, ge=0, le=20)
    french: float | None = Field(default=None, ge=0, le=20)
    english: float | None = Field(default=None, ge=0, le=20)
    sport: float | None = Field(default=None, ge=0, le=20)
    sti: float | None = Field(default=None, ge=0, le=20)
    ep: float | None = Field(default=None, ge=0, le=20)

class StudentInput(BaseModel):
    bac_type: BacType
    bac_score: float = Field(ge=0, le=20)
    region: str = Field(min_length=2)
    preferred_city: str = Field(min_length=2)
    subjects_scores: SubjectScores
    interests: List[str] = Field(default_factory=list)
    psycho_vector: Dict[str, float] | None = None

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
                "interests": ["informatique", "intelligence artificielle", "technologie"],
                "psycho_vector": None
            }
        }
    }


class StudentFeatures(BaseModel):
    orientation_score: float
    orientation_score_base: float
    bonus_applied: bool
    normalized_bac_score: float
    normalized_subject_mean: float
    interests_text: str
    preferred_city: str
    bac_type: str
    region: str


class StudentsBatch(BaseModel):
    students: List[StudentInput]
