import unicodedata
from typing import Dict, Tuple

from app.models.riasec import RiasecScores

RIASEC_FIELD_MAP = {
    "R": [
        "Sciences de l'Ingénieur", "Génie Civil", "Génie Mécanique",
        "Génie Électrique", "Architecture", "Technologie",
        "Agriculture", "Génie Rural", "Environnement"
    ],
    "I": [
        "Informatique et Technologies", "Mathématiques", "Physique",
        "Chimie", "Biologie", "Sciences Fondamentales",
        "Médecine", "Pharmacie", "Recherche"
    ],
    "A": [
        "Architecture", "Arts et Lettres", "Communication",
        "Design", "Langues", "Journalisme", "Humanités"
    ],
    "S": [
        "Sciences Humaines", "Psychologie", "Éducation",
        "Travail Social", "Médecine", "Soins Infirmiers",
        "Sciences Infirmières", "Sciences Biologiques Appliquées"
    ],
    "E": [
        "Gestion", "Commerce", "Économie", "Finance",
        "Marketing", "Administration des Affaires",
        "Droit", "Sciences Juridiques"
    ],
    "C": [
        "Comptabilité", "Finance", "Gestion",
        "Administration", "Informatique de Gestion",
        "Statistiques", "Actuariat"
    ]
}

PROFILE_LABELS = {
    "R": "Praticien technique",
    "I": "Chercheur analytique",
    "A": "Créatif expressif",
    "S": "Aidant relationnel",
    "E": "Leader entrepreneur",
    "C": "Organisateur rigoureux",
    "RI": "Ingénieur technicien",
    "IR": "Ingénieur technicien",
    "IS": "Scientifique humaniste",
    "SI": "Scientifique humaniste",
    "IE": "Chercheur stratège",
    "EI": "Chercheur stratège",
    "EC": "Manager organisé",
    "CE": "Manager organisé",
    "SE": "Leader social",
    "ES": "Leader social",
    "AS": "Créatif social",
    "SA": "Créatif social",
    "RIE": "Ingénieur entrepreneur",
    "RIS": "Technicien de santé",
    "IAS": "Scientifique créatif",
    "IES": "Chercheur leader",
    "SEC": "Manager social",
    "ECS": "Entrepreneur organisé",
    "RIC": "Technicien analytique",
    "ASE": "Créatif communicant",
}

def get_profile_label(dominant_code: str) -> str:
    """
    Try 3-letter code first, then 2-letter, then 1-letter.
    Default: "Profil polyvalent"
    """
    if dominant_code == "---":
        return "Indéterminé"
        
    for i in range(3, 0, -1):
        prefix = dominant_code[:i]
        if prefix in PROFILE_LABELS:
            return PROFILE_LABELS[prefix]
            
    return "Profil polyvalent"

def normalize_string(s: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c)).lower()

def compute_interest_score(riasec: RiasecScores, institution_field: str) -> Tuple[float, Dict[str, float]]:
    norm_inst_field = normalize_string(institution_field)
    
    total_score = 0.0
    dim_contributions = {}
    
    scores_dict = {
        "R": riasec.R,
        "I": riasec.I,
        "A": riasec.A,
        "S": riasec.S,
        "E": riasec.E,
        "C": riasec.C
    }
    
    for dim, score in scores_dict.items():
        dim_contribution = 0.0
        if score > 0:
            for keyword in RIASEC_FIELD_MAP[dim]:
                norm_kw = normalize_string(keyword)
                if norm_kw == norm_inst_field:
                    dim_contribution = max(dim_contribution, score * 1.0)
                elif norm_kw in norm_inst_field or norm_inst_field in norm_kw:
                    dim_contribution = max(dim_contribution, score * 0.6)
        dim_contributions[dim] = round(dim_contribution, 4)
        total_score += dim_contribution
        
    if total_score > 0 and riasec.dominant_code != "---":
        top_dim = riasec.dominant_code[0]
        for keyword in RIASEC_FIELD_MAP[top_dim]:
            norm_kw = normalize_string(keyword)
            if norm_kw == norm_inst_field or norm_kw in norm_inst_field or norm_inst_field in norm_kw:
                total_score *= 1.15
                break
                
    total_score = min(max(total_score, 0.0), 1.0)
    return round(total_score, 4), dim_contributions