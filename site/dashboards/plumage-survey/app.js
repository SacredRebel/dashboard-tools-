/* Plumage Bird Survey: sample data, hero art, regions, rings, species bars and log.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {

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
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `pl-s${++sparkId}`;
    return `<svg class="pl-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }
  let sparkId = 0;
  const C = ['--p1', '--p2', '--p3', '--p4', '--p5', '--p6'];
  const REG = [
    { n: 'Estuary', c: '--p1', s: [31, 34, 33, 38, 41, 40, 44, 47, 45, 49, 52, 55] },
    { n: 'Dune heath', c: '--p2', s: [22, 24, 27, 26, 29, 31, 30, 33, 35, 34, 36, 38] },
    { n: 'Cliff coast', c: '--p4', s: [18, 19, 23, 27, 26, 30, 34, 33, 31, 35, 37, 36] },
    { n: 'Salt marsh', c: '--p5', s: [26, 25, 28, 30, 33, 32, 36, 39, 41, 40, 43, 46] }
  ];
  const SP = [
    { n: 'Ember lorikeet', v: 64 }, { n: 'Little tern', v: 412 }, { n: 'Bar-tailed godwit', v: 356 }, { n: 'Meadow pipit', v: 298 },
    { n: 'Marsh harrier', v: 141 }, { n: 'Sandwich tern', v: 226 }, { n: 'Kingfisher', v: 92 }
  ];
  const WHO = ['Aoife Brennan', 'Tomasz Nowak', 'Leilani Kahale', 'Ravi Menon', 'June Okafor', 'Sven Holm'];
  const LOG = [
    [1, 0, 2, 38], [3, 1, 0, 2], [0, 2, 0, 1], [2, 3, 3, 120], [5, 4, 1, 14], [4, 5, 3, 3], [1, 0, 1, 26], [6, 2, 0, 1], [3, 3, 2, 4], [2, 1, 3, 64], [1, 4, 0, 19], [0, 5, 0, 2]
  ].map(([s, w, r, c], i) => ({ s, w, r, c, d: -Math.floor(i / 2) }));
  let season = 'spring', pick = -1;
  const k = () => (season === 'spring' ? 1 : 0.82);

  // ---------------------------------------------------------------- hero art
  function leaves(x0, flip, cA, cB) {
    let out = '';
    for (let i = 0; i < 16; i++) {
      const y = 20 + i * 24, x = x0 + (flip ? -1 : 1) * ((i * 37) % 50), r = (flip ? 200 : -20) + ((i * 53) % 60) - 30, s = 0.8 + ((i * 17) % 10) / 20;
      out += `<ellipse cx="${x}" cy="${y}" rx="${34 * s}" ry="${12 * s}" transform="rotate(${r} ${x} ${y})" style="fill:var(${i % 2 ? cA : cB})" opacity="${0.75 + (i % 3) * 0.08}"/>`;
    }
    return out;
  }
  function feathers() {
    let out = '';
    for (let i = 0; i < 9; i++) { const a = -30 + i * 9; out += `<path d="M0 0 C -20 40 -14 120 6 170 C 18 120 22 40 0 0Z" transform="translate(${236 - i * 6} ${150 + i * 6}) rotate(${a + 40})" style="fill:url(#pl-fg)" opacity="${0.55 + i * 0.05}"/>`; }
    return out;
  }
  $('[data-art]').innerHTML = `<svg viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="pl-fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--p1)"/><stop offset=".35" style="stop-color:var(--p2)"/><stop offset=".6" style="stop-color:var(--p4)"/><stop offset=".8" style="stop-color:var(--p5)"/><stop offset="1" style="stop-color:var(--p6)"/></linearGradient>
      <linearGradient id="pl-hd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--p4)"/><stop offset=".55" style="stop-color:var(--p5)"/><stop offset="1" style="stop-color:var(--p6)"/></linearGradient>
    </defs>
    <g>${leaves(10, false, '--leaf-1', '--leaf-2')}</g><g>${leaves(590, true, '--leaf-3', '--leaf-4')}</g>
    <path d="M150 395 C 180 300 230 230 330 205 C 380 195 410 230 400 280 C 390 340 300 380 210 410Z" style="fill:url(#pl-fg)"/>
    <g>${feathers()}</g>
    <path d="M300 210 C 300 150 340 110 395 112 C 440 114 470 150 466 192 C 460 236 420 250 380 248 C 340 246 300 240 300 210Z" style="fill:url(#pl-hd)"/>
    <path d="M318 150 C 340 118 380 104 420 112" fill="none" style="stroke:var(--p3)" stroke-width="6" stroke-linecap="round" opacity=".7"/>
    <path d="M455 160 C 492 156 520 178 518 214 C 516 236 504 248 494 252 C 498 226 486 206 458 204Z" style="fill:var(--beak)"/>
    <path d="M456 204 C 476 206 488 216 490 232 C 476 230 462 222 454 214Z" style="fill:var(--leaf-3)"/>
    <circle cx="430" cy="160" r="13" style="fill:var(--text)"/><circle cx="432" cy="160" r="8" style="fill:var(--eye)"/><circle cx="435" cy="157" r="2.5" style="fill:var(--text)"/>
    <path d="M210 410 L 240 330 L 260 410Z" style="fill:var(--p6)" opacity=".8"/>
  </svg>`;

  // ---------------------------------------------------------------- render
  function render() {
    $('[data-regions]').innerHTML = REG.map((r) => { const s = r.s.map((v) => Math.round(v * k())); return `<article class="pl-reg"><p>${r.n}<b class="num">${s[s.length - 1]}</b></p><div role="img" aria-label="${r.n}: ${s[0]} to ${s[s.length - 1]} species over 12 weeks">${spark(s, { color: r.c, fill: 0.45, w: 240, h: 70 })}</div></article>`; }).join('');
    const total = Math.round(112 * k());
    $('[data-total]').textContent = total;
    $('[data-totalnote]').textContent = season === 'spring' ? '+9 on last spring · 4 new to the site' : '−6 on last autumn · migrants left early';
    const cov = season === 'spring' ? 82 : 74, nest = season === 'spring' ? 67 : 58;
    $('[data-ring1]').innerHTML = `<div role="img" aria-label="${cov}% of transects surveyed">${arcGauge(cov, { size: 150, w: 14, from: -140, to: 140, color: '--p3' })}</div><b class="num">${cov}%</b>`;
    $('[data-ring2]').innerHTML = `<div role="img" aria-label="${nest}% nesting success">${arcGauge(nest, { size: 150, w: 14, from: -140, to: 140, color: '--p1' })}</div><b class="num">${nest}%</b>`;
    const HAB = [{ n: 'Wetland', v: season === 'spring' ? 41 : 48, c: '--p1' }, { n: 'Coast', v: season === 'spring' ? 33 : 30, c: '--p6' }, { n: 'Heath', v: season === 'spring' ? 26 : 22, c: '--p4' }];
    $('[data-donuts]').innerHTML = HAB.map((h) => `<li><div role="img" aria-label="${h.n} ${h.v}%">${donut([{ value: h.v, color: h.c }, { value: 100 - h.v, color: '--surface-2' }], { size: 64, w: 8, gap: 0, round: true })}<b class="num">${h.v}%</b></div><span>${h.n}</span></li>`).join('');
    const rows = SP.map((s, i) => ({ ...s, i, v: Math.round(s.v * k()) })).sort((a, b) => b.v - a.v), max = rows[0].v;
    $('[data-bars]').innerHTML = rows.map((s) => `<li><button data-sp="${s.i}" aria-pressed="${s.i === pick}"><span>${s.n}</span><span class="pl-track" aria-hidden="true"><i style="width:${((s.v / max) * 100).toFixed(1)}%"></i></span><span class="num">${s.v}</span></button></li>`).join('');
    renderLog();
  }
  function renderLog() {
    const list = LOG.filter((l) => pick < 0 || l.s === pick);
    $('[data-clear]').hidden = pick < 0;
    $('[data-logstate]').textContent = pick < 0 ? `Latest ${list.length} records from volunteers` : `${list.length} ${list.length === 1 ? 'record' : 'records'} of ${SP[pick].n}`;
    $('[data-log]').innerHTML = list.length ? list.map((l) => `<li><i style="background:var(${C[l.s % 6]})" aria-hidden="true"></i><span>${SP[l.s].n}<small>${WHO[l.w]} · ${REG[l.r].n} · ${l.d === 0 ? 'Today' : fmtDate(dayOffset(l.d), { weekday: 'short', day: 'numeric', month: 'short' })}</small></span><span class="num" aria-label="${l.c} birds">${l.c}</span></li>`).join('') : `<li class="pl-none">No records of ${SP[pick].n} yet this season. Pick another species or show all.</li>`;
  }

  // ---------------------------------------------------------------- events
  seg($('[data-season]'), (v) => { season = v; render(); });
  $('[data-bars]').addEventListener('click', (e) => { const b = e.target.closest('[data-sp]'); if (!b) return; const i = +b.dataset.sp; pick = pick === i ? -1 : i; render(); $(`[data-sp="${i}"]`).focus(); });
  $('[data-clear]').addEventListener('click', () => { const i = pick; pick = -1; render(); $(`[data-sp="${i}"]`).focus(); });
  render();
  document.documentElement.dataset.ready = 'true'; // contract: tells dashboards-check.mjs the script ran to the end
})();
