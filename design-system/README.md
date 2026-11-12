# Design system

| File | What |
|---|---|
| [tokens.css](tokens.css) | All design tokens. Base scales (space, type, motion, layout) + 6 themes (`[data-theme="…"]`) |
| [themes.json](themes.json) | Theme metadata: mood, fonts, best-for, swatches, Google Fonts URL |
| [tailwind.preset.js](tailwind.preset.js) | Tailwind v3 preset mapping tokens to utilities (v4: see docs/stack/04-tokens-to-tailwind.md) |

## Token groups

| Group | Tokens | Rule |
|---|---|---|
| Surfaces | `--bg` (L0 canvas), `--surface` (L1 cards, tables, sidebar), `--surface-2` (L2 popovers, slide-overs), `--surface-sunken` (wells, hovers) | 60-30-10; surfaces one neutral step apart |
| Lines | `--border`, `--border-strong`, `--control-border` | 1px; hairlines between rows; `--control-border` (≥ 3:1) outlines inputs |
| Text | `--text`, `--text-muted`, `--text-subtle` | Muted ≥ 4.5:1 on surface |
| Accent | `--accent`, `--accent-hover`, `--accent-fg`, `--accent-soft`, `--focus` | Only actions, active nav, links, focus |
| Status | `--success/-soft`, `--warning/-soft`, `--danger/-soft`, `--info/-soft` | Meaning only, always with text |
| Charts | `--chart-1…5` | In order; max 5 series |
| Type | `--font-display`, `--font-sans`, `--font-mono`, `--text-xs…3xl`, `--weight-*`, `--display-weight`, `--display-tracking` | ≤ 3 weights; ≥ 12px |
| Space | `--space-1…8` (4, 8, 12, 16, 24, 32, 48, 64) | 8pt grid |
| Shape | `--radius-sm/md/lg/pill`, `--shadow-sm/md/lg`, `--edge` | Border first, soft shadow second |
| Motion | `--dur-1…4` (100–300ms), `--ease-out`, `--ease-in` | transform/opacity only |
| Layout | `--content-max`, `--sidebar-w`, `--header-h`, `--slideover-w`, `--hit`, `--row-h` | |

## Use in a project

1. Copy `tokens.css` into the project (`styles/tokens.css`).
2. Load the theme's fonts (see `themes.json` → `google_fonts_url`, or `next/font`).
3. Set `<html data-theme="…">`.
4. Map to Tailwind/shadcn: [docs/stack/04-tokens-to-tailwind.md](../docs/stack/04-tokens-to-tailwind.md).

Live reference of every component in every theme: showcase site → *Components* and *Themes*.
