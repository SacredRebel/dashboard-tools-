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
- Captures: overview ☑ · full length ☑ · every page ☑ · phone 375 ☑ · tablet 820 ☑ · checker tablet 1024 ☑ · variants ☑
- `node scripts/dashboards-check.mjs saffron-dusk`: ✔ (pages=4, variants=3, frames + shot@2x · pixel contrast · text ≥ 12px)

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
| Arc / sun | Inline SVG polyline ending at the sun + CSS cream disc and halo (`--cream`, `--gold`, `--saffron`) | Stretched SVG circles inherited a dark stroke and read as a black bullseye | — |
| Arc lower half | Shell `linear-gradient` frost (cream → olive → deep green), times row transparent | Solid black stripe on `.sd-arc-times` had a hard edge | — |
| Profile name | Copy block offset with `margin-left` clear of the overlapping avatar | Avatar covered “Mira Nazari” | — |
| Water litres | Plain `.sd-meta` under the segments, no fill, radius, or shadow | Dark chip behind the litres line | — |
| Gather pill | `border-radius: 999px` on a short wide card (desktop height 11cqw, within the layout tolerance) | Stadium on the tall box read as a round blob | — |
| Rail | Transparent glass items + circular active glow ring on icon | Reference: no black tiles | — |
| Colour (F12) | Pillow sample of `reference.jpg` regions | Sage/cream/olive/amber/teal tokens | — |
| Type (F13) | Fraunces thin display + Plus Jakarta tracked caps (`_vendor/fonts`) | R8: RAMADAN / Good evening thin high-contrast serif | — |
| Motion (F14) | Motion vendored + CSS | Entrance / live toast gated | — |
| Avatars | Existing `media/gather.webp`, `profile.webp` | Fictional faces already original | — |
| Component behavior | Repo rulebook | 44px, focus, reduced motion | — |
| Judging | Compare sheet + opened screenshots at 1440, 820, and 375 (round 4) | Twin contract §6 | — |

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
| 4 | Black time stripe, bullseye sun, name under avatar, litres chip, round gather | Frosted lower half with no hard edge; cream sun; name clear; plain litres; wide pill. Layouts stay desktop / tablet reflow / phone stack |

## Compare-sheet rounds (required)

| Round | Differences I named | Fixed |
|---|---|---|
| 1 | Rail black tiles vs light-on-glass; times not in darker band; missing ridge lines; water chip; empty person; bell text clipped | Yes |
| 2 | Active glow read as dark tile; bell overlapped 6:08PM at 375; sun ring hard; person empty band | Yes |
| 3 | Person lower half still sparse vs reference; iftar gold vs cream balance | Yes |
| 4 | Arc: hard black time stripe; sun was a black bullseye; iftar not under IFTAR. Profile name under the avatar. Litres in a dark chip. Gather a round blob | Yes — soft frost gradient, cream sun with halo, iftar right-aligned, name beside the avatar, plain litres, wide pill. Checked at 1440, 820, and 375 |

## Result

**Finished with a stated gap**

Remaining: reference title flourishes and painted character art still denser than generated avatars; poured junctions can go denser at 200% zoom. The desktop gather pill is as wide as the 18.5×14 box tolerance allows (height 11cqw) and is still taller than the reference phone pill. Spec gates green. Do not merge.

## This pass (arc, sun, profile, water, gather)

Five fixes, three layouts left in place (absolute board at 1440, two-column reflow at 820, stacked Today / Profile at 375). Liquid glass, blur, rims, and glows kept.

| Fix | 1440 | 820 | 375 |
|---|---|---|---|
| Arc lower half | Soft cream-to-olive frost; imsak left, iftar under IFTAR; bell tab below the times | Same gradient; times sit above the bell, iftar at the right | Same; no opaque `#12160f` bar |
| Sun | Small cream disc, gold rim, saffron halo; arc stroke ends at the sun | Same circular marker (not stretched) | Same |
| Profile name | “Mira Nazari” starts to the right of the overlapping avatar | Same offset in the reflow card | Profile page avatar overlaps the corner; name and email sit to its right |
| Litres | Plain cream line under the segments, no chip | Plain line | Plain line on one row |
| Gather | Wide amber pill, avatar on the right | Wide pill in the right column | Full-width pill, not a circle |
