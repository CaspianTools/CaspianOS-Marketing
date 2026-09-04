// Fails the build when the versioned asset URLs disagree between pages.
//
// firebase.json serves /assets/** with `max-age=31536000, immutable`, so a
// returning visitor keeps site.css until the URL changes. Every page therefore
// links the stylesheet and script with a `?v=` query, and every page must use
// the SAME value — a half-updated set means some pages get new CSS and some
// get a year-old copy. Bump the version in every page whenever you edit
// site.css or site.js; this script is what stops you forgetting one.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'public';
const ASSETS = ['/assets/css/site.css', '/assets/js/site.js'];

const pagesIn = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? pagesIn(path.join(dir, e.name))
      : e.name.endsWith('.html')
        ? [path.relative(ROOT, path.join(dir, e.name))]
        : []
  );

let problems = 0;
const seen = new Map(); // asset -> version -> [pages]

for (const page of pagesIn(ROOT)) {
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  for (const asset of ASSETS) {
    const re = new RegExp(`(?:href|src)="${asset.replace(/[.]/g, '\\.')}(\\?v=([^"]*))?"`, 'g');
    for (const m of html.matchAll(re)) {
      if (!m[1]) {
        console.error(`${page}: ${asset} is linked without a ?v= version — it will be served from a year-long immutable cache`);
        problems++;
        continue;
      }
      if (!seen.has(asset)) seen.set(asset, new Map());
      const byVersion = seen.get(asset);
      if (!byVersion.has(m[2])) byVersion.set(m[2], []);
      byVersion.get(m[2]).push(page);
    }
  }
}

for (const [asset, byVersion] of seen) {
  if (byVersion.size > 1) {
    console.error(`${asset} is linked at ${byVersion.size} different versions:`);
    for (const [version, pages] of byVersion) {
      console.error(`  ?v=${version} — ${pages.length} page(s): ${pages.slice(0, 4).join(', ')}${pages.length > 4 ? ', …' : ''}`);
    }
    problems++;
  }
}

if (problems) {
  console.error(`\n${problems} asset-version problem(s).`);
  process.exit(1);
}
const summary = [...seen].map(([a, v]) => `${path.basename(a)}@${[...v.keys()][0]}`).join(', ');
console.log(`Asset versions consistent across every page (${summary}).`);
