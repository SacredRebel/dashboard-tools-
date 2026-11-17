# 09 · Image to dashboard: the full protocol

How any agent turns **one reference image** into a complete dashboard (desktop, tablet, phone and every inner page) that matches the reference and reads as one app. Read [00-twin-contract.md](00-twin-contract.md) first: it says who decides what. This file says **how to build and how to check yourself**.

Why this exists: builds kept passing every gate while still looking "half done". The same five misses kept coming back:

| Miss | What it looked like | What now stops it |
|---|---|---|
| Rectangles in a grid | The reference has tabs, notches, overlaps, slopes and molded trays; the build has rounded boxes in rows | §3 shape grammar + box `shape` gate |
| Phone does not match the reference phone | The reference *is* a phone, yet the phone build is a different composition | §4 phone view measured box by box (`views` in layout.json) |
| Desktop is a reshuffled grid | Desktop loses the reference's flow and character | §4 unfold rules |
| Inner pages are plain | Overview is styled; Progress/Profile are lists of flat boxes | §5 + `page_style` gate on every page |
| Background missing | The reference's backdrop layers (relief, stars, dunes, light) are absent or reduced to a gradient | §2 backdrop layers + backdrop gate on every page |

---

## 1. Inputs and outputs

| You get (maintainer) | You produce (builder) |
|---|---|
| `reference.*` (never edit, never feed to image or 3D tools) | `dna.md`: the design DNA sheet (§2), written **before** any CSS |
| `layout.json`: measured boxes for desktop and, through `views`, phone/tablet/inner pages | The dashboard: `index.html`, `style.css`, `app.js`, hero modules |
| `requirements` from the owner | `docs/validation/dashboards/<id>-polish.md` with tools used, requirement answers, **three scored review rounds** (§6) |

The check (`node scripts/dashboards-check.mjs <id>`) enforces all of it. It writes one compare sheet per view: `docs/validation/dashboards/<id>-compare.jpg`, `<id>-compare-<page>-<width>.jpg`. **Open every sheet every round.**

## 2. Read the reference: the design DNA sheet

Before writing code, study the reference at 100% and 300% zoom for at least ten minutes and write `site/dashboards/<id>/dna.md` with these headings (the check requires them):

```markdown
## Backdrop
Layer by layer, back to front. Example: 1 sage→charcoal vertical gradient; 2 cream frosted body with molded relief ridges that wrap
around the cards (raised 6–10px, inner shadow below, light rim above); 3 hanging stars on thin vertical threads under the last card;
4 dark dune sky with one four-point star (right screen only).

## Shape grammar
Every outline that is not a plain rounded rectangle, with where it appears: tab (Water, Daily progress), notch (avatar breaks out of
the profile card's top-left), bump (active nav item sits in a raised dome), slant (Upgrade tray top slopes up to the right), wave
(dune panel bottom edge). Overlaps: avatar overlaps card edge by 30%; Share tab is cut out of the profile card's bottom-left.
Connections: arc card's dark lower band flows into the Water tab.

## Materials
Per surface: frosted cream glass (alpha ~0.5, blur 24px, white rim 1.5px), teal liquid glass, amber glass with inner glow, dark smoked glass.

## Palette and type
Sampled hex values per surface and text role. Display face (thin high-contrast serif, wide tracking), UI face, numeral style.

## Nav
Exact look: position, material, item layout, label case and size, active treatment (raised dome, teal tint), how it meets the screen edge.

## Composition
Reading order, alignment axes, rhythm (gaps), what overlaps what, where the empty space is and why (stars live there).

## Element inventory
| element | construction (how you will build it) | tool / primitive | box name |
|---|---|---|---|
| Water card | teal liquid glass, `data-shape="tab"` left, drop icon in a glass lens, 8-segment meter | shapes.js tab | water |
```

Rules: describe what you **see**, with numbers (px at reference scale, hex, alpha). "Nice glass card" is not a description. Every element in the image gets a row, including ornaments, dividers and the background.

## 3. Shape grammar: build organic outlines for real

A shape in the reference must be a shape in the build. Rounded rectangles do not count, and the check fails boxes whose spec has `"shape"` when no clip-path, mask or `svg path[data-shape]` exists.

