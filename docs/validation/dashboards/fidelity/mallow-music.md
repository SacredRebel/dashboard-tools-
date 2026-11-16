# Fidelity — mallow-music

**Example chosen:** Meridian Labs (flat cream board; clay blocks on a plain surface). Not Haven (no photo-frame / poured glass). `signature_tech: []` — no WebGL / no hero-poster step.

**Reference UI box:** `18, 68 → 708, 1035` → **W = 690 · H = 967** (aspect `690 / 967`).

Sheets: [compare](mallow-music-compare.jpg) · [overlay](mallow-music-overlay.jpg) · [side](mallow-music.jpg)

## Step 1 — block inventory

| Block | left % of W | top (cqw) | width % of W | height (cqw) | radius (cqw) | made of / outline |
|---|---|---|---|---|---|---|
| Board | 0 | 0 | 100 | 140.1 | 4.5 | cream clay · rounded rect |
| Mint sidebar | 1.2 | 1.6 | 19.4 | 136.5 | 3.8 | mint clay · rounded rect |
| Sidebar avatar disc | 4.2 | 3.5 | 13.5 | 13.5 | 50% | scooped cream circle + clay girl photo |
| Nav items ×7 | 2.4 | 22 → 58 | 17 | ~4.6 each | 2.2 | icons + labels; active = raised cream pill |
| Go Premium card | 2.6 | 108 | 16.6 | 28 | 2.8 | peach clay · crown · Upgrade Now |
| Peach hero | 24 | 8.5 | 73.5 | 22 | 3.2 | peach clay shelf · hero art left · copy · plant right |
| KPI ×4 | 24 / 42.5 / 61 / 79.5 | 33 | 16.8 | 18 | 2.6 | mint / peach / butter / sky · raised icon tile |
| Listening overview | 24 | 54 | 44 | 28 | 2.6 | cream clay · pastel pill bars Mon–Sun |
| Top genres | 70 | 54 | 27.5 | 28 | 2.6 | cream clay · clay donut + legend |
| Recently played | 24 | 85 | 36 | 28 | 2.6 | list · cover thumbs · round play |
| Daily mix | 62 | 85 | 35.5 | 28 | 2.6 | photo tile armchair · Chill Vibes |
| Discover banner | 24 | 116 | 73.5 | 10 | 3.2 | mint-blue · star · Explore Now |

### Colors
Backdrop `#f6e4d0` · board `#fcead4` · mint `#c5d0c2` · peach `#ffd8bc` · text `#3a2a20`.

## Screenshot log
- Step 2–6: desktop 1440 overview — mint sidebar, peach hero, 4 KPIs, charts, recent/mix, discover; clay shadows. Phone 375 — stacked flow, no sideways scroll.
- Inner pages library / activity / settings: real product markup (no stubs / dense-pages).
- Round 1–3 compares → `mallow-music-compare.jpg` opened each round.
- `node scripts/build.mjs` + `node scripts/dashboards-check.mjs mallow-music` → ✔

## Remaining diffs (after round 3)
Layout/shape/type still open for a designer pass:
1. Hero clay girl still reads a bit more “contained” than the reference’s overhang (reference girl sits lower across the shelf lip).
2. Sidebar is slightly narrower; nav type is a touch smaller than the reference.
3. KPI icon tiles are flatter SVG than the reference’s raised clay icons.
4. Listening bars are taller / closer to the card ceiling than the reference’s breathing room.
5. Genre donut is smaller; legend density differs.
6. Album thumbs and Daily Mix photo are original GenerateImage stand-ins (mood-aligned, not the reference’s exact renders).

Needs new images (honest stop, like Meridian’s bottle/avatar note):
- Photoreal clay icon tiles for KPIs, crown, and a more overhanging hero crop would need another image pass / owner GPU tools from `03-asset-and-tool-map.md` (default route used: CSS clay + GenerateImage).

## Tool fallbacks used
- Measured reference with Pillow (no screenshot-to-code).
- Clay materials via CSS two-tone shadows (playbook Step 5).
- Original GenerateImage for avatar, daily-mix, star, covers; existing `head.webp` for hero.
- No WebGL / no `hero-poster.mjs` (`signature_tech: []`).
