# Verification: how to test a dashboard and decide it is polished

**Passing the automated checks means the page is not broken. It does not mean it is finished.** This is the full procedure used before anything is published. Record the result in a report from [templates/polish-report.md](../../templates/polish-report.md).

## 1. Set up

```bash
python3 -m http.server 8080 -d site        # 3D modules need HTTP, not file://
node scripts/build.mjs                     # catalog and generated files are valid
```

Headless Chrome needs `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` when the page has WebGL.

## 2. Capture (every time, all of it)

| Capture | Size | Why |
|---|---|---|
| Overview, first screen | 1440 × 900 | what people see first |
| Overview, full length | 1440 wide, full page | bugs hide below the first screen |
| Every other page, full length | 1440 wide | inner pages are where shortcuts happen |
| Phone, full length, every page | 375 wide | overlaps and sideways scroll |
| Each colour variant, overview | 1440 × 900 | a fix in one variant breaks another |
| Side-by-side | reference crop + overview at equal width | the only real fidelity test |

`node scripts/dashboards-check.mjs <id>` writes most of these into `site/dashboards/<id>/frames/`. **Open every image.** A capture nobody looked at is not evidence.

## 3. Automated gates

`node scripts/dashboards-check.mjs <id>` must print `✔`. It loads every page, variant and width and fails on: console errors, missing files, unstyled page, sideways scroll, low contrast (measured from pixels), text under 12px, placeholder or template pages, filler rows, counters stuck at zero, a focus ring on load, thin pages, low-resolution images, and a missing required technique (`signature_tech`: WebGL, cut shapes, glass, CSS 3D).

Never edit the check or `signature_tech` to pass. If a gate does not fit a reference, say so and let the maintainer decide.

## 4. Look: the eleven questions

Answer each with yes or no in the report. One "no" means not finished.

1. **Form.** Next to the reference, is it the same *kind* of thing: same outer shape, same columns, hero in the same place? Does it resemble its own reference more than any other dashboard in the gallery?
2. **Proportion.** Do the main blocks sit where the reference's do (within a few percent)? Do headings break on the same lines?
3. **Size.** Does the board use the screen the way the reference does, or is it squeezed small?
4. **Surfaces.** Does each surface use the right [style framework](05-style-frameworks.md), with the same depth as the reference?
5. **Art.** Is every image part of its surface (no visible box, no stretch, no seam)? Is every 3D thing really 3D?
6. **Charts.** Does each chart match its numbers? Biggest value, biggest shape?
7. **Below the fold.** On the full-length captures, is anything spilling out of its card, overlapping, or empty?
8. **Inner pages.** Does each page belong to this product and use the overview's own visual parts? Could it be mistaken for another dashboard's page?
9. **Content.** Is every name, number and label this dashboard's own (nothing copied from the reference image, no placeholder text)?
10. **Phone.** Reading the full phone capture top to bottom: correct order, nothing overlapping, tab bar pinned, nothing cut off?
11. **Variants.** Does every variant still look designed and readable?

## 5. Use it

Click through as a person would, at 1440 and at 375:

- every nav item, every button, every filter, sort and search (including a search with no results);
- every form with a wrong value, then a right one;
- open and close every drawer with the mouse, then with the keyboard (Tab stays inside, Esc closes, focus returns);
- the hero's control (does the 3D object or scene react?);
- with `prefers-reduced-motion` on: nothing moves, everything is in its final place.

## 6. Decide

| Result | Meaning | Action |
|---|---|---|
| Gates ✔, eleven yes, everything works | **Polished** | commit, push, report |
| Gates ✔, a "no" that code can fix (layout, shape, depth, type, colour, chart, content) | **Not finished** | fix it, capture again, look again |
| Gates ✔, a "no" only a new asset can fix (a photo, a render, a model) | **Finished with a stated gap** | write the gap in the report and the PR; do not hide it |
| Gates ✖ | **Broken** | fix before anything else |

Do at least three look-fix-look rounds on a new build. Stop when a round finds nothing a designer would care about.

## 7. Before publishing

- [ ] `node scripts/build.mjs` ✔ and `node scripts/dashboards-check.mjs <id>` ✔
- [ ] Side-by-side image regenerated after the last change, and looked at
- [ ] Poster regenerated if the 3D hero changed (`node scripts/hero-poster.mjs <id> …`)
- [ ] Catalog entry (`summary`, `signature`, `layout`, `fx`, `materials`) describes what is there now
- [ ] Unused images, old CSS and old scripts deleted
- [ ] Report filled in, remaining gaps stated
- [ ] One commit per dashboard; a branch and a pull request unless you are the maintainer

## Defects that passed every gate (learn these)

| Defect | Where | How it was caught |
|---|---|---|
| Another dashboard's frame and header on the wrong reference | Pulsar | question 1 |
| Board a third of the screen wide | Pulsar | question 3 |
| Render in a square box on a card | Mallow | question 5 |
| Donut with every slice starting at the top | Mallow | question 6 |
| List spilling out of its card; banner content under the banner | Mallow | question 7 |
| Inner pages made of one recoloured template | 37 dashboards | question 8 |
| A name copied from the reference image | Mallow | question 9 |
| Blocks piled on each other on phone | Meridian (first pass) | question 10 |
| Layout collapsed into one narrow column | Glacier (rejected batch) | opening the capture at all |
