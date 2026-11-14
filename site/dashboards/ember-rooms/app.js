/* Ember Rooms: soft neumorphic lighting console with pendant lamp, rooms, charts and video-sim.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
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
  function smooth(pts) { // Catmull-Rom to cubic Bezier
    let p = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      p += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return p;
  }
  let chartId = 0;
  // Line / area chart: SVG draws the shape, HTML labels sit over it (so text never scales), hover and focus show values.
  // o: { labels, series: [{ name, color: '--chart-1', values, fill, dash }], fmt, h, label, curve, dots, min, max, ticks, step }
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
  // Arc gauge. Angles in degrees, 0 = up, clockwise. Returns an SVG string with a track and a value arc.
  const polar = (cx, cy, r, deg) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const arcPath = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  function arcGauge(pct, { size = 160, w = 12, from = -120, to = 120, color = '--accent', knob = false } = {}) {
    const c = size / 2, r = (size - w) / 2 - (knob ? 4 : 0), end = from + (to - from) * Math.max(0, Math.min(1, pct)), [kx, ky] = polar(c, c, r, end);
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><path class="track" d="${arcPath(c, c, r, from, to)}" fill="none" stroke-width="${w}" stroke-linecap="round"/><path d="${arcPath(c, c, r, from, Math.max(end, from + 0.01))}" fill="none" stroke-width="${w}" stroke-linecap="round" style="stroke:var(${color})"/>${knob ? `<circle class="knob" cx="${kx.toFixed(2)}" cy="${ky.toFixed(2)}" r="${w * 0.75}"/>` : ''}</svg>`;
  }
  // Tiny trend line. Returns an SVG string; stretches to its box.
  function spark(vals, { color = '--chart-1', fill = 0.25, w = 120, h = 36 } = {}) {
    const mn = Math.min(...vals), mx = Math.max(...vals), pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 6)]);
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `er-s${++sparkId}`;
    return `<svg class="er-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }
  let sparkId = 0;
  paintIcons();

  const ROOMS = [
    { id: 'living', label: 'LR', name: 'Living Room', icon: 'home', on: 7, total: 12, angle: -90 },
    { id: 'kitchen', label: 'KT', name: 'Kitchen', icon: 'flame', on: 4, total: 6, angle: -30 },
    { id: 'bed', label: 'BR', name: 'Bedroom', icon: 'moon', on: 2, total: 4, angle: 25 },
    { id: 'study', label: 'ST', name: 'Study', icon: 'book', on: 3, total: 5, angle: 80 },
    { id: 'bath', label: 'BA', name: 'Bath', icon: 'drop', on: 1, total: 3, angle: 145 },
    { id: 'hall', label: 'HL', name: 'Hall', icon: 'door', on: 5, total: 8, angle: -145 },
  ];
  // flame/moon/book/drop/door may not all be in kit list — use only declared icons for paintIcons;
  // room buttons get inline svg() calls with icons we listed OR we extend the kit list.

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
  const STARTS = ['7:00 AM', '8:30 AM', '9:00 AM'];
  const ENDS = ['4:30 PM', '6:00 PM', '10:00 PM'];

  // Pendant lamp SVG (signature)
  function renderLamp() {
    const glow = power ? Math.max(0.15, bright / 100) : 0;
    $('[data-lamp]').classList.toggle('is-off', !power);
    $('[data-lamp]').innerHTML = `<svg viewBox="0 0 200 260" aria-hidden="true">
      <defs>
        <linearGradient id="er-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:var(--lamp)"/>
          <stop offset="1" style="stop-color:var(--lamp-2)"/>
        </linearGradient>
        <radialGradient id="er-glow" cx="50%" cy="40%" r="50%">
          <stop offset="0" style="stop-color:var(--accent)" stop-opacity="${(glow * 0.55).toFixed(2)}"/>
          <stop offset="1" style="stop-color:var(--accent)" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <line x1="100" y1="0" x2="100" y2="48" style="stroke:var(--lamp-2)" stroke-width="3"/>
      <circle cx="100" cy="8" r="5" style="fill:var(--lamp-2)"/>
      <ellipse cx="100" cy="200" rx="70" ry="36" fill="url(#er-glow)"/>
      <path d="M55 55 Q100 48 145 55 L160 120 Q100 155 40 120 Z" fill="url(#er-shade)"/>
      <path d="M62 58 Q100 52 138 58 L148 110 Q100 136 52 110 Z" fill="var(--surface)" opacity="0.18"/>
      <ellipse cx="100" cy="55" rx="48" ry="10" style="fill:var(--lamp-2)"/>
      <path d="M88 120 L92 155 H108 L112 120" style="fill:var(--lamp)" opacity="0.85"/>
      <ellipse cx="100" cy="158" rx="22" ry="8" style="fill:var(--lamp-2)"/>
      <ellipse cx="100" cy="168" rx="16" ry="6" style="fill:var(--accent)" opacity="${glow.toFixed(2)}"/>
      <ellipse cx="100" cy="175" rx="40" ry="14" style="fill:var(--accent)" opacity="${(glow * 0.25).toFixed(2)}"/>
    </svg>`;
  }

  function placeRooms() {
    const el = $('[data-rooms]');
    // Use icons from kit + a few extras via svg() only if in ICON — extend kit marker below if needed.
    // Room dots use letter labels for reliability; icons where available.
    el.innerHTML = ROOMS.map((r, i) => {
      const rad = ((r.angle - 90) * Math.PI) / 180;
      // place on middle ring (~32% from center → 50% ± 32%)
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
    $('[data-feed]').innerHTML = `<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="250" style="fill:var(--room-wall)"/>
      <rect x="0" y="170" width="400" height="80" style="fill:var(--room-floor)"/>
      <rect x="40" y="50" width="140" height="90" rx="4" fill="var(--blue)" opacity="0.2"/>
      <rect x="48" y="58" width="124" height="74" rx="2" fill="var(--surface)" opacity="0.08"/>
      <path d="M220 120 h120 a12 12 0 0 1 12 12 v38 h-144 v-38 a12 12 0 0 1 12-12z" fill="var(--lamp)" opacity="0.35"/>
      <rect x="300" y="40" width="8" height="70" rx="2" style="fill:var(--lamp-2)"/>
      <path d="M280 40 h48 l-8 28 h-32z" style="fill:var(--lamp)"/>
      <ellipse cx="304" cy="78" rx="36" ry="20" style="fill:var(--accent)" opacity="${power ? 0.25 : 0.05}"/>
      <rect x="30" y="150" width="50" height="60" rx="4" fill="var(--lamp-2)" opacity="0.4"/>
    </svg>
    <p class="er-feed-tag">${r.name}</p>
    <button type="button" class="er-play" data-play aria-pressed="${playing}" aria-label="${playing ? 'Pause' : 'Play'} room preview">
      <span></span>
    </button>`;
    const btn = $('[data-play]');
    btn.innerHTML = svg(playing ? 'pause' : 'play');
    btn.addEventListener('click', () => {
      playing = !playing;
      renderFeed();
      $('[data-note]').textContent = playing ? `Playing ${r.name} preview (sample).` : `Paused ${r.name} feed.`;
    });
  }

  function setBright(v) {
    bright = +v;
    $('[data-bright]').value = String(bright);
    $('[data-bright-out]').textContent = bright + '%';
    renderDial();
    renderLamp();
  }

  // Events
  $('[data-rooms]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    room = ROOMS.findIndex((r) => r.id === b.dataset.v);
    renderReadout();
    renderFeed();
    $('[data-note]').textContent = `Focused ${ROOMS[room].name}.`;
  });

  $('[data-bright]').addEventListener('input', (e) => setBright(e.target.value));
  $('[data-pwr]').addEventListener('click', () => {
    power = !power;
    renderReadout();
    renderLamp();
    renderTrend();
    renderFeed();
  });
  $('[data-scene]').addEventListener('click', () => {
    scene = !scene;
    renderDial();
  });
  $('[data-start]').addEventListener('click', () => {
    startIdx = (startIdx + 1) % STARTS.length;
    $('[data-start]').textContent = STARTS[startIdx];
    $('[data-note]').textContent = `Schedule starts ${STARTS[startIdx]}.`;
  });
  $('[data-end]').addEventListener('click', () => {
    endIdx = (endIdx + 1) % ENDS.length;
    $('[data-end]').textContent = ENDS[endIdx];
    $('[data-note]').textContent = `Schedule ends ${ENDS[endIdx]}.`;
  });
  seg($('[data-range]'), (v) => {
    range = v;
    renderUsage();
  });
  $('[data-q]').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const q = e.target.value.trim().toLowerCase();
    const i = ROOMS.findIndex((r) => r.name.toLowerCase().includes(q) || r.id.includes(q));
    if (i < 0) {
      $('[data-note]').textContent = q ? `No room matches “${q}”.` : 'Type a room name and press Enter.';
      $('[data-usage-empty]').hidden = false;
      $('[data-usage-empty]').textContent = 'Search returned no rooms for this filter.';
      return;
    }
    room = i;
    renderReadout();
    renderFeed();
    $('[data-note]').textContent = `Jumped to ${ROOMS[i].name}.`;
  });
  $('[data-undo]').addEventListener('click', () => {
    setBright(Math.max(0, bright - 8));
    $('[data-note]').textContent = 'Undid brightness nudge (sample).';
  });
  $('[data-redo]').addEventListener('click', () => {
    setBright(Math.min(100, bright + 8));
    $('[data-note]').textContent = 'Redid brightness nudge (sample).';
  });
  $$('.er-railbtn').forEach((b) => {
    b.addEventListener('click', () => {
      $$('.er-railbtn').forEach((x) => x.removeAttribute('aria-current'));
      b.setAttribute('aria-current', 'page');
      $('[data-note]').textContent = `${b.getAttribute('aria-label')} selected (sample).`;
    });
  });

  placeRooms();
  setBright(68);
  renderReadout();
  renderUsage();
  renderTrend();
  renderFeed();
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
