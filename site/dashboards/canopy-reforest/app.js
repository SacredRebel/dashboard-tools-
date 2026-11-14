/* Canopy Reforest — organic leaf-landing board. Sample data. No polling / network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  const svg = (n, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || ''}</svg>`;
  $$('[data-icon]').forEach((el) => { el.innerHTML = svg(el.dataset.icon); });

  const PAGES = [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'tasks', name: 'Tasks', pattern: 'Board' },
    { id: 'sites', name: 'Sites', pattern: 'List' },
    { id: 'settings', name: 'Settings', pattern: 'Settings' },
  ];

  const fmtNum = (v) => v.toLocaleString('en-US');
  const fmtDate = (d, o = { month: 'short' }) => d.toLocaleDateString('en-US', o);
  const niceStep = (raw) => { const p = 10 ** Math.floor(Math.log10(raw || 1)); const f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
  function scale(vals, o) {
    let min = o.min ?? Math.min(...vals), max = o.max ?? Math.max(...vals);
    const step = o.step || niceStep((max - min || 1) / (o.ticks || 4));
    min = Math.floor(min / step) * step; max = Math.ceil(max / step) * step; if (max === min) max = min + step;
    const ticks = []; for (let v = min; v <= max + step / 1e6; v += step) ticks.push(+v.toFixed(6));
    return { min, max, ticks };
  }
  function toast(msg) {
    const t = $('[data-toast]');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(() => { t.hidden = true; }, 2200);
  }
  function seg(group, onChange) {
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      $$('button[data-v]', group).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onChange(b.dataset.v, b);
    });
  }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => Math.max(...o.series.map((s) => s.values[i])));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="cr-plot cr-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="cr-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="cr-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="cr-cols">${o.labels.map((l, i) => `<button type="button" class="cr-col" aria-label="${l}: ${o.series.map((s) => `${fmt(s.values[i])}`).join(', ')}">${o.series.map((s) => `<span class="cr-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="cr-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="cr-tip num" hidden></span>
    </div>`;
    const tip = $('.cr-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `cr-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%';
      tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.cr-col', el).forEach((b, i) => {
      b.addEventListener('mouseenter', () => show(i));
      b.addEventListener('focus', () => show(i));
      b.addEventListener('blur', () => show(-1));
    });
    $('.cr-cols', el).addEventListener('mouseleave', () => show(-1));
    requestAnimationFrame(() => el.querySelector('.cr-barplot')?.classList.add('is-on'));
  }

  const months = Array.from({ length: 8 }, (_, i) => fmtDate(new Date(new Date().getFullYear(), new Date().getMonth() - 7 + i, 1), { month: 'short' }));
  const SITES = [
    { id: 'ridge', name: 'Hollow Ridge', trees: 18420, surv: 91, ha: 46.5, co2: 212, planted: [900, 1400, 2100, 2800, 3300, 2900, 2600, 2420], species: [['Red alder', 34], ['Douglas fir', 27], ['Bigleaf maple', 21], ['Western hemlock', 18]], soil: [62, 48, 71, 39], lede: 'Forty-six hectares of logged hillside, replanted plot by plot. Here is how the young trees are doing this season.' },
    { id: 'marsh', name: 'Wren Marsh', trees: 9760, surv: 86, ha: 21.2, co2: 98, planted: [300, 700, 1100, 1500, 1800, 1600, 1500, 1260], species: [['Black willow', 41], ['River birch', 26], ['Swamp oak', 20], ['Red osier', 13]], soil: [88, 79, 91, 84], lede: 'A drained wetland coming back to life. Willow and birch go in first, then the slower oaks behind them.' },
    { id: 'dune', name: 'Saltwind Dunes', trees: 6240, surv: 78, ha: 33.8, co2: 54, planted: [200, 400, 700, 900, 1200, 1100, 900, 840], species: [['Shore pine', 46], ['Beach plum', 24], ['Bayberry', 18], ['Sea buckthorn', 12]], soil: [31, 27, 44, 22], lede: 'Wind-scoured dunes held in place by pine and shrub. Survival is harder here, so every plot is checked weekly.' },
  ];
  const TASKS = ['Water plots C and D', 'Replace 40 failed saplings', 'Mulch the north terrace', 'Photograph plot markers', 'Send crew roster for the weekend'];
  const CREWS = [['Ridge Runners', 14, 'RR'], ['Saturday Shovels', 22, 'SS'], ['Fernhill School', 31, 'FS'], ['Mossback Crew', 9, 'MC']];
  let site = SITES[0], plot = 0;
  const done = new Set([0]);

  function countUp(el, target) {
    if (reduce) { el.textContent = typeof target === 'number' ? fmtNum(target) : String(target); return; }
    const numeric = typeof target === 'number';
    const end = numeric ? target : parseFloat(String(target));
    const suffix = numeric ? '' : String(target).replace(/[\d.,]/g, '');
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / 700);
      const eased = 1 - (1 - t) ** 3;
      const val = Math.round(end * eased);
      el.textContent = numeric ? fmtNum(val) : `${val}${suffix}`;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function renderSite() {
    $('[data-site-name]').textContent = site.name;
    $('[data-lede]').textContent = site.lede;
    $('[data-band]').innerHTML = [
      ['leaf', site.trees, 'Trees planted', `${fmtNum(site.planted[7])} this month`, true],
      ['heart', site.surv + '%', 'Survival rate', 'After the first dry season', false],
      ['map', site.ha + ' ha', 'Area restored', `${Math.round(site.ha / 0.62)}% of the site plan`, false],
      ['globe', site.co2 + ' t', 'Carbon stored', 'Estimated, per year', false],
    ].map(([ic, v, n, note, num]) => `<article class="cr-metric"><span class="cr-metric-ic">${svg(ic, 1.5)}</span><b class="num" data-kpi="${num ? v : ''}" data-kpi-raw="${v}">${v}</b><p>${n}</p><small>${note}</small></article>`).join('');
    $$('[data-kpi]', $('[data-band]')).forEach((el) => {
      if (el.dataset.kpi) countUp(el, +el.dataset.kpi);
    });
    $('[data-species]').innerHTML = site.species.map(([n, p]) => `<li>${n}<b class="num">${p}%</b><i style="--w:${(p / site.species[0][1]) * 100}%"></i></li>`).join('');
    requestAnimationFrame(() => $('[data-species]')?.classList.add('is-on'));
    barChart($('[data-growth]'), { labels: months, series: [{ name: 'Planted', color: '--chart-1', values: site.planted }], h: 120, noAxis: true, label: `Trees planted each month at ${site.name}` });
    $('[data-scene-title]').textContent = site.name;
    $('[data-scene-note]').textContent = `${site.ha} hectares · first planted 4 seasons ago`;
    renderSoil();
  }
  function renderSoil() {
    const v = site.soil[plot];
    const word = v < 35 ? 'dry: water within two days' : v < 60 ? 'fair: check again this week' : 'well watered';
    $('[data-soil]').innerHTML = site.soil.map((s, i) => `<button type="button" class="cr-plotbtn" data-plot="${i}" aria-pressed="${i === plot}" aria-label="Plot ${'ABCD'[i]}: ${s}% moisture"><span class="cr-drop" style="--lv:${s}%"></span><b class="num">${s}%</b>Plot ${'ABCD'[i]}</button>`).join('') + `<p class="cr-soil-note" aria-live="polite">Plot ${'ABCD'[plot]} is ${word}.</p>`;
    requestAnimationFrame(() => $('[data-soil]')?.classList.add('is-on'));
  }
  function renderTasksOverview() {
    $('[data-tasks]').innerHTML = TASKS.map((t, i) => `<li><label><input type="checkbox" data-task="${i}"${done.has(i) ? ' checked' : ''}><span>${t}</span></label></li>`).join('');
  }

  $('[data-sites]').innerHTML = SITES.map((s, i) => `<button type="button" data-v="${s.id}" aria-pressed="${i === 0}">${s.name}</button>`).join('');
  seg($('[data-sites]'), (v) => { site = SITES.find((s) => s.id === v); plot = 0; $('[data-species]')?.classList.remove('is-on'); $('[data-soil]')?.classList.remove('is-on'); renderSite(); toast(`Showing ${site.name}`); });
  $('[data-soil]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-plot]'); if (!b) return;
    plot = +b.dataset.plot; $('[data-soil]')?.classList.remove('is-on'); renderSoil();
  });
  $('[data-tasks]').addEventListener('change', (e) => {
    const i = +e.target.dataset.task;
    e.target.checked ? done.add(i) : done.delete(i);
  });
  $('[data-crews]').innerHTML = CREWS.map(([n, c, ini]) => `<li><i>${ini}</i>${n}<span class="num">${c} people</span></li>`).join('');
  $('[data-log]')?.addEventListener('click', () => toast('Planting logged (sample)'));
  $('[data-bell]')?.addEventListener('click', () => toast('2 site alerts · sample'));

  function animateOverview() {
    const root = $('[data-page-panel="overview"]');
    if (!root || root.hidden) return;
    const bits = ['.cr-hero', '.cr-band', ...$$('.cr-tile', root).map(() => null)];
    const els = [$('.cr-hero', root), $('.cr-band', root), ...$$('.cr-tile', root)].filter(Boolean);
    els.forEach((c, i) => {
      c.style.opacity = reduce ? '1' : '0';
      c.style.transform = reduce ? 'none' : 'translateY(12px)';
      if (!reduce) {
        setTimeout(() => {
          c.style.transition = 'opacity 220ms var(--ease, ease), transform 220ms var(--ease, ease)';
          c.style.opacity = '1'; c.style.transform = 'none';
        }, 50 * i);
      }
    });
    void bits;
  }

  renderSite();
  renderTasksOverview();

  const main = $('[data-main]');
  const overview = $('[data-page-panel="overview"]');

  function pageHtml(page) {
    if (page.id === 'tasks') {
      return `<section class="cr-page" aria-labelledby="p-h">
        <h1 id="p-h">Tasks</h1>
        <p class="cr-page-lead">Weekly fieldwork for ${site.name}. Sample data · fictional.</p>
        <div class="cr-toolbar">
          <div class="cr-seg" role="group" aria-label="Filter">
            <button type="button" data-v="all" aria-pressed="true">All</button>
            <button type="button" data-v="open" aria-pressed="false">Open</button>
            <button type="button" data-v="done" aria-pressed="false">Done</button>
          </div>
          <button type="button" class="cr-cta" data-refresh>Refresh</button>
        </div>
        <div data-task-board class="cr-page-grid"></div>
      </section>`;
    }
    if (page.id === 'sites') {
      return `<section class="cr-page" aria-labelledby="p-h">
        <h1 id="p-h">Sites</h1>
        <p class="cr-page-lead">Compare restored hectares across the season.</p>
        <label class="cr-row">Search <input data-site-q type="search" placeholder="Filter sites" style="min-height:44px;padding:0 12px;border-radius:12px;border:1px solid var(--border);background:var(--surface-2);color:var(--text)"></label>
        <div class="cr-page-grid" data-site-list></div>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="cr-page" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="cr-page-lead">Crew alerts for Canopy. Nothing is saved in this demo.</p>
        <form class="cr-card" data-settings onsubmit="return false">
          <label class="cr-row">Weekly digests <button type="button" class="cr-cta" data-digest aria-pressed="true" style="min-height:40px;padding:0 16px">On</button></label>
          <label class="cr-row">Lead email <input name="email" type="email" placeholder="you@example.com" style="min-height:44px;padding:0 12px;border-radius:12px;border:1px solid var(--border);background:var(--surface-2);color:var(--text);min-width:220px"></label>
          <p class="cr-error" data-form-err hidden style="color:#ffb4a8;margin-top:8px">Enter a valid email to save.</p>
          <button type="submit" class="cr-cta" style="margin-top:12px">Save preferences</button>
        </form>
      </section>`;
    }
    return `<section class="cr-page"><h1>${page.name}</h1><p class="cr-page-lead">Sample data · fictional</p></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'tasks') {
      const board = host.querySelector('[data-task-board]');
      const paint = (filter = 'all') => {
        const rows = TASKS.map((t, i) => ({ t, i, done: done.has(i) }))
          .filter((r) => filter === 'all' || (filter === 'done' ? r.done : !r.done));
        if (!rows.length) {
          board.innerHTML = `<div class="cr-empty"><p>No ${filter} tasks.</p></div>`;
          return;
        }
        board.innerHTML = rows.map((r) => `<article class="cr-card"><label class="cr-row"><span>${r.t}</span><input type="checkbox" data-task="${r.i}"${r.done ? ' checked' : ''}></label></article>`).join('');
        board.querySelectorAll('[data-task]').forEach((inp) => {
          inp.addEventListener('change', () => {
            const i = +inp.dataset.task;
            inp.checked ? done.add(i) : done.delete(i);
            renderTasksOverview();
            paint(host.querySelector('[aria-pressed="true"]')?.dataset.v || 'all');
          });
        });
      };
      paint('all');
      seg(host.querySelector('.cr-seg'), (v) => paint(v));
      host.querySelector('[data-refresh]')?.addEventListener('click', () => {
        board.innerHTML = `<div class="cr-loading" role="status"><p>Syncing fieldwork…</p><div class="cr-skel"></div><div class="cr-skel"></div></div>`;
        setTimeout(() => { paint(host.querySelector('[aria-pressed="true"]')?.dataset.v || 'all'); toast('Tasks refreshed (sample)'); }, reduce ? 0 : 650);
      });
    }
    if (page.id === 'sites') {
      const list = host.querySelector('[data-site-list]');
      const paint = (q = '') => {
        const rows = SITES.filter((s) => !q || s.name.toLowerCase().includes(q));
        if (!rows.length) {
          list.innerHTML = `<div class="cr-empty"><p>No sites match “${q}”.</p><button type="button" class="cr-cta" data-clear>Clear search</button></div>`;
          list.querySelector('[data-clear]')?.addEventListener('click', () => { host.querySelector('[data-site-q]').value = ''; paint(''); });
          return;
        }
        list.innerHTML = rows.map((s) => `<article class="cr-card"><h2 style="margin:0 0 8px;font-family:var(--font-display);font-size:20px">${s.name}</h2><div class="cr-row"><span>Trees</span><strong class="num">${fmtNum(s.trees)}</strong></div><div class="cr-row"><span>Area</span><strong class="num">${s.ha} ha</strong></div><button type="button" class="cr-cta" data-pick="${s.id}" style="margin-top:10px;min-height:40px;padding:0 16px">Open on overview</button></article>`).join('');
        list.querySelectorAll('[data-pick]').forEach((btn) => {
          btn.addEventListener('click', () => {
            site = SITES.find((s) => s.id === btn.dataset.pick);
            plot = 0;
            $$('[data-sites] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === site.id)));
            renderSite();
            location.hash = '#/overview';
            toast(`${site.name} selected`);
          });
        });
      };
      paint();
      host.querySelector('[data-site-q]')?.addEventListener('input', (e) => paint(e.target.value.trim().toLowerCase()));
    }
    if (page.id === 'settings') {
      const form = host.querySelector('[data-settings]');
      const digest = host.querySelector('[data-digest]');
      digest?.addEventListener('click', () => {
        const on = digest.getAttribute('aria-pressed') !== 'true';
        digest.setAttribute('aria-pressed', String(on));
        digest.textContent = on ? 'On' : 'Off';
        toast(on ? 'Digests on' : 'Digests off');
      });
      form?.addEventListener('submit', () => {
        const err = host.querySelector('[data-form-err]');
        const email = form.email.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.hidden = false; return; }
        err.hidden = true;
        toast(`Preferences saved for ${email}`);
      });
    }
  }

  let stub = null;
  function ensureStub() {
    if (stub) return stub;
    stub = document.createElement('div');
    stub.setAttribute('data-db-stub-host-legacy', '');
    stub.hidden = true;
    main.appendChild(stub);
    return stub;
  }

  window.DB._legacyRouteDisabled && window.DB.route(PAGES, (id, page) => {
    const isOverview = id === 'overview';
    overview.hidden = !isOverview;
    const host = ensureStub();
    host.hidden = isOverview;
    if (!isOverview) {
      host.innerHTML = pageHtml(page);
      wirePage(host, page);
    } else {
      animateOverview();
      $('[data-species]')?.classList.add('is-on');
      $('[data-soil]')?.classList.add('is-on');
      $$('.cr-barplot').forEach((p) => p.classList.add('is-on'));
    }
  });

  // pause leaf sway offscreen
  const leaves = $('.cr-hero-leaves');
  if (leaves && window.DB?.onVisible) {
    window.DB.onVisible(leaves, (vis) => {
      leaves.style.animationPlayState = vis && !reduce ? 'running' : 'paused';
    });
  }

  
/* === DB multipage polish (dense kit) === */
(function wirePages() {
  const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"tasks","name":"Tasks","pattern":"Board"},{"id":"sites","name":"Sites","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Canopy Reforest" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
