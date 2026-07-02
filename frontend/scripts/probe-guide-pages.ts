import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { parseGuidePage } from '../lib/guide-institution-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_PATH = path.resolve(__dirname, '../public/guides/guide-orientation-2026.pdf');

type RawLine = { text: string; x: number; y: number; fontSize: number };

async function extractRawCells(doc: Awaited<ReturnType<typeof getDocument>>, pageNum: number) {
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
    items.sort((a, b) => a.x - b.x);
    const text = items.map((i) => i.str).join(' ').trim();
    if (text.length < 1) continue;
    lines.push({ text, x: 0, y: bucket, fontSize: 11 });
  }
  return { cells, lines, pageWidth: viewport.width };
}

async function main() {
  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  console.log('pages', doc.numPages);

  for (let p = 1; p <= Math.min(60, doc.numPages); p++) {
    const { cells, lines, pageWidth } = await extractRawCells(doc, p);
    const parsed = parseGuidePage(cells, lines, pageWidth);
    const sample = parsed.institutions[0];
    const lineSample = lines.slice(0, 3).map((l) => l.text.slice(0, 80)).join(' | ');
    if (parsed.institutions.length > 0 || /معهد|Institut|كلية|Faculté/i.test(lineSample)) {
      console.log(`p${p} type=${parsed.pageType} inst=${parsed.institutions.length} section=${parsed.sectionTitle ?? '-'} sample=${sample ? `${sample.name?.slice(0,40)} / ${sample.specialty?.slice(0,40)}` : lineSample}`);
    }
  }
}

main().catch(console.error);
