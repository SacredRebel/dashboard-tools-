# Deep polish handoff

Branch: `cursor/deep-polish-0545`  
Brief: `prompts/cursor-deep-polish.md`  
PR: https://github.com/SacredRebel/dashboard-tools-/pull/6 (draft — **do not merge**)

## Done this stretch

### Gate fixes (commit `9bcd884`)
- Hero media upscaled past 1.5× + `srcset` (kumo, horizon, haven, lull, aura, peers)
- Dense-page kit: opaque fills, `min-height: 72vh`, `--mat-clay-fill` fallbacks
- Aura dense ink panels (haze no longer fails contrast)
- Haven: outer `<main>`, denser overview (agent notes), secondary pages fill height
- Horizon: opaque `.hw-hero-copy` plate; reveal no longer starts at `opacity: 0`
- Reveal-boot + opacity:1 pre-reveal across boards that skipped legacy `DB.route`

### G2/G3 — Canopy Reforest
- New layered leaves hero (GenerateImage → WebP 1x/2x) + foreground leaf layer
- Opaque clay hero copy plate; deeper clay tile shadows
- Forest scene srcset; `media/CREDITS.md` updated

### Verified green (this stretch)
`horizon-weather`, `kumo-payroll`, `haven-listings`, `aura-ring`, `lull-sleep`, `canopy-reforest`  
(plus earlier cortex/mallow and batch densers from prior commits)

## Still open (architect)

1. Finish / consume full `node scripts/dashboards-check.mjs` on all 38 after this push; fix any new fails without touching gates.
2. Honest POLISH-AUDIT (no uniform 4.5) — rewritten this stretch; keep updating per dashboard.
3. Remaining G2 hero art: kumo moon/pagoda/koi frame, ember lamp+ring, copper radar arc, tidebath 3D carousel, hollow relics, citadel holo, glacier dial, forge athlete, clima orbs…
4. Remaining G3 composition: copper half-radar, tidebath CSS 3D, ember lamp stage, meridian DNA columns, ridgeline clay pies, phone compositions.
5. `node scripts/screenshot.mjs` including `#/fx`.
6. ManagePullRequest may be unavailable — update PR body carefully if editing (preserve human edits).

## Compare
https://github.com/SacredRebel/dashboard-tools-/compare/main...cursor/deep-polish-0545?expand=1
