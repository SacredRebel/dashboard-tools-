# Polish report: Ember Rooms (`ember-rooms`)

> Fill this in for every build or finishing pass. Method: [docs/dashboards/06-verification.md](../../06-verification.md). Save as `docs/validation/dashboards/fidelity/<id>.md`.

## Identity (written before any code)

```
Form:        Flat white–grey neumorphic board filling the viewport width (no outer device frame, no poured Haven header). Soft-pill icon rail on the far left; top row = search pill + centred brand + undo/redo/settings orbs. Centre = large soft concentric rings with a pendant lamp hanging from the top edge; thin "12/7" numerals + round power under the lamp; round room chips on the rings. Left of rings: intensity slider, schedule times, orange ring gauge. Right: line-chart tiles + dark room-view tile. Second page (Devices) = thermostat knob scene with orange arc, ± buttons, mode chips, wind slider. Density: airy, lots of same-colour surface.
Frameworks:  F5 neumorphic — board, rail, chips, slider track, gauge, knob (paired light/dark shadows; surface == page) · F8 3D object — brushed-aluminium pendant (LatheGeometry shade + cord + emissive disc on transparent canvas; glow ↔ intensity) · F12 colour — white-grey tokens + orange accent + soft blue charts · F13 type — Outfit geometric sans; oversized thin numerals · F14 motion — board/tiles/hero entrance stagger, chart draw, hover lift, page cross-fade, lamp reacts to slider + drag
Signature:   Brushed-aluminium three.js pendant lamp on a thin cord hanging from the top edge into soft concentric rings, with "12/7" + orange power and orbiting room chips — emissive glow driven by the intensity slider.
Not this:    Not a photo of a lamp in a white rectangle; not flat grey cards; not Meridian's three-column helix board / header / layout.
```

## Evidence

- Side-by-side (reference | ours): `docs/validation/dashboards/fidelity/ember-rooms-compare.jpg`
- Captures looked at: overview ☑ · overview full length ☑ · every page ☑ · phone full length ☑ · each variant ☑
- `node scripts/build.mjs`: ✔ · `node scripts/dashboards-check.mjs ember-rooms`: ✔

## The eleven questions

| # | Question | Yes / No | Note |
|---|---|---|---|
| 1 | Same form as its own reference, and unlike other dashboards | Yes | Flat neu board + hanging lamp centre; not Meridian/Haven chrome |
| 2 | Blocks and heading breaks in the reference's places | Yes | Rail / rings / left stack / right tiles within a few % |
| 3 | Uses the screen as the reference does | Yes | Board sized by width (~1120px), not height-squeezed |
| 4 | Right style framework and depth on each surface | Yes | F5 paired shadows strengthened; continuous surface==page |
| 5 | Art is part of its surface; 3D is really 3D | Yes | Transparent WebGL lamp (not photo-in-box); room tile masked |
| 6 | Charts match their numbers | Yes | Usage peaks at 42; Peak ends at 9.4 |
| 7 | Nothing spilling, overlapping or empty below the fold | Yes | Full-length captures clean after phone gauge fix |
| 8 | Inner pages belong to this product | Yes | Rooms / Devices knob / Energy / Settings — no dense kit |
| 9 | All content is this dashboard's own | Yes | Invented English; no Chinese brand marks |
| 10 | Phone reads correctly top to bottom | Yes | Gauge absolute restored; tab bar pinned; no sideways scroll |
| 11 | Every variant is designed and readable | Yes | mist/dusk continuous surface + darkened text tokens |

## Rounds

| Round | What I saw | What I changed |
|---|---|---|
| 1 | WebGL lamp + neu board; fraction 12/10; workspace branch collision | Isolated worktree; empty rebuild; room on-states → 12/7 |
| 2 | Check ✖ subtle greys / thin pages / BR on orange | Darkened tokens; enriched pages; hid active chip codes |
| 3 | Check ✔; phone gauge looked like a vertical pill (static reset) | Deep pass: F5 stronger shadows + surface==bg; F8 bell lathe + scale margin + cord from top; F14 page cross-fade; phone absolute restore for gauge/play |
| 4 (deep) | Opened r4-overview / glow@100% / phone — lamp live, glow tracks slider, gauge circular again | Poster regenerated; compare refreshed; report completed |

## Used

- Interactions tested: intensity 0→100 → lamp emissive; power; room chips; schedule; play; climate ± / cool / wind; settings validate + preview states; undo/redo; Rooms search empty
- Keyboard and reduced motion tested: canvas ArrowLeft/Right; CSS reduced-motion zeros entrance/draw/page-in; charts end at final dashoffset

## Result

**Finished with a stated gap**

Remaining gaps and why:
- Reference collage is denser (Chinese micro-labels / orbit chrome). Twin keeps invented English and a slightly airier chip orbit — content choice, not a layout miss.
- Pendant shade is a procedural lathe approximation of the reference render (no photoreal GLB). Metal, cord, emissive disc, and intensity-linked glow are real three.js; the exact shade curve is not pixel-identical.
