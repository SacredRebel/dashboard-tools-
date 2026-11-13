# Add a dashboard to the gallery

The exact workflow for turning **one reference screenshot** into **one gallery dashboard**. It was used to build the first entry, `horizon-weather`: read its three files before starting. Follow the steps in order. One dashboard = one commit.

[← Gallery](README.md)

---

## 0. Inputs and naming

- Working copies of reference images live in `inputs/dashboards/` (gitignored). While building, keep them there. When the owner wants the original in the gallery for 1:1 comparison, copy it to `site/dashboards/<id>/reference.jpg` (or `.png`) and set `"reference"` on the catalog entry — that file **is** committed.
- Process images in filename order. Give each dashboard:
  - `number`: next free integer in `catalog/dashboards.json`
  - `id`: kebab-case, `<original-name>-<domain>`, e.g. `horizon-weather`, `ledger-finance`, `pulse-fitness`
  - `name`: a **new brand name you invent**. Never reuse the brand/logo text in the screenshot (the reference said "Skyview"; ours is "Horizon")

## 1. Analyse the screenshot (write it down before coding)

Write these answers in the commit message body or a scratch note:

1. **Domain & job:** what product is this, what is the one job of this screen?
2. **Style family** (from `style_families` in the catalog) and **mode** (dark/light). If nothing fits, add a family (rare).
3. **Grid:** columns, sidebar width, gutters, card radius, how sections stack. Measure in px against a 1440px-wide frame.
4. **Palette:** pick 5–8 colors with an eyedropper: bg, surface, text, muted, accent, and 1–3 extras (chart colors, glow). Hex values.
5. **Type:** identify or match the display and body fonts **on Google Fonts** (closest free match is fine). Sizes of headline, body and numbers.
6. **Components:** list every distinct component (search, KPI tile, chart type, table, list, card, avatar row…).
7. **Signature:** the one detail that makes it memorable (scenery, glow ring, oversized number, illustration). This must survive in your version.
8. **Images in the reference:** photos, illustrations, 3D. Plan a replacement for each: **code-drawn SVG/CSS** (preferred), or a free-license image (Unsplash/Pexels license, saved into the folder, credited in the catalog `source.note`).
9. **Variants:** plan **3 variants**: `default` plus 2 more (e.g. a light/dark flip, a different accent, a seasonal palette). Each is just a token override block.

Optional helpers: run **screenshot-to-code** (`catalog/tools.json` → `screenshot-to-code`, needs a model API key) on the image to get a rough HTML draft for structure. Treat the output as a sketch only, since it hard-codes values. `agent-vision-toolkit` helps if your model can't see images.

## 2. Create the folder

```
site/dashboards/<id>/
  index.html   ← markup
  style.css    ← tokens (:root + [data-variant]) and component styles
  app.js       ← sample data, icons, code-drawn art, interactions (optional but usual)
  thumb.jpg      ← generated in step 6 (720×450 gallery card), never hand-made
  shot.jpg       ← generated in step 6 (1440×900 recreation screenshot), never hand-made
  reference.jpg  ← (or .png) the owner's original reference image, copied in for 1:1 comparison
```

Working copies of owner-supplied references live in `inputs/dashboards/` (gitignored while building). When the owner asks to keep them in the gallery, copy each into `site/dashboards/<id>/reference.jpg` (or `.png`) and set `"reference": "reference.jpg"` on the catalog entry. `shot.jpg` is our recreation screenshot; `reference.*` is the original for side-by-side fidelity checks.

### index.html skeleton (copy and adapt)

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- URL guard: relative CSS/JS below only resolve when the URL ends in "/" or ".html". Keep this first. -->
  <script>if (!/\/$|\.html$/.test(location.pathname)) location.replace(location.pathname + '/' + location.search + location.hash);</script>
  <title>{Name} · Dashboard Tools gallery</title>
  <meta name="description" content="{one line: style + domain}. Sample data.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family={Display}&family={Sans}&display=swap">
  <link rel="stylesheet" href="../_shared/base.css">
  <link rel="stylesheet" href="style.css">
  <script src="../_shared/frame.js"></script>
