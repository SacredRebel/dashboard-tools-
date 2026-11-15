# Haven Listings — fidelity blueprint (r4)

Measured from `reference.jpg` (736×920, aspect 0.800) with Pillow. Screenshot-to-code tools unreachable (no API keys) — structure from measurement only.

## Canvas

| | |
|---|---|
| Target UI aspect | ~0.80 portrait device frame on alpine page |
| Outer page | Pale grey alpine rock (misty) |
| Frame | ~88% width, ~78% height of first viewport; radius ≈ 6% of frame width |
| Grid | Single floating stage; no below-fold overview cards |

## Modules (% of frame)

| Module | x | y | w | h | Shape |
|---|---|---|---|---|---|
| Notch header (filters) | 27% | 0% | 46% | 9% depth | `notchFrame` center dip |
| Buy pill | 8% | 2% | 14% | 6% | pill in left notch |
| Rent pill | 78% | 2% | 14% | 6% | pill in right notch |
| Left rail | 3% | 18% | 7% | 55% | poured white pill |
| Hero type | 14% | 28% | 48% | 22% | translucent white display |
| Find card | 12% | 68% | 32% | 26% | white + scooped TR |
| Listing glass | 52% | 58% | 42% | 36% | `mat-glass-frost` + `scoop` TR |
| Brand FAB | 48% | 88% | 8% | — | round indigo overlap BL of glass |

## Colors (sampled)

- Backdrop page: `#a59c93`–`#ece3dc`
- Header / pills: `#e3d9d0` / white
- Sky hero text zone: `#d5e5f2`
- Glass card body: deep indigo/violet frosted (`#221854` region under glass)
- Accent: `#2a2470`

## Outline inventory (not rounded-rect)

1. Device frame top = `notchFrame` with concave shoulders
2. Find card top-right scoop
3. Listing card top-right scoop nesting arrow button

## 3D

None required (signature_tech: shape, glass).

## Element inventory

Caps labels TL/TR · Buy/Rent pills with arrow chips · 3 filter selects · rail icons (home, search, grid, message) · avatar · bell · settings/theme pills · 2-line hero · lede · Find card + 10K+ + 3 thumbs + arrow · glass listing (title, pin address, specs, 3 action rounds) · indigo FAB.

## Overview removals (r4)

Matching homes · Price history · Your viewings · Agent notes → Listings / Showings pages only.

## Compare loops

| Loop | Notes |
|---|---|
| 1 | Structure + notch depth |
| 2 | Glass + scoop alignment |
| 3 | 50% overlay module edges |

## Compare loops (executed)

1. Structure + notchFrame bind; removed below-fold overview cards.
2. Glass count ≥3 (filters, detail, find, haze); denser secondary pages.
3. AA hard-stops on filters/hero; alpine 2400px; check ✔.

Remaining visible diffs vs reference: villa crop vs owner photo; agent avatar is gradient not photo; Buy/Rent notch fillet still slightly less “poured” than the reference shoulders.
