# Pulsar Analytics · reference twin fidelity log

## Step 1 · Measure the reference

Reference: `site/dashboards/pulsar-analytics/reference.jpg` (736×736).

UI rectangle (charcoal board inside purple glow): **x0,y0,x1,y1 = 28, 36, 708, 700** → **W = 680, H = 664** (aspect ≈ 1.024).

Vertical units use **cqw = px ÷ W × 100**.

| Block | left % of W | top (cqw) | width % of W | height (cqw) | corner (cqw) | made of | outline |
|---|---|---|---|---|---|---|---|
| Board / frame | 0 | 0 | 100 | 97.6 | 6.5 | soft-3D charcoal + purple under-glow | rounded rect |
| Left status strip | 2.9 | 2.9 | 22.4 | 9.4 | 2.4 | glass-dark | rounded / scooped |
| 3D clock dial | 2.9 | 15.3 | 23.8 | 29.4 | 50% circle | recessed dial, purple ticks, cyan needle | circle / scooped well |
| Ring gauge "88" | 2.9 | 47.6 | 23.8 | 23.5 | 3.2 | glass card + multi-hue ring | rounded / scooped |
| Hour bars | 2.9 | 74.1 | 23.8 | 20.6 | 2.8 | teal/violet mini bars | rounded |
| Top strip / tools | 29.7 | 2.9 | 39.7 | 7.9 | 2.4 | glass pills + icons | rounded |
| Glossy orb buttons | 29.7 | 12.4 | 39.7 | 11.8 | 50% | round glossy glass spheres | circle |
| Hero terrain | 29.7 | 25.6 | 39.7 | 45.6 | 3.6 | **WebGL** translucent ridges + constellation + purple pool | rounded well |
| Spark chart cards | 29.7 | 74.1 | 39.7 | 20.6 | 2.4 | three glass mini charts | rounded |
| Tall pill bars | 72.4 | 2.9 | 24.7 | 30.0 | 2.8 | peach→violet→teal gradient pills | tall pills |
| Wave / area card | 72.4 | 35.9 | 24.7 | 26.5 | 2.8 | peach–violet area chart | rounded |
| Right bar cluster | 72.4 | 65.3 | 24.7 | 29.4 | 2.8 | teal/violet vertical bars | rounded |

### Inventory (every text / icon / chart)

- Left status: live chip, small metric glyphs
- Clock: tick ring, hour hand, minute hand, center hub, "uptime" label
- Gauge: ring segments teal/yellow/peach, center **88**, legend chips
- Hours: title + ~12 short glowing bars
- Top strip: brand "Pulsar", range pills (24h/7d/30d), search, bell
- Orbs: 4 round metric buttons (users, sessions, errors, latency) with icons
- Terrain: layered ridges teal→violet→peach, constellation nodes/lines, floating labels, purple floor glow
- Sparks: 3 cards — Active, Sessions, Errors sparklines
- Pills: channel pillars selectable
- Wave: Top events area chart
- Right bars: region throughput bars

### Sampled colors (Pillow)

| Role | RGB | Hex |
|---|---|---|
| Backdrop / purple glow | (15, 19, 28) → (28, 16, 40) | `#0f131c` / `#1c1028` |
| Main surface (charcoal) | (85, 68, 86) | `#554456` ≈ board `#2a2734` mid |
| Accent violet | (191, 0, 255) from catalog | `#bf00ff` |
| Text | (241, 239, 247) | `#f1eff7` |
| Hero mint / violet / peach | mint `#00ffcc`, violet `#bf00ff`, peach `#ffcc33` |

### Tools note

- Screenshot-to-code: **not run** (default route — measure by hand).
- Image-to-3D: **not run** — procedural three.js terrain via `_shared/three/stage.js`.

---

## Step log (screenshot → open → note)

_(filled after each playbook step that changes the page)_

## Step 2–10 · First build screenshots (opened)

### Step overview @1440 (`/tmp/pulsar-shots/step-overview-1440.png`)
**See:** Soft charcoal rounded board on purple glow; poured top band with brand/search/range; left rail; clock dial with purple ticks; ring 88; hour bars; 4 glossy orbs; WebGL terrain with constellation labels; 3 spark cards; right pill bars, wave, region bars.
**Wrong:** Terrain ridges a bit soft/low-contrast vs reference; orbs less magenta-glossy; pill teal fills may read short; board still a bit “card grid” vs one molded surface; empty gutters between columns slightly large.

### Step overview @375 (`/tmp/pulsar-shots/step-overview-375.png`)
**See:** Tall frame, bottom tab rail, poured header, live/uptime/dial/health visible; orbs row; purple under-glow.
**Wrong:** Hero terrain not obvious in first viewport (below fold); hours bars easy to confuse with channel pills; search wraps under band crowding.


## Step 11 · Compare rounds (opened `pulsar-analytics-compare.jpg`)

### Round 1
**Diffs:** Twin organizes into three clean columns vs denser collage; terrain more opaque than ref’s layered silk; clock well less deep/metallic; pill teal fills shorter than ref; header band is product chrome not in moodboard; constellation thinner than ref.
**Fixes applied:** higher transmission + stronger ridge lines; deeper clock well shadow; orb scrims + ≥12px type (check ✔).

### Round 2 (after polish + check frames)
**Opened:** `frames/pages/overview.jpg`, `frames/phone.jpg`, compare sheet.
**Diffs remaining:** Reference still denser with more micro-chrome chips around the terrain; twin pill tops less peach-glow; terrain peaks could be sharper; phone stacks left column before hero (hero now visible mid-scroll).
**Fixes:** transmission 0.72 / opacity 0.82; additive edge opacity ↑; clock well radial recess.

### Round 3
**Opened:** compare + overlay + phone.
**Remaining (designer-care, stated):** moodboard density of tiny glass widgets not fully mirrored; dial is SVG soft-3D not a WebGL torus (terrain is the gated WebGL hero); channel pill peach tips slightly muted vs ref.
**Why stop:** check ✔; structure/materials/WebGL hero match playbook; leftover diffs are polish density not layout failures.

### Incomplete / tool notes
- Screenshot-to-code: not run (default measure route).
- Image-to-3D: not run — procedural three.js terrain via `_shared/three/stage.js`.
