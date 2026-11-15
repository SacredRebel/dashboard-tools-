# Cursor prompt: fidelity round 4 (1:1 reference twins, real 3D, real shapes, real glass)

> Paste everything below the line into Cursor (Agent mode) at the repo root of `SacredRebel/dashboard-tools-`.
> Attach your 3D tools (text-to-3D, image-to-3D), image generation and screenshot-to-code tools to the same chat.
> Work in the **six batches listed in §6, one PR per batch**. Do not merge; the architect (Claude) reviews each batch.

---

You are rebuilding the 38 gallery dashboards so each one is a **1:1 twin of its `reference.*` image, then better**. Three rounds are merged (PRs #6, #7, #8). The owner compared them in the gallery's Compare view and is not satisfied, and the architect agrees. Read this whole file before you touch code.

## 0. The verdict on rounds 1–3, plainly

1. **Rounded rectangles everywhere.** The references have cut, notched, organic and chamfered outlines. Haven's frame has a white header that dips into the photo with concave shoulders and separate Buy and Rent pills sitting in the notches; its cards have scooped corners holding round buttons. Ours is a rectangle with a small white tab. Every dashboard got the same box treatment.
2. **3D objects became photos in boxes.** Citadel's hologram cube is a square JPEG with visible edges. Glacier's lens with a mountain inside is a flat picture. Meridian's DNA, Cortex's brain, Ember's lamp, Aura's ring: all rectangles with a picture. The references show objects that float, overlap panels and catch light.
3. **Glass is a flat tint.** Mauve's reference is airy, layered frosted glass with soft white edges and a haze behind; ours is opaque lilac cards. Saffron's reference is two liquid-glass phones with gradient glass cards and dune art; ours is two flat wide panels.
4. **Wrong interface.** Saffron (phones became a desktop strip), Veil (light frosted became dark flat), Atrium (dark glass over a room became white cards), Glacier (the dial is the hero at 45% of the canvas; ours is small and off-center), Mallow (one stretched image).
5. **One recolored template as "pages".** `_shared/dense-pages.js` is on 37 dashboards.
6. **Gallery-wide passes.** "Ambient on all 38" finished nothing.

**The tools you were given went unused.** `FIDELITY-TOOLS.md` says screenshot-to-code pipelines were skipped. No 3D library is vendored. This round, using them is part of the definition of done (§2).

**What changes:** one dashboard at a time, built from a measured blueprint, with real WebGL objects, real SVG-cut shapes and real layered glass, each verified by gates and by your own eyes against the reference, at least three loops.

## 1. Gates (on `main`; never edit, never dodge)

`scripts/dashboards-check.mjs` fails a dashboard on all of the following.

- **Technique gates** (overview, 1440, default variant) from `signature_tech` in `catalog/dashboards.json`:
  - `webgl`: a visible WebGL canvas ≥ 220px. A photo of a 3D object does not count.
  - `shape`: an element ≥ 300px with a `clip-path` or mask (or an SVG `path[data-shape]` / `clipPath`). Border-radius does not count.
  - `glass`: at least 3 surfaces ≥ 160px with `backdrop-filter`, over a real backdrop.
  - `tilt3d`: an element ≥ 300px with CSS perspective or a 3D transform.
- **Page gates:** generic `.db-dense-*` kit visible, filler rows ("alpha, bravo, cedar"), count-ups stuck at 0, placeholder stub, focus ring on load, thin page, low-res images, pixel contrast, 12px minimum.

The architect set `signature_tech` per dashboard (listed in §6). All 38 fail today. The gates are a floor: passing them with a token canvas or a decorative clip-path is a failed review. The architect compares pixels.

## 2. Tooling you must set up and use (first commit of the round)

### 2A. Vendor (pinned folder + LICENSE, no CDN)

- `site/dashboards/_vendor/three@<ver>/`: `three.module.min.js` plus the addons you use (`GLTFLoader`, `DRACOLoader` or `MeshoptDecoder`, `RoomEnvironment`, `OrbitControls` only where the user rotates). MIT.
- Keep `motion`, `gsap`, `dotlottie-web`.

### 2B. Shared 3D runtime: `site/dashboards/_shared/three/stage.js`

One small module every 3D dashboard uses:

```js
// createStage(canvas, { fov, dpr: Math.min(devicePixelRatio, 2), alpha: true })
//   -> { scene, camera, renderer, onFrame(fn), loadGLB(url), envRoom(), dispose() }
```

Required behavior:
- transparent background (`alpha: true`, `setClearAlpha(0)`) so the object floats over the page, never in a box
- `ResizeObserver` sizing, DPR capped at 2
- render loop runs **only while visible** (`DB.onVisible`) and the tab is active
- `prefers-reduced-motion`: render one frame, no loop
- no WebGL or context lost: show the 2× poster PNG (transparent) in the same box
- pointer parallax ≤ 8°, eased; idle slow spin or bob (8–20 s)
- physically based look: `MeshPhysicalMaterial` (transmission, thickness, ior, clearcoat, iridescence where the reference shows it), `RoomEnvironment` PMREM lighting, a key light matching the reference's light direction, soft contact shadow (a blurred radial gradient plane is fine)
- `renderer.outputColorSpace = SRGBColorSpace`, `ACESFilmicToneMapping`

### 2C. Where 3D models come from (in this order)

1. **Procedural three.js geometry** when the object is geometric. It's the sharpest and lightest option. Recipes:
   - *Hologram cube (Citadel):* nested `BoxGeometry` shells, transmission 1, thickness 0.6, ior 1.4, emissive inner lattice of small cubes, additive `EdgesGeometry` lines, a ring pedestal of `TorusGeometry` + `RingGeometry` with emissive cyan, a faint vertical light cone (additive cone mesh), slow counter-rotating shells.
   - *Glass orbs and dial knob (Clima):* `SphereGeometry` with transmission, attenuation color orange and blue, iridescence 0.3.
   - *Ring (Aura, Lull):* `TorusGeometry` scaled flat, metalness 1, roughness 0.18, clearcoat 1, inner band darker.
   - *DNA helix (Meridian):* two `TubeGeometry` strands along helix curves plus cylinder rungs with sphere joints, brushed-metal material, laid diagonally.
   - *Terrain (Pulsar, Solstice, Glacier):* `PlaneGeometry` 200×200 displaced by layered noise, vertex-colored by height with the reference palette. Pulsar adds additive glowing ridge lines. Glacier sits inside a glass hemisphere lens (transmissive half-sphere, dark rim, snow-white peaks to deep blue base).
   - *Pendant lamp (Ember):* `LatheGeometry` shade in brushed aluminum, thin cylinder cord from the top edge, emissive disc under the shade, soft light pool.
   - *Clay forms (Taffy, Pebble, Ridgeline pies, Orchard spheres):* spheres, capsules, tori, `ExtrudeGeometry` pie wedges with bevel; matte clay material (roughness 0.85, sheen 0.4, soft pastel), big soft shadows.
2. **Image-to-3D / text-to-3D** (the tools attached to this chat: Meshy, Tripo, TRELLIS, Hunyuan3D or similar) for organic objects: brain in a bowl (Cortex), helmet (Orbit), tooth (Pearlwell), heart (Vitalis), witch and relics (Hollow, optional), statue figure (Aura, Lull). Process:
   - Generate a clean **original** concept image first (GenerateImage: single object, neutral background, 3/4 view, the reference's material and palette). Never feed the reference image itself to a 3D tool.
   - Image-to-3D → export **GLB** → optimize (`gltf-transform optimize --compress meshopt --texture-compress webp`, textures ≤ 1024px, **≤ 1.5 MB**) → `media/models/<name>.glb`.
   - Load with `loadGLB`, override materials where the tool's texture looks muddy (clay or glass materials from §2B usually look better than baked textures).
   - Record tool, prompt, date and license in `media/CREDITS.md`.
3. **If a 3D tool is not reachable from your environment, say so in the PR** and build the best procedural version. Do not fall back to a photo in a rectangle. Painted scenery (Kumo's moon scene, Horizon's coast) stays 2D, cut into transparent layers for parallax.

### 2D. Screenshot-to-code: use it for structure, then hand-finish

For every dashboard, run the cropped reference through the screenshot-to-code tool you have (screenshot-to-code, ScreenCoder, design2code or draw-ui, see `catalog/tools.json`). Use the output only for **layout structure and proportions** (what sits where, how big). Never ship its markup or its colors as is. If none can run, state that once in the PR and do §4 step 2 by measurement. Either way the measured blueprint in §4 is mandatory.

### 2E. Shape kit: `site/dashboards/_shared/shape/` (+ `docs/design/14-shape-language.md`)

Organic outlines are SVG paths, not border-radius. Build and document these primitives, each a function returning a path for a given box so it stays crisp at any size:

- **`notchFrame(w, h, r, notches[])`**: a rounded frame with concave notches cut from an edge. Each notch has `{edge, from, to, depth, r}`; the shoulders are **concave** arcs (the outline curves outward into the notch), which is what makes Haven's header look poured. Apply as `clip-path: path(...)` (recomputed on resize with `ResizeObserver`) or as an inline SVG `<clipPath clipPathUnits="objectBoundingBox">`.
- **`scoop(corner, r)`**: a card with one corner scooped out as a concave quarter circle so a round button nests in it with an even gap (Haven's listing card arrow, Folio and Orchard arrow chips).
- **`tabCard(...)`**: a card with a raised label tab that flows into the body with concave fillets (Dune's titled panels, Prism's folder card, Glacier's header tabs).
- **`chamfer(w, h, c, corners)`**: HUD panels with cut corners, plus a matching SVG stroke for the 1px glowing outline and corner brackets (Citadel, Glacier, Aether).
- **`wave(w, h, amp, seed)`** and **`blob(seed)`**: organic dividers and soft masses (Ridgeline's dark wave, Saffron's dune cut, Pebble and Taffy shapes, Canopy's diagonal split).
- **`arcSlot(cx, cy, r0, r1, a0, a1, gap)`**: ring segments with rounded ends (Hollow's wheel, Glacier's lock ring, Copper's radar bands, Solstice's arc).

Rules:
- Shadows on clipped elements use `filter: drop-shadow()` on a wrapper (box-shadow is clipped).
- Borders on shapes are an SVG stroke of the same path, not CSS border.
- Glass inside a shape: `backdrop-filter` on the clipped element itself.
- Focus rings follow the shape (SVG stroke) or sit on the inner control.

### 2F. Liquid glass kit: extend `_shared/fx/materials.css` (+ update `docs/design/10-materials.md`)

A glass pane is five layers, not one tint:

1. **Backdrop:** `backdrop-filter: blur(18–28px) saturate(140–180%) brightness(1.05)`.
2. **Refraction (liquid glass only):** an SVG `feTurbulence` + `feDisplacementMap` filter applied through `backdrop-filter: url(#liquid)` where supported, with the plain blur as the fallback (`@supports`).
3. **Tint:** a 6–18% fill with a top-to-bottom gradient.
4. **Edge light:** 1px inner highlight (inset box-shadow, white 35–60%) on top and left, a darker 1px inner line bottom and right, and a 1px outer stroke at 10–20%.
5. **Specular:** a soft diagonal highlight sweep (pseudo-element, `mix-blend-mode: soft-light` or `screen`), moving a few px with pointer position.

Plus a wide soft shadow and a small contact shadow. Variants: `mat-glass-frost` (Mauve, Veil, Haven), `mat-glass-liquid` (Prism, Saffron, Clima), `mat-glass-dark` (Atrium, Hearth, Forge, Kumo), `mat-glass-holo` (Aether, Citadel: cyan edge glow, scanline overlay at 3%). Glass needs something behind it: a photo, a gradient haze or 3D. Text on glass gets a scrim or a denser tint until it passes AA.

### 2G. Motion (Framer-Motion-grade, vanilla)

Motion (vendored) is the same engine as Framer Motion; use its `animate`, `spring`, `scroll`, `inView`, `stagger`. Per dashboard, at minimum:

- **Entrance choreography:** backdrop fades, frame scales from 0.98, modules stagger 40ms, hero object settles last with a spring (stiffness ~120, damping ~18).
- **Shared-element route transitions** between pages (View Transitions API, fallback cross-fade); the active nav pill slides, it doesn't jump.
- **Hover depth:** glass panes lift 2–4px and their specular shifts; clay presses down; HUD panels brighten their outline.
- **Charts draw in** and re-animate on filter change (bars spring, lines draw, arcs sweep). Numbers roll.
- **Hero object reacts:** pointer parallax, and a state change tied to a control (Citadel cube pulses on "scan", Clima dial arc and orb color follow the temperature, Ember lamp brightness follows the intensity slider, Glacier ring rotates to the selected sector, Aura ring spins on device sync).
- **Ambient:** slow drifting haze, particles or light sweep suited to the theme, paused offscreen.
- Reduced motion: everything lands in its final state.

React Bits, Magic UI and Aceternity are sources of **ideas**; this gallery is zero-build vanilla, so reimplement the effect in our FX library in your own code. Don't add React.

## 3. Work order per dashboard (no shortcuts)

Start from a **clean slate for the overview markup** when the current structure doesn't match the reference (it doesn't for most). Rewriting is expected. Patching round 3 is how we got here.

1. **Target.** Crop the reference to the UI. If it's a presentation shot or a moodboard, write down the target screen (§6 tells you for each).
2. **Blueprint.** Run screenshot-to-code on the crop for structure. Then measure with Pillow and write `docs/validation/dashboards/fidelity/<id>.md`:
   - canvas aspect ratio; outer margins; grid columns and gutters
   - every module's box as % of the canvas (x, y, w, h)
   - corner radii relative to module height
   - sampled colors per surface (backdrop, pane, accent, text)
   - every outline that is **not** a rounded rectangle, with the primitive from §2E you'll use
   - every 3D object, with its source from §2C
   - an element inventory: every icon, label, chip, avatar, chart, decoration
3. **Backdrop and atmosphere** first (photo, painted layers, haze, grid floor).
4. **Shapes:** build the frame and cards with the shape kit to the measured boxes.
5. **Materials:** apply the glass, clay or HUD recipe.
6. **3D:** build the object, light it to match the reference, export a transparent 2× poster for the fallback.
7. **Content:** every inventory element, in place, with believable fictional copy (no real brands, no garbled text).
8. **Charts:** same chart types, stroke weights, fills, glows and gradients as the reference.
9. **Type:** family character, numeral style, size ratios.
10. **Motion** (§2G).
11. **Compare loop, at least 3 times:** run the check, build the side-by-side sheet (`scripts/fidelity.py`), **Read it**, and write the differences you still see into the fidelity doc. Fix. Repeat. In loop 3, overlay ours at 50% opacity on the reference crop and check that module edges line up within ~1.5% of the canvas width.
12. **Secondary pages** (§5), **375 and 768 layouts**, variants.
13. Run the check for the dashboard. Commit: `Fidelity r4: <Name>`.

**Stop rule:** a dashboard is not done while you can still name a visible difference a designer would care about. If something is out of reach, say exactly what and why in the PR. Never mark it done silently.

## 4. Secondary pages (3–4 per dashboard)

- First commit of the round: delete `_shared/dense-pages.js` and `.css` and every call. Shared **primitives** only (`_shared/ui/`: table, drawer, field, segmented control, calendar grid, skeleton, toast), styled through each dashboard's tokens.
- Each page is designed for that product and built with the same shapes, materials, 3D object (smaller or from another angle) and chart style as its overview.
- Believable domain data, consistent across pages. Real copy.
- At least 3 working interactions per page. Loading, empty and error states exist for each data module and are reachable from one "View state" control on Settings only. Remove the "7 days / 30 days / Ready / Loading / Empty / Error" strip everywhere else.
- If a secondary page could belong to another dashboard after a recolor, it's not done.

## 5. Hard rules (unchanged)

- **Design tokens only.**
- **Fictional data and brands.**
- **References:** never copy or trace reference pixels, never feed a reference to a 3D or image tool, never edit `reference.*`.
- **No polling.** Loops pause offscreen.
- **Replace, don't fork.**
- **Contrast:** AA in every variant.
- **Text:** body ≥ 14px, nothing under 12px.
- **Tap targets:** 44px.
- **Keyboard** access and visible focus.
- **Reduced motion** honored.
- **Budgets per dashboard:** images ≤ 1.5 MB, models ≤ 1.5 MB, own JS ≤ 150 KB (vendored libs excluded, loaded only where used).
- **Performance:** steady frame rate at 4× CPU throttle with the 3D visible (lower DPR or pause when it drops).
- **Vendored libs** with LICENSE, no CDN.
- **Credits** in `media/CREDITS.md`.

## 6. Exact spec per dashboard

Positions are % of the UI canvas at 1440 unless noted. "Tech" is what the gate checks. Build every item; then find the rest with §3.

### Batch 1: the five the owner flagged

**7. haven-listings** · tech: shape, glass
- *Backdrop:* pale grey alpine photo (misty rock face), full page, behind a floating device-like frame. Small caps labels top-left and top-right, pill button bottom-right.
- *Frame:* one large rounded frame (~6% radius) holding a full-bleed dusk villa photo: a curved white futuristic house with warm interior light, blue-pink sky, snow-dusted desert. **The top edge is a notch frame:** a white header band occupies the center ~46% of the width, dips ~9% of the frame height into the photo with concave shoulders on both sides, and holds three filter controls (Location, Property type, Max price; label above value, chevron). Left and right of it, in the notches, sit two separate white pills ("Buy" with an arrow chip on the left, "Rent" with an arrow chip on the right), each with its own concave fillet into the frame edge. Use `notchFrame`.
- *Left rail:* a vertical white pill (home active as a filled circle, search, grid, message), then a round agent avatar, a bell, and a second pill (settings, night, day). The rail overlaps the photo with the same poured white.
- *Hero type:* large translucent white display text, two lines, centered-left over the sky at ~55% opacity, with a short paragraph under it.
- *Bottom-left card:* white, with a large concave top-right corner flowing into the frame ("Find the perfect place", paragraph, "10K+" with three overlapping round photo thumbnails and an arrow chip).
- *Bottom-right card:* frosted glass listing card (`mat-glass-frost`) with a **scooped top-right corner** holding a round white arrow button; title, address with pin, description, spec row (area, yard, bedrooms, baths), and a row of three round glass action buttons (like, save, share). A large round indigo brand button overlaps the card's bottom-left edge.
- *Remove from the overview:* the Matching homes, Price history, Your viewings and Agent notes row. Move them to the Listings and Showings pages.
- *Motion:* frame scales in, header pours down (clip-path animates the notch depth 0 → full), hero text fades up, the glass card slides in; selecting a filter cross-fades the villa photo; pointer parallax on the photo ≤ 10px.

**21. glacier-ops** · tech: webgl, shape
- *Canvas:* a deep slate-blue raised board (soft-3D: lighter top-left edge, darker bottom-right, large shadow) on a darker blue page. Everything is matte soft-3D, not neon outlines.
- *Header:* four trapezoid tabs centered at the top edge (`tabCard`), first active in bright cyan.
- *Hero (center, ~45% of the width, ~50% of the height):* a large dial. Outer ring of 12 `arcSlot` segments in alternating blues with small lock icons and rotated labels; inside it a dark glossy **glass lens** (WebGL hemisphere) containing a snow-capped mountain terrain rising from black water, with small red and white tick marks along the lower inner rim. The ring rotates to the selected sector.
- *Top row above the dial:* four round 3D gauge buttons (25, 6, 140, −2 in red) with captions, raised with inner bevel.
- *Top-right:* a dark viewfinder panel with red corner brackets and a red crosshair.
- *Left column:* five raised panels: pie + legend, toggle + outline card, gradient bar chart, horizontal lines list, taller gradient bars, cyan area chart.
- *Right column:* small bars, oscillator wave, multi-line chart with red markers, text columns with a cyan area chart.
- *Bottom center:* a wide layered cyan area chart with axis ticks; bottom-right two round 3D gauges ("67", "67").
- *Charts:* cyan-to-deep-blue vertical gradients, soft glow, no hard outlines.

**23. citadel-wall** · tech: webgl, shape
- *Backdrop:* near-black navy with a faint blue perspective grid floor and light streaks.
- *Frame:* a HUD screen frame with a thick glowing blue-violet rounded outline and an angled title plate cut into the top center (`chamfer` + `tabCard`), light-bar accents left and right of the title.
- *Hero (center, ~38% wide):* the **hologram cube** (§2C recipe) floating over a ring pedestal with a light cone, **no box, no photo edge**, overlapping its neighbors' glow. Four round holo badges orbit it with leader lines.
- *Left column:* a holographic bust-on-pedestal icon tile with two amber numbers; a dense cyan bar chart with a line overlay; a ranked table with glowing row markers.
- *Top center:* two pill tags with cube icons. *Top right:* a 2×2 grid of stat tiles, each with a small isometric cube icon.
- *Right:* three ring gauges (amber, cyan, violet) with legends; a grouped bar + line chart.
- *Bottom strip:* a segmented selector with the first chip lit.
- *Panels:* chamfered corners, 1px cyan stroke with brighter corner brackets, inner gradient, scanline overlay at 3%.
- *Second screen (page "Network"):* the reference's lower image: a large glass globe dome (WebGL transmissive sphere) on a glowing grid floor with five round icon bubbles inside, leader lines fanning to labeled nodes left and right, stacked glowing cylinder "database" icons down both sides, and four stat blocks along the bottom.

**28. mauve-ledger** · tech: glass
- *Backdrop:* near-white with a soft lilac haze and a pink-peach bloom rising from the bottom corners. Light and airy, far lighter than ours.
- *Panes:* `mat-glass-frost`: nearly white translucent panes with a bright 1px edge, very soft wide shadows, generous padding. No opaque lilac cards, no dark ink blocks.
- *Top bar:* round purple logo, a glass pill nav (Dashboard active as a white pill), then four line icons and a round photo avatar with a chevron.
- *Row 1:* greeting, then four KPI panes (bank balance, uncategorized transactions, employees working today, card spending), each with a line icon top-left, a kebab on the first, a large light-weight number and a two-line muted caption.
- *Left main pane ("Average sales"):* "Current month" dropdown and an arrow chip; two big values with **dimmed decimals** and small colored delta chips (red −, green +); a bar chart of pale translucent rounded bars where the selected month is a **diagonally hatched purple bar** with a floating tooltip listing two values.
- *Right column:* "Formation status" pane (purple hatched progress bar, "Estimated processing", a white "View status" button, arrow chip); "Success rate" pane with a **segmented arc gauge** of rounded purple ticks fading to white, a centered "51.2%" with a small delta, a caption, and two numbers at the bottom.
- *Bottom:* "Recent emails" rows with photo avatars, subject, invite count, status and time, inside one wide glass pane.
- *Type:* a clean geometric sans throughout (the reference is not serif). Replace our serif greeting.

**34. saffron-dusk** · tech: glass, shape
- *Target:* **two phone screens side by side** on a muted slate-green gradient backdrop, each ~28% of the canvas width, tall, with large radius and a liquid-glass body (`mat-glass-liquid`: bright rim, soft inner glow, wide shadow). On desktop they are the hero, centered; side space carries the secondary modules. No wide desktop strips.
- *Phone 1 (light, cream to sage):* weekday label, serif-caps title with a superscript day number, crescent icon; a row of five round date chips (one selected, dark); a dusk-grey glass card with an imsak → iftar **sun arc** (thin curve, glowing sun dot), two times and a countdown line; a **teal liquid-glass water card** with a round drop gauge, segmented bar and litres; an **orange gradient glass card** for the evening gathering with an illustrated avatar; below, a pale scene of four-point stars over an organic winding path (`blob`/`wave`); a glass bottom tab bar with four icons (Today active).
- *Phone 2 (dark olive to gold):* a dune landscape with a large four-point star and small sparkles at the top, script-style greeting, gear icon; a cream profile card with an illustrated avatar that **overlaps the card's left edge**, name, email, two serif numerals (sessions, journeys) with a divider, and a "Share" chip tab hanging off the bottom-left; an **amber glass "Daily progress" card** whose top-left is cut by an organic tab, with a tree icon and seven thin vertical level sliders labeled by weekday; a dark glass "Upgrade your experience" row with a flame icon, sitting on a second dune cut; a bottom tab bar (Profile active).
- *Type:* thin spaced serif caps for titles, small spaced sans caps for labels.

### Batch 2: 3D heroes

**37. cortex-well** · tech: webgl, glass. Soft lilac-to-pink page, a wide frosted board. Center hero at ~40% width: a **brain** (iridescent pink-blue-violet, GLB from image-to-3D with an iridescent physical material) rising out of a white frosted hemisphere bowl, with a thin elliptical orbit ring beneath, small floating spheres, and thin leader lines to pill chips ("Your heart activity" and others). Left: greeting, two-line heading with a heavy "TODAY!", a 2-wide stack of small white soft tiles (line chart, wave, stat "3", blood-pressure wave, ring gauge). Right: sleep bars tile, round arrow chip, vertical dot rail, heart-rate multi-line tile. Thin vertical icon rail far left; search, nav text, bell and avatar on top. Transparent canvas: no square behind the brain.

**38. ember-rooms** · tech: webgl. White-grey neumorphic board. Hero: a brushed-aluminum **pendant lamp** hanging from the top edge by a thin cord, in the center of large concentric soft rings; "12/7" in big thin numerals under it with a faint "Light" word, and a round orange-outlined power button. Around the rings: round neumorphic room chips, one filled orange. Left: icon rail in a soft pill; intensity slider, schedule times, an orange ring gauge. Right: line chart tiles and a dark room-video tile with a play ring. Second scene (page "Climate"): a large neumorphic thermostat knob with an orange arc, minus and orange plus buttons, mode chips on orbit rings, a wind slider. Lamp emissive follows the intensity slider.

**36. meridian-labs** · tech: webgl. Light grey page, white rounded board. Three columns: left "Personal tests and analysis" (large light heading, filter chips, doctor cards with mini charts); center a **large metallic DNA helix** laid diagonally across ~30% of the width, floating with a soft shadow, with a small "B structure 23.3 Å" label and a vertical trio of round icon buttons; right "Your vitamin supplements" 2×2 product tiles with small bottle renders. Bottom: month stepper and a seven-day row of rounded day cells, one filled orange. Helix rotates slowly and with the pointer.

**35. clima-pane** · tech: webgl, glass. Warm off-white page. A large **orange glass orb** behind the top-left of the center pane and a **blue glass orb** at its bottom-right, plus a flat orange-blue glass disc below: real transmissive spheres. Center: a tall frosted pane with a raised glass **dial knob** (orange-to-blue arc, white handle dot, "22°"), Heat (orange, lit) and Cool buttons, fan speed row. Left: living-room pane ("21.5" with thermometer, humidity, air quality, a soft plant behind the glass), schedule list with the Day row tinted. Right: rooms list with colored icons, mode row with four round buttons (Comfort lit). Left edge: a vertical glass icon rail. Remove the dark sphere.

**8. aura-ring** and **9. lull-sleep** · tech: webgl, glass. Periwinkle-to-pink gradient. A wide glass board with thin white edges. Left: brand, large light heading with an italic last word, "Healthy sleep tips" chip, two small glass chart tiles (stress, sleep), an AI summary tile with an iridescent brain. Center: wellness score tile with a jeweled ring gauge ("50/100", green "Good" chip), then a **smart ring** (dark polished torus with a brushed inner band) on a glass tile with battery and sensor rows and a "Device settings" row. Right: heart-rate wave tile, and a tall tile with a **white statue-like body figure** on a soft pedestal and "View full body report". Aura presents the board tilted in perspective as the hero and straightens on interaction; Lull is the flat, larger crop. Fix Lull's zero counters and black ring box.

**33. orbit-clay** · tech: webgl. Split backdrop: dark slate-green left, warm tan right. Two overlapping tall phones at slight angles: a cream one in front-left and a dark green one behind-right. Cream phone: stencil numerals "4227", a small sun dot, a large gold-rimmed round porthole with an **astronaut helmet** (clay-like matte green with a dark visor, GLB), two small house-shaped buttons, a dotted pager, a dark pill button. Dark phone: stencil numerals in gold ("3530" and rows), a tall thin vertical gauge line, **sharp sand-colored peaks with a spire** rising from the bottom, small controls. A round compass button bottom-right.

### Batch 3: organic shapes and scenes

**4. kumo-payroll** · tech: glass. Full-page painted night scene in transparent layers with parallax: large golden moon top-center-right with birds, pagoda right, cherry-blossom branches top-left, gold-edged dark wave hills, a waterfall and **koi and lotus along the bottom**. The dark glass board (thin gold edge) sits in the lower-middle, covering ~70% of the height, with scenery visible above and below it. No seam: the scene covers the full scroll height. Sidebar: lotus logo, title, seven items with line icons, active pill in brushed gold. Four KPI tiles with tinted dark glass (slate, plum, navy, olive), a line icon, value and green delta. "Payroll trend" paired gold and cream bars; donut with center total and a five-row legend. PTO ring card; a script-lettering motto card with a tiny heart.

**1. horizon-weather** · tech: glass. Dusk coast photo (mountains, lit town, sea, sunset clouds) fills the top ~55% behind the hero; the left sidebar is dark with a thin gold sun logo and "Different skies" footer with mountain line art. Hero heading in a serif at left, current temperature with a sun icon at center-right, **no panel behind the heading**. Seven-day glass cards across the photo with the first outlined in gold and round arrow buttons at both ends. Row: temperature trend (gold line with soft fill, Today/Week/Month), weather details list with icons, and a mountain-lake photo tile with a quote. Bottom: "Popular locations" with round city photo thumbnails and a "See all locations" pill.

**5. canopy-reforest** · tech: shape. Section 1: a green field split by a **diagonal** into a brown area lower-left, with large overlapping leaves (deep green, mid green, tan, brown, with visible veins and drop shadows) cascading from the top-right across ~55% of the width; heading in cream at left, paragraph, a tan clay pill button. Section 2: on a textured green ground with embossed wave lines, one wide dark-green clay panel divided into four columns by **embossed diagonal creases**, each with a line icon medallion, title and text. Section 3: a 3×2 grid of clay tiles (green, brown, tan, a forest photo tile, brown, tan), each with a round raised medallion icon. Leaves are separate transparent layers with parallax.

**6. ridgeline-trails** · tech: webgl, shape. A dark tablet bezel on a light grey page. Top half light: title centered, two small ring gauges and tiny charts at left, a **large mountain render** (snow peak, fog, tree line) centered and overlapping a **dark wave divider** that sweeps across the middle (`wave`). Bottom half charcoal: thin table lines at left, two large **3D clay pie charts** (extruded wedges, soft bevel, WebGL) in sage, sand and off-white, and a round gold ring gauge at right; pager dots.

**29. tidebath-showroom** · tech: tilt3d. White page, thin grey type. Top nav as tilted text links around a centered logo. Hero: a **curved wall of 5–7 bathroom room panels in perspective** (panels rotated around a center axis, the middle one facing front and largest), sitting on a dark wedge floor with a soft elliptical shadow, a round "6 m²" marker in front, arrow buttons at both sides, blue hotspot pins on the rooms. Below: four columns in a light condensed type (inspirations, product catalog with small product cut-outs, downloads, stores with a search field, contact), then a footer link row. Carousel rotates on arrows, drag and keys.

**16. hollow-vault** · tech: shape. Periwinkle page, dark rounded app window. Center: a **wheel of arc slots** (`arcSlot`, upper half circle of dark segments) each holding a relic render with a label; center "Witch chest" with a gold price and a blue "Buy a chest" button. A **cut-out witch on a broom** flies over the top-right of the wheel, overlapping the chat rail edge. A purple "VIP subscription" card tilts over the chat's top. Left sidebar with game list and toggles. Below the wheel: "Items from the chest" row of item tiles with gold price chips, and a live feed row. Right: chat with avatars. A witch-hat price tag bottom-left.

**32. copper-radar** · tech: (none gated; still exact). Slate-blue page with amber lamp glows; a board with a thick amber edge. Top: wordmark, tabs, table pill, three round icons. Main: "Dynamic view" on a peach-to-mint gradient with a **half-dial radar**: a tick ring arc, concentric bands, vendor marks placed along arcs with small triangle markers, an "8.6K" label at the top, and a **copper dome core** at the bottom center with "15%". Left: data-injection "78" tile with a sparkline, open-incidents tile. Right: live feed chips. Below: four columns (Sources, Assets, Alerts with thin colored bars, Automation) and a timeline strip with avatars and a "View timeline" pill. Fix the black bar tiles.

### Batch 4: glass rooms

**19. veil-rooms** · tech: glass. Light blue-grey frosted board over a soft blurred interior. Left icon rail on white. Greeting in two lines; room chips (first filled); a 3×2 grid of white rounded device tiles with **colored states** (warm-to-cool light slider, AC stepper, a red media tile with cover art, wifi speeds, green air-quality chip with PM value, a blue door tile), each with a round power button. Right "Light" panel on darker glass: two lamps with icons, toggles, warm and yellow gradient sliders, spotlights with three-step segmented controls. Dark flat stays only as a variant.

**20. atrium-living** · tech: glass. A photo of a dark teal living room with wood slats and plants fills the page. On it: a glass nav pill of rooms; a glass board of `mat-glass-dark` tiles: outside temperature with a sun-cloud icon, a **glowing cyan-gold thermostat orb** with small satellite dots, action buttons (hot, cold, fan, timer), members avatars, energy area chart with a tooltip, live camera tile, a TV tile with poster art and app icons, lighting tile with a bulb and slider, a smart speaker render on a glowing ring, door lock tile, music tile, ambient LED color and intensity sliders. Left: a vertical glass icon rail.

**18. hearth-nest** · tech: glass. Close already. Add: weather card art (cloud, sun, layered hills at dusk), green gradient air-quality card with a gauge arc, orange-to-teal climate card with a dial, device node icons floating over the room photo joined by thin lines to a central home chip, a vertical brightness slider at the photo's right, the plant and hand-lettered note bottom-left, and the reference's richer saturated gradients on every card.

**24. aether-pane** · tech: glass, tilt3d. A blurred dark office with ceiling light streaks. The dashboard is one large **glass pane tilted in perspective** (rotateY ~−18°, rotateX ~6°), with thin bright edges, reflections and a faint double edge for thickness, containing rounded sub-panes: Q4 revenue bars, a teal bar cluster, "84.2% performance index", a ring gauge with "5.10%" and text columns, user-journey area charts. It straightens smoothly when the user hovers or focuses inside.

**25. forge-fitness** · tech: glass. A moody close portrait of an athlete fills the top ~45% (original render), with the assistant line centered over it, a round orange logo, left round icon rail, a toolbar row at the photo's lower edge. Below, warm smoky `mat-glass-dark` cards: Activity (orange dot matrix by hour), Sleep (stepped yellow lines), Heart (yellow block grid), Wellness score (thin overlapping waves), Focus activity (fine waveform), and a tall right card with seven round icon buttons and a **tick-mark speedometer** reading "50%". Clean grotesk numerals, not a wide display face.

**22. folio-club** · tech: glass. A frosted grey glass shell over a blurred light backdrop. Left: reader, books list with small covers, friends with illustrated avatars. Center: an original illustrated book cover, a large title with an italic second line, four bright tiles (yellow progress, orange time, lilac level, green streak, blue badges) with small round chips, a leaderboard pane with a segmented control. Right: activity as chat bubbles on glass with avatars. Remove the white sample bars.

**14. prism-workspace** · tech: glass. A pale grey page of **thick liquid-glass controls at large scale**: three stacked pill buttons with tinted edge glow (blue, green, peach), a glass speech-bubble tooltip, two round glass icon buttons (lock, bell in pink), a dropdown with a suggestion list, a search field, a plus toggle, a peach-pink switch, checkboxes, and a **folder-shaped glass card** (`tabCard`) with a title and an "Upgrade plan" button. Compose the workspace screen from these at the reference's chunky scale; every control keeps the 5-layer glass.

### Batch 5: clay and soft 3D

**12. mallow-music** · tech: (none gated). Rebuild completely: cream clay page; a mint clay sidebar with a round avatar of a clay girl with headphones, greeting, seven items with soft icons (active as a raised white pill), and a peach "Go premium" card with a crown. Main: title, search pill, bell with badge, avatar; a peach hero card with the **clay girl (eyes closed, pink headphones, music notes)** on the left, greeting, an orange "Play something" pill, a plant on a shelf at right; four pastel KPI tiles (green, peach, yellow, blue) each with a raised icon tile; "Listening overview" with pastel pill bars per weekday; "Top genres" clay donut with legend; "Recently played" list with cover thumbs and round play buttons; "Daily mix" photo tile of a cozy armchair; a mint "Discover new music" banner with a star character. Everything puffy: two-tone inner shadows, big radius.

**10. pearlwell-dental** · tech: webgl and **11. vitalis-care** · tech: webgl. Mint-to-peach gradient with clay props around the edges (toothbrush, mirror, leaves, bubbles for Pearlwell; stethoscope, cross shield, pill bottle, first-aid kit, thermometer for Vitalis). Hero object in WebGL: a glossy **tooth with a shield cross** on a ring (Pearlwell), a **red heart** (Vitalis). Build the desktop screen from the six phone screens' modules at proper scale in white puffy cards with teal accents: hero greeting with the clay doctor (Vitalis), next appointment card in teal, quick actions with pastel icon tiles, health score ring, treatments or doctors list with thumbnails and round arrow buttons, booking calendar with time-slot chips and a teal confirm button, tooth chart arch (Pearlwell) or heart status with weekly bars (Vitalis), records list. Fill the canvas; no empty half.

**13. taffy-analytics**, **31. pebble-studio** · tech: webgl; **30. dune-panels** · tech: shape. Clay moodboards: build one screen that contains every component in the board at its chunky scale.
- Taffy: an extruded peach panel with a cut-out curve, a scalloped stacked-area "Dashboard" card, a tray of eight round embossed icon buttons, a rack of **inflated pill bars**, small control cards, a peach block with two holes, a **pastel torus with an egg** (WebGL).
- Pebble: overlapping clay pebbles, a pastel donut on a tile, round knobs, number chips, a wavy pastel landscape strip, clay slider.
- Dune: navy-headed tab cards (`tabCard`) on sand and sage, donut pairs, pill toggles, shelf icons, and a **flowing sage fabric wave** crossing behind the cards (layered `wave` shapes with soft shading).

**27. orchard-sales** · tech: webgl, glass. Light grey board. The "Pro version" card holds a **cluster of glossy green spheres** (WebGL instanced spheres) with a halftone dot spill, a blurred glass "Advantages" overlay with two age-range stats, and two lime bars rising from the bottom. Other tiles: activity bars with one hatched bar and a tooltip, revenue as a **hatched area** with a lime marker, total spend with a dotted line and markers, virtual cards with thin bars. Black round icon buttons, photo avatars.

**26. zest-health** · tech: (none gated). Close. Outer rounded frame on lime; hatched inactive sleep bars with the lime + lilac active pair; exact three-bubble cluster; rocket illustration in the upgrade card; dotted wellness matrix sizes.

### Batch 6: data boards

**2. pulsar-analytics** · tech: webgl, glass. Soft-3D charcoal board with a purple glow underneath. A **3D clock dial** left; a row of round glossy icon buttons; a cluster of tall rounded gradient pill bars top-right; hero **layered translucent ridge terrain** in teal, violet and peach with glowing lines and a purple pool below; small chart cards along the bottom; a ring gauge "88"; thin constellation lines over the terrain.

**3. solstice-energy** · tech: webgl, shape. Charcoal board. Hero: a large **gradient arc** (yellow to orange to pink, `arcSlot`) over a low-poly **golden mountain range** (WebGL) with a fine grid and a thin red and teal line chart crossing in front; a stat strip below. Left: big "000" readout column with small tables and a ring. Bottom: an orange histogram with a line; a row of round gauges and photo discs; teal bars with a line; four round colored discs. Fix the stretched ellipses.

**17. larchwood-lodge** · tech: shape. Cream page, plum soft-3D panels. A round **porthole dial** top-left glowing orange; a silver round dial; knob clusters; a framed lake painting (purple peaks, orange trees, reflection) with a thin **arc over it** and a media bar; rows of small knob and slider panels; a sunset tile. Build the lodge screen from these, soft and tactile.

**15. plumage-survey** · tech: (none gated). A dark glass panel with **large tropical leaves and feathers outside the frame on both sides**; the parrot is a cut-out overlapping the panel's center; four gradient area charts across the top; "112" and three gradient ring gauges; horizontal gradient bars; a small dark bird perched bottom-left; three small rings.

## 7. Batches, evidence, review

- Order: Batch 1 → 6 as listed. Branch `cursor/fidelity-r4-batch<N>` from `main`. One commit per dashboard. One PR per batch, **not merged**.
- PR body, per dashboard: the side-by-side sheet, the 50% overlay image, which 3D source was used, which screenshot-to-code tool ran, and the remaining differences in plain words.
- After each PR, stop and wait for the architect's review. Review notes carry forward.
- If budget runs short: finish the dashboard you're on, push, and write exactly where you stopped. **Two finished twins beat six touched dashboards.**
