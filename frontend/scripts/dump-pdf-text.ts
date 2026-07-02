import fs from 'fs';
import path from 'path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const PDF_PATH = path.resolve(__dirname, '../public/guides/guide-orientation-2026.pdf');

async function dump(pageNum: number) {
  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const page = await doc.getPage(pageNum);
  const content = await page.getTextContent();
  const texts = content.items
    .filter((i) => 'str' in i)
    .map((i: any) => ({ str: i.str, x: Math.round(i.transform[4]), y: Math.round(i.transform[5]) }));
  console.log(`\n=== PAGE ${pageNum} (${texts.length} cells) ===`);
  const joined = texts.map((t) => t.str).join(' ');
  console.log('joined len', joined.length);
  console.log(joined.slice(0, 500));
  console.log('--- sample cells ---');
  for (const t of texts.slice(0, 15)) console.log(t.x, t.y, JSON.stringify(t.str));
}

async function main() {
  for (const p of [103, 104, 105, 110, 120, 130]) await dump(p);
}
main().catch(console.error);
