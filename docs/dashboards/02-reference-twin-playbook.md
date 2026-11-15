# Reference-twin playbook

**How to rebuild a gallery dashboard so it matches its `reference.*` image.** Follow the steps in order. Do not skip a step, do not reorder, do not invent a different method. Every pattern here is taken from one finished build you must open and copy from:

> **Worked example: `site/dashboards/haven-listings/`** (`index.html`, `style.css`, `app.js`). Open it in a browser first. Then read its three files top to bottom. When this playbook says "like Haven", copy that code and change the numbers.

One dashboard at a time. Finish it completely before you open the next one.

---

## Step 0. Rules that override everything

1. **Look at what you made.** After every step that changes the page, take a screenshot and open it. If you did not open the screenshot, the step is not done. A passing check with a broken screenshot is a failure.
2. **Start the overview markup from an empty file.** Do not edit the old `index.html`/`style.css`/`app.js` into shape. Rename nothing, keep nothing "just in case". Write new files, then delete what they replace.
3. **No shared page templates.** Each page's markup is written for this dashboard.
4. **Never edit `scripts/dashboards-check.mjs` or `signature_tech` in the catalog.** If a gate looks wrong, stop and write that in the PR.
5. **Stop when stuck.** If a step fails twice, stop, commit what works, and write exactly what failed. Do not paper over it.

## Step 1. Measure the reference (15 minutes, no code yet)

