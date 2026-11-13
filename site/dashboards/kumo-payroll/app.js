/* Kumo Payroll: sample data, moonlit scene, charts and interactions.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    umbrella: '<path d="M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 1-4 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    chevLeft: '<path d="m15 18-6-6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    receipt: '<path d="M5 3h14v18l-2.5-1.500L14 21l-2-1.500L10 21l-2.5-1.500L5 21z"/><path d="M9 8h6M9 12h6"/>',
    dollar: '<path d="M12 2v20M17 6.500C17 4.6 14.8 3.5 12 3.500S7 4.8 7 7s2 3.2 5 4 5 1.8 5 4.2-2.2 3.3-5 3.3-5-1.1-5-3"/>',
    chevRight: '<path d="m9 6 6 6-6 6"/>',
    lotus: '<path d="M12 20c-3-2-4.500-5.500-4.500-8.500C7.500 8 12 4 12 4s4.500 4 4.500 7.500c0 3-1.500 6.500-4.500 8.500Z"/><path d="M12 20c-4 0-8-2.500-9-7 3-.5 5 .5 6 2M12 20c4 0 8-2.500 9-7-3-.5-5 .5-6 2"/>',
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
  // Bar chart built from HTML columns (each column is a focusable button). Grouped by default, stacked with o.stacked.
  // o: { labels, series: [{ name, color, values }], fmt, h, label, max, ticks, active, onPick, stacked }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="kp-plot kp-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="kp-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="kp-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="kp-cols">${o.labels.map((l, i) => `<button class="kp-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="kp-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="kp-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="kp-tip num" hidden></span>
    </div>`;
    const tip = $('.kp-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `kp-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.kp-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.kp-cols', el).addEventListener('mouseleave', () => show(-1));
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

  // ---------------------------------------------------------------- scene, drawn once in SVG and themed by CSS variables
  function renderScene() {
    const stop = (o, c, a = 1) => `<stop offset="${o}" style="stop-color:var(${c});stop-opacity:${a}"/>`;
    const flower = (x, y, s, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-9" rx="6" ry="9" transform="rotate(${a})" fill="url(#kp-pet)"/>`).join('')}<circle r="3" fill="var(--moon-1)"/></g>`;
    const hill = (d, fill, o = 0.55) => `<path d="${d}" fill="var(${fill})"/><path d="${d.split(' L')[0]}" fill="none" stroke="var(--ink)" stroke-width="1.2" opacity="${o}"/>`;
    const blooms = [[60, 40, 1.5, 10], [128, 78, 1.2, 40], [196, 52, 1.6, 70], [250, 118, 1.3, 20], [318, 96, 1.1, 55], [36, 150, 1.4, 30], [100, 196, 1.2, 80], [372, 150, 1, 15], [176, 150, 0.9, 60], [300, 30, 1.2, 0], [420, 118, 0.8, 45]];
    $('[data-scene]').innerHTML = `<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice">
      <defs>
        <linearGradient id="kp-sky" x1="0" y1="0" x2="0" y2="1">${stop(0, '--sky-1')}${stop(0.45, '--sky-2')}${stop(1, '--sky-1')}</linearGradient>
        <radialGradient id="kp-moon" cx="0.4" cy="0.38">${stop(0, '--moon-1')}${stop(1, '--moon-2')}</radialGradient>
        <radialGradient id="kp-halo">${stop(0.35, '--moon-2', 0.5)}${stop(1, '--moon-2', 0)}</radialGradient>
        <radialGradient id="kp-pet" cx="0.5" cy="1">${stop(0, '--petal-2')}${stop(1, '--petal')}</radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#kp-sky)"/>
      <circle cx="930" cy="170" r="300" fill="url(#kp-halo)"/>
      <circle cx="930" cy="170" r="132" fill="url(#kp-moon)"/>
      <g fill="var(--moon-2)" opacity="0.28"><circle cx="890" cy="130" r="26"/><circle cx="968" cy="212" r="18"/><circle cx="960" cy="110" r="10"/></g>
      <g fill="none" stroke="var(--sky-1)" stroke-width="3" stroke-linecap="round"><path d="M1056 110q10-10 20 0q10-10 20 0"/><path d="M1108 150q7-7 14 0q7-7 14 0"/><path d="M1010 60q6-6 12 0q6-6 12 0"/></g>
      ${hill('M0,330 C140,250 260,270 380,320 S620,240 760,300 S1000,210 1160,280 S1360,230 1440,270 L1440,900 L0,900 Z', '--hill-1', 0.35)}
      ${hill('M0,420 C120,360 300,340 430,400 S700,330 860,390 S1150,320 1280,380 S1400,360 1440,372 L1440,900 L0,900 Z', '--hill-2', 0.5)}
      ${hill('M0,560 C200,470 330,520 520,560 S820,470 1010,540 S1300,480 1440,530 L1440,900 L0,900 Z', '--hill-3', 0.6)}
      <g fill="none" stroke="var(--ink)" stroke-width="1" opacity="0.35">${[0, 1, 2, 3, 4].map((i) => `<path d="M0,${640 + i * 44} C240,${590 + i * 44} 380,${690 + i * 44} 720,${640 + i * 44} S1200,${590 + i * 44} 1440,${650 + i * 44}"/>`).join('')}</g>
      <path d="M-20,20 C80,60 150,70 230,96 S360,110 450,140 M150,70 C130,120 90,150 40,170 M230,96 C250,60 280,40 320,24" fill="none" stroke="var(--branch)" stroke-width="9" stroke-linecap="round"/>
      ${blooms.map((b) => flower(...b)).join('')}
      <g fill="var(--petal)" opacity="0.8"><ellipse cx="520" cy="210" rx="7" ry="4" transform="rotate(30 520 210)"/><ellipse cx="610" cy="120" rx="6" ry="3" transform="rotate(-20 610 120)"/><ellipse cx="700" cy="250" rx="6" ry="3" transform="rotate(50 700 250)"/><ellipse cx="1240" cy="330" rx="6" ry="3" transform="rotate(10 1240 330)"/></g>
    </svg>`;
  }

  // ---------------------------------------------------------------- sample data: five monthly pay periods ending this month
  const now = new Date(), money = (v) => '$' + fmtNum(Math.round(v)), short = (v) => (v >= 1000 ? '$' + Math.round(v / 1000) + 'k' : '$' + v);
  const BASE = [[176, 331400, 62100, 318], [179, 338900, 63800, 352], [181, 346200, 65400, 296], [182, 352600, 66300, 381], [184, 362720, 68948, 426]];
  const PERIODS = BASE.map(([people, gross, ded, pto], i) => {
    const first = new Date(now.getFullYear(), now.getMonth() - 4 + i, 1), last = new Date(now.getFullYear(), now.getMonth() - 3 + i, 0);
    return { people, gross, ded, pto, net: gross - ded, month: fmtDate(first, { month: 'short' }), label: `${fmtDate(first)} – ${fmtDate(last, { month: 'short', day: 'numeric', year: 'numeric' })}` };
  });
  const DED = [['Federal tax', 35, '--chart-5'], ['Benefits', 28, '--chart-1'], ['State tax', 18, '--chart-2'], ['Retirement', 12, '--chart-3'], ['Other', 7, '--chart-4']];
  const STEPS = [[3, 'Approve timesheets', '12 waiting'], [6, 'Review pay run draft', '184 people'], [9, 'Send payments', 'Bank cut-off 2 pm'], [14, 'File monthly tax return', 'Due in 2 weeks']];
  let p = PERIODS.length - 1, ded = -1;
  const delta = (k) => (p === 0 ? null : ((PERIODS[p][k] - PERIODS[p - 1][k]) / PERIODS[p - 1][k]) * 100);

  // ---------------------------------------------------------------- renderers
  function renderKpis() {
    const d = PERIODS[p];
    const tiles = [['users', 'People paid', fmtNum(d.people), 'people', '--chart-5'], ['dollar', 'Total payroll', money(d.gross), 'gross', '--chart-3'], ['shield', 'Total deductions', money(d.ded), 'ded', '--chart-4'], ['calendar', 'Time off taken', d.pto + ' h', 'pto', '--chart-1']];
    $('[data-kpis]').innerHTML = tiles.map(([ic, name, val, k, tint]) => { const c = delta(k);
      return `<article class="kp-kpi" style="--tint:var(${tint})">${svg(ic, 1.5)}<p>${name}</p><b class="num">${val}</b><small>${c === null ? 'First period shown' : `<em>${c >= 0 ? '↑' : '↓'} ${Math.abs(c).toFixed(1)}%</em> vs. last month`}</small></article>`; }).join('');
    $('[data-period]').textContent = d.label;
    $('[data-sub]').textContent = `${d.people} people paid, ${money(d.net)} sent out after deductions.`;
    $('[data-step="-1"]').disabled = p === 0; $('[data-step="1"]').disabled = p === PERIODS.length - 1;
  }
  function renderTrend() {
    barChart($('[data-trend]'), { labels: PERIODS.map((x) => x.month), fmt: short, h: 190, ticks: 4, max: 400000, active: p, onPick: (i) => { p = i; renderAll(); $$('[data-trend] .kp-col')[i].focus(); },
      series: [{ name: 'Gross', color: '--chart-1', values: PERIODS.map((x) => x.gross) }, { name: 'Net', color: '--chart-2', values: PERIODS.map((x) => x.net) }],
      label: 'Gross and net pay for the last five months. Pick a month to see its figures.' });
  }
  function renderDed() {
    const d = PERIODS[p], sel = ded >= 0 ? DED[ded] : null;
    $('[data-ded]').innerHTML = `<div class="kp-ring" role="img" aria-label="Deductions ${money(d.ded)} split across five categories">${donut(DED.map(([, v, c], i) => ({ value: v, color: ded < 0 || ded === i ? c : '--surface-2' })), { size: 150, w: 24, gap: 1 })}<p><b class="num">${money(sel ? (d.ded * sel[1]) / 100 : d.ded)}</b>${sel ? sel[0] : 'Total'}</p></div>
      <div class="kp-ded-list">${DED.map(([n, v, c], i) => `<button data-ded-i="${i}" aria-pressed="${ded === i}"><i style="background:var(${c})"></i>${n}<b class="num">${v}%</b></button>`).join('')}</div>`;
  }
  function renderPto() {
    const used = PERIODS.slice(0, p + 1).reduce((a, x) => a + x.pto, 0), total = 2270, pct = Math.round((used / total) * 100);
    $('[data-pto]').innerHTML = `<div class="kp-ring" role="img" aria-label="${pct}% of annual time off used">${donut([{ value: pct, color: '--chart-1' }, { value: 100 - pct, color: '--surface-2' }], { size: 130, w: 9, gap: 0, round: true })}<p><b class="num">${pct}%</b>of annual<br>allowance</p></div>
      <div class="kp-pto-stats"><p><b class="num">${fmtNum(used)} h</b><span>Used this year</span></p><p><b class="num">${fmtNum(total - used)} h</b><span>Remaining</span></p><p><b class="num">${PERIODS[p].pto} h</b><span>Taken this period</span></p><p><b class="num">9</b><span>Requests waiting</span></p></div>`;
  }
  const renderAll = () => { renderKpis(); renderTrend(); renderDed(); renderPto(); };

  // ---------------------------------------------------------------- events
  $('.kp-period').addEventListener('click', (e) => { const b = e.target.closest('[data-step]'); if (!b || b.disabled) return; p = Math.max(0, Math.min(PERIODS.length - 1, p + +b.dataset.step)); renderAll(); });
  $('[data-ded]').addEventListener('click', (e) => { const b = e.target.closest('[data-ded-i]'); if (!b) return; ded = ded === +b.dataset.dedI ? -1 : +b.dataset.dedI; renderDed(); $(`[data-ded-i="${b.dataset.dedI}"]`).focus(); });
  $('[data-nav]').addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); $$('a', $('[data-nav]')).forEach((x) => x.removeAttribute('aria-current')); a.setAttribute('aria-current', 'page'); });
  $('[data-steps]').innerHTML = STEPS.map(([n, t, m]) => `<li><time>${fmtDate(dayOffset(n))}</time>${t}<span>${m}</span></li>`).join('');
  renderScene(); renderAll();
  document.documentElement.dataset.ready = 'true'; // contract: tells dashboards-check.mjs the script ran to the end
})();
