/** Normalize API/guide fields so institution name is never replaced by domain (field). */
export type RecommendationLike = {
  institution?: string | null;
  university?: string | null;
  specialty?: string | null;
  field?: string | null;
  domain?: string | null;
  degree?: string | null;
  city?: string | null;
};

type Lang = 'tn' | 'fr' | 'en';

const GENERIC_DOMAINS = new Set(
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
  ].map((v) => v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')),
);

const TRANSLATED_UNIVERSITIES: Record<string, Record<Lang, string>> = {
  "Université de Tunis": {
    tn: "جامعة تونس",
    fr: "Université de Tunis",
    en: "University of Tunis",
  },
  "Université de Tunis El Manar": {
    tn: "جامعة تونس المنار",
    fr: "Université de Tunis El Manar",
    en: "University of Tunis El Manar",
  },
  "Université de Carthage": {
    tn: "جامعة قرطاج",
    fr: "Université de Carthage",
    en: "University of Carthage",
  },
  "Université de la Manouba": {
    tn: "جامعة منوبة",
    fr: "Université de la Manouba",
    en: "University of Manouba",
  },
  "Université de Jendouba": {
    tn: "جامعة جندوبة",
    fr: "Université de Jendouba",
    en: "University of Jendouba",
  },
  "Université de Sousse": {
    tn: "جامعة سوسة",
    fr: "Université de Sousse",
    en: "University of Sousse",
  },
  "Université de Monastir": {
    tn: "جامعة المنستير",
    fr: "Université de Monastir",
    en: "University of Monastir",
  },
  "Université de Sfax": {
    tn: "جامعة صفاقس",
    fr: "Université de Sfax",
    en: "University of Sfax",
  },
  "Université de Kairouan": {
    tn: "جامعة القيروان",
    fr: "Université de Kairouan",
    en: "University of Kairouan",
  },
  "Université de Gabès": {
    tn: "جامعة قابس",
    fr: "Université de Gabès",
    en: "University of Gabes",
  },
  "Université de Gafsa": {
    tn: "جامعة قفصة",
    fr: "Université de Gafsa",
    en: "University of Gafsa",
  },
  "Université Virtuelle de Tunis": {
    tn: "جامعة تونس الافتراضية",
    fr: "Université Virtuelle de Tunis",
    en: "Virtual University of Tunis",
  },
  "Direction Générale des Etudes Technologiques": {
    tn: "الإدارة العامة للدراسات التكنولوجية",
    fr: "Direction Générale des Études Technologiques",
    en: "General Directorate of Technological Studies",
  },
};

const TRANSLATED_CITIES: Record<string, Record<Lang, string>> = {
  "Tunis": { tn: "تونس", fr: "Tunis", en: "Tunis" },
  "Ariana": { tn: "أريانة", fr: "Ariana", en: "Ariana" },
  "Ben Arous": { tn: "بن عروس", fr: "Ben Arous", en: "Ben Arous" },
  "Manouba": { tn: "منوبة", fr: "Manouba", en: "Manouba" },
  "Nabeul": { tn: "نابل", fr: "Nabeul", en: "Nabeul" },
  "Zaghouan": { tn: "زغوان", fr: "Zaghouan", en: "Zaghouan" },
  "Bizerte": { tn: "بنزرت", fr: "Bizerte", en: "Bizerte" },
  "Béja": { tn: "باجة", fr: "Béja", en: "Beja" },
  "Jendouba": { tn: "جندوبة", fr: "Jendouba", en: "Jendouba" },
  "Kef": { tn: "الكاف", fr: "Le Kef", en: "Kef" },
  "Le Kef": { tn: "الكاف", fr: "Le Kef", en: "Kef" },
  "Siliana": { tn: "سليانة", fr: "Siliana", en: "Siliana" },
  "Kairouan": { tn: "القيروان", fr: "Kairouan", en: "Kairouan" },
  "Sousse": { tn: "سوسة", fr: "Sousse", en: "Sousse" },
  "Monastir": { tn: "المنستير", fr: "Monastir", en: "Monastir" },
  "Mahdia": { tn: "المهدية", fr: "Mahdia", en: "Mahdia" },
  "Sfax": { tn: "صفاقس", fr: "Sfax", en: "Sfax" },
  "Kasserine": { tn: "القصرين", fr: "Kasserine", en: "Kasserine" },
  "Sidi Bouzid": { tn: "سيدي بوزيد", fr: "Sidi Bouzid", en: "Sidi Bouzid" },
  "Gabès": { tn: "قابس", fr: "Gabès", en: "Gabes" },
  "Médenine": { tn: "مدنين", fr: "Médenine", en: "Medenine" },
  "Tataouine": { tn: "تطاوين", fr: "Tataouine", en: "Tataouine" },
  "Gafsa": { tn: "قفصة", fr: "Gafsa", en: "Gafsa" },
  "Tozeur": { tn: "توزر", fr: "Tozeur", en: "Tozeur" },
  "Kebili": { tn: "قبلي", fr: "Kébili", en: "Kebili" },
};

