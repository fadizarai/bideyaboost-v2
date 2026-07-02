from __future__ import annotations

from dataclasses import dataclass
from typing import Dict
import unicodedata

from app.models.student import StudentInput

def get_subject_score(student: StudentInput, subject: str, default_from_bac: float) -> float:
    val = student.subjects_scores.model_dump().get(subject)
    if val is not None:
        return float(val)
    if hasattr(student.subjects_scores, "__extra__") and student.subjects_scores.__extra__:
        val = student.subjects_scores.__extra__.get(subject)
        if val is not None:
             return float(val)
    if hasattr(student.subjects_scores, "__dict__"):
        val = student.subjects_scores.__dict__.get(subject)
        if val is not None:
             return float(val)
    return default_from_bac


def get_option_bonus(student: StudentInput, subject: str) -> float:
    """Option : seule la partie (note - 10) est ajoutée si note > 10, sinon 0."""
    val = get_subject_score(student, subject, None)
    if val is None:
        return 0.0
    bonus = float(val) - 10.0
    return bonus if bonus > 0 else 0.0


# ─── Formules par section (coefficients officiels tunisiens) ─────────────────
# Formules Générale (FG) sans division (produit directement un score sur l'échelle 0-200)

def _math_fg(s: StudentInput) -> float:
    # 5. Mathématiques (رياضيات)
    # FG = 4MG + 2M + 1,5 SP + 0,5 SVT + 1F + 1ANG
    return (
        4 * s.bac_score
        + 2 * get_subject_score(s, "math", s.bac_score)
        + 1.5 * get_subject_score(s, "physics", s.bac_score)
        + 0.5 * get_subject_score(s, "science", s.bac_score)
        + 1 * get_subject_score(s, "french", s.bac_score)
        + 1 * get_subject_score(s, "english", s.bac_score)
        + get_option_bonus(s, "option")
    )


def _sciences_fg(s: StudentInput) -> float:
    # 1. Sciences Expérimentales (علوم تجريبية)
    # FG = 4MG + 1M + 1,5 SP + 1,5 SVT + 1F + 1ANG
    return (
        4 * s.bac_score
        + 1 * get_subject_score(s, "math", s.bac_score)
        + 1.5 * get_subject_score(s, "physics", s.bac_score)
        + 1.5 * get_subject_score(s, "science", s.bac_score)
        + 1 * get_subject_score(s, "french", s.bac_score)
        + 1 * get_subject_score(s, "english", s.bac_score)
        + get_option_bonus(s, "option")
    )


def _info_fg(s: StudentInput) -> float:
    # 3. Sciences Informatiques (علوم إعلامية)
    # FG = 4MG + 1,5 M + 1,5 Algo + 0,5 SP + 0,5 STI + 1F + 1ANG
    return (
        4 * s.bac_score
        + 1.5 * get_subject_score(s, "math", s.bac_score)
        + 1.5 * get_subject_score(s, "algo", s.bac_score)
        + 0.5 * get_subject_score(s, "physics", s.bac_score)
        + 0.5 * get_subject_score(s, "sti", s.bac_score)
        + 1 * get_subject_score(s, "french", s.bac_score)
        + 1 * get_subject_score(s, "english", s.bac_score)
        + get_option_bonus(s, "option")
    )


def _tech_fg(s: StudentInput) -> float:
    # 4. Sciences Techniques (علوم تقنية)
    # FG = 4MG + 1,5 TE + 1,5 M + 1 SP + 1F + 1ANG
    return (
        4 * s.bac_score
        + 1.5 * get_subject_score(s, "tech", s.bac_score)
        + 1.5 * get_subject_score(s, "math", s.bac_score)
        + 1 * get_subject_score(s, "physics", s.bac_score)
        + 1 * get_subject_score(s, "french", s.bac_score)
        + 1 * get_subject_score(s, "english", s.bac_score)
        + get_option_bonus(s, "option")
    )


