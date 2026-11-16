# Cursor prompt: fix a twin against its layout spec

Use one agent per dashboard. Paste once per agent and fill in the two lines at the top.

```
DASHBOARD: <mauve-ledger | ember-rooms>
BRANCH: <cursor/twin-mauve-ledger | cursor/twin-ember-rooms> (your existing pull request; keep working on it)

Your last build was reviewed and rejected: it passed the old checks but its layout does not match the reference image. The layout is now a failing check.

1. Merge main into your branch. Main has a new file site/dashboards/<DASHBOARD>/layout.json and a new gate in scripts/dashboards-check.mjs.
2. Read docs/dashboards/08-object-spec.md (the whole framework and how to build a 3D object) and docs/dashboards/07-layout-spec.md, then site/dashboards/<DASHBOARD>/layout.json, then open site/dashboards/<DASHBOARD>/reference.* and look at it next to the numbers.
3. Rebuild the overview so every box in layout.json passes:
   - data-ref="frame" on the app frame; data-ref="<name>" on the real visible element for every box.
   - Make the frame a CSS container and position and size in cqw so the numbers in the spec are your CSS values.
   - Read every "note" in the spec. Each one describes something the last build got wrong.
4. Run: node scripts/dashboards-check.mjs <DASHBOARD>
   Each layout failure prints what it measured and what it wants. Fix and re-run until the dashboard passes with zero failures. Do not stop while a layout line is failing.
5. Then take a 1440px screenshot, put it beside the reference, and fix the look: materials, colour, type weight, detail (docs/dashboards/05-style-frameworks.md and 06-verification.md). Check the phone layout at 375px.
6. Push to the same branch. In the pull request, paste the final check output and the side-by-side image.

Tools: before each element (layout, hero object, images, motion) pick its tool from the routing table in docs/dashboards/08-object-spec.md and fill the "Tools used" table of templates/polish-report.md, saved as docs/validation/dashboards/<DASHBOARD>-polish.md. A pull request without it is not reviewed.

Hard rules:
- Do not edit layout.json, scripts/dashboards-check.mjs or catalog signature_tech. If you believe a number is wrong, say which one and why in the pull request.
- Do not tag hidden, empty or wrapper elements to pass a box. The tagged element must be the thing its note describes.
- Do not copy another dashboard's frame or style. Do not copy, trace or edit the reference image.
- Do not merge.

Mauve Ledger, what the review found: there was no frame (the reference is one large frosted window on a pale backdrop with a peach sweep); the bars were thin (the reference has wide stacked hatched blocks, a y-axis and a tooltip on May); the tiles were tall and half empty and "$3,287.49" wrapped; Recent emails sat below a gap instead of directly under the chart; the success card lost its title, arrow button and tooltip; the cards read as solid white instead of frosted glass.

Ember Rooms, what the review found: the lamp was a tiny dark cone (the reference has a large pale dome shade as the centre of the screen, built in three.js); "12/7" was a giant headline (it is small and light under the lamp); the left controls overlapped the rings; the donut became a sun icon; the room buttons were scattered instead of on the left arc; the frame had no poured title tab, ran off the bottom and was too grey (the reference is near white).
```
