/** Parseur — pages établissements du guide officiel (format tableau) */

import { normalizeArabicPdfText, normalizeInstitutionRecord, joinArabicFragments, extractGovernorateFromText } from './guide-arabic-normalizer';

export type AdmissionRow = {
  bacSection: string;
  formula?: string;
  /** Score officiel tel qu'affiché dans le guide, ex. "129,577" */
  lastScore?: string;
};

export type InstitutionRecord = {
  name: string;
  specialty?: string;
  city?: string;
  orientationCode?: string;
  capacity?: number;
  admissions: AdmissionRow[];
};

export type ParsedGuidePage = {
  pageType: 'institutions' | 'article' | 'section';
  pageTitle?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  institutions: InstitutionRecord[];
  paragraphs: string[];
};

const INSTITUTION_RE = /(المعهد|الجامعة|كلية|مدرسة|معهد|المركز|مؤسسة|Institut|Université|Ecole|École|ISET|ISG|ISCAE|ISBM|ISLG|ISIMS|ISSTE|ISAM|IPE|IPEI)/i;

const BAC_SECTIONS: { pattern: RegExp; label: string }[] = [
  { pattern: /رياضيات|Math/i, label: 'رياضيات' },
  { pattern: /علوم تجريبية|Sciences exp/i, label: 'علوم تجريبية' },
  { pattern: /علوم إعلامية|علوم اإلعالمية|Informatique|إعلامية/i, label: 'علوم إعلامية' },
  { pattern: /إقتصاد وتصرف|اقتصاد وتصرف|Eco/i, label: 'إقتصاد وتصرف' },
  { pattern: /العلوم التقنية|علوم تقنية|Technique/i, label: 'العلوم التقنية' },
  { pattern: /آداب|Lettres/i, label: 'آداب' },
  { pattern: /رياضة|Sport/i, label: 'رياضة' },
];

const CITIES = [
  'تونس', 'أريانة', 'بن عروس', 'منوبة', 'نابل', 'زغوان', 'بنزرت', 'باجة', 'جندوبة',
  'الكاف', 'سليانة', 'سوسة', 'المنستير', 'المهدية', 'صفاقس', 'قابس', 'مدنين',
  'قبلي', 'توزر', 'قفصة', 'سيدي بوزيد', 'القيروان', 'القصرين', 'قرطاج', 'تطاوين',
  'Tunis', 'Sfax', 'Sousse', 'Monastir', 'Gabès', 'Nabeul', 'Bizerte',
];

/** Colonnes du tableau officiel (positions x PDF) */
const COL_BAC: [number, number] = [95, 158];
const COL_SPECIALTY: [number, number] = [159, 318];
const COL_INSTITUTION: [number, number] = [319, 999];

const FORMULA_RE = /FG\s*\+?\s*\([^)]+\)\s*\/\s*\d+/i;
const HEADER_RE = /الشعبة|المؤسسة|البكالوريا|صيغة احتساب|مجموع النقاط|اخر موجه|العلوم الصحيحة/i;
const SCORE_IN_TEXT_RE = /\b(\d{1,3}),(\d{3})\b/;

type RawLine = { text: string; x: number; y: number; fontSize: number };

type PdfCell = { x: number; str: string };
type TableRow = { y: number; cells: PdfCell[] };

type HeaderInfo = {
  id: number;
  y: number;
  x: number;
  column: 'left' | 'right';
  text: string;
  code?: string;
  bacOnHeader?: string;
  name: string;
  specialty?: string;
  city?: string;
};

function detectBacSection(text: string): string | null {
  for (const { pattern, label } of BAC_SECTIONS) {
    if (pattern.test(text)) return label;
  }
  return null;
}

function cellInCol(x: number, [min, max]: [number, number]): boolean {
  return x >= min && x <= max;
}

function extractCity(text: string): string | undefined {
  return extractGovernorateFromText(text);
}

/** Extrait le score complet du guide, ex. "129,577" */
function extractScoreRaw(text: string): string | undefined {
  const m = text.match(SCORE_IN_TEXT_RE);
  return m ? `${m[1]},${m[2]}` : undefined;
}

function extractCode(text: string): string | undefined {
  const m = text.match(/\b(\d{5})\b/);
  return m?.[1];
}

function isInstitutionLine(text: string): boolean {
  return INSTITUTION_RE.test(text) && text.length > 12;
}

function isValidInstitutionName(name: string): boolean {
  return name.length >= 10 && INSTITUTION_RE.test(name);
}

function cleanLine(text: string): string {
  return normalizeArabicPdfText(text.replace(/\s+/g, ' ').trim());
}