def _eco_fg(s: StudentInput) -> float:
    # 2. Économie et Gestion (اقتصاد وتصرف)
    # FG = 4MG + 1,5 Ec + 1,5 Ge + 0,5 M + 0,5 HG + 1F + 1ANG
    return (
        4 * s.bac_score
        + 1.5 * get_subject_score(s, "economie", s.bac_score)
        + 1.5 * get_subject_score(s, "gestion", s.bac_score)
        + 0.5 * get_subject_score(s, "math", s.bac_score)
        + 0.5 * get_subject_score(s, "history_geo", s.bac_score)
        + 1 * get_subject_score(s, "french", s.bac_score)
        + 1 * get_subject_score(s, "english", s.bac_score)
        + get_option_bonus(s, "option")
    )


def _lettres_fg(s: StudentInput) -> float:
    # 6. Lettres (آداب)
    # FG = 4MG + 1,5 A + 1,5 PH + 1 HG + 1F + 1ANG
    return (
        4 * s.bac_score
        + 1.5 * get_subject_score(s, "arabic", s.bac_score)
        + 1.5 * get_subject_score(s, "philosophy", s.bac_score)
        + 1 * get_subject_score(s, "history_geo", s.bac_score)
        + 1 * get_subject_score(s, "french", s.bac_score)
        + 1 * get_subject_score(s, "english", s.bac_score)
        + get_option_bonus(s, "option")
    )


def _sport_fg(s: StudentInput) -> float:
    # 7. Éducation Physique (رياضة)
    # FG = 4MG + 1,5 SB + 1 Sp-Sport + 0,5 EP + 0,5 SP + 0,5 PH + 1F + 1ANG
    sb = get_subject_score(s, "science", s.bac_score)
    sp_sport = get_subject_score(s, "sport_pratique", get_subject_score(s, "sport", s.bac_score))
    ep = get_subject_score(s, "ep", get_subject_score(s, "sport_theorique", get_subject_score(s, "sport", s.bac_score)))
    sp = get_subject_score(s, "physics", s.bac_score)
    ph = get_subject_score(s, "philosophy", s.bac_score)
    f = get_subject_score(s, "french", s.bac_score)
    ang = get_subject_score(s, "english", s.bac_score)
    return (
        4 * s.bac_score
        + 1.5 * sb
        + 1 * sp_sport
        + 0.5 * ep
        + 0.5 * sp
        + 0.5 * ph
        + 1 * f
        + 1 * ang
        + get_option_bonus(s, "option")
    )


SECTION_FORMULAS = {
    "math":     _math_fg,
    "sciences": _sciences_fg,
    "info":     _info_fg,
    "tech":     _tech_fg,
    "eco":      _eco_fg,
    "lettres":  _lettres_fg,
    "sport":    _sport_fg,
}

SECTION_KEYWORDS = {
    "lettres":  ["lettre", "literature", "adab", "lettres"],
    "math":     ["math", "mathematique", "maths"],
    "sciences": ["science", "svt", "experimental", "sciences"],
    "eco":      ["eco", "gestion", "economique", "economics", "economie"],
    "tech":     ["tech", "technique", "technologique"],
    "info":     ["info", "informatique", "computer"],
    "sport":    ["sport"],
}

@dataclass(frozen=True)
class ScoreBreakdown:
    orientation_score: float
    orientation_score_base: float
    bonus_applied: bool
    bonus_percentage: float
    weights_used: Dict[str, float]

def _detect_section(bac_type: str) -> str:
    token = unicodedata.normalize("NFKD", bac_type).encode("ASCII", "ignore").decode("utf-8").lower()
    for section, keywords in SECTION_KEYWORDS.items():
        for kw in keywords:
            if kw in token:
                return section
    return "math"

from app.models.institution import Institution

