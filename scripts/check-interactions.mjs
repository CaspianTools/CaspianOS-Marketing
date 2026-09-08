// Behavioral checks for the static site's progressive enhancements.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = fs.readFileSync('public/assets/js/site.js', 'utf8');
function element(value = '') {
  const values = new Set();
  return { value, hidden: true, textContent: '', attributes: {}, events: {},
    classList: { add: x => values.add(x), remove: x => values.delete(x),
      contains: x => values.has(x), toggle(x, force) {
        const next = force === undefined ? !values.has(x) : force;
        next ? values.add(x) : values.delete(x); return next;
      } },
    addEventListener(name, fn) { this.events[name] = fn; },
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name]; },
    setCustomValidity(message) { this.error = message; },
    focus() { this.focused = true; }, select() { this.selected = true; }
  };
}
function setup({ search = '', clipboardFails = false, strings = {} } = {}) {
  const form = element(), preview = element(), draft = element(), status = element();
  const open = element(), copy = element(), toggle = element(), menu = element();
  // The localized pages carry site.js's strings on data-text-* attributes; an
  // empty set here stands for a page that carries none, which must still work.
  for (const [key, value] of Object.entries(strings)) {
    (key === 'open' || key === 'close' ? toggle : form).attributes['data-text-' + key] = value;
  }
  const options = { demo: element('A product demo'), pricing: element('Pricing & plans') };
  const langLinks = ['en', 'tr'].map(code => {
    const link = element(); link.attributes['data-lang'] = code; return link;
  });
  const switcher = element();
  switcher.querySelectorAll = () => langLinks;
  const fields = { name: element('Aynur'), email: element('aynur@example.com'),
    company: element('Example & Co'), size: element('11-50'),
    interest: element(''), message: element('Need permits & stock.\nSecond line.') };
  const required = [fields.name, fields.email, fields.message];
  form.querySelector = key => ({ '[data-email-preview]': preview, '#email-draft': draft,
    '[data-form-status]': status, '[name="interest"]': fields.interest,
    '[data-open-email]': open, '[data-copy-email]': copy,
    '[data-interest="demo"]': options.demo,
    '[data-interest="pricing"]': options.pricing })[key];
  form.querySelectorAll = () => required;
  form.reportValidity = () => required.every(x => !x.error && x.value.trim());
  form.attributes['data-mail-to'] = 'hello@caspianerp.com';
  const window = { location: { search, hash: '#demo' }, events: {},
    addEventListener(name, fn) { this.events[name] = fn; } };
  let copied;
  const stored = {};
  window.localStorage = { setItem: (key, value) => { stored[key] = value; } };
  const context = { URLSearchParams, window,
    document: { documentElement: element(), events: {},
      addEventListener(name, fn) { this.events[name] = fn; },
      querySelector: key => ({ '[data-mail-form]': form, '[data-nav-toggle]': toggle,
        '[data-lang-switcher]': switcher })[key] || null,
      querySelectorAll: () => [], getElementById: () => menu },
    FormData: class { get(key) { return fields[key].value; } },
    navigator: { clipboard: { async writeText(value) {
      if (clipboardFails) throw Error('denied'); copied = value;
    } } } };
  vm.runInNewContext(source, context);
  return { form, preview, draft, status, open, copy, fields, toggle, menu, window,
    langLinks, stored,
    copied: () => copied, submit: () => form.events.submit({ preventDefault() {} }) };
}
test('demo and pricing links preselect the relevant enquiry', () => {
  assert.equal(setup().fields.interest.value, 'A product demo');
  assert.equal(setup({ search: '?interest=pricing' }).fields.interest.value, 'Pricing & plans');
});
test('whitespace-only required fields cannot prepare a draft', () => {
  const ui = setup(); ui.fields.name.value = '   '; ui.submit();
  assert.equal(ui.preview.hidden, true); assert.ok(ui.fields.name.error);
});
test('valid enquiry previews content and safely encodes email without sending', () => {
  const ui = setup(); ui.submit();
  assert.equal(ui.preview.hidden, false); assert.equal(ui.draft.focused, true);
  assert.match(ui.draft.value, /Example & Co/);
  const url = new URL(ui.open.href);
  assert.equal(url.protocol, 'mailto:');
  assert.match(url.searchParams.get('body'), /Need permits & stock.\nSecond line./);
  assert.equal(ui.window.location.href, undefined);
  assert.match(ui.status.textContent, /Nothing has been sent/);
});
test('editing a field invalidates the previous draft', () => {
  const ui = setup(); ui.submit(); ui.form.events.input({ target: ui.fields.company });
  assert.equal(ui.preview.hidden, true); assert.equal(ui.status.textContent, '');
});
test('copy works and permission failure selects the draft for manual copying', async () => {
  const ui = setup(); ui.submit(); await ui.copy.events.click();
  assert.equal(ui.copied(), ui.draft.value);
  const fallback = setup({ clipboardFails: true }); fallback.submit();
  await fallback.copy.events.click(); assert.equal(fallback.draft.selected, true);
  assert.match(fallback.status.textContent, /selected draft/);
});
test('mobile menu updates its accessible label and Escape restores focus', () => {
  const ui = setup(); ui.toggle.events.click();
  assert.equal(ui.toggle.attributes['aria-expanded'], 'true');
  assert.equal(ui.toggle.attributes['aria-label'], 'Close menu');
  ui.window.events.keydown({ key: 'Escape' });
  assert.equal(ui.toggle.attributes['aria-expanded'], 'false');
  assert.equal(ui.toggle.attributes['aria-label'], 'Open menu');
  assert.equal(ui.toggle.focused, true);
});
test('choosing a language is remembered for the next visit', () => {
  const ui = setup();
  ui.langLinks[1].events.click();
  assert.equal(ui.stored['caspian.lang'], 'tr');
});
test('the composer speaks whatever language the page carries', () => {
  const ui = setup({ strings: { subject: 'Caspian ERP talebi', name: 'Ad',
    email: 'İş e-postası', company: 'Şirket', size: 'Ekip büyüklüğü',
    interest: 'İlgilendiği konu', ready: 'Taslağınız hazır.', close: 'Menüyü kapat' } });
  ui.submit();
  assert.match(new URL(ui.open.href).searchParams.get('subject'), /^Caspian ERP talebi/);
  assert.match(ui.draft.value, /^To: hello@caspianerp\.com\nSubject: Caspian ERP talebi/);
  assert.match(ui.draft.value, /Şirket: Example & Co/);
  assert.equal(ui.status.textContent, 'Taslağınız hazır.');
  ui.toggle.events.click();
  assert.equal(ui.toggle.attributes['aria-label'], 'Menüyü kapat');
});

