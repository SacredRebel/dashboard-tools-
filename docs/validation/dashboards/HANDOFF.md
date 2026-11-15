# Deep polish handoff (round 2)

Branch: `cursor/deep-polish-r2-0545`  
Brief: `prompts/cursor-deep-polish.md` + round-2 “double down” intent  
Base: `main` @ `d9f6fa1` (PR #6 deep polish merged)  
PR: draft — **do not merge** (see compare URL below if ManagePullRequest unavailable)

## Done this stretch (r2)

### Shared framework
- **Shell host resolver** (`dense-pages.js`): secondary pages mount inside `<main>` / `main[data-main]` so chrome stays and density gates see content; ancestor overview wrappers demoted to `data-db-stage`
- **Nav hash wiring**: `href="#"` / aria-label aliases map into `#/…` routes
- **FX layer**: `materials.css` (glass / gold-edge / clay / neo), `gsap.js` + `ambient-gsap.js`, `depth3d.js` helpers; deeper Motion/GSAP usage on cinematic boards

### Priority 1:1 gap boards
| Board | Pass |
|---|---|
| **Kumo** | Gold-edge liquid glass density on panel/cards/quote; unique hash nav; GSAP float on scene; catalog pages expanded |
| **Ember** | Soft neumorphic **12 / 7 Light** overlay on lamp sphere; stronger glass orbit; GSAP pulse |
| **Tidebath** | Continuous cylindrical floor; deeper rotateY bays; AA accent/nav/clip overflow fixes |
| **Solstice** | Thicker sun-path bloom + sun disk; taller mountain plate; GSAP drift/pulse |
| **Pulsar** | Neon terrain glass hero; denser glow/mesh; glass peak labels; GSAP drift |
| **Horizon** | Denser glass now/cards/day rail; gold-rim hover; GSAP coast drift |

### Shell consistency
- Orphan `href="#"` brand/home/settings rails remapped on Mallow, Orchard, Zest, Saffron, Folio, Glacier, Copper, Mauve, Clima, Meridian (+ Kumo)

## Check results

Touched ✔: `kumo-payroll` · `ember-rooms` · `tidebath-showroom` · `solstice-energy` · `pulsar-analytics` · `horizon-weather`  
Full-38: see latest `node scripts/dashboards-check.mjs` run on this branch (aim 38/38).

## Honest gaps (still not template-grade twins)

1. **Solstice / Pulsar** — closer cinematic heroes; still shy of pixel-perfect mountain-under-arc / neon-peak reference twins.
2. **Ember** — 12/7 Light overlay landed; climate/AC dial screen still lighter than reference multi-screen set.
3. **Tidebath** — continuous cylinder improved; photo rooms not yet a true revolving 3D cylinder mesh.
4. **Kumo** — gold-edge glass denser; sakura/koi particle field still static image (GSAP float only).
5. **Horizon** — layout density up; not a full Skyview twin of every card/quote/location strip beat.
6. **GSAP / Lottie** — ambient GSAP now on priority boards; Lottie still unused; most boards still Motion-light.
7. **CDN fonts** — many boards still load Google Fonts at runtime (zero-CDN debt for a later self-host pass).
8. **Side-by-side sheet evidence** for scores ≥4.5 still thin outside this stretch’s touched set.

## Next
- Architect review of draft r2 PR (do not merge)
- Optional: self-host OFL fonts; Lottie where references earn it; remaining gate-green boards toward G3 twins

## Compare
https://github.com/SacredRebel/dashboard-tools-/compare/main...cursor/deep-polish-r2-0545?expand=1
