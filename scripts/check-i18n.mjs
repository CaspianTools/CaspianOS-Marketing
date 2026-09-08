// Fails the build when a language is incomplete or the generated pages have
// drifted from the English sources.
//
// The localized trees under public/<lang>/ are committed, because there is no
// build step at deploy time — hosting serves exactly what is in the repo. That
// only stays honest if this runs: it regenerates every page in memory and
// compares it with the file on disk, so an English page edited without a
// re-run is caught here rather than shipping as a half-translated site.
import fs from 'node:fs';
import path from 'node:path';
import { catalogue } from './i18n-extract.mjs';
import { build, loadDictionary } from './i18n-build.mjs';
import { TARGETS } from '../i18n/config.mjs';

const ROOT = 'public';
// A translated string is copy, not markup: an unescaped ampersand or angle
// bracket is invalid HTML the moment it is substituted into a page.
const BAD_MARKUP = /[<>]|&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#[xX][0-9a-fA-F]+);)/;

let problems = 0;
const fail = (message) => { console.error(message); problems++; };

const strings = catalogue();

for (const lang of TARGETS) {
  const file = `i18n/${lang}.json`;
  if (!fs.existsSync(file)) {
    fail(`${file} — missing; run the translation pass for "${lang}"`);
    continue;
  }
  const dict = loadDictionary(lang);
  const missing = [...strings.keys()].filter((en) => !dict.has(en) || dict.get(en).trim() === '');
  const stale = [...dict.keys()].filter((en) => !strings.has(en));

  if (missing.length) {
    fail(`${file} — ${missing.length} of ${strings.size} strings untranslated, first: `
      + missing.slice(0, 3).map((s) => JSON.stringify(s.slice(0, 60))).join(', '));
  }
  if (stale.length) {
    fail(`${file} — ${stale.length} string(s) no longer on the site, first: `
      + stale.slice(0, 3).map((s) => JSON.stringify(s.slice(0, 60))).join(', '));
  }
  for (const [en, value] of dict) {
    if (BAD_MARKUP.test(value)) {
      fail(`${file} — unescaped markup in the translation of ${JSON.stringify(en.slice(0, 60))}`);
    }
  }
}

const generated = build();
for (const [file, contents] of generated) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    fail(`public/${file} — missing; run: node scripts/i18n-build.mjs`);
  } else if (fs.readFileSync(full, 'utf8') !== contents) {
    fail(`public/${file} — out of date; run: node scripts/i18n-build.mjs`);
  }
}

// Anything under a language directory that the generator does not own is a
// leftover from a renamed or deleted page and would still be served.
const walkDir = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walkDir(path.join(dir, e.name)) : [path.join(dir, e.name)]));
for (const lang of TARGETS) {
  const dir = path.join(ROOT, lang);
  if (!fs.existsSync(dir)) continue;
  for (const found of walkDir(dir)) {
    if (!generated.has(path.relative(ROOT, found))) {
      fail(`${found} — orphaned; delete it or re-run the generator`);
    }
  }
}

if (problems) {
  console.error(`\n${problems} i18n problem(s).`);
  process.exit(1);
}
console.log(`${strings.size} strings translated into ${TARGETS.length} languages; `
  + `${generated.size} generated files up to date.`);
