/* =========================================================================
   Demo CRM: a working reference implementation of the framework.
   Vanilla JS, token-only styling (ui.css + demo.css). All data is fictional.
   CRM.mount(el, { theme, view, static, shortcuts })
   ========================================================================= */
(function () {
  const DAY = 86400000;
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const addDays = (n) => new Date(today().getTime() + n * DAY);
  const dayDiff = (d) => Math.round((new Date(d).setHours(0, 0, 0, 0) - today()) / DAY);
  const money = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);
  const short = (v) => (v >= 1000 ? '$' + (v / 1000).toFixed(v >= 10000 || v % 1000 === 0 ? 0 : 1) + 'k' : '$' + v);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = (n) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const fmtDate = (d) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(d));
  function relDue(d) {
    const n = dayDiff(d);
    if (n === 0) return 'Today';
    if (n === 1) return 'Tomorrow';
    if (n === -1) return 'Yesterday';
    if (n < 0) return `${-n} days overdue`;
    if (n < 7) return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(d));
    return fmtDate(d);
  }
  function relAgo(d) {
    const n = -dayDiff(d);
    if (n <= 0) return 'Today';
    if (n === 1) return 'Yesterday';
    if (n < 30) return `${n} days ago`;
    return fmtDate(d);
  }

  const STAGES = [
    { id: 'new', name: 'New inquiry', kind: 'open' },
    { id: 'disc', name: 'Discovery call', kind: 'open' },
    { id: 'prop', name: 'Proposal sent', kind: 'open' },
    { id: 'neg', name: 'Negotiating', kind: 'open' },
    { id: 'won', name: 'Won', kind: 'won' },
    { id: 'lost', name: 'Lost', kind: 'lost' },
  ];
  // name, company, stage, value, source, next step, due(+d), last activity(-d), days in stage, created(-d), wonAgo
  const RAW = [
    ['Maya Lindqvist', 'Harbor & Pine Interiors', 'prop', 8400, 'Referral', 'Send revised quote', -2, 5, 9, 21],
    ['Theo Marchetti', 'Marchetti Wines', 'disc', 3200, 'Instagram', 'Discovery call at 2 pm', 0, 2, 3, 8],
    ['Ava Chen', 'Northlight Studio', 'new', 2500, 'Website', 'Reply to inquiry', 0, 1, 1, 1],
    ['Jonah Reyes', 'Reyes Architecture', 'neg', 12600, 'Referral', 'Final terms call', 1, 3, 6, 34],
    ['Priya Nair', 'Bloom Wellness', 'prop', 5800, 'Event', 'Follow up on proposal', -1, 16, 16, 40],
    ['Lucas Ferreira', 'Casa Ferreira', 'new', 1800, 'Instagram', 'Book intro call', 2, 2, 2, 2],
    ['Sofia Rossi', 'Atelier Rossi', 'won', 9400, 'Referral', 'Kickoff meeting', 4, 1, 1, 30, 1],
    ['Elliot Park', 'Park & Co.', 'disc', 4100, 'Website', 'Send case studies', 3, 18, 18, 25],
    ['Hana Sato', 'Sato Ceramics', 'neg', 6900, 'Event', 'Contract review', 2, 4, 5, 28],
    ['Noah Williams', 'Williams Dental', 'lost', 7200, 'Website', '', null, 12, 12, 60],
    ['Clara Dubois', 'Maison Clara', 'won', 11200, 'Referral', 'Send welcome pack', 6, 9, 9, 52, 9],
    ['Ruben Ortiz', 'Ortiz Builders', 'new', 3600, 'Referral', 'Qualify budget', 1, 0, 0, 0],
    ['Isla Morgan', 'Morgan Events', 'prop', 4700, 'Website', 'Answer questions', 5, 4, 4, 15],
    ['Felix Brandt', 'Brandt Hotels', 'disc', 15800, 'Referral', 'Prepare discovery agenda', 6, 3, 3, 6],
    ['Nora Haddad', 'Haddad Florals', 'won', 3900, 'Instagram', 'Collect testimonial', 9, 14, 14, 45, 14],
    ['Oscar Lund', 'Lund Coffee', 'lost', 2400, 'Event', '', null, 20, 20, 50],
  ];
  function seed() {
    return RAW.map((r, i) => {
      const [name, company, stage, value, source, next, due, last, inStage, created, wonAgo] = r;
      const slug = name.toLowerCase().split(' ')[0];
      return {
        id: 'c' + (i + 1), name, company, stage, value, source, next,
        due: due == null ? null : addDays(due).toISOString(),
        last: addDays(-last).toISOString(),
        stageAt: addDays(-inStage).toISOString(),
        created: addDays(-created).toISOString(),
        wonAt: wonAgo != null ? addDays(-wonAgo).toISOString() : null,
        email: `${slug}@${company.toLowerCase().replace(/[^a-z]+/g, '')}.example`,
        phone: '+1 555 01' + String(10 + i).padStart(2, '0'),
        archived: false,
        activities: [
          { type: 'call', title: 'Call', body: 'Talked through scope and timeline. Interested; wants options.', at: addDays(-last).toISOString() },
          { type: 'email', title: 'Email sent', body: 'Shared portfolio and pricing guide.', at: addDays(-last - 3).toISOString() },
          { type: 'note', title: 'Created', body: `Came in via ${source}.`, at: addDays(-created).toISOString() },
        ],
      };
    });
  }

  // ---------------------------------------------------------------- tiny chart helpers (also used by Components page)
  function sparkline(points, color = 'var(--accent)') {
    const w = 64, h = 24, max = Math.max(...points), min = Math.min(...points);
    const xy = points.map((p, i) => [(i / (points.length - 1)) * w, h - 2 - ((p - min) / (max - min || 1)) * (h - 4)]);
    const d = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const last = xy[xy.length - 1];
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${last[0]}" cy="${last[1]}" r="2.5" fill="${color}"/></svg>`;
  }
  function hbars(items, opts = {}) {
    // HTML bars: text stays at real size (>= 12px) at any container width.
    const max = Math.max(...items.map((i) => i.value), 1);
    const row = (it) => {
      const inner = `<span class="hbar-label">${esc(it.label)}</span><span class="hbar-track"><span class="hbar-fill" style="width:${Math.max(1.5, (it.value / max) * 100).toFixed(1)}%;background:${it.color || 'var(--accent)'}"></span></span><span class="hbar-val">${esc(it.display || it.value)}</span>`;
      return it.action
        ? `<button class="hbar" data-act="goto-stage" data-stage="${it.id}" aria-label="${esc(it.label)}: ${esc(it.display || it.value)}. Open in pipeline">${inner}</button>`
        : `<div class="hbar" role="listitem" aria-label="${esc(it.label)}: ${esc(it.display || it.value)}">${inner}</div>`;
    };
    return `<div class="hbars" role="list" aria-label="${esc(opts.label || 'Bar chart')}">${items.map(row).join('')}</div>`;
  }
  function columns(series, opts = {}) {
    const max = Math.max(...series.map((s) => s.value), 1), n = series.length;
    return `<figure class="cols" aria-label="${esc(opts.label || 'Column chart')}" style="margin:0">
      <div class="cols-plot">${series.map((s, i) => `<div class="cols-bar"><span class="cols-val">${esc(s.display || s.value)}</span><span class="cols-fill" style="height:${((s.value / max) * 100).toFixed(1)}%;background:${i === n - 1 ? 'var(--accent)' : 'var(--chart-2)'};opacity:${i === n - 1 ? 1 : 0.5}"></span></div>`).join('')}</div>
      <div class="cols-axis">${series.map((s) => `<span>${esc(s.label)}</span>`).join('')}</div></figure>`;
  }

  // ---------------------------------------------------------------- mount
  function mount(root, opts = {}) {
    const st = {
      view: opts.view || 'today', clients: seed(), stages: STAGES.map((s) => ({ ...s })),
      q: '', stageFilter: '', attention: false, mode: 'board',
      quietDays: 14, followDays: 3, nav: false, undo: null,
    };
    root.classList.add('themed', 'crm');
    if (opts.theme) root.dataset.theme = opts.theme;

    const stageOf = (id) => st.stages.find((s) => s.id === id) || st.stages[0];
    const active = () => st.clients.filter((c) => !c.archived);
    const isOpen = (c) => stageOf(c.stage).kind === 'open';
    const overdue = (c) => isOpen(c) && c.due && dayDiff(c.due) < 0;
    const dueToday = (c) => isOpen(c) && c.due && dayDiff(c.due) === 0;
    const quiet = (c) => isOpen(c) && -dayDiff(c.last) >= st.quietDays;
    const stageBadge = (id) => {
      const s = stageOf(id);
      const cls = s.kind === 'won' ? 'badge-success' : s.kind === 'lost' ? 'badge' : id === 'neg' ? 'badge-warning' : id === 'prop' ? 'badge-info' : 'badge-accent';
      return `<span class="badge ${cls}">${esc(s.name)}</span>`;
    };

    // ---------------- shell
    function shell() {
      const counts = { pipeline: active().filter(isOpen).length, clients: active().length, today: active().filter((c) => overdue(c) || dueToday(c)).length };
      const link = (v, ic, label, n) => `<a href="#" data-nav="${v}" ${st.view === v ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span>${n != null ? `<span class="n num">${n}</span>` : ''}</a>`;
      return `<div class="crm-shell">
        <aside class="crm-side" aria-label="Main navigation">
          <div class="crm-brand"><div class="crm-brand-mark" aria-hidden="true">S</div><div><b>Studio</b><span>Client pipeline</span></div></div>
          <nav class="crm-nav" data-navlist>
            ${link('today', 'today', 'Today', counts.today || null)}
            ${link('pipeline', 'kanban', 'Pipeline', counts.pipeline)}
            ${link('clients', 'users', 'Clients', counts.clients)}
            ${link('settings', 'settings', 'Settings')}
          </nav>
          <div class="crm-side-foot"><div class="avatar">AN</div><div>Anna N.<span>Owner · sample data</span></div></div>
        </aside>
        <div class="crm-main">
          <header class="crm-top">
            <button class="btn btn-ghost btn-icon crm-menu-btn" data-act="toggle-nav" aria-label="Open menu">${icon('menu')}</button>
            <label class="search"><span class="vh">Search clients</span>${icon('search')}<input class="input" data-topsearch placeholder="Search clients" value="${esc(st.q)}" autocomplete="off"><span class="kbd" aria-hidden="true">/</span></label>
            <div class="crm-top-actions">
              <button class="btn btn-primary" data-act="add" title="Add client (N)">${icon('plus')}<span class="btn-label">Add client</span></button>
            </div>
          </header>
          <div class="crm-scroll" data-scroll><div class="crm-page" data-page></div></div>
        </div>
      </div>
      <div class="toasts" data-toasts aria-live="polite"></div>`;
    }

    // ---------------- views
    function viewToday() {
      const all = active();
      const open = all.filter(isOpen);
      const due = all.filter((c) => overdue(c) || dueToday(c));
      const od = all.filter(overdue).length;
      const pipeline = open.reduce((s, c) => s + c.value, 0);
      const wonMonth = all.filter((c) => c.wonAt && -dayDiff(c.wonAt) <= 30);
      const closed = all.filter((c) => stageOf(c.stage).kind !== 'open');
      const winRate = closed.length ? Math.round((closed.filter((c) => stageOf(c.stage).kind === 'won').length / closed.length) * 100) : 0;
      const hour = new Date().getHours();
      const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      const dateStr = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

      const attention = [
        ...all.filter(overdue).map((c) => ({ c, why: `${relDue(c.due)} · ${c.next}`, tone: 'danger' })),
        ...all.filter(dueToday).map((c) => ({ c, why: `Due today · ${c.next}`, tone: 'warning' })),
        ...all.filter((c) => quiet(c) && !overdue(c) && !dueToday(c)).map((c) => ({ c, why: `No activity for ${-dayDiff(c.last)} days`, tone: 'info' })),
      ];
      const upcoming = all.filter((c) => isOpen(c) && c.due && dayDiff(c.due) > 0 && dayDiff(c.due) <= 7).sort((a, b) => new Date(a.due) - new Date(b.due));
      const byStage = st.stages.filter((s) => s.kind === 'open').map((s, i) => {
        const v = open.filter((c) => c.stage === s.id).reduce((a, c) => a + c.value, 0);
        return { id: s.id, label: s.name, value: v, display: short(v), color: `var(--chart-${(i % 5) + 1})`, action: !opts.static };
      });

      const rowsHtml = attention.length ? attention.map(({ c, why, tone }) => `
        <div class="row">
          <div class="avatar">${initials(c.name)}</div>
          <div class="row-main"><button class="row-title linklike" data-open="${c.id}">${esc(c.name)} <span class="subtle">· ${esc(c.company)}</span></button><div class="row-sub" style="color:var(--${tone === 'info' ? 'text-muted' : tone})">${esc(why)}</div></div>
          <div class="row-actions">
            <button class="btn btn-sm" data-open="${c.id}" data-tab="activity">${icon('phone')}<span class="btn-label">Log</span></button>
            <button class="btn btn-ghost btn-sm btn-icon" data-act="snooze" data-id="${c.id}" aria-label="Snooze ${esc(c.name)} 1 day" title="Snooze 1 day">${icon('snooze')}</button>
          </div>
        </div>`).join('') : `<div class="empty"><div class="empty-icon">${icon('check')}</div><h3>You're all caught up</h3><p>Nothing overdue and no quiet clients. New follow-ups will appear here on their due date.</p></div>`;

      return `
        <div class="crm-pagehead">
          <div><h1>${greet}, Anna</h1><p>${dateStr} · ${due.length} follow-up${due.length === 1 ? '' : 's'} due${od ? `, ${od} overdue` : ''}</p></div>
          <button class="btn" data-nav="pipeline" aria-label="Open pipeline">${icon('kanban')}<span class="btn-label">Open pipeline</span></button>
        </div>
        <section class="kpis" aria-label="Key numbers">
          ${kpi('Follow-ups due', due.length, od ? `<span class="down">${od} overdue</span>` : 'All on time', null)}
          ${kpi('Open pipeline', short(pipeline), '<span class="up">▲ 12%</span> vs last month', sparkline([22, 26, 25, 31, 30, 36, 41, 39, 46, pipeline / 1000]))}
          ${kpi('Won this month', short(wonMonth.reduce((s, c) => s + c.value, 0)), `${wonMonth.length} client${wonMonth.length === 1 ? '' : 's'}`, null)}
          ${kpi('Win rate · 90 days', winRate + '%', `${closed.length} closed`, null)}
        </section>
        <div class="crm-grid-2">
          <section class="card" aria-labelledby="att-h">
            <div class="card-head"><div><h2 class="card-title" id="att-h">Needs attention</h2><p class="card-sub">Overdue first, then due today, then quiet clients</p></div><span class="badge ${attention.length ? 'badge-danger' : 'badge-success'} plain num">${attention.length}</span></div>
            <div class="rows">${rowsHtml}</div>
          </section>
          <div class="crm-stack">
            <section class="card" aria-labelledby="pv-h">
              <div class="card-head"><div><h2 class="card-title" id="pv-h">Pipeline by stage</h2><p class="card-sub">Open value · click a stage to open it</p></div></div>
              <div class="card-pad">${hbars(byStage, { label: 'Open pipeline value by stage' })}</div>
            </section>
            <section class="card" aria-labelledby="up-h">
              <div class="card-head"><div><h2 class="card-title" id="up-h">Next 7 days</h2></div><span class="card-sub num">${upcoming.length}</span></div>
              <div class="rows">${upcoming.length ? upcoming.slice(0, 5).map((c) => `
                <div class="row"><div class="row-main"><button class="row-title linklike" data-open="${c.id}">${esc(c.next)}</button><div class="row-sub">${esc(c.name)} · ${esc(c.company)}</div></div><span class="when">${relDue(c.due)}</span></div>`).join('')
                : `<div class="empty"><h3>Nothing scheduled</h3><p>Set a next step on a client to see it here.</p></div>`}</div>
            </section>
          </div>
        </div>`;
    }
    function kpi(label, value, delta, spark) {
      return `<div class="card kpi"><div class="kpi-label"><span>${label}</span>${spark || ''}</div><div class="kpi-value">${value}</div><div class="kpi-delta">${delta}</div></div>`;
    }

    function matches(c) {
      const q = st.q.trim().toLowerCase();
      if (q && !(c.name + ' ' + c.company + ' ' + c.next + ' ' + c.source).toLowerCase().includes(q)) return false;
      if (st.stageFilter && c.stage !== st.stageFilter) return false;
      if (st.attention && !(overdue(c) || dueToday(c) || quiet(c))) return false;
      return true;
    }
    function toolbar(withMode) {
      const chips = [];
      if (st.q) chips.push(['q', `Search: “${st.q}”`]);
      if (st.stageFilter) chips.push(['stage', `Stage: ${stageOf(st.stageFilter).name}`]);
      if (st.attention) chips.push(['attention', 'Needs attention']);
      return `<div class="crm-toolbar">
          <label class="search"><span class="vh">Search</span>${icon('search')}<input class="input" data-search placeholder="Search name, company, next step" value="${esc(st.q)}" autocomplete="off"></label>
          <label class="vh" for="stage-filter-${uid}">Filter by stage</label>
          <select class="select" id="stage-filter-${uid}" data-stagefilter style="width:auto;min-width:160px">
            <option value="">All stages</option>${st.stages.map((s) => `<option value="${s.id}" ${st.stageFilter === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
          </select>
          <button class="btn ${st.attention ? 'btn-primary' : ''}" data-act="attention" aria-pressed="${st.attention}">${icon('alert')}Needs attention</button>
          <span class="spacer"></span>
          ${withMode ? `<div class="seg" role="group" aria-label="View mode"><button data-act="mode" data-mode="board" aria-pressed="${st.mode === 'board'}">${icon('board')}Board</button><button data-act="mode" data-mode="list" aria-pressed="${st.mode === 'list'}">${icon('list')}List</button></div>` : ''}
        </div>
        ${chips.length ? `<div class="crm-chips" aria-label="Active filters">${chips.map(([k, l]) => `<span class="chip">${esc(l)}<button data-act="remove-chip" data-key="${k}" aria-label="Remove filter ${esc(l)}">${icon('x')}</button></span>`).join('')}<button class="btn btn-ghost btn-sm" data-act="clear-filters">Clear all</button></div>` : ''}`;
    }

    function viewPipeline() {
      return `<div class="crm-pagehead"><div><h1>Pipeline</h1><p>Drag clients between stages, or use the ⋯ menu on a card.</p></div></div>
        ${toolbar(true)}<div data-results>${st.mode === 'board' ? board() : table()}</div>`;
    }
    function board() {
      const list = active().filter(matches);
      return `<div class="board" data-board>${st.stages.map((s) => {
        const items = list.filter((c) => c.stage === s.id);
        const sum = items.reduce((a, c) => a + c.value, 0);
        return `<section class="col" data-col="${s.id}" aria-label="${esc(s.name)}, ${items.length} clients">
          <div class="col-head"><h2 class="col-title">${s.kind === 'won' ? `<span class="dot" style="background:var(--success)"></span>` : s.kind === 'lost' ? `<span class="dot" style="background:var(--text-subtle)"></span>` : ''}${esc(s.name)} <span class="col-count num">${items.length}</span></h2><span class="col-sum">${short(sum)}</span></div>
          ${items.map(card).join('')}
          ${items.length === 0 && (st.q || st.stageFilter || st.attention) ? `<p class="hint" style="padding:8px">No matches in this stage</p>` : ''}
          <button class="btn btn-ghost btn-sm col-add" data-act="add" data-stage="${s.id}">${icon('plus')}Add</button>
        </section>`;
      }).join('')}</div>`;
    }
    function card(c) {
      const days = -dayDiff(c.stageAt);
      const od = overdue(c);
      return `<article class="deal ${c._new ? 'is-new' : ''}" draggable="${!opts.static}" data-card="${c.id}" data-open="${c.id}">
        <div class="deal-top"><div style="min-width:0"><button class="deal-name linklike" data-open="${c.id}">${esc(c.name)}</button><div class="deal-co">${esc(c.company)}</div></div>
          <button class="btn btn-ghost btn-icon btn-sm" style="position:relative;z-index:1;margin:-4px -6px 0 0" data-act="move-menu" data-id="${c.id}" aria-label="Move ${esc(c.name)} to another stage" aria-haspopup="menu">${icon('more')}</button></div>
        ${c.next && isOpen(c) ? `<div class="deal-next ${od ? 'overdue' : ''}">${icon(od ? 'alert' : 'clock')}<span>${esc(c.next)} · ${relDue(c.due)}</span></div>` : ''}
        <div class="deal-meta"><span class="deal-value">${money(c.value)}</span><span title="Days in this stage">${days === 0 ? 'New today' : days + 'd in stage'}</span></div>
      </article>`;
    }
    function table() {
      const list = active().filter(matches);
      const filtered = st.q || st.stageFilter || st.attention;
      if (!list.length) {
        return `<div class="table-frame">${filtered
          ? `<div class="empty"><div class="empty-icon">${icon('search')}</div><h3>No clients match these filters</h3><p>Try a broader search or clear the filters to see everyone.</p><div class="actions"><button class="btn" data-act="clear-filters">Clear filters</button><button class="btn btn-primary" data-act="add">${icon('plus')}Add client</button></div></div>`
          : `<div class="empty"><div class="empty-icon">${icon('users')}</div><h3>No clients yet</h3><p>Add your first client to start tracking next steps and your pipeline.</p><div class="actions"><button class="btn btn-primary" data-act="add">${icon('plus')}Add your first client</button><button class="btn">${icon('upload')}Import CSV</button></div></div>`}</div>`;
      }
      return `<div class="table-frame"><div class="table-scroll"><table class="table">
        <thead><tr><th scope="col">Client</th><th scope="col">Stage</th><th scope="col" class="right">Value</th><th scope="col">Next step</th><th scope="col">Due</th><th scope="col" class="hide-sm">Last activity</th><th scope="col" class="hide-sm">Source</th></tr></thead>
        <tbody>${list.map((c) => `<tr data-open="${c.id}">
          <td><div class="cell-name"><div class="avatar">${initials(c.name)}</div><div><strong>${esc(c.name)}</strong><span>${esc(c.company)}</span></div></div></td>
          <td>${stageBadge(c.stage)}</td>
          <td class="right num">${money(c.value)}</td>
          <td>${esc(c.next || '—')}</td>
          <td class="num" style="${overdue(c) ? 'color:var(--danger)' : ''}">${c.due && isOpen(c) ? relDue(c.due) : '—'}</td>
          <td class="hide-sm muted">${relAgo(c.last)}</td>
          <td class="hide-sm muted">${esc(c.source)}</td></tr>`).join('')}</tbody></table></div>
        <div class="table-foot"><span class="num">Showing ${list.length} of ${active().length}</span><div style="display:flex;gap:8px"><button class="btn btn-sm" disabled>Previous</button><button class="btn btn-sm" disabled>Next</button></div></div></div>`;
    }
    function viewClients() {
      return `<div class="crm-pagehead"><div><h1>Clients</h1><p>Everyone you work with, from first inquiry to repeat client.</p></div>
        <button class="btn" aria-label="Export clients">${icon('download')}<span class="btn-label">Export</span></button></div>
        ${toolbar(false)}<div data-results>${table()}</div>`;
    }
    function viewSettings() {
      return `<div class="crm-pagehead"><div><h1>Settings</h1><p>Make the pipeline speak your language.</p></div></div>
        <section class="card" aria-labelledby="stg-h">
          <div class="card-head"><div><h2 class="card-title" id="stg-h">Pipeline stages</h2><p class="card-sub">Click a name to rename it. Enter saves, Escape cancels.</p></div></div>
          ${st.stages.map((s) => `<div class="settings-row">${icon('grip', 'handle')}<div class="grow"><div class="inline-edit" data-inline="stage:${s.id}"><button class="view" data-act="inline" aria-label="Rename stage ${esc(s.name)}">${esc(s.name)}</button></div></div>${s.kind === 'won' ? '<span class="badge badge-success">Won</span>' : s.kind === 'lost' ? '<span class="badge">Lost</span>' : '<span class="badge badge-accent">Open</span>'}</div>`).join('')}
        </section>
        <section class="card card-pad" aria-labelledby="pref-h" style="display:grid;gap:16px">
          <h2 class="card-title" id="pref-h">Reminders</h2>
          <div class="crm-detail-grid">
            <div class="field"><label class="label" for="quiet-${uid}">Flag a client as quiet after</label><select class="select" id="quiet-${uid}" data-pref="quietDays">${[7, 14, 21, 30].map((d) => `<option value="${d}" ${st.quietDays === d ? 'selected' : ''}>${d} days without activity</option>`).join('')}</select><span class="hint">Quiet clients appear under Needs attention.</span></div>
            <div class="field"><label class="label" for="follow-${uid}">Default follow-up</label><select class="select" id="follow-${uid}" data-pref="followDays">${[1, 2, 3, 5, 7].map((d) => `<option value="${d}" ${st.followDays === d ? 'selected' : ''}>${d} day${d > 1 ? 's' : ''} after adding</option>`).join('')}</select><span class="hint">Pre-fills the due date for new clients.</span></div>
          </div>
        </section>`;
    }

    // ---------------- render
    const uid = Math.random().toString(36).slice(2, 7);
    function renderAll() {
      root.innerHTML = shell();
      renderPage();
    }
    function renderNav() {
      const nav = root.querySelector('[data-navlist]');
      if (!nav) return;
      const tmp = document.createElement('div'); tmp.innerHTML = shell();
      nav.innerHTML = tmp.querySelector('[data-navlist]').innerHTML;
    }
    function renderPage() {
      const page = root.querySelector('[data-page]');
      page.innerHTML = { today: viewToday, pipeline: viewPipeline, clients: viewClients, settings: viewSettings }[st.view]();
      renderNav();
      st.clients.forEach((c) => delete c._new);
    }
    function renderResults() {
      const box = root.querySelector('[data-results]');
      if (!box) return renderPage();
      box.innerHTML = st.view === 'pipeline' && st.mode === 'board' ? board() : table();
      // refresh chips without touching the search input
      const head = root.querySelector('.crm-chips');
      const tmp = document.createElement('div'); tmp.innerHTML = toolbar(st.view === 'pipeline');
      const newChips = tmp.querySelector('.crm-chips');
      if (head && newChips) head.replaceWith(newChips);
      else if (head) head.remove();
      else if (newChips) root.querySelector('.crm-toolbar').after(newChips);
    }
    function go(view) {
      st.view = view; st.nav = false; root.classList.remove('nav-open');
      renderPage();
      root.querySelector('[data-scroll]').scrollTop = 0;
    }

    // ---------------- toasts & undo
    function toast(msg, undo) {
      const box = root.querySelector('[data-toasts]');
      box.innerHTML = '';
      const t = document.createElement('div');
      t.className = 'toast';
      t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button data-act="undo">Undo</button>' : ''}`;
      box.append(t);
      st.undo = undo || null;
      clearTimeout(t._h);
      const h = setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 160); if (st.undo === undo) st.undo = null; }, 5000);
      t._h = h;
    }

    // ---------------- overlays
    let overlay = null; // {els:[], restore}
    function closeOverlay() {
      if (!overlay) return;
      const { els, restore } = overlay; overlay = null;
      els.forEach((e) => { e.classList.add('out'); setTimeout(() => e.remove(), 160); });
      if (restore && document.contains(restore)) restore.focus();
    }
    function openSheet(html, trigger, label) {
      closeMenu();
      if (overlay) { overlay.els.forEach((e) => e.remove()); overlay = null; }
      const scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.dataset.act = 'close-overlay';
      const sheet = document.createElement('div'); sheet.className = 'sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', label);
      sheet.innerHTML = html;
      root.append(scrim, sheet);
      overlay = { els: [scrim, sheet], restore: trigger, el: sheet };
      const f = sheet.querySelector('[autofocus]') || sheet.querySelector('button, input, select, textarea');
      f && f.focus();
    }
    function openDialog(html, trigger, label) {
      const scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.style.zIndex = 'calc(var(--z-overlay) + 1)';
      const dlg = document.createElement('div'); dlg.className = 'dialog'; dlg.setAttribute('role', 'alertdialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-label', label);
      dlg.innerHTML = html; root.append(scrim, dlg);
      const prev = overlay;
      overlay = { els: [scrim, dlg], restore: trigger, el: dlg, prev };
      dlg.querySelector('[data-default]').focus();
    }
    function closeDialog() {
      if (!overlay || !overlay.prev) return closeOverlay();
      const { els, restore, prev } = overlay;
      els.forEach((e) => e.remove()); overlay = prev; restore && restore.focus();
    }

    function sheetClient(c, tab = 'overview') {
      const acts = c.activities.slice().sort((a, b) => new Date(b.at) - new Date(a.at));
      const icons = { call: 'phone', meeting: 'meeting', email: 'mail', note: 'note', stage: 'move' };
      return `<div class="sheet-head"><div style="display:flex;gap:12px;align-items:center;min-width:0"><div class="avatar lg">${initials(c.name)}</div><div style="min-width:0"><h2 class="display" style="font-size:var(--text-xl)">${esc(c.name)}</h2><p class="muted" style="font-size:var(--text-sm)">${esc(c.company)}</p></div></div>
          <button class="btn btn-ghost btn-icon" data-act="close-overlay" aria-label="Close">${icon('x')}</button></div>
        <div class="sheet-body">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${stageBadge(c.stage)}<span class="num" style="font-weight:var(--weight-medium)">${money(c.value)}</span><span class="subtle" style="font-size:var(--text-sm)">· ${-dayDiff(c.stageAt)}d in stage</span></div>
          <div class="field"><span class="label">Next step</span>
            <div class="inline-edit" data-inline="next:${c.id}"><button class="view" data-act="inline" aria-label="Edit next step">${esc(c.next || 'Add a next step')}</button></div>
            ${c.due && isOpen(c) ? `<span class="hint" style="${overdue(c) ? 'color:var(--danger)' : ''}">Due ${relDue(c.due).toLowerCase()} (${fmtDate(c.due)})</span>` : ''}</div>
          <div class="field"><label class="label" for="move-${uid}">Stage</label><select class="select" id="move-${uid}" data-movesel="${c.id}">${st.stages.map((s) => `<option value="${s.id}" ${c.stage === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
          <div>
            <div class="tabs" role="tablist" aria-label="Client sections">
              <button class="tab" role="tab" aria-selected="${tab === 'overview'}" data-act="tab" data-tab="overview" data-id="${c.id}">Overview</button>
              <button class="tab" role="tab" aria-selected="${tab === 'activity'}" data-act="tab" data-tab="activity" data-id="${c.id}">Activity <span class="subtle num">${c.activities.length}</span></button>
            </div>
            <div role="tabpanel" style="padding-top:16px">${tab === 'overview' ? `
              <dl class="crm-detail-grid crm-dl" style="margin:0">
                <div><dt>Email</dt><dd>${esc(c.email)}</dd></div><div><dt>Phone</dt><dd class="num">${esc(c.phone)}</dd></div>
                <div><dt>Source</dt><dd>${esc(c.source)}</dd></div><div><dt>Last activity</dt><dd>${relAgo(c.last)}</dd></div>
                <div><dt>Client since</dt><dd>${fmtDate(c.created)}</dd></div><div><dt>Value</dt><dd class="num">${money(c.value)}</dd></div>
              </dl>` : `
              <form data-logform="${c.id}" style="display:grid;gap:10px;margin-bottom:20px">
                <div class="seg" role="group" aria-label="Activity type">${['call', 'meeting', 'email', 'note'].map((t, i) => `<button type="button" data-act="type" data-type="${t}" aria-pressed="${i === 0}">${icon(icons[t])}${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>
                <label class="vh" for="log-${uid}">What happened?</label>
                <textarea class="textarea" id="log-${uid}" name="body" placeholder="What happened? e.g. Agreed to a site visit next Tuesday" ${tab === 'activity' ? 'autofocus' : ''}></textarea>
                <div style="display:flex;justify-content:flex-end"><button class="btn btn-primary" type="submit">Log activity</button></div>
              </form>
              <ol class="timeline">${acts.map((a) => `<li><div class="tl-icon">${icon(icons[a.type] || 'note')}</div><div><div class="tl-title">${esc(a.title)}</div>${a.body ? `<div class="tl-body">${esc(a.body)}</div>` : ''}<div class="tl-when">${relAgo(a.at)}</div></div></li>`).join('')}</ol>`}
            </div>
          </div>
        </div>
        <div class="sheet-foot" style="justify-content:space-between"><button class="btn btn-ghost" data-act="archive" data-id="${c.id}" style="color:var(--danger)">${icon('archive')}Archive client</button><button class="btn" data-act="close-overlay">Close</button></div>`;
    }
    function sheetAdd(stageId) {
      const due = addDays(st.followDays).toISOString().slice(0, 10);
      return `<form data-addform style="display:contents" novalidate>
        <div class="sheet-head"><div><h2 class="display" style="font-size:var(--text-xl)">Add client</h2><p class="muted" style="font-size:var(--text-sm)">Only the name is required. Fill in the rest later.</p></div><button type="button" class="btn btn-ghost btn-icon" data-act="close-overlay" aria-label="Close">${icon('x')}</button></div>
        <div class="sheet-body">
          <div class="field" data-field="name"><label class="label" for="n-${uid}">Name</label><input class="input" id="n-${uid}" name="name" autocomplete="off" autofocus required aria-describedby="n-err-${uid}"><span class="field-error" id="n-err-${uid}" hidden>${icon('alert')}Enter the client's name so you can find them later.</span></div>
          <div class="field"><label class="label" for="co-${uid}">Company <span class="subtle">(optional)</span></label><input class="input" id="co-${uid}" name="company" autocomplete="off"></div>
          <div class="crm-detail-grid">
            <div class="field"><label class="label" for="st-${uid}">Stage</label><select class="select" id="st-${uid}" name="stage">${st.stages.map((s) => `<option value="${s.id}" ${s.id === (stageId || st.stages[0].id) ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
            <div class="field"><label class="label" for="v-${uid}">Estimated value</label><input class="input num" id="v-${uid}" name="value" inputmode="numeric" placeholder="e.g. 4500"></div>
          </div>
          <div class="field"><label class="label" for="nx-${uid}">Next step</label><input class="input" id="nx-${uid}" name="next" value="Intro call" autocomplete="off"></div>
          <div class="field"><label class="label" for="d-${uid}">Due</label><input class="input" type="date" id="d-${uid}" name="due" value="${due}"><span class="hint">Defaults to ${st.followDays} day${st.followDays > 1 ? 's' : ''} from today (change in Settings).</span></div>
        </div>
        <div class="sheet-foot"><button type="button" class="btn" data-act="close-overlay">Cancel</button><button type="submit" class="btn btn-primary">Add client</button></div>
      </form>`;
    }

    // ---------------- menu (Move to…)
    let menu = null;
    function closeMenu(restore) { if (menu) { menu.el.remove(); restore && menu.trigger.focus(); menu = null; } }
    function openMoveMenu(trigger, id) {
      closeMenu();
      const c = st.clients.find((x) => x.id === id);
      const el = document.createElement('div'); el.className = 'menu'; el.setAttribute('role', 'menu');
      el.innerHTML = `<div class="menu-label">Move ${esc(c.name.split(' ')[0])} to…</div>` + st.stages.map((s) => `<button role="menuitem" data-act="move-to" data-id="${id}" data-stage="${s.id}" ${s.id === c.stage ? 'aria-current="true"' : ''}>${s.id === c.stage ? icon('check') : '<span style="width:16px;display:inline-block"></span>'}${esc(s.name)}</button>`).join('') +
        `<div style="height:1px;background:var(--border);margin:4px 0"></div><button role="menuitem" data-open="${id}">${icon('external')}Open details</button>`;
      root.append(el);
      const r = trigger.getBoundingClientRect(), rr = root.getBoundingClientRect();
      const left = Math.min(r.right - rr.left - 200, rr.width - 212);
      el.style.left = Math.max(8, left) + 'px';
      const top = r.bottom - rr.top + 4;
      el.style.top = (top + el.offsetHeight > rr.height - 8 ? r.top - rr.top - el.offsetHeight - 4 : top) + 'px';
      menu = { el, trigger };
      el.querySelector('button:not([aria-current])').focus();
    }

    // ---------------- mutations
    function moveClient(id, stage) {
      const c = st.clients.find((x) => x.id === id);
      if (!c || c.stage === stage) return;
      const prev = { stage: c.stage, stageAt: c.stageAt, wonAt: c.wonAt, acts: c.activities.length };
      c.stage = stage; c.stageAt = today().toISOString();
      if (stageOf(stage).kind === 'won') c.wonAt = today().toISOString();
      c.activities.push({ type: 'stage', title: `Moved to ${stageOf(stage).name}`, body: '', at: new Date().toISOString() });
      c.last = new Date().toISOString();
      refreshAfterChange();
      toast(`${c.name} moved to ${stageOf(stage).name}`, () => {
        c.stage = prev.stage; c.stageAt = prev.stageAt; c.wonAt = prev.wonAt; c.activities.length = prev.acts; refreshAfterChange(); toast('Move undone');
      });
    }
    function refreshAfterChange() {
      if (overlay && overlay.el.classList.contains('sheet') && overlay.clientId) {
        const c = st.clients.find((x) => x.id === overlay.clientId);
        overlay.el.innerHTML = sheetClient(c, overlay.tab);
      }
      if (st.view === 'today' || st.view === 'settings') renderPage(); else { renderResults(); renderNav(); }
    }
    function openClient(id, trigger, tab = 'overview') {
      const c = st.clients.find((x) => x.id === id);
      openSheet(sheetClient(c, tab), trigger, `Client ${c.name}`);
      overlay.clientId = id; overlay.tab = tab;
    }

    // ---------------- inline edit (zero layout shift: input stacked in same grid cell)
    function startInline(btn) {
      const wrap = btn.closest('[data-inline]');
      const [kind, id] = wrap.dataset.inline.split(':');
      const cur = kind === 'stage' ? stageOf(id).name : st.clients.find((x) => x.id === id).next;
      const input = document.createElement('input');
      input.className = 'input'; input.value = cur || ''; input.setAttribute('aria-label', btn.getAttribute('aria-label'));
      btn.style.visibility = 'hidden';
      wrap.append(input); input.focus(); input.select();
      let done = false;
      const finish = (save) => {
        if (done) return; done = true;
        const v = input.value.trim();
        if (save && v && v !== cur) {
          if (kind === 'stage') { stageOf(id).name = v; renderPage(); toast(`Stage renamed to ${v}`); return; }
          const c = st.clients.find((x) => x.id === id); c.next = v; refreshAfterChange(); toast('Next step updated');
          const nb = root.querySelector(`[data-inline="next:${id}"] .view`); nb && nb.focus();
          return;
        }
        input.remove(); btn.style.visibility = ''; btn.focus();
      };
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); finish(true); } if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); } });
      input.addEventListener('blur', () => finish(true));
    }

    // ---------------- events
    if (!opts.static) {
      root.addEventListener('click', (e) => {
        const t = e.target.closest('[data-nav],[data-open],[data-act]');
        if (menu && !e.target.closest('.menu') && !(t && t.dataset.act === 'move-menu')) closeMenu();
        if (!t || !root.contains(t)) return;
        if (t.dataset.nav) { e.preventDefault(); return go(t.dataset.nav); }
        if (t.dataset.open && !t.dataset.act) { e.preventDefault(); closeMenu(); return openClient(t.dataset.open, menu ? menu.trigger : t, t.dataset.tab || 'overview'); }
        const a = t.dataset.act, id = t.dataset.id;
        const c = id && st.clients.find((x) => x.id === id);
        switch (a) {
          case 'toggle-nav': root.classList.toggle('nav-open'); break;
          case 'add': openSheet(sheetAdd(t.dataset.stage), t, 'Add client'); break;
          case 'close-overlay': if (overlay && overlay.prev) closeDialog(); else closeOverlay(); break;
          case 'snooze': {
            const prev = c.due; c.due = addDays(Math.max(dayDiff(c.due || today()), 0) + 1).toISOString(); c.last = new Date().toISOString();
            const prevLast = c.last; refreshAfterChange();
            toast(`Snoozed ${c.name} until tomorrow`, () => { c.due = prev; refreshAfterChange(); toast('Snooze undone'); });
            void prevLast; break;
          }
          case 'move-menu': if (menu && menu.trigger === t) closeMenu(); else openMoveMenu(t, id); break;
          case 'move-to': { const trig = menu && menu.trigger; closeMenu(); moveClient(id, t.dataset.stage); const nt = trig && root.querySelector(`[data-card="${id}"] [data-act="move-menu"]`); nt && nt.focus(); break; }
          case 'goto-stage': st.stageFilter = t.dataset.stage; st.mode = 'board'; go('pipeline'); break;
          case 'mode': st.mode = t.dataset.mode; renderPage(); root.querySelector(`[data-act="mode"][data-mode="${st.mode}"]`).focus(); break;
          case 'attention': st.attention = !st.attention; renderPage(); root.querySelector('[data-act="attention"]').focus(); break;
          case 'clear-filters': st.q = ''; st.stageFilter = ''; st.attention = false; renderPage(); syncTopSearch(); break;
          case 'remove-chip': { const k = t.dataset.key; if (k === 'q') st.q = ''; if (k === 'stage') st.stageFilter = ''; if (k === 'attention') st.attention = false; renderPage(); syncTopSearch(); const s = root.querySelector('[data-search]'); s && s.focus(); break; }
          case 'undo': if (st.undo) { const u = st.undo; st.undo = null; u(); } break;
          case 'inline': startInline(t); break;
          case 'tab': overlay.tab = t.dataset.tab; overlay.el.innerHTML = sheetClient(st.clients.find((x) => x.id === t.dataset.id), t.dataset.tab); { const nt = overlay.el.querySelector(`[data-tab="${t.dataset.tab}"]`); (overlay.el.querySelector('[autofocus]') || nt).focus(); } break;
          case 'type': t.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === t)); break;
          case 'archive':
            openDialog(`<h2>Archive client “${esc(c.name)}”?</h2><p>${esc(c.name)} will be hidden from your pipeline and lists. You can undo this right after.</p>
              <div class="actions"><button class="btn" data-act="close-overlay" data-default>Cancel</button><button class="btn btn-danger" data-act="confirm-archive" data-id="${c.id}">Archive client</button></div>`, t, `Archive ${c.name}`);
            break;
          case 'confirm-archive': {
            c.archived = true; closeDialog(); closeOverlay(); refreshAfterChange();
            toast(`${c.name} archived`, () => { c.archived = false; refreshAfterChange(); toast('Client restored'); });
            break;
          }
        }
      });

      root.addEventListener('keydown', (e) => {
        if (e.target.matches('tr[data-open]') && e.key === 'Enter') openClient(e.target.dataset.open, e.target);
        if (menu) {
          const items = [...menu.el.querySelectorAll('button')];
          const i = items.indexOf(document.activeElement);
          if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
          if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
          if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); }
          if (e.key === 'Tab') closeMenu();
          return;
        }
        if (overlay && e.key === 'Escape') { e.preventDefault(); overlay.prev ? closeDialog() : closeOverlay(); return; }
        if (overlay && e.key === 'Tab') { // focus trap
          const f = [...overlay.el.querySelectorAll('button:not([disabled]), input, select, textarea, [tabindex="0"]')].filter((x) => x.offsetParent !== null);
          if (!f.length) return;
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      });

      // rows in tables: keyboard focusable
      const obs = new MutationObserver(() => root.querySelectorAll('tr[data-open]:not([tabindex])').forEach((r) => { r.tabIndex = 0; r.setAttribute('aria-label', 'Open ' + r.querySelector('strong').textContent); }));
      obs.observe(root, { childList: true, subtree: true });

      root.addEventListener('input', (e) => {
        if (e.target.matches('[data-search]')) { st.q = e.target.value; renderResults(); syncTopSearch(); }
        if (e.target.matches('[data-topsearch]')) {
          st.q = e.target.value;
          if (st.view !== 'clients' && st.view !== 'pipeline') { st.view = 'clients'; renderPage(); }
          else renderResults();
          const ps = root.querySelector('[data-search]'); if (ps) ps.value = st.q;
        }
      });
      function syncTopSearch() { const ts = root.querySelector('[data-topsearch]'); if (ts && ts !== document.activeElement) ts.value = st.q; }
      root.addEventListener('change', (e) => {
        if (e.target.matches('[data-stagefilter]')) { st.stageFilter = e.target.value; renderResults(); }
        if (e.target.matches('[data-pref]')) { st[e.target.dataset.pref] = +e.target.value; toast('Preference saved'); renderNav(); }
        if (e.target.matches('[data-movesel]')) moveClient(e.target.dataset.movesel, e.target.value);
      });
      root.addEventListener('focusout', (e) => {
        if (e.target.matches('[name="name"]')) validateName(e.target, false);
      });
      root.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = e.target;
        if (f.matches('[data-addform]')) {
          const nameEl = f.elements.name;
          if (!validateName(nameEl, true)) return;
          const v = parseInt(String(f.elements.value.value).replace(/[^0-9]/g, ''), 10) || 0;
          const c = {
            id: 'c' + Date.now(), name: nameEl.value.trim(), company: f.elements.company.value.trim() || '—', stage: f.elements.stage.value, value: v,
            source: 'Manual', next: f.elements.next.value.trim(), due: f.elements.due.value ? new Date(f.elements.due.value + 'T00:00').toISOString() : null,
            last: new Date().toISOString(), stageAt: new Date().toISOString(), created: new Date().toISOString(), wonAt: null,
            email: '—', phone: '—', archived: false, _new: true,
            activities: [{ type: 'note', title: 'Created', body: 'Added manually.', at: new Date().toISOString() }],
          };
          st.clients.unshift(c);
          closeOverlay(); refreshAfterChange();
          toast(`${c.name} added to ${stageOf(c.stage).name}`, () => { st.clients = st.clients.filter((x) => x !== c); refreshAfterChange(); toast('Removed'); });
        }
        if (f.matches('[data-logform]')) {
          const c = st.clients.find((x) => x.id === f.dataset.logform);
          const body = f.elements.body.value.trim();
          const type = f.querySelector('[aria-pressed="true"]').dataset.type;
          if (!body) { f.elements.body.focus(); f.elements.body.placeholder = 'Write a short note first'; return; }
          c.activities.push({ type, title: { call: 'Call', meeting: 'Meeting', email: 'Email', note: 'Note' }[type] + ' logged', body, at: new Date().toISOString() });
          c.last = new Date().toISOString();
          overlay.tab = 'activity'; refreshAfterChange();
          overlay.el.querySelector('textarea').focus();
          toast('Activity logged');
        }
      });
      function validateName(el, focus) {
        const ok = el.value.trim().length > 0;
        const field = el.closest('.field'); field.classList.toggle('has-error', !ok);
        field.querySelector('.field-error').hidden = ok; el.setAttribute('aria-invalid', String(!ok));
        if (!ok && focus) el.focus();
        return ok;
      }
      root.addEventListener('input', (e) => { if (e.target.matches('[name="name"]') && e.target.closest('.has-error')) validateName(e.target, false); });

      // drag & drop
      let dragId = null;
      root.addEventListener('dragstart', (e) => {
        const card = e.target.closest('[data-card]'); if (!card) return;
        dragId = card.dataset.card; card.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId);
      });
      root.addEventListener('dragend', (e) => { const card = e.target.closest('[data-card]'); card && card.classList.remove('is-dragging'); root.querySelectorAll('.is-over').forEach((x) => x.classList.remove('is-over')); });
      root.addEventListener('dragover', (e) => {
        const col = e.target.closest('[data-col]'); if (!col || !dragId) return;
        e.preventDefault(); e.dataTransfer.dropEffect = 'move';
        root.querySelectorAll('.is-over').forEach((x) => x !== col && x.classList.remove('is-over')); col.classList.add('is-over');
      });
      root.addEventListener('drop', (e) => {
        const col = e.target.closest('[data-col]'); if (!col || !dragId) return;
        e.preventDefault(); const id = dragId; dragId = null; moveClient(id, col.dataset.col);
      });

      if (opts.shortcuts) {
        const onKey = (e) => {
          if (!document.body.contains(root)) return document.removeEventListener('keydown', onKey);
          if (overlay || menu || e.metaKey || e.ctrlKey || e.altKey) return;
          if (e.target.closest('input, textarea, select, [contenteditable]')) return;
          if (e.key === '/') { e.preventDefault(); const s = root.querySelector('[data-search]') || root.querySelector('[data-topsearch]'); s && s.focus(); }
          if (e.key === 'n' || e.key === 'N') { e.preventDefault(); openSheet(sheetAdd(), document.activeElement, 'Add client'); }
        };
        document.addEventListener('keydown', onKey);
      }
    }

    renderAll();
    return { setTheme(t) { root.dataset.theme = t; }, go };
  }

  window.CRM = { mount, sparkline, hbars, columns, money, short };
})();
