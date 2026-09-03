/* CaspianOS marketing site — progressive enhancement only.
   Every page renders and navigates fine with JS disabled. */
(function () {
  'use strict';

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
      var to = form.getAttribute('data-mail-to') || 'hello@caspianos.io';
      var subject = get('interest')
        ? 'CaspianOS enquiry — ' + get('interest')
        : 'CaspianOS enquiry';
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
