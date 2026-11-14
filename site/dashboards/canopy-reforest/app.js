/* Canopy Reforest: sample data, leaf artwork, charts and interactions.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M4 21c2-6 6-10 11-12"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    trendUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
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
    el.innerHTML = `<div class="cr-plot cr-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="cr-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="cr-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="cr-cols">${o.labels.map((l, i) => `<button class="cr-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="cr-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="cr-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="cr-tip num" hidden></span>
    </div>`;
    const tip = $('.cr-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `cr-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.cr-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.cr-cols', el).addEventListener('mouseleave', () => show(-1));
  }
  paintIcons();

  // ---------------------------------------------------------------- artwork: leaves are one path, rotated and tinted
  const stop = (o, c) => `<stop offset="${o}" style="stop-color:var(${c})"/>`;
  function leaf(x, y, len, rot, tone, wide = 0.36) {
    const w = len * wide, veins = [0.22, 0.38, 0.54, 0.7].map((t) => { const yy = -len * t, s = w * (1 - Math.abs(t - 0.45) * 1.1); return `M0,${yy} L${s.toFixed(1)},${(yy - len * 0.1).toFixed(1)} M0,${yy} L${(-s).toFixed(1)},${(yy - len * 0.1).toFixed(1)}`; }).join(' ');
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0,0 C${w},${-len * 0.25} ${w},${-len * 0.7} 0,${-len} C${-w},${-len * 0.7} ${-w},${-len * 0.25} 0,0 Z" fill="url(#cr-${tone})"/><path d="M0,${len * 0.12} L0,${-len} ${veins}" fill="none" stroke="var(--vein)" stroke-width="1.4" stroke-linecap="round"/></g>`;
  }
  function renderArt() {
    $('[data-art]').innerHTML = `<svg viewBox="0 0 1200 380" preserveAspectRatio="xMaxYMid slice">
      <defs>${[['a', '--leaf-2', '--leaf-1'], ['b', '--leaf-1', '--surface-sunken'], ['c', '--leaf-3', '--leaf-4'], ['d', '--leaf-4', '--earth']].map(([id, c1, c2]) => `<linearGradient id="cr-${id}" x1="0" y1="0" x2="1" y2="1">${stop(0, c1)}${stop(1, c2)}</linearGradient>`).join('')}</defs>
      <path d="M760,0 L1200,0 1200,380 700,380 Z" fill="var(--earth)"/><path d="M0,380 L0,310 150,380 Z" fill="var(--earth)"/>
      ${leaf(1150, 260, 300, -18, 'b', 0.42)}${leaf(1010, 250, 240, 12, 'a')}${leaf(900, 60, 190, 150, 'a', 0.32)}${leaf(780, 120, 170, -60, 'a', 0.3)}
      ${leaf(1190, 120, 220, -150, 'b')}${leaf(700, 360, 230, 28, 'c', 0.34)}${leaf(760, 420, 330, 62, 'd', 0.44)}${leaf(1060, 400, 200, -8, 'b', 0.4)}${leaf(880, 250, 150, -30, 'a', 0.34)}
    </svg>`;
    $('[data-scene]').innerHTML = `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="cr-sk" x1="0" y1="0" x2="0" y2="1">${stop(0, '--chart-1')}${stop(1, '--leaf-2')}</linearGradient><radialGradient id="cr-su"><stop offset="0" style="stop-color:var(--on-scene)" stop-opacity="0.9"/><stop offset="1" style="stop-color:var(--on-scene)" stop-opacity="0"/></radialGradient></defs>
      <rect width="400" height="260" fill="url(#cr-sk)"/><circle cx="150" cy="70" r="120" fill="url(#cr-su)"/>
      <g fill="var(--on-scene)" opacity="0.16"><path d="M150,70 L60,260 110,260 Z"/><path d="M150,70 L170,260 230,260 Z"/><path d="M150,70 L300,260 360,260 Z"/></g>
      <path d="M0,170 C80,140 150,160 220,150 S340,130 400,150 L400,260 L0,260 Z" fill="var(--leaf-1)" opacity="0.75"/>
      ${[[300, 150, 1.3], [350, 170, 1], [250, 175, 0.9], [40, 180, 1.1], [90, 190, 0.8]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="0" width="6" height="40" fill="var(--earth)"/><path d="M0,-70 L26,-20 14,-20 32,10 -32,10 -14,-20 -26,-20 Z" fill="var(--surface-sunken)"/></g>`).join('')}
      <path d="M0,215 C100,195 260,205 400,200 L400,260 L0,260 Z" fill="var(--leaf-4)"/>
    </svg>`;
  }

  // ---------------------------------------------------------------- sample data
  const months = Array.from({ length: 8 }, (_, i) => fmtDate(new Date(new Date().getFullYear(), new Date().getMonth() - 7 + i, 1), { month: 'short' }));
  const SITES = [
    { id: 'ridge', name: 'Hollow Ridge', trees: 18420, surv: 91, ha: 46.5, co2: 212, planted: [900, 1400, 2100, 2800, 3300, 2900, 2600, 2420], species: [['Red alder', 34], ['Douglas fir', 27], ['Bigleaf maple', 21], ['Western hemlock', 18]], soil: [62, 48, 71, 39], lede: 'Forty-six hectares of logged hillside, replanted plot by plot. Here is how the young trees are doing this season.' },
    { id: 'marsh', name: 'Wren Marsh', trees: 9760, surv: 86, ha: 21.2, co2: 98, planted: [300, 700, 1100, 1500, 1800, 1600, 1500, 1260], species: [['Black willow', 41], ['River birch', 26], ['Swamp oak', 20], ['Red osier', 13]], soil: [88, 79, 91, 84], lede: 'A drained wetland coming back to life. Willow and birch go in first, then the slower oaks behind them.' },
    { id: 'dune', name: 'Saltwind Dunes', trees: 6240, surv: 78, ha: 33.8, co2: 54, planted: [200, 400, 700, 900, 1200, 1100, 900, 840], species: [['Shore pine', 46], ['Beach plum', 24], ['Bayberry', 18], ['Sea buckthorn', 12]], soil: [31, 27, 44, 22], lede: 'Wind-scoured dunes held in place by pine and shrub. Survival is harder here, so every plot is checked weekly.' },
  ];
  const TASKS = ['Water plots C and D', 'Replace 40 failed saplings', 'Mulch the north terrace', 'Photograph plot markers', 'Send crew roster for the weekend'];
  const CREWS = [['Ridge Runners', 14, 'RR'], ['Saturday Shovels', 22, 'SS'], ['Fernhill School', 31, 'FS'], ['Mossback Crew', 9, 'MC']];
  let site = SITES[0], plot = 0; const done = new Set([0]);

  // ---------------------------------------------------------------- renderers
  function renderSite() {
    $('[data-site-name]').textContent = site.name; $('[data-lede]').textContent = site.lede;
    $('[data-band]').innerHTML = [['leaf', fmtNum(site.trees), 'Trees planted', `${fmtNum(site.planted[7])} this month`], ['heart', site.surv + '%', 'Survival rate', 'After the first dry season'], ['map', site.ha + ' ha', 'Area restored', `${Math.round(site.ha / 0.62)}% of the site plan`], ['globe', site.co2 + ' t', 'Carbon stored', 'Estimated, per year']]
      .map(([ic, v, n, note]) => `<article class="cr-metric"><span class="cr-metric-ic">${svg(ic, 1.5)}</span><b class="num">${v}</b><p>${n}</p><small>${note}</small></article>`).join('');
    $('[data-species]').innerHTML = site.species.map(([n, p]) => `<li>${n}<b class="num">${p}%</b><i style="--w:${(p / site.species[0][1]) * 100}%"></i></li>`).join('');
    barChart($('[data-growth]'), { labels: months, series: [{ name: 'Planted', color: '--chart-1', values: site.planted }], h: 120, noAxis: true, label: `Trees planted each month at ${site.name}` });
    $('[data-scene-title]').textContent = site.name; $('[data-scene-note]').textContent = `${site.ha} hectares · first planted 4 seasons ago`;
    renderSoil();
  }
  function renderSoil() {
    const v = site.soil[plot], word = v < 35 ? 'dry: water within two days' : v < 60 ? 'fair: check again this week' : 'well watered';
    $('[data-soil]').innerHTML = site.soil.map((s, i) => `<button class="cr-plotbtn" data-plot="${i}" aria-pressed="${i === plot}" aria-label="Plot ${'ABCD'[i]}: ${s}% moisture"><span class="cr-drop" style="--lv:${s}%"></span><b class="num">${s}%</b>Plot ${'ABCD'[i]}</button>`).join('') + `<p class="cr-soil-note" aria-live="polite">Plot ${'ABCD'[plot]} is ${word}.</p>`;
  }
  function renderTasks() { $('[data-tasks]').innerHTML = TASKS.map((t, i) => `<li><label><input type="checkbox" data-task="${i}"${done.has(i) ? ' checked' : ''}><span>${t}</span></label></li>`).join(''); }

  // ---------------------------------------------------------------- events
  $('[data-sites]').innerHTML = SITES.map((s, i) => `<button data-v="${s.id}" aria-pressed="${i === 0}">${s.name}</button>`).join('');
  seg($('[data-sites]'), (v) => { site = SITES.find((s) => s.id === v); plot = 0; renderSite(); });
  $('[data-soil]').addEventListener('click', (e) => { const b = e.target.closest('[data-plot]'); if (!b) return; plot = +b.dataset.plot; renderSoil(); $(`[data-plot="${plot}"]`).focus(); });
  $('[data-tasks]').addEventListener('change', (e) => { const i = +e.target.dataset.task; e.target.checked ? done.add(i) : done.delete(i); });
  $('[data-crews]').innerHTML = CREWS.map(([n, c, ini]) => `<li><i>${ini}</i>${n}<span class="num">${c} people</span></li>`).join('');
  renderArt(); renderSite(); renderTasks();
/* === DB multipage bootstrap (generated; polish pass replaces stubs) === */
  (function wirePages() {
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"tasks","name":"Tasks","pattern":"Board"},{"id":"sites","name":"Sites","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
