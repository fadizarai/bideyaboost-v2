from typing import List
from app.models.riasec import RiasecAnswer, RiasecScores
from app.services.riasec_mapper import get_profile_label

DIMENSIONS = ("R", "I", "A", "S", "E", "C")

def compute_riasec_scores(answers: List[RiasecAnswer]) -> RiasecScores:
    count = len(answers)
    if count not in (30, 60):
        raise ValueError(f"Expected exactly 30 or 60 answers, got {count}")

    questions_per_dimension = count // len(DIMENSIONS)
    max_question_id = count

    seen_ids = set()
    for a in answers:
        if a.question_id in seen_ids:
            raise ValueError(f"Duplicate question_id: {a.question_id}")
        seen_ids.add(a.question_id)
        if not (1 <= a.question_id <= max_question_id):
            raise ValueError(f"Invalid question_id: {a.question_id}")

    counts = {dim: 0 for dim in DIMENSIONS}
    
    for a in answers:
        if a.answer:
            dim_index = (a.question_id - 1) // questions_per_dimension
            if dim_index < len(DIMENSIONS):
                counts[DIMENSIONS[dim_index]] += 1

    scores = {k: v / float(questions_per_dimension) for k, v in counts.items()}
    
    if all(count == 0 for count in counts.values()):
        dominant_code = "---"
    else:
        sorted_dims = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        dominant_code = "".join(d[0] for d in sorted_dims[:3])
        
    profile_label = get_profile_label(dominant_code)
    
    return RiasecScores(
        R=scores["R"],
        I=scores["I"],
        A=scores["A"],
        S=scores["S"],
        E=scores["E"],
        C=scores["C"],
        dominant_code=dominant_code,
        profile_label=profile_label
    )