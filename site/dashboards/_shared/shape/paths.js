/**
 * Shape-language path builders. Return SVG path `d` strings in absolute px
 * for a given box so outlines stay crisp at any size. Pair with clip-path
 * or an inline SVG stroke; use filter: drop-shadow() on a wrapper for shadows.
 */

/** Rounded rect helper (clockwise from top-left). */
export function roundRect(w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  return `M${rr},0 H${w - rr} Q${w},0 ${w},${rr} V${h - rr} Q${w},${h} ${w - rr},${h} H${rr} Q0,${h} 0,${h - rr} V${rr} Q0,0 ${rr},0 Z`;
}

/**
 * Rounded frame with concave notches cut from an edge.
 * notches: [{ edge: 'top'|'bottom'|'left'|'right', from, to, depth, r }]
 * from/to are 0–1 along the edge. Shoulders are concave arcs (outline curves
 * outward into the notch) — the “poured” Haven header look.
 */
export function notchFrame(w, h, r, notches = []) {
  const rr = Math.min(r, w / 2, h / 2);
  // Build outer path as a polygon of segments, walking clockwise from TL.
  // For each notch on an edge, instead of a straight run we dip in with
  // concave quarter-circles at the shoulders.
  const top = [];
  const right = [];
  const bottom = [];
  const left = [];

  function edgeNotches(edge) {
    return notches
      .filter((n) => n.edge === edge)
      .map((n) => ({
        from: Math.min(n.from, n.to),
        to: Math.max(n.from, n.to),
        depth: n.depth,
        r: n.r ?? Math.min(n.depth, 24),
      }))
      .sort((a, b) => a.from - b.from);
  }

  // Top edge: left → right
  {
    const ns = edgeNotches('top');
    let x = rr;
    top.push(`M${rr},0`);
    for (const n of ns) {
      const a = n.from * w;
      const b = n.to * w;
      const d = n.depth;
      const nr = Math.min(n.r, d, (b - a) / 2);
      if (a > x) top.push(`H${a}`);
      // Concave shoulder into the notch (curves down into photo)
      top.push(`C${a},${nr * 0.55} ${a},${d} ${a + nr},${d}`);
      top.push(`H${b - nr}`);
      top.push(`C${b},${d} ${b},${nr * 0.55} ${b},0`);
      x = b;
    }
    top.push(`H${w - rr}`);
    top.push(`Q${w},0 ${w},${rr}`);
  }

  // Right edge
  {
    const ns = edgeNotches('right');
    let y = rr;
    for (const n of ns) {
      const a = n.from * h;
      const b = n.to * h;
      const d = n.depth;
      const nr = Math.min(n.r, d, (b - a) / 2);
      if (a > y) right.push(`V${a}`);
      right.push(`C${w - nr * 0.55},${a} ${w - d},${a} ${w - d},${a + nr}`);
      right.push(`V${b - nr}`);
      right.push(`C${w - d},${b} ${w - nr * 0.55},${b} ${w},${b}`);
      y = b;
    }
    right.push(`V${h - rr}`);
    right.push(`Q${w},${h} ${w - rr},${h}`);
  }

  // Bottom edge: right → left
  {
    const ns = edgeNotches('bottom').sort((a, b) => b.to - a.to);
    let x = w - rr;
    for (const n of ns) {
      const a = n.to * w; // higher x first when walking R→L
      const b = n.from * w;
      const d = n.depth;
      const nr = Math.min(n.r, d, (a - b) / 2);
      if (a < x) bottom.push(`H${a}`);
      bottom.push(`C${a},${h - nr * 0.55} ${a},${h - d} ${a - nr},${h - d}`);
      bottom.push(`H${b + nr}`);
      bottom.push(`C${b},${h - d} ${b},${h - nr * 0.55} ${b},${h}`);
      x = b;
    }
    bottom.push(`H${rr}`);
    bottom.push(`Q0,${h} 0,${h - rr}`);
  }

  // Left edge: bottom → top
  {
    const ns = edgeNotches('left').sort((a, b) => b.to - a.to);
    let y = h - rr;
    for (const n of ns) {
      const a = n.to * h;
      const b = n.from * h;
      const d = n.depth;
      const nr = Math.min(n.r, d, (a - b) / 2);
      if (a < y) left.push(`V${a}`);
      left.push(`C${nr * 0.55},${a} ${d},${a} ${d},${a - nr}`);
      left.push(`V${b + nr}`);
      left.push(`C${d},${b} ${nr * 0.55},${b} 0,${b}`);
      y = b;
    }
    left.push(`V${rr}`);
    left.push(`Q0,0 ${rr},0`);
  }

  return [...top, ...right, ...bottom, ...left, 'Z'].join(' ');
}

