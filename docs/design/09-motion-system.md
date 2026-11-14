# Motion system — gallery dashboards

Shared motion contract for `site/dashboards/*`. Aligns with rulebook [§6 Motion](02-rulebook.md#motion). Implement with **vanilla CSS + JS**; no animation libraries required.

Runtime helpers live in [site/dashboards/_shared/frame.js](../../site/dashboards/_shared/frame.js): `DB.onVisible` and `DB.route`.

Tokens: [design-system/tokens.css](../../design-system/tokens.css) (`--dur-*`, `--ease-*`, spring aliases).

---

## Duration and easing tokens

| Token | Value | Typical use |
|-------|-------|-------------|
| `--dur-1` | 100ms | Icon crossfade, micro opacity |
| `--dur-2` | 150ms | Hover, press release, toast out |
| `--dur-3` | 200ms | Card lift, slide-over enter, stagger step |
| `--dur-4` | 300ms | Hero count-up cap, large region fade |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Enter, settle, hover on |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Exit, hover off |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Symmetric crossfades (use sparingly) |
| `--spring-snappy` | `cubic-bezier(0.34, 1.2, 0.64, 1)` | Press, toggle thumb, small lift |
| `--spring-soft` | `cubic-bezier(0.22, 1.15, 0.36, 1)` | Panel reveal, soft settle |
| `--ease-spring-out` | alias of `--spring-snappy` | Same as snappy; name for “out” transitions |

`prefers-reduced-motion: reduce` sets all `--dur-*` to `0ms` in `tokens.css`. Spring curves still apply but instant; prefer opacity-only when reduced.

---

## Global rules

1. **Transform and opacity only** — no animating width, height, margin, padding, top/left, or box-shadow blur radius (shadow may swap instantly on hover).
2. **`will-change`** — set only for the duration of a known animation; remove on `transitionend` / `animationend`.
3. **Pause offscreen** — subscribe with `DB.onVisible(root, (visible) => { … })`; stop `requestAnimationFrame`, intervals, and CSS animation play state when `visible === false`.
4. **Performance** — target **60fps at 4× CPU throttle** in DevTools; if not, simplify (fewer stagger children, shorter paths).
5. **`prefers-reduced-motion`** — honor global duration collapse; skip count-up interpolation (show final value).
6. **No flash &gt; 3/s** — no strobing opacity or color cycles (WCAG 2.3.1).
7. **No infinite loops by default** — skeleton shimmer may loop **only while loading**; stop when data mounts.

---

## `DB.onVisible` and `DB.route`

`DB.onVisible(element, callback)` fires `callback(boolean)` when:

- the element intersects the viewport (Intersection Observer), **and**
- the document is not hidden (`visibilitychange`).

Use the **dashboard root** or main scroll region as `element` so hash-only navigations inside a visible iframe still count as visible, but background tabs pause work.

```js
const root = document.querySelector('[data-db-app]') || document.body;
DB.onVisible(root, (visible) => {
  document.documentElement.dataset.motionPaused = visible ? '' : '1';
});
```

```css
[data-motion-paused="1"] .shimmer,
[data-motion-paused="1"] .count-up-running {
  animation-play-state: paused !important;
}
```

`DB.route(pages, render)` swaps `#/page` views. Keep page transitions **under 250ms** (`--dur-2` + `--dur-3` max stacked). Do not re-run “first view” animations on every `render()`—gate with a `Set` of seen page ids.

```js
const seen = new Set();
DB.route(
  [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'settings', name: 'Settings', pattern: 'Settings' },
  ],
  (id) => {
  if (!seen.has(id)) {
    seen.add(id);
    revealOverview(document.querySelector(`[data-db-page="${id}"]`));
  }
  },
);
```

---

## Patterns (CSS + vanilla JS)

Catalog cross-reference ids: `count-up`, `stagger`, `chart-draw`, `hover-lift`, `press`, `page-transition`, `skeleton`, `icon-state`, `toast`, `ambient` (see `catalog/dashboards.json` motion appendix).

### Count-up on first view

```js
function countUp(el, to, { duration = 800, format = (n) => String(Math.round(n)) } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = format(to);
    return;
  }
  const start = performance.now();
  const from = 0;
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    el.textContent = format(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

DB.onVisible(el, (visible) => {
  if (visible && !el.dataset.counted) {
    el.dataset.counted = '1';
    countUp(el, 1284);
  }
});
```

Use `--dur-4` as a soft cap on perceived duration; longer splines are for hero numbers only.

### Staggered reveal

```css
.reveal-child {
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity var(--dur-3) var(--ease-out),
    transform var(--dur-3) var(--ease-out);
  transition-delay: calc(var(--i, 0) * 40ms);
}
.reveal-child.is-in {
  opacity: 1;
  transform: translateY(0);
}
```

```js
function staggerReveal(container) {
  [...container.children].forEach((child, i) => {
    child.classList.add('reveal-child');
    child.style.setProperty('--i', i);
  });
  requestAnimationFrame(() => {
    container.querySelectorAll('.reveal-child').forEach((c) => c.classList.add('is-in'));
  });
}
```

Cap stagger at ~8 children; beyond that, animate groups.

### Chart draw-in

Prefer `stroke-dashoffset` on SVG paths (transform-free). One shot when chart enters view.

```css
.chart-line {
  stroke-dasharray: var(--len);
  stroke-dashoffset: var(--len);
  transition: stroke-dashoffset var(--dur-4) var(--ease-out);
}
.chart-line.is-drawn {
  stroke-dashoffset: 0;
}
```

Measure path length once in JS; set `--len`. Pause updates while `DB.onVisible` reports false.

### Hover lift

```css
.lift {
  transition: transform var(--dur-2) var(--ease-out);
}
.lift:hover {
  transform: translateY(-2px);
}
.lift:active {
  transform: translateY(0);
  transition-timing-function: var(--spring-snappy);
}
```

Shadow step change can be instant: `box-shadow: var(--shadow-md)` on hover without transition.

### Press feedback

```css
.pressable {
  transition: transform var(--dur-1) var(--ease-out);
}
.pressable:active {
  transform: scale(0.98);
  transition-timing-function: var(--spring-snappy);
}
```

### Skeleton shimmer

```css
@keyframes shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgb(255 255 255 / 0.08),
    transparent
  );
  transform: translateX(-100%);
  animation: shimmer 1.2s var(--ease-in-out) infinite;
}
.skeleton[data-loaded]::after {
  animation: none;
  opacity: 0;
}
```

Remove `.skeleton` or set `data-loaded` when content arrives; never shimmer populated data.

### Page transition (under 250ms)

```css
[data-db-page][hidden] {
  display: none;
}
[data-db-page] {
  animation: page-in var(--dur-3) var(--ease-out);
}
@keyframes page-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

On reduced motion, skip keyframes; toggle `hidden` only.

### Icon state change

Crossfade two SVGs or swap `opacity` on layers—do not morph path `d`.

```css
.icon-layer {
  transition: opacity var(--dur-1) var(--ease-out);
}
.icon-layer[hidden] {
  opacity: 0;
  pointer-events: none;
}
```

### Toast in / out

```css
.toast {
  transform: translateY(8px);
  opacity: 0;
  transition:
    transform var(--dur-3) var(--ease-out),
    opacity var(--dur-3) var(--ease-out);
}
.toast.is-open {
  transform: translateY(0);
  opacity: 1;
}
.toast.is-closing {
  transform: translateY(4px);
  opacity: 0;
  transition-duration: var(--dur-2);
  transition-timing-function: var(--ease-in);
}
```

Raise on `--z-toast`; trap focus only if the toast is modal (rare).

---

## Testing checklist

- [ ] Throttle CPU 4×; scroll and navigate all `DB.route` pages—no long frames.
- [ ] Background tab: count-up and shimmer stop (`DB.onVisible` + `document.hidden`).
- [ ] `prefers-reduced-motion`: no slide/lift; values appear instantly.
- [ ] No animation runs longer than 300ms except one-off hero count-up (≤ 800ms, ease-out).
- [ ] Lighthouse / Performance panel: no continuous `requestAnimationFrame` after load.

---

## Related docs

- [08-polish-standard.md](08-polish-standard.md) — polish gate including motion timing
- [docs/stack/05-performance-and-privacy.md](../stack/05-performance-and-privacy.md) — no polling; visibility contract
- [07-showcase-patterns.md](07-showcase-patterns.md) — story players and device frames (stricter pause rules)
