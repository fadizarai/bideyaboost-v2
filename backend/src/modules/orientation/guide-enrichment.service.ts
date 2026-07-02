import fs from 'fs';
import path from 'path';

type GuideInstitution = {
    institution: string;
    university?: string;
    city?: string | null;
    field?: string;
    specialty?: string | null;
    admission_score_last?: number | null;
    admission_score_min?: number | null;
    capacity?: number | null;
    orientation_code?: string | null;
    degree?: string | null;
    study_duration_years?: number | null;
    language_of_study?: string | null;
    academic_year?: string | null;
    website?: string | null;
};

type GuideDataset = {
    institutions?: GuideInstitution[];
    specialties?: GuideInstitution[];
};

export type EnrichContext = {
    bacType?: string;
};

type GuideProgram = {
    institution: string;
    specialty: string;
    specialty_raw?: string;
    orientation_code?: string | null;
    bac_section?: string;
    bac_type?: string | null;
    admission_score_last?: number | null;
};

type GuideProgramsDataset = {
    programs?: GuideProgram[];
};

let institutionIndex: Map<string, GuideInstitution> | null = null;
let specialtyIndex: Map<string, GuideInstitution> | null = null;
let specialtiesByInstitution: Map<string, GuideInstitution[]> | null = null;
let programsByInstitution: Map<string, GuideProgram[]> | null = null;
let programsByCode: Map<string, GuideProgram[]> | null = null;

/** Filières / domaines — never shown as spécialité. */
const GENERIC_FIELDS = new Set(
    [
        'Sciences de l\'Ingénieur',
        'Général',
        'Sciences Fondamentales',
        'Informatique et Technologies',
        'Sciences de la Vie',
        'Sciences Économiques et Gestion',
        'Sciences Economiques et Gestion',
        'Classes Préparatoires',
        'Droit et Sciences Politiques',
        'Lettres et Sciences Humaines',
        'Arts et Design',
        'Médecine et Paramédical',
        'Agriculture et Environnement',
        'Tourisme et Hôtellerie',
    ].map(normalizeKey),
);

const BAC_SPECIALTY_PATTERNS: Record<string, RegExp[]> = {
    Math: [/\(MP\)/i, /Mathématiques-Physique/i, /^Mathématiques$/i],
    Science: [/\(PC\)/i, /Physique-Chimie/i, /\(BG\)/i, /Biologie-Géologie/i, /^Physique$/i, /^Chimie$/i, /Sciences de la Vie/i],
    Tech: [/\(T\)/i, /^Technologie$/i],
    Info: [/Informatique/i, /\(MP\)/i],
    Eco: [/Gestion/i, /Économie/i, /Economie/i, /Comptabilité/i, /Finance/i],
    Letters: [/Lettres/i, /Langues/i, /Droit Public/i, /Droit Privé/i, /Sciences Politiques/i, /Histoire/i],
    Sport: [/Sport/i, /STAPS/i],
};

function normalizeKey(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function compositeKey(institution: string, specialty?: string | null, field?: string | null): string {
    const parts = [normalizeKey(institution)];
    if (specialty) parts.push(normalizeKey(specialty));
    else if (field) parts.push(normalizeKey(field));
    return parts.join('::');
}

function isGenericField(value: string | null | undefined): boolean {
    if (!value) return true;
    return GENERIC_FIELDS.has(normalizeKey(value));
}

function isValidSpecialtyName(
    specialty: string | null | undefined,
    institution: string,
    field?: string | null,
): boolean {
    if (!specialty) return false;
    const s = specialty.trim();
    if (!s || s.length < 2) return false;
    if (normalizeKey(s) === normalizeKey(institution)) return false;
    if (field && normalizeKey(s) === normalizeKey(field)) return false;
    if (isGenericField(s)) return false;
    return true;
}

function readJsonFile(filePath: string): unknown | null {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
    } catch {
        // ignore
    }
    return null;
}

