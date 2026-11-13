# Themes

Ten starting directions in two families, all built from the same token names, so any component works in any theme. See them live on the showcase site (*Themes* tab), applied to the full demo CRM.

- **Classic** (6): data-dense daily tools, light and dark.
- **Cinematic glass** (4): dark grounds with radial glows, glass showcase chrome and a two-color accent "thread". Best for premium dark dashboards, landing pages and client presentations. Rules: [07-showcase-patterns.md](07-showcase-patterns.md#5-glass-product-world-cinematic-themes).

| Theme | Mode | Feel | Accent | Type | Best for |
|---|---|---|---|---|---|
| **Atelier** | Light | Warm paper, ink, terracotta | Terracotta | Fraunces + Instrument Sans | Interior design, architecture, creative studios, consultants |
| **Linen** | Light | Calm, natural, soft | Sage | Manrope | Wellness, coaching, therapy, hospitality |
| **Coastal** | Light | Fresh, trustworthy, clear | Ocean blue | Plus Jakarta Sans | Real estate, services, agencies, finance-lite |
| **Blush** | Light | Soft, editorial, feminine | Rose | Instrument Serif + DM Sans | Beauty, events, fashion, boutique brands |
| **Noir** | Dark | Luxury, quiet, exclusive | Champagne gold | Cormorant Garamond + Manrope | Luxury services, private clients, high-end real estate |
| **Midnight** | Dark | Focused, technical, crisp | Periwinkle | Geist | Tech-savvy users, agencies, night owls |
| **Grove** ✦ | Dark glass | Grounded, calm, alive | Lime → mint | Urbanist + Manrope | Landscaping & outdoor trades, wellness, field service |
| **Tide** ✦ | Dark glass | Precise, cool, modern | Teal → sky | Sora + Manrope | AI & automation tools, operations consoles |
| **Ember** ✦ | Dark glass | Warm, confident, crafted | Orange → apricot | Fraunces + Manrope | Construction & craft trades, hospitality, food |
| **Aurora** ✦ | Dark glass | Dreamy, creative, premium | Lavender → pink | Sora + DM Sans | Creative studios, beauty & events, personal brands |

✦ = cinematic family. Extra tokens: `--glass-fill`, `--glass-edge`, `--glass-blur`, `--glow-1`, `--glow-2`, `--accent-2`, `--thread`, and a glow `--canvas-texture`.

## How to pick (with the client)

1. Show the demo CRM in the themes that fit (classic for daily tools, cinematic for premium/dark), with their own words on screen if possible.
2. Ask which **two** feel most like them, then what they'd change.
3. Adjust accent hue and typeface to the brand; keep the neutral ramp and structure.

## Making a custom theme

Copy a block in [design-system/tokens.css](../../design-system/tokens.css), rename `data-theme`, change:

1. `--accent`, `--accent-hover`, `--accent-soft`, `--accent-fg` (check contrast of `--accent-fg` on `--accent` ≥ 4.5:1)
2. Neutrals: `--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted` (keep surfaces one step apart)
3. `--font-display`, `--font-sans` (+ add the Google Fonts link)
4. `--chart-1…5`: start with the accent, then 4 hues spaced around the wheel at similar lightness
5. `--radius-*` and `--shadow-*` to tune softness (sharper = more serious, rounder = friendlier)

Then add it to [design-system/themes.json](../../design-system/themes.json) and run `node scripts/build.mjs`.

Every light theme should have a dark sibling if the client uses the app at night. Same accent hue, lifted lightness.

For a cinematic theme, also set `--accent-2` (second thread color), `--glow-1/2` (accent colors at 12–20% alpha) and `--glass-edge` (accent at ~25%). Keep data on opaque `--surface`.

After the client picks, record the rendered values in an art direction file ([templates/art-direction.md](../../templates/art-direction.md)) so every later change stays in the same world.
