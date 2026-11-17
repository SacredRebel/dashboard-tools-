# Polish report: Orbit Clay (`orbit-clay`)

> Method: [docs/dashboards/06-verification.md](../../dashboards/06-verification.md) · contract: [docs/dashboards/00-twin-contract.md](../../dashboards/00-twin-contract.md).

## Identity (written before any code)

```
Form:        Two-screen clay mission board — cream "mission" panel with helmet in a gold ring on the left, dark forest "calibration" panel with layered terrain, spire and gold sphere on the right; desktop joins both into one wide board with a slim icon rail, score strip and side controls
Frameworks:  Clay / skeuomorphic surfaces (matte fills, thick soft edges, dark drop shadow + light highlight, pressed-in states) · layered-paper terrain (three SVG ridge layers with soft shadows) · WebGL compound helmet (three.js, vendored)
Signature:   Forest-green clay astronaut helmet with gold visor mesh and trim inside a gold ring; tan dune ridges with a cream spire and a draggable gold sphere on a rail
Not this:    Phone mockups pasted on a page, a blown-up phone UI, glass cards, purple gradients, the shared .db-dense-* page kit, the reference's garbled text
```

## Evidence

- Side-by-side (reference | ours): `docs/validation/dashboards/orbit-clay-compare.jpg`
- Captures looked at: overview ☑ · overview full length ☑ · every page ☑ · phone full length ☑ · each variant ☑
- Screenshots: `orbit-clay-desk-1440.png` · `orbit-clay-tablet-820.png` · `orbit-clay-phone-375.png` · `orbit-clay-library-1440.png` (this folder)
- `node scripts/build.mjs`: ✔ · `node scripts/dashboards-check.mjs orbit-clay`: see final run below

## The eleven questions

| # | Question | Yes / No | Note |
|---|---|---|---|
| 1 | Same form as its own reference, and unlike other dashboards | Yes | Cream mission + forest calibration split is unique to this dashboard |
| 2 | Blocks and heading breaks in the reference's places | Yes | Every `layout.json` box is a real `data-ref` element placed in `cqw` |
| 3 | Uses the screen as the reference does | Yes | Desktop is a wide board joining both phone concepts, per `adaptation` |
| 4 | Right style framework and depth on each surface | Yes | Clay material pass on rail, panels, cards, buttons, tags, dots |
| 5 | Art is part of its surface; 3D is really 3D | Yes | `helmet.js` compound three.js model, draggable, passes object gate |
| 6 | Charts match their numbers | Yes | KPIs, score count-up and stepper all read from the same state |
| 7 | Nothing spilling, overlapping or empty below the fold | Yes | Checked at 1440 / 820 / 375; phone side controls reflow into a strip |
| 8 | Inner pages belong to this product | Yes | Library (asset shelf), Activity (telemetry feed), Settings (mission config) |
| 9 | All content is this dashboard's own | Yes | Fictional Orbit Clay sample data only |
| 10 | Phone reads correctly top to bottom | Yes | Score → mission → calibration → controls → sample strip; bottom bar visible |
| 11 | Every variant is designed and readable | Yes | default / moss / dusk recolor tokens, helmet and terrain |

## Rounds

| Round | What I saw | What I changed |
|---|---|---|
| 1 | No frame/backdrop refs, no WebGL canvas, generic `.db-dense-*` pages, filler rows, thin settings/activity | Replaced whole build: `index.html`, `style.css`, `app.js`, `helmet.js`; added `data-ref="frame"`/`backdrop`, four real routes, clay pages |
| 2 | three.js import map 404, router not setting `dataset.page`, poster 404, thin pages, text < 12px, rail not clay | Fixed import map, adopted `DB.route`, generated `hero-poster.png`, expanded pages, raised font clamps, clay rail |
| 3 | Object gate profile too narrow at 10% height, low contrast on tags/times/notes, phone controls overflowed to 428px, dead pager/tag/sphere clicks, muddy terrain ridges | Rescaled helmet framing, darkened `--oc-ink-soft`, lightened `.oc-act-time`, reworked ≤700px rules, wired tap/mark on sphere and re-announce on active controls, lightened ridge fills |

## Used

- Interactions tested: rail nav (4 routes), pager dots, base tags, start/abort, live telemetry, calibrate, stepper ±, sphere drag + tap mark, helmet drag rotate, variant switch, settings toggles/reset, library filters — see click-test log
- Keyboard and reduced motion tested: Tab reaches rail/tags/pager/start/calibrate/stepper/sphere; arrows nudge sphere altitude; `prefers-reduced-motion` disables rise/parallax animations