function resolveDataPaths(filename: string): string[] {
    return [
        path.join(process.cwd(), 'data', filename),
        path.join(__dirname, '..', '..', '..', 'data', filename),
        path.join(__dirname, '..', '..', '..', '..', '..', 'ai-orientation-engine', 'app', 'data', filename),
        path.join(__dirname, '..', '..', '..', '..', '..', 'data', 'ai', 'ai', filename),
    ];
}

/** Primary: cleaned AI institutions.json. Fallback: guide JSON for specialties. */
function loadMergedGuideData(): GuideDataset {
    let aiInstitutions: GuideInstitution[] = [];
    for (const filePath of resolveDataPaths('institutions.json')) {
        const raw = readJsonFile(filePath);
        if (Array.isArray(raw)) {
            aiInstitutions = raw as GuideInstitution[];
            break;
        }
    }

    let guide: GuideDataset = {};
    for (const filePath of resolveDataPaths('bideyaboost_orientation_data.json')) {
        const raw = readJsonFile(filePath);
        if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
            guide = raw as GuideDataset;
            break;
        }
    }

    const byName = new Map<string, GuideInstitution>();
    for (const inst of guide.institutions ?? []) {
        if (inst.institution) byName.set(normalizeKey(inst.institution), inst);
    }
    for (const inst of aiInstitutions) {
        if (inst.institution) byName.set(normalizeKey(inst.institution), inst);
    }

    return {
        institutions: Array.from(byName.values()),
        specialties: guide.specialties ?? [],
    };
}

function loadGuidePrograms(): GuideProgram[] {
    for (const filePath of resolveDataPaths('guide_programs_2026.json')) {
        const raw = readJsonFile(filePath);
        if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
            const data = raw as GuideProgramsDataset;
            return data.programs ?? [];
        }
    }
    return [];
}

function ensureProgramIndexes(): void {
    if (programsByInstitution && programsByCode) return;
    programsByInstitution = new Map();
    programsByCode = new Map();

    for (const program of loadGuidePrograms()) {
        if (!program.institution || !program.specialty) continue;
        const instKey = normalizeKey(program.institution);
        const list = programsByInstitution.get(instKey) ?? [];
        list.push(program);
        programsByInstitution.set(instKey, list);

        if (program.orientation_code) {
            const codeKey = program.orientation_code.trim();
            const codeList = programsByCode.get(codeKey) ?? [];
            codeList.push(program);
            programsByCode.set(codeKey, codeList);
        }
    }
}

function getInstitutionPrograms(institution: string): GuideProgram[] {
    ensureProgramIndexes();
    const key = normalizeKey(institution);
    const exact = programsByInstitution!.get(key);
    if (exact?.length) return exact;

    const fuzzy: GuideProgram[] = [];
    for (const [instKey, list] of programsByInstitution!.entries()) {
        if (instKey.includes(key) || key.includes(instKey)) {
            fuzzy.push(...list);
        }
    }
    return fuzzy;
}

function pickBestProgram(
    candidates: GuideProgram[],
    bacType?: string,
    orientationCode?: string | null,
    targetScore?: number | null,
): GuideProgram | undefined {
    if (!candidates.length) return undefined;

    let pool = candidates.filter((p) => isValidSpecialtyName(p.specialty, p.institution));
    if (!pool.length) return undefined;

    if (orientationCode) {
        const codeHit = pool.find((p) => p.orientation_code === orientationCode);
        if (codeHit) return codeHit;
    }

    if (bacType) {
        const bacPool = pool.filter((p) => p.bac_type === bacType);
        if (bacPool.length) pool = bacPool;
    }

    if (targetScore != null) {
        return pool.reduce((best, cur) => {
            const curScore = cur.admission_score_last;
            const bestScore = best.admission_score_last;
            if (curScore == null) return best;
            if (bestScore == null) return cur;
            return Math.abs(curScore - targetScore) < Math.abs(bestScore - targetScore) ? cur : best;
        });
    }

    return pool[0];
}

