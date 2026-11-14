# Cursor prompt: polish pass, multi-page dashboards, motion system

Paste everything below the line into Cursor (Agent mode, the strongest model you have, with the repo open). It's long on purpose: read all of it before starting.

---

## Your role

You're the builder for the **Dashboard Tools** repo (`SacredRebel/dashboard-tools-`). Claude is the architect and will review your work when you finish. The gallery has **38 dashboards** in `site/dashboards/<id>/`, each with the owner's original `reference.*` image beside it. They're structurally right, but **not yet at the quality of their references**, and each one is a single screen.

**Goal:** make every dashboard **look like its reference at full resolution**, make it **a small working product with several pages**, and add a **motion and animation layer**. The result must be good enough that any AI agent can lift a dashboard into a real product and get pixel-quality results. Along the way you'll write the **polish standard** and **motion system** into the framework, so future agents know what "polished" means.

## 0. Read first (in this order)

1. `AGENTS.md`: repo rules (tokens, four states, no polling, replace-don't-fork, evidence before claims)
2. `.cursor/rules/dashboard-gallery.mdc`: non-negotiables for gallery dashboards
3. `docs/dashboards/README.md` and `docs/dashboards/01-add-a-dashboard.md`: the workflow, the **URL guard** bug, the **contrast lessons**
4. `docs/validation/dashboards/HANDOFF.md`: history plus the architect review notes at the bottom
5. `docs/design/02-rulebook.md`, `03-page-patterns.md`, `04-data-viz.md`, `05-anti-patterns.md`, `07-showcase-patterns.md`
6. `design-system/tokens.css`, `design-system/README.md`
7. `catalog/tools.json`: categories `polish`, `uiux`, `dataviz`, `design-to-code`, `libraries`
8. Three dashboards with their references, to calibrate: `horizon-weather`, `larchwood-lodge`, `hearth-nest`

## 1. Ground rules (breaking one means redo)

- **Branch:** `cursor/polish-pass`. Never push to `main`. Open a PR at the end and don't merge it.
- **One dashboard per commit**: `Polish dashboard <n>: <Name> (fidelity, pages, motion)`. Framework and tooling changes get their own commits.
- **Keep, don't fork:** improve each dashboard in place. No `v2` folders, no `-old` classes. Delete what you replace.
- **Keep every guarantee that exists today:**
  - the URL guard first in `<head>`, relative paths only, and `document.documentElement.dataset.ready = 'true'` at the end of `app.js`
  - tokens on `:root` plus `[data-variant]` blocks that only override tokens; components use `var(--…)` only
  - fictional data labeled "Sample data · fictional"; new brand names; no logos or copy taken from references
  - text at least 12px (body at least 14px); contrast passing the **pixel contrast check** in every variant and on every page; 44px tap targets on phone; keyboard access with visible focus
  - `prefers-reduced-motion` respected; **no polling, no network calls, no external CDNs**
- **Don't touch** the owner's `reference.*` files. Don't edit generated files by hand (`site/data/data.js`, `docs/dashboards/catalog.md`).
- **Evidence before claims:** every dashboard must pass `node scripts/build.mjs` and `node scripts/dashboards-check.mjs <id>` before its commit.

## 2. Phase A: tooling (do this first, its own commits)

### A1. Multi-page support (contract + checks)
Every dashboard becomes a **small app with 3–5 pages**, using an in-page hash router (no extra HTML files, so the URL guard and relative paths keep working).

- **Shared runtime:** extend `site/dashboards/_shared/frame.js` with a tiny router: `DB.route(pages, render)`. It reads `location.hash` (`#/overview`, `#/devices`…), keeps `?variant=` intact, moves focus to the new page's `<h1>`/`<h2>`, sets `document.title`, updates `aria-current` on nav links, and supports Back/Forward. Pages are rendered by the dashboard's own `app.js`. Default page is the first one.
- **Catalog field:** add `pages` to every entry in `catalog/dashboards.json`, e.g. `[{ "id": "overview", "name": "Overview", "pattern": "Dashboard" }, { "id": "devices", "name": "Devices", "pattern": "List" }, …]`.
  - At least 3 pages, first one = the screen that matches the reference.
  - `pattern` is one of the toolkit page patterns (Dashboard, List, Detail, Board, Form, Settings, Calendar, Inbox, Report).
- **`scripts/build.mjs`:** validate `pages` (at least 3 pages, unique ids, valid pattern) and generate them into `docs/dashboards/catalog.md`.
- **`scripts/dashboards-check.mjs`:** for every page `#/<page>`, at 1440 and 375 and in every variant, run the existing checks: errors, 404s, overflow, `data-ready`, **pixel contrast**, **12px min**. Also fail if a nav link points to a page that doesn't exist, or if a page renders an empty `<main>`.
  - Keep the worst-case clean-URL server.
  - Keep `thumb.jpg` (overview page, 720×450) and `shot.jpg` (overview, 1440×900).
  - **Add `shot@2x.jpg`** (overview, 1440×900 at DPR 2): the full-pixel capture agents compare against.
  - **Add `frames/`** with `desktop.jpg` (1440×900), `tablet.jpg` (1024×768) and `phone.jpg` (390×844) of the overview page, plus `pages/<page>.jpg` at 1440×900 for each page.
- **Gallery page** (`site/assets/dashboards.js` + `.css`):
  - the detail view lists the pages as tabs that switch the live preview iframe (`dashboards/<id>/#/<page>`)
  - Desktop / Tablet / Phone frames
  - "Live" vs "Original reference" side by side or with an **A/B slider** (reuse the before/after pattern from `docs/design/07-showcase-patterns.md`)
  - a "Motion" badge listing the motion features in use
  - keyboard accessible, no layout shift

### A2. Motion system (framework + vendored libraries)
Static dashboards can't `npm install`, so **vendor** pinned libraries into `site/dashboards/_vendor/<lib>@<version>/` with their `LICENSE` file and a short `README.md` (source URL, version, license, what it's for). Don't use CDNs. Allowed:

| Library | Use for | Notes |
|---|---|---|
| **Motion** (motion.dev, vanilla `animate`, `scroll`, `inView`, spring) | Number count-ups, staggered card entrances, spring interactions, scroll-linked reveals | MIT. Default choice |
| **GSAP** core (+ ScrollTrigger only if needed) | Complex timelines, path drawing, hero sequences | Check the current license text before vendoring, and record it |
| **dotLottie web player** (`@lottiefiles/dotlottie-web`) | Animated icons and illustrations (`.lottie`/`.json`) | Only animations whose license allows reuse (LottieFiles free license or your own). Store the files in the dashboard folder |
| **Rive** web runtime (optional) | Interactive state-machine icons and illustrations | Only if a dashboard really needs it |

**React ecosystem, documented for agents building React apps (not vendored into the static gallery):**
- **React Bits** (reactbits.dev): animated text, backgrounds, cards, cursors. Read and record its license (MIT + Commons Clause at last check: free to use in products, not to resell the components themselves).
- **Motion for React**
- **Magic UI**
- **Aceternity UI**
- **Animate UI**
- **shadcn/ui** blocks
- **Lucide** animated icons
- **Lordicon** (check the license tier)
- **Iconify**
- **useAnimations**

You may **port an effect** from these into vanilla CSS/JS for a gallery dashboard (an aurora background, a spotlight card, shiny text, an animated counter, a magnetic button). Re-implement it in your own code and credit it in the catalog `motion` notes. **Never paste their source** unless the license allows it, and say so in the vendor README.

Write the framework docs (your words, specific, with code):
- **`docs/design/08-polish-standard.md`:** what "polished" means here, as a checklist agents can apply.
  - Optical alignment and an 8px rhythm.
  - Density matched to the reference.
  - Depth: layered shadows, inner highlights on glass/clay.
  - Lighting and gradients with a single light direction.
  - Typography scale and tracking; tabular numbers.
  - Icon consistency: one family, one stroke width, optical sizes.
  - Imagery quality, empty, loading and error states, micro-interactions, and motion timing.
  - Include a "before / after" section using 2–3 gallery dashboards you polished (link their folders and frames).
