/* Veil Rooms: grey smart-home board — album photo, fixtures, multipage.
   Fictional data. No timers, no network. */
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
  function countUp(el, to, { duration = 650, format = (n) => String(Math.round(n)) } = {}) {
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

  const ICON = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    thermo: '<path d="M14 14.800V5a2 2 0 0 0-4 0v9.800a4 4 0 1 0 4 0z"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 1.800v2.400M12 19.800v2.400M4.8 4.800l1.7 1.700M17.5 17.500l1.7 1.700M1.8 12h2.400M19.8 12h2.400M4.8 19.200l1.7-1.700M17.5 6.500l1.7-1.7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    power: '<path d="M12 3v9"/><path d="M6.3 6.800a8 8 0 1 0 11.4 0"/>',
    wifi: '<path d="M2 9a15 15 0 0 1 20 0M5.5 12.500a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19.5" r=".8"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.500V7a4 4 0 0 1 8 0v3.5"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    play: '<path d="M7 4.500v15l12-7.500z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    skipF: '<path d="M5 5v14l10-7zM19 5v14"/>',
    skipB: '<path d="M19 5v14L9 12zM5 5v14"/>',
    chevLeft: '<path d="m15 18-6-6 6-6"/>',
  };
  const svg = (n, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n] || ''}</svg>`;
  const paintIcons = (rootEl = document) => $$('[data-icon]', rootEl).forEach((el) => { el.innerHTML = svg(el.dataset.icon); });
  function seg(group, onChange) {
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      $$('button[data-v]', group).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onChange(b.dataset.v, b);
    });
  }
  paintIcons();

  $('[data-locktime]').textContent = '17:56';

  const ROOM_COPY = {
    living: 'Living room · six linked devices',
    study: 'Study · desk lamp and fan preferred',
    'bed-a': 'Bedroom A · night scene ready',
    'bed-b': 'Bedroom B · guest mode off',
    'bed-c': 'Bedroom C · blackout blinds linked',
  };
  const ROOMS = [
    { id: 'living', name: 'Living room', devices: 6 },
    { id: 'study', name: 'Study', devices: 3 },
    { id: 'bed-a', name: 'Bedroom A', devices: 4 },
    { id: 'bed-b', name: 'Bedroom B', devices: 3 },
    { id: 'bed-c', name: 'Bedroom C', devices: 0 },
  ];
  const DEVS = [
    { n: 'Main light', s: 'Living · 72%', on: true },
    { n: 'Air conditioner', s: 'Living · 25°C', on: true },
    { n: 'Media player', s: 'River Lights', on: true },
    { n: 'Mesh wifi', s: '3 devices online', on: true },
    { n: 'Air purifier', s: 'PM2.5 21', on: true },
    { n: 'Smart lock', s: 'Front door locked', on: true },
  ];
  const grid = $('.vr-grid'), emp = $('[data-empty]'), err = $('[data-error]');
  function showRoom(v, { quiet = false } = {}) {
    $('[data-roomhint]').textContent = ROOM_COPY[v] || '';
    const empty = v === 'bed-c';
    grid.hidden = empty; emp.hidden = !empty; err.hidden = true;
    grid.dataset.state = empty ? 'empty' : 'populated';
    if (!quiet) toast(ROOM_COPY[v] || v);
  }
  seg($('[data-rooms]'), (v) => showRoom(v));
  showRoom('living', { quiet: true });
  $('[data-back]').addEventListener('click', () => {
    const b = $('[data-rooms] [data-v="living"]');
    $$('[data-rooms] button[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    showRoom('living');
  });
  $('[data-retry]').addEventListener('click', () => { err.hidden = true; grid.hidden = false; grid.dataset.state = 'populated'; toast('Devices reloaded · sample'); });
  $('[data-add-room]')?.addEventListener('click', () => toast('Add room · sample'));

  const mlBright = $('[data-mlbright]'), mlOut = $('[data-mlbout]');
  const syncMl = () => { mlOut.textContent = mlBright.value + '%'; };
  mlBright.addEventListener('input', syncMl); syncMl();
  $('[data-mlpwr]').addEventListener('click', (e) => {
    const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', String(on));
    mlBright.disabled = !on; $('[data-mltemp]').disabled = !on;
    toast(on ? 'Main light on · sample' : 'Main light off · sample');
  });

  let ac = 25, acOn = true;
  function renderAc() {
    $('[data-actemp]').textContent = ac + '°C';
    $('[data-acnote]').textContent = acOn ? `Cooling to ${ac}°C` : 'Standby';
    $$('[data-ac]').forEach((b) => { b.disabled = !acOn || (+b.dataset.ac < 0 && ac <= 16) || (+b.dataset.ac > 0 && ac >= 30); });
  }
  $$('[data-ac]').forEach((b) => b.addEventListener('click', () => { ac = Math.min(30, Math.max(16, ac + +b.dataset.ac)); renderAc(); toast(`AC ${ac}°C`); }));
  $('[data-acpwr]').addEventListener('click', (e) => {
    acOn = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', String(acOn));
    renderAc();
    toast(acOn ? 'AC on · sample' : 'AC standby · sample');
  });

  $('[data-play]').addEventListener('click', (e) => {
    const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', String(on));
    e.currentTarget.setAttribute('aria-label', on ? 'Pause' : 'Play');
    e.currentTarget.innerHTML = svg(on ? 'pause' : 'play');
    toast(on ? 'Playing River Lights' : 'Paused');
  });
  $$('[data-skip]').forEach((b) => b.addEventListener('click', () => toast(+b.dataset.skip > 0 ? 'Next track · sample' : 'Previous track · sample')));

  ['wifipwr', 'aqpwr'].forEach((k) => {
    $(`[data-${k}]`).addEventListener('click', (e) => {
      const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
      e.currentTarget.setAttribute('aria-pressed', String(on));
      toast(`${k === 'wifipwr' ? 'Wifi' : 'Purifier'} ${on ? 'on' : 'off'} · sample`);
    });
  });
  $('[data-lock]').addEventListener('click', (e) => {
    const locked = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', String(locked));
    e.currentTarget.setAttribute('aria-label', locked ? 'Unlock front door' : 'Lock front door');
    toast(locked ? 'Front door locked' : 'Front door unlocked');
  });

  const FIX = [
    { id: 'main', n: 'Main light', on: true, kind: 'sliders', temp: 3200, bright: 70 },
    { id: 'chand', n: 'Chandelier', on: false, kind: 'sliders', temp: 2800, bright: 40 },
    { id: 'spotL', n: 'Left spotlight', on: false, kind: 'steps', step: 0 },
    { id: 'spotR', n: 'Right spotlight', on: true, kind: 'steps', step: 1 },
  ];
  const STEP_L = ['A third', 'Half', 'All'];
  function lampGlyph(id) {
    if (id === 'chand') return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M24 6v8M14 20h20M16 20l-4 10h24l-4-10M18 30v6M30 30v6M12 36h24"/></svg>`;
    if (id.startsWith('spot')) return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="24" cy="16" r="7"/><path d="M24 23v6M16 36l8-7 8 7"/></svg>`;
    return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 30h12M20 34h8"/><path d="M24 8a10 10 0 0 0-6 17c1 .8 2 2 2 3.5h8c0-1.5.9-2.7 2-3.5A10 10 0 0 0 24 8z"/></svg>`;
  }
  function renderFix() {
    $('[data-fixtures]').innerHTML = FIX.map((f, i) => {
      const body = f.kind === 'steps'
        ? `<div class="vr-steps" role="group" aria-label="${f.n} level">${STEP_L.map((l, s) => `<button type="button" data-fix="${i}" data-step="${s}" aria-pressed="${f.step === s}" ${f.on ? '' : 'disabled'}>${l}</button>`).join('')}</div>`
        : `<label>Temp<input type="range" min="2700" max="6500" value="${f.temp}" data-fixt="${i}" ${f.on ? '' : 'disabled'}></label>
           <label>Bright<input type="range" min="0" max="100" value="${f.bright}" data-fixb="${i}" ${f.on ? '' : 'disabled'}></label>`;
      return `<article class="vr-fix${f.on ? '' : ' dim'}"><div class="vr-fixtop"><h3>${f.n}</h3><button class="vr-tog" role="switch" aria-checked="${f.on}" aria-label="${f.n}" data-fixtog="${i}"></button></div><div class="vr-fixico">${lampGlyph(f.id)}</div>${body}</article>`;
    }).join('');
  }
  $('[data-fixtures]').addEventListener('click', (e) => {
    const tog = e.target.closest('[data-fixtog]');
    if (tog) {
      const f = FIX[+tog.dataset.fixtog]; f.on = !f.on; renderFix();
      toast(`${f.n} ${f.on ? 'on' : 'off'}`);
      $(`[data-fixtog="${tog.dataset.fixtog}"]`)?.focus();
      return;
    }
    const st = e.target.closest('[data-step]');
    if (st) {
      FIX[+st.dataset.fix].step = +st.dataset.step; renderFix();
      toast(`${FIX[+st.dataset.fix].n} · ${STEP_L[+st.dataset.step]}`);
      $(`[data-fix="${st.dataset.fix}"][data-step="${st.dataset.step}"]`)?.focus();
    }
  });
  $('[data-fixtures]').addEventListener('input', (e) => {
    const t = e.target.closest('[data-fixt]'); if (t) FIX[+t.dataset.fixt].temp = +t.value;
    const b = e.target.closest('[data-fixb]'); if (b) FIX[+b.dataset.fixb].bright = +b.value;
  });
  $('[data-collapse]').addEventListener('click', () => {
    const pane = $('.vr-lightpane');
    const collapsed = pane.toggleAttribute('data-collapsed');
    pane.hidden = collapsed;
    toast(collapsed ? 'Light panel hidden' : 'Light panel shown');
  });

  renderAc(); renderFix();
  countUp($('[data-pm]'), 21);
  countUp($('[data-mlbout]'), 72, { format: (n) => Math.round(n) + '%' });

  function staggerReveal() {
    $$('.vr-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 40 * i}ms`);
      el.classList.add('vr-reveal-in');
    });
  }

  const PAGES = [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'rooms', name: 'Rooms', pattern: 'List' },
    { id: 'devices', name: 'Devices', pattern: 'List' },
    { id: 'energy', name: 'Energy', pattern: 'Report' },
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
    $$('.vr-nav a').forEach((a) => {
      const match = (a.getAttribute('href') || '') === `#/${id}`;
      if (match) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function pageHtml(page) {
    if (page.id === 'rooms') {
      return `<section class="vr-page" data-db-page="rooms" aria-labelledby="p-h">
        <h1 id="p-h">Rooms</h1>
        <p class="vr-page-lead">Zones in Scarlett’s home. Sample data · fictional.</p>
        <div class="vr-page-seg" role="group" aria-label="Rooms state" data-rooms-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-rooms-body></div>
      </section>`;
    }
    if (page.id === 'devices') {
      return `<section class="vr-page" data-db-page="devices" aria-labelledby="p-h">
        <h1 id="p-h">Devices</h1>
        <p class="vr-page-lead">Every controllable endpoint on the mesh.</p>
        <div class="vr-page-grid" data-dev-list></div>
      </section>`;
    }
    if (page.id === 'energy') {
      return `<section class="vr-page" data-db-page="energy" aria-labelledby="p-h">
        <h1 id="p-h">Energy</h1>
        <p class="vr-page-lead">Lighting and climate draw this week. Sample readings only.</p>
        <div class="vr-page-grid">
          <article class="vr-page-card"><div class="vr-row"><span>This week</span><strong class="num">42 kWh</strong></div></article>
          <article class="vr-page-card"><div class="vr-row"><span>Peak evening</span><strong class="num">9.1 kWh</strong></div></article>
          <article class="vr-page-card"><div class="vr-row"><span>vs last week</span><strong class="num">−8%</strong></div></article>
        </div>
        <button type="button" class="vr-btn" data-energy-report>Open usage report</button>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="vr-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="vr-page-lead">Home preferences and guest access.</p>
        <div class="vr-page-grid">
          <article class="vr-page-card"><div class="vr-row"><strong>Night scenes</strong><span>On</span></div></article>
          <article class="vr-page-card"><div class="vr-row"><strong>Guest PIN</strong><span>Off</span></div></article>
          <article class="vr-page-card"><div class="vr-row"><strong>Door alerts</strong><span>On</span></div></article>
        </div>
        <button type="button" class="vr-btn ghost" data-save-settings>Save preferences</button>
      </section>`;
    }
    return `<section class="vr-page"><h1>${page.name}</h1></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'rooms') {
      const body = host.querySelector('[data-rooms-body]');
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="vr-loading" role="status"><p>Syncing rooms…</p><div class="vr-skel"></div><div class="vr-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="vr-empty-block"><p>No rooms configured yet.</p></div>`;
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="vr-error-block"><p>Could not load rooms.</p><button type="button" class="vr-btn ghost" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="vr-page-grid">${ROOMS.map((r) =>
          `<article class="vr-page-card"><div class="vr-row"><strong>${r.name}</strong><span class="num vr-chip">${r.devices}</span></div><p class="vr-meta">${r.devices ? 'Linked devices' : 'Empty room'}</p></article>`
        ).join('')}</div>`;
      };
      paint('ready');
      seg(host.querySelector('[data-rooms-tabs]'), (v) => paint(v));
    }
    if (page.id === 'devices') {
      host.querySelector('[data-dev-list]').innerHTML = DEVS.map((d) =>
        `<article class="vr-page-card"><div class="vr-row"><strong>${d.n}</strong><span class="vr-chip">${d.on ? 'On' : 'Off'}</span></div><p class="vr-meta">${d.s}</p></article>`
      ).join('');
    }
    if (page.id === 'energy') {
      host.querySelector('[data-energy-report]')?.addEventListener('click', () => toast('Usage report · sample'));
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
  const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"rooms","name":"Rooms","pattern":"List"},{"id":"devices","name":"Devices","pattern":"List"},{"id":"energy","name":"Energy","pattern":"Report"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Veil Rooms" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
