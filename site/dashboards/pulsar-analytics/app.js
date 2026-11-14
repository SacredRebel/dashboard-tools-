/* Pulsar Analytics: sample data, dial, wave chart and interactions.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    dollar: '<path d="M12 2v20M17 6.500C17 4.6 14.8 3.5 12 3.500S7 4.8 7 7s2 3.2 5 4 5 1.8 5 4.2-2.2 3.3-5 3.3-5-1.1-5-3"/>',
  };
  const svg = (n, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n] || ''}</svg>`;
  const paintIcons = (root = document) => $$('[data-icon]', root).forEach((el) => { el.innerHTML = svg(el.dataset.icon); });
  const fmtNum = (v) => v.toLocaleString('en-US');
  const dayOffset = (n) => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate() + n); };
  const fmtDate = (d, o = { month: 'short', day: 'numeric' }) => d.toLocaleDateString('en-US', o);
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
  const niceStep = (raw) => { const p = 10 ** Math.floor(Math.log10(raw || 1)); const f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
  function scale(vals, o) {
    let min = o.min ?? Math.min(...vals), max = o.max ?? Math.max(...vals);
    const step = o.step || niceStep((max - min || 1) / (o.ticks || 4));
    min = Math.floor(min / step) * step; max = Math.ceil(max / step) * step; if (max === min) max = min + step;
    const ticks = []; for (let v = min; v <= max + step / 1e6; v += step) ticks.push(+v.toFixed(6));
    return { min, max, ticks };
  }
  let chartId = 0;
  // Line / area chart: SVG draws the shape, HTML labels sit over it (so text never scales), hover and focus show values.
  // o: { labels, series: [{ name, color: '--chart-1', values, fill, dash }], fmt, h, label, curve, dots, min, max, ticks, step }
  function lineChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length, W = 600, H = 200;
    const { min, max, ticks } = scale(o.series.flatMap((s) => s.values), o);
    const x = (i) => (n > 1 ? (i / (n - 1)) * W : W / 2), y = (v) => H - ((v - min) / (max - min)) * H;
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `pa-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="pa-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="pa-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="pa-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="pa-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="pa-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="pa-cursor" hidden></span><span class="pa-tip num" hidden></span>
    </div>`;
    const tip = $('.pa-tip', el), cur = $('.pa-cursor', el), dots = $$('.pa-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `pa-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.pa-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.pa-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  // Bar chart built from HTML columns (each column is a focusable button). Grouped by default, stacked with o.stacked.
  // o: { labels, series: [{ name, color, values }], fmt, h, label, max, ticks, active, onPick, stacked }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="pa-plot pa-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="pa-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="pa-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="pa-cols">${o.labels.map((l, i) => `<button class="pa-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="pa-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="pa-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="pa-tip num" hidden></span>
    </div>`;
    const tip = $('.pa-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `pa-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.pa-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.pa-cols', el).addEventListener('mouseleave', () => show(-1));
  }
  // Donut from stroked circles. parts: [{ value, color: '--chart-1' }] (values in any unit). Returns an SVG string.
  function donut(parts, { size = 120, w = 14, gap = 1.5, round = false } = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0), r = (size - w) / 2, c = size / 2; let off = 0;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}"/>${parts.map((p) => {
      const len = (p.value / total) * 100, seg = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}" pathLength="100" stroke-dasharray="${Math.max(0.01, len - gap).toFixed(2)} ${(100 - len + gap).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})" style="stroke:var(${p.color})"${round ? ' stroke-linecap="round"' : ''}/>`;
      off += len; return seg;
    }).join('')}</svg>`;
  }
  // Tiny trend line. Returns an SVG string; stretches to its box.
  function spark(vals, { color = '--chart-1', fill = 0.25, w = 120, h = 36 } = {}) {
    const mn = Math.min(...vals), mx = Math.max(...vals), pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 6)]);
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `pa-s${++sparkId}`;
    return `<svg class="pa-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }
  let sparkId = 0;
  paintIcons();

  // ---------------------------------------------------------------- sample data (seeded, so every load looks the same)
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const wave = (n, base, amp, phase) => Array.from({ length: n }, (_, i) => Math.round(base + amp * Math.sin(i / 1.9 + phase) + amp * 0.45 * Math.sin(i / 0.9 + phase * 2) + amp * 0.2 * rnd()));
  const RANGES = { '24h': { n: 12, label: (i) => `${String(i * 2).padStart(2, '0')}:00`, k: 0.16, word: 'the last 24 hours' }, '7d': { n: 7, label: (i) => fmtDate(dayOffset(i - 6), { weekday: 'short' }), k: 1, word: 'the last 7 days' }, '30d': { n: 10, label: (i) => fmtDate(dayOffset((i - 9) * 3)), k: 4.2, word: 'the last 30 days' } };
  const METRICS = [
    { id: 'users', name: 'Active users', icon: 'users', color: '--chart-1', base: 18400, amp: 5200, fmt: (v) => (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(v)), delta: 12.4 },
    { id: 'sessions', name: 'Sessions', icon: 'activity', color: '--chart-2', base: 31200, amp: 8800, fmt: (v) => (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(v)), delta: 8.1 },
    { id: 'conv', name: 'Conversion', icon: 'target', color: '--chart-3', base: 3.6, amp: 0.9, fmt: (v) => v.toFixed(1) + '%', delta: -0.6, pct: true },
    { id: 'rev', name: 'Revenue', icon: 'dollar', color: '--chart-4', base: 42800, amp: 11500, fmt: (v) => '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v), delta: 5.7 },
  ];
  const data = {};
  for (const r in RANGES) { data[r] = {}; METRICS.forEach((m, k) => { const mk = (ph) => wave(RANGES[r].n, m.base, m.amp, ph + k).map((v) => (m.pct ? +(m.base + (v - m.base) / 1).toFixed(1) : Math.round(v * (m.id === 'users' ? 1 : RANGES[r].k)))); data[r][m.id] = { now: m.pct ? wave(RANGES[r].n, 36, 9, k).map((v) => v / 10) : mk(0.4), prev: m.pct ? wave(RANGES[r].n, 34, 8, k + 2).map((v) => v / 10) : mk(2.2).map((v) => Math.round(v * 0.86)) }; }); }
  const CHANNELS = [['Search', 38, 14200], ['Direct', 24, 8900], ['Social', 16, 6100], ['Email', 12, 4400], ['Referral', 7, 2700], ['Paid', 3, 1150]];
  const EVENTS = [['checkout.completed', 18420], ['plan.upgraded', 12880], ['invite.sent', 9610], ['report.exported', 6240], ['search.performed', 4975]];
  const REGIONS = [['NA', 41], ['EU', 29], ['APAC', 18], ['LATAM', 8], ['MEA', 4]];
  const HEALTH = [['Availability', 96, '--chart-2'], ['Latency', 84, '--chart-1'], ['Error rate', 78, '--chart-3'], ['Saturation', 71, '--chart-4']];
  let range = '7d', metric = 'users', channel = 0;

  // ---------------------------------------------------------------- renderers
  function renderDial() {
    const up = 99.982, a = -130 + 260 * 0.86; // needle angle
    const ticks = Array.from({ length: 53 }, (_, i) => { const d = (-130 + i * 5) * Math.PI / 180, big = i % 4 === 0, r0 = big ? 72 : 76, x = Math.sin(d), y = -Math.cos(d); return `<line class="tick" x1="${100 + x * r0}" y1="${100 + y * r0}" x2="${100 + x * 82}" y2="${100 + y * 82}" stroke-width="${big ? 2 : 1}" opacity="${big ? 0.9 : 0.5}"/>`; }).join('');
    const pt = (deg, r) => [100 + r * Math.sin(deg * Math.PI / 180), 100 - r * Math.cos(deg * Math.PI / 180)];
    const [sx, sy] = pt(-130, 90), [ex, ey] = pt(a, 90), [nx, ny] = pt(a, 62);
    $('[data-dial]').innerHTML = `<svg viewBox="0 0 200 200" role="img" aria-label="Uptime ${up}% over 90 days">
        <defs><linearGradient id="pa-sweep" x1="0" y1="1" x2="1" y2="0"><stop offset="0" style="stop-color:var(--chart-1)"/><stop offset="1" style="stop-color:var(--chart-2)"/></linearGradient></defs>
        ${ticks}<path d="M${sx},${sy} A90,90 0 1 1 ${ex},${ey}" fill="none" stroke="url(#pa-sweep)" stroke-width="5" stroke-linecap="round"/>
        <line class="needle" x1="100" y1="100" x2="${nx}" y2="${ny}" stroke-width="2.5" stroke-linecap="round"/><circle class="hub" cx="100" cy="100" r="6"/>
      </svg><div class="pa-dial-read"><b class="num">${up}%</b><span>90-day uptime</span></div>`;
    $('[data-kv]').innerHTML = [['p95 latency', '182 ms'], ['Error rate', '0.04%'], ['Deploys today', '6'], ['Open incidents', '0']].map(([k, v]) => `<div><dt>${k}</dt><dd class="num">${v}</dd></div>`).join('');
  }
  function renderHealth() {
    const score = Math.round(HEALTH.reduce((a, h) => a + h[1], 0) / HEALTH.length);
    $('[data-health]').innerHTML = `<div class="pa-health-ring" role="img" aria-label="Health score ${score} out of 100">${donut(HEALTH.map(([, v, c]) => ({ value: v, color: c })), { size: 124, w: 13, gap: 3, round: true })}<b class="num">${score}</b></div>
      <ul>${HEALTH.map(([n, v, c]) => `<li><i style="background:var(${c})"></i>${n}<b class="num">${v}</b></li>`).join('')}</ul>`;
  }
  function renderOrbs() {
    $('[data-orbs]').innerHTML = METRICS.map((m) => { const d = data[range][m.id].now, v = m.pct ? d[d.length - 1] : d.reduce((a, b) => a + b, 0) / (m.id === 'users' ? d.length : 1);
      return `<button class="pa-orb" style="--orb:var(${m.color})" data-metric="${m.id}" aria-pressed="${m.id === metric}"><span class="pa-orb-ball">${svg(m.icon, 2)}</span><span><b class="num">${m.fmt(Math.round(v * 10) / 10)}<em class="pa-delta${m.delta < 0 ? ' down' : ''}">${m.delta > 0 ? '+' : ''}${m.delta}%</em></b><span>${m.name}</span></span></button>`; }).join('');
  }
  function renderHero() {
    const m = METRICS.find((x) => x.id === metric), r = RANGES[range], d = data[range][metric];
    $('[data-hero-title]').textContent = m.name;
    $('[data-hero-sub]').textContent = `Compared with the period before, across ${r.word}`;
    lineChart($('[data-hero]'), { labels: Array.from({ length: r.n }, (_, i) => r.label(i)), fmt: m.fmt, h: 300, dots: true, ticks: 5,
      series: [{ name: 'This period', color: '--chart-2', values: d.now, fill: 0.5 }, { name: 'Previous', color: '--chart-1', values: d.prev, fill: 0.55 }],
      label: `${m.name} over ${r.word}: this period against the previous one` });
  }
  function renderMinis() {
    const minis = [['Avg. session', '4m 12s', '--chart-2', wave(14, 40, 9, 1)], ['Bounce rate', '31.8%', '--chart-4', wave(14, 30, 6, 3)], ['New signups', fmtNum(Math.round(1284 * RANGES[range].k)), '--chart-1', wave(14, 50, 14, 5)]];
    $('[data-minis]').innerHTML = minis.map(([n, v, c, s]) => `<section class="pa-card pa-mini" aria-label="${n}: ${v}"><p>${n}</p><b class="num">${v}</b><div class="pa-mini-spark">${spark(s, { color: c, fill: 0.4 })}</div></section>`).join('');
  }
  function renderPillars() {
    const max = CHANNELS[0][1];
    $('[data-pillars]').innerHTML = CHANNELS.map(([n, p], i) => `<button class="pa-pillar" data-ch="${i}" aria-pressed="${i === channel}" aria-label="${n}: ${p}% of sessions"><b class="num">${p}%</b><span class="pa-pillar-track"><span class="pa-pillar-fill" style="height:${(p / max) * 100}%"></span></span><span>${n}</span></button>`).join('')
      ;
    const [n, p, s] = CHANNELS[channel];
    let note = $('.pa-pillar-note'); if (!note) { note = document.createElement('p'); note.className = 'pa-pillar-note'; note.setAttribute('aria-live', 'polite'); $('[data-pillars]').after(note); }
    note.innerHTML = `<b>${n}</b> brought <b class="num">${fmtNum(Math.round(s * RANGES[range].k))}</b> sessions, ${p}% of the total.`;
  }
  function renderSide() {
    const k = RANGES[range].k, max = EVENTS[0][1];
    $('[data-events]').innerHTML = EVENTS.map(([n, v]) => `<li><code>${n}</code><span class="num">${fmtNum(Math.round(v * k))}</span><i style="--w:${(v / max) * 100}%"></i></li>`).join('');
    barChart($('[data-regions]'), { labels: REGIONS.map((r) => r[0]), series: [{ name: 'Share', color: '--chart-1', values: REGIONS.map((r) => r[1]) }], fmt: (v) => v + '%', h: 110, noAxis: true, label: 'Share of sessions by region' });
    $$('[data-regions] .pa-bar').forEach((b, i) => b.style.setProperty('--bar', `var(--chart-${(i % 4) + 1})`));
    const hrs = wave(12, 60, 26, 2);
    barChart($('[data-hours]'), { labels: hrs.map((_, i) => (i % 3 === 0 ? `${String(i * 2).padStart(2, '0')}h` : '')), series: [{ name: 'Sessions', color: '--chart-2', values: hrs.map((v) => Math.round(v * 14 * k)) }], h: 90, noAxis: true, label: 'Sessions for each two-hour block of the day' });
  }
  const renderAll = () => { renderOrbs(); renderHero(); renderMinis(); renderPillars(); renderSide(); };

  // ---------------------------------------------------------------- events
  seg($('[data-range]'), (v) => { range = v; renderAll(); });
  $('[data-orbs]').addEventListener('click', (e) => { const b = e.target.closest('[data-metric]'); if (!b) return; metric = b.dataset.metric; renderOrbs(); renderHero(); $(`[data-metric="${metric}"]`).focus(); });
  $('[data-pillars]').addEventListener('click', (e) => { const b = e.target.closest('[data-ch]'); if (!b) return; channel = +b.dataset.ch; renderPillars(); $(`[data-ch="${channel}"]`).focus(); });
  renderDial(); renderHealth(); renderAll();
/* === DB multipage bootstrap (generated; polish pass replaces stubs) === */
  (function wirePages() {
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"reports","name":"Reports","pattern":"Report"},{"id":"segments","name":"Segments","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
        if (on) {
          ch.hidden = false;
          ch.removeAttribute('data-db-overview-hide');
        } else {
          ch.hidden = true;
          ch.setAttribute('data-db-overview-hide', '');
        }
      });
      stub.hidden = on;
    }
    function renderStub(page) {
      const rows = [
        ['Status', 'Sample · ready'],
        ['Records', '24'],
        ['Updated', 'Today'],
      ];
      stub.innerHTML = '<h1>' + page.name + '</h1>'
        + '<p class="db-sample">Sample data · fictional</p>'
        + '<p>This page is part of the multi-page shell. The polish pass fills it with real ' + page.name.toLowerCase() + ' UI in the same design language as Overview.</p>'
        + '<div class="db-stub-panel" role="list">'
        + rows.map(([k, v]) => '<div class="db-stub-row" role="listitem"><span>' + k + '</span><strong class="num">' + v + '</strong></div>').join('')
        + '</div>';
    }
    document.querySelectorAll('a[href]').forEach((a) => {
      const label = (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!label) return;
      const hit = PAGES.find((p) => p.name.toLowerCase() === label || p.id === label
        || (label === 'home' && p.id === 'overview')
        || (label === 'dashboard' && p.id === 'overview'));
      if (hit) a.setAttribute('href', '#/' + hit.id);
    });
    if (!window.DB || typeof window.DB.route !== 'function') {
      console.error('DB.route missing — is ../_shared/frame.js loaded before app.js?');
      return;
    }
    window.DB.route(PAGES, (id, page) => {
      if (id === PAGES[0].id) setOverviewVisible(true);
      else { setOverviewVisible(false); renderStub(page); }
    });
  })();
/* === /DB multipage bootstrap === */
  document.documentElement.dataset.ready = 'true'; // contract: tells dashboards-check.mjs the script ran to the end
})();
