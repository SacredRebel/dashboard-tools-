/* Orchard Sales: sample data, sphere art, charts and interactions.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    line: '<path d="M3 3v18h18"/><path d="m7 15 4-5 3 3 5-7"/>',
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
  // Bar chart built from HTML columns (each column is a focusable button). Grouped by default, stacked with o.stacked.
  // o: { labels, series: [{ name, color, values }], fmt, h, label, max, ticks, active, onPick, stacked }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="os-plot os-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="os-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="os-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="os-cols">${o.labels.map((l, i) => `<button class="os-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="os-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="os-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="os-tip num" hidden></span>
    </div>`;
    const tip = $('.os-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `os-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.os-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.os-cols', el).addEventListener('mouseleave', () => show(-1));
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `os-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="os-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="os-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="os-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="os-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="os-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="os-cursor" hidden></span><span class="os-tip num" hidden></span>
    </div>`;
    const tip = $('.os-tip', el), cur = $('.os-cursor', el), dots = $$('.os-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `os-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.os-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.os-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  paintIcons();

  $('[data-mark]').innerHTML = Array.from({ length: 9 }, () => '<i></i>').join('');
  const chipDate = (d) => fmtDate(d, { day: 'numeric', month: 'numeric', year: 'numeric' }).replace(/[\/\-]/g, ' ');
  $('[data-from]').textContent = chipDate(dayOffset(-4));
  $('[data-to]').textContent = chipDate(dayOffset(0));

  $('[data-avatars]').innerHTML = ['AK', 'JL', 'RT', '+6'].map((t, i) => `<span class="${i === 3 ? 'os-more' : ''}">${t}</span>`).join('');

  $('[data-spheres]').innerHTML = `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="os-s1" cx="35%" cy="30%"><stop offset="0" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:var(--ink)" stop-opacity=".15"/></radialGradient>
      <radialGradient id="os-s2" cx="40%" cy="30%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" style="stop-color:var(--accent)"/></radialGradient>
      <radialGradient id="os-s3" cx="35%" cy="30%"><stop offset="0" style="stop-color:var(--accent)" stop-opacity=".9"/><stop offset="1" style="stop-color:var(--ink)" stop-opacity=".35"/></radialGradient>
    </defs>
    <circle cx="210" cy="110" r="78" fill="url(#os-s1)"/>
    <circle cx="140" cy="70" r="54" fill="url(#os-s2)"/>
    <circle cx="95" cy="130" r="40" fill="url(#os-s3)"/>
    <circle cx="250" cy="48" r="22" fill="url(#os-s2)" opacity=".85"/>
  </svg>`;

  const DAYS = Array.from({ length: 7 }, (_, i) => fmtDate(dayOffset(i - 6), { weekday: 'short' }));
  const ACT = [42, 58, 51, 64, 88, 70, 46];
  let actDay = 4;
  function renderAct() {
    barChart($('[data-act-chart]'), {
      labels: DAYS,
      h: 140,
      active: actDay,
      onPick: true,
      label: 'Work activity by weekday',
      series: [{ name: 'Worked', color: '--chart-1', values: ACT }],
      fmt: (v) => fmtNum(v * 140),
    });
    $('[data-act-note]').textContent = `${DAYS[actDay]} peak · ${fmtNum(ACT[actDay] * 140)} events`;
    $('[data-worked]').textContent = String(ACT.reduce((a, b) => a + b, 0));
  }

  const REV = [12, 14, 13, 18, 22, 21, 26, 29, 34, 38, 42, 48];
  const REV_L = Array.from({ length: 12 }, (_, i) => fmtDate(new Date(new Date().getFullYear(), new Date().getMonth() - 11 + i, 1), { month: 'short' }));
  let hatch = true;
  function renderRev() {
    lineChart($('[data-rev-chart]'), {
      labels: REV_L,
      h: 150,
      xEvery: 2,
      ticks: 3,
      noAxis: false,
      fmt: (v) => v + 'm',
      series: [{ name: 'Revenue', color: hatch ? '--text-muted' : '--chart-1', values: REV, fill: hatch ? 0.35 : 0.2, dash: hatch ? '4 3' : undefined }],
      label: 'Revenue comparison rising to 48m',
      curve: true,
    });
    // hatch overlay via CSS class on wrap
    $('[data-rev-chart]').style.setProperty('--hatch-on', hatch ? '1' : '0');
    if (hatch) {
      const plot = $('[data-rev-chart] .PFX-plot, [data-rev-chart]');
      // add diagonal hatch pattern via SVG if missing
      const svgEl = $('[data-rev-chart] svg');
      if (svgEl && !svgEl.querySelector('#os-hatch')) {
        const defs = svgEl.querySelector('defs') || svgEl.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), svgEl.firstChild);
        defs.insertAdjacentHTML('beforeend', `<pattern id="os-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="var(--hatch)" stroke-width="3"/></pattern>`);
        const fillPath = svgEl.querySelector('path[fill]');
        if (fillPath) fillPath.setAttribute('fill', 'url(#os-hatch)');
      }
    }
  }

  const SPEND = [210, 245, 198, 260, 240, 310, 278];
  function renderSpend() {
    lineChart($('[data-spend-chart]'), {
      labels: DAYS,
      h: 110,
      ticks: 2,
      dots: true,
      fmt: (v) => '$' + v,
      series: [{ name: 'Spend', color: '--chart-1', values: SPEND, fill: 0.12 }],
      label: 'Spend this week',
      curve: false,
    });
  }

  const VC = [
    { name: 'Dollar', pct: 72, lime: false },
    { name: 'Tether', pct: 28, lime: true },
  ];
  function renderVc() {
    $('[data-vc-empty]').hidden = true;
    $('[data-vc]').innerHTML = VC.map((x) => `<li><div style="display:flex;justify-content:space-between"><span>${x.name}</span><b class="num">${x.pct}%</b></div><span class="os-track"><i class="os-fill${x.lime ? ' lime' : ''}" style="width:${x.pct}%"></i></span></li>`).join('');
  }

  seg($('[data-nav]'), (v) => {
    $('[data-act-note]').textContent = v === 'dashboard'
      ? `${DAYS[actDay]} peak · ${fmtNum(ACT[actDay] * 140)} events`
      : `Showing ${v} snapshot (sample).`;
  });
  $('[data-rev-toggle]').addEventListener('click', () => {
    hatch = !hatch;
    $('[data-rev-toggle]').setAttribute('aria-pressed', String(hatch));
    $('[data-rev-badge]').textContent = hatch ? '12%' : '15%';
    renderRev();
  });
  $('[data-add-widget]').addEventListener('click', () => {
    $('[data-vc-empty]').hidden = false;
    $('[data-vc-empty]').textContent = 'Widget slot reserved — connect a feed in a real build.';
  });
  $('[data-report]').addEventListener('click', () => {
    $('[data-act-note]').textContent = `Report queued for ${fmtDate(dayOffset(-4))}–${fmtDate(dayOffset(0))} (fictional).`;
  });

  // Re-bind bar picks after each render via event delegation
  $('[data-act-chart]').addEventListener('click', (e) => {
    const cols = $$('.PFX-col', $('[data-act-chart]'));
    const b = e.target.closest('.PFX-col'); if (!b) return;
    actDay = cols.indexOf(b);
    renderAct();
  });

  renderAct();
  renderRev();
  renderSpend();
  renderVc();
/* === DB multipage polish (dense kit) === */
  (function wirePages() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"pipeline","name":"Pipeline","pattern":"Board"},{"id":"accounts","name":"Accounts","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
    const root = document.querySelector('[data-db-app]') || document.body;
    const main = document.querySelector('main') || document.body;
    let overview = main.querySelector('[data-page-panel="overview"]');
    if (!overview) {
      overview = document.createElement('div');
      overview.setAttribute('data-page-panel', 'overview');
      const keep = [];
      [...main.children].forEach((ch) => {
        if (ch.hasAttribute && ch.hasAttribute('data-db-stub')) return;
        if (ch.getAttribute && ch.getAttribute('data-db-page-host') != null) return;
        keep.push(ch);
      });
      keep.forEach((ch) => overview.appendChild(ch));
      main.insertBefore(overview, main.firstChild);
    }
    main.querySelectorAll('[data-db-stub]').forEach((el) => el.remove());
    document.querySelectorAll('a[href]').forEach((a) => {
      const label = (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!label) return;
      const hit = PAGES.find((p) => p.name.toLowerCase() === label || p.id === label
        || (label === 'home' && p.id === 'overview')
        || (label === 'dashboard' && p.id === 'overview'));
      if (hit) a.setAttribute('href', '#/' + hit.id);
    });
    if (window.DB?.onVisible) {
      window.DB.onVisible(root, (visible) => {
        document.documentElement.dataset.motionPaused = visible ? '' : '1';
      });
    }
    if (!window.DB?.dense) {
      console.error('DB.dense missing — load ../_shared/dense-pages.js');
      return;
    }
    window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Orchard Sales" });
    if (window.DB?.fx) window.DB.fx.remount(overview);
    void reduce;
  })();
/* === /DB multipage polish === */
  document.documentElement.dataset.ready = 'true';
})();
