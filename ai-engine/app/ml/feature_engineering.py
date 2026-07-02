from __future__ import annotations

from app.models.student import StudentInput, StudentFeatures
from app.services.score_calculator import calculate_orientation_score


from app.models.institution import Institution

def build_student_features(
    student: StudentInput,
    field_name: str,
    institution: Institution | None = None,
    all_institutions: list[Institution] | None = None
) -> StudentFeatures:
    breakdown = calculate_orientation_score(
        student,
        field_name,
        institution=institution,
        all_institutions=all_institutions
    )
    
    valid_scores = [v for v in student.subjects_scores.model_dump().values() if v is not None]
    if valid_scores:
        subject_mean = sum(valid_scores) / len(valid_scores)
    else:
        subject_mean = student.bac_score

    return StudentFeatures(
        orientation_score=breakdown.orientation_score,
        orientation_score_base=breakdown.orientation_score_base,
        bonus_applied=breakdown.bonus_applied,
        normalized_bac_score=student.bac_score / 20.0,
        normalized_subject_mean=subject_mean / 20.0,
        interests_text=" ".join(student.interests).lower(),
        preferred_city=student.preferred_city,
        bac_type=student.bac_type,
        region=student.region,
    )