/**
 * Card with one corner scooped as a concave quarter-circle so a round button nests in it.
 * corner: 'tr'|'tl'|'br'|'bl'
 */
export function scoop(w, h, r, corner = 'tr', scoopR = 28) {
  const rr = Math.min(r, w / 2, h / 2);
  const s = Math.min(scoopR, w / 3, h / 3);
  const parts = [`M${rr},0`];
  if (corner === 'tr') {
    parts.push(`H${w - s}`);
    // Concave scoop: arc bulging toward center
    parts.push(`A${s},${s} 0 0 0 ${w},${s}`);
    parts.push(`V${h - rr}`);
  } else {
    parts.push(`H${w - rr}`);
    parts.push(`Q${w},0 ${w},${rr}`);
    parts.push(`V${h - rr}`);
  }
  if (corner === 'br') {
    parts.push(`V${h - s}`);
    parts.push(`A${s},${s} 0 0 0 ${w - s},${h}`);
    parts.push(`H${rr}`);
  } else {
    parts.push(`Q${w},${h} ${w - rr},${h}`);
    parts.push(`H${rr}`);
  }
  if (corner === 'bl') {
    parts.push(`H${s}`);
    parts.push(`A${s},${s} 0 0 0 0,${h - s}`);
    parts.push(`V${rr}`);
  } else {
    parts.push(`Q0,${h} 0,${h - rr}`);
    parts.push(`V${rr}`);
  }
  if (corner === 'tl') {
    parts.push(`V${s}`);
    parts.push(`A${s},${s} 0 0 0 ${s},0`);
  } else {
    parts.push(`Q0,0 ${rr},0`);
  }
  parts.push('Z');
  // Rebuild cleanly for TL/TR to avoid double-commands on unscoped corners
  if (corner === 'tr') {
    return [
      `M${rr},0`,
      `H${w - s}`,
      `A${s},${s} 0 0 0 ${w},${s}`,
      `V${h - rr}`,
      `Q${w},${h} ${w - rr},${h}`,
      `H${rr}`,
      `Q0,${h} 0,${h - rr}`,
      `V${rr}`,
      `Q0,0 ${rr},0`,
      'Z',
    ].join(' ');
  }
  if (corner === 'tl') {
    return [
      `M${s},0`,
      `H${w - rr}`,
      `Q${w},0 ${w},${rr}`,
      `V${h - rr}`,
      `Q${w},${h} ${w - rr},${h}`,
      `H${rr}`,
      `Q0,${h} 0,${h - rr}`,
      `V${s}`,
      `A${s},${s} 0 0 0 ${s},0`,
      'Z',
    ].join(' ');
  }
  if (corner === 'br') {
    return [
      `M${rr},0`,
      `H${w - rr}`,
      `Q${w},0 ${w},${rr}`,
      `V${h - s}`,
      `A${s},${s} 0 0 0 ${w - s},${h}`,
      `H${rr}`,
      `Q0,${h} 0,${h - rr}`,
      `V${rr}`,
      `Q0,0 ${rr},0`,
      'Z',
    ].join(' ');
  }
  // bl
  return [
    `M${rr},0`,
    `H${w - rr}`,
    `Q${w},0 ${w},${rr}`,
    `V${h - rr}`,
    `Q${w},${h} ${w - rr},${h}`,
    `H${s}`,
    `A${s},${s} 0 0 0 0,${h - s}`,
    `V${rr}`,
    `Q0,0 ${rr},0`,
    'Z',
  ].join(' ');
}

/**
 * Card with a raised label tab that flows into the body with concave fillets.
 * tab: { edge:'top', from, to, height, r } — from/to 0–1 along top.
 */
export function tabCard(w, h, r, tab = { from: 0.25, to: 0.55, height: 28, r: 12 }) {
  const rr = Math.min(r, w / 2, h / 2);
  const th = tab.height ?? 28;
  const tr = Math.min(tab.r ?? 12, th);
  const a = (tab.from ?? 0.25) * w;
  const b = (tab.to ?? 0.55) * w;
  const bodyTop = th;
  // Path: start at body top-left, up into tab, across, down, then around body.
  return [
    `M${rr},${bodyTop}`,
    `H${a - tr}`,
    // concave fillet up into tab
    `C${a - tr * 0.2},${bodyTop} ${a},${bodyTop} ${a},${bodyTop - tr}`,
    `V${tr}`,
    `Q${a},0 ${a + tr},0`,
    `H${b - tr}`,
    `Q${b},0 ${b},${tr}`,
    `V${bodyTop - tr}`,
    `C${b},${bodyTop} ${b + tr * 0.2},${bodyTop} ${b + tr},${bodyTop}`,
    `H${w - rr}`,
    `Q${w},${bodyTop} ${w},${bodyTop + rr}`,
    `V${h - rr}`,
    `Q${w},${h} ${w - rr},${h}`,
    `H${rr}`,
    `Q0,${h} 0,${h - rr}`,
    `V${bodyTop + rr}`,
    `Q0,${bodyTop} ${rr},${bodyTop}`,
    'Z',
  ].join(' ');
}

