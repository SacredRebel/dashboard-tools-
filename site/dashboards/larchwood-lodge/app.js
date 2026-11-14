/* Larchwood Lodge: sample data, hero art, thermostat, daylight, forecast, scenes, bookings.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 1.800v2.400M12 19.800v2.400M4.8 4.800l1.7 1.700M17.5 17.500l1.7 1.700M1.8 12h2.400M19.8 12h2.400M4.8 19.200l1.7-1.700M17.5 6.500l1.7-1.7"/>',
    umbrella: '<path d="M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 1-4 0"/>',
    leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M4 21c2-6 6-10 11-12"/>',
    moon: '<path d="M20 14.500A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.500z"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.900c.600.5 1 1.2 1 2.100h5c0-.900.4-1.6 1-2.100A6 6 0 0 0 12 3z"/>',
    flame: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 2 2 3 3 3 0-3-1-5 0-7Z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 21a2 2 0 0 0 2 2h14v-4"/>',
    power: '<path d="M12 3v9"/><path d="M6.3 6.800a8 8 0 1 0 11.4 0"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
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
  const fmtD = (n, o) => fmtDate(dayOffset(n), o);
  $('[data-stay]').textContent = `Checked in ${fmtD(-2, { weekday: 'short', day: 'numeric', month: 'short' })} · check-out ${fmtD(3, { weekday: 'short', day: 'numeric', month: 'short' })}, 11:00`;
  const SUNSET = '18:04'; $('[data-sunset]').textContent = SUNSET; $('[data-sunset2]').textContent = SUNSET;

  // ---------------------------------------------------------------- hero art
  const tree = (x, y, s, c) => `<path d="M${x} ${y - 46 * s} L${x + 16 * s} ${y} L${x - 16 * s} ${y}Z" style="fill:var(${c})"/><rect x="${x - 2 * s}" y="${y}" width="${4 * s}" height="${8 * s}" style="fill:var(--mtn-3)"/>`;
  let trees = '', refl = '';
  for (let i = 0; i < 22; i++) { const x = 20 + i * 38 + ((i * 13) % 17), s = 0.7 + ((i * 7) % 6) / 10, c = ['--tree-1', '--tree-2', '--tree-3', '--pine'][i % 4]; trees += tree(x, 300 - ((i * 11) % 14), s, c); refl += tree(x, 300 + ((i * 11) % 14), s * 0.8, c); }
  $('[data-art]').innerHTML = `<svg viewBox="0 0 860 420" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="lw-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-1)"/><stop offset=".6" style="stop-color:var(--sky-2)"/><stop offset="1" style="stop-color:var(--sky-3)"/></linearGradient></defs>
    <rect width="860" height="420" style="fill:url(#lw-sky)"/>
    <circle cx="560" cy="200" r="46" style="fill:var(--sun)" opacity=".9"/>
    <path d="M0 260 L150 120 L250 210 L380 70 L520 220 L640 130 L860 270 L860 310 L0 310Z" style="fill:var(--mtn-1)"/>
    <path d="M330 120 L380 70 L430 120 L405 112 L380 126 L355 110Z" style="fill:var(--text)" opacity=".75"/>
    <path d="M0 290 L120 200 L260 270 L420 180 L600 280 L760 210 L860 280 L860 310 L0 310Z" style="fill:var(--mtn-2)"/>
    <g>${trees}</g>
    <rect y="306" width="860" height="114" style="fill:var(--lake)"/>
    <g transform="translate(0 612) scale(1 -1)" opacity=".35">${refl}</g>
    <path d="M520 330 h80 M500 350 h120 M540 372 h50" style="stroke:var(--sun)" stroke-width="3" stroke-linecap="round" opacity=".5"/>
  </svg>`;

  // ---------------------------------------------------------------- thermostat
  let target = 21;
  function renderTemp() {
    $('[data-dial]').innerHTML = `<div role="img" aria-label="Target ${target} degrees">${arcGauge(((target - 15) / 12) * 100, { size: 210, w: 16, from: -135, to: 135, color: '--accent', knob: true })}</div><b class="num">${target}°<small>target</small></b>`;
    $('[data-target]').textContent = target > 18.5 ? `Heating to ${target}°` : 'Holding, no heat needed';
    $('[data-t="-1"]').disabled = target <= 15; $('[data-t="1"]').disabled = target >= 27;
  }
  // ---------------------------------------------------------------- daylight arc
  const now = 15 + 40 / 60, rise = 7.2, set = 18.07, f = Math.min(1, Math.max(0, (now - rise) / (set - rise))), a = Math.PI * (1 - f), sx = 100 + Math.cos(a) * 80, sy = 96 - Math.sin(a) * 80;
  $('[data-sunarc]').innerHTML = `<svg viewBox="0 0 200 110" role="img" aria-label="Sun is ${Math.round(f * 100)}% through the day, about 2 hours 24 minutes of light left"><path d="M20 96 A80 80 0 0 1 180 96" fill="none" style="stroke:var(--border)" stroke-width="3" stroke-dasharray="4 6"/><path d="M20 96 A80 80 0 0 1 ${sx.toFixed(1)} ${sy.toFixed(1)}" fill="none" style="stroke:var(--accent)" stroke-width="4" stroke-linecap="round"/><line x1="10" y1="96" x2="190" y2="96" style="stroke:var(--border)" stroke-width="2"/><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="9" style="fill:var(--sun)"/></svg>`;

  // ---------------------------------------------------------------- forecast
  const WX = [{ i: 'sun', hi: 14, lo: 4, d: 'Clear and crisp. Frost by the jetty at dawn.' }, { i: 'leaf', hi: 12, lo: 6, d: 'Breezy, gusts to 35 km/h. Lake may be choppy for kayaks.' }, { i: 'umbrella', hi: 9, lo: 5, d: 'Rain most of the day, 12 mm. A good sauna day.' }, { i: 'sun', hi: 11, lo: 2, d: 'Bright after a cold start. Best day for the ridge trail.' }, { i: 'moon', hi: 10, lo: 3, d: 'Cloudy, clearing at night. Stars from the deck after 21:00.' }];
  let day = 0;
  function renderWx() {
    $('[data-days]').innerHTML = WX.map((w, i) => `<button data-day="${i}" aria-pressed="${i === day}">${i === 0 ? 'Today' : fmtD(i, { weekday: 'short' })}${svg(w.i)}<span class="num">${w.hi}°</span><small class="num">${w.lo}°</small></button>`).join('');
    $('[data-wxdetail]').textContent = WX[day].d; $('[data-wxnote]').textContent = 'Lake level normal';
  }
  // ---------------------------------------------------------------- scenes
  const SC = [{ n: 'Fireside', i: 'flame', d: 'Warm lamps at 40%, fireplace glow on.' }, { n: 'Reading', i: 'book', d: 'Reading lamps at 80%, others off.' }, { n: 'Sleep', i: 'moon', d: 'All off except a low hallway light.' }, { n: 'Away', i: 'power', d: 'Lights off, heat drops to 15° while you are out.' }];
  let scene = 0;
  const renderScenes = () => { $('[data-scenes]').innerHTML = SC.map((s, i) => `<button role="radio" aria-checked="${i === scene}" tabindex="${i === scene ? 0 : -1}" data-sc="${i}">${svg(s.i)}${s.n}</button>`).join(''); $('[data-scnote]').textContent = SC[scene].d; };
  // ---------------------------------------------------------------- activities
  const ACTS = [{ n: 'Sunrise kayak', ic: 'drop', w: 'Tomorrow 07:30 · 90 min · 2 places left', mine: false, full: false }, { n: 'Cedar sauna', ic: 'flame', w: 'Today 19:00 · private · 45 min', mine: true, full: false }, { n: 'Guided ridge hike', ic: 'map', w: `${fmtD(3, { weekday: 'long' })} 09:00 · 4 h`, mine: false, full: false }, { n: 'Mushroom walk', ic: 'leaf', w: `${fmtD(2, { weekday: 'long' })} 10:00 · full`, mine: false, full: true }];
  let actf = 'all';
  function renderActs() {
    const list = ACTS.map((x, i) => ({ ...x, i })).filter((x) => actf === 'all' || x.mine);
    $('[data-acts]').innerHTML = list.length ? list.map((x) => `<li><span class="lw-ic" aria-hidden="true">${svg(x.ic)}</span><span>${x.n}<small>${x.w}</small></span><button class="lw-book" data-act="${x.i}" aria-pressed="${x.mine}" ${x.full && !x.mine ? 'disabled' : ''} aria-label="${x.mine ? 'Cancel' : x.full ? 'Full:' : 'Book'} ${x.n}">${x.mine ? 'Booked · cancel' : x.full ? 'Full' : 'Book'}</button></li>`).join('') : '<li class="lw-none">No bookings yet. Switch to All to pick an activity.</li>';
  }
  // ---------------------------------------------------------------- alarms + trails
  const AL = [{ t: '07:00', d: 'Sunrise kayak', on: true }, { t: '08:30', d: 'Weekend lie-in', on: false }];
  const renderAlarms = () => { $('[data-alarms]').innerHTML = AL.map((x, i) => `<li><span><b class="num" id="lw-al${i}">${x.t}</b><small>${x.d}</small></span><button class="lw-switch" role="switch" aria-checked="${x.on}" aria-labelledby="lw-al${i}" data-al="${i}"></button></li>`).join(''); };
  const TR = [['Lakeshore loop', '4.2 km · easy', 'ok', 'Open'], ['Larch ridge', '9.8 km · hard', 'warn', 'Muddy'], ['Falls path', '3.1 km · easy', 'bad', 'Closed · bridge repair']];
  $('[data-trails]').innerHTML = TR.map(([n, d, c, s]) => `<li><span>${n}<small>${d}</small></span><span class="lw-st ${c}">${s}</span></li>`).join('');

  // ---------------------------------------------------------------- events
  $$('[data-t]').forEach((b) => b.addEventListener('click', () => { target = Math.min(27, Math.max(15, target + +b.dataset.t)); renderTemp(); }));
  $('[data-days]').addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (!b) return; day = +b.dataset.day; renderWx(); $(`[data-day="${day}"]`).focus(); });
  $('[data-scenes]').addEventListener('click', (e) => { const b = e.target.closest('[data-sc]'); if (!b) return; scene = +b.dataset.sc; renderScenes(); $(`[data-sc="${scene}"]`).focus(); });
  $('[data-scenes]').addEventListener('keydown', (e) => { const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return; e.preventDefault(); scene = (scene + d + SC.length) % SC.length; renderScenes(); $(`[data-sc="${scene}"]`).focus(); });
  seg($('[data-actf]'), (v) => { actf = v; renderActs(); });
  $('[data-acts]').addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (!b) return; const x = ACTS[+b.dataset.act]; x.mine = !x.mine; renderActs(); const nb = $(`[data-act="${b.dataset.act}"]`); (nb || $('[data-actf] [aria-pressed="true"]')).focus(); });
  $('[data-alarms]').addEventListener('click', (e) => { const b = e.target.closest('[data-al]'); if (!b) return; AL[+b.dataset.al].on = !AL[+b.dataset.al].on; renderAlarms(); $(`[data-al="${b.dataset.al}"]`).focus(); });
  renderTemp(); renderWx(); renderScenes(); renderActs(); renderAlarms();
/* === DB multipage bootstrap (generated; polish pass replaces stubs) === */
  (function wirePages() {
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"rooms","name":"Rooms","pattern":"List"},{"id":"guests","name":"Guests","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
  document.documentElement.dataset.ready = 'true'; // contract: tells dashboards-check.mjs the script ran to the end
})();
