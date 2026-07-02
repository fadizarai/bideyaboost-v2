export type BacTypeValue = 'Math' | 'Science' | 'Tech' | 'Info' | 'Eco' | 'Letters' | 'Sport';

/** Clé formulaire ; aiKey = clé envoyée au moteur IA (score_calculator.py) */
export interface SubjectField {
  key: string;
  aiKey?: string;
  labelFr: string;
  labelAr: string;
  labelEn: string;
  coefficient: number;
  /** Matière optionnelle : seul (note − 10) si note > 10, sans coef au dénominateur */
  optionBonus?: boolean;
  /** Utilisée dans le calcul FG officiel tunisien côté IA */
  usedInFg?: boolean;
}

export const BAC_TYPES: { value: BacTypeValue; labelFr: string; labelAr: string; labelEn: string }[] = [
  { value: 'Math', labelFr: 'Mathématiques', labelAr: 'رياضيات', labelEn: 'Mathematics' },
  { value: 'Science', labelFr: 'Sciences Expérimentales', labelAr: 'علوم تجريبية', labelEn: 'Experimental Sciences' },
  { value: 'Tech', labelFr: 'Sciences Techniques', labelAr: 'علوم تقنية', labelEn: 'Technical Sciences' },
  { value: 'Info', labelFr: 'Sciences Informatiques', labelAr: 'علوم إعلامية', labelEn: 'Computer Science' },
  { value: 'Eco', labelFr: 'Économie et Gestion', labelAr: 'اقتصاد وتصرف', labelEn: 'Economics & Management' },
  { value: 'Letters', labelFr: 'Lettres', labelAr: 'آداب', labelEn: 'Letters' },
  { value: 'Sport', labelFr: 'Sport', labelAr: 'رياضة', labelEn: 'Sport' },
];

/**
 * Matières complètes par section — alignées sur MoyenneCalculator.js + score_calculator.py
 */
