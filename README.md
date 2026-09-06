# Caspian ERP Marketing Site

The public marketing site for **[caspianerp.com](https://caspianerp.com)** — static HTML and CSS,
deployed to **Firebase Hosting** in the **`caspianos`** Firebase project.

This repository is *only* the marketing site. The Caspian ERP application lives in
[CaspianTools/CaspianOS-App](https://github.com/CaspianTools/CaspianOS-App) and is deployed
separately to `app.caspianerp.com` — different repo, different Firebase project, no shared code.
Product entry calls to action link to `https://app.caspianerp.com`; demo and sales
enquiries link to `/contact#demo`.

## Owner decisions and connected sites (2026-09-06)

[CLAUDE.md](CLAUDE.md) is the central project memory and working guide for all assistants.
Read it first, then the repository documentation it indexes.

These owner-provided facts take precedence over older assumptions in this repository.

| Site | Role |
| --- | --- |
| `https://caspianerp.com` | Public ERP marketing site (this repository) |
| `https://app.caspianerp.com` | ERP application |
| `https://admin.caspianerp.com` | Administration site; intended audience and access flow still need verification |
| `https://docs.caspianerp.com` | Documentation site |

**Connection requirement:** Make these sites a coherent journey. Marketing should link to
the application and documentation. The application and administration site should provide
relevant documentation/help links, and documentation should link back to marketing and the
application. Verify the administration site's audience before choosing its public navigation
placement. Cross-site links do not imply shared authentication or single sign-on. Changes to
the other sites require their own repositories; their code is not present here. Track delivery
in `future.md`.

**Contact and location:** There is no physical office yet. Do not publish real phone numbers,
invent placeholder phone numbers, add `tel:` links, or ask visitors to call or visit an office.
Use email and the contact/demo journey. Existing Bursa references must not be presented as
an office or a verified registered address; confirm entity details separately before updating
legal identity information.

**Pricing:** Pricing has not been decided. The owner needs help developing the model, not
just entering numbers. Existing prices, plan limits, and module allocations are placeholders,
not approved commercial terms. Do not invent replacement prices, discounts, trial durations,
or billing commitments. The public pricing page now uses pricing-on-request messaging. Next comes a pricing discovery exercise before rates or trial terms are published.

## Layout

```
├── firebase.json           Hosting config: clean URLs, caching, security headers
├── .firebaserc             Pins deploys to the `caspianos` Firebase project
├── public/                 Everything served
│   ├── index.html          Home
│   ├── modules.html        Module directory — a card per module, linking to its page
│   ├── modules/            One landing page per module (12 pages)
│   │   ├── hr.html         /modules/hr  · Human Resources
│   │   ├── hseq.html       /modules/hseq
│   │   ├── business.html   /modules/business
│   │   ├── efficiency.html /modules/efficiency
│   │   ├── procurement.html
│   │   ├── manufacturing.html
│   │   ├── crm.html
│   │   ├── inventory.html
│   │   ├── logistics.html  Vehicles, journeys and inter-site transfers
│   │   ├── maintenance.html
│   │   ├── finance.html
│   │   └── administration.html   The configuration story; included with every plan
│   ├── industries.html     Industry positioning
│   ├── security.html       Security & access control
│   ├── pricing.html        Pricing enquiry and FAQ
│   ├── about.html          Company
│   ├── contact.html        Contact + book a demo (#demo)
│   ├── privacy.html        Privacy policy
│   ├── terms.html          Terms of service
│   ├── 404.html            Not-found page
│   ├── robots.txt
│   ├── sitemap.xml
│   └── assets/
│       ├── css/site.css    The whole design system, one file
│       ├── js/site.js      Progressive enhancement only
│       └── img/            logo-mark.svg · favicon.svg · og-image.svg
├── scripts/
│   ├── check-html.mjs      Fails on unbalanced tags
│   ├── check-links.mjs     Fails on broken internal links and anchors
│   └── check-assets.mjs    Fails when pages disagree on the ?v= asset version
└── DESIGN.md               Single source of truth for the design system
```

## No build step

There is no bundler, frontend framework, or runtime npm dependency. Edit the HTML and CSS directly; what is in
`public/` is exactly what is served. Node runs the validation scripts; Playwright is a development dependency for browser testing.

## Conventions

- **`DESIGN.md` is the single source of truth** for tokens, components and layout rules. Keep it in
  sync with `public/assets/css/site.css`; do not scatter design conventions elsewhere.
- **Clean URLs.** Hosting serves `/modules`, not `/modules.html` — link without the extension.
  The same applies one level down: `/modules/hr` is served from `public/modules/hr.html`.
  `check-links.mjs` enforces that every such link resolves, and both check scripts walk
  subdirectories, so the module pages are validated like any other page.
- **One page per module.** `/modules` is a directory of cards; each card links to a full landing
  page under `/modules/<slug>`. The old in-page anchors (`/modules#hr`, `/modules#fleet`) still
  resolve, because the hub cards keep those ids. Fleet is presented as part of **Logistics**.
- **Assets are versioned, because they are cached for a year.** Hosting serves `/assets/**` with
  `max-age=31536000, immutable`, so every page links the stylesheet and script as
  `?v=<date>`. Edit `site.css` or `site.js` and you must bump that version in *every* page —
  otherwise returning visitors keep the old stylesheet and the new HTML renders unstyled.
  `check-assets.mjs` fails the build when pages disagree.
- **The header and footer are duplicated in every page.** There is no template engine on purpose.
  Change the nav or footer in *all* pages, and keep `aria-current="page"` on the current page's link.
- **JavaScript is optional.** Every page must render, read and navigate with JS disabled.
  `site.js` only adds the `html.js` marker, the sticky-header shadow, the mobile drawer, the module
  filter tabs, scroll reveal, the scroller arrows, the mail-composing contact form and the footer year. Anything that hides content until JS
  runs (`.reveal`) must have a `<noscript>` override in the page head.
- **No third-party scripts, trackers or cookies.** The only external request is the Inter webfont.
- **Claims must be true.** No invented customer logos, testimonials, certifications or metrics.
- **Caspian ERP is a CaspianTools product.** The footer of every page carries the credit and links to
  `caspiantools.com`; `/about` explains the studio; `/privacy` and `/terms` name CaspianTools,
  Bursa, Türkiye as the entity. Keep those consistent if any of it changes.

## Local preview

```bash
npx firebase-tools emulators:start --only hosting
```

Clean URLs are a hosting feature, so a plain static server (`npx serve public`) will 404 on
`/modules`. Use the emulator to see exactly what production serves.

Run the checks the same way CI does:

```bash
node scripts/check-html.mjs
node scripts/check-links.mjs
node scripts/check-assets.mjs
```

## Deploy

Every push to `main` deploys via `.github/workflows/deploy.yml`. It needs a
`FIREBASE_SERVICE_ACCOUNT_MARKETING` repository secret — a service-account JSON key from the
**`caspianos`** Firebase project with the **Firebase Hosting Admin** role
(Settings → Secrets and variables → Actions). Without the secret the deploy job skips with a
warning instead of failing. The workflow can also be run manually (Actions → Deploy → Run workflow).

By hand:

```bash
npx firebase-tools login
npx firebase-tools deploy --only hosting --project caspianos
```

The custom domain is attached once in the Firebase console (`caspianos` project → Hosting → Add
custom domain), not from this repo.

## Before launch

`public/privacy.html` and `public/terms.html` now name **CaspianTools, Bursa, Türkiye** and Turkish
governing law, but they still lack a full registered address and a company registration number, and
they have not been reviewed by counsel. The pricing page now uses an enquiry flow until the commercial model is established. Both are tracked in [future.md](future.md).

Behavioral checks for navigation and the email composer: `node --test scripts/check-interactions.mjs`.

## Browser testing with Playwright

Install development dependencies with `npm ci`, then download Chromium with
`npx playwright install chromium`. Playwright Test is available through
`npm run test:browser` (browser test files must be added before running a test suite).
Generated browser reports and `node_modules/` are ignored by Git.
