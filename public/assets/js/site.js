/* Caspian ERP marketing site — progressive enhancement only.
   Every page renders and navigates fine with JS disabled. */
(function () {
  'use strict';

  /* Marks the document so CSS can show controls that only work with JS
     (the scroller arrows) without hiding anything from a no-JS visitor. */
  document.documentElement.classList.add('js');

  /* ---------------------------------------------------------------- header */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --------------------------------------------------------- mobile drawer */
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* -------------------------------------------------------- module filters */
  var tablist = document.querySelector('[data-module-filter]');
  if (tablist) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-group]'));
    tablist.addEventListener('click', function (e) {
      var tab = e.target.closest('.filter-tab');
      if (!tab) return;
      var group = tab.getAttribute('data-filter');
      tablist.querySelectorAll('.filter-tab').forEach(function (t) {
        t.setAttribute('aria-selected', String(t === tab));
      });
      cards.forEach(function (card) {
        var groups = (card.getAttribute('data-group') || '').split(' ');
        card.hidden = group !== 'all' && groups.indexOf(group) === -1;
      });
    });
  }

  /* ------------------------------------------------------ reveal on scroll */
  var revealables = document.querySelectorAll('.reveal');
  if (revealables.length) {
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------------------------------------------- horizontal scrollers */
  /* The track scrolls and snaps in pure CSS; the arrow buttons are hidden
     until this runs, because without it they would do nothing. */
  document.querySelectorAll('[data-scroller]').forEach(function (wrap) {
    var track = wrap.querySelector('.scroller-track');
    if (!track) return;
    wrap.querySelectorAll('[data-scroll]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = btn.getAttribute('data-scroll') === 'prev' ? -1 : 1;
        track.scrollBy({ left: dir * Math.round(track.clientWidth * 0.8), behavior: 'smooth' });
      });
    });
  });

  /* ------------------------------------------- contact form → mail client */
  /* The site is static (Firebase Hosting, no backend), so the form composes a
     pre-filled message and hands it to the visitor's mail client. */
  var form = document.querySelector('[data-mail-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var get = function (k) { return (data.get(k) || '').toString().trim(); };
      var lines = [
        'Name: ' + get('name'),
        'Work email: ' + get('email'),
        'Company: ' + get('company'),
        'Team size: ' + get('size'),
        'Interested in: ' + get('interest'),
        '',
        get('message')
      ];
      var to = form.getAttribute('data-mail-to') || 'hello@caspianerp.com';
      var subject = get('interest')
        ? 'Caspian ERP enquiry — ' + get('interest')
        : 'Caspian ERP enquiry';
      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      var status = form.querySelector('[data-form-status]');
      if (status) {
        status.textContent =
          'Your email app should now be open with the message ready to send. ' +
          'If nothing happened, email ' + to + ' directly.';
      }
    });
  }

  /* --------------------------------------------------------- footer year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
