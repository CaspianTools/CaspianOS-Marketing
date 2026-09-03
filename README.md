# CaspianOS Marketing Site

The public marketing site for **[caspianos.io](https://caspianos.io)** — static HTML and CSS,
deployed to **Firebase Hosting** in the **`caspianos`** Firebase project.

This repository is *only* the marketing site. The CaspianOS application lives in
[CaspianTools/CaspianOS-App](https://github.com/CaspianTools/CaspianOS-App) and is deployed
separately to `app.caspianos.io` — different repo, different Firebase project, no shared code.
Every call to action here links to `https://app.caspianos.io`.

## Layout

```
├── firebase.json           Hosting config: clean URLs, caching, security headers
├── .firebaserc             Pins deploys to the `caspianos` Firebase project
├── public/                 Everything served
│   ├── index.html          Home
│   ├── modules.html        Module directory (anchors: #hr, #hseq, … #admin)
│   ├── industries.html     Industry positioning
│   ├── security.html       Security & access control
│   ├── pricing.html        Plans, comparison table, pricing FAQ
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
│   └── check-links.mjs     Fails on broken internal links and anchors
└── DESIGN.md               Single source of truth for the design system
```

## No build step

There is no bundler, framework, or npm dependency. Edit the HTML and CSS directly; what is in
`public/` is exactly what is served. Node is used only for the two check scripts in CI.

## Conventions

- **`DESIGN.md` is the single source of truth** for tokens, components and layout rules. Keep it in
  sync with `public/assets/css/site.css`; do not scatter design conventions elsewhere.
- **Clean URLs.** Hosting serves `/modules`, not `/modules.html` — link without the extension.
  `check-links.mjs` enforces that every such link resolves.
- **The header and footer are duplicated in every page.** There is no template engine on purpose.
  Change the nav or footer in *all* pages, and keep `aria-current="page"` on the current page's link.
- **JavaScript is optional.** Every page must render, read and navigate with JS disabled.
  `site.js` only adds the sticky-header shadow, the mobile drawer, the module filter tabs, scroll
  reveal, the mail-composing contact form and the footer year. Anything that hides content until JS
  runs (`.reveal`) must have a `<noscript>` override in the page head.
- **No third-party scripts, trackers or cookies.** The only external request is the Inter webfont.
- **Claims must be true.** No invented customer logos, testimonials, certifications or metrics.

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

`public/privacy.html` and `public/terms.html` carry `[Legal entity name]`, `[registered address]`
and `[jurisdiction]` placeholders and have not been reviewed by counsel. The pricing on
`public/pricing.html` is a placeholder, not a commercial decision. Both are tracked in
[future.md](future.md).
