#!/usr/bin/env python3
"""
Build the AI-Ready Knowledge Base for Tunisian Higher Education Orientation System.
Reads existing institutions.json, normalizes, enriches, and generates all JSON files.

Usage:
    python build_knowledge_base.py
"""
from __future__ import annotations

import json
import re
import unicodedata
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ── Paths ────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
KB_DIR = SCRIPT_DIR.parent          # knowledge-base/
DATA_DIR = KB_DIR.parent            # app/data/
SOURCE_INSTITUTIONS = DATA_DIR / "institutions.json"

NOW = datetime.now(timezone.utc).isoformat()
ACADEMIC_YEAR = "2025-2026"

# ── Import domain knowledge ─────────────────────────────────
import sys
sys.path.insert(0, str(SCRIPT_DIR))
from domain_knowledge import (
    GOVERNORATES, CITY_TO_GOVERNORATE, UNIVERSITIES, BAC_TYPES,
    INSTITUTION_ENRICHMENT, FIELD_TO_PROGRAMS, SKILLS_CATALOG,
    CAREERS_CATALOG, AI_METADATA_BY_FIELD,
)


# ══════════════════════════════════════════════════════════════
#  UTILITY FUNCTIONS
# ══════════════════════════════════════════════════════════════

def slugify(text: str) -> str:
    """Create a URL-safe slug from text."""
    s = unicodedata.normalize("NFD", text.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return re.sub(r"-+", "-", s)


def make_id(prefix: str, index: int) -> str:
    """Generate a zero-padded ID like 'inst_001'."""
    return f"{prefix}_{index:03d}"


def make_hash_id(prefix: str, text: str) -> str:
    """Generate a deterministic ID from text."""
    h = hashlib.md5(text.encode("utf-8")).hexdigest()[:6]
    return f"{prefix}_{h}"


def base_record(**kwargs) -> dict:
    """Create a record with standard metadata fields."""
    rec = {
        "created_at": NOW,
        "updated_at": NOW,
        "language": "fr",
    }
    rec.update(kwargs)
    return rec


def normalize_city(city: str | None) -> str:
    """Normalize city name, fixing common issues."""
    if not city or city == "Inconnu":
        return "Inconnu"
    city = city.strip()
    FIXES = {
        "El Manar": "Tunis",
        "Le Bardo": "Tunis",
        "Hammam Lif": "Ben Arous",
        "Boumhel": "Ben Arous",
        "Ezzahra": "Ben Arous",
        "Hammam Chott": "Ben Arous",
        "La Soukra": "Ariana",
        "Gabes": "Gabès",
        "Medenine": "Médenine",
        "Kebili": "Kébili",
    }
    # Don't collapse to governorate — keep city name, just fix encoding
    return city


def find_governorate(city: str) -> str | None:
    """Find the governorate for a city."""
    if not city or city == "Inconnu":
        return None
    # Direct match
    if city in CITY_TO_GOVERNORATE:
        return CITY_TO_GOVERNORATE[city]
    # Fuzzy match
    city_lower = city.lower().strip()
    for c, g in CITY_TO_GOVERNORATE.items():
        if c.lower() == city_lower:
            return g
    # City might be the governorate itself
    gov_names = [g["name_fr"] for g in GOVERNORATES]
    for g in gov_names:
        if g.lower() == city_lower:
            return g
    return None


# ══════════════════════════════════════════════════════════════
#  BUILDERS
# ══════════════════════════════════════════════════════════════

def build_governorates() -> list[dict]:
    """Build normalized governorates list."""
    result = []
    for i, gov in enumerate(GOVERNORATES, 1):
        result.append(base_record(
            id=make_id("gov", i),
            slug=slugify(gov["name_fr"]),
            name_fr=gov["name_fr"],
            name_ar=gov["name_ar"],
            name_en=gov["name_en"],
            region=gov["region"],
            population=gov["population"],
            gps=gov["gps"],
            source=["INS Tunisia", "Wikipedia"],
            confidence_score=0.95,
        ))
    return result


def build_cities(source_data: list[dict], governorates: list[dict]) -> list[dict]:
    """Build normalized cities from source institutions + known data."""
    gov_lookup = {g["name_fr"]: g["id"] for g in governorates}

    # Collect unique cities from source data
    raw_cities = set()
    for rec in source_data:
        city = rec.get("city", "").strip()
        if city and city != "Inconnu":
            raw_cities.add(city)

    # Also add governorate capitals
    for gov in GOVERNORATES:
        raw_cities.add(gov["name_fr"])

    # Build city records
    result = []
    seen = set()
    for i, city_name in enumerate(sorted(raw_cities), 1):
        if city_name.lower() in seen:
            continue
        seen.add(city_name.lower())

        gov_name = find_governorate(city_name)
        gov_id = gov_lookup.get(gov_name) if gov_name else None

        # Try to get GPS from governorate data
        gps = None
        for gov in GOVERNORATES:
            if gov["name_fr"] == city_name:
                gps = gov["gps"]
                break

        # Arabic names for major cities
        CITY_AR = {
            "Tunis": "تونس", "Ariana": "أريانة", "Ben Arous": "بن عروس",
            "Manouba": "منوبة", "Nabeul": "نابل", "Zaghouan": "زغوان",
            "Bizerte": "بنزرت", "Béja": "باجة", "Jendouba": "جندوبة",
            "Le Kef": "الكاف", "Siliana": "سليانة", "Sousse": "سوسة",
            "Monastir": "المنستير", "Mahdia": "المهدية", "Sfax": "صفاقس",
            "Kairouan": "القيروان", "Kasserine": "القصرين",
            "Sidi Bouzid": "سيدي بوزيد", "Gabès": "قابس",
            "Médenine": "مدنين", "Tataouine": "تطاوين", "Gafsa": "قفصة",
            "Tozeur": "توزر", "Kébili": "قبلي",
            "El Manar": "المنار", "Hammam Sousse": "حمام سوسة",
            "Ksar Hellal": "قصر هلال", "Moknine": "المكنين",
            "Hammam Lif": "حمام الأنف", "La Soukra": "السكرة",
            "Tabarka": "طبرقة", "Le Bardo": "باردو",
            "Grombalia": "قرمبالية", "Dar Chaabane": "دار شعبان",
            "Kélibia": "قليبية", "Msaken": "مساكن",
            "Kalâa Kébira": "القلعة الكبرى",
        }

        result.append(base_record(
            id=f"city_{slugify(city_name)}",
            slug=slugify(city_name),
            name_fr=city_name,
            name_ar=CITY_AR.get(city_name, ""),
            name_en=city_name,  # For most Tunisian cities, English = French
            governorate_id=gov_id,
            governorate_name=gov_name,
            gps=gps,
            source=["orientation.tn"],
            confidence_score=0.90 if gps else 0.70,
        ))

    return result


def build_universities(governorates: list[dict], cities: list[dict]) -> list[dict]:
    """Build normalized universities."""
    gov_lookup = {g["name_fr"]: g["id"] for g in governorates}
    city_lookup = {c["name_fr"]: c["id"] for c in cities}

    result = []
    for i, univ in enumerate(UNIVERSITIES, 1):
        result.append(base_record(
            id=make_id("univ", i),
            slug=slugify(univ["name_fr"]),
            name_fr=univ["name_fr"],
            name_ar=univ["name_ar"],
            name_en=univ["name_en"],
            abbreviation=univ["abbreviation"],
            type=univ["type"],
            city_id=city_lookup.get(univ["city"]),
            city=univ["city"],
            governorate_id=gov_lookup.get(univ["governorate"]),
            governorate=univ["governorate"],
            address=univ.get("address", ""),
            gps=univ.get("gps"),
            website=univ.get("website", ""),
            phone=univ.get("phone", ""),
            email=univ.get("email", ""),
            facebook=univ.get("facebook", ""),
            linkedin="",
            logo_url=None,
            description=univ.get("description", ""),
            founded_year=univ.get("founded_year"),
            institution_count=0,  # Will be filled later
            source=["orientation.tn", "Official university websites"],
            confidence_score=0.95,
        ))
    return result


def build_bac_types() -> list[dict]:
    """Build bac types reference data."""
    result = []
    for i, bt in enumerate(BAC_TYPES, 1):
        result.append(base_record(
            id=make_id("bac", i),
            slug=bt["code"],
            code=bt["code"],
            name_fr=bt["name_fr"],
            name_ar=bt["name_ar"],
            name_en=bt["name_en"],
            description=bt["description"],
            key_subjects=bt["key_subjects"],
            compatible_fields=bt["compatible_fields"],
            orientation_formula=bt["orientation_formula"],
            weight_math=bt["weight_math"],
            weight_physics=bt["weight_physics"],
            weight_science=bt["weight_science"],
            source=["Ministère de l'Enseignement Supérieur"],
            confidence_score=0.95,
        ))
    return result


def build_institutions(
    source_data: list[dict],
    universities: list[dict],
    cities: list[dict],
    governorates: list[dict],
) -> list[dict]:
    """Normalize institutions from flat source data."""
    univ_lookup = {u["name_fr"]: u["id"] for u in universities}
    city_lookup = {c["name_fr"]: c["id"] for c in cities}
    gov_lookup = {g["name_fr"]: g["id"] for g in governorates}

    result = []
    seen_names = set()

    for i, rec in enumerate(source_data, 1):
        name = rec["institution"]
        if name in seen_names:
            continue
        seen_names.add(name)

        city = rec.get("city", "Inconnu")
        gov_name = find_governorate(city)

        # Get enrichment data
        enrich = INSTITUTION_ENRICHMENT.get(name, {})

        inst_id = make_id("inst", i)
        result.append(base_record(
            id=inst_id,
            slug=slugify(name),
            name_fr=name,
            name_ar=enrich.get("name_ar", ""),
            name_en=enrich.get("name_en", ""),
            abbreviation=enrich.get("abbreviation", ""),
            institution_type=rec.get("institution_type", ""),
            university_id=univ_lookup.get(rec.get("university", ""), ""),
            university=rec.get("university", ""),
            city_id=city_lookup.get(city, ""),
            city=city,
            governorate_id=gov_lookup.get(gov_name, "") if gov_name else "",
            governorate=gov_name or "",
            address=enrich.get("address", ""),
            gps=enrich.get("gps"),
            phone=enrich.get("phone", ""),
            email=enrich.get("email", ""),
            website=rec.get("website", ""),
            facebook=enrich.get("facebook", ""),
            linkedin="",
            logo_url=None,
            description=enrich.get("description", ""),
            campus_info="",
            student_life="",
            international_partnerships=[],
            erasmus_opportunities=False,
            exchange_programs=[],
            housing_info="",
            history="",
            # Admission data (from source)
            field=rec.get("field", "Général"),
            degree=rec.get("degree", ""),
            study_duration_years=rec.get("study_duration_years"),
            capacity=rec.get("capacity"),
            admission_score_last=rec.get("admission_score_last"),
            admission_score_min=rec.get("admission_score_min"),
            language_of_study=rec.get("language_of_study", "Français/Arabe"),
            academic_year=rec.get("academic_year", ACADEMIC_YEAR),
            riasec_code=rec.get("riasec_code", ""),
            source=[rec.get("source", "orientation.tn")],
            confidence_score=0.90 if enrich else 0.75,
            references=[rec.get("website", "")],
        ))

    return result


def build_departments(institutions: list[dict]) -> list[dict]:
    """Infer departments from institution fields."""
    # Map fields to department names
    FIELD_DEPARTMENTS = {
        "Informatique et Technologies": [
            "Département d'Informatique",
            "Département de Technologies de l'Information",
        ],
        "Sciences de l'Ingénieur": [
            "Département de Génie Électrique",
            "Département de Génie Mécanique",
            "Département de Génie Civil",
            "Département de Génie Informatique",
        ],
        "Sciences Économiques et Gestion": [
            "Département de Gestion",
            "Département d'Économie",
            "Département de Finance et Comptabilité",
        ],
        "Droit et Sciences Politiques": [
            "Département de Droit Privé",
            "Département de Droit Public",
            "Département de Sciences Politiques",
        ],
        "Sciences de la Santé": [
            "Département de Médecine",
            "Département de Sciences Fondamentales Médicales",
        ],
        "Langues": [
            "Département de Français",
            "Département d'Anglais",
            "Département d'Arabe",
        ],
        "Arts et Design": [
            "Département des Arts Plastiques",
            "Département de Design",
        ],
        "Général": [
            "Département des Sciences Fondamentales",
            "Département des Sciences Humaines",
        ],
    }

    result = []
    idx = 1
    seen = set()

    for inst in institutions:
        field = inst.get("field", "Général")
        dept_names = FIELD_DEPARTMENTS.get(field, FIELD_DEPARTMENTS["Général"])

        for dept_name in dept_names:
            key = f"{inst['id']}::{dept_name}"
            if key in seen:
                continue
            seen.add(key)

            result.append(base_record(
                id=make_id("dep", idx),
                slug=slugify(f"{dept_name}-{inst['abbreviation'] or inst['slug'][:10]}"),
                name_fr=dept_name,
                name_ar="",
                name_en="",
                institution_id=inst["id"],
                field=field,
                source=["Inferred from institution field"],
                confidence_score=0.60,
            ))
            idx += 1

    return result


def build_programs(
    institutions: list[dict],
    departments: list[dict],
    bac_types: list[dict],
) -> list[dict]:
    """Build program records by combining institution admission data with field templates."""
    dept_by_inst = {}
    for dep in departments:
        dept_by_inst.setdefault(dep["institution_id"], []).append(dep)

    bac_code_lookup = {bt["code"]: bt["id"] for bt in bac_types}

    result = []
    idx = 1

    for inst in institutions:
        field = inst.get("field", "Général")
        templates = FIELD_TO_PROGRAMS.get(field, FIELD_TO_PROGRAMS.get("Général", []))
        ai_meta = AI_METADATA_BY_FIELD.get(field, AI_METADATA_BY_FIELD["Général"])

        # Get first department for this institution
        inst_depts = dept_by_inst.get(inst["id"], [])
        default_dept_id = inst_depts[0]["id"] if inst_depts else ""

        # If institution has a specific degree, use it; otherwise use templates
        inst_degree = inst.get("degree", "")

        for tmpl in templates:
            # Skip templates that don't match institution degree
            if inst_degree and tmpl["degree"] != inst_degree:
                # But if it's "Général" field, keep the generic one
                if field != "Général":
                    continue

            for specialty in tmpl.get("specialties", [""]):
                prog_name = tmpl["name"]
                if specialty and specialty != "Formation Générale":
                    full_name = f"{prog_name} - {specialty}"
                else:
                    full_name = prog_name

                # Determine compatible bac types
                compatible_bacs = []
                for bt in BAC_TYPES:
                    if field in bt.get("compatible_fields", []) or field == "Général":
                        compatible_bacs.append(bt["code"])
                if not compatible_bacs:
                    compatible_bacs = ["math", "sciences", "informatique", "technique", "economie", "lettres"]

                # Build curriculum skeleton
                duration = tmpl.get("duration", inst.get("study_duration_years", 3))
                curriculum = []
                for sem in range(1, duration * 2 + 1):
                    curriculum.append({
                        "semester": sem,
                        "year": (sem + 1) // 2,
                        "modules": [],  # Filled by courses
                    })

                prog_id = make_id("prog", idx)
                result.append(base_record(
                    id=prog_id,
                    slug=slugify(f"{full_name}-{inst.get('abbreviation', '')}"),
                    name_fr=full_name,
                    name_ar="",
                    name_en="",
                    orientation_code=None,
                    institution_id=inst["id"],
                    institution_name=inst["name_fr"],
                    department_id=default_dept_id,
                    university_id=inst.get("university_id", ""),
                    degree=tmpl["degree"],
                    specialty=specialty,
                    duration_years=duration,
                    capacity=inst.get("capacity"),
                    admission_score_last=inst.get("admission_score_last"),
                    admission_score_min=inst.get("admission_score_min"),
                    bac_types=compatible_bacs,
                    bac_type_ids=[bac_code_lookup.get(b, "") for b in compatible_bacs],
                    languages=["French"] if "Français" in inst.get("language_of_study", "") else ["Arabic"],
                    academic_year=inst.get("academic_year", ACADEMIC_YEAR),
                    description=f"Programme de {full_name} à {inst['name_fr']}.",
                    objectives=[],
                    skills_developed=[],
                    career_ids=[],
                    curriculum=curriculum,
                    internships=True if duration >= 3 else False,
                    final_project=True if duration >= 3 else False,
                    master_opportunities=True if tmpl["degree"] in ["Licence Fondamentale", "Licence Appliquée"] else False,
                    phd_opportunities=False,
                    international_opportunities=False,
                    # AI Metadata
                    difficulty=ai_meta.get("difficulty", 5),
                    math_intensity=ai_meta.get("math_intensity", 5),
                    programming_intensity=ai_meta.get("programming_intensity", 3),
                    physics_intensity=ai_meta.get("physics_intensity", 3),
                    chemistry_intensity=ai_meta.get("chemistry_intensity", 2),
                    biology_intensity=ai_meta.get("biology_intensity", 2),
                    employment_rate=0.75,
                    riasec_profile=ai_meta.get("riasec_profile", ""),
                    mbti_recommended=ai_meta.get("mbti_recommended", []),
                    holland_codes=ai_meta.get("holland_codes", []),
                    strong_math_profile=ai_meta.get("strong_math", False),
                    creative_profile=ai_meta.get("creative", False),
                    research_profile=ai_meta.get("research", False),
                    business_profile=ai_meta.get("business", False),
                    leadership_profile=ai_meta.get("leadership", False),
                    keywords=ai_meta.get("keywords", []),
                    tags=ai_meta.get("tags", []),
                    recommended_interests=ai_meta.get("recommended_interests", []),
                    recommended_hobbies=ai_meta.get("recommended_hobbies", []),
                    learning_style=ai_meta.get("learning_style", ""),
                    recommended_personalities=[],
                    software_used=[],
                    programming_languages_taught=[],
                    frameworks=[],
                    laboratories=[],
                    research_fields=[],
                    source=inst.get("source", ["orientation.tn"]),
                    confidence_score=0.70,
                    references=[],
                ))
                idx += 1

    return result


def build_courses(programs: list[dict]) -> list[dict]:
    """Generate representative courses for each program based on its field."""
    FIELD_COURSES = {
        "Informatique et Technologies": {
            1: [
                ("Algorithmique et Structures de Données I", 5, "core"),
                ("Programmation C", 4, "core"),
                ("Mathématiques pour l'Informatique I", 4, "core"),
                ("Architecture des Ordinateurs", 3, "core"),
                ("Anglais Technique I", 2, "language"),
                ("Communication et Développement Personnel", 2, "soft_skill"),
            ],
            2: [
                ("Algorithmique et Structures de Données II", 5, "core"),
                ("Programmation Orientée Objet (Java)", 4, "core"),
                ("Mathématiques pour l'Informatique II", 4, "core"),
                ("Systèmes d'Exploitation", 3, "core"),
                ("Anglais Technique II", 2, "language"),
                ("Probabilités et Statistiques", 2, "core"),
            ],
            3: [
                ("Bases de Données", 5, "core"),
                ("Développement Web (HTML/CSS/JS)", 4, "core"),
                ("Réseaux Informatiques I", 4, "core"),
                ("Théorie des Langages et Compilation", 3, "core"),
                ("Analyse Numérique", 2, "core"),
                ("Droit de l'Informatique", 2, "elective"),
            ],
            4: [
                ("Génie Logiciel", 5, "core"),
                ("Développement Web Avancé (Frameworks)", 4, "core"),
                ("Réseaux Informatiques II", 3, "core"),
                ("Intelligence Artificielle", 4, "core"),
                ("Sécurité Informatique", 2, "core"),
                ("Anglais Technique III", 2, "language"),
            ],
            5: [
                ("Programmation Mobile", 4, "core"),
                ("Machine Learning", 4, "core"),
                ("Cloud Computing", 3, "elective"),
                ("Systèmes Distribués", 3, "core"),
                ("Gestion de Projet IT", 2, "soft_skill"),
                ("Stage en Entreprise", 4, "internship"),
            ],
            6: [
                ("Projet de Fin d'Études", 12, "project"),
                ("DevOps et CI/CD", 3, "elective"),
                ("Big Data", 3, "elective"),
                ("Entrepreneuriat et Innovation", 2, "soft_skill"),
                ("Deep Learning", 4, "elective"),
                ("Séminaire Professionnel", 2, "soft_skill"),
            ],
        },
        "Sciences Économiques et Gestion": {
            1: [
                ("Principes de Gestion", 5, "core"),
                ("Microéconomie I", 4, "core"),
                ("Comptabilité Générale I", 4, "core"),
                ("Mathématiques pour la Gestion I", 3, "core"),
                ("Droit Commercial", 2, "core"),
                ("Anglais des Affaires I", 2, "language"),
            ],
            2: [
                ("Macroéconomie I", 4, "core"),
                ("Comptabilité Générale II", 4, "core"),
                ("Mathématiques pour la Gestion II", 3, "core"),
                ("Marketing Fondamental", 4, "core"),
                ("Statistiques Descriptives", 3, "core"),
                ("Anglais des Affaires II", 2, "language"),
            ],
            3: [
                ("Finance d'Entreprise", 5, "core"),
                ("Comptabilité Analytique", 4, "core"),
                ("Management des Organisations", 4, "core"),
                ("Informatique de Gestion", 3, "core"),
                ("Droit des Sociétés", 2, "core"),
                ("Communication Professionnelle", 2, "soft_skill"),
            ],
            4: [
                ("Gestion des Ressources Humaines", 4, "core"),
                ("Contrôle de Gestion", 4, "core"),
                ("Marketing Stratégique", 4, "core"),
                ("Fiscalité", 3, "core"),
                ("Économétrie", 3, "core"),
                ("Éthique des Affaires", 2, "elective"),
            ],
            5: [
                ("Gestion Financière Internationale", 4, "core"),
                ("Audit et Commissariat aux Comptes", 4, "core"),
                ("Business Plan et Entrepreneuriat", 3, "core"),
                ("Systèmes d'Information de Gestion", 3, "core"),
                ("Stage en Entreprise", 4, "internship"),
                ("Mémoire de Recherche", 2, "project"),
            ],
            6: [
                ("Projet de Fin d'Études", 12, "project"),
                ("Stratégie d'Entreprise", 4, "core"),
                ("Commerce International", 3, "elective"),
                ("Développement Durable et RSE", 2, "elective"),
                ("Séminaire Professionnel", 2, "soft_skill"),
            ],
        },
    }

    # Default courses for fields not explicitly mapped
    DEFAULT_COURSES = {
        1: [("Introduction à la Discipline", 5, "core"), ("Méthodologie de Travail", 3, "core"), ("Langue Française", 2, "language"), ("Anglais", 2, "language")],
        2: [("Fondamentaux II", 5, "core"), ("Méthodologie de Recherche", 3, "core"), ("Culture Numérique", 2, "elective"), ("Développement Personnel", 2, "soft_skill")],
        3: [("Approfondissement I", 5, "core"), ("Projet Encadré", 4, "project"), ("Spécialisation I", 3, "core"), ("Stage d'Initiation", 4, "internship")],
        4: [("Approfondissement II", 5, "core"), ("Spécialisation II", 4, "core"), ("Séminaire", 3, "elective"), ("Pratique Professionnelle", 2, "soft_skill")],
        5: [("Spécialisation III", 5, "core"), ("Projet Tuteuré", 4, "project"), ("Stage Professionnel", 4, "internship")],
        6: [("Projet de Fin d'Études", 12, "project"), ("Séminaire de Recherche", 3, "elective"), ("Insertion Professionnelle", 2, "soft_skill")],
    }

    result = []
    idx = 1

    for prog in programs:
        # Find the right course template
        field = None
        for inst_field, courses in FIELD_COURSES.items():
            if inst_field.lower() in (prog.get("tags") or [""]):
                field = inst_field
                break

        # Match by keywords in program name
        prog_name_lower = prog.get("name_fr", "").lower()
        if "informatique" in prog_name_lower or "technolog" in prog_name_lower:
            field = "Informatique et Technologies"
        elif "gestion" in prog_name_lower or "économi" in prog_name_lower or "commerce" in prog_name_lower or "finance" in prog_name_lower:
            field = "Sciences Économiques et Gestion"

        courses_template = FIELD_COURSES.get(field, DEFAULT_COURSES)
        duration = prog.get("duration_years", 3)

        for sem in range(1, duration * 2 + 1):
            sem_courses = courses_template.get(sem, DEFAULT_COURSES.get(sem, []))
            for course_name, ects, course_type in sem_courses:
                course_id = make_id("course", idx)
                result.append(base_record(
                    id=course_id,
                    slug=slugify(f"{course_name}-{prog['id']}"),
                    name_fr=course_name,
                    name_ar="",
                    name_en="",
                    program_id=prog["id"],
                    institution_id=prog.get("institution_id", ""),
                    semester=sem,
                    year=(sem + 1) // 2,
                    ects=ects,
                    course_type=course_type,
                    description="",
                    prerequisites=[],
                    source=["Generated from LMD framework"],
                    confidence_score=0.50,
                ))
                idx += 1

    return result


def build_skills() -> list[dict]:
    """Build normalized skills catalog."""
    result = []
    idx = 1
    for name, data in SKILLS_CATALOG.items():
        result.append(base_record(
            id=make_id("skill", idx),
            slug=slugify(name),
            name_fr=name,
            name_en=name,  # Most tech skills are already in English/French
            name_ar="",
            category=data["category"],
            domain=data["domain"],
            difficulty=data["difficulty"],
            market_demand=data["market_demand"],
            source=["Industry knowledge", "LinkedIn Skills Index"],
            confidence_score=0.80,
        ))
        idx += 1
    return result


def build_careers(skills: list[dict]) -> list[dict]:
    """Build careers with salary data and skill references."""
    skill_lookup = {s["name_fr"]: s["id"] for s in skills}

    result = []
    for i, career in enumerate(CAREERS_CATALOG, 1):
        # Map skill names to IDs
        skill_ids = [skill_lookup.get(s, "") for s in career.get("skills", []) if skill_lookup.get(s)]

        result.append(base_record(
            id=make_id("career", i),
            slug=slugify(career["title_fr"]),
            title_fr=career["title_fr"],
            title_en=career["title_en"],
            title_ar=career["title_ar"],
            industry=career["industry"],
            related_fields=career.get("fields", []),
            salary_tunisia_monthly_tnd=career["salary_tunisia_tnd"],
            salary_europe_annual_eur=career["salary_europe_eur"],
            salary_canada_annual_cad=career["salary_canada_cad"],
            salary_gulf_annual_aed=career["salary_gulf_aed"],
            employment_rate=career["employment_rate"],
            future_outlook=career["future_outlook"],
            remote_work_opportunities=career["remote_work"],
            ai_compatibility=career["ai_compat"],
            data_science_compatibility=career["ds_compat"],
            cybersecurity_compatibility=career["cyber_compat"],
            cloud_compatibility=career["cloud_compat"],
            embedded_systems_compatibility=career["embedded_compat"],
            entrepreneurship_opportunities=career["entrepreneurship"],
            required_skill_ids=skill_ids,
            required_skills=career.get("skills", []),
            program_ids=[],  # Filled by relationship builder
            source=["Emploi.tn", "Glassdoor", "LinkedIn Salary Insights", "Tanitjobs"],
            confidence_score=0.65,
        ))
    return result


def build_admission_scores(institutions: list[dict]) -> list[dict]:
    """Extract admission score records from institutions."""
    result = []
    idx = 1
    for inst in institutions:
        if inst.get("admission_score_last") is None:
            continue
        result.append(base_record(
            id=make_id("adm", idx),
            slug=slugify(f"admission-{inst['slug']}-{ACADEMIC_YEAR}"),
            institution_id=inst["id"],
            institution_name=inst["name_fr"],
            academic_year=inst.get("academic_year", ACADEMIC_YEAR),
            score_last_admitted=inst.get("admission_score_last"),
            score_minimum=inst.get("admission_score_min"),
            capacity=inst.get("capacity"),
            degree=inst.get("degree", ""),
            field=inst.get("field", ""),
            source=["orientation.tn"],
            confidence_score=0.95,
        ))
        idx += 1
    return result


def build_requirements(programs: list[dict], bac_types: list[dict]) -> list[dict]:
    """Build admission requirements for each program."""
    result = []
    idx = 1
    for prog in programs:
        result.append(base_record(
            id=make_id("req", idx),
            slug=slugify(f"req-{prog['slug'][:30]}"),
            program_id=prog["id"],
            program_name=prog.get("name_fr", ""),
            institution_id=prog.get("institution_id", ""),
            required_bac_types=prog.get("bac_types", []),
            minimum_score=prog.get("admission_score_min"),
            last_admitted_score=prog.get("admission_score_last"),
            capacity=prog.get("capacity"),
            additional_requirements=[],
            interview_required=False,
            portfolio_required=True if "art" in prog.get("name_fr", "").lower() or "design" in prog.get("name_fr", "").lower() else False,
            physical_test_required=True if "sport" in prog.get("name_fr", "").lower() else False,
            source=["orientation.tn"],
            confidence_score=0.80,
        ))
        idx += 1
    return result


def build_relations(
    universities: list[dict],
    institutions: list[dict],
    departments: list[dict],
    programs: list[dict],
    skills: list[dict],
    careers: list[dict],
    courses: list[dict],
) -> dict:
    """Build graph-like relationships and reverse indices."""
    edges = []

    # University → Institution
    for inst in institutions:
        if inst.get("university_id"):
            edges.append({"from": inst["university_id"], "to": inst["id"], "type": "HAS_INSTITUTION"})

    # Institution → Department
    for dep in departments:
        if dep.get("institution_id"):
            edges.append({"from": dep["institution_id"], "to": dep["id"], "type": "HAS_DEPARTMENT"})

    # Department → Program (or Institution → Program)
    for prog in programs:
        if prog.get("department_id"):
            edges.append({"from": prog["department_id"], "to": prog["id"], "type": "OFFERS_PROGRAM"})
        if prog.get("institution_id"):
            edges.append({"from": prog["institution_id"], "to": prog["id"], "type": "HAS_PROGRAM"})

    # Program → Course
    for course in courses:
        if course.get("program_id"):
            edges.append({"from": course["program_id"], "to": course["id"], "type": "INCLUDES_COURSE"})

    # Program → Career (based on field matching)
    for prog in programs:
        prog_fields = prog.get("tags", [])
        for career in careers:
            career_fields = career.get("related_fields", [])
            if any(f.lower() in [cf.lower() for cf in career_fields] for f in prog_fields) or \
               any(f.lower() in prog.get("name_fr", "").lower() for f in career_fields):
                edges.append({"from": prog["id"], "to": career["id"], "type": "LEADS_TO_CAREER"})

    # Skill → Career
    for career in careers:
        for skill_id in career.get("required_skill_ids", []):
            edges.append({"from": skill_id, "to": career["id"], "type": "ENABLES_CAREER"})

    # Build reverse index
    reverse_index = {}
    for edge in edges:
        from_id = edge["from"]
        to_id = edge["to"]
        rel_type = edge["type"]

        reverse_index.setdefault(to_id, {}).setdefault(f"reverse_{rel_type}", []).append(from_id)
        reverse_index.setdefault(from_id, {}).setdefault(rel_type, []).append(to_id)

    # Deduplicate reverse index lists
    for entity_id, rels in reverse_index.items():
        for rel_type, ids in rels.items():
            reverse_index[entity_id][rel_type] = list(set(ids))

    return {
        "metadata": {
            "total_edges": len(edges),
            "edge_types": list(set(e["type"] for e in edges)),
            "generated_at": NOW,
        },
        "edges": edges,
        "reverse_index": reverse_index,
    }


def update_counts(universities: list[dict], institutions: list[dict]) -> None:
    """Update institution_count on universities."""
    counts = {}
    for inst in institutions:
        uid = inst.get("university_id", "")
        if uid:
            counts[uid] = counts.get(uid, 0) + 1
    for univ in universities:
        univ["institution_count"] = counts.get(univ["id"], 0)


# ══════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════

def main():
    print("=" * 60)
    print("  Building AI-Ready Knowledge Base")
    print("  Tunisian Higher Education Orientation System")
    print("=" * 60)

    # -- Load source data --
    print("\n[1/12] Loading source institutions.json ...")
    if not SOURCE_INSTITUTIONS.exists():
        raise SystemExit(f"Source file not found: {SOURCE_INSTITUTIONS}")
    source_data = json.loads(SOURCE_INSTITUTIONS.read_text(encoding="utf-8"))
    print(f"  -> {len(source_data)} records loaded")

    # -- Build entities --
    print("\n[2/12] Building governorates ...")
    governorates = build_governorates()
    print(f"  -> {len(governorates)} governorates")

    print("\n[3/12] Building cities ...")
    cities = build_cities(source_data, governorates)
    print(f"  -> {len(cities)} cities")

    print("\n[4/12] Building universities ...")
    universities = build_universities(governorates, cities)
    print(f"  -> {len(universities)} universities")

    print("\n[5/12] Building bac types ...")
    bac_types_list = build_bac_types()
    print(f"  -> {len(bac_types_list)} bac types")

    print("\n[6/12] Normalizing institutions ...")
    institutions = build_institutions(source_data, universities, cities, governorates)
    print(f"  -> {len(institutions)} institutions")

    # Update university counts
    update_counts(universities, institutions)

    print("\n[7/12] Building departments ...")
    departments = build_departments(institutions)
    print(f"  -> {len(departments)} departments")

    print("\n[8/12] Building programs ...")
    programs = build_programs(institutions, departments, bac_types_list)
    print(f"  -> {len(programs)} programs")

    print("\n[9/12] Building courses ...")
    courses = build_courses(programs)
    print(f"  -> {len(courses)} courses")

    print("\n[10/12] Building skills ...")
    skills = build_skills()
    print(f"  -> {len(skills)} skills")

    print("\n[11/12] Building careers ...")
    careers = build_careers(skills)
    print(f"  -> {len(careers)} careers")

    print("\n[12/12] Building admission scores ...")
    admission_scores = build_admission_scores(institutions)
    print(f"  -> {len(admission_scores)} admission score records")

    # Build requirements
    print("\n[+] Building requirements ...")
    requirements = build_requirements(programs, bac_types_list)
    print(f"  -> {len(requirements)} requirement records")

    # Build relationships
    print("\n[+] Building relationships ...")
    relations = build_relations(universities, institutions, departments, programs, skills, careers, courses)
    print(f"  -> {relations['metadata']['total_edges']} relationship edges")

    # -- Write output files --
    print("\n" + "=" * 60)
    print("  Writing output files ...")
    print("=" * 60)

    output_files = {
        "governorates.json": governorates,
        "cities.json": cities,
        "universities.json": universities,
        "bac_types.json": bac_types_list,
        "institutions.json": institutions,
        "departments.json": departments,
        "programs.json": programs,
        "courses.json": courses,
        "skills.json": skills,
        "careers.json": careers,
        "admission_scores.json": admission_scores,
        "requirements.json": requirements,
        "relations.json": relations,
    }

    for filename, data in output_files.items():
        outpath = KB_DIR / filename
        outpath.write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        if isinstance(data, list):
            print(f"  [OK] {filename:30s} -> {len(data):>6,} records")
        else:
            print(f"  [OK] {filename:30s} -> written")

    # -- Summary --
    print("\n" + "=" * 60)
    print("  SUCCESS: Knowledge Base Built Successfully!")
    print("=" * 60)
    total = sum(len(d) if isinstance(d, list) else 1 for d in output_files.values())
    print(f"  Total entities: {total:,}")
    print(f"  Output directory: {KB_DIR}")
    print(f"  Generated at: {NOW}")


if __name__ == "__main__":
    main()
