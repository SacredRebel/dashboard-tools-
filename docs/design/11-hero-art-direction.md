# Hero art direction — signature scenes for gallery dashboards

Each reference sells the product with one hero scene. Ours must match **subject, lighting, palette and camera** without copying or tracing the reference file.

---

## Brief template

For every dashboard hero, write four lines before generating:

1. **Subject** — what sits in frame (brain in glass bowl, pendant lamp, clay helmet…)
2. **Camera** — angle, lens feel, crop (three-quarter, eye-level, slight top-down)
3. **Lighting** — key direction, rim, bounce color
4. **Palette** — three hexes sampled from the dashboard tokens / reference mood

Phone composition is a **second brief**: scale, reposition, and often crop differently so the hero is not a faceless blob at 375.

---

## GenerateImage prompt template

```
Original product-hero still life, not a UI screenshot.
Subject: <subject>.
Camera: <angle>, soft depth of field, centered hero with breathing room.
Lighting: <key> key, soft rim, subtle bounce in <accent>.
Palette: <hex1>, <hex2>, <hex3>, muted neutrals.
Materials: <glass / clay / fabric / metal>.
No logos, no readable brand text, no watermarks, no UI chrome.
```

Rules:

- Never paste the reference image into a model as a “copy this” target for pixel tracing. Mood and structure only.
- Prefer one strong subject over collage clutter.
- Export at **≥ 2×** the largest rendered CSS width; ship WebP (and AVIF when helpful) with `srcset`.
- Cut into **layers** (background / midground / foreground) when the reference has depth so `data-fx="parallax"` can move them ≤ 12px.
- Credit every asset in `media/CREDITS.md` and the dashboard `media/CREDITS.md` if present.
- Do not edit or delete `reference.*`.

---

## Layer cutting

1. Full scene → `hero.webp` (2×)
2. Optional plates: `hero-bg.webp`, `hero-mid.webp`, `hero-fg.webp`
3. Markup:

```html
<div data-fx="parallax" class="hero">
  <img data-fx-layer="1" src="media/hero-bg.webp" alt="">
  <img data-fx-layer="2" src="media/hero-mid.webp" alt="">
  <img data-fx-layer="3" srcset="media/hero-fg.webp 1x, media/hero-fg@2x.webp 2x" alt="">
</div>
```

---

## Phone composition

- Hero may shrink to 40–55% of first screen height; keep the focal point (face, lamp, orb) inside the safe area.
- Prefer bottom nav or compact segmented control so the hero stays visible.
- Scrim text that sits on art until AA passes.
