/* Aura Ring: painted ring + brain, multipage + motion. Sample data only. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = $('[data-db-app]') || document.body;
  const ICON = {
    sparkle: '<path d="M12 3l1.8 5.200L19 10l-5.2 1.800L12 17l-1.8-5.200L5 10l5.2-1.800zM19 16l.8 2.200L22 19l-2.2.8L19 22l-.8-2.200L16 19l2.2-.8z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    chevRight: '<path d="m9 6 6 6-6 6"/>',
    heartPulse: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/><path d="M3.5 12h5l1.5-3 3 6 1.5-3h6"/>',
    moon: '<path d="M20 14.500A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.500z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    brain: '<path d="M12 4.500v15M12 6a3 3 0 0 0-5.5-1.500A3 3 0 0 0 4 9a3.5 3.5 0 0 0 .5 6A3.5 3.5 0 0 0 12 17M12 6a3 3 0 0 1 5.5-1.500A3 3 0 0 1 20 9a3.5 3.5 0 0 1-.5 6A3.5 3.5 0 0 1 12 17"/>',
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `ar-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="ar-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="ar-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="ar-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="ar-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="ar-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="ar-cursor" hidden></span><span class="ar-tip num" hidden></span>
    </div>`;
    const tip = $('.ar-tip', el), cur = $('.ar-cursor', el), dots = $$('.ar-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `ar-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.ar-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.ar-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  // Arc gauge. Angles in degrees, 0 = up, clockwise. Returns an SVG string with a track and a value arc.
  const polar = (cx, cy, r, deg) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const arcPath = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  function arcGauge(pct, { size = 160, w = 12, from = -120, to = 120, color = '--accent', knob = false } = {}) {
    const c = size / 2, r = (size - w) / 2 - (knob ? 4 : 0), end = from + (to - from) * Math.max(0, Math.min(1, pct)), [kx, ky] = polar(c, c, r, end);
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><path class="track" d="${arcPath(c, c, r, from, to)}" fill="none" stroke-width="${w}" stroke-linecap="round"/><path d="${arcPath(c, c, r, from, Math.max(end, from + 0.01))}" fill="none" stroke-width="${w}" stroke-linecap="round" style="stroke:var(${color})"/>${knob ? `<circle class="knob" cx="${kx.toFixed(2)}" cy="${ky.toFixed(2)}" r="${w * 0.75}"/>` : ''}</svg>`;
  }
  paintIcons();
  const st = (o, c, a = 1) => `<stop offset="${o}" style="stop-color:var(${c});stop-opacity:${a}"/>`;

  // ---------------------------------------------------------------- artwork
  function renderArt() {
    /* Ring photo is static in markup (media/ring.webp). */
    $('[data-figure]').innerHTML = `<svg viewBox="0 0 100 220" role="img" aria-label="Outline of a standing figure"><defs><linearGradient id="ar-fg" x1="0" y1="0" x2="1" y2="1">${st(0, '--figure-1')}${st(1, '--figure-2')}</linearGradient></defs>
      <ellipse cx="50" cy="212" rx="34" ry="6" fill="var(--figure-2)" opacity="0.5"/>
      <g fill="url(#ar-fg)"><circle cx="50" cy="18" r="13"/><path d="M34,38 Q50,32 66,38 L84,90 Q86,96 80,97 Q76,97 74,92 L65,62 L64,108 L70,196 Q71,206 63,206 Q57,206 56,198 L50,128 L44,198 Q43,206 37,206 Q29,206 30,196 L36,108 L35,62 L26,92 Q24,97 20,97 Q14,96 16,90 Z"/></g></svg>` +
      SPOTS.map((s, i) => `<button type="button" class="ar-spot" data-spot="${i}" style="left:${s.x}%;top:${s.y}%" aria-pressed="${i === spot}" aria-label="${s.name}"></button>`).join('');
  }

  // ---------------------------------------------------------------- sample data
  const hours = ['12 am', '4 am', '8 am', '12 pm', '4 pm', '8 pm'], wave = (n, b, a, k, p = 0) => Array.from({ length: n }, (_, i) => Math.round(b + a * Math.sin(i * k + p) + a * 0.4 * Math.sin(i * k * 2.3)));
  const VIEWS = {
    overview: { name: 'Wellness score', score: 82, head: 'Your wellness signs look <b>excellent</b>', tip: 'Tip: keep tonight’s bedtime before 11 pm', sum: 'You slept 7 h 24 min with 1 h 38 min of deep sleep, and your resting heart rate is 3 bpm below your monthly average. A light workout fits well today.' },
    sleep: { name: 'Sleep score', score: 88, head: 'Last night was <b>restful</b> and long enough', tip: 'Tip: dim screens an hour before bed', sum: 'You fell asleep in 11 minutes and woke twice, both briefly. Deep sleep made up 22% of the night, which is in your usual range.' },
    recovery: { name: 'Recovery score', score: 74, head: 'Your body is <b>mostly recovered</b>', tip: 'Tip: stretch for ten minutes this morning', sum: 'Heart-rate variability is a little under your baseline after yesterday’s long run. Keep effort moderate and you should be back to normal tomorrow.' },
    activity: { name: 'Activity score', score: 61, head: 'A <b>quiet day</b> so far: time to move', tip: 'Tip: a 20-minute walk closes the gap', sum: 'You have taken 3,940 steps and stood in 6 of 12 hours. Your weekly goal is still within reach with two active days.' },
    stress: { name: 'Calm score', score: 46, head: 'Stress is <b>higher than usual</b> today', tip: 'Tip: try four slow breaths now', sum: 'Daytime stress peaked around 2 pm and has stayed raised since. Short breaks and an earlier night usually bring this down for you.' },
  };
  const SPOTS = [{ name: 'Head', x: 50, y: 8, t: 'Sleep and focus', d: 'REM sleep 1 h 52 min. Focus rated steady this morning.' }, { name: 'Chest', x: 50, y: 25, t: 'Heart and breathing', d: 'Resting heart rate 58 bpm, 14 breaths per minute overnight.' }, { name: 'Hand', x: 19, y: 41, t: 'Skin temperature', d: '0.2 °C above your baseline: within the normal range.' }, { name: 'Legs', x: 42, y: 70, t: 'Movement', d: '3,940 steps today. Muscles are still recovering from yesterday.' }];
  let view = 'overview', spot = 1;

  // ---------------------------------------------------------------- renderers
  function renderView() {
    const v = VIEWS[view], word = v.score >= 80 ? 'Excellent' : v.score >= 65 ? 'Good' : v.score >= 50 ? 'Fair' : 'Needs care';
    $('[data-headline]').innerHTML = v.head; $('[data-tip]').textContent = v.tip; $('[data-summary]').textContent = v.sum;
    $('[data-score-name]').textContent = v.name; countUp($('[data-score]'), v.score);
    const s = $('[data-state]'); s.textContent = word; s.style.setProperty('--state', `var(${v.score >= 65 ? '--good' : '--chart-2'})`);
    $('[data-gauge]').innerHTML = `<div role="img" aria-label="${v.name} ${v.score} out of 100">${arcGauge(v.score / 100, { size: 150, w: 8, from: -150, to: 150, color: '--chart-1', knob: true })}</div><span>${svg({ overview: 'heartPulse', sleep: 'moon', recovery: 'bolt', activity: 'activity', stress: 'brain' }[view], 1.4)}</span>`;
  }
  function renderBody() { const s = SPOTS[spot]; $('[data-body-note]').innerHTML = `<b>${s.t}</b>${s.d}`; $$('.ar-spot').forEach((b, i) => b.setAttribute('aria-pressed', i === spot)); }
  function renderCharts() {
    lineChart($('[data-hr]'), { labels: Array.from({ length: 24 }, (_, i) => `${i % 12 || 12} ${i < 12 ? 'am' : 'pm'}`), xEvery: 6, h: 96, noAxis: true, ticks: 2, fmt: (v) => v + ' bpm', series: [{ name: 'Heart rate', color: '--chart-1', values: wave(24, 64, 12, 0.9), fill: 0.18 }], label: 'Heart rate through today, between 52 and 78 bpm' });
    lineChart($('[data-stress]'), { labels: hours, h: 84, noAxis: true, ticks: 2, dots: true, fmt: (v) => v + '%', series: [{ name: 'Stress', color: '--chart-1', values: [22, 18, 31, 44, 58, 46], fill: 0.2 }], curve: false, label: 'Stress level through the day' });
    lineChart($('[data-sleep]'), { labels: Array.from({ length: 6 }, (_, i) => fmtDate(dayOffset(i - 6), { weekday: 'short' })), h: 84, noAxis: true, ticks: 2, dots: true, fmt: (v) => v.toFixed(1) + ' h', series: [{ name: 'Sleep', color: '--chart-2', values: [6.4, 7.1, 6.8, 5.9, 7.8, 7.4], fill: 0.2 }], curve: false, label: 'Hours slept over the last six nights' });
  }

  // ---------------------------------------------------------------- events
  seg($('[data-tabs]'), (v) => { view = v; renderView(); toast(`${v} · sample`); });
  renderArt();
  $('[data-figure]').addEventListener('click', (e) => { const b = e.target.closest('[data-spot]'); if (!b) return; spot = +b.dataset.spot; renderBody(); toast(`${SPOTS[spot].name} · sample`); });
  $('[data-bell]')?.addEventListener('click', () => toast('2 alerts · sample'));
  $('[data-device]')?.addEventListener('click', () => toast('Device settings · sample'));
  $('[data-analysis]')?.addEventListener('click', () => toast('Full analysis · sample'));
  renderView(); renderBody(); renderCharts();
  countUp($('[data-bpm]'), 62);
  countUp($('[data-stress-n]'), 46);
  countUp($('[data-batt]'), 84, { format: (n) => `${Math.round(n)}%` });

  function staggerReveal() {
    $$('.ar-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 35 * i}ms`);
      el.classList.add('ar-reveal-in');
    });
  }

  const PAGES = [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'vitals', name: 'Vitals', pattern: 'Report' },
    { id: 'appointments', name: 'Appointments', pattern: 'Calendar' },
    { id: 'records', name: 'Records', pattern: 'List' },
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
    $$('.ar-pages a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href === `#/${id}`) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  function pageHtml(page) {
    if (page.id === 'vitals') {
      return `<section class="ar-page" data-db-page="vitals" aria-labelledby="p-h">
        <h1 id="p-h">Vitals</h1>
        <p class="ar-page-lead">Ring sensors and trends. Sample data · fictional · not medical advice.</p>
        <div class="ar-seg" role="group" aria-label="Vitals state" data-vitals-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-vitals-body></div>
      </section>`;
    }
    if (page.id === 'appointments') {
      return `<section class="ar-page" data-db-page="appointments" aria-labelledby="p-h">
        <h1 id="p-h">Appointments</h1>
        <p class="ar-page-lead">Upcoming check-ins and coach calls.</p>
        <div class="ar-page-grid">
          <article class="ar-page-card"><div class="ar-row"><strong>Sleep coach</strong><span>Tue 10:00</span></div></article>
          <article class="ar-page-card"><div class="ar-row"><strong>Recovery review</strong><span>Fri 15:30</span></div></article>
        </div>
        <button type="button" class="ar-btn" data-book-appt>Book a slot</button>
      </section>`;
    }
    if (page.id === 'records') {
      return `<section class="ar-page" data-db-page="records" aria-labelledby="p-h">
        <h1 id="p-h">Records</h1>
        <p class="ar-page-lead">Exports and nightly summaries.</p>
        <div class="ar-page-grid">
          <article class="ar-page-card"><div class="ar-row"><strong>Nightly PDF</strong><span>Ready</span></div></article>
          <article class="ar-page-card"><div class="ar-row"><strong>HR CSV</strong><span>Ready</span></div></article>
        </div>
        <button type="button" class="ar-btn ghost" data-export-rec>Export pack</button>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="ar-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="ar-page-lead">Ring preferences and alerts.</p>
        <div class="ar-page-grid">
          <article class="ar-page-card"><div class="ar-row"><strong>Bedtime tip</strong><span>On</span></div></article>
          <article class="ar-page-card"><div class="ar-row"><strong>Stress nudge</strong><span>On</span></div></article>
        </div>
        <button type="button" class="ar-btn ghost" data-save-settings>Save preferences</button>
      </section>`;
    }
    return `<section class="ar-page"><h1>${page.name}</h1></section>`;
  }
  function wirePage(host, page) {
    if (page.id === 'vitals') {
      const body = host.querySelector('[data-vitals-body]');
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="ar-loading" role="status"><p>Syncing ring…</p><div class="ar-skel"></div><div class="ar-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="ar-empty"><p>No vitals yet tonight.</p></div>`;
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="ar-error"><p>Could not load vitals.</p><button type="button" class="ar-btn ghost" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="ar-page-grid">
          <article class="ar-page-card"><div class="ar-row"><span>Resting HR</span><strong class="num">58</strong></div></article>
          <article class="ar-page-card"><div class="ar-row"><span>HRV</span><strong class="num">62</strong></div></article>
          <article class="ar-page-card"><div class="ar-row"><span>Skin temp</span><strong class="num">Normal</strong></div></article>
        </div>`;
      };
      paint('ready');
      seg(host.querySelector('[data-vitals-tabs]'), (v) => paint(v));
    }
    if (page.id === 'appointments') {
      host.querySelector('[data-book-appt]')?.addEventListener('click', () => toast('Slot booked · sample'));
    }
    if (page.id === 'records') {
      host.querySelector('[data-export-rec]')?.addEventListener('click', () => toast('Export queued · sample'));
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
