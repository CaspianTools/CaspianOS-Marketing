// Fails the build on an internal link or asset reference that does not resolve.
// Hosting serves clean URLs, so `/modules` must map to `public/modules.html`,
// and an in-page `#anchor` must exist as an id in its target page.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'public';

// Pages live at the top level and one directory down (public/modules/*.html),
// so the walk has to recurse. Clean URLs mean `/modules/hr` maps to
// `public/modules/hr.html`, which the resolver below already handles.
const pagesIn = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? pagesIn(path.join(dir, e.name))
      : e.name.endsWith('.html')
        ? [path.relative(ROOT, path.join(dir, e.name))]
        : []
  );

const pages = pagesIn(ROOT);

const idsOf = (html) => new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
const cache = new Map();
const load = (file) => {
  if (!cache.has(file)) {
    const p = path.join(ROOT, file);
    cache.set(file, fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
  }
  return cache.get(file);
};

let problems = 0;

for (const page of pages) {
  const html = load(page);
  const selfIds = idsOf(html);

  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(raw)) continue;

    // Strip the fragment, then the `?v=` cache-busting query: the version is
    // part of the URL a browser requests, but the file on disk has no query.
    const [beforeHash, hash] = raw.split('#');
    const target = beforeHash.split('?')[0];

    // Same-page anchor
    if (target === '' && hash) {
      if (!selfIds.has(hash)) {
        console.error(`${page}: #${hash} — no element with that id on this page`);
        problems++;
      }
      continue;
    }
    if (!target.startsWith('/')) {
      console.error(`${page}: "${raw}" — internal links must be root-relative`);
      problems++;
      continue;
    }

    // Asset or file with an extension
    if (path.extname(target)) {
      if (!fs.existsSync(path.join(ROOT, target))) {
        console.error(`${page}: ${target} — file not found`);
        problems++;
      }
      continue;
    }

    // Clean URL: "/" → index.html, "/modules" → modules.html
    const file = target === '/' ? 'index.html' : `${target.slice(1)}.html`;
    const targetHtml = load(file);
    if (targetHtml === null) {
      console.error(`${page}: ${target} — no page (expected public/${file})`);
      problems++;
      continue;
    }
    if (hash && !idsOf(targetHtml).has(hash)) {
      console.error(`${page}: ${target}#${hash} — no element with that id in ${file}`);
      problems++;
    }
  }
}

if (problems) {
  console.error(`\n${problems} broken internal link(s).`);
  process.exit(1);
}
console.log(`Internal links resolve across ${pages.length} pages.`);
