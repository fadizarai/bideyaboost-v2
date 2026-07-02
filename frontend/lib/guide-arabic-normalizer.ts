/** Corrige les artefacts d'extraction PDF du guide officiel (arabe) */

export const TUNISIAN_GOVERNORATES = [
  'سيدي بوزيد', 'بن عروس', 'المنستير', 'المهدية', 'القيروان', 'القصرين', 'أريانة',
  'منوبة', 'نابل', 'زغوان', 'بنزرت', 'جندوبة', 'سليانة', 'صفاقس', 'تطاوين',
  'مدنين', 'قرطاج', 'الكاف', 'تونس', 'سوسة', 'باجة', 'قابس', 'قبلي', 'قفصة', 'توزر',
  'Tunis', 'Sfax', 'Sousse', 'Monastir', 'Gabès', 'Nabeul', 'Bizerte',
] as const;

const INSTITUTION_ANCHOR_RE = /(المعهد|الكلية|كلية|المدرسة|مدرسة|معهد|Institut|Université|Ecole|École|ISET|ISG|ISCAE|ISBM|ISLG|ISIMS|ISSTE|ISAM|IPE|IPEI)/i;
const DIPLOMA_BLEED_RE = /الإجاز|سنوات\s*امd|\d+\s*سنوات|^[\d\s]+|في\s+(العربية|الإيطالية|الكيمياء|التصرف|الإنقليزية)/;

function escReg(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeGovernorateToken(raw: string): string | undefined {
  const t = normalizeArabicPdfText(raw.trim());
  for (const gov of [...TUNISIAN_GOVERNORATES].sort((a, b) => b.length - a.length)) {
    if (t === gov) return gov;
    if (t.startsWith(gov) && t.length <= gov.length + 3) return gov;
  }
  return undefined;
}

/** Extrait la wilaya — priorité : بX، بالX، (جامعة X)، préfixe avant établissement */
export function extractGovernorateFromText(text: string): string | undefined {
  if (!text) return undefined;
  const normalized = normalizeArabicPdfText(text);
  const sorted = [...TUNISIAN_GOVERNORATES].sort((a, b) => b.length - a.length);

  type Hit = { gov: string; rank: number };
  const hits: Hit[] = [];

  for (const gov of sorted) {
    const e = escReg(gov);
    if (new RegExp(`(?:^|[\\s(])ب${e}(?:[\\s)]|$)`).test(normalized)) hits.push({ gov, rank: 1 });
    else if (new RegExp(`(?:^|[\\s(])بال${e}(?:[\\s)]|$)`).test(normalized)) hits.push({ gov, rank: 2 });
    else if (new RegExp(`(?:^|[\\s(])ب\\s+${e}(?:[\\s)]|$)`).test(normalized)) hits.push({ gov, rank: 3 });
    else if (new RegExp(`\\(\\s*جامعة\\s+${e}\\s*\\)`).test(normalized)) hits.push({ gov, rank: 4 });
    else if (new RegExp(`(?:^|[\\s])${e}(?:\\s+\\S+)?\\s+(?:كلية|معهد|الكلية|المعهد|المدرسة|مدرسة)`).test(normalized)) {
      hits.push({ gov, rank: 5 });
    } else if (new RegExp(`(?:^|[\\s])${e}\\s+وال`).test(normalized)) {
      hits.push({ gov, rank: 6 });
    } else if (new RegExp(`(?:^|[\\s])${e}\\s+[\\u0600-\\u06FF]`).test(normalized)) {
      hits.push({ gov, rank: 7 });
    }
  }

  if (hits.length === 0) {
    const uniMatch = normalized.match(/\(\s*جامعة\s+([^)]+?)\s*\)?/);
    if (uniMatch) return normalizeGovernorateToken(uniMatch[1].replace(/\)$/, ''));
    return undefined;
  }

  hits.sort((a, b) => a.rank - b.rank || b.gov.length - a.gov.length);
  return hits[0].gov;
}

function trimLeadingGarbage(name: string): string {
  const anchor = name.search(INSTITUTION_ANCHOR_RE);
  if (anchor <= 0) return name;
  const prefix = name.slice(0, anchor).trim();
  if (!prefix) return name;
  if (DIPLOMA_BLEED_RE.test(prefix)) return name.slice(anchor).trim();
  const prefixGov = extractGovernorateFromText(prefix);
  if (prefixGov && prefix.replace(new RegExp(escReg(prefixGov), 'g'), '').replace(/\s+\S+/g, '').trim().length <= 2) {
    return name.slice(anchor).trim();
  }
  return name;
}

