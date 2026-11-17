# Devin / Windsurf prompt: Orbit Clay to the contract

Paste as one message. One agent, one dashboard.

```
Repository: https://github.com/SacredRebel/dashboard-tools-  (work on a new branch from main: devin/contract-orbit-clay)
Dashboard: site/dashboards/orbit-clay/   Live gallery: https://dashboard-tools-three.vercel.app/#/dashboards/orbit-clay

THE JOB
Rebuild Orbit Clay so it is a twin of site/dashboards/orbit-clay/reference.jpg, and give it a real desktop dashboard.
The reference shows two phone screens only (a cream clay "mission" screen with a 3D helmet in a gold ring, and a dark green "calibration" screen with clay terrain, a spire and a gold sphere on a rail). The desktop does not exist in the reference, so the maintainer designed it: site/dashboards/orbit-clay/layout.json. It joins both screens into one wide clay board. Desktop, tablet and phone must be three distinct layouts of ONE app: same tokens, type, materials, icons and pages. No phone mockups on desktop. No blown-up phone UI on desktop.

The current build fails the check in 17 places, including: no layout frame, no WebGL helmet, no backdrop, no nav rail, a shared generic page template. Replace it; do not keep the old version beside the new one.

READ FIRST, IN THIS ORDER (and nothing else until you have)
1. AGENTS.md sections 0, 5 and 6 (ground rules, definition of done, always wrong).
2. docs/dashboards/00-twin-contract.md  ← the contract. Roles, six gates, the work loop, the never-list.
3. site/dashboards/orbit-clay/layout.json  ← every box, every note, the adaptation paragraph, requirements R1 to R7. Open reference.jpg beside it.
4. docs/dashboards/07-layout-spec.md and 08-object-spec.md (the object recipe and the tool routing table).
5. docs/dashboards/05-style-frameworks.md: only the frameworks for clay / skeuomorphic surfaces, layered paper terrain and 3D objects.
6. docs/dashboards/02-reference-twin-playbook.md: the steps for frame-as-container (cqw), three.js stage, phone reset.
7. Worked examples to copy STRUCTURE from, never style: site/dashboards/ember-rooms/lamp.js (a lathe object that passes the object gate), site/dashboards/meridian-labs/helix.js, site/dashboards/_shared/three/stage.js.
Unsure how to do something? docs/onboarding/03-when-you-dont-know.md (this repo, then quickref.me, then learn-anything.xyz, then the library's docs).

TOOLS: PICK AND RECORD ONE PER ELEMENT
Every tool is in catalog/tools.json with use-when, avoid-when, how and fallback. Use the routing table in docs/dashboards/08-object-spec.md and write your choices in the "Tools used" table of the report before you build each element.
- Layout: layout.json is the layout. Do not run a screenshot-to-code tool on the reference.
- Helmet: build it in three.js (vendored at site/dashboards/_vendor/three@0.170.0, stage helper in _shared/three/stage.js). A helmet is a compound object: a lathe or squashed sphere shell, a visor opening with a gold mesh, a cream ear-cup cylinder with a gold centre, a trim band, a collar. If you have a GPU and can get hunyuan3d, wonder3d or 3dtopia running within ten minutes, you may generate a .glb from your OWN prompt or image (never the reference), optimize it under 1.5 MB, load it with stage.loadGLB and credit it. Either way it must pass the object gate.
- Terrain: layered SVG or CSS clip-path ridges with soft shadows between layers (the "layered paper" framework), or WebGL if you prefer. At least three layers, plus the spire and the gold sphere on its rail.
- Depth: pointer parallax between terrain layers (the depthflow idea).
- Images and avatars: your own image generation or procedural SVG; original, WebP at 2x, credited in media/CREDITS.md.
- Motion: Motion and GSAP are vendored. Springs for presses, 100 to 300ms, transform and opacity only, reduced motion honoured.
- Component behaviour: the rulebook (docs/design/02-rulebook.md); material-ui only as a behaviour reference.
- If your model cannot see images, use agent-vision-toolkit from the catalog to describe the reference and your own screenshots.

THE LOOP (do not start a step while the one before it fails)
1. Run: node scripts/dashboards-check.mjs orbit-clay   and read every failure. Copy templates/polish-report.md to docs/validation/dashboards/orbit-clay-polish.md.
2. Structure: data-ref="frame" on the board, made a CSS container; data-ref="backdrop"; every box in layout.json is one real, visible element tagged data-ref="<name>", positioned and sized in cqw. Run the check until every "layout" line is gone.
3. Helmet: silhouette first, then framing, then material. LAYOUT_DEBUG=1 node scripts/dashboards-check.mjs orbit-clay prints what the object gate measured. Expose window.DBHero (poster, recolor), dispatch db-hero-ready, save the fallback with node scripts/hero-poster.mjs orbit-clay.
4. Clay material on every surface: thick soft edges, a dark drop shadow plus a light highlight, matte fills, pressed-in states for active controls. Nothing flat.
5. Pages and controls: the rail's four items each open their own real page (Overview, Library, Activity, Settings) in the same clay language, each with its own data and at least one working interaction. Every button, toggle, pager dot, tag and stepper changes something visible. Dragging the helmet turns it. Dragging the gold sphere changes a readout.
6. Compare sheet: the check writes docs/validation/dashboards/orbit-clay-compare.jpg with each box of the reference beside your build. Open it. For every box name what still differs using the table in section 6 of the contract (fill, radius, shadow, type, icon, proportion) and fix it. At least three rounds; record each round in the report.
7. Tablet (820px): its own reflow, not the desktop squeezed and not the phone enlarged. Phone (375px): Overview reads as the reference's left screen followed by its right screen; bottom bar fully visible; 44px targets; no horizontal scroll.
8. Three variants keep working (the catalog lists them); the helmet and terrain recolor from CSS variables.
9. Final pass down R1 to R7 at 1440, 820 and 375. Fill the requirements table. Run node scripts/build.mjs and node scripts/dashboards-check.mjs orbit-clay one last time: zero failures.
10. Push, open a pull request titled "Twin: Orbit Clay (contract)" with: the final check output, the compare sheet, screenshots at 1440, 820 and 375, the report, and a plain list of what is still not like the reference. Then stop.

HARD RULES
- Do not merge. Only the maintainer merges.
- Do not edit layout.json, scripts/dashboards-check.mjs or catalog signature_tech. If a number or note looks wrong, say which and why in the pull request and keep building to the spec.
- Do not tag a hidden, empty or wrapper element to pass a box. Do not make a button that only flips an invisible attribute.
- Do not copy another dashboard's frame, nav labels, pages or style. Do not use the shared .db-dense-* page kit.
- Do not copy, trace or edit the reference image, and do not give it to any outside tool.
- Tokens only (style.css :root), fictional sample data, real words (the reference's text is garbled), no polling, no CDN (vendor any library with its license).
- Do not say something works unless you clicked it and have the check output from this push.
```
