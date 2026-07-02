import { isGuidePdfPageIncluded, GUIDE_CONTENT_START } from './guide-page-map';
import { parseGuidePage, type InstitutionRecord } from './guide-institution-parser';
import { normalizeArabicPdfText } from './guide-arabic-normalizer';
import {
  type GuideSectionEntry,
  resolveDomainSectionForPage,
  sectionEntriesFromParsedPages,
} from './guide-section-index';


const imageCache = new Map<string, string>();
const htmlCache = new Map<string, NativePageContent>();
const pendingRenders = new Map<string, Promise<string>>();
const pendingHtml = new Map<string, Promise<NativePageContent>>();

export type NativePageContent = {
  pageType: 'institutions' | 'article' | 'graphic' | 'section';
  blocks: ContentBlock[];
  institutions: InstitutionRecord[];
  pageTitle?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  domainSection?: string;
  domainSectionSubtitle?: string;
  isArabic: boolean;
  isGraphicHeavy: boolean;
  illustration?: string;
};

export type ContentBlock = {
  type: 'title' | 'heading' | 'paragraph' | 'list-item';
  text: string;
};

function cacheKey(pageNum: number, scale: number) {
  return `${pageNum}@${scale}`;
}

export async function loadPdfDocument(url: string) {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/guides/pdf.worker.min.mjs';
  return pdfjsLib.getDocument(url).promise;
}

function detectArabic(text: string) {
  const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const lat = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  return ar > lat;
}

function classifyBlock(fontSize: number, text: string): ContentBlock['type'] {
  if (fontSize >= 18) return 'title';
  if (fontSize >= 13) return 'heading';
  if (/^[\d•\-–—]/.test(text.trim())) return 'list-item';
  return 'paragraph';
}

type RawLine = { text: string; x: number; y: number; fontSize: number };

const sectionIndexByDoc = new WeakMap<
  Awaited<ReturnType<typeof loadPdfDocument>>,
  GuideSectionEntry[]
>();
let sectionIndexPromise: Promise<GuideSectionEntry[]> | null = null;

/** Chaque cellule PDF séparée — nécessaire pour le parseur tableau */
export async function extractRawCells(
  doc: Awaited<ReturnType<typeof loadPdfDocument>>,
  pageNum: number
): Promise<{ cells: RawLine[]; lines: RawLine[]; pageWidth: number }> {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();

  const cells: RawLine[] = [];
  const lineMap = new Map<number, { str: string; x: number; fontSize: number }[]>();

  for (const raw of content.items) {
    if (!('str' in raw)) continue;
    const str = raw.str.replace(/\s+/g, ' ').trim();
    if (!str) continue;
    const y = Math.round(raw.transform[5]);
    const x = raw.transform[4];
    const fontSize = Math.hypot(raw.transform[0], raw.transform[1]);

    cells.push({ text: str, x, y, fontSize });

    const bucket = Math.round(y / 3) * 3;
    if (!lineMap.has(bucket)) lineMap.set(bucket, []);
    lineMap.get(bucket)!.push({ str, x, fontSize });
  }

  const lines: RawLine[] = [];
  for (const bucket of [...lineMap.keys()].sort((a, b) => b - a)) {
    const items = lineMap.get(bucket)!;
    const isArabicLine = detectArabic(items.map((i) => i.str).join(''));
    items.sort((a, b) => (isArabicLine ? b.x - a.x : a.x - b.x));
    const text = items.map((i) => i.str).join(' ').trim();
    if (text.length < 1) continue;
    const avgX = items.reduce((s, i) => s + i.x, 0) / items.length;
    const avgSize = items.reduce((s, i) => s + i.fontSize, 0) / items.length;
    lines.push({ text, x: avgX, y: bucket, fontSize: avgSize });
  }

  return { cells, lines, pageWidth: viewport.width };
}

export async function buildGuideSectionIndex(
  doc: Awaited<ReturnType<typeof loadPdfDocument>>,
): Promise<GuideSectionEntry[]> {
  const cached = sectionIndexByDoc.get(doc);
  if (cached) return cached;

  if (!sectionIndexPromise) {
    sectionIndexPromise = (async () => {
      const scanned: { pageNum: number; parsed: ReturnType<typeof parseGuidePage> }[] = [];
      for (let p = GUIDE_CONTENT_START; p <= doc.numPages; p++) {
        if (!isGuidePdfPageIncluded(p)) continue;
        const { cells, lines, pageWidth } = await extractRawCells(doc, p);
        scanned.push({ pageNum: p, parsed: parseGuidePage(cells, lines, pageWidth) });
      }
      const entries = sectionEntriesFromParsedPages(scanned);
      sectionIndexByDoc.set(doc, entries);
      sectionIndexPromise = null;
      return entries;
    })();
  }

  return sectionIndexPromise;
}

