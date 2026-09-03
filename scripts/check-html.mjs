// Fails the build on an unbalanced or mismatched tag. There is no bundler or
// template engine here, so nothing else would catch a hand-edit that breaks a
// page's structure.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'public';
const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
  // SVG shapes used inline throughout the pages
  'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'stop', 'use', 'ellipse',
]);

let problems = 0;

for (const file of fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const stack = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>/g;
  let m;
  while ((m = re.exec(html))) {
    const [, close, tag, , self] = m;
    const t = tag.toLowerCase();
    if (t === '!doctype' || VOID.has(t) || self) continue;
    if (close) {
      const top = stack.pop();
      if (top !== t) {
        console.error(`${file}: expected </${top}>, found </${t}> at offset ${m.index}`);
        problems++;
      }
    } else {
      stack.push(t);
    }
  }
  if (stack.length) {
    console.error(`${file}: unclosed tags: ${stack.join(', ')}`);
    problems++;
  }
}

if (problems) {
  console.error(`\n${problems} HTML problem(s).`);
  process.exit(1);
}
console.log('HTML tags balanced in every page.');
