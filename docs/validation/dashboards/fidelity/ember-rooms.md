# Polish report: Ember Rooms (`ember-rooms`)

> Fill this in for every build or finishing pass. Method: [docs/dashboards/06-verification.md](../../06-verification.md). Save as `docs/validation/dashboards/fidelity/<id>.md`.

## Identity (written before any code)

```
Form:        Near-white neumorphic board ~94vw with poured title tab at top centre; slim icon rail; search + three orbs; centre concentric rings with pale three.js dome shade; small light 12/7 + power; room chips on the ring's left arc; left column intensity/schedule/donut; right usage/peak/video.
Frameworks:  F5 neumorphic · F8 3D pale dome lamp (three.js) · F12 near-white + orange · F13 Outfit light readout · F14 entrance/draw/hover; lamp glow ↔ intensity
Signature:   Large pale dome pendant (real WebGL) hanging into soft orbit rings, with left-arc room chips and an orange inset donut — not a photo-in-box.
Not this:    Not Haven's villa frame; not a tiny dark metal cone; not a sun-icon gauge; not scattered full-orbit room chips; not a giant 12/7 headline.
```

## Evidence

- Side-by-side (reference | ours): `docs/validation/dashboards/fidelity/ember-rooms-compare.jpg`
- Phone: `docs/validation/dashboards/fidelity/ember-rooms-phone.jpg`
- Captures looked at: overview ☑ · overview full length ☑ · every page ☑ · phone full length ☑ · each variant ☑
- `node scripts/build.mjs`: ✔ · `node scripts/dashboards-check.mjs ember-rooms`: ✔

## The eleven questions

| # | Question | Yes / No | Note |
|---|---|---|---|
| 1 | Same form as its own reference, and unlike other dashboards | Yes | Poured tab + neu board + left-arc rings; layout.json boxes tagged |
| 2 | Blocks and heading breaks in the reference's places | Yes | layout.json gate ✔ at 1440 |
| 3 | Uses the screen as the reference does | Yes | Frame ≥90vw, aspect in 0.5–0.62 |
| 4 | Right style framework and depth on each surface | Yes | F5 paired shadows; near-white surface |
| 5 | Art is part of its surface; 3D is really 3D | Yes | WebGL dome shade ≥220px; poster fallback |
| 6 | Charts match their numbers | Yes | Usage 42 / Peak 9.4 |
| 7 | Nothing spilling, overlapping or empty below the fold | Yes | Full-length captures clean |
| 8 | Inner pages belong to this product | Yes | Rooms / Devices knob / Energy / Settings |
| 9 | All content is this dashboard's own | Yes | English labels; no traced reference art |
| 10 | Phone reads correctly top to bottom | Yes | Lamp → 12/7 → power → rooms → controls → cards; tab bar pinned |
| 11 | Every variant is designed and readable | Yes | mist / dusk tokens |

## Rounds

| Round | What I saw | What I changed |
|---|---|---|
| 1 | Layout gate failed (no data-ref / wrong proportions) | Rebuild overview in cqw from layout.json; poured tab; left-arc rooms; donut with inset |
| 2 | WebGL crash (`stage.fill`); room centres past x=38; contrast / 12px | Fix lamp module; tighten arc angles; darker accent + min 12px type |
| 3 | Phone order wrong (power before readout); dome still too metal | Flex phone stack with lamp first; paler matte dome; re-check ✔ |

## Used

- Interactions tested: intensity → lamp glow; power; room chips; schedule; play; climate ±; settings validate; undo/redo
- Keyboard and reduced motion: canvas arrows; CSS reduced-motion zeros entrance/draw

## Result

**Finished with a stated gap**

Remaining gaps and why:
- Reference collage uses Chinese micro-labels; twin keeps invented English.
- Dome is a procedural sphere (pale matte), not a photoreal GLB — same family as the reference, not pixel-identical.
- Climate panel in the reference collage is the Devices page, not a second overview variant.