export const SUBJECTS_BY_BAC: Record<BacTypeValue, SubjectField[]> = {
  Math: [
    { key: 'math', labelFr: 'Mathématiques', labelAr: 'الرياضيات', labelEn: 'Mathematics', coefficient: 4, usedInFg: true },
    { key: 'physics', labelFr: 'Physique', labelAr: 'الفيزياء', labelEn: 'Physics', coefficient: 4, usedInFg: true },
    { key: 'science', labelFr: 'Sciences naturelles', labelAr: 'العلوم الطبيعية', labelEn: 'Natural Sciences', coefficient: 1, usedInFg: true },
    { key: 'informatique', aiKey: 'info', labelFr: 'Informatique', labelAr: 'الإعلامية', labelEn: 'Computer Science', coefficient: 1 },
    { key: 'philosophy', labelFr: 'Philosophie', labelAr: 'الفلسفة', labelEn: 'Philosophy', coefficient: 1 },
    { key: 'arabic', labelFr: 'Arabe', labelAr: 'العربية', labelEn: 'Arabic', coefficient: 1 },
    { key: 'french', labelFr: 'Français', labelAr: 'الفرنسية', labelEn: 'French', coefficient: 1, usedInFg: true },
    { key: 'english', labelFr: 'Anglais', labelAr: 'الإنجليزية', labelEn: 'English', coefficient: 1, usedInFg: true },
    { key: 'sport', aiKey: 'ep', labelFr: 'Éducation physique', labelAr: 'التربية البدنية', labelEn: 'Physical Education', coefficient: 1 },
    { key: 'optional', labelFr: 'Matière optionnelle', labelAr: 'مادة اختيارية', labelEn: 'Optional Subject', coefficient: 0, optionBonus: true },
  ],
  Science: [
    { key: 'science', aiKey: 'sciences', labelFr: 'SVT', labelAr: 'علوم الحياة والأرض', labelEn: 'Life & Earth Sciences', coefficient: 4, usedInFg: true },
    { key: 'physics', labelFr: 'Sciences physiques', labelAr: 'العلوم الفيزيائية', labelEn: 'Physics', coefficient: 4, usedInFg: true },
    { key: 'math', labelFr: 'Mathématiques', labelAr: 'الرياضيات', labelEn: 'Mathematics', coefficient: 3, usedInFg: true },
    { key: 'french', labelFr: 'Français', labelAr: 'الفرنسية', labelEn: 'French', coefficient: 1, usedInFg: true },
    { key: 'english', labelFr: 'Anglais', labelAr: 'الإنجليزية', labelEn: 'English', coefficient: 1, usedInFg: true },
    { key: 'philosophy', labelFr: 'Philosophie', labelAr: 'الفلسفة', labelEn: 'Philosophy', coefficient: 1 },
    { key: 'arabic', labelFr: 'Arabe', labelAr: 'العربية', labelEn: 'Arabic', coefficient: 1 },
    { key: 'informatique', aiKey: 'info', labelFr: 'Informatique', labelAr: 'الإعلامية', labelEn: 'Computer Science', coefficient: 1 },
    { key: 'sport', aiKey: 'ep', labelFr: 'Éducation physique', labelAr: 'التربية البدنية', labelEn: 'Physical Education', coefficient: 1 },
    { key: 'optional', labelFr: 'Matière optionnelle', labelAr: 'مادة اختيارية', labelEn: 'Optional Subject', coefficient: 0, optionBonus: true },
  ],
  Tech: [
    { key: 'tech', labelFr: 'Technologie', labelAr: 'التكنولوجيا', labelEn: 'Technology', coefficient: 4, usedInFg: true },
    { key: 'math', labelFr: 'Mathématiques', labelAr: 'الرياضيات', labelEn: 'Mathematics', coefficient: 3, usedInFg: true },
    { key: 'physics', labelFr: 'Sciences physiques', labelAr: 'العلوم الفيزيائية', labelEn: 'Physics', coefficient: 3, usedInFg: true },
    { key: 'french', labelFr: 'Français', labelAr: 'الفرنسية', labelEn: 'French', coefficient: 1, usedInFg: true },
    { key: 'english', labelFr: 'Anglais', labelAr: 'الإنجليزية', labelEn: 'English', coefficient: 1, usedInFg: true },
    { key: 'philosophy', labelFr: 'Philosophie', labelAr: 'الفلسفة', labelEn: 'Philosophy', coefficient: 1 },
    { key: 'arabic', labelFr: 'Arabe', labelAr: 'العربية', labelEn: 'Arabic', coefficient: 1 },
    { key: 'informatique', aiKey: 'info', labelFr: 'Informatique', labelAr: 'الإعلامية', labelEn: 'Computer Science', coefficient: 1 },
    { key: 'sport', aiKey: 'ep', labelFr: 'Éducation physique', labelAr: 'التربية البدنية', labelEn: 'Physical Education', coefficient: 1 },
    { key: 'optional', labelFr: 'Matière optionnelle', labelAr: 'مادة اختيارية', labelEn: 'Optional Subject', coefficient: 0, optionBonus: true },
  ],
  Info: [
    { key: 'math', labelFr: 'Mathématiques', labelAr: 'الرياضيات', labelEn: 'Mathematics', coefficient: 3, usedInFg: true },
    { key: 'algo', labelFr: 'Algorithmes & programmation', labelAr: 'الخوارزميات والبرمجة', labelEn: 'Algorithms & programming', coefficient: 3, usedInFg: true },
    { key: 'sti', labelFr: 'STI', labelAr: 'STI', labelEn: 'STI', coefficient: 3, usedInFg: true },
    { key: 'physics', labelFr: 'Sciences physiques', labelAr: 'العلوم الفيزيائية', labelEn: 'Physics', coefficient: 2, usedInFg: true },
    { key: 'french', labelFr: 'Français', labelAr: 'الفرنسية', labelEn: 'French', coefficient: 1, usedInFg: true },
    { key: 'english', labelFr: 'Anglais', labelAr: 'الإنجليزية', labelEn: 'English', coefficient: 1, usedInFg: true },
    { key: 'philosophy', labelFr: 'Philosophie', labelAr: 'الفلسفة', labelEn: 'Philosophy', coefficient: 1 },
    { key: 'arabic', labelFr: 'Arabe', labelAr: 'العربية', labelEn: 'Arabic', coefficient: 1 },
    { key: 'sport', aiKey: 'ep', labelFr: 'Éducation physique', labelAr: 'التربية البدنية', labelEn: 'Physical Education', coefficient: 1 },
    { key: 'optional', labelFr: 'Matière optionnelle', labelAr: 'مادة اختيارية', labelEn: 'Optional Subject', coefficient: 0, optionBonus: true },
  ],
  Eco: [
    { key: 'gestion', labelFr: 'Gestion', labelAr: 'التصرف', labelEn: 'Management', coefficient: 4, usedInFg: true },
    { key: 'economie', labelFr: 'Économie', labelAr: 'الاقتصاد', labelEn: 'Economics', coefficient: 3, usedInFg: true },
    { key: 'math', labelFr: 'Mathématiques', labelAr: 'الرياضيات', labelEn: 'Mathematics', coefficient: 2, usedInFg: true },
    { key: 'history_geo', labelFr: 'Histoire-Géographie', labelAr: 'التاريخ والجغرافيا', labelEn: 'History & Geography', coefficient: 2, usedInFg: true },
    { key: 'french', labelFr: 'Français', labelAr: 'الفرنسية', labelEn: 'French', coefficient: 1, usedInFg: true },
    { key: 'english', labelFr: 'Anglais', labelAr: 'الإنجليزية', labelEn: 'English', coefficient: 1, usedInFg: true },
    { key: 'philosophy', labelFr: 'Philosophie', labelAr: 'الفلسفة', labelEn: 'Philosophy', coefficient: 1 },
    { key: 'arabic', labelFr: 'Arabe', labelAr: 'العربية', labelEn: 'Arabic', coefficient: 1 },
    { key: 'informatique', aiKey: 'info', labelFr: 'Informatique', labelAr: 'الإعلامية', labelEn: 'Computer Science', coefficient: 1 },
    { key: 'sport', aiKey: 'ep', labelFr: 'Éducation physique', labelAr: 'التربية البدنية', labelEn: 'Physical Education', coefficient: 1 },
    { key: 'optional', labelFr: 'Matière optionnelle', labelAr: 'مادة اختيارية', labelEn: 'Optional Subject', coefficient: 0, optionBonus: true },
  ],
  Letters: [
    { key: 'philosophy', labelFr: 'Philosophie', labelAr: 'الفلسفة', labelEn: 'Philosophy', coefficient: 4, usedInFg: true },
    { key: 'arabic', labelFr: 'Arabe', labelAr: 'العربية', labelEn: 'Arabic', coefficient: 4, usedInFg: true },
    { key: 'french', labelFr: 'Français', labelAr: 'الفرنسية', labelEn: 'French', coefficient: 2, usedInFg: true },
    { key: 'english', labelFr: 'Anglais', labelAr: 'الإنجليزية', labelEn: 'English', coefficient: 2, usedInFg: true },
    { key: 'history_geo', labelFr: 'Histoire-Géographie', labelAr: 'التاريخ والجغرافيا', labelEn: 'History & Geography', coefficient: 3, usedInFg: true },
    { key: 'islamic_thought', labelFr: 'Pensée islamique', labelAr: 'التفكير الإسلامي', labelEn: 'Islamic Thought', coefficient: 1 },
    { key: 'informatique_tp', aiKey: 'info', labelFr: 'Informatique (TP)', labelAr: 'الإعلامية (تطبيقي)', labelEn: 'Computer Science (practical)', coefficient: 0.5 },
    { key: 'informatique_ecrit', aiKey: 'info', labelFr: 'Informatique (écrit)', labelAr: 'الإعلامية (كتابي)', labelEn: 'Computer Science (written)', coefficient: 0.5 },
    { key: 'sport', aiKey: 'ep', labelFr: 'Éducation physique', labelAr: 'التربية البدنية', labelEn: 'Physical Education', coefficient: 1 },
    { key: 'optional', labelFr: 'Matière optionnelle', labelAr: 'مادة اختيارية', labelEn: 'Optional Subject', coefficient: 0, optionBonus: true },
  ],
  Sport: [
    { key: 'science', aiKey: 'sciences', labelFr: 'Sciences biologiques', labelAr: 'العلوم البيولوجية', labelEn: 'Biological sciences', coefficient: 3, usedInFg: true },
    { key: 'sport_theorique', labelFr: 'Éducation physique (théorique)', labelAr: 'التربية البدنية (نظري)', labelEn: 'PE (theory)', coefficient: 3, usedInFg: true },
    { key: 'sport_pratique', aiKey: 'sport', labelFr: 'Éducation physique (pratique)', labelAr: 'التربية البدنية (تطبيقي)', labelEn: 'PE (practical)', coefficient: 4, usedInFg: true },
    { key: 'math', labelFr: 'Mathématiques', labelAr: 'الرياضيات', labelEn: 'Mathematics', coefficient: 1, usedInFg: true },
    { key: 'physics', labelFr: 'Sciences physiques', labelAr: 'العلوم الفيزيائية', labelEn: 'Physics', coefficient: 1, usedInFg: true },
    { key: 'french', labelFr: 'Français', labelAr: 'الفرنسية', labelEn: 'French', coefficient: 1, usedInFg: true },
    { key: 'english', labelFr: 'Anglais', labelAr: 'الإنجليزية', labelEn: 'English', coefficient: 1, usedInFg: true },
    { key: 'philosophy', labelFr: 'Philosophie', labelAr: 'الفلسفة', labelEn: 'Philosophy', coefficient: 1, usedInFg: true },
    { key: 'arabic', labelFr: 'Arabe', labelAr: 'العربية', labelEn: 'Arabic', coefficient: 1 },
    { key: 'informatique', aiKey: 'info', labelFr: 'Informatique', labelAr: 'الإعلامية', labelEn: 'Computer Science', coefficient: 1 },
    { key: 'optional', labelFr: 'Matière optionnelle', labelAr: 'مادة اختيارية', labelEn: 'Optional Subject', coefficient: 0, optionBonus: true },
  ],
};

