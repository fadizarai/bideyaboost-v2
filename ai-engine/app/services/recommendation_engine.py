from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Iterable, Dict, Any, Union

from app.config import Settings
from app.ml.feature_engineering import build_student_features
from app.ml.model_loader import load_admission_predictor
from app.models.institution import Institution
from app.models.recommendation import RecommendationItem, RiasecMatch
from app.models.student import StudentInput
from app.models.riasec import RecommendationRequest
from app.services.gnn_recommender import GNNRecommender
from app.services.orientation_rules import filter_compatible_institutions       
from app.services.score_calculator import (
    academic_advantage,
    capacity_factor,
    location_preference,
)
from app.services.riasec_mapper import compute_interest_score, get_profile_label

logger = logging.getLogger(__name__)


class RecommendationEngine:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.institutions: list[Institution] = []
        self.predictor = load_admission_predictor(settings.model_dir)
        self.gnn = GNNRecommender()
        self.programs: list[dict] = []
        self.courses_by_prog: dict[str, list[dict]] = {}
        self.skills_by_id: dict[str, dict] = {}
        self.careers_by_id: dict[str, dict] = {}
        self.requirements_by_prog: dict[str, dict] = {}
        self.load_kb()

    def load_kb(self) -> None:
        self.kb_dir = Path(self.settings.institutions_path).parent / "knowledge-base"
        if not self.kb_dir.exists():
            logger.warning("Knowledge-base directory not found at %s", self.kb_dir)
            return

        # Load skills
        skills_path = self.kb_dir / "skills.json"
        if skills_path.exists():
            try:
                skills_list = json.loads(skills_path.read_text(encoding="utf-8"))
                self.skills_by_id = {s["id"]: s for s in skills_list}
            except Exception as e:
                logger.error("Failed to load skills.json: %s", e)

        # Load careers
        careers_path = self.kb_dir / "careers.json"
        if careers_path.exists():
            try:
                careers_list = json.loads(careers_path.read_text(encoding="utf-8"))
                self.careers_by_id = {c["id"]: c for c in careers_list}
            except Exception as e:
                logger.error("Failed to load careers.json: %s", e)

        # Load requirements
        reqs_path = self.kb_dir / "requirements.json"
        if reqs_path.exists():
            try:
                reqs_list = json.loads(reqs_path.read_text(encoding="utf-8"))
                self.requirements_by_prog = {r["program_id"]: r for r in reqs_list}
            except Exception as e:
                logger.error("Failed to load requirements.json: %s", e)

        # Load courses
        courses_path = self.kb_dir / "courses.json"
        if courses_path.exists():
            try:
                courses_list = json.loads(courses_path.read_text(encoding="utf-8"))
                for course in courses_list:
                    prog_id = course.get("program_id")
                    if prog_id:
                        self.courses_by_prog.setdefault(prog_id, []).append(course)
            except Exception as e:
                logger.error("Failed to load courses.json: %s", e)

        # Load programs
        programs_path = self.kb_dir / "programs.json"
        if programs_path.exists():
            try:
                self.programs = json.loads(programs_path.read_text(encoding="utf-8"))
                logger.info("Loaded %d programs from knowledge-base", len(self.programs))
            except Exception as e:
                logger.error("Failed to load programs.json: %s", e)

    def find_matching_program(self, inst_name: str, specialty: str | None, degree: str | None) -> dict | None:
        if not self.programs:
            return None
        
        # Priority 1: Match institution name, specialty, and degree
        for p in self.programs:
            if p.get("institution_name") == inst_name and p.get("specialty") == specialty and p.get("degree") == degree:
                return p
                
        # Priority 2: Match institution name and specialty
        if specialty:
            for p in self.programs:
                if p.get("institution_name") == inst_name and p.get("specialty") == specialty:
                    return p
                    
        # Priority 3: Match institution name and degree
        if degree:
            for p in self.programs:
                if p.get("institution_name") == inst_name and p.get("degree") == degree:
                    return p
                    
        # Priority 4: Match institution name
        for p in self.programs:
            if p.get("institution_name") == inst_name:
                return p
                
        return None

    def load_institutions(self) -> None:
        path = Path(self.settings.institutions_path)

        if path.exists():
            raw = json.loads(path.read_text(encoding="utf-8"))
            self.institutions = [Institution.model_validate(item) for item in raw]
            logger.info("Loaded %d institutions from %s", len(self.institutions), path)
            return

        fallback = Path(self.settings.fallback_orientation_dataset)
        if fallback.exists():
            root = json.loads(fallback.read_text(encoding="utf-8"))
            institutions_data = root.get("institutions", [])
            self.institutions = [Institution.model_validate(item) for item in institutions_data]
            logger.info("Loaded %d institutions from fallback dataset %s", len(self.institutions), fallback)
            return

        raise FileNotFoundError("No institution dataset found.")

    def list_institutions(self) -> list[Institution]:
        return self.institutions

    def recommend(self, student: Union[StudentInput, RecommendationRequest], top_k: int | None = None) -> list[RecommendationItem]:
        if not self.institutions:
            self.load_institutions()

        k = top_k or self.settings.top_k
        compatible = filter_compatible_institutions(student.bac_type, self.institutions)

        rows: list[tuple[Institution, float, float, float, float, float, str, Dict[str, float], str, str, float, float, bool]] = []
        gnn_feature_rows: list[dict[str, float]] = []

        is_riasec = isinstance(student, RecommendationRequest)
        
        # Need a dummy student input for build_student_features since it might depend on student format
        student_for_sf = student
        if is_riasec:
             student_for_sf = StudentInput(
                 bac_type=student.bac_type,
                 bac_score=student.bac_score,
                 region=student.region,
                 preferred_city=student.preferred_city or "NC",
                 subjects_scores=student.subjects_scores,
                 interests=[]
             )

        for institution in compatible:
            sf = build_student_features(student_for_sf, institution.field, institution=institution, all_institutions=self.institutions)
            admission_prob, confidence, _ = self.predictor.predict_probability(
                orientation_score=sf.orientation_score,
                institution=institution.model_dump(),
                city_name=student.preferred_city
            )

            if is_riasec:
                interest_score, dim_contribs = compute_interest_score(student.riasec, institution.field)
                dom_code = student.riasec.dominant_code
                label = student.riasec.profile_label or get_profile_label(dom_code)
            else:
                from app.services.score_calculator import interest_compatibility
                interest_score = interest_compatibility(student.interests, institution.field, institution.specialty)
                dim_contribs, dom_code, label = {}, "", ""
                
            academic_score = academic_advantage(sf.orientation_score, institution.admission_score_last)
            location_score = location_preference(student.preferred_city or "", institution.city)
            capacity_score = capacity_factor(institution.capacity)

            gnn_feature_rows.append(
                {
                    "interest": interest_score,
                    "academic": academic_score,
                    "admission": admission_prob,
                }
            )

            # The orientation_score is already on the FG scale (100-200) to match admission_score_last (100-200 scale)
            student_fg_scaled = sf.orientation_score
            student_fg_base = sf.orientation_score_base
            bonus_applied = sf.bonus_applied
            rows.append((institution, interest_score, academic_score, admission_prob, location_score, capacity_score, confidence, dim_contribs, dom_code, label, student_fg_scaled, student_fg_base, bonus_applied))

        gnn_adjustments = self.gnn.rank_adjustments(gnn_feature_rows)

        ranked: list[RecommendationItem] = []
        for idx, (institution, i_score, a_score, p_score, l_score, c_score, confidence, dim_contribs, dom_code, label, student_fg, student_fg_base, bonus_applied) in enumerate(rows):
            final_score = (
                0.35 * i_score
                + 0.25 * a_score
                + 0.20 * p_score
                + 0.10 * l_score
                + 0.10 * c_score
                + (gnn_adjustments[idx] if idx < len(gnn_adjustments) else 0.0) 
            )
            final_score = max(0.0, min(1.0, final_score))
            
            riasec_match = None
            if is_riasec:
                riasec_match = RiasecMatch(
                     dominant_code=dom_code,
                     profile_label=label,
                     dimension_contributions=dim_contribs
                )

            # score_difference: student FG (×10 scale) minus last admitted score (same scale)
            # Positive = student scores above last admitted (good), negative = below
            diff = None
            if institution.admission_score_last is not None:
                diff = round(student_fg - institution.admission_score_last, 2)

            details_obj = None
            matching_prog = self.find_matching_program(
                institution.institution,
                institution.specialty,
                institution.degree
            )
            if matching_prog:
                prog_id = matching_prog["id"]
                # Get curriculum
                courses_raw = self.courses_by_prog.get(prog_id, [])
                curriculum = [
                    {
                        "id": c["id"],
                        "name_fr": c["name_fr"],
                        "semester": c["semester"],
                        "year": c["year"],
                        "ects": c["ects"],
                        "course_type": c["course_type"]
                    }
                    for c in courses_raw
                ]
                
                # Get skills
                skills_list = []
                for s_name in matching_prog.get("skills_developed", []):
                    for skill in self.skills_by_id.values():
                        if skill["name_fr"].lower() == s_name.lower():
                            skills_list.append(skill)
                            break

                # Get careers
                careers_list = []
                for c_name in matching_prog.get("career_ids", []):
                    for career in self.careers_by_id.values():
                        if career["title_fr"].lower() == c_name.lower() or career["slug"] == c_name:
                            careers_list.append(career)
                            break
                            
                # Get requirements
                req = self.requirements_by_prog.get(prog_id)

                from app.models.recommendation import ProgramDetails
                details_obj = ProgramDetails(
                    id=prog_id,
                    slug=matching_prog["slug"],
                    difficulty=matching_prog.get("difficulty"),
                    math_intensity=matching_prog.get("math_intensity"),
                    programming_intensity=matching_prog.get("programming_intensity"),
                    physics_intensity=matching_prog.get("physics_intensity"),
                    employment_rate=matching_prog.get("employment_rate"),
                    riasec_profile=matching_prog.get("riasec_profile"),
                    mbti_recommended=matching_prog.get("mbti_recommended"),
                    holland_codes=matching_prog.get("holland_codes"),
                    keywords=matching_prog.get("keywords"),
                    tags=matching_prog.get("tags"),
                    curriculum=curriculum if curriculum else None,
                    skills=skills_list if skills_list else None,
                    careers=careers_list if careers_list else None,
                    requirements=req if req else None
                )

            ranked.append(
                RecommendationItem(
                    institution=institution.institution,
                    university=institution.university,
                    city=institution.city,
                    field=institution.field,
                    specialty=institution.specialty,
                    score=round(final_score, 4),
                    admission_probability=round(p_score, 4),
                    admission_score_last=institution.admission_score_last,
                    admission_score_min=institution.admission_score_min,
                    capacity=institution.capacity,
                    orientation_code=institution.orientation_code,
                    degree=institution.degree,
                    study_duration_years=institution.study_duration_years,
                    language_of_study=institution.language_of_study,
                    academic_year=institution.academic_year,
                    website=institution.website,
                    confidence=confidence,
                    riasec_match=riasec_match,
                    explanation=(
                        f"Interest={i_score:.2f}{'(RIASEC)' if is_riasec else ''}, Academic={a_score:.2f}, Admission={p_score:.2f}, "
                        f"Location={l_score:.2f}, Capacity={c_score:.2f}, Confidence={confidence}"
                    ),
                    student_orientation_score=round(student_fg, 2),
                    student_orientation_score_base=round(student_fg_base, 2),
                    bonus_applied=bonus_applied,
                    score_difference=diff,
                    details=details_obj
                )
            )

        # Categorize choices for Safe vs Close layout
        safe_choices = []
        target_choices = []
        other_choices = []

        for item in ranked:
            if item.score_difference is not None:
                if item.score_difference >= 4.0:
                    safe_choices.append(item)
                elif -4.0 <= item.score_difference < 4.0:
                    target_choices.append(item)
                else:
                    other_choices.append(item)
            else:
                other_choices.append(item)

        # Sort Safe choices descending by score_difference
        safe_choices.sort(key=lambda x: x.score_difference, reverse=True)
        # Sort Target choices descending by score (suitability score)
        target_choices.sort(key=lambda x: x.score, reverse=True)
        # Sort Other choices descending by score
        other_choices.sort(key=lambda x: x.score, reverse=True)

        final_recs = []

        # Take up to 5 Safe choices
        safe_selected = safe_choices[:5]
        final_recs.extend(safe_selected)

        # Fill remaining slots up to 5 from Target if Safe has fewer than 5
        remaining_safe_slots = 5 - len(safe_selected)
        if remaining_safe_slots > 0:
            target_for_safe = target_choices[:remaining_safe_slots]
            final_recs.extend(target_for_safe)
            target_choices = target_choices[remaining_safe_slots:]

        # Fill remaining slots up to 5 from Other if still need
        remaining_slots_1_5 = 5 - len(final_recs)
        if remaining_slots_1_5 > 0:
            other_for_safe = other_choices[:remaining_slots_1_5]
            final_recs.extend(other_for_safe)
            other_choices = other_choices[remaining_slots_1_5:]

        # Take up to 5 Target choices for slots 6-10
        target_selected = target_choices[:5]
        final_recs.extend(target_selected)

        # Fill remaining target slots from safe leftovers or other leftovers
        remaining_target_slots = 5 - len(target_selected)
        if remaining_target_slots > 0:
            leftover_safe = safe_choices[5:]
            safe_for_target = leftover_safe[:remaining_target_slots]
            final_recs.extend(safe_for_target)
            
            remaining_target_slots -= len(safe_for_target)
            if remaining_target_slots > 0:
                other_for_target = other_choices[:remaining_target_slots]
                final_recs.extend(other_for_target)

        return final_recs[:k]

    def predict_single_institution(self, student: Union[StudentInput, RecommendationRequest], institution_name: str) -> tuple[str, float, float]:
        if not self.institutions:
            self.load_institutions()

        target = next(
            (inst for inst in self.institutions if inst.institution.lower() == institution_name.lower()),
            None,
        )
        if target is None:
            raise ValueError(f"Institution not found: {institution_name}")      

        # same workaround
        student_for_sf = student
        if isinstance(student, RecommendationRequest):
             student_for_sf = StudentInput(
                 bac_type=student.bac_type,
                 bac_score=student.bac_score,
                 region=student.region,
                 preferred_city=student.preferred_city or "NC",
                 subjects_scores=student.subjects_scores,
                 interests=[]
             )
             
        sf = build_student_features(student_for_sf, target.field, institution=target, all_institutions=self.institutions)
        p, _, _ = self.predictor.predict_probability(
            orientation_score=sf.orientation_score,
            institution=target.model_dump(),
            city_name=student.preferred_city
        )
        return target.institution, round(p, 4), round(sf.orientation_score, 4)  

def create_engine(settings: Settings) -> RecommendationEngine:
    engine = RecommendationEngine(settings)
    engine.load_institutions()
    return engine
