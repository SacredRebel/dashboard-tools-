/* Cortex Well: glass health board with brain bowl, activity pills, sleep and heart charts.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M4 21c2-6 6-10 11-12"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.5-4L3 9M3 4v5h5M4 13a8 8 0 0 0 14.5 4L21 15M21 20v-5h-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    power: '<path d="M12 3v9"/><path d="M6.3 6.800a8 8 0 1 0 11.4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    shieldCheck: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    flame: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 2 2 3 3 3 0-3-1-5 0-7Z"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `cx-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="cx-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="cx-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="cx-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="cx-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="cx-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="cx-cursor" hidden></span><span class="cx-tip num" hidden></span>
    </div>`;
    const tip = $('.cx-tip', el), cur = $('.cx-cursor', el), dots = $$('.cx-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `cx-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.cx-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.cx-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  // Bar chart built from HTML columns (each column is a focusable button). Grouped by default, stacked with o.stacked.
  // o: { labels, series: [{ name, color, values }], fmt, h, label, max, ticks, active, onPick, stacked }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="cx-plot cx-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="cx-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="cx-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="cx-cols">${o.labels.map((l, i) => `<button class="cx-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="cx-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="cx-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="cx-tip num" hidden></span>
    </div>`;
    const tip = $('.cx-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `cx-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.cx-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.cx-cols', el).addEventListener('mouseleave', () => show(-1));
  }
  // Arc gauge. Angles in degrees, 0 = up, clockwise. Returns an SVG string with a track and a value arc.
  const polar = (cx, cy, r, deg) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const arcPath = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  function arcGauge(pct, { size = 160, w = 12, from = -120, to = 120, color = '--accent', knob = false } = {}) {
    const c = size / 2, r = (size - w) / 2 - (knob ? 4 : 0), end = from + (to - from) * Math.max(0, Math.min(1, pct)), [kx, ky] = polar(c, c, r, end);
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><path class="track" d="${arcPath(c, c, r, from, to)}" fill="none" stroke-width="${w}" stroke-linecap="round"/><path d="${arcPath(c, c, r, from, Math.max(end, from + 0.01))}" fill="none" stroke-width="${w}" stroke-linecap="round" style="stroke:var(${color})"/>${knob ? `<circle class="knob" cx="${kx.toFixed(2)}" cy="${ky.toFixed(2)}" r="${w * 0.75}"/>` : ''}</svg>`;
  }
  paintIcons();

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  $('[data-greet]').textContent = `${greet}, Anna!`;
  $('[data-clock]').textContent = fmtDate(dayOffset(0), { day: 'numeric', month: 'short' }) +
    ', ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  $('[data-waves]').innerHTML = `<svg viewBox="0 0 280 72" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 40 C30 18 50 58 80 36 S130 10 160 34 S220 60 280 28" fill="none" style="stroke:var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M0 48 C40 28 60 62 100 44 S150 20 190 42 S240 58 280 36" fill="none" style="stroke:var(--pink)" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>
  </svg>`;

  $('[data-blood-wave]').innerHTML = `<svg viewBox="0 0 80 28" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 16 L12 16 L18 6 L26 22 L34 10 L42 18 L50 14 L58 16 L80 16" fill="none" style="stroke:var(--heart)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  $('[data-focus-gauge]').innerHTML = arcGauge(0.68, { size: 72, w: 8, from: -120, to: 120, color: '--accent' });

  const PILL_COPY = {
    heart: 'Heart focus · resting 83 bpm · steady recovery window.',
    breath: 'Breath focus · cadence 14/min · calm coherence.',
    brain: 'Brain focus · focus block 2h · soft lilac load.',
    all: 'All activity · blended score 88 · keep the evening wind-down.',
  };
  const VIEW_COPY = {
    overview: '',
    analytics: 'Analytics view · sample trends for the last 7 days.',
    reports: 'Reports view · export stubs stay fictional.',
  };

  let view = 'overview';
  let pill = 'heart';
  let sleepMode = 'night';
  let sleepFocus = 4;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = $('[data-db-app]') || document.body;

  const PERF = {
    overview: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [42, 48, 45, 58, 62, 70, 74] },
    analytics: { labels: ['W1', 'W2', 'W3', 'W4'], values: [55, 60, 58, 68] },
    reports: { labels: [], values: [] },
  };
  const HR = {
    overview: {
      labels: ['6a', '9a', '12p', '3p', '6p', '9p'],
      a: [72, 78, 88, 82, 90, 76],
      b: [68, 74, 80, 78, 84, 70],
      c: [64, 70, 74, 72, 78, 66],
    },
    analytics: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      a: [74, 76, 80, 78, 82, 75, 73],
      b: [70, 72, 74, 73, 76, 71, 69],
      c: [66, 68, 70, 69, 72, 67, 65],
    },
    reports: { labels: [], a: [], b: [], c: [] },
  };

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
  const SLEEP_N = [28, 45, 62, 80, 92, 78, 55, 40, 70, 88, 74, 50, 36, 58, 82, 68, 44, 30];
  const SLEEP_W = [62, 70, 55, 80, 74, 68, 72];

  function renderPerf() {
    const empty = $('[data-perf-empty]');
    const el = $('[data-perf]');
    const d = PERF[view];
    if (!d.values.length) {
      el.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    lineChart(el, {
      labels: d.labels,
      series: [{ name: 'Score', color: '--chart-1', values: d.values, fill: 0.25 }],
      fmt: (v) => v + '',
      h: 110,
      ticks: 3,
      min: 0,
      max: 100,
      dots: true,
      label: 'Weekly performance score',
    });
  }

  function renderHr() {
    const empty = $('[data-hr-empty]');
    const el = $('[data-hr]');
    const d = HR[view];
    if (!d.labels.length) {
      el.innerHTML = '';
      empty.hidden = false;
      $('[data-bpm]').textContent = '—';
      return;
    }
    empty.hidden = true;
    $('[data-bpm]').textContent = String(d.a[Math.min(d.a.length - 1, 4)]);
    lineChart(el, {
      labels: d.labels,
      series: [
        { name: 'Pulse', color: '--heart', values: d.a, fill: 0 },
        { name: 'Rest', color: '--pink', values: d.b, fill: 0 },
        { name: 'Base', color: '--chart-3', values: d.c, fill: 0 },
      ],
      fmt: (v) => v + ' bpm',
      h: 120,
      ticks: 3,
      min: 50,
      max: 110,
      curve: true,
      label: 'Heart rate over time',
    });
  }

  function renderSleep() {
    $('[data-sleep-err]').hidden = true;
    const el = $('[data-sleep-bars]');
    if (sleepMode === 'week') {
      $('[data-sleep-h]').textContent = '7:12';
      barChart(el, {
        labels: Array.from({ length: 7 }, (_, i) => fmtDate(dayOffset(i - 6), { weekday: 'narrow' })),
        series: [{ name: 'Sleep', color: '--accent', values: SLEEP_W }],
        fmt: (v) => v + '%',
        h: 120,
        ticks: 3,
        max: 100,
        active: sleepFocus,
        onPick: (i) => { sleepFocus = i; renderSleep(); },
        label: 'Sleep intensity by day',
        noAxis: true,
      });
      return;
    }
    $('[data-sleep-h]').textContent = '7:45';
    const labels = SLEEP_N.map((_, i) => (i % 3 === 0 ? `${Math.floor(i / 2) + 10}` : ''));
    barChart(el, {
      labels,
      series: [{ name: 'Cycles', color: '--chart-1', values: SLEEP_N }],
      fmt: (v) => v + '',
      h: 130,
      ticks: 2,
      max: 100,
      active: sleepFocus,
      onPick: (i) => { sleepFocus = i; renderSleep(); },
      label: 'Night sleep intensity bars',
      noAxis: true,
    });
  }

  function setPill(v) {
    pill = v;
    $$('[data-pills] [data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
    $('[data-pillnote]').textContent = PILL_COPY[v];
  }

  function setView(v) {
    view = v in PERF ? v : 'overview';
    $('[data-viewnote]').textContent = VIEW_COPY[view] || '';
    $$('[data-views] [data-v]').forEach((a) => {
      if (a.dataset.v === view) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    $$('[data-pages] [data-v]').forEach((a) => {
      if (a.dataset.v === view) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    renderPerf();
    renderHr();
    if (view === 'reports') {
      $('[data-sleep-err]').hidden = false;
      $('[data-sleep-err]').textContent = 'Reports view has no sleep cycles. Switch to Dashboard.';
    } else {
      renderSleep();
    }
  }

  $('[data-views]')?.addEventListener('click', (e) => {
    const s = e.target.closest('.cx-nav-search');
    if (!s) return;
    $('[data-viewnote]').textContent = 'Search is a sample stub · try Analytics.';
    toast('Search · sample');
  });

  seg($('[data-pills]'), (v) => setPill(v));
  seg($('[data-sleep-range]'), (v) => {
    sleepMode = v;
    sleepFocus = v === 'week' ? 3 : 4;
    if (view === 'reports') {
      $('[data-sleep-err]').hidden = false;
      return;
    }
    renderSleep();
  });

  $$('.cx-railbtn').forEach((b) => {
    b.addEventListener('click', () => {
      $$('.cx-railbtn').forEach((x) => x.removeAttribute('aria-current'));
      if (!b.classList.contains('cx-logout')) b.setAttribute('aria-current', 'page');
      else { $('[data-viewnote]').textContent = 'Sign-out is a sample stub.'; toast('Sign-out · sample'); }
    });
  });
  $('.cx-expand')?.addEventListener('click', () => {
    $('[data-viewnote]').textContent = 'Expand is decorative in this gallery slice.';
    toast('Expand · sample');
  });
  $('.cx-bell')?.addEventListener('click', () => {
    $('[data-viewnote]').textContent = '3 sample alerts · recovery tip, sleep score, breath reminder.';
    toast('3 alerts · sample');
  });

  setPill('heart');
  setView('overview');
  countUp($('[data-bpm]'), 83);
  countUp($('[data-wave-score]'), 92, { format: (n) => `${Math.round(n)}%` });

  function staggerReveal() {
    $$('.cx-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 40 * i}ms`);
      el.classList.add('cx-reveal-in');
    });
  }

  const PAGES = [
    { id: 'overview', name: 'Dashboard', pattern: 'Dashboard' },
    { id: 'analytics', name: 'Analytics', pattern: 'Report' },
    { id: 'vitals', name: 'Vitals', pattern: 'List' },
    { id: 'settings', name: 'Settings', pattern: 'Settings' },
  ];
  const main = $('[data-main]');
  const overview = $('[data-page-panel="overview"]');
  let pageHost = null;
  const seenPages = new Set();
  function ensureHost() {
    if (pageHost) return pageHost;
    pageHost = document.createElement('div');
    pageHost.setAttribute('data-db-page-host', '');
    pageHost.hidden = true;
    main.appendChild(pageHost);
    return pageHost;
  }

  const VITAL_ROWS = [
    { id: 'hr', name: 'Resting heart', value: '83 bpm', status: 'Steady', note: '7-day mean 81' },
    { id: 'sleep', name: 'Sleep last night', value: '7.45 h', status: 'Good', note: 'Deep 1.8 h' },
    { id: 'breath', name: 'Breath cadence', value: '14 / min', status: 'Calm', note: 'Coherence ok' },
    { id: 'focus', name: 'Focus block', value: '2.0 h', status: 'Rising', note: 'Lilac load' },
    { id: 'steps', name: 'Hills climbed', value: '3', status: 'On track', note: 'Goal 4' },
    { id: 'spo2', name: 'Blood oxygen', value: '98%', status: 'Normal', note: 'Sample only' },
    { id: 'temp', name: 'Skin temp Δ', value: '−0.2°', status: 'Stable', note: 'Night baseline' },
    { id: 'hrv', name: 'HRV', value: '62 ms', status: 'Recovering', note: 'Morning read' },
  ];

  function pageHtml(page) {
    if (page.id === 'analytics') {
      return `<section class="cx-page" data-db-page="analytics" aria-labelledby="p-h">
        <div class="cx-page-head">
          <div>
            <h1 id="p-h">Analytics</h1>
            <p class="cx-page-lead">Weekly wellness trends. Sample data · fictional · not medical advice.</p>
          </div>
          <div class="cx-page-toolbar">
            <div class="cx-seg" role="group" aria-label="Range" data-an-range>
              <button type="button" data-v="7d" aria-pressed="true">7 days</button>
              <button type="button" data-v="30d" aria-pressed="false">30 days</button>
            </div>
            <div class="cx-seg" role="group" aria-label="View state" data-an-tabs>
              <button type="button" data-v="ready" aria-pressed="true">Ready</button>
              <button type="button" data-v="loading" aria-pressed="false">Loading</button>
              <button type="button" data-v="empty" aria-pressed="false">Empty</button>
              <button type="button" data-v="error" aria-pressed="false">Error</button>
            </div>
          </div>
        </div>
        <div data-an-body class="cx-page" style="display:contents"></div>
      </section>`;
    }
    if (page.id === 'vitals') {
      return `<section class="cx-page" data-db-page="vitals" aria-labelledby="p-h">
        <div class="cx-page-head">
          <div>
            <h1 id="p-h">Vitals</h1>
            <p class="cx-page-lead">Search and open a reading. Selection syncs from the dashboard pills.</p>
          </div>
          <div class="cx-page-toolbar">
            <label class="vh" for="cx-vital-q">Search vitals</label>
            <input id="cx-vital-q" type="search" placeholder="Search vitals" data-vital-q>
            <div class="cx-seg" role="group" aria-label="Sort" data-vital-sort>
              <button type="button" data-v="name" aria-pressed="true">Name</button>
              <button type="button" data-v="status" aria-pressed="false">Status</button>
            </div>
          </div>
        </div>
        <div class="cx-kpi-row">
          <div class="cx-kpi" data-fx="reveal"><b class="num" data-fx="count" data-to="8">8</b><span>Signals</span></div>
          <div class="cx-kpi" data-fx="reveal"><b class="num" data-fx="count" data-to="83">83</b><span>Resting bpm</span></div>
          <div class="cx-kpi" data-fx="reveal"><b class="num" data-fx="count" data-to="7.45" data-decimals="2">7.45</b><span>Sleep hours</span></div>
          <div class="cx-kpi" data-fx="reveal"><b class="num" data-fx="count" data-to="98">98</b><span>SpO₂ %</span></div>
        </div>
        <section class="cx-card wide mat-glass" data-fx="reveal">
          <div class="cx-cardhead"><h2>Readings</h2><span class="cx-muted" data-vital-count></span></div>
          <div data-vital-list></div>
          <p class="cx-empty" data-vital-empty hidden>No vitals match that search. Clear the query or try “sleep”.</p>
        </section>
        <section class="cx-card span6 mat-glass" data-fx="reveal"><div class="cx-cardhead"><h2>Trend</h2></div><div data-vital-chart data-fx="draw"></div></section>
        <section class="cx-card span6 mat-glass" data-fx="reveal"><div class="cx-cardhead"><h2>Notes</h2></div>
          <div class="cx-list-dense">
            <article><span>Keep evening wind-down</span><strong class="num">22:30</strong></article>
            <article><span>Hydration reminder</span><strong>On</strong></article>
            <article><span>Coach check-in</span><strong>Thu</strong></article>
            <article><span>Sample lab panel</span><strong>Queued</strong></article>
          </div>
        </section>
        <div class="cx-drawer-scrim" data-drawer-scrim hidden></div>
        <aside class="cx-drawer" data-drawer hidden role="dialog" aria-modal="true" aria-labelledby="cx-drawer-h">
          <h2 id="cx-drawer-h">Vital detail</h2>
          <p data-drawer-body></p>
          <button type="button" class="cx-btn" data-drawer-close>Close detail</button>
        </aside>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="cx-page" data-db-page="settings" aria-labelledby="p-h">
        <div class="cx-page-head">
          <div>
            <h1 id="p-h">Settings</h1>
            <p class="cx-page-lead">Units, alerts and AI coaching. Changes stay in this session only.</p>
          </div>
          <div class="cx-page-toolbar">
            <div class="cx-seg" role="group" aria-label="Settings view state" data-set-state>
              <button type="button" data-v="ready" aria-pressed="true">Ready</button>
              <button type="button" data-v="loading" aria-pressed="false">Loading</button>
              <button type="button" data-v="empty" aria-pressed="false">Empty</button>
              <button type="button" data-v="error" aria-pressed="false">Error</button>
            </div>
          </div>
        </div>
        <div class="cx-kpi-row">
          <div class="cx-kpi" data-fx="reveal"><b class="num" data-fx="count" data-to="12">12</b><span>Devices linked</span></div>
          <div class="cx-kpi" data-fx="reveal"><b class="num" data-fx="count" data-to="3">3</b><span>Alert rules</span></div>
          <div class="cx-kpi" data-fx="reveal"><b class="num" data-fx="count" data-to="2">2</b><span>Coaches</span></div>
          <div class="cx-kpi" data-fx="reveal"><b class="num" data-fx="count" data-to="98">98</b><span>Sync health %</span></div>
        </div>
        <section class="cx-card span6 mat-glass" data-fx="reveal">
          <div class="cx-cardhead"><h2>Preferences</h2></div>
          <div class="cx-list-dense" data-set-body>
            <article><span>Units</span>
              <div class="cx-seg" data-set-units role="group" aria-label="Units">
                <button type="button" data-v="metric" aria-pressed="true">Metric</button>
                <button type="button" data-v="us" aria-pressed="false">US</button>
              </div>
            </article>
            <article><span>Night alerts</span>
              <button type="button" class="fx-toggle" role="switch" aria-checked="true" data-set-alerts aria-label="Night alerts"><span class="fx-thumb"></span></button>
            </article>
            <article><span>Focus goal (hours)</span>
              <input class="fx-slider" data-set-focus type="range" min="1" max="4" step="0.5" value="2" aria-label="Focus goal hours" style="--fx-fill:50%">
              <strong class="num" data-focus-readout>2.0</strong>
            </article>
            <article><span>Quiet hours</span><strong class="num">22:00–06:30</strong></article>
            <article><span>Week starts</span><strong>Monday</strong></article>
            <article><span>Theme follow</span><strong>System</strong></article>
            <article><span>Haptics</span><strong>On</strong></article>
            <article><span>Sample mode</span><strong>Gallery</strong></article>
          </div>
        </section>
        <section class="cx-card span6 mat-glass" data-fx="reveal">
          <div class="cx-cardhead"><h2>AI coaching</h2></div>
          <p class="cx-page-lead">Suggest a wind-down plan. Requires your approval before anything is saved.</p>
          <button type="button" class="cx-btn cx-btn-solid" data-ai-suggest>Suggest wind-down</button>
          <div data-ai-gate hidden style="margin-top:12px">
            <p>Apply sample plan “Dim lights · 22:15 · no screens”?</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
              <button type="button" class="cx-btn cx-btn-solid" data-ai-approve>Approve plan</button>
              <button type="button" class="cx-btn ghost" data-ai-reject>Dismiss</button>
            </div>
          </div>
          <div class="cx-list-dense" style="margin-top:14px">
            <article><span>Last suggestion</span><strong>Wind-down</strong></article>
            <article><span>Pending approvals</span><strong class="num">0</strong></article>
            <article><span>Coach tone</span><strong>Calm</strong></article>
            <article><span>Auto-apply</span><strong>Off</strong></article>
            <article><span>History retained</span><strong>14 days</strong></article>
            <article><span>Export coaching log</span><strong>CSV</strong></article>
          </div>
        </section>
        <section class="cx-card wide mat-glass" data-fx="reveal">
          <div class="cx-cardhead"><h2>Connected sources</h2><span class="cx-muted">Sample</span></div>
          <table class="cx-table"><thead><tr><th>Source</th><th>Status</th><th>Last sync</th></tr></thead><tbody>
            <tr><td>Ring band</td><td>Online</td><td class="num">2m ago</td></tr>
            <tr><td>Sleep mat</td><td>Online</td><td class="num">8m ago</td></tr>
            <tr><td>Breath coach</td><td>Standby</td><td class="num">1h ago</td></tr>
            <tr><td>Lab panel feed</td><td>Queued</td><td class="num">Yesterday</td></tr>
            <tr><td>Calendar</td><td>Online</td><td class="num">12m ago</td></tr>
            <tr><td>Weather assist</td><td>Online</td><td class="num">5m ago</td></tr>
          </tbody></table>
        </section>
        <section class="cx-card span6 mat-glass" data-fx="reveal">
          <div class="cx-cardhead"><h2>Profile</h2></div>
          <form data-profile-form class="cx-list-dense" novalidate>
            <label>Display name<input name="name" required minlength="2" value="Anna Vale" style="min-height:44px;width:100%;padding:0 12px;border-radius:12px;border:1px solid var(--border);background:var(--surface);color:var(--text)"></label>
            <label>Email<input name="email" type="email" required value="anna@example.test" style="min-height:44px;width:100%;padding:0 12px;border-radius:12px;border:1px solid var(--border);background:var(--surface);color:var(--text)"></label>
            <p class="cx-err" data-form-err hidden>Enter a name (2+ characters) and a valid email like name@example.test.</p>
            <button type="submit" class="cx-btn cx-btn-solid">Save profile</button>
          </form>
        </section>
        <section class="cx-card span6 mat-glass" data-fx="reveal">
          <div class="cx-cardhead"><h2>Privacy</h2></div>
          <div class="cx-list-dense">
            <article><span>Share with coach</span><strong>On</strong></article>
            <article><span>Research opt-in</span><strong>Off</strong></article>
            <article><span>Export my data</span><strong>Ready</strong></article>
            <article><span>Delete sample workspace</span><strong>Gallery only</strong></article>
            <article><span>Session storage</span><strong>Local</strong></article>
            <article><span>Analytics cookies</span><strong>Off</strong></article>
          </div>
        </section>
      </section>`;
    }
    return `<section class="cx-page"><h1>${page.name}</h1></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'analytics') {
      const body = host.querySelector('[data-an-body]');
      let range = '7d';
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="cx-card full" role="status"><p>Syncing trends…</p><div class="cx-skel"></div><div class="cx-skel"></div><div class="cx-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="cx-card full cx-empty-state"><p>No analytics yet this week.</p><button type="button" class="cx-btn" data-fill>Load sample week</button></div>`;
          host.querySelector('[data-fill]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="cx-card full cx-error"><p>Could not load analytics. Check the sample feed and retry.</p><button type="button" class="cx-btn ghost" data-retry>Retry sync</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        const n = range === '7d' ? 7 : 14;
        const labels = range === '7d'
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          : Array.from({ length: n }, (_, i) => `D${i + 1}`);
        const focus = labels.map((_, i) => 62 + ((i * 7) % 23));
        const sleep = labels.map((_, i) => 6.2 + ((i * 3) % 11) / 10);
        body.innerHTML = `
          <div class="cx-kpi-row">
            <div class="cx-kpi" data-fx="reveal"><b class="num" data-fx="count" data-to="88">88</b><span>Focus score</span></div>
            <div class="cx-kpi" data-fx="reveal"><b class="num" data-fx="count" data-to="2">2</b><span>Recovery hours</span></div>
            <div class="cx-kpi" data-fx="reveal"><b class="num" data-fx="count" data-to="14">14</b><span>Breath / min</span></div>
            <div class="cx-kpi" data-fx="reveal"><b class="num" data-fx="count" data-to="${range === '7d' ? 92 : 89}">${range === '7d' ? 92 : 89}</b><span>Sleep quality %</span></div>
          </div>
          <section class="cx-card wide mat-glass" data-fx="reveal spotlight"><div class="cx-cardhead"><h2>Focus trend</h2><span class="cx-muted">${range}</span></div><div data-an-focus data-fx="draw"></div></section>
          <section class="cx-card span6 mat-glass" data-fx="reveal"><div class="cx-cardhead"><h2>Sleep hours</h2></div><div data-an-sleep data-fx="draw"></div></section>
          <section class="cx-card span6 mat-glass" data-fx="reveal"><div class="cx-cardhead"><h2>Highlights</h2></div>
            <div class="cx-list-dense">
              <article><span>Best focus day</span><strong>Thu</strong></article>
              <article><span>Longest sleep</span><strong class="num">7.9 h</strong></article>
              <article><span>Breath calm streak</span><strong class="num">4 d</strong></article>
              <article><span>Hills vs goal</span><strong class="num">75%</strong></article>
              <article><span>HRV morning</span><strong class="num">62 ms</strong></article>
              <article><span>Coach notes</span><strong>3</strong></article>
            </div>
          </section>`;
        lineChart(host.querySelector('[data-an-focus]'), {
          labels, label: 'Focus score', h: 180, curve: true, fill: 0.25,
          series: [{ name: 'Focus', color: '--chart-1', values: focus, fill: 0.3 }],
        });
        barChart(host.querySelector('[data-an-sleep]'), {
          labels: labels.slice(0, 7), label: 'Sleep hours', h: 160,
          series: [{ name: 'Sleep', color: '--chart-2', values: sleep.slice(0, 7) }],
          fmt: (v) => v.toFixed(1),
        });
        if (window.DB?.fx) window.DB.fx.remount(host);
      };
      paint('ready');
      seg(host.querySelector('[data-an-tabs]'), (v) => paint(v));
      seg(host.querySelector('[data-an-range]'), (v) => { range = v; paint('ready'); });
    }
    if (page.id === 'vitals') {
      let sort = 'name';
      let q = '';
      let selected = null;
      try { selected = sessionStorage.getItem('cx-vital'); } catch (_) {}
      const list = host.querySelector('[data-vital-list]');
      const empty = host.querySelector('[data-vital-empty]');
      const drawer = host.querySelector('[data-drawer]');
      const scrim = host.querySelector('[data-drawer-scrim]');
      const openDrawer = (row) => {
        selected = row.id;
        try { sessionStorage.setItem('cx-vital', row.id); } catch (_) {}
        host.querySelector('[data-drawer-body]').textContent = `${row.name}: ${row.value}. ${row.note}. Status ${row.status}. Sample data only.`;
        drawer.hidden = scrim.hidden = false;
        const prev = document.activeElement;
        drawer.dataset.prev = '';
        host.querySelector('[data-drawer-close]').focus();
        const trap = (e) => {
          if (e.key === 'Escape') { close(); }
        };
        const close = () => {
          drawer.hidden = scrim.hidden = true;
          document.removeEventListener('keydown', trap);
          if (prev && prev.focus) prev.focus();
        };
        document.addEventListener('keydown', trap);
        host.querySelector('[data-drawer-close]').onclick = close;
        scrim.onclick = close;
      };
      const render = () => {
        let rows = VITAL_ROWS.filter((r) => !q || `${r.name} ${r.status}`.toLowerCase().includes(q));
        rows = rows.slice().sort((a, b) => (sort === 'status' ? a.status.localeCompare(b.status) : a.name.localeCompare(b.name)));
        host.querySelector('[data-vital-count]').textContent = `${rows.length} shown`;
        empty.hidden = rows.length > 0;
        list.innerHTML = rows.length ? `<table class="cx-table"><thead><tr><th>Signal</th><th>Value</th><th>Status</th></tr></thead><tbody>${rows.map((r) => `<tr data-id="${r.id}" aria-selected="${r.id === selected}"><td>${r.name}</td><td class="num">${r.value}</td><td>${r.status}</td></tr>`).join('')}</tbody></table>` : '';
        list.querySelectorAll('tr[data-id]').forEach((tr) => {
          tr.addEventListener('click', () => openDrawer(VITAL_ROWS.find((r) => r.id === tr.dataset.id)));
          tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') tr.click(); });
          tr.tabIndex = 0;
        });
      };
      host.querySelector('[data-vital-q]').addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); render(); });
      seg(host.querySelector('[data-vital-sort]'), (v) => { sort = v; render(); });
      lineChart(host.querySelector('[data-vital-chart]'), {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        label: 'Composite vital index', h: 160,
        series: [{ name: 'Index', color: '--accent', values: [72, 74, 71, 78, 80, 76, 82], fill: 0.25 }],
      });
      render();
      if (selected) {
        const row = VITAL_ROWS.find((r) => r.id === selected);
        if (row) openDrawer(row);
      }
      if (window.DB?.fx) window.DB.fx.remount(host);
    }
    if (page.id === 'settings') {
      const wirePrefs = () => {
        seg(host.querySelector('[data-set-units]'), (v) => toast(`Units · ${v}`));
        const tog = host.querySelector('[data-set-alerts]');
        tog?.addEventListener('click', () => {
          const on = tog.getAttribute('aria-checked') !== 'true';
          tog.setAttribute('aria-checked', String(on));
          toast(on ? 'Night alerts on' : 'Night alerts off');
        });
        const slider = host.querySelector('[data-set-focus]');
        const readout = host.querySelector('[data-focus-readout]');
        slider?.addEventListener('input', () => {
          const v = Number(slider.value);
          readout.textContent = v.toFixed(1);
          slider.style.setProperty('--fx-fill', `${((v - 1) / 3) * 100}%`);
        });
        const gate = host.querySelector('[data-ai-gate]');
        host.querySelector('[data-ai-suggest]')?.addEventListener('click', () => { gate.hidden = false; });
        host.querySelector('[data-ai-approve]')?.addEventListener('click', () => { gate.hidden = true; toast('Plan approved · sample'); });
        host.querySelector('[data-ai-reject]')?.addEventListener('click', () => { gate.hidden = true; toast('Plan dismissed'); });
        host.querySelector('[data-profile-form]')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const name = String(fd.get('name') || '').trim();
          const email = String(fd.get('email') || '').trim();
          const err = host.querySelector('[data-form-err]');
          if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            err.hidden = false;
            return;
          }
          err.hidden = true;
          toast('Profile saved · sample');
        });
      };
      wirePrefs();
      const stateHost = host.querySelector('[data-set-state]');
      if (stateHost) {
        seg(stateHost, (v) => {
          const body = host.querySelector('[data-set-body]');
          if (!body) return;
          if (v === 'loading') body.innerHTML = `<div class="cx-skel"></div><div class="cx-skel"></div><div class="cx-skel"></div>`;
          else if (v === 'empty') body.innerHTML = `<p>No preferences yet. <button type="button" class="cx-btn cx-btn-solid" data-fill>Restore defaults</button></p>`;
          else if (v === 'error') body.innerHTML = `<p class="cx-err">Could not load preferences. <button type="button" class="cx-btn ghost" data-retry>Retry</button></p>`;
          else location.hash = '#/settings';
          body.querySelector('[data-fill],[data-retry]')?.addEventListener('click', () => { location.hash = '#/settings'; });
        });
      }
      if (window.DB?.fx) window.DB.fx.remount(host);
    }
  }

  if (window.DB?.onVisible) {
    window.DB.onVisible(root, (visible) => {
      document.documentElement.dataset.motionPaused = visible ? '' : '1';
    });
  }

  // Nav links: keep analytics; map reports → vitals for old hashes
  $$('.cx-nav a[href="#/reports"]').forEach((a) => { a.setAttribute('href', '#/vitals'); a.dataset.v = 'vitals'; a.textContent = 'Vitals'; });
  // ensure settings link exists
  const nav = $('[data-views]');
  if (nav && !nav.querySelector('a[href="#/settings"]')) {
    const a = document.createElement('a');
    a.href = '#/settings'; a.dataset.v = 'settings'; a.textContent = 'Settings';
    nav.appendChild(a);
  }

  if (!window.DB || typeof window.DB.route !== 'function') {
    console.error('DB.route missing — is ../_shared/frame.js loaded before app.js?');
  } else {
    window.DB.route(PAGES, (id, page) => {
      const isOverview = id === 'overview';
      overview.hidden = !isOverview;
      const host = ensureHost();
      host.hidden = isOverview;
      setView(id === 'vitals' ? 'analytics' : id);
      if (!isOverview) {
        host.innerHTML = pageHtml(page);
        paintIcons(host);
        wirePage(host, page);
      } else if (!seenPages.has('overview')) {
        seenPages.add('overview');
        staggerReveal();
        if (window.DB?.fx) window.DB.fx.remount(overview);
      }
      seenPages.add(id);
    });
  }

  // Cross-page: heart pill → vitals
  $('[data-pills]')?.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-v]');
    if (!b) return;
    try { sessionStorage.setItem('cx-vital', b.dataset.v === 'breath' ? 'breath' : b.dataset.v === 'brain' ? 'focus' : b.dataset.v === 'all' ? 'hrv' : 'hr'); } catch (_) {}
  });

  document.documentElement.dataset.ready = 'true';
})();
