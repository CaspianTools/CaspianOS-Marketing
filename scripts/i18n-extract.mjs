// Rebuilds the English string catalogue from the source pages.
//
//   node scripts/i18n-extract.mjs
//
// The catalogue (i18n/_catalog.json) is the list of every translatable string
// on the site, in the order it appears, with the pages and elements it comes
// from. Translators work from it, `scripts/check-i18n.mjs` measures coverage
// against it, and `scripts/i18n-build.mjs` uses the per-language files keyed by
// the same English strings.
import fs from 'node:fs';
import path from 'node:path';
import { collect } from './lib/html-i18n.mjs';
import { CODES, SOURCE, urlForFile } from '../i18n/config.mjs';

const ROOT = 'public';
const OUT = 'i18n/_catalog.json';

/** English pages only — the generated `public/<lang>/` trees are skipped. */
export function sourcePages(dir = ROOT) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const rel = path.relative(ROOT, full);
      return CODES.includes(rel) && rel !== SOURCE ? [] : sourcePages(full);
    }
    return entry.name.endsWith('.html') ? [path.relative(ROOT, full)] : [];
  }).sort();
}

export function catalogue() {
  const strings = new Map(); // english -> { where: Set }
  for (const page of sourcePages()) {
    const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
    for (const { value, kind } of collect(html)) {
      if (!strings.has(value)) strings.set(value, new Set());
      strings.get(value).add(`${urlForFile(page)} ${kind}`);
    }
  }
  return strings;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const strings = catalogue();
  const entries = [...strings].map(([en, where]) => ({ en, where: [...where].sort() }));
  fs.mkdirSync('i18n', { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(entries, null, 2) + '\n');
  const words = entries.reduce((n, e) => n + e.en.split(/\s+/).length, 0);
  console.log(`${entries.length} unique strings (~${words} words) → ${OUT}`);
}
