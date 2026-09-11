/* Caspian ERP marketing site — Google Analytics 4.
   The standard gtag.js snippet, moved out of the page head and into a file.
   Google gives you two inline <script> blocks; this site sends
   `script-src 'self' https://*.googletagmanager.com` with no 'unsafe-inline',
   so pasting them into every page would have the browser refuse to run them.
   Same commands, same order, one place that knows the measurement ID.

   **Nothing includes this file directly any more.** consent.js loads it, and
   only once a visitor has accepted — so the tag is not requested, no cookie is
   set and nothing reaches Google before then. Adding a `<script src>` for it
   back into a page would silently undo the consent gate, which is why the gate
   lives in a separate file rather than in a flag inside this one.

   It still arrives after lang.js has run. lang.js may redirect an unprefixed
   URL to the visitor's language, and a visitor who lands on /pricing and is
   sent to /de/pricing should be counted once, on the page they actually read;
   consent.js is itself deferred, so anything it injects is later still. */
(function () {
  'use strict';

  var ID = 'G-14GPENV8PG';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', ID);

  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(tag);
})();
