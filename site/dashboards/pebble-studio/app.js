/* Pebble Studio: soft-UI admin — blobs, knobs, dunes, torus + dial.
   Fictional sample data only. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    sparkle: '<path d="M12 3l1.8 5.200L19 10l-5.2 1.800L12 17l-1.8-5.200L5 10l5.2-1.800zM19 16l.8 2.200L22 19l-2.2.8L19 22l-.8-2.200L16 19l2.2-.8z"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
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
  // Donut from stroked circles. parts: [{ value, color: '--chart-1' }] (values in any unit). Returns an SVG string.
  function donut(parts, { size = 120, w = 14, gap = 1.5, round = false } = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0), r = (size - w) / 2, c = size / 2; let off = 0;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}"/>${parts.map((p) => {
      const len = (p.value / total) * 100, seg = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}" pathLength="100" stroke-dasharray="${Math.max(0.01, len - gap).toFixed(2)} ${(100 - len + gap).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})" style="stroke:var(${p.color})"${round ? ' stroke-linecap="round"' : ''}/>`;
      off += len; return seg;
    }).join('')}</svg>`;
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
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `pb-s${++sparkId}`;
    return `<svg class="pb-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }
  let sparkId = 0;
  paintIcons();

  const MOODS = {
    clay: { title: 'Soft clay kit', lede: 'Overlapping forms for the spring board.', a: '--peach', b: '--candy' },
    candy: { title: 'Candy pile', lede: 'Pink-forward pebbles for campaign frames.', a: '--candy', b: '--sky' },
    mint: { title: 'Mint stack', lede: 'Cooler dunes for export previews.', a: '--mint', b: '--peach' },
  };
  let mood = 'clay', clarity = 72, lite = 42, range = 7, feedFilter = 'all', feedState = 'populated';

  function blobs(a, b) {
    return `<svg viewBox="0 0 360 210" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="pb-b1" cx="35%" cy="30%"><stop offset="0" style="stop-color:var(--butter)"/><stop offset="1" style="stop-color:var(${a})"/></radialGradient>
        <radialGradient id="pb-b2" cx="40%" cy="35%"><stop offset="0" style="stop-color:var(--surface)"/><stop offset="1" style="stop-color:var(${b})"/></radialGradient>
        <filter id="pb-soft"><feGaussianBlur stdDeviation="0.4"/></filter>
      </defs>
      <ellipse cx="118" cy="118" rx="92" ry="78" fill="url(#pb-b1)" opacity="0.95"/>
      <ellipse cx="118" cy="118" rx="92" ry="78" fill="none" stroke="rgb(255 255 255 / 0.45)" stroke-width="3"/>
      <ellipse cx="210" cy="104" rx="88" ry="74" fill="url(#pb-b2)" opacity="0.92"/>
      <ellipse cx="210" cy="104" rx="88" ry="74" fill="none" stroke="rgb(255 255 255 / 0.4)" stroke-width="3"/>
      <ellipse cx="96" cy="96" rx="28" ry="18" fill="rgb(255 255 255 / 0.35)"/>
      <ellipse cx="188" cy="82" rx="24" ry="14" fill="rgb(255 255 255 / 0.3)"/>
      <circle cx="286" cy="148" r="22" fill="var(--mint)" opacity="0.85"/>
      <circle cx="54" cy="156" r="14" fill="var(--sky)" opacity="0.8"/>
    </svg>`;
  }
  function floatKnob() {
    return `<button type="button" class="pb-knob" data-float aria-label="Accent knob" aria-pressed="false">
      <span class="pb-knobface" style="--knob:var(--sky)"><i></i></span>
    </button>`;
  }
  function torus() {
    return `<svg viewBox="0 0 220 180">
      <defs>
        <linearGradient id="pb-torus" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style="stop-color:var(--candy)"/>
          <stop offset="0.35" style="stop-color:var(--sky)"/>
          <stop offset="0.7" style="stop-color:var(--mint)"/>
          <stop offset="1" style="stop-color:var(--butter)"/>
        </linearGradient>
        <radialGradient id="pb-hole" cx="50%" cy="45%"><stop offset="0" style="stop-color:var(--surface)"/><stop offset="1" style="stop-color:var(--surface-2)"/></radialGradient>
      </defs>
      <ellipse cx="110" cy="96" rx="88" ry="58" fill="none" stroke="url(#pb-torus)" stroke-width="28"/>
      <ellipse cx="110" cy="96" rx="88" ry="58" fill="none" stroke="rgb(255 255 255 / 0.35)" stroke-width="6" stroke-dasharray="2 6"/>
      <ellipse cx="110" cy="96" rx="42" ry="28" fill="url(#pb-hole)"/>
      <ellipse cx="78" cy="70" rx="18" ry="8" fill="rgb(255 255 255 / 0.35)"/>
    </svg>`;
  }
  function tickDial(pct) {
    const ticks = Array.from({ length: 48 }, (_, i) => {
      const a = (i / 48) * Math.PI * 2 - Math.PI / 2;
      const outer = i % 4 === 0 ? 68 : 64;
      const x1 = 75 + Math.cos(a) * outer, y1 = 75 + Math.sin(a) * outer;
      const x2 = 75 + Math.cos(a) * 72, y2 = 75 + Math.sin(a) * 72;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--text-muted)" stroke-width="${i % 4 === 0 ? 2 : 1}" opacity="0.55"/>`;
    }).join('');
    const ang = -120 + 240 * (pct / 100);
    const rad = (ang * Math.PI) / 180;
    const kx = 75 + Math.cos(rad - Math.PI / 2) * 48;
    const ky = 75 + Math.sin(rad - Math.PI / 2) * 48;
    return `<svg viewBox="0 0 150 150">
      <circle cx="75" cy="75" r="58" fill="var(--surface)" stroke="var(--border)" stroke-width="2"/>
      ${ticks}
      <circle cx="75" cy="75" r="36" fill="var(--sky)" opacity="0.35"/>
      <circle cx="75" cy="75" r="28" fill="var(--surface)" box-shadow="none" style="filter:drop-shadow(2px 3px 4px rgb(120 80 60 / 0.18))"/>
      <circle cx="${kx.toFixed(1)}" cy="${ky.toFixed(1)}" r="5" fill="var(--accent)"/>
    </svg>`;
  }
  function dunes() {
    return `<svg viewBox="0 0 420 160" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pb-skyband" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:var(--sky)" stop-opacity="0.35"/>
          <stop offset="1" style="stop-color:var(--surface-2)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="420" height="160" fill="url(#pb-skyband)"/>
      <path d="M0,110 C60,90 110,130 170,108 C230,86 280,120 340,100 C380,88 410,96 420,92 L420,160 L0,160 Z" fill="var(--mint)" opacity="0.75"/>
      <path d="M0,124 C70,108 130,140 200,122 C270,104 320,136 380,118 C400,112 415,116 420,114 L420,160 L0,160 Z" fill="var(--peach)" opacity="0.85"/>
      <path d="M0,138 C80,126 140,148 220,136 C300,124 350,150 420,134 L420,160 L0,160 Z" fill="var(--candy)" opacity="0.8"/>
      <path d="M0,148 C90,142 160,156 250,148 C330,140 380,154 420,148 L420,160 L0,160 Z" fill="var(--butter)" opacity="0.9"/>
    </svg>`;
  }

  const KNOBS = [
    { id: 'grain', label: 'Grain', c: '--mint', v: 40 },
    { id: 'glow', label: 'Glow', c: '--candy', v: 62 },
    { id: 'edge', label: 'Edge', c: '--sky', v: 28 },
  ];
  let knob = 'glow';

  const FEED = [
    { id: 1, t: 'mix', title: 'Coral mix exported', detail: 'Frame set · 1440×900', icon: 'download', tone: '--peach', when: -1 },
    { id: 2, t: 'team', title: 'Mira joined Soft Clay', detail: 'Editor seat assigned', icon: 'users', tone: '--mint', when: -2 },
    { id: 3, t: 'mix', title: 'Wave dunes retuned', detail: 'Warmth +8%', icon: 'sparkle', tone: '--candy', when: -3 },
    { id: 4, t: 'team', title: 'Kit review scheduled', detail: 'Thursday soft critique', icon: 'check', tone: '--sky', when: -5 },
    { id: 5, t: 'mix', title: 'Torus palette swapped', detail: 'Candy → mint stop', icon: 'layers', tone: '--butter', when: -8 },
  ];

  const MIX = [
    { n: 'Peach', c: '--peach', v: 34 },
    { n: 'Candy', c: '--candy', v: 28 },
    { n: 'Mint', c: '--mint', v: 22 },
    { n: 'Sky', c: '--sky', v: 16 },
  ];

  function renderStage() {
    const m = MOODS[mood];
    $('[data-stage-title]').textContent = m.title;
    $('[data-stage-lede]').textContent = m.lede;
    $('[data-blobs]').innerHTML = blobs(m.a, m.b);
    $('[data-float-knob]').innerHTML = floatKnob();
  }
  function renderDial() {
    $('[data-tickdial]').innerHTML = tickDial(clarity);
    $('[data-dial-val]').textContent = String(clarity);
    $('[data-mix-meta]').textContent = `${clarity + 12} · ${clarity >= 70 ? 'stable' : 'tuning'}`;
  }
  function renderTorus() { $('[data-torus]').innerHTML = torus(); }
  function renderDunes() {
    $('[data-dunes]').innerHTML = dunes();
    const mult = range === 7 ? 1 : 1.35;
    $('[data-depth]').textContent = (4.2 * (range === 7 ? 1 : 1.1)).toFixed(1);
    $('[data-warmth]').textContent = `${Math.round(68 * mult / (range === 7 ? 1 : 1.15))}%`;
    $('[data-flow]').textContent = range === 7 ? '+12' : '+31';
  }
  function renderKnobs() {
    $('[data-knobs]').innerHTML = KNOBS.map((k) => `<button type="button" class="pb-knob" data-knob="${k.id}" aria-pressed="${k.id === knob}" aria-label="${k.label} ${k.v}">
      <span class="pb-knobface" style="--knob:var(${k.c})"><i style="transform:rotate(${k.v * 2.4}deg) translateY(-22px) rotate(${-k.v * 2.4}deg)"></i></span>
      <span>${k.label}</span>
    </button>`).join('');
    const k = KNOBS.find((x) => x.id === knob);
    $('[data-knobnote]').textContent = `${k.label} at ${k.v} — tap another knob to focus it, then use ± on Clarity to nudge feel.`;
  }
  function renderMix() {
    $('[data-mixpills]').innerHTML = MIX.map((m) => `<li><i style="background:var(${m.c})"></i>${m.n}<span class="num">${m.v}%</span></li>`).join('');
  }
  function renderLite() {
    $('[data-lite]').value = String(lite);
    $('[data-lite-val]').textContent = `${lite}%`;
  }
  function renderFeed() {
    const box = $('[data-feed]'), msg = $('[data-feedmsg]');
    msg.hidden = true;
    if (feedState === 'loading') {
      box.innerHTML = `<li class="pb-skel" aria-hidden="true"></li><li class="pb-skel" aria-hidden="true"></li><li class="pb-skel" aria-hidden="true"></li>`;
      return;
    }
    if (feedState === 'error') {
      box.innerHTML = '';
      msg.hidden = false;
      msg.textContent = 'Could not load pastel activity. Tap All to retry.';
      return;
    }
    const list = FEED.filter((f) => feedFilter === 'all' || f.t === feedFilter);
    if (!list.length || feedState === 'empty') {
      box.innerHTML = '';
      msg.hidden = false;
      msg.textContent = feedFilter === 'all' ? 'No pastel activity yet. Export a soft frame to start the feed.' : `No ${feedFilter} events right now. Switch to All.`;
      return;
    }
    box.innerHTML = list.map((f) => `<li>
      <span class="pb-chip" style="background:color-mix(in srgb, var(${f.tone}) 45%, var(--surface))">${svg(f.icon)}</span>
      <span><b>${f.title}</b><small>${f.detail}</small></span>
      <time datetime="${dayOffset(f.when).toISOString()}">${fmtDate(dayOffset(f.when))}</time>
    </li>`).join('');
  }

  // nav / mood / range
  seg($('[data-nav]'), (v) => {
    feedState = v === 'team' ? 'empty' : 'populated';
    feedFilter = v === 'mixes' ? 'mix' : v === 'team' ? 'team' : 'all';
    $$('[data-feedfilter] button[data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === feedFilter)));
    renderFeed();
  });
  seg($('[data-mood]'), (v) => { mood = v; renderStage(); });
  seg($('[data-range]'), (v) => { range = +v; renderDunes(); });
  seg($('[data-feedfilter]'), (v) => {
    feedFilter = v;
    feedState = 'populated';
    if (v === 'team' && !FEED.some((f) => f.t === 'team')) feedState = 'empty';
    renderFeed();
  });

  $('[data-dial-dec]').addEventListener('click', () => { clarity = Math.max(0, clarity - 4); renderDial(); });
  $('[data-dial-inc]').addEventListener('click', () => { clarity = Math.min(100, clarity + 4); renderDial(); });
  $('[data-knobs]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-knob]'); if (!b) return;
    knob = b.dataset.knob;
    const k = KNOBS.find((x) => x.id === knob);
    k.v = Math.min(100, k.v + 6);
    renderKnobs();
  });
  $('[data-float-knob]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-float]'); if (!b) return;
    const on = b.getAttribute('aria-pressed') === 'true';
    b.setAttribute('aria-pressed', String(!on));
  });
  $('[data-lite]').addEventListener('input', (e) => { lite = +e.target.value; renderLite(); });
  $('[data-export]').addEventListener('click', (e) => {
    e.target.textContent = `Exported at ${lite}% lite`;
    feedState = 'populated';
    feedFilter = 'all';
    $$('[data-feedfilter] button[data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === 'all')));
    FEED.unshift({ id: Date.now(), t: 'mix', title: 'Soft frame exported', detail: `Lite ${lite}% · clarity ${clarity}`, icon: 'download', tone: '--peach', when: 0 });
    renderFeed();
  });
  $('[data-q]').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) { feedState = 'populated'; renderFeed(); return; }
    feedState = FEED.some((f) => (f.title + f.detail).toLowerCase().includes(q)) ? 'populated' : 'empty';
    if (feedState === 'empty') { $('[data-feed]').innerHTML = ''; $('[data-feedmsg]').hidden = false; $('[data-feedmsg]').textContent = `Nothing matches “${q}”.`; return; }
    const list = FEED.filter((f) => (f.title + f.detail).toLowerCase().includes(q));
    $('[data-feedmsg]').hidden = true;
    $('[data-feed]').innerHTML = list.map((f) => `<li>
      <span class="pb-chip" style="background:color-mix(in srgb, var(${f.tone}) 45%, var(--surface))">${svg(f.icon)}</span>
      <span><b>${f.title}</b><small>${f.detail}</small></span>
      <time>${fmtDate(dayOffset(f.when))}</time>
    </li>`).join('');
  });
  $$('[data-kpi]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-kpi]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));

  renderStage(); renderTorus(); renderDial(); renderDunes(); renderKnobs(); renderMix(); renderLite(); renderFeed();
/* === DB multipage bootstrap (generated; polish pass replaces stubs) === */
  (function wirePages() {
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"workspace","name":"Workspace","pattern":"List"},{"id":"people","name":"People","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
