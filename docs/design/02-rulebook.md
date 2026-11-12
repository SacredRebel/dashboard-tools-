# The Rulebook

Hard rules (**MUST / MUST NOT**) are pass/fail. Guidance (**prefer**) is taste. Each section names the skill that covers it in more depth. If that skill isn't installed, this section is enough to follow the method.

Units assume a 16px root. Token names refer to [design-system/tokens.css](../../design-system/tokens.css).

---

<a id="page-patterns"></a>
## 1. Page patterns · `vectorlab-ux-skills:page-patterns`

- MUST name one pattern for every page before writing markup: **List, Detail, Form, Dashboard, Settings, Board, Calendar, Split pane, Analytics, Inbox** ([catalog](03-page-patterns.md)).
- MUST NOT mix patterns on one page (e.g. an editable table inside the overview dashboard).
- View modes of the same records (Board ↔ List) are one page with a toggle, sharing search and filters.
- App chrome (sidebar, header) is not a pattern. Widgets (charts, tiles) live inside a pattern.
- Empty states keep the pattern's skeleton (the table frame stays; board columns stay).

<a id="surfaces"></a>
## 2. Surfaces · `vectorlab-ux-skills:surfaces`

| Task | Surface |
|---|---|
| Edit one field (rename, next step, value) | **Inline**, zero layout shift. Enter saves, Escape cancels |
| Task under ~10 s, ≤ a few fields (quick add, view a card) | **Slide-over** from the right, 400–480px, full-screen on phone |
| Longer or multi-step task | **Its own page** with a URL |
| Destructive action | **Confirmation dialog** naming the item |

- MUST NOT stack a modal on a modal.
- Destructive confirm: title names the thing ("Delete client 'Harbor & Pine'?"), confirm button uses a destructive verb in danger color ("Delete client"), **Cancel has default focus**, Escape cancels.
- Prefer **undo toasts** over confirmations for reversible actions (move stage, archive).

<a id="color"></a>
## 3. Color & elevation · `vectorlab-ux-skills:colour-palette`

- MUST follow 60-30-10: ~60% canvas (`--bg`), ~30% structural surfaces (`--surface`, sidebar, cards), ~10% accent (`--accent`) on actions, active nav, links, focus.
- MUST NOT use the accent for large background fills.
- Lists, tables and boards MUST sit on a visible surface: 1px `--border` frame or a one-step background shift **plus** hairline row dividers.
- Elevation: 1px subtle border first; shadow optional and soft (light mode alpha < 0.08, large blur, 1–4px y-offset). MUST NOT use hard drop shadows.
- Dark mode: depth from slightly lighter surfaces + inset top highlight (`inset 0 1px 0 rgb(255 255 255 / .05)`), not glows.
- Semantic colors (`--success`, `--warning`, `--danger`, `--info`) only for meaning, with text labels (never color alone).
- Contrast: text ≥ 4.5:1 (large text ≥ 3:1); UI boundaries and focus rings ≥ 3:1.

<a id="typography"></a>
## 4. Typography · `vectorlab-ux-skills:typography`

- MUST use at most **3 weights** (e.g. 400/500/600). MUST NOT use > 700.
- Sizes: body 16px, secondary 14px, meta 12px. **No text below 12px.** Table cells and card text are 14–16px, never 12px.
- Line-height decreases as size increases: headings 1.1–1.25, body 1.5–1.6.
- ≤ 5 distinct sizes per screen. Hierarchy from size and space, not weight.
- Max 2 families: UI face + optional display face for page titles and big numbers.
- Numbers in tables and KPIs use tabular figures (`font-variant-numeric: tabular-nums`).
- Prefer sentence case. Avoid ALL-CAPS labels except tiny, sparse overlines.
- Body line length 65–75ch max.

<a id="spacing"></a>
## 5. Spacing & alignment · `vectorlab-ux-skills:spacing`

- MUST snap component spacing to 8px multiples; micro gaps (icon to label) to 4px. Tokens: 4, 8, 12, 16, 24, 32, 48, 64.
- Tight inside groups (4–8px), loose between groups (16–32px). Bigger gaps between sections than between items.
- Icons align to the text's cap height. One icon size per context (16 inline, 20 nav).
- Reserve space for async content (counts, badges) so nothing jumps when it loads.