export async function extractNativePageContent(
  doc: Awaited<ReturnType<typeof loadPdfDocument>>,
  pageNum: number
): Promise<NativePageContent> {
  const key = `html-v10-${pageNum}`;
  const cached = htmlCache.get(key);
  if (cached) return cached;

  const pending = pendingHtml.get(key);
  if (pending) return pending;

  const promise = (async () => {
    const { cells, lines, pageWidth } = await extractRawCells(doc, pageNum);
    const parsed = parseGuidePage(cells, lines, pageWidth);
    const sections = await buildGuideSectionIndex(doc);
    const activeSection = resolveDomainSectionForPage(sections, pageNum);

    const fullText = lines.map((l) => l.text).join(' ');
    const isArabic = detectArabic(fullText);
    const isGraphicHeavy = lines.length < 4 && fullText.length < 100 && parsed.pageType !== 'section';

    let illustration: string | undefined;
    if (isGraphicHeavy) {
      illustration = await renderPageIllustration(doc, pageNum, 1.5);
    }

    let blocks: ContentBlock[] = [];
    if (parsed.pageType === 'article') {
      blocks = parsed.paragraphs.map((text, i) => ({
        type: classifyBlock(i === 0 ? 16 : 11, text),
        text: normalizeArabicPdfText(text),
      }));
    }

    let pageType: NativePageContent['pageType'] = 'article';
    if (parsed.pageType === 'section') pageType = 'section';
    else if (parsed.institutions.length > 0) pageType = 'institutions';
    else if (isGraphicHeavy) pageType = 'graphic';

    const result: NativePageContent = {
      pageType,
      institutions: parsed.institutions,
      pageTitle: parsed.pageTitle ? normalizeArabicPdfText(parsed.pageTitle) : undefined,
      sectionTitle: parsed.sectionTitle ? normalizeArabicPdfText(parsed.sectionTitle) : undefined,
      sectionSubtitle: parsed.sectionSubtitle ? normalizeArabicPdfText(parsed.sectionSubtitle) : undefined,
      domainSection: activeSection?.title,
      domainSectionSubtitle: activeSection?.subtitle,
      blocks,
      isArabic,
      isGraphicHeavy,
      illustration,
    };

    htmlCache.set(key, result);
    pendingHtml.delete(key);
    return result;
  })();

  pendingHtml.set(key, promise);
  return promise;
}

async function renderPageIllustration(
  doc: Awaited<ReturnType<typeof loadPdfDocument>>,
  pageNum: number,
  scale: number
): Promise<string> {
  const key = `illus-${cacheKey(pageNum, scale)}`;
  const cached = imageCache.get(key);
  if (cached) return cached;

  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#faf8f4';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  imageCache.set(key, dataUrl);
  return dataUrl;
}

export async function renderPageToImage(
  doc: Awaited<ReturnType<typeof loadPdfDocument>>,
  pageNum: number,
  scale = 2
): Promise<string> {
  const key = cacheKey(pageNum, scale);
  const cached = imageCache.get(key);
  if (cached) return cached;

  const pending = pendingRenders.get(key);
  if (pending) return pending;

  const promise = (async () => {
    const dataUrl = await renderPageIllustration(doc, pageNum, scale);
    pendingRenders.delete(key);
    return dataUrl;
  })();

  pendingRenders.set(key, promise);
  return promise;
}

export function prefetchPages(
  doc: Awaited<ReturnType<typeof loadPdfDocument>>,
  centerPage: number,
  totalPages: number,
  _scale = 2,
  radius = 2
) {
  for (let i = centerPage - radius; i <= centerPage + radius; i++) {
    if (i >= 1 && i <= totalPages && isGuidePdfPageIncluded(i)) {
      extractNativePageContent(doc, i).catch(() => null);
    }
  }
}

export function clearPdfImageCache() {
  imageCache.clear();
  htmlCache.clear();
  pendingRenders.clear();
  pendingHtml.clear();
  sectionIndexPromise = null;
}