const TRANSLATED_DEGREES: Record<string, Record<Lang, string>> = {
  "Licence Fondamentale": {
    tn: "إجازة أساسية",
    fr: "Licence Fondamentale",
    en: "Fundamental Licence",
  },
  "Licence Appliquée": {
    tn: "إجازة تطبيقية",
    fr: "Licence Appliquée",
    en: "Applied Licence",
  },
  "Licence": {
    tn: "إجازة",
    fr: "Licence",
    en: "Licence",
  },
  "Cycle Préparatoire": {
    tn: "مرحلة تحضيرية",
    fr: "Cycle Préparatoire",
    en: "Preparatory Cycle",
  },
  "Diplôme national d'Ingénieur": {
    tn: "شهادة وطنية للمهندس",
    fr: "Diplôme d'Ingénieur",
    en: "Engineering Degree",
  },
  "Diplôme d'Ingénieur": {
    tn: "شهادة وطنية للمهندس",
    fr: "Diplôme d'Ingénieur",
    en: "Engineering Degree",
  },
  "Doctorat": {
    tn: "دكتوراه",
    fr: "Doctorat",
    en: "Doctorate",
  },
};

const SPECIALTY_TRANSLATIONS: Record<string, Record<Lang, string>> = {
  "IoT et systèmes embarqués": {
    tn: "إنترنت الأشياء والأنظمة المدمجة",
    fr: "IoT et systèmes embarqués",
    en: "IoT and Embedded Systems",
  },
  "Mathématiques appliquées": {
    tn: "الرياضيات التطبيقية",
    fr: "Mathématiques appliquées",
    en: "Applied Mathematics",
  },
  "Mathématiques-Physique (MP)": {
    tn: "رياضيات وفيزياء (MP)",
    fr: "Mathématiques-Physique (MP)",
    en: "Mathematics-Physics (MP)",
  },
  "Réseaux et services informatiques": {
    tn: "شبكات وخدمات إعلامية",
    fr: "Réseaux et services informatiques",
    en: "Computer Networks and Services",
  },
  "Formation Générale": {
    tn: "تكوين عام",
    fr: "Formation Générale",
    en: "General Training",
  },
  "Général": {
    tn: "عام",
    fr: "Général",
    en: "General",
  },
  "Informatique": {
    tn: "إعلامية",
    fr: "Informatique",
    en: "Computer Science",
  },

  // Arabic to French / English
  "هندسة الشبكات والنظم": {
    tn: "هندسة الشبكات والنظم",
    fr: "Ingénierie des réseaux et systèmes",
    en: "Network and Systems Engineering",
  },
  "هندسة البرمجيات ونظم": {
    tn: "هندسة البرمجيات والنظم",
    fr: "Ingénierie logicielle et systèmes",
    en: "Software and Systems Engineering",
  },
  "قابس ( - هندسة البرمجيات ونظم": {
    tn: "هندسة البرمجيات والنظم",
    fr: "Ingénierie logicielle et systèmes",
    en: "Software and Systems Engineering",
  },
  "هندسة البرمجيات ونظم المعلومات": {
    tn: "هندسة البرمجيات ونظم المعلومات",
    fr: "Génie logiciel et systèmes d'information",
    en: "Software Engineering & Information Systems",
  },
};

