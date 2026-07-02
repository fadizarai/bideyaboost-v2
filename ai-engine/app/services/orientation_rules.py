from __future__ import annotations

from typing import Dict, List
from app.models.institution import Institution



# Règles de compatibilité bac selon le guide d'orientation tunisien.
# Un bachelier peut postuler à un domaine si son type de bac apparaît dans la liste.
# "Math" et "Sciences" ont accès à la quasi-totalité des filières en Tunisie.
# Si le domaine n'est pas listé ici → compatible avec tous les bacs (pas de restriction).
BAC_FIELDS_ALLOWED: Dict[str, List[str]] = {
    # Domaines réservés exclusivement aux bacheliers Économie/Gestion
    "Sciences Économiques": ["Economie"],
    "Commerce": ["Economie", "Technique", "Informatique", "Sciences", "Math"],
    "Finance": ["Economie", "Math", "Technique", "Informatique", "Sciences"],

    # Domaines réservés aux bacheliers Lettres
    "Droit": ["Lettres", "Economie", "Sciences", "Math", "Technique", "Informatique"],

    # Pas de restriction sur les autres domaines — Math/Sciences/Technique/Lettres
    # peuvent tous postuler selon leurs spécialités dans le guide
}

# Compatibilité inversée : pour chaque bac, quels domaines lui sont INTERDITS
BAC_EXCLUDED_FIELDS: Dict[str, List[str]] = {
    # Un bachelier Économie ne peut pas faire médecine ou ingénierie directement
    "Economie": ["Médecine", "Ingénierie", "Sciences de l'Ingénieur"],
    # Un bachelier Lettres ne peut pas faire médecine ni ingénierie
    "Lettres": ["Médecine", "Ingénierie", "Sciences de l'Ingénieur", "Informatique"],
    # Math, Sciences, Technique, Informatique, Sport : accès à tout sauf restriction spécifique
}


# Établissements à exclure pour les bacheliers :
# Le cycle ingénieur direct n'est pas accessible avec le bac —
# il faut passer par prépa, licence ou prépa intégrée.
EXCLUDED_INSTITUTION_TYPES: List[str] = [
    "École Nationale d'Ingénieurs",
    "Ecole Nationale d'Ingénieurs",
    "École Supérieure d'Ingénieurs",
    "Ecole Supérieure d'Ingénieurs",
    "École Polytechnique",
    "Ecole Polytechnique",
    "École d'Ingénieurs",
    "Ecole d'Ingénieurs",
]

EXCLUDED_DEGREES: List[str] = [
    "Cycle Ingénieur",
    "Diplôme d'Ingénieur",
    "Diplôme National d'Ingénieur",
    "Ingénieur",
    "DNI",
]


def is_engineer_school(institution: Institution) -> bool:
    """Retourne True si l'établissement mène directement au cycle ingénieur
    (inaccessible avec le bac seul)."""
    inst_type = (institution.institution_type or "").strip()
    degree = (institution.degree or "").strip()

    for excl in EXCLUDED_INSTITUTION_TYPES:
        if excl.lower() == inst_type.lower():
            return True

    for excl in EXCLUDED_DEGREES:
        if excl.lower() == degree.lower():
            return True

    return False


def is_bac_compatible(bac_type: str, institution: Institution) -> bool:
    """
    Returns True if the student's bac_type can apply to this institution.
    Uses an exclusion approach: by default everything is compatible, 
    unless the field is explicitly excluded for this bac type.
    """
    excluded_fields = BAC_EXCLUDED_FIELDS.get(bac_type, [])
    if not excluded_fields:
        # Math, Sciences, Technique, Informatique, Sport → no exclusions
        return True

    institution_field = (institution.field or "").strip().lower()
    return not any(excl.lower() in institution_field for excl in excluded_fields)


def filter_compatible_institutions(bac_type: str, institutions: list[Institution]) -> list[Institution]:
    # 1. Exclure les écoles d'ingénieurs (cycle direct, non accessible avec le bac)
    non_engineer = [inst for inst in institutions if not is_engineer_school(inst)]

    # 2. Filtrer par compatibilité bac
    compatible = [inst for inst in non_engineer if is_bac_compatible(bac_type, inst)]

    # Fallback : si tout est filtré, on retourne au moins les non-ingénieurs
    return compatible if compatible else non_engineer