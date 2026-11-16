/* Ember Rooms: neumorphic lighting console + climate knob. Fictional sample data. No polling. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  function toast(msg) {
    const t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(() => { t.hidden = true; }, 2200);
  }

  /* Left-arc angles (deg): 0 = right, y-down. Sit on the ring circumference. */
  const ROOMS = [
    { id: 'living', name: 'Living room', icon: 'er-sofa', label: 'LV', on: true, lights: 4, angle: 228, radius: 49 },
    { id: 'kitchen', name: 'Kitchen', icon: 'er-pot', label: 'KT', on: false, lights: 3, angle: 204, radius: 49 },
    { id: 'bedroom', name: 'Bedroom', icon: 'er-bed', label: 'BR', on: true, lights: 2, angle: 180, radius: 49 },
    { id: 'bath', name: 'Bath', icon: 'er-bath', label: 'BA', on: false, lights: 2, angle: 156, radius: 49 },
    { id: 'study', name: 'Study', icon: 'er-desk', label: 'ST', on: true, lights: 1, angle: 132, radius: 49 },
  ];
  const EXTRA_ROOMS = [
    { id: 'nursery', name: 'Nursery', icon: 'er-bed', label: 'NU', on: false, lights: 2 },
    { id: 'garage', name: 'Garage', icon: 'er-desk', label: 'GA', on: false, lights: 3 },
    { id: 'patio', name: 'Patio', icon: 'er-sun', label: 'PA', on: true, lights: 2 },
    { id: 'pantry', name: 'Pantry', icon: 'er-pot', label: 'PN', on: false, lights: 1 },
  ];
  const USAGE = [18, 24, 21, 32, 28, 36, 42];
  const PEAK = {
    '1H': [6.1, 6.8, 7.4, 8.0, 8.6, 9.1, 9.4],
    '2H': [5.2, 5.8, 6.4, 7.1, 7.9, 8.6, 9.0],
    '3H': [4.6, 5.1, 5.9, 6.6, 7.4, 8.2, 8.7],
    '4H': [4.2, 5.1, 6.8, 5.4, 7.2, 8.1, 9.4],
  };
  const ENERGY_WEEK = [
    { d: 'Mon', v: 5.2 }, { d: 'Tue', v: 6.1 }, { d: 'Wed', v: 4.8 },
    { d: 'Thu', v: 7.4 }, { d: 'Fri', v: 8.2 }, { d: 'Sat', v: 9.1 }, { d: 'Sun', v: 6.6 },
  ];
  const TIMES = ['6:30 AM', '7:00 AM', '8:30 AM', '9:00 AM', '4:30 PM', '6:00 PM', '8:00 PM', '10:30 PM'];

  const S = {
    page: 'overview', room: 2, bright: 68, power: true, start: 2, end: 4, playing: false,
    temp: 23, cool: true, wind: 45, mode: 'cool', day: '1H', q: '', hist: [], future: [],
    settingsPreview: 'populated', notify: true, autoDim: true,
  };

  function pushHist() {
    S.hist.push({ room: S.room, bright: S.bright, power: S.power, temp: S.temp });
    if (S.hist.length > 20) S.hist.shift();
    S.future = [];
  }

  function spark(values, accentDot) {
    const w = 200, h = 56, pad = 4;
    const max = Math.max(...values), min = Math.min(...values);
    const pts = values.map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
      return [x, y];
    });
    const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const last = pts[pts.length - 1];
    const dot = accentDot ? `<circle class="dot" cx="${last[0]}" cy="${last[1]}" r="3.2"/>` : '';
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path class="ln" d="${path}"/>${dot}</svg>`;
  }

  function syncHero() {
    if (!window.DBHero) return;
    if (typeof window.DBHero.setIntensity === 'function') window.DBHero.setIntensity(S.power ? S.bright / 100 : 0);
    if (typeof window.DBHero.setPower === 'function') window.DBHero.setPower(S.power);
    if (typeof window.DBHero.recolor === 'function') window.DBHero.recolor();
  }

  function renderOrbit() {
    const host = $('[data-orbit]');
    if (!host) return;
    host.innerHTML = ROOMS.map((r, i) => {
      const rad = (r.angle * Math.PI) / 180;
      const x = 50 + Math.cos(rad) * r.radius;
      const y = 50 + Math.sin(rad) * r.radius;
      return `<button type="button" class="er-room" data-ref="room" style="left:${x}%;top:${y}%;--i:${i}" data-room="${r.id}" aria-pressed="${i === S.room}" aria-label="${r.name}">
        <svg><use href="#${r.icon}"/></svg><span class="er-room-code">${r.label}</span></button>`;
    }).join('');
  }

  function renderOverviewBits() {
    const room = ROOMS[S.room];
    const totalLights = ROOMS.reduce((a, r) => a + r.lights, 0);
    const lit = S.power ? ROOMS.filter((r) => r.on).reduce((a, r) => a + r.lights, 0) : 0;
    const frac = $('[data-frac]');
    if (frac) frac.textContent = `${totalLights}/${lit}`;
    const label = $('.er-light-label');
    if (label) label.textContent = `${room.name} ceiling`;
    const bright = $('[data-bright]');
    const bout = $('[data-bright-out]');
    if (bright) bright.value = String(S.bright);
    if (bout) bout.textContent = `${S.bright}%`;
    const power = $('[data-power]');
    if (power) power.setAttribute('aria-pressed', S.power ? 'true' : 'false');
    const start = $('[data-start]');
    const end = $('[data-end]');
    if (start) start.textContent = TIMES[S.start];
    if (end) end.textContent = TIMES[S.end];
    const arc = $('[data-gauge-arc]');
    if (arc) {
      const c = 2 * Math.PI * 36;
      const pct = S.power ? S.bright / 100 : 0;
      arc.style.strokeDasharray = String(c);
      arc.style.strokeDashoffset = String(c * (1 - pct));
    }
    const usage = $('[data-usage]');
    const peak = $('[data-peak]');
    const peakSeries = PEAK[S.day] || PEAK['1H'];
    if (usage) usage.textContent = String(USAGE[USAGE.length - 1]);
    if (peak) peak.textContent = String(peakSeries[peakSeries.length - 1]);
    $$('[data-chart]').forEach((el) => {
      el.innerHTML = spark(el.dataset.chart === 'peak' ? peakSeries : USAGE, el.dataset.chart === 'peak');
    });
    $$('[data-day]').forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.day === S.day ? 'true' : 'false');
    });
    const play = $('[data-play]');
    if (play) play.setAttribute('aria-pressed', S.playing ? 'true' : 'false');
    renderOrbit();
    syncHero();
  }

  function stateBox(kind, title, body) {
    return `<div class="er-state" data-state="${kind}"><b>${title}</b>${body}</div>`;
  }

  function renderRoomsPage(el) {
    const q = S.q.trim().toLowerCase();
    const allRooms = ROOMS.concat(EXTRA_ROOMS);
    const list = allRooms.filter((r) => !q || r.name.toLowerCase().includes(q) || r.label.toLowerCase().includes(q));
    if (S.settingsPreview === 'loading') {
      el.innerHTML = `<h1>Rooms</h1><p class="er-lead">Zones on this floor.</p>${stateBox('loading', 'Loading rooms…', 'Pulling the latest scene map.')}`;
      return;
    }
    if (S.settingsPreview === 'error') {
      el.innerHTML = `<h1>Rooms</h1><p class="er-lead">Zones on this floor.</p>${stateBox('error', 'Could not load rooms', 'Check the hub connection, then try again.')}<div class="er-actions"><button type="button" class="er-btn er-btn-primary" data-retry>Try again</button></div>`;
      return;
    }
    if (!list.length || S.settingsPreview === 'empty') {
      el.innerHTML = `<h1>Rooms</h1><p class="er-lead">Zones on this floor.</p>${stateBox('empty', 'No rooms match', 'Clear the search or add a zone in Settings.')}`;
      return;
    }
    el.innerHTML = `<h1>Rooms</h1><p class="er-lead">Pick a zone to focus the pendant stage and schedule.</p>
      <div class="er-grid">${list.map((r, i) => `
        <button type="button" class="er-card" data-pick-room="${Math.max(0, ROOMS.findIndex(x => x.id === r.id))}" style="--i:${i}">
          <span class="er-pill ${r.on ? '' : 'is-off'}">${r.on ? 'Lit' : 'Off'}</span>
          <b>${r.name}</b><small>${r.lights} fixtures · ${r.label}</small>
        </button>`).join('')}
        <article class="er-card"><span class="er-pill">Scenes</span><b>Evening calm</b><small>Dims living + bedroom to 35%</small></article>
        <article class="er-card"><span class="er-pill">Scenes</span><b>Guest ready</b><small>Warms nursery path lights</small></article>
        <article class="er-card"><span class="er-pill">Alert</span><b>Bath humidity</b><small>Fan suggested after shower</small></article>
      </div>`;
  }

  function renderDevicesPage(el) {
    const circ = 2 * Math.PI * 46;
    const tNorm = (S.temp - 16) / (30 - 16);
    const arcLen = circ * 0.55;
    const offset = circ - arcLen * tNorm;
    el.innerHTML = `
      <h1 class="vh">Climate</h1>
      <div class="er-climate-stage">
        <div class="er-climate-rings" aria-hidden="true"><i></i><i></i><i></i></div>
        <button type="button" class="er-cool" data-cool aria-pressed="${S.cool}"><svg><use href="#er-snow"/></svg> Cool air</button>
        <button type="button" class="er-mode-chip" style="left:72%;top:18%" data-mode-chip="light" aria-pressed="${S.mode === 'light'}" aria-label="Light mode"><svg><use href="#er-bulb"/></svg></button>
        <button type="button" class="er-mode-chip" style="left:78%;top:48%" data-mode-chip="humid" aria-pressed="${S.mode === 'humid'}" aria-label="Humidity mode"><svg><use href="#er-drop"/></svg></button>
        <button type="button" class="er-mode-chip" style="left:18%;top:62%" data-mode-chip="cool" aria-pressed="${S.mode === 'cool'}" aria-label="Cool mode"><svg><use href="#er-snow"/></svg></button>
        <span class="er-level">4Lv</span>
        <button type="button" class="er-pm er-pm-minus" data-temp="-1" aria-label="Lower temperature"><svg><use href="#er-minus"/></svg></button>
        <button type="button" class="er-pm er-pm-plus" data-temp="1" aria-label="Raise temperature"><svg><use href="#er-plus"/></svg></button>
        <div class="er-knob-wrap">
          <svg class="er-knob-arc" viewBox="0 0 100 100" aria-hidden="true">
            <circle class="track" cx="50" cy="50" r="46" stroke-dasharray="${circ}" stroke-dashoffset="0"/>
            <circle class="arc" cx="50" cy="50" r="46" stroke-dasharray="${arcLen} ${circ}" stroke-dashoffset="${offset}"/>
          </svg>
          <div class="er-knob" role="group" aria-label="Thermostat">
            <div class="er-knob-face"><b class="num">${S.temp}°</b><small>Celsius</small></div>
          </div>
        </div>
        <label class="er-wind"><span>Low</span><input type="range" min="0" max="100" value="${S.wind}" data-wind aria-label="Wind speed"><span>High</span></label>
      </div>
      <div class="er-grid" style="margin-top:1.5cqw;width:100%">
        <article class="er-card"><span class="er-pill">Humidity</span><b class="num">46%</b><small>Living room sensor</small></article>
        <article class="er-card"><span class="er-pill">Air</span><b class="num">Good</b><small>PM2.5 · 8 µg/m³</small></article>
        <article class="er-card"><span class="er-pill">Filter</span><b class="num">72%</b><small>Life remaining</small></article>
        <article class="er-card"><span class="er-pill">Fan</span><b class="num">${S.wind}%</b><small>Current wind speed</small></article>
        <article class="er-card"><span class="er-pill">Mode</span><b>${S.cool ? 'Cool' : 'Heat'}</b><small>Active climate mode</small></article>
        <article class="er-card"><span class="er-pill">Target</span><b class="num">${S.temp}°C</b><small>Bedroom setpoint</small></article>
      </div>`;
  }

  function renderEnergyPage(el) {
    const max = Math.max(...ENERGY_WEEK.map((x) => x.v));
    const circuits = [
      { name: 'Ceiling pendants', w: 86, note: 'Bedroom + living' },
      { name: 'Cove LEDs', w: 42, note: 'Kitchen run' },
      { name: 'Bath sconces', w: 28, note: 'Night path' },
      { name: 'Study desk', w: 35, note: 'Task lamp' },
      { name: 'Hall spots', w: 19, note: 'Motion scenes' },
      { name: 'Exterior porch', w: 24, note: 'Dusk schedule' },
    ];
    el.innerHTML = `<h1>Energy</h1><p class="er-lead">Week of lighting load for Ember Rooms sample home.</p>
      <div class="er-bars">${ENERGY_WEEK.map((x, i) => `
        <div class="er-bar" style="--k:${i}"><i style="height:${(x.v / max) * 100}%"></i><span>${x.d}</span></div>`).join('')}</div>
      <div class="er-grid">
        <article class="er-card"><span class="er-pill">Usage</span><b class="num">${USAGE.reduce((a, b) => a + b, 0)} kWh</b><small>Last 7 days across lit rooms</small></article>
        <article class="er-card"><span class="er-pill">Peak</span><b class="num">${Math.max(...(PEAK[S.day] || PEAK['1H']))} kW</b><small>Highest draw this afternoon</small></article>
        <article class="er-card"><span class="er-pill">Saved</span><b class="num">12%</b><small>vs last week with auto-dim</small></article>
        <article class="er-card"><span class="er-pill">Cost</span><b class="num">$18.40</b><small>Estimated week at sample tariff</small></article>
        <article class="er-card"><span class="er-pill">Co₂</span><b class="num">9.1 kg</b><small>Avoided with schedule cuts</small></article>
        <article class="er-card"><span class="er-pill">Scenes</span><b class="num">14</b><small>Automations that fired</small></article>
      </div>
      <h2 style="margin:2cqw 0 1cqw;font-size:max(16px,1.6cqw)">Circuits</h2>
      <div class="er-grid">${circuits.map((c) => `
        <article class="er-card"><span class="er-pill">${c.w}%</span><b>${c.name}</b><small>${c.note}</small></article>`).join('')}</div>`;
  }

  function renderSettingsPage(el) {
    const hubs = [
      { name: 'Loft hub', detail: 'Online · 14 devices' },
      { name: 'Garden bridge', detail: 'Idle · 3 devices' },
      { name: 'Guest suite', detail: 'Sleeping · 6 devices' },
    ];
    el.innerHTML = `<h1>Settings</h1><p class="er-lead">Home profile and preview states for this console.</p>
      <form class="er-form" data-settings-form novalidate>
        <div class="er-field" data-field="name">
          <label for="er-name">Home name</label>
          <input id="er-name" name="name" required minlength="2" value="Ember Loft" autocomplete="organization">
          <span class="er-err" hidden>Enter at least two characters.</span>
        </div>
        <div class="er-field">
          <label for="er-zone">Default zone</label>
          <select id="er-zone" name="zone">${ROOMS.map((r, i) => `<option value="${r.id}" ${i === S.room ? 'selected' : ''}>${r.name}</option>`).join('')}</select>
        </div>
        <div class="er-field">
          <label for="er-tz">Time zone</label>
          <select id="er-tz" name="tz"><option>Pacific — Los Angeles</option><option>Mountain — Denver</option><option>Eastern — New York</option></select>
        </div>
        <div class="er-switch"><span>Notify on schedule</span><button type="button" role="switch" data-sw="notify" aria-checked="${S.notify}" aria-label="Notify on schedule"></button></div>
        <div class="er-switch"><span>Auto-dim after sunset</span><button type="button" role="switch" data-sw="autoDim" aria-checked="${S.autoDim}" aria-label="Auto-dim after sunset"></button></div>
        <div class="er-switch"><span>Share room previews</span><button type="button" role="switch" data-sw="notify" aria-checked="false" aria-label="Share room previews"></button></div>
        <div class="er-actions">
          <button type="submit" class="er-btn er-btn-primary">Save profile</button>
          <button type="button" class="er-btn" data-reset>Reset sample</button>
          <button type="button" class="er-btn" data-undo>Undo last edit</button>
        </div>
      </form>
      <h2 style="margin:2cqw 0 1cqw;font-size:max(16px,1.6cqw)">Hubs</h2>
      <div class="er-grid">${hubs.map((h) => `<article class="er-card"><span class="er-pill">Hub</span><b>${h.name}</b><small>${h.detail}</small></article>`).join('')}</div>
      <div class="er-preview" aria-label="Preview a state">
        <span class="er-k" style="align-self:center">Preview a state</span>
        ${['populated', 'loading', 'empty', 'error'].map((k) => `<button type="button" data-preview="${k}" aria-pressed="${S.settingsPreview === k}">${k}</button>`).join('')}
      </div>`;
  }

  function render() {
    $$('[data-db-page]').forEach((p) => { p.hidden = p.dataset.dbPage !== S.page; });
    document.documentElement.dataset.page = S.page;
    const el = $(`[data-db-page="${S.page}"]`);
    if (!el) return;
    if (S.page === 'overview') renderOverviewBits();
    else if (S.page === 'rooms') renderRoomsPage(el);
    else if (S.page === 'devices') renderDevicesPage(el);
    else if (S.page === 'energy') renderEnergyPage(el);
    else if (S.page === 'settings') renderSettingsPage(el);
  }

  document.addEventListener('click', (e) => {
    const roomBtn = e.target.closest('[data-room]');
    if (roomBtn) {
      const idx = ROOMS.findIndex((r) => r.id === roomBtn.dataset.room);
      if (idx >= 0) { pushHist(); S.room = idx; ROOMS[idx].on = true; render(); toast(`${ROOMS[idx].name} focused`); }
      return;
    }
    const pick = e.target.closest('[data-pick-room]');
    if (pick) { pushHist(); S.room = Number(pick.dataset.pickRoom); location.hash = '#/overview'; toast(`${ROOMS[S.room].name} on overview`); return; }
    if (e.target.closest('[data-power]')) { pushHist(); S.power = !S.power; render(); toast(S.power ? 'Light on' : 'Light off'); return; }
    if (e.target.closest('[data-play]')) { S.playing = !S.playing; render(); toast(S.playing ? 'Preview playing' : 'Preview paused'); return; }
    if (e.target.closest('[data-start]')) { pushHist(); S.start = (S.start + 1) % TIMES.length; render(); return; }
    if (e.target.closest('[data-end]')) { pushHist(); S.end = (S.end + 1) % TIMES.length; render(); return; }
    if (e.target.closest('[data-undo]')) {
      const prev = S.hist.pop();
      if (!prev) { toast('Nothing to undo'); return; }
      S.future.push({ room: S.room, bright: S.bright, power: S.power, temp: S.temp });
      Object.assign(S, prev); render(); toast('Undid last change'); return;
    }
    if (e.target.closest('[data-redo]')) {
      const next = S.future.pop();
      if (!next) { toast('Nothing to redo'); return; }
      S.hist.push({ room: S.room, bright: S.bright, power: S.power, temp: S.temp });
      Object.assign(S, next); render(); toast('Redid change'); return;
    }
    const tempBtn = e.target.closest('[data-temp]');
    if (tempBtn) { pushHist(); S.temp = Math.max(16, Math.min(30, S.temp + Number(tempBtn.dataset.temp))); render(); return; }
    if (e.target.closest('[data-cool]')) { S.cool = !S.cool; S.mode = S.cool ? 'cool' : 'light'; render(); return; }
    const modeChip = e.target.closest('[data-mode-chip]');
    if (modeChip) { S.mode = modeChip.dataset.modeChip; S.cool = S.mode === 'cool'; render(); return; }
    const dayChip = e.target.closest('[data-day]');
    if (dayChip) { S.day = dayChip.dataset.day; render(); toast(`Peak · ${S.day}`); return; }
    const sw = e.target.closest('[data-sw]');
    if (sw) { S[sw.dataset.sw] = !(sw.getAttribute('aria-checked') === 'true'); render(); return; }
    const prev = e.target.closest('[data-preview]');
    if (prev) { S.settingsPreview = prev.dataset.preview; if (S.settingsPreview !== 'populated') location.hash = '#/rooms'; else render(); return; }
    if (e.target.closest('[data-retry]')) { S.settingsPreview = 'populated'; render(); return; }
    if (e.target.closest('[data-reset]')) {
      S.notify = true; S.autoDim = true; S.settingsPreview = 'populated';
      const form = $('[data-settings-form]'); if (form) form.reset();
      toast('Sample profile restored'); render(); return;
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target.matches('[data-bright]')) {
      S.bright = Number(e.target.value);
      const bout = $('[data-bright-out]'); if (bout) bout.textContent = `${S.bright}%`;
      const arc = $('[data-gauge-arc]');
      if (arc) { const c = 2 * Math.PI * 36; arc.style.strokeDashoffset = String(c * (1 - (S.power ? S.bright / 100 : 0))); }
      syncHero(); return;
    }
    if (e.target.matches('[data-wind]')) { S.wind = Number(e.target.value); return; }
    if (e.target.matches('[data-q]')) { S.q = e.target.value; if (S.page === 'rooms') render(); }
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-bright]')) { pushHist(); toast(`Intensity ${S.bright}%`); }
  });

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-settings-form]');
    if (!form) return;
    e.preventDefault();
    const name = form.name.value.trim();
    const field = form.querySelector('[data-field="name"]');
    const err = field.querySelector('.er-err');
    if (name.length < 2) { field.dataset.invalid = '1'; err.hidden = false; form.name.focus(); return; }
    delete field.dataset.invalid; err.hidden = true;
    const idx = ROOMS.findIndex((r) => r.id === form.zone.value);
    if (idx >= 0) S.room = idx;
    toast(`Saved “${name}”`);
  });

  document.addEventListener('db-hero-ready', () => syncHero());

  const PAGES = [
    { id: 'overview', name: 'Overview' },
    { id: 'rooms', name: 'Rooms' },
    { id: 'devices', name: 'Devices' },
    { id: 'energy', name: 'Energy' },
    { id: 'settings', name: 'Settings' },
  ];
  if (window.DB && typeof window.DB.route === 'function') {
    window.DB.route(PAGES, (id) => { S.page = id; render(); });
  } else {
    const go = () => {
      const raw = (location.hash || '').replace(/^#\/?/, '').split(/[/?#]/)[0];
      S.page = PAGES.some((p) => p.id === raw) ? raw : 'overview';
      render();
    };
    window.addEventListener('hashchange', go);
    go();
  }

  new MutationObserver(() => { if (window.DBHero && window.DBHero.recolor) window.DBHero.recolor(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-variant'] });

  renderOverviewBits();
  document.documentElement.dataset.ready = 'true';
})();
