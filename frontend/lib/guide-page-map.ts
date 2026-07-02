/** Pages visibles dans le lecteur (page de garde + contenu établissements) */

export const GUIDE_GARDE_PAGE = 1;
export const GUIDE_SKIP_FROM = 2;
export const GUIDE_SKIP_TO = 38;
export const GUIDE_CONTENT_START = 39;

export function buildContentPageList(pdfTotalPages: number): number[] {
  if (pdfTotalPages < GUIDE_CONTENT_START) return [];
  const pages: number[] = [];
  for (let p = GUIDE_CONTENT_START; p <= pdfTotalPages; p++) {
    pages.push(p);
  }
  return pages;
}

export function buildReadablePageList(pdfTotalPages: number): number[] {
  if (pdfTotalPages <= 0) return [];
  const pages: number[] = [GUIDE_GARDE_PAGE];
  for (let p = GUIDE_CONTENT_START; p <= pdfTotalPages; p++) {
    pages.push(p);
  }
  return pages;
}

export function isGuidePdfPageIncluded(pdfPage: number): boolean {
  if (pdfPage === GUIDE_GARDE_PAGE) return true;
  if (pdfPage >= GUIDE_SKIP_FROM && pdfPage <= GUIDE_SKIP_TO) return false;
  return pdfPage >= GUIDE_CONTENT_START;
}

export function readableIndexForPdfPage(pdfPage: number, pdfTotalPages: number): number {
  return buildReadablePageList(pdfTotalPages).indexOf(pdfPage);
}

export function spreadIndexForPdfPage(
  pdfPage: number,
  pdfTotalPages: number,
  isWide: boolean,
): number {
  if (!isWide) {
    if (pdfPage === GUIDE_GARDE_PAGE) return 0;
    const content = buildContentPageList(pdfTotalPages);
    const idx = content.indexOf(pdfPage);
    if (idx < 0) return 0;
    return 1 + Math.floor(idx / 2);
  }
  const content = buildContentPageList(pdfTotalPages);
  const idx = content.indexOf(pdfPage);
  if (idx < 0) return 0;
  return Math.max(0, Math.min(idx, Math.max(0, content.length - 2)));
}

export function isMobileGardeSpread(spreadIndex: number, isWide: boolean): boolean {
  return !isWide && spreadIndex === 0;
}

/** Mobile : spread 0 = garde, puis paires de pages contenu comme le desktop */
export function resolveSpreadPdfPages(
  spreadIndex: number,
  pdfTotalPages: number,
  isWide: boolean,
): { left: number; right: number } {
  if (!isWide) {
    if (spreadIndex === 0) {
      return { left: GUIDE_GARDE_PAGE, right: -1 };
    }
    const content = buildContentPageList(pdfTotalPages);
    const pairIdx = spreadIndex - 1;
    return {
      left: content[pairIdx * 2] ?? -1,
      right: content[pairIdx * 2 + 1] ?? -1,
    };
  }
  const content = buildContentPageList(pdfTotalPages);
  return {
    left: content[spreadIndex] ?? -1,
    right: content[spreadIndex + 1] ?? -1,
  };
}

export function maxSpreadIndex(pdfTotalPages: number, isWide: boolean): number {
  if (!isWide) {
    const contentCount = buildContentPageList(pdfTotalPages).length;
    if (contentCount === 0) return 0;
    return Math.ceil(contentCount / 2);
  }
  const count = buildContentPageList(pdfTotalPages).length;
  if (count <= 0) return 0;
  return Math.max(0, count - 2);
}

export function progressFromSpread(
  spreadIndex: number,
  pdfTotalPages: number,
  isWide: boolean,
): number {
  const pages = buildReadablePageList(pdfTotalPages);
  if (pages.length === 0) return 0;
  if (!isWide) {
    if (spreadIndex === 0) {
      return Math.round((1 / pages.length) * 100);
    }
    const { left } = resolveSpreadPdfPages(spreadIndex, pdfTotalPages, false);
    const idxInFull = pages.indexOf(left);
    if (idxInFull < 0) return 0;
    return Math.round(((idxInFull + 1) / pages.length) * 100);
  }
  const { left } = resolveSpreadPdfPages(spreadIndex, pdfTotalPages, true);
  const idxInFull = pages.indexOf(left);
  if (idxInFull < 0) return 0;
  return Math.round(((idxInFull + 1) / pages.length) * 100);
}
