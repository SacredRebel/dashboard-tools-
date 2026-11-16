# Finishing pass

**What to do after a dashboard is built and passes the checks, to take it from "structurally right" to finished.** A first build gets the blocks in place. This pass finds what is still wrong by looking, fixes it in small targeted edits, and stops when a side-by-side with the reference shows nothing a designer would care about.

It was written from finishing two dashboards another agent built (`mallow-music`, `pulsar-analytics`). Every item below is a defect that was really there and passed every automated check.

Which recipe fixes which surface: [05-style-frameworks.md](05-style-frameworks.md). How to decide it is done: [06-verification.md](06-verification.md).

## Tools and skills

| For | Use |
|---|---|
| Serving the site (3D modules need HTTP) | `python3 -m http.server 8080 -d site` |
| Captures at 1440 and 375, full-page | Playwright (Chromium with `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` when the page has WebGL) |
| Side-by-side with the reference | Pillow: reference crop and your capture at the same width in one image |
| Gates | `node scripts/build.mjs`, `node scripts/dashboards-check.mjs <id>` |
| WebGL fallback image | `node scripts/hero-poster.mjs <id> site/dashboards/<id>/media/hero-poster.png` |
| Judging what you see | `design-skills:design-critique`, `vectorlab-ux-skills:ux-audit`, `vectorlab-ux-skills:anti-slop` if installed; otherwise [02-rulebook.md](../design/02-rulebook.md) and [13-high-end-checklist.md](../design/13-high-end-checklist.md) |
| Techniques | [02-reference-twin-playbook.md](02-reference-twin-playbook.md) and the worked examples |

## The pass, in order

Work on one dashboard. Make one kind of fix at a time, capture, look, then the next.

### 1. Look at everything before changing anything

1. Capture the overview at 1440×900, the **full-length** overview, every other page, and the full-length phone page.
2. Put the reference crop next to the overview capture.
3. Write the list of what is wrong. Scroll the full-length captures to the bottom: most leftover bugs are below the first screen, where nobody looked.

Read only the code a finding points to (`grep -n` for the class, then that block). Do not read whole files.

### 2. Is it the right kind of design?

Compare the overall form with the reference before any detail.

- **Has it borrowed another example's signature?** Pulsar had been given Haven's big rounded device frame and poured header. Its reference is a flat dark canvas of separate tiles. The worked examples show *techniques*; the *form* comes from this dashboard's own reference. Remove borrowed chrome first, because everything else sits inside it.
- **Is the board a readable size?** A near-square board forced to fit the viewport height (`width: min(…, (100vh - …) * ratio)`) ends up a third of the screen wide. If the reference is square or tall, size by width and let the page scroll.

### 3. Art that sits in a box

A render with its own background colour looks pasted on. In order of preference:

1. **Same colour, faded edge.** If the image background is close to the card colour, size the image inside the card, set `overflow: hidden` on the card, drop any shadow around the image, and fade its edges: `mask-image: radial-gradient(ellipse 52% 56% at 48% 56%, #000 74%, transparent 100%)`.
2. **Multiply.** A light render background over a mid-tone card: `mix-blend-mode: multiply`.
3. **Cut it out.** Export a transparent PNG/WebP when neither works.

Sample the image corners with Pillow first, so you know which case you have.

### 4. Images that stretch

An `<img>` with a `height` attribute ignores `aspect-ratio`. Thumbnails become tall strips and push their rows out of the card. Set **both** `width` and `height` in CSS on every sized image.

### 5. Flat surfaces

Compare depth with the reference: shadow size, inner highlight, edge light. Strengthen the material tokens once (`--clay`, `--glass-*`) rather than per element. Icons in a clay or soft-3D design are coloured raised tiles with a white glyph, not thin lines on a pale square.

### 6. Charts that draw wrong

- **A donut whose slices do not match the legend:** a draw-in animation that ends at `stroke-dashoffset: 0` moves every slice to the top, because each slice's offset *is* its position. Reveal the ring as a whole (rotate and fade the SVG) and leave the offsets alone. Check inline styles and the reduced-motion rule for the same reset.
- Check every chart against its numbers by eye: the biggest value must be the biggest shape.

### 7. A 3D hero that looks washed out

A pale, milky object usually means transmission plus opacity plus tone mapping. For glowing lines over dark glass (terrain, grids, wireframes):

- faces: `MeshBasicMaterial` with the vertex colours multiplied to about 16% brightness, so nearer shapes hide farther ones;
- lines: one `THREE.Line` per row with full-brightness vertex colours, `AdditiveBlending`, `depthWrite: false`;
- `toneMapped: false` on both, or the colours bleach toward white.

Regenerate the poster after any change to the hero.

### 8. Inner pages

Open each one next to the overview. A page of plain text cards under a rich overview is not finished. Reuse the overview's own visual parts (its pill bars, its chart style, its tiles) for the page's data, and fill the first screen with content the product would really show.

### 9. Borrowed content

Search the files for names, brands and numbers copied from the reference image, and replace them with this dashboard's own fictional content.

### 10. Variants and phone

Run the check for all variants. A fix in the default variant often breaks contrast in another (a dark label on a variant's accent colour). Then read the full-length phone capture top to bottom.

### 11. Close out

1. `node scripts/build.mjs` and `node scripts/dashboards-check.mjs <id>` must print `✔`.
2. Make the side-by-side again and look at it.
3. Update the catalog entry if the form changed.
4. One commit: `Finish: <Name>`, with the list of what was fixed and what is left (and why).

## What the checks cannot see

All of these passed every gate: a hero image in a square box, a donut with every slice in the wrong place, a list spilling out of its card, a banner whose content sat underneath it, a board a third of the screen wide, a frame copied from a different dashboard, a milky 3D object. The gates catch broken pages. Only looking catches unfinished ones.