/** 24 gouvernorats tunisiens */
export const TUNISIAN_CITIES = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan',
  'Bizerte', 'Béja', 'Jendouba', 'Kef', 'Siliana',
  'Kairouan', 'Sousse', 'Monastir', 'Mahdia', 'Sfax',
  'Kasserine', 'Sidi Bouzid',
  'Gabès', 'Médenine', 'Tataouine',
  'Gafsa', 'Tozeur', 'Kebili',
];

export const INTEREST_SUGGESTIONS = [
  'Informatique', 'Médecine', 'Ingénierie', 'Business', 'Droit', 'Arts',
  'Sciences', 'Architecture', 'Éducation', 'Agriculture', 'Tourisme', 'Finance',
];

export function getSubjectLabel(field: SubjectField, lang: 'tn' | 'fr' | 'en') {
  if (lang === 'tn') return field.labelAr;
  if (lang === 'en') return field.labelEn;
  return field.labelFr;
}

export type BacCalcOptions = {
  /** Exclut l'EPS (coef 1) du calcul — candidats dispensés du sport */
  sportDispensed?: boolean;
};

/** EPS générale (coef 1) — dispensable hors section Sport */
export function isDispensableSportField(field: SubjectField, bacType: BacTypeValue): boolean {
  return bacType !== 'Sport' && field.key === 'sport';
}

