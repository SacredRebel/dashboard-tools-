/* Aether Pane: glass analytics HUD over office photo, multipage + motion. Sample data. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = $('[data-db-app]') || document.body;
  const ICON = {
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  };
  const svg = (n, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n] || ''}</svg>`;
  const paintIcons = (host = document) => $$('[data-icon]', host).forEach((el) => { el.innerHTML = svg(el.dataset.icon); });
  function toast(msg) {
    const t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(() => { t.hidden = true; }, 2200);
  }
  function countUp(el, to, { duration = 700, format = (n) => String(Math.round(n)) } = {}) {
    if (!el) return;
    if (reduce) { el.textContent = format(to); return; }
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = format((1 - Math.pow(1 - t, 3)) * to);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `ae-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="ae-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="ae-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="ae-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="ae-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="ae-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="ae-cursor" hidden></span><span class="ae-tip num" hidden></span>
    </div>`;
    const tip = $('.ae-tip', el), cur = $('.ae-cursor', el), dots = $$('.ae-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `ae-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.ae-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.ae-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  // Bar chart built from HTML columns (each column is a focusable button). Grouped by default, stacked with o.stacked.
  // o: { labels, series: [{ name, color, values }], fmt, h, label, max, ticks, active, onPick, stacked }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="ae-plot ae-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="ae-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="ae-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="ae-cols">${o.labels.map((l, i) => `<button class="ae-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="ae-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="ae-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="ae-tip num" hidden></span>
    </div>`;
    const tip = $('.ae-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `ae-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.ae-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.ae-cols', el).addEventListener('mouseleave', () => show(-1));
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
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `ae-s${++sparkId}`;
    return `<svg class="ae-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }
  let sparkId = 0;
  paintIcons();

  $('[data-updated]').textContent = fmtDate(dayOffset(0), { month: 'short', day: 'numeric' }) + ', 09:14';

  const RANGES = {
    q3: {
      perf: '79.6%',
      hbars: [
        { n: 'Direct', v: 62, c: '--chart-2' },
        { n: 'Partner', v: 88, c: '--chart-1' },
        { n: 'Trial', v: 44, c: '--chart-3' },
      ],
      vbars: [40, 55, 48, 62, 50, 70, 58, 66, 72, 60],
      journey: 4.2,
      dual: { a: [20, 28, 24, 35, 40, 38, 48, 44], b: [12, 18, 22, 20, 28, 30, 26, 34] },
      area: [30, 42, 38, 55, 48, 62, 58, 70, 66, 78, 72, 80],
    },
    q4: {
      perf: '84.2%',
      hbars: [
        { n: 'Direct', v: 70, c: '--chart-2' },
        { n: 'Partner', v: 92, c: '--chart-1' },
        { n: 'Trial', v: 38, c: '--chart-3' },
      ],
      vbars: [48, 60, 52, 74, 58, 80, 66, 72, 84, 70],
      journey: 5.1,
      dual: { a: [24, 32, 28, 40, 46, 42, 55, 50], b: [14, 20, 26, 22, 30, 34, 28, 38] },
      area: [28, 36, 44, 40, 58, 52, 68, 60, 74, 70, 82, 76],
    },
    ytd: {
      perf: '81.8%',
      hbars: [
        { n: 'Direct', v: 66, c: '--chart-2' },
        { n: 'Partner', v: 85, c: '--chart-1' },
        { n: 'Trial', v: 52, c: '--chart-3' },
      ],
      vbars: [35, 48, 42, 55, 60, 58, 70, 64, 75, 68],
      journey: 4.8,
      dual: { a: [18, 26, 30, 34, 42, 40, 50, 48], b: [10, 16, 20, 24, 22, 28, 30, 32] },
      area: [22, 30, 36, 34, 48, 44, 56, 52, 64, 60, 70, 68],
    },
  };

  let range = 'q4';
  let health = 'ok';
  const PERF_BY_DOT = { ok: null, warn: '71.4%', bad: '58.0%' };

  const HOURS = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
  const PULSE = [40, 55, 35, 70, 48, 82, 60, 75, 45, 90, 58, 72, 38, 66, 50, 84, 42, 78, 56, 68];

  function renderSparkbars() {
    $('[data-sparkbars]').innerHTML = PULSE.map((v) => `<i style="--h:${v}%"></i>`).join('');
  }

  function renderHbars() {
    const d = RANGES[range];
    const empty = $('[data-hbar-empty]');
    const el = $('[data-hbars]');
    if (!d.hbars.length) { el.innerHTML = ''; empty.hidden = false; return; }
    empty.hidden = true;
    el.innerHTML = d.hbars.map((r) =>
      `<div class="ae-hbar"><span>${r.n}</span><span class="ae-hbar-track"><i style="--w:${r.v}%;--bar:var(${r.c})"></i></span><b class="num">${r.v}%</b></div>`
    ).join('');
  }

  function renderPerf() {
    const base = RANGES[range].perf;
    const label = PERF_BY_DOT[health] || base;
    const n = parseFloat(label);
    if (!Number.isNaN(n)) countUp($('[data-perf]'), n, { format: (v) => `${v.toFixed(1)}%` });
    else $('[data-perf]').textContent = label;
  }

  function renderDonut() {
    const pct = RANGES[range].journey;
    $('[data-donut]').innerHTML =
      donut([
        { value: pct, color: '--chart-1' },
        { value: Math.max(0.01, 100 - pct), color: '--chart-4' },
      ], { size: 120, w: 12, gap: 0.8, round: true }) +
      `<span class="ae-donut-label num">${pct.toFixed(2)}%</span>`;
  }

  function renderVbars() {
    const vals = RANGES[range].vbars;
    barChart($('[data-vbars]'), {
      labels: vals.map((_, i) => 'W' + (i + 1)),
      series: [{
        name: 'Revenue',
        color: '--chart-1',
        values: vals,
      }],
      h: 140, label: 'Weekly Q revenue index', ticks: 3,
    });
    // Alternate bar colors via CSS custom property on columns
    $$('.ae-col', $('[data-vbars]')).forEach((col, i) => {
      const bar = $('.ae-bar', col);
      if (bar) bar.style.setProperty('--bar', `var(${i % 2 ? '--chart-2' : '--chart-1'})`);
    });
  }

  function renderDual() {
    const d = RANGES[range].dual;
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];
    lineChart($('[data-dual]'), {
      labels,
      series: [
        { name: 'Primary', color: '--chart-1', values: d.a, fill: 0.3 },
        { name: 'Secondary', color: '--chart-2', values: d.b, fill: 0.2 },
      ],
      h: 120, label: 'Signal mix dual series', curve: true,
    });
  }

  function renderMidArea() {
    lineChart($('[data-mid-area]'), {
      labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      series: [{ name: 'Pulse', color: '--chart-1', values: [32, 40, 36, 48, 44, 55, 50], fill: 0.35 }],
      h: 80, label: 'Weekly performance pulse', curve: true, xEvery: 1,
    });
  }

  function renderArea() {
    const err = $('[data-area-error]');
    err.hidden = true;
    const vals = RANGES[range].area;
    // Expand labels to match series length
    const labels = vals.map((_, i) => HOURS[Math.min(HOURS.length - 1, Math.floor(i / 2))] || String(i));
    lineChart($('[data-area]'), {
      labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      series: [{ name: 'Journey', color: '--chart-1', values: vals, fill: 0.4 }],
      h: 150, label: 'User journey over the day', curve: true, xEvery: 2,
    });
  }

  function renderAll() {
    renderHbars(); renderPerf(); renderDonut(); renderVbars(); renderDual(); renderMidArea(); renderArea();
  }

  seg($('[data-range]'), (v) => { range = v; renderAll(); toast(`${v.toUpperCase()} · sample`); });
  $('[data-dots]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-dot]'); if (!b) return;
    health = b.dataset.dot;
    $$('[data-dot]', $('[data-dots]')).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderPerf();
    toast(`${health} · sample`);
  });

  renderSparkbars();
  renderAll();

  function staggerReveal() {
    $$('.ae-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 35 * i}ms`);
      el.classList.add('ae-reveal-in');
    });
  }

  const PAGES = [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'reports', name: 'Reports', pattern: 'Report' },
    { id: 'segments', name: 'Segments', pattern: 'List' },
    { id: 'settings', name: 'Settings', pattern: 'Settings' },
  ];
  const main = $('[data-main]');
  const overview = $('[data-page-panel="overview"]');
  let stub = null;
  const seenPages = new Set();
  function ensureStub() {
    if (stub) return stub;
    stub = document.createElement('div');
    stub.setAttribute('data-db-stub-host-legacy', '');
    stub.hidden = true;
    main.appendChild(stub);
    return stub;
  }
  function setNav(id) {
    $$('.ae-nav a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href === `#/${id}`) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  function pageHtml(page) {
    if (page.id === 'reports') {
      return `<section class="ae-page" data-db-page="reports" aria-labelledby="p-h">
        <h1 id="p-h">Reports</h1>
        <p class="ae-page-lead">Export packs for the selected range. Sample data · fictional.</p>
        <div class="ae-seg" role="group" aria-label="Reports state" data-rep-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-rep-body></div>
      </section>`;
    }
    if (page.id === 'segments') {
      return `<section class="ae-page" data-db-page="segments" aria-labelledby="p-h">
        <h1 id="p-h">Segments</h1>
        <p class="ae-page-lead">Audience slices feeding the performance index.</p>
        <div class="ae-page-grid">
          <article class="ae-page-card"><div class="ae-row"><strong>Direct</strong><span class="num">70%</span></div></article>
          <article class="ae-page-card"><div class="ae-row"><strong>Partner</strong><span class="num">92%</span></div></article>
          <article class="ae-page-card"><div class="ae-row"><strong>Trial</strong><span class="num">38%</span></div></article>
        </div>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="ae-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="ae-page-lead">HUD preferences and alert stubs.</p>
        <div class="ae-page-grid">
          <article class="ae-page-card"><div class="ae-row"><strong>Neon intensity</strong><span>High</span></div></article>
          <article class="ae-page-card"><div class="ae-row"><strong>Auto refresh</strong><span>Off</span></div></article>
        </div>
        <button type="button" class="ae-btn ghost" data-save-settings>Save preferences</button>
      </section>`;
    }
    return `<section class="ae-page"><h1>${page.name}</h1></section>`;
  }
  function wirePage(host, page) {
    if (page.id === 'reports') {
      const body = host.querySelector('[data-rep-body]');
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="ae-loading" role="status"><p>Building pack…</p><div class="ae-skel"></div><div class="ae-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="ae-empty"><p>No reports for this range.</p></div>`;
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="ae-error"><p>Could not build reports.</p><button type="button" class="ae-btn ghost" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="ae-page-grid">
          <article class="ae-page-card"><div class="ae-row"><strong>Q pack</strong><span>PDF</span></div></article>
          <article class="ae-page-card"><div class="ae-row"><strong>Journey CSV</strong><span>CSV</span></div></article>
        </div>
        <button type="button" class="ae-btn" data-export>Export pack</button>`;
        host.querySelector('[data-export]')?.addEventListener('click', () => toast('Export queued · sample'));
      };
      paint('ready');
      seg(host.querySelector('[data-rep-tabs]'), (v) => paint(v));
    }
    if (page.id === 'settings') {
      host.querySelector('[data-save-settings]')?.addEventListener('click', () => toast('Preferences saved · sample'));
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
    window.DB._legacyRouteDisabled && window.DB.route(PAGES, (id, page) => {
      const isOverview = id === 'overview';
      overview.hidden = !isOverview;
      const host = ensureStub();
      host.hidden = isOverview;
      setNav(id);
      if (!isOverview) {
        host.innerHTML = pageHtml(page);
        paintIcons(host);
        wirePage(host, page);
      } else if (!seenPages.has('overview')) {
        seenPages.add('overview');
        staggerReveal();
      }
      seenPages.add(id);
    });
  }

  
/* === DB multipage polish (dense kit) === */
(function wirePages() {
  const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"reports","name":"Reports","pattern":"Report"},{"id":"segments","name":"Segments","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
  const root = document.querySelector('[data-db-app]') || document.body;
  const main = document.querySelector('main') || document.body;
  let overview = main.querySelector('[data-page-panel="overview"]');
  if (!overview) {
    overview = document.createElement('div');
    overview.setAttribute('data-page-panel', 'overview');
    [...main.children].forEach((ch) => {
      if (ch.hasAttribute && (ch.hasAttribute('data-db-stub') || ch.getAttribute('data-db-page-host') != null)) return;
      overview.appendChild(ch);
    });
    main.insertBefore(overview, main.firstChild);
  }
  main.querySelectorAll('[data-db-stub]').forEach((el) => el.remove());
  if (window.DB?.onVisible) window.DB.onVisible(root, (v) => { document.documentElement.dataset.motionPaused = v ? '' : '1'; });
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Aether Pane" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
