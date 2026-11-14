/* Citadel Wall: orbital ops big-screen sample. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.500h5v5h-5zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.500h.01M7 16.500h.01"/>',
    truck: '<path d="M2 6h12v11H2zM14 10h4l4 4v3h-8z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12 18.5 5.5"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    database: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.500v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    signal: '<path d="M4 20v-3M9 20v-7M14 20V9M19 20V4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    box: '<path d="m12 2 9 5v10l-9 5-9-5V7z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
  };
  const svg = (n, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n] || ''}</svg>`;
  const paintIcons = (root = document) => $$('[data-icon]', root).forEach((el) => { el.innerHTML = svg(el.dataset.icon); });
  const fmtNum = (v) => v.toLocaleString('en-US');
  const dayOffset = (n) => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate() + n); };
  const fmtDate = (d, o = { month: 'short', day: 'numeric' }) => d.toLocaleDateString('en-US', o);
  const niceStep = (raw) => { const p = 10 ** Math.floor(Math.log10(raw || 1)); const f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
  function scale(vals, o) {
    let min = o.min ?? Math.min(...vals), max = o.max ?? Math.max(...vals);
    const step = o.step || niceStep((max - min || 1) / (o.ticks || 4));
    min = Math.floor(min / step) * step; max = Math.ceil(max / step) * step; if (max === min) max = min + step;
    const ticks = []; for (let v = min; v <= max + step / 1e6; v += step) ticks.push(+v.toFixed(6));
    return { min, max, ticks };
  }
  // segmented control / tabs: buttons carry data-v, the pressed one gets aria-pressed="true"
  function seg(group, onChange) {
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      $$('button[data-v]', group).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onChange(b.dataset.v, b);
    });
  }
  function smooth(pts) { // Catmull-Rom to cubic Bezier
    let p = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      p += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return p;
  }
  let chartId = 0;
  // Line / area chart: SVG draws the shape, HTML labels sit over it (so text never scales), hover and focus show values.
  // o: { labels, series: [{ name, color: '--chart-1', values, fill, dash }], fmt, h, label, curve, dots, min, max, ticks, step }
  function lineChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length, W = 600, H = 200;
    const { min, max, ticks } = scale(o.series.flatMap((s) => s.values), o);
    const x = (i) => (n > 1 ? (i / (n - 1)) * W : W / 2), y = (v) => H - ((v - min) / (max - min)) * H;
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `cw-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="cw-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="cw-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="cw-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="cw-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="cw-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="cw-cursor" hidden></span><span class="cw-tip num" hidden></span>
    </div>`;
    const tip = $('.cw-tip', el), cur = $('.cw-cursor', el), dots = $$('.cw-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `cw-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.cw-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.cw-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  // Bar chart built from HTML columns (each column is a focusable button). Grouped by default, stacked with o.stacked.
  // o: { labels, series: [{ name, color, values }], fmt, h, label, max, ticks, active, onPick, stacked }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="cw-plot cw-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="cw-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="cw-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="cw-cols">${o.labels.map((l, i) => `<button class="cw-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="cw-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="cw-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="cw-tip num" hidden></span>
    </div>`;
    const tip = $('.cw-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `cw-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.cw-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.cw-cols', el).addEventListener('mouseleave', () => show(-1));
  }
  // Donut from stroked circles. parts: [{ value, color: '--chart-1' }] (values in any unit). Returns an SVG string.
  function donut(parts, { size = 120, w = 14, gap = 1.5, round = false } = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0), r = (size - w) / 2, c = size / 2; let off = 0;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}"/>${parts.map((p) => {
      const len = (p.value / total) * 100, seg = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}" pathLength="100" stroke-dasharray="${Math.max(0.01, len - gap).toFixed(2)} ${(100 - len + gap).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})" style="stroke:var(${p.color})"${round ? ' stroke-linecap="round"' : ''}/>`;
      off += len; return seg;
    }).join('')}</svg>`;
  }
  // Arc gauge. Angles in degrees, 0 = up, clockwise. Returns an SVG string with a track and a value arc.
  const polar = (cx, cy, r, deg) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const arcPath = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  function arcGauge(pct, { size = 160, w = 12, from = -120, to = 120, color = '--accent', knob = false } = {}) {
    const c = size / 2, r = (size - w) / 2 - (knob ? 4 : 0), end = from + (to - from) * Math.max(0, Math.min(1, pct)), [kx, ky] = polar(c, c, r, end);
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><path class="track" d="${arcPath(c, c, r, from, to)}" fill="none" stroke-width="${w}" stroke-linecap="round"/><path d="${arcPath(c, c, r, from, Math.max(end, from + 0.01))}" fill="none" stroke-width="${w}" stroke-linecap="round" style="stroke:var(${color})"/>${knob ? `<circle class="knob" cx="${kx.toFixed(2)}" cy="${ky.toFixed(2)}" r="${w * 0.75}"/>` : ''}</svg>`;
  }
  // Tiny trend line. Returns an SVG string; stretches to its box.
  function spark(vals, { color = '--chart-1', fill = 0.25, w = 120, h = 36 } = {}) {
    const mn = Math.min(...vals), mx = Math.max(...vals), pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 6)]);
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `cw-s${++sparkId}`;
    return `<svg class="cw-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }
  let sparkId = 0;
  paintIcons();

  $('[data-clock]').textContent = fmtDate(dayOffset(0), { weekday: 'short', month: 'short', day: 'numeric' }) + ' · SHIFT B';

  const ID_KV = [
    ['Callsign', 'ORBIT-17'],
    ['Node', 'CW-Meridian'],
    ['Uptime', '142d'],
  ];
  $('[data-id-kv]').innerHTML = ID_KV.map(([k, v]) => `<div><span>${k}</span><b class="num">${v}</b></div>`).join('');
  $('[data-id-bars]').innerHTML = [
    ['Auth', 92], ['Link', 78], ['Cooling', 64],
  ].map(([n, v]) => `<div class="cw-row"><span>${n}</span><span class="cw-track"><i style="--w:${v}%"></i></span><b class="num">${v}%</b></div>`).join('');

  const FLOW = {
    '6h': { labels: ['−6h', '−5h', '−4h', '−3h', '−2h', '−1h', 'Now'], values: [42, 55, 48, 70, 62, 78, 84] },
    '24h': { labels: ['00', '04', '08', '12', '16', '20', '24'], values: [30, 38, 52, 68, 74, 61, 80] },
  };
  let flowRange = '6h';
  function renderFlow() {
    const d = FLOW[flowRange];
    lineChart($('[data-flow]'), {
      labels: d.labels,
      series: [{ name: 'Tonnes/h', color: '--chart-1', values: d.values, fill: 0.28 }],
      h: 110, label: 'Lane throughput over selected range', fmt: (v) => v + 't',
    });
  }

  barChart($('[data-load]'), {
    labels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'],
    series: [{ name: 'Load', color: '--chart-2', values: [62, 48, 80, 55, 70, 40, 88, 58] }],
    h: 100, label: 'Bay load by dock', noAxis: false, ticks: 3,
  });

  const STATUS = [
    ['Sector Alpha', 94, 'STABLE'],
    ['Sector Bravo', 71, 'WATCH'],
    ['Sector Charlie', 88, 'STABLE'],
    ['Drone Belt 4', 56, 'BUSY'],
    ['Grid North', 97, 'STABLE'],
  ];
  function renderStatus() {
    const el = $('[data-status]');
    const empty = $('[data-status-empty]');
    if (!STATUS.length) { el.innerHTML = ''; empty.hidden = false; return; }
    empty.hidden = true;
    el.innerHTML = STATUS.map(([n, v, s]) =>
      `<li><span>${n}</span><span class="cw-mini"><i style="--w:${v}%"></i></span><b>${s}</b></li>`
    ).join('');
  }

  function renderHolo() {
    $('[data-holo]').innerHTML = `
      <i class="cw-holo-ring a" aria-hidden="true"></i>
      <i class="cw-holo-ring b" aria-hidden="true"></i>
      <i class="cw-holo-ring c" aria-hidden="true"></i>
      <img class="cw-holo-img" src="media/holo.webp" width="900" height="900" alt="Cyan holographic cube core (sample art)" decoding="async">`;
    $('[data-rays]').innerHTML = [
      ['Drone latency', '42 ms'],
      ['Orbital cargo', '1.2k t'],
      ['Grid power', '87%'],
      ['Sector lock', 'ON'],
    ].map(([k, v]) => `<span>${k}<b class="num">${v}</b></span>`).join('');
  }

  const KPIS = [
    { icon: 'cpu', label: 'Compute', value: '94.2%', sub: 'Cluster heat OK' },
    { icon: 'truck', label: 'Haulers', value: '128', sub: 'Active routes' },
    { icon: 'radar', label: 'Scan sweep', value: '3.8s', sub: 'Cycle time' },
    { icon: 'database', label: 'Buffer', value: '61%', sub: 'Hold capacity' },
  ];
  let kpiSel = 0;
  function renderKpis() {
    $('[data-kpis]').innerHTML = KPIS.map((k, i) =>
      `<button type="button" class="cw-kpi" data-kpi="${i}" aria-pressed="${i === kpiSel}">
        <span class="cw-kpi-ic">${svg(k.icon)}</span>
        <span class="num">${k.value}</span>
        <small>${k.label}</small>
        <small>${k.sub}</small>
      </button>`
    ).join('');
    $('[data-stability]').textContent = kpiSel === 0 ? '98.4%' : (96 - kpiSel) + '.' + (4 + kpiSel) + '%';
    $('[data-sector]').textContent = ['Sector Meridian', 'Hauler Ring', 'Scan Array', 'Hold Deck'][kpiSel];
  }

  function renderGauges() {
    const items = [
      { n: 'Power', pct: 0.82, c: '--chart-1' },
      { n: 'Cooling', pct: 0.67, c: '--chart-3' },
      { n: 'Link', pct: 0.91, c: '--chart-4' },
    ];
    $('[data-gauges]').innerHTML = items.map((g) =>
      `<div class="cw-gauge"><div class="cw-gwrap">${donut([
        { value: g.pct * 100, color: g.c },
        { value: (1 - g.pct) * 100, color: '--surface-2' },
      ], { size: 72, w: 8, gap: 0, round: true })}</div><b class="num">${Math.round(g.pct * 100)}%</b><span>${g.n}</span></div>`
    ).join('');
  }

  const CARGO = {
    in: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], a: [40, 55, 48, 70, 62, 80], b: [22, 30, 28, 35, 40, 38] },
    out: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], a: [30, 42, 50, 45, 58, 66], b: [18, 22, 25, 20, 28, 30] },
  };
  let cargoMode = 'in';
  function renderCargo() {
    const d = CARGO[cargoMode];
    barChart($('[data-cargo]'), {
      labels: d.labels,
      series: [
        { name: 'Primary', color: '--chart-1', values: d.a },
        { name: 'Relay', color: '--chart-2', values: d.b },
      ],
      h: 110, label: 'Orbital cargo by day', ticks: 3,
    });
  }

  function renderStrip() {
    const cards = [
      { k: 'Sector stability', v: '98.4%', d: '+0.3%', up: true, spark: [90, 92, 91, 94, 95, 97, 98] },
      { k: 'Drone latency', v: '42 ms', d: '−6%', up: true, spark: [60, 55, 58, 50, 48, 45, 42] },
      { k: 'Orbital cargo', v: '1,240 t', d: '+12%', up: true, spark: [40, 48, 45, 60, 70, 80, 90] },
      { k: 'Grid power', v: '87%', d: '−2%', up: false, spark: [88, 90, 89, 88, 87, 86, 87] },
    ];
    $('[data-strip]').innerHTML = cards.map((c) =>
      `<article class="cw-foot-card">
        <p class="cw-k">${c.k}</p>
        <p class="num">${c.v}</p>
        <div class="cw-sparkwrap">${spark(c.spark, { color: c.up ? '--chart-4' : '--chart-3', fill: 0.2 })}</div>
        <small class="${c.up ? 'cw-delta-up' : 'cw-delta-dn'}">${c.d} vs ${fmtDate(dayOffset(-1), { weekday: 'short' })}</small>
      </article>`
    ).join('');
  }

  seg($('[data-flow-tabs]'), (v) => { flowRange = v; renderFlow(); });
  seg($('[data-cargo-tabs]'), (v) => { cargoMode = v; renderCargo(); });
  $('[data-kpis]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-kpi]'); if (!b) return;
    kpiSel = +b.dataset.kpi; renderKpis(); $(`[data-kpi="${kpiSel}"]`).focus();
  });

  renderFlow(); renderStatus(); renderHolo(); renderKpis(); renderGauges(); renderCargo(); renderStrip();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function toast(msg) {
    const t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(() => { t.hidden = true; }, 2200);
  }

  const PAGES = [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'fleet', name: 'Fleet', pattern: 'List' },
    { id: 'shipments', name: 'Shipments', pattern: 'Board' },
    { id: 'settings', name: 'Settings', pattern: 'Settings' },
  ];
  const FLEET = [
    { id: 'H-12', route: 'Meridian → Dock 4', status: 'En route' },
    { id: 'H-19', route: 'Bravo → Bay C', status: 'Loading' },
    { id: 'H-03', route: 'Charlie → Relay', status: 'Idle' },
    { id: 'H-27', route: 'Alpha → Orbital', status: 'En route' },
  ];
  const SHIPS = [
    { id: 'SC-441', bay: 'A1', eta: '14:20', state: 'inbound' },
    { id: 'SC-512', bay: 'B3', eta: '15:05', state: 'outbound' },
    { id: 'SC-608', bay: 'C2', eta: '16:40', state: 'hold' },
  ];

  const main = $('[data-main]');
  const overview = $('[data-page-panel="overview"]');
  const foot = $('[data-strip]');
  let stub = null;
  function ensureStub() {
    if (stub) return stub;
    stub = document.createElement('div');
    stub.setAttribute('data-db-stub-host', '');
    stub.hidden = true;
    main.appendChild(stub);
    return stub;
  }
  function pageHtml(page) {
    if (page.id === 'fleet') {
      return `<section class="cw-page" aria-labelledby="p-h">
        <h1 id="p-h">Fleet</h1>
        <p class="cw-page-lead">Active haulers for Sector Meridian. Sample data · fictional.</p>
        <label class="cw-row">Search <input data-fleet-q type="search" placeholder="Filter haulers" style="min-height:44px;padding:0 12px;border:1px solid var(--border);background:var(--surface-2);color:var(--text)"></label>
        <div class="cw-page-grid" data-fleet-list></div>
      </section>`;
    }
    if (page.id === 'shipments') {
      return `<section class="cw-page" aria-labelledby="p-h">
        <h1 id="p-h">Shipments</h1>
        <p class="cw-page-lead">Bay board for the current shift.</p>
        <div class="cw-seg" role="group" aria-label="Shipment filter" data-ship-tabs>
          <button type="button" data-v="all" aria-pressed="true">All</button>
          <button type="button" data-v="inbound" aria-pressed="false">Inbound</button>
          <button type="button" data-v="outbound" aria-pressed="false">Outbound</button>
        </div>
        <div class="cw-page-grid" data-ship-board></div>
        <button type="button" class="cw-seg" data-ship-refresh style="border:1px solid var(--border);padding:0 16px;min-height:44px;color:var(--text);background:var(--accent-soft);font-family:var(--font-display);letter-spacing:.08em;text-transform:uppercase">Refresh board</button>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="cw-page" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="cw-page-lead">Shift alerts for Citadel Wall. Nothing is saved in this demo.</p>
        <form class="cw-card" data-settings onsubmit="return false">
          <label class="cw-row">Alert channel <input name="channel" value="#orbital-ops" style="min-height:44px;padding:0 12px;border:1px solid var(--border);background:var(--surface-2);color:var(--text)"></label>
          <label class="cw-row">Latency warn (ms) <input name="lat" type="number" value="80" min="10" style="min-height:44px;padding:0 12px;border:1px solid var(--border);background:var(--surface-2);color:var(--text);width:100px"></label>
          <p class="cw-error" data-form-err hidden style="color:var(--chart-3);margin-top:8px">Enter a channel and latency threshold.</p>
          <button type="submit" style="margin-top:12px;min-height:44px;padding:0 18px;border:1px solid var(--accent);background:var(--accent);color:var(--accent-fg);font-family:var(--font-display);letter-spacing:.08em;text-transform:uppercase">Save alerts</button>
        </form>
      </section>`;
    }
    return `<section class="cw-page"><h1>${page.name}</h1><p class="cw-page-lead">Sample data · fictional</p></section>`;
  }
  function wirePage(host, page) {
    if (page.id === 'fleet') {
      const list = host.querySelector('[data-fleet-list]');
      const paint = (q = '') => {
        const rows = FLEET.filter((f) => !q || (`${f.id} ${f.route} ${f.status}`).toLowerCase().includes(q));
        if (!rows.length) {
          list.innerHTML = `<div class="cw-empty"><p>No haulers match.</p></div>`;
          return;
        }
        list.innerHTML = rows.map((f) => `<article class="cw-card"><div class="cw-row"><strong>${f.id}</strong><span>${f.status}</span></div><p style="margin:0;color:var(--text-muted);font-size:13px">${f.route}</p></article>`).join('');
      };
      paint();
      host.querySelector('[data-fleet-q]')?.addEventListener('input', (e) => paint(e.target.value.trim().toLowerCase()));
    }
    if (page.id === 'shipments') {
      const board = host.querySelector('[data-ship-board]');
      const paint = (filter = 'all') => {
        const rows = SHIPS.filter((s) => filter === 'all' || s.state === filter);
        if (!rows.length) {
          board.innerHTML = `<div class="cw-empty"><p>No ${filter} shipments.</p></div>`;
          return;
        }
        board.innerHTML = rows.map((s) => `<article class="cw-card"><div class="cw-row"><strong>${s.id}</strong><span>${s.state}</span></div><div class="cw-row"><span>Bay ${s.bay}</span><span class="num">ETA ${s.eta}</span></div></article>`).join('');
      };
      paint('all');
      seg(host.querySelector('[data-ship-tabs]'), (v) => paint(v));
      host.querySelector('[data-ship-refresh]')?.addEventListener('click', () => {
        board.innerHTML = `<div class="cw-loading" role="status"><p>Syncing bay board…</p><div class="cw-skel"></div><div class="cw-skel"></div></div>`;
        setTimeout(() => {
          paint(host.querySelector('[aria-pressed="true"]')?.dataset.v || 'all');
          toast('Board refreshed (sample)');
        }, reduce ? 0 : 650);
      });
    }
    if (page.id === 'settings') {
      const form = host.querySelector('[data-settings]');
      form?.addEventListener('submit', () => {
        const err = host.querySelector('[data-form-err]');
        if (!form.channel.value.trim() || !form.lat.value) { err.hidden = false; return; }
        err.hidden = true;
        toast(`Alerts saved · ${form.channel.value.trim()}`);
      });
    }
  }

  window.DB.route(PAGES, (id, page) => {
    const isOverview = id === 'overview';
    overview.hidden = !isOverview;
    if (foot) foot.hidden = !isOverview;
    const host = ensureStub();
    host.hidden = isOverview;
    if (!isOverview) {
      host.innerHTML = pageHtml(page);
      wirePage(host, page);
    }
  });

  const holo = $('[data-holo]');
  if (holo && window.DB?.onVisible) {
    window.DB.onVisible(holo, (vis) => {
      holo.querySelectorAll('.cw-holo-img, .cw-holo-ring').forEach((el) => {
        el.style.animationPlayState = vis && !reduce ? 'running' : 'paused';
      });
    });
  }

  document.documentElement.dataset.ready = 'true';
})();
