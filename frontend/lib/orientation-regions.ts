import { getFgComparison, getStudentFg, type InstitutionRec } from './recommendation-insights';

export type RegionPreferenceProfile = {
  homeRegion?: string;
  preferredRegions?: string[];
  region?: string;
};

export type RecommendationGroupKey = 'preferred' | 'home' | 'alternative';

export type GroupedRecommendations<T extends InstitutionRec> = {
  key: RecommendationGroupKey;
  recommendations: T[];
};

/** Normalise un nom de gouvernorat pour comparaison (accents, casse) */
export function normalizeRegionName(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function isInRegions(city: string | null | undefined, regions: string[]): boolean {
  if (!city || !regions.length) return false;
  const normalizedCity = normalizeRegionName(city);
  return regions.some((region) => {
    const normalizedRegion = normalizeRegionName(region);
    return (
      normalizedCity === normalizedRegion ||
      normalizedCity.includes(normalizedRegion) ||
      normalizedRegion.includes(normalizedCity)
    );
  });
}

const GROUP_LABELS: Record<RecommendationGroupKey, Record<'fr' | 'en' | 'tn', { title: string; subtitle: string }>> = {
  preferred: {
    fr: {
      title: 'Dans vos régions préférées',
      subtitle: 'Filières dans les gouvernorats que vous avez choisis pour étudier.',
    },
    en: {
      title: 'In your preferred regions',
      subtitle: 'Programs in the governorates you selected for studying.',
    },
    tn: {
      title: 'في المناطق اللي تحب تدرس فيها',
      subtitle: 'شعب في الولايات اللي اخترتهم للدراسة.',
    },
  },
  home: {
    fr: {
      title: 'Dans votre région d\'origine (+7 %)',
      subtitle: 'Établissements proches de votre gouvernorat de bac avec bonification géographique.',
    },
    en: {
      title: 'In your home region (+7%)',
      subtitle: 'Institutions near your baccalaureate governorate with geographic bonus.',
    },
    tn: {
      title: 'في ولاية الباك متاعك (+7%)',
      subtitle: 'مؤسسات قريبة من ولايتك مع bonus جغرافي.',
    },
  },
  alternative: {
    fr: {
      title: 'Autres régions recommandées',
      subtitle: 'Options dans d\'autres gouvernorats — si votre score est insuffisant dans vos régions préférées ou si la spécialité n\'y existe pas (+7 % en région voisine).',
    },
    en: {
      title: 'Other recommended regions',
      subtitle: 'Options in other governorates — if your score is not enough in preferred regions or the specialty is unavailable there (+7% in nearest region).',
    },
    tn: {
      title: 'مناطق أخرى ننصحك بيهم',
      subtitle: 'خيارات في ولايات أخرى — إذا النقاط ما كفتش أو التخصص مش موجود (+7% في الولاية المجاورة).',
    },
  },
};

export function getRegionGroupLabels(lang: 'tn' | 'fr' | 'en') {
  const l = lang === 'tn' ? 'tn' : lang === 'en' ? 'en' : 'fr';
  return {
    preferred: GROUP_LABELS.preferred[l],
    home: GROUP_LABELS.home[l],
    alternative: GROUP_LABELS.alternative[l],
  };
}

function classifyRecommendation<T extends InstitutionRec>(
  rec: T,
  homeRegion: string,
  preferredRegions: string[],
  traceFg?: number | null
): RecommendationGroupKey {
  const city = rec.city;
  const preferred = preferredRegions.length ? preferredRegions : homeRegion ? [homeRegion] : [];

  if (isInRegions(city, preferred)) return 'preferred';

  const studentFg = getStudentFg(rec, traceFg);
  const comparison = getFgComparison(studentFg, rec.admission_score_last, rec.admission_score_min, 'fr');
  const crossRegion = rec.geographic_bonus_reason === 'cross_region_specialty';
  const homeBonus = Boolean(rec.geographic_bonus_applied && homeRegion && isInRegions(city, [homeRegion]));

  if (homeBonus && !crossRegion) return 'home';
  if (comparison.status === 'below' || crossRegion) return 'alternative';
  if (homeRegion && isInRegions(city, [homeRegion])) return 'home';

  return 'alternative';
}

/** Regroupe les recommandations par préférence géographique */
export function groupRecommendationsByRegion<T extends InstitutionRec>(
  recommendations: T[],
  profile: RegionPreferenceProfile,
  traceFg?: number | null
): GroupedRecommendations<T>[] {
  const homeRegion = profile.homeRegion || profile.region || '';
  const preferredRegions = profile.preferredRegions?.length
    ? profile.preferredRegions
    : homeRegion
      ? [homeRegion]
      : [];

  const buckets: Record<RecommendationGroupKey, T[]> = {
    preferred: [],
    home: [],
    alternative: [],
  };

  for (const rec of recommendations) {
    const group = classifyRecommendation(rec, homeRegion, preferredRegions, traceFg);
    buckets[group].push(rec);
  }

  const order: RecommendationGroupKey[] = ['preferred', 'home', 'alternative'];
  return order
    .map((key) => ({ key, recommendations: buckets[key] }))
    .filter((g) => g.recommendations.length > 0);
}
