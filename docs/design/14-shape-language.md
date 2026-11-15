# Shape language — cut, notched and organic outlines

Gallery references rarely use plain rounded rectangles. Frames pour into photos, cards scoop around buttons, HUD panels chamfer their corners, and dials use ring segments. Use the shared shape kit instead of `border-radius` when the outline is part of the composition.

**Runtime:** [`site/dashboards/_shared/shape/`](../../site/dashboards/_shared/shape/)  
**CSS:** `shape.css` (drop-shadow wrappers, stroke hosts)  
**JS:** `paths.js` (builders) · `bind.js` (`DB.shape.bind()` / `data-shape`)

---

## Primitives

| Id | Use | Notes |
|---|---|---|
| `notchFrame` | Haven-style header that dips into a photo; Buy/Rent pills sit in side notches | Concave shoulder arcs; `notches[{edge,from,to,depth,r}]` |
| `scoop` | Listing / Folio / Orchard cards with a nested round button | One corner is a concave quarter-circle |
| `tabCard` | Glacier header tabs, Dune titled panels, Prism folder card | Raised label tab with concave fillets into the body |
| `chamfer` | Citadel / Glacier / Aether HUD panels | Cut corners + matching SVG stroke for the glow outline |
| `wave` | Ridgeline divider, Saffron dune cut, Canopy splits | Seeded organic edge |
| `blob` | Soft masses (Pebble, Taffy, Saffron path) | Closed organic silhouette |
| `arcSlot` | Hollow wheel, Glacier lock ring, Copper bands, Solstice arc | Ring segment with rounded ends |

---

## How to apply

```html
<div class="shape-shadow">
  <article data-shape="scoop"
           data-shape-opts='{"r":24,"corner":"tr","scoopR":32}'>
    …
  </article>
</div>
<script type="module">
  import { bindShape } from '../_shared/shape/bind.js';
  bindShape(document);
</script>
```

Rules:

1. **Shadows** on clipped elements use `filter: drop-shadow()` on a `.shape-shadow` wrapper — `box-shadow` is clipped away.
2. **Borders** are an SVG stroke of the same path (`[data-shape-stroke]`), not a CSS border.
3. **Glass** sits on the clipped element itself (`backdrop-filter` + `mat-glass-*`).
4. **Focus** follows the shape (SVG stroke) or sits on the inner control.
5. Paths recompute on `ResizeObserver` so outlines stay crisp at any size.
6. Gates look for an element ≥ 300px with `clip-path` / mask, or `svg path[data-shape]` — a decorative 40px clip does not count as signature shape work.

---

## Pair with materials and 3D

- Shape + [`10-materials.md`](10-materials.md) glass variants for Haven, Mauve, Saffron.
- Shape + WebGL stage ([`_shared/three/stage.js`](../../site/dashboards/_shared/three/stage.js)) for Glacier dials and Citadel HUD frames.
