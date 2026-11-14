/* Pulsar Analytics: sample data, terrain viz, multipage + motion.
   All data is fictional. No polling timers. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = $('[data-db-app]') || document.body;
  const ICON = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    dollar: '<path d="M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.8 7 7s2 3.2 5 4 5 1.8 5 4.2-2.2 3.3-5 3.3-5-1.1-5-3"/>',
  };
  const svg = (n, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n] || ''}</svg>`;
  const paintIcons = (host = document) => $$('[data-icon]', host).forEach((el) => { el.innerHTML = svg(el.dataset.icon); });
  const fmtNum = (v) => v.toLocaleString('en-US');
  const dayOffset = (n) => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate() + n); };
  const fmtDate = (d, o = { month: 'short', day: 'numeric' }) => d.toLocaleDateString('en-US', o);

  function seg(group, onChange) {
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      $$('button[data-v]', group).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onChange(b.dataset.v, b);
    });
  }
  function smooth(pts) {
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
  let sparkId = 0;

  function lineChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length, W = 600, H = 200;
    const { min, max, ticks } = scale(o.series.flatMap((s) => s.values), o);
    const x = (i) => (n > 1 ? (i / (n - 1)) * W : W / 2), y = (v) => H - ((v - min) / (max - min)) * H;
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `pa-g${++chartId}`;
    const sets = o.series.map((s) => {
      const pts = s.values.map((v, i) => [x(i), y(v)]);
      return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) };
    });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="pa-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="pa-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path class="pa-layer" d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line pa-draw" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="pa-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="pa-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="pa-hit">${o.labels.map((l, i) => `<button type="button" aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="pa-cursor" hidden></span><span class="pa-tip num" hidden></span>
    </div>`;
    const tip = $('.pa-tip', el), cur = $('.pa-cursor', el), dots = $$('.pa-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `pa-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%';
      tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.pa-hit button', el).forEach((b, i) => {
      b.addEventListener('mouseenter', () => show(i));
      b.addEventListener('focus', () => show(i));
      b.addEventListener('blur', () => show(-1));
      if (o.onPick) b.addEventListener('click', () => o.onPick(i));
    });
    $('.pa-hit', el).addEventListener('mouseleave', () => show(-1));
    return { sets, W, H, x, y, min, max };
  }

  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="pa-plot pa-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="pa-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="pa-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="pa-cols">${o.labels.map((l, i) => `<button type="button" class="pa-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="pa-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="pa-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="pa-tip num" hidden></span>
    </div>`;
    const tip = $('.pa-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `pa-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%';
      tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.pa-col', el).forEach((b, i) => {
      b.addEventListener('mouseenter', () => show(i));
      b.addEventListener('focus', () => show(i));
      b.addEventListener('blur', () => show(-1));
      if (o.onPick) b.addEventListener('click', () => o.onPick(i));
    });
    $('.pa-cols', el).addEventListener('mouseleave', () => show(-1));
  }

  function donut(parts, { size = 120, w = 14, gap = 1.5, round = false } = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0), r = (size - w) / 2, c = size / 2; let off = 0;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}"/>${parts.map((p) => {
      const len = (p.value / total) * 100;
      const seg = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}" pathLength="100" stroke-dasharray="${Math.max(0.01, len - gap).toFixed(2)} ${(100 - len + gap).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})" style="stroke:var(${p.color})"${round ? ' stroke-linecap="round"' : ''}/>`;
      off += len; return seg;
    }).join('')}</svg>`;
  }

  function spark(vals, { color = '--chart-1', fill = 0.25, w = 120, h = 36 } = {}) {
    const mn = Math.min(...vals), mx = Math.max(...vals);
    const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 6)]);
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `pa-s${++sparkId}`;
    return `<svg class="pa-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }

  function countUp(el, to, { duration = 800, format = (n) => String(Math.round(n)) } = {}) {
    if (reduce) { el.textContent = format(to); return; }
    const start = performance.now();
    const from = 0;
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function toast(msg) {
    const t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(() => { t.hidden = true; }, 2200);
  }

  paintIcons();

  // ---------------------------------------------------------------- sample data
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const wave = (n, base, amp, phase) => Array.from({ length: n }, (_, i) => Math.round(base + amp * Math.sin(i / 1.9 + phase) + amp * 0.45 * Math.sin(i / 0.9 + phase * 2) + amp * 0.2 * rnd()));
  const RANGES = {
    '24h': { n: 12, label: (i) => `${String(i * 2).padStart(2, '0')}:00`, k: 0.16, word: 'the last 24 hours' },
    '7d': { n: 7, label: (i) => fmtDate(dayOffset(i - 6), { weekday: 'short' }), k: 1, word: 'the last 7 days' },
    '30d': { n: 10, label: (i) => fmtDate(dayOffset((i - 9) * 3)), k: 4.2, word: 'the last 30 days' },
  };
  const METRICS = [
    { id: 'users', name: 'Active users', icon: 'users', color: '--chart-1', base: 18400, amp: 5200, fmt: (v) => (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(v)), delta: 12.4 },
    { id: 'sessions', name: 'Sessions', icon: 'activity', color: '--chart-2', base: 31200, amp: 8800, fmt: (v) => (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(v)), delta: 8.1 },
    { id: 'conv', name: 'Conversion', icon: 'target', color: '--chart-3', base: 3.6, amp: 0.9, fmt: (v) => v.toFixed(1) + '%', delta: -0.6, pct: true },
    { id: 'rev', name: 'Revenue', icon: 'dollar', color: '--chart-4', base: 42800, amp: 11500, fmt: (v) => '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v), delta: 5.7 },
  ];
  const data = {};
  for (const r in RANGES) {
    data[r] = {};
    METRICS.forEach((m, k) => {
      const mk = (ph) => wave(RANGES[r].n, m.base, m.amp, ph + k).map((v) => (m.pct ? +(m.base + (v - m.base) / 1).toFixed(1) : Math.round(v * (m.id === 'users' ? 1 : RANGES[r].k))));
      data[r][m.id] = {
        now: m.pct ? wave(RANGES[r].n, 36, 9, k).map((v) => v / 10) : mk(0.4),
        prev: m.pct ? wave(RANGES[r].n, 34, 8, k + 2).map((v) => v / 10) : mk(2.2).map((v) => Math.round(v * 0.86)),
      };
    });
  }
  const CHANNELS = [['Search', 38, 14200], ['Direct', 24, 8900], ['Social', 16, 6100], ['Email', 12, 4400], ['Referral', 7, 2700], ['Paid', 3, 1150]];
  const EVENTS = [['checkout.completed', 18420], ['plan.upgraded', 12880], ['invite.sent', 9610], ['report.exported', 6240], ['search.performed', 4975], ['page.viewed', 4120], ['trial.started', 2880]];
  const REGIONS = [['NA', 41, 'North America'], ['EU', 29, 'Europe'], ['APAC', 18, 'Asia Pacific'], ['LATAM', 8, 'Latin America'], ['MEA', 4, 'Middle East & Africa']];
  const HEALTH = [['Availability', 96, '--chart-2'], ['Latency', 84, '--chart-1'], ['Error rate', 78, '--chart-3'], ['Saturation', 71, '--chart-4']];
  let range = '7d', metric = 'users', channel = 0;
  const seenPages = new Set();

  // ---------------------------------------------------------------- renderers
  function renderDial() {
    const up = 99.982, a = -130 + 260 * 0.86;
    const ticks = Array.from({ length: 53 }, (_, i) => {
      const d = (-130 + i * 5) * Math.PI / 180, big = i % 4 === 0, r0 = big ? 72 : 76;
      const x = Math.sin(d), y = -Math.cos(d);
      return `<line class="tick" x1="${100 + x * r0}" y1="${100 + y * r0}" x2="${100 + x * 82}" y2="${100 + y * 82}" stroke-width="${big ? 2 : 1}" opacity="${big ? 0.9 : 0.5}"/>`;
    }).join('');
    const pt = (deg, r) => [100 + r * Math.sin(deg * Math.PI / 180), 100 - r * Math.cos(deg * Math.PI / 180)];
    const [sx, sy] = pt(-130, 90), [ex, ey] = pt(a, 90), [nx, ny] = pt(a, 62);
    $('[data-dial]').innerHTML = `<svg viewBox="0 0 200 200" role="img" aria-label="Uptime ${up}% over 90 days">
        <defs><linearGradient id="pa-sweep" x1="0" y1="1" x2="1" y2="0"><stop offset="0" style="stop-color:var(--chart-1)"/><stop offset="1" style="stop-color:var(--chart-2)"/></linearGradient></defs>
        ${ticks}<path class="pa-draw" d="M${sx},${sy} A90,90 0 1 1 ${ex},${ey}" fill="none" stroke="url(#pa-sweep)" stroke-width="5" stroke-linecap="round"/>
        <line class="needle" x1="100" y1="100" x2="${nx}" y2="${ny}" stroke-width="2.5" stroke-linecap="round"/><circle class="hub" cx="100" cy="100" r="6"/>
      </svg><div class="pa-dial-read"><b class="num" data-uptime>${up}%</b><span>90-day uptime</span></div>`;
    $('[data-kv]').innerHTML = [['p95 latency', '182 ms'], ['Error rate', '0.04%'], ['Deploys today', '6'], ['Open incidents', '0']]
      .map(([k, v]) => `<div><dt>${k}</dt><dd class="num">${v}</dd></div>`).join('');
  }

  function renderHealth() {
    const score = Math.round(HEALTH.reduce((a, h) => a + h[1], 0) / HEALTH.length);
    $('[data-health]').innerHTML = `<div class="pa-health-ring" role="img" aria-label="Health score ${score} out of 100">${donut(HEALTH.map(([, v, c]) => ({ value: v, color: c })), { size: 124, w: 13, gap: 3, round: true })}<b class="num" data-health-score>${score}</b></div>
      <ul>${HEALTH.map(([n, v, c]) => `<li><i style="background:var(${c})"></i>${n}<b class="num">${v}</b></li>`).join('')}</ul>`;
  }

  function renderOrbs() {
    $('[data-orbs]').innerHTML = METRICS.map((m) => {
      const d = data[range][m.id].now;
      const v = m.pct ? d[d.length - 1] : d.reduce((a, b) => a + b, 0) / (m.id === 'users' ? d.length : 1);
      return `<button type="button" class="pa-orb" style="--orb:var(${m.color})" data-metric="${m.id}" aria-pressed="${m.id === metric}"><span class="pa-orb-ball">${svg(m.icon, 2)}</span><span><b class="num" data-count="${m.pct ? v : Math.round(v)}" data-fmt="${m.id}">${m.fmt(Math.round(v * 10) / 10)}<em class="pa-delta${m.delta < 0 ? ' down' : ''}">${m.delta > 0 ? '+' : ''}${m.delta}%</em></b><span>${m.name}</span></span></button>`;
    }).join('');
  }

  function renderTerrain() {
    const m = METRICS.find((x) => x.id === metric), r = RANGES[range], d = data[range][metric];
    $('[data-hero-title]').textContent = m.name;
    $('[data-hero-sub]').textContent = `Terrain signal vs prior window · ${r.word}`;
    const host = $('[data-hero]');
    const meta = lineChart(host, {
      labels: Array.from({ length: r.n }, (_, i) => r.label(i)),
      fmt: m.fmt, h: 280, dots: true, ticks: 5,
      series: [
        { name: 'This period', color: '--chart-2', values: d.now, fill: 0.55 },
        { name: 'Previous', color: '--chart-1', values: d.prev, fill: 0.5 },
      ],
      label: `${m.name} topographic terrain over ${r.word}`,
    });
    // Network overlay — nodes along peaks, edges between them (reference signature)
    const net = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    net.setAttribute('class', 'pa-terrain-net');
    net.setAttribute('viewBox', `0 0 ${meta.W} ${meta.H}`);
    net.setAttribute('preserveAspectRatio', 'none');
    net.setAttribute('aria-hidden', 'true');
    const nowPts = meta.sets[0].pts;
    const nodes = [0, Math.floor(nowPts.length / 3), Math.floor((nowPts.length * 2) / 3), nowPts.length - 1]
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((i) => ({ i, x: nowPts[i][0], y: nowPts[i][1] - 8 }));
    nodes.forEach((a, i) => {
      nodes.slice(i + 1).forEach((b) => {
        const e = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        e.setAttribute('class', 'edge');
        e.setAttribute('x1', a.x); e.setAttribute('y1', a.y);
        e.setAttribute('x2', b.x); e.setAttribute('y2', b.y);
        net.appendChild(e);
      });
    });
    nodes.forEach((n, i) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('class', `node${i % 2 ? ' mint' : ''}`);
      c.setAttribute('cx', n.x); c.setAttribute('cy', n.y); c.setAttribute('r', 4);
      net.appendChild(c);
    });
    const plot = $('.pa-plot', host);
    plot.appendChild(net);
    // Floating peak labels
    const peakIdx = nowPts.reduce((best, p, i) => (p[1] < nowPts[best][1] ? i : best), 0);
    const label = document.createElement('span');
    label.className = 'pa-terrain-label num';
    label.textContent = `peak ${m.fmt(d.now[peakIdx])}`;
    label.style.left = `${(nowPts[peakIdx][0] / meta.W) * 100}%`;
    label.style.top = `calc(var(--plot-h) * ${(nowPts[peakIdx][1] / meta.H).toFixed(4)} - 28px)`;
    plot.appendChild(label);
    host.dataset.ambient = reduce ? '0' : '1';
    drawCharts(host);
  }

  function renderMinis() {
    const minis = [
      ['Avg. session', '4m 12s', '--chart-2', wave(14, 40, 9, 1)],
      ['Bounce rate', '31.8%', '--chart-4', wave(14, 30, 6, 3)],
      ['New signups', fmtNum(Math.round(1284 * RANGES[range].k)), '--chart-1', wave(14, 50, 14, 5)],
    ];
    $('[data-minis]').innerHTML = minis.map(([n, v, c, s]) =>
      `<section class="pa-card pa-mini" aria-label="${n}: ${v}"><p>${n}</p><b class="num">${v}</b><div class="pa-mini-spark">${spark(s, { color: c, fill: 0.4 })}</div></section>`
    ).join('');
  }

  function renderPillars() {
    const max = CHANNELS[0][1];
    $('[data-pillars]').innerHTML = CHANNELS.map(([n, p], i) =>
      `<button type="button" class="pa-pillar" data-ch="${i}" aria-pressed="${i === channel}" aria-label="${n}: ${p}% of sessions"><b class="num">${p}%</b><span class="pa-pillar-track"><span class="pa-pillar-fill" style="height:${(p / max) * 100}%"></span></span><span>${n}</span></button>`
    ).join('');
    const [n, p, s] = CHANNELS[channel];
    let note = $('.pa-pillar-note');
    if (!note) {
      note = document.createElement('p');
      note.className = 'pa-pillar-note';
      note.setAttribute('aria-live', 'polite');
      $('[data-pillars]').after(note);
    }
    note.innerHTML = `<b>${n}</b> brought <b class="num">${fmtNum(Math.round(s * RANGES[range].k))}</b> sessions, ${p}% of the total.`;
    if (!reduce) {
      $$('.pa-pillar-fill').forEach((f, i) => {
        f.style.transform = 'scaleY(0)';
        requestAnimationFrame(() => {
          f.style.transition = `transform 420ms cubic-bezier(0.16,1,0.3,1) ${i * 40}ms`;
          f.style.transform = 'scaleY(1)';
        });
      });
    }
  }

  function renderSide() {
    const k = RANGES[range].k, max = EVENTS[0][1];
    $('[data-events]').innerHTML = EVENTS.slice(0, 5).map(([n, v]) =>
      `<li><code>${n}</code><span class="num">${fmtNum(Math.round(v * k))}</span><i style="--w:${(v / max) * 100}%"></i></li>`
    ).join('');
    barChart($('[data-regions]'), {
      labels: REGIONS.map((r) => r[0]),
      series: [{ name: 'Share', color: '--chart-1', values: REGIONS.map((r) => r[1]) }],
      fmt: (v) => v + '%', h: 110, noAxis: true, label: 'Share of sessions by region',
    });
    $$('[data-regions] .pa-bar').forEach((b, i) => b.style.setProperty('--bar', `var(--chart-${(i % 4) + 1})`));
    const hrs = wave(12, 60, 26, 2);
    barChart($('[data-hours]'), {
      labels: hrs.map((_, i) => (i % 3 === 0 ? `${String(i * 2).padStart(2, '0')}h` : '')),
      series: [{ name: 'Sessions', color: '--chart-2', values: hrs.map((v) => Math.round(v * 14 * k)) }],
      h: 90, noAxis: true, label: 'Sessions for each two-hour block of the day',
    });
  }

  function drawCharts(scope = document) {
    if (reduce) return;
    $$('.pa-draw', scope).forEach((path) => {
      try {
        const len = path.getTotalLength();
        path.style.strokeDasharray = String(len);
        path.style.strokeDashoffset = String(len);
        path.getBoundingClientRect();
        path.style.transition = 'stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)';
        path.style.strokeDashoffset = '0';
      } catch (_) { /* ignore */ }
    });
    $$('.pa-bar', scope).forEach((b, i) => {
      b.style.transform = 'scaleY(0)';
      requestAnimationFrame(() => {
        b.style.transition = `transform 380ms cubic-bezier(0.16,1,0.3,1) ${i * 20}ms`;
        b.style.transform = 'scaleY(1)';
      });
    });
  }

  function staggerReveal() {
    if (reduce) return;
    const cards = $$('.pa-reveal');
    cards.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      setTimeout(() => {
        el.style.transition = 'opacity 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)';
        el.style.opacity = '1';
        el.style.transform = 'none';
      }, 40 * i);
    });
  }

  function animateCounts() {
    const health = $('[data-health-score]');
    if (health) countUp(health, 82, { duration: 700 });
    $$('[data-count]').forEach((el) => {
      const m = METRICS.find((x) => x.id === el.dataset.fmt);
      const to = +el.dataset.count;
      if (!m) return;
      const delta = el.querySelector('.pa-delta');
      countUp(el, to, {
        duration: 750,
        format: (n) => {
          const main = m.fmt(m.pct ? Math.round(n * 10) / 10 : Math.round(n));
          return delta ? main : main;
        },
      });
      // restore delta after count finishes
      setTimeout(() => {
        if (!delta) return;
        el.innerHTML = `${m.fmt(m.pct ? Math.round(to * 10) / 10 : Math.round(to))}${delta.outerHTML}`;
      }, reduce ? 0 : 780);
    });
  }

  const renderAll = () => {
    renderOrbs();
    renderTerrain();
    renderMinis();
    renderPillars();
    renderSide();
  };

  seg($('[data-range]'), (v) => { range = v; renderAll(); });
  $('[data-orbs]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-metric]'); if (!b) return;
    metric = b.dataset.metric; renderOrbs(); renderTerrain(); animateCounts();
    $(`[data-metric="${metric}"]`)?.focus();
  });
  $('[data-pillars]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ch]'); if (!b) return;
    channel = +b.dataset.ch; renderPillars();
    $(`[data-ch="${channel}"]`)?.focus();
  });
  $('[data-notify]')?.addEventListener('click', () => toast('No new alerts · sample'));
  $('[data-q]')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      toast(q ? `Search “${q}” · sample` : 'Type a query to search');
    }
  });

  renderDial();
  renderHealth();
  renderAll();

  // ---------------------------------------------------------------- multipage
  const PAGES = [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'traffic', name: 'Traffic', pattern: 'Report' },
    { id: 'events', name: 'Events', pattern: 'List' },
    { id: 'regions', name: 'Regions', pattern: 'Detail' },
  ];

  const main = $('[data-main]');
  const overview = $('[data-page-panel="overview"]');
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
    if (page.id === 'traffic') {
      return `<section class="pa-page" data-db-page="traffic" aria-labelledby="p-h">
        <h1 id="p-h">Traffic</h1>
        <p class="pa-page-lead">Channel mix and session volume for ${RANGES[range].word}. Sample data · fictional.</p>
        <div class="pa-seg" role="group" aria-label="Traffic filter" data-traffic-tabs>
          <button type="button" data-v="all" aria-pressed="true">All</button>
          <button type="button" data-v="owned" aria-pressed="false">Owned</button>
          <button type="button" data-v="paid" aria-pressed="false">Paid</button>
        </div>
        <div class="pa-page-grid" data-traffic-list></div>
        <button type="button" class="pa-btn ghost" data-traffic-refresh>Refresh mix</button>
        <div data-traffic-body></div>
      </section>`;
    }
    if (page.id === 'events') {
      return `<section class="pa-page" data-db-page="events" aria-labelledby="p-h">
        <h1 id="p-h">Events</h1>
        <p class="pa-page-lead">Instrument streams ranked by volume.</p>
        <label class="pa-field">Filter events
          <input data-ev-q type="search" placeholder="e.g. checkout" autocomplete="off">
        </label>
        <div class="pa-page-grid" data-ev-list></div>
      </section>`;
    }
    if (page.id === 'regions') {
      return `<section class="pa-page" data-db-page="regions" aria-labelledby="p-h">
        <h1 id="p-h">Regions</h1>
        <p class="pa-page-lead">Geographic share of sessions. Nothing is persisted in this demo.</p>
        <form class="pa-page-card" data-region-form onsubmit="return false">
          <label class="pa-field">Default region
            <select name="region">
              <option value="">Select…</option>
              ${REGIONS.map(([code, , name]) => `<option value="${code}">${name}</option>`).join('')}
            </select>
          </label>
          <p class="pa-error" data-form-err hidden>Pick a default region to continue.</p>
          <button type="submit" class="pa-btn">Save preference</button>
        </form>
        <div class="pa-page-grid" data-region-cards></div>
      </section>`;
    }
    return `<section class="pa-page" data-db-page="${page.id}"><h1>${page.name}</h1><p class="pa-page-lead">Sample data · fictional</p></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'traffic') {
      const list = host.querySelector('[data-traffic-list]');
      const owned = new Set(['Search', 'Direct', 'Email']);
      const paint = (filter = 'all') => {
        const rows = CHANNELS.filter(([n]) => {
          if (filter === 'owned') return owned.has(n);
          if (filter === 'paid') return n === 'Paid' || n === 'Social';
          return true;
        });
        if (!rows.length) {
          list.innerHTML = `<div class="pa-empty"><p>No channels in this filter.</p></div>`;
          return;
        }
        list.innerHTML = rows.map(([n, p, s]) =>
          `<article class="pa-page-card"><div class="pa-row"><strong>${n}</strong><span class="num">${p}%</span></div><p class="pa-sub" style="margin:0">${fmtNum(Math.round(s * RANGES[range].k))} sessions</p></article>`
        ).join('');
      };
      paint('all');
      seg(host.querySelector('[data-traffic-tabs]'), (v) => paint(v));
      host.querySelector('[data-traffic-refresh]')?.addEventListener('click', () => {
        const body = host.querySelector('[data-traffic-body]');
        body.innerHTML = `<div class="pa-loading" role="status"><p>Rebuilding channel mix…</p><div class="pa-skel"></div><div class="pa-skel"></div></div>`;
        setTimeout(() => {
          body.innerHTML = '';
          paint(host.querySelector('[aria-pressed="true"]')?.dataset.v || 'all');
          toast('Traffic mix refreshed (sample)');
        }, reduce ? 0 : 650);
      });
    }
    if (page.id === 'events') {
      const list = host.querySelector('[data-ev-list]');
      const paint = (q = '') => {
        const rows = EVENTS.filter(([n]) => !q || n.includes(q));
        if (!rows.length) {
          list.innerHTML = `<div class="pa-empty"><p>No events match “${q}”.</p></div>`;
          return;
        }
        const max = rows[0][1];
        list.innerHTML = rows.map(([n, v]) =>
          `<article class="pa-page-card"><div class="pa-row"><code>${n}</code><span class="num">${fmtNum(Math.round(v * RANGES[range].k))}</span></div><i style="display:block;height:6px;border-radius:999px;background:var(--surface);overflow:hidden"><span style="display:block;height:100%;width:${(v / max) * 100}%;background:linear-gradient(90deg,var(--chart-1),var(--chart-2))"></span></i></article>`
        ).join('');
      };
      paint();
      host.querySelector('[data-ev-q]')?.addEventListener('input', (e) => paint(e.target.value.trim().toLowerCase()));
    }
    if (page.id === 'regions') {
      const cards = host.querySelector('[data-region-cards]');
      cards.innerHTML = REGIONS.map(([code, share, name]) =>
        `<article class="pa-page-card"><div class="pa-row"><strong>${name}</strong><span class="num">${share}%</span></div><p class="pa-sub" style="margin:0">${code} cluster</p></article>`
      ).join('');
      const form = host.querySelector('[data-region-form]');
      form?.addEventListener('submit', () => {
        const err = host.querySelector('[data-form-err]');
        if (!form.region.value) { err.hidden = false; return; }
        err.hidden = true;
        toast(`Default region ${form.region.value} saved (sample)`);
      });
    }
  }

  if (window.DB?.onVisible) {
    window.DB.onVisible(root, (visible) => {
      document.documentElement.dataset.motionPaused = visible ? '' : '1';
    });
  }

  if (!window.DB || typeof window.DB.route !== 'function') {
    console.error('DB.route missing — is ../_shared/frame.js loaded before app.js?');
  } else {
    window.DB.route(PAGES, (id, page) => {
      const isOverview = id === 'overview';
      overview.hidden = !isOverview;
      const host = ensureStub();
      host.hidden = isOverview;
      if (!isOverview) {
        host.innerHTML = pageHtml(page);
        paintIcons(host);
        wirePage(host, page);
      } else if (!seenPages.has('overview')) {
        seenPages.add('overview');
        staggerReveal();
        animateCounts();
      }
      seenPages.add(id);
    });
  }

  document.documentElement.dataset.ready = 'true';
})();
