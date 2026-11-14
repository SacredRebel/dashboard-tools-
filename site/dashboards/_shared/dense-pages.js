/**
 * Dense secondary-page kit for gallery dashboards.
 * Replaces [data-db-stub] placeholders with full screens that pass density gates.
 *
 * Usage (after DB.route is available):
 *   const pages = DB.dense.mount({
 *     main: document.querySelector('main'),
 *     overview: document.querySelector('[data-page-panel="overview"]'),
 *     pages: catalogPages,
 *     brand: 'Mallow',
 *     accentClass: 'mw', // optional CSS prefix hooks via data-dense
 *   });
 */
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function kpiRow(items) {
    return `<div class="db-dense-kpis">${items.map((k) =>
      `<div class="db-dense-kpi" data-fx="reveal"><b class="num" data-fx="count" data-to="${esc(k.to)}" data-decimals="${k.decimals || 0}" data-suffix="${esc(k.suffix || '')}">${esc(k.label)}</b><span>${esc(k.cap)}</span></div>`
    ).join('')}</div>`;
  }

  function listCard(title, rows) {
    return `<section class="db-dense-card mat-clay" data-fx="reveal spotlight">
      <div class="db-dense-head"><h2>${esc(title)}</h2><span class="db-dense-muted">Sample</span></div>
      <div class="db-dense-list">${rows.map((r) =>
        `<article tabindex="0" data-row="${esc(r.id || r.k)}"><span>${esc(r.k)}</span><strong class="num">${esc(r.v)}</strong></article>`
      ).join('')}</div>
    </section>`;
  }

  function tableCard(title, cols, rows) {
    return `<section class="db-dense-card db-dense-wide mat-clay" data-fx="reveal">
      <div class="db-dense-head"><h2>${esc(title)}</h2>
        <input type="search" class="db-dense-search" placeholder="Search" aria-label="Search ${esc(title)}" data-dense-q>
      </div>
      <table class="db-dense-table"><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody data-dense-tbody>${rows.map((r) =>
        `<tr tabindex="0" data-id="${esc(r.id)}">${r.cells.map((c) => `<td>${c}</td>`).join('')}</tr>`
      ).join('')}</tbody></table>
      <p class="db-dense-empty" data-dense-empty hidden>No rows match. Clear search or try another term.</p>
    </section>`;
  }

  function chartCard(title, kind) {
    return `<section class="db-dense-card db-dense-span6 mat-clay" data-fx="reveal">
      <div class="db-dense-head"><h2>${esc(title)}</h2></div>
      <div class="db-dense-chart" data-fx="draw" data-dense-chart="${esc(kind)}" role="img" aria-label="${esc(title)} chart"></div>
    </section>`;
  }

  function pageShell(page, brand, body) {
    return `<section class="db-dense-page" data-db-page="${esc(page.id)}" data-dense aria-labelledby="db-dense-h">
      <div class="db-dense-top">
        <div>
          <h1 id="db-dense-h">${esc(page.name)}</h1>
          <p class="db-dense-lead">${esc(brand)} · ${esc(page.pattern)} · sample data · fictional.</p>
        </div>
        <div class="db-dense-tools">
          <div class="db-dense-seg" role="group" aria-label="Range" data-dense-range>
            <button type="button" data-v="7d" aria-pressed="true">7 days</button>
            <button type="button" data-v="30d" aria-pressed="false">30 days</button>
          </div>
          <div class="db-dense-seg" role="group" aria-label="View state" data-dense-state>
            <button type="button" data-v="ready" aria-pressed="true">Ready</button>
            <button type="button" data-v="loading" aria-pressed="false">Loading</button>
            <button type="button" data-v="empty" aria-pressed="false">Empty</button>
            <button type="button" data-v="error" aria-pressed="false">Error</button>
          </div>
        </div>
      </div>
      <div data-dense-body>${body}</div>
    </section>`;
  }

  function defaultBody(page) {
    const seed = [
      { id: 'a1', cells: ['North wind', 'Active', '<span class="num">128</span>'] },
      { id: 'a2', cells: ['Cedar lane', 'Active', '<span class="num">96</span>'] },
      { id: 'a3', cells: ['Harbor desk', 'Paused', '<span class="num">44</span>'] },
      { id: 'a4', cells: ['Maple booth', 'Active', '<span class="num">72</span>'] },
      { id: 'a5', cells: ['Iris bay', 'Review', '<span class="num">51</span>'] },
      { id: 'a6', cells: ['Quartz loft', 'Active', '<span class="num">83</span>'] },
      { id: 'a7', cells: ['Pine annex', 'Active', '<span class="num">67</span>'] },
      { id: 'a8', cells: ['Saffron nook', 'Paused', '<span class="num">29</span>'] },
    ];
    const rows = [
      { k: 'Open items', v: '14' }, { k: 'This week', v: '38' }, { k: 'Exceptions', v: '2' },
      { k: 'Owners', v: '6' }, { k: 'Avg cycle', v: '18h' }, { k: 'SLA', v: '97%' },
      { k: 'Backlog', v: '9' }, { k: 'Done', v: '121' },
    ];
    return `
      ${kpiRow([
        { to: 128, cap: 'Primary metric', label: '128' },
        { to: 86, cap: 'Health score', label: '86' },
        { to: 14, cap: 'Open', label: '14' },
        { to: 4.2, decimals: 1, cap: 'Hours saved', label: '4.2' },
      ])}
      ${tableCard(`${page.name} register`, ['Name', 'Status', 'Score'], seed)}
      ${chartCard('Trend', 'line')}
      ${chartCard('Mix', 'bars')}
      ${listCard('Highlights', rows)}
      ${listCard('Next actions', [
        { k: 'Review exceptions', v: 'Today' }, { k: 'Export pack', v: 'CSV' },
        { k: 'Assign owners', v: '2 left' }, { k: 'Sync devices', v: 'Ok' },
        { k: 'Approve draft', v: 'Gate' }, { k: 'Archive stale', v: '3' },
      ])}
      <section class="db-dense-card db-dense-full mat-clay" data-fx="reveal">
        <div class="db-dense-head"><h2>Notes</h2></div>
        <p class="db-dense-lead">Filter, search and open a row for detail. Esc closes the drawer. All figures are fictional sample data.</p>
        <div class="db-dense-list">
          <article><span>Last sync</span><strong class="num">2m ago</strong></article>
          <article><span>Workspace</span><strong>Gallery</strong></article>
          <article><span>Region</span><strong>US-West</strong></article>
          <article><span>Retention</span><strong>14 days</strong></article>
        </div>
      </section>
      <div class="db-dense-scrim" data-dense-scrim hidden></div>
      <aside class="db-dense-drawer" data-dense-drawer hidden role="dialog" aria-modal="true" aria-labelledby="db-dense-dh">
        <h2 id="db-dense-dh">Row detail</h2>
        <p data-dense-drawer-body></p>
        <button type="button" class="db-dense-btn" data-dense-drawer-close>Close detail</button>
      </aside>`;
  }

  function paintCharts(root) {
    root.querySelectorAll('[data-dense-chart]').forEach((el) => {
      const kind = el.dataset.denseChart;
      if (kind === 'bars') {
        el.innerHTML = `<svg viewBox="0 0 200 80" width="100%" height="80" aria-hidden="true">${[40, 55, 35, 70, 48, 62, 50].map((h, i) =>
          `<rect class="fx-draw-bar" x="${12 + i * 26}" y="${80 - h}" width="16" height="${h}" rx="4" fill="currentColor" opacity="0.75"/>`
        ).join('')}</svg>`;
      } else {
        el.innerHTML = `<svg viewBox="0 0 200 80" width="100%" height="80" aria-hidden="true">
          <path class="fx-draw-line line" d="M8 60 C40 20 70 70 100 40 S160 10 192 28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>`;
      }
    });
  }

  function wire(host) {
    const body = host.querySelector('[data-dense-body]');
    const readyHtml = body?.innerHTML;
    const state = host.querySelector('[data-dense-state]');
    const setState = (v) => {
      if (!body) return;
      if (v === 'loading') body.innerHTML = `<div class="db-dense-card db-dense-full" role="status"><p>Loading…</p><div class="db-dense-skel"></div><div class="db-dense-skel"></div><div class="db-dense-skel"></div></div>`;
      else if (v === 'empty') body.innerHTML = `<div class="db-dense-card db-dense-full"><p>Nothing here yet.</p><button type="button" class="db-dense-btn" data-dense-fill>Load sample rows</button></div>`;
      else if (v === 'error') body.innerHTML = `<div class="db-dense-card db-dense-full"><p>Could not load this page. Check the sample feed and retry.</p><button type="button" class="db-dense-btn" data-dense-retry>Retry</button></div>`;
      else { body.innerHTML = readyHtml; paintCharts(host); bindTable(host); }
      body.querySelector('[data-dense-fill],[data-dense-retry]')?.addEventListener('click', () => setState('ready'));
    };
    state?.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      state.querySelectorAll('button[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      setState(b.dataset.v);
    });
    host.querySelector('[data-dense-range]')?.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      host.querySelectorAll('[data-dense-range] button[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    });
    paintCharts(host);
    bindTable(host);
  }

  function bindTable(host) {
    const q = host.querySelector('[data-dense-q]');
    const tbody = host.querySelector('[data-dense-tbody]');
    const empty = host.querySelector('[data-dense-empty]');
    const drawer = host.querySelector('[data-dense-drawer]');
    const scrim = host.querySelector('[data-dense-scrim]');
    if (!tbody) return;
    const rows = [...tbody.querySelectorAll('tr')];
    const filter = () => {
      const term = (q?.value || '').trim().toLowerCase();
      let n = 0;
      rows.forEach((tr) => {
        const show = !term || tr.textContent.toLowerCase().includes(term);
        tr.hidden = !show; if (show) n++;
      });
      if (empty) empty.hidden = n > 0;
    };
    q?.addEventListener('input', filter);
    const open = (tr) => {
      if (!drawer) return;
      host.querySelector('[data-dense-drawer-body]').textContent = `${tr.textContent.replace(/\s+/g, ' ').trim()}. Sample detail · fictional.`;
      drawer.hidden = scrim.hidden = false;
      const prev = document.activeElement;
      const close = () => {
        drawer.hidden = scrim.hidden = true;
        document.removeEventListener('keydown', onKey);
        prev?.focus?.();
      };
      const onKey = (e) => { if (e.key === 'Escape') close(); };
      document.addEventListener('keydown', onKey);
      host.querySelector('[data-dense-drawer-close]').onclick = close;
      scrim.onclick = close;
      host.querySelector('[data-dense-drawer-close]').focus();
    };
    rows.forEach((tr) => {
      tr.addEventListener('click', () => open(tr));
      tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(tr); });
    });
  }

  function mount(opts) {
    const main = opts.main;
    const overview = opts.overview;
    const list = opts.pages;
    const brand = opts.brand || 'Dashboard';
    let host = main.querySelector('[data-db-page-host]');
    if (!host) {
      host = document.createElement('div');
      host.setAttribute('data-db-page-host', '');
      host.hidden = true;
      main.appendChild(host);
    }
    // Remove any leftover stubs
    main.querySelectorAll('[data-db-stub]').forEach((el) => el.remove());

    if (!window.DB?.route) throw new Error('DB.route required');
    window.DB.route(list, (id, page) => {
      const isOverview = id === 'overview' || id === list[0].id;
      if (overview) overview.hidden = !isOverview;
      host.hidden = isOverview;
      if (!isOverview) {
        const custom = opts.renderPage?.(page);
        host.innerHTML = pageShell(page, brand, custom || defaultBody(page));
        wire(host);
        if (window.DB?.fx) window.DB.fx.remount(host);
        if (window.DB?.icons) window.DB.icons.paint(host);
      } else if (window.DB?.fx) {
        window.DB.fx.remount(overview || main);
      }
    });
    return { host };
  }

  window.DB = window.DB || {};
  window.DB.dense = { mount, defaultBody, pageShell };
})();
