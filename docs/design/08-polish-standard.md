# Polish standard — gallery dashboards

What “polished” means for dashboards in `site/dashboards/`. This doc sits **after** layout and themes pass: the UI is correct; polish makes it feel **intentional, dense with craft, and faithful to each entry’s reference** without copying reference assets.

Pair with [02-rulebook.md](02-rulebook.md) (hard rules), [05-anti-patterns.md](05-anti-patterns.md), and [09-motion-system.md](09-motion-system.md). Tokens live in [design-system/tokens.css](../../design-system/tokens.css).

---

## Definition of done (polish gate)

A gallery dashboard is **polished** when:

1. A reviewer can place it beside `reference.jpg` (or owner reference) and match **density, hierarchy, and mood** without squinting at misaligned pixels.
2. Every interactive surface has **hover, focus, active** feedback; data views have **loading, empty, error, populated** states (see rulebook §7).
3. Imagery and decoration follow the **imagery rules** below—no hotlinks, no reference copies, credits recorded when stock is used.
4. Motion uses tokens only, respects `prefers-reduced-motion`, and pauses offscreen via `DB.onVisible` (see [09-motion-system.md](09-motion-system.md)).
5. Screenshots at **375px and 1280px** show no horizontal scroll, no console errors, and no “template slop” (rainbow gradients, floating labels, 12px tables).

Polish does **not** mean more widgets. It means **fewer visible compromises**.

---

## Checklists

Use these as pass/fail lines during audit. Score each axis 0–5 in Phase C ([POLISH-AUDIT.md](../validation/dashboards/POLISH-AUDIT.md)).

### Optical alignment and 8px rhythm

- [ ] Padding and gaps use `--space-*` only (4px micro, 8px grid). No `13px`, `22px`, or magic margins.
- [ ] Card interiors align: titles, meta, and actions share one left edge; trailing actions share one right edge.
- [ ] Icons sit on the cap line of adjacent text; one icon size per context (16 inline, 20 nav).
- [ ] Baselines line up across columns in bento grids; KPI blocks share a numeric baseline where numbers appear in a row.
- [ ] Scroll areas respect `--row-h` / tap `--hit` where rows are tappable.
- [ ] Async UI (badges, counts) reserves space so layout does not jump on load.

### Density matched to reference

- [ ] Whitespace ratio matches the reference family: **minimal** (tight), **data-dense** (more rows, less hero air), **editorial** (more section breath), **bento** (mixed cell heights).
- [ ] At most **five** KPI or hero metrics on overview; secondary metrics live in list/chart modules.
- [ ] Table/list row count and column count feel comparable to reference—not an empty demo or an overstuffed grid.
- [ ] Sidebar width and header height feel proportional (`--sidebar-w`, `--header-h` or deliberate overrides documented in the dashboard folder).

### Depth (layered shadows, glass/clay highlights)

- [ ] Elevation story is consistent: canvas → surface → raised card → overlay. Prefer 1px `--border` before shadow.
- [ ] Light mode: `--shadow-sm` / `--shadow-md` / `--shadow-lg` with low alpha; no hard offset shadows.
- [ ] Dark / glass themes: depth from lighter surfaces + `--edge` inset highlight; glow only on showcase accents, not behind body copy.
- [ ] **Glass:** `--glass-fill`, `--glass-edge`, `--glass-blur` on chrome only; data panels stay opaque `--surface`.
- [ ] **Clay / skeuo:** subtle inner highlight (`inset 0 1px 0`) on raised controls; outer shadow single direction.
- [ ] No double-shadow stacks that muddy contrast.

### Lighting and gradients (single light direction)

- [ ] One implied light source (typically top-left): highlights on top edges, shadows down-right.
- [ ] Gradients are **local** (hero wash, thread, chart fill)—not full-screen rainbow behind tables.
- [ ] `--thread` and accent gradients used for progress, active nav, focus—not as text backgrounds.
- [ ] Canvas texture (`--canvas-texture`) subtle; must not reduce text contrast below WCAG AA.

### Typography scale, tracking, tabular numbers

- [ ] ≤ 5 distinct sizes per screen; body ≥ `--text-sm` (14px) for tables and cards.
- [ ] ≤ 3 weights; display titles may use theme `--display-tracking` on the display face only.
- [ ] KPIs and tables: `font-variant-numeric: tabular-nums` (and `lining-nums` where theme uses old-style in prose).
- [ ] Muted copy uses `--text-muted`; never gray via raw hex.
- [ ] Line length on prose blocks ≤ 75ch where readable paragraphs exist.

### Icon consistency

- [ ] One icon set per dashboard (stroke width and corner radius match).
- [ ] Semantic colors on icons only when meaning is duplicated in text.
- [ ] Active nav: filled or weight shift—not a different icon family.
- [ ] Decorative icons omitted where the reference is text-first.

