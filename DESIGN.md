# Design System

Source of truth: `public/assets/css/site.css`. See also `README.md` for the file layout and
deploy notes.

This site is a **separate visual system from the CaspianOS application**. It shares the brand —
the same indigo primary, the same slate neutrals, the same lightning mark — but nothing else: no
Tailwind, no React, no shared classes, no shared components. Do not import application patterns
here, and do not copy marketing patterns (gradient hero text, dark grid sections, scroll reveal,
44px pill buttons) into the app. The app keeps its own `DESIGN.md` in
[CaspianOS-App](https://github.com/CaspianTools/CaspianOS-App).

> **This file is the single source of truth for this site's design.** Whenever you create or edit
> anything visual here, read it first and keep it in sync. Do not start a competing design doc.

### Why it is separate

The app is a dense, information-first tool optimised for people who use it all day. The marketing
site is a low-density, persuasion-first page optimised for someone who has never seen the product.
Same brand, different job. Keeping them apart means a change to app chrome can never break the
public site, and the site ships with no build step at all.

### Tokens (all defined as CSS custom properties on `:root`)

- **Brand:** `--indigo-600 #4f46e5` (primary, matches the app's `indigo-600`), `--indigo-500 #6366f1`,
  `--violet-500 #8b5cf6`, `--cyan-500 #06b6d4`. The three-stop gradient
  `indigo-600 → violet-500 → cyan-500` is the brand gradient — used for the hero's highlighted
  words (`.hero h1 .grad`), the logo mark, the announcement bar and the "Most popular" pricing pill.
  Nothing else uses it.
- **Neutrals:** the same slate ramp as the app (`--slate-50` … `--slate-900`), plus `--ink #0b1120`
  for dark sections and the footer.
- **Accents (status/category tints only):** `--emerald-500`, `--amber-500`, `--rose-500`, `--teal-500`.
- **Radii:** `--r-sm 8` / `--r-md 12` / `--r-lg 16` / `--r-xl 22` / `--r-pill`. Cards are `--r-lg`,
  buttons `--r-md` (`--btn-lg` 14px), the product mock `--r-xl`.
- **Shadows:** `--shadow-xs/sm/md/lg` plus `--shadow-brand` (the indigo glow under primary buttons).
- **Layout:** `--container 1200px`, `--gutter 24px`, `--nav-h 68px`.
- **Type:** Inter (Google Fonts) with a full system-font fallback stack. Headings use `clamp()` so
  every size is fluid; body is 16px/1.65.

### Structure

- **Sections** are `.section` (fluid 56–104px block padding) or `.section-tight`; `.section-soft`
  puts a section on `--slate-50`. Long pages alternate white / soft / dark so no two adjacent
  sections share a background.
- **Section headings** use `.section-head` (centred, max 720px) with an optional `.eyebrow` pill
  above the `<h2>` and a muted paragraph below.
- **Cards** are `.card` (+ `.card-pad`, + `.card-interactive` for the hover lift). Same idea as the
  app's card class, different implementation — the two are never shared.
- **Buttons** are `.btn` + one of `.btn-primary` (gradient + brand shadow), `.btn-secondary`
  (white + border), `.btn-ghost`, `.btn-dark`, `.btn-onDark`, `.btn-outline-onDark`, sized with
  `.btn-lg` / `.btn-sm` / `.btn-block`. Height is 44px (52px for `-lg`) — deliberately larger than
  the app's controls.
- **Dark sections** (`.dark-section`) sit on `--ink` with a radial indigo glow and a masked grid
  overlay; cards inside them are `.dark-card`, never `.card`.
- **Icons** are inline `<svg>` with `stroke-width="2"` in the Lucide idiom (the app uses the real
  `lucide-react` package; this site has no dependencies, so the paths are inlined). Icons in a
  tinted square use `.icon-tile` with a tint modifier (`.t-emerald`, `.t-cyan`, `.t-violet`,
  `.t-amber`, `.t-rose`, `.t-slate`, `.t-teal`), `.sm` for the 34px variant.

### Rules

- **JavaScript is an enhancement, never a requirement.** Every page must render, read and navigate
  with JS off. `public/assets/js/site.js` only adds the sticky-header shadow, the mobile drawer, the module
  filter tabs, scroll reveal, the mail-composing contact form and the footer year. Anything that
  hides content until JS runs (`.reveal`) **must** have a `<noscript>` override in the page head.
- **No inline icon lists inside a flex `<li>`.** `.check-list` and `.price-features` position their
  tick icon absolutely, because `display:flex` on the `<li>` turns an inline `<strong>` into its own
  flex item and shatters the sentence. Keep it that way.
- **Wide content scrolls inside its own container** (`.table-scroll`); the page body never scrolls
  horizontally.
- **One `<h1>` per page**, and a `.skip-link` before the header on every page.
- **No third-party scripts, trackers or cookies.** The only external request is the Inter webfont.
- **Claims must be true.** No invented customer logos, testimonials, certifications or metrics —
  the numbers in the stat band come from the actual module and tool count.
