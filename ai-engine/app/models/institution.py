from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class Institution(BaseModel):
    institution: str
    institution_type: Optional[str] = "Établissement"
    university: str
    city: Optional[str] = None
    field: str
    specialty: Optional[str] = None
    orientation_code: Optional[str] = None
    degree: Optional[str] = None
    study_duration_years: Optional[int] = Field(default=3, ge=1)
    admission_score_last: Optional[float] = None
    admission_score_min: Optional[float] = None
    capacity: Optional[int] = Field(default=None, ge=0)
    language_of_study: Optional[str] = None
    academic_year: Optional[str] = None
    website: Optional[str] = None
    source: Optional[str] = None


class InstitutionShort(BaseModel):
    institution: str
    city: Optional[str] = None
    field: str
    university: str