export function sectionHasDispensableSport(bacType: BacTypeValue): boolean {
  return SUBJECTS_BY_BAC[bacType].some((f) => isDispensableSportField(f, bacType));
}

function getCalcFields(bacType: BacTypeValue, options?: BacCalcOptions): SubjectField[] {
  const fields = SUBJECTS_BY_BAC[bacType];
  if (!options?.sportDispensed) return fields;
  return fields.filter((f) => !isDispensableSportField(f, bacType));
}

function isOptionBonusField(field: SubjectField): boolean {
  return field.optionBonus === true || field.key === 'optional';
}

/**
 * Moyenne générale (MG) tunisienne :
 * MG = (Σ note_i × coef_i + bonus_option) / Σ coef_i
 * bonus_option = max(0, note_option − 10) — la matière optionnelle n'a pas de coef au dénominateur.
 */
export function computeBacAverage(
  subjects: Record<string, string>,
  bacType: BacTypeValue,
  options?: BacCalcOptions
): number | null {
  const fields = getCalcFields(bacType, options);
  let totalPoints = 0;
  let totalCoef = 0;
  let hasAny = false;

  for (const field of fields) {
    const raw = subjects[field.key]?.trim();
    if (!raw) continue;
    const num = parseFloat(raw);
    if (Number.isNaN(num) || num < 0 || num > 20) return null;
    if (isOptionBonusField(field)) {
      if (num > 10) totalPoints += num - 10;
      continue;
    }
    totalPoints += num * field.coefficient;
    totalCoef += field.coefficient;
    hasAny = true;
  }

  if (!hasAny || totalCoef === 0) return null;
  return Math.round((totalPoints / totalCoef) * 100) / 100;
}

