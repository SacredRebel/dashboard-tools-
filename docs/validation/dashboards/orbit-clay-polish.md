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

- Side-by-side (reference | ours): `orbit-clay-compare.jpg` (desktop boxes) · `orbit-clay-compare-overview-375.jpg` (phone left screen) · `orbit-clay-compare-activity-375.jpg` (phone right screen on Activity; generated with the checker's own sheet format because the auto writer picks `.first()` and the cloned refs duplicate the hidden overview's — noted honestly)
- Captures: `orbit-clay-overview-1440.png` · `orbit-clay-overview-820.png` · `orbit-clay-overview-375.png` · `orbit-clay-library-1440.png` · `orbit-clay-activity-1440.png` · `orbit-clay-settings-1440.png` · `orbit-clay-library-375.png` · `orbit-clay-activity-375.png` · `orbit-clay-settings-375.png` (this folder)
- Helmet material evidence: `site/dashboards/orbit-clay/media/hero-poster.png` (colour-grid + histogram verified: green shell, cream face zone, gold collar)
- `node scripts/build.mjs`: ✔ · `node scripts/dashboards-check.mjs orbit-clay`: ✔ zero failures (pages=4, variants=3)

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

### Round 1 — contract-2 rebuild vs reference (dna.md → helmet, terrain, views, fills, inner pages)

After `git merge origin/main` the spec gained `views`, `shape: organic`, `page_style`, `dna.md` and R8–R12. I wrote `site/dashboards/orbit-clay/dna.md` first, then rebuilt: compound three.js helmet (shell, face port, cream rim, gold mesh visor, ear discs, gold collar), sculpted SVG dune terrain (`data-shape="wave"`/`organic` markers, gradients, blurred valley shadows, crest highlights), phone Overview = reference left screen only with the right screen cloned to the top of Activity@375, desktop dead-space fills (status strip, sky ornaments, mission plaques, KPI sparks), and `data-card` clay cards on all inner pages. First check still failed: pager-dot 7.7% > 7%, the Activity clone was hidden by a blanket `.oc-cal{display:none}`, library desc text sat under the status strip (contrast ~1.1:1), clone KPI tiles were translucent over pale dunes, and clone calibrate/stepper radii were < 12px. Poster histogram also showed gold parts rendering near-black (metalness 0.85+ without readable env) and the mesh visor muddy.

| box | what differs | fix | score |
|---|---|---|---|
| rail | clay icon rail, 4 routes — matches spec | — | 4 |
| score | score strip top-left of board | — | 4 |
| actions | action cluster under score | — | 4 |
| mission | cream clay panel; ring+helmet+tags+pager+start inside | — | 4 |
| ring | gold ring, inset light/shadow | — | 4 |
| helmet | compound rebuild done, but poster histogram: gold ≈ black, mesh muddy, neck too heavy | material pass deferred to round 3 | 3 |
| tag | two clay tags under ring | — | 4 |
| pager | dot row under name | — | 4 |
| pager-dot | active dot 7.7% of frame > 7% max | shrink to 26px hit area | 3 |
| start | Start slab bottom of mission | — | 4 |
| calibration | desktop panel fine; 375 clone hidden by `.oc-cal{display:none}` | scope hide to `.oc-over` | 3 |
| terrain | sculpted dunes: 4 ridge layers, gradients, blur shadows, crest rims | — | 4 |
| terrain-layer | far/mid/near + valley shadow paths | — | 4 |
| spire | cream shard on mid ridge | — | 4 |
| sphere | gold sphere on rail, drag + tap | — | 4 |
| kpis | 3 readout tiles; clone tiles translucent over dunes, wrong box | opaque tiles, contract position | 3 |
| kpi | label/num/spark tiles; clone contrast ~1.1:1 | opaque dark tile bg | 3 |
| calibrate | working toggle; clone radius 8.25px < 12px | radius 3.6cqw in clone | 3 |
| stepper | orbit ± stepper; clone radius < 12px | radius 3.6cqw in clone | 4 |

### Round 2 — defect fixes from the check

Scoped `.oc-over .oc-cal/.oc-side{display:none}` so the Activity clone renders; pager-dot 29px→26px (5.9% of 375 frame); `.oc-page` bottom inset 1.6→8.6cqw so inner-page cards clear the status strip (library contrast restored); clone gets `border-radius:3.6cqw`, opaque KPI tiles (`rgba(28,42,32,.96)` gradient + inset clay shadows), KPIs back at contract y 48cqw / h 59.6cqw overlapping the terrain's upper area like reference plaques; calibrate + stepper + step radii raised. Re-check: zero layout/contrast failures; only remaining flag was the kpis box position, fixed same round.

| box | what differs | fix | score |
|---|---|---|---|
| rail | — | — | 4 |
| score | — | — | 4 |
| actions | — | — | 4 |
| mission | — | — | 4 |
| ring | — | — | 4 |
| helmet | still dark metals/muddy mesh (material pass next) | — | 3 |
| tag | — | — | 4 |
| pager | — | — | 4 |
| pager-dot | now 26px = 5.9% ≤ 7% | — | 4 |
| start | — | — | 4 |
| calibration | clone visible at top of Activity@375 with all refs | — | 4 |
| terrain | — | — | 4 |
| terrain-layer | — | — | 4 |
| spire | — | — | 4 |
| sphere | — | — | 4 |
| kpis | opaque tiles at contract position | — | 4 |
| kpi | contrast cleared on dark tiles | — | 4 |
| calibrate | clay radius in clone | — | 4 |
| stepper | clay radius in clone | — | 4 |

