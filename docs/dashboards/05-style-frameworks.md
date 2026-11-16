# Style frameworks

**One framework per look.** A dashboard's reference image decides which frameworks apply. Each framework below says how to recognise the look, the exact recipe, where a finished example lives, what to check, and what not to do.

Read this with [02-reference-twin-playbook.md](02-reference-twin-playbook.md) (the build order), [04-finishing-pass.md](04-finishing-pass.md) (the look-then-fix pass) and [06-verification.md](06-verification.md) (how to decide it is done).

## Rule zero: every dashboard is unique

**Form comes from the dashboard's own reference. Techniques come from the frameworks. Never mix those up.**

- *Form* = the overall shape: is there an outer frame or not, how many columns, where the hero sits, what the header looks like, how dense it is.
- *Technique* = how a surface, shape or object is made: glass layers, a poured fillet, a WebGL mesh.

What went wrong before, so it is not repeated: Pulsar's reference is a flat dark board of separate tiles. It was built with Haven's big rounded device frame and poured header, because Haven was the example that had been read last. The result passed every automated check and was the wrong dashboard. It had to be rebuilt from an empty file.

Before any code, write these four lines in `docs/validation/dashboards/fidelity/<id>.md` and keep to them:

```
Form:        <outer frame? columns? where is the hero? header style? density?>   ← from THIS reference only
Frameworks:  <ids from the table below, each tied to a named block in the reference>
Signature:   <the one thing this dashboard has that no other has>
Not this:    <which other dashboard it must not end up resembling, and why>
```

If two dashboards would share a frame, a header and a layout after your build, one of them is wrong.

## Which frameworks does a reference need?

