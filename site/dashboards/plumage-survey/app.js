/* Plumage Bird Survey: painted hero, regions, rings, species bars, multipage.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = $('[data-db-app]') || document.body;

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
  function seg(group, onChange) {
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      $$('button[data-v]', group).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onChange(b.dataset.v, b);
    });
  }
  function donut(parts, { size = 120, w = 14, gap = 1.5, round = false } = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0), r = (size - w) / 2, c = size / 2; let off = 0;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}"/>${parts.map((p) => {
      const len = (p.value / total) * 100, seg = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}" pathLength="100" stroke-dasharray="${Math.max(0.01, len - gap).toFixed(2)} ${(100 - len + gap).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})" style="stroke:var(${p.color})"${round ? ' stroke-linecap="round"' : ''}/>`;
      off += len; return seg;
    }).join('')}</svg>`;
  }
  const polar = (cx, cy, r, deg) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const arcPath = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  function arcGauge(pct, { size = 160, w = 12, from = -120, to = 120, color = '--accent' } = {}) {
    const c = size / 2, r = (size - w) / 2, end = from + (to - from) * Math.max(0, Math.min(1, pct));
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><path class="track" d="${arcPath(c, c, r, from, to)}" fill="none" stroke-width="${w}" stroke-linecap="round"/><path d="${arcPath(c, c, r, from, Math.max(end, from + 0.01))}" fill="none" stroke-width="${w}" stroke-linecap="round" style="stroke:var(${color})"/></svg>`;
  }
  function spark(vals, { color = '--chart-1', fill = 0.25, w = 120, h = 36 } = {}) {
    const mn = Math.min(...vals), mx = Math.max(...vals), pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 6)]);
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `pl-s${++sparkId}`;
    return `<svg class="pl-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }
  let sparkId = 0;

  const C = ['--p1', '--p2', '--p3', '--p4', '--p5', '--p6'];
  const REG = [
    { n: 'Estuary', c: '--p1', s: [31, 34, 33, 38, 41, 40, 44, 47, 45, 49, 52, 55] },
    { n: 'Dune heath', c: '--p2', s: [22, 24, 27, 26, 29, 31, 30, 33, 35, 34, 36, 38] },
    { n: 'Cliff coast', c: '--p4', s: [18, 19, 23, 27, 26, 30, 34, 33, 31, 35, 37, 36] },
    { n: 'Salt marsh', c: '--p5', s: [26, 25, 28, 30, 33, 32, 36, 39, 41, 40, 43, 46] },
  ];
  const SP = [
    { n: 'Ember lorikeet', v: 64 }, { n: 'Little tern', v: 412 }, { n: 'Bar-tailed godwit', v: 356 }, { n: 'Meadow pipit', v: 298 },
    { n: 'Marsh harrier', v: 141 }, { n: 'Sandwich tern', v: 226 }, { n: 'Kingfisher', v: 92 },
  ];
  const WHO = ['Aoife Brennan', 'Tomasz Nowak', 'Leilani Kahale', 'Ravi Menon', 'June Okafor', 'Sven Holm'];
  const LOG = [
    [1, 0, 2, 38], [3, 1, 0, 2], [0, 2, 0, 1], [2, 3, 3, 120], [5, 4, 1, 14], [4, 5, 3, 3], [1, 0, 1, 26], [6, 2, 0, 1], [3, 3, 2, 4], [2, 1, 3, 64], [1, 4, 0, 19], [0, 5, 0, 2],
  ].map(([s, w, r, c], i) => ({ s, w, r, c, d: -Math.floor(i / 2) }));
  let season = 'spring', pick = -1;
  const k = () => (season === 'spring' ? 1 : 0.82);

  function render() {
    $('[data-regions]').innerHTML = REG.map((r) => {
      const s = r.s.map((v) => Math.round(v * k()));
      return `<article class="pl-reg"><p>${r.n}<b class="num">${s[s.length - 1]}</b></p><div role="img" aria-label="${r.n}: ${s[0]} to ${s[s.length - 1]} species over 12 weeks">${spark(s, { color: r.c, fill: 0.45, w: 240, h: 70 })}</div></article>`;
    }).join('');
    const total = Math.round(112 * k());
    $('[data-total]').textContent = total;
    $('[data-totalnote]').textContent = season === 'spring' ? '+9 on last spring · 4 new to the site' : '−6 on last autumn · migrants left early';
    const cov = season === 'spring' ? 82 : 74, nest = season === 'spring' ? 67 : 58;
    $('[data-ring1]').innerHTML = `<div role="img" aria-label="${cov}% of transects surveyed">${arcGauge(cov, { size: 150, w: 14, from: -140, to: 140, color: '--p3' })}</div><b class="num">${cov}%</b>`;
    $('[data-ring2]').innerHTML = `<div role="img" aria-label="${nest}% nesting success">${arcGauge(nest, { size: 150, w: 14, from: -140, to: 140, color: '--p1' })}</div><b class="num">${nest}%</b>`;
    const HAB = [
      { n: 'Wetland', v: season === 'spring' ? 41 : 48, c: '--p1' },
      { n: 'Coast', v: season === 'spring' ? 33 : 30, c: '--p6' },
      { n: 'Heath', v: season === 'spring' ? 26 : 22, c: '--p4' },
    ];
    $('[data-donuts]').innerHTML = HAB.map((h) =>
      `<li><div role="img" aria-label="${h.n} ${h.v}%">${donut([{ value: h.v, color: h.c }, { value: 100 - h.v, color: '--surface-2' }], { size: 64, w: 8, gap: 0, round: true })}<b class="num">${h.v}%</b></div><span>${h.n}</span></li>`
    ).join('');
    const rows = SP.map((s, i) => ({ ...s, i, v: Math.round(s.v * k()) })).sort((a, b) => b.v - a.v), max = rows[0].v;
    $('[data-bars]').innerHTML = rows.map((s) =>
      `<li><button type="button" data-sp="${s.i}" aria-pressed="${s.i === pick}"><span>${s.n}</span><span class="pl-track" aria-hidden="true"><i style="width:${((s.v / max) * 100).toFixed(1)}%"></i></span><span class="num">${s.v}</span></button></li>`
    ).join('');
    renderLog();
  }

  function renderLog() {
    const list = LOG.filter((l) => pick < 0 || l.s === pick);
    $('[data-clear]').hidden = pick < 0;
    $('[data-logstate]').textContent = pick < 0 ? `Latest ${list.length} records from volunteers` : `${list.length} ${list.length === 1 ? 'record' : 'records'} of ${SP[pick].n}`;
    $('[data-log]').innerHTML = list.length
      ? list.map((l) => `<li><i style="background:var(${C[l.s % 6]})" aria-hidden="true"></i><span>${SP[l.s].n}<small>${WHO[l.w]} · ${REG[l.r].n} · ${l.d === 0 ? 'Today' : fmtDate(dayOffset(l.d), { weekday: 'short', day: 'numeric', month: 'short' })}</small></span><span class="num" aria-label="${l.c} birds">${l.c}</span></li>`).join('')
      : `<li class="pl-none">No records of ${SP[pick].n} yet this season. Pick another species or show all.</li>`;
  }

  seg($('[data-season]'), (v) => { season = v; render(); toast(`${v === 'spring' ? 'Spring' : 'Autumn'} season · sample`); });
  $('[data-bars]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sp]'); if (!b) return;
    const i = +b.dataset.sp;
    pick = pick === i ? -1 : i;
    render();
    toast(pick < 0 ? 'Showing all species' : `Filtered ${SP[i].n}`);
    $(`[data-sp="${i}"]`)?.focus();
  });
  $('[data-clear]').addEventListener('click', () => {
    const i = pick; pick = -1; render(); toast('Showing all species'); $(`[data-sp="${i}"]`)?.focus();
  });
  render();
  countUp($('[data-total]'), Math.round(112 * k()));

  function staggerReveal() {
    $$('.pl-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 40 * i}ms`);
      el.classList.add('pl-reveal-in');
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
    $$('.pl-pages a').forEach((a) => {
      const match = (a.getAttribute('href') || '') === `#/${id}`;
      if (match) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function pageHtml(page) {
    if (page.id === 'reports') {
      return `<section class="pl-page" data-db-page="reports" aria-labelledby="p-h">
        <h1 id="p-h">Reports</h1>
        <p class="pl-page-lead">Season summaries for the coastal survey. Sample data · fictional.</p>
        <div class="pl-page-grid">
          <article class="pl-page-card"><div class="pl-row"><span>Species this season</span><strong class="num">${Math.round(112 * k())}</strong></div></article>
          <article class="pl-page-card"><div class="pl-row"><span>Volunteer hours</span><strong class="num">486</strong></div></article>
          <article class="pl-page-card"><div class="pl-row"><span>Nesting success</span><strong class="num">${season === 'spring' ? 67 : 58}%</strong></div></article>
        </div>
        <button type="button" class="pl-btn" data-export-report>Export season report</button>
      </section>`;
    }
    if (page.id === 'segments') {
      return `<section class="pl-page" data-db-page="segments" aria-labelledby="p-h">
        <h1 id="p-h">Segments</h1>
        <p class="pl-page-lead">Transect regions and coverage. Sample data · fictional.</p>
        <div class="pl-page-seg" role="group" aria-label="Segments state" data-seg-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-seg-body></div>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="pl-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="pl-page-lead">Survey preferences and notification stubs.</p>
        <div class="pl-page-grid">
          <article class="pl-page-card"><div class="pl-row"><strong>Rare-bird alerts</strong><span>On</span></div></article>
          <article class="pl-page-card"><div class="pl-row"><strong>Volunteer digests</strong><span>Weekly</span></div></article>
          <article class="pl-page-card"><div class="pl-row"><strong>Public map</strong><span>Published</span></div></article>
        </div>
        <button type="button" class="pl-btn ghost" data-save-settings>Save preferences</button>
      </section>`;
    }
    return `<section class="pl-page"><h1>${page.name}</h1></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'reports') {
      host.querySelector('[data-export-report]')?.addEventListener('click', () => toast('Season report · sample'));
    }
    if (page.id === 'segments') {
      const body = host.querySelector('[data-seg-body]');
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="pl-loading" role="status"><p>Syncing segments…</p><div class="pl-skel"></div><div class="pl-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="pl-empty-block"><p>No transect segments configured.</p></div>`;
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="pl-error-block"><p>Could not load segments.</p><button type="button" class="pl-btn ghost" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="pl-page-grid">${REG.map((r) => {
          const last = Math.round(r.s[r.s.length - 1] * k());
          return `<article class="pl-page-card"><div class="pl-row"><strong>${r.n}</strong><span class="num pl-chip">${last}</span></div><p class="pl-meta">12-week species count</p></article>`;
        }).join('')}</div>`;
      };
      paint('ready');
      seg(host.querySelector('[data-seg-tabs]'), (v) => paint(v));
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
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Plumage Bird Survey" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
