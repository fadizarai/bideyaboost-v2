import type { ParsedGuidePage } from './guide-institution-parser';
import { GUIDE_GARDE_PAGE } from './guide-page-map';

export type GuideSectionEntry = {
  page: number;
  title: string;
  subtitle?: string;
};

export type GuidePageNavOption = {
  page: number;
  label: string;
};

type GuideLang = 'tn' | 'fr' | 'en';

const PAGE_WORD: Record<GuideLang, string> = {
  tn: 'صفحة',
  fr: 'Page',
  en: 'Page',
};

const GARDE_HINT: Record<GuideLang, string> = {
  tn: 'صفحة الغلاف',
  fr: 'garde',
  en: 'cover',
};

/** Libellé affiché dans le menu de navigation (spécialité plutôt que numéro seul) */
export function getGuidePageNavLabel(
  pageNum: number,
  sections: GuideSectionEntry[],
  lang: GuideLang,
): string {
  if (pageNum === GUIDE_GARDE_PAGE) {
    return `${PAGE_WORD[lang]} ${pageNum} (${GARDE_HINT[lang]})`;
  }

  const sectionStart = sections.find((s) => s.page === pageNum);
  if (sectionStart) return sectionStart.title;

  const active = resolveDomainSectionForPage(sections, pageNum);
  if (active) return active.title;

  return `${PAGE_WORD[lang]} ${pageNum}`;
}

/** Une entrée par page lisible — spécialité en tête, numéro en suffixe si doublon */
export function buildGuidePageNavOptions(
  pages: number[],
  sections: GuideSectionEntry[],
  lang: GuideLang,
): GuidePageNavOption[] {
  const items = pages.map((page) => ({
    page,
    label: getGuidePageNavLabel(page, sections, lang),
  }));

  const counts = new Map<string, number>();
  for (const { label } of items) {
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return items.map((item) => {
    if ((counts.get(item.label) ?? 0) <= 1) return item;
    const isSectionCover = sections.some((s) => s.page === item.page && s.title === item.label);
    if (isSectionCover) return item;
    const suffix = lang === 'tn' ? `ص ${item.page}` : `p. ${item.page}`;
    return { page: item.page, label: `${item.label} · ${suffix}` };
  });
}

/** Dernière section domaine active pour une page PDF */
export function resolveDomainSectionForPage(
  sections: GuideSectionEntry[],
  pageNum: number,
): GuideSectionEntry | undefined {
  if (sections.length === 0) return undefined;
  let current: GuideSectionEntry | undefined;
  for (const s of sections) {
    if (s.page <= pageNum) current = s;
    else break;
  }
  return current;
}

export function sectionEntriesFromParsedPages(
  pages: { pageNum: number; parsed: ParsedGuidePage }[],
): GuideSectionEntry[] {
  return pages
    .filter(({ parsed }) => parsed.pageType === 'section' && parsed.sectionTitle)
    .map(({ pageNum, parsed }) => ({
      page: pageNum,
      title: parsed.sectionTitle!,
      subtitle: parsed.sectionSubtitle,
    }))
    .sort((a, b) => a.page - b.page);
}