function isHeaderRow(text: string): boolean {
  return HEADER_RE.test(text) || /^2024$/.test(text.trim());
}

function normalizeFormula(text: string): string | undefined {
  const m = text.match(FORMULA_RE);
  return m ? m[0].replace(/\s+/g, '') : undefined;
}

function stripMeta(text: string): string {
  return cleanLine(
    text
      .replace(/\b\d{5}\b/g, '')
      .replace(FORMULA_RE, '')
      .replace(/[(\-–]/g, ' ')
  );
}

function isDiplomaFragment(text: string): boolean {
  return /الإجاز|سنوات|\d+\s*سنوات|^[\d\s]+$/.test(text);
}

function buildInstitutionName(cells: PdfCell[]): string {
  const instParts = cells
    .filter((c) => cellInCol(c.x, COL_INSTITUTION) || (c.x >= COL_SPECIALTY[1] && isInstitutionLine(c.str)))
    .sort((a, b) => b.x - a.x)
    .map((c) => c.str)
    .filter((s) => !/^\(?\s*جامعة\s*$/.test(s) && s !== ')' && s !== '(' && s !== 'في' && !/^في\s*$/.test(s) && !isDiplomaFragment(s) && !detectBacSection(s));

  let name = joinArabicFragments(instParts);
  name = stripMeta(name);
  name = name.replace(/\(?\s*جامعة[^)]*\)?/g, '').trim();

  return normalizeArabicPdfText(name);
}

function buildSpecialty(cells: PdfCell[], fullContext?: string): string | undefined {
  const parts = cells
    .filter((c) => cellInCol(c.x, COL_SPECIALTY))
    .sort((a, b) => b.x - a.x)
    .map((c) => c.str)
    .filter((s) => s.length > 1 && !detectBacSection(s) && !isInstitutionLine(s) && !/^\(?\s*جامعة/.test(s));

  let specialty = normalizeArabicPdfText(joinArabicFragments(parts));
  if (specialty.length <= 2 && fullContext) {
    const m = fullContext.match(/في\s+([^\dFG]+?)(?:\s+\d{5}|\s+FG|$)/);
    if (m) specialty = normalizeArabicPdfText(`في ${m[1].trim()}`);
  }
  return specialty.length > 2 ? specialty : undefined;
}

function headerColumn(x: number): 'left' | 'right' {
  return x < 280 ? 'left' : 'right';
}

/** Regroupe les lignes PDF en colonnes (pages 2 colonnes du guide) */
export function groupLinesByColumn(lines: RawLine[], pageWidth: number): RawLine[][] {
  const mid = pageWidth * 0.48;
  const right: RawLine[] = [];
  const left: RawLine[] = [];
  for (const line of lines) {
    if (line.x >= mid) right.push(line);
    else left.push(line);
  }
  const sortCol = (col: RawLine[]) => col.sort((a, b) => b.y - a.y || b.x - a.x);
  const cols: RawLine[][] = [];
  if (right.length > 2) cols.push(sortCol(right));
  if (left.length > 2) cols.push(sortCol(left));
  if (cols.length === 0) cols.push(sortCol(lines));
  return cols;
}

function buildTableRows(cells: RawLine[]): TableRow[] {
  const rowMap = new Map<number, PdfCell[]>();
  for (const cell of cells) {
    const bucket = Math.round(cell.y / 2) * 2;
    if (!rowMap.has(bucket)) rowMap.set(bucket, []);
    rowMap.get(bucket)!.push({ x: Math.round(cell.x), str: cleanLine(cell.text) });
  }
  return [...rowMap.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([y, rowCells]) => ({ y, cells: rowCells.sort((a, b) => a.x - b.x) }));
}

function rowText(row: TableRow): string {
  return row.cells.map((c) => c.str).join(' ');
}

const HEADER_ROW_MERGE_Y = 28;

function contextRowsForHeader(row: TableRow, rows: TableRow[]): TableRow[] {
  const ids = new Set<number>();
  const result: TableRow[] = [];
  for (const r of rows) {
    if (Math.abs(r.y - row.y) <= HEADER_ROW_MERGE_Y) {
      ids.add(r.y);
      result.push(r);
    }
  }
  // Lignes voisines avec suite du nom (جامعة صفاقس)
  for (const r of rows) {
    if (ids.has(r.y)) continue;
    if (row.y - r.y > 0 && row.y - r.y <= HEADER_ROW_MERGE_Y + 6) {
      if (r.cells.some((c) => /جامعة|صفاقس|تونس|\)/.test(c.str))) {
        result.push(r);
      }
    }
  }
  return result;
}

function mergeInstitutionCells(rows: TableRow[]): PdfCell[] {
  const seen = new Set<string>();
  const cells: PdfCell[] = [];
  for (const row of rows) {
    for (const c of row.cells) {
      if (cellInCol(c.x, COL_BAC)) continue;
      if (cellInCol(c.x, COL_SPECIALTY) && !isInstitutionLine(c.str)) continue;
      if (c.x < COL_SPECIALTY[1] && !/جامعة/.test(c.str)) continue;
      const key = `${c.x}:${c.str}`;
      if (seen.has(key)) continue;
      seen.add(key);
      cells.push(c);
    }
  }
  return cells.sort((a, b) => b.x - a.x);
}

function findHeaders(rows: TableRow[]): HeaderInfo[] {
  const headers: HeaderInfo[] = [];
  const usedY = new Set<number>();
  let id = 0;

  for (const row of rows) {
    if (usedY.has(row.y)) continue;

    const ctx = contextRowsForHeader(row, rows);
    const mergedText = ctx.map(rowText).join(' ');
    if (!isInstitutionLine(mergedText) || isHeaderRow(mergedText)) continue;

    ctx.forEach((r) => usedY.add(r.y));

    const mergedCells = mergeInstitutionCells(ctx);
    const fullContext = ctx.map(rowText).join(' ');

    const anchorX = mergedCells.find((c) => isInstitutionLine(c.str))?.x
      ?? mergedCells.find((c) => cellInCol(c.x, COL_INSTITUTION))?.x
      ?? 0;
    if (!anchorX) continue;

    const name = buildInstitutionName(mergedCells);
    const bacOnHeader = detectBacSection(fullContext) ?? undefined;
    const specialty = buildSpecialty(mergedCells, fullContext);
    const city = extractCity(name) ?? extractCity(fullContext);

    let code: string | undefined;
    for (const r of ctx) {
      code = extractCode(rowText(r));
      if (code) break;
    }

    headers.push({
      id: id++,
      y: row.y,
      x: anchorX,
      column: headerColumn(anchorX),
      text: mergedText,
      code,
      bacOnHeader,
      name,
      specialty,
      city,
    });
  }

  return headers;
}

function headerForScoreY(scoreY: number, column: 'left' | 'right', headers: HeaderInfo[]): HeaderInfo | null {
  const colHeaders = headers
    .filter((h) => h.column === column)
    .sort((a, b) => b.y - a.y);

  if (colHeaders.length === 0) return null;

  for (let i = 0; i < colHeaders.length; i++) {
    const h = colHeaders[i];
    const lowerY = i < colHeaders.length - 1 ? colHeaders[i + 1].y : 0;
    if (h.y > scoreY && scoreY > lowerY) return h;
  }

  return null;
}

function extractScoreFromRow(row: TableRow): string | undefined {
  const scoreCell = row.cells.find((c) => c.x <= 25 && SCORE_IN_TEXT_RE.test(c.str));
  if (scoreCell) return extractScoreRaw(scoreCell.str);

  for (const c of row.cells) {
    const v = extractScoreRaw(c.str);
    if (v) return v;
  }
  return undefined;
}

function extractFormulaFromRow(row: TableRow): string | undefined {
  const formulaCell = row.cells.find((c) => c.x >= 25 && c.x <= 100);
  if (formulaCell) return normalizeFormula(formulaCell.str);
  return normalizeFormula(rowText(row));
}

function findNextBac(scoreRow: TableRow, rows: TableRow[]): string | undefined {
  const candidates = rows.filter((r) => r.y < scoreRow.y && scoreRow.y - r.y <= 10);
  for (const r of candidates.sort((a, b) => b.y - a.y)) {
    const bacCell = r.cells.find((c) => c.x >= 100 && c.x <= 145);
    if (bacCell) {
      const bac = detectBacSection(bacCell.str);
      if (bac) return bac;
    }
  }
  const sameRow = scoreRow.cells.find((c) => c.x >= 100 && c.x <= 145);
  if (sameRow) return detectBacSection(sameRow.str) ?? undefined;
  return undefined;
}

type ScoreEvent = {
  y: number;
  headerId: number;
  score: string;
  formula?: string;
  nextBac?: string;
};

function collectScoreEvents(rows: TableRow[], headers: HeaderInfo[]): ScoreEvent[] {
  const events: ScoreEvent[] = [];

  for (const row of rows) {
    const score = extractScoreFromRow(row);
    if (score == null) continue;

    const leftH = headerForScoreY(row.y, 'left', headers);
    const rightH = headerForScoreY(row.y, 'right', headers);

    let header: HeaderInfo | null = null;
    if (leftH && rightH) {
      header = Math.abs(leftH.y - row.y) < Math.abs(rightH.y - row.y) ? leftH : rightH;
    } else {
      header = leftH ?? rightH;
    }
    if (!header) continue;

    events.push({
      y: row.y,
      headerId: header.id,
      score,
      formula: extractFormulaFromRow(row),
      nextBac: findNextBac(row, rows),
    });
  }

  return events.sort((a, b) => b.y - a.y);
}

function buildInstitution(header: HeaderInfo, events: ScoreEvent[]): InstitutionRecord {
  const inst: InstitutionRecord = {
    name: header.name,
    specialty: header.specialty,
    city: header.city,
    orientationCode: header.code,
    admissions: [],
  };

  const myEvents = events.filter((e) => e.headerId === header.id).sort((a, b) => b.y - a.y);
  let currentBac = header.bacOnHeader ?? null;

  for (const ev of myEvents) {
    if (currentBac) {
      inst.admissions.push({
        bacSection: currentBac,
        formula: ev.formula,
        lastScore: ev.score,
      });
    }
    if (ev.nextBac) currentBac = ev.nextBac;
  }

  return inst;
}

function dedupeAdmissions(rows: AdmissionRow[]): AdmissionRow[] {
  const map = new Map<string, AdmissionRow>();
  for (const row of rows) {
    if (!map.has(row.bacSection)) {
      map.set(row.bacSection, { ...row });
    }
  }
  return [...map.values()];
}

const DOMAIN_SECTION_RE = /الآداب|العلوم|الطب|الصحة|الهندسة|السياحة|القانون|الاقتصاد|التصرف|الفلاح|التربية|الفنون|اللغات|الصيدلة|الأسنان|المراحل/i;

function parseSectionCover(lines: RawLine[]): { title: string; subtitle?: string } | null {
  const bigLines = lines
    .filter((l) => l.fontSize >= 22 && l.text.trim().length > 1 && !/^\d{1,3}$/.test(l.text.trim()))
    .sort((a, b) => b.y - a.y);

  if (bigLines.length === 0) return null;

  const parts = bigLines
    .map((l) => cleanLine(l.text))
    .filter((t) => t.length > 2 && !/^[\d\s]+$/.test(t));

  if (parts.length === 0) return null;

  const full = parts.join(' ');
  if (/معلومات مفيدة|الأسئلة|فهرس|متداولة|مفيدة للطالب/i.test(full)) return null;
  if (!DOMAIN_SECTION_RE.test(full) && !bigLines.some((l) => l.fontSize >= 32 && l.text.trim().length > 8)) {
    return null;
  }

  return {
    title: parts[0],
    subtitle: parts.length > 1 ? parts.slice(1).join(' · ') : undefined,
  };
}

function parsePageInstitutions(cells: RawLine[], _pageWidth: number): InstitutionRecord[] {
  const rows = buildTableRows(cells);
  const headers = findHeaders(rows);
  if (headers.length === 0) return [];

  const events = collectScoreEvents(rows, headers);
  const institutions: InstitutionRecord[] = [];

  for (const header of headers) {
    const inst = buildInstitution(header, events);
    inst.admissions = dedupeAdmissions(inst.admissions);
    if (isValidInstitutionName(inst.name) && inst.admissions.length > 0) {
      institutions.push(normalizeInstitutionRecord(inst));
    }
  }

  return institutions.sort((a, b) => {
    const ha = headers.find((h) => h.name === a.name);
    const hb = headers.find((h) => h.name === b.name);
    return (hb?.y ?? 0) - (ha?.y ?? 0);
  });
}

export function parseGuidePage(
  cells: RawLine[],
  mergedLines: RawLine[],
  pageWidth: number
): ParsedGuidePage {
  const allInstitutions = parsePageInstitutions(cells, pageWidth);

  if (allInstitutions.length >= 1) {
    return { pageType: 'institutions', institutions: allInstitutions, paragraphs: [] };
  }

  const section = parseSectionCover(mergedLines);
  if (section) {
    return {
      pageType: 'section',
      sectionTitle: section.title,
      sectionSubtitle: section.subtitle,
      institutions: [],
      paragraphs: [],
    };
  }

  const paragraphs = mergedLines
    .sort((a, b) => b.y - a.y)
    .map((l) => cleanLine(l.text))
    .filter((t) => t.length > 2 && !isHeaderRow(t))
    .filter((t) => !/^FG\+/.test(t) && !SCORE_IN_TEXT_RE.test(t));

  return {
    pageType: 'article',
    institutions: [],
    paragraphs,
    pageTitle: paragraphs.find((p) => p.length < 60 && /^\d+\./.test(p)) || paragraphs[0],
  };
}
