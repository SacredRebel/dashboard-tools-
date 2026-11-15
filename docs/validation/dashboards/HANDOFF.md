# Deep polish handoff (round 3)

Branch: `cursor/deep-polish-r3-0545`  
Brief: `prompts/cursor-deep-polish.md` + round-3 “polish all” intent  
Base: `main` @ `cb13353` (PR #7 deep polish r2 merged)  
PR: draft — **do not merge** (see compare URL below if ManagePullRequest unavailable)

## Done this stretch (r3)

### Shared framework
- **Zero runtime Google Fonts CDN** — 26 OFL families self-hosted as WOFF2 under `site/dashboards/_vendor/fonts/<slug>/` with `family.css` + LICENSE; all 38 `index.html` files rewired
- **FX materials**: `mat-holo` / `mat-holo-frame` recipes for dark HUD boards
- **Ambient GSAP**: `spin` / `glow` / `sway` kinds; ambient-gsap wired on all 38 boards with hero `data-gsap` hooks

### Priority ≤3 / gap boards (deepened)
| Board | Pass |
|---|---|
| **Citadel** | Holo glass panels + gold-corner frames; GSAP spin rings + float cube; denser glow/bars |
| **Glacier** | Holo glass plates; topo pulse; orb/gauge hover depth |
| **Forge** | Dense glass cards; athlete upscale 2400px; sleep `noAxis` Y-label AA; gauge chip |
| **Clima** | Glass cards; orb pulse/parallax; opaque brand + Outside plates (AA) |
| **Hollow** | Dense glass wheel/cards; witch/chest glow; open CTA lift |
| **Pearlwell / Vitalis / Orbit / Taffy / Pebble / Dune / Ridgeline / Aura / Haven** | Clay/glass materials + hero drop-shadows + hover craft |

### Gallery-wide
- Hover lift craft on cards/panels/tiles (motion-safe)
- Tidebath orphan `href="#"` → buttons
- Ambient GSAP script on every board (was 6; now 38)

## Check results

Priority ✔: `citadel-wall` · `glacier-ops` · `forge-fitness` · `clima-pane` · `hollow-vault`  
**Full-38 confirmation: 38/38 ✔** (`node scripts/dashboards-check.mjs`, exit 0).

## Honest gaps (still not template-grade twins)

1. **Solstice / Pulsar / Horizon / Ember / Tidebath / Kumo** — r2 cinematic gains held; still shy of pixel-perfect reference twins (sakura particles, true 3D cylinder mesh, Skyview card-for-card).
2. **Citadel / Glacier** — holo density up; not yet full smart-city / topo-dial reference twins.
3. **Forge** — glass + athlete stronger; right-rail speedometer/icon row still lighter than reference.
4. **Clima** — dial/orbs denser; multi-screen climate set still lighter than reference.
5. **Clay family** (Pearlwell, Vitalis, Orbit, Taffy, Pebble, Dune) — materials/hover up; signature props not re-rendered this round.
6. **Lottie** — still unused; Motion/GSAP ambient now gallery-wide but Lottie idle.
7. **Side-by-side fidelity sheets** for scores ≥4.5 still thin outside priority boards.
8. **Secondary pages** — dense-kit remains the shell for many gate-green boards (not bespoke art direction per route).

## Next
- Architect review of draft r3 PR (do not merge)
- Optional: Lottie where references earn it; bespoke secondary pages; GenerateImage prop refresh for clay/holo heroes; fidelity sheets for ≥4.5 claims

## Compare
https://github.com/SacredRebel/dashboard-tools-/compare/main...cursor/deep-polish-r3-0545?expand=1
