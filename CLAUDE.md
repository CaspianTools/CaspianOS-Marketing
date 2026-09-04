# CLAUDE.md

Working notes for Claude in this repository. `README.md` covers the file layout and deploy
mechanics; `DESIGN.md` is the single source of truth for the design system. Read both before
editing anything visual.

## What this repo is

The public marketing site for **caspianos.io** — hand-written static HTML and CSS, no build step,
no dependencies, deployed to Firebase Hosting in the `caspianos` project. The CaspianOS
application lives in a separate repository and deploys separately to `app.caspianos.io`.

CaspianOS is a **CaspianTools** product (a software studio in Bursa, Türkiye). The attribution
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

There is no bundler, so these three scripts are the entire build gate. Run all of them — CI runs exactly
the same commands:

```bash
node scripts/check-html.mjs     # unbalanced or mismatched tags
node scripts/check-links.mjs    # internal links and #anchors that do not resolve
node scripts/check-assets.mjs   # every page links the same ?v= asset version
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
