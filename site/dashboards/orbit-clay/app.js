/* Orbit Clay — app shell, pages, interactions. Sample data is fictional. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const board = $('.oc-board');
  const main = $('#main');
  const toastEl = $('[data-toast]');
  let toastTimer = 0;

  const state = {
    base: 'alpha',
    mission: 0,
    orbits: 6,
    live: true,
    alt: 62,
    marked: false,
    calibrated: false,
    score: 0,
  };

  const MISSION_NAMES = ['Nova pass · Alpha', 'Kepler drift · Beta', 'Perihelion loop', 'Umbra survey', 'Zenith relay'];

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2200);
  }

  /* ---------- score count-up ---------- */
  const scoreEl = $('[data-score]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targetScore = 87;
  if (reduced) { scoreEl.textContent = targetScore; state.score = targetScore; }
  else {
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 900);
      const e = 1 - Math.pow(1 - p, 3);
      state.score = Math.round(targetScore * e);
      scoreEl.textContent = state.score;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- overview interactions ---------- */
  $$('[data-base]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const same = state.base === btn.dataset.base;
      state.base = btn.dataset.base;
      $$('[data-base]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const name = btn.dataset.base === 'alpha' ? 'Alpha' : 'Beta';
      $('[data-mname]').textContent = MISSION_NAMES[state.mission] + ' · ' + name;
      btn.classList.remove('is-ping'); void btn.offsetWidth; btn.classList.add('is-ping');
      toast(same ? `Base ${name} marker confirmed` : `Marker switched to Base ${name}`);
    });
  });

  $$('[data-ref="pager-dot"]').forEach((dot) => {
    dot.addEventListener('click', () => {
      const i = Number(dot.dataset.page);
      state.mission = i;
      $$('[data-ref="pager-dot"]').forEach((d) => d.setAttribute('aria-selected', String(d === dot)));
      const name = state.base === 'alpha' ? 'Alpha' : 'Beta';
      $('[data-mname]').textContent = MISSION_NAMES[i] + ' · ' + name;
      toast(`Mission page ${i + 1}: ${MISSION_NAMES[i]}`);
    });
  });

  $('[data-start]').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = on ? 'Abort' : 'Start';
    $('[data-cal-sub]').textContent = on ? 'Running · telemetry live' : 'Idle · set altitude then start';
    if (on) toast('Mission started — telemetry is live');
  });

  $('[data-live]').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    state.live = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(state.live));
    $('[data-cal-sub]').textContent = state.live ? 'Running · telemetry live' : 'Telemetry paused';
    toast(state.live ? 'Telemetry resumed' : 'Telemetry paused');
  });

  $('[data-orb]').addEventListener('click', () => toast('Crew avatar · Nova-4 (sample)'));

  /* calibrate: nudges altitude toward target and updates readouts */
  $('[data-calibrate]').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    state.calibrated = !state.calibrated;
    btn.classList.toggle('is-done', state.calibrated);
    btn.textContent = state.calibrated ? 'Calibrated' : 'Calibrate';
    const sig = Math.round(11204 + (state.calibrated ? 240 : -240));
    $('[data-kpi-sig]').textContent = sig.toLocaleString('en-US').replace(',', ' ');
    $('[data-cal-sub]').textContent = state.calibrated ? `Calibrated · altitude ${state.alt}%` : 'Idle · set altitude then start';
    toast(state.calibrated ? 'Terrain calibrated' : 'Calibration cleared');
  });

  /* stepper: orbit count -> thrust readout */
  $$('[data-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.orbits = Math.min(12, Math.max(1, state.orbits + Number(btn.dataset.step)));
      $('[data-orbits]').textContent = state.orbits;
      const thr = Math.round(3012 + state.orbits * 37);
      $('[data-kpi-thr]').textContent = thr.toLocaleString('en-US').replace(',', ' ');
      toast(`Orbit count set to ${state.orbits}`);
    });
  });

  /* sphere drag -> altitude readout; tap -> survey mark */
  const sphere = $('[data-sphere]');
  const terrain = $('[data-terrain]');
  let dragging = false, moved = false, suppressClick = false;
  const paintSphere = () => {
    const p = state.alt / 100;
    sphere.style.top = `calc(${(1 - p) * 76}% + 6%)`;
    sphere.setAttribute('aria-valuetext', `${state.alt} percent`);
    $('[data-kpi-alt]').textContent = Math.round(1200 + state.alt * 22).toLocaleString('en-US').replace(',', ' ');
  };
  const setAlt = (clientY) => {
    const r = terrain.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, 1 - (clientY - r.top) / r.height));
    const next = Math.round(p * 100);
    if (next !== state.alt) moved = true;
    state.alt = next;
    paintSphere();
    $('[data-cal-sub]').textContent = `Altitude ${state.alt}% · ${state.base === 'alpha' ? 'Alpha' : 'Beta'} grid`;
  };
  sphere.addEventListener('pointerdown', (e) => {
    dragging = true; moved = false;
    sphere.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  sphere.addEventListener('pointermove', (e) => { if (dragging) setAlt(e.clientY); });
  sphere.addEventListener('pointerup', () => {
    if (dragging && moved) suppressClick = true;
    dragging = false;
    if (moved) toast(`Altitude set to ${state.alt}%`);
  });
  sphere.addEventListener('pointercancel', () => { dragging = false; });
  sphere.addEventListener('click', () => {
    if (suppressClick) { suppressClick = false; return; }
    state.marked = !state.marked;
    sphere.classList.toggle('is-marked', state.marked);
    state.alt = 62;
    paintSphere();
    $('[data-cal-sub]').textContent = state.marked ? 'Survey mark set · altitude 62%' : `Altitude ${state.alt}% · ${state.base === 'alpha' ? 'Alpha' : 'Beta'} grid`;
    toast(state.marked ? 'Survey mark set at 62%' : 'Survey mark cleared');
  });
  sphere.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      state.alt = Math.min(100, Math.max(0, state.alt + (e.key === 'ArrowUp' ? 4 : -4)));
      paintSphere();
    }
  });
  setAlt(terrain.getBoundingClientRect().top + terrain.getBoundingClientRect().height * 0.62);

  /* terrain pointer parallax between layers */
  const layers = $$('.oc-ridge');
  let parX = 0, parY = 0, parRaf = 0;
  if (!reduced) {
    terrain.addEventListener('pointermove', (e) => {
      const r = terrain.getBoundingClientRect();
      parX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      parY = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!parRaf) parRaf = requestAnimationFrame(() => {
        parRaf = 0;
        layers.forEach((el, i) => {
          const d = (i + 1) * 2.2;
          el.style.transform = `translate(${(-parX * d).toFixed(2)}px, ${(-parY * d * 0.5).toFixed(2)}px)`;
        });
        $('.oc-spire').style.transform = `translateX(${(-parX * 1.2).toFixed(2)}px)`;
      });
    });
    terrain.addEventListener('pointerleave', () => {
      layers.forEach((el) => { el.style.transform = ''; });
      $('.oc-spire').style.transform = '';
    });
  }

  /* ---------- secondary pages ---------- */
  const LIB = [
    { n: 'Helmet survey reel', d: 'Pass 12 · 02:14', art: 'helmet' },
    { n: 'Dune calibration', d: 'Terrain scan · 01:48', art: 'dunes' },
    { n: 'Ring telemetry', d: 'Gold loop · live', art: 'ring' },
    { n: 'Spire ascent', d: 'North face · 00:57', art: 'spire' },
    { n: 'Sphere rail log', d: 'Drag samples · 04:02', art: 'sphere' },
    { n: 'Crew patch set', d: 'Alpha + Beta · 00:33', art: 'patch' },
    { n: 'Beacon sweep', d: 'K-9 array · 03:10', art: 'beacon' },
    { n: 'Orbit sheets', d: '6 passes · 05:26', art: 'orbit' },
  ];

  const ACT = [
    { t: 'Helmet calibration complete', s: 'auto', time: '2 min ago', dark: false },
    { t: 'Nova-4 docked at <b>Base Alpha</b>', s: 'gold', time: '18 min ago', dark: false },
    { t: 'Terrain layer 3 re-surveyed', s: 'green', time: '1 hr ago', dark: true },
    { t: 'Spire beacon ping 44', s: 'gold', time: '2 hr ago', dark: false },
    { t: 'Sphere rail test · alt 78%', s: 'green', time: '5 hr ago', dark: true },
    { t: 'Patch set uploaded to library', s: 'green', time: 'Yesterday', dark: false },
    { t: 'Beacon sweep K-9 finished', s: 'gold', time: 'Yesterday', dark: true },
    { t: 'Orbit sheets exported', s: 'gold', time: '2 days ago', dark: false },
    { t: 'Beta marker flagged for review', s: 'green', time: '2 days ago', dark: true },
    { t: 'Ring telemetry archived', s: 'green', time: '3 days ago', dark: false },
    { t: 'Dune scan pass 4 uploaded', s: 'gold', time: '3 days ago', dark: true },
    { t: 'Crew patch set v2 synced', s: 'green', time: '4 days ago', dark: false },
  ];

  function libArt(kind) {
    const svg = (inner) => `<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg>`;
    switch (kind) {
      case 'helmet': return svg(`<rect width="160" height="120" fill="#e8eeda"/><circle cx="80" cy="62" r="34" fill="#33503f"/><rect x="58" y="46" width="44" height="26" rx="10" fill="#0c100d"/><circle cx="62" cy="86" r="10" fill="#eef3da"/><circle cx="98" cy="86" r="10" fill="#eef3da"/><rect x="70" y="96" width="20" height="8" rx="3" fill="#33503f"/>`);
      case 'dunes': return svg(`<rect width="160" height="120" fill="#2a3a2f"/><path d="M0 84 L40 44 L74 78 L110 34 L160 82 L160 120 L0 120Z" fill="#dfe4c2" opacity=".55"/><path d="M0 100 L52 66 L96 96 L134 60 L160 92 L160 120 L0 120Z" fill="#cfd6a8" opacity=".85"/><path d="M0 112 L60 88 L120 110 L160 92 L160 120 L0 120Z" fill="#b9c294"/>`);
      case 'ring': return svg(`<rect width="160" height="120" fill="#e8eeda"/><circle cx="80" cy="60" r="36" fill="none" stroke="#c9a24a" stroke-width="10"/><circle cx="80" cy="60" r="18" fill="#33503f"/>`);
      case 'spire': return svg(`<rect width="160" height="120" fill="#2a3a2f"/><path d="M0 96 L50 60 L90 90 L160 52 L160 120 L0 120Z" fill="#dfe4c2" opacity=".6"/><path d="M74 96 L80 30 L86 96Z" fill="#eef3da"/><path d="M0 108 L60 88 L160 104 L160 120 L0 120Z" fill="#b9c294"/>`);
      case 'sphere': return svg(`<rect width="160" height="120" fill="#2a3a2f"/><line x1="80" y1="10" x2="80" y2="112" stroke="#e8eeda" stroke-width="3" opacity=".7"/><circle cx="80" cy="72" r="18" fill="#c9a24a"/><circle cx="74" cy="66" r="6" fill="#e0c078"/>`);
      case 'patch': return svg(`<rect width="160" height="120" fill="#e8eeda"/><circle cx="80" cy="60" r="40" fill="#2e4639"/><path d="M80 34 L98 48 L92 70 L68 70 L62 48Z" fill="#c9a24a"/><circle cx="80" cy="56" r="6" fill="#e8eeda"/>`);
      case 'beacon': return svg(`<rect width="160" height="120" fill="#e8eeda"/><circle cx="80" cy="60" r="26" fill="#2e4639"/><circle cx="80" cy="60" r="10" fill="#c9a24a"/><path d="M80 20v-8M80 108v-8M40 60H32M128 60h-8" stroke="#47604f" stroke-width="4" stroke-linecap="round"/>`);
      default: return svg(`<rect width="160" height="120" fill="#e8eeda"/><ellipse cx="80" cy="64" rx="52" ry="26" fill="none" stroke="#c9a24a" stroke-width="9"/><ellipse cx="80" cy="64" rx="30" ry="14" fill="#33503f"/>`);
    }
  }

  function renderLibrary() {
    const el = $('.oc-lib');
    el.innerHTML = `
      <div class="oc-page-head">
        <h2 class="oc-page-title">Library</h2>
        <p class="oc-page-sub">8 captures · Orbit Clay archive</p>
      </div>
      <div class="oc-lib-tools clay-tools" style="display:flex;gap:.8cqw">
        <label class="oc-chip" style="flex:1;justify-content:flex-start">${'<svg width="14" height="14"><use href="#oc-search"/></svg>'} Search captures<input data-lib-search type="search" placeholder="helmet, dunes…" style="border:0;background:transparent;font:inherit;color:inherit;outline:none;flex:1"></label>
        <button type="button" class="oc-chip oc-chip-act" data-lib-filter="all" aria-pressed="true">All</button>
        <button type="button" class="oc-chip oc-chip-act" data-lib-filter="video" aria-pressed="false">Video</button>
        <button type="button" class="oc-chip oc-chip-act" data-lib-filter="scan" aria-pressed="false">Scans</button>
      </div>
      <div class="oc-lib-grid">${LIB.map((it, i) => `
        <button type="button" class="oc-lib-item oc-clay-card" data-lib-item data-kind="${i % 2 ? 'video' : 'scan'}" data-name="${it.n.toLowerCase()}">
          <span class="oc-lib-thumb">${libArt(it.art)}<span class="oc-play"><svg><use href="#oc-play"/></svg></span></span>
          <span class="oc-lib-meta"><span class="oc-lib-name">${it.n}</span><span class="oc-lib-desc">${it.d}</span></span>
        </button>`).join('')}
      </div>`;
    el.querySelectorAll('[data-lib-item]').forEach((b) => {
      b.addEventListener('click', () => toast(`Opening “${b.querySelector('.oc-lib-name').textContent}” (sample)`));
    });
    const chips = el.querySelectorAll('[data-lib-filter]');
    chips.forEach((c) => c.addEventListener('click', () => {
      chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
      const f = c.dataset.libFilter;
      el.querySelectorAll('[data-lib-item]').forEach((b) => {
        b.hidden = f !== 'all' && b.dataset.kind !== f;
      });
      toast(`Library filtered: ${f}`);
    }));
    el.querySelector('[data-lib-search]').addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      el.querySelectorAll('[data-lib-item]').forEach((b) => {
        b.hidden = q && !b.dataset.name.includes(q);
      });
    });
  }

  function renderActivity() {
    const el = $('.oc-act');
    el.innerHTML = `
      <div class="oc-page-head">
        <h2 class="oc-page-title">Activity</h2>
        <p class="oc-page-sub">Mission log · last 72 hours</p>
      </div>
      <div class="oc-act-tools" style="display:flex;gap:.8cqw">
        <button type="button" class="oc-chip oc-chip-act" data-act-filter="all" aria-pressed="true">All</button>
        <button type="button" class="oc-chip oc-chip-act" data-act-filter="gold" aria-pressed="false">Gold</button>
        <button type="button" class="oc-chip oc-chip-act" data-act-filter="green" aria-pressed="false">Green</button>
        <button type="button" class="oc-chip oc-chip-act" data-act-export>Export log</button>
      </div>
      <div class="oc-clay-card-dark oc-act-feed" style="padding:.8cqw">${ACT.map((a) => `
        <div class="oc-act-row oc-act-${a.dark ? 'dark' : 'light'}" data-act-kind="${a.s}">
          <span class="oc-act-dot ${a.s === 'gold' ? 'g' : a.s === 'green' ? 'd' : 'c'}"></span>
          <div><p class="oc-act-txt">${a.t}</p><p class="oc-act-time">${a.time}</p></div>
        </div>`).join('')}
      </div>`;
    const chips = el.querySelectorAll('[data-act-filter]');
    chips.forEach((c) => c.addEventListener('click', () => {
      chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
      const f = c.dataset.actFilter;
      el.querySelectorAll('[data-act-kind]').forEach((r) => {
        r.hidden = f !== 'all' && r.dataset.actKind !== f;
      });
    }));
    el.querySelector('[data-act-export]').addEventListener('click', () => toast('Activity log exported (sample .txt)'));
  }

  function renderSettings() {
    const el = $('.oc-set');
    el.innerHTML = `
      <div class="oc-page-head">
        <h2 class="oc-page-title">Settings</h2>
        <p class="oc-page-sub">Board preferences · Orbit Clay</p>
      </div>
      <div class="oc-set-grid">
        <section class="oc-clay-card oc-set-card">
          <h3>Display</h3>
          <div class="oc-set-row"><span>Terrain parallax</span><input type="checkbox" data-set="parallax" checked aria-label="Terrain parallax"></div>
          <div class="oc-set-row"><span>Helmet idle spin</span><input type="checkbox" data-set="spin" checked aria-label="Helmet idle spin"></div>
          <div class="oc-set-row"><span>Board grain</span><input type="checkbox" data-set="grain" checked aria-label="Board grain"></div>
          <div class="oc-set-row"><span>Reduce motion</span><input type="checkbox" data-set="motion" ${reduced ? 'checked' : ''} aria-label="Reduce motion"></div>
          <h3 style="margin-top:.6cqw">Crew</h3>
          <div class="oc-set-row"><span>Call sign</span><input value="Nova-4" data-set-input="callsign" style="border:0;background:rgba(46,70,57,.1);border-radius:.8cqw;padding:.3cqw .7cqw;font:inherit;font-weight:700;color:var(--oc-green-deep);width:38%;outline:none"></div>
          <div class="oc-set-row"><span>Notify on calibrate</span><input type="checkbox" data-set="notify" checked aria-label="Notify on calibrate"></div>
          <div class="oc-set-row"><span>Auto-rotate terrain</span><input type="checkbox" data-set="autorot" aria-label="Auto-rotate terrain"></div>
          <div class="oc-set-row"><span>Sphere rail snap</span><input type="checkbox" data-set="snap" checked aria-label="Sphere rail snap"></div>
          <div class="oc-set-row"><span>Helmet glow</span><input type="range" min="0" max="100" value="60" data-set-range="glow" aria-label="Helmet glow"></div>
          <div class="oc-set-row"><span>Terrain detail</span>
            <select data-set-select="detail" style="border:0;background:rgba(46,70,57,.1);border-radius:.8cqw;padding:.3cqw .7cqw;font:inherit;font-weight:700;color:var(--oc-green-deep);outline:none">
              <option value="low">Low</option><option value="med" selected>Medium</option><option value="high">High</option>
            </select>
          </div>
          <h3 style="margin-top:.6cqw">Data</h3>
          <div class="oc-set-row"><span>Refresh telemetry</span><button type="button" class="oc-chip" data-set-refresh>Refresh now</button></div>
          <div class="oc-set-row"><span>Export calibration</span><button type="button" class="oc-chip" data-set-export>Export .json</button></div>
          <div class="oc-set-row"><span>Clear activity log</span><button type="button" class="oc-chip" data-set-clear>Clear</button></div>
        </section>
        <section class="oc-clay-card-dark oc-set-card oc-set-dark">
          <h3>Palette</h3>
          <div class="oc-set-preview" role="group" aria-label="Variant">
            <button type="button" class="oc-set-swatch" data-theme-set="default" aria-pressed="true" style="background:radial-gradient(circle at 35% 30%,#e0c078,#c9a24a 60%,#937046)" aria-label="Orbit variant"></button>
            <button type="button" class="oc-set-swatch" data-theme-set="moss" aria-pressed="false" style="background:radial-gradient(circle at 35% 30%,#bcc794,#a8b184 60%,#7e8f5e)" aria-label="Moss variant"></button>
            <button type="button" class="oc-set-swatch" data-theme-set="dusk" aria-pressed="false" style="background:radial-gradient(circle at 35% 30%,#a8927c,#8f7a68 60%,#6a5747)" aria-label="Dusk variant"></button>
          </div>
          <p class="oc-set-note" style="margin:0;font-size:clamp(12px,.85cqw,12px);color:#b9c6a4">Variants recolor board, panels and the helmet from tokens.</p>
          <h3>Session</h3>
          <button type="button" class="oc-calibrate" data-set-reset style="position:static;width:100%;height:4cqw">Reset board</button>
        </section>
      </div>`;
    el.querySelectorAll('[data-set]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const k = inp.dataset.set;
        if (k === 'parallax') { terrain.dataset.parallax = inp.checked ? '1' : '0'; toast(inp.checked ? 'Parallax on' : 'Parallax off'); }
        if (k === 'spin') { window.DBHero?.setSpin?.(inp.checked); toast(inp.checked ? 'Helmet spin on' : 'Helmet spin off'); }
        if (k === 'grain') { $('.oc-bd-grain').style.display = inp.checked ? '' : 'none'; toast(inp.checked ? 'Grain on' : 'Grain off'); }
        if (k === 'motion') { document.documentElement.dataset.reducedMotion = inp.checked ? 'true' : 'false'; toast(inp.checked ? 'Motion reduced' : 'Full motion'); }
        if (k === 'notify') toast(inp.checked ? 'Calibrate alerts on' : 'Calibrate alerts off');
        if (k === 'autorot') toast(inp.checked ? 'Terrain auto-rotate on' : 'Terrain auto-rotate off');
        if (k === 'snap') { sphere.dataset.snap = inp.checked ? '1' : '0'; toast(inp.checked ? 'Sphere rail snap on' : 'Sphere rail snap off'); }
      });
    });
    el.querySelector('[data-set-range="glow"]').addEventListener('input', (e) => {
      toast(`Helmet glow ${e.target.value}%`);
    });
    el.querySelector('[data-set-select="detail"]').addEventListener('change', (e) => {
      toast(`Terrain detail: ${e.target.value}`);
    });
    el.querySelector('[data-set-refresh]').addEventListener('click', () => toast('Telemetry refreshed (sample)'));
    el.querySelector('[data-set-export]').addEventListener('click', () => toast('Calibration exported (sample .json)'));
    el.querySelector('[data-set-clear]').addEventListener('click', () => toast('Activity log cleared'));
    el.querySelector('[data-set-input="callsign"]').addEventListener('change', (e) => {
      toast(`Call sign set to “${e.target.value || 'Nova-4'}”`);
    });
    el.querySelectorAll('[data-theme-set]').forEach((b) => {
      b.addEventListener('click', () => {
        const t = b.dataset.themeSet;
        document.documentElement.dataset.variant = t;
        el.querySelectorAll('[data-theme-set]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        window.DBHero?.recolor?.();
        toast(`Palette: ${t}`);
      });
    });
    el.querySelector('[data-set-reset]').addEventListener('click', () => {
      state.orbits = 6; state.alt = 62; state.base = 'alpha'; state.mission = 0; state.calibrated = false;
      $('[data-orbits]').textContent = '6';
      $('[data-kpi-thr]').textContent = '3 412';
      $('[data-kpi-alt]').textContent = '2 484';
      $('[data-kpi-sig]').textContent = '11 204';
      $$('[data-base]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.base === 'alpha')));
      $$('[data-ref="pager-dot"]').forEach((d, i) => d.setAttribute('aria-selected', String(i === 0)));
      $('[data-mname]').textContent = MISSION_NAMES[0] + ' · Alpha';
      $('[data-start]').setAttribute('aria-pressed', 'false');
      $('[data-start]').textContent = 'Start';
      $('[data-cal-sub]').textContent = 'Idle · set altitude then start';
      const r = terrain.getBoundingClientRect();
      setAlt(r.top + r.height * 0.62);
      toast('Board reset');
    });
  }

  /* ---------- routing (shared frame router) ---------- */
  const pages = { overview: $('.oc-over'), library: $('.oc-lib'), activity: $('.oc-act'), settings: $('.oc-set') };
  let rendered = {};

  window.DB.route([
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'library', name: 'Library', pattern: 'Gallery' },
    { id: 'activity', name: 'Activity', pattern: 'List' },
    { id: 'settings', name: 'Settings', pattern: 'Settings' },
  ], (id) => {
    const page = pages[id] || pages.overview;
    Object.values(pages).forEach((p) => { p.hidden = p !== page; });
    if (!rendered[id]) {
      rendered[id] = true;
      if (id === 'library') renderLibrary();
      if (id === 'activity') renderActivity();
      if (id === 'settings') renderSettings();
    }
  });

  document.documentElement.dataset.ready = 'true';
})();