function resolveSpecialtyFromPrograms(
    rec: Record<string, unknown>,
    ctx?: EnrichContext,
): { specialty: string | null; program?: GuideProgram } {
    const institution = typeof rec.institution === 'string' ? rec.institution.trim() : '';
    if (!institution) return { specialty: null };

    const orientationCode = typeof rec.orientation_code === 'string' ? rec.orientation_code : null;
    const targetScore = typeof rec.admission_score_last === 'number' ? rec.admission_score_last : null;

    const programs = getInstitutionPrograms(institution);
    const picked = pickBestProgram(programs, ctx?.bacType, orientationCode, targetScore);
    if (picked?.specialty) {
        return { specialty: picked.specialty, program: picked };
    }

    return { specialty: null };
}

function ensureIndexes(): void {
    if (institutionIndex && specialtyIndex && specialtiesByInstitution) return;
    ensureProgramIndexes();

    const raw = loadMergedGuideData();
    institutionIndex = new Map();
    specialtyIndex = new Map();
    specialtiesByInstitution = new Map();

    for (const inst of raw.institutions ?? []) {
        if (!inst.institution) continue;
        institutionIndex.set(normalizeKey(inst.institution), inst);
    }

    for (const spec of raw.specialties ?? []) {
        if (!spec.institution) continue;
        specialtyIndex.set(
            compositeKey(spec.institution, spec.specialty, spec.field),
            spec,
        );
        if (spec.specialty) {
            specialtyIndex.set(
                compositeKey(spec.institution, spec.specialty),
                spec,
            );
        }

        const instKey = normalizeKey(spec.institution);
        const list = specialtiesByInstitution.get(instKey) ?? [];
        list.push(spec);
        specialtiesByInstitution.set(instKey, list);
    }
}

function getInstitutionSpecialties(institution: string): GuideInstitution[] {
    ensureIndexes();
    return specialtiesByInstitution!.get(normalizeKey(institution)) ?? [];
}

function pickBestSpecialty(
    candidates: GuideInstitution[],
    bacType?: string,
    orientationCode?: string | null,
): GuideInstitution | undefined {
    const withSpecialty = candidates.filter((c) =>
        isValidSpecialtyName(c.specialty, c.institution, c.field),
    );
    if (!withSpecialty.length) return undefined;
    if (withSpecialty.length === 1) return withSpecialty[0];

    if (orientationCode) {
        const codeHit = withSpecialty.find(
            (c) => c.orientation_code && c.orientation_code === orientationCode,
        );
        if (codeHit) return codeHit;
    }

    if (bacType) {
        const patterns = BAC_SPECIALTY_PATTERNS[bacType] ?? [];
        for (const pattern of patterns) {
            const hit = withSpecialty.find((c) => c.specialty && pattern.test(c.specialty));
            if (hit) return hit;
        }
    }

    return withSpecialty[0];
}

function resolveSpecialtyFromGuide(
    rec: Record<string, unknown>,
    ctx?: EnrichContext,
): { specialty: string | null; guideEntry?: GuideInstitution; program?: GuideProgram } {
    const institution = typeof rec.institution === 'string' ? rec.institution.trim() : '';
    const rawSpecialty = typeof rec.specialty === 'string' ? rec.specialty.trim() : '';
    const rawField = typeof rec.field === 'string' ? rec.field.trim() : '';
    const orientationCode = typeof rec.orientation_code === 'string' ? rec.orientation_code : null;

    if (isValidSpecialtyName(rawSpecialty, institution, rawField)) {
        return { specialty: rawSpecialty };
    }

    ensureIndexes();

    const fromPrograms = resolveSpecialtyFromPrograms(rec, ctx);
    if (fromPrograms.specialty) {
        return { specialty: fromPrograms.specialty, program: fromPrograms.program };
    }

    if (!institution) return { specialty: null };

    const exactHit = specialtyIndex!.get(compositeKey(institution, rawSpecialty || null, rawField))
        ?? specialtyIndex!.get(compositeKey(institution, rawSpecialty || null))
        ?? (!isGenericField(rawField)
            ? specialtyIndex!.get(compositeKey(institution, null, rawField))
            : undefined);

    if (exactHit?.specialty && isValidSpecialtyName(exactHit.specialty, institution, exactHit.field)) {
        return { specialty: exactHit.specialty, guideEntry: exactHit };
    }

    const institutionSpecialties = getInstitutionSpecialties(institution);
    const picked = pickBestSpecialty(institutionSpecialties, ctx?.bacType, orientationCode);
    if (picked?.specialty) {
        return { specialty: picked.specialty, guideEntry: picked };
    }

    const instRecord = institutionIndex!.get(normalizeKey(institution));
    if (
        instRecord?.specialty
        && isValidSpecialtyName(instRecord.specialty, institution, instRecord.field)
    ) {
        return { specialty: instRecord.specialty, guideEntry: instRecord };
    }

    return { specialty: null };
}

