# Cursor prompt: deep polish pass (high-end, template-grade)

> Paste everything below the line into Cursor (Agent mode) at the repo root of `SacredRebel/dashboard-tools-`.
> The architect (Claude) reviews your PR afterwards. **Do not merge it yourself.**

---

You are the implementation engineer for the gallery dashboards in this repo. The architect reviewed the first polish pass (PR #5, merged as `7a48402`) against every `reference.*` image. It is a real improvement, and it is not yet template-grade. These 38 dashboards become the **templates, rulebook examples and models** that other AI agents copy. Anything you leave half-done here gets copied 1,000 times. The bar is: a senior product designer at a top studio would ship it as is, and next to its reference it reads as the same product, built for real.

## 0. Read first (in this order, fully)

1. `AGENTS.md`, `docs/design/02-rulebook.md`, `docs/design/05-anti-patterns.md`
2. `docs/design/08-polish-standard.md`, `docs/design/09-motion-system.md` (yours, from pass 1)
3. `docs/dashboards/01-add-a-dashboard.md` (URL guard, contrast lessons, check workflow)
4. `docs/validation/dashboards/POLISH-AUDIT.md`, `CONTRAST-BASELINE.md`, `FIDELITY-TOOLS.md`
5. This file, top to bottom, before you write any code.

Use the repo's design skills at the stage where they apply. Invoke the skill if it is installed in your environment, or read its `fallback` doc from `catalog/tools.json` if it is not. Don't skip a stage because a skill is missing.

| Stage | Skills / tools |
|---|---|
| Diagnose vs reference | `design-skills:design-critique`, `vectorlab-ux-skills:ux-audit`, `ux-ui-audit`, visual Read of the side-by-side sheet |
| Raise the craft | `design-skills:design-elevation`, `frontend-design`, `vectorlab-ux-skills:surfaces`, `typography`, `colour-palette`, `spacing` |
| Motion | `vectorlab-ux-skills:motion`, `transitions`, `reduced-motion`, `figma:figma-implement-motion` (method only) |
| Imagery | your image generation tool (GenerateImage), `image-generation` skill if present |
| Pages | `vectorlab-ux-skills:page-patterns`, `forms`, `empty-states`, `loaders`, `errors`, `keyboard` |
| Final gate | `vectorlab-ux-skills:anti-slop`, `design-skills:accessibility-audit`, `superpowers:verification-before-completion` |

Branch: `cursor/deep-polish`, from current `main`. One commit per dashboard. Open one PR at the end. **Do not merge.**

## 1. What the architect found (fix all of it)

### Already fixed by the architect on `main` (don't undo)

- **Focus box around every page title.** `DB.route` focused the `h1` on first load, so every shot showed an outlined title (Horizon, Kumo, Canopy, Aura, Mallow, Hollow, Mauve, Veil, Folio…). `frame.js` now moves focus only on in-app navigation, and `base.css` hides the ring on `[tabindex="-1"]` headings. **All shots, thumbs and frames on `main` are stale. Regenerate every one.**
- **`scripts/dashboards-check.mjs` has new gates.** At the time of this prompt, **all 38 dashboards fail them.** That's expected, and your job is to make them pass honestly. Per catalog page, the check fails on:
  - a visible `[data-db-stub]` (placeholder page)
  - a focus ring on load
  - at 1440: fewer than 60 visible elements in `<main>`, content spanning less than 70% of the main width, or content filling less than 60% of the first screen height
  - any visible `<img>` wider than 160px whose source is under 1.5× its rendered width
  - It also writes `frames/pages/<page>-full.jpg`, the full-length page, so reviewers see what is below the fold.
- **Don't weaken a gate to get green.** If a gate is wrong for a specific legitimate design, write to the architect in the PR with a screenshot; don't edit the threshold.

### G1. Every secondary page is a placeholder (all 38)

Every non-overview page is the shared stub: a small white card ("Payroll · Sample data · This run $184k · Open payroll") floating in an empty panel. That is not multi-page.

Rebuild each page as a full screen in the dashboard's own visual language (see §3). Then delete the stub host from every `app.js` and the `[data-db-stub]` block from `_shared/base.css` (replace, don't fork).

### G2. The signature art from each reference is missing or weak

The references sell their product with one hero scene. Our versions mostly drop it or swap in a flat stock photo:

- **Kumo:** moon, pagoda, cherry blossoms, koi and gold waves frame the board; "Happy teams" script card
- **Canopy:** big layered leaves, landing hero, icon tiles in clay
- **Mallow:** clay girl with headphones, clay icons, cozy room tile. Ours shows a giant faceless headphone blob.
- **Cortex:** brain in a glass bowl with orbiting chips. Ours is tiny and cropped at the bottom.
- **Ember:** big pendant lamp with a radial control ring
- **Clima:** glass orbs and a glass dial
- **Hollow:** witch, potion relics on a ring
- **Pearlwell / Vitalis:** clay tooth, heart and doctor props
- **Taffy / Pebble / Dune:** clay and fabric objects
- **Tidebath:** curved 3D room carousel
- **Orbit:** helmet in a porthole, dune peaks
- **Citadel:** holographic cube on a pedestal, with circuit lines
- **Glacier:** mountain inside a dial ring with segments
- **Solstice:** mountain range under a gradient arc
- **Pulsar:** neon mountain chart with glow
- **Forge:** athlete portrait hero behind the cards

For each one, make an **original** render with GenerateImage: same subject, lighting, palette and camera angle as the reference, and never a copy or a trace. Then:
- Export WebP/AVIF at 2× the rendered size with a `srcset`.
- Cut the scene into layers (background, midground, foreground) where the reference has depth, so it can parallax.
- Credit it in `media/CREDITS.md`.

### G3. Composition breaks

- **cortex-well:** the right two-thirds of the canvas is empty and the brain sits cropped under the fold. Rebuild the three-column layout: card stack, brain bowl center stage with orbit chips and connector lines, right card rail.
- **meridian-labs:** the DNA image overlaps the calendar row. Reference: three columns (tests, DNA helix, vitamins), then a full-width week calendar.
- **copper-radar:** the big half-radar arc with vendor logos and the orange "15%" core is missing. The right column of black tiles doesn't exist in the reference.
- **tidebath-showroom:** the curved, 3D-perspective room carousel became flat thumbnails. Rebuild it with CSS 3D (`perspective`, `rotateY` per panel) and a floor shadow, keyboard plus swipe.
- **mallow-music:** half the board is one empty peach panel. The reference has KPI tiles, a listening chart, a genre donut, recently played, a daily mix and an upgrade card.
- **canopy-reforest:** a landing-style hero, a four-step band and a 3×2 tile grid. Ours cuts off after the hero.
- **ridgeline-trails:** the lower half lost its 3D clay pie charts and the device-frame bezel.
- **ember-rooms:** a big white canvas with small floating cards. The reference fills it with the lamp, an orbit ring of room chips and side rails.
- **Kumo, and every photo-backed board:** the background image stops at 900px and leaves a hard seam in the full-length shot. Backgrounds must cover the whole scroll height (a fixed layer, or `background-size: cover` on a full-height wrapper, plus a bottom fade).
- **Phone (375) layouts:** the hero art often becomes a cropped blob (Mallow, Hollow). Design a phone composition: hero art scaled and repositioned, nav as a bottom bar or a compact top segmented control, cards stacked with the same materials.

### G4. Materials are flatter than the references

The references use layered soft shadows, 1px inner top highlights, rim light, subtle grain, real glass refraction (backdrop blur plus saturation plus an edge highlight), clay (two-tone inner shadow) and neumorphism (paired light and dark shadow). Ours mostly use one shadow and one border.

Write the recipes once (§2B) and apply them.

### G5. Motion is barely used

- Only `motion@12` is loaded. **GSAP is vendored and used by zero dashboards.**
- There are no animated icons, no Lottie, no route transitions, no chart draw-in, no count-ups, no hover depth and no ambient loops.
- The catalog lists 14 motion tools, but none of that reaches the templates.

### G6. Typography character is lost

Examples: Kumo's serif display, Forge's wide display numerals, Orbit's stencil numerals, Saffron's spaced serif caps, Glacier's HUD mono labels.

Match the type character with open-licensed fonts (OFL), self-hosted as WOFF2 in `site/dashboards/_vendor/fonts/<family>/` with their license. Use at most 3 weights.

### G7. The audit was not credible

All 38 rows scored exactly 4.5 on all eight axes. Re-score honestly (§5). A score of 4.5 or higher needs the side-by-side sheet as evidence.

## 2. Framework work first (build once, before any dashboard)

### 2A. FX library: `site/dashboards/_shared/fx/`

Vanilla ES module, zero build, works on `file://` and on the Vercel clean URL. One file per effect plus `fx.css` and `index.js` (auto-wires `data-fx="…"` attributes).