/* ------------------------------------------------------------- lang.js ---
   The browser-language redirect. It runs before the page paints, so the only
   thing that can be asserted is which URL it replaces the current one with. */
const negotiator = fs.readFileSync('public/assets/js/lang.js', 'utf8');
function negotiate({ path = '/', languages = ['en-GB'], choice = null, visited = false } = {}) {
  const local = { 'caspian.lang': choice };
  const session = { 'caspian.lang.auto': visited ? '1' : null };
  const store = (bag) => ({ getItem: key => bag[key] ?? null, setItem: (key, v) => { bag[key] = v; } });
  const location = { pathname: path, search: '', hash: '', replaced: null,
    replace(url) { this.replaced = url; } };
  const window = { location, localStorage: store(local), sessionStorage: store(session) };
  vm.runInNewContext(negotiator, { window, location, navigator: { languages } });
  return { to: location.replaced, choice: local['caspian.lang'] };
}
test('a browser asking for a language we ship lands on that language', () => {
  assert.equal(negotiate({ path: '/pricing', languages: ['tr-TR', 'en'] }).to, '/tr/pricing');
  assert.equal(negotiate({ languages: ['de'] }).to, '/de');
  assert.equal(negotiate({ path: '/modules/hr', languages: ['nn-NO'] }).to, '/nb/modules/hr');
});
test('English, an unshipped language and a second look all stay put', () => {
  assert.equal(negotiate({ languages: ['en-US'] }).to, null);
  assert.equal(negotiate({ languages: ['ja-JP', 'zh'] }).to, null);
  assert.equal(negotiate({ languages: ['fr'], visited: true }).to, null);
});
test('a URL that names its language is never overridden', () => {
  assert.equal(negotiate({ path: '/tr/pricing', languages: ['de'] }).to, null);
  assert.equal(negotiate({ path: '/ru', languages: ['de'], choice: 'fr' }).to, null);
});
test('a remembered choice outranks the browser, every visit', () => {
  assert.equal(negotiate({ path: '/about', languages: ['de'], choice: 'ru' }).to, '/ru/about');
  assert.equal(negotiate({ languages: ['de'], choice: 'ru', visited: true }).to, '/ru');
  assert.equal(negotiate({ path: '/about', languages: ['de'], choice: 'en' }).to, null);
});