CLOSEST_REGIONS = {
    "tunis": ["ariana", "benarous", "manouba"],
    "ariana": ["tunis", "manouba", "benarous"],
    "benarous": ["tunis", "ariana", "manouba"],
    "manouba": ["tunis", "ariana", "benarous"],
    
    "nabeul": ["zaghouan", "tunis", "benarous"],
    "zaghouan": ["benarous", "manouba", "nabeul", "sousse"],
    "bizerte": ["ariana", "manouba", "beja"],
    
    "beja": ["jendouba", "siliana", "bizerte"],
    "jendouba": ["beja", "kef"],
    "kef": ["jendouba", "siliana", "kasserine"],
    "siliana": ["beja", "kef", "kairouan", "zaghouan"],
    
    "sousse": ["monastir", "mahdia", "kairouan"],
    "monastir": ["sousse", "mahdia"],
    "mahdia": ["monastir", "sousse", "sfax"],
    
    "sfax": ["mahdia", "sidibouzid", "gabes"],
    "kairouan": ["sousse", "siliana", "sidibouzid"],
    "sidibouzid": ["kairouan", "kasserine", "sfax", "gafsa"],
    
    "kasserine": ["sidibouzid", "gafsa", "kef"],
    "gafsa": ["tozeur", "kebili", "sidibouzid", "kasserine"],
    "tozeur": ["gafsa", "kebili"],
    "kebili": ["gabes", "gafsa", "tozeur"],
    
    "gabes": ["medenine", "kebili", "sfax"],
    "medenine": ["tataouine", "gabes"],
    "tataouine": ["medenine"]
}

def get_governorate(name: str | None) -> str:
    if not name:
        return ""
    n = unicodedata.normalize('NFKD', str(name)).encode('ASCII', 'ignore').decode('utf-8').lower().strip()
    for prefix in ['la ', 'le ', 'el ', 'l\'']:
        if n.startswith(prefix):
            n = n[len(prefix):]
    return n.replace(" ", "").replace("-", "").replace("_", "")

def get_specialty_key(inst: Institution) -> str:
    field_norm = get_governorate(inst.field)
    spec_norm = get_governorate(inst.specialty) if inst.specialty else ""
    deg_norm = get_governorate(inst.degree) if inst.degree else ""
    return f"{field_norm}|{spec_norm}|{deg_norm}"

def is_excluded_specialty(inst: Institution) -> bool:
    name_norm = unicodedata.normalize('NFKD', inst.institution).encode('ASCII', 'ignore').decode('utf-8').lower()
    deg_norm = unicodedata.normalize('NFKD', inst.degree or "").encode('ASCII', 'ignore').decode('utf-8').lower()
    
    # 1. les 4 faculte de medecine (Tunis, Sousse, Monastir, Sfax)
    # Check degree doctorat en medecine, but exclude dentaire and veterinaire
    if "doctorat en medecine" in deg_norm or ("faculte" in name_norm and "medecine" in name_norm and "dentaire" not in name_norm and "veterinaire" not in name_norm):
        return True
    
    # 2. prepa & prepa integre
    if "preparatoire" in deg_norm or "preparatoire" in name_norm or "prepa" in name_norm:
        return True
        
    # 3. architecture ENAU
    if "enau" in name_norm or ("architecture" in name_norm and "urbanisme" in name_norm and "ecole nationale" in name_norm):
        return True
        
    return False

def calculate_orientation_score(
    student: StudentInput,
    institution_field: str,
    mention: str = None,
    institution: Institution | None = None,
    all_institutions: list[Institution] | None = None
) -> ScoreBreakdown:
    section = _detect_section(student.bac_type)
    formula = SECTION_FORMULAS.get(section, SECTION_FORMULAS["math"])
    
    score_base = formula(student)

    bonus_applied = False
    if student.bac_score >= 10.0 and institution is not None:
        if not is_excluded_specialty(institution):
            student_gov = get_governorate(student.region)
            inst_gov = get_governorate(institution.city)
            
            if student_gov == inst_gov:
                # Direct hometown match
                bonus_applied = True
            elif all_institutions:
                # Specialty doesn't exist in student's hometown, check if offered in closest town
                spec_key = get_specialty_key(institution)
                
                # Is this specialty offered in student's hometown?
                offered_in_hometown = any(
                    get_governorate(inst.city) == student_gov and get_specialty_key(inst) == spec_key
                    for inst in all_institutions
                )
                
                if not offered_in_hometown:
                    # Find all governorates where this specialty is offered
                    offering_govs = {
                        get_governorate(inst.city) for inst in all_institutions
                        if get_specialty_key(inst) == spec_key
                    }
                    # Check closest governorates in order
                    closest = CLOSEST_REGIONS.get(student_gov, [])
                    closest_offering = None
                    for c_gov in closest:
                        if c_gov in offering_govs:
                            closest_offering = c_gov
                            break
                    
                    if closest_offering and inst_gov == closest_offering:
                        bonus_applied = True

    bonus_percentage = 0.07 if bonus_applied else 0.0
    bonus = bonus_percentage * score_base if bonus_applied else 0.0
        
    score_total = score_base + bonus
    return ScoreBreakdown(
        orientation_score=round(score_total, 4),
        orientation_score_base=round(score_base, 4),
        bonus_applied=bonus_applied,
        bonus_percentage=bonus_percentage,
        weights_used={"section": section, "bonus": round(bonus, 4)},
    )

