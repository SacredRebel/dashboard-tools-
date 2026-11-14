# Fidelity — cortex-well

Sheets: [before](cortex-well.jpg) · [after](cortex-well-after.jpg) (after polish)

## Differences (≥15)

| # | Area | Reference | Ours (before) | Fix |
|---|---|---|---|---|
| 1 | Canvas layout | Three columns: card stack · brain stage · right rail | Grid on `<main>` with a single child, so left stack only (~27% width) | Put `display:grid` on `.cx-overview` |
| 2 | Hero art | Large brain in frosted bowl, center stage | Tiny/cropped at bottom of left cluster | New 2× WebP + center column hero |
| 3 | Orbit chips | Pastel spheres around brain | Few CSS orbs, weak | Parallax layers + ambient orbs |
| 4 | Connector lines | Neural leads to widgets | Thin SVG, poorly anchored | Redraw leads relative to stage |
| 5 | Activity pills | Floating glass pills around brain | Stacked over hero | Absolute pill positions around bowl |
| 6 | Materials | Soft glass + inset highlight | Flat-ish white cards | `mat-glass` / `--mat-glass-*` |
| 7 | Right rail | Sleep + HR fill the column | Present but off-canvas due to grid bug | Same as #1 |
| 8 | Performance chart | Delicate line + soft grid | Heavy fill | Lighter grid ink, draw-in FX |
| 9 | Title | Balanced editorial | Orphan risk, purple TODAY | `text-wrap:balance`, accent keep |
| 10 | Nav | Light text tabs | Heavy white pill | Softer glass nav |
| 11 | Secondary pages | Full analytics/report boards | Thin stub cards (<60 leaves) | Dense Report + Settings pages |
| 12 | KPI count-up | Animated feel | Static numbers | `data-fx="count"` |
| 13 | Card hover | Soft depth | Minimal | `data-fx="spotlight"` |
| 14 | Phone | Hero repositioned | Cropped blob risk | Compact top seg + scaled hero |
| 15 | Background | Soft haze full height | Gradient ok but seams risk | Fixed haze layer |
| 16 | Avatar | Illustrated face | Initials only | Keep initials (privacy); soft ring |
| 17 | Sleep bars | Soft neumorph bars | Flat | Clay/neu bar recipe |
| 18 | Density gate | Full board | Fails width/leaves on subpages | Rebuild pages |

## Status

Deep polish in progress on `cursor/deep-polish-0545`.
