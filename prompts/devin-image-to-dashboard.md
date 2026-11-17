# Devin / Windsurf: image to dashboard (Orbit Clay round 2, then Saffron Dusk)

Paste everything below the line.

---

You are the builder on `SacredRebel/dashboard-tools-`. The maintainer writes specs and gates; you build until the check passes **and** the dashboard looks like its reference. Passing the check is the entry ticket, not the finish: your last Orbit Clay PR passed every gate and still looked half done. The framework has been deepened to stop that. Follow it exactly.

## Read first, in this order (do not skip)

1. `docs/dashboards/00-twin-contract.md`: roles, the ten gates, the loop, the never-list.
2. `docs/dashboards/09-image-to-dashboard.md`: **the protocol you work by**: DNA sheet, shape grammar, unfolding a phone-only reference to tablet and desktop, same style on every page, three scored review rounds, element recipes.
3. `docs/dashboards/07-layout-spec.md` (keys incl. `views`, `page_style`, `shape`) and `docs/dashboards/08-object-spec.md` (3D objects, tool routing).
4. `site/dashboards/_shared/shapes.js` and open `site/dashboards/_shared/shapes-demo.html` in a browser: tab, notch, bump, wave, slant.
5. `site/dashboards/saffron-dusk/dna.md`: a worked DNA sheet. Yours must be this specific.

## Hard rules

- Never edit `layout.json`, `scripts/dashboards-check.mjs`, `catalog/dashboards.json` `signature_tech`, or any `reference.*`. Never feed a reference to an image or 3D tool.
- Never merge. Open or update the PR and stop.
- Write `dna.md` **before** touching CSS. Every element in the image gets a row.
- Build every outline the reference has (tabs, notches, bumps, slopes, organic edges) with `shapes.js` or an SVG path with `data-shape`. Rounded rectangles where the reference has shapes are a failed build.
- Desktop, tablet and phone are three layouts of one app. The phone is the reference, box by box.
- Every page (not only the overview) uses the same backdrop, nav, card material and shapes.
- **Three review rounds minimum**, each scored per box in the polish report (`### Round 1/2/3`, table `| box | what differs | fix | score |`). Fix everything below 4 before the next round. Re-scoring by the maintainer follows; inflated scores mean a full redo.
- Fictional data only (no real people, brands, emails or phone numbers).
- Pick a tool for every element from the routing table in `08-object-spec.md` and record it under "Tools used".

## Each round, do all of this

1. `node scripts/dashboards-check.mjs <id>` and read every failure.
2. Open **every** compare sheet in `docs/validation/dashboards/` (`<id>-compare.jpg`, `<id>-compare-<page>-<width>.jpg`).
3. Capture 1440×900, 820×1180, 375×812 and every inner page at 1440 and 375. Put each next to the reference at the same height.
4. Squint test (blur both ~8px): same big shapes, same light and dark masses, same empty space?
5. Detail pass per element: outline, material, colour, type, icon, spacing, ornament.
6. Score every box, write the round in the report, fix, repeat.

---

## Task A · Orbit Clay, round 2 (branch `devin/contract-orbit-clay`, PR 19)

First `git fetch origin && git merge origin/main` into your branch (the spec and gates changed). Then run the check: you will see new failures. Maintainer review of PR 19:

1. **Helmet (R9) does not read as the reference's helmet.** Yours is a sphere with a mesh cap and white rings stacked like a lamp. The reference: three-quarter side view, deep green rounded shell, thick cream rim around the face opening, gold mesh visor filling that opening, round cream ear disc on the side, gold collar ring at the base, sitting low inside the gold ring. Rebuild the silhouette from the reference first (08-object-spec §object build recipe; trace proportions by measuring, not by feeding the image anywhere), then material and light. The object gate must still pass.
2. **Terrain (R10) is flat triangles.** The reference has sculpted clay dunes: rounded crests, soft light from the top-left, darker valleys, three or four depth layers fading into the background, the spire rising from the middle ridge. Use SVG paths with `data-shape`, gradients and blurred shadow layers (or WebGL). Box `terrain` now requires `shape: organic`.
3. **Phone (R8).** The Overview at 375 must be the reference's left screen: big helmet filling the ring (yours is tiny), two tags, a **small** pager (the active dot is a slightly longer gold pill, not a big blob, `pager-dot max_w`), Start slab. The reference's right screen becomes the top of **Activity** at 375 (`views` in layout.json). The phone no longer stacks both screens on the overview.
4. **Desktop dead space (R12).** The area under the helmet, the large empty terrain sky and the right column's gaps between KPI tiles are empty. Compose them in the clay grammar (readouts, ridge lines, labels from the reference's small type rows) so the board reads as dense and designed.
5. **Inner pages (R11).** Library, Activity and Settings must use the same backdrop, rail, clay cards and type; tag every card with `data-card` (the `page_style` gate counts clay cards on every page).
6. Write `site/dashboards/orbit-clay/dna.md`, then three scored rounds in `docs/validation/dashboards/orbit-clay-polish.md` covering every box in `layout.json` including `views`.

