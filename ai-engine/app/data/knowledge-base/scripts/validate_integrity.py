#!/usr/bin/env python3
"""
Verify referential integrity across all generated JSON files in the knowledge base.
"""
import json
from pathlib import Path
import sys

KB_DIR = Path(__file__).resolve().parent.parent

def load_json(filename: str):
    path = KB_DIR / filename
    if not path.exists():
        print(f"Error: {filename} does not exist!")
        sys.exit(1)
    return json.loads(path.read_text(encoding="utf-8"))

def main():
    print("=" * 60)
    print("  Validating Referential Integrity of Tunisian Orientation KB")
    print("=" * 60)

    # Load all files
    govs = load_json("governorates.json")
    cities = load_json("cities.json")
    univs = load_json("universities.json")
    bacs = load_json("bac_types.json")
    insts = load_json("institutions.json")
    depts = load_json("departments.json")
    progs = load_json("programs.json")
    courses = load_json("courses.json")
    skills = load_json("skills.json")
    careers = load_json("careers.json")
    scores = load_json("admission_scores.json")
    reqs = load_json("requirements.json")
    relations = load_json("relations.json")

    # Create maps of IDs for O(1) lookup
    gov_ids = {g["id"] for g in govs}
    city_ids = {c["id"] for c in cities}
    univ_ids = {u["id"] for u in univs}
    bac_ids = {b["id"] for b in bacs}
    inst_ids = {i["id"] for i in insts}
    dept_ids = {d["id"] for d in depts}
    prog_ids = {p["id"] for p in progs}
    course_ids = {c["id"] for c in courses}
    skill_ids = {s["id"] for s in skills}
    career_ids = {c["id"] for c in careers}

    errors = []

    # 1. Cities -> Governorates
    for city in cities:
        gov_id = city.get("governorate_id")
        if gov_id and gov_id not in gov_ids:
            errors.append(f"City '{city['name_fr']}' ({city['id']}) references non-existent Governorates: {gov_id}")

    # 2. Universities -> Cities, Governorates
    for univ in univs:
        city_id = univ.get("city_id")
        gov_id = univ.get("governorate_id")
        if city_id and city_id not in city_ids:
            errors.append(f"Univ '{univ['name_fr']}' ({univ['id']}) references non-existent City: {city_id}")
        if gov_id and gov_id not in gov_ids:
            errors.append(f"Univ '{univ['name_fr']}' ({univ['id']}) references non-existent Governorate: {gov_id}")

    # 3. Institutions -> Univ, City, Governorate
    for inst in insts:
        univ_id = inst.get("university_id")
        city_id = inst.get("city_id")
        gov_id = inst.get("governorate_id")
        if univ_id and univ_id not in univ_ids:
            errors.append(f"Institution '{inst['name_fr']}' ({inst['id']}) references non-existent University: {univ_id}")
        if city_id and city_id not in city_ids:
            errors.append(f"Institution '{inst['name_fr']}' ({inst['id']}) references non-existent City: {city_id}")
        if gov_id and gov_id not in gov_ids:
            errors.append(f"Institution '{inst['name_fr']}' ({inst['id']}) references non-existent Governorate: {gov_id}")

    # 4. Departments -> Institution
    for dept in depts:
        inst_id = dept.get("institution_id")
        if not inst_id or inst_id not in inst_ids:
            errors.append(f"Department '{dept['name_fr']}' ({dept['id']}) references non-existent Institution: {inst_id}")

    # 5. Programs -> Institution, Department, University
    for prog in progs:
        inst_id = prog.get("institution_id")
        dept_id = prog.get("department_id")
        univ_id = prog.get("university_id")
        
        if not inst_id or inst_id not in inst_ids:
            errors.append(f"Program '{prog['name_fr']}' ({prog['id']}) references non-existent Institution: {inst_id}")
        if dept_id and dept_id not in dept_ids:
            errors.append(f"Program '{prog['name_fr']}' ({prog['id']}) references non-existent Department: {dept_id}")
        if univ_id and univ_id not in univ_ids:
            errors.append(f"Program '{prog['name_fr']}' ({prog['id']}) references non-existent University: {univ_id}")
            
        for b_id in prog.get("bac_type_ids", []):
            if b_id and b_id not in bac_ids:
                errors.append(f"Program '{prog['name_fr']}' ({prog['id']}) references non-existent Bac Type ID: {b_id}")

    # 6. Courses -> Program, Institution
    for course in courses:
        prog_id = course.get("program_id")
        inst_id = course.get("institution_id")
        if not prog_id or prog_id not in prog_ids:
            errors.append(f"Course '{course['name_fr']}' ({course['id']}) references non-existent Program: {prog_id}")
        if inst_id and inst_id not in inst_ids:
            errors.append(f"Course '{course['name_fr']}' ({course['id']}) references non-existent Institution: {inst_id}")

    # 7. Careers -> Skills
    for career in careers:
        for skill_id in career.get("required_skill_ids", []):
            if skill_id not in skill_ids:
                errors.append(f"Career '{career['title_fr']}' ({career['id']}) references non-existent Skill ID: {skill_id}")

    # 8. Admission Scores -> Institution
    for score in scores:
        inst_id = score.get("institution_id")
        if not inst_id or inst_id not in inst_ids:
            errors.append(f"Admission Score ({score['id']}) references non-existent Institution: {inst_id}")

    # 9. Requirements -> Program, Institution
    for req in reqs:
        prog_id = req.get("program_id")
        inst_id = req.get("institution_id")
        if not prog_id or prog_id not in prog_ids:
            errors.append(f"Requirement ({req['id']}) references non-existent Program: {prog_id}")
        if inst_id and inst_id not in inst_ids:
            errors.append(f"Requirement ({req['id']}) references non-existent Institution: {inst_id}")

    # 10. Relations Graph
    all_entity_ids = (
        gov_ids | city_ids | univ_ids | bac_ids | inst_ids |
        dept_ids | prog_ids | course_ids | skill_ids | career_ids
    )
    for edge in relations.get("edges", []):
        from_id = edge.get("from")
        to_id = edge.get("to")
        if from_id not in all_entity_ids:
            errors.append(f"Relation edge references non-existent 'from' ID: {from_id}")
        if to_id not in all_entity_ids:
            errors.append(f"Relation edge references non-existent 'to' ID: {to_id}")

    # Summary
    if errors:
        print(f"\n[FAIL] Referential integrity check failed with {len(errors)} errors:")
        for err in errors[:20]:
            print(f"  - {err}")
        if len(errors) > 20:
            print(f"  ... and {len(errors) - 20} more errors.")
        sys.exit(1)
    else:
        print("\n[PASS] Referential integrity check passed successfully! All IDs resolve correctly.")
        sys.exit(0)

if __name__ == "__main__":
    main()
