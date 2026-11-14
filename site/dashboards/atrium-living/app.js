/* Atrium Living: glass smart-home over living-room photo, multipage + motion.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = $('[data-db-app]') || document.body;
  const ICON = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.900c.600.5 1 1.2 1 2.100h5c0-.900.4-1.6 1-2.100A6 6 0 0 0 12 3z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    cloud: '<path d="M17.5 19H8a5 5 0 1 1 1.1-9.900A6.5 6.5 0 0 1 21 11.5 4 4 0 0 1 17.5 19z"/>',
    flame: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 2 2 3 3 3 0-3-1-5 0-7Z"/>',
    snow: '<path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17M9 4l3 3 3-3M9 20l3-3 3 3"/>',
    fan: '<circle cx="12" cy="12" r="1.5"/><path d="M12 10.500C12 6 10 3 7 4s-1 5 3.5 7M13.5 12c4.5 0 7.5-2 6.5-5s-5-1-7 3.500M12 13.500c0 4.5 2 7.5 5 6.500s1-5-3.5-7M10.5 12C6 12 3 14 4 17s5 1 7-3.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    power: '<path d="M12 3v9"/><path d="M6.3 6.800a8 8 0 1 0 11.4 0"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.500V7a4 4 0 0 1 8 0v3.5"/>',
    unlock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.500V7a4 4 0 0 1 7.5-2"/>',
    skipB: '<path d="M19 5v14L9 12zM5 5v14"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    play: '<path d="M7 4.500v15l12-7.500z"/>',
    skipF: '<path d="M5 5v14l10-7zM19 5v14"/>',
    speaker: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><circle cx="12" cy="14.5" r="3"/><circle cx="12" cy="7" r=".8"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    tv: '<rect x="2.5" y="5" width="19" height="12.5" rx="2"/><path d="M8 21h8"/>',
  };
  const svg = (n, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n] || ''}</svg>`;
  const paintIcons = (host = document) => $$('[data-icon]', host).forEach((el) => { el.innerHTML = svg(el.dataset.icon); });
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `al-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="al-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="al-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="al-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="al-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="al-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="al-cursor" hidden></span><span class="al-tip num" hidden></span>
    </div>`;
    const tip = $('.al-tip', el), cur = $('.al-cursor', el), dots = $$('.al-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `al-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.al-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.al-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  // Arc gauge. Angles in degrees, 0 = up, clockwise. Returns an SVG string with a track and a value arc.
  const polar = (cx, cy, r, deg) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const arcPath = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  function arcGauge(pct, { size = 160, w = 12, from = -120, to = 120, color = '--accent', knob = false } = {}) {
    const c = size / 2, r = (size - w) / 2 - (knob ? 4 : 0), end = from + (to - from) * Math.max(0, Math.min(1, pct)), [kx, ky] = polar(c, c, r, end);
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><path class="track" d="${arcPath(c, c, r, from, to)}" fill="none" stroke-width="${w}" stroke-linecap="round"/><path d="${arcPath(c, c, r, from, Math.max(end, from + 0.01))}" fill="none" stroke-width="${w}" stroke-linecap="round" style="stroke:var(${color})"/>${knob ? `<circle class="knob" cx="${kx.toFixed(2)}" cy="${ky.toFixed(2)}" r="${w * 0.75}"/>` : ''}</svg>`;
  }
  paintIcons();

  const ROOMS = {
    living: { title: 'Living Room', outside: 24, place: 'Portland, OR', temp: 22 },
    bed: { title: 'Bedroom', outside: 23, place: 'Portland, OR', temp: 20 },
    kitchen: { title: 'Kitchen', outside: 25, place: 'Portland, OR', temp: 23 },
    yard: { title: 'Courtyard', outside: 26, place: 'Portland, OR', temp: 21 },
    garage: { title: 'Garage', outside: 22, place: 'Portland, OR', temp: 18 },
  };
  const ENERGY = {
    week: {
      labels: Array.from({ length: 7 }, (_, i) => fmtDate(dayOffset(i - 6), { weekday: 'short' })),
      values: [18, 22, 19, 27, 24, 21, 26],
      unit: 'kWh this week',
    },
    month: {
      labels: Array.from({ length: 8 }, (_, i) => fmtDate(dayOffset((i - 7) * 4), { month: 'short', day: 'numeric' })),
      values: [62, 58, 71, 66, 80, 74, 69, 77],
      unit: 'kWh this month',
    },
    year: {
      labels: Array.from({ length: 12 }, (_, i) => fmtDate(new Date(new Date().getFullYear(), new Date().getMonth() - 11 + i, 1), { month: 'short' })),
      values: [420, 390, 450, 510, 560, 620, 640, 610, 540, 480, 430, 400],
      unit: 'kWh in 12 months',
    },
  };
  const TRACKS = [
    { title: 'Cedar Light', artist: 'Mira Vale' },
    { title: 'Glass Atrium', artist: 'North Pane' },
    { title: 'Soft Relay', artist: 'Kite Harbor' },
  ];
  const POSTERS = [
    { id: 'a', p1: '--cool', p2: '--accent' },
    { id: 'b', p1: '--pink', p2: '--cool' },
    { id: 'c', p1: '--accent', p2: '--wood' },
    { id: 'd', p1: '--wall', p2: '--cool' },
  ];
  const APPS = ['Stream+', 'Harbor', 'Reelbox', 'Pulse TV'];
  const HUES = [
    { at: 0, name: 'Amber', css: 'var(--hue-1)' },
    { at: 25, name: 'Rose', css: 'var(--hue-2)' },
    { at: 50, name: 'Violet', css: 'var(--hue-3)' },
    { at: 75, name: 'Cyan', css: 'var(--hue-4)' },
    { at: 100, name: 'Leaf', css: 'var(--hue-5)' },
  ];

  let room = 'living';
  let range = 'month';
  let temp = ROOMS.living.temp;
  let mode = 'cold';
  let locked = true;
  let lightsOn = true;
  let intensity = 52;
  let amb = 76;
  let hue = 72;
  let playing = true;
  let track = 0;
  let speakerOn = true;
  let camOn = true;
  let recording = false;
  let poster = 0;
  let app = 0;

  function renderScene() {
    /* Photo backdrop is static in markup (media/room.webp). */
  }

  function renderDial() {
    const pct = (temp - 16) / 14;
    const color = mode === 'hot' ? '--accent' : mode === 'cold' ? '--cool' : '--text-muted';
    $('[data-dial]').innerHTML = `<div role="img" aria-label="Target ${temp} degrees, ${mode} mode">${arcGauge(pct * 100, { size: 220, w: 14, from: -140, to: 140, color, knob: true })}</div><b class="num">${temp}°<small>target</small></b>`;
  }

  function renderEnergy() {
    const r = ENERGY[range];
    const total = r.values.reduce((a, b) => a + b, 0);
    $('[data-en-total]').textContent = fmtNum(total);
    $('[data-en-unit]').textContent = r.unit;
    const el = $('[data-energy]');
    if (!r.values.length) {
      el.innerHTML = '';
      $('[data-en-state]').textContent = 'No readings for this range yet.';
      return;
    }
    lineChart(el, {
      labels: r.labels,
      fmt: (v) => v + ' kWh',
      h: 140,
      ticks: 3,
      min: 0,
      series: [{ name: 'Energy', color: '--chart-1', values: r.values, fill: 0.45 }],
      label: `Home energy use, ${r.unit}`,
    });
    $('[data-en-state]').textContent = `Peak ${Math.max(...r.values)} kWh · ${ROOMS[room].title}`;
  }

  function renderCamera() {
    const stamp = fmtDate(dayOffset(0), { month: 'short', day: 'numeric' }) + ' · foyer';
    if (!camOn) {
      $('[data-camera]').innerHTML = `<div class="al-camoff">Camera off</div>`;
      $('[data-camnote]').textContent = 'Powered down. Tap power to wake the foyer camera.';
      return;
    }
    $('[data-camera]').innerHTML = `<img class="al-camphoto" src="media/camera.webp" width="960" height="720" alt="Foyer camera view (sample)" decoding="async"><span class="al-camstamp num">${stamp}</span>${recording ? '<span class="al-camrec"><i class="al-pulse"></i> REC</span>' : ''}`;
    $('[data-camnote]').textContent = recording ? 'Recording foyer clip…' : `Live · ${stamp}`;
  }

  function renderMedia() {
    $('[data-posters]').innerHTML = POSTERS.map((p, i) =>
      `<button type="button" class="al-poster" style="--p1:var(${p.p1});--p2:var(${p.p2})" data-poster="${i}" aria-pressed="${i === poster}" aria-label="Title ${i + 1}"></button>`
    ).join('');
    $('[data-apps]').innerHTML = APPS.map((n, i) =>
      `<button type="button" data-app="${i}" aria-pressed="${i === app}">${n}</button>`
    ).join('');
    $('[data-tv-note]').textContent = APPS[app];
  }

  function renderMembers() {
    const initials = ['AN', 'JR', 'MK', 'SL'];
    $('[data-members]').innerHTML = initials.map((t) => `<span role="listitem" aria-label="Member ${t}">${t}</span>`).join('')
      + `<span class="al-more" role="listitem">+5</span>`;
  }

  function renderMusic() {
    const t = TRACKS[track];
    $('[data-track]').textContent = t.title;
    $('[data-artist]').textContent = t.artist;
    const btn = $('[data-play="toggle"]');
    btn.setAttribute('aria-pressed', String(playing));
    btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    btn.innerHTML = svg(playing ? 'pause' : 'play');
  }

  function hueColor(v) {
    let a = HUES[0], b = HUES[HUES.length - 1];
    for (let i = 0; i < HUES.length - 1; i++) {
      if (v >= HUES[i].at && v <= HUES[i + 1].at) { a = HUES[i]; b = HUES[i + 1]; break; }
    }
    return v - a.at < b.at - v ? a : b;
  }

  function renderAmbient() {
    const h = hueColor(hue);
    $('[data-swatch]').style.background = h.css;
    $('[data-swatch]').style.boxShadow = `0 0 18px color-mix(in srgb, ${h.css} 55%, transparent)`;
    $('[data-hue]').setAttribute('aria-valuetext', h.name);
    $('[data-amb-val]').textContent = amb + '%';
  }

  function renderLock() {
    locked = $('[data-lock="shut"]').getAttribute('aria-pressed') === 'true';
    $('[data-lock-state]').textContent = locked ? 'Locked' : 'Unlocked';
    const ic = $('.al-lockicon');
    ic.innerHTML = svg(locked ? 'lock' : 'unlock');
  }

  function renderSpeakArt() {
    $('[data-speakart]').innerHTML = `<svg viewBox="0 0 200 90" aria-hidden="true">
      <ellipse cx="100" cy="78" rx="46" ry="8" style="fill:var(--cool)" opacity=".35"/>
      <rect x="78" y="18" width="44" height="58" rx="14" style="fill:var(--surface)"/>
      <circle cx="100" cy="48" r="12" fill="none" style="stroke:var(--cool)" stroke-width="3"/>
      <circle cx="100" cy="28" r="3" style="fill:var(--accent)"/>
      <path d="M130 30 q18 -10 28 4" fill="none" style="stroke:var(--pink)" stroke-width="2" opacity=".8"/>
      <path d="M136 44 q14 -6 22 6" fill="none" style="stroke:var(--cool)" stroke-width="2" opacity=".7"/>
    </svg>`;
  }

  function applyRoom() {
    const r = ROOMS[room];
    $('[data-room-title]').textContent = r.title;
    $('[data-outside]').textContent = r.outside + '°';
    $('[data-place]').textContent = r.place;
    temp = r.temp;
    renderDial();
    renderEnergy();
  }

  function renderAll() {
    renderScene();
    renderMembers();
    renderDial();
    renderEnergy();
    renderCamera();
    renderMedia();
    renderMusic();
    renderAmbient();
    renderSpeakArt();
    $('[data-intensity-val]').textContent = intensity + '%';
    $('[data-speaknote]').textContent = speakerOn ? 'On since 06:30' : 'Speaker idle';
  }

  // ---------------------------------------------------------------- events
  seg($('[data-rooms]'), (v) => { room = v; applyRoom(); });
  seg($('[data-range]'), (v) => { range = v; renderEnergy(); });

  $('[data-modes]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]'); if (!b) return;
    mode = b.dataset.mode;
    $$('[data-mode]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    if (mode === 'hot') temp = Math.min(30, temp + 1);
    if (mode === 'cold') temp = Math.max(16, temp - 1);
    renderDial();
    b.focus();
  });

  $('[data-lock]').closest('.al-lockseg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-lock]'); if (!b) return;
    $$('[data-lock]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderLock();
    b.focus();
  });

  $('[data-light]').addEventListener('click', (e) => {
    lightsOn = !lightsOn;
    e.currentTarget.setAttribute('aria-checked', String(lightsOn));
    $('[data-intensity]').disabled = !lightsOn;
  });

  $('[data-speaker]').addEventListener('click', (e) => {
    speakerOn = !speakerOn;
    e.currentTarget.setAttribute('aria-checked', String(speakerOn));
    $('[data-speaknote]').textContent = speakerOn ? 'On since 06:30' : 'Speaker idle';
  });

  $('[data-intensity]').addEventListener('input', (e) => {
    intensity = +e.target.value;
    $('[data-intensity-val]').textContent = intensity + '%';
  });
  $('[data-amb]').addEventListener('input', (e) => { amb = +e.target.value; renderAmbient(); });
  $('[data-hue]').addEventListener('input', (e) => { hue = +e.target.value; renderAmbient(); });

  $('[data-play]').closest('.al-transport').addEventListener('click', (e) => {
    const b = e.target.closest('[data-play]'); if (!b) return;
    if (b.dataset.play === 'toggle') playing = !playing;
    if (b.dataset.play === 'next') track = (track + 1) % TRACKS.length;
    if (b.dataset.play === 'prev') track = (track - 1 + TRACKS.length) % TRACKS.length;
    renderMusic();
  });

  $('[data-posters]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-poster]'); if (!b) return;
    poster = +b.dataset.poster; renderMedia(); b.focus();
  });
  $('[data-apps]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-app]'); if (!b) return;
    app = +b.dataset.app; renderMedia(); b.focus();
  });

  $$('[data-cam]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.cam === 'power') { camOn = !camOn; if (!camOn) recording = false; toast(camOn ? 'Camera on · sample' : 'Camera off · sample'); }
    if (b.dataset.cam === 'record' && camOn) { recording = !recording; b.setAttribute('aria-pressed', String(recording)); toast(recording ? 'Recording · sample' : 'Stopped · sample'); }
    if (b.dataset.cam === 'shot' && camOn) { $('[data-camnote]').textContent = 'Still saved to Atrium album (sample).'; toast('Still saved · sample'); }
    if (b.dataset.cam === 'zoom' && camOn) { $('[data-camnote]').textContent = 'Zoom 1.4× · foyer'; toast('Zoom 1.4× · sample'); }
    renderCamera();
  }));

  renderAll();
  renderLock();
  countUp($('[data-outside]'), 24, { format: (n) => `${Math.round(n)}°` });

  function staggerReveal() {
    $$('.al-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 35 * i}ms`);
      el.classList.add('al-reveal-in');
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
    $$('.al-railnav a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href === `#/${id}`) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  function pageHtml(page) {
    if (page.id === 'rooms') {
      return `<section class="al-page" data-db-page="rooms" aria-labelledby="p-h">
        <h1 id="p-h">Rooms</h1>
        <p class="al-page-lead">Zones on this floor. Sample data · fictional.</p>
        <div class="al-seg" role="group" aria-label="Rooms state" data-rooms-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-rooms-body></div>
      </section>`;
    }
    if (page.id === 'devices') {
      return `<section class="al-page" data-db-page="devices" aria-labelledby="p-h">
        <h1 id="p-h">Devices</h1>
        <p class="al-page-lead">Lights, lock, camera and speaker on the mesh.</p>
        <div class="al-page-grid">
          <article class="al-page-card"><div class="al-row"><strong>Ceiling lights</strong><span>On</span></div></article>
          <article class="al-page-card"><div class="al-row"><strong>Front door</strong><span>Locked</span></div></article>
          <article class="al-page-card"><div class="al-row"><strong>Foyer camera</strong><span>Online</span></div></article>
          <article class="al-page-card"><div class="al-row"><strong>Nook speaker</strong><span>On</span></div></article>
        </div>
      </section>`;
    }
    if (page.id === 'energy') {
      return `<section class="al-page" data-db-page="energy" aria-labelledby="p-h">
        <h1 id="p-h">Energy</h1>
        <p class="al-page-lead">Home draw summaries. Sample readings only.</p>
        <div class="al-page-grid">
          <article class="al-page-card"><div class="al-row"><span>This month</span><strong class="num">557 kWh</strong></div></article>
          <article class="al-page-card"><div class="al-row"><span>Peak day</span><strong class="num">80 kWh</strong></div></article>
          <article class="al-page-card"><div class="al-row"><span>Living Room share</span><strong class="num">38%</strong></div></article>
        </div>
        <button type="button" class="al-btn" data-energy-export>Export energy CSV</button>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="al-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="al-page-lead">Household preferences and alert stubs.</p>
        <div class="al-page-grid">
          <article class="al-page-card"><div class="al-row"><strong>Push alerts</strong><span>On</span></div></article>
          <article class="al-page-card"><div class="al-row"><strong>Guest mode</strong><span>Off</span></div></article>
          <article class="al-page-card"><div class="al-row"><strong>Auto lock</strong><span>22:00</span></div></article>
        </div>
        <button type="button" class="al-btn ghost" data-save-settings>Save preferences</button>
      </section>`;
    }
    return `<section class="al-page"><h1>${page.name}</h1></section>`;
  }
  function wirePage(host, page) {
    if (page.id === 'rooms') {
      const body = host.querySelector('[data-rooms-body]');
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="al-loading" role="status"><p>Syncing rooms…</p><div class="al-skel"></div><div class="al-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="al-empty"><p>No rooms configured yet.</p></div>`;
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="al-error"><p>Could not load rooms.</p><button type="button" class="al-btn ghost" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="al-page-grid">${Object.entries(ROOMS).map(([id, r]) =>
          `<article class="al-page-card"><div class="al-row"><strong>${r.title}</strong><span class="num">${r.temp}°</span></div><p class="al-meta">${r.place}</p></article>`
        ).join('')}</div>`;
      };
      paint('ready');
      seg(host.querySelector('[data-rooms-tabs]'), (v) => paint(v));
    }
    if (page.id === 'energy') {
      host.querySelector('[data-energy-export]')?.addEventListener('click', () => toast('Energy CSV · sample'));
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
      const top = $('.al-top');
      if (top) top.hidden = !isOverview;
      document.documentElement.dataset.alPage = id;
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
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Atrium Living" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
