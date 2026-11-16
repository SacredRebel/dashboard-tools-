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
| 2 | Blocks where the reference's are | Yes | layout.json boxes |
| 3 | Uses the screen as the reference does | Yes | |
| 4 | Right style framework / depth | Yes | F2+F7+F11 |
| 5 | Art part of its surface | Yes | atmosphere + dune panel soft-light |
| 6 | Charts match numbers | Yes | day bars vary |
| 7 | Nothing spilling / empty below fold | Yes | |
| 8 | Inner pages belong | Yes | Progress/Sessions/Profile |
| 9 | Own content | Yes | Mira Nazari sample |
| 10 | Phone top-to-bottom correct | Yes | bottom rail pinned |
| 11 | Variants designed | Yes | dawn/night |

## Tools used (required)

| Element | Tool or method used | Why this one | If a first choice could not run, what replaced it |
|---|---|---|---|
| Layout | `layout.json` boxes in `cqw` | Spec measured by maintainer | — |
| Glass / liquid (F2) | `docs/dashboards/05-style-frameworks.md` F2 + Haven `.hl-card` recipe | Liquid rim, glow, specular, refraction filter | surfaces skill not installed |
| Poured tabs (F7) | F7 radial-fillet recipe | WATER / Share / Daily / bell scoop | — |
| Backdrop (F11) | Cursor `GenerateImage` → `media/atmosphere-dunes.webp` | Luminous dune haze behind glass | Procedural SVG dunes kept as multiply layer |
| Dune panel (F11) | Cursor `GenerateImage` → `media/dune-panel.webp` | Silk greeting surface | Prior `dune-silk` kept as archive |
| Colour (F12) | Pillow sample of `reference.jpg` regions | Sage/cream/olive/amber/teal tokens | — |
| Type (F13) | Fraunces + Plus Jakarta (`_vendor/fonts`) | Thin display serif + UI sans | — |
| Motion (F14) | Motion vendored + CSS | Entrance / live toast gated | — |
| Avatars | Existing `media/gather.webp`, `profile.webp` | Fictional faces already original | — |
| Component behavior | Repo rulebook | 44px, focus, reduced motion | — |
| Judging | Compare sheet + opened screenshots | Twin contract §6 | — |

## Owner requirements

| Id | What was done | Evidence | 1440 | 768 | 375 |
|---|---|---|---|---|---|
| R1 | One-wide cqw board; no phone mockups | frames/desktop.jpg · compare | Yes | Yes | Yes |
| R2 | Liquid glass + teal/amber glows | water/gather/daily | Yes | Yes | Yes |
| R3 | Poured WATER / Share / Daily / bell | compare + overview | Yes | Yes | Yes |
| R4 | Today/Progress/Sessions/Profile pages | click log | Yes | Yes | Yes |
| R5 | 375 Today≈left, Profile≈right, bottom bar | frames/phone.jpg | n/a | n/a | Yes |
| R6 | Beads, water, day bars, buttons mutate | dead-controls ✔ | Yes | Yes | Yes |

## Material look-fix-look (this pass)

| Round | What I saw (opened screenshots) | What I changed |
|---|---|---|
| 1 | Board too flat/dark; glass short of F2; no luminous silk behind panes | Generated atmosphere + dune panel; F2 5-layer glass; cream/teal/amber tints; organic radii |
| 2 | Atmosphere too olive; bell scoop tight; liters washed | Lightened haze; larger arc scoop; opaque liters chip |
| 3 | Pour fillets small; image resolution gate; Tools table missing | Larger `--f` fillets; 2560w atmosphere; filled Tools used |

## Result

**Finished with a stated gap**

Remaining: reference title flourishes and painted character art still denser than generated avatars; poured junctions can go denser at 200% zoom. Spec gates green. Do not merge.
