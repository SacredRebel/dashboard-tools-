/* Forge Fitness: sample data, gym atmosphere, charts and interactions.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    file: '<path d="M6 2.500h8l5 5V21a.5.5 0 0 1-.5.500h-12.500A.5.5 0 0 1 5.5 21V3a.5.5 0 0 1 .5-.5z"/><path d="M14 2.500V8h5M9 13h6M9 17h6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    sparkle: '<path d="M12 3l1.8 5.200L19 10l-5.2 1.800L12 17l-1.8-5.200L5 10l5.2-1.800zM19 16l.8 2.200L22 19l-2.2.8L19 22l-.8-2.200L16 19l2.2-.8z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z"/><circle cx="16.5" cy="14.5" r="1"/>',
    footprints: '<path d="M7 16c-2 0-3-2-3-5s1-6 3-6 3 2.5 3 5.5-1 5.5-3 5.500zM5 19h4M17 19c2 0 3-2 3-5s-1-6-3-6-3 2.5-3 5.5 1 5.5 3 5.500zM15 22h4"/>',
    moon: '<path d="M20 14.500A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.500z"/>',
    heartPulse: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/><path d="M3.5 12h5l1.5-3 3 6 1.5-3h6"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    bed: '<path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="10.5" r="1.8"/>',
    run: '<circle cx="14.5" cy="4.5" r="1.8"/><path d="m7 21 3-5 3 2v4M10 16l1-6 4 1 2 3h3M11 10 7.5 11 6 14"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    brain: '<path d="M12 4.500v15M12 6a3 3 0 0 0-5.5-1.500A3 3 0 0 0 4 9a3.5 3.5 0 0 0 .5 6A3.5 3.5 0 0 0 12 17M12 6a3 3 0 0 1 5.5-1.500A3 3 0 0 1 20 9a3.5 3.5 0 0 1-.5 6A3.5 3.5 0 0 1 12 17"/>',
    dumbbell: '<path d="M6.5 6.500v11M3.5 9v6M17.5 6.500v11M20.5 9v6M6.5 12h11"/>',
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `ff-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="ff-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="ff-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="ff-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="ff-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="ff-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="ff-cursor" hidden></span><span class="ff-tip num" hidden></span>
    </div>`;
    const tip = $('.ff-tip', el), cur = $('.ff-cursor', el), dots = $$('.ff-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `ff-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.ff-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.ff-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  // Arc gauge. Angles in degrees, 0 = up, clockwise. Returns an SVG string with a track and a value arc.
  const polar = (cx, cy, r, deg) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const arcPath = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  function arcGauge(pct, { size = 160, w = 12, from = -120, to = 120, color = '--accent', knob = false } = {}) {
    const c = size / 2, r = (size - w) / 2 - (knob ? 4 : 0), end = from + (to - from) * Math.max(0, Math.min(1, pct)), [kx, ky] = polar(c, c, r, end);
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><path class="track" d="${arcPath(c, c, r, from, to)}" fill="none" stroke-width="${w}" stroke-linecap="round"/><path d="${arcPath(c, c, r, from, Math.max(end, from + 0.01))}" fill="none" stroke-width="${w}" stroke-linecap="round" style="stroke:var(${color})"/>${knob ? `<circle class="knob" cx="${kx.toFixed(2)}" cy="${ky.toFixed(2)}" r="${w * 0.75}"/>` : ''}</svg>`;
  }
  paintIcons();

  const rangeStart = dayOffset(-10), rangeEnd = dayOffset(0);
  $('[data-range-label]').textContent = `${fmtDate(rangeStart, { day: 'numeric', month: 'short' })} – ${fmtDate(rangeEnd, { day: 'numeric', month: 'short', year: 'numeric' })}`;

  // ---------------------------------------------------------------- atmosphere (no real faces)
  $('[data-scene]').innerHTML = `<svg viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="ff-vignette" cx="55%" cy="42%" r="55%"><stop offset="0" stop-color="transparent"/><stop offset="1" style="stop-color:var(--bg)" stop-opacity=".9"/></radialGradient>
      <linearGradient id="ff-fig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--figure)" stop-opacity=".9"/><stop offset="1" style="stop-color:var(--figure)" stop-opacity=".35"/></linearGradient>
    </defs>
    <rect width="1400" height="900" fill="transparent"/>
    <ellipse cx="780" cy="420" rx="220" ry="280" fill="url(#ff-fig)" opacity=".55"/>
    <g fill="none" stroke="var(--accent)" stroke-width="2" opacity=".25">
      <path d="M620 280c40-60 120-80 180-40"/>
      <path d="M700 520c60 40 140 30 200-20"/>
    </g>
    <g transform="translate(680 220)" fill="url(#ff-fig)">
      <ellipse cx="90" cy="48" rx="42" ry="48"/>
      <path d="M48 100c10-8 70-12 90 0l28 120c4 18-6 28-22 26l-20-40-14 160h-36l-12-160-22 42c-14 4-26-6-22-24z"/>
      <path d="M20 210c-30 10-50 50-36 78M170 210c40 8 60 48 40 80" stroke="var(--figure)" stroke-width="18" stroke-linecap="round" fill="none"/>
    </g>
    <g opacity=".2" stroke="var(--chart-2)" fill="none" stroke-width="1.5">
      <rect x="180" y="620" width="160" height="40" rx="8"/><rect x="220" y="560" width="80" height="60" rx="6"/>
      <circle cx="1180" cy="200" r="48"/><circle cx="1180" cy="200" r="28"/>
    </g>
    <rect width="1400" height="900" fill="url(#ff-vignette)"/>
  </svg>`;

  // ---------------------------------------------------------------- activity grid
  const CATS = ['Browsing', 'Conversation', 'Phone'];
  const HOURS = ['08', '12', '18', '22'];
  const ACT = [
    [0, 1, 2, 1, 0, 1, 2, 2, 1, 0, 1, 2],
    [1, 0, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1],
    [2, 2, 1, 0, 1, 2, 1, 0, 0, 1, 2, 1],
  ];
  let actFilter = 'all';
  function renderAct() {
    const rows = ACT.map((row, ri) => {
      const cells = row.map((v, i) => {
        const on = actFilter === 'all' || actFilter === String(ri);
        const cls = !on || v === 0 ? '' : v === 2 ? ' on' : ' mid';
        return `<span class="ff-act-cell${cls}" title="${CATS[ri]} · block ${i + 1}"></span>`;
      }).join('');
      return `<span class="ff-act-label">${CATS[ri].slice(0, 4)}</span>${cells}`;
    }).join('');
    const hours = `<span></span><span class="ff-act-hours">${HOURS.map((h) => `<span>${h}</span>`).join('')}</span>`;
    $('[data-act-grid]').innerHTML = hours + rows;
    $('[data-act-legend]').innerHTML = CATS.map((c, i) => `<button type="button" data-cat="${i}" aria-pressed="${actFilter === String(i)}"><i></i>${c}</button>`).join('') +
      `<button type="button" data-cat="all" aria-pressed="${actFilter === 'all'}">All</button>`;
  }

  // ---------------------------------------------------------------- sleep + heart + wellness + focus
  lineChart($('[data-sleep-chart]'), {
    labels: ['11p', '12a', '1a', '2a', '3a', '4a', '5a', '6a'],
    h: 100, noAxis: true, ticks: 2, xEvery: 2,
    fmt: (v) => v + '%',
    series: [
      { name: 'Deep', color: '--chart-3', values: [20, 45, 70, 85, 60, 40, 55, 30], fill: 0.12 },
      { name: 'REM', color: '--chart-2', values: [10, 25, 40, 55, 75, 65, 45, 20], fill: 0.1 },
    ],
    label: 'Sleep depth overnight from 20% to 85%',
  });

  const HR = [58, 62, 55, 64, 70, 68, 61];
  const DAYS = Array.from({ length: 7 }, (_, i) => fmtDate(dayOffset(i - 6), { weekday: 'narrow' }));
  let hrDay = 3;
  function renderHeart() {
    $('[data-heart]').innerHTML = HR.map((v, i) => {
      const h = Math.round(((v - 50) / 30) * 90) + 20;
      return `<button class="ff-bb" data-hr="${i}" aria-pressed="${i === hrDay}" aria-label="${DAYS[i]}: ${v} bpm"><span class="ff-bb-stem" style="height:${h}px"></span>${DAYS[i]}</button>`;
    }).join('');
  }

  function waveSvg(id) {
    return `<svg viewBox="0 0 400 72" preserveAspectRatio="none"><path d="M0 40 C40 10,80 60,120 36 S200 8,240 40 S320 70,400 28" fill="none" stroke="var(--text)" stroke-width="1.2" opacity=".35"/><path d="M0 48 C50 20,90 55,140 42 S220 18,280 44 S360 60,400 36" fill="none" stroke="var(--accent)" stroke-width="1.6" opacity=".8"/><path d="M0 52 C60 30,100 58,160 48 S250 22,310 50 S370 55,400 42" fill="none" stroke="var(--chart-3)" stroke-width="1.2" opacity=".55"/></svg>`;
  }
  $('[data-waves]').innerHTML = waveSvg('well');
  $('[data-gauge-waves]').innerHTML = waveSvg('g');

  const FOCUS_H = [12, 28, 18, 40, 55, 32, 22, 48, 60, 36, 24, 44, 52, 30, 18, 38, 50, 26, 14, 34, 46, 20, 28, 42, 16, 36, 48, 22];
  $('[data-focus-wave]').innerHTML = FOCUS_H.map((h) => `<span style="height:${h}px"></span>`).join('');

  // ---------------------------------------------------------------- energy gauge
  const PILLS = [
    { id: 'heart', icon: 'heart', title: 'Steady cardiac load', pct: 0.62 },
    { id: 'sleep', icon: 'bed', title: 'Sleep debt clearing', pct: 0.78 },
    { id: 'run', icon: 'run', title: 'Training readiness', pct: 0.55 },
    { id: 'energy', icon: 'bolt', title: 'Balanced energy & recovery', pct: 0.5 },
    { id: 'steps', icon: 'footprints', title: 'Movement on target', pct: 0.71 },
    { id: 'focus', icon: 'brain', title: 'Cognitive reserve solid', pct: 0.66 },
    { id: 'strength', icon: 'dumbbell', title: 'Strength block active', pct: 0.58 },
  ];
  let pill = 3;
  function renderEnergy() {
    const p = PILLS[pill];
    $('[data-pills]').innerHTML = PILLS.map((x, i) => `<button type="button" data-pill="${i}" aria-pressed="${i === pill}" aria-label="${x.title}">${svg(x.icon)}</button>`).join('');
    $('[data-gauge]').innerHTML = `<div role="img" aria-label="Energy ${Math.round(p.pct * 100)} percent">${arcGauge(p.pct, { size: 200, w: 14, from: -140, to: 140, color: '--accent', knob: true })}</div>`;
    $('[data-energy]').textContent = Math.round(p.pct * 100) + '%';
    $('[data-energy-title]').textContent = p.title;
  }

  // ---------------------------------------------------------------- interactions
  $('[data-act-legend]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    actFilter = b.dataset.cat; renderAct();
  });
  $('[data-heart]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-hr]'); if (!b) return;
    hrDay = +b.dataset.hr; renderHeart();
    $('[data-hr="' + hrDay + '"]').focus();
  });
  $('[data-pills]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pill]'); if (!b) return;
    pill = +b.dataset.pill; renderEnergy();
    $('[data-pill="' + pill + '"]').focus();
  });
  $('[data-report]').addEventListener('click', () => {
    const el = $('[data-act-state]');
    el.hidden = false;
    el.textContent = `Report drafted for ${fmtDate(rangeStart, { month: 'short', day: 'numeric' })}–${fmtDate(rangeEnd, { month: 'short', day: 'numeric' })} · fictional sample.`;
  });
  $('[data-wallet]').addEventListener('click', () => {
    const n = $('[data-well]');
    n.textContent = String(Math.min(99, (+n.textContent || 87) + 1));
  });
  $('[data-ask]').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const el = $('[data-act-state]');
    el.hidden = false;
    el.textContent = e.target.value.trim()
      ? `Forge notes: “${e.target.value.trim()}” — try checking sleep debt next.`
      : 'Ask about steps, sleep, or recovery to get a tip.';
  });

  renderAct();
  renderHeart();
  renderEnergy();
  document.documentElement.dataset.ready = 'true';
})();
