# Polish report: Ember Rooms (`ember-rooms`)

> Method: [docs/dashboards/06-verification.md](../../06-verification.md). Twin playbook: [02-reference-twin-playbook.md](../../02-reference-twin-playbook.md).

## Identity (written before any code)

```
Form:        Flat white–grey neumorphic board filling the viewport width (no outer device frame, no poured Haven header). Soft-pill icon rail on the far left; top row = search pill + centred brand + undo/redo/settings orbs. Centre = large soft concentric rings with a pendant lamp hanging from the top edge; thin "12/7" numerals + round power under the lamp; round room chips on the rings. Left of rings: intensity slider, schedule times, orange ring gauge. Right: line-chart tiles + dark room-view tile. Second page (Devices) = thermostat knob scene with orange arc, ± buttons, mode chips, wind slider. Density: airy, lots of same-colour surface.
Frameworks:  F5 neumorphic (board, rail, chips, slider, gauge, knob) · F8 3D object (brushed-aluminium pendant lamp via three.js LatheGeometry) · F12 colour (white-grey + orange accent + soft blue charts) · F13 type (thin geometric sans Outfit; oversized light numerals) · F14 motion (entrance stagger, chart draw, lamp glow ↔ intensity, page cross-fade)
Signature:   Brushed-aluminium pendant lamp on a thin cord, hanging from the top edge into soft concentric rings, with "12/7" + orange power and orbiting room chips — glow driven by the intensity slider.
Not this:    Not a photo of a lamp in a white rectangle; not flat grey cards; not Meridian's three-column helix board / header / layout.
```

## Step 1 · Measure the reference

Reference: `site/dashboards/ember-rooms/reference.jpg` (736 × 1472). UI box lighting overview: **0,0–736,700** → **W=736, H=700**.

| Block | left % | top cqw | width % | height cqw | made of |
|---|---|---|---|---|---|
| Board | 0 | 0 | 100 | 95.1 | neu surface |
| Icon rail | 1.6 | 9.5 | 6.2 | 74.7 | raised neu pill |
| Search | 9.5 | 2.7 | 28.5 | 5.2 | recessed neu |
| Brand | 35.3 | 2.4 | 32.6 | 5.0 | thin sans |
| Tools | 84.2 | 2.4 | 13.6 | 5.4 | neu orbs |
| Lamp WebGL | 38 | 0 | 24.5 | 19 | 3D lathe + cord |
| Rings | 19 | 10.9 | 62.5 | 73.4 | soft neu rings |
| 12/7 | 38 | 59.8 | 24.5 | 16.3 | thin numerals |
| Power | 46.2 | 76.1 | 8.2 | 8.2 | recessed + orange |
| Intensity | 13.6 | 54.3 | 27.2 | 6.8 | neu slider |
| Schedule | 13.6 | 61.1 | 16.3 | 9.5 | text |
| Gauge | 16.3 | 67.9 | 21.7 | 21.7 | orange arc dial |
| Charts | 70.7 | 6.8 | 25.8 | ~22 | neu tiles + lines |
| Room video | 70.7 | 31.2 | 25.8 | 25.8 | dark photo + play |
| Room chips | orbit | — | 6.8 | 6.8 | neu circles |

Colours: bg `#f0f0f0`, surface `#e8e8ea`, accent `#9a3f00`/`#e04e00`, text `#2e3036`, lamp `#b5b9c5`, chart `#6aa3d8`.

## Evidence

- Side-by-side (reference | ours): `docs/validation/dashboards/fidelity/ember-rooms-compare.jpg`
- Captures looked at: overview ☑ · overview full length ☑ · every page ☑ · phone full length ☑ · each variant ☑ (via check)
- `node scripts/build.mjs`: ✔ · `node scripts/dashboards-check.mjs ember-rooms`: ✔

## The eleven questions

| # | Question | Yes / No | Note |
|---|---|---|---|
| 1 | Same form as its own reference, and unlike other dashboards | Yes | Flat neu board + hanging lamp; not Meridian/Haven |
| 2 | Blocks and heading breaks in the reference's places | Yes | Rail / rings / left stack / right tiles align within a few % |
| 3 | Uses the screen as the reference does | Yes | Board sized by width (~1120px) |
| 4 | Right style framework and depth on each surface | Yes | F5 neu shadows; F8 WebGL lamp |
| 5 | Art is part of its surface; 3D is really 3D | Yes | Transparent canvas lamp; room tile masked into dark card |
| 6 | Charts match their numbers | Yes | Usage peaks at 42; Peak ends at 9.4 |
| 7 | Nothing spilling, overlapping or empty below the fold | Yes | Full-length overview/devices clean |
| 8 | Inner pages belong to this product | Yes | Rooms / Devices knob / Energy / Settings — no dense kit |
| 9 | All content is this dashboard's own | Yes | Invented English; no Chinese brand marks |
| 10 | Phone reads correctly top to bottom | Yes | Column flow + fixed bottom rail; codes on active chip hidden for contrast |
| 11 | Every variant is designed and readable | Yes | mist / dusk contrast tokens darkened |

## Rounds

| Round | What I saw | What I changed |
|---|---|---|
| 1 | WebGL lamp + neu board; fraction 12/10; dense kit collision on shared workspace | Isolated worktree; empty rebuild; room on-states → 12/7 |
| 2 | Check ✖: subtle greys failed AA; thin energy/settings; BR label on orange | Darkened text/accent tokens; enriched pages; hid active chip codes |
| 3 | Check ✔; compare shows matching form; phone order readable | Poster regenerated; fidelity report filled |

## Used

- Interactions tested: intensity → lamp glow, power, room chips, schedule times, play, climate ± / cool / wind, settings validate, undo/redo, search filter on Rooms
- Keyboard and reduced motion tested: canvas arrows; CSS reduced-motion zeros animations

## Result

**Finished with a stated gap**

Remaining gaps and why:
- Reference collage is denser (Chinese micro-labels, more orbit chrome). Twin uses invented English and a slightly airier chip orbit — intentional content choice, not a code layout miss.
- Pendant silhouette is a procedural lathe approximation of the reference render (no photoreal GLB); glow and metal read correctly but the shade curve is not pixel-identical.
