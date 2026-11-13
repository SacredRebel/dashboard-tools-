# Devin prompt: build the dashboard gallery from screenshots

Paste everything below the line into a new Devin session that has this repository checked out. Put the reference images in `inputs/dashboards/` first (see "Before you start" at the bottom).

---

## Who you are and what you're doing

You are adding **new dashboards to the Dashboard Tools gallery** in the repo `SacredRebel/dashboard-tools-`. Each reference screenshot in `inputs/dashboards/` becomes **one complete, working, themeable dashboard** in `site/dashboards/<id>/`, plus one entry in `catalog/dashboards.json`. The site's **Dashboards** page and AI agents read that catalog to choose a dashboard style by **style family** and **use case**.

The first dashboard is already done and is your **gold standard**: `horizon-weather` (dashboard #1, recreated from a cinematic weather screenshot). Match its structure, code quality, checks and catalog detail for every new one.

## Read these first, in this order (don't skip)

1. `AGENTS.md`: the repo's operating rules (tokens only, four states, no polling, replace-don't-fork, evidence before claims).
2. `docs/dashboards/README.md`: what the gallery is, style families, rules every dashboard follows.
3. `docs/dashboards/01-add-a-dashboard.md`: **the exact step-by-step workflow you must follow for every image.** This prompt summarizes it; that file is authoritative.
4. The gold standard, all three files: `site/dashboards/horizon-weather/index.html`, `style.css`, `app.js`, and its entry in `catalog/dashboards.json`.
5. `site/dashboards/_shared/base.css` and `_shared/frame.js` (shared by all dashboards; don't change them).
6. `docs/design/02-rulebook.md` (skim: spacing, type, color, states, accessibility).
7. `catalog/tools.json` → category `design-to-code` (screenshot-to-code, ScreenCoder, Design2Code, agent-vision-toolkit, draw-ui, CodeImage) and `dashboard-gallery`.

## Setup (once)

```bash
git checkout main && git pull
git checkout -b devin/dashboard-gallery
node --version                      # must be >= 18
npm install --no-save playwright    # --no-save: do NOT add package.json / lockfile
npx playwright install chromium
node scripts/build.mjs              # must print ✔ … 1 gallery dashboards …
node scripts/dashboards-check.mjs horizon-weather   # must print ✔ horizon-weather: 4 renders clean
```

If either check fails before you've changed anything, stop and report the output.

Optional: run **screenshot-to-code** locally (`git clone https://github.com/abi/screenshot-to-code`, `docker compose up`, needs your own OpenAI/Anthropic/Gemini key) to get a rough HTML draft of a screenshot. Use it **only as a structural sketch**. Its output hard-codes colors and sizes and must be rebuilt in our format. Don't commit anything it produces directly, and never commit that tool's repo.

## The loop: do this for every image, in filename order

Images are in `inputs/dashboards/` (gitignored, **never commit them**). Skip `01-*` (that's Horizon Weather, already built). For each image:

### Step 1: Analyse (write it down before coding)
Answer the 9 questions in `01-add-a-dashboard.md` §1:
1. domain and job
2. style family and mode
3. grid in px at 1440 wide
4. palette hex (5–8 colors)
5. Google Fonts match for display and body
6. full component list
7. signature detail
8. replacement plan for every photo or illustration
9. three variants

Keep these notes. They go in the commit body.

### Step 2: Name it
- `number` = next free integer in the catalog. `id` = `<brandname>-<domain>` in kebab-case (e.g. `ledger-finance`).
- **Invent a new brand name.** Never reuse logo text, brand names or product names visible in the screenshot.

### Step 3: Build `site/dashboards/<id>/`
Create `index.html`, `style.css` and `app.js` following the skeleton and rules in `01-add-a-dashboard.md` §2, the same way `horizon-weather` does:
- **index.html:** viewport meta, Google Fonts link, `../_shared/base.css`, `style.css`, `../_shared/frame.js` in `<head>`, `app.js` at the end. Semantic landmarks (`aside`/`nav`, `header`, `main`, `section` + `aria-labelledby`). A visible `Sample data · fictional` label (`class="db-sample"`).
- **style.css:**
  - `:root` defines at least `--bg --surface --surface-2 --border --text --text-muted --text-subtle --accent --accent-fg --accent-soft --focus --chart-1 --font-display --font-sans --radius-sm --radius-md --radius-lg`, plus extras the design needs.
  - Then exactly one `[data-variant="<id>"]` block per extra variant, **overriding tokens only**.
  - Components use `var(--…)` only (no raw hex outside the token blocks).
  - All classes start with a unique 2–3 letter prefix.
  - Breakpoints around 1180 / 960 / 640px. Sidebars become top bars, grids go to one column, and horizontal strips scroll inside their own container (never the page).
- **app.js:**
  - Use an IIFE.
  - Fictional data only: invented people and companies, 555 phone numbers, dates relative to today. Real city names are OK.
  - Inline SVG icons (Lucide style, `currentColor`).
  - Charts are hand-built SVG with HTML labels positioned over them (copy the approach of `renderChart` in horizon-weather). Hover **and** keyboard focus show values, and each chart has an `aria-label` summary.
  - Interactive where the design implies it: tabs, segmented controls, selectable rows or cards update related panels. Every control does something.
  - No network calls, no data timers. Any animation pauses offscreen via `DB.onVisible`.
- **Images:** recreate photos and illustrations as **code-drawn SVG/CSS** (gradients, shapes, silhouettes), as Horizon does with its sunset landscape. Only if impossible, use a photo whose license allows reuse (Unsplash or Pexels license), save it into the folder (max 300 KB, `.jpg`/`.webp`) and credit it in the catalog `source.note`. Never hotlink. Never copy the screenshot's own images, logos or icons.
- **Variants:** 3 total (`default` + 2). Make at least one noticeably different, such as a light version of a dark design, a different accent, or a seasonal palette.

### Step 4: Compare with the reference
Open `site/dashboards/<id>/index.html` in Chromium at 1440×900 and screenshot it. Put it next to the reference and iterate until layout, proportions, density, palette, typography and the signature detail read as **the same style at the same polish level**. Pixel-perfect is not required. A generic-looking result is a failure: redo it.

### Step 5: Catalog entry
Append to `dashboards` in `catalog/dashboards.json`, copying the `horizon-weather` entry as a template. Fill **every** field as described in the table in `01-add-a-dashboard.md` §4. In particular:
- `palette` hex must match `style.css` `:root`, and `maps_to_theme` must be the closest id from `design-system/themes.json`.
- `source.note` says what you replaced, e.g. "Recreated in original code from a user-supplied reference screenshot; brand renamed, photos replaced with SVG illustration".
- If no style family fits, add one to `style_families` (id, name, blurb). Add a use case only if none of the 18 fits.

### Step 6: Validate and thumbnail
```bash
node scripts/build.mjs                       # fix every error it prints
node scripts/dashboards-check.mjs <id>       # renders 1440, 375, each variant; writes thumb.jpg + evidence
node scripts/build.mjs                       # again, after thumb.jpg exists
```
Then **open `site/dashboards/<id>/thumb.jpg` and look at it**. It's the gallery card. If it looks empty, broken or cut off at the top, fix the dashboard.

### Step 7: Check it in the gallery
`npx serve site` (or open `site/index.html`). Go to `#/dashboards`:
- the card appears in the right style group
- the search and filters find it
- `#/dashboards/<id>` previews it in Desktop, Tablet and Phone
- every variant button switches the preview
- no console errors

### Step 8: Log, commit and push (one dashboard per commit)
First add this dashboard's row to the batch log (format below). Then:
```bash
git add site/dashboards/<id> catalog/dashboards.json docs/dashboards/catalog.md site/data/data.js docs/validation/dashboards/<id>.json docs/validation/dashboards/_batch-log.md
git status          # confirm NOTHING from inputs/ and no node_modules, package.json or lockfile changes
git commit -m "Add dashboard <number>: <Name> (<style family>, <use case>)" -m "<your step-1 analysis>"
git push -u origin devin/dashboard-gallery
```
Pushing the branch gives a Vercel preview URL automatically.

### Batch log format
Keep `docs/validation/dashboards/_batch-log.md` (create it on the first dashboard) as a table with one row per image:

| Image file | # | id | Name | Style family | Use cases | Mode | Status | Notes (what was hard, what you replaced) |

Status is `done`, `skipped (reason)` or `needs review (reason)`.

## Hard rules (breaking any of these = redo)

1. **Never commit anything from `inputs/`.** Never commit reference images or screenshots of them.
2. **Original work:** new brand names, no copied logos, photos, icons or marketing copy. Write your own short copy in the same tone.
3. **Only touch these paths:**
   - `site/dashboards/<new-id>/`
   - `catalog/dashboards.json`
   - generated files: `docs/dashboards/catalog.md`, `site/data/data.js`, `docs/validation/dashboards/*`
   - the batch log

   Do **not** edit `site/assets/*`, `_shared/*`, `scripts/*`, other dashboards, `tools.json`, `AGENTS.md` or docs. If you believe one of those needs a change, write it under "Proposed changes" in the PR description instead.
4. **No frameworks, no build step, no npm dependencies, no CDNs** except Google Fonts. Plain HTML/CSS/JS.
5. **Never edit generated files by hand.** `docs/dashboards/catalog.md` and `site/data/data.js` come from `node scripts/build.mjs`.
6. **Quality gates per dashboard:**
   - `build.mjs` passes and `dashboards-check.mjs <id>` passes (no console errors, no horizontal overflow at 375 or 1440, every variant renders)
   - body text ≥ 14px, labels ≥ 12px, tap targets ≥ 44px on phone
   - visible focus on every control
   - text contrast ≥ 4.5:1 in every variant (check muted text on surfaces in light variants especially)
7. **One dashboard per commit**, pushed right after it passes. Don't batch ten into one commit.
8. **No `main` pushes.** Work only on `devin/dashboard-gallery`. Don't merge, don't force-push.
9. If an image isn't a dashboard (a landing page, a mobile app home), still build it if it's dashboard-like, choosing the nearest `layout.pattern`. Otherwise mark it `skipped` in the log with the reason.
10. If two images are near-identical in style, build both, but make them clearly different dashboards (different domain, layout emphasis or variants), and say so in the log.

## When you're finished

1. Run the full check for everything:
   ```bash
   node scripts/build.mjs
   node scripts/dashboards-check.mjs
   node scripts/screenshot.mjs
   ```
   All three must pass.
2. Open a pull request from `devin/dashboard-gallery` to `main` titled `Dashboard gallery: add N dashboards`. In the body put:
   - the batch-log table
   - the Vercel preview URL of the latest push
   - a list of anything skipped or uncertain
   - "Proposed changes" for shared files, if any
3. Don't merge it. The repo owner and Claude will review and test it.

## Before you start (for the human)

- Put the images in `inputs/dashboards/` at the repo root, named in order with a short hint: `02-finance-dark.jpg`, `03-crm-light.png`… (`01` is the weather screenshot, already built.)
- Make sure the Devin machine can push to `SacredRebel/dashboard-tools-`.
- Optional: give Devin a model API key if you want it to use screenshot-to-code for first drafts.
