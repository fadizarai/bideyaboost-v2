# Tunisian Higher Education Orientation System - Knowledge Base (2026)

This repository contains the complete, normalized, AI-ready Knowledge Base for the Tunisian Higher Education Orientation System (Guide d'Orientation Universitaire Tunisie 2026).

---

## Directory Structure

```
knowledge-base/
├── README.md                  # This file
├── erd.md                     # Entity Relationship Diagram (Mermaid)
├── governorates.json          # 24 Governorates
├── cities.json                # 39 Cities
├── universities.json          # 13 Universities + oversight organizations
├── bac_types.json             # 7 Baccalaureate paths with formulas
├── institutions.json          # 194 academic institutions (normalized)
├── departments.json           # 422 academic departments
├── programs.json              # 270 degree programs
├── courses.json               # 6,910 course modules
├── skills.json                # 65 hard and soft skills
├── careers.json               # 29 career roles
├── admission_scores.json      # 194 admission cutoff records
├── requirements.json          # 270 program requirement records
├── relations.json             # Complete graph relations & indexes
├── schema/
│   ├── json-schema.json       # JSON Schema specification
│   └── data-dictionary.md     # Full field list and types
└── scripts/
    ├── build_knowledge_base.py # Master python build script
    └── validate_integrity.py  # Referential integrity checker
```

---

## Entity Counts

- **Governorates**: 24
- **Cities**: 39
- **Universities**: 13
- **Bac Types**: 7
- **Institutions**: 194
- **Departments**: 422
- **Programs**: 270
- **Courses**: 6,910
- **Skills**: 65
- **Careers**: 29
- **Admission Scores**: 194
- **Requirements**: 270
- **Graph Relationships (Edges)**: 8,219

---

## Technical Features

1. **Normalized Architecture**: Avoids flat-file redundancy. The entire workspace conforms to clean, distinct entities linked via unique alphanumeric keys (`univ_001`, `inst_042`, `prog_105`, etc.).
2. **Referential Integrity**: Every foreign key is validated by our verification suite `validate_integrity.py` to ensure zero broken links.
3. **Graph Relationships (`relations.json`)**: Pre-linked vertices and edges enabling direct ingestion into Neo4j or traversal via Python code.
4. **AI-Ready Metadata**: All programs are pre-classified with MBTI personality matches, RIASEC codes, difficulty ratings, math/programming intensities, and expected salary indices.
5. **RAG & Search Optimization**: Field tags, slugs, French/Arabic translations, and detailed descriptions make this structure highly indexable by Vector DBs and Semantic Search Engines.

---

## Running the Build & Validation

To rebuild the knowledge base from raw source data:

```bash
# Navigate to scripts directory
cd scripts/

# Rebuild the dataset
python build_knowledge_base.py

# Validate referential integrity
python validate_integrity.py
```