/** Détail du calcul de moyenne pour affichage / console */
export function getAverageBreakdown(
  subjects: Record<string, string>,
  bacType: BacTypeValue,
  options?: BacCalcOptions
) {
  const lines: { subject: string; grade: number; coefficient: number; points: number }[] = [];
  let totalPoints = 0;
  let totalCoef = 0;

  for (const field of getCalcFields(bacType, options)) {
    const raw = subjects[field.key]?.trim();
    if (!raw) continue;
    const grade = parseFloat(raw);
    if (Number.isNaN(grade)) continue;
    if (isOptionBonusField(field)) {
      const bonus = grade > 10 ? grade - 10 : 0;
      if (bonus > 0) {
        lines.push({ subject: field.key, grade, coefficient: 0, points: bonus });
        totalPoints += bonus;
      }
      continue;
    }
    const points = grade * field.coefficient;
    lines.push({ subject: field.key, grade, coefficient: field.coefficient, points });
    totalPoints += points;
    totalCoef += field.coefficient;
  }

  return {
    lines,
    totalPoints,
    totalCoef,
    average: totalCoef > 0 ? Math.round((totalPoints / totalCoef) * 100) / 100 : null,
  };
}

/** Payload IA — fusionne les clés aiKey (ex: informatique + algo → algo = max) */
export function buildSubjectsPayload(
  subjects: Record<string, string>,
  bacType: BacTypeValue,
  options?: BacCalcOptions
): Record<string, number> {
  const payload: Record<string, number> = {};

  for (const field of getCalcFields(bacType, options)) {
    if (isOptionBonusField(field)) continue;
    const raw = subjects[field.key]?.trim();
    if (!raw) continue;
    const num = parseFloat(raw);
    if (Number.isNaN(num)) continue;

    const targetKey = field.aiKey || field.key;
    if (payload[targetKey] === undefined || num > payload[targetKey]) {
      payload[targetKey] = num;
    }
  }

  // Clés dupliquées pour formules FG (score_calculator.py)
  if (payload.science !== undefined) payload.sciences = payload.science;
  if (payload.sciences !== undefined && payload.science === undefined) payload.science = payload.sciences;
  if (bacType === 'Sport' && payload.sport !== undefined) payload.ep = payload.sport;
  if (bacType === 'Sport' && payload.sport_pratique !== undefined) {
    payload.sport = payload.sport_pratique;
    payload.ep = payload.sport_pratique;
  }
  if (payload.informatique !== undefined && payload.algo === undefined) payload.algo = payload.informatique;
  if (payload.algo !== undefined && payload.informatique === undefined) payload.informatique = payload.algo;

  return payload;
}

const FG_SUBJECT_ALIASES: Record<string, string[]> = {
  sciences: ['sciences', 'science'],
  science: ['science', 'sciences'],
  ep: ['ep', 'sport'],
  sport: ['sport', 'ep', 'sport_pratique'],
  sport_theorique: ['sport_theorique'],
  sport_pratique: ['sport_pratique', 'sport', 'ep'],
  tech: ['tech'],
  algo: ['algo', 'informatique', 'info'],
  informatique: ['informatique', 'info', 'algo'],
  info: ['info', 'informatique', 'algo'],
};

