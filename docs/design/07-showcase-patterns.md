# Showcase patterns: presenting a dashboard so people *get it*

A dashboard that works still has to be **shown**: to the client at handover, on a landing page, in a pitch, in onboarding. These patterns present a working product without lying about it. They come from a production portfolio of cinematic, dark, glass "product worlds" that present real working tools. Every pattern has a live, interactive version on the showcase site (**Showcase** tab).

> **Core idea:** the working app is the hero. Frame it, point at it, let it move through a real workflow. Never replace it with decoration.

---

## The showcase contract (applies to every pattern)

1. **Source-grounded.** Every on-screen value comes from the real product or clearly labeled sample data. Illustrations are labeled *illustrative* or *sample*.
2. **Input → action → result.** Start with something recognizable (an inquiry, a voice note), show one action at a time, and hold the useful result.
3. **Readable holds.** Steps hold about **5 s** and the final result about **6–8 s**. Never auto-advance faster than a person can read.
4. **The visitor is in control.** Every sequence has Play/Pause, Replay, clickable steps and keyboard support (←/→, Space). Clicking a step pauses auto-advance on that step, holds it about 8 s, then resumes only if it was already playing.
5. **People approve.** If a step is an AI or automated action (send an email, create an invoice), the sequence **stops at an approval gate** until a person clicks Approve. It never "sends" by itself, even in a demo.
6. **Pause when unseen.** All clocks stop when the element is offscreen (`IntersectionObserver`), when the tab is hidden (`visibilitychange`), behind an open dialog, after global Pause, and under `prefers-reduced-motion` (start still; explicit Play opts in).
7. **Flat text, physical objects.** Depth, tilt and light go on frames and objects. Text stays flat and readable, at 12px minimum. Miniature UI inside device frames can be smaller only if a "zoom to read" control exists.
8. **One clock.** Drive all animation from one `requestAnimationFrame` loop (or Web Animations you seek) that follows *visible elapsed time*, not one `setInterval` per card.
9. **Performance budget.** 60 fps at 4× CPU throttle and CLS < 0.1. Drop `backdrop-filter` blur on anything animating, since it can halve frame rate.

---

## Patterns

### 1. Workflow story player
*Use for:* explaining what the product does in 15–25 seconds.

```
[ 1 Inquiry arrives ] [ 2 Discovery call ] [ 3 Proposal sent ] [ 4 Approve follow-up ] [ 5 Won ]
███████████░░░░░░░░  ← progress strip for the current step
┌ app screen (real UI, current state) ┐   Caption: one sentence per step
└──────────────────────────────────────┘   [⏸ Pause] [↺ Replay]
```

- 3–5 steps, each with a short verb-first title and a one-sentence caption.
- A thin **progress strip** shows time within the current step (update at most ~10×/s).
- Future outputs stay hidden until their step. The invoice appears only at *Won*.

### 2. One-record machine
*Use for:* pipelines, boards and any multi-stage process.

The **same** record (one client card) physically travels across the stage columns as the story advances, with a 650–850 ms eased move. Its fields update as it goes (next step, value, badges). It makes the pipeline concept instant: *this is one client's journey*.

- Animate `transform` only. Keep the column layout fixed and move the card with FLIP (measure, then transform from old to new).
- Leave a faint trail or highlight on the destination column.

### 3. Device frames (real HTML inside)
*Use for:* hero images, handover decks, "it works on your phone too".

Laptop and phone frames rendered with CSS (bevel, glass highlight, **contact shadow** on the floor) containing the **live HTML app**, not a screenshot.

- Pointer tilt is **bounded** (≤ 6–8°), eased and **mouse-only** (`@media (hover: hover) and (pointer: fine)`). Touch gets explicit buttons, never hover-only.
- Text inside stays flat. Tilt the frame, not the content's readability.
- Provide left / front / right buttons as the keyboard equivalent of pointer tilt.

### 4. Before / after reveal
*Use for:* "spreadsheet chaos → calm dashboard", old vs new design, a job photo before and after.

A draggable divider over two aligned panes, built on a native `<input type="range">` so it gets keyboard (←/→) and screen-reader support for free. Label both sides.

