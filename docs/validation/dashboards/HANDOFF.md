# Deep polish handoff

Branch: `cursor/deep-polish-0545`  
Brief: `prompts/cursor-deep-polish.md`  
**Do not merge** — architect review required.

## Done

### Framework (§2) ✔
FX library, icons, DotLottie vendor, materials docs 10–13, `#/fx` page, catalog `fx`/`materials` validation, `scripts/fidelity.py`, stub CSS removed, route transitions, dense-pages kit + `wire-dense-pages.py`.

### Dashboards
| Dashboard | Status | Notes |
|---|---|---|
| cortex-well | ✔ check + fidelity md | Full art/layout/pages/motion pass |
| mallow-music | ✔ check + fidelity md | New clay hero + dense pages |
| canopy, copper, ember, tidebath, meridian, glacier, folio, atrium, ridgeline, pulsar, lull, pearlwell, vitalis, hollow, veil | ✔ check (batch) | Dense-page wire + layout/CSS fixes |
| Remaining ~20 | Needs re-check after `grid-column:1/-1` host fix | Legacy stubs neutralized; may still fail art/low-res/width |

## Still open (architect)
1. Re-run `node scripts/dashboards-check.mjs` on **all 38** after host CSS fix; fix remaining fails without touching gates.
2. Honest POLISH-AUDIT rewrite (10 axes, reasons, no uniform 4.5).
3. G2 hero art for remaining signature dashboards (kumo, canopy leaves, hollow, citadel, …).
4. G3 composition rebuilds still thin vs reference (ember lamp ring, copper radar arc, tidebath 3D carousel, etc.).
5. `node scripts/screenshot.mjs` including `#/fx`.
6. Open PR from this branch (compare URL below). ManagePullRequest was not available in this agent.

## Compare
https://github.com/SacredRebel/dashboard-tools-/compare/main...cursor/deep-polish-0545?expand=1
