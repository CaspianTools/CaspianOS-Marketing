# Future Work

Features that were identified, scoped, and deferred. Each entry describes *what*, *why it matters*,
*why it was deferred*, and *how to approach it* when picked up.

---

### Real legal entity and jurisdiction in the legal pages
**What:** `public/privacy.html` and `public/terms.html` ship with `[Legal entity name]`,
`[registered address]` and `[jurisdiction]` placeholders, and have not been reviewed by a lawyer.

**Why it matters:** The pages are linked from the footer of every page. Publishing them with
placeholders is visibly unfinished, and unreviewed terms give no real protection.

**Why deferred:** The company's registered entity, address and governing law were not available
when the site was written, and inventing them would have been worse than leaving a marked gap.

**How to approach:**
1. Replace the three placeholders in both pages (search for `[Legal entity name]`).
2. Have both pages reviewed by counsel — particularly the liability cap, the controller/processor
   split in the privacy policy, and the international-transfer paragraph.
3. Update the "Last updated" date in both pages when the reviewed text lands.
4. If a DPA or sub-processor list is required by customers, add it as a fourth legal page and link
   it from the footer's Legal nav.

**Estimated effort:** 0.5 day plus legal review turnaround

### Confirm or replace the placeholder pricing
**What:** `public/pricing.html` publishes Starter $12 / Growth $29 per member per month and a
module split between the tiers. These numbers and the tier contents are a plausible starting point,
not a commercial decision.

**Why it matters:** Published prices set expectations and are quoted back at you in negotiations.

**Why deferred:** No pricing decision had been made when the site was built.

**How to approach:**
1. Decide the real tiers, prices, member caps and which modules each tier includes.
2. Update the three `.price-card` blocks, the `.compare-table` rows, and the "Who counts as a
   member?" FAQ answer — the three must agree.
3. Check the home page FAQ and `/modules` copy for anything that contradicts the new tiers.

**Estimated effort:** 0.5 day once the pricing is decided

### Server-side contact form
**What:** The contact form composes a pre-filled `mailto:` link instead of posting anywhere,
because Firebase Hosting serves static files only.

**Why it matters:** A mail-client hand-off loses visitors who use webmail in another tab, and
nothing is captured if they abandon it. There is also no spam protection and no lead record.

**Why deferred:** A form endpoint needs a backend, and this repository deliberately has none.

**How to approach:**
1. Add a Cloud Function (or Cloud Run service) in the `caspianos` project, rate-limited, with a
   honeypot field and a strict CORS allowlist for `https://caspianos.io`.
2. Point the form's `action` at it and progressively enhance with `fetch`, keeping the current
   `mailto:` path as the no-JS fallback.
3. Store submissions somewhere the sales side actually reads — a Firestore collection plus an email
   notification is enough to start.

**Estimated effort:** 1 day

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
