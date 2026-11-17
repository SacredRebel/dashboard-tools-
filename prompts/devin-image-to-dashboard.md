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

## Task B · Saffron Dusk rebuild (new branch `devin/saffron-unfold`, new PR "Twin: Saffron Dusk (unfold)")

The owner's verdict: the phone looks different from (and worse than) the reference, desktop and tablet are badly organised, the nav is the wrong style, the cards lack the reference's organic shapes, the inner pages do not share the style, and the backdrop is missing. Rebuild the layout to the new spec; keep what is good (the date beads, the arc's sun, the daily bars, the working routes and controls).

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