### Click-test log

| Control | 1440 | 375 |
|---|---|---|
| Overview / Library / Activity / Settings rail | ✔ own hash + content | ✔ bottom bar |
| Pager dots 1–5 | ✔ mission name + toast | ✔ |
| Base Alpha / Beta tags | ✔ marker switch + confirm ping | ✔ |
| Start / Abort, Live telemetry | ✔ cal-sub + toast | ✔ |
| Calibrate, stepper ±, orbit count | ✔ KPI readouts | ✔ |
| Sphere drag (pointer) | ✔ altitude KPI + cal-sub | ✔ |
| Sphere tap | ✔ survey mark ring + readout | ✔ |
| Helmet canvas drag | ✔ rotates (object gate) | ✔ |
| Settings toggles / Reset board | ✔ visible state | ✔ |

## Result

**Polished** — pending final zero-failure check on this push.

Remaining gaps and why:
- Reference text is garbled; all copy is original fictional wording (R7).
- Terrain is SVG layered-paper ridges (catalog first choice) rather than WebGL; spire/sphere/rail are clay CSS elements per layout.json.
- Phone shows the two reference screens stacked in one scroll; the bottom bar stays fully visible.

## Tools used (required)

| Element | Tool or method used | Why this one | If a first choice could not run, what replaced it |
|---|---|---|---|
| Layout | `layout.json` boxes + `cqw` in `style.css` | Spec is the measured twin; check gate 1 | — |
| Hero object | three.js compound helmet in `helmet.js` on `_shared/three/stage.js` | 08-object-spec routing: compound lathe/sphere shell + visor + ear cups | — |
| Terrain | SVG ridge layers + CSS clip-path spire + clay sphere/rail | 05-style-frameworks layered-paper; three layers required | — |
| Depth | pointer parallax across ridge layers + stage camera parallax | depthflow idea from playbook | — |
| Images | generated `media/*.webp` (helmet, dunes) + procedural SVG icons | Original assets, credited | — |
| Motion | CSS transitions/keyframes + `prefers-reduced-motion` | transform/opacity only, 100–300ms | — |
| Pages / nav | `window.DB.route` shared runtime + product pages in `app.js` | Gallery contract routing | — |
| Verification | `node scripts/dashboards-check.mjs orbit-clay` + compare sheet | Contract §5 loop | — |

## Owner requirements (required)

| Id | What was done | Evidence (screenshot or compare-sheet box) | Holds at 1440 | Holds at 375 |
|---|---|---|---|---|
| R1 | Wide clay board joining mission + calibration; rail, score, actions, KPIs added per layout.json — not phone mockups | `shot-desk.png`, compare sheet board box | ✔ | n/a (phone is the reference form) |
| R2 | One token set (`:root`), one type scale, one clay material, same icons/pages at 1440/820/375; three distinct reflows | `shot-desk/tablet/phone.png` | ✔ | ✔ |
| R3 | `helmet.js` builds shell, visor gold mesh, ear cups, trim, collar in three.js; drag rotates; `DBHero.poster()` + `db-hero-ready`; object gate passes (fill .82/.80, aspect .94, profile .46/1/.61) | compare sheet helmet box, `LAYOUT_DEBUG` output | ✔ | ✔ |
| R4 | Three SVG ridge layers, cream spire, gold sphere on rail; drag/tap sphere updates altitude KPI + cal-sub | compare sheet terrain box, click-test log | ✔ | ✔ |
| R5 | Clay treatment on rail, panels, tags, dots, cards, buttons: soft radius, dark drop shadow, light inset highlight, pressed states | compare sheet material notes | ✔ | ✔ |
| R6 | Four routes with own data; every button/tag/dot/stepper/toggle mutates DOM (dead-control gate clean) | check output, click-test log | ✔ | ✔ |
| R7 | All copy original fictional Orbit Clay wording; no reference strings reused | page text in `app.js` | ✔ | ✔ |

## Compare-sheet rounds (required)

| Round | Differences I named | Fixed |
|---|---|---|
| 1 | Fill: ridges too translucent/muddy vs cream mountains; type: mname/tag text too light; shadow: sphere/rail too subtle | Lightened ridge fills + opacity, darkened `--oc-ink-soft`, boosted rail/sphere contrast |
| 2 | Proportion: phone side controls overflowed viewport; icon: rail glyphs generic | Reworked ≤700px layout to a control strip, added product glyphs |
| 3 | Radius/material: rail failed clay gate (0 shadow layers, 0 radius); sphere click dead | Clay rail shadows/radius; sphere tap = survey mark; active tag/dot re-announce |
