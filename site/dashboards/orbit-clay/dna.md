# Orbit Clay · design DNA

DNA sheet per [docs/dashboards/09-image-to-dashboard.md §2](../../../docs/dashboards/09-image-to-dashboard.md), written from `reference.jpg` (509×508, two phones: mission screen at x 62–265, y 68–508; calibration screen at x 255–448, y 42–508; foot icon strip between them at y ≈ 400). The desktop board does not exist in the reference — it is the maintainer's adaptation in `layout.json` (one wide clay board joining both screens). Pixel values are at reference scale; build values are `cqw` of `.oc-board`.

## Backdrop
1. Canvas behind the board: deep forest green on the left warming to warm tan on the right (the board's own gradient does most of this; the page behind is near-black green `#101a14` with a faint warm glow low-right). No texture, no grid.
2. Board: one wide rounded clay slab, warm tan (`#c8a254` family), lit from top-left — bright top edge, darker bottom-right, a soft drop shadow beneath. Its right ~55% is tinted toward deep green so the two reference screens read as one board: left = cream mission, right = dark calibration.
3. Left edge: a slim cream clay **rail** (the foot icon strip from the reference, stood upright) holding the four section icons.
4. Bottom: a thin dark-green **status strip** spanning the board's lower edge — telemetry ticker, ridge ornament, coordinates — so the board's bottom band is designed, not empty.

## Shape grammar
- **Ring**: a perfect gold circle (the helmet's halo) with a cream inner lip and a dark inner shadow — reads as a machined bezel, not a flat stroke.
- **House tags**: two small dark-green house-shaped markers (pentagon silhouette with a peaked roof), one each side under the ring; active one rides ~4px higher.
- **Slab button**: Start / Calibrate / stepper are low rounded clay slabs (radius ≈ height/2 on the small ones, ~12px min on Start) with a light top rim and a dark bottom edge — pressed states sink 2px.
- **Dune ridges**: the calibration terrain is three to four overlapping clay dune layers — smooth S-curved crests (never straight triangles), each lighter at the top-left and darker toward the valley, with soft blurred drop shadows between layers. Far layers desaturate toward the panel green.
- **Spire**: a tall thin cream shard rising from the middle ridge, slightly curved, matte clay with a lit left edge.
- **Sphere rail**: a thin cream rail line with a gold sphere that travels it; the sphere is a lit clay ball with a dark seam.
- **Pager dots**: tiny green dots; the active one is a slightly longer gold pill — never a big blob (max width 7% of frame).
- **KPI tiles**: small dark insets inside the side column with a label over a gold tabular numeral; each carries a mini spark strip.
- **Phone bottom bar** (375px): the rail becomes a frosted cream bottom bar, four icons evenly spaced.

## Materials
| surface | material |
|---|---|
| Mission panel | cream clay — matte fill `#e8eeda→#d3dcba`, radius ~3cqw, dark drop shadow + light top rim + soft inner bottom shade |
| Calibration panel | dark green clay — `#33503f→#1c2a22`, same shadow grammar, inset top highlight |
| Side column | dark green clay, same as calibration |
| Board | warm tan clay, broad soft shadow, top-light gradient |
| Rail / bottom bar | cream clay, same shadow grammar |
| Ring | gold bezel — `#c9a24a` band, cream inner lip, inner shadow |
| Helmet | three.js compound clay — deep green shell, cream face rim, gold mesh visor, cream ear disc, gold collar |
| Dunes | layered SVG clay — per-layer linear gradients (light top-left → dark bottom-right), blurred inter-layer shadows |
| Start / Calibrate / stepper | clay slabs — cream on dark, dark on cream; active/pressed states sink |
| KPI tiles | pressed-in dark insets on the side column |
| Score / actions plaques | small cream / dark clay chips so every region carries material |

## Palette and type
- Ink `#1f3a2e` (deep green), soft ink `#2e4a3a`, cream `#e8eeda` / hi `#f4f8e2` / lo `#d3dcba`, forest `#2e4639` / deep `#1d2f26`, panel `#2a3a2f` / hi `#33503f` / lo `#1c2a22`, gold `#c9a24a` / hi `#e0c078` / lo `#937046`, khaki `#cbc7a1`, visor near-black `#0c100d`.
- Variants: **moss** shifts the whole ramp to sage/olive; **dusk** to slate/bronze. All recolor from the same tokens; the helmet recolors via `DBHero.recolor()`.
- Type: Outfit. Big score numerals are heavy (800) tabular; labels are small tracked caps (0.12–0.16em, 12–13px floor); buttons are bold caps; body copy never under 12px.

## Nav
Desktop: left cream rail, four outline icons (grid, book, pulse, gear); the active icon sits in a pressed dark-green clay well. Phone (≤700px): the rail becomes a bottom bar — same four links, same routes, 44px targets. Every nav item opens its own page (Overview, Library, Activity, Settings).

## Composition
- **Desktop (1440)**: board reads left→right as the two reference screens joined — mission panel (x10–46) with score plaque above it and the gold ring + helmet inside; calibration panel (x48–82) with title, dune terrain, spire, sphere rail, KPI column at right; side column (x84–98) with actions plaque, three KPI tiles, Calibrate, stepper; status strip along the bottom edge. The board's lower band is a designed telemetry strip, not empty tan.
- **Tablet (820)**: two columns — mission panel left, calibration panel stacked over the side column right; status strip along the bottom.
- **Phone overview (375)** = reference left screen box-by-box: score plaque upper-left, actions plaque upper-right, huge gold ring centre, helmet large inside it overlapping the ring's lower edge, two house tags under the ring, name, small pager (active = short gold pill), Start slab. Cream field, bottom bar.
- **Phone activity (375)** opens with the reference right screen as its top block (calibration panel full-width: title, dunes, spire, sphere rail, KPI stack right, Calibrate, stepper strip), then the activity feed continues below.
- **Inner pages** share the board, rail, cream sheet and clay cards; every card carries `data-card`.

## Element inventory
| element | construction | tool / primitive | box name |
|---|---|---|---|
| Backdrop | fixed split green→tan gradient + grain | CSS gradients | backdrop |
| Board/frame | wide clay slab, container for cqw | CSS | frame |
| Rail | cream clay column → bottom bar on phone | CSS + hash routes | rail |
| Score plaque | cream clay chip, heavy tabular numeral | CSS | score |
| Actions plaque | dark clay chip: live toggle + gold orb | CSS | actions |
| Mission panel | cream clay panel | CSS clay material | mission |
| Gold ring | bezel ring via layered inset shadows | CSS | ring |
| Helmet | compound three.js object: squashed sphere shell, cream rim torus, gold-mesh visor disc, ear disc, gold collar, neck | three.js via `_shared/three/stage.js` → `DBHero` | helmet |
| House tags | clip-path pentagon buttons | CSS clip-path | tag |
| Pager | 5 dots, active gold pill | CSS | pager, pager-dot |
| Start slab | dark clay slab button | CSS | start |
| Calibration panel | dark green clay panel | CSS | calibration |
| Terrain dunes | 3–4 SVG ridge layers, gradients + blurred shadows, `data-shape` organic marker, pointer parallax | inline SVG | terrain, terrain-layer |
| Spire | cream shard clip-path with lit edge | CSS/SVG | spire |
| Sphere + rail | thin rail + draggable gold sphere | CSS + pointer events | sphere |
| KPI tiles | pressed-in dark insets + spark strips | CSS | kpis, kpi |
| Calibrate / stepper | cream slab button / khaki stepper strip | CSS | calibrate, stepper |
| Status strip | dark green telemetry bar, ridge ornament, ticker | CSS + inline SVG | (fill, no box) |
| Inner pages | cream sheet + `.oc-clay-card` / `-dark` cards, all `data-card` | CSS + JS templates | page_style |
| Phone cal clone | same calibration markup re-rendered at top of Activity@375 | JS template + shared styles | (views) |