### Imagery quality

- [ ] Hero and spot art sharp at 2×; no JPEG mush on edges.
- [ ] Photos cropped with intent; faces and product focal points not clipped awkwardly on mobile.
- [ ] Illustrations match theme palette (sample from `--chart-*` / accent, not random hues).
- [ ] See **Imagery rules** below for sourcing tier.

### Empty, loading, and error states

- [ ] Empty states keep the page pattern skeleton (table frame, board columns).
- [ ] Copy says what happened and what to do next; verb-first actions.
- [ ] Loading: skeleton mirrors layout after ~1s; no full-page spinner for content.
- [ ] Error: inline or region-level, with retry; no silent failure.

### Micro-interactions

- [ ] Buttons and cards: hover lift or border/shadow shift; active press compresses slightly (see motion doc).
- [ ] Toggles and segmented controls animate thumb/indicator with `--dur-2` / `--ease-out`.
- [ ] Chart segments and bars may draw in once on first visible view—not on every resize loop.
- [ ] Focus rings visible (`--focus`), keyboard path matches pointer path.

### Motion timing

- [ ] Durations: `--dur-1`…`--dur-4` only for UI chrome.
- [ ] Enter: `--ease-out`; exit: `--ease-in`; page crossfade **under 250ms** total.
- [ ] No bounce/elastic on chrome unless theme is explicitly playful **and** reference shows it.
- [ ] Animations pause when offscreen or tab hidden (`DB.onVisible`).

---

## Imagery rules

Priority order—use the **first tier that can hit reference fidelity**:

| Tier | Use when | Requirements |
|------|----------|----------------|
| **1. Code-drawn** | Charts, weather glyphs, device silhouettes, maps, clay blobs | SVG or CSS 3D; colors from tokens; no raster for simple shapes |
| **2. Licensed stock** | Photography the reference needs (rooms, faces, landscapes) | Unsplash or Pexels; **WebP ≤ 250KB** per asset; store under `site/dashboards/<id>/`; record credits in catalog `source.credits` (author, service, URL) |
| **3. AI-generated original** | Stock cannot match mood | New composition; **never** trace or reproduce `reference.*` pixels; disclose in credits if required by team policy |

**Never:**

- Hotlink external images in shipped HTML/CSS.
- Copy or lightly filter `reference.jpg` / `reference.png` into the live UI.
- Use placeholder services (Lorem Picsum, etc.) in gallery builds.

**Prefer:**

- `image-rendering` and `object-fit` that match reference crops.
- `srcset` or fixed intrinsic sizes to avoid CLS.

---

## Before / after

Phase C fills numeric scores and captures frames. Until then, use these gallery URLs as the comparison set:

| Dashboard | Live build | Reference frame (owner) | Polish scorecard |
|-----------|------------|-------------------------|------------------|
| Horizon Weather | [site/dashboards/horizon-weather/](../../site/dashboards/horizon-weather/) | `reference.jpg` in same folder | _TBD — Phase C_ |
| Hearth Nest | [site/dashboards/hearth-nest/](../../site/dashboards/hearth-nest/) | `reference.jpg` | _TBD — Phase C_ |
| Larchwood Lodge | [site/dashboards/larchwood-lodge/](../../site/dashboards/larchwood-lodge/) | `reference.jpg` | _TBD — Phase C_ |

**Before:** first pass that matches layout and theme tokens. **After:** same routes, with alignment, depth, imagery, states, and motion meeting this doc.

Side-by-side workflow:

1. Open reference and `shot.jpg` (if present) at 1280px width.
2. Open live dashboard with `?embed=0` at the same width.
3. Toggle hash routes the reference shows (use `DB.route` pages).
4. Record gaps in [POLISH-AUDIT.md](../validation/dashboards/POLISH-AUDIT.md).

---

## Anti-patterns (polish-specific)

These fail polish even when the rulebook passes:

- Uniform 16px padding on every card while the reference uses tight 8px module internals.
- Same shadow on sidebar and floating modal (flattened depth).
- Stock photo with wrong white balance vs theme `--bg`.
- Infinite shimmer or pulse on skeletons after data has loaded.
- Count-up animation re-running on every hash navigation.

See [05-anti-patterns.md](05-anti-patterns.md) for global bans.

---

## Workflow hook

1. **Phase A** — tooling and motion tokens ([09-motion-system.md](09-motion-system.md)).
2. **Phase B** — apply checklists per dashboard slice (one branch, one preview).
3. **Phase C** — score all 38 in [POLISH-AUDIT.md](../validation/dashboards/POLISH-AUDIT.md); attach validation JSON under `docs/validation/dashboards/<id>.json` when screenshots are captured.
