/* Caspian ERP marketing site — Google Analytics 4.
   The standard gtag.js snippet, moved out of the page head and into a file.
   Google gives you two inline <script> blocks; this site sends
   `script-src 'self' https://*.googletagmanager.com` with no 'unsafe-inline',
   so pasting them into every page would have the browser refuse to run them.
   Same commands, same order, one place that knows the measurement ID.

   Loaded with `defer`, deliberately. lang.js runs first and may redirect an
   unprefixed URL to the visitor's language; a deferred script has not run by
   then, so a visitor who lands on /pricing and is sent to /de/pricing is
   counted once, on the page they actually read. */
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
