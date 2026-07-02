/**
 * Extrait toutes les offres (établissement + spécialité) du guide PDF 2026.
 * Usage: npx tsx scripts/extract-guide-programs.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { GUIDE_CONTENT_START, isGuidePdfPageIncluded } from '../lib/guide-page-map';
import { parseGuidePage } from '../lib/guide-institution-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PDF_PATH = process.env.GUIDE_PDF
  ? path.resolve(process.env.GUIDE_PDF)
  : path.join(ROOT, 'public/guides/guide-orientation-2026.pdf');
const OUT_PATH = path.resolve(ROOT, '../../data/ai/ai/guide_programs_2026.json');

type RawLine = { text: string; x: number; y: number; fontSize: number };

function detectArabic(text: string): boolean {
  const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const lat = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  return ar > lat;
}

async function extractRawCells(
  doc: Awaited<ReturnType<typeof getDocument>>,
  pageNum: number,
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

function parseScore(raw?: string): number | null {
  if (!raw) return null;
  const m = raw.replace(/\s/g, '').match(/(\d+)[,.](\d+)/);
  if (!m) return null;
  return Math.round((Number(m[1]) + Number(m[2]) / 1000) * 100) / 100;
}

async function main() {
  if (!fs.existsSync(PDF_PATH)) {
    console.error('PDF introuvable:', PDF_PATH);
    process.exit(1);
  }

  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  console.log(`PDF: ${PDF_PATH}`);
  console.log(`Pages: ${doc.numPages}, contenu à partir de p.${GUIDE_CONTENT_START}`);

  const programs: Record<string, unknown>[] = [];
  const seen = new Set<string>();

  for (let p = GUIDE_CONTENT_START; p <= doc.numPages; p++) {
    if (!isGuidePdfPageIncluded(p)) continue;
    const { cells, lines, pageWidth } = await extractRawCells(doc, p);
    const parsed = parseGuidePage(cells, lines, pageWidth);
    if (parsed.pageType !== 'institutions') continue;

    for (const inst of parsed.institutions) {
      const specialty = inst.specialty?.trim();
      if (!specialty || specialty === inst.name) continue;

      for (const adm of inst.admissions) {
        const lastScore = parseScore(adm.lastScore);
        const key = [
          inst.name,
          specialty,
          adm.bacSection,
          inst.orientationCode ?? '',
        ].join('::');

        if (seen.has(key)) continue;
        seen.add(key);

        programs.push({
          institution: inst.name,
          specialty,
          city: inst.city ?? null,
          orientation_code: inst.orientationCode ?? null,
          bac_section: adm.bacSection,
          admission_formula: adm.formula ?? null,
          admission_score_last: lastScore,
          source_page: p,
          academic_year: '2026-2027',
          source: 'guide_orientation_2026.pdf',
        });
      }
    }

    if (p % 20 === 0) process.stdout.write(`  page ${p}/${doc.numPages}\r`);
  }

  programs.sort((a, b) => String(a.institution).localeCompare(String(b.institution), 'fr'));

  const payload = {
    metadata: {
      source: 'guide_orientation_2026.pdf',
      url: 'https://www.orientation.tn/orient/pdf/guide2026.pdf',
      extracted_at: new Date().toISOString(),
      total_programs: programs.length,
      unique_institutions: new Set(programs.map((p) => p.institution)).size,
    },
    programs,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), 'utf-8');

  console.log(`\nExtrait: ${programs.length} offres`);
  console.log(`Établissements: ${payload.metadata.unique_institutions}`);
  console.log(`Fichier: ${OUT_PATH}`);

  const sample = programs.filter((p) =>
    /informatique|multim/i.test(String(p.institution)) && /web|embarqu|intelligence|IoT|BI/i.test(String(p.specialty)),
  ).slice(0, 8);
  if (sample.length) {
    console.log('\nExemples informatique:');
    for (const s of sample) {
      console.log(`  - ${s.institution} → ${s.specialty}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
