# Cursor prompt: fidelity round 4 (reference twins, one dashboard at a time)

> Paste everything below the line into Cursor (Agent mode) at the repo root of `SacredRebel/dashboard-tools-`.
> Work in **batches of 6 dashboards per PR**. Do not merge; the architect (Claude) reviews each batch.

---

You are finishing the gallery dashboards. Three rounds are in (PRs #6, #7, #8). The architect compared every `reference.*` with every full-length capture after round 3. The overviews improved a lot (Kumo, Cortex, Ember, Pulsar, Solstice, Hollow, Citadel). They are still not twins of their references, and the secondary pages are not acceptable.

The goal of this round is simple to state: **put our overview next to its reference and a stranger should say "same product, same designer", and prefer ours.** Then every other page of that dashboard must look like it came from the same file.

## 0. Why the last rounds fell short (change how you work)

1. **Gallery-wide passes instead of one dashboard at a time.** "Ambient GSAP on all 38" and "hover on all 38" make everything 5% better and nothing finished. This round: **one dashboard, finished completely, then the next.** No gallery-wide commits except the framework fixes in §2.
2. **A shared page template stood in for real pages.** `_shared/dense-pages.js` renders the same screen on every dashboard: KPI row "128 / 86 / 14 / 4.2", a "<Page> pulse" card, and a "<Page> register" table with rows "alpha, bravo, cedar…". It's on 37 of 38 dashboards. It passed the density gate and it's still a placeholder. **Delete `dense-pages.js` and `dense-pages.css`** and design each page (§4).
3. **Self-scores drifted up.** Cortex and Mallow were called template-grade. Mallow's overview is one stretched, blurred image filling the board. Evidence beats scores: this round every claim comes with a side-by-side sheet.
4. **Layout was approximated, not measured.** This round you measure the reference (§3) before writing CSS.

## 1. Gates the architect added (on `main`; don't edit them)

`scripts/dashboards-check.mjs` now also fails a page on:
- **generic page kit:** any visible `.db-dense-*` element
- **filler rows:** three or more "<word> alpha/bravo/cedar/delta/echo…" strings
- **count-up stuck at 0:** a counter still at 0 after the page has been scrolled (Lull's overview does this today: "0%", "0h", "0/100")
- The check scrolls each page before the gates and the full-length capture, so on-view effects must have run.
- Earlier gates stay: placeholder stub, focus ring on load, thin page, low-res images, pixel contrast, 12px minimum.

Expect all 38 to fail at the start. Never rename classes or reword rows to dodge a gate; fix the page.

## 2. Framework fixes first (one commit)

- Remove `_shared/dense-pages.*` and every call to it. Nothing replaces it as a shared page template. Shared **primitives** are fine (table, drawer, form field, segmented control, calendar grid, skeleton, toast) in `_shared/ui/`, styled only through each dashboard's tokens and materials. Each page's layout and content is written per dashboard.
- **Count-up and reveal:** final values must be in the HTML (the effect animates from 0 on view and restores the value if anything fails). A capture or a no-JS reader never sees 0.
- **Backgrounds:** a photo or painted backdrop covers the full scroll height with no seam (Kumo still cuts to flat navy below the board).
- **`scripts/fidelity.py`:** make it produce, per dashboard, `docs/validation/dashboards/fidelity/<id>.jpg` with reference left and `frames/pages/<overview>-full.jpg` right at equal width, plus a second sheet of all secondary pages. Commit these sheets; the architect reviews from them.

## 3. Method for the overview: measure, then build

For each dashboard, before any code:

1. **Crop the reference to the UI.** Many references are presentation shots (a tablet in a hand, a tilted panel, a moodboard of loose components). Decide the target and write it down in `fidelity/<id>.md`:
   - *Screen reference* (Kumo, Horizon, Hearth, Zest, Orchard, Mauve, Clima, Meridian, Forge, Folio, Veil, Atrium, Cortex, Copper, Hollow, Mallow, Haven): rebuild that screen 1:1.
   - *Presentation shot* (Aura, Lull, Aether, Ridgeline, Orbit, Saffron, Pearlwell, Vitalis): rebuild the screen inside the shot 1:1, and keep the presentation as the hero treatment where it makes sense (Aether's tilted glass pane in an office, the phone pair for Orbit and Saffron).
   - *Component moodboard* (Pulsar, Solstice, Taffy, Prism, Pebble, Dune, Larchwood, Glacier, Citadel, Tidebath, Canopy, Ember, Plumage): compose a real screen that uses **every distinct component in the board**, at the board's scale and density, in the board's arrangement where it has one.
2. **Measure it.** With Pillow, record for the target: canvas aspect ratio, the grid (column count, gutters, outer margin as % of width), each module's box as % of the canvas, corner radii relative to module height, and the palette sampled per surface (background, card, accent, text). Write the table into `fidelity/<id>.md`. Build to these numbers at 1440. A module that is 31% wide in the reference is 31% wide in ours.
3. **Inventory every element.** List every module, chart, icon, label, badge, avatar and decoration in the reference. Each one must exist in ours, in the same place, with believable fictional content. Extra modules of ours that aren't in the reference move to secondary pages.
4. **Match the look in this order:** background and atmosphere → surface material (blur, tint, border, highlights, shadows) → hero art → charts (same chart type, same stroke weight, same fills and glows) → type (family character, size ratio between KPI numerals and labels, weight) → icons (same style and stroke) → micro-details (chips, dots, dividers, carets).
5. **Art:** every hero and prop is an original render made to the reference's subject, angle, lighting and palette (GenerateImage), cut out with transparency where the reference has a cut-out object, exported at 2× with `srcset`. Not a stock photo in a rectangle. No traced or copied reference pixels.
6. **Compare and iterate.** Run the check, run `fidelity.py`, Read the sheet, list what still differs, fix, repeat. **Minimum three compare loops per dashboard.** Stop only when you can't name a difference a designer would care about.
7. **Then make it better than the reference:** real contrast (AA), real copy with no lorem or garbled text, working states, motion, a designed 375 layout. Never "better" by adding clutter.

## 4. Secondary pages (3–4 per dashboard)

- Each page is designed for the product. Start from "what would this product's real second screen be?" and take its structure from the product's domain: Kumo's Pay runs is a pay-run table with status chips, a totals strip and an approve flow; Mallow's Library is album art, playlists and a now-playing bar; Hollow's Quest board is a quest card board with rewards; Tidebath's Catalog is product tiles with dimensions and a compare drawer.
- **Same world:** same shell, materials, type and chart style as the overview, and at least one piece of the dashboard's own art. Put a secondary page next to the overview: if it could belong to a different dashboard after a recolor, it's not done.
- **No two pages in the gallery share a layout and content.** The page name appearing in a generic sentence ("Live sample signal for the X lane") is the tell. Write real copy.
- **Believable data:** names, amounts, dates and statuses that fit the domain, consistent across pages (the person selected on the overview has the same numbers on their detail page).
- **Interactions that work:** at least three per page (filter, sort, search with an empty result, row → detail drawer with focus trap, inline edit with validation, form with useful errors, drag with a keyboard alternative, slider or toggle that updates a readout). Loading, empty and error states exist for each data module, reachable from one "View state" control on the Settings page only. Remove the "7 days / 30 days / Ready / Loading / Empty / Error" strip from every other page.
- Designed at 375, not just stacked.

## 5. Per-dashboard punch list (architect's review of round 3)

Fix these first; then run §3 to find the rest. Order = work order. Batches of 6.

**Batch 1 (most broken)**
1. **mallow-music:** the overview is one stretched, blurred illustration filling the whole board. Rebuild the reference screen: left clay sidebar with avatar, greeting hero card (clay girl with headphones at left, text and "Play something" button, plant at right), four pastel KPI tiles (songs, favorites, hours, streak) with clay icons, Listening overview pastel pill bars, Top genres donut with legend, Recently played list with cover thumbs, Daily mix photo tile, Go Premium card with crown, bottom "Discover new music" banner.
2. **lull-sleep:** counters show 0; the smart-ring card is a black rectangle; Wellness score is an empty full-width card; the layout is a single stacked column. Rebuild the reference's glass board: left column (headline, stress and sleep mini charts, AI summary with brain), center (wellness score ring, smart-ring product render, battery and sensors), right (heart-rate wave, tall body figure with "View full body report").
3. **pearlwell-dental:** half the canvas is empty mint with a ghost tooth; modules are tiny. The reference is a six-screen clay phone set: build a desktop screen that carries those modules at proper scale (hero tooth with shield, next appointment, quick actions, health score ring, treatments list with clay tooth thumbnails and prices, booking calendar with time slots, tooth chart arch, profile list), on the mint-to-peach gradient with clay props around the edges.
4. **copper-radar:** vendor tiles render as tall black bars; the main panel is a blurry photo. Rebuild: the big half-dial radar with tick ring, vendor marks placed on arcs, the copper "15%" core at the bottom center, left Data injection and Open incidents tiles, right Live feed list, then the four-column row (Sources, Assets, Alerts, Automation) and the timeline strip, inside the amber-edged frame.
5. **veil-rooms:** wrong theme. The reference is light frosted blue-grey glass over a soft photo, white device tiles with colored states (yellow light slider, red media tile, green air quality, blue door) and a right "Light" panel on glass. Ours is flat dark charcoal. Rebuild as the reference; the dark version can stay as a variant.
6. **atrium-living:** wrong atmosphere. The reference is dark teal translucent glass over a green living-room photo, with a glowing thermostat orb, TV tile with poster art, speaker render, door lock, ambient LED sliders, members avatars. Ours is white cards on grey. Rebuild as the reference.

**Batch 2**
7. **kumo-payroll:** background seam below the board; scene is cropped to the top. Board sits lower with the moon and pagoda above, blossoms top-left, waves and koi along the bottom, lotus bottom-right. KPI tiles need the four tinted glass colors and icons at reference size; sidebar item size and gold active pill to match; PTO card and the script-lettering card at the bottom.
8. **horizon-weather:** the hero lost its landscape: the sunset coast photo must fill the top band behind the title and the 22° block (ours is a black panel with a boxed title). Day cards on glass over the photo, mountain photo tile with quote, city thumbnails as round photos.
9. **solstice-energy:** the "Sites" section stretches photos into tall ellipses (bug); bottom half is sparse. Match the board: left stats column, hero arc with mountain render and grid lines, stat strip, output bars with line overlay, the row of four round gauges and photo discs.
10. **pulsar-analytics:** closer. Still needs the reference's density and depth: the 3D clock dial, the vertical pill bar cluster top-right, layered glass ridge chart with the purple pool beneath, small chart cards row, soft-3D card bevels.
11. **cortex-well:** much better. Brain sits in a square photo box: cut it out (transparent), enlarge it to hero size with the bowl, orbit ring and connector lines; left stack and right rail to reference proportions; remove the empty band at the bottom.
12. **ember-rooms:** lamp is inside a white rectangle: cut it out and hang it from the top; room chips orbit the ring; add the reference's second scene (thermostat dial with +/−, fan slider) as a page; soft neumorphic surfaces, not flat grey.

**Batch 3**
13. **tidebath-showroom:** carousel is three small photos on a grey ellipse. Build the curved room wall: 5–7 room panels on an arc with perspective, the dark floor wedge, the "6 m²" marker, hotspots; then the reference's lower sections with product cut-outs.
14. **canopy-reforest:** hero leaves are a small corner image. The reference hero is large layered leaves (green, tan, brown) overlapping the diagonal brown/green split, with an embossed four-step band and clay tiles with round icon medallions.
15. **ridgeline-trails:** the mountain render should be the centerpiece crossing the wave divider; lower dark band needs the two 3D clay pie charts and the ring gauge at reference size; device bezel.
16. **glacier-ops:** center dial needs the segmented lock ring at hero size with the mountain inside the lens; round number badges (25, 6, 140, −2) as 3D buttons; soft raised panels.
17. **citadel-wall:** add the frame chrome (angled header bar, corner brackets), the hologram cube breaking out of its box (no square photo edge), circuit leader lines, the globe scene from the lower reference as a second page.
18. **forge-fitness:** the athlete portrait must be the full-bleed hero behind the top third with "Hey, need help?" over it; cards are warm translucent glass, not black with orange outlines; the speedometer tick dial; calmer numerals (reference uses a clean grotesk, not wide display).

**Batch 4**
19. **clima-pane:** remove the huge dark sphere; add the orange and blue glass orbs behind the center pane; the dial is a raised glass knob with orange-to-blue arc; frosted white panes with soft shadows; plant behind the left card.
20. **meridian-labs:** DNA helix must be a large diagonal cut-out render across the center (ours is a small upright photo in a box); supplement tiles with product renders; doctor avatars; calendar row to reference styling.
21. **saffron-dusk:** two phone frames on a slate-green backdrop; gradient glass cards (sand, teal water, orange), dune and star art in the dark phone, serif caps heading. Ours is two flat wide cards.
22. **orbit-clay:** phones overlap at an angle on the split backdrop; helmet render larger in the porthole; right phone: sharp sand peaks with the spire line; stencil numerals.
23. **aether-pane:** present the dashboard as the tilted glass pane in a blurred office (CSS 3D), with reflections and edge light, straightening on hover or focus for use.
24. **aura-ring:** center ring render on glass (no white box), body figure as a statue render, brain in the AI card; lighter glass panels; optional tablet-in-hand hero on the landing state.

**Batch 5**
25. **hollow-vault:** witch is in a square with a hard edge: cut her out and let her overlap the wheel; wheel segments as the reference's arc slots; items row with price chips; chat rail.
26. **folio-club:** white "Club shelf · sample" and "Reading streak · sample" bars are leftover scaffolding: remove; frosted glass shell over a blurred backdrop; avatars as illustrated faces; cover art as an original illustrated cover.
27. **hearth-nest:** very close. Weather card art (cloud, sun, hills), green air-quality gradient card, climate card orange-teal gradient, device node icons over the room photo with link lines, plant and "Good vibes only" corner.
28. **larchwood-lodge:** the board's round porthole dial, knobs, sliders and the framed lake painting with arc; plum soft-3D panels on a cream backdrop (ours is dark-only).
29. **zest-health:** close. Sleep bars need the hatched inactive style and the lime + lilac active pair; three-bubble cluster sizes; rocket art in Upgrade card; rounded outer device frame on lime.
30. **orchard-sales:** close. Green sphere cluster with halftone dots spilling over the card; hatched revenue area; blurred glass "Advantages" overlay; avatars as photos.

**Batch 6**
31. **mauve-ledger:** close. Lighter, airier glass; hatched selected bar with tooltip; segmented gauge; pink-peach haze at the bottom corners.
32. **taffy-analytics**, 33. **pebble-studio**, 34. **dune-panels:** these are clay moodboards. Raise the clay: thick extruded cards, inflated pill bars, scalloped stacked-area card, round icon buttons with inner shadow, big donut render, fabric wave backdrop (Dune). Every component in the board appears.
35. **prism-workspace:** each control as thick liquid glass with tinted edge glow (blue, green, peach), the folder-shaped upgrade card, speech-bubble tooltip; bigger scale.
36. **plumage-survey:** parrot cut-out overlapping the glass panel with leaves either side of the frame; gradient area charts on top; three ring gauges.
37. **haven-listings:** search pill bar notched into the top of the rounded frame; villa photo full-bleed in the frame; glass listing card with the round action button; "10K+" card; mountain backdrop behind the frame.
38. **vitalis-care:** clay doctor at hero size, heart render, props (stethoscope, cross, pills) around the edges; phone-set modules at proper scale on the mint-to-peach gradient.

## 6. Hard rules (unchanged)

Tokens only · fictional data and brands · never copy reference pixels or edit `reference.*` · no polling; loops pause offscreen · replace, don't fork · AA contrast in every variant · body ≥ 14px, nothing under 12px · 44px targets · keyboard and visible focus · reduced motion honored · media ≤ 1.5 MB and JS ≤ 120 KB per dashboard · vendored libs with LICENSE, no CDN · credits in `media/CREDITS.md`.

## 7. Per dashboard, done means

- [ ] `fidelity/<id>.md`: target decision, measurement table, element inventory with every row ticked, and the list of differences found in each of the three compare loops
- [ ] `fidelity/<id>.jpg` and the secondary-pages sheet, regenerated after the last change
- [ ] `node scripts/build.mjs` ✔ and `node scripts/dashboards-check.mjs <id>` ✔ with gates untouched
- [ ] You Read the overview full capture, every page capture and the phone frame yourself after the last change
- [ ] POLISH-AUDIT row updated with honest per-axis scores and a one-line reason each
- [ ] One commit: `Fidelity r4: <Name>`

## 8. Batches and review

- Branch `cursor/fidelity-r4-batch<N>` from `main`, six dashboards, one PR per batch, **not merged**. The PR body has a table (dashboard, what changed, remaining gaps stated plainly) and links to the fidelity sheets.
- Stop after each batch's PR and wait for the architect's review before starting the next. Review notes from one batch apply to all later ones.
- If you run short of budget, finish the dashboard you're on, push, and say exactly where you stopped. A finished three beats a touched six.
