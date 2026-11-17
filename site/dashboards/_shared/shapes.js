// Shape grammar primitives for gallery dashboards (docs/dashboards/09-image-to-dashboard.md §3).
// Cuts real outlines into cards with clip-path: path(), sized to the element and recomputed on resize.
//
//   <article data-shape="tab"   data-shape-opts="side:left; w:30%; h:30; r:26; tr:14; f:12" data-shape-edge="rgba(255,255,255,.7)">
//   <article data-shape="notch" data-shape-opts="edge:top; at:18%; R:40; r:24">        bite for an avatar / button that overlaps the edge
//   <nav     data-shape="bump"  data-shape-opts="at:12%; a:40; s:16; r:26">            raised dome on the top edge (active nav item, FAB)
//   <section data-shape="wave"  data-shape-opts="amp:22; r:28; phase:0.3">             organic top edge (molded tray, dune panel)
//   <article data-shape="slant" data-shape-opts="rise:18; r:22; dir:up">               card whose top edge slopes (tray, ticket)
//
// Values are px, or % of the element width. data-shape-edge draws a light rim along the outline (glass edge),
// because box-shadow is clipped by clip-path. Put drop shadows on a parent with filter: drop-shadow(...).
// Call applyShapes() after rendering new markup; resizes are handled by a ResizeObserver (no timers, no polling).

const num = (v, w, d) => { if (v == null || v === '') return d; const s = String(v).trim(); return s.endsWith('%') ? (parseFloat(s) / 100) * w : parseFloat(s); };
const parse = (el) => Object.fromEntries((el.dataset.shapeOpts || '').split(';').map((p) => p.split(':').map((x) => x && x.trim())).filter((p) => p[0]));
const f2 = (n) => Math.round(n * 10) / 10;

// Each builder returns path commands in a w×h box, top-left origin, clockwise.
const SHAPES = {
  tab(w, h, o) {
    const r = num(o.r, w, 24), tr = num(o.tr, w, 14), th = num(o.h, w, 30), tw = num(o.w, w, w * 0.3), f = num(o.f, w, 12);
    const p = [`M0 ${tr}`, `A${tr} ${tr} 0 0 1 ${tr} 0`, `H${tw - tr}`, `A${tr} ${tr} 0 0 1 ${tw} ${tr}`, `V${th - f}`, `A${f} ${f} 0 0 0 ${tw + f} ${th}`,
      `H${w - r}`, `A${r} ${r} 0 0 1 ${w} ${th + r}`, `V${h - r}`, `A${r} ${r} 0 0 1 ${w - r} ${h}`, `H${r}`, `A${r} ${r} 0 0 1 0 ${h - r}`, 'Z'];
    return o.side === 'right' ? mirror(p.join(' '), w) : p.join(' ');
  },
  notch(w, h, o) {
    const r = num(o.r, w, 24), R = num(o.R, w, 36), at = num(o.at, w, w * 0.2);
    const a = Math.max(r + R, Math.min(w - r - R, at));
    if (o.edge === 'bottom') {
      return [`M${r} 0`, `H${w - r}`, `A${r} ${r} 0 0 1 ${w} ${r}`, `V${h - r}`, `A${r} ${r} 0 0 1 ${w - r} ${h}`, `H${a + R}`, `A${R} ${R} 0 0 0 ${a - R} ${h}`,
        `H${r}`, `A${r} ${r} 0 0 1 0 ${h - r}`, `V${r}`, `A${r} ${r} 0 0 1 ${r} 0`, 'Z'].join(' ');
    }
    return [`M0 ${r}`, `A${r} ${r} 0 0 1 ${r} 0`, `H${a - R}`, `A${R} ${R} 0 0 0 ${a + R} 0`, `H${w - r}`, `A${r} ${r} 0 0 1 ${w} ${r}`,
      `V${h - r}`, `A${r} ${r} 0 0 1 ${w - r} ${h}`, `H${r}`, `A${r} ${r} 0 0 1 0 ${h - r}`, 'Z'].join(' ');
  },
  bump(w, h, o) {
    const r = num(o.r, w, 24), s = num(o.s, w, 16), a = num(o.a, w, 40), at = num(o.at, w, w / 2);
    const cx = Math.max(r + a, Math.min(w - r - a, at)), R = (a * a + s * s) / (2 * s);
    return [`M0 ${s + r}`, `A${r} ${r} 0 0 1 ${r} ${s}`, `H${cx - a}`, `A${f2(R)} ${f2(R)} 0 0 1 ${cx + a} ${s}`, `H${w - r}`, `A${r} ${r} 0 0 1 ${w} ${s + r}`,
      `V${h - r}`, `A${r} ${r} 0 0 1 ${w - r} ${h}`, `H${r}`, `A${r} ${r} 0 0 1 0 ${h - r}`, 'Z'].join(' ');
  },
  wave(w, h, o) {
    const r = num(o.r, w, 28), amp = num(o.amp, w, 20), ph = parseFloat(o.phase ?? 0.35);
    const y0 = amp, m = w * ph;
    return [`M0 ${y0 + r}`, `C0 ${y0} ${m * 0.4} ${y0 * 0.2} ${m} ${y0 * 0.5}`, `S${w * 0.78} ${y0 * 1.6} ${w - r} ${y0 * 0.15}`, `Q${w} 0 ${w} ${r}`,
      `V${h - r}`, `A${r} ${r} 0 0 1 ${w - r} ${h}`, `H${r}`, `A${r} ${r} 0 0 1 0 ${h - r}`, 'Z'].join(' ');
  },
  slant(w, h, o) {
    const r = num(o.r, w, 22), rise = num(o.rise, w, 18);
    const yl = o.dir === 'down' ? 0 : rise, yr = o.dir === 'down' ? rise : 0;
    return [`M0 ${yl + r}`, `Q0 ${yl} ${r} ${yl - (yl - yr) * (r / w)}`, `L${w - r} ${yr + (yl - yr) * (r / w)}`, `Q${w} ${yr} ${w} ${yr + r}`,
      `V${h - r}`, `A${r} ${r} 0 0 1 ${w - r} ${h}`, `H${r}`, `A${r} ${r} 0 0 1 0 ${h - r}`, 'Z'].join(' ');
  },
};

