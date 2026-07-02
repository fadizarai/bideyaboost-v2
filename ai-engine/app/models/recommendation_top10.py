from pydantic import BaseModel, Field
from typing import Dict, List, Optional

class RiasecScoreInput(BaseModel):
    R: float = Field(..., description="Realistic score")
    I: float = Field(..., description="Investigative score")
    A: float = Field(..., description="Artistic score")
    S: float = Field(..., description="Social score")
    E: float = Field(..., description="Enterprising score")
    C: float = Field(..., description="Conventional score")
    dominant_code: str = Field(..., description="The dominant RIASEC letter(s), e.g., 'IRE'")
    
class BacNotesInput(BaseModel):
    bac_type: str = Field(..., description="Baccalaureate Specialty, e.g., 'Math', 'Sciences'")
    bac_score: float = Field(..., description="Total Baccalaureate score / 20")
    region: str = Field(..., description="Student's home region/governorate, e.g., 'Tunis', 'Sousse'")

class RecommendTop10Request(BaseModel):
    bac_notes: BacNotesInput
    riasec_score: RiasecScoreInput
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "bac_notes": {
                        "bac_type": "Math",
                        "bac_score": 15.75,
                        "region": "Tunis"
                    },
                    "riasec_score": {
                        "R": 5.2,
                        "I": 8.9,
                        "A": 3.4,
                        "S": 4.1,
                        "E": 6.8,
                        "C": 7.5,
                        "dominant_code": "ICE"
                    }
                }
            ]
        }
    }

class InstitutionRecommendation(BaseModel):
    institution: str
    field: str
    city: str
    admission_score_last: float
    riasec_code: str
    match_probability: float

class RecommendTop10Response(BaseModel):
    recommendations: List[InstitutionRecommendation]

