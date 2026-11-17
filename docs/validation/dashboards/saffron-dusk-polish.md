# Polish report: Saffron Dusk (`saffron-dusk`)

## Identity (written before any code)

```
Form:        One wide dusk board (adaptation of twin phones); vertical glass rail; left Today + right Profile at 1440; at 375 Today=left, Profile=right, bottom tab bar
Frameworks:  F2 Liquid glass · F7 Organic poured tabs · F11 Backdrop/hero art · F12 Colour · F13 Fraunces + Plus Jakarta · F14 Motion
Signature:   Twin-phone liquid language on one desktop board; sun-arc with poured bell; teal water + amber gather glows; dune silk greeting
Not this:    Not Haven poured device frame; not Pulsar tiles; not twin phone shells on desktop
```

## Evidence

- Side-by-side: `docs/validation/dashboards/saffron-dusk-compare.jpg`
- Captures: overview ☑ · full length ☑ · every page ☑ · phone ☑ · tablet 768 ☑ · variants ☑
- `node scripts/dashboards-check.mjs saffron-dusk`: ✔

## The eleven questions

| # | Question | Yes / No | Note |
|---|---|---|---|
| 1 | Same form as its own reference | Yes | Wide adaptation, not twin phones |
| 2 | Blocks where the reference's are | Yes | layout.json boxes incl. rail-item, arc-times, bell, dune-line |
| 3 | Uses the screen as the reference does | Yes | |
| 4 | Right style framework / depth | Yes | F2+F7+F11 |
| 5 | Art part of its surface | Yes | atmosphere + dune panel + ridge lines |
| 6 | Charts match numbers | Yes | day bars vary |
| 7 | Nothing spilling / empty below fold | Yes | person card fills lower half |
| 8 | Inner pages belong | Yes | Progress/Sessions/Profile |
| 9 | Own content | Yes | Mira Nazari sample |
| 10 | Phone top-to-bottom correct | Yes | bottom rail pinned |
| 11 | Variants designed | Yes | dawn/night |

## Tools used (required)

| Element | Tool or method used | Why this one | If a first choice could not run, what replaced it |
|---|---|---|---|
| Layout | `layout.json` boxes in `cqw` + three media queries (desktop / tablet / phone) | Spec measured by maintainer; R7 distinct layouts | — |
| Glass / liquid (F2) | `docs/dashboards/05-style-frameworks.md` F2 + Haven `.hl-card` recipe | Liquid rim, glow, specular, refraction filter | surfaces skill not installed |
| Poured tabs (F7) | F7 radial-fillet recipe | WATER / Share / Daily / bell scoop | — |
| Backdrop (F11) | Cursor `GenerateImage` → `media/atmosphere-dunes.webp` | Luminous dune haze behind glass | Procedural SVG dunes kept as multiply layer |
| Dune panel (F11) | Cursor `GenerateImage` → `media/dune-panel.webp` + SVG `dune-line` ridges | Silk greeting + ≥3 layered ridge lines | Prior `dune-silk` kept as archive |
| Arc / sun | Inline SVG polyline + glow filter in `app.js`; shell mask for bell scoop | Soft glow around sun; times in darker band; bell outside mask | — |
| Rail | Transparent glass items + circular active glow ring on icon | Reference: no black tiles | — |
| Colour (F12) | Pillow sample of `reference.jpg` regions | Sage/cream/olive/amber/teal tokens | — |
| Type (F13) | Fraunces thin display + Plus Jakarta tracked caps (`_vendor/fonts`) | R8: RAMADAN / Good evening thin high-contrast serif | — |
| Motion (F14) | Motion vendored + CSS | Entrance / live toast gated | — |
| Avatars | Existing `media/gather.webp`, `profile.webp` | Fictional faces already original | — |
| Component behavior | Repo rulebook | 44px, focus, reduced motion | — |
| Judging | Compare sheet + opened screenshots (3 rounds) | Twin contract §6 | — |

## Owner requirements

| Id | What was done | Evidence | 1440 | 768 | 375 |
|---|---|---|---|---|---|
| R1 | One-wide cqw board; no phone mockups | frames/desktop.jpg · compare | Yes | Yes | Yes |
| R2 | Liquid glass + teal/amber glows | water/gather/daily | Yes | Yes | Yes |
| R3 | Poured WATER / Share / Daily / bell | compare + overview | Yes | Yes | Yes |
| R4 | Today/Progress/Sessions/Profile pages | click log | Yes | Yes | Yes |
| R5 | 375 Today≈left, Profile≈right, bottom bar | frames/phone.jpg | n/a | n/a | Yes |
| R6 | Beads, water, day bars, buttons mutate | dead-controls ✔ | Yes | Yes | Yes |
| R7 | Three distinct layouts: desktop absolute cqw board; tablet two-column CSS grid reflow; phone stacked Today/Profile with bottom rail — never swaps one for another | frames/desktop.jpg · frames/tablet.jpg · frames/phone.jpg · style.css media queries | Yes | Yes | Yes |
| R8 | Thin high-contrast Fraunces for RAMADAN + Good evening; small tracked caps for IMSAK/IFTAR/WATER/labels | overview + dune panel + compare | Yes | Yes | Yes |

## Material look-for-look (this pass)

| Round | What I saw (opened screenshots) | What I changed |
|---|---|---|
| 1 | Black rail tiles; times stacked with labels; missing data-refs; water chip; empty person; bell clipped by mask | Transparent rail + glow; labels above / times in band; tagged boxes; plain water count; shell+bell outside mask |
| 2 | Rectangular active “tile” look; bell over iftar time @375; person lower empty; sun hard-edged | Circular icon-only glow; times clear of bell; soft sun glow layers; person stats flex fill |
| 3 | Compare: rail glass+ring OK; arc times+bell readable; person still airy below stats | Stats stretch with notes; divider full height; refreshed frames + compare |

## Compare-sheet rounds (required)

| Round | Differences I named | Fixed |
|---|---|---|
| 1 | Rail black tiles vs light-on-glass; times not in darker band; missing ridge lines; water chip; empty person; bell text clipped | Yes |
| 2 | Active glow read as dark tile; bell overlapped 6:08PM at 375; sun ring hard; person empty band | Yes |
| 3 | Person lower half still sparse vs reference; iftar gold vs cream balance | Yes |

## Result

**Finished with a stated gap**

Remaining: reference title flourishes and painted character art still denser than generated avatars; poured junctions can go denser at 200% zoom. Spec gates green. Do not merge.
