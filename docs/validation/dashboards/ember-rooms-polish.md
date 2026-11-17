# Polish report: Ember Rooms (`ember-rooms`)

> Method: [docs/dashboards/06-verification.md](../../dashboards/06-verification.md) · contract: [docs/dashboards/00-twin-contract.md](../../dashboards/00-twin-contract.md).

## Identity (written before any code)

```
Form:        Soft neumorphic indoor lighting console — poured title tab, slim icon rail, concentric rings with pendant lamp, left controls, right tiles
Frameworks:  F5/F8 neumorphism · F12 tactile controls · WebGL lathe hero (maintainer lamp.js)
Signature:   Brushed aluminium pendant on orbit rings with orange power and intensity-linked glow
Not this:    Glass CRM cards, purple gradients, shared dense-page kit, phone mockups on desktop
```

## Evidence

- Side-by-side (reference | ours): `docs/validation/dashboards/ember-rooms-compare.jpg`
- Captures looked at: overview ☑ · overview full length ☑ · every page ☑ · phone full length ☑ · each variant ☑
- `node scripts/build.mjs`: ✔ · `node scripts/dashboards-check.mjs ember-rooms`: ✔ (after R1/R2)

## The eleven questions

| # | Question | Yes / No | Note |
|---|---|---|---|
| 1 | Same form as its own reference, and unlike other dashboards | Yes | Neumorphic ring stage + rail + right tiles |
| 2 | Blocks and heading breaks in the reference's places | Yes | layout.json boxes drive cqw placement |
| 3 | Uses the screen as the reference does | Yes | Desktop board composition, not a phone paste |
| 4 | Right style framework and depth on each surface | Yes | Soft extruded neu shadows; orange accent |
| 5 | Art is part of its surface; 3D is really 3D | Yes | lamp.js WebGL (untouched this pass) |
| 6 | Charts match their numbers | Yes | Usage / Peak series from sample arrays |
| 7 | Nothing spilling, overlapping or empty below the fold | Yes | Checked in compare + frames |
| 8 | Inner pages belong to this product | Yes | Climate, Energy, Security, Airflow, Scenes, Rooms |
| 9 | All content is this dashboard's own | Yes | Fictional Ember Loft sample data |
| 10 | Phone reads correctly top to bottom | Yes | Bottom rail; no horizontal scroll |
| 11 | Every variant is designed and readable | Yes | default / mist / dusk |

## Rounds

| Round | What I saw | What I changed |
|---|---|---|
| 1 | Airflow/Scenes shared Climate/Rooms; arc rooms did not retarget controls | Seven real pages; per-room bright/schedule/lit; in-place orbit updates |
| 2 | Search icon left; Usage blue polyline; readout heavy; cards flat | Search icon right + orange; filled orange curve + grid; lighter readout; softer neu card shadows |
| 3 | Usage still angular; missing green baseline; Peak single line; day pills inset | Catmull-Rom curves; green dashed baseline; soft dual Peak line; raised day chips |

## Used

- Interactions tested: see click-test log below
- Keyboard and reduced motion tested: Tab to rail/power/rooms; `prefers-reduced-motion` disables rise/draw animations

### Click-test log

| Control | 1440 | 375 |
|---|---|---|
| Overview / Rooms / Climate / Energy / Security / Airflow / Scenes | ✔ each own hash + content | ✔ bottom rail |
| Living / Kitchen / Bedroom / Bath / Study | ✔ readout, intensity, schedule, donut | ✔ chip row |
| Power, intensity, schedule times, Peak 1H–4H, play | ✔ visible change | ✔ |
| Airflow zone + Faster/Slower | ✔ | ✔ |
| Scenes Apply | ✔ updates overview profile | ✔ |
| Undo / Redo / Settings gear | ✔ | ✔ |

## Result

**Polished** for contract gates R1–R3. Remaining visual gaps noted below (lamp.js frozen by R3; Chinese reference copy intentionally not reused).

Remaining gaps and why:
- Donut still lacks reference lightbulb thumbs on the arc (would add chrome beyond measured boxes; ticks + thicker ring landed).
- Sidebar icon metaphors differ from reference collage icons (product labels kept; seven routes real).
- Lamp silhouette/material left to maintainer (`lamp.js` untouched).

## Tools used (required)

| Element | Tool or method used | Why this one | If a first choice could not run, what replaced it |
|---|---|---|---|
| Layout | `layout.json` boxes + `cqw` in `style.css` | Spec is the measured twin; check gate 1 | — |
| Hero object | existing `lamp.js` (three.js lathe) — not edited | Maintainer object; R3 forbids touch | — |
| Images | existing `media/room.webp` + fictional English copy | Room preview already credited | — |
| Motion | CSS keyframes (`er-rise`, `er-draw`, `er-page-in`) + `prefers-reduced-motion` | Catalog motion / CSS first choice | — |
| Pages / nav | vanilla `DB.route` + product pages in `app.js` | Seven sidebar icons → seven routes | — |
| Controls | Mutation-safe in-place room updates | Dead-control gate; R2 visible change | — |
| Charts | hand-authored SVG sparks (Catmull-Rom, fill, dual line) | Match compare-sheet card detail | — |
| Verification | `node scripts/dashboards-check.mjs ember-rooms` + compare sheet | Contract §5 loop | — |

## Owner requirements (required)

| Id | What was done | Evidence (screenshot or compare-sheet box) | Holds at 1440 | Holds at 375 |
|---|---|---|---|---|
| R1 | Airflow → `#/airflow`, Scenes → `#/scenes`; catalog pages + zone/speed and apply-scene interactions | nav gate; `frames/pages/airflow.jpg`, `scenes.jpg` | Yes | Yes |
| R2 | Each arc room applies bright/start/end/lit; updates readout, intensity, schedule, donut without destroying sibling buttons | overview room / controls / donut / readout boxes | Yes | Yes |
| R3 | `lamp.js` not modified | git diff excludes lamp.js | Yes | Yes |

## Compare-sheet rounds (required)

| Round | Differences I named | Fixed |
|---|---|---|
| 1 | Search icon left/grey; Usage blue polyline no fill; readout headline-weight; cards weak shadow; donut thin, no ticks | Icon right + orange; orange fill + grid; weight 200 + accent slash; neu card shadow; thicker ring + ticks + softer well |
| 2 | Usage still polygonal; no green baseline; Peak single orange; day chips sunken | Smooth curves; green dashed mean baseline; blue Peak + soft companion; raised day chips |
| 3 | Card titles too heavy vs meta; video shadow hard; power glow thin | Title muted 500; video neu shadow; softer power halo |
