/**
 * Shared UI primitives + secondary-page mount (replaces dense-pages).
 * Classes use db-ui-* only — never db-dense-*.
 */
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function segmented(opts) {
    const items = opts.items || [];
    const name = opts.name || 'seg';
    return `<div class="db-ui-seg" role="group" aria-label="${esc(opts.label || name)}" data-ui-seg="${esc(name)}">
      ${items.map((it, i) => `<button type="button" data-v="${esc(it.value)}" aria-pressed="${i === (opts.active || 0) ? 'true' : 'false'}">${esc(it.label)}</button>`).join('')}
    </div>`;
  }

  function field(opts) {
    const id = opts.id || `f-${Math.random().toString(36).slice(2, 8)}`;
    const tag = opts.multiline ? 'textarea' : opts.options ? 'select' : 'input';
    let control = '';
    if (tag === 'select') {
      control = `<select id="${id}" name="${esc(opts.name || id)}">${(opts.options || []).map((o) =>
        `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select>`;
    } else if (tag === 'textarea') {
      control = `<textarea id="${id}" name="${esc(opts.name || id)}" rows="${opts.rows || 3}">${esc(opts.value || '')}</textarea>`;
    } else {
      control = `<input id="${id}" name="${esc(opts.name || id)}" type="${esc(opts.type || 'text')}" value="${esc(opts.value || '')}" placeholder="${esc(opts.placeholder || '')}">`;
    }
    return `<div class="db-ui-field"><label for="${id}">${esc(opts.label || '')}</label>${control}</div>`;
  }

  function table(opts) {
    const cols = opts.cols || [];
    const rows = opts.rows || [];
    return `<div class="db-ui-table-wrap">
      <table class="db-ui-table">
        <thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
        <tbody data-ui-tbody>${rows.map((r) =>
          `<tr tabindex="0" data-id="${esc(r.id || '')}">${(r.cells || []).map((c) => `<td>${c}</td>`).join('')}</tr>`
        ).join('')}</tbody>
      </table>
      <p class="db-ui-lede" data-ui-empty hidden>No rows match. Clear search or try another term.</p>
    </div>`;
  }

  function calendar(opts) {
    const days = opts.days || 28;
    const active = opts.active || 1;
    let html = '<div class="db-ui-cal" role="group" aria-label="Calendar">';
    for (let d = 1; d <= days; d++) {
      html += `<button type="button" class="db-ui-cal-day" data-day="${d}" aria-pressed="${d === active ? 'true' : 'false'}">${d}</button>`;
    }
    return html + '</div>';
  }

  function skeleton(n = 3) {
    return Array.from({ length: n }, () => '<div class="db-ui-skel" role="presentation"></div>').join('');
  }

  function toast(msg) {
    let el = document.querySelector('[data-ui-toast]');
    if (!el) {
      el = document.createElement('div');
      el.className = 'db-ui-toast';
      el.dataset.uiToast = '';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(() => { el.hidden = true; }, 2200);
  }

  function drawerOpen(host, title, body) {
    let scrim = host.querySelector('[data-ui-scrim]');
    let drawer = host.querySelector('[data-ui-drawer]');
    if (!scrim) {
      scrim = document.createElement('div');
      scrim.className = 'db-ui-scrim';
      scrim.dataset.uiScrim = '';
      scrim.hidden = true;
      host.appendChild(scrim);
    }
    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.className = 'db-ui-drawer';
      drawer.dataset.uiDrawer = '';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-modal', 'true');
      drawer.hidden = true;
      drawer.innerHTML = `<h2 data-ui-drawer-title></h2><div data-ui-drawer-body></div><button type="button" class="db-ui-btn" data-ui-drawer-close>Close detail</button>`;
      host.appendChild(drawer);
    }
    drawer.querySelector('[data-ui-drawer-title]').textContent = title;
    drawer.querySelector('[data-ui-drawer-body]').textContent = body;
    drawer.hidden = scrim.hidden = false;
    const prev = document.activeElement;
    const close = () => {
      drawer.hidden = scrim.hidden = true;
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    drawer.querySelector('[data-ui-drawer-close]').onclick = close;
    scrim.onclick = close;
    drawer.querySelector('[data-ui-drawer-close]').focus();
  }

  function domainRows(page, brand) {
    const label = page.name || 'Workspace';
    const seed = [
      { id: 'r1', cells: [`North ${label}`, 'Active', '<span class="num">128</span>'] },
      { id: 'r2', cells: [`Harbor desk`, 'Active', '<span class="num">96</span>'] },
      { id: 'r3', cells: [`Summit lane`, 'Paused', '<span class="num">44</span>'] },
      { id: 'r4', cells: [`Cedar mill`, 'Active', '<span class="num">72</span>'] },
      { id: 'r5', cells: [`River court`, 'Review', '<span class="num">51</span>'] },
      { id: 'r6', cells: [`Maple yard`, 'Active', '<span class="num">83</span>'] },
      { id: 'r7', cells: [`Pine ridge`, 'Active', '<span class="num">67</span>'] },
      { id: 'r8', cells: [`Oak terrace`, 'Paused', '<span class="num">29</span>'] },
    ];
    return `
      <div class="db-ui-grid">
        <div class="db-ui-panel db-ui-kpi"><b class="num" data-fx="count" data-to="128">128</b><span>Primary metric</span></div>
        <div class="db-ui-panel db-ui-kpi"><b class="num" data-fx="count" data-to="86">86</b><span>Health score</span></div>
        <div class="db-ui-panel db-ui-kpi"><b class="num" data-fx="count" data-to="14">14</b><span>Open items</span></div>
        <div class="db-ui-panel db-ui-kpi"><b class="num" data-fx="count" data-to="4.2" data-decimals="1">4.2</b><span>Hours saved</span></div>
      </div>
      <section class="db-ui-panel" style="margin-top:1rem" data-fx="reveal">
        <h2>${esc(label)} register</h2>
        <div class="db-ui-field" data-ui-search-wrap><label for="ui-q">Search</label><input id="ui-q" name="q" type="search" placeholder="Filter rows" aria-label="Filter rows"></div>
        ${table({ cols: ['Name', 'Status', 'Score'], rows: seed })}
      </section>
      <section class="db-ui-panel" style="margin-top:1rem" data-fx="reveal">
        <h2>Schedule</h2>
        ${calendar({ days: 28, active: 12 })}
      </section>
      <section class="db-ui-panel" style="margin-top:1rem" data-fx="reveal">
        <h2>Notes</h2>
        <p class="db-ui-lede">${esc(brand)} · ${esc(page.pattern || 'Page')} · fictional sample data. Open a row for detail. Esc closes the drawer.</p>
        <div class="db-ui-grid">
          <div><span class="db-ui-lede">Last sync</span><strong class="num">2m ago</strong></div>
          <div><span class="db-ui-lede">Workspace</span><strong>Gallery</strong></div>
          <div><span class="db-ui-lede">Region</span><strong>US-West</strong></div>
          <div><span class="db-ui-lede">Retention</span><strong>14 days</strong></div>
        </div>
      </section>`;
  }

  function pageShell(page, brand, body, { settingsStates = false } = {}) {
    const tools = settingsStates
      ? `<div class="db-ui-seg" role="group" aria-label="View state" data-ui-state>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>`
      : '';
    return `<section class="db-ui-page" data-db-page="${esc(page.id)}" aria-labelledby="db-ui-h">
      <div class="db-ui-page-head">
        <div>
          <h1 id="db-ui-h">${esc(page.name)}</h1>
          <p class="db-ui-lede">${esc(brand)} · ${esc(page.pattern || 'Page')} · fictional sample data.</p>
        </div>
        ${tools}
      </div>
      <div data-ui-body>${body}</div>
    </section>`;
  }

  function wire(host) {
    const body = host.querySelector('[data-ui-body]');
    const readyHtml = body?.innerHTML;
    const state = host.querySelector('[data-ui-state]');
    const setState = (v) => {
      if (!body) return;
      if (v === 'loading') body.innerHTML = `<div class="db-ui-panel" role="status"><p>Loading…</p>${skeleton(4)}</div>`;
      else if (v === 'empty') body.innerHTML = `<div class="db-ui-panel"><p>Nothing here yet.</p><button type="button" class="db-ui-btn db-ui-btn-primary" data-ui-fill>Load sample rows</button></div>`;
      else if (v === 'error') body.innerHTML = `<div class="db-ui-panel"><p>Could not load this page. Check the sample feed and retry.</p><button type="button" class="db-ui-btn" data-ui-retry>Retry</button></div>`;
      else { body.innerHTML = readyHtml; bindTable(host); }
      body.querySelector('[data-ui-fill],[data-ui-retry]')?.addEventListener('click', () => setState('ready'));
    };
    state?.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      state.querySelectorAll('button[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      setState(b.dataset.v);
    });
    host.querySelectorAll('[data-ui-seg]').forEach((g) => {
      g.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-v]'); if (!b) return;
        g.querySelectorAll('button[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
    });
    bindTable(host);
  }

  function bindTable(host) {
    const q = host.querySelector('[data-ui-search-wrap] input, #ui-q');
    const tbody = host.querySelector('[data-ui-tbody]');
    const empty = host.querySelector('[data-ui-empty]');
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
    rows.forEach((tr) => {
      const open = () => drawerOpen(host, 'Row detail', `${tr.textContent.replace(/\s+/g, ' ').trim()}. Sample detail · fictional.`);
      tr.addEventListener('click', open);
      tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
    });
    host.querySelectorAll('.db-ui-cal-day').forEach((b) => {
      b.addEventListener('click', () => {
        host.querySelectorAll('.db-ui-cal-day').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        toast(`Selected day ${b.dataset.day}`);
      });
    });
  }

  function resolveHost(opts) {
    const mainData = document.querySelector('main[data-main]');
    if (mainData) return mainData;
    const app = document.querySelector('[data-db-app]') || document.body;
    return app.querySelector('main') || document.querySelector('main') || opts.main || document.body;
  }

  function resolveOverview(host, opts) {
    if (opts.overview && host.contains(opts.overview) && opts.overview !== host) return opts.overview;
    const direct = host.querySelector(':scope > [data-page-panel="overview"]');
    if (direct) return direct;
    let ancestor = host.parentElement;
    while (ancestor) {
      if (ancestor.getAttribute?.('data-page-panel') === 'overview') {
        ancestor.removeAttribute('data-page-panel');
        ancestor.setAttribute('data-db-stage', '');
        break;
      }
      ancestor = ancestor.parentElement;
    }
    const nested = host.querySelector('[data-page-panel="overview"]');
    if (nested && nested !== host) return nested;
    return null;
  }

  function wireNavHashes(list) {
    const aliases = {
      home: 'overview', dashboard: 'overview', live: 'overview', search: 'overview',
      support: 'settings', settings: 'settings',
    };
    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (/^#\//.test(href) || /^https?:/i.test(href) || href.startsWith('mailto:')) return;
      const raw = ((a.getAttribute('aria-label') || '') + ' ' + (a.textContent || ''))
        .replace(/\s+/g, ' ').trim().toLowerCase();
      if (!raw) return;
      const label = raw.replace(/\b\d+\b/g, '').replace(/\s+/g, ' ').trim();
      const hit = list.find((p) => label === p.name.toLowerCase() || label === p.id
        || label.includes(p.name.toLowerCase()))
        || list.find((p) => aliases[label] === p.id);
      if (hit) a.setAttribute('href', `#/${hit.id}`);
      else if (/home|brand|logo/i.test(label) && list[0]) a.setAttribute('href', `#/${list[0].id}`);
    });
  }

  function mount(opts) {
    const main = resolveHost(opts);
    let overview = resolveOverview(main, opts);
    const list = opts.pages;
    const brand = opts.brand || 'Dashboard';

    if (!overview) {
      overview = document.createElement('div');
      overview.setAttribute('data-page-panel', 'overview');
      [...main.children].forEach((ch) => {
        if (ch.hasAttribute?.('data-db-stub') || ch.getAttribute?.('data-db-page-host') != null) return;
        overview.appendChild(ch);
      });
      main.insertBefore(overview, main.firstChild);
    }

    let host = [...main.children].find((ch) => ch.getAttribute?.('data-db-page-host') != null);
    main.querySelectorAll('[data-db-page-host]').forEach((el) => { if (el !== host) el.remove(); });
    if (!host) {
      host = document.createElement('div');
      host.setAttribute('data-db-page-host', '');
      host.hidden = true;
      main.appendChild(host);
    }
    main.querySelectorAll('[data-db-stub]').forEach((el) => el.remove());
    wireNavHashes(list);

    if (!window.DB?.route) throw new Error('DB.route required');
    window.DB.route(list, (id, page) => {
      const isOverview = id === 'overview' || id === list[0].id;
      if (overview) overview.hidden = !isOverview;
      host.hidden = isOverview;
      document.documentElement.dataset.dbShell = isOverview ? 'overview' : 'page';
      if (!isOverview) {
        const custom = opts.renderPage?.(page);
        const isSettings = page.id === 'settings' || page.pattern === 'Settings';
        host.innerHTML = pageShell(page, brand, custom || domainRows(page, brand), { settingsStates: isSettings });
        wire(host);
        if (window.DB?.fx) window.DB.fx.remount(host);
        if (window.DB?.icons) window.DB.icons.paint(host);
      } else if (window.DB?.fx) {
        window.DB.fx.remount(overview || main);
      }
    });
    return { host, main, overview };
  }

  window.DB = window.DB || {};
  window.DB.ui = {
    mount,
    segmented,
    field,
    table,
    calendar,
    skeleton,
    toast,
    drawerOpen,
    pageShell,
    domainRows,
    wireNavHashes,
  };
})();