| You see in the reference | Framework |
|---|---|
| Panes you can see a photo or glow through, bright thin edges | [F1 Frosted glass](#f1-frosted-glass) |
| Thick, wet-looking controls with tinted edge glow and bent highlights | [F2 Liquid glass](#f2-liquid-glass) |
| Puffy pastel shapes, soft inner shadows, toy-like icons | [F3 Clay](#f3-clay) |
| Matte dark or mid-tone tiles that sit slightly raised | [F4 Soft-3D tiles](#f4-soft-3d-tiles) |
| Same-colour surface with paired light and dark shadows, dials and knobs | [F5 Neumorphic](#f5-neumorphic) |
| Cut corners, glowing 1px outlines, scanlines, grids | [F6 HUD and holographic](#f6-hud-and-holographic) |
| Outlines that are not rectangles: poured headers, scoops, tabs, waves | [F7 Organic shapes](#f7-organic-shapes) |
| A real object you could turn: cube, ring, helix, orb, lamp, brain | [F8 3D object](#f8-3d-object) |
| Glowing mountains, ridges, waves of light | [F9 3D ridges and terrain](#f9-3d-ridges-and-terrain) |
| Flat panels arranged in space: a curved wall, a tilted pane | [F10 CSS 3D](#f10-css-3d) |
| A scene behind the UI: photo, painted landscape, rock, paper | [F11 Backdrop and hero art](#f11-backdrop-and-hero-art) |
| Any reference at all | [F12 Colour](#f12-colour), [F13 Type](#f13-type), [F14 Motion](#f14-motion) |

Most dashboards use three to five. Write down which block each one applies to.

---

## F1 Frosted glass

- **Recognise:** translucent panes over a busy backdrop; white-ish edge; content behind is blurred, not hidden.
- **Recipe (5 layers):** tint gradient 60–70% → `backdrop-filter: blur(18–26px) saturate(150–170%)` → 1px light inner edge top and left → 1px dark inner edge bottom and right → a soft diagonal highlight (`::before`, `mix-blend-mode: soft-light`). Wide soft shadow outside.
- **Needs:** something behind it (photo, gradient haze, 3D). Glass on a flat colour is just a grey box.
- **Example:** `site/dashboards/haven-listings/style.css` `.hl-card`, `.hl-sheet`.
- **Check:** text on glass passes contrast in every variant (raise the tint until it does); at least three panes; the backdrop is visibly blurred through them.
- **Don't:** put glass behind dense tables; use one flat `rgba()` fill and call it glass.

## F2 Liquid glass

- **Recognise:** thick rounded controls, coloured glow along the rim, highlights that bend.
- **Recipe:** F1 plus a tinted rim (`box-shadow: 0 0 0 1px` tint, outer glow in the same hue at 30–40%), a strong top highlight band, larger radius, and optional refraction (`backdrop-filter: url(#filter)` with `feTurbulence` + `feDisplacementMap`, behind `@supports`, with plain blur as the fallback).
- **Scale matters:** liquid glass reads only when controls are large. Do not shrink them to fit more in.
- **Check:** each control has rim, highlight and shadow; the tint differs per control where the reference's does.
- **Don't:** apply to body text containers.

## F3 Clay

- **Recognise:** matte pastel, inflated shapes, no hard edges, coloured icon blocks.
- **Recipe:** flat pastel fill + `inset 0 -0.7cqw 1.1cqw` dark at ~11% + `inset 0 0.5cqw 0.7cqw` white at ~85% + outer `0 1.3cqw 2.4cqw` dark at ~16%. Radius 2.5–4.5cqw. Icons are raised coloured tiles with a white glyph. Charts are fat pills and thick donuts.
- **Example:** `site/dashboards/mallow-music/style.css` (`--clay`, `.mm-kpi`, `.mm-ico`).
- **Check:** depth matches the reference side by side; renders are blended into their cards (see F11), never boxed.
- **Don't:** use thin line icons; use sharp shadows.

## F4 Soft-3D tiles

- **Recognise:** matte charcoal or mid-tone tiles, each slightly raised off a darker board, no glass.
- **Recipe:** `background: linear-gradient(160deg, lighter, base 60%, darker)`; shadow stack: large dark drop + small tight drop + 1px top inner highlight + 1px bottom inner shade. Round "physical" buttons: radial gradient lit from top-left with inner top highlight and inner bottom shade.
- **Example:** `site/dashboards/pulsar-analytics/style.css` `.pz-tile`, `.pz-orb span`, `.pz-dial`.
- **Check:** tiles separate from the board at a glance; no outer device frame unless the reference has one.
- **Don't:** add neon outlines to every tile.

## F5 Neumorphic

- **Recognise:** surface and page are the same colour; shapes are made only by a light shadow on one side and a dark shadow on the other; dials, knobs, sliders.
- **Recipe:** `background: var(--surface)` equal to the page; raised = `8px 8px 18px dark, -8px -8px 18px light`; pressed = the same pair `inset`. Accent colour only on the active arc or thumb.
- **Check:** controls are still findable (focus ring, active colour); contrast of labels passes, since neumorphic greys fail easily.
- **Don't:** use it for data tables or long text.

## F6 HUD and holographic

- **Recognise:** dark navy, cyan and violet light, chamfered panels, corner brackets, grid floors.
- **Recipe:** panel = `clip-path: polygon()` with cut corners + an inline SVG stroke of the same points for the 1px glowing outline + brighter corner brackets + scanline overlay at ~3%. Mono or squared type for labels. Glow by `filter: drop-shadow` in the accent hue.
- **Check:** outlines are crisp at 2×; glow does not wash out text.
- **Don't:** leave panels as rounded rectangles; put a photo of a hologram in a box (use F8).

## F7 Organic shapes

- **Recognise:** a header that flows out of an edge, a card with a bite taken out, tabs, waves, blobs.
- **Recipe:** poured shape = box on the edge + two small squares filled with `radial-gradient(circle at <far corner>, transparent R, colour R)`; scoop = CSS `mask: radial-gradient(circle R at X Y, transparent, #000)`; waves and arcs = inline SVG paths. Full code: playbook Step 4.
- **Example:** `site/dashboards/haven-listings/style.css` `.hl-band`, `.hl-slab`, `.hl-card`.
- **Check:** zoom to 200% on each junction: the curve is continuous, no seam, no sliver.
- **Don't:** add poured shapes to a reference that has none. This is the framework most often transplanted by mistake.

## F8 3D object

- **Recognise:** one object with real volume and lighting.
- **Recipe:** three.js through `_shared/three/stage.js`; transparent canvas; object built from primitives (or a `.glb` under 1.5 MB); `window.DBHero` API (`setMode`, `recolor`, `poster`); HTML buttons pinned to 3D points for labels; CSS `drop-shadow` for the ground shadow; drag and arrow keys to turn; poster image for no-WebGL. The ten rules: playbook Step 7.
- **Example:** `site/dashboards/meridian-labs/helix.js`.
- **Check:** nothing touches the canvas edge; the object reacts to one page control; the poster exists and matches; colours follow the variant.
- **Don't:** use a picture of the object; draw text in WebGL.

## F9 3D ridges and terrain

- **Recognise:** glowing layered mountains or waves, usually over dark.
- **Recipe:** each ridge is a vertical ribbon: top vertices on the profile curve, bottom vertices on the base; vertex colours with alpha (bright at the crest, zero at the base); `MeshBasicMaterial`, `transparent`, `depthWrite: false`, `toneMapped: false`; an additive `Line` along the crest; ridges at different depths so pointer parallax separates them; fade both ends of every ribbon.
- **Example:** `site/dashboards/pulsar-analytics/terrain.js`.
- **Check:** ridge heights and positions match the reference's silhouette; colours are not bleached; the scene sits behind the tiles where the reference's does.
- **Don't:** use transmission materials for glow (they go milky).

## F10 CSS 3D

- **Recognise:** flat panels placed in space.
- **Recipe:** `perspective` on the stage, `transform-style: preserve-3d` on the ring, each panel placed by a `data-o` offset with `translateX/Z` + `rotateY` + `scale`; JavaScript only changes `data-o`; arrows, click, drag and keys.
- **Example:** `site/dashboards/tidebath-showroom/style.css` `.tb-room[data-o]`.
- **Check:** only the front panel's controls are focusable; loose parts are hidden, not scaled, when the hero shrinks.

## F11 Backdrop and hero art

- **Recognise:** anything pictorial behind or inside the UI.
- **Recipe:** backdrop is `position: fixed; inset: 0` so it never ends in a seam. Procedural textures (rock, paper, sand) with `feTurbulence` + `feDiffuseLighting`. Images at 1.5× rendered width or more, with `srcset`. **Put art in the surface, not on it:** matching background + masked fade, or `mix-blend-mode: multiply`, or a real cut-out. Set `width` and `height` in CSS on every sized image.
- **Examples:** Haven (photo + procedural rock), Mallow (render blended into a card).
- **Check:** no visible rectangle around any render; no stretched image; no seam at the bottom of a long page.
- **Don't:** trace or reuse reference pixels.

## F12 Colour

- **Recipe:** sample five colours from the reference with Pillow (backdrop, main surface, accent, text, hero tone). Name them as tokens in `:root`. Build each variant by overriding tokens only. Text colours are chosen for contrast on the surface they sit on, not copied from the reference (references often fail contrast).
- **Check:** the gallery's pixel-contrast check passes in every variant; accents are used where the reference uses them, not everywhere.

## F13 Type

- **Recipe:** match the *character* (geometric, grotesk, condensed, serif, mono) with a self-hosted font in `_vendor/fonts/`. Match the size ratio of numerals to labels. Match heading line breaks by tuning width and size. Body ≥ 14px, nothing under 12px.
- **Check:** headings break where the reference's do.

## F14 Motion

- **Recipe:** entrance (board, then tiles staggered, then hero); charts draw or grow once; hover lifts 2–4px; hero reacts to a control and to the pointer; page changes cross-fade. Only `transform`, `opacity`, `filter`. Everything lands in its final state under reduced motion. Loops pause off screen.
- **Check:** no chart animation changes where a shape *ends up* (a donut slice's dash offset is its position; do not animate it to zero).

---

## Tools and skills by framework

| Framework | Skills (if installed) | Always available |
|---|---|---|
| F1, F2, F3, F4, F5 | `vectorlab-ux-skills:surfaces`, `frontend-design`, `design-skills:design-elevation` | [10-materials.md](../design/10-materials.md), the example CSS |
| F6, F7 | `frontend-design` | playbook Step 4, inline SVG |
| F8, F9 | (none needed) | `_vendor/three@0.170.0`, `_shared/three/stage.js`, `scripts/hero-poster.mjs` |
| F10 | `vectorlab-ux-skills:motion` | the Tidebath CSS |
| F11 | image generation tool; `image-generation` | Pillow for sampling; SVG filters |
| F12 | `vectorlab-ux-skills:colour-palette` | Pillow; the contrast check |
| F13 | `vectorlab-ux-skills:typography` | `_vendor/fonts/` |
| F14 | `vectorlab-ux-skills:motion`, `transitions`, `reduced-motion` | [09-motion-system.md](../design/09-motion-system.md), Motion and GSAP in `_vendor/` |
| Judging the result | `design-skills:design-critique`, `vectorlab-ux-skills:ux-audit`, `anti-slop` | [06-verification.md](06-verification.md) |

Unsure about a syntax or a concept: [03-when-you-dont-know.md](../onboarding/03-when-you-dont-know.md).
