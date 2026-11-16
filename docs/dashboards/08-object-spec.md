# Elements and objects: the build framework with guardrails

This is how every element of a gallery dashboard gets built so that a weaker model cannot miss. It came out of two rejected rounds on Mauve Ledger and Ember Rooms: written rules did not work, measured rules did.

## The principle

**Anything a builder got wrong becomes a number the check measures.** Prose explains; numbers decide. A builder never argues with the check and never edits it.

| Layer | What it fixes | Where the numbers live | Who writes them |
|---|---|---|---|
| 1. Layout | where each element is and how big | `layout.json` boxes ([07-layout-spec.md](07-layout-spec.md)) | maintainer |
| 2. Parts | repeated or small parts that get dropped (bars, tooltip, axis, buttons) | `layout.json` `count`, `min_w`, `within` | maintainer |
| 3. Objects | the shape and shading of a 3D hero object | `layout.json` `object` (this page) | maintainer |
| 4. Technique | glass, cut shapes, WebGL really used | catalog `signature_tech` | maintainer |
| 5. Look | material, colour, type, detail | the builder's side-by-side with the reference ([06-verification.md](06-verification.md)) | builder, then reviewer |

Layers 1 to 4 are mechanical. Layer 5 is the only one left to judgment, and it is small once the others pass.

## What went wrong, and the guardrail that now stops it

| What the builder did | Guardrail |
|---|---|
| Loose cards on a page where the reference has one framed window | `frame` width and aspect |
| Thin bars where the reference has wide stacked blocks | `chart-bar` `count` and `min_w` |
| Dropped the axis, tooltip, card title | a `count: 1` box for each |
| A section pushed below a gap | its `y` |
| A number wrapped onto two lines | `kpi-value` `max_h` |
| A hero object drawn tiny in a corner | the object's box, and `object.min_fill` |
| A dome built as a hemisphere: a soft blob | `object.profile` |
| A flat, unshaded object | `object.min_shade` |
| An object cut off by its canvas | `object.no_clip` |
| A decorative line that does not meet the object (cord, stem) | review, layer 5 |

## The object spec

Add `object` to the box of a WebGL hero. The check calls `window.DBHero.poster()`, reads the image, and measures the opaque pixels.

```json
"lamp": {
  "x": 41.9, "y": 14.2, "w": 17.8, "h": 13.9,
  "object": {
    "min_fill": [0.72, 0.75],
    "aspect": 1.28, "aspect_tol": 0.2,
    "profile": { "at": [0.1, 0.5, 0.9], "width": [0.16, 0.7, 0.98], "tol": 0.15 },
    "min_shade": 0.05,
    "no_clip": true
  }
}
```

| Key | Meaning |
|---|---|
| `min_fill` | the object's silhouette covers at least this share of the canvas width and height |
| `aspect` | silhouette width ÷ height |
| `profile` | the silhouette's width at given heights (0 = top, 1 = bottom), as a share of its widest row. This is the shape: a bell is `[0.16, 0.7, 0.98]`, a hemisphere is about `[0.6, 0.95, 1]`, a cone is `[0.1, 0.5, 0.9]` with straight sides |
| `min_shade` | spread of brightness across the object (standard deviation, 0 to 1). Below about 0.04 it reads as a flat blob |
| `no_clip` | the silhouette must not touch the left, right or bottom edge of the canvas |

Run with `LAYOUT_DEBUG=1 node scripts/dashboards-check.mjs <id>` to print what the check measured (it reports as a failure line starting with `info`; run again without the flag for the real result).

## Building an object so it passes

Order matters. Do not touch materials until the silhouette passes.

1. **The canvas is the object's box.** Size the canvas element to the box in `layout.json` (in `cqw`). Things outside the object, such as a cord, a ground shadow or a pool of light, are CSS around the canvas, not part of the 3D scene.
2. **Silhouette first.** Write the object's outline as a list of `[height, radius]` points taken from `object.profile`, then build it:
   - anything round about a vertical axis (lamp, vase, bottle, knob, bowl): `LatheGeometry` through a `SplineCurve` of those points;
   - a flat shape with thickness (logo, badge, key): `ExtrudeGeometry` from a `Shape`;
   - many copies (beads, bars, particles): `InstancedMesh`;
   - a compound object: a `Group` of the above. A sphere, box or cone alone is almost never the object in the reference.