</head>
<body>
  <!-- semantic landmarks: aside/nav, header, main, section with aria-labelledby -->
  …
  <p class="db-sample">Sample data · fictional</p>
  <script src="app.js"></script>
</body>
</html>
```

#### URL guard: why it's mandatory (a real bug we shipped once)

Vercel's clean URLs turn `/dashboards/<id>/index.html` into `/dashboards/<id>`, **without the trailing slash**. Without the slash, every relative path resolves one folder too high: `style.css` becomes `/dashboards/style.css` and `../_shared/base.css` becomes `/_shared/base.css`, all 404. The page then shows as a black screen with bare inputs, and that's what the gallery preview showed for Horizon Weather. Opening the file from disk (file://) never shows this bug, which is why it slipped through. Three defenses, all required:

1. `vercel.json` has `"trailingSlash": true` (already set; don't change it).
2. The **URL guard** `<script>` above is the first thing in `<head>`, before any `<link>` or `<script src>`, so the page fixes its own URL on any host.
3. All paths inside a dashboard are **relative** (`style.css`, `../_shared/base.css`, `app.js`), never root-absolute (`/dashboards/…`). Links to a dashboard always use the folder form with a slash: `dashboards/<id>/`.

`node scripts/build.mjs` rejects a dashboard without the guard or with root-absolute paths. `node scripts/dashboards-check.mjs` serves the site with worst-case clean-URL rules and loads every URL form plus the gallery preview iframe, so this bug can't pass again.

`_shared/frame.js` applies `?variant=<id>` to `<html data-variant>` and gives you `DB.onVisible(el, cb)` for pausing animations. **Do not edit `_shared/` files** unless every dashboard benefits; if you do, re-run the check for all dashboards.

### style.css rules

- First block: `:root { … }` defining **at least** `--bg --surface --surface-2 --border --text --text-muted --text-subtle --accent --accent-fg --accent-soft --focus --chart-1 --font-display --font-sans --radius-sm --radius-md --radius-lg`. Add extras the design needs (`--glow`, `--sky-1`…).
- Then one `[data-variant="<id>"] { … }` block per extra variant, **overriding tokens only**.
- Component rules use **only `var(--…)`** for color, never raw hex (raw hex is allowed only inside the token blocks and rgb() alpha overlays derived from them).
- Prefix every class with a 2–3 letter dashboard prefix (`hw-` for horizon-weather) so nothing collides.
- Responsive breakpoints at roughly 1180px, 960px and 640px. The sidebar becomes a top bar, grids collapse to one column, horizontal strips scroll **inside** their container (never the page).
- Body text ≥ 14px, labels ≥ 12px, tap targets ≥ 44px on phone, visible focus.
- Motion 150–300ms on transform/opacity; honor `prefers-reduced-motion` (base.css already does globally).

### app.js rules

- An IIFE, no globals except what you read from `window.DB`.
- **Fictional data only:** invented names, companies and numbers; real city names are fine; phone numbers use 555. Dates relative to today.
- Icons: inline SVG paths (Lucide-style, 24×24, stroke `currentColor`) defined in the file. No icon fonts, no external sprites.
- Charts: hand-drawn SVG (see `renderChart` in horizon-weather): `viewBox` + `preserveAspectRatio="none"` for the shape, `vector-effect="non-scaling-stroke"` for lines, **HTML labels positioned over it** (so text never scales below 12px), hover **and** focus show values, an `aria-label` summarizing the series.
- Interactive where the reference implies it: selecting tabs/days/rows updates the related panels. Every control does something or is clearly decorative.
- **No timers fetching data, no network calls.** Animations only while visible (`DB.onVisible`).
- **Last line inside the IIFE:** `document.documentElement.dataset.ready = 'true';`. The check uses it to prove the script loaded and ran to the end. The build rejects an `app.js` without it.

## 3. Build it, then compare to the reference

Open `site/dashboards/<id>/index.html` directly in a browser (file:// works). Put it side by side with the reference at 1440px and iterate until layout, proportions, palette and signature read as **the same style**. Being pixel-perfect is not the goal. It must look as polished as the reference and keep its character.

## 4. Add the catalog entry

Append to `dashboards` in `catalog/dashboards.json`. Copy the `horizon-weather` entry as the template and fill **every** field:

| Field | What to write |
|---|---|
| `id`, `number`, `name` | From step 0 |
| `style_family`, `mode` | From step 1 |
| `use_cases` | 1–3 ids from `use_cases` (add a new use case only if none fits) |
| `status` | `"ready"` (`"draft"` hides nothing, but say why in summary) |
| `added` | Today, `YYYY-MM-DD` |
| `summary` | One or two sentences: style + what's on screen |
| `mood` | 3–6 adjectives |
| `best_for`, `avoid_when` | 2–3 honest lines each |
| `layout.pattern` | Toolkit page pattern: Dashboard, List, Detail, Board, Form, Settings… |
| `layout.structure` | Regions in reading order, separated by " · " |
| `layout.responsive` | What happens at each breakpoint |
| `components` | Every distinct component |
| `signature` | The memorable detail |
| `palette` | Hex for `bg surface text muted accent` (required) + extras; must match `style.css` `:root` |
| `fonts` | `display` and `sans` Google Fonts family names |
| `variants` | `[{"id":"default","name":…,"swatch":…}, …]`, first must be `default` |
| `maps_to_theme` | Closest toolkit theme id (`design-system/themes.json`) |
| `tools_used` | Catalog tool ids / tools you used |
| `source` | `{"type":"screenshot","note":"Recreated in original code from a user-supplied reference… (what you replaced)"}` |
| `path` | `"site/dashboards/<id>/"` |

## 5. Rebuild

```bash
node scripts/build.mjs
```

It validates the entry: enums, required fields, palette hex, variant blocks present in `style.css`, required tokens, `index.html` includes the shared files, `thumb.jpg` exists. Fix every error it prints.

## 6. Check and generate the thumbnail

```bash
node scripts/dashboards-check.mjs <id>
```

It serves `site/` over HTTP with worst-case clean-URL rules (not file://), then loads `/dashboards/<id>/`, `/dashboards/<id>` and `/dashboards/<id>/index.html` at 1440×900, the folder URL at 375×812, every variant, and the gallery preview iframe at `#/dashboards/<id>`. It fails on console errors, any 404, an unstyled page, a missing `data-ready`, or horizontal overflow. It writes `thumb.jpg` (720×450 gallery card), `shot.jpg` (1440×900 recreation screenshot), and `docs/validation/dashboards/<id>.json`. Then run `node scripts/build.mjs` again so the catalog picks up the assets. Fidelity check: open Live vs **Original reference** (`reference.*`) in the gallery; use `shot.jpg` only as our recreation capture.

