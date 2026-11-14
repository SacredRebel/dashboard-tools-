/* Veil Rooms: grey-glass smart-home sample. Fictional data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
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

  $('[data-locktime]').textContent = '17:56';

  const ROOM_COPY = {
    living: 'Living room · six linked devices',
    study: 'Study · desk lamp and fan preferred',
    'bed-a': 'Bedroom A · night scene ready',
    'bed-b': 'Bedroom B · guest mode off',
    'bed-c': 'Bedroom C · blackout blinds linked',
  };
  const grid = $('.vr-grid'), emp = $('[data-empty]'), err = $('[data-error]');
  function showRoom(v) {
    $('[data-roomhint]').textContent = ROOM_COPY[v] || '';
    const empty = v === 'bed-c';
    grid.hidden = empty; emp.hidden = !empty; err.hidden = true;
    grid.dataset.state = empty ? 'empty' : 'populated';
  }
  seg($('[data-rooms]'), showRoom);
  showRoom('living');
  $('[data-back]').addEventListener('click', () => {
    const b = $('[data-rooms] [data-v="living"]');
    $$('[data-rooms] button[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    showRoom('living');
  });
  $('[data-retry]').addEventListener('click', () => { err.hidden = true; grid.hidden = false; grid.dataset.state = 'populated'; });

  // main light
  const mlBright = $('[data-mlbright]'), mlOut = $('[data-mlbout]');
  const syncMl = () => { mlOut.textContent = mlBright.value + '%'; };
  mlBright.addEventListener('input', syncMl); syncMl();
  $('[data-mlpwr]').addEventListener('click', (e) => {
    const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', String(on));
    mlBright.disabled = !on; $('[data-mltemp]').disabled = !on;
  });

  // AC
  let ac = 25, acOn = true;
  function renderAc() {
    $('[data-actemp]').textContent = ac + '°C';
    $('[data-acnote]').textContent = acOn ? `Cooling to ${ac}°C` : 'Standby';
    $$('[data-ac]').forEach((b) => { b.disabled = !acOn || (+b.dataset.ac < 0 && ac <= 16) || (+b.dataset.ac > 0 && ac >= 30); });
  }
  $$('[data-ac]').forEach((b) => b.addEventListener('click', () => { ac = Math.min(30, Math.max(16, ac + +b.dataset.ac)); renderAc(); }));
  $('[data-acpwr]').addEventListener('click', (e) => { acOn = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', String(acOn)); renderAc(); });

  // media art + play
  $('[data-album]').innerHTML = `<svg viewBox="0 0 240 120" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="vr-al" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--cool)"/><stop offset="1" style="stop-color:var(--warm)"/></linearGradient></defs><rect width="240" height="120" style="fill:url(#vr-al)"/><path d="M0 80 L40 50 L80 70 L130 30 L180 60 L240 40 V120 H0Z" style="fill:var(--bg)" opacity=".35"/></svg>`;
  $('[data-play]').addEventListener('click', (e) => {
    const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', String(on));
    e.currentTarget.setAttribute('aria-label', on ? 'Pause' : 'Play');
    e.currentTarget.innerHTML = svg(on ? 'pause' : 'play');
  });

  // simple power toggles
  ['wifipwr', 'aqpwr'].forEach((k) => {
    $(`[data-${k}]`).addEventListener('click', (e) => {
      const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
      e.currentTarget.setAttribute('aria-pressed', String(on));
    });
  });
  $('[data-lock]').addEventListener('click', (e) => {
    const locked = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', String(locked));
    e.currentTarget.setAttribute('aria-label', locked ? 'Unlock front door' : 'Lock front door');
  });

  // fixtures panel
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
    if (tog) { const f = FIX[+tog.dataset.fixtog]; f.on = !f.on; renderFix(); $(`[data-fixtog="${tog.dataset.fixtog}"]`).focus(); return; }
    const st = e.target.closest('[data-step]');
    if (st) { FIX[+st.dataset.fix].step = +st.dataset.step; renderFix(); $(`[data-fix="${st.dataset.fix}"][data-step="${st.dataset.step}"]`).focus(); }
  });
  $('[data-fixtures]').addEventListener('input', (e) => {
    const t = e.target.closest('[data-fixt]'); if (t) FIX[+t.dataset.fixt].temp = +t.value;
    const b = e.target.closest('[data-fixb]'); if (b) FIX[+b.dataset.fixb].bright = +b.value;
  });
  $('[data-collapse]').addEventListener('click', () => {
    const pane = $('.vr-lightpane');
    const collapsed = pane.toggleAttribute('data-collapsed');
    pane.style.display = collapsed ? 'none' : '';
  });

  renderAc(); renderFix();
/* === DB multipage bootstrap (generated; polish pass replaces stubs) === */
  (function wirePages() {
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"rooms","name":"Rooms","pattern":"List"},{"id":"devices","name":"Devices","pattern":"List"},{"id":"energy","name":"Energy","pattern":"Report"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
  document.documentElement.dataset.ready = 'true';
})();