AFFINITY_MAP = {
    "informatique": ["informatique", "technologies", "numerique"],
    "info":         ["informatique", "technologies", "numerique"],
    "ia":           ["informatique", "technologies", "numerique"],
    "dev":          ["informatique", "technologies", "numerique"],
    "ingenieur":    ["ingenieur", "sciences de l'ingenieur", "genie"],
    "ingenierie":   ["ingenieur", "sciences de l'ingenieur", "genie"],
    "medecine":     ["medecine", "medical", "sante", "biologie", "sciences biologiques"],
    "sante":        ["medecine", "medical", "sante", "biologie", "sciences biologiques"],
    "medical":      ["medecine", "medical", "sante", "biologie", "sciences biologiques"],
    "economie":     ["economie", "gestion", "commerce", "finance"],
    "gestion":      ["economie", "gestion", "commerce", "finance"],
    "business":     ["economie", "gestion", "commerce", "finance"],
    "architecture": ["architecture", "urbanisme"],
    "urbanisme":    ["architecture", "urbanisme"],
    "droit":        ["droit", "sciences juridiques"],
    "juridique":    ["droit", "sciences juridiques"],
}

def interest_compatibility(interests: list[str], institution_field: str, specialty: str | None = None) -> float:
    if not interests:
        return 0.0

    def normalize(text: str) -> str:
        if not text: return ""
        return unicodedata.normalize("NFKD", text).encode("ASCII", "ignore").decode("utf-8").lower()

    field_norm = normalize(institution_field)
    
    max_score = 0.0
    for interest in interests:
        interest_norm = normalize(interest)
        if not interest_norm: continue
        
        if interest_norm in field_norm:
            max_score = max(max_score, 1.0)
            continue
            
        mapped_categories = AFFINITY_MAP.get(interest_norm, [])
        for cat in mapped_categories:
            if normalize(cat) in field_norm:
                max_score = max(max_score, 0.6)
                break
                
    return max_score

def academic_advantage(orientation_score: float, admission_last: float | None) -> float:
    # both orientation_score and admission_last are on the 100-200 FG scale
    if admission_last is None or admission_last <= 0:
        return max(0.1, min(1.0, orientation_score / 200.0))
    ratio = orientation_score / max(admission_last, 1e-6)
    return max(0.0, min(1.0, ratio))

def location_preference(preferred_city: str | None, institution_city: str | None) -> float:
    if not institution_city or not preferred_city:
        return 0.5
        
    pref = preferred_city.strip().lower()
    inst = institution_city.strip().lower()
    
    if pref == inst:
        return 1.0
        
    tunis_areas = {"tunis", "ariana", "manouba", "la manouba", "ben arous", "carthage", "el manar", "bardo", "le bardo"}
    if pref in tunis_areas and inst in tunis_areas:
        return 1.0
        
    return 0.35

def capacity_factor(capacity: int | None) -> float:
    if capacity is None:
        return 0.5
    if capacity <= 0:
        return 0.1
    return max(0.2, min(1.0, capacity / 300.0))