Use the shared primitives, [site/dashboards/_shared/shapes.js](../../site/dashboards/_shared/shapes.js) (demo: `site/dashboards/_shared/shapes-demo.html`):

| Primitive | Reference pattern | Markup |
|---|---|---|
| `tab` | label tab rising from a card's top edge with concave fillets (Water, Daily progress) | `data-shape="tab" data-shape-opts="side:left; w:34%; h:30; r:26; tr:14; f:12"` |
| `notch` | circular bite where an avatar, button or medallion overlaps the edge | `data-shape="notch" data-shape-opts="edge:top; at:20%; R:40; r:26"` |
| `bump` | raised dome on a bar's top edge (active nav item, floating action) | `data-shape="bump" data-shape-opts="at:12%; a:40; s:16; r:26"` |
| `wave` | organic top edge (molded tray, dune panel, terrain) | `data-shape="wave" data-shape-opts="amp:22; r:28; phase:0.35"` |
| `slant` | sloped top edge (tray, ticket) | `data-shape="slant" data-shape-opts="rise:18; r:22"` |

How to use them well:
1. `import './../_shared/shapes.js'` (or `import { applyShapes } from '../_shared/shapes.js'` and call it after you render new markup).
2. `data-shape-edge="rgba(255,255,255,.7)"` draws the glass rim along the cut outline (box-shadow is clipped by clip-path).
3. Drop shadows go on a **parent** with `filter: drop-shadow(...)`, never on the clipped element.
4. For overlaps: cut the notch in the card, then place the overlapping element (avatar) in the notch with `position:absolute` so it breaks the outline exactly as the reference does.
5. Anything the primitives cannot express: write an SVG path in the reference's proportions, give the `<path>` a `data-shape` attribute, and use it as a clip or a fill.

## 4. Unfold: from a phone-only reference to desktop, tablet and phone

When the reference shows phones only, the build is **one app at three sizes**. The maintainer measures the phone screens into `views` and designs the desktop/tablet boxes. The builder follows these rules:

1. **The phone is a twin.** At 375px the overview must match the reference's first phone box by box (`views[{page:"overview", width:375}]`). A second phone screen in the reference is a page (often Profile) and is measured as its own view. Same order, same shapes, same materials, same backdrop, same nav. No extra cards, no missing ornaments.
2. **Tablet = the phone screens side by side.** Each phone screen becomes a column that keeps its internal order, shapes and overlaps. The nav keeps the reference's form (a bottom bar with a bump stays a bottom bar with a bump).
3. **Desktop = the same columns, wider, with breathing room.** Columns keep the reference's flow and connections (tabs, overlaps, molded tray). Extra width goes to the backdrop and to **one** designed region that extends the story in the same grammar (for example the dune sky widening into a scene). Never re-flow the cards into a generic 3×3 grid.
4. **The nav is the same object at every size.** Same material, item style and active treatment. A desktop may dock it at the bottom or rotate it into a rail, but it must look like the reference's nav, not a different component.
5. **The backdrop extends.** Every layer from the DNA sheet continues across the wider canvas (gradient, relief, stars, dunes). Nothing on desktop sits on a flat colour the reference does not have.
6. **The type scales, it does not change.** Same faces and weights; display sizes grow with the frame (`cqw`), body never below 14px, labels never below 12px.

## 5. Every page is the same app

The check runs `page_style` on **every page at every width**: the backdrop is visible, the nav is visible, at least `min` cards use the reference's material, at least `shapes` elements use the shape grammar, a `hero` surface from the reference is present, and no text is covered (by an avatar, tab or overlay) or cut off by a clip-path.

Inner-page recipe:
1. Start from the overview's backdrop, nav and title style. Same frame.
2. One hero card per page in the reference's signature material (the dark dune glass, the teal liquid card, the clay medallion).
3. Three to six content cards built from the overview's card types (same radius, rim, tab and notch usage, same type scale), filled with believable fictional data for that page's job.
4. Controls look like the overview's controls (same pill, same icon button). A settings page is not a list of white boxes: group settings into shaped glass cards.
5. Every button works and shows a visible change (a dead-controls gate runs on the overview; apply the same standard everywhere).

## 6. Review rounds: check yourself against the reference, three times minimum