/** Retire la wilaya dupliquée dans le nom (affichée séparément dans le champ city) */
export function cleanupInstitutionName(name: string, city?: string): string {
  const trimmed = trimLeadingGarbage(name);
  let s = trimmed.replace(/\(\s*جامعة\s+[^)]+\s*\)?/g, ' ').trim();

  if (city) {
    const e = escReg(city);
    const withLeadingRemoved = s
      .replace(new RegExp(`^\\s*${e}(?:\\s+\\S+)?\\s+`), '')
      .replace(new RegExp(`(ب${e})\\s+${e}(?=\\s|$)`, 'g'), '$1')
      .replace(new RegExp(`${e}+ة+`, 'g'), city);

    if (INSTITUTION_ANCHOR_RE.test(withLeadingRemoved) && withLeadingRemoved.replace(/\s/g, '') !== city.replace(/\s/g, '')) {
      s = withLeadingRemoved;
    }

    if (new RegExp(`(?:ب|بال)${e}`).test(s)) {
      s = s.replace(new RegExp(`(?<![بل])${e}(?=\\s|$)`, 'g'), '');
      s = s.replace(new RegExp(`\\s+${e}(?=\\s)`, 'g'), ' ');
    }
  }

  s = s.replace(/\s{2,}/g, ' ').replace(/^\s*[)\(]\s*/g, '').trim();
  s = s.replace(/\s+في\s*$/g, '');
  if (city) {
    const e = escReg(city);
    s = s.replace(new RegExp(`\\s*ب${e}\\s*$`), '');
    s = s.replace(new RegExp(`\\s*بال${e}\\s*$`), '');
  }
  if (!INSTITUTION_ANCHOR_RE.test(s)) return trimmed.replace(/\(\s*جامعة\s+[^)]+\s*\)?/g, ' ').replace(/\s+في\s*$/g, '').trim();
  return s;
}

/** Sépare « … في » du nom et rattache le texte à la spécialité */
export function reconcileNameAndSpecialty(
  name: string,
  specialty?: string,
): { name: string; specialty?: string } {
  let n = name.trim();
  let sp = specialty?.trim();

  const danglingFi = n.match(/^(.+?)\s+في\s*$/);
  if (danglingFi) {
    n = danglingFi[1].trim();
    if (sp) {
      if (!/^في\s/.test(sp)) sp = `في ${sp}`;
    }
  }

  if (sp) {
    sp = sp.replace(/^\s*في\s+في\s+/, 'في ');
    if (sp === n || (n.length > 15 && sp.includes(n))) sp = undefined;
  }

  return { name: n, specialty: sp && sp.length > 3 ? sp : undefined };
}

