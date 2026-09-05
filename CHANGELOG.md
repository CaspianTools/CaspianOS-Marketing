# Changelog

All notable changes to the Caspian ERP marketing site are documented in this file.

## [Unreleased]

### Changed
- **Rebranded from CaspianOS to Caspian ERP.** The wordmark, every page title, the copy, the
  Open Graph image, the sitemap and the canonical URLs now say Caspian ERP and `caspianerp.com`.
  The application domain (`app.caspianos.io`), the mailboxes (`hello@`, `support@`, `security@`,
  `privacy@caspianos.io`), the repository names and the `caspianos` Firebase project are
  unchanged.
- **Flat header.** The navigation is a transparent bar on the same ground as the hero, with no
  pill, border or shadow at rest; once the page scrolls it takes a translucent white ground and a
  hairline so it stays legible over dark sections.
- **The home hero lost its ink frame.** It is a flat `--paper` block that extends up behind the
  header, with the module ticker along its bottom edge.
- **Redesigned every page around a framed, editorial layout** (merged as #5): pill buttons, flat
  large-radius cards, inset rounded dark sections, warm cream soft sections, an editorial accordion,
  a dark rounded footer carrying the closing call to action, and a rebuilt home page.
- **Asset version bumped to `20260905.2`.**

## Header and footer chrome

### Changed
- **Removed the Company link from the header nav**, on all 22 pages and in the mobile drawer, so
  the two stay consistent. `/about` is still reachable from the footer's Company column.
- **Header links are centred.** `.nav` is now a three-track grid (`1fr auto 1fr`) with each item
  naming its column: brand left, links centre, actions right. The explicit `grid-column` matters —
  below 980px `.nav-links` is `display: none` and stops being a grid item, so without it the
  actions slid into the middle track instead of staying at the right edge.
- **Removed the tagline and the CaspianTools credit paragraph from under the footer logo.** The
  brand column now holds the logo alone, so `.footer-grid` is five equal columns rather than
  `1.6fr repeat(4, 1fr)`, and the dead `.footer-brand p` and `.footer-by` rules are gone.
  Attribution remains in the footer copyright line, on `/about` and in the legal pages.
- **Asset version bumped to `20260904.2`** for the stylesheet change. Versions now take an optional
  `.N` suffix for a second change on the same day; the documented `sed` in `CLAUDE.md`,
  `README.md` and `DESIGN.md` was widened from `[0-9]*` to `[0-9.]*` so it cannot corrupt one.

## Stale-CSS fix, motion and elevation

### Fixed
- **Returning visitors were being served a year-old stylesheet.** `firebase.json` caches
  `/assets/**` as `max-age=31536000, immutable`, and `site.css` never changes filename — so any
  browser that had visited before kept the pre-`/modules` CSS and rendered the new pages against
  it. The most visible symptom was the breadcrumb separator blowing up to a full-width chevron,
  because `.breadcrumb svg` did not exist in the cached copy. Every page now links
  `site.css` and `site.js` with a `?v=` version, and `scripts/check-assets.mjs` fails the build
  when pages disagree on it. Documented in `README.md`, `DESIGN.md` and `CLAUDE.md`.
- **`check-links.mjs` now strips query strings** before resolving a path, so a versioned asset
  URL is checked against the file on disk.

### Added
- **Motion and elevation across every page** (§20 of `site.css`):
  - Resting shadow plus a hover lift on `.card`, `.panel`, `.industry-card`, `.price-card`,
    `.stat` and `.flow-step` — `translateY(-3px)` to `--shadow-md`, with `.card-interactive` and
    the featured price card going to `-5px` and `--shadow-lg`.
  - Icon tiles nudge and scale when their card is hovered; buttons press on `:active`; the
    primary button deepens its brand glow; the app mock deepens its shadow.
  - A pure-CSS hero entrance (`caspian-rise`, staggered 0.02s–0.31s) that runs with JavaScript
    disabled, and a slide-in for the FAQ answer.
  - Staggered `.reveal` for grid siblings, 0.06s apart, capped from the seventh card.
  - `prefers-reduced-motion` now zeroes animation and transition *delays* as well as durations —
    zeroing only the duration left a staggered card blank for a third of a second.
- **`.reveal` on the cards that were missing it** across 18 pages, so the entrance animation is
  consistent rather than applying to whichever cards happened to be marked up first.
- **`scripts/check-assets.mjs`**, wired into the CI workflow alongside the HTML and link checks.

## Module pages and the CaspianTools rebrand

### Added
- **A landing page for every module** — twelve pages under `/modules/`: `hr`, `hseq`, `business`,
  `efficiency`, `procurement`, `manufacturing`, `crm`, `inventory`, `logistics`, `maintenance`,
  `finance` and `administration`. Each one runs the same section order — hero, an app mock built
  from the existing `.mock-*` components, the problem, what it does, a process flow, every tool
  with a one-line description, how it connects to three other modules, who uses it, what an
  administrator can configure, an FAQ and a CTA band. Copy is written for energy and oil & gas
  contractors first.
- **`.breadcrumb`, `.footer-by` and a dark-section `.link-arrow` colour** in `site.css`, documented
  in `DESIGN.md`.

### Changed
- **`/modules` is now a hub**, not a long-form directory: a card per module linking to its own
  page. The previous in-page anchors (`#hr` … `#admin`, including `#fleet`) are kept on the cards,
  so existing links still resolve.
- **Fleet is presented as Logistics.** `/modules/logistics` covers vehicles, journey management and
  the inter-site transfer orders it shares with Inventory; vehicle servicing stays in Maintenance,
  because a vehicle is an asset. `index.html` and `pricing.html` updated to match.
- **Administration is framed as the customization story** rather than a list of settings — module
  and tool switches, roles built from individual permissions, and the limits stated honestly.
- **Every module card on the home page now links to its page**, and the remaining "New" badges were
  dropped: every tool in the app's navigation is presented as available.
- **The site is branded as a CaspianTools product.** Footer credit and a `caspiantools.com` link on
  every page, a "CaspianOS is built by CaspianTools" section on `/about` (a software studio in
  Bursa, Türkiye), and `privacy.html` / `terms.html` now name CaspianTools, Bursa, Türkiye as the
  entity with Turkish governing law — replacing the `[Legal entity name]`, `[registered address]`
  and `[jurisdiction]` placeholders.
- **`scripts/check-html.mjs` and `scripts/check-links.mjs` walk subdirectories**, so the twelve new
  pages are validated in CI like every other page.
- **`sitemap.xml`** lists the twelve module pages.

## Initial release

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
