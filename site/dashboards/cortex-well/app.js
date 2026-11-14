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

  // Signature: SVG brain resting in a frosted glass bowl
  $('[data-brain]').innerHTML = `<svg viewBox="0 0 280 260" role="img" aria-label="Brain activity illustration">
    <defs>
      <linearGradient id="cx-br" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" style="stop-color:var(--brain-3)"/>
        <stop offset="0.45" style="stop-color:var(--brain-1)"/>
        <stop offset="1" style="stop-color:var(--brain-2)"/>
      </linearGradient>
      <linearGradient id="cx-bowl" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color:var(--bowl)" stop-opacity="0.95"/>
        <stop offset="1" style="stop-color:var(--surface)" stop-opacity="0.35"/>
      </linearGradient>
      <filter id="cx-soft"><feGaussianBlur stdDeviation="2.5"/></filter>
    </defs>
    <ellipse cx="140" cy="228" rx="108" ry="18" fill="var(--accent)" opacity="0.12" filter="url(#cx-soft)"/>
    <path d="M40 175 Q40 250 140 250 Q240 250 240 175" fill="url(#cx-bowl)" stroke="var(--border)" stroke-width="2"/>
    <path d="M48 175 Q48 235 140 238 Q232 235 232 175" fill="none" stroke="var(--glass-2)" stroke-width="3" opacity="0.7"/>
    <g transform="translate(40 18)">
      <path d="M100 28 C72 18 42 34 38 68 C18 74 12 104 28 124 C14 148 34 172 62 168 C70 188 100 196 118 176 C138 196 168 186 174 164 C202 172 220 148 208 124 C226 104 218 72 196 68 C192 36 160 18 132 28 C122 14 108 16 100 28Z" fill="url(#cx-br)"/>
      <path d="M100 40 C88 56 92 80 100 96 M132 36 C140 58 136 86 128 108 M70 70 C58 90 62 118 78 138 M168 72 C180 96 176 128 158 146 M100 96 C112 110 122 110 132 98 M78 138 C96 150 120 152 148 140" fill="none" stroke="var(--surface)" stroke-width="3" stroke-linecap="round" opacity="0.45"/>
      <path d="M100 28 V176 M132 28 V176" fill="none" stroke="var(--brain-3)" stroke-width="1.5" opacity="0.35"/>
      <circle cx="86" cy="78" r="5" fill="var(--surface)" opacity="0.55"/>
      <circle cx="148" cy="92" r="4" fill="var(--surface)" opacity="0.5"/>
      <circle cx="112" cy="132" r="4.5" fill="var(--pink)" opacity="0.7"/>
    </g>
  </svg>`;

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
    dash: '',
    analytics: 'Analytics view · sample trends for the last 7 days.',
    reports: 'Reports view · export stubs stay fictional.',
  };

  let view = 'dash';
  let pill = 'heart';
  let sleepMode = 'night';
  let sleepFocus = 4;

  const PERF = {
    dash: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [42, 48, 45, 58, 62, 70, 74] },
    analytics: { labels: ['W1', 'W2', 'W3', 'W4'], values: [55, 60, 58, 68] },
    reports: { labels: [], values: [] },
  };
  const HR = {
    dash: {
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
    view = v;
    $('[data-viewnote]').textContent = VIEW_COPY[v];
    renderPerf();
    renderHr();
    if (v === 'reports') {
      $('[data-sleep-err]').hidden = false;
      $('[data-sleep-err]').textContent = 'Reports view has no sleep cycles. Switch to Dashboard.';
    } else {
      renderSleep();
    }
  }

  seg($('[data-views]'), (v) => {
    if (v === undefined) return;
    const btn = document.activeElement;
    if (btn && btn.classList.contains('cx-nav-search')) {
      $('[data-viewnote]').textContent = 'Search is a sample stub · try Analytics.';
      return;
    }
    setView(v);
  });
  // search button sits in the seg group without data-v — handle separately
  $('[data-views]').addEventListener('click', (e) => {
    const s = e.target.closest('.cx-nav-search');
    if (!s) return;
    $('[data-viewnote]').textContent = 'Search is a sample stub · try Analytics.';
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
  seg($('[data-pages]'), () => {
    $('[data-viewnote]').textContent = 'Board page sample · content stays on page 1 in this demo.';
  });

  $$('.cx-railbtn').forEach((b) => {
    b.addEventListener('click', () => {
      $$('.cx-railbtn').forEach((x) => x.removeAttribute('aria-current'));
      if (!b.classList.contains('cx-logout')) b.setAttribute('aria-current', 'page');
      else $('[data-viewnote]').textContent = 'Sign-out is a sample stub.';
    });
  });
  $('.cx-expand').addEventListener('click', () => {
    $('[data-viewnote]').textContent = 'Expand is decorative in this gallery slice.';
  });
  $('.cx-bell').addEventListener('click', () => {
    $('[data-viewnote]').textContent = '3 sample alerts · recovery tip, sleep score, breath reminder.';
  });

  setPill('heart');
  setView('dash');
/* === DB multipage bootstrap (generated; polish pass replaces stubs) === */
  (function wirePages() {
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"vitals","name":"Vitals","pattern":"Report"},{"id":"appointments","name":"Appointments","pattern":"Calendar"},{"id":"records","name":"Records","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
  document.documentElement.dataset.ready = 'true';
})();