const WORD_FIXES: [RegExp, string][] = [
  [/علوم\s+اإلعالمية/g, 'علوم الإعلامية'],
  [/علوم\s+اإل/g, 'علوم الإ'],
  [/العلوم\s+اإلقتصادية/g, 'العلوم الإقتصادية'],
  [/العلوم\s+اإل/g, 'العلوم الإ'],
  [/اإل/g, 'الإ'],
  [/اال(?=[\u0627-\u064A])/g, 'ال'],
  [/االعمال/g, 'الأعمال'],
  [/األ/g, 'الأ'],
  [/في\s+األ/g, 'في الأ'],
  [/لإل(?=[\u0627-\u064A])/g, 'لل'],
  [/إعالمية/g, 'إعلامية'],
  [/اإلعالمية/g, 'الإعلامية'],
  [/التجار\s+ة/g, 'التجارة'],
  [/للتجار\s+ة/g, 'للتجارة'],
  [/للتجارةة+/g, 'للتجارة'],
  [/التجارة+/g, 'للتجارة'],
  [/الدار\s+ة/g, 'الإدارة'],
  [/الدار\s+/g, 'لإدارة '],
  [/إلدار(?=\s)/g, 'لإدارة'],
  [/إلدارة/g, 'لإدارة'],
  [/العالمية(?=\s+والتصرف)/g, 'للإعلامية'],
  [/اآل/g, 'آ'],
  [/الدر\s+اسات/g, 'الدراسات'],
  [/الدر\s+اس/g, 'الدراس'],
  [/معهد\s+الدر\s+اسات/g, 'معهد الدراسات'],
  [/معهد\s+الدر\s+اس/g, 'معهد الدراس'],
  [/اقتصاد\s+وتصرف/g, 'إقتصاد وتصرف'],
  [/اخر\s+موجه/g, 'آخر موجه'],
  [/نو\s+ع/g, 'نوع'],
  [/مجمو\s+ع/g, 'مجموع'],
  [/وال\s+جامعة/g, 'والجامعة'],
  [/ال\s+جامعة/g, 'الجامعة'],
  [/ال\s+علوم/g, 'العلوم'],
  [/ال\s+معهد/g, 'المعهد'],
  [/ال\s+مدرسة/g, 'المدرسة'],
  [/ال\s+كلية/g, 'الكلية'],
  [/ال\s+خدمات/g, 'الخدمات'],
  [/ال\s+إلكترونية/g, 'الإلكترونية'],
  [/ال\s+إقتصاد/g, 'الإقتصاد'],
  [/ال\s+رياضيات/g, 'رياضيات'],
  [/العالى/g, 'العالي'],
  [/التـصـرف/g, 'التصرف'],
  [/الت\s+صرف/g, 'التصرف'],
  [/ال\s+تصرف/g, 'التصرف'],
  [/ة\s+ب(صفاقس|تونس|سوسة|منوبة|قابس|نابل|بنزرت|أريانة)/g, 'ة ب$1'],
  [/(\S)\s+ة\b/g, '$1ة'],
  [/(\S)\s+ي\b/g, '$1ي'],
  [/ج\s+امعة/g, 'جامعة'],
  [/صف\s+اقس/g, 'صفاقس'],
  [/اإلجاز/g, 'الإجاز'],
  [/اإلجازة/g, 'الإجازة'],
  [/نظم\s+معلومات/g, 'نظم معلومات'],
  [/الخدمات\s+اإللكترونية/g, 'الخدمات الإلكترونية'],
  [/المؤسسة\s+وال/g, ''],
  [/^\s*\/\s*/g, ''],
];

const INSTITUTION_TEMPLATES: [RegExp, string][] = [
  [/المعهد العالي للإدارة\s*ا?l?أعمال/gi, 'المعهد العالي لإدارة الأعمال'],
  [/المدرسة العليا للتجار\s*ة/g, 'المدرسة العليا للتجارة'],
  [/المدرسة العليا للتجار/g, 'المدرسة العليا للتجارة'],
  [/كلية العلوم\s+اإلقتصادية/g, 'كلية العلوم الإقتصادية'],
  [/معهد الدر\s*اسات/g, 'معهد الدراسات'],
  [/^\s*\)\s*/g, ''],
];

export function joinArabicFragments(parts: string[]): string {
  let s = parts.map((p) => p.trim()).filter(Boolean).join(' ');
  s = s.replace(/(\S)\s+ة(\s|$)/g, '$1ة$2');
  s = s.replace(/^\s*\)\s*/g, '');
  return s.replace(/\s{2,}/g, ' ').trim();
}

export function normalizeArabicPdfText(text: string): string {
  if (!text || !/[\u0600-\u06FF]/.test(text)) return text.trim();

  let s = text.trim();
  for (const [re, rep] of WORD_FIXES) s = s.replace(re, rep);
  for (const [re, rep] of INSTITUTION_TEMPLATES) s = s.replace(re, rep);
  return s.replace(/\s{2,}/g, ' ').trim();
}

export function normalizeInstitutionRecord<T extends {
  name: string;
  specialty?: string;
  city?: string;
  admissions?: { bacSection: string; formula?: string; lastScore?: string }[];
}>(inst: T): T {
  let name = normalizeArabicPdfText(inst.name);
  let specialty = inst.specialty ? normalizeArabicPdfText(inst.specialty) : undefined;

  let city = inst.city ? normalizeArabicPdfText(inst.city) : undefined;
  city = extractGovernorateFromText(name) ?? city ?? (specialty ? extractGovernorateFromText(specialty) : undefined);

  name = cleanupInstitutionName(name, city);
  name = normalizeArabicPdfText(name);

  const reconciled = reconcileNameAndSpecialty(name, specialty);
  name = reconciled.name;
  specialty = reconciled.specialty;

  if (specialty) {
    specialty = normalizeArabicPdfText(specialty);
    if (specialty === name || specialty.length < 4) specialty = undefined;
  }

  return {
    ...inst,
    name,
    specialty,
    city,
    admissions: inst.admissions?.map((a) => ({
      ...a,
      bacSection: normalizeArabicPdfText(a.bacSection),
      formula: a.formula ? a.formula.replace(/\s+/g, '') : undefined,
    })),
  };
}
