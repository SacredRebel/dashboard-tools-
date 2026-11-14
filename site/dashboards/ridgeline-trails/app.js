/* Ridgeline Trails: sample data, mountain artwork, charts and interactions.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `rt-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="rt-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="rt-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="rt-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="rt-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="rt-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="rt-cursor" hidden></span><span class="rt-tip num" hidden></span>
    </div>`;
    const tip = $('.rt-tip', el), cur = $('.rt-cursor', el), dots = $$('.rt-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `rt-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.rt-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.rt-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  // Donut from stroked circles. parts: [{ value, color: '--chart-1' }] (values in any unit). Returns an SVG string.
  function donut(parts, { size = 120, w = 14, gap = 1.5, round = false } = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0), r = (size - w) / 2, c = size / 2; let off = 0;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}"/>${parts.map((p) => {
      const len = (p.value / total) * 100, seg = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}" pathLength="100" stroke-dasharray="${Math.max(0.01, len - gap).toFixed(2)} ${(100 - len + gap).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})" style="stroke:var(${p.color})"${round ? ' stroke-linecap="round"' : ''}/>`;
      off += len; return seg;
    }).join('')}</svg>`;
  }

  // ---------------------------------------------------------------- artwork: layered ridges with mist bands and a forest slope
  function ridge(pts, base) { return 'M' + pts.map((p) => p.join(',')).join(' L') + ` L${pts[pts.length - 1][0]},${base} L${pts[0][0]},${base} Z`; }
  function renderArt() {
    const st = (o, c, a = 1) => `<stop offset="${o}" style="stop-color:var(${c});stop-opacity:${a}"/>`;
    const front = [[420, 560], [560, 470], [700, 400], [860, 360], [960, 330], [1010, 300]];
    const ry = (x) => { for (let k = 1; k < front.length; k++) if (x <= front[k][0]) { const [x0, y0] = front[k - 1], [x1, y1] = front[k]; return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0); } return 300; };
    const trees = Array.from({ length: 64 }, (_, i) => { const x = 500 + (i * 53) % 500, y = ry(x) + 16 + ((i * 37) % 90), h = 24 + (i % 5) * 4; return [y, `<path d="M${x},${(y - h).toFixed(0)} L${x + 7},${y.toFixed(0)} L${x - 7},${y.toFixed(0)} Z" fill="var(${i % 3 ? '--forest' : '--forest-2'})"/>`]; }).sort((a, b) => a[0] - b[0]).map((t) => t[1]).join('');
    $('[data-art]').innerHTML = `<svg viewBox="400 0 800 560" preserveAspectRatio="xMaxYMax slice">
      <defs>
        <linearGradient id="rt-fade" x1="0" y1="0" x2="1" y2="0">${st(0, '--mist', 1)}${st(0.3, '--mist', 0)}</linearGradient>
        <linearGradient id="rt-mist" x1="0" y1="0" x2="0" y2="1">${st(0, '--mist', 0)}${st(0.5, '--mist', 0.92)}${st(1, '--mist', 0)}</linearGradient>
        <linearGradient id="rt-p4" x1="0" y1="0" x2="0" y2="1">${st(0, '--peak-3')}${st(1, '--peak-4')}</linearGradient>
      </defs>
      <path d="${ridge([[560, 330], [640, 250], [700, 180], [745, 90], [770, 60], [800, 110], [850, 170], [900, 200], [960, 240], [1040, 280], [1200, 330]], 560)}" fill="var(--peak-1)"/>
      <path d="M745,90 L770,60 800,110 782,150 760,120 748,160 Z" fill="var(--mist)" opacity="0.7"/>
      <path d="${ridge([[520, 400], [600, 330], [660, 300], [720, 250], [760, 270], [820, 220], [860, 250], [930, 230], [990, 200], [1040, 250], [1120, 270], [1200, 300]], 560)}" fill="var(--peak-2)"/>
      <rect x="380" y="270" width="820" height="130" fill="url(#rt-mist)"/>
      <path d="${ridge([[440, 470], [520, 400], [580, 340], [610, 320], [650, 350], [720, 380], [800, 330], [840, 300], [880, 330], [960, 360], [1010, 320], [1050, 290], [1100, 330], [1200, 380]], 560)}" fill="var(--peak-3)"/>
      <rect x="300" y="360" width="900" height="110" fill="url(#rt-mist)"/>
      <path d="${ridge([[420, 560], [560, 470], [700, 400], [860, 360], [960, 330], [1010, 300], [1060, 340], [1130, 420], [1200, 480]], 560)}" fill="url(#rt-p4)"/>
      ${trees}
      
    </svg>`;
  }

  // ---------------------------------------------------------------- sample data
  const now = new Date(), wave = (n, base, amp, k) => Array.from({ length: n }, (_, i) => Math.round(base + amp * Math.sin(i * k) + amp * 0.6 * Math.sin(i * k * 2.7 + 1) + (i / n) * amp));
  const RANGES = {
    week: { n: 7, labels: Array.from({ length: 7 }, (_, i) => fmtDate(dayOffset(i - 6), { weekday: 'short' })), visitors: wave(7, 1180, 260, 0.9), last: wave(7, 1020, 200, 1.1), stay: '3 h 12 min', mult: 1 },
    month: { n: 10, labels: Array.from({ length: 10 }, (_, i) => fmtDate(dayOffset((i - 9) * 3))), visitors: wave(10, 1090, 300, 0.7), last: wave(10, 960, 220, 0.8), stay: '3 h 04 min', mult: 4.2 },
    season: { n: 12, labels: Array.from({ length: 12 }, (_, i) => fmtDate(dayOffset((i - 11) * 7))), visitors: wave(12, 940, 380, 0.5), last: wave(12, 860, 300, 0.6), stay: '2 h 51 min', mult: 12.6 },
  };
  const HEADS = [['North Gate', 2840, '--w3'], ['Kestrel Creek', 2210, '--w1'], ['Stonebridge', 1630, '--w2'], ['Old Quarry Road', 980, '--w5'], ['Fern Hollow', 610, '--w4']];
  const DIALS = {
    trail: [['Summit Loop', 24, '--w1'], ['Kestrel Falls', 18, '--w2'], ['Mist Lake', 16, '--w3'], ['Larch Traverse', 14, '--w4'], ['Quarry Spur', 15, '--w5'], ['Other trails', 13, '--w6']],
    act: [['Day hiking', 46, '--w4'], ['Trail running', 17, '--w1'], ['Backpacking', 14, '--w2'], ['Climbing', 9, '--w3'], ['Other', 14, '--w6']],
  };
  const LOTS = [['North Gate', 212, 240], ['Kestrel Creek', 96, 140], ['Stonebridge', 58, 110]];
  const COND = [['Summit', '−2 °C · wind 34 km/h', '--chart-1'], ['Tree line', '6 °C · light mist', '--chart-2'], ['Trailheads', '12 °C · clear', '--chart-3'], ['Avalanche risk', 'Low', '--chart-3']];
  let range = 'week'; const sel = { trail: -1, act: -1 };
  const sum = (a) => a.reduce((x, y) => x + y, 0);

  // ---------------------------------------------------------------- renderers
  const ring = (pct, color, w = 9, size = 84) => `<div class="rt-ring">${donut([{ value: pct, color }, { value: 100 - pct, color: '--surface-2' }], { size, w, gap: 0 })}<b class="num">${pct}%</b></div>`;
  function renderUpper() {
    const r = RANGES[range], total = sum(r.visitors), prev = sum(r.last), ch = ((total - prev) / prev) * 100, passes = Math.round(total * 0.62);
    $('[data-rings]').innerHTML = `<div class="rt-ringf" role="img" aria-label="62% of visitors held a day pass">${ring(62, '--chart-2')}Day passes</div><div class="rt-ringf" role="img" aria-label="${range === 'week' ? 38 : 41}% were return visitors">${ring(range === 'week' ? 38 : 41, '--chart-1')}Return visitors</div>`;
    $('[data-nums]').innerHTML = `<div><dt>Visitors</dt><dd class="num">${fmtNum(total)}<small>${ch >= 0 ? '↑' : '↓'} ${Math.abs(ch).toFixed(1)}% vs. last ${range}</small></dd></div><div><dt>Passes sold</dt><dd class="num">${fmtNum(passes)}<small>Average stay ${r.stay}</small></dd></div>`;
    lineChart($('[data-trend]'), { labels: r.labels, h: 130, ticks: 3, min: 0, series: [{ name: 'This period', color: '--chart-1', values: r.visitors, fill: 0.12 }, { name: 'Previous', color: '--text-subtle', values: r.last, fill: 0, dash: '4 4' }], label: `Visitors per day this ${range} against the previous ${range}` });
    $('[data-heads]').innerHTML = HEADS.map(([n, v, c]) => `<li>${n}<span class="num">${fmtNum(Math.round(v * r.mult))}</span><i style="--w:${(v / HEADS[0][1]) * 100}%;--c:var(${c})"></i></li>`).join('');
  }
  function wedges(parts, on) {
    let a = -90; const R = 41, pt = (deg, r) => [50 + r * Math.cos((deg * Math.PI) / 180), 50 + r * Math.sin((deg * Math.PI) / 180)].map((n) => n.toFixed(2)).join(',');
    const ticks = Array.from({ length: 60 }, (_, i) => `<line class="tick" x1="${pt(i * 6, 46).split(',')[0]}" y1="${pt(i * 6, 46).split(',')[1]}" x2="${pt(i * 6, i % 5 ? 47.5 : 48.5).split(',')[0]}" y2="${pt(i * 6, i % 5 ? 47.5 : 48.5).split(',')[1]}"/>`).join('');
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${ticks}${parts.map(([, v, c], i) => { const b = a + (v / 100) * 360, d = `M50,50 L${pt(a, R)} A${R},${R} 0 ${b - a > 180 ? 1 : 0} 1 ${pt(b, R)} Z`; a = b; return `<path d="${d}" class="${on === i ? 'on' : ''}" style="fill:var(${c})"/>`; }).join('')}</svg>`;
  }
  function renderDial(k) {
    const parts = DIALS[k], on = sel[k];
    $(`[data-dial="${k}"]`).innerHTML = `<div class="rt-dial${on >= 0 ? ' has-sel' : ''}" role="img" aria-label="${parts.map(([n, v]) => `${n} ${v}%`).join(', ')}">${wedges(parts, on)}</div>
      <div class="rt-keys">${parts.map(([n, v, c], i) => `<button data-k="${k}" data-i="${i}" aria-pressed="${on === i}"><i style="background:var(${c})"></i>${n}<b class="num">${v}%</b></button>`).join('')}</div>`;
  }
  function renderCap() {
    const used = sum(LOTS.map((l) => l[1])), cap = sum(LOTS.map((l) => l[2])), pct = Math.round((used / cap) * 100);
    $('[data-cap]').innerHTML = `<div role="img" aria-label="${pct}% of parking spaces in use">${ring(pct, '--accent', 8, 112)}</div><p><b class="num">${used} of ${cap}</b>spaces taken. North Gate usually fills by 9:30 am.</p>`;
    $('[data-lots]').innerHTML = LOTS.map(([n, u, c]) => `<tr><td>${n}</td><td class="num">${u}</td><td class="num">${Math.round((u / c) * 100)}%</td></tr>`).join('');
  }

  // ---------------------------------------------------------------- events
  seg($('[data-range]'), (v) => { range = v; renderUpper(); });
  $('.rt-grid').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k, i = +b.dataset.i; sel[k] = sel[k] === i ? -1 : i; renderDial(k); $(`[data-k="${k}"][data-i="${i}"]`).focus(); });
  $('[data-cond]').innerHTML = COND.map(([n, v, c]) => `<li><i style="background:var(${c})"></i><b>${n}</b><span>${v}</span></li>`).join('');
  renderArt(); renderUpper(); renderDial('trail'); renderDial('act'); renderCap();
/* === DB multipage bootstrap (generated; polish pass replaces stubs) === */
  (function wirePages() {
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"routes","name":"Routes","pattern":"List"},{"id":"journal","name":"Journal","pattern":"Detail"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