Push to the same branch; update PR 19's description with the final check output, all compare sheets and 1440/820/375 captures. Do not merge.

## Task B · Saffron Dusk, build on what is there (new branch `devin/saffron-unfold`, new PR "Twin: Saffron Dusk (unfold)")

The owner's verdict: the phone looks different from (and worse than) the reference, desktop and tablet are badly organised, the nav is the wrong style, the cards lack the reference's organic shapes, the inner pages do not share the style, and the backdrop is missing. **Do not start from scratch.** Work on top of the current files in `site/dashboards/saffron-dusk/`; most of the content and logic stays.

Keep as is (restyle only where a step below says so): `app.js` (routes, date beads, water segments, day bars, toasts, all control wiring), the card markup and copy, the arc SVG and glowing sun, the daily bars, the dune art, the fonts and colour tokens, the Progress/Sessions/Profile page content, the night/dawn variants.

Change:
- `style.css` positions and grid per size (desktop, tablet, phone) to the new boxes.
- The rail markup becomes the bottom bar (same four links, same routes).
- Add `data-shape` attributes and the `shapes.js` import to the existing cards.
- New markup only for: the backdrop layers (tray relief, hanging stars, sky), the `journey` card, and `data-ref` names that are new (`nav`, `sky`, `stars`, `daily`, `journey`).
- Inner pages: wrap their existing content in the overview's glass cards and shapes.