/**
 * HUD panel with cut (chamfered) corners.
 * c = chamfer size in px; corners = ['tl','tr','br','bl'] subset.
 */
export function chamfer(w, h, c = 16, corners = ['tl', 'tr', 'br', 'bl']) {
  const set = new Set(corners);
  const pts = [];
  // Walk clockwise
  if (set.has('tl')) pts.push([c, 0]); else pts.push([0, 0]);
  if (set.has('tr')) { pts.push([w - c, 0]); pts.push([w, c]); }
  else pts.push([w, 0]);
  if (set.has('br')) { pts.push([w, h - c]); pts.push([w - c, h]); }
  else pts.push([w, h]);
  if (set.has('bl')) { pts.push([c, h]); pts.push([0, h - c]); }
  else pts.push([0, h]);
  if (set.has('tl')) pts.push([0, c]);
  return `M${pts[0][0]},${pts[0][1]} ` + pts.slice(1).map((p) => `L${p[0]},${p[1]}`).join(' ') + ' Z';
}

/** Organic wave divider / silhouette. */
export function wave(w, h, amp = 24, seed = 1) {
  const n = 6;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w;
    const t = i / n;
    const y = h / 2
      + Math.sin((t * Math.PI * 2) + seed) * amp
      + Math.sin((t * Math.PI * 4) + seed * 1.7) * (amp * 0.35);
    pts.push([x, y]);
  }
  let d = `M0,${h} L0,${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  d += ` L${w},${h} Z`;
  return d;
}

/** Soft blob mass from a seed (unit-ish, scaled to w×h). */
export function blob(w, h, seed = 2) {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w * 0.42;
  const ry = h * 0.4;
  const n = 8;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const j = 0.85 + 0.18 * Math.sin(seed * 1.3 + i * 1.7) + 0.08 * Math.cos(seed + i * 2.3);
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d + ' Z';
}

/**
 * Ring segment with rounded ends (arc slot).
 * Angles in radians; r0 inner, r1 outer; gap optional visual break (radians).
 */
export function arcSlot(cx, cy, r0, r1, a0, a1, gap = 0) {
  const start = a0 + gap / 2;
  const end = a1 - gap / 2;
  if (end <= start) return '';
  const rr = Math.min((r1 - r0) / 2, ((end - start) * (r0 + r1) / 2) / 2);
  const mid = (r0 + r1) / 2;
  const x = (r, a) => cx + Math.cos(a) * r;
  const y = (r, a) => cy + Math.sin(a) * r;
  const large = end - start > Math.PI ? 1 : 0;
  // Outer arc, round cap, inner arc reverse, round cap
  const o0 = start;
  const o1 = end;
  return [
    `M${x(r1, o0)},${y(r1, o0)}`,
    `A${r1},${r1} 0 ${large} 1 ${x(r1, o1)},${y(r1, o1)}`,
    `A${rr},${rr} 0 0 1 ${x(r0, o1)},${y(r0, o1)}`,
    `A${r0},${r0} 0 ${large} 0 ${x(r0, o0)},${y(r0, o0)}`,
    `A${rr},${rr} 0 0 1 ${x(r1, o0)},${y(r1, o0)}`,
    'Z',
  ].join(' ');
}

/** Convert an absolute path to objectBoundingBox (0–1) for SVG clipPath. */
export function toUnitPath(d, w, h) {
  return d.replace(/(-?\d*\.?\d+)/g, (n, _i, offset, s) => {
    // Crude: alternate x/y by counting numbers after commands — use a proper parse
    return n;
  });
}

/** Parse path numbers and scale to unit space. */
export function pathToUnit(d, w, h) {
  let expectingX = true;
  let cmd = '';
  return d.replace(/([MmLlHhVvCcQqTtAaZz])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/g, (tok) => {
    if (/^[MmLlHhVvCcQqTtAaZz]$/.test(tok)) {
      cmd = tok;
      if (cmd === 'H' || cmd === 'h') expectingX = true;
      else if (cmd === 'V' || cmd === 'v') expectingX = false;
      else expectingX = true;
      return tok;
    }
    const v = parseFloat(tok);
    let out;
    if (cmd === 'H' || cmd === 'h') out = v / w;
    else if (cmd === 'V' || cmd === 'v') out = v / h;
    else if (expectingX) out = v / w;
    else out = v / h;
    if (cmd !== 'H' && cmd !== 'h' && cmd !== 'V' && cmd !== 'v') expectingX = !expectingX;
    return String(+out.toFixed(5));
  });
}