const INSTITUTION_PATTERNS: { regex: RegExp; tn: string; fr: string; en: string }[] = [
  {
    regex: /Institut Supérieur des Sciences Appliquées et de Technologie (?:de |d')?/i,
    tn: "المعهد العالي للعلوم التطبيقية والتكنولوجيا بـ",
    fr: "ISSAT de ",
    en: "Higher Institute of Applied Sciences and Technology of ",
  },
  {
    regex: /Institut Supérieur des Etudes Technologiques (?:de |d')?/i,
    tn: "المعهد العالي للدراسات التكنولوجية بـ",
    fr: "ISET de ",
    en: "Higher Institute of Technological Studies of ",
  },
  {
    regex: /Institut Supérieur d'Informatique et des Technologies de Communication (?:de |d')?/i,
    tn: "المعهد العالي للإعلامية وتقنيات الاتصال بـ",
    fr: "ISITC de ",
    en: "Higher Institute of Computer Science and Communication Technologies of ",
  },
  {
    regex: /Institut Supérieur d'Informatique (?:de |d')?/i,
    tn: "المعهد العالي للإعلامية بـ",
    fr: "ISI de ",
    en: "Higher Institute of Computer Science of ",
  },
  {
    regex: /Institut Supérieur des Langues Appliquées et d'Informatique (?:de |d')?/i,
    tn: "المعهد العالي للغات التطبيقية والإعلامية بـ",
    fr: "ISLAI de ",
    en: "Higher Institute of Applied Languages and Computer Science of ",
  },
  {
    regex: /Institut Supérieur des Arts et Métiers (?:de |d')?/i,
    tn: "المعهد العالي للفنون والحرف بـ",
    fr: "ISAM de ",
    en: "Higher Institute of Arts and Crafts of ",
  },
  {
    regex: /Institut Supérieur de Biotechnologie (?:de |d')?/i,
    tn: "المعهد العالي للبيوتكنولوجيا بـ",
    fr: "ISB de ",
    en: "Higher Institute of Biotechnology of ",
  },
  {
    regex: /Institut Supérieur de/i,
    tn: "المعهد العالي لـ",
    fr: "Institut Supérieur de ",
    en: "Higher Institute of ",
  },
  {
    regex: /Institut Supérieur des/i,
    tn: "المعهد العالي لـ",
    fr: "Institut Supérieur des ",
    en: "Higher Institute of ",
  },
  {
    regex: /Faculté des Sciences Humaines et Sociales (?:de |d')?/i,
    tn: "كلية العلوم الإنسانية والاجتماعية بـ",
    fr: "Faculté des Sciences Humaines et Sociales de ",
    en: "Faculty of Humanities and Social Sciences of ",
  },
  {
    regex: /Faculté des Sciences Economiques et de Gestion (?:de |d')?/i,
    tn: "كلية العلوم الاقتصادية والتصرف بـ",
    fr: "Faculté des Sciences Économiques et de Gestion de ",
    en: "Faculty of Economics and Management of ",
  },
  {
    regex: /Faculté des Sciences (?:de |d')?/i,
    tn: "كلية العلوم بـ",
    fr: "Faculté des Sciences de ",
    en: "Faculty of Sciences of ",
  },
  {
    regex: /Faculté de Droit (?:de |d')?/i,
    tn: "كلية الحقوق بـ",
    fr: "Faculté de Droit de ",
    en: "Faculty of Law of ",
  },
  {
    regex: /Faculté de Médecine (?:de |d')?/i,
    tn: "كلية الطب بـ",
    fr: "Faculté de Médecine de ",
    en: "Faculty of Medicine of ",
  },
  {
    regex: /Ecole Nationale d'Ingénieurs (?:de |d')?/i,
    tn: "المدرسة الوطنية للمهندسين بـ",
    fr: "ENI de ",
    en: "National Engineering School of ",
  },
  {
    regex: /Institut Préparatoire aux Etudes d'Ingénieurs (?:de |d')?/i,
    tn: "المعهد التحضيري للدراسات الهندسية بـ",
    fr: "IPEI de ",
    en: "Preparatory Engineering Institute of ",
  },
];

function clean(value?: string | null): string | null {
  const v = value?.trim();
  return v && v.length > 0 ? v : null;
}

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// Check if a field value is generic
function isGenericDomain(value: string | null): boolean {
  if (!value) return true;
  return GENERIC_DOMAINS.has(normalize(value));
}

/** Strip field mistaken as specialty (backend used field as specialty before). */
export function normalizeRecommendation<T extends RecommendationLike>(rec: T): T {
  const institution = clean(rec.institution);
  const field = clean(rec.field) ?? clean(rec.domain);
  let specialty = clean(rec.specialty);

  if (specialty && field && specialty.toLowerCase() === field.toLowerCase()) {
    specialty = null;
  }
  if (specialty && institution && specialty.toLowerCase() === institution.toLowerCase()) {
    specialty = null;
  }
  if (specialty && isGenericDomain(specialty)) {
    specialty = null;
  }

  return {
    ...rec,
    institution: institution ?? undefined,
    field: field ?? undefined,
    specialty: specialty ?? undefined,
  };
}

function translateInstitution(name: string, city: string | null, lang: Lang): string {
  if (lang === 'fr') return name;
  
  // Find matching pattern
  for (const pattern of INSTITUTION_PATTERNS) {
    if (pattern.regex.test(name)) {
      const cityLabel = city ? (TRANSLATED_CITIES[city]?.[lang] ?? city) : '';
      return `${pattern[lang]}${cityLabel}`;
    }
  }
  return name;
}

export function getRecommendationDisplay(rec: RecommendationLike, lang: Lang = 'fr') {
  const normalized = normalizeRecommendation(rec);
  
  // Base raw properties
  const rawInst = normalized.institution ?? '—';
  const rawUniv = clean(normalized.university);
  const rawField = clean(normalized.field);
  const rawSpecialty = clean(normalized.specialty);
  const rawDegree = clean(normalized.degree);
  const rawCity = clean(normalized.city);

  // Localization
  const city = rawCity ? (TRANSLATED_CITIES[rawCity]?.[lang] ?? rawCity) : undefined;
  const university = rawUniv ? (TRANSLATED_UNIVERSITIES[rawUniv]?.[lang] ?? rawUniv) : undefined;
  const degree = rawDegree ? (TRANSLATED_DEGREES[rawDegree]?.[lang] ?? rawDegree) : undefined;
  const specialty = rawSpecialty ? (SPECIALTY_TRANSLATIONS[rawSpecialty]?.[lang] ?? rawSpecialty) : undefined;
  const field = rawField ? (SPECIALTY_TRANSLATIONS[rawField]?.[lang] ?? rawField) : undefined;
  const institution = translateInstitution(rawInst, rawCity, lang);

  const showFieldAsTag = field && !isGenericDomain(rawField) && rawField !== rawSpecialty;

  return {
    institution,
    university,
    specialty,
    field: showFieldAsTag ? field : undefined,
    degree,
    city,
    /** Primary heading: always the establishment */
    title: institution,
    /** Secondary line: real spécialité only — never a generic filière */
    subtitle: specialty ?? degree ?? undefined,
    /** Tertiary: university when specialty or degree is on subtitle */
    meta: specialty || degree ? university ?? undefined : university ?? undefined,
  };
}
