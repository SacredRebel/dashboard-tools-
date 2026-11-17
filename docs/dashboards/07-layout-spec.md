# Layout spec: the reference as a failing check

Written rules did not stop builders from getting the layout wrong while every other gate passed. So the layout of a reference is written down as numbers, and `scripts/dashboards-check.mjs` fails when the page does not match them.

## What it is

`site/dashboards/<id>/layout.json`, written by the maintainer from the reference image. It names the major elements of the overview and gives each a box.

- **Unit:** percent of the frame's width, measured from the frame's top-left corner. Heights use the frame's width too, so a reference that is cropped at the bottom still measures correctly.
- **Where it is checked:** the overview page, default variant, 1440px wide.

```json
{
  "frame": { "min_w_vw": 90, "aspect": [0.5, 0.62] },
  "boxes": {
    "lamp":  { "x": 41.9, "y": 14.2, "w": 17.8, "h": 13.9, "note": "the shade, not the cord" },
    "room":  { "count": 5, "min_w": 2.6, "max_w": 5.5, "within": { "x": [22, 38], "y": [11, 54] } }
  }
}
```

| Key | Meaning |
|---|---|
| `frame.min_w_vw`, `max_w_vw` | frame width as a percent of the viewport |
| `frame.aspect` | allowed range of frame height ÷ width |
| `x`, `y`, `w`, `h` | the box. Position may be off by 3; size by a quarter of its value (at least 1.5). Leave a key out when the reference does not show it |
| `tol` | one tolerance for all four, when a box needs to be tighter or looser |
| `count` | at least this many visible elements carry the name; every one must pass the size and `within` limits |
| `min_w`, `max_w`, `min_h`, `max_h` | size limits |
| `within` | the element's centre must fall inside this x and y range |
| `object` | measures a 3D hero's silhouette and shading: see [08-object-spec.md](08-object-spec.md) |
| `material` | `"clay"`: at least two shadow layers (soft dark drop plus light highlight) and a corner radius of 12px or more. `"glass"`: the element must have a backdrop blur of at least 8px, a fill no more opaque than 0.62 and a light edge |
| `ref` | `[x, y, w, h]` in reference-image pixels: the part of the reference this box must look like, used for the compare sheet when the box is not at the reference's own position |
| `note` | what the element is, printed with the failure |

Top-level keys beside `frame` and `boxes`:

| Key | Meaning |
|---|---|
| `ref_frame` | `[x, y, width]` of the frame inside the reference image, in pixels. Lets the check cut the matching piece of the reference for every box |
| `frame.backdrop` | a description; requires a `data-ref="backdrop"` element with a gradient, image, canvas or SVG covering the frame |
| `nav` | `{ "ref": "<box name>", "min_routes": n }`: every control in that box opens its own page |
| `requirements` | owner requests, `{ "id": "R1", "text": "…" }`; each must be answered in the polish report |
| `adaptation` | set when the reference lacks this screen size and the maintainer designed it |

The whole process these keys belong to: [00-twin-contract.md](00-twin-contract.md).

## How a builder uses it

1. Read `layout.json` before writing any markup. It is the layout. The reference image supplies everything the numbers do not: materials, colour, type, detail.
2. Put `data-ref="frame"` on the app frame and `data-ref="<name>"` on the element that is each box. Tag the real, visible element (the lamp shade, not an empty wrapper around it).
3. Size the frame as a container and lay out in `cqw`, so the percentages are the CSS values (playbook Step 3).
4. Run `node scripts/dashboards-check.mjs <id>`. Each failure prints what it measured and what it wants, for example `layout lamp: w 6.1 (want 17.8 ±4.5)`. Fix the page and run again until there are none.
5. Then do the look: [05-style-frameworks.md](05-style-frameworks.md), [06-verification.md](06-verification.md).

## Rules

- Only the maintainer writes or edits `layout.json`. A builder who thinks a number is wrong says so in the pull request and leaves the file alone.
- Never tag a hidden, empty or transparent element to satisfy a box. Tagged elements must be the thing the note describes.
- Passing the spec means the layout is right. It does not mean the dashboard is finished: the questions in 06-verification still apply.
- Phone layout is not covered by the spec; follow the playbook's phone step.

## Writing a spec (maintainer)

Open the reference, find the frame's left, right and top edges, and measure each major element in pixels. Divide by the frame's width. Aim for 10 to 15 boxes: the frame, the top bar parts, every card, the hero object, and the two or three things a builder is most likely to get wrong (bar width, object size, where a row starts). Add a `count` box for repeated parts.
