# Future Work

Features that were identified, scoped, and deferred. Each entry describes *what*, *why it matters*,
*why it was deferred*, and *how to approach it* when picked up.

---

### Connect marketing, application, administration and documentation
**Owner requirement (2026-09-06):** Connect `caspianerp.com`, `app.caspianerp.com`,
`admin.caspianerp.com` and `docs.caspianerp.com` into a coherent user journey. The confirmed
domain map and contact/pricing constraints are recorded in `README.md`.

**How to approach:**
1. Verify each site's navigation, app signup/login paths, documentation entry points, and
   intended audience for the administration site.
2. Add documentation links to marketing navigation/footer and relevant module pages, using
   verified destinations. Retain clear application entry links.
3. In the other repositories, add contextual documentation/help links from app and admin,
   and marketing/application return links from docs. Decide admin link placement after
   verifying who should use it.
4. Verify the complete journey on desktop, mobile, and with keyboard navigation. Treat any
   shared authentication requirement as separate work; links alone do not implement SSO.

**Status:** Marketing footer links to app, docs and admin are implemented; documentation is also linked from mobile navigation and page actions. Reciprocal links in the other repositories and live destination verification remain pending.

### Contact and company-location accuracy
**Owner clarification (2026-09-06):** There is no physical office yet. Publish no real or
invented phone numbers, telephone links, office address, map, or invitation to visit an office.
Use email and the contact/demo flow. Geographic references are not proof of an office or a
registered address. Review existing About and legal copy with that distinction; do not invent
or infer company registration details.

### Full registered address and counsel review of the legal pages
**What:** `public/privacy.html` and `public/terms.html` now name **CaspianTools, Bursa, Türkiye**
as the entity, with Turkish governing law and the courts of Bursa. What is still missing is a full
registered street address, a company registration number, and any review by a lawyer.

**Why it matters:** The pages are linked from the footer of every page. "Bursa, Türkiye" is enough
to identify the entity but is not a registered address, and unreviewed terms give no real
protection.

**Why deferred:** The full registered address and registration number were not supplied when the
rebrand was made, and inventing them would be worse than naming the entity and stopping there.

**How to approach:**
1. Replace `Bursa, T&uuml;rkiye` in both pages with the full registered address, and add the
   company registration number.
2. Have both pages reviewed by counsel — particularly the liability cap, the controller/processor
   split in the privacy policy, and the international-transfer paragraph. Confirm that Turkish
   governing law and the courts of Bursa are what you actually want, and check KVKK obligations
   alongside the GDPR language already in the privacy policy.
3. Update the "Last updated" date in both pages when the reviewed text lands.
4. If a DPA or sub-processor list is required by customers, add it as a fourth legal page and link
   it from the footer's Legal nav.

**Estimated effort:** 0.5 day plus legal review turnaround

### Develop the pricing model (placeholder offers removed)
**What:** `public/pricing.html` formerly published Starter $12 / Growth $29 per member per month and a
module split between the tiers. These numbers and the tier contents are a plausible starting point,
not a commercial decision.

**Why it matters:** Published prices set expectations and are quoted back at you in negotiations.

**Why deferred:** No pricing decision had been made when the site was built. On 2026-09-06,
the owner confirmed that they need help developing pricing and cannot supply prices yet.
The current prices, tier contents and limits must not be treated as approved terms.

**How to approach:**
1. Develop the offer with the owner: identify the initial buyer and use case, active users
   versus personnel records, expected hosting/support costs, onboarding effort, and whether
   charging per organization, active user, or package best fits the value delivered. Research
   comparable offers and validate willingness to pay before proposing actual prices.
2. Until that work is complete, replace provisional public prices and unconfirmed commercial
   promises with consistent pricing-on-request messaging and a contact/demo action. This replacement is implemented in the marketing source as of 2026-09-06; deployment is separate.
3. Once approved, update the three `.price-card` blocks, the `.compare-table` rows, and the "Who counts as a
   member?" FAQ answer — the three must agree.
4. Check metadata, home page FAQ, module pages, footer and `/modules` copy for anything that
   contradicts the offer. Confirm trial scope and duration separately; do not guess them.

**Estimated effort:** 0.5 day once the pricing is decided

### Server-side contact form (email composer improved)
**What:** The contact form now validates and previews an email draft, with explicit mail-app and copy-to-webmail actions plus a no-JS direct email fallback. It does not post or store leads,
because Firebase Hosting serves static files only.

