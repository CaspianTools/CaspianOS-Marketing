/* Caspian ERP marketing site — cookie consent.

   Google Analytics sets first-party cookies. The site is served in German,
   French and Norwegian, so EEA visitors are expected, and in the EEA consent
   comes *before* a non-essential cookie is set — not after, and disclosure on
   /privacy is not consent. This file is that gate.

   **Nothing loads until someone says yes.** The tag is not requested, no
   cookie is written and no data leaves the browser until the visitor accepts.
   The alternative — loading Google's tag in a cookie-less mode and asking
   afterwards — still contacts Google on the first pageview, which is the thing
   being consented to. So analytics.js is not loaded by the page at all; this
   script loads it, once, if and when consent exists.

   **With JavaScript off there is nothing to consent to.** Analytics cannot run,
   no cookie can be set, and no banner appears — the correct outcome rather than
   a missing feature. The site is readable without any of this, which is why the
   banner is the only thing here and it is injected rather than served in the
   HTML of every page.

   **The choice is remembered in localStorage, not a cookie.** A cookie to
   record that you refused cookies is a poor joke, and localStorage is
   first-party storage the visitor can clear with the rest of the site.

   Deliberately dependency-free and in one file, like lang.js: it must run on
   the first paint of a page that has loaded nothing else. */
(function () {
  'use strict';

  var KEY = 'caspian.consent';          /* 'granted' | 'denied' */
  var LANGS = ['en', 'az', 'tr', 'ru', 'nb', 'de', 'fr'];

  /* The banner carries its own strings rather than going through the i18n
     build: it is injected into a page that is already rendered, so there is no
     element for the extractor to find, and one file with seven short entries
     is easier to keep honest than seven files with one entry each. */
  var TEXT = {
    en: {
      body: 'We use Google Analytics to understand which pages people read. It sets cookies, so we ask first — the site works either way.',
      accept: 'Accept',
      reject: 'Reject',
      privacy: 'Privacy',
    },
    az: {
      body: 'Hansı səhifələrin oxunduğunu anlamaq üçün Google Analytics istifadə edirik. O, kukilər təyin edir, ona görə əvvəlcə soruşuruq — sayt hər halda işləyir.',
      accept: 'Qəbul et',
      reject: 'İmtina et',
      privacy: 'Məxfilik',
    },
    tr: {
      body: 'Hangi sayfaların okunduğunu anlamak için Google Analytics kullanıyoruz. Çerez yerleştirdiği için önce soruyoruz — site her iki durumda da çalışır.',
      accept: 'Kabul et',
      reject: 'Reddet',
      privacy: 'Gizlilik',
    },
    ru: {
      body: 'Мы используем Google Analytics, чтобы понимать, какие страницы читают. Он устанавливает файлы cookie, поэтому мы сначала спрашиваем — сайт работает в любом случае.',
      accept: 'Принять',
      reject: 'Отклонить',
      privacy: 'Конфиденциальность',
    },
    nb: {
      body: 'Vi bruker Google Analytics for å forstå hvilke sider folk leser. Det setter informasjonskapsler, så vi spør først — nettstedet virker uansett.',
      accept: 'Godta',
      reject: 'Avslå',
      privacy: 'Personvern',
    },
    de: {
      body: 'Wir nutzen Google Analytics, um zu verstehen, welche Seiten gelesen werden. Dabei werden Cookies gesetzt, deshalb fragen wir vorher — die Website funktioniert so oder so.',
      accept: 'Akzeptieren',
      reject: 'Ablehnen',
      privacy: 'Datenschutz',
    },
    fr: {
      body: 'Nous utilisons Google Analytics pour savoir quelles pages sont lues. Il dépose des cookies, nous demandons donc d’abord — le site fonctionne dans les deux cas.',
      accept: 'Accepter',
      reject: 'Refuser',
      privacy: 'Confidentialité',
    },
  };

  var read = function () {
    try { return window.localStorage.getItem(KEY); } catch (error) { return null; }
  };
  var write = function (value) {
    try { window.localStorage.setItem(KEY, value); } catch (error) { /* private mode */ }
  };

  var lang = function () {
    var declared = (document.documentElement.getAttribute('lang') || 'en').slice(0, 2).toLowerCase();
    return LANGS.indexOf(declared) > -1 ? declared : 'en';
  };

  /* The only place analytics is ever started. Guarded so a second call — a
     visitor who accepts on a page that already loaded it — does nothing. */
  var started = false;
  var startAnalytics = function () {
    if (started) return;
    started = true;
    var tag = document.createElement('script');
    tag.src = '/assets/js/analytics.js?v=20260911';
    tag.defer = true;
    document.head.appendChild(tag);
  };

  var decide = function (value, banner) {
    write(value);
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    if (value === 'granted') startAnalytics();
  };

  var show = function () {
    var t = TEXT[lang()] || TEXT.en;
    var prefix = lang() === 'en' ? '' : '/' + lang();

    var banner = document.createElement('div');
    banner.className = 'consent';
    /* A dialog, announced, and focusable — a visitor using a screen reader has
       to be able to find the thing blocking their cookies. */
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', t.accept + ' / ' + t.reject);

    var text = document.createElement('p');
    text.className = 'consent__text';
    text.appendChild(document.createTextNode(t.body + ' '));

    var link = document.createElement('a');
    link.href = prefix + '/privacy';
    link.className = 'consent__link';
    link.appendChild(document.createTextNode(t.privacy));
    text.appendChild(link);

    var actions = document.createElement('div');
    actions.className = 'consent__actions';

    var reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'consent__btn consent__btn--ghost';
    reject.appendChild(document.createTextNode(t.reject));
    reject.addEventListener('click', function () { decide('denied', banner); });

    var accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'consent__btn consent__btn--primary';
    accept.appendChild(document.createTextNode(t.accept));
    accept.addEventListener('click', function () { decide('granted', banner); });

    /* Reject first in the DOM and visually: the cheaper choice for the visitor
       should not be the harder one to reach, and a banner that hides it is the
       pattern regulators single out. Both are ordinary buttons of equal weight. */
    actions.appendChild(reject);
    actions.appendChild(accept);
    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);
    reject.focus();
  };

  var choice = read();
  if (choice === 'granted') { startAnalytics(); return; }
  if (choice === 'denied') return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', show);
  } else {
    show();
  }
})();