### 5. Glass product world (cinematic themes)
*Use for:* landing pages, hero sections, client presentations, premium dark dashboards. Themes: **Grove, Tide, Ember, Aurora**.

- **Ground:** a deep, single-hue background with 1–2 large, soft radial glows from the accent and secondary colors (`--canvas-texture`).
- **Glass:** `--glass-fill` (white at ~5.5%) with a 1px accent-tinted `--glass-edge` and `--glass-blur` (~14px). **Only for showcase chrome:** frames, captions, story players, nav bars.
- **Data stays opaque.** Tables, forms and long text sit on `--surface`, not on glass. Glass behind data fails contrast as content scrolls under it.
- **The accent thread:** one gradient (`--thread`, accent → `--accent-2`) is allowed to cross every surface. Use it for connector lines, the active-nav marker, progress strips and focus. **Never as a fill behind text.**
- **At most two accents.** Role colors that carry meaning (client, crew, money) are separate and never restyled for decoration.

### 6. Approval gate
*Use for:* any AI agent or automation feature (draft follow-ups, invoice reminders).

```
┌ Bookkeeper agent · prepared 2 reminders ─────────┐
│ ✉ Harbor & Pine: invoice #318, 7 days overdue   │
│ ✉ Bloom Wellness: invoice #322, due tomorrow     │
│ Cost of this run: $0.02          [Edit] [Approve]│
└──────────────────────────────────────────────────┘
Activity log: 10:42 Drafted 2 reminders · waiting for review
```

- The agent's work is visible, editable and **waits**. Approve is a deliberate, labeled action ("Approve & send 2 reminders").
- Show cost, scope and an **activity log** (who, what, when). Include a pause switch for the agent and a spending limit.

### 7. Spring physics, only for direct manipulation
A damped spring (tension ~100, friction ~20, RK4 integration) makes things the user **drags or presses** feel physical: a sheet pulled down, a toggle knob, a card released after drag. Do not use springs for ambient or automatic motion. Product chrome follows the rulebook's motion rules (100–300 ms, no overshoot).

### 8. Continuity with View Transitions
`document.startViewTransition()` with matching `view-transition-name`s morphs a card into its detail view (list → detail, KPI tile → analytics). Progressive: if unsupported, the change still happens instantly. Respect reduced motion.

### 9. Sticky section nav + varied rhythm
Long showcase pages get a sticky section nav built from the page's own headings (native anchors, native scroll, no scroll-jacking). Vary section rhythm with full-bleed bands, framed regions and different widths, so not every section has the same padding.

### 10. Feature cards with a physical icon
Each feature card gets one meaningful symbol (calendar, phone, route, document), material depth and gentle pointer lighting (a radial highlight that follows the cursor via CSS variables). The same lighting appears on keyboard focus. The card's action opens the relevant step of the story player, not a generic page.

---

## Timing reference

| Thing | Value |
|---|---|
| Story step hold | 4.8–5 s |
| Result hold | 6 s (auto) · 8 s after a click |
| Card travel between stages | 650–850 ms, `cubic-bezier(.22,1,.36,1)` |
| UI state change | 150–300 ms, `cubic-bezier(.32,.72,0,1)` |
| Entrance (once) | ≤ 600 ms |
| Ambient loops (pause offscreen) | 3–9 s |
| Spring | tension 100, friction 20 |
| Progress strip updates | ≤ 10/s |

## Anti-patterns specific to showcasing

- Auto-rotating carousels and hero sliders that advance by themselves.
- Scroll hijacking, custom cursors, required 3D navigation.
- A film or screenshot that *replaces* a product that actually works.
- An AI demo that "sends" without approval.
- Decorative 3D objects unrelated to the workflow.
- Glass panels behind body text or tables.
- Timers that keep running in a background tab.

Related: [02-rulebook.md](02-rulebook.md) · [06-themes.md](06-themes.md) · [docs/stack/05-performance-and-privacy.md](../stack/05-performance-and-privacy.md) · [templates/art-direction.md](../../templates/art-direction.md)
