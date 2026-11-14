# Dashboard gallery: handoff (where the work stopped)

Written by Devin at the end of its session, for the next agent (Cursor) and for review (Claude architect).
Task: turn the 32 reference images the owner supplied into original gallery dashboards, following
[docs/dashboards/01-add-a-dashboard.md](../../dashboards/01-add-a-dashboard.md) and [AGENTS.md](../../../AGENTS.md).

## Status at a glance

- **32 references total.** 21 handled, **11 still to build (references 22–32)**.
- **16 new dashboards built** (catalog #2–#17), plus the pre-existing #1 Horizon Weather. All passed
  `node scripts/dashboards-check.mjs <id>` (3 URL forms, 375px phone, both variants, gallery preview) and have a `thumb.jpg`.
- **5 references skipped** with reasons (1 duplicate of dashboard 1, 4 colour sheets that are not dashboards).
- Every reference has a row in [_batch-log.md](_batch-log.md). Rows 22–32 are marked `needs review (not built yet: session ended)`;
  change each to `done` (or `skipped (reason)`) as you finish it.
- Work was done on branch `devin/dashboard-gallery`, one commit per dashboard, then fast-forwarded into `main` at the owner's request.
- No PR was opened (the owner asked to push straight to main instead).

## Done: one row per reference, in order

| Ref image | # | Folder | Name | Style | Use cases | Mode | Variants | Commit |
|---|---|---|---|---|---|---|---|---|
| 01-weather-skyview.jpg | 1 | — | (Horizon Weather, already existed) | — | — | — | — | skipped: duplicate |
| 02-violet-mint-dark.jpg | 2 | `site/dashboards/pulsar-analytics/` | Pulsar Analytics | dark-neon | analytics, saas-admin | dark | 3 | 32bd371 |
| 03-ember-arc-dark.jpg | 3 | `site/dashboards/solstice-energy/` | Solstice Energy | cinematic | analytics, smart-home | dark | 3 | 2f298ce |
| 04-payroll-moonlit.jpg | 4 | `site/dashboards/kumo-payroll/` | Kumo Payroll | cinematic | hr, finance | dark | 3 | 2ce2a13 |
| 05-leaf-landing.jpg | 5 | `site/dashboards/canopy-reforest/` | Canopy Reforest | soft | project, analytics | dark | 3 | 7ca2b0d |
| 06-mist-mountain-grey.jpg | 6 | `site/dashboards/ridgeline-trails/` | Ridgeline Trails | editorial | travel, analytics | light | 3 | b2df678 |
| 07-realestate-glass.jpg | 7 | `site/dashboards/haven-listings/` | Haven Listings | glass | real-estate | light | 3 | 66a4686 |
| 08-palette-navy-sand.jpg | — | — | — | — | — | — | — | skipped: colour palette sheet |
| 09-palette-luxury.jpg | — | — | — | — | — | — | — | skipped: colour palette sheet |
| 10-colorpsych-light.jpg | — | — | — | — | — | — | — | skipped: colour psychology chart |
| 11-colorpsych-dark.jpg | — | — | — | — | — | — | — | skipped: colour psychology chart |
| 12-wellness-ring-tablet.jpg | 8 | `site/dashboards/aura-ring/` | Aura Ring | glass | health | dark | 3 | 10cf17b, c9c2c90 |
| 13-wellness-ring-flat.jpg | 9 | `site/dashboards/lull-sleep/` | Lull Sleep | soft | health | light | 3 | e19ae36 |
| 14-dental-mobile.jpg | 10 | `site/dashboards/pearlwell-dental/` | Pearlwell Dental | soft | health | light | 3 | c3d1e4d |
| 15-medical-mobile.jpg | 11 | `site/dashboards/vitalis-care/` | Vitalis Care | bento | health | light | 3 | 032d86d |
| 16-music-clay.jpg | 12 | `site/dashboards/mallow-music/` | Mallow Music | skeuo | media | light | 3 | 21e705a |
| 17-pastel-3d-kit.jpg | 13 | `site/dashboards/taffy-analytics/` | Taffy Analytics | minimal | saas-admin, analytics | light | 3 | a1ea4c5 |
| 18-liquid-glass-kit.jpg | 14 | `site/dashboards/prism-workspace/` | Prism Workspace | glass | saas-admin | light | 3 | 23da8b3, d5baedc |
| 19-parrot-dark.jpg | 15 | `site/dashboards/plumage-survey/` | Plumage Bird Survey | cinematic | analytics | dark | 3 | 753d35f |
| 20-gaming-chest.jpg | 16 | `site/dashboards/hollow-vault/` | Hollow Vault | dark-neon | media | dark | 3 | e5f8b98 |
| 21-autumn-widgets.jpg | 17 | `site/dashboards/larchwood-lodge/` | Larchwood Lodge | bento | hospitality, smart-home | dark | 3 | 984d9d5 |

Proof per dashboard: the folder (`index.html`, `style.css`, `app.js`, `thumb.jpg`), its entry in
[catalog/dashboards.json](../../../catalog/dashboards.json), the generated row in [docs/dashboards/catalog.md](../../dashboards/catalog.md),
its batch-log row, and its commit. Re-run all checks with `node scripts/build.mjs && node scripts/dashboards-check.mjs`.

## Left to do: 11 references, in this order

**Do not skip any and do not build duplicates.** Build each one exactly once, in this order, as the next catalog number
(next is **#18**). Do not reuse an id or name from the table above.

| Ref | Image (as named in the batch log) | Owner's original upload filename | What it shows / suggested direction |
|---|---|---|---|
| 22 | 22-smarthome-amber.jpg | 8680c6b784050f151034f9844e365a46.jpg | Dark, warm-amber smart home ("NexHome"-style): left icon rail, room tabs (Living, Kitchen, Bedroom, Garage), cosy living-room hero with device nodes, weather, air-quality arc + PM2.5 spark, thermostat dial with −/+, device toggle tiles (lighting, AC, TV, router), 7-day power bars, brightness slider. Suggested: cinematic, smart-home, dark. The hero room photo must be redrawn as SVG/CSS (sofa, lamp, plant). |
| 23 | 23-smarthome-grey-glass.jpg | f935da9b0b5c34472ddb6456bceb93af.jpg | Grey glass smart-home panels. Must look clearly different from #22 (different layout and palette) — the same domain is fine, a copy is not. |
| 24 | 24-smarthome-room-glass.jpg | c83d9fc7a2152a9759617249b96a0484.jpg | Smart home over a room photo with glass panels. Third smart-home reference: pick a distinct angle (e.g. energy, security or a single room) so #22–#24 are three different dashboards. |
| 25 | 25-blue-radial.png | Screenshot_2026-11-13_114405.png | Blue dashboard with radial charts. |
| 26 | 26-reading-tracker.png | Screenshot_2026-11-13_113626.png | Reading tracker (books, goals, streaks). Use case likely `education` or `media`. |
| 27 | 27-bigscreen-blue.png | Screenshot_2026-11-13_112418.png | Big-screen / wall-display style blue dashboard (data-dense). |
| 28 | 28-glass-panels.png | Screenshot_2026-11-13_112002.png | Glass panels. |
| 29 | 29-fitness-photo.png | Screenshot_2026-11-13_111906.png | Fitness dashboard over a photo. Replace the photo with SVG/CSS art; no real people. |
| 30 | 30-health-lime.png | Screenshot_2026-11-13_111850.png | Health dashboard, lime accent. Must differ from Aura Ring, Lull Sleep, Pearlwell Dental and Vitalis Care. |
| 31 | 31-sales-lime.png | Screenshot_2026-11-13_111818.png | Sales dashboard, lime accent (crm / analytics). Must differ from #30. |
| 32 | 32-finance-lilac.png | Screenshot_2026-11-13_111750.png | Finance dashboard, lilac palette. Must differ from Kumo Payroll. |

**Where the images are:** they are not in the repo (repo rule: reference images are never committed). They are the owner's
own uploads, listed above by original filename (the eight `Screenshot_2026-11-13_*.png` files and three hashed `.jpg` files).
Devin also attached these 11 images to its final chat message. Put them, named as in column 2, in `inputs/dashboards/`
(gitignored) before starting.

## How each dashboard was built (repeat this for 22–32)

Follow [docs/dashboards/01-add-a-dashboard.md](../../dashboards/01-add-a-dashboard.md). In short:

1. Look at the image, write the step-1 analysis (domain, style family, grid, palette, fonts, components, signature, imagery swaps, variants).
2. Create `site/dashboards/<id>/index.html`, `style.css`, `app.js`. Copy the skeleton from a finished one (e.g. `larchwood-lodge`):
   - the URL-guard `<script>` first in `<head>`, then `../_shared/base.css`, `style.css`, `../_shared/frame.js`; `app.js` at the end of `<body>`;
   - one IIFE in `app.js` that ends with `document.documentElement.dataset.ready = 'true';`;
   - all colours as tokens in `:root` (`--bg --surface --surface-2 --border --text --text-muted --text-subtle --accent --accent-fg --accent-soft --focus --chart-1`, fonts, radii) plus two `[data-variant="…"]` blocks;
   - a unique 2-letter class prefix (used: pa se kp cr rt hl ar ls pd vc mm tf pw pl hv lw);
   - fictional brands, people and data only; dates relative to today; no timers or polling; loading/empty/error/populated states;
   - body ≥ 14px, labels ≥ 12px, tap targets ≥ 44px, WCAG AA contrast, visible focus, reduced motion respected, no horizontal scroll at 375px.
3. Add the entry to `catalog/dashboards.json` (copy the shape of an existing entry: name, style_family, use_cases, mode, summary, mood, best_for, avoid_when, layout, components, signature, palette, fonts, variants, maps_to_theme, source_note, path, number, status).
4. Add a `thumb.jpg` preview (see the add-a-dashboard doc; existing ones are JPEG screenshots of the default variant).
5. Run `node scripts/build.mjs` then `node scripts/dashboards-check.mjs <id>` until clean; view screenshots at 1440 and 375.
6. Update the reference's row in `_batch-log.md` to `done`.
7. Commit only that dashboard: `Add dashboard N: <Name> (<style>, <use case>)`.

Helper scripts Devin used (`inputs/tools/`: a chart/icon kit inlined into each `app.js`, a screenshot script and an add
script) are gitignored, so they are not in the repo. The finished `app.js` files contain those helpers inline
(`$`, `$$`, `svg`, `paintIcons`, `seg`, `lineChart`, `barChart`, `donut`, `arcGauge`, `spark`, `fmtDate`, `dayOffset`), so copy what you need from them.
Devin also attached the helper scripts and per-dashboard source notes as `devin-inputs.tgz` in its final chat message.

## Open items for review

- Prism Workspace and Plumage Bird Survey report `unknownBg=4` in the dev screenshot tool (not in the formal check, which passes). Not investigated.
- Hollow Vault was deliberately reframed from paid crypto loot boxes to keys earned in play with drop rates shown.
- Final full pass not yet run for the whole gallery: `node scripts/build.mjs`, `node scripts/dashboards-check.mjs` (all), `node scripts/screenshot.mjs`, and a visual review of all screenshots.
- No shared files (`_shared/`, `design-system/`, `tools.json`, `AGENTS.md`) were changed.

## Architect review (Claude, 2026-11-13), read before building 22–32

All 16 Devin dashboards were reviewed visually (thumbnails + 375px renders) and re-checked. Quality is high and every one reads as its own style. Changes made in review:

- **New automatic checks** in `scripts/dashboards-check.mjs`: text contrast measured on the **real pixels behind each text** in every variant (catches text over art/gradients), and a **12px minimum text size**. All 17 now pass. Expect these to catch you: read the "Contrast lessons" section in `docs/dashboards/01-add-a-dashboard.md`.
- **Contrast fixes** (all were real failures):
  - Haven Listings: hero copy over light art now sits on a scrim panel
  - Taffy Analytics: dusk capsule numbers get their own ink token
  - Canopy Reforest: deeper hero greens/rust; eyebrow uses `--text`
  - Pearlwell Dental: teal/coral hero dark enough for white text
  - Kumo Payroll: sakura active nav uses a `--nav-active` token
  - Solstice Energy: hour labels lifted above the sun arc, dial units on a chip, legend above the art, glacier muted text lighter
  - Horizon Weather: dawn sky darker behind the temperature, stronger phone scrim, 11px labels raised to 12px
- **Renamed** `smile-dental` → `pearlwell-dental` so the id matches the brand. Rule now in the workflow: the id starts with the brand word.
- `unknownBg=4` (Prism, Plumage) was the gradient-clipped headline number and glass panels; the new pixel check measures them and both pass.
- Hollow Vault's reframe (keys earned in play, drop rates shown, no purchases) is approved.
- Class prefixes in use: pa se kp cr rt hl ar ls pd vc mm tf pw pl hv lw (pick a new one for each new dashboard).

