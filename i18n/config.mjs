// The languages the marketing site ships, and the metadata every page needs to
// advertise them. The list mirrors SUPPORTED_LANGUAGES in the application
// (src/i18n/index.ts) so a visitor who switches language on caspianerp.com
// finds the same language waiting in app.caspianerp.com.
//
// English is the source language: its pages stay at the root of `public/`, and
// every other language is generated into `public/<code>/`.

export const SOURCE = 'en';

export const LANGUAGES = [
  { code: 'en', name: 'English',           locale: 'en-US', htmlLang: 'en' },
  { code: 'az', name: 'Azərbaycan dili',   locale: 'az-AZ', htmlLang: 'az' },
  { code: 'tr', name: 'Türkçe',            locale: 'tr-TR', htmlLang: 'tr' },
  { code: 'ru', name: 'Русский',           locale: 'ru-RU', htmlLang: 'ru' },
  { code: 'nb', name: 'Norsk (bokmål)',    locale: 'nb-NO', htmlLang: 'nb' },
  { code: 'de', name: 'Deutsch',           locale: 'de-DE', htmlLang: 'de' },
  { code: 'fr', name: 'Français',          locale: 'fr-FR', htmlLang: 'fr' },
];

export const CODES = LANGUAGES.map((l) => l.code);
export const TARGETS = CODES.filter((c) => c !== SOURCE);

export const ORIGIN = 'https://caspianerp.com';

// The application reads a /{lang}/ prefix from its own URL, so a localized page
// hands its language over by linking to the prefixed app URL rather than the
// bare one — the app's server redirects every bare URL to /en/…, which is what
// used to drop a visitor's language at the door. `/welcome` is where a bare
// visit lands today, named explicitly so the handoff does not depend on the
// app's default-route fallback.
export const APP_ORIGIN = 'https://app.caspianerp.com';
export const APP_ENTRY = '/welcome';

/** Chrome the generator writes itself, so it is never left half-translated. */
export const UI = {
  en: { label: 'Language', current: 'Language: English',            switcher: 'Choose a language' },
  az: { label: 'Dil',      current: 'Dil: Azərbaycan dili',         switcher: 'Dil seçin' },
  tr: { label: 'Dil',      current: 'Dil: Türkçe',                  switcher: 'Bir dil seçin' },
  ru: { label: 'Язык',     current: 'Язык: Русский',                switcher: 'Выберите язык' },
  nb: { label: 'Språk',    current: 'Språk: Norsk (bokmål)',        switcher: 'Velg språk' },
  de: { label: 'Sprache',  current: 'Sprache: Deutsch',             switcher: 'Sprache wählen' },
  fr: { label: 'Langue',   current: 'Langue : Français',            switcher: 'Choisir une langue' },
};

/** `/modules/hr` in English becomes `/az/modules/hr`; assets are shared. */
export function localizePath(pathname, lang) {
  if (lang === SOURCE) return pathname;
  if (pathname === '/') return `/${lang}`;
  return `/${lang}${pathname}`;
}

/** `public/modules/hr.html` → `/modules/hr` (hosting serves clean URLs). */
export function urlForFile(file) {
  if (file === 'index.html') return '/';
  return `/${file.replace(/\.html$/, '')}`;
}