<a id="motion"></a>
## 6. Motion · `vectorlab-ux-skills:motion` · `transitions` · `reduced-motion`

- Durations: **100, 150, 200, 300 ms** only (`--dur-1…4`).
- Easing: ease-out entering (`--ease-out`), ease-in leaving (`--ease-in`). MUST NOT use bounce, elastic or overshoot on UI chrome.
- Animate **transform and opacity only**. Never width/height/top/left/margin/padding.
- MUST NOT run infinite decorative loops. Functional progress indicators are fine.
- MUST honor `prefers-reduced-motion`: instant or opacity-only.
- Patterns: slide-over enters `translateX(16px)→0` + fade 200 ms, exits 150 ms. Toasts rise 8px + fade. Card drag: lift with shadow-md, no scale bounce.

<a id="states"></a>
## 7. States: loading, empty, error · `loaders` · `empty-states` · `errors`

**Loading**
- < 100 ms: show nothing. 100 ms–1 s: inline indicator on the control that triggered it (button shows "Saving…", `aria-busy`). > 1 s: **skeleton** that mirrors the real layout.
- MUST NOT use a full-page centered spinner for content.

**Empty**
- Every empty view: headline (what belongs here) + one sentence (why it's worth filling) + one primary action ("Add your first client"). Optional "Import CSV".
- Filtered-empty: "No clients match these filters" + **Clear filters**.
- MUST NOT use cartoon people or mascots. Typography, a simple icon, or a product preview instead.

**Error**
- Say what happened, in plain words, never blaming the user; say what to do next; offer Retry. Keep the user's input.
- Inline field errors appear on blur and clear as soon as the value is valid.

<a id="forms"></a>
## 8. Forms · `forms` · `labels` · `defaults`

- MUST have a visible label on every input. Placeholders only for format hints ("e.g. +31 6 1234 5678").
- Ask for the minimum. Required: name. Everything else optional in v1.
- Validate on blur; clear errors immediately on fix; the submit button stays clickable and focuses the first error.
- Smart defaults: stage = first stage, owner = me, next follow-up = today + 3 days, currency = client's.
- Keep drafts if the slide-over is closed accidentally.

<a id="copy"></a>
## 9. Copy · `ux-writing` · `verbs` · `errors`

- Buttons start with a verb and name the object: "Add client", "Log call", "Move to Won". MUST NOT use "Submit", "OK", "Proceed", "Click here".
- Use the client's vocabulary (their stage names, "clients" vs "leads" vs "patients").
- Headlines in sentence case. One idea per sentence. Numbers as digits.
- Dates relative when recent ("2 days ago", "Tomorrow"), absolute on hover/detail.

<a id="a11y"></a>
## 10. Accessibility & keyboard · `keyboard` · `icon-buttons`

- Every action reachable by keyboard in a logical order; visible focus ring (2px `--focus`, 2px offset).
- Overlays trap focus and return it to the trigger on close; Escape closes.
- Drag-and-drop MUST have a keyboard path ("Move to…" menu).
- Icon-only buttons MUST have an accessible name and a tooltip; hit area ≥ 44×44px.
- Shortcuts (optional, nice): `/` search, `N` new client, `G P` go to pipeline. Show them in tooltips.
- Semantic HTML: `<button>` for actions, `<a>` for navigation, tables are `<table>`.

<a id="responsive"></a>
## 11. Responsive · `vectorlab-ux-skills:viewports`

- MUST work at **375px** and **1280px** with no page-level horizontal scroll. Wide content (board, table) scrolls inside its own region.
- Breakpoints: narrow < 640, medium 640–1023, wide ≥ 1024. No one-off breakpoints.
- Sidebar collapses to a menu button on narrow. Slide-overs become full-screen sheets.
- No hover-only actions; row actions available via a ⋯ menu.
- Cap content width on the main region (e.g. 1280–1440px), never on the app shell.

<a id="anti-slop"></a>
## 12. Anti-slop · `vectorlab-ux-skills:anti-slop`

See [05-anti-patterns.md](05-anti-patterns.md). Delete decoration, never structure.

<a id="data-viz"></a>
## 13. Data viz

See [04-data-viz.md](04-data-viz.md).
