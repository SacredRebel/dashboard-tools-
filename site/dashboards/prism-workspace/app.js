/* Prism Workspace: sample data, invite combobox, members, permissions and seats.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
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
  $('[data-upgrade]').addEventListener('click', (e) => { e.currentTarget.textContent = 'Plan upgraded · 25 seats'; e.currentTarget.disabled = true; renderMembers(); $('[data-seats]').textContent = `${MEMBERS.filter((m) => m.r !== 'Guest').length} of 25`; });
  $('[data-create]').addEventListener('click', () => { $('[data-wsname]').textContent = 'Untitled workspace'; $('[data-msg]').textContent = 'New workspace created. Invite your first people.'; inp.focus(); });
  renderRoles(); renderMembers(); renderPerms(); renderSwitches();
/* === DB multipage bootstrap (generated; polish pass replaces stubs) === */
  (function wirePages() {
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"workspace","name":"Workspace","pattern":"List"},{"id":"people","name":"People","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