## 7. Verify in the gallery

```bash
npx serve site   # or open site/index.html
```

Go to **#/dashboards**: the card shows, filters find it, the detail page previews it in Desktop, Tablet and Phone, and the variant buttons switch the preview. Use `npx serve site` (HTTP), not file://. **The preview must show the full styled dashboard.** A black frame with bare inputs and buttons means its CSS/JS didn't load (see URL guard).

## 8. Commit

One commit per dashboard, message: `Add dashboard <number>: <Name> (<style family>, <use case>)`, with the step-1 analysis in the body. Include: the folder, the catalog entry, regenerated `docs/dashboards/catalog.md`, `site/data/data.js`, `docs/validation/dashboards/<id>.json`. **Never** include anything from `inputs/`.

## Definition of done (per dashboard)

- [ ] Reads as the same style as the reference at 1440px, signature detail kept
- [ ] New brand name; no copied logos, photos, icons or copy from the reference
- [ ] Tokens on `:root` + 2 extra `[data-variant]` blocks, components use `var(--…)` only
- [ ] Fictional sample data, labeled
- [ ] Interactive parts work by mouse and keyboard; focus visible
- [ ] URL guard first in `<head>`, relative paths only, `app.js` ends with `dataset.ready = 'true'`
- [ ] `node scripts/build.mjs` passes, `node scripts/dashboards-check.mjs <id>` passes
- [ ] Gallery preview at `#/dashboards/<id>` (over HTTP) shows the full styled dashboard in Desktop, Tablet and Phone
- [ ] Thumbnail looked at; gallery card and detail preview work
- [ ] One commit, nothing from `inputs/`