Shipping after one look is how half-done dashboards get through. Do **at least three rounds**; record each in the polish report under `### Round 1`, `### Round 2`, `### Round 3`.

Each round:
1. Run the check. Open every compare sheet (desktop, phone, tablet, inner pages).
2. Capture 1440, 820 and 375, plus every inner page at 1440 and 375. Put each capture **next to the reference at the same height** and look for two minutes.
3. **Squint test:** blur both images (about 8px) and compare the big shapes, light and dark masses, and empty space. If the silhouettes differ, the layout is wrong whatever the boxes say.
4. **Detail pass,** one element at a time: outline, material, colour, type, icon, spacing, ornament.
5. Score every box (every name in `layout.json`, including views) in a table, 0–5:

| score | meaning |
|---|---|
| 5 | indistinguishable at a glance from the reference |
| 4 | same shape, material and colour; only small spacing or type nuance differs |
| 3 | recognisably the same element, but shape, material or colour is off |
| 2 | different construction (rounded box where the reference has a tab, flat fill where it has glass) |
| 0–1 | missing or wrong element |

```markdown
### Round 2
| box | what differs from the reference | fix applied | score |
|---|---|---|---|
| water | tab too short, segment meter thinner than reference | tab h 30→34, meter 9→12px | 4 |
```

6. Fix everything below 4, then start the next round. The check fails the report when there are fewer than three rounds or when any box's **last** score is below 4.

Scores are your honest judgement; the maintainer re-scores from the same sheets. Inflated scores cost a full redo.

## 7. Element construction recipes

| Element | Build it like this | Compare these |
|---|---|---|
| **Backdrop** | Stack the DNA layers as real layers: gradient, then SVG/CSS relief (blurred paths with light and dark offsets), then ornaments (stars, threads, dunes). `data-ref="backdrop"` on the stack | Light direction, where it is darkest, relief positions, ornament count |
| **Card** | Material first (fill alpha, blur, rim, glow), then outline (shape primitive), then content. Parent carries the drop shadow | Outline, rim brightness, fill colour at three points, corner radius |
| **Tab label** | Part of the card outline (`tab`), never a sticker pill floating above it | Tab width and height ratio, fillet softness, label tracking |
| **Overlap (avatar, medallion)** | `notch` in the card + absolutely placed element filling the bite | Overlap depth (% of the element outside the card) |
| **Nav** | Same component at every size; active item treatment from the reference (dome via `bump`, tinted icon, lens) | Bar material, icon size, label case, active treatment |
| **KPI** | Number style from the reference (serif or grotesk, weight, unit size and baseline), label below or above as in the reference | Number height relative to card, unit treatment |
| **Primary button** | Pill or slab exactly as drawn: material, height, label case | Height-to-width ratio, material, shadow |
| **Chart** | SVG; mark style from the reference (bar width, track, rounded caps, gradient) | Mark thickness, spacing, track visibility, labels |
| **Ornaments** | Stars, threads, sparkles, dividers are SVG elements placed where the reference has them; they are part of the design, not optional | Count, size and position |
| **3D object** | [08-object-spec.md](08-object-spec.md): silhouette first, then material and light; object gate | Silhouette, shading, how it sits in its frame |
| **Display type** | Same family class (thin serif, wide tracking, small caps), sized in `cqw` | Stroke contrast, tracking, case |

## 8. Before you open the PR

- [ ] `dna.md` written before code, every element of the image in the inventory
- [ ] Phone overview matches the reference phone box by box; second reference screen built as its page
- [ ] Tablet and desktop follow the unfold rules; no generic grid
- [ ] Every shape in the DNA sheet built with a primitive or an SVG path
- [ ] Backdrop layers present on every page at every size
- [ ] Nav is the same object at all three sizes and on every page
- [ ] Inner pages use the overview's materials and shapes (`page_style` passes)
- [ ] Three review rounds recorded, every box scored 4 or 5 in the last round
- [ ] `node scripts/dashboards-check.mjs <id>` passes with zero failures
- [ ] PR opened, **not merged**; compare sheets and 1440/820/375 captures attached

Tools for each step: the routing table in [08-object-spec.md](08-object-spec.md#tool-routing-required-recorded) and [03-asset-and-tool-map.md](03-asset-and-tool-map.md). Record every tool used in the polish report.