// Mirror a path horizontally (x → w − x) and flip arc sweep so outlines stay valid.
function mirror(d, w) {
  return d.replace(/([MHLA])([^MHLAVZCSQ]*)/g, (all, c, args) => {
    const n = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (c === 'M' || c === 'L') return `${c}${w - n[0]} ${n[1]}`;
    if (c === 'H') return `H${w - n[0]}`;
    if (c === 'A') return `A${n[0]} ${n[1]} ${n[2]} ${n[3]} ${n[4] ? 0 : 1} ${w - n[5]} ${n[6]}`;
    return all;
  });
}

function shape(el) {
  const kind = el.dataset.shape; const fn = SHAPES[kind]; if (!fn) return;
  const w = el.offsetWidth, h = el.offsetHeight; if (w < 8 || h < 8) return;
  const d = fn(w, h, parse(el)).replace(/-?\d+\.\d+/g, (x) => String(f2(+x)));
  el.style.clipPath = `path('${d}')`;
  const edge = el.dataset.shapeEdge;
  let svg = el.querySelector(':scope > svg.shp-edge');
  if (edge) {
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'shp-edge'); svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:3';
      svg.innerHTML = '<path data-shape fill="none" vector-effect="non-scaling-stroke"/>'; el.appendChild(svg);
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    }
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const p = svg.firstChild; p.setAttribute('d', d); p.setAttribute('stroke', edge); p.setAttribute('stroke-width', el.dataset.shapeEdgeWidth || '3');
  }
}

const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver((entries) => { for (const e of entries) shape(e.target); }) : null;
export function applyShapes(root = document) {
  for (const el of root.querySelectorAll('[data-shape]')) { if (el.tagName === 'path') continue; shape(el); if (ro && !el.__shp) { ro.observe(el); el.__shp = 1; } }
}
export { SHAPES };
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => applyShapes()); else applyShapes();
  window.DBShapes = { applyShapes, SHAPES };
}
