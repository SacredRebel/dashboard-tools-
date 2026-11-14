/* Hearth Nest: cinematic smart-home with living-room photo, multipage + motion. Sample data only. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = $('[data-db-app]') || document.body;
  const ICON = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.900c.600.5 1 1.2 1 2.100h5c0-.900.4-1.6 1-2.100A6 6 0 0 0 12 3z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
    leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M4 21c2-6 6-10 11-12"/>',
    snow: '<path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17M9 4l3 3 3-3M9 20l3-3 3 3"/>',
    tv: '<rect x="2.5" y="5" width="19" height="12.5" rx="2"/><path d="M8 21h8"/>',
    wifi: '<path d="M2 9a15 15 0 0 1 20 0M5.5 12.500a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19.5" r=".8"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 1.800v2.400M12 19.800v2.400M4.8 4.800l1.7 1.700M17.5 17.500l1.7 1.700M1.8 12h2.400M19.8 12h2.400M4.8 19.200l1.7-1.700M17.5 6.500l1.7-1.7"/>',
    fan: '<circle cx="12" cy="12" r="1.5"/><path d="M12 10.500C12 6 10 3 7 4s-1 5 3.5 7M13.5 12c4.5 0 7.5-2 6.5-5s-5-1-7 3.500M12 13.500c0 4.5 2 7.5 5 6.500s1-5-3.5-7M10.5 12C6 12 3 14 4 17s5 1 7-3.5"/>',
    power: '<path d="M12 3v9"/><path d="M6.3 6.800a8 8 0 1 0 11.4 0"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    trendDown: '<path d="m3 7 6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
  };
  const svg = (n, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n] || ''}</svg>`;
  const paintIcons = (host = document) => $$('[data-icon]', host).forEach((el) => { el.innerHTML = svg(el.dataset.icon); });
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
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="hn-plot hn-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="hn-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="hn-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="hn-cols">${o.labels.map((l, i) => `<button class="hn-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="hn-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="hn-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="hn-tip num" hidden></span>
    </div>`;
    const tip = $('.hn-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `hn-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.hn-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.hn-cols', el).addEventListener('mouseleave', () => show(-1));
  }
  const polar = (cx, cy, r, deg) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const arcPath = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  function arcGauge(pct, { size = 160, w = 12, from = -120, to = 120, color = '--accent', knob = false } = {}) {
    const c = size / 2, r = (size - w) / 2 - (knob ? 4 : 0), end = from + (to - from) * Math.max(0, Math.min(1, pct)), [kx, ky] = polar(c, c, r, end);
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><path class="track" d="${arcPath(c, c, r, from, to)}" fill="none" stroke-width="${w}" stroke-linecap="round"/><path d="${arcPath(c, c, r, from, Math.max(end, from + 0.01))}" fill="none" stroke-width="${w}" stroke-linecap="round" style="stroke:var(${color})"/>${knob ? `<circle class="knob" cx="${kx.toFixed(2)}" cy="${ky.toFixed(2)}" r="${w * 0.75}"/>` : ''}</svg>`;
  }
  function spark(vals, { color = '--chart-1', fill = 0.25, w = 120, h = 36 } = {}) {
    const mn = Math.min(...vals), mx = Math.max(...vals), pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 6)]);
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `hn-s${++sparkId}`;
    return `<svg class="hn-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }
  let sparkId = 0;

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

  paintIcons();

  $('[data-wxdate]').textContent = fmtDate(dayOffset(0), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  $('[data-plant]').innerHTML = `<svg viewBox="0 0 40 56" aria-hidden="true"><ellipse cx="20" cy="50" rx="12" ry="4" style="fill:var(--wood)" opacity=".5"/><path d="M20 48V22" style="stroke:var(--wood)" stroke-width="2"/><path d="M20 28c-8-2-12-10-10-16 6 2 10 8 10 16zM20 26c8-1 12-8 10-14-6 1-9 7-10 14zM20 34c-7 1-10 8-8 12 5-1 7-6 8-12z" style="fill:var(--pillow-b)"/></svg>`;

  $('[data-wxart]').innerHTML = `<svg viewBox="0 0 360 220" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="hn-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-1)"/><stop offset=".55" style="stop-color:var(--sky-2)"/><stop offset="1" style="stop-color:var(--sky-3)"/></linearGradient></defs><rect width="360" height="220" style="fill:url(#hn-sky)"/><circle cx="260" cy="90" r="34" style="fill:var(--sun)" opacity=".9"/><path d="M0 140 L70 90 L120 130 L180 70 L250 125 L310 85 L360 130 V220 H0Z" style="fill:var(--surface)" opacity=".55"/><path d="M0 165 L90 120 L160 155 L230 110 L360 150 V220 H0Z" style="fill:var(--surface-2)" opacity=".7"/></svg>`;

  const aqi = 32;
  $('[data-aqi]').innerHTML = `${arcGauge(aqi / 100, { size: 150, w: 12, from: -120, to: 120, color: '--aqi' })}<b class="num">${aqi}<small>Fresh &amp; healthy</small></b>`;
  $('[data-pmspark]').innerHTML = spark([14, 13, 15, 12, 11, 13, 12, 10, 12], { color: '--aqi', fill: 0.3, w: 140, h: 40 });

  let target = 22.5, eco = true;
  function renderTemp() {
    $('[data-dial]').innerHTML = `<div role="img" aria-label="Target ${target.toFixed(1)} degrees Celsius">${arcGauge((target - 16) / 12, { size: 168, w: 14, from: -135, to: 135, color: '--accent', knob: true })}</div><b class="num">${target.toFixed(1)}°<small>${eco ? 'Eco cooling' : 'Cooling'}</small></b>`;
    $$('[data-t]').forEach((b) => { b.disabled = (+b.dataset.t < 0 && target <= 16) || (+b.dataset.t > 0 && target >= 28); });
  }
  $$('[data-t]').forEach((b) => b.addEventListener('click', () => { target = Math.round((target + +b.dataset.t) * 10) / 10; target = Math.min(28, Math.max(16, target)); renderTemp(); }));
  $('.hn-eco').addEventListener('click', (e) => { eco = !eco; e.currentTarget.setAttribute('aria-pressed', String(eco)); renderTemp(); toast(eco ? 'Eco mode on · sample' : 'Eco mode off · sample'); });

  const ROOMS = {
    living: { note: 'Living room · sofa lamps and ceiling fan linked', nodes: [{ i: 'bulb', x: 28, y: 42, on: true }, { i: 'wifi', x: 48, y: 28, on: true }, { i: 'fan', x: 68, y: 38, on: true }, { i: 'tv', x: 78, y: 58, on: true }, { i: 'grid', x: 38, y: 68, on: false }] },
    kitchen: { note: 'Kitchen · under-cabinet lights and hood fan', nodes: [{ i: 'bulb', x: 32, y: 36, on: true }, { i: 'fan', x: 55, y: 30, on: false }, { i: 'wifi', x: 70, y: 48, on: true }] },
    bedroom: { note: 'Bedroom · reading lamps at 40%', nodes: [{ i: 'bulb', x: 40, y: 44, on: true }, { i: 'fan', x: 62, y: 40, on: false }, { i: 'wifi', x: 75, y: 55, on: true }] },
    garage: { note: 'Garage · door sensor armed', nodes: [{ i: 'bolt', x: 45, y: 50, on: false }, { i: 'wifi', x: 60, y: 40, on: true }, { i: 'shield', x: 70, y: 58, on: true }] },
    studio: { note: 'Studio · desk lamp and monitor strip', nodes: [{ i: 'bulb', x: 35, y: 40, on: true }, { i: 'tv', x: 58, y: 48, on: true }, { i: 'wifi', x: 72, y: 36, on: true }] },
  };
  let room = 'living';

  function renderNodes() {
    const r = ROOMS[room];
    $('[data-roomnote]').textContent = r.note;
    $('[data-nodes]').innerHTML = `<button type="button" class="hn-hub" style="left:50%;top:50%" aria-label="Home hub" tabindex="-1">${svg('home')}</button>` +
      r.nodes.map((n, i) => `<button type="button" style="left:${n.x}%;top:${n.y}%" data-node="${i}" aria-pressed="${n.on}" aria-label="Toggle ${n.i}">${svg(n.i)}</button>`).join('');
  }
  $('[data-nodes]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-node]'); if (!b) return;
    const n = ROOMS[room].nodes[+b.dataset.node]; n.on = !n.on; renderNodes(); $(`[data-node="${b.dataset.node}"]`).focus();
    toast(`${n.i} ${n.on ? 'on' : 'off'} · sample`);
  });
  seg($('[data-rooms]'), (v) => { room = v; renderNodes(); toast(`${v} view · sample`); });

  const bright = $('[data-bright]'), bout = $('[data-brightout]');
  const syncBright = () => { bout.textContent = bright.value + '%'; };
  bright.addEventListener('input', syncBright); syncBright();
  $('[data-roompwr]').addEventListener('click', (e) => {
    const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', String(on));
    bright.disabled = !on; if (!on) { bright.value = 0; } else if (+bright.value === 0) { bright.value = 70; }
    syncBright();
    toast(on ? 'Room power on · sample' : 'Room power off · sample');
  });

  $('[data-4k]')?.addEventListener('click', () => toast('4K stream · sample'));
  $('[data-expand]')?.addEventListener('click', () => toast('Fullscreen · sample'));
  $('[data-bell]')?.addEventListener('click', () => toast('2 alerts · sample'));
  $('[data-search]')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); toast('Search · sample'); }
  });

  const DEVS = [
    { n: 'Lighting', s: 'Ceiling · 4 lamps', i: 'bulb', on: true, glow: '--accent' },
    { n: 'Air conditioner', s: '22°C · Cooling', i: 'snow', on: true, glow: '--cool' },
    { n: 'Smart TV', s: 'Living wall · On', i: 'tv', on: true, glow: '--violet' },
    { n: 'Router', s: '120 Mbps · Stable', i: 'wifi', on: true, glow: '--aqi' },
  ];
  function renderDevs() {
    $('[data-devs]').innerHTML = DEVS.map((d, i) => `<article class="hn-dev${d.on ? ' on' : ''}" style="--devglow:var(${d.glow})"><div class="hn-devtop"><span class="hn-devico">${svg(d.i)}</span><button class="hn-switch" role="switch" aria-checked="${d.on}" aria-label="${d.n}" data-dev="${i}"></button></div><b>${d.n}</b><small>${d.on ? d.s : 'Off'}</small></article>`).join('');
  }
  $('[data-devs]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-dev]'); if (!b) return;
    const d = DEVS[+b.dataset.dev]; d.on = !d.on; renderDevs(); $(`[data-dev="${b.dataset.dev}"]`).focus();
    toast(`${d.n} ${d.on ? 'on' : 'off'} · sample`);
  });

  const days = [0, 1, 2, 3, 4, 5, 6].map((i) => fmtDate(dayOffset(i - 6), { weekday: 'short' }));
  const vals = [5.2, 6.1, 7.4, 9.2, 6.8, 5.9, 6.8];
  let pick = 3;
  function renderPower() {
    barChart($('[data-power]'), {
      labels: days, series: [{ name: 'kWh', color: '--chart-1', values: vals }], fmt: (v) => v.toFixed(1), h: 140, label: 'Power this week',
      active: pick, onPick: (i) => { pick = i; renderPower(); },
    });
  }

  renderTemp(); renderNodes(); renderDevs(); renderPower();
  countUp($('[data-pm]'), 12);
  countUp($('[data-kwh]'), 6.8, { format: (n) => n.toFixed(1) });

  function staggerReveal() {
    $$('.hn-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 40 * i}ms`);
      el.classList.add('hn-reveal-in');
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
    $$('.hn-nav a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const match = href === `#/${id}` || (id === 'overview' && href === '#/overview');
      if (match) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function pageHtml(page) {
    if (page.id === 'rooms') {
      return `<section class="hn-page" data-db-page="rooms" aria-labelledby="p-h">
        <h1 id="p-h">Rooms</h1>
        <p class="hn-page-lead">Zones in this home. Sample data · fictional.</p>
        <div class="hn-seg" role="group" aria-label="Rooms state" data-rooms-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-rooms-body></div>
      </section>`;
    }
    if (page.id === 'devices') {
      return `<section class="hn-page" data-db-page="devices" aria-labelledby="p-h">
        <h1 id="p-h">Devices</h1>
        <p class="hn-page-lead">Every controllable endpoint on the mesh.</p>
        <div class="hn-page-grid" data-dev-list></div>
      </section>`;
    }
    if (page.id === 'energy') {
      return `<section class="hn-page" data-db-page="energy" aria-labelledby="p-h">
        <h1 id="p-h">Energy</h1>
        <p class="hn-page-lead">Weekly draw and eco tips. Sample readings only.</p>
        <div class="hn-page-grid">
          <article class="hn-page-card"><div class="hn-row"><span>This week</span><strong class="num">6.8 kWh</strong></div></article>
          <article class="hn-page-card"><div class="hn-row"><span>Peak day</span><strong class="num">9.2 kWh</strong></div></article>
          <article class="hn-page-card"><div class="hn-row"><span>vs last week</span><strong class="num">−18%</strong></div></article>
        </div>
        <button type="button" class="hn-btn" data-eco-report>Open eco report</button>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="hn-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="hn-page-lead">Home preferences and security stubs.</p>
        <div class="hn-page-grid">
          <article class="hn-page-card"><div class="hn-row"><strong>Notifications</strong><span>On</span></div></article>
          <article class="hn-page-card"><div class="hn-row"><strong>Door sensors</strong><span>Armed</span></div></article>
          <article class="hn-page-card"><div class="hn-row"><strong>Guest access</strong><span>Off</span></div></article>
        </div>
        <button type="button" class="hn-btn ghost" data-save-settings>Save preferences</button>
      </section>`;
    }
    return `<section class="hn-page"><h1>${page.name}</h1></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'rooms') {
      const body = host.querySelector('[data-rooms-body]');
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="hn-loading" role="status"><p>Syncing rooms…</p><div class="hn-skel"></div><div class="hn-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="hn-empty"><p>No rooms configured yet.</p></div>`;
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="hn-error"><p>Could not load rooms.</p><button type="button" class="hn-btn ghost" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="hn-page-grid">${Object.entries(ROOMS).map(([id, r]) =>
          `<article class="hn-page-card"><div class="hn-row"><strong>${id[0].toUpperCase()}${id.slice(1)}</strong><span class="num">${r.nodes.length}</span></div><p class="hn-meta">${r.note}</p></article>`
        ).join('')}</div>`;
      };
      paint('ready');
      seg(host.querySelector('[data-rooms-tabs]'), (v) => paint(v));
    }
    if (page.id === 'devices') {
      host.querySelector('[data-dev-list]').innerHTML = DEVS.map((d) =>
        `<article class="hn-page-card"><div class="hn-row"><strong>${d.n}</strong><span>${d.on ? 'On' : 'Off'}</span></div><p class="hn-meta">${d.s}</p></article>`
      ).join('');
    }
    if (page.id === 'energy') {
      host.querySelector('[data-eco-report]')?.addEventListener('click', () => toast('Eco report · sample'));
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
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Hearth Nest" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