function getFgSubjectScore(payload: Record<string, number>, subject: string): number {
  const keys = FG_SUBJECT_ALIASES[subject] ?? [subject];
  for (const key of keys) {
    if (payload[key] !== undefined) return payload[key];
  }
  return 0;
}

/**

 * Formules officielles du ministère tunisien — FG = 4×MG + Σ(coef_i × note_i).
 * MG = moyenne générale du bac. Échelle résultante ≈ 100–200.
 * Référence : tableau officiel "الصيغة الاجمالية" par type de baccalauréat.
 */
function computeFgBase(bacScore: number, payload: Record<string, number>, bacType: BacTypeValue): number {
  switch (bacType) {
    case 'Letters':
      // FG = 4MG + 1,5 A + 1,5 PH + 1 HG + 1 F + 1 Ang
      return bacScore * 4
        + 1.5 * getFgSubjectScore(payload, 'arabic')
        + 1.5 * getFgSubjectScore(payload, 'philosophy')
        + 1.0 * getFgSubjectScore(payload, 'history_geo')
        + 1.0 * getFgSubjectScore(payload, 'french')
        + 1.0 * getFgSubjectScore(payload, 'english');
    case 'Math':
      // FG = 4MG + 2 M + 1,5 SP(physique) + 0,5 SVT + 1 F + 1 Ang
      return bacScore * 4
        + 2.0 * getFgSubjectScore(payload, 'math')
        + 1.5 * getFgSubjectScore(payload, 'physics')
        + 0.5 * getFgSubjectScore(payload, 'sciences')
        + 1.0 * getFgSubjectScore(payload, 'french')
        + 1.0 * getFgSubjectScore(payload, 'english');
    case 'Science':
      // FG = 4MG + 1 M + 1,5 SP(physique) + 1,5 SVT + 1 F + 1 Ang
      return bacScore * 4
        + 1.0 * getFgSubjectScore(payload, 'math')
        + 1.5 * getFgSubjectScore(payload, 'physics')
        + 1.5 * getFgSubjectScore(payload, 'sciences')
        + 1.0 * getFgSubjectScore(payload, 'french')
        + 1.0 * getFgSubjectScore(payload, 'english');
    case 'Eco':
      // FG = 4MG + 1,5 Ec + 1,5 Ge + 0,5 M + 0,5 HG + 1 F + 1 Ang
      return bacScore * 4
        + 1.5 * getFgSubjectScore(payload, 'economie')
        + 1.5 * getFgSubjectScore(payload, 'gestion')
        + 0.5 * getFgSubjectScore(payload, 'math')
        + 0.5 * getFgSubjectScore(payload, 'history_geo')
        + 1.0 * getFgSubjectScore(payload, 'french')
        + 1.0 * getFgSubjectScore(payload, 'english');
    case 'Tech':
      // FG = 4MG + 1,5 TE + 1,5 M + 1 SP(physique) + 1 F + 1 Ang
      return bacScore * 4
        + 1.5 * getFgSubjectScore(payload, 'tech')
        + 1.5 * getFgSubjectScore(payload, 'math')
        + 1.0 * getFgSubjectScore(payload, 'physics')
        + 1.0 * getFgSubjectScore(payload, 'french')
        + 1.0 * getFgSubjectScore(payload, 'english');
    case 'Info':
      // FG = 4MG + 1,5 M + 1,5 Algo + 0,5 SP(physique) + 0,5 STI + 1 F + 1 Ang
      return bacScore * 4
        + 1.5 * getFgSubjectScore(payload, 'math')
        + 1.5 * getFgSubjectScore(payload, 'algo')
        + 0.5 * getFgSubjectScore(payload, 'physics')
        + 0.5 * getFgSubjectScore(payload, 'sti')
        + 1.0 * getFgSubjectScore(payload, 'french')
        + 1.0 * getFgSubjectScore(payload, 'english');
    case 'Sport':
      // FG = 4MG + 1,5 SB + 1 Sp-sport + 0,5 EP th + 0,5 SP + 0,5 PH + 1 F + 1 Ang
      return bacScore * 4
        + 1.5 * getFgSubjectScore(payload, 'sciences')
        + 1.0 * getFgSubjectScore(payload, 'sport')
        + 0.5 * getFgSubjectScore(payload, 'sport_theorique')
        + 0.5 * getFgSubjectScore(payload, 'physics')
        + 0.5 * getFgSubjectScore(payload, 'philosophy')
        + 1.0 * getFgSubjectScore(payload, 'french')
        + 1.0 * getFgSubjectScore(payload, 'english');
    default:
      return bacScore * 4;
  }
}