**Every effect must:**
- honor `prefers-reduced-motion` (final state, no animation)
- pause offscreen and in background tabs via `DB.onVisible`
- animate only `transform`, `opacity`, `filter`, `clip-path` or `stroke-dashoffset`
- respect the 100–300ms UI motion rule from the rulebook (ambient loops excepted)

| Effect | `data-fx` | Notes / source of the idea (reimplement in your own code) |
|---|---|---|
| Stagger reveal | `reveal` | Cards enter 12px up and fade in, 40ms stagger, once per page view |
| Count-up | `count` | Tabular numbers, respects locale and decimals, runs when visible |
| Chart draw-in | `draw` | SVG stroke dash for lines, scaleY from baseline for bars, sweep for arcs and donuts |
| Spotlight card | `spotlight` | Pointer-follow radial highlight (React Bits SpotlightCard idea) |
| Tilt / depth | `tilt` | Max 4°, with a glare layer, disabled on touch (React Bits TiltedCard idea) |
| Magnetic button | `magnet` | Max 6px pull (React Bits Magnet idea) |
| Split text | `split` | Per-word reveal for hero titles only (React Bits SplitText idea) |
| Shiny text | `shine` | One sweep on hover for premium labels only; never on body text |
| Parallax layers | `parallax` | Pointer and scroll, ≤ 12px, for layered hero art |
| Ambient loop | `ambient` | Slow drift or glow for moon, water, aurora, orbs; 8–20s; pauses offscreen |
| Particles / sparks | `sparks` | Canvas, ≤ 40 particles, click feedback only (React Bits ClickSpark idea) |
| Animated list | `list` | Insert and remove with FLIP for live feeds and logs |
| Route transition | (auto in `DB.route`) | View Transitions API when supported, else a 180ms cross-fade; shared-element morph for the active nav pill |
| Odometer | `odo` | Digit-roll for KPIs that change on interaction |
| Toggle / slider microinteractions | (CSS) | Thumb squash, track fill, haptic-style 1-frame scale |

- Use GSAP (already vendored) for timelines and ScrollTrigger where it is simpler. Use Motion for springs. Load each library only on dashboards that use it.
- Keep the GSAP license note in `_vendor/gsap@3.13.0/LICENSE.txt`.

**Animated icons:** build `site/dashboards/_shared/icons/`.
- About 48 line icons that the dashboards actually use (home, chart, calendar, bell, user, settings, search, play, heart, sun, moon, cloud, drop, bolt, lock, thermometer, plus others). Use the original Lucide paths (ISC, keep the license file), or draw your own.
- Each icon gets hover and active animations in CSS: stroke draw-on, a bell wiggle (≤ 8°, once), a gear rotation, a heart beat, a sun rays pulse.
- Provide `<svg data-icon="bell" data-anim="hover">` usage.

**Lottie:**
- Vendor `@lottiefiles/dotlottie-web` (MIT) into `_vendor/` with its LICENSE.
- Use it only for 3–6 meaningful moments across the gallery: success check, empty-state, weather condition, loading orb.
- Animations must be self-made, or from LottieFiles free animations with the license recorded per file in `media/CREDITS.md`. If the license is unclear, don't use it.

**"GIF" requests:** never ship real GIFs. Use looping muted `<video>` (WebM/MP4, ≤ 600 KB, `playsinline`, paused offscreen) or Lottie.

### 2B. Design docs (new, written in your own words, linked from `AGENTS.md` §1 and `docs/design/README` if it exists)

- **`docs/design/10-materials.md`:** token recipes with live CSS for glass (light and dark), clay, neumorph (soft UI), HUD/holo, paper, brushed metal, frosted acrylic and soft 3D tiles. Each recipe has layers (fill, inner highlight, edge, shadow stack, grain), contrast notes (text never on raw glass), and the dashboards that use it. Add the tokens to `design-system/tokens.css` (`--mat-glass-*`, `--mat-clay-*`, …).
- **`docs/design/11-hero-art-direction.md`:** how to make the signature scene for a dashboard: subject, camera, lighting and palette brief; GenerateImage prompt template; layer cutting for parallax; 2× export and `srcset`; credits; never copy references; phone composition.
- **`docs/design/12-microinteractions.md`:** every control's states and motion (rest, hover, press, focus, selected, disabled, loading, success, error), with durations and easing tokens, and the FX library mapping.
- **`docs/design/13-high-end-checklist.md`:** 60+ concrete, checkable details that separate premium from generic. Examples:
  - optical alignment of icons in buttons
  - tabular numbers in every KPI
  - chart gridlines at 6–10% ink
  - axis labels muted, data ink strong
  - a 1px inner top highlight on raised surfaces
  - nested radius = outer radius − padding
  - no orphan words in titles (`text-wrap: balance`)
  - `text-wrap: pretty` on paragraphs
  - consistent icon stroke width
  - focus rings that match the accent
  - empty states with a next action
  - skeletons that match the final layout
  - no layout shift on load
  - hover states on every interactive card
  - a cursor of `pointer` only on real actions
  - real units and plausible numbers
  - dates in one format
  - 8px grid audit
  - shadow color tinted to the background, never pure black on light UIs

  Each item gets a one-line why and a one-line how-to-check.
