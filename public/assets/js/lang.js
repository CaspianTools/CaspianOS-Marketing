/* Caspian ERP marketing site — language negotiation.
   The one script that has to run before the page paints, so it is deliberately
   tiny and kept out of site.js. Everything here is an enhancement: with
   JavaScript disabled a visitor gets the English pages and the language menu in
   the header still switches, because it is made of ordinary links. */
(function () {
  'use strict';

  var LANGS = ['en', 'az', 'tr', 'ru', 'nb', 'de', 'fr'];
  var CHOICE = 'caspian.lang';        /* what the visitor picked, if anything */
  var GUESSED = 'caspian.lang.auto';  /* guard so the browser guess runs once a visit */

  var read = function (store, key) {
    try { return window[store].getItem(key); } catch (error) { return null; }
  };
  var write = function (store, key, value) {
    try { window[store].setItem(key, value); } catch (error) { /* private mode */ }
  };

  var path = window.location.pathname;
  var prefix = path.match(/^\/([a-z]{2})(?=\/|$)/);
  var current = prefix && LANGS.indexOf(prefix[1]) > -1 ? prefix[1] : 'en';

  /* A URL that names its language wins: a shared /tr/pricing link opens in
     Turkish for everyone, and this is also what makes a redirect loop
     impossible — every destination below carries a prefix. */
  if (current !== 'en') return;

  var chosen = read('localStorage', CHOICE);
  if (LANGS.indexOf(chosen) === -1) chosen = null;

  var wanted = chosen;
  if (!wanted) {
    if (read('sessionStorage', GUESSED)) return;
    write('sessionStorage', GUESSED, '1');
    var offered = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || 'en'];
    for (var i = 0; i < offered.length && !wanted; i++) {
      var base = String(offered[i]).toLowerCase().split('-')[0];
      if (base === 'no' || base === 'nn') base = 'nb'; /* Norwegian, either written form */
      if (LANGS.indexOf(base) > -1) wanted = base;
    }
  }

  if (!wanted || wanted === 'en') return;

  /* replace(), not assign(): the English page the visitor never saw should not
     sit in their history and swallow the back button. */
  window.location.replace('/' + wanted + (path === '/' ? '' : path)
    + window.location.search + window.location.hash);
})();