1. Read `site/dashboards/saffron-dusk/layout.json` (rewritten: desktop unfold, tablet columns, phone views for Today and Profile, `page_style`, R1–R13) and `dna.md` (maintainer-written; extend it if you find more, never delete).
2. **Nav (R11):** replace the dark side rail with the reference's frosted bottom bar at every size, active item in a raised dome (`shapes.js bump`), teal-tinted active icon, icon over small tracked label. `data-ref="nav"`.
3. **Backdrop (R9):** build every layer in `dna.md` §Backdrop: gradient, the cream molded tray with relief ridges around the Today column, hanging stars on threads under the gathering card (`data-ref="stars"`), the dark dune sky (`data-ref="sky"`) behind the Evening column. On every page.
4. **Shapes (R10):** Water tab (left), Daily progress tab (right), avatar notch with break-out, Share cut tab, Upgrade slant, nav bump. All with `shapes.js`; glass rims via `data-shape-edge`; drop shadows on parents.
5. **Desktop (1440):** Today column left on the molded tray; Evening column (sky, person, daily, upgrade) to its right with the person card overlapping the sky; the new `journey` card (this week's sessions as a thread of stars) on the far right; nav docked bottom centre.
6. **Tablet (820):** the two columns side by side, journey across the bottom, bottom bar centred.
7. **Phone (375):** Today = the reference's left screen, Profile = the right screen, box by box (`views`). Compare sheets `saffron-dusk-compare-overview-375.jpg` and `-profile-375.jpg` must look like the same screens.
8. **Inner pages (R13):** Progress, Sessions and Profile at 1440 and 375 use the backdrop, nav, glass cards and shapes; no settings rows of plain boxes.
9. Three scored rounds in `docs/validation/dashboards/saffron-dusk-polish.md` (keep the earlier sections; add the rounds), every box from desktop and views scored.

Open the PR with the check output, every compare sheet and captures at 1440, 820 and 375 (overview and each inner page). Do not merge.

Do Task A first, then Task B. Report honestly what still differs from the reference in each PR.

---

## Task B · round 2 (same branch `devin/saffron-unfold`, PR 20)

`git fetch origin && git merge origin/main` first: the check gained a covered/clipped-text gate and a per-page `hero` gate, and the spec gained R14 and R15. Good progress: the structure, bottom nav, sky, stars and journey are right. The maintainer's review found these defects, and your report scored them 4 or more, so **re-score honestly** after fixing:

1. **WATER tab (all sizes):** a pale yellow rectangle shows to the right of the tab. Something behind the clipped card is not clipped (glow, wrapper or pseudo-element). Where the outline steps down, the backdrop must show through.
2. **DAILY PROGRESS tab (all sizes):** the label is cut to "LY PROGRESS", and an olive block shows left of the tab. Same cause; the whole label must sit inside the tab.
3. **Avatar covers the "8"** in SESSIONS on desktop (the check now fails this). Move the stats clear of the avatar.
4. **Diagonal stripe texture on the cream tray:** the reference has none. Replace it with a smooth cream frosted surface plus soft relief ridges hugging the cards (dna.md §Backdrop 2).
5. **Upgrade:** the text is right-aligned with an empty left half. The reference has UPGRADE / YOUR EXPERIENCE › in tracked caps on the left and the flame on the right.
6. **Tablet:** the Journey card is a large empty dark slab with tiny labels in one row. Compose it (the desktop's vertical thread, or two columns of days). The bottom bar sits outside the frame on a dark strip; put it inside the frame on the backdrop. Soften the hard olive rectangle behind the right column.
7. **Inner pages (R15):** Progress, Sessions and Profile are uniform grids of identical cream tiles, and Progress has large grey circles at the bottom. Each page opens with a hero surface (a dune-sky band with the page title, `data-hero`) and then mixes the overview's card types: teal and amber glass, tabs, notches, and the thread-of-stars list for sessions.
8. **Phone Profile:** the Daily progress tab label is clipped as on desktop.

Run three new review rounds (Round 4–6) in the report, scoring every box. Then update PR 20 with the check output and captures at 1440, 820 and 375 for every page. Do not merge.

---

## Task B · round 3 (same branch, PR 20)

`git fetch origin && git merge origin/main` (a new page-area gate). The overview is now good at all three sizes. Remaining:

1. **Desktop inner pages are blank (blocker).** At 1440, Progress, Sessions and Profile render the hero band and then an empty cream panel: each `[data-db-page]` is a 244px-tall box with `overflow:auto`, so every card is hidden inside it. Your own evidence images (`saffron-dusk-1440-progress.jpg` etc.) show this, and the report scored these pages 4+. Make each page fill the frame and scroll with it, then **open your captures and look at them** before scoring.
2. **Tablet bottom bar** still sits on a dark strip below the cream tray. Extend the tray and backdrop under it so the bar floats on the same surface as on desktop.
3. **Profile card (desktop and tablet):** a large empty area under the avatar; the stats are pushed right. Rebalance as in the reference: stats start under the name, and Share tucks into the lower-left corner.

4. **Phone 1:1 with the reference (375).** Compare `saffron-dusk-compare-overview-375.jpg` and `-profile-375.jpg` element by element and close these gaps:
   - **Title:** RAMADAN in a thin swash serif with flourishes, small "WED" before it, superscript 9; the crescent has a small star, top right.
   - **Date beads:** one continuous cream band, each bead a ring sitting in it like a chain (not separate white circles); the selected bead is dark grey with a soft warm glow.
   - **Arc card:** light taupe frosted top with IMSAK and IFTAR at the sides and the white arc rising **above** the card's top edge, sun just right of the peak. A darker taupe lower band holds 4:15AM (light, small-caps AM) and 6:08PM (bold saffron). The bell line sits in a tab hanging below the band. No near-black.
   - **Water:** bright cyan liquid glass; WATER tab cut from the card; a big glass drop lens on the left; cup icon before "6 of 8"; one thin segmented bar; "1.9 LITERS of 2.5 LITERS" right-aligned under it.
   - **Gathering:** saturated saffron orange (not pale peach), thin dark vertical bar at the left.
   - **Under the gathering card:** the molded cream path curving down, and the hanging stars **on thin threads** (dark green, pale teal, tiny dots).
   - **Nav:** light frosted band; the active item in a raised dome with a glowing icon; inactive labels light grey small caps. Not a dark pill.
   - **Profile screen:** dark brown-olive dune sky (not green smoke) with one big four-point star; "Good evening" on two lines in the light swash serif; gear outline top right. Avatar breaks out of the card's top-left on an orange rounded square; 8 and 2 in the display serif; Share is a separate light tab under the card joining the Daily progress tab. Daily progress is bright amber with the tree icon and tall thin gauges. Upgrade is translucent olive with the slanted shelf below it, then the molded diagonal slope.

Add Round 7 to the report with honest scores, update PR 20 with fresh captures of every page at 1440, 820 and 375, and do not merge.

---

## Task B · round 4 (same branch, PR 20): last fixes

`git fetch origin && git merge origin/main` (the text gate now also fails text closer than 6px to a shaped card's edge). Inner pages, tablet bar and most of the phone checklist are done. Fix these, then stop:

1. **Clipped text:** "JOURNEYS" and "olive · cedar" run into the profile card's right edge (desktop, tablet, phone Profile); "Share" sits too close to its tab edge on phone. Give the stats real inner padding.
2. **Progress page (1440):** a notch bite cuts into the "SLEEP DEBT" label; the "FASTING DAYS" label crosses its tab's edge; the card grid stops short of the hero's right edge, leaving an empty column. Align the grid to the hero width and keep every label inside its shape.
3. **Arc card lower band:** near-black at every size. The reference is a dark warm taupe; use the darkest taupe that still passes contrast (around #4f4738 → #3e382c), not black.
4. **Phone Today:** the arc does not visibly rise above the card's top edge at 375 (it does at 820); the molded path under the gathering card reads as a thin "smile" line, so make it the soft, wide cream path of the reference; the hanging stars need their thin vertical threads.
5. **Phone Profile:** the DAILY PROGRESS label sits on the tab's top edge; centre it inside the tab.

Add Round 8 with honest scores, fresh captures of every page at 1440, 820 and 375, update PR 20, do not merge.
