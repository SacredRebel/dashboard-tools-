/* Glacier Ops: data-dense radial HUD with glacier topo dial and satellite charts.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.500V7a4 4 0 0 1 8 0v3.5"/>',
    unlock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.500V7a4 4 0 0 1 7.5-2"/>',
    radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12 18.5 5.5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `go-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="go-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="go-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="go-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="go-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="go-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="go-cursor" hidden></span><span class="go-tip num" hidden></span>
    </div>`;
    const tip = $('.go-tip', el), cur = $('.go-cursor', el), dots = $$('.go-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `go-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.go-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.go-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  // Bar chart built from HTML columns (each column is a focusable button). Grouped by default, stacked with o.stacked.
  // o: { labels, series: [{ name, color, values }], fmt, h, label, max, ticks, active, onPick, stacked }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="go-plot go-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="go-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="go-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="go-cols">${o.labels.map((l, i) => `<button class="go-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="go-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="go-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="go-tip num" hidden></span>
    </div>`;
    const tip = $('.go-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `go-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.go-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.go-cols', el).addEventListener('mouseleave', () => show(-1));
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
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `go-s${++sparkId}`;
    return `<svg class="go-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }
  let sparkId = 0;
  paintIcons();

  const SECTORS = {
    alpha: { name: 'Sector Alpha', elev: 1842, orbs: [25, 6, 140, -2], mix: [32, 24, 18, 16, 10], load: [42, 58, 36, 70, 48, 62, 55, 44], meters: [['North ridge', 78], ['Ice shelf', 64], ['Relay bay', 51], ['Supply cut', 39]], pulse: [20, 28, 22, 40, 35, 48, 30, 44, 38, 52, 41, 36], tiny: [12, 18, 9, 22, 15, 28, 20, 16, 24, 14], osc: [30, 42, 28, 50, 34, 46, 32, 48, 36, 44], series: [[40, 48, 42, 55, 50, 60, 52], [28, 32, 30, 38, 34, 42, 36], [18, 22, 20, 26, 24, 30, 28], [12, 14, 13, 16, 15, 18, 17]], ridge: [20, 34, 28, 46, 40, 58, 48, 62, 50], gauges: [67, 67], locks: [true, true, false, true, false, true, true, false, true, false, true, true] },
    bravo: { name: 'Sector Bravo', elev: 1620, orbs: [18, 9, 112, 1], mix: [28, 26, 20, 14, 12], load: [30, 48, 52, 40, 66, 58, 36, 50], meters: [['North ridge', 61], ['Ice shelf', 72], ['Relay bay', 48], ['Supply cut', 55]], pulse: [18, 24, 32, 28, 44, 36, 40, 30, 48, 34, 42, 38], tiny: [10, 14, 20, 12, 26, 18, 22, 16, 28, 19], osc: [24, 36, 40, 32, 48, 28, 44, 34, 50, 30], series: [[36, 40, 44, 42, 50, 48, 54], [22, 28, 26, 34, 30, 38, 32], [16, 18, 22, 20, 24, 26, 22], [10, 12, 14, 13, 16, 15, 18]], ridge: [16, 28, 36, 30, 48, 42, 56, 44, 58], gauges: [54, 71], locks: [true, false, true, true, true, false, true, true, false, true, false, true] },
    charlie: { name: 'Sector Charlie', elev: 2014, orbs: [31, 4, 168, -5], mix: [36, 20, 22, 12, 10], load: [55, 40, 62, 48, 70, 36, 58, 64], meters: [['North ridge', 88], ['Ice shelf', 45], ['Relay bay', 70], ['Supply cut', 33]], pulse: [26, 34, 30, 46, 38, 52, 44, 36, 50, 42, 48, 40], tiny: [16, 22, 14, 28, 20, 30, 18, 24, 12, 26], osc: [34, 28, 46, 38, 52, 40, 48, 36, 54, 42], series: [[48, 52, 46, 58, 54, 62, 56], [30, 34, 38, 32, 40, 36, 44], [20, 24, 22, 28, 26, 30, 25], [14, 16, 15, 18, 17, 20, 19]], ridge: [24, 38, 32, 50, 44, 60, 52, 66, 54], gauges: [72, 58], locks: [false, true, true, false, true, true, false, true, true, true, false, true] },
    delta: { name: 'Sector Delta', elev: 1490, orbs: [12, 11, 96, 0], mix: [22, 30, 18, 18, 12], load: [28, 36, 44, 52, 40, 60, 48, 34], meters: [['North ridge', 50], ['Ice shelf', 80], ['Relay bay', 42], ['Supply cut', 67]], pulse: [14, 22, 18, 30, 26, 36, 28, 40, 32, 38, 34, 24], tiny: [8, 16, 12, 20, 14, 24, 18, 10, 22, 15], osc: [20, 32, 26, 38, 30, 42, 28, 36, 24, 40], series: [[32, 36, 34, 40, 38, 44, 42], [20, 24, 22, 28, 26, 30, 27], [14, 16, 18, 15, 20, 17, 19], [8, 10, 9, 12, 11, 13, 12]], ridge: [12, 22, 30, 26, 40, 34, 48, 38, 52], gauges: [61, 63], locks: [true, true, true, false, false, true, true, true, false, false, true, true] },
  };
  const WINDOWS = {
    '6h': { n: 12, label: (i) => `${String(i).padStart(2, '0')}h`, k: 0.45 },
    '24h': { n: 24, label: (i) => (i % 4 === 0 ? `${String(i).padStart(2, '0')}h` : ''), k: 1 },
    '7d': { n: 7, label: (i) => fmtDate(dayOffset(i - 6), { weekday: 'short' }), k: 2.4 },
  };
  const MIX_NAMES = ['Radar', 'Seismic', 'Optical', 'Thermal', 'Relay'];
  const MIX_COLORS = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--panel'];
  const ORB_LABELS = ['Crew', 'Alerts', 'Nodes', 'Delta'];

  let sector = 'alpha';
  let windowKey = '24h';
  let rimFocus = 0;

  function wave(n, base, amp, phase) {
    return Array.from({ length: n }, (_, i) => Math.round(base + amp * Math.sin(i / 1.7 + phase) + amp * 0.35 * Math.sin(i / 0.8 + phase * 1.4)));
  }

  function renderOrbs() {
    const s = SECTORS[sector];
    $('[data-orbs]').innerHTML = s.orbs.map((v, i) =>
      `<li class="go-orb${v < 0 ? ' bad' : ''}"><b class="num">${v}</b><span>${ORB_LABELS[i]}</span></li>`
    ).join('');
  }

  function renderMix() {
    const s = SECTORS[sector];
    $('[data-mix-tag]').textContent = s.name;
    const parts = s.mix.map((v, i) => ({ value: v, color: MIX_COLORS[i] }));
    $('[data-mix]').innerHTML = `${donut(parts, { size: 96, w: 12, gap: 1.5, round: true })}
      <ul class="go-mixlist">${MIX_NAMES.map((n, i) => `<li><span><i style="background:var(${MIX_COLORS[i]})"></i>${n}</span><b class="num">${s.mix[i]}%</b></li>`).join('')}</ul>`;
  }

  function renderLoad() {
    const s = SECTORS[sector];
    barChart($('[data-load]'), {
      labels: s.load.map((_, i) => (i % 2 ? '' : String(i + 1))),
      series: [{ name: 'Load', color: '--chart-1', values: s.load }],
      fmt: (v) => v + '%',
      h: 72,
      noAxis: true,
      label: `Load bands for ${s.name}`,
    });
  }

  function renderMeters() {
    const s = SECTORS[sector];
    $('[data-meters]').innerHTML = s.meters.map(([n, v]) =>
      `<li><span>${n}<b class="num">${v}%</b></span><div class="go-metertrack"><i class="go-meterfill" style="width:${v}%"></i></div></li>`
    ).join('');
  }

  function renderPulse() {
    $('[data-pulse]').innerHTML = spark(SECTORS[sector].pulse, { color: '--chart-1', fill: 0.35, w: 160, h: 48 });
  }

  function renderTiny() {
    const s = SECTORS[sector];
    barChart($('[data-tiny]'), {
      labels: s.tiny.map(() => ''),
      series: [{ name: 'Short', color: '--chart-2', values: s.tiny }],
      h: 64,
      noAxis: true,
      label: `Short bars for ${s.name}`,
    });
  }

  function renderOsc() {
    $('[data-osc]').innerHTML = spark(SECTORS[sector].osc, { color: '--chart-2', fill: 0.2, w: 160, h: 44 });
  }

  function renderSeries() {
    const s = SECTORS[sector];
    const labels = s.series[0].map((_, i) => String(i + 1));
    lineChart($('[data-series]'), {
      labels,
      fmt: (v) => String(v),
      h: 80,
      ticks: 3,
      curve: true,
      series: s.series.map((values, i) => ({ name: `T${i + 1}`, color: `--chart-${(i % 4) + 1}`, values, fill: 0 })),
      label: `Multi-track telemetry for ${s.name}`,
    });
  }

  function renderRidge() {
    const s = SECTORS[sector];
    lineChart($('[data-ridge]'), {
      labels: s.ridge.map((_, i) => String(i + 1)),
      fmt: (v) => String(v),
      h: 72,
      ticks: 3,
      min: 0,
      series: [
        { name: 'A', color: '--chart-1', values: s.ridge, fill: 0.45 },
        { name: 'B', color: '--chart-2', values: s.ridge.map((v) => Math.round(v * 0.72)), fill: 0.35 },
        { name: 'C', color: '--chart-3', values: s.ridge.map((v) => Math.round(v * 0.48)), fill: 0.3 },
      ],
      label: `Ridge stack for ${s.name}`,
    });
  }

  function renderGauges() {
    const [a, b] = SECTORS[sector].gauges;
    $('[data-gauges]').innerHTML = [
      ['Core', a, '--chart-1'],
      ['Hull', b, '--chart-2'],
    ].map(([n, v, c]) =>
      `<div class="go-gauge"><div role="img" aria-label="${n} ${v}">${arcGauge(v, { size: 110, w: 8, from: -120, to: 120, color: c })}</div><b class="num">${v}</b><span>${n}</span></div>`
    ).join('');
  }

  function renderFinder() {
    $('[data-finder]').innerHTML = `<svg viewBox="0 0 320 200" aria-hidden="true">
      <rect width="320" height="200" style="fill:var(--topo-4)"/>
      <path d="M0 140 L60 110 120 130 180 90 240 120 320 80 L320 200 L0 200Z" style="fill:var(--topo-3)" opacity=".7"/>
      <path d="M0 160 L80 140 140 155 200 120 280 145 320 125 L320 200 L0 200Z" style="fill:var(--topo-2)" opacity=".35"/>
      <path d="M20 20 H60 M20 20 V60" fill="none" style="stroke:var(--alert)" stroke-width="2"/>
      <path d="M300 20 H260 M300 20 V60" fill="none" style="stroke:var(--alert)" stroke-width="2"/>
      <path d="M20 180 H60 M20 180 V140" fill="none" style="stroke:var(--alert)" stroke-width="2"/>
      <path d="M300 180 H260 M300 180 V140" fill="none" style="stroke:var(--alert)" stroke-width="2"/>
      <line x1="160" y1="70" x2="160" y2="130" style="stroke:var(--alert)" stroke-width="1.5"/>
      <line x1="130" y1="100" x2="190" y2="100" style="stroke:var(--alert)" stroke-width="1.5"/>
      <circle cx="160" cy="100" r="18" fill="none" style="stroke:var(--accent)" stroke-width="1" opacity=".6"/>
    </svg>`;
    $('[data-vf-tag]').textContent = SECTORS[sector].orbs[3] < 0 ? 'Alert' : 'Armed';
  }

  function lockMark(locked) {
    return locked
      ? `<path d="M-4 0 h8 v7 h-8z M-2 0 v-2 a2 2 0 0 1 4 0 v2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`
      : `<path d="M-4 0 h8 v7 h-8z M-2 0 v-2 a2 2 0 0 1 3.5 -1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`;
  }

  function renderDialArt() {
    const s = SECTORS[sector];
    const cx = 200, cy = 200;
    const ticks = Array.from({ length: 72 }, (_, i) => {
      const a = (i / 72) * Math.PI * 2 - Math.PI / 2;
      const big = i % 6 === 0;
      const r0 = big ? 168 : 174, r1 = 182;
      return `<line x1="${(cx + Math.cos(a) * r0).toFixed(1)}" y1="${(cy + Math.sin(a) * r0).toFixed(1)}" x2="${(cx + Math.cos(a) * r1).toFixed(1)}" y2="${(cy + Math.sin(a) * r1).toFixed(1)}" style="stroke:var(--accent)" stroke-width="${big ? 2 : 1}" opacity="${big ? 0.85 : 0.3}"/>`;
    }).join('');
    const segs = Array.from({ length: 12 }, (_, i) => {
      const a0 = (i / 12) * Math.PI * 2 - Math.PI / 2 + 0.05;
      const a1 = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2 - 0.05;
      const r = 148;
      const x0 = (cx + Math.cos(a0) * r).toFixed(1), y0 = (cy + Math.sin(a0) * r).toFixed(1);
      const x1 = (cx + Math.cos(a1) * r).toFixed(1), y1 = (cy + Math.sin(a1) * r).toFixed(1);
      const mid = (a0 + a1) / 2;
      const ix = (cx + Math.cos(mid) * 148).toFixed(1), iy = (cy + Math.sin(mid) * 148).toFixed(1);
      const locked = s.locks[i];
      const on = i === rimFocus;
      return `<path d="M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}" fill="none" style="stroke:${on ? 'var(--accent)' : 'var(--panel)'}" stroke-width="20" stroke-linecap="butt" opacity="${on ? 1 : 0.9}"/>
        <g transform="translate(${ix} ${iy})" style="color:${locked ? 'var(--accent)' : 'var(--text-muted)'}">${lockMark(locked)}</g>`;
    }).join('');

    const dialHost = $('[data-dial]');
    dialHost.innerHTML = `<svg viewBox="0 0 400 400" role="img" aria-label="Glacier core dial for ${s.name}, elevation ${s.elev} meters">
      <defs>
        <radialGradient id="go-core" cx="50%" cy="42%" r="55%">
          <stop offset="0" style="stop-color:var(--topo-1)"/>
          <stop offset="0.45" style="stop-color:var(--topo-2)"/>
          <stop offset="1" style="stop-color:var(--topo-4)"/>
        </radialGradient>
        <linearGradient id="go-ridge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:var(--topo-1)" stop-opacity=".9"/>
          <stop offset="1" style="stop-color:var(--topo-3)"/>
        </linearGradient>
        <clipPath id="go-clip"><circle cx="200" cy="200" r="108"/></clipPath>
      </defs>
      <circle cx="200" cy="200" r="188" fill="none" style="stroke:var(--accent)" stroke-width="2" opacity=".55"/>
      ${ticks}
      <circle cx="200" cy="200" r="160" fill="none" style="stroke:var(--border)" stroke-width="1"/>
      ${segs}
      <circle cx="200" cy="200" r="118" style="fill:var(--topo-4)" stroke="var(--accent)" stroke-width="2" opacity="0.95"/>
      <g clip-path="url(#go-clip)">
        <circle cx="200" cy="200" r="108" fill="url(#go-core)"/>
        <path d="M92 230 L130 170 160 200 190 130 220 175 250 120 280 165 310 145 310 310 92 310Z" fill="url(#go-ridge)" opacity=".85"/>
        <path d="M110 250 L150 210 180 235 210 180 245 220 275 190 300 215 300 310 110 310Z" style="fill:var(--topo-3)" opacity=".7"/>
        <path d="M140 195 L160 170 175 188 190 150 205 172" fill="none" style="stroke:var(--topo-1)" stroke-width="1.5" opacity=".7"/>
        <path d="M210 160 L230 140 248 158 265 135" fill="none" style="stroke:var(--topo-1)" stroke-width="1.2" opacity=".55"/>
        <ellipse cx="200" cy="255" rx="70" ry="14" style="fill:var(--accent)" opacity=".12"/>
      </g>
      <circle cx="200" cy="200" r="108" fill="none" style="stroke:var(--accent)" stroke-width="1.5" opacity=".5"/>
          </svg>`;
    let chip = dialHost.parentElement.querySelector('.go-elevchip');
    if (!chip) { chip = document.createElement('div'); chip.className = 'go-elevchip'; dialHost.parentElement.appendChild(chip); }
    chip.innerHTML = `<strong class="num">${s.elev}</strong><span>m ASL</span>`;
    $('[data-dialnote]').textContent = `${s.name} · rim ${rimFocus + 1}/12 ${s.locks[rimFocus] ? 'locked' : 'open'} · ${fmtDate(dayOffset(0), { weekday: 'short', month: 'short', day: 'numeric' })}`;
    $('[data-rim]').innerHTML = s.locks.map((locked, i) =>
      `<button type="button" data-rim-i="${i}" aria-pressed="${i === rimFocus}">${svg(locked ? 'lock' : 'unlock')}${i + 1}</button>`
    ).join('');
  }

  function renderBottom() {
    const s = SECTORS[sector];
    const w = WINDOWS[windowKey];
    const vals = wave(w.n, 40 + s.elev / 100, 18, SECTORS[sector].orbs[0] / 10).map((v) => Math.round(v * w.k));
    lineChart($('[data-bottom]'), {
      labels: Array.from({ length: w.n }, (_, i) => w.label(i)),
      fmt: (v) => v + ' cm',
      h: 120,
      ticks: 4,
      min: 0,
      series: [{ name: 'Delta', color: '--chart-1', values: vals, fill: 0.5 }],
      label: `Elevation delta over ${windowKey} for ${s.name}`,
    });
    $('[data-botnote]').textContent = `Peak ${Math.max(...vals)} cm · mean ${Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)} cm`;
  }

  function renderAll() {
    renderOrbs();
    renderMix();
    renderLoad();
    renderMeters();
    renderPulse();
    renderTiny();
    renderOsc();
    renderSeries();
    renderRidge();
    renderGauges();
    renderFinder();
    renderDialArt();
    renderBottom();
  }

  seg($('[data-sectors]'), (v) => { sector = v; rimFocus = 0; renderAll(); });
  seg($('[data-window]'), (v) => { windowKey = v; renderBottom(); });
  $('[data-rim]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-rim-i]'); if (!b) return;
    rimFocus = +b.dataset.rimI;
    renderDialArt();
    b.focus();
  });

  renderAll();
/* === DB multipage polish (auto-upgraded) === */
  (function wirePages() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"reports","name":"Reports","pattern":"Report"},{"id":"segments","name":"Segments","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
    const root = document.querySelector('[data-db-app]') || document.body;
    let toastEl = document.querySelector('[data-toast]');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'dbp-toast';
      toastEl.setAttribute('data-toast', '');
      toastEl.hidden = true;
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    function toast(msg) {
      toastEl.textContent = msg; toastEl.hidden = false;
      clearTimeout(toast._id); toast._id = setTimeout(() => { toastEl.hidden = true; }, 2200);
    }
    const main = document.querySelector('main') || document.body;
    let stub = document.querySelector('[data-db-stub]');
    if (!stub) {
      stub = document.createElement('section');
      stub.setAttribute('data-db-stub', '');
      stub.hidden = true;
      stub.setAttribute('aria-live', 'polite');
      main.appendChild(stub);
    }
    function setOverviewVisible(on) {
      [...main.children].forEach((ch) => {
        if (ch === stub) return;
        if (on) { ch.hidden = false; ch.removeAttribute('data-db-overview-hide'); }
        else { ch.hidden = true; ch.setAttribute('data-db-overview-hide', ''); }
      });
      stub.hidden = on;
    }
    function pageHtml(page) {

    if (page.id === 'reports') {
      return `<section class="dbp-page" data-db-page="reports" aria-labelledby="p-h">
        <h1 id="p-h">Reports</h1>
        <p class="dbp-lead">Sample data · fictional.</p>
        <div class="dbp-seg" role="group" aria-label="Reports state" data-dbp-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-dbp-body></div>
      </section>`;
    }
    if (page.id === 'segments') {
      return `<section class="dbp-page" data-db-page="segments" aria-labelledby="p-h">
        <h1 id="p-h">Segments</h1>
        <p class="dbp-lead">Sample data · fictional.</p>
        <div class="dbp-grid"><article class="dbp-card"><div class="dbp-row"><strong>Critical</strong><span class="dbp-chip">2</span></div></article><article class="dbp-card"><div class="dbp-row"><strong>Warn</strong><span class="dbp-chip">5</span></div></article><article class="dbp-card"><div class="dbp-row"><strong>Info</strong><span class="dbp-chip">11</span></div></article></div>
        <button type="button" class="dbp-btn" data-dbp-action>Open segments</button>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="dbp-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="dbp-lead">Sample data · fictional.</p>
        <div class="dbp-grid"><article class="dbp-card"><div class="dbp-row"><strong>Units</strong><span class="dbp-chip">Celsius</span></div></article><article class="dbp-card"><div class="dbp-row"><strong>Eco mode</strong><span class="dbp-chip">On</span></div></article><article class="dbp-card"><div class="dbp-row"><strong>Alerts</strong><span class="dbp-chip">Push</span></div></article></div>
        <button type="button" class="dbp-btn" data-dbp-action>Open settings</button>
      </section>`;
    }
      return `<section class="dbp-page"><h1>${page.name}</h1></section>`;
    }
    function wirePage(page) {
      if (page.id === 'reports') {
        const body = stub.querySelector('[data-dbp-body]');
        const paint = (state = 'ready') => {
          if (state === 'loading') {
            body.innerHTML = `<div class="dbp-state"><p>Loading…</p><div class="dbp-skel"></div><div class="dbp-skel"></div></div>`;
            return;
          }
          if (state === 'empty') {
            body.innerHTML = `<div class="dbp-state"><p>Nothing here yet.</p></div>`;
            return;
          }
          if (state === 'error') {
            body.innerHTML = `<div class="dbp-state"><p>Could not load.</p><button type="button" class="dbp-btn" data-retry>Retry</button></div>`;
            stub.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
            return;
          }
          body.innerHTML = `<div class="dbp-grid"><article class="dbp-card"><div class="dbp-row"><strong>Incidents</strong><span class="dbp-chip">4</span></div></article><article class="dbp-card"><div class="dbp-row"><strong>MTTR</strong><span class="dbp-chip">18m</span></div></article><article class="dbp-card"><div class="dbp-row"><strong>Open</strong><span class="dbp-chip">1</span></div></article></div>`;
        };
        paint('ready');
        const tabs = stub.querySelector('[data-dbp-tabs]');
        tabs?.addEventListener('click', (e) => {
          const b = e.target.closest('button[data-v]'); if (!b) return;
          tabs.querySelectorAll('button[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          paint(b.dataset.v);
        });
      }
      stub.querySelector('[data-dbp-action]')?.addEventListener('click', () => toast(page.name + ' · sample'));
      stub.querySelector('[data-save-settings], [data-dbp-action]')?.addEventListener('click', () => {});
    }
    document.querySelectorAll('a[href]').forEach((a) => {
      const label = (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!label) return;
      const hit = PAGES.find((p) => p.name.toLowerCase() === label || p.id === label
        || (label === 'home' && p.id === 'overview')
        || (label === 'dashboard' && p.id === 'overview'));
      if (hit) a.setAttribute('href', '#/' + hit.id);
    });
    // map common rail buttons if present
    document.querySelectorAll('[data-rail] button[data-v]').forEach((b) => {
      const map = { home: 'overview', climate: 'rooms', fan: 'devices', eco: 'energy', settings: 'settings' };
      const id = map[b.dataset.v] || b.dataset.v;
      if (PAGES.some((p) => p.id === id)) {
        b.addEventListener('click', () => { location.hash = '#/' + id; });
      }
    });
    if (window.DB?.onVisible) {
      window.DB.onVisible(root, (visible) => {
        document.documentElement.dataset.motionPaused = visible ? '' : '1';
      });
    }
    if (!window.DB || typeof window.DB.route !== 'function') {
      console.error('DB.route missing — is ../_shared/frame.js loaded before app.js?');
      return;
    }
    const seen = new Set();
    window.DB.route(PAGES, (id, page) => {
      if (id === PAGES[0].id) {
        setOverviewVisible(true);
        if (!seen.has('overview')) {
          seen.add('overview');
          document.querySelectorAll('.go-reveal, .dbp-reveal').forEach((el, i) => {
            el.style.setProperty('--reveal-delay', (reduce ? 0 : 40 * i) + 'ms');
            el.classList.add('go-reveal-in', 'dbp-reveal-in');
          });
        }
      } else {
        setOverviewVisible(false);
        stub.innerHTML = pageHtml(page);
        wirePage(page);
      }
      seen.add(id);
    });
  })();
/* === /DB multipage polish === */
  document.documentElement.dataset.ready = 'true';
})();
