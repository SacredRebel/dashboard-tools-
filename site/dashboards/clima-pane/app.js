/* Clima Pane: glass smart-home climate. Fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    thermo: '<path d="M14 14.800V5a2 2 0 0 0-4 0v9.800a4 4 0 1 0 4 0z"/>',
    fan: '<circle cx="12" cy="12" r="1.5"/><path d="M12 10.500C12 6 10 3 7 4s-1 5 3.5 7M13.5 12c4.5 0 7.5-2 6.5-5s-5-1-7 3.500M12 13.500c0 4.5 2 7.5 5 6.500s1-5-3.5-7M10.5 12C6 12 3 14 4 17s5 1 7-3.5"/>',
    leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M4 21c2-6 6-10 11-12"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 1.800v2.400M12 19.800v2.400M4.8 4.800l1.7 1.700M17.5 17.500l1.7 1.700M1.8 12h2.400M19.8 12h2.400M4.8 19.200l1.7-1.700M17.5 6.500l1.7-1.7"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flame: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 2 2 3 3 3 0-3-1-5 0-7Z"/>',
    snow: '<path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17M9 4l3 3 3-3M9 20l3-3 3 3"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    chevRight: '<path d="m9 6 6 6-6 6"/>',
    bed: '<path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="10.5" r="1.8"/>',
    coffee: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z"/><path d="M16 11h1.500a2.500 2.500 0 0 1 0 5H16M8 3v3M12 3v3"/>',
    bath: '<path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM6 12V5.500A2.5 2.5 0 0 1 11 5"/>',
    moon: '<path d="M20 14.500A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.500z"/>',
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
  // Arc gauge. Angles in degrees, 0 = up, clockwise. Returns an SVG string with a track and a value arc.
  const polar = (cx, cy, r, deg) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const arcPath = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  function arcGauge(pct, { size = 160, w = 12, from = -120, to = 120, color = '--accent', knob = false } = {}) {
    const c = size / 2, r = (size - w) / 2 - (knob ? 4 : 0), end = from + (to - from) * Math.max(0, Math.min(1, pct)), [kx, ky] = polar(c, c, r, end);
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><path class="track" d="${arcPath(c, c, r, from, to)}" fill="none" stroke-width="${w}" stroke-linecap="round"/><path d="${arcPath(c, c, r, from, Math.max(end, from + 0.01))}" fill="none" stroke-width="${w}" stroke-linecap="round" style="stroke:var(${color})"/>${knob ? `<circle class="knob" cx="${kx.toFixed(2)}" cy="${ky.toFixed(2)}" r="${w * 0.75}"/>` : ''}</svg>`;
  }

  paintIcons();

  const ROOMS = [
    { id: 'living', name: 'Living Room', temp: 21.5, humid: 48, air: 'Good', icon: 'home', tone: 'warm' },
    { id: 'bed', name: 'Bedroom', temp: 20, humid: 44, air: 'Good', icon: 'bed', tone: 'cool' },
    { id: 'kitchen', name: 'Kitchen', temp: 22, humid: 52, air: 'Fair', icon: 'coffee', tone: 'warm' },
    { id: 'bath', name: 'Bathroom', temp: 23, humid: 58, air: 'Good', icon: 'bath', tone: 'cool' },
  ];
  const SCHEDULE = [
    { id: 'morning', name: 'Morning', range: '06:00 – 10:00', temp: 20, icon: 'sun' },
    { id: 'day', name: 'Day', range: '10:00 – 18:00', temp: 22, icon: 'sun' },
    { id: 'evening', name: 'Evening', range: '18:00 – 23:00', temp: 20, icon: 'moon' },
    { id: 'night', name: 'Night', range: '23:00 – 06:00', temp: 18, icon: 'moon' },
  ];
  const MODES = [
    { id: 'comfort', label: 'Comfort', icon: 'sun' },
    { id: 'eco', label: 'Eco', icon: 'leaf' },
    { id: 'away', label: 'Away', icon: 'home' },
    { id: 'sleep', label: 'Sleep', icon: 'moon' },
  ];
  const FAN_LABELS = ['Off', 'Low', 'Med', 'High', 'Auto'];

  let room = 'living';
  let target = 22;
  let hc = 'heat';
  let fan = 4; // Auto
  let period = 'day';
  let mode = 'comfort';
  let listState = 'populated'; // loading | empty | error | populated

  function dialSvg(temp) {
    const pct = (temp - 16) / 12;
    const size = 280, w = 18, c = size / 2, r = (size - w) / 2 - 6;
    const from = -135, to = 135;
    const end = from + (to - from) * Math.max(0, Math.min(1, pct));
    const rad = (d) => (d * Math.PI) / 180;
    const kx = c + r * Math.sin(rad(end));
    const ky = c - r * Math.cos(rad(end));
    const arc = (a0, a1) => {
      const x0 = c + r * Math.sin(rad(a0)), y0 = c - r * Math.cos(rad(a0));
      const x1 = c + r * Math.sin(rad(a1)), y1 = c - r * Math.cos(rad(a1));
      return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
    };
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <defs>
        <linearGradient id="cl-ring" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0" style="stop-color:var(--accent)"/>
          <stop offset="1" style="stop-color:var(--cool)"/>
        </linearGradient>
      </defs>
      <path d="${arc(from, to)}" fill="none" stroke="var(--border)" stroke-width="${w}" stroke-linecap="round"/>
      <path d="${arc(from, Math.max(end, from + 0.5))}" fill="none" stroke="url(#cl-ring)" stroke-width="${w}" stroke-linecap="round"/>
      <circle cx="${kx.toFixed(2)}" cy="${ky.toFixed(2)}" r="${w * 0.72}" fill="var(--surface)" stroke="var(--glass-edge)" stroke-width="2"/>
    </svg>
    <div class="cl-dialface"><b class="num">${Number.isInteger(temp) ? temp : temp.toFixed(1)}°</b><small>Target Temperature</small></div>`;
  }

  function renderDial() {
    $('[data-dial]').innerHTML = dialSvg(target);
    $('[data-dial]').setAttribute('aria-label', `Target ${target} degrees`);
    $$('[data-t]').forEach((b) => {
      b.disabled = (+b.dataset.t < 0 && target <= 16) || (+b.dataset.t > 0 && target >= 28);
    });
    updateNote();
  }

  function renderLiving() {
    const r = ROOMS.find((x) => x.id === room) || ROOMS[0];
    $('[data-room-title]').textContent = r.name;
    $('[data-current]').textContent = `${r.temp.toFixed(1)}°`;
    $('[data-humid]').textContent = `${r.humid}%`;
    $('[data-air]').textContent = r.air;
    const comfort = $('[data-comfort]');
    comfort.innerHTML = `<i aria-hidden="true"></i>${r.air === 'Good' ? 'Comfort' : 'Watch'}`;
  }

  function renderSchedule() {
    const el = $('[data-schedule]');
    const st = $('[data-sched-state]');
    if (listState === 'loading') {
      el.innerHTML = '';
      st.textContent = 'Loading schedule…';
      return;
    }
    if (listState === 'empty') {
      el.innerHTML = '';
      st.textContent = 'No periods yet. Add a morning or night block.';
      return;
    }
    if (listState === 'error') {
      el.innerHTML = '';
      st.textContent = 'Couldn’t load schedule. Try again from Settings.';
      return;
    }
    st.textContent = '';
    el.innerHTML = SCHEDULE.map((s) => `
      <li>
        <button type="button" class="cl-schedrow" data-period="${s.id}" aria-pressed="${s.id === period}">
          <span class="cl-schedico">${svg(s.icon)}</span>
          <span><b>${s.name}</b><small>${s.range}</small></span>
          <span class="cl-schedtemp num">${s.temp}°</span>
          <span class="cl-chev">${svg('chevRight')}</span>
        </button>
      </li>`).join('');
  }

  function renderRooms() {
    const el = $('[data-rooms]');
    const st = $('[data-rooms-state]');
    if (listState === 'loading') {
      el.innerHTML = '';
      st.textContent = 'Loading rooms…';
      return;
    }
    if (listState === 'empty') {
      el.innerHTML = '';
      st.textContent = 'No rooms linked. Add a thermostat zone.';
      return;
    }
    if (listState === 'error') {
      el.innerHTML = '';
      st.textContent = 'Rooms unavailable. Check the hub connection.';
      return;
    }
    st.textContent = '';
    el.innerHTML = ROOMS.map((r) => `
      <li>
        <button type="button" class="cl-roomrow" data-room="${r.id}" aria-pressed="${r.id === room}">
          <span class="cl-roomico ${r.tone === 'cool' ? 'cool' : ''}">${svg(r.icon)}</span>
          <span><b>${r.name}</b><small>Zone climate</small></span>
          <span class="cl-roomtemp num">${r.temp.toFixed(1)}°</span>
          <span class="cl-chev">${svg('chevRight')}</span>
        </button>
      </li>`).join('');
  }

  function renderFan() {
    $('[data-fanlabel]').textContent = FAN_LABELS[fan];
    // Auto (4): first 3 bars lit like the reference; Off–High light levels 0..fan
    $('[data-fan]').innerHTML = FAN_LABELS.map((lab, i) => {
      const lit = fan === 4 ? i < 3 : i <= fan;
      return `<button type="button" data-fan="${i}" aria-label="Fan ${lab}" aria-pressed="${fan === i}" class="${lit ? 'on' : ''}"><i aria-hidden="true"></i></button>`;
    }).join('');
  }

  function renderModes() {
    $('[data-modes]').innerHTML = MODES.map((m) => `
      <button type="button" data-mode="${m.id}" aria-pressed="${m.id === mode}">
        <span class="cl-modeico">${svg(m.icon)}</span>
        ${m.label}
      </button>`).join('');
  }

  function updateNote() {
    const r = ROOMS.find((x) => x.id === room) || ROOMS[0];
    const p = SCHEDULE.find((x) => x.id === period);
    $('[data-note]').textContent = `${r.name} · ${hc === 'heat' ? 'Heating' : 'Cooling'} to ${target}° · Fan ${FAN_LABELS[fan]}${p ? ` · ${p.name} block` : ''}`;
  }

  // Events
  $('[data-rail]').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-v]');
    if (!b) return;
    $$('[data-rail] button').forEach((x) => x.removeAttribute('aria-current'));
    b.setAttribute('aria-current', 'page');
    if (b.dataset.v === 'eco') { mode = 'eco'; renderModes(); }
    if (b.dataset.v === 'fan') { fan = fan === 4 ? 2 : 4; renderFan(); }
    updateNote();
  });

  $$('[data-t]').forEach((b) => b.addEventListener('click', () => {
    target = Math.round((target + +b.dataset.t) * 10) / 10;
    target = Math.min(28, Math.max(16, target));
    renderDial();
  }));

  seg($('[data-hc]'), (v) => {
    hc = v;
    updateNote();
  });

  $('[data-fan]').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-fan]');
    if (!b) return;
    fan = +b.dataset.fan;
    renderFan();
    updateNote();
  });

  $('[data-schedule]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-period]');
    if (!b) return;
    period = b.dataset.period;
    const p = SCHEDULE.find((x) => x.id === period);
    if (p) { target = p.temp; renderDial(); }
    renderSchedule();
  });

  $('[data-rooms]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-room]');
    if (!b) return;
    room = b.dataset.room;
    const r = ROOMS.find((x) => x.id === room);
    if (r) target = Math.round(r.temp);
    renderRooms();
    renderLiving();
    renderDial();
  });

  $('[data-modes]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]');
    if (!b) return;
    mode = b.dataset.mode;
    if (mode === 'eco') { target = Math.min(target, 20); hc = 'cool'; }
    if (mode === 'sleep') { target = 18; period = 'night'; }
    if (mode === 'away') { target = 17; fan = 0; }
    if (mode === 'comfort') { target = 22; fan = 4; }
    $$('[data-hc] button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.v === hc)));
    renderModes();
    renderDial();
    renderFan();
    renderSchedule();
    updateNote();
  });

  // Demo state cycle via outside chip double-click is too hidden; expose via settings rail:
  // settings toggles list states for QA of loading/empty/error/populated.
  $('[data-rail]').addEventListener('keydown', (e) => {
    if (e.key !== 's' || !e.altKey) return;
    const order = ['populated', 'loading', 'empty', 'error'];
    listState = order[(order.indexOf(listState) + 1) % order.length];
    renderSchedule();
    renderRooms();
  });

  renderLiving();
  renderSchedule();
  renderRooms();
  renderDial();
  renderFan();
  renderModes();
  updateNote();
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