1. Open `site/dashboards/<id>/reference.*`. Find the rectangle that is the actual UI (ignore mock-up backgrounds, hands, captions). Write its pixel box: `x0, y0, x1, y1`. Call its width `W` and height `H`.
2. Create `docs/validation/dashboards/fidelity/<id>.md` and write a table of **every** block in the UI:

   | Block | left % of W | top (px ÷ W × 100 = cqw) | width % of W | height in cqw | corner radius in cqw | what it is made of |
   |---|---|---|---|---|---|---|

   Vertical numbers are divided by **W**, not H. That gives `cqw` units (1cqw = 1% of the frame's width), which is what the CSS uses, so the picture scales as one piece.
3. For each block write "made of": photo, solid white, glass, clay, HUD outline, 3D object. And its **outline type**: rounded rectangle, poured (hangs off the frame edge), scooped (a bite taken out), tab, chamfered, wave, arc.
4. List every text, icon, chip, avatar and chart inside each block.
5. Sample five colors with Pillow: backdrop, main surface, accent, text, the hero's dominant tone.

Haven's numbers, as an example: frame `708 × 500`; header band `left 26.6%, width 46.8%, height 8cqw`; glass card `right 1.3cqw, bottom 1.3cqw, width 31.4%, height 33cqw, radius 5cqw`.

## Step 2. The frame (copy from Haven)

```css
.x-frame {
  position: relative;
  width: min(1104px, 100vw - 48px, (100vh - 120px) * 1.416); /* 1.416 = W / H of the reference */
  aspect-ratio: 708 / 500;                                   /* W / H */
  container-type: inline-size;                               /* makes cqw work inside */
  border-radius: 9cqw; overflow: hidden;
}
```

- Every child is `position: absolute` and uses the numbers from your table: `left: 26.6%`, `top: 11.2cqw`, `width: 46.8%`, `height: 8cqw`, `border-radius: 3.6cqw`.
- Font sizes: `font-size: max(14px, 1.45cqw)`. The `max()` keeps text readable when the frame is small. Body text never under 14px, nothing under 12px.
- Small round controls get a 44px invisible hit area with an `::after` (see `.hl-rail a::after`).

Take a screenshot. The empty frame must sit where the reference's frame sits.

## Step 3. Backdrop and hero art

- **Backdrop behind the frame** is `position: fixed; inset: 0; z-index: -1` so it covers any scroll length. Haven's rock is procedural: `feTurbulence` → `feDiffuseLighting` (see `#hl-rock` in `index.html`). Use the same filter with other colors for stone, sand, paper or plaster.
- **Hero art** fills the frame as an `<img>` with `object-fit: cover`. Give it `srcset` with a file at least 1.5× the rendered width.
- **Light it for text:** one overlay div with gradients (`.hl-sky`): a top tint and a side scrim where text sits.
- **3D object instead of a photo:** when `signature_tech` has `webgl`, the hero is a three.js canvas with a transparent background, never a picture of a 3D thing. See Step 7.

## Step 4. Outlines that are not rectangles

Pick the recipe by the outline type you wrote in Step 1.

### 4a. Poured shape (hangs off the frame edge with curved shoulders)

The shape is a normal box touching the edge. Each shoulder is a small square pseudo-element next to it, filled with a radial gradient that is transparent inside a circle and solid outside:

```css
.x-band { --f: 3.4cqw; position: absolute; top: -1px; left: 26.6%; width: 46.8%; height: 8cqw;
          background: var(--surface); border-radius: 0 0 3.6cqw 3.6cqw; }
.x-band::before, .x-band::after { content: ""; position: absolute; top: 1px; width: var(--f); height: var(--f); }
.x-band::before { right: 100%; background: radial-gradient(circle at 0 100%,    transparent calc(var(--f) - 0.5px), var(--surface) var(--f)); }
.x-band::after  { left: 100%;  background: radial-gradient(circle at 100% 100%, transparent calc(var(--f) - 0.5px), var(--surface) var(--f)); }
```

The `circle at …` corner is the corner of the little square that is **farthest from both the shape and the edge**. For a shape on the bottom-left corner see `.hl-slab`. For one on the bottom edge see the phone tab bar `.hl-rail::before`.

### 4b. Scoop (a round bite out of a card, with a button sitting in it)

```css
.x-card { mask: radial-gradient(circle 6.5cqw at 5.2cqw calc(100% - 4.4cqw), transparent 98.5%, #000 100%); }
.x-round { /* the button: same center as the mask circle, radius about 1cqw smaller */ }
```

Add the `-webkit-mask` twin. A masked element cannot have an outer `box-shadow`; put shadows on a wrapper with `filter: drop-shadow()` or use inset shadows.

### 4c. Other outlines

| Outline | How |
|---|---|
| Tab on a card, folder shape | poured shape (4a) on the card's top edge |
| Chamfered HUD panel | `clip-path: polygon(...)` with cut corners, plus an inline SVG `<path>` of the same points for the glowing 1px stroke |
| Wave or dune divider | inline SVG `<path>` with cubic curves, `preserveAspectRatio="none"`, stretched across the block |
| Ring segments, dial arcs | inline SVG, one `<path>` per segment using arc commands; `stroke-linecap: round` |
| Blob | `border-radius` with 8 values (`60% 40% 55% 45% / 50% 60% 40% 50%`) or an SVG path |

Take a screenshot after each shape. Compare its edge against the reference at 200% zoom.

## Step 5. Materials

### Glass (5 layers, copy `.hl-card`)

```css
background: linear-gradient(160deg, var(--glass-fill-1), var(--glass-fill-2));   /* 1 tint, 60–70% */
backdrop-filter: blur(22px) saturate(160%) brightness(1.06);                      /* 2 blur */
box-shadow: inset 0 1px 0 var(--glass-edge), inset 1px 0 0 var(--glass-edge),     /* 3 light edge top + left */
            inset 0 -1px 0 var(--glass-low), inset -1px 0 0 var(--glass-low);     /* 4 dark edge bottom + right */
/* 5 specular: ::before with a diagonal white gradient, mix-blend-mode: soft-light, moved by --spec on pointermove */
```

Glass needs a busy backdrop behind it (photo, gradient haze, 3D). Text on glass must pass contrast: raise the tint opacity until it does.

### Other materials

| Material | Recipe |
|---|---|
| Solid poured white | `background: var(--surface)`, soft shadow, 1px inner border at 12% ink |
| Clay | fill + `box-shadow: inset 0 -6px 10px rgb(0 0 0 / .08), inset 0 4px 6px rgb(255 255 255 / .7), 0 14px 24px rgb(0 0 0 / .12)`, big radius |
| Neumorphic | same color as the page, `box-shadow: 8px 8px 18px dark, -8px -8px 18px light` |
| HUD | dark translucent fill, 1px cyan stroke, brighter corner brackets, scanline overlay at 3% |

All colors are tokens in `:root` at the top of `style.css`. No raw color inside a rule.

## Step 6. Content, then interactions

1. Put in every item from your Step 1 list, in place, with believable fictional copy.
2. Data lives in one array at the top of `app.js` (see `HOMES`). 8–12 records minimum.
3. State lives in one object (`S`). Every control changes `S` and calls `render()`.
4. Each page must have at least three working interactions. Haven has: mode toggle, three filters, next-home arrow, like, save, share, book; search, sort, open detail drawer; pick a day, move a viewing, cancel with undo, book with validation; profile form with errors, switches, remove saved.
5. Loading, empty and error states come from one helper (`stateBox`) and one "Preview a state" control on the Settings page only.
6. Drawer: focus goes in, Tab stays in, Esc closes, focus returns (see `openHome`/`closeDrawer`).

## Step 7. A 3D hero (only when `signature_tech` has `webgl`)

Use `site/dashboards/_vendor/three@0.170.0/` and `_shared/three/stage.js`. The canvas is transparent and positioned like any other block. Put this in `<head>` before any module script, then import the stage:

```html
<script type="importmap">{ "imports": { "three": "../_vendor/three@0.170.0/three.module.min.js", "three/addons/": "../_vendor/three@0.170.0/examples/jsm/" } }</script>
<script type="module">
  import * as THREE from 'three';
  import { createStage } from '../_shared/three/stage.js';
  const stage = createStage(document.querySelector('canvas[data-hero]'), { poster: 'media/hero-poster.png' });
  // stage.scene.add(yourMesh); stage.onFrame((t) => { yourMesh.rotation.y = t * 0.2; });
</script>
```

Build the object from three.js geometry:

| Object | Geometry | Material |
|---|---|---|
| Hologram cube | 3 nested `BoxGeometry` shells + `EdgesGeometry` lines + torus pedestal | `MeshPhysicalMaterial` transmission 1, thickness 0.6, emissive cyan, additive lines |
| Glass orb | `SphereGeometry` | transmission 1, ior 1.4, attenuationColor |
| Ring | flattened `TorusGeometry` | metalness 1, roughness 0.18, clearcoat 1 |
| DNA helix | two `TubeGeometry` along helix curves + cylinder rungs | brushed metal |
| Terrain | `PlaneGeometry` 200×200, vertices displaced by layered noise, vertex colors by height | `MeshStandardMaterial`, flatShading for low-poly |
| Lamp | `LatheGeometry` profile + cylinder cord + emissive disc | brushed aluminum |
| Clay forms | spheres, capsules, tori, beveled `ExtrudeGeometry` | roughness 0.85, sheen 0.4 |

Required: loop runs only while visible, one frame under reduced motion, a transparent 2× PNG poster as fallback, pointer tilt of at most 8°. The object must react to one control on the page. Tools for organic models and what to do when they are unavailable: [03-asset-and-tool-map.md](03-asset-and-tool-map.md).

## Step 8. Motion (copy the keyframes from Haven)

- Frame scales in (`hl-in`), poured shapes drop in (`hl-pour`), text and cards rise with a stagger (`hl-rise` with increasing delays).
- Content swap: re-trigger a short fade on the changed block (`.is-swap`).
- Hover: lift 2–3px, icons nudge, bell rings once.
- Pointer parallax on the hero (max 10px) and a moving glass highlight.
- Charts draw in with `stroke-dashoffset` (`hl-draw`).
- Under `prefers-reduced-motion`, nothing moves.

## Step 9. Inner pages live in the same frame

Do what Haven does: the frame, the header and the navigation stay. The page content appears as **one frosted sheet inside the frame** (`.hl-sheet`), with the hero art still visible around it. Each page's content is written for this product. Never a new bare page with grey cards.

## Step 10. Phone (≤ 720px)

Redesign, don't shrink. Haven's phone layout: the frame becomes tall, the header band holds the mode pills and filters, the page rail pours out of the **bottom** edge as a tab bar, the secondary slab is hidden, the glass card spans the width. Units switch from cqw to px inside the media query.

## Step 11. Check, look, compare (three rounds minimum)

```bash
node scripts/build.mjs
node scripts/dashboards-check.mjs <id>
```

Then, every round:

1. Open `site/dashboards/<id>/frames/pages/overview-full.jpg`, every other page capture, and `frames/phone.jpg`. **Look at each one.**
2. Put the reference crop and your overview side by side at the same width. Write every difference you can see into `fidelity/<id>.md`.
3. Fix them. Repeat. Stop only when round three finds nothing a designer would care about, or state plainly what is left and why.

Checks that fail and what they mean:

| Message | Fix |
|---|---|
| `low contrast` | raise the surface tint, add a scrim, or darken the text token |
| `thin page` | the page is missing real content; add what the product needs, not filler |
| `signature_tech …` | the technique is missing; build it for real |
| `low-res image` | export the image larger or add a `srcset` |
| `generic page kit` / `filler rows` | a shared template or placeholder names are on the page; write real content |

## Step 12. Finish

1. Update the dashboard's entry in `catalog/dashboards.json` (`summary`, `signature`, `layout`, `fx`, `materials`).
2. Delete unused media and old CSS/JS.
3. One commit: `Twin: <Name>`. Push to your branch. Do not merge.
4. Report: the side-by-side image, what matches, what does not.
