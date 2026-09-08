// A tolerant HTML walker shared by the i18n extractor, generator and checker.
//
// There is no build step and no dependencies in this repo, so this is a small
// hand-written scanner rather than a DOM library. It only has to cope with the
// markup this site actually contains: well-formed, hand-written HTML whose
// tags `scripts/check-html.mjs` already keeps balanced.

// Text inside these elements is markup or graphics, never prose.
const OPAQUE = new Set(['script', 'style', 'svg']);

// Attributes that carry visible or announced prose. `alt` and `value` are only
// ever empty on this site, and `title` is unused, but they are listed so a new
// occurrence is picked up instead of silently shipping in English.
const TEXT_ATTRS = new Set(['aria-label', 'placeholder', 'title', 'alt', 'value']);

// Strings that site.js writes into the page (the drawer's label, the email
// composer's status messages) live on `data-text-*` attributes so they are
// translated with everything else instead of being hard-coded in the script.
const isTextData = (name) => name.startsWith('data-text-');

// `content` is prose only on these meta tags — the rest are URLs, colours and
// machine values.
const META_TEXT = new Set(['description', 'og:title', 'og:description']);

const TAG_RE = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<!(?:doctype)[^>]*>|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/gi;
const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;

// A string is worth translating only if it contains a letter — "01", "·" and
// "→" read the same in every language.
export const hasLetters = (value) => /\p{L}/u.test(value);

/** Splits a raw text node into its leading whitespace, core, and trailing whitespace. */
export function splitText(raw) {
  const match = raw.match(/^(\s*)([\s\S]*?)(\s*)$/);
  return { lead: match[1], core: match[2], tail: match[3] };
}

const attrsOf = (raw) => {
  const out = {};
  for (const m of raw.matchAll(ATTR_RE)) out[m[1].toLowerCase()] = m[2];
  return out;
};

/**
 * Walks `html` once, handing every translatable text node and attribute value
 * to the callbacks, and returns the rebuilt document.
 *
 * `onText(core, context)` and `onAttr(value, context)` return the replacement
 * string (return the input unchanged to leave it alone). `onTag(tagInfo)` may
 * return a replacement for a whole tag, which is how the generator rewrites
 * links and the `<html lang>` attribute.
 *
 * Regions between `<!--i18n:name-->` and `<!--/i18n:name-->` are handed to
 * `onRegion(name, inner)` instead of being walked: they hold generated markup
 * (the language switcher, the hreflang alternates) that is rewritten wholesale
 * rather than translated.
 */
export function walk(html, { onText, onAttr, onTag, onRegion } = {}) {
  const out = [];
  let cursor = 0;
  let opaque = 0;
  let stack = [];
  let m;
  TAG_RE.lastIndex = 0;

  const emitText = (raw, path) => {
    if (!raw) return;
    if (opaque > 0 || !onText || !hasLetters(raw)) return out.push(raw);
    const { lead, core, tail } = splitText(raw);
    out.push(lead + onText(core, { path, element: stack[stack.length - 1] }) + tail);
  };

  while ((m = TAG_RE.exec(html))) {
    emitText(html.slice(cursor, m.index));
    cursor = m.index + m[0].length;

    const [raw, close, name, attrRaw, selfClose] = m;

    // Comments, doctype and CDATA pass straight through — except the markers
    // that delimit a generated region.
    if (!name) {
      const open = raw.match(/^<!--\s*i18n:([a-z-]+)\s*-->$/);
      if (open && onRegion) {
        const endMarker = `<!--/i18n:${open[1]}-->`;
        const end = html.indexOf(endMarker, cursor);
        if (end !== -1) {
          out.push(raw, onRegion(open[1], html.slice(cursor, end)), endMarker);
          cursor = end + endMarker.length;
          TAG_RE.lastIndex = cursor;
          continue;
        }
      }
      out.push(raw);
      continue;
    }

    const tag = name.toLowerCase();
    if (close) {
      if (OPAQUE.has(tag) && opaque > 0) opaque--;
      if (stack[stack.length - 1] === tag) stack.pop();
      out.push(raw);
      continue;
    }

    const attrs = attrsOf(attrRaw);
    let rebuilt = attrRaw;
    if (onAttr) {
      rebuilt = attrRaw.replace(ATTR_RE, (whole, key, value) => {
        const lower = key.toLowerCase();
        const translatable = TEXT_ATTRS.has(lower)
          || isTextData(lower)
          || (tag === 'meta' && lower === 'content'
              && META_TEXT.has(attrs.name || attrs.property || ''));
        if (!translatable || !hasLetters(value)) return whole;
        const next = onAttr(value, { attribute: lower, element: tag, attrs });
        return `${key}="${next}"`;
      });
    }

    let tagOut = rebuilt === attrRaw ? raw : `<${name}${rebuilt}${selfClose}>`;
    if (onTag) {
      const replaced = onTag({ tag, attrs, selfClose, raw: tagOut });
      if (typeof replaced === 'string') tagOut = replaced;
    }
    out.push(tagOut);

    if (OPAQUE.has(tag) && !selfClose) opaque++;
    if (!selfClose && !VOID.has(tag)) stack.push(tag);
  }
  emitText(html.slice(cursor));
  return out.join('');
}

const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
  'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'stop', 'use', 'ellipse',
]);

/** Collects every translatable string in a page, in document order. */
export function collect(html) {
  const found = [];
  walk(html, {
    onText: (core, ctx) => { found.push({ value: core, kind: ctx.element || 'text' }); return core; },
    onAttr: (value, ctx) => {
      found.push({ value, kind: `@${ctx.attribute}` });
      return value;
    },
    onRegion: (_name, inner) => inner,
  });
  return found;
}
