export type ScoreBreakdown = {
  interest?: number;
  academic?: number;
  admission?: number;
  location?: number;
  capacity?: number;
  orientation_score_fg?: number;
  orientation_score_fg_base?: number;
  geographic_bonus_points?: number;
  geographic_bonus_applied?: boolean;
  geographic_bonus_reason?: string;
  weighted_total?: number;
};

export type InstitutionRec = {
  score: number;
  admission_score_last?: number | null;
  admission_score_min?: number | null;
  student_orientation_score?: number | null;
  student_orientation_score_base?: number | null;
  bonus_applied?: boolean | null;
  geographic_bonus_applied?: boolean | null;
  geographic_bonus_points?: number | null;
  geographic_bonus_reason?: string | null;
  specialty_in_home_region?: boolean | null;
  score_breakdown?: ScoreBreakdown | null;
  capacity?: number | null;
  city?: string | null;
  field?: string | null;
};

type Lang = 'tn' | 'fr' | 'en';

const FG_LABELS: Record<Lang, { your: string; last: string; min: string; gap: string; fgBase: string; fgBonus: string }> = {
  fr: {
    your: 'Votre score FG',
    last: 'Score du dernier admis',
    min: 'Score minimum',
    gap: 'Écart vs dernier admis',
    fgBase: 'FG sans bonification',
    fgBonus: 'FG avec bonif. +7%',
  },
  en: {
    your: 'Your FG score',
    last: 'Last admitted student score',
    min: 'Minimum score',
    gap: 'Gap vs last admitted',
    fgBase: 'FG without bonus',
    fgBonus: 'FG with +7% bonus',
  },
  tn: {
    your: 'score FG متاعك',
    last: 'score آخر واحد تقبل',
    min: 'الحد الأدنى',
    gap: 'الفرق على آخر مقبول',
    fgBase: 'FG بدون بونوس',
    fgBonus: 'FG مع بونوس +7%',
  },
};

const COMPARISON: Record<Lang, { above: string; within: string; below: string; unknown: string }> = {
  fr: {
    above: 'Votre score FG dépasse celui du dernier élève admis — profil très compétitif pour cette filière.',
    within: 'Votre score FG se situe entre le minimum et le score du dernier admis — admission probable avec vigilance.',
    below: 'Votre score FG est inférieur au seuil historique — candidature ambitieuse, préparez un plan B.',
    unknown: 'Les seuils officiels ne sont pas disponibles pour cette filière.',
  },
  en: {
    above: 'Your FG score exceeds the last admitted student — highly competitive profile for this program.',
    within: 'Your FG score is between the minimum and last admitted — likely admission with some uncertainty.',
    below: 'Your FG score is below the historical threshold — ambitious choice, consider a backup plan.',
    unknown: 'Official thresholds are not available for this program.',
  },
  tn: {
    above: 'score FG متاعك أعلى من آخر واحد تقبل — بروفيل قوي برشا لهذا الاختصاص.',
    within: 'score FG متاعك بين الحد الأدنى وآخر مقبول — تقبل محتمل مع شوية مخاطرة.',
    below: 'score FG متاعك أقل من العتبة — اختيار طموح، فكّر في بديل.',
    unknown: 'العتبات الرسمية ما فماش لهذا الاختصاص.',
  },
};

const DIMENSIONS: Record<Lang, { key: keyof ScoreBreakdown; label: string; weight: string }[]> = {
  fr: [
    { key: 'interest', label: 'Adéquation avec vos intérêts', weight: '35%' },
    { key: 'academic', label: 'Niveau académique (FG)', weight: '25%' },
    { key: 'admission', label: 'Probabilité d\'admission', weight: '20%' },
    { key: 'location', label: 'Localisation', weight: '10%' },
    { key: 'capacity', label: 'Capacité d\'accueil', weight: '10%' },
  ],
  en: [
    { key: 'interest', label: 'Interest fit', weight: '35%' },
    { key: 'academic', label: 'Academic level (FG)', weight: '25%' },
    { key: 'admission', label: 'Admission probability', weight: '20%' },
    { key: 'location', label: 'Location', weight: '10%' },
    { key: 'capacity', label: 'Institution capacity', weight: '10%' },
  ],
  tn: [
    { key: 'interest', label: 'توافق مع اهتماماتك', weight: '35%' },
    { key: 'academic', label: 'المستوى الأكاديمي (FG)', weight: '25%' },
    { key: 'admission', label: 'فرصة القبول', weight: '20%' },
    { key: 'location', label: 'الموقع', weight: '10%' },
    { key: 'capacity', label: 'عدد البلاصات', weight: '10%' },
  ],
};

export function getFgLabels(lang: Lang) {
  return FG_LABELS[lang];
}

export function getStudentFg(rec: InstitutionRec, traceFg?: number | null): number | null {
  return getStudentFgWithBonus(rec, traceFg);
}

export function getStudentFgBase(rec: InstitutionRec, traceFg?: number | null): number | null {
  // Use the base score from the API directly (no reverse-calculation needed)
  if (typeof rec.student_orientation_score_base === 'number') return rec.student_orientation_score_base;

  const fromBreakdown = rec.score_breakdown?.orientation_score_fg_base;
  if (typeof fromBreakdown === 'number') return fromBreakdown;

  // Fallback: if bonus_applied is false, base = with-bonus
  const withBonus = getStudentFgWithBonus(rec, traceFg);
  if (withBonus == null) return typeof traceFg === 'number' ? traceFg : null;

  if (rec.bonus_applied === false && !rec.geographic_bonus_applied) {
    return withBonus;
  }

  // Legacy fallback: reverse-calculate if only old fields are present
  if (rec.geographic_bonus_applied) {
    const bonus = rec.geographic_bonus_points ?? rec.score_breakdown?.geographic_bonus_points;
    if (typeof bonus === 'number') return Math.round((withBonus - bonus) * 100) / 100;
    return Math.round((withBonus / 1.07) * 100) / 100;
  }

  // bonus_applied is true but no base provided — reverse-calculate
  if (rec.bonus_applied) {
    return Math.round((withBonus / 1.07) * 100) / 100;
  }

  return withBonus;
}

