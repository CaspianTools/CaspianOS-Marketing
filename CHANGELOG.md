# Changelog

All notable changes to the CaspianOS marketing site are documented in this file.

## [Unreleased]

### Added
- **The site itself** — ten static pages served from `public/`: home, module directory
  (`/modules`, anchored per department), industries, security & access control, pricing
  (plans + comparison table + FAQ), company, contact / book-a-demo, privacy policy, terms of
  service and a 404 page, plus `robots.txt` and `sitemap.xml`.
- **No build step and no dependencies.** One hand-written stylesheet
  (`public/assets/css/site.css`) carries the whole design system; `public/assets/js/site.js` is
  progressive enhancement only (sticky-header shadow, mobile drawer, module filter tabs, scroll
  reveal, footer year, and a contact form that composes a pre-filled `mailto:` because static
  hosting has no backend). Every page renders and navigates with JavaScript disabled — `.reveal`
  has a `<noscript>` override so nothing can stay invisible.
- **Every call to action points at `https://app.caspianos.io`** — sign in, sign up and free trial
  all land on the application.
- **Content drawn from the real product:** the eleven departments and their tool lists mirror the
  application's department configuration, and the security page describes the actual permission
  model (tenant isolation, permission-based RBAC enforced in the Firestore rules, verified
  invitations, platform-owned billing fields, audit log). No invented customer logos,
  testimonials, certifications or metrics.
- **SEO/social:** per-page title, meta description, canonical URL and Open Graph/Twitter tags, an
  SVG OG image, and a sitemap.
- **Accessibility:** skip link, one `<h1>` per page, labelled form controls, `aria-current` on the
  active nav item, table captions, and a `prefers-reduced-motion` bypass for every animation.
- **`firebase.json` + `.firebaserc`** — Firebase Hosting in the `caspianos` project, with clean
  URLs (`/modules`, not `/modules.html`), `404.html` as the not-found page, immutable caching for
  `assets/**`, `must-revalidate` for HTML, and security headers (CSP, HSTS,
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
- **`.github/workflows/deploy.yml`** — validates the configs, checks HTML tag balance and internal
  links on every push and pull request, then deploys to Firebase Hosting on `main`. Uses a
  `FIREBASE_SERVICE_ACCOUNT_MARKETING` secret (service account from the `caspianos` project with
  the **Firebase Hosting Admin** role); a missing secret makes the deploy job **skip with a
  warning** rather than fail. `workflow_dispatch` allows a manual re-run without a code push.
- **`scripts/check-html.mjs` and `scripts/check-links.mjs`** — the whole build gate for a site with
  no bundler: unbalanced tags and links to pages or anchors that do not exist both fail CI.
- **`DESIGN.md`** — the single source of truth for this site's design system, and why it is kept
  deliberately separate from the application's.

### Notes
- This site previously lived under `marketing/` in
  [CaspianOS-App](https://github.com/CaspianTools/CaspianOS-App); it was moved here so the public
  site and the application deploy independently, from separate repositories and separate Firebase
  projects.