- **`docs/design/09-motion-system.md`:** motion tokens added to `design-system/tokens.css`:
  - durations, easings and spring presets as CSS custom properties (`--dur-*` already exists, extend it consistently)
  - when to animate (state change, feedback, orientation) and when not to (data that people read, anything looping by default, or anything that blocks input)
  - patterns with code: count-up on first view, staggered reveal, chart draw-in, hover lift, press feedback, skeleton shimmer, page transition, animated icons on state change, a toast in and out
  - performance: transform and opacity only, `will-change` sparingly, pause offscreen via `DB.onVisible`, 60fps at 4× CPU throttle
  - accessibility: reduced motion, no flashing more than 3 times a second, no infinite loops on by default
- **`catalog/tools.json`:** add a `motion` category with entries for every library above. Each needs `use_when`, `avoid_when`, `how_to_use`, license notes, `fallback: docs/design/09-motion-system.md`, `kind` library or reference, and correct phases. Run `node scripts/build.mjs`.
- **`catalog/dashboards.json`:** add `motion: ["count-up", "stagger", "chart-draw", …]` per dashboard and `pages` (A1). Extend `build.mjs` validation for `motion` (array of known ids defined in a top-level `motion_patterns` list).

### A3. Imagery rules (the biggest fidelity gap)
The references use photos, 3D renders and rich illustration. Our versions used thin SVG and lost most of the look. For each image in a reference, choose the **first option that works**:

1. **Rich code-drawn art:** layered SVG with gradients, soft shadows, highlights and filters (`feGaussianBlur`, `feTurbulence` for grain), or CSS 3D. This works for landscapes, abstract 3D shapes, glass orbs and clay objects. It must look intentional and dimensional, not like a diagram.
2. **Free-license photography** (Unsplash or Pexels license): download, resize to at most 1600px wide, compress to WebP (≤ 250 KB each), save in the dashboard folder, credit photographer and source in the catalog `source.credits`. Interiors, rooms, nature and products are fine. No identifiable people, no logos, no brand products.
3. **Original renders you make:** if your environment has an image-generation tool, generate an original image in the same art direction (e.g. "clay astronaut helmet, soft studio light, cream background"). Save as WebP, note "AI-generated original" in `source.credits`. Never generate a copy of the reference image itself.

Never hotlink, never copy pixels from `reference.*`, never trace a reference illustration.

## 3. Phase B: audit (one commit)

For all 38 dashboards, open `reference.*` and `shot.jpg` side by side at the same size and score 1–5 on 8 axes:
1. layout and proportions
2. density
3. typography
4. color and lighting
5. depth and materials (glass, clay, neumorphism, shadows)
6. imagery
7. component detail (charts, icons, controls)
8. overall "would a designer mistake it for the reference's style?"

Write `docs/validation/dashboards/POLISH-AUDIT.md`: a table with the scores, the 3 biggest gaps per dashboard in one line each, and the **order of work: lowest total first**. Architect pre-review found the biggest gaps in imagery, density and depth, especially:
- #18 Hearth Nest: the room photo hero became line art
- #21 Glacier Ops and #23 Citadel Wall: the central 3D object and HUD glow are flat
- #30 Dune Panels: the fabric waves and clay depth are missing
- #33 Orbit Clay: the 3D helmet and landscape phone
- #37 Cortex Well: the glass brain bowl
- #26 Zest Health and #28 Mauve Ledger: chart detail, sizes and density

**Known failures to fix:** 13 dashboards currently fail the pixel contrast check (35 spots). The exact list, with text, colors and positions, is in `docs/validation/dashboards/CONTRAST-BASELINE.md`. Each must pass by the time you commit that dashboard.

## 4. Phase C: per dashboard, in audit order (one commit each)

For each dashboard:

1. **Re-read its reference at 100% zoom.** List every visible element top-left to bottom-right, measure the grid at 1440 wide, and pick colors from the reference. Note font sizes and weights, radii, shadow recipes and icon style.
2. **Fidelity pass on the overview page:**
   - Match proportions, density, type scale, palette, materials and lighting.
   - Replace weak imagery per A3.
   - Upgrade charts to the reference's level of detail (gradients, markers, labels, tooltips on hover and focus).
   - Use one icon family consistently (inline SVG, same stroke).
   - **Target: overall audit score ≥ 4.5/5 on every axis.**
3. **Pages:** build 2–4 more pages that make sense for the domain, for example:
   - smart home: Overview / Rooms / Devices / Energy / Settings
   - finance: Overview / Transactions / Budgets / Reports
   - health: Overview / Vitals / Appointments / Records

   Same design language, real interactions:
   - filters, sorting, search
   - tabs, segmented controls
   - a detail drawer or modal (focus-trapped, Esc closes, focus returns)
   - a form with validation and inline errors
   - toggles that change the related UI
   - empty, loading (skeleton) and error states, at least once per dashboard

   Every nav item goes somewhere. Items you don't build are removed from the nav, not left dead.
4. **Motion pass** (per `docs/design/09-motion-system.md`), purposeful and subtle:
   - count-up on first view of KPI numbers
   - staggered card entrance on page change
   - chart draw-in
   - hover and press feedback
   - animated icon on state change (e.g. a toggle's bulb lights up, a lock closes)
   - page transitions under 250ms
   - at most one ambient animation per dashboard, paused offscreen, off under reduced motion
5. **Variants:** keep 3 (default + 2). Re-check every variant on every page.
6. **Catalog:** update `pages`, `motion`, `components`, `layout`, `palette` (must match `:root`), `source.credits`, and `summary` if the product got richer.
7. **Verify:**
   - `node scripts/build.mjs` ✔ and `node scripts/dashboards-check.mjs <id>` ✔ (all pages, variants, widths, contrast)
   - Look at `shot@2x.jpg`, `frames/*.jpg` and `pages/*.jpg` yourself, and put `shot.jpg` beside `reference.*` again: is it ≥ 4.5 on every axis? If not, iterate.
   - Over HTTP (`npx serve site`), open `#/dashboards/<id>` and click every page tab, every variant, Desktop, Tablet and Phone, and the A/B slider.
8. **Commit** (one per dashboard) and update its row in `POLISH-AUDIT.md` with the new scores.

**Pace:** finish one dashboard completely before starting the next. If your session or context gets long, stop after a completed commit and write the next step at the top of `POLISH-AUDIT.md` ("Next: #NN …"). The next session starts there.

## 5. Quality bar (what reviewers will check)

- Put `shot.jpg` next to `reference.*` at thumbnail size and at 100%. The style is unmistakably the same, and the polish level is equal or better.
- Nothing looks like a wireframe: no flat placeholder art, no default-looking charts, no misaligned baselines, no orphan words in headlines, no inconsistent radii.
- Every page has a real job, real interactions and all four states; the nav never lies.
- Motion feels calm and intentional. Nothing bounces, nothing loops forever, nothing blocks.
- `dashboards-check.mjs` passes for all 38 dashboards, and `node scripts/screenshot.mjs` passes for the whole site.
- The docs `08-polish-standard.md` and `09-motion-system.md` are specific enough that an agent who has never seen the gallery could produce work at this level.

## 6. When you're done

1. Run `node scripts/build.mjs`, `node scripts/dashboards-check.mjs` (all) and `node scripts/screenshot.mjs`. All must pass.
2. Push `cursor/polish-pass` and open a PR to `main` titled `Polish pass: fidelity, multi-page dashboards, motion system`. In the body include:
   - the audit table with before → after scores
   - the Vercel preview URL
   - the list of vendored libraries with versions and licenses
   - anything skipped or uncertain
3. Don't merge. Tell the owner it's ready for the architect's review.