export function getStudentFgWithBonus(rec: InstitutionRec, traceFg?: number | null): number | null {
  // student_orientation_score already includes the bonus
  const fromRec = rec.student_orientation_score;
  if (typeof fromRec === 'number') return fromRec;

  const fromBreakdown = rec.score_breakdown?.orientation_score_fg;
  if (typeof fromBreakdown === 'number') return fromBreakdown;

  const base = typeof traceFg === 'number' ? traceFg : null;
  if (base == null) return null;

  if (rec.geographic_bonus_applied) {
    const bonus = rec.geographic_bonus_points ?? rec.score_breakdown?.geographic_bonus_points;
    if (typeof bonus === 'number') return Math.round((base + bonus) * 100) / 100;
    return Math.round((base * 1.07) * 100) / 100;
  }

  return base;
}

export function getFgComparison(
  studentFg: number | null,
  lastScore: number | null | undefined,
  minScore: number | null | undefined,
  lang: Lang
): { status: 'above' | 'within' | 'below' | 'unknown'; message: string; gap: number | null } {
  if (studentFg === null || lastScore == null) {
    return { status: 'unknown', message: COMPARISON[lang].unknown, gap: null };
  }
  const gap = Math.round((studentFg - lastScore) * 100) / 100;
  if (studentFg >= lastScore) {
    return { status: 'above', message: COMPARISON[lang].above, gap };
  }
  if (minScore != null && studentFg >= minScore) {
    return { status: 'within', message: COMPARISON[lang].within, gap };
  }
  return { status: 'below', message: COMPARISON[lang].below, gap };
}

const COMPARISON_STATUS: Record<Lang, Record<'above' | 'within' | 'below' | 'unknown', string>> = {
  fr: { above: 'Compétitif', within: 'Probable', below: 'Ambitieux', unknown: '—' },
  en: { above: 'Competitive', within: 'Likely', below: 'Reach', unknown: '—' },
  tn: { above: 'قوي', within: 'محتمل', below: 'طموح', unknown: '—' },
};

export function getComparisonStatusLabel(
  status: 'above' | 'within' | 'below' | 'unknown',
  lang: Lang
): string {
  return COMPARISON_STATUS[lang][status];
}

export function formatFgGap(gap: number | null): string {
  if (gap == null) return '—';
  const sign = gap > 0 ? '+' : '';
  return `${sign}${gap.toFixed(2)}`;
}

export function getScoreDimensions(lang: Lang) {
  return DIMENSIONS[lang];
}

export function isTechnicalExplanation(text: string): boolean {
  return /^Interest=/i.test(text.trim());
}

export function getGeographicBonusLabel(reason: string | null | undefined, lang: Lang): string | null {
  if (!reason) return null;
  const labels: Record<string, Record<Lang, string>> = {
    same_zone: {
      fr: 'Bonification géographique +7 % — établissement dans votre zone (guide officiel)',
      en: 'Geographic bonus +7% — institution in your zone (official guide)',
      tn: 'بونوس جغرافي +7% — المؤسسة في ولايتك (الڤايد الرسمي)',
    },
    cross_region_specialty: {
      fr: 'Bonification +7 % — spécialité indisponible dans votre région, appliquée dans la région voisine où elle existe',
      en: 'Bonus +7% — specialty unavailable in your region, applied in the nearest region where it is offered',
      tn: 'بونوس +7% — الاختصاص ما فماش في ولايتك، يتطبّق في الولاية المجاورة الي فيها',
    },
  };
  return labels[reason]?.[lang] ?? null;
}

export function buildMatchInsight(rec: InstitutionRec, lang: Lang, traceFg?: number | null): string {
  const geoLabel = rec.geographic_bonus_applied
    ? getGeographicBonusLabel(rec.geographic_bonus_reason ?? rec.score_breakdown?.geographic_bonus_reason, lang)
    : null;
  if (geoLabel) return geoLabel;

  const studentFg = getStudentFg(rec, traceFg);
  const comparison = getFgComparison(studentFg, rec.admission_score_last, rec.admission_score_min, lang);
  if (comparison.status !== 'unknown') return comparison.message;

  const b = rec.score_breakdown;
  if (!b) {
    const labels = { fr: 'Recommandation basée sur votre profil et les critères du guide officiel.', en: 'Recommendation based on your profile and official orientation criteria.', tn: 'توصية مبنية على بروفيلك ومعايير الڤايد الرسمي.' };
    return labels[lang];
  }

  const parts: string[] = [];
  if ((b.interest ?? 0) >= 0.7) {
    parts.push(lang === 'fr' ? 'Forte correspondance avec vos centres d\'intérêt.' : lang === 'tn' ? 'توافق قوي مع اهتماماتك.' : 'Strong match with your interests.');
  }
  if ((b.location ?? 0) >= 0.8) {
    parts.push(lang === 'fr' ? 'Institution proche de votre gouvernorat.' : lang === 'tn' ? 'مؤسسة قريبة من ولايتك.' : 'Institution close to your region.');
  }
  const fallback = { fr: 'Analyse basée sur le guide officiel de l\'orientation tunisienne.', en: 'Analysis based on the official Tunisian orientation guide.', tn: 'تحليل مبني على الڤايد الرسمي للتوجيه التونسي.' };
  return parts.length ? parts.join(' ') : fallback[lang];
}
