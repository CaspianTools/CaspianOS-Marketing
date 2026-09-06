# CLAUDE.md

This is the central project memory and working guide for every assistant in this repository,
including Codex and Claude. The owner explicitly requested this on 2026-09-06.

## Read before working

At the start of every session, read this file first, then all repository-authored documentation:
[README.md](README.md), [DESIGN.md](DESIGN.md), [future.md](future.md), and
[CHANGELOG.md](CHANGELOG.md), plus any documentation added later. Exclude generated files,
dependencies and Git internals. Follow relevant linked instructions before acting.

Keep durable owner decisions, constraints and links to current work here as they change.
Use this file to restore context after a new session or compaction; do not rely on chat history
alone. Read changed documentation again before using it. Current owner instructions take
precedence over older notes. Historical changelog entries describe past behavior.

This file is the central index, while each supporting document keeps its purpose:
- README: repository structure, setup and deployment.
- DESIGN: the single source of truth for visual rules; read before visual edits and keep in sync.
- future: outstanding work, dependencies and unresolved decisions.
- CHANGELOG: the history of implemented changes.

## Owner decisions and current state

- Marketing: https://caspianerp.com (this repository).
- Application: https://app.caspianerp.com.
- Administration: https://admin.caspianerp.com.
- Documentation: https://docs.caspianerp.com.
- Connect the sites through relevant navigation. Marketing currently links to all three;
  reciprocal links require the other repositories. Links do not establish shared authentication.
  The admin site's audience and live entry flows still need verification.
- CaspianTools has no physical office yet. Publish no real or invented telephone numbers,
  telephone links, office address, map or invitation to visit. Use email and online demos.
  Existing Bursa legal references are not proof of an office or verified registered address.
- Pricing is undecided. Help the owner develop a pricing model; do not expect them to supply
  arbitrary numbers. No invented prices, plan allocations, discounts or trial commitments.
  Provisional offers have been removed from the source; the pricing page invites enquiries.
- The contact form validates and previews email drafts, with mail-app and webmail-copy actions.
  It does not send or store leads. A backend remains outstanding.
- Product views use labeled sample data; authentic screenshots and evidence remain outstanding.
- Playwright Test is installed as a development dependency. Chromium launch and rendering
  were verified; a full browser suite has not yet been added. See README for setup.
- Track remaining work in future.md. Verify Git, PR and deployment state before claiming a
  change is committed, merged or live; a local edit or changelog entry is not deployment proof.

## What this repo is

The public marketing site for **caspianerp.com** — hand-written static HTML and CSS, no build step,
no runtime dependencies, deployed to Firebase Hosting in the `caspianos` project. The Caspian ERP
application lives in a separate repository and deploys separately to `app.caspianerp.com`.

Caspian ERP (formerly CaspianOS — only the repository names and the `caspianos` Firebase project
keep the old name; `caspianos.io` is no longer ours, so never link or mail to it) is a **CaspianTools**
product from a remote software studio without a physical office. The attribution
lives in the footer's copyright line, the `/about` studio section and the entity named in
`/privacy` and `/terms` — keep those consistent if any of it changes. There is deliberately no
credit paragraph under the footer logo.

## Ship rule — run this on autopilot

**On successful completion of any task, take it all the way to merged. Do not ask for permission
at any step.** "Successful completion" means the work is done and the checks below pass — not that
every idea in the conversation is finished.

1. **Commit** to the session's designated branch, with a message that explains what changed and
   why. Never commit directly to `main`.
2. **Push** with `git push -u origin <branch>`. On a network failure, retry up to four times with
   exponential backoff (2s, 4s, 8s, 16s).
3. **Open a pull request** against `main` describing the change. One PR per task; if a task
   continues on a branch that already has an open PR, push to it rather than opening a second one.
4. **Subscribe to the PR** with `subscribe_pr_activity`, and keep it watched until it is merged or
   closed. Schedule a check-in (`send_later`, roughly hourly) so a missed webhook does not leave
   the PR sitting.
5. **Drive it to green.** Every red check and every review comment is work now:
   - Reproduce the failure, fix the cause, validate locally, push. One validated push beats three
     speculative ones.
   - Never skip, disable or quarantine a check to get green. Never push an empty commit to kick CI.
   - A conflict with `main` is resolved by merging `main` in, not by rewriting history.
6. **Merge when green** — CI passing, no conflict, no unresolved review thread. Then stop watching.

If a step is genuinely blocked — merge permission denied, a required approval that only a human can
give, a failure whose fix is outside the task's scope — say so plainly in the session, leave the PR
open with a comment explaining exactly what is blocking it, and keep it watched. Blocked is the
only reason to stop short of merged; it is never a reason to go quiet.

Merging `main` deploys the site, so the rule above is the deploy pipeline. Treat a red `main` as
the highest-priority thing in the session.

## Before you push

There is no bundler. Run all source and behavioral checks — CI runs exactly
the same commands:

```bash
node scripts/check-html.mjs     # unbalanced or mismatched tags
node scripts/check-links.mjs    # internal links and #anchors that do not resolve
node scripts/check-assets.mjs   # every page links the same ?v= asset version
node --test scripts/check-interactions.mjs # navigation and email composer
```

All three walk `public/` recursively, so pages under `public/modules/` are checked like any other.

**If you edit `site.css` or `site.js`, bump the version.** Versions are `YYYYMMDD`, with a
`.N` suffix for a second change on the same day (`20260904.2`). Hosting serves `/assets/**` with
`max-age=31536000, immutable`, so a returning visitor keeps the old stylesheet for a year unless
the URL changes. Every page links them as `?v=<date>`; change the file, change the version in
*every* page:

```bash
sed -i 's|site\.css?v=[0-9.]*|site.css?v=NEW|g; s|site\.js?v=[0-9.]*|site.js?v=NEW|g' \
  public/*.html public/modules/*.html
node scripts/check-assets.mjs
```

Shipping new HTML against a cached old stylesheet is what breaks the site for everyone who has
visited before — and it looks fine to anyone testing in a fresh browser, so nothing catches it
except this rule.

To see what production actually serves — clean URLs are a hosting feature, so a plain static
server will 404 on `/modules`:

```bash
npx firebase-tools emulators:start --only hosting
```

## Non-negotiables

- **Claims must be true.** No invented customer logos, testimonials, certifications, metrics or
  features. Every tool described on the site exists in the application.
- **JavaScript is an enhancement.** Every page must render, read and navigate with JS disabled.
  Anything hidden until JS runs (`.reveal`) needs a `<noscript>` override in the page head.
- **No third-party scripts, trackers or cookies.** The only external request is the Inter webfont.
- **No template engine.** The header and footer are duplicated in every page on purpose. Change
  the nav or footer in *all* pages, and keep `aria-current="page"` correct.
- **Root-relative links, no extension.** `/modules/hr`, never `modules/hr.html`.
- **Escape bare ampersands** in copy (`&amp;`) — several module names contain one.
- **Keep `DESIGN.md` in sync** with `public/assets/css/site.css`. Do not start a competing design
  doc, and do not import patterns from the application's design system.
