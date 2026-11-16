# Cursor prompt: build a twin against its spec

One agent per dashboard. Use it only for a dashboard that has `site/dashboards/<id>/layout.json`.

```
DASHBOARD: <id>
BRANCH: cursor/twin-<id> (new branch from main; open a pull request; do not merge)

You are rebuilding site/dashboards/<DASHBOARD>/ so its overview matches reference.* in that folder. The layout, the parts and any 3D object are measured by a check. Your job is to make the check pass, then match the look.

Read, in this order, and nothing else first:
1. docs/dashboards/08-object-spec.md
2. docs/dashboards/07-layout-spec.md
3. site/dashboards/<DASHBOARD>/layout.json, with reference.* open beside it. Read every "note".
4. docs/dashboards/02-reference-twin-playbook.md, the steps for the techniques this reference needs.

Build:
1. data-ref="frame" on the app frame, made a CSS container; every other box in layout.json is one real, visible element tagged data-ref="<name>", positioned and sized in cqw.
2. If a box has "object": build it in three.js exactly as 08-object-spec.md says. Silhouette first, materials second. Copy the structure of site/dashboards/ember-rooms/lamp.js; do not copy its shape.
3. Run: node scripts/dashboards-check.mjs <DASHBOARD>
   Fix and re-run until it passes with zero failures. LAYOUT_DEBUG=1 prints what an object measured.
4. Screenshot at 1440px, put it beside the reference, and fix material, colour, type and detail (docs/dashboards/05-style-frameworks.md, 06-verification.md). Check 375px.
5. In the pull request: the final check output, the side-by-side image, and any spec number you believe is wrong, with your reason.

Tools: before each element (layout, hero object, images, motion) pick its tool from the routing table in docs/dashboards/08-object-spec.md and fill the "Tools used" table of templates/polish-report.md, saved as docs/validation/dashboards/<DASHBOARD>-polish.md. A pull request without it is not reviewed.

Hard rules:
- Never edit layout.json, scripts/dashboards-check.mjs or catalog signature_tech.
- Never tag a hidden, empty or wrapper element to pass a box.
- Never copy another dashboard's frame or style. Never copy, trace or edit the reference image.
- Fictional sample data only. Do not merge.
```
