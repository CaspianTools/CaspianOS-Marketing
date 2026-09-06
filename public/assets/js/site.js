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
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      }
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
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
        track.scrollBy({ left: dir * Math.round(track.clientWidth * 0.8), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      });
    });
  });

  /* Contact composer: preview first, then explicit email or copy action. */
  var form = document.querySelector('[data-mail-form]');
  if (form) {
    var preview = form.querySelector('[data-email-preview]');
    var draft = form.querySelector('#email-draft');
    var status = form.querySelector('[data-form-status]');
    var interest = form.querySelector('[name="interest"]');
    if (new URLSearchParams(window.location.search).get('interest') === 'pricing') {
      interest.value = 'Pricing & plans';
    } else if (window.location.hash === '#demo') {
      interest.value = 'A product demo';
    }
    form.addEventListener('input', function (event) {
      if (event.target === draft) return;
      preview.hidden = true;
      status.textContent = '';
      event.target.setCustomValidity('');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.querySelectorAll('[required]').forEach(function (field) {
        field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
      });
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var get = function (key) { return (data.get(key) || '').toString().trim(); };
      var to = form.getAttribute('data-mail-to');
      var subject = 'Caspian ERP enquiry' + (get('interest') ? ' - ' + get('interest') : '');
      var body = [
        'Name: ' + get('name'), 'Work email: ' + get('email'),
        'Company: ' + get('company'), 'Team size: ' + get('size'),
        'Interested in: ' + get('interest'), '', get('message')
      ].join('\n');
      draft.value = 'To: ' + to + '\nSubject: ' + subject + '\n\n' + body;
      form.querySelector('[data-open-email]').href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      preview.hidden = false;
      status.textContent = 'Your draft is ready. Open your email app or copy it into webmail, then send it. Nothing has been sent yet.';
      draft.focus();
    });
    form.querySelector('[data-copy-email]').addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(draft.value);
        status.textContent = 'Copied. Paste the draft into your email service and send it to hello@caspianerp.com.';
      } catch (error) {
        draft.focus();
        draft.select();
        status.textContent = 'Copy the selected draft using your device’s copy command, then paste it into your email service.';
      }
    });
    form.classList.add('is-ready');
  }

  /* --------------------------------------------------------- footer year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
