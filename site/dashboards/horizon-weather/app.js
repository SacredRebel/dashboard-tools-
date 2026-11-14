/* Horizon Weather: data, icons, photo scene and interactions.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = $('[data-db-app]') || document.body;

  function toast(msg) {
    const t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(() => { t.hidden = true; }, 2200);
  }

  function countUp(el, to, { duration = 700, format = (n) => String(Math.round(n)), html = false } = {}) {
    if (!el) return;
    const write = (v) => { if (html) el.innerHTML = format(v); else el.textContent = format(v); };
    if (reduce) { write(to); return; }
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      write((1 - Math.pow(1 - t, 3)) * to);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const ICON = {
    sunrise: '<path d="M12 3v3M4.2 7.2l2.1 2.1M19.8 7.2l-2.1 2.1M2 16h20M6 16a6 6 0 0 1 12 0M8 20h8"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    forecast: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M8 14h2M14 14h2M8 17h2"/>',
    map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    chevLeft: '<path d="m15 18-6-6 6-6"/>', chevRight: '<path d="m9 18 6-6-6-6"/>', chevDown: '<path d="m6 9 6 6 6-6"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    thermo: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
    uv: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    gauge: '<path d="M12 14l4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 1.8v2.4M12 19.8v2.4M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7"/>',
    partly: '<path d="M8 3v1.5M3.6 5.6l1 1M2 10h1.5M12.4 5.6l-1 1"/><path d="M5.3 11.5A3.5 3.5 0 0 1 11.6 8"/><path d="M17.5 20H8a4 4 0 1 1 .9-7.9A5.5 5.5 0 0 1 19.4 13 3.5 3.5 0 0 1 17.5 20z"/>',
    cloud: '<path d="M17.5 19H8a5 5 0 1 1 1.1-9.9A6.5 6.5 0 0 1 21 11.5 4 4 0 0 1 17.5 19z"/>',
    rain: '<path d="M17.5 15H8a5 5 0 1 1 1.1-9.9A6.5 6.5 0 0 1 21 7.5 4 4 0 0 1 17.5 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
  };
  const svg = (n, sw = 1.6) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n] || ''}</svg>`;
  const paintIcons = (scope = document) => $$('[data-icon]', scope).forEach((el) => {
    el.innerHTML = svg(el.dataset.icon);
    if (el.dataset.icon === 'chevDown') el.classList.add('chev');
  });
  paintIcons();

  const CONDS = [['sun', 'Sunny'], ['partly', 'Partly cloudy'], ['cloud', 'Cloudy'], ['rain', 'Light rain'], ['partly', 'Partly cloudy'], ['partly', 'Partly cloudy'], ['sun', 'Sunny']];
  const HI = [26, 24, 22, 20, 23, 25, 27], LO = [16, 14, 13, 12, 14, 15, 17];
  const DETAILS = [[23, 68, 12, 6, 10, 1013], [22, 72, 15, 5, 10, 1011], [20, 78, 18, 3, 8, 1008], [18, 88, 22, 2, 6, 1004], [21, 70, 14, 5, 10, 1010], [24, 62, 10, 7, 12, 1015], [26, 55, 9, 8, 14, 1017]];
  const UVL = (u) => (u >= 8 ? 'Very high' : u >= 6 ? 'High' : u >= 3 ? 'Moderate' : 'Low');
  const today = new Date();
  const days = HI.map((hi, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const [feels, hum, wind, uv, vis, pres] = DETAILS[i];
    const hourly = [0, 3, 6, 9, 12, 15, 18, 21].map((h) => Math.round(LO[i] + (hi - LO[i]) * Math.max(0, Math.sin(((h - 5) / 24) * Math.PI * 1.6)) * (h <= 15 ? 1 : 1 - (h - 15) / 14)));
    return { i, name: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }), long: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'long' }), icon: CONDS[i][0], cond: CONDS[i][1], hi, lo: LO[i], feels, hum, wind, uv, vis, pres, hourly };
  });
  const MONTH = Array.from({ length: 10 }, (_, i) => 17 + Math.round(5 * Math.sin(i / 1.6)) + (i % 3));
  let sel = 0, range = 'day';

  function seg(group, onChange) {
    if (!group) return;
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v], button[data-range]');
      if (!b) return;
      const key = b.dataset.v != null ? 'data-v' : 'data-range';
      $$(`button[${key}]`, group).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onChange(b.dataset.v || b.dataset.range, b);
    });
  }

  function renderNow() {
    const d = days[sel];
    const temp = d.i === 0 ? 22 : d.hi;
    $('[data-now]').innerHTML = `
      <button type="button" class="hw-now-loc" aria-label="Change location, currently Lakeside, California" data-loc>${svg('pin')}<span>Lakeside, CA</span><span class="chev">${svg('chevDown')}</span></button>
      <span class="hw-now-icon">${svg(d.icon, 1.2)}</span>
      <span class="hw-now-temp num" data-temp>${temp}<sup>°</sup></span>
      <span class="hw-now-meta"><b>${d.cond}</b><span class="num">H: ${d.hi}°&nbsp;&nbsp;L: ${d.lo}°</span><span class="vh">${d.long}</span></span>`;
    paintIcons($('[data-now]'));
    const tempEl = $('[data-temp]');
    if (tempEl) {
      countUp(tempEl, temp, {
        html: true,
        format: (n) => `${Math.round(n)}<sup>°</sup>`,
      });
    }
    $('[data-loc]')?.addEventListener('click', () => toast('Location picker · sample'));
  }

  function renderDays() {
    $('[data-days]').innerHTML = days.map((d) => `
      <button type="button" class="hw-day" role="option" aria-selected="${d.i === sel}" data-day="${d.i}" tabindex="${d.i === sel ? 0 : -1}" aria-label="${d.long}, ${d.cond}, high ${d.hi}, low ${d.lo}">
        <span class="hw-day-icon">${svg(d.icon)}</span><span class="hw-day-name">${d.name}</span><span class="hw-day-cond">${d.cond}</span>
        <span class="hw-day-temps num"><b>${d.hi}°</b><span>${d.lo}°</span></span></button>`).join('');
  }

  function renderDetails() {
    const d = days[sel];
    const rows = [['thermo', 'Feels like', `${d.feels}°`], ['drop', 'Humidity', `${d.hum}%`], ['wind', 'Wind speed', `${d.wind} km/h`], ['uv', 'UV index', `${d.uv} (${UVL(d.uv)})`], ['eye', 'Visibility', `${d.vis} km`], ['gauge', 'Pressure', `${d.pres} hPa`]];
    $('[data-details]').innerHTML = rows.map(([ic, k, v]) => `<div><dt>${svg(ic)}${k}</dt><dd class="num">${v}</dd></div>`).join('');
  }

  function smooth(pts) {
    let p = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      p += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return p;
  }

  function renderChart() {
    const d = days[sel];
    const series = range === 'day' ? d.hourly.map((v, i) => [['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'][i], v])
      : range === 'week' ? days.map((x) => [x.name, x.hi]) : MONTH.map((v, i) => [`Wk ${i + 1}`, v]);
    const vals = series.map((s) => s[1]);
    const min = Math.floor((Math.min(...vals) - 2) / 5) * 5, max = Math.ceil((Math.max(...vals) + 2) / 5) * 5;
    const W = 600, H = 200, x = (i) => (i / (series.length - 1)) * W, y = (v) => H - ((v - min) / (max - min)) * H;
    const pts = series.map(([, v], i) => [x(i), y(v)]);
    const T = (py) => `calc((100% - 22px) * ${(py / H).toFixed(4)})`;
    const line = smooth(pts);
    const ticks = []; for (let v = min; v <= max; v += 5) ticks.push(v);
    $('[data-chart]').innerHTML = `
      <div class="hw-chart-plot">
        ${ticks.map((v) => `<span class="hw-chart-y num" style="top:${T(y(v))};left:-34px">${v}°</span>`).join('')}
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Temperature ${range === 'day' ? 'through the day' : range === 'week' ? 'highs this week' : 'weekly averages this month'}, from ${Math.min(...vals)}° to ${Math.max(...vals)}°">
          <defs><linearGradient id="hw-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--chart-1);stop-opacity:.45"/><stop offset="1" style="stop-color:var(--chart-1);stop-opacity:0"/></linearGradient></defs>
          <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
          <path d="${line} L${W},${H} L0,${H} Z" fill="url(#hw-fill)"/>
          <path class="line" d="${line}" vector-effect="non-scaling-stroke"/>
        </svg>
        ${pts.map(([px, py]) => `<span class="hw-dot" style="left:${(px / W) * 100}%;top:${T(py)}"></span>`).join('')}
        ${series.map(([l], i) => (series.length <= 8 || i % 2 === 0 ? `<span class="hw-chart-x${i % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
        <div class="hw-chart-hit">${series.map(([l, v]) => `<button type="button" aria-label="${l}: ${v}°"></button>`).join('')}</div>
        <span class="hw-chart-tip num" hidden></span>
      </div>`;
    const tipEl = $('.hw-chart-tip'), dots = [...document.querySelectorAll('.hw-dot')];
    const show = (i) => {
      dots.forEach((el, k) => el.classList.toggle('on', k === i));
      if (i < 0) { tipEl.hidden = true; return; }
      tipEl.hidden = false;
      tipEl.textContent = `${series[i][1]}° · ${series[i][0]}`;
      tipEl.style.left = (pts[i][0] / W) * 100 + '%';
      tipEl.style.top = T(pts[i][1]);
    };
    $('.hw-chart-hit').querySelectorAll('button').forEach((b, i) => {
      b.addEventListener('mouseenter', () => show(i));
      b.addEventListener('focus', () => show(i));
      b.addEventListener('blur', () => show(-1));
    });
    $('.hw-chart-hit').addEventListener('mouseleave', () => show(-1));
  }

  function selectDay(i, focus) {
    sel = Math.max(0, Math.min(days.length - 1, i));
    renderNow(); renderDays(); renderDetails(); renderChart();
    const b = $(`[data-day="${sel}"]`);
    b?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (focus) b?.focus();
  }

  const PLACES = [
    ['New York', 18, 'media/city-ny.webp'],
    ['London', 16, 'media/city-london.webp'],
    ['Tokyo', 22, 'media/city-tokyo.webp'],
    ['Paris', 20, 'media/city-paris.webp'],
    ['Sydney', 24, 'media/city-sydney.webp'],
    ['Dubai', 28, 'media/city-dubai.webp'],
  ];
  $('[data-places]').innerHTML = PLACES.map(([n, t, src]) =>
    `<li><span class="thumb"><img src="${src}" width="52" height="52" alt="" decoding="async"></span><span><b>${n}</b><span class="t num">${t}°</span></span></li>`
  ).join('');

  $('[data-days]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]');
    if (b) selectDay(+b.dataset.day, true);
  });
  $('[data-days]').addEventListener('keydown', (e) => {
    const m = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key];
    if (m) { e.preventDefault(); selectDay(Math.abs(m) === 99 ? (m < 0 ? 0 : 6) : sel + m, true); }
  });
  $$('[data-scroll]').forEach((b) => b.addEventListener('click', () => selectDay(sel + +b.dataset.scroll, false)));
  $$('[data-range]').forEach((b) => b.addEventListener('click', () => {
    range = b.dataset.range;
    $$('[data-range]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderChart();
  }));
  $('[data-bell]')?.addEventListener('click', () => toast('No new alerts · sample'));
  $('[data-search-go]')?.addEventListener('click', (e) => {
    e.preventDefault();
    toast('Search · sample');
  });
  $('[data-all-places]')?.addEventListener('click', () => {
    location.hash = '#/maps';
  });

  function staggerReveal() {
    $$('.hw-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 45 * i}ms`);
      el.classList.add('hw-reveal-in');
    });
  }

  selectDay(0, false);
  // Reveal must run even when dense-kit owns routing (legacy route may be skipped).
  staggerReveal();

  const PAGES = [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'forecast', name: 'Forecast', pattern: 'Report' },
    { id: 'maps', name: 'Maps', pattern: 'Detail' },
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
    $$('.hw-nav a').forEach((a) => {
      const match = (a.getAttribute('href') || '') === `#/${id}`;
      if (match) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function pageHtml(page) {
    if (page.id === 'forecast') {
      return `<section class="hw-page" data-db-page="forecast" aria-labelledby="p-h">
        <h1 id="p-h">Forecast</h1>
        <p class="hw-page-lead">Seven-day outlook for Lakeside. Sample data · fictional.</p>
        <div class="hw-page-seg" role="group" aria-label="Forecast state" data-fc-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-fc-body></div>
      </section>`;
    }
    if (page.id === 'maps') {
      return `<section class="hw-page" data-db-page="maps" aria-labelledby="p-h">
        <h1 id="p-h">Maps</h1>
        <p class="hw-page-lead">Regional layers and saved places.</p>
        <div class="hw-page-grid">
          ${PLACES.map(([n, t]) => `<article class="hw-page-card"><div class="hw-row"><strong>${n}</strong><span class="hw-chip num">${t}°</span></div><p class="hw-meta">Saved location</p></article>`).join('')}
        </div>
        <button type="button" class="hw-btn accent" data-radar>Open radar layer</button>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="hw-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="hw-page-lead">Units, alerts, and display preferences.</p>
        <div class="hw-page-grid">
          <article class="hw-page-card"><div class="hw-row"><strong>Temperature</strong><span class="hw-chip">Celsius</span></div></article>
          <article class="hw-page-card"><div class="hw-row"><strong>Wind</strong><span class="hw-chip">km/h</span></div></article>
          <article class="hw-page-card"><div class="hw-row"><strong>Severe alerts</strong><span class="hw-chip">On</span></div></article>
        </div>
        <button type="button" class="hw-btn" data-save-settings>Save preferences</button>
      </section>`;
    }
    return `<section class="hw-page"><h1>${page.name}</h1></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'forecast') {
      const body = host.querySelector('[data-fc-body]');
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="hw-loading" role="status"><p>Syncing forecast…</p><div class="hw-skel"></div><div class="hw-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="hw-empty-block"><p>No forecast rows for this range.</p></div>`;
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="hw-error-block"><p>Could not load forecast.</p><button type="button" class="hw-btn" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="hw-page-grid">${days.map((d) =>
          `<article class="hw-page-card"><div class="hw-row"><strong>${d.long}</strong><span class="hw-chip">${d.cond}</span></div><p class="hw-meta num">H ${d.hi}° · L ${d.lo}°</p></article>`
        ).join('')}</div>`;
      };
      paint('ready');
      seg(host.querySelector('[data-fc-tabs]'), (v) => paint(v));
    }
    if (page.id === 'maps') {
      host.querySelector('[data-radar]')?.addEventListener('click', () => toast('Radar layer · sample'));
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
  const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"forecast","name":"Forecast","pattern":"Report"},{"id":"maps","name":"Maps","pattern":"Detail"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Horizon Weather" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
