from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.models.student import BacType, SubjectScores


class RiasecMatch(BaseModel):
    dominant_code: str
    profile_label: str
    dimension_contributions: Dict[str, float]

class ProgramDetails(BaseModel):
    id: str
    slug: str
    difficulty: Optional[int] = None
    math_intensity: Optional[int] = None
    programming_intensity: Optional[int] = None
    physics_intensity: Optional[int] = None
    employment_rate: Optional[float] = None
    riasec_profile: Optional[str] = None
    mbti_recommended: Optional[List[str]] = None
    holland_codes: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    curriculum: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[Dict[str, Any]]] = None
    careers: Optional[List[Dict[str, Any]]] = None
    requirements: Optional[Dict[str, Any]] = None

class RecommendationItem(BaseModel):
    institution: str
    university: str
    city: Optional[str] = None
    field: str
    specialty: Optional[str] = None
    score: float
    admission_probability: float
    admission_score_last: Optional[float] = None
    admission_score_min: Optional[float] = None
    capacity: Optional[int] = None
    orientation_code: Optional[str] = None
    degree: Optional[str] = None
    study_duration_years: Optional[int] = None
    language_of_study: Optional[str] = None
    academic_year: Optional[str] = None
    website: Optional[str] = None
    confidence: str
    riasec_match: Optional[RiasecMatch] = None
    explanation: str
    student_orientation_score: Optional[float] = None
    student_orientation_score_base: Optional[float] = None
    bonus_applied: Optional[bool] = None
    score_difference: Optional[float] = None
    details: Optional[ProgramDetails] = None

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]
    total_candidates: Optional[int] = None


class AdmissionPredictionRequest(BaseModel):
    bac_type: BacType
    bac_score: float = Field(ge=0, le=20)
    region: str = Field(min_length=2)
    preferred_city: str = Field(min_length=2)
    subjects_scores: SubjectScores
    interests: list[str]
    institution_name: str

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
                "interests": ["informatique", "intelligence artificielle"],
                "institution_name": "Institut National des Sciences Appliquées et de Technologie"
            }
        }
    }


class AdmissionPredictionResponse(BaseModel):
    institution: str
    probability: float
    estimated_orientation_score: float


class ServiceHealth(BaseModel):
    status: str
    institutions_loaded: int
    model_loaded: bool
    gnn_enabled: bool
