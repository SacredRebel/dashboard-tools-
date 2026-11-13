/* Horizon Weather: data, icons, painted scene and interactions.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const ICON = {
    sunrise: '<path d="M12 3v3M4.2 7.2l2.1 2.1M19.8 7.2l-2.1 2.1M2 16h20M6 16a6 6 0 0 1 12 0M8 20h8"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    forecast: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M8 14h2M14 14h2M8 17h2"/>',
    map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
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
  const svg = (n, sw = 1.6) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n]}</svg>`;
  document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = svg(el.dataset.icon); if (el.dataset.icon === 'chevDown') el.classList.add('chev'); });

  // ---------------------------------------------------------------- sample data
  const CONDS = [['sun', 'Sunny'], ['partly', 'Partly cloudy'], ['cloud', 'Cloudy'], ['rain', 'Light rain'], ['partly', 'Partly cloudy'], ['partly', 'Partly cloudy'], ['sun', 'Sunny']];
  const HI = [26, 24, 22, 20, 23, 25, 27], LO = [16, 14, 13, 12, 14, 15, 17];
  const DETAILS = [[23, 68, 12, 6, 10, 1013], [22, 72, 15, 5, 10, 1011], [20, 78, 18, 3, 8, 1008], [18, 88, 22, 2, 6, 1004], [21, 70, 14, 5, 10, 1010], [24, 62, 10, 7, 12, 1015], [26, 55, 9, 8, 14, 1017]];
  const UVL = (u) => (u >= 8 ? 'Very high' : u >= 6 ? 'High' : u >= 3 ? 'Moderate' : 'Low');
  const today = new Date();
  const days = HI.map((hi, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const [feels, hum, wind, uv, vis, pres] = DETAILS[i];
    // hourly curve: coolest at 3 AM, warmest mid-afternoon
    const hourly = [0, 3, 6, 9, 12, 15, 18, 21].map((h) => Math.round(LO[i] + (hi - LO[i]) * Math.max(0, Math.sin(((h - 5) / 24) * Math.PI * 1.6)) * (h <= 15 ? 1 : 1 - (h - 15) / 14)));
    return { i, name: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }), long: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'long' }), icon: CONDS[i][0], cond: CONDS[i][1], hi, lo: LO[i], feels, hum, wind, uv, vis, pres, hourly };
  });
  const MONTH = Array.from({ length: 10 }, (_, i) => 17 + Math.round(5 * Math.sin(i / 1.6)) + (i % 3));
  let sel = 0, range = 'day';

  // ---------------------------------------------------------------- renderers
  function renderNow() {
    const d = days[sel];
    $('[data-now]').innerHTML = `
      <button class="hw-now-loc" aria-label="Change location, currently Lakeside, California">${svg('pin')}<span>Lakeside, CA</span><span class="chev">${svg('chevDown')}</span></button>
      <span class="hw-now-icon">${svg(d.icon, 1.2)}</span>
      <span class="hw-now-temp num">${d.i === 0 ? 22 : d.hi}<sup>°</sup></span>
      <span class="hw-now-meta"><b>${d.cond}</b><span class="num">H: ${d.hi}°&nbsp;&nbsp;L: ${d.lo}°</span><span class="vh">${d.long}</span></span>`;
  }
  function renderDays() {
    $('[data-days]').innerHTML = days.map((d) => `
      <button class="hw-day" role="option" aria-selected="${d.i === sel}" data-day="${d.i}" tabindex="${d.i === sel ? 0 : -1}" aria-label="${d.long}, ${d.cond}, high ${d.hi}, low ${d.lo}">
        <span class="hw-day-icon">${svg(d.icon)}</span><span class="hw-day-name">${d.name}</span><span class="hw-day-cond">${d.cond}</span>
        <span class="hw-day-temps num"><b>${d.hi}°</b><span>${d.lo}°</span></span></button>`).join('');
  }
  function renderDetails() {
    const d = days[sel];
    const rows = [['thermo', 'Feels like', `${d.feels}°`], ['drop', 'Humidity', `${d.hum}%`], ['wind', 'Wind speed', `${d.wind} km/h`], ['uv', 'UV index', `${d.uv} (${UVL(d.uv)})`], ['eye', 'Visibility', `${d.vis} km`], ['gauge', 'Pressure', `${d.pres} hPa`]];
    $('[data-details]').innerHTML = rows.map(([ic, k, v]) => `<div><dt>${svg(ic)}${k}</dt><dd class="num">${v}</dd></div>`).join('');
  }
  function smooth(pts) { // Catmull-Rom → cubic Bézier
    let p = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      p += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return p;
  }
  let tip = -1;
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
        ${pts.map(([px, py], i) => `<span class="hw-dot" style="left:${(px / W) * 100}%;top:${T(py)}"></span>`).join('')}
        ${series.map(([l], i) => (series.length <= 8 || i % 2 === 0 ? `<span class="hw-chart-x${i % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
        <div class="hw-chart-hit">${series.map(([l, v]) => `<button aria-label="${l}: ${v}°"></button>`).join('')}</div>
        <span class="hw-chart-tip num" hidden></span>
      </div>`;
    const tipEl = $('.hw-chart-tip'), dots = [...document.querySelectorAll('.hw-dot')];
    const show = (i) => { dots.forEach((el, k) => el.classList.toggle('on', k === i)); if (i < 0) { tipEl.hidden = true; return; } tipEl.hidden = false; tipEl.textContent = `${series[i][1]}° · ${series[i][0]}`; tipEl.style.left = (pts[i][0] / W) * 100 + '%'; tipEl.style.top = T(pts[i][1]); };
    $('.hw-chart-hit').querySelectorAll('button').forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); });
    $('.hw-chart-hit').addEventListener('mouseleave', () => show(-1));
  }
  function selectDay(i, focus) {
    sel = Math.max(0, Math.min(days.length - 1, i));
    renderNow(); renderDays(); renderDetails(); renderChart();
    const b = $(`[data-day="${sel}"]`); b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); if (focus) b.focus();
  }

  // ---------------------------------------------------------------- painted scenes (code-drawn, no photos)
  const scene = `<svg viewBox="0 0 1200 560" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-1)"/><stop offset=".55" style="stop-color:var(--sky-2)"/><stop offset=".8" style="stop-color:var(--sky-3)"/></linearGradient>
      <radialGradient id="sunglow" cx=".84" cy=".36" r=".32"><stop offset="0" style="stop-color:var(--sun);stop-opacity:.95"/><stop offset=".25" style="stop-color:var(--sky-3);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--sky-3);stop-opacity:0"/></radialGradient>
      <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--lake)"/><stop offset="1" style="stop-color:var(--ridge-near)"/></linearGradient>
    </defs>
    <rect width="1200" height="560" fill="url(#sky)"/>
    <rect width="1200" height="560" fill="url(#sunglow)"/>
    <circle cx="1012" cy="184" r="18" style="fill:var(--sun)"/>
    <filter id="soft"><feGaussianBlur stdDeviation="7"/></filter><g opacity=".22" filter="url(#soft)" style="fill:var(--sun)"><ellipse cx="720" cy="120" rx="190" ry="10"/><ellipse cx="980" cy="160" rx="150" ry="7"/><ellipse cx="560" cy="190" rx="120" ry="6"/></g>
    <path d="M420 330 L560 250 L640 290 L760 200 L860 270 L940 240 L1060 160 L1200 230 L1200 360 L420 360Z" style="fill:var(--ridge-far)"/>
    <path d="M1060 160 L1030 190 L1050 186 L1072 200 L1090 180Z" fill="#fff" opacity=".18"/>
    <path d="M500 360 L620 300 L700 330 L820 280 L920 320 L1020 290 L1200 330 L1200 390 L500 390Z" style="fill:var(--ridge-mid)"/>
    <rect x="420" y="360" width="780" height="120" fill="url(#lake)"/>
    <ellipse cx="1012" cy="372" rx="60" ry="5" style="fill:var(--sun)" opacity=".35"/>
    <ellipse cx="1012" cy="392" rx="34" ry="3" style="fill:var(--sun)" opacity=".25"/>
    <path d="M760 420 Q860 380 980 400 T1200 380 L1200 560 L700 560Z" style="fill:var(--ridge-near)"/>
    <g style="fill:var(--lights)">${Array.from({ length: 46 }, (_, i) => `<circle cx="${820 + ((i * 37) % 360)}" cy="${410 + ((i * 53) % 70)}" r="${i % 4 ? 1.4 : 2.2}" opacity="${0.45 + (i % 5) / 10}"/>`).join('')}</g>
  </svg>`;
  $('[data-scene]').innerHTML = scene;
  $('[data-story]').innerHTML = `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-1)"/><stop offset=".6" style="stop-color:var(--sky-2)"/><stop offset="1" style="stop-color:var(--lake)"/></linearGradient></defs>
    <rect width="300" height="400" fill="url(#st-sky)"/>
    <path d="M0 220 L60 120 L95 160 L150 60 L205 150 L240 110 L300 190 L300 260 L0 260Z" style="fill:var(--ridge-far)"/>
    <path d="M150 60 L132 92 L150 84 L166 98Z M60 120 L48 142 L62 136Z" fill="#fff" opacity=".35"/>
    <rect y="250" width="300" height="60" style="fill:var(--lake)" opacity=".9"/>
    <path d="M0 250 L60 300 L95 270 L150 330 L205 280 L240 300 L300 260 L300 400 L0 400Z" style="fill:var(--ridge-mid)" opacity=".55"/>
    <g style="fill:var(--ridge-near)">${[20, 48, 250, 278].map((x, i) => `<path d="M${x} ${330 - i * 6} l14 -${70 + i * 8} l14 ${70 + i * 8}Z"/>`).join('')}</g>
    <rect y="320" width="300" height="80" style="fill:var(--ridge-near)"/>
  </svg>`;
  const PLACES = [['New York', 18, 'skyline'], ['London', 16, 'clock'], ['Tokyo', 22, 'tower'], ['Paris', 20, 'eiffel'], ['Sydney', 24, 'sails'], ['Dubai', 28, 'spire']];
  const mini = (k, i) => {
    const sil = { skyline: 'M6 64V36h8v-8h6v8h6V24h8v40z M40 64V30h10v34z', clock: 'M28 64V18l4-6 4 6v46z M10 64V42h14v22z M42 64V40h12v24z', tower: 'M30 64l2-40 2-12 2 12 2 40z M10 64V46h12v18z M44 64V44h12v20z', eiffel: 'M22 64 L32 10 L42 64 H36 L32 44 L28 64Z', sails: 'M14 60 Q22 34 34 30 Q30 46 30 60Z M28 60 Q38 30 50 28 Q46 46 46 60Z', spire: 'M30 64V22l2-14 2 14v42z M14 64V40h10v24z M42 64V44h10v20z' }[k];
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="m${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-2)"/><stop offset="1" style="stop-color:var(--sky-3)"/></linearGradient></defs><rect width="64" height="64" fill="url(#m${i})"/><path d="${sil}" style="fill:var(--ridge-near)"/></svg>`;
  };
  $('[data-places]').innerHTML = PLACES.map(([n, t, k], i) => `<li><span class="thumb">${mini(k, i)}</span><span><b>${n}</b><span class="t num">${t}°</span></span></li>`).join('');

  // ---------------------------------------------------------------- events
  $('[data-days]').addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (b) selectDay(+b.dataset.day, true); });
  $('[data-days]').addEventListener('keydown', (e) => {
    const m = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key];
    if (m) { e.preventDefault(); selectDay(Math.abs(m) === 99 ? (m < 0 ? 0 : 6) : sel + m, true); }
  });
  document.querySelectorAll('[data-scroll]').forEach((b) => b.addEventListener('click', () => selectDay(sel + +b.dataset.scroll, false)));
  document.querySelectorAll('[data-range]').forEach((b) => b.addEventListener('click', () => {
    range = b.dataset.range; document.querySelectorAll('[data-range]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); renderChart();
  }));
  selectDay(0, false);
  window.scrollTo(0, 0);
})();
