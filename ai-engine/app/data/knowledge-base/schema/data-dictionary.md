# Data Dictionary - Tunisian Higher Education Orientation Knowledge Base

This document describes the schema and fields for all 13 normalized entities in the `knowledge-base/` directory.

## Table of Contents
1. [Governorates (`governorates.json`)](#1-governorates-governoratesjson)
2. [Cities (`cities.json`)](#2-cities-citiesjson)
3. [Universities (`universities.json`)](#3-universities-universitiesjson)
4. [Bac Types (`bac_types.json`)](#4-bac-types-bac_typesjson)
5. [Institutions (`institutions.json`)](#5-institutions-institutionsjson)
6. [Departments (`departments.json`)](#6-departments-departmentsjson)
7. [Programs (`programs.json`)](#7-programs-programsjson)
8. [Courses (`courses.json`)](#8-courses-coursesjson)
9. [Skills (`skills.json`)](#9-skills-skillsjson)
10. [Careers (`careers.json`)](#10-careers-careersjson)
11. [Admission Scores (`admission_scores.json`)](#11-admission-scores-admission_scoresjson)
12. [Requirements (`requirements.json`)](#12-requirements-requirementsjson)
13. [Relations Graph (`relations.json`)](#13-relations-graph-relationsjson)

---

## 1. Governorates (`governorates.json`)
Contains the 24 administrative governorates of Tunisia.

| Field Name | Type | Description | Example |
|---|---|---|---|
| `id` | String (Key) | Unique ID for the governorate (`gov_001` to `gov_024`) | `"gov_001"` |
| `slug` | String | URL-safe slug | `"tunis"` |
| `name_fr` | String | Name in French | `"Tunis"` |
| `name_ar` | String | Name in Arabic | `"تونس"` |
| `name_en` | String | Name in English | `"Tunis"` |
| `region` | String | Geographic region of Tunisia | `"Grand Tunis"` |
| `population` | Integer | Estimated population | `1056300` |
| `gps` | Object | Latitude and Longitude coordinates | `{"lat": 36.8065, "lng": 10.1815}` |

---

## 2. Cities (`cities.json`)
Contains cities/towns where academic institutions are located.

| Field Name | Type | Description | Example |
|---|---|---|---|
| `id` | String (Key) | Unique ID for the city (`city_<slug>`) | `"city_tunis"` |
| `slug` | String | URL-safe slug | `"tunis"` |
| `name_fr` | String | Name in French | `"Tunis"` |
| `name_ar` | String | Name in Arabic | `"تونس"` |
| `governorate_id` | String (FK) | Reference to `governorates.json` | `"gov_001"` |
| `gps` | Object | Coordinates | `{"lat": 36.8065, "lng": 10.1815}` |

---

## 3. Universities (`universities.json`)
Contains Tunisian public universities and major oversight bodies (like DGET).

| Field Name | Type | Description | Example |
|---|---|---|---|
| `id` | String (Key) | Unique ID (`univ_001` to `univ_013`) | `"univ_001"` |
| `slug` | String | URL-safe slug | `"universite-de-tunis"` |
| `name_fr` | String | Name in French | `"Université de Tunis"` |
| `name_ar` | String | Name in Arabic | `"جامعة تونس"` |
| `abbreviation` | String | Short name / Abbreviation | `"UT"` |
| `type` | String | public / private | `"public"` |
| `city_id` | String (FK) | City location | `"city_tunis"` |
| `governorate_id` | String (FK) | Governorate location | `"gov_001"` |
| `website` | String | Official URL | `"http://www.utunis.rnu.tn"` |
| `phone` | String | Contact phone number | `"+216 71 568 765"` |
| `email` | String | Contact email | `"contact@ut.rnu.tn"` |

---

## 4. Bac Types (`bac_types.json`)
The 7 specialized paths in the Tunisian Baccalaureate.

| Field Name | Type | Description | Example |
|---|---|---|---|
| `id` | String (Key) | Unique ID (`bac_001` to `bac_007`) | `"bac_001"` |
| `slug` | String | URL-safe identifier | `"math"` |
| `code` | String | Standard code | `"Math"` |
| `name_fr` | String | French name | `"Mathématiques"` |
| `name_ar` | String | Arabic name | `"رياضيات"` |
| `key_subjects` | Array | Main exam subjects | `["Mathématiques", "Physique"]` |
| `orientation_formula` | String | Mathematical formula for orientation score | `"Formula FG + Math*2 + Phys*1.5"` |

---

## 5. Institutions (`institutions.json`)
Individual higher education institutes, faculties, or schools (194 total).

| Field Name | Type | Description | Example |
|---|---|---|---|
| `id` | String (Key) | Unique ID (`inst_001` to `inst_194`) | `"inst_001"` |
| `slug` | String | URL-safe slug | `"faculte-sciences-tunis"` |
| `name_fr` | String | French name | `"Faculté des Sciences de Tunis"` |
| `name_ar` | String | Arabic name | `"كلية العلوم بتونس"` |
| `university_id` | String (FK) | Reference to `universities.json` | `"univ_002"` |
| `address` | String | Physical address | `"Campus Universitaire, Tunis"` |
| `gps` | Object | Coordinates | `{"lat": 36.8315, "lng": 10.1478}` |
| `phone` | String | Phone contact | `"+216 71 872 600"` |
| `email` | String | Email contact | `"contact@fst.utm.tn"` |
| `website` | String | Official website | `"http://www.fst.rnu.tn"` |

---

## 6. Departments (`departments.json`)
Inferred academic departments per institution.

| Field Name | Type | Description | Example |
|---|---|---|---|
| `id` | String (Key) | Unique ID (`dep_001` to `dep_422`) | `"dep_001"` |
| `slug` | String | URL-safe slug | `"departement-informatique-fst"` |
| `name_fr` | String | French name | `"Département d'Informatique"` |
| `institution_id` | String (FK) | Reference to `institutions.json` | `"inst_001"` |

---

## 7. Programs (`programs.json`)
Specific degree offerings (e.g., Licenses, Engineering degrees) with AI recommendation profiles.

| Field Name | Type | Description | Example |
|---|---|---|---|
| `id` | String (Key) | Unique ID (`prog_001` to `prog_270`) | `"prog_001"` |
| `slug` | String | URL-safe slug | `"licence-informatique-fst"` |
| `name_fr` | String | Program name in French | `"Licence en Sciences de l'Informatique"` |
| `degree` | String | Type of degree | `"Licence"` |
| `duration_years` | Integer | Study duration | `3` |
| `capacity` | Integer | Student intake capacity | `150` |
| `admission_score_last` | Float | Orientation score of the last admitted student | `145.2` |
| `admission_score_min` | Float | Minimum baseline score | `120.0` |
| `bac_types` | Array of strings | Allowed Bac codes | `["Math", "Informatique"]` |
| `difficulty` | Integer (1-10) | Relative curriculum difficulty | `8` |
| `math_intensity` | Integer (1-10) | Mathematical intensity | `7` |
| `programming_intensity`| Integer (1-10)| Coding intensity | `9` |
| `physics_intensity` | Integer (1-10) | Physics intensity | `3` |
| `riasec_profile` | String | Holland RIASEC code | `"IRC"` |
| `mbti_recommended` | Array of strings | Suggested MBTI types | `["INTP", "INTJ"]` |
| `holland_codes` | Array | RIASEC letter list | `["I", "R", "C"]` |

---

## 8. Courses (`courses.json`)
Individual modules/courses taught in each program.

| Field Name | Type | Description | Example |
|---|---|---|---|
| `id` | String (Key) | Unique ID (`course_001` to `course_6910`) | `"course_001"` |
| `slug` | String | URL-safe slug | `"algorithmique-prog_001"` |
| `name_fr` | String | Course name | `"Algorithmique et Structures de Données"` |
| `program_id` | String (FK) | Reference to `programs.json` | `"prog_001"` |
| `semester` | Integer | Semester of study (1 to 10) | `1` |
| `year` | Integer | Year of study (1 to 5) | `1` |
| `ects` | Integer | European Credit Transfer system credits | `5` |
| `course_type` | String | Type: `core` / `elective` / `language` / `soft_skill` | `"core"` |

---

## 9. Skills (`skills.json`)
Hard/soft skills developed across different academic options.

| Field Name | Type | Description | Example |
|---|---|---|---|
| `id` | String (Key) | Unique ID (`skill_001` to `skill_065`) | `"skill_001"` |
| `slug` | String | URL-safe slug | `"python-programming"` |
| `name_fr` | String | French name | `"Programmation Python"` |
| `category` | String | hard_skill / soft_skill | `"hard_skill"` |
| `domain` | String | Knowledge area | `"programming"` |
| `difficulty` | Integer | Hardness level | `5` |
| `market_demand` | String | Market demand level | `"very_high"` |

---

## 10. Careers (`careers.json`)
Professional roles mapped to programs, complete with salary estimations in Tunisian and international markets.

| Field Name | Type | Description | Example |
|---|---|---|---|
| `id` | String (Key) | Unique ID (`career_001` to `career_029`) | `"career_001"` |
| `slug` | String | URL-safe slug | `"developpeur-logiciel"` |
| `title_fr` | String | French title | `"Développeur Logiciel"` |
| `title_en` | String | English title | `"Software Developer"` |
| `title_ar` | String | Arabic title | `"مطور برمجيات"` |
| `industry` | String | Employment sector | `"Technologies de l'Information"` |
| `salary_tunisia_monthly_tnd`| Integer | Monthly average salary in TND | `2200` |
| `salary_europe_annual_eur`| Integer | Annual average salary in EUR | `45000` |
| `salary_canada_annual_cad`| Integer | Annual average salary in CAD | `65000` |
| `salary_gulf_annual_aed` | Integer | Annual average salary in AED | `120000` |
| `employment_rate` | Float | Rate of employment after graduation | `0.92` |
| `future_outlook` | String | Job prospect index | `"very_high"` |
| `remote_work_opportunities`| String | Remote work potential | `"high"` |

---

## 11. Admission Scores (`admission_scores.json`)
Historical orientation scores.

| Field Name | Type | Description | Example |
|---|---|---|---|
| `id` | String (Key) | Unique ID (`adm_001` to `adm_194`) | `"adm_001"` |
| `institution_id` | String (FK) | Reference to `institutions.json` | `"inst_001"` |
| `academic_year` | String | Year of scores reference | `"2025-2026"` |
| `score_last_admitted` | Float | Cutoff score | `145.2` |
| `score_minimum` | Float | Baseline score | `120.0` |

---

## 12. Requirements (`requirements.json`)
Academic prerequisites per program.

| Field Name | Type | Description | Example |
|---|---|---|---|
| `id` | String (Key) | Unique ID (`req_001` to `req_270`) | `"req_001"` |
| `program_id` | String (FK) | Reference to `programs.json` | `"prog_001"` |
| `required_bac_types` | Array of strings | Bac paths accepted | `["Math", "Sciences"]` |
| `minimum_score` | Float | Threshold score | `120.0` |
| `portfolio_required` | Boolean | True if a portfolio is required | `false` |

---

## 13. Relations Graph (`relations.json`)
Holds the connections graph (edges) between entities for GNN or semantic RAG queries.

| Field Name | Type | Description | Example |
|---|---|---|---|
| `edges` | Array | List of directed relation edges | `[{"from": "univ_001", "to": "inst_001", "type": "HAS_INSTITUTION"}]` |
| `reverse_index` | Object | Inverted index for O(1) navigation | `{"univ_001": {"HAS_INSTITUTION": ["inst_001"]}}` |
