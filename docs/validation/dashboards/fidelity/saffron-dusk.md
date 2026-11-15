# Saffron Dusk — fidelity blueprint (r4)

## Target
Twin **phone** heroes (not desktop strips): cream Today + dark Profile, both `mat-glass-liquid`. Alpine-slate stage gradient behind. Signature tech: **glass + shape**.

## Measured layout (1440 overview)
- Stage: full-bleed slate-green gradient; phones centered, each ~40vw / max 460px, min-height ~640px, radius 36px.
- Today (cream `#f3eee4`): DOW chip · “Fasting {day}” Fraunces title · date pills · sun-arc card (Imsak / Iftar) · water + gather glass cards · wave path · bottom nav.
- Profile (dark `#1a2218`): greeting · person card · daily progress `tabCard` · day bars · bottom nav.
- Removed desktop KPI strips; secondary routes use `_shared/ui` on light paper.

## Tools
- Screenshot-to-code: **unreachable** — measured with Playwright + Pillow from gallery frames / live render.
- Image-to-3D: **unreachable** — no GLB; phones are CSS liquid glass shells (not photos-in-boxes).

## Shape / glass
- `data-shape="wave"` path under today modules; `tabCard` on daily progress; stage-span wave SVG for width coverage.
- Inner cards: `mat-glass-frost` / `mat-glass-liquid` with backdrop-filter (phone shells opaque for AA).

## Compare loops
Three check + visual loops; AA fixed by removing `color`/`-webkit-text-fill-color !important` that blocked the pixel-contrast auditor; night keeps cream Today + dark Profile.
