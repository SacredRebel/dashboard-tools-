# Materials — surface recipes for gallery dashboards

Token recipes for glass, clay, neumorph, HUD/holo, paper, brushed metal, frosted acrylic and soft 3D tiles. Use classes `mat-glass`, `mat-clay`, … or the CSS variables directly. **Never put body text on raw glass** — put copy on an opaque `--surface` or a scrimmed panel.

Tokens live in [design-system/tokens.css](../../design-system/tokens.css) (`--mat-*`). Pair with [08-polish-standard.md](08-polish-standard.md) and [02-rulebook.md](02-rulebook.md).

---

## Shared layer model

Every raised surface is five layers (bottom → top):

1. **Fill** — opaque or translucent base
2. **Inner highlight** — `inset 0 1px 0` light rim (top edge)
3. **Edge** — 1px border tinted to the canvas, never pure gray
4. **Shadow stack** — soft ambient + tighter contact; shadow color tinted to the background
5. **Grain** (optional) — low-contrast noise at ≤ 4% opacity

Contrast: text and icons sit on layer 1 at AA. Charts and KPIs stay on opaque fills.

---

## Liquid glass (5 layers)

A glass pane is five layers, not one tint. Live classes: `mat-glass-frost` · `mat-glass-liquid` · `mat-glass-dark` · `mat-glass-holo` in [`site/dashboards/_shared/fx/materials.css`](../../site/dashboards/_shared/fx/materials.css).

1. **Backdrop** — `backdrop-filter: blur(18–28px) saturate(140–180%) brightness(1.05)` over a real photo, haze or 3D.
2. **Refraction** (liquid only) — SVG `feTurbulence` + `feDisplacementMap` via `backdrop-filter: url(#mat-liquid-refract)` when supported; plain blur is the fallback.
3. **Tint** — 6–18% fill with a top-to-bottom (or diagonal) gradient.
4. **Edge light** — inset white highlight on top/left, darker inset on bottom/right, 1px outer stroke at 10–20%.
5. **Specular** — soft diagonal highlight (`::before`, `mix-blend-mode: soft-light`); shifts a few px with pointer when `data-mat-specular` is set.

Plus a wide soft shadow and a small contact shadow. Text on glass needs a scrim or denser tint until it passes AA. Glass needs something behind it — a photo, gradient haze or WebGL.

| Variant | Best for |
|---|---|
| `mat-glass-frost` | Mauve, Veil, Haven — airy nearly-white panes |
| `mat-glass-liquid` | Prism, Saffron, Clima — bright rim, soft inner glow |
| `mat-glass-dark` | Atrium, Hearth, Forge, Kumo — cinematic rooms |
| `mat-glass-holo` | Aether, Citadel — cyan edge glow + 3% scanlines |

Gates require ≥ 3 surfaces ≥ 160px with `backdrop-filter` on the overview.

---

## Recipes (live CSS)

```css
/* Glass — light (legacy single-tint; prefer mat-glass-frost / liquid) */
.mat-glass {
  background: var(--mat-glass-fill);
  border: 1px solid var(--mat-glass-edge);
  box-shadow: var(--mat-glass-shadow), var(--mat-glass-inset);
  backdrop-filter: blur(var(--mat-glass-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--mat-glass-blur)) saturate(1.2);
}

/* Clay */
.mat-clay {
  background: var(--mat-clay-fill);
  border: 1px solid var(--mat-clay-edge);
  box-shadow: var(--mat-clay-shadow), var(--mat-clay-inset);
}

/* Neumorph (soft UI) */
.mat-neu {
  background: var(--mat-neu-fill);
  border: none;
  box-shadow: var(--mat-neu-shadow);
}

/* HUD / holo */
.mat-holo {
  background: var(--mat-holo-fill);
  border: 1px solid var(--mat-holo-edge);
  box-shadow: var(--mat-holo-glow), var(--mat-holo-inset);
}

/* Paper */
.mat-paper {
  background: var(--mat-paper-fill);
  border: 1px solid var(--mat-paper-edge);
  box-shadow: var(--mat-paper-shadow);
}

/* Brushed metal */
.mat-metal {
  background: var(--mat-metal-fill);
  border: 1px solid var(--mat-metal-edge);
  box-shadow: var(--mat-metal-shadow), var(--mat-metal-inset);
}

/* Frosted acrylic */
.mat-acrylic {
  background: var(--mat-acrylic-fill);
  border: 1px solid var(--mat-acrylic-edge);
  box-shadow: var(--mat-acrylic-shadow), var(--mat-acrylic-inset);
  backdrop-filter: blur(var(--mat-acrylic-blur)) saturate(1.35);
}

/* Soft 3D tile */
.mat-tile3d {
  background: var(--mat-tile3d-fill);
  border: 1px solid var(--mat-tile3d-edge);
  box-shadow: var(--mat-tile3d-shadow), var(--mat-tile3d-inset);
}
```

| Recipe id | Best for | Dashboards (examples) |
|---|---|---|
| `glass` / `glass-frost` | Light wellness, soft product boards | cortex-well, mauve-ledger, lull-sleep, haven-listings |
| `glass-liquid` | Phone shells, chunky controls | saffron-dusk, prism-workspace, clima-pane |
| `glass-dark` | Cinematic / neon rooms | atrium-living, forge-fitness, kumo-payroll |
| `glass-holo` | Fleet / HUD | citadel-wall, aether-pane, copper-radar |
| `glass-dark` (legacy) | Cinematic / neon | pulsar-analytics, citadel-wall, clima-pane |
| `clay` | Soft product, music, studio | mallow-music, pebble-studio, taffy-analytics, orbit-clay |
| `neu` | Soft ops / device | glacier-ops, ember-rooms |
| `holo` | Fleet, security, sci-fi | citadel-wall, copper-radar |
| `paper` | Editorial, lodge, folio | larchwood-lodge, folio-club, haven-listings |
| `metal` | Industrial radar, forge | copper-radar, forge-fitness |
| `acrylic` | Smart home, rooms | veil-rooms, atrium-living, hearth-nest |
| `tile3d` | Showroom carousels, panels | tidebath-showroom, dune-panels |

---

## Contrast notes

- Glass and acrylic: keep `--text` on an opaque inset or raise fill opacity until body copy hits 4.5:1.
- Holo glow never sits behind paragraph text.
- Clay and neu: keep the light source top-left; paired shadows must not muddy small type.
