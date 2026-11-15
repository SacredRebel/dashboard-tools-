/* Starter app. Replace BRAND, PAGES, DATA and the render functions with the brief's content.
   No build step, no dependencies, no polling. State lives in memory for the session. */
(() => {
  const BRAND = 'Northwind Studio';
  const STAGES = ['New enquiry', 'Call booked', 'Proposal sent', 'Won'];
  const DATA = {
    records: [
      { id: 'r1', name: 'Amara Whitlock', what: 'Brand refresh', stage: 'Proposal sent', value: 4800, next: 'Follow up on proposal', due: 'Today' },
      { id: 'r2', name: 'Kenji Dahl', what: 'Website build', stage: 'Call booked', value: 9200, next: 'Discovery call', due: 'Tomorrow' },
      { id: 'r3', name: 'Sofia Oyelaran', what: 'Launch campaign', stage: 'New enquiry', value: 3100, next: 'Reply to enquiry', due: 'Today' },
      { id: 'r4', name: 'Tomas Merino', what: 'Packaging design', stage: 'Won', value: 6400, next: 'Send kickoff plan', due: 'Fri' },
      { id: 'r5', name: 'Lena Hart', what: 'Photo shoot', stage: 'New enquiry', value: 1900, next: 'Send price guide', due: 'Mon' },
    ],
    trend: [12, 14, 13, 17, 16, 21, 24, 23, 28, 31, 30, 36],
  };
  const PAGES = [
    { id: 'overview', name: 'Today', title: 'Today', sub: 'What needs you first.' },
    { id: 'clients', name: 'Clients', title: 'Clients', sub: 'Everyone you are working with.' },
    { id: 'pipeline', name: 'Pipeline', title: 'Pipeline', sub: 'Move each client one step forward.' },
    { id: 'settings', name: 'Settings', title: 'Settings', sub: 'Preferences and data.' },
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$' + n.toLocaleString('en-US');
  const view = $('[data-view]');
  const ui = { q: '', sort: 'name', dir: 1, state: 'ready' };
  let lastFocus = null;

  $('[data-brand]').textContent = BRAND;
  $('[data-nav]').innerHTML = PAGES.map((p) => `<a href="#/${p.id}">${esc(p.name)}</a>`).join('');

  function toast(msg) { const t = $('[data-toast]'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2600); }

  /* Every data view goes through this, so loading, empty and error states always exist. */
  function withState(items, emptyMsg, render) {
    if (ui.state === 'loading') return '<div class="skel"></div>'.repeat(4);
    if (ui.state === 'error') return `<div class="state"><p>We couldn't load this. Check your connection and try again.</p><button class="btn" data-act="retry">Try again</button></div>`;
    if (ui.state === 'empty' || !items.length) return `<div class="state"><p>${esc(emptyMsg)}</p><button class="btn primary" data-act="add">Add a client</button></div>`;
    return render(items);
  }

  function chart(values) {
    const w = 600, h = 180, max = Math.max(...values), min = Math.min(...values);
    const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 16 - ((v - min) / (max - min || 1)) * (h - 32)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Enquiries per week, rising from ${values[0]} to ${values.at(-1)}">
      <line x1="0" y1="${h - 16}" x2="${w}" y2="${h - 16}"/><path class="area" d="${d} L ${w} ${h - 16} L 0 ${h - 16} Z"/><path class="line" pathLength="1" d="${d}"/></svg>`;
  }

  const renderers = {
    overview() {
      const r = DATA.records, open = r.filter((x) => x.stage !== 'Won');
      const due = r.filter((x) => x.due === 'Today');
      return `<div class="grid kpis">
          <div class="card kpi"><span>Active clients</span><b class="num">${r.length}</b><small>${open.length} in progress</small></div>
          <div class="card kpi"><span>Open pipeline</span><b class="num">${money(open.reduce((s, x) => s + x.value, 0))}</b><small>across ${open.length} clients</small></div>
          <div class="card kpi"><span>Due today</span><b class="num">${due.length}</b><small>next steps</small></div>
          <div class="card kpi"><span>Won this month</span><b class="num">${money(r.filter((x) => x.stage === 'Won').reduce((s, x) => s + x.value, 0))}</b><small>1 client</small></div>
        </div>
        <div class="grid two">
          <section class="card"><div class="card-head"><h2>Needs attention</h2><a class="muted" href="#/clients">See all clients</a></div>
            <div class="rows">${withState(due, 'Nothing is due today.', (items) => items.map((x) => `<button class="row" data-open="${x.id}"><span>${esc(x.next)}<small>${esc(x.name)} · ${esc(x.what)}</small></span><span class="chip">${esc(x.due)}</span></button>`).join(''))}</div></section>
          <section class="card"><div class="card-head"><h2>Enquiries per week</h2><span class="muted">Last 12 weeks</span></div>${chart(DATA.trend)}</section>
        </div>`;
    },
    clients() {
      const q = ui.q.toLowerCase();
      const rows = DATA.records.filter((x) => (x.name + x.what + x.stage).toLowerCase().includes(q))
        .sort((a, b) => (a[ui.sort] > b[ui.sort] ? 1 : -1) * ui.dir);
      const th = (k, label) => `<th aria-sort="${ui.sort === k ? (ui.dir > 0 ? 'ascending' : 'descending') : 'none'}"><button data-sort="${k}">${label}</button></th>`;
      return `<div class="toolbar"><input class="field" type="search" placeholder="Search clients" aria-label="Search clients" value="${esc(ui.q)}" data-q><button class="btn primary" data-act="add">Add a client</button></div>
        <div class="card table-wrap">${withState(rows, ui.q ? `No clients match "${ui.q}". Clear the search to see everyone.` : 'No clients yet.', (items) => `<table><thead><tr>${th('name', 'Client')}${th('what', 'Project')}${th('stage', 'Stage')}${th('value', 'Value')}</tr></thead>
          <tbody>${items.map((x) => `<tr tabindex="0" data-open="${x.id}"><td>${esc(x.name)}</td><td>${esc(x.what)}</td><td><span class="chip">${esc(x.stage)}</span></td><td class="num">${money(x.value)}</td></tr>`).join('')}</tbody></table>`)}</div>`;
    },
    pipeline() {
      return `<div class="grid board">${STAGES.map((s) => { const items = DATA.records.filter((x) => x.stage === s);
        return `<section class="col"><h2><span>${esc(s)}</span><span class="num">${items.length}</span></h2>${items.map((x) => `<article class="tile"><button class="row" data-open="${x.id}"><span>${esc(x.name)}<small>${esc(x.what)} · ${money(x.value)}</small></span></button>
          <label class="field-label">Move to<select class="field" data-move="${x.id}">${STAGES.map((o) => `<option${o === s ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label></article>`).join('') || '<p class="muted">Nobody here yet.</p>'}</section>`; }).join('')}</div>`;
    },
    settings() {
      return `<section class="card grid"><h2>Preview a state</h2><p class="muted">For reviewing the design. Every list can show each of these.</p>
        <label class="field-label">Data state<select class="field" data-state>${['ready', 'loading', 'empty', 'error'].map((s) => `<option${ui.state === s ? ' selected' : ''}>${s}</option>`).join('')}</select></label></section>`;
    },
  };

  function openDrawer(id) {
    const x = DATA.records.find((r) => r.id === id) || { id: '', name: '', what: '', stage: STAGES[0], value: 0, next: '', due: 'Today' };
    lastFocus = document.activeElement;
    $('[data-drawer-panel]').innerHTML = `<h2 id="drawer-title">${x.id ? esc(x.name) : 'Add a client'}</h2>
      <form class="grid" data-form="${x.id}" novalidate>
        <label class="field-label">Name<input class="field" name="name" value="${esc(x.name)}" required aria-describedby="err-name"><span id="err-name" role="alert"></span></label>
        <label class="field-label">Project<input class="field" name="what" value="${esc(x.what)}"></label>
        <label class="field-label">Stage<select class="field" name="stage">${STAGES.map((o) => `<option${o === x.stage ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>
        <label class="field-label">Next step<input class="field" name="next" value="${esc(x.next)}"></label>
        <div class="top-actions"><button class="btn primary">Save client</button><button type="button" class="btn" data-act="close">Cancel</button></div>
      </form>`;
    $('[data-drawer]').hidden = false; $('[data-drawer-panel] input').focus();
  }
  function closeDrawer() { $('[data-drawer]').hidden = true; lastFocus?.focus(); }

  function route() {
    const id = location.hash.replace(/^#\/?/, '') || PAGES[0].id;
    const page = PAGES.find((p) => p.id === id) || PAGES[0];
    document.querySelectorAll('[data-nav] a').forEach((a) => a.toggleAttribute('aria-current', a.hash === '#/' + page.id));
    document.querySelectorAll('[data-nav] a[aria-current]').forEach((a) => a.setAttribute('aria-current', 'page'));
    $('[data-title]').textContent = page.title; $('[data-subtitle]').textContent = page.sub;
    document.title = `${page.name} · ${BRAND}`;
    view.innerHTML = renderers[page.id]();
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open],[data-act],[data-sort]'); if (!t) { if (e.target.matches('[data-drawer]')) closeDrawer(); return; }
    if (t.dataset.open) openDrawer(t.dataset.open);
    else if (t.dataset.sort) { ui.dir = ui.sort === t.dataset.sort ? -ui.dir : 1; ui.sort = t.dataset.sort; route(); }
    else if (t.dataset.act === 'add') openDrawer('');
    else if (t.dataset.act === 'close') closeDrawer();
    else if (t.dataset.act === 'retry') { ui.state = 'ready'; route(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('[data-drawer]').hidden) closeDrawer();
    if (e.key === 'Enter' && e.target.matches('tr[data-open]')) openDrawer(e.target.dataset.open);
    if (e.key === 'Tab' && !$('[data-drawer]').hidden) { /* keep focus inside the drawer */
      const f = [...$('[data-drawer-panel]').querySelectorAll('input,select,button')]; const first = f[0], last = f.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('input', (e) => { if (e.target.matches('[data-q]')) { ui.q = e.target.value; route(); const q = $('[data-q]'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); } });
  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-move]')) { const r = DATA.records.find((x) => x.id === e.target.dataset.move); r.stage = e.target.value; route(); toast(`${r.name} moved to ${r.stage}`); }
    if (e.target.matches('[data-state]')) { ui.state = e.target.value; toast(`Showing the ${ui.state} state on every list`); }
  });
  document.addEventListener('submit', (e) => {
    e.preventDefault(); const f = e.target, d = Object.fromEntries(new FormData(f));
    if (!d.name.trim()) { $('#err-name').textContent = 'Enter the client’s name.'; f.name.focus(); return; }
    const id = f.dataset.form; if (id) Object.assign(DATA.records.find((r) => r.id === id), d); else DATA.records.push({ id: 'r' + Date.now(), value: 0, due: 'Today', ...d });
    closeDrawer(); route(); toast(`${d.name} saved`);
  });
  window.addEventListener('hashchange', route);
  route();
  document.documentElement.dataset.ready = 'true';
})();
