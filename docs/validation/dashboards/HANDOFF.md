# Deep polish handoff

Branch: `cursor/deep-polish-0545`  
Brief: `prompts/cursor-deep-polish.md` (also uploaded as `cursor-deep-polish.md`)  
Do **not** merge until architect review.

## Done

### Framework (§2)
- `_shared/fx/` — reveal, count, draw, spotlight, tilt, magnet, split, shine, parallax, ambient, sparks, list, odo + `fx.css` / `index.js`
- `_shared/icons/` — Lucide-compatible paths + hover animations (ISC)
- `_shared/lottie/` — original success/loading/empty/weather JSON
- `_vendor/dotlottie-web@0.49.0/` — MIT
- `_shared/dense-pages.js` + `dense-pages.css` — stub replacement kit (density gates)
- Docs: `10-materials.md`, `11-hero-art-direction.md`, `12-microinteractions.md`, `13-high-end-checklist.md`; `08` fidelity L1–L5
- Tokens: `--mat-*` recipes + `.mat-*` helpers in `_shared/base.css`
- Site `#/fx` Motion & FX page; catalog `fx_effects` / `material_recipes` + per-dashboard `fx` / `materials` validated in `build.mjs`
- `scripts/fidelity.py` (+ `--all` / `--after`)
- Stub host CSS removed from `_shared/base.css`
- `DB.route` View Transitions / 180ms cross-fade
- Shared stub CSS deleted; `scripts/wire-dense-pages.py` for batch wiring

### Dashboards deep-polished to check ✔ (with fidelity notes)
1. **cortex-well** — three-column brain bowl rebuild, new art, Analytics/Vitals/Settings, FX (commit `Deep polish 1`)
2. **mallow-music** — clay hero art, dense pages, FX (commit `Deep polish 2`)
3. Batch dense-page wire + legacy-route disable across remaining stub dashboards
4. Verified in batch: canopy-reforest, copper-radar, ember-rooms, tidebath-showroom, meridian-labs (grid fix)

## In progress / remaining
- Full `node scripts/dashboards-check.mjs` (all 38) was running at handoff — confirm green before merge
- Honest **POLISH-AUDIT** rewrite (axes + reasons; no uniform 4.5) — started only for cortex/mallow fidelity md files
- Per-dashboard art (G2), composition (G3), type (G6), Lottie moments — only cortex + mallow have new GenerateImage heroes so far
- Priority queue still needs dedicated art/layout passes: kumo, ridgeline, pulsar, glacier, citadel, solstice, hollow, taffy, pebble, dune, orbit, larchwood, aether, then catalog order
- Regenerate all site screenshots including `#/fx` via `node scripts/screenshot.mjs`
- PR: open from `cursor/deep-polish-0545` (ManagePullRequest unavailable in this agent; compare URL below)

## Compare / PR
https://github.com/SacredRebel/dashboard-tools-/compare/main...cursor/deep-polish-0545

## Architect notes
- Do not weaken `dashboards-check.mjs` gates
- Dense-page kit is a density/stub fix, not full visual-language parity — still needs per-dashboard art + materials polish for template-grade
- Cortex phone rail layout is improved but still not reference-perfect
- Some apps may still contain neutralized `DB._legacyRouteDisabled` stubs — safe to delete in a cleanup commit
