/* Solstice Energy: sample data, sun-path scene, charts and interactions.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `se-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="se-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="se-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="se-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="se-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="se-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="se-cursor" hidden></span><span class="se-tip num" hidden></span>
    </div>`;
    const tip = $('.se-tip', el), cur = $('.se-cursor', el), dots = $$('.se-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `se-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.se-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.se-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  // Bar chart built from HTML columns (each column is a focusable button). Grouped by default, stacked with o.stacked.
  // o: { labels, series: [{ name, color, values }], fmt, h, label, max, ticks, active, onPick, stacked }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="se-plot se-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="se-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="se-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="se-cols">${o.labels.map((l, i) => `<button class="se-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="se-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="se-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="se-tip num" hidden></span>
    </div>`;
    const tip = $('.se-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `se-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.se-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.se-cols', el).addEventListener('mouseleave', () => show(-1));
  }
  // Donut from stroked circles. parts: [{ value, color: '--chart-1' }] (values in any unit). Returns an SVG string.
  function donut(parts, { size = 120, w = 14, gap = 1.5, round = false } = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0), r = (size - w) / 2, c = size / 2; let off = 0;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}"/>${parts.map((p) => {
      const len = (p.value / total) * 100, seg = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}" pathLength="100" stroke-dasharray="${Math.max(0.01, len - gap).toFixed(2)} ${(100 - len + gap).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})" style="stroke:var(${p.color})"${round ? ' stroke-linecap="round"' : ''}/>`;
      off += len; return seg;
    }).join('')}</svg>`;
  }
  paintIcons();

  // ---------------------------------------------------------------- sample data
  const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 06:00 to 20:00
  const bell = (h) => Math.max(0, Math.sin(((h - 5.6) / 14.8) * Math.PI)) ** 1.5;
  const SITES = [
    { id: 'ridge', name: 'Copper Ridge', kwp: 48, tone: ['--peak-1', '--arc-2', '--peak-2', '--peak-3'], cloud: [1, 1, 1, 0.96, 1, 1, 0.9, 1, 1, 0.97, 1, 1, 1, 1, 1] },
    { id: 'mesa', name: 'Juniper Mesa', kwp: 72, tone: ['--arc-3', '--peak-1', '--peak-3', '--peak-4'], cloud: [1, 1, 0.8, 0.7, 0.9, 1, 1, 1, 0.95, 1, 1, 1, 1, 1, 1] },
    { id: 'basin', name: 'Salt Basin', kwp: 31, tone: ['--chart-2', '--arc-1', '--peak-2', '--peak-4'], cloud: [1, 1, 1, 1, 1, 0.6, 0.55, 0.7, 1, 1, 1, 1, 1, 1, 1] },
    { id: 'pass', name: 'Lantern Pass', kwp: 56, tone: ['--arc-2', '--arc-3', '--peak-3', '--peak-4'], cloud: [1, 0.9, 1, 1, 1, 1, 1, 1, 0.85, 0.8, 1, 1, 1, 1, 1] },
  ];
  SITES.forEach((s, k) => {
    s.gen = HOURS.map((h, i) => +(s.kwp * 0.82 * bell(h) * s.cloud[i]).toFixed(1));
    s.use = HOURS.map((h, i) => +(s.kwp * (0.16 + 0.07 * Math.sin(i / 1.3 + k) + (h >= 17 ? 0.12 : 0) + (h === 7 || h === 8 ? 0.08 : 0))).toFixed(1));
  });
  const STRINGS = [['A1 East roof', 0.24, 'ok'], ['A2 East roof', 0.23, 'ok'], ['B1 South field', 0.27, 'ok'], ['B2 South field', 0.19, 'warn'], ['C1 Carport', 0.07, 'ok'], ['C2 Carport', 0, 'off']];
  const STATE = { ok: 'Normal', warn: 'Shaded', off: 'Offline' };
  const RANGES = {
    week: { labels: Array.from({ length: 7 }, (_, i) => fmtDate(dayOffset(i - 6), { weekday: 'short' })), k: [0.86, 0.94, 0.71, 1, 0.97, 0.64, 0.91], per: 5.6, unit: 'kWh this week' },
    month: { labels: Array.from({ length: 10 }, (_, i) => fmtDate(dayOffset((i - 9) * 3))), k: [0.8, 0.9, 0.7, 0.95, 1, 0.6, 0.85, 0.92, 0.75, 0.97], per: 16.8, unit: 'kWh this month' },
    year: { labels: Array.from({ length: 12 }, (_, i) => fmtDate(new Date(new Date().getFullYear(), new Date().getMonth() - 11 + i, 1), { month: 'short' })), k: [0.42, 0.5, 0.66, 0.8, 0.93, 1, 0.98, 0.9, 0.74, 0.58, 0.45, 0.38], per: 170, unit: 'kWh in 12 months' },
  };
  let site = SITES[0], hour = 8, range = 'week'; // hour is an index into HOURS (14:00)
  const hh = (h) => `${String(h).padStart(2, '0')}:00`;

  // ---------------------------------------------------------------- hero scene: sun arc + mountain range, all SVG
  function renderArt() {
    const cx = 420, cy = 430, R = 330, t = hour / (HOURS.length - 1), ang = Math.PI * (1 - t);
    const sx = cx + (R - 70) * Math.cos(ang), sy = cy - (R - 70) * Math.sin(ang);
    const stops = (a) => a.map(([o, c]) => `<stop offset="${o}" style="stop-color:var(${c})"/>`).join('');
    $('[data-art]').innerHTML = `<svg viewBox="0 0 900 430" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="se-arc" x1="0" y1="1" x2="1" y2="0.2">${stops([[0, '--arc-2'], [0.45, '--arc-1'], [0.8, '--arc-2'], [1, '--arc-3']])}</linearGradient>
        <linearGradient id="se-m1" x1="0" y1="0" x2="0.6" y2="1">${stops([[0, '--peak-1'], [0.35, '--peak-2'], [1, '--peak-3']])}</linearGradient>
        <linearGradient id="se-m2" x1="0" y1="0" x2="0" y2="1">${stops([[0, '--peak-3'], [1, '--peak-4']])}</linearGradient>
        <radialGradient id="se-sun"><stop offset="0" style="stop-color:var(--arc-1)"/><stop offset="1" style="stop-color:var(--arc-1);stop-opacity:0"/></radialGradient>
      </defs>
      <path d="M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy}" fill="none" stroke="url(#se-arc)" stroke-width="26"/>
      <path d="M${cx - R + 34},${cy} A${R - 34},${R - 34} 0 0 1 ${cx + R - 34},${cy}" fill="none" stroke="url(#se-arc)" stroke-width="1.5" opacity="0.7"/>
      <path d="M${cx - R + 70},${cy} A${R - 70},${R - 70} 0 0 1 ${cx + R - 70},${cy}" fill="none" stroke="url(#se-arc)" stroke-width="1.5" stroke-dasharray="2 7" opacity="0.9"/>
      <path d="M430,430 L520,330 548,352 600,268 640,300 668,262 712,236 748,272 790,246 836,290 900,262 900,430 Z" fill="url(#se-m2)" opacity="0.9"/>
      <path d="M470,430 L560,372 612,300 650,330 700,250 728,222 760,262 800,300 846,280 900,340 900,430 Z" fill="url(#se-m1)"/>
      <path d="M700,250 L728,222 760,262 742,300 716,286 690,330 Z" fill="var(--peak-1)" opacity="0.55"/>
      <path d="M560,372 L612,300 650,330 628,372 600,356 586,400 Z" fill="var(--peak-4)" opacity="0.35"/>
      <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="34" fill="url(#se-sun)"/>
      <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="8" fill="var(--arc-1)" stroke="var(--surface)" stroke-width="3"/>
    </svg>`;
  }
  function renderHero() {
    renderArt();
    const gen = site.gen[hour], peak = Math.max(...site.gen), total = site.gen.reduce((a, b) => a + b, 0), used = site.use.reduce((a, b) => a + b, 0);
    $('[data-site-name]').textContent = site.name;
    $('[data-now-kw]').textContent = gen.toFixed(1);
    $('[data-now-time]').textContent = hh(HOURS[hour]);
    $('[data-peak]').textContent = peak.toFixed(1) + ' kW';
    $('[data-hero-ring]').innerHTML = donut([{ value: gen || 0.01, color: '--chart-2' }, { value: Math.max(0.01, peak - gen), color: '--surface-sunken' }], { size: 76, w: 5, gap: 0 });
    lineChart($('[data-hero-chart]'), { labels: HOURS.map(hh), fmt: (v) => v + ' kW', h: 170, ticks: 4, min: 0, xEvery: 2, onPick: (i) => { hour = i; renderHero(); $$('[data-hero-chart] .se-hit button')[i].focus(); },
      series: [{ name: 'Generation', color: '--chart-1', values: site.gen, fill: 0.3 }, { name: 'Consumption', color: '--chart-3', values: site.use, fill: 0 }],
      label: `Generation and consumption for each hour at ${site.name}. Pick an hour to move the sun.` });
    const direct = site.gen.reduce((a, g, i) => a + Math.min(g, site.use[i]), 0), self = Math.round((direct / used) * 100);
    $('[data-strip]').innerHTML = [['Now', gen.toFixed(1) + ' kW'], ['Load', site.use[hour].toFixed(1) + ' kW'], ['Net', (gen - site.use[hour] >= 0 ? '+' : '') + (gen - site.use[hour]).toFixed(1) + ' kW'], ['Irradiance', Math.round(940 * bell(HOURS[hour]) * site.cloud[hour]) + ' W/m²'], ['Sunrise', '06:12'], ['Sunset', '19:48']].map(([k, v]) => `<div><dt>${k}</dt><dd class="num">${v}</dd></div>`).join('');
    $('[data-today]').textContent = total.toFixed(1);
    $('[data-today-note]').textContent = `${Math.round((total / (site.kwp * 7.2)) * 100)}% of the clear-sky forecast for a ${site.kwp} kWp array.`;
    $('[data-strings]').innerHTML = STRINGS.map(([n, share, st]) => `<tr><td>${n}</td><td class="num">${(gen * share).toFixed(1)}</td><td><span class="se-state ${st}"><i></i>${STATE[st]}</span></td></tr>`).join('');
    $('[data-self]').innerHTML = `<div class="se-self-ring" role="img" aria-label="${self}% self-powered">${donut([{ value: self, color: '--chart-1' }, { value: 100 - self + 0.01, color: '--surface-sunken' }], { size: 96, w: 9, gap: 0, round: true })}<b class="num">${self}%</b></div><p><b>Self-powered</b>${(total - direct).toFixed(0)} kWh sent to the grid so far today.</p>`;
  }
  function renderOut() {
    const r = RANGES[range], vals = r.k.map((k) => Math.round(site.kwp * r.per * k));
    $('[data-out-total]').textContent = fmtNum(vals.reduce((a, b) => a + b, 0));
    $('[data-out-unit]').textContent = r.unit;
    barChart($('[data-out]'), { labels: r.labels, series: [{ name: 'Generated', color: '--chart-1', values: vals }], fmt: (v) => fmtNum(v) + ' kWh', h: 150, ticks: 3, label: `Energy generated at ${site.name}, ${r.unit}` });
  }
  function renderDials() {
    const batt = 43 + SITES.indexOf(site) * 12, self = 68 - SITES.indexOf(site) * 7, exp = +(site.gen[hour] * 0.31).toFixed(1), temp = 38 + hour;
    const ring = (v, c, w) => donut([{ value: v, color: c }, { value: 100 - v + 0.01, color: '--surface-sunken' }], { size: 112, w, gap: 0, round: w < 8 });
    $('[data-dials]').innerHTML = [
      `<div class="se-dial"><div class="se-dial-face" role="img" aria-label="Battery ${batt}%">${ring(batt, '--chart-2', 4)}<b class="num">${batt}<small>%</small></b></div><p><strong>Battery</strong>${(batt * 0.27).toFixed(1)} kWh stored</p></div>`,
      `<div class="se-dial"><div class="se-dial-face" role="img" aria-label="Self-use ${self}%">${ring(self, '--chart-2', 18)}<b class="num">${self}<small>%</small></b></div><p><strong>Self-use</strong>of today's output</p></div>`,
      `<div class="se-dial fill" style="--lv:${Math.min(100, exp * 8)}%"><div class="se-dial-face" role="img" aria-label="Exporting ${exp} kilowatts"><b class="num">${exp}<small>kW</small></b></div><p><strong>Grid export</strong>at ${hh(HOURS[hour])}</p></div>`,
      `<div class="se-dial"><div class="se-dial-face" role="img" aria-label="Panel temperature ${temp} degrees">${ring(temp, '--chart-1', 12)}<b class="num">${temp}<small>°C</small></b></div><p><strong>Panel temp</strong>within range</p></div>`,
    ].join('');
  }
  function renderUse() {
    $('[data-use-avg]').textContent = `Average ${(site.use.reduce((a, b) => a + b, 0) / site.use.length).toFixed(1)} kW`;
    barChart($('[data-use]'), { labels: HOURS.map((h, i) => (i % 2 ? '' : hh(h).slice(0, 2) + 'h')), series: [{ name: 'Load', color: '--chart-2', values: site.use }], fmt: (v) => v + ' kW', h: 150, ticks: 3, label: `Consumption for each hour at ${site.name}` });
  }
  function renderSites() {
    $('[data-sites]').innerHTML = SITES.map((s) => `<button class="se-site" data-site="${s.id}" aria-pressed="${s === site}"><span class="se-site-art" style="${s.tone.map((c, i) => `--s${i + 1}:var(${c})`).join(';')}"></span><span><strong>${s.name}</strong>${s.kwp} kWp</span></button>`).join('');
  }
  const renderAll = () => { renderHero(); renderOut(); renderDials(); renderUse(); renderSites(); };

  // ---------------------------------------------------------------- events
  seg($('[data-range]'), (v) => { range = v; renderOut(); });
  $('[data-sites]').addEventListener('click', (e) => { const b = e.target.closest('[data-site]'); if (!b) return; site = SITES.find((s) => s.id === b.dataset.site); renderAll(); $(`[data-site="${site.id}"]`).focus(); });
  $('[data-hero-chart]').addEventListener('click', () => renderDials());
  $('[data-date]').textContent = fmtDate(dayOffset(0), { weekday: 'long', month: 'long', day: 'numeric' });
  renderAll();
  document.documentElement.dataset.ready = 'true'; // contract: tells dashboards-check.mjs the script ran to the end
})();