- **Update `docs/design/08-polish-standard.md`:** define fidelity levels (L1 layout, L2 materials, L3 art, L4 motion, L5 interaction depth). Template-grade means all five.

### 2C. Site: a "Motion & FX" page

- Add a route `#/fx` on the showcase site: every effect and animated icon is live, with a toggle for reduced motion and a copy-paste snippet. Link it from the nav and from the dashboard detail view ("Effects used here: …").
- Add to `catalog/dashboards.json` per dashboard: `fx` (array of effect ids used) and `materials` (array of recipe ids). Validate both in `scripts/build.mjs` against the FX and materials lists.

### 2D. Fidelity tool: `scripts/fidelity.py` (Pillow only)

For each dashboard, write `docs/validation/dashboards/fidelity/<id>.jpg`: reference left, `frames/pages/<overview>-full.jpg` right, same width, labelled. Add `--all` to build one sheet per dashboard.

Use it **before and after** each dashboard, and Read the image yourself. It's the evidence for the audit.

## 3. Pages spec (every dashboard)

- **4–5 pages** including the overview, declared in the catalog `pages` with `id`, `name` and `pattern`. Each non-overview page uses a **different named page pattern** from `docs/design/03-page-patterns.md`: List + detail drawer, Detail, Board/kanban, Calendar/schedule, Settings, Form/wizard, Map/explorer, Report.
- **Same world:** each page reuses the dashboard's hero material, palette, type and at least one piece of signature art (a cropped or secondary render, not the same image again).
- **Density:** passes the new gates. Aim for a 1440 page that is as rich as the overview: header with context and actions, 6+ modules, at least one large hero module.
- **Real interactions on every page:** at least 3 from this list, working end to end with in-memory state:
  - filter or segmented control that changes data
  - sort
  - search with live results and an empty result state
  - select a row to open a detail drawer (focus trapped, Esc closes, focus returns)
  - inline edit with validation
  - a form with field errors that say what to do
  - drag to reorder or move between columns (keyboard alternative required)
  - toggle and slider controls that update a chart or readout
  - date range change that rewrites the numbers
  - an approval gate for any AI action
- **Cross-page state:** selecting a record on the overview opens it on the relevant page (`DB.route` go plus a selected id in `sessionStorage`, guarded with try/catch).
- **Four states:** every data module can show loading (skeleton matching the layout), empty (with a next action), error (with retry) and populated. Expose a small "View state" control only on one page per dashboard (Settings or a dev menu), not on every page.
- **Phone:** each page is designed at 375, not just stacked. Bottom nav or a compact segmented control, tap targets 44px or larger.

## 4. Per-dashboard procedure (worst first)

**Order:**
1. cortex-well
2. mallow-music
3. canopy-reforest
4. copper-radar
5. tidebath-showroom
6. meridian-labs
7. ember-rooms
8. kumo-payroll
9. ridgeline-trails
10. pulsar-analytics
11. glacier-ops
12. citadel-wall
13. solstice-energy
14. hollow-vault
15. taffy-analytics
16. pebble-studio
17. dune-panels
18. orbit-clay
19. larchwood-lodge
20. aether-pane
21. then the rest in catalog order

**For each dashboard:**

