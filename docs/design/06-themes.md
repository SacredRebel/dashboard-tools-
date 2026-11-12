# Themes

Six starting directions, all built from the same token names, so any component works in any theme. See them live on the showcase site (*Themes* tab), applied to the full demo CRM.

| Theme | Mode | Feel | Accent | Type | Best for |
|---|---|---|---|---|---|
| **Atelier** | Light | Warm paper, ink, terracotta | Terracotta | Fraunces + Instrument Sans | Interior design, architecture, creative studios, consultants |
| **Linen** | Light | Calm, natural, soft | Sage | Manrope | Wellness, coaching, therapy, hospitality |
| **Coastal** | Light | Fresh, trustworthy, clear | Ocean blue | Plus Jakarta Sans | Real estate, services, agencies, finance-lite |
| **Blush** | Light | Soft, editorial, feminine | Rose | Instrument Serif + DM Sans | Beauty, events, fashion, boutique brands |
| **Noir** | Dark | Luxury, quiet, exclusive | Champagne gold | Cormorant Garamond + Manrope | Luxury services, private clients, high-end real estate |
| **Midnight** | Dark | Focused, technical, crisp | Periwinkle | Geist | Tech-savvy users, agencies, night owls |

## How to pick (with the client)

1. Show the demo CRM in all six themes, with their own words on screen if possible.
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