3. **Frame it.** With a vertical field of view `fov` and an object `h` units tall, the camera distance is about `(h × 0.6) ÷ tan(fov ÷ 2)`. Raise the camera a little when the reference shows the near rim curving down. Move and scale the group until `min_fill` passes and `no_clip` passes.
4. **Give it form.** `MeshPhysicalMaterial` with the stage's room environment (`stage.envRoom()`), one key light from the upper left, one weak rim light from behind on the other side. Satin metal: metalness 0.6, roughness 0.35. Matte plastic or ceramic: metalness 0, roughness 0.6, clearcoat 0.3. Add a thin torus on any open rim so the edge has thickness and catches a highlight.
5. **Wire it.** Expose `window.DBHero` with `poster()`, `recolor()` and the control the dashboard needs (`setIntensity`, `setMode`), read colours from CSS variables so variants recolor it, dispatch `db-hero-ready`, and save the fallback with `node scripts/hero-poster.mjs <id>`.
6. **Run the check, then look.** Crop the object out of a 1440px screenshot and put it beside the reference. Check the things the numbers cannot: colour, where it joins its surroundings, whether the light direction matches.

Worked example: `site/dashboards/ember-rooms/lamp.js` (a lathe from ten profile points, a rim torus, a warm underside disc, and a CSS light pool whose strength follows the intensity slider). Others: `meridian-labs/helix.js` (instancing), `pulsar-analytics/terrain.js` (ribbons).

## Tool routing (required, recorded)

Before building each element, pick its tool from this table and write the choice in the polish report ([templates/polish-report.md](../../templates/polish-report.md), "Tools used"). A pull request without that table is not reviewed. Every tool is in [catalog/tools.json](../../catalog/tools.json) with *use when / avoid when / how / fallback*; the full map is [03-asset-and-tool-map.md](03-asset-and-tool-map.md).

| Element | First choice (always works) | Use instead when | Catalog ids |
|---|---|---|---|
| Layout and structure | `layout.json`, or measure the reference yourself | no spec yet and you want a first list of elements | `screenshot-to-code`, `screencoder`, `design2code`, `draw-ui`, `screenshot-to-page`, `ui-screenshot-to-prompt`, `umi-ocr`; `agent-vision-toolkit` if your model cannot see images |
| 3D object, round or flat | three.js lathe or extrude (this page) | never: this is faster and cleaner than generating | `threejs`, `cube-3d-text` |
| 3D object, organic | three.js primitives in a group | a GPU is available and the tool runs within ten minutes | `hunyuan3d`, `wonder3d`, `3dtopia`, `image-to-3dlab`, `stable-dreamfusion`, `text2room`, `mvs-texturing`, `stl-texturizer` |
| Depth on a photo | layered image with pointer parallax | the tool runs within ten minutes | `depthflow` |
| Images | the agent's own image generation, or procedural SVG | a GPU is available | `stable-diffusion`, `text-to-image` |
| Motion and micro-interactions | Motion and GSAP (vendored), CSS keyframes | looking for a pattern to rebuild in vanilla | `motion`, `gsap`, `react-bits`, `reactbits-tools`, `animata` |
| Component behavior | this repo's rulebook | checking menu, dialog or focus behavior | `material-ui` |
| Direction with no reference | this repo's themes and style frameworks | exploring palettes and type | `ui-ux-pro-max`, `hendurhance-ui-ux`, `design-resources-for-developers` |
| Don't know how | [03-when-you-dont-know.md](../onboarding/03-when-you-dont-know.md) | | `quickref`, `learn-anything` |

Three rules for every outside tool: never give it a gallery reference image; its output is a starting point that must still pass the spec; anything it produces that ships is original, optimized and credited in `media/CREDITS.md`.

## Who does what

- **Maintainer:** measures the reference and writes `layout.json`, including any `object`. Reviews with the check output and one screenshot.
- **Builder (any model):** builds until the check passes with zero failures, then does the side-by-side. Flags a number it believes is wrong in the pull request and leaves the file alone.
- **When a builder passes every number and the object still looks wrong,** the maintainer adds the missing number here and to the spec. That is how this framework grows.