/** Bonus mention sur FG_base — score_calculator.py */
export function computeMentionBonus(bacAverage: number, fgBase: number): { bonus: number; rate: number } {
  if (bacAverage >= 16) return { bonus: Math.round(fgBase * 0.1 * 10000) / 10000, rate: 0.1 };
  if (bacAverage >= 12) return { bonus: Math.round(fgBase * 0.07 * 10000) / 10000, rate: 0.07 };
  return { bonus: 0, rate: 0 };
}

export interface OrientationScoreResult {
  fgBase: number;
  mentionBonus: number;
  mentionRate: number;
  /** FG officiel (avec bonus mention, sans bonification géographique) */
  orientationScore: number;
  geographicBonus: number;
  /** FG avec bonification géographique +7 % (guide orientation.tn) */
  orientationScoreWithGeo: number;
}

export const GEOGRAPHIC_BONUS_RATE = 0.07;

export function applyGeographicBonus(fgScore: number): { geographicBonus: number; orientationScoreWithGeo: number } {
  const geographicBonus = Math.round(fgScore * GEOGRAPHIC_BONUS_RATE * 100) / 100;
  const orientationScoreWithGeo = Math.round((fgScore + geographicBonus) * 100) / 100;
  return { geographicBonus, orientationScoreWithGeo };
}

/** Toutes les matières obligatoires (hors optionnelle) sont renseignées avec notes FG. */
export function isBacCalculatorComplete(
  subjects: Record<string, string>,
  bacType: BacTypeValue,
  options?: BacCalcOptions
): boolean {
  const fields = getCalcFields(bacType, options);
  for (const field of fields) {
    if (isOptionBonusField(field)) continue;
    const raw = subjects[field.key]?.trim();
    if (!raw) return false;
    const num = parseFloat(raw);
    if (Number.isNaN(num) || num < 0 || num > 20) return false;
  }
  return computeBacAverage(subjects, bacType, options) != null
    && computeOrientationScore(subjects, bacType, undefined, options) != null;
}

/**
 * Score FG officiel tunisien (≈100–200) — formule ministère :
 * FG_base = 4×moyenne_bac + Σ(coef_i × note_i) + bonus mention (+7% ou +10%)
 * (Le bonus géographique +7% s'applique par établissement côté backend.)
 */
export function computeOrientationScore(
  subjects: Record<string, string>,
  bacType: BacTypeValue,
  bacAverage?: number | null,
  options?: BacCalcOptions
): OrientationScoreResult | null {
  const average = bacAverage ?? computeBacAverage(subjects, bacType, options);
  if (average == null) return null;

  const payload = buildSubjectsPayload(subjects, bacType, options);
  const fgFields = getCalcFields(bacType, options).filter((f) => f.usedInFg);
  const hasFgInput = fgFields.some((f) => {
    const raw = subjects[f.key]?.trim();
    return raw && !Number.isNaN(parseFloat(raw));
  });
  if (!hasFgInput) return null;

  const fgBase = Math.round(computeFgBase(average, payload, bacType) * 10000) / 10000;
  const { bonus: mentionBonus, rate: mentionRate } = computeMentionBonus(average, fgBase);
  const orientationScore = Math.round((fgBase + mentionBonus) * 100) / 100;
  const { geographicBonus, orientationScoreWithGeo } = applyGeographicBonus(orientationScore);

  return { fgBase, mentionBonus, mentionRate, orientationScore, geographicBonus, orientationScoreWithGeo };
}

/** @deprecated Utiliser computeOrientationScore — conservé pour compatibilité */
export function computeFgSubjectMean(subjects: Record<string, string>, bacType: BacTypeValue): number | null {
  return computeOrientationScore(subjects, bacType)?.orientationScore ?? null;
}