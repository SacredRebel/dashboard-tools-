> **Building or changing a gallery dashboard? Read [00-twin-contract.md](00-twin-contract.md) first.** It is the definition of done and the order of work.

# Dashboard style gallery

A growing collection of **complete, working reference dashboards**, each with its own theme and variants, grouped by **style family** and **use case**. Agents pick one as the starting look for a new product; people browse them visually on the showcase site → **Dashboards**.

| File | Read it when |
|---|---|
| This file | Choosing a dashboard style |
| [01-add-a-dashboard.md](01-add-a-dashboard.md) | Adding a new dashboard (from a screenshot or an idea). The exact workflow |
| [02-reference-twin-playbook.md](02-reference-twin-playbook.md) | Making a dashboard match its reference image: measured frame, poured and scooped shapes, layered glass, 3D heroes, pages in the same frame. Worked examples: `haven-listings` (photo frame, glass, organic shapes) , `meridian-labs` (flat board with a live 3D object) and `tidebath-showroom` (scrolling page with a CSS 3D hero) |
| [05-style-frameworks.md](05-style-frameworks.md) | One framework per look (frosted glass, liquid glass, clay, soft-3D tiles, neumorphic, HUD, organic shapes, 3D object, ridges, CSS 3D, backdrop art, colour, type, motion) and the rule that every dashboard keeps its own form |
| [06-verification.md](06-verification.md) | How to test a dashboard and decide it is polished: captures, gates, eleven questions, using it, the decision table, the pre-publish list |
| [04-finishing-pass.md](04-finishing-pass.md) | After a dashboard is built and passes the checks: the look-then-fix pass that takes it to finished, with the defects the checks cannot see |
| [03-asset-and-tool-map.md](03-asset-and-tool-map.md) | Which outside tools help (image-to-3D, depth parallax, screenshot-to-code, motion libraries) and what to do when they can't run |
| [catalog.md](catalog.md) | Browsing every dashboard with thumbnail, palette, layout (generated) |
| [../../catalog/dashboards.json](../../catalog/dashboards.json) | Machine-readable source of truth |
| `site/dashboards/<id>/` | The dashboard itself: `index.html`, `style.css`, `app.js`, `thumb.jpg` |

---

## How an agent picks a dashboard

1. **Filter `catalog/dashboards.json`** by what you're building:
   - `use_cases` contains the product's domain (crm, finance, weather, health…), then
   - `mode` (dark / light) if the client has a preference, then
   - `style_family` if the client gave a mood ("calm", "techy", "luxury", "playful").
2. **Read `best_for` and `avoid_when`.** Drop anything whose `avoid_when` matches the project (e.g. cinematic styles for dense data).
3. **Show the human 2–3 options** (thumbnail + one line each) and recommend one. Choosing the look is the human's decision (Direction gate).
4. **Adopt it properly:**
   - Copy the chosen `style.css` `:root` block. Its token names match `design-system/tokens.css`, so it drops into the Tailwind preset.
   - Reuse the `layout.structure` and `components` list as the screen plan; keep the `signature` detail; replace sample copy and data with the client's words.
   - If `maps_to_theme` is set, that toolkit theme is the closest built-in match and is a safe fallback.
5. **Never ship a gallery dashboard 1:1.** It's a style reference: brand, words, data and the client's real jobs come first (rulebook still applies).

## Style families

| Family | Feels like | Typical use |
|---|---|---|
| `cinematic` | Dark, scenic, glass over landscape, one warm accent | Weather, travel, lifestyle, landing heroes |
| `glass` | Frosted panels over gradients, glows | Modern SaaS, AI tools, crypto |
| `minimal` | White space, hairlines, quiet type | CRM, admin, productivity |
| `bento` | Mixed-size tiles in a tight grid | Overviews, product showcases |
| `data-dense` | Compact tables, many small charts | Trading, ops, BI |
| `soft` | Rounded, pastel, friendly | Health, education, personal |
| `editorial` | Big serif, magazine layout | Brands, content, luxury |
| `bold` | High contrast, heavy type, brutalist edges | Creative tools, youth brands |
| `dark-neon` | Near-black with neon accents | Gaming, music, crypto |
| `skeuo` | Soft extruded, tactile controls | Smart home, devices, audio |

New families can be added to `style_families` in the catalog when a dashboard doesn't fit any of these. Keep the list short.

## Rules every gallery dashboard follows

- **Self-contained:** one folder, static HTML/CSS/JS, no build step, no frameworks, no CDNs except Google Fonts.
- **Token names from the toolkit** (`--bg`, `--surface`, `--text`, `--text-muted`, `--accent`, `--font-sans`…) on `:root`, with `[data-variant="…"]` overrides. That makes every dashboard themeable and portable.
- **Original work:** recreated from the reference in our own code. No copied logos, brand names, photos or icons from the source screenshot. Scenery and images are code-drawn (SVG/CSS) or from a license that allows reuse, credited in the catalog.
- **Fictional sample data**, labeled as such somewhere on the page.
- **Works at 375px and 1440px**, keyboard reachable, AA contrast, `prefers-reduced-motion` respected, no polling, no console errors. `scripts/dashboards-check.mjs` enforces the mechanical parts.

**Layout spec.** When a dashboard has a `layout.json`, its reference layout is checked by numbers: [07-layout-spec.md](07-layout-spec.md). Read it before building.

**Image to dashboard.** From one reference image to every size and page, with the shape primitives and the review rounds: [09-image-to-dashboard.md](09-image-to-dashboard.md).

**Elements and objects.** The full guardrail framework, including how a 3D hero object is specified and built: [08-object-spec.md](08-object-spec.md).
