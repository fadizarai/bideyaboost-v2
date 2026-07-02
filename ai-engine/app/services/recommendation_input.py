from __future__ import annotations

from typing import Union

from app.models.riasec import RecommendationRequest, RiasecScores
from app.models.student import StudentInput
from app.services.riasec_mapper import get_profile_label

RIASEC_DIMS = ("R", "I", "A", "S", "E", "C")


def normalize_riasec_scores(raw: dict[str, float]) -> dict[str, float]:
    """Accept 0–1 or 0–10 RIASEC payloads and normalize to 0–1."""
    scores = {dim: float(raw.get(dim, 0.0)) for dim in RIASEC_DIMS}
    peak = max(scores.values(), default=0.0)
    if peak <= 0:
        return scores
    if peak > 1.0:
        scale = 10.0 if peak <= 10.0 else peak
        scores = {dim: min(1.0, value / scale) for dim, value in scores.items()}
    return scores


def build_riasec_from_vector(raw: dict[str, float]) -> RiasecScores:
    scores = normalize_riasec_scores(raw)
    sorted_dims = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    if sorted_dims[0][1] <= 0:
        dominant_code = "---"
    else:
        dominant_code = "".join(dim for dim, _ in sorted_dims[:3])
    return RiasecScores(
        **scores,
        dominant_code=dominant_code,
        profile_label=get_profile_label(dominant_code),
    )


def resolve_recommendation_input(
    student: StudentInput,
) -> Union[StudentInput, RecommendationRequest]:
    """Use RIASEC scoring when psycho_vector is present, otherwise interests."""
    subjects_scores = {
        key: value
        for key, value in student.subjects_scores.model_dump().items()
        if value is not None
    }

    if student.psycho_vector:
        riasec = build_riasec_from_vector(student.psycho_vector)
        return RecommendationRequest(
            bac_type=student.bac_type,
            bac_score=student.bac_score,
            region=student.region,
            preferred_city=student.preferred_city,
            subjects_scores=subjects_scores,
            riasec=riasec,
        )

    return student
