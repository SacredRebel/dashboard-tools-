/* Prism Workspace: sample data, invite combobox, members, permissions and seats.
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
  const ICON = {
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.500V7a4 4 0 0 1 8 0v3.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
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
  paintIcons();
  const TINT = ['--lilac', '--mint', '--peach', '--pink'];
  const PEOPLE = [{ n: 'Ada Brennan', e: 'ada@northwind.example' }, { n: 'Bilal Haddad', e: 'bilal@northwind.example' }, { n: 'Chloé Martin', e: 'chloe@kestrel.example' }, { n: 'Dev Patel', e: 'dev@northwind.example' }, { n: 'Eun-ji Seo', e: 'eunji@kestrel.example' }, { n: 'Felix Ward', e: 'felix@northwind.example' }];
  const MEMBERS = [{ n: 'Noor Abbasi', e: 'noor@northwind.example', r: 'Owner' }, { n: 'Kai Lindgren', e: 'kai@northwind.example', r: 'Admin' }, { n: 'Marta Ruiz', e: 'marta@northwind.example', r: 'Member' }, { n: 'Oscar Lee', e: 'oscar@northwind.example', r: 'Member' }, { n: 'Ines Duarte', e: 'ines@studio-partner.example', r: 'Guest' }];
  const PERMS = [{ n: 'Create projects', on: true }, { n: 'Invite guests', on: true }, { n: 'Export files', on: false }, { n: 'Delete projects', on: false }, { n: 'Manage integrations', on: false }, { n: 'See billing', on: false }];
  const SW = [{ n: 'Comments and mentions', d: 'Email and in-app', on: true }, { n: 'Weekly digest', d: 'Mondays at 9 am', on: true }, { n: 'New member joined', d: 'Owners and admins', on: false }, { n: 'Security alerts', d: 'Always on for owners', on: true }];
  const ROLES = ['Member', 'Admin', 'Guest'];
  const SEATS = 10; let role = 'Member', sel = -1, matches = [];
  const ini = (n) => n.split(' ').map((w) => w[0]).join('').slice(0, 2);
  const av = (n, i) => `<span class="pw-av" style="background:var(${TINT[i % 4]})" aria-hidden="true">${ini(n)}</span>`;

  function renderMembers() {
    const q = $('[data-q]').value.trim().toLowerCase(), list = MEMBERS.map((m, i) => ({ ...m, i })).filter((m) => !q || (m.n + m.e).toLowerCase().includes(q));
    $('[data-memcount]').textContent = MEMBERS.length;
    $('[data-members]').innerHTML = list.length ? list.map((m) => `<li>${av(m.n, m.i)}<span>${m.n}<small>${m.e}</small></span><span class="pw-role">${m.r}</span>${m.r === 'Owner' ? '<span></span>' : `<button class="pw-x" data-rm="${m.i}" aria-label="Remove ${m.n}">${svg('close')}</button>`}</li>`).join('') : `<li class="pw-none">No members match “${q}”. Invite them on the left.</li>`;
    const used = MEMBERS.filter((m) => m.r !== 'Guest').length;
    $('[data-seats]').textContent = `${used} of ${SEATS}`; $('[data-meter]').style.width = (used / SEATS) * 100 + '%';
    $('[data-plannote]').textContent = used >= SEATS ? 'All seats are taken. Upgrade to add more members; guests stay free.' : `${SEATS - used} seats left. Guests don't use a seat.`;
  }
  function renderRoles() { $('[data-roles]').innerHTML = ROLES.map((r) => `<button role="radio" aria-checked="${r === role}" data-role="${r}">${r}</button>`).join(''); }
  function renderPerms() { $('[data-perms]').innerHTML = PERMS.map((p, i) => `<li><button role="checkbox" aria-checked="${p.on}" data-perm="${i}"><i>${p.on ? svg('check') : ''}</i>${p.n}</button></li>`).join(''); }
  function renderSwitches() { $('[data-switches]').innerHTML = SW.map((s, i) => `<li><span id="pw-s${i}">${s.n}<small>${s.d}</small></span><button class="pw-switch" role="switch" aria-checked="${s.on}" aria-labelledby="pw-s${i}" data-sw="${i}"></button></li>`).join(''); }

  // ---------------------------------------------------------------- invite combobox
  const inp = $('[data-inv]'), box = $('[data-sugg]');
  function renderSugg() {
    const q = inp.value.trim().toLowerCase();
    matches = q ? PEOPLE.filter((p) => (p.n + p.e).toLowerCase().includes(q) && !MEMBERS.some((m) => m.e === p.e)) : [];
    box.hidden = !matches.length; inp.setAttribute('aria-expanded', String(!box.hidden));
    box.innerHTML = matches.map((p, i) => `<li role="option" id="pw-o${i}" aria-selected="${i === sel}" data-opt="${i}">${av(p.n, i)}<span>${p.n}<small>${p.e}</small></span></li>`).join('');
    if (sel >= 0 && matches[sel]) inp.setAttribute('aria-activedescendant', 'pw-o' + sel); else inp.removeAttribute('aria-activedescendant');
  }
  const choose = (i) => { inp.value = matches[i].e; sel = -1; matches = []; box.hidden = true; inp.setAttribute('aria-expanded', 'false'); inp.removeAttribute('aria-activedescendant'); };
  inp.addEventListener('input', () => { sel = -1; renderSugg(); });
  inp.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % matches.length; renderSugg(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + matches.length) % matches.length; renderSugg(); }
    else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); choose(sel); }
    else if (e.key === 'Escape') { box.hidden = true; inp.setAttribute('aria-expanded', 'false'); }
  });
  box.addEventListener('mousedown', (e) => { const o = e.target.closest('[data-opt]'); if (o) { e.preventDefault(); choose(+o.dataset.opt); inp.focus(); } });
  $('[data-send]').addEventListener('click', () => {
    const v = inp.value.trim(), msg = $('[data-msg]');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { msg.textContent = 'Enter an email address, for example name@company.example.'; inp.focus(); return; }
    if (MEMBERS.some((m) => m.e === v)) { msg.textContent = `${v} is already in this workspace.`; return; }
    const p = PEOPLE.find((x) => x.e === v); MEMBERS.push({ n: p ? p.n : v.split('@')[0], e: v, r: role }); inp.value = ''; renderMembers(); msg.textContent = `Invite sent to ${v} as ${role.toLowerCase()}.`;
  });

  // ---------------------------------------------------------------- other events
  $('[data-roles]').addEventListener('click', (e) => { const b = e.target.closest('[data-role]'); if (!b) return; role = b.dataset.role; renderRoles(); $(`[data-role="${role}"]`).focus(); });
  $('[data-roles]').addEventListener('keydown', (e) => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; const i = (ROLES.indexOf(role) + (e.key === 'ArrowRight' ? 1 : 2)) % 3; role = ROLES[i]; renderRoles(); $(`[data-role="${role}"]`).focus(); });
  $('[data-members]').addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (!b) return; const m = MEMBERS.splice(+b.dataset.rm, 1)[0]; renderMembers(); $('[data-q]').focus(); $('[data-msg]').textContent = `${m.n} removed. They keep their own files.`; });
  $('[data-q]').addEventListener('input', renderMembers);
  $('[data-perms]').addEventListener('click', (e) => { const b = e.target.closest('[data-perm]'); if (!b) return; const p = PERMS[+b.dataset.perm]; p.on = !p.on; renderPerms(); $(`[data-perm="${b.dataset.perm}"]`).focus(); });
  $('[data-switches]').addEventListener('click', (e) => { const b = e.target.closest('[data-sw]'); if (!b) return; const s = SW[+b.dataset.sw]; s.on = !s.on; renderSwitches(); $(`[data-sw="${b.dataset.sw}"]`).focus(); });
  $('[data-lock]').addEventListener('click', (e) => { const b = e.currentTarget, on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Workspace locked to invited members' : 'Workspace open to anyone with the link'); });
  $('[data-upgrade]').addEventListener('click', (e) => {
    e.currentTarget.textContent = 'Plan upgraded · 25 seats';
    e.currentTarget.disabled = true;
    renderMembers();
    $('[data-seats]').textContent = `${MEMBERS.filter((m) => m.r !== 'Guest').length} of 25`;
    toast('Plan upgraded · sample');
  });
  $('[data-create]').addEventListener('click', () => {
    $('[data-wsname]').textContent = 'Untitled workspace';
    $('[data-msg]').textContent = 'New workspace created. Invite your first people.';
    toast('Workspace created · sample');
    inp.focus();
  });
  $('[data-bell]')?.addEventListener('click', () => toast('2 notifications · sample'));
  renderRoles(); renderMembers(); renderPerms(); renderSwitches();

  function staggerReveal() {
    $$('.pw-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 40 * i}ms`);
      el.classList.add('pw-reveal-in');
    });
  }

  const PAGES = [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'workspace', name: 'Workspace', pattern: 'List' },
    { id: 'people', name: 'People', pattern: 'List' },
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
    $$('.pw-tabs a').forEach((a) => {
      const match = (a.getAttribute('href') || '') === `#/${id}`;
      if (match) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function pageHtml(page) {
    if (page.id === 'workspace') {
      return `<section class="pw-page" data-db-page="workspace" aria-labelledby="p-h">
        <h1 id="p-h">Workspace</h1>
        <p class="pw-page-lead">Identity and defaults for Northwind Studio. Sample data · fictional.</p>
        <div class="pw-page-seg" role="group" aria-label="Workspace state" data-ws-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-ws-body></div>
      </section>`;
    }
    if (page.id === 'people') {
      return `<section class="pw-page" data-db-page="people" aria-labelledby="p-h">
        <h1 id="p-h">People</h1>
        <p class="pw-page-lead">Everyone with access to this workspace.</p>
        <div class="pw-page-grid">${MEMBERS.map((m) =>
          `<article class="pw-page-card"><div class="pw-row"><strong>${m.n}</strong><span class="pw-chip">${m.r}</span></div><p class="pw-meta">${m.e}</p></article>`
        ).join('')}</div>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="pw-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="pw-page-lead">Security and notification defaults.</p>
        <div class="pw-page-grid">
          <article class="pw-page-card"><div class="pw-row"><strong>Invite lock</strong><span class="pw-chip">On</span></div></article>
          <article class="pw-page-card"><div class="pw-row"><strong>2FA for admins</strong><span class="pw-chip">Required</span></div></article>
          <article class="pw-page-card"><div class="pw-row"><strong>Digest email</strong><span class="pw-chip">Mondays</span></div></article>
        </div>
        <button type="button" class="pw-btn" data-save-settings>Save preferences</button>
      </section>`;
    }
    return `<section class="pw-page"><h1>${page.name}</h1></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'workspace') {
      const body = host.querySelector('[data-ws-body]');
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="pw-loading" role="status"><p>Syncing workspace…</p><div class="pw-skel"></div><div class="pw-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="pw-empty-block"><p>No workspace profile yet.</p></div>`;
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="pw-error-block"><p>Could not load workspace.</p><button type="button" class="pw-btn" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="pw-page-grid">
          <article class="pw-page-card"><div class="pw-row"><strong>Name</strong><span class="pw-chip">Northwind Studio</span></div></article>
          <article class="pw-page-card"><div class="pw-row"><strong>Slug</strong><span class="pw-chip">northwind</span></div></article>
          <article class="pw-page-card"><div class="pw-row"><strong>Region</strong><span class="pw-chip">US-West</span></div></article>
        </div>`;
      };
      paint('ready');
      seg(host.querySelector('[data-ws-tabs]'), (v) => paint(v));
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
        paintIcons(host);
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
  const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"workspace","name":"Workspace","pattern":"List"},{"id":"people","name":"People","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Prism Workspace" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
