/* Ember Rooms: soft neumorphic lighting console — pendant photo, rooms, charts, multipage.
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
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.900c.600.5 1 1.2 1 2.100h5c0-.900.4-1.6 1-2.100A6 6 0 0 0 12 3z"/>',
    snow: '<path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17M9 4l3 3 3-3M9 20l3-3 3 3"/>',
    tv: '<rect x="2.5" y="5" width="19" height="12.5" rx="2"/><path d="M8 21h8"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.500V7a4 4 0 0 1 8 0v3.5"/>',
    fan: '<circle cx="12" cy="12" r="1.5"/><path d="M12 10.500C12 6 10 3 7 4s-1 5 3.5 7M13.5 12c4.5 0 7.5-2 6.5-5s-5-1-7 3.500M12 13.500c0 4.5 2 7.5 5 6.500s1-5-3.5-7M10.5 12C6 12 3 14 4 17s5 1 7-3.5"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.5-4L3 9M3 4v5h5M4 13a8 8 0 0 0 14.5 4L21 15M21 20v-5h-5"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    power: '<path d="M12 3v9"/><path d="M6.3 6.800a8 8 0 1 0 11.4 0"/>',
    play: '<path d="M7 4.500v15l12-7.500z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
  };
  const svg = (n, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n] || ''}</svg>`;
  const paintIcons = (rootEl = document) => $$('[data-icon]', rootEl).forEach((el) => { el.innerHTML = svg(el.dataset.icon); });
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
  function seg(group, onChange) {
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      $$('button[data-v]', group).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onChange(b.dataset.v, b);
    });
  }
  function smooth(pts) {
    let p = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      p += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return p;
  }
  let chartId = 0;
  function lineChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length, W = 600, H = 200;
    const { min, max, ticks } = scale(o.series.flatMap((s) => s.values), o);
    const x = (i) => (n > 1 ? (i / (n - 1)) * W : W / 2), y = (v) => H - ((v - min) / (max - min)) * H;
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `er-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="er-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="er-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="er-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="er-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="er-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="er-cursor" hidden></span><span class="er-tip num" hidden></span>
    </div>`;
    const tip = $('.er-tip', el), cur = $('.er-cursor', el), dots = $$('.er-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `er-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.er-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.er-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  const polar = (cx, cy, r, deg) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const arcPath = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  function arcGauge(pct, { size = 160, w = 12, from = -120, to = 120, color = '--accent', knob = false } = {}) {
    const c = size / 2, r = (size - w) / 2 - (knob ? 4 : 0), end = from + (to - from) * Math.max(0, Math.min(1, pct)), [kx, ky] = polar(c, c, r, end);
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><path class="track" d="${arcPath(c, c, r, from, to)}" fill="none" stroke-width="${w}" stroke-linecap="round"/><path d="${arcPath(c, c, r, from, Math.max(end, from + 0.01))}" fill="none" stroke-width="${w}" stroke-linecap="round" style="stroke:var(${color})"/>${knob ? `<circle class="knob" cx="${kx.toFixed(2)}" cy="${ky.toFixed(2)}" r="${w * 0.75}"/>` : ''}</svg>`;
  }
  function spark(vals, { color = '--chart-1', fill = 0.25, w = 120, h = 36 } = {}) {
    const mn = Math.min(...vals), mx = Math.max(...vals), pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 6)]);
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `er-s${++sparkId}`;
    return `<svg class="er-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }
  let sparkId = 0;
  paintIcons();

  const ROOMS = [
    { id: 'living', label: 'LR', name: 'Living Room', on: 7, total: 12, angle: -90, devices: 6 },
    { id: 'kitchen', label: 'KT', name: 'Kitchen', on: 4, total: 6, angle: -30, devices: 5 },
    { id: 'bed', label: 'BR', name: 'Bedroom', on: 2, total: 4, angle: 25, devices: 4 },
    { id: 'study', label: 'ST', name: 'Study', on: 3, total: 5, angle: 80, devices: 3 },
    { id: 'bath', label: 'BA', name: 'Bath', on: 1, total: 3, angle: 145, devices: 2 },
    { id: 'hall', label: 'HL', name: 'Hall', on: 5, total: 8, angle: -145, devices: 3 },
  ];
  const DEVICES = [
    { n: 'Pendant cluster', s: 'Living · dimmable', on: true },
    { n: 'Under-cabinet strip', s: 'Kitchen · warm', on: true },
    { n: 'Bedside pair', s: 'Bedroom · scene', on: false },
    { n: 'Desk task lamp', s: 'Study · cool', on: true },
    { n: 'Climate dial', s: 'Hall · 23°C', on: true },
    { n: 'Hall runner', s: 'Hall · night', on: true },
  ];

  const USAGE = {
    day: {
      labels: ['6a', '9a', '12p', '3p', '6p', '9p'],
      a: [12, 18, 22, 16, 28, 20],
      b: [8, 10, 14, 12, 18, 11],
    },
    week: {
      labels: Array.from({ length: 7 }, (_, i) => fmtDate(dayOffset(i - 6), { weekday: 'short' })),
      a: [40, 52, 48, 60, 55, 70, 62],
      b: [28, 34, 30, 38, 36, 44, 40],
    },
  };

  let room = 0;
  let bright = 68;
  let power = true;
  let range = 'day';
  let playing = false;
  let scene = true;
  let startIdx = 0;
  let endIdx = 1;
  let climate = 23;
  const STARTS = ['7:00 AM', '8:30 AM', '9:00 AM'];
  const ENDS = ['4:30 PM', '6:00 PM', '10:00 PM'];

  function renderLamp() {
    const glow = power ? Math.max(0.12, bright / 100) : 0;
    const lamp = $('[data-lamp]');
    lamp.classList.toggle('is-off', !power);
    lamp.style.setProperty('--glow', glow.toFixed(2));
    const img = $('.er-lampphoto', lamp);
    if (img) {
      img.style.filter = power
        ? `brightness(${0.85 + glow * 0.35}) saturate(${0.9 + glow * 0.2})`
        : 'brightness(0.7) grayscale(0.35)';
    }
  }

  function placeRooms() {
    const el = $('[data-rooms]');
    el.innerHTML = ROOMS.map((r, i) => {
      const rad = ((r.angle - 90) * Math.PI) / 180;
      const dist = 36;
      const x = 50 + Math.cos(rad) * dist;
      const y = 50 + Math.sin(rad) * dist;
      return `<button type="button" class="er-room" style="left:${x}%;top:${y}%" data-v="${r.id}" aria-pressed="${i === room}" aria-label="${r.name}">${r.label}</button>`;
    }).join('');
  }

  function renderDial() {
    const pct = bright / 100;
    $('[data-dial]').innerHTML = `<div role="img" aria-label="Brightness ${bright} percent">${arcGauge(pct, { size: 140, w: 12, from: -135, to: 135, color: '--accent', knob: true })}</div>`;
    $('[data-dial-note]').textContent = scene ? 'Scene · Soft amber' : 'Scene · Cool white';
    $('[data-scene]').setAttribute('aria-pressed', String(scene));
  }

  function renderReadout() {
    const r = ROOMS[room];
    const on = power ? r.on : 0;
    $('[data-on]').textContent = String(on);
    $('[data-total]').textContent = String(r.total);
    $('[data-pwr]').setAttribute('aria-pressed', String(power));
    $('[data-roomhint]').textContent = `${r.name} · ${on} of ${r.total} lights ${power ? 'on' : 'off'}`;
    $$('[data-rooms] [data-v]').forEach((b, i) => b.setAttribute('aria-pressed', String(i === room)));
  }

  function renderUsage() {
    const empty = $('[data-usage-empty]');
    const d = USAGE[range];
    if (!d) {
      $('[data-usage]').innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    lineChart($('[data-usage]'), {
      labels: d.labels,
      series: [
        { name: 'Load', color: '--chart-1', values: d.a, fill: 0 },
        { name: 'Base', color: '--chart-2', values: d.b, fill: 0 },
      ],
      fmt: (v) => v + ' kWh',
      h: 110,
      ticks: 3,
      min: 0,
      label: `Lighting usage, ${range}`,
    });
  }

  function renderTrend() {
    const vals = power
      ? [12, 18, 14, 22, 19, 28, 24, 30]
      : [4, 5, 4, 6, 5, 7, 6, 5];
    $('[data-trend]').innerHTML = `<div role="img" aria-label="Usage trend sparkline">${spark(vals, { color: '--chart-2', w: 280, h: 64, fill: 0.2 })}</div>`;
  }

  function renderFeed() {
    const r = ROOMS[room];
    const err = $('[data-feed-err]');
    if (r.id === 'bath') {
      $('[data-feed]').innerHTML = '';
      err.hidden = false;
      $('[data-live]').textContent = 'Offline';
      return;
    }
    err.hidden = true;
    $('[data-live]').textContent = playing ? 'Preview' : 'Live';
    $('[data-feed]').innerHTML = `
      <img class="er-feedphoto" src="media/room.webp" width="1280" height="720" alt="${r.name} camera view (sample)" decoding="async">
      <p class="er-feed-tag er-chip">${r.name}</p>
      <button type="button" class="er-play" data-play aria-pressed="${playing}" aria-label="${playing ? 'Pause' : 'Play'} room preview"></button>`;
    const btn = $('[data-play]');
    btn.innerHTML = svg(playing ? 'pause' : 'play');
    btn.addEventListener('click', () => {
      playing = !playing;
      renderFeed();
      toast(playing ? `Playing ${r.name} preview · sample` : `Paused ${r.name} feed`);
    });
  }

  function setBright(v) {
    bright = +v;
    $('[data-bright]').value = String(bright);
    $('[data-bright-out]').textContent = bright + '%';
    renderDial();
    renderLamp();
  }

  $('[data-rooms]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    room = ROOMS.findIndex((r) => r.id === b.dataset.v);
    renderReadout();
    renderFeed();
    toast(`Focused ${ROOMS[room].name}`);
  });

  $('[data-bright]').addEventListener('input', (e) => setBright(e.target.value));
  $('[data-pwr]').addEventListener('click', () => {
    power = !power;
    renderReadout();
    renderLamp();
    renderTrend();
    renderFeed();
    toast(power ? 'Lights on · sample' : 'Lights off · sample');
  });
  $('[data-scene]').addEventListener('click', () => {
    scene = !scene;
    renderDial();
    toast(scene ? 'Scene · Soft amber' : 'Scene · Cool white');
  });
  $('[data-start]').addEventListener('click', () => {
    startIdx = (startIdx + 1) % STARTS.length;
    $('[data-start]').textContent = STARTS[startIdx];
    toast(`Schedule starts ${STARTS[startIdx]}`);
  });
  $('[data-end]').addEventListener('click', () => {
    endIdx = (endIdx + 1) % ENDS.length;
    $('[data-end]').textContent = ENDS[endIdx];
    toast(`Schedule ends ${ENDS[endIdx]}`);
  });
  seg($('[data-range]'), (v) => {
    range = v;
    renderUsage();
    toast(`${v} usage · sample`);
  });
  $('[data-q]').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const q = e.target.value.trim().toLowerCase();
    const i = ROOMS.findIndex((r) => r.name.toLowerCase().includes(q) || r.id.includes(q));
    if (i < 0) {
      toast(q ? `No room matches “${q}”` : 'Type a room name and press Enter');
      $('[data-usage-empty]').hidden = false;
      $('[data-usage-empty]').textContent = 'Search returned no rooms for this filter.';
      return;
    }
    room = i;
    renderReadout();
    renderFeed();
    toast(`Jumped to ${ROOMS[i].name}`);
  });
  $('[data-undo]').addEventListener('click', () => {
    setBright(Math.max(0, bright - 8));
    toast('Undid brightness nudge · sample');
  });
  $('[data-redo]').addEventListener('click', () => {
    setBright(Math.min(100, bright + 8));
    toast('Redid brightness nudge · sample');
  });
  $('[data-menu]')?.addEventListener('click', () => toast('Menu · sample'));

  placeRooms();
  setBright(68);
  renderReadout();
  renderUsage();
  renderTrend();
  renderFeed();
  countUp($('[data-on]'), ROOMS[0].on);
  countUp($('[data-total]'), ROOMS[0].total);

  function staggerReveal() {
    $$('.er-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 40 * i}ms`);
      el.classList.add('er-reveal-in');
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
    $$('.er-railnav a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const match = href === `#/${id}` || (id === 'overview' && href === '#/overview');
      if (match) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function pageHtml(page) {
    if (page.id === 'rooms') {
      return `<section class="er-page" data-db-page="rooms" aria-labelledby="p-h">
        <h1 id="p-h">Rooms</h1>
        <p class="er-page-lead">Lighting zones in this home. Sample data · fictional.</p>
        <div class="er-page-seg" role="group" aria-label="Rooms state" data-rooms-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-rooms-body></div>
      </section>`;
    }
    if (page.id === 'devices') {
      return `<section class="er-page" data-db-page="devices" aria-labelledby="p-h">
        <h1 id="p-h">Devices</h1>
        <p class="er-page-lead">Lighting endpoints plus the climate dial from the kit collage.</p>
        <div class="er-page-grid er-devices-layout">
          <article class="er-page-card er-climate">
            <div class="er-panelhead"><h2>Climate</h2><span class="er-chip num" data-climate-out>23°C</span></div>
            <div class="er-climate-dial" data-climate-dial></div>
            <div class="er-climate-btns">
              <button type="button" data-climate="-1" aria-label="Lower temperature">−</button>
              <button type="button" class="er-cool" data-cool aria-pressed="true"><span data-icon="snow"></span> Cool air</button>
              <button type="button" data-climate="1" aria-label="Raise temperature">+</button>
            </div>
          </article>
          <div class="er-page-grid" data-dev-list></div>
        </div>
      </section>`;
    }
    if (page.id === 'energy') {
      return `<section class="er-page" data-db-page="energy" aria-labelledby="p-h">
        <h1 id="p-h">Energy</h1>
        <p class="er-page-lead">Weekly lighting draw. Sample readings only.</p>
        <div class="er-page-grid">
          <article class="er-page-card"><div class="er-row"><span>This week</span><strong class="num">48 kWh</strong></div></article>
          <article class="er-page-card"><div class="er-row"><span>Peak evening</span><strong class="num">28 kWh</strong></div></article>
          <article class="er-page-card"><div class="er-row"><span>vs last week</span><strong class="num">−12%</strong></div></article>
        </div>
        <div class="er-page-card" data-energy-chart></div>
        <button type="button" class="er-btn" data-energy-report>Open usage report</button>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="er-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="er-page-lead">Home preferences and scene defaults.</p>
        <div class="er-page-grid">
          <article class="er-page-card"><div class="er-row"><strong>Night scenes</strong><span>On</span></div></article>
          <article class="er-page-card"><div class="er-row"><strong>Guest access</strong><span>Off</span></div></article>
          <article class="er-page-card"><div class="er-row"><strong>Camera previews</strong><span>Allowed</span></div></article>
        </div>
        <button type="button" class="er-btn ghost" data-save-settings>Save preferences</button>
      </section>`;
    }
    return `<section class="er-page"><h1>${page.name}</h1></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'rooms') {
      const body = host.querySelector('[data-rooms-body]');
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="er-loading" role="status"><p>Syncing rooms…</p><div class="er-skel"></div><div class="er-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="er-empty-block"><p>No rooms configured yet.</p></div>`;
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="er-error-block"><p>Could not load rooms.</p><button type="button" class="er-btn ghost" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="er-page-grid">${ROOMS.map((r) =>
          `<article class="er-page-card"><div class="er-row"><strong>${r.name}</strong><span class="num er-chip">${r.on}/${r.total}</span></div><p class="er-meta">${r.devices} devices · orbit ${r.label}</p></article>`
        ).join('')}</div>`;
      };
      paint('ready');
      seg(host.querySelector('[data-rooms-tabs]'), (v) => paint(v));
    }
    if (page.id === 'devices') {
      const paintClimate = () => {
        const pct = (climate - 16) / (30 - 16);
        host.querySelector('[data-climate-dial]').innerHTML =
          `<div class="er-climwrap" role="img" aria-label="Climate ${climate} degrees">${arcGauge(pct, { size: 160, w: 14, from: -135, to: 135, color: '--accent', knob: true })}
           <span class="er-climval num">${climate}<small>°C</small></span></div>`;
        host.querySelector('[data-climate-out]').textContent = climate + '°C';
      };
      paintClimate();
      paintIcons(host);
      host.querySelectorAll('[data-climate]').forEach((b) => {
        b.addEventListener('click', () => {
          climate = Math.max(16, Math.min(30, climate + +b.dataset.climate));
          paintClimate();
          toast(`Climate ${climate}°C · sample`);
        });
      });
      host.querySelector('[data-cool]')?.addEventListener('click', (e) => {
        const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
        e.currentTarget.setAttribute('aria-pressed', String(on));
        toast(on ? 'Cool air on · sample' : 'Cool air off · sample');
      });
      host.querySelector('[data-dev-list]').innerHTML = DEVICES.map((d) =>
        `<article class="er-page-card"><div class="er-row"><strong>${d.n}</strong><span class="er-chip">${d.on ? 'On' : 'Off'}</span></div><p class="er-meta">${d.s}</p></article>`
      ).join('');
    }
    if (page.id === 'energy') {
      lineChart(host.querySelector('[data-energy-chart]'), {
        labels: USAGE.week.labels,
        series: [{ name: 'Load', color: '--chart-1', values: USAGE.week.a, fill: 0.25 }],
        fmt: (v) => v + ' kWh',
        h: 140,
        ticks: 3,
        min: 0,
        label: 'Weekly lighting energy',
      });
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
      $('[data-note]').textContent = isOverview ? '' : `${page.name} · sample`;
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
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Ember Rooms" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