1. `python3 scripts/fidelity.py <id>`, then Read the sheet. Write a table of **at least 15 concrete differences** (area, reference, ours, fix) into `docs/validation/dashboards/fidelity/<id>.md`.
2. **Art:** make or replace the hero scene and secondary renders (§G2). Use 2× `srcset`, layers and credits.
3. **Layout:** match the reference grid, proportions, module order and whitespace rhythm at 1440. Then design 1024 and 375 versions.
4. **Materials:** apply the recipes from `10-materials.md`; no one-off shadows.
5. **Type:** match the character (§G6); `text-wrap: balance` on titles; tabular numbers.
6. **Pages:** build per §3; delete the stub usage.
7. **Motion:** a minimum set per dashboard:
   - reveal plus count on the overview
   - draw on every chart
   - spotlight or tilt on hero cards (choose what suits the style; no tilt on dense data tables)
   - parallax plus ambient on the hero art
   - route transition
   - animated icons in the nav and the main actions
   - at least one Lottie or video moment, only where it means something

   Record the effects in the catalog `fx`.
8. **Variants:** keep 3 or more; each variant must also pass every gate and still look designed (not just a hue swap). Check hero art against each variant's palette.
9. **Checks:**
   - `node scripts/build.mjs`
   - `node scripts/dashboards-check.mjs <id>`: zero errors, no gate edits
   - Read `shot@2x.jpg`, each `frames/pages/*-full.jpg` and `frames/phone.jpg` yourself
   - 4× CPU throttle in DevTools: ambient loops stay smooth and nothing animates offscreen
10. Run `python3 scripts/fidelity.py <id>` again and add an "after" sheet. Update the POLISH-AUDIT row (§5).
11. **Commit:** `Deep polish <n>: <Name> (art, layout, materials, pages, motion)`.

## 5. Honest audit

Rewrite the table in `POLISH-AUDIT.md`:
- **Axes:** layout, density, type, color, materials, art, motion, interaction, phone, detail. Score each 0–5 with a **one-line reason**.
- **Uniform rows are not allowed.** If every axis is truly equal, say why.
- **Linked evidence:** before and after fidelity sheets.
- **Template-grade** = every axis ≥ 4.5. A dashboard that isn't template-grade gets `status: needs work` with the remaining gaps listed. That is an acceptable, honest outcome. A fake 4.5 is not.

## 6. Hard rules (unchanged, still enforced)

- **Tokens only.** Fictional data (555 numbers, invented names and businesses). No real brands in the UI (the references show "Harry Potter", "Cersanit", "medit", "flux"; replace them).
- **Never copy or trace the reference images.** They are mood boards. Don't edit or delete the `reference.*` files.
- **No polling.** Timers and loops pause offscreen and in background tabs.
- **Replace, don't fork:** delete the stub, old classes and unused media in the same commit.
- **Contrast:** AA everywhere, including all variants and text on art (use scrims). Body text ≥ 14px, no text under 12px. Tap targets ≥ 44px. Full keyboard support with visible focus on controls.
- **Motion:** honors reduced motion; no bouncy UI motion on data; no auto-advancing carousels.
- **Budgets:**
  - media ≤ 1.5 MB per dashboard (WebP/AVIF, `srcset`)
  - JS per dashboard ≤ 120 KB excluding vendored libs
  - CLS < 0.1
- **Vendored libraries:** pinned version folder plus LICENSE; no CDNs.
- **Every new third-party asset or library** gets an entry in `catalog/tools.json` (only if missing) and `media/CREDITS.md`.

## 7. Done means

- [ ] Framework: `_shared/fx/`, `_shared/icons/`, dotLottie vendored, docs 10–13 written, 08 updated, `#/fx` site page live, catalog `fx`/`materials` validated by the build, `scripts/fidelity.py`.
- [ ] Stub host removed from `_shared/base.css` and all 38 `app.js`.
- [ ] `node scripts/build.mjs` ✔ and `node scripts/dashboards-check.mjs` ✔ for **all 38**, with the architect's gates untouched.
- [ ] `node scripts/screenshot.mjs` ✔ for the site routes, including `#/fx`.
- [ ] Every dashboard has before and after fidelity sheets plus a differences table; POLISH-AUDIT is rewritten honestly.
- [ ] All shots, thumbs, frames and full-length page captures regenerated after the focus fix.
- [ ] PR from `cursor/deep-polish` with:
  - a summary table (dashboard, pages, fx, materials, audit before → after, status)
  - the list of new assets and licenses
  - anything you could not finish, stated plainly
- [ ] **Not merged.** Post the PR link and wait for the architect review.

Don't stop until the list above is done. If you run out of budget, stop at a clean commit boundary, push, open the PR as a draft and write exactly where you stopped in `docs/validation/dashboards/HANDOFF.md`.
