/**
 * Bind shape-kit paths to DOM elements.
 * - data-shape="notchFrame|scoop|tabCard|chamfer|wave|blob|arcSlot"
 * - data-shape-opts='JSON' for parameters
 * Applies clip-path: path(...) and optional SVG stroke outline.
 * Shadows: wrap with .shape-shadow (filter: drop-shadow).
 */
import {
  notchFrame, scoop, tabCard, chamfer, wave, blob, arcSlot, roundRect, pathToUnit,
} from './paths.js';

const builders = {
  notchFrame: (w, h, o) => notchFrame(w, h, o.r ?? 32, o.notches ?? []),
  scoop: (w, h, o) => scoop(w, h, o.r ?? 24, o.corner ?? 'tr', o.scoopR ?? 28),
  tabCard: (w, h, o) => tabCard(w, h, o.r ?? 20, o.tab),
  chamfer: (w, h, o) => chamfer(w, h, o.c ?? 16, o.corners ?? ['tl', 'tr', 'br', 'bl']),
  wave: (w, h, o) => wave(w, h, o.amp ?? 24, o.seed ?? 1),
  blob: (w, h, o) => blob(w, h, o.seed ?? 2),
  arcSlot: (w, h, o) => {
    const cx = o.cx ?? w / 2;
    const cy = o.cy ?? h / 2;
    return arcSlot(cx, cy, o.r0 ?? w * 0.35, o.r1 ?? w * 0.48, o.a0 ?? -Math.PI, o.a1 ?? 0, o.gap ?? 0.08);
  },
  round: (w, h, o) => roundRect(w, h, o.r ?? 24),
};

function parseOpts(el) {
  try {
    return el.dataset.shapeOpts ? JSON.parse(el.dataset.shapeOpts) : {};
  } catch {
    return {};
  }
}

function apply(el) {
  const kind = el.dataset.shape;
  const build = builders[kind];
  if (!build) return;
  const rect = el.getBoundingClientRect();
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  const opts = parseOpts(el);
  const d = build(w, h, opts);
  el.style.clipPath = `path('${d}')`;
  el.dataset.shapeW = String(Math.round(w));
  el.dataset.shapeH = String(Math.round(h));

  // Optional matching SVG stroke outline (sibling or child [data-shape-stroke])
  const strokeHost = el.querySelector(':scope > [data-shape-stroke]') || el.nextElementSibling?.matches?.('[data-shape-stroke]') && el.nextElementSibling;
  if (strokeHost) {
    const unit = pathToUnit(d, w, h);
    strokeHost.innerHTML = `<svg viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path data-shape d="${unit}" fill="none" stroke="currentColor" stroke-width="${opts.strokeWidth ?? 0.004}" vector-effect="non-scaling-stroke"/></svg>`;
  }
}

/**
 * Observe one element or a root (query [data-shape]).
 * @returns {() => void} dispose
 */
export function bindShape(target = document) {
  const els = target instanceof Element && target.matches('[data-shape]')
    ? [target]
    : [...(target.querySelectorAll?.('[data-shape]') || [])];

  const ro = new ResizeObserver((entries) => {
    for (const e of entries) apply(e.target);
  });
  for (const el of els) {
    ro.observe(el);
    apply(el);
  }
  return () => ro.disconnect();
}

export function shapePath(kind, w, h, opts = {}) {
  const build = builders[kind];
  if (!build) throw new Error(`Unknown shape: ${kind}`);
  return build(w, h, opts);
}

if (typeof window !== 'undefined') {
  window.DB = window.DB || {};
  window.DB.shape = { bind: bindShape, path: shapePath, builders };
}