function fuzzyInstitutionMatch(name: string): GuideInstitution | undefined {
    ensureIndexes();
    const normalized = normalizeKey(name);
    for (const [key, inst] of institutionIndex!.entries()) {
        if (key.includes(normalized) || normalized.includes(key)) {
            return inst;
        }
    }
    return undefined;
}

function lookupGuideInstitution(
    rec: Record<string, unknown>,
    guideEntry?: GuideInstitution,
): GuideInstitution | undefined {
    if (guideEntry) return guideEntry;

    ensureIndexes();

    const institution = typeof rec.institution === 'string' ? rec.institution : '';
    const specialty = typeof rec.specialty === 'string' ? rec.specialty : null;
    const field = typeof rec.field === 'string' ? rec.field : null;

    if (institution) {
        const specialtyHit = specialtyIndex!.get(compositeKey(institution, specialty, field))
            ?? specialtyIndex!.get(compositeKey(institution, specialty))
            ?? specialtyIndex!.get(compositeKey(institution, null, field));
        if (specialtyHit) return specialtyHit;

        const instHit = institutionIndex!.get(normalizeKey(institution));
        if (instHit) return instHit;

        const fuzzy = fuzzyInstitutionMatch(institution);
        if (fuzzy) return fuzzy;
    }

    const university = typeof rec.university === 'string' ? rec.university : '';
    if (university && field) {
        for (const inst of institutionIndex!.values()) {
            if (
                inst.university
                && normalizeKey(inst.university) === normalizeKey(university)
                && inst.field
                && normalizeKey(inst.field) === normalizeKey(field)
            ) {
                return inst;
            }
        }
    }

    return undefined;
}

export function enrichRecommendationWithGuide<T extends Record<string, unknown>>(
    rec: T,
    ctx?: EnrichContext,
): T {
    const { specialty, guideEntry, program } = resolveSpecialtyFromGuide(rec, ctx);
    const guide = lookupGuideInstitution(rec, guideEntry);

    const rawInstitution = typeof rec.institution === 'string' ? rec.institution.trim() : '';

    return {
        ...rec,
        institution: rawInstitution || guide?.institution || rec.institution,
        university: rec.university ?? guide?.university,
        field: rec.field ?? guide?.field,
        specialty,
        city: rec.city ?? guide?.city,
        admission_score_last: rec.admission_score_last ?? program?.admission_score_last ?? guide?.admission_score_last ?? null,
        admission_score_min: rec.admission_score_min ?? guide?.admission_score_min ?? null,
        capacity: rec.capacity ?? guide?.capacity ?? null,
        orientation_code: rec.orientation_code ?? program?.orientation_code ?? guide?.orientation_code ?? null,
        degree: rec.degree ?? guide?.degree ?? null,
        study_duration_years: rec.study_duration_years ?? guide?.study_duration_years ?? null,
        language_of_study: rec.language_of_study ?? guide?.language_of_study ?? null,
        academic_year: rec.academic_year ?? guide?.academic_year ?? null,
        website: rec.website ?? guide?.website ?? null,
    };
}

export function enrichRecommendationsWithGuide<T extends Record<string, unknown>>(
    recs: T[],
    ctx?: EnrichContext,
): T[] {
    return recs.map((rec) => enrichRecommendationWithGuide(rec, ctx));
}