**Why it matters:** A mail-client hand-off loses visitors who use webmail in another tab, and
nothing is captured if they abandon it. There is also no spam protection and no lead record.

**Why deferred:** A form endpoint needs a backend, and this repository deliberately has none.

**How to approach:**
1. Add a Cloud Function (or Cloud Run service) in the `caspianos` project, rate-limited, with a
   honeypot field and a strict CORS allowlist for `https://caspianerp.com`.
2. Point the form's `action` at it and progressively enhance with `fetch`, keeping the current
   `mailto:` path as the no-JS fallback.
3. Store submissions somewhere the sales side actually reads — a Firestore collection plus an email
   notification is enough to start.

**Estimated effort:** 1 day

### Real product screenshots on the module pages
**What:** Each page under `/modules/` carries a hand-built CSS mock of the application rather than
a screenshot, with plausible but invented row data (task names, PO numbers, KPI values).

**Why it matters:** A real screenshot is more persuasive than a stylised mock, and the mock has to
be updated by hand whenever the app's navigation changes.

**Why deferred:** Image files need a rasteriser and an asset pipeline this repository deliberately
does not have, and a stale screenshot ages worse than an abstract mock. The mock is marked up as
`role="img"` with a descriptive label, so it is honest about being a representation.

**How to approach:**
1. Capture each module at a consistent viewport with demo data — never a real customer's data.
2. Export as WebP with a PNG fallback, and add width/height so the page does not shift on load.
3. Replace the `.mock` block per page, keeping the surrounding `.mock-wrap` for the frame, and keep
   the descriptive `alt` text the mock's `aria-label` already provides.
4. Add a note to `DESIGN.md` about which app version the screenshots came from, so they can be
   refreshed as a set.

**Estimated effort:** 0.5 day plus capture time

### Resources section (blog, case studies, docs)
**What:** There is no `/blog`, `/customers` or public documentation.

**Why it matters:** Organic search for an ERP is won on content, and buyers ask for references.
The nav and footer currently have nowhere to put either.

**Why deferred:** Content, not code — there are no case studies to publish yet, and a blog with two
posts is worse than none. Deliberately excluded rather than stubbed out.

**How to approach:**
1. Decide whether posts are hand-written HTML (consistent with the rest of the site) or need a CMS.
   Below roughly 20 posts, hand-written pages sharing `assets/css/site.css` are enough.
2. Add `/resources` to the nav and footer, and an index page listing posts.
3. Case studies need real named customers and their written consent — never publish an anonymised
   composite as if it were one customer.

**Estimated effort:** 1 day for the shell, ongoing for content

### Translate the site
**What:** The application ships in five languages (en, fr, de, nb, tr); this site is English-only.

**Why it matters:** A Norwegian or Turkish buyer landing on an English-only site is a worse first
impression than the product deserves, given the app itself is localised.

**Why deferred:** The static site has no i18n mechanism, and translating marketing copy well is a
different job from translating UI strings.

**How to approach:**
1. Move the pages under `/{lang}/` paths (`/fr/modules`, …), keeping English at the root.
2. Add `<link rel="alternate" hreflang="…">` to every page and list all variants in `sitemap.xml`.
3. Add a language switcher to the footer; do **not** auto-redirect on `Accept-Language` — it breaks
   shared links and search-engine crawling.
4. Have marketing copy translated by a human, not machine-translated from the app's UI bundles.

**Estimated effort:** 1 day of plumbing plus translation turnaround

### Rasterised social/OG image and favicon fallbacks
**What:** The Open Graph image and favicon are SVG (`public/assets/img/og-image.svg`,
`favicon.svg`).

**Why it matters:** Several social platforms and older crawlers do not render SVG previews, so a
shared link may show no image at all. Some browsers also still prefer an `.ico`.

**Why deferred:** No rasteriser was available in the environment the site was built in.

**How to approach:**
1. Render `og-image.svg` to a 1200×630 PNG and point the `og:image` / `twitter:image` tags at it.
2. Export a 180×180 `apple-touch-icon.png` and a multi-size `favicon.ico`, and add the matching
   `<link>` tags alongside the existing SVG favicon.
3. Validate with a link-preview debugger before announcing the site anywhere.

**Estimated effort:** 2 hours
