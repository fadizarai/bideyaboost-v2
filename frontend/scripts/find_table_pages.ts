import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const PDF_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/guides/guide-orientation-2026.pdf');

async function main() {
  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  console.log(`Total Pages: ${doc.numPages}`);
  
  const matches = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const text = content.items
      .filter((i) => 'str' in i)
      .map((i) => i.str)
      .join(' ');
      
    // Look for 5 digit numbers (orientation codes)
    const codes = text.match(/\b\d{5}\b/g);
    if (codes && codes.length >= 3) {
      console.log(`Page ${p}: Found ${codes.length} codes. Sample: ${text.slice(0, 150)}`);
      matches.push(p);
    }
  }
  console.log(`Matching pages: ${JSON.stringify(matches)}`);
}

main().catch(console.error);