### Round 3 — helmet material pass + final verification

Poster pixel histogram showed gold at ~30% brightness (metalness 0.85–0.9 starves metals without env) and the mesh visor muddy. Fixes: gold/goldHi/mesh metalness → 0.5–0.6, mesh texture brightened (lighter gold ramp, thinner crosshatch, brighter knots), mesh disc enlarged to cover the cavity, rim tube 0.072→0.082 (thicker cream rim), warm frontal fill + soft under-light added, neck cylinder slimmed. Regenerated `media/hero-poster.png` — histogram now shows cream face zone, green shell, gold collar; colour-grid map reads shell/face-port/collar in the right places. `DBHero.poster()` made async to wait out a transient swiftshader context loss (was returning blank PNGs). Final check run + captures at 1440/820/375 and inner pages recorded below.

| box | what differs | fix | score |
|---|---|---|---|
| rail | clay rail matches nav spec | — | 5 |
| score | strip reads as reference's small type rows | — | 4 |
| actions | cluster composed, working | — | 4 |
| mission | cream panel composition matches left screen | — | 4 |
| ring | gold ring with clay shading | — | 5 |
| helmet | reads green shell / cream rim / gold mesh / ear disc / collar; exact 3/4 proportion vs reference unverified by eye | material + light pass; silhouette gate passes | 4 |
| tag | two clay tags | — | 4 |
| pager | dot row | — | 4 |
| pager-dot | active gold pill, ≤7% | — | 5 |
| start | Start slab | — | 4 |
| calibration | dark panel; phone clone = right screen on Activity | — | 4 |
| terrain | sculpted dunes, 4 layers, soft shadows | — | 5 |
| terrain-layer | ridge layers + valley shadows | — | 4 |
| spire | shard on mid ridge | — | 4 |
| sphere | draggable gold sphere on rail | — | 4 |
| kpis | three readout tiles | — | 4 |
| kpi | label/num/spark tiles | — | 4 |
| calibrate | working clay toggle | — | 4 |
| stepper | orbit stepper | — | 4 |

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

**Polished** — `node scripts/dashboards-check.mjs orbit-clay` ✔ zero failures on this push; `node scripts/build.mjs` ✔.

Remaining gaps and why:
- Reference text is garbled; all copy is original fictional wording (R7).
- Terrain is SVG layered-paper dunes (the contract's own first-choice recipe: SVG paths + `data-shape`, gradients, blurred shadows) rather than WebGL; spire/sphere/rail are clay CSS elements per layout.json.
- The helmet is a procedural compound three.js model (the contract allows generated .glb only if a local 3D tool runs in ten minutes; none was available). Its silhouette passes the object gate and its colour zones were verified by poster histogram, but exact 3/4 proportions vs the reference are unverified by eye — flagged for the maintainer's re-score.
- Phone Overview shows only the reference's left screen; the right screen lives at the top of Activity per `views`.

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
| R8 | Phone Overview = reference left screen only (ring, big helmet, 2 tags, small pager, Start); Activity@375 opens with the reference right screen cloned to its top (calibration, kpis, kpi×3, terrain, spire, sphere, calibrate, stepper all visible) | `orbit-clay-compare-overview-375.jpg`, `orbit-clay-compare-activity-375.jpg`, check view boxes | ✔ | ✔ |
| R9 | Helmet rebuilt as compound clay object: deep-green shell, thick cream face rim, gold mesh visor filling the port, round cream ear discs, gold collar ring, sits low; silhouette traced from reference proportions, object gate passes | `media/hero-poster.png` colour-grid + histogram, compare sheet helmet box | ✔ | ✔ |
| R10 | Terrain is sculpted clay dunes: 4 depth layers, rounded crests, top-left light, valley shadows, crest highlight rims, `data-shape="wave"`/`organic` markers — no flat triangles | compare sheet terrain box, `index.html` ridge SVG | ✔ | ✔ |
| R11 | Library/Activity/Settings share backdrop, rail, clay cards and type; every card tagged `data-card` (page_style gate counts ≥3 per page) | `orbit-clay-compare-library-1440.jpg`, `-activity-1440.jpg`, `-settings-1440.jpg` | ✔ | ✔ |
| R12 | Desktop dead space composed: bottom status strip, terrain-sky ornaments, mission plaques/fills, KPI spark bars, side foot readouts | `orbit-clay-compare.jpg` board box | ✔ | n/a |

## Compare-sheet rounds (required)

Scored rounds with per-box fidelity tables live under "Rounds" above (Round 1 rebuild, Round 2 defect fixes, Round 3 helmet material pass). Compare sheets: `orbit-clay-compare.jpg` (desktop boxes), `orbit-clay-compare-overview-375.jpg` and `orbit-clay-compare-activity-375.jpg` (phone views).
