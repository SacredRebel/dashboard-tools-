/* Orbit Clay: twin-phone clay console — fictional missions, helmet photo, calibration rail. */
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
  const ICON = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
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

  const MISSIONS = [
    { name: 'Mission Nova', score: 227, signal: 11009 },
    { name: 'Mission Drift', score: 184, signal: 9820 },
    { name: 'Mission Halo', score: 301, signal: 12440 },
    { name: 'Mission Quill', score: 156, signal: 8712 },
    { name: 'Mission Ember', score: 268, signal: 10555 },
  ];
  const MODES = {
    orbit: { thrust: 3007, label: 'Orbit hold' },
    drift: { thrust: 2140, label: 'Soft drift' },
    dock: { thrust: 980, label: 'Dock approach' },
  };

  let page = 0;
  let base = 'alpha';
  let mode = 'orbit';
  let running = false;
  let locked = false;

  function fmt(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function render() {
    const m = MISSIONS[page];
    const alt = +$('[data-alt]').value;
    const thrustBase = MODES[mode].thrust;
    const altitude = Math.round(1800 + alt * 28);
    const thrust = Math.round(thrustBase + alt * 6 + (running ? 220 : 0));
    const signal = Math.round(m.signal + alt * 8 - (locked ? 0 : 40));
    const score = m.score + (running ? 12 : 0);

    countUp($('[data-score]'), score, { format: (n) => String(Math.round(n)) });
    $('[data-kpi-a]').textContent = fmt(altitude);
    $('[data-kpi-b]').textContent = fmt(signal);
    $('[data-kpi-c]').textContent = fmt(thrust);
    $('[data-foot-l]').textContent = String(page);
    $('[data-foot-r]').textContent = String(Math.round(alt / 20));

    const baseName = base === 'alpha' ? 'Base Alpha' : 'Base Beta';
    $('[data-mission]').textContent = `${m.name} · ${baseName}`;

    let note = `${MODES[mode].label} · altitude ${fmt(altitude)}`;
    if (running) note = `Running · ${m.name} · ${fmt(altitude)} m`;
    if (locked) note = `Locked rail · ${note}`;
    $('[data-runnote]').textContent = note;

    $('[data-start]').textContent = running ? 'RUNNING' : 'START';
    $('[data-start]').setAttribute('aria-pressed', String(running));
    $('[data-lock]').setAttribute('aria-pressed', String(locked));
    $('[data-lock]').textContent = locked ? 'LOCKED' : 'LOCK';
    $('[data-alt]').disabled = locked;
  }

  seg($('[data-modes]'), (v) => { mode = v; toast(`${MODES[mode].label} · sample`); render(); });

  $('[data-pager]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-page]');
    if (!b) return;
    page = +b.dataset.page;
    $$('[data-pager] [data-page]').forEach((el) => el.setAttribute('aria-selected', String(el === b)));
    render();
    b.focus();
  });

  $$('[data-base]').forEach((btn) => {
    btn.addEventListener('click', () => {
      base = btn.dataset.base;
      $$('[data-base]').forEach((el) => el.setAttribute('aria-pressed', String(el === btn)));
      render();
    });
  });

  $('[data-start]').addEventListener('click', () => {
    running = !running;
    toast(running ? 'Run started · sample' : 'Run paused · sample');
    render();
  });

  $('[data-lock]').addEventListener('click', () => {
    locked = !locked;
    toast(locked ? 'Rail locked · sample' : 'Rail unlocked · sample');
    render();
  });

  $('[data-knob]').addEventListener('click', () => {
    const on = $('[data-knob]').getAttribute('aria-pressed') === 'true';
    $('[data-knob]').setAttribute('aria-pressed', String(!on));
    toast(!on ? 'Status armed · sample' : 'Status idle · sample');
  });

  $('[data-alt]').addEventListener('input', render);
  $('[data-go-settings]')?.addEventListener('click', () => { location.hash = '#/settings'; });

  render();

  function staggerReveal() {
    $$('.oc-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 45 * i}ms`);
      el.classList.add('oc-reveal-in');
    });
  }

  const PAGES = [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'library', name: 'Library', pattern: 'List' },
    { id: 'activity', name: 'Activity', pattern: 'Report' },
    { id: 'settings', name: 'Settings', pattern: 'Settings' },
  ];
  const main = $('[data-main]');
  const overview = $('[data-page-panel="overview"]');
  let stub = null;
  const seenPages = new Set();

  function ensureStub() {
    if (stub) return stub;
    stub = document.createElement('div');
    stub.setAttribute('data-db-stub-host', '');
    stub.hidden = true;
    main.appendChild(stub);
    return stub;
  }

  function setNav(id) {
    $$('.oc-nav a').forEach((a) => {
      const match = (a.getAttribute('href') || '') === `#/${id}`;
      if (match) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function pageHtml(page) {
    if (page.id === 'library') {
      return `<section class="oc-page" data-db-page="library" aria-labelledby="p-h">
        <h1 id="p-h">Library</h1>
        <p class="oc-page-lead">Saved missions and helmet packs. Sample data · fictional.</p>
        <div class="oc-page-seg" role="group" aria-label="Library state" data-lib-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-lib-body></div>
      </section>`;
    }
    if (page.id === 'activity') {
      return `<section class="oc-page" data-db-page="activity" aria-labelledby="p-h">
        <h1 id="p-h">Activity</h1>
        <p class="oc-page-lead">Recent calibration runs.</p>
        <div class="oc-page-grid">
          ${MISSIONS.map((m) => `<article class="oc-page-card"><div class="oc-row"><strong>${m.name}</strong><span class="oc-chip num">${m.score}</span></div><p class="oc-meta">Signal ${fmt(m.signal)}</p></article>`).join('')}
        </div>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="oc-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="oc-page-lead">Console preferences and haptics stubs.</p>
        <div class="oc-page-grid">
          <article class="oc-page-card"><div class="oc-row"><strong>Clay depth</strong><span class="oc-chip">Soft</span></div></article>
          <article class="oc-page-card"><div class="oc-row"><strong>Rail lock</strong><span class="oc-chip">Manual</span></div></article>
          <article class="oc-page-card"><div class="oc-row"><strong>Helmet pack</strong><span class="oc-chip">Nova</span></div></article>
        </div>
        <button type="button" class="oc-btn" data-save-settings>Save preferences</button>
      </section>`;
    }
    return `<section class="oc-page"><h1>${page.name}</h1></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'library') {
      const body = host.querySelector('[data-lib-body]');
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="oc-loading" role="status"><p>Syncing library…</p><div class="oc-skel"></div><div class="oc-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="oc-empty-block"><p>No saved missions yet.</p></div>`;
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="oc-error-block"><p>Could not load library.</p><button type="button" class="oc-btn" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="oc-page-grid">${MISSIONS.map((m) =>
          `<article class="oc-page-card"><div class="oc-row"><strong>${m.name}</strong><span class="oc-chip">Pack</span></div><p class="oc-meta">Score ${m.score}</p></article>`
        ).join('')}</div>`;
      };
      paint('ready');
      seg(host.querySelector('[data-lib-tabs]'), (v) => paint(v));
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
    window.DB.route(PAGES, (id, page) => {
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

  document.documentElement.dataset.ready = 'true';
})();
