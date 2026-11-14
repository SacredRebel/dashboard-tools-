/* Lull Sleep: sample data, pastel sky artwork, night timeline and interactions.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    moon: '<path d="M20 14.500A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.500z"/>',
    thermo: '<path d="M14 14.800V5a2 2 0 0 0-4 0v9.800a4 4 0 1 0 4 0z"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    speaker: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><circle cx="12" cy="14.5" r="3"/><circle cx="12" cy="7" r=".8"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 1.800v2.400M12 19.800v2.400M4.8 4.800l1.7 1.700M17.5 17.500l1.7 1.700M1.8 12h2.400M19.8 12h2.400M4.8 19.200l1.7-1.700M17.5 6.500l1.7-1.7"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    dumbbell: '<path d="M6.5 6.500v11M3.5 9v6M17.5 6.500v11M20.5 9v6M6.5 12h11"/>',
    apple: '<path d="M12 7c-2-1.5-6-1-7 3s1.5 10 4.5 10c1 0 1.5-.5 2.5-.5s1.5.5 2.5.500c3 0 5.5-6 4.5-10s-5-4.5-7-3z"/><path d="M12 7c0-2 1-3.5 3-4"/>',
    brain: '<path d="M12 4.500v15M12 6a3 3 0 0 0-5.5-1.500A3 3 0 0 0 4 9a3.5 3.5 0 0 0 .5 6A3.5 3.5 0 0 0 12 17M12 6a3 3 0 0 1 5.5-1.500A3 3 0 0 1 20 9a3.5 3.5 0 0 1-.5 6A3.5 3.5 0 0 1 12 17"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    coffee: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z"/><path d="M16 11h1.500a2.500 2.500 0 0 1 0 5H16M8 3v3M12 3v3"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 21a2 2 0 0 0 2 2h14v-4"/>',
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
  // Bar chart built from HTML columns (each column is a focusable button). Grouped by default, stacked with o.stacked.
  // o: { labels, series: [{ name, color, values }], fmt, h, label, max, ticks, active, onPick, stacked }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="ls-plot ls-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="ls-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="ls-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="ls-cols">${o.labels.map((l, i) => `<button class="ls-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="ls-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="ls-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="ls-tip num" hidden></span>
    </div>`;
    const tip = $('.ls-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `ls-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.ls-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.ls-cols', el).addEventListener('mouseleave', () => show(-1));
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
  paintIcons();
  const st = (o, c, a = 1) => `<stop offset="${o}" style="stop-color:var(${c});stop-opacity:${a}"/>`;

  // ---------------------------------------------------------------- artwork: sky, clouds, moon, stars
  $('[data-sky]').innerHTML = `<svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="ls-sky" x1="0" y1="0" x2="1" y2="1">${st(0, '--sky-1')}${st(0.55, '--sky-2')}${st(1, '--sky-3')}</linearGradient>
    <radialGradient id="ls-glow">${st(0, '--moon', 0.7)}${st(1, '--moon', 0)}</radialGradient></defs>
    <rect width="1200" height="260" fill="url(#ls-sky)"/>
    <circle cx="880" cy="92" r="120" fill="url(#ls-glow)"/>
    <path d="M880,42 a52,52 0 1 0 46,76 a42,42 0 1 1 -46,-76 Z" fill="var(--moon)"/>
    <g fill="var(--star)">${[[640, 40], [700, 120], [1010, 50], [1100, 140], [780, 30], [960, 190], [580, 100], [1140, 70]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${1.5 + (i % 3)}" opacity="${0.5 + (i % 2) * 0.4}"/>`).join('')}</g>
    <g fill="var(--cloud)" opacity="0.85"><path d="M600,260 c0,-40 40,-60 80,-48 c14,-40 80,-50 110,-12 c30,-28 96,-16 104,30 c40,-10 80,14 80,30 Z"/><path d="M940,260 c10,-36 60,-46 86,-24 c22,-34 90,-30 102,10 c30,-4 60,6 72,14 Z" opacity="0.7"/></g>
  </svg>`;

  // ---------------------------------------------------------------- sample data
  const STAGES = [{ id: 'wake', name: 'Awake', c: '--st-wake' }, { id: 'rem', name: 'REM', c: '--st-rem' }, { id: 'light', name: 'Light', c: '--st-light' }, { id: 'deep', name: 'Deep', c: '--st-deep' }];
  // each night: start (minutes after 9 pm), blocks [stage index, minutes]
  const mk = (seed, start, len) => { const b = []; let t = 0, k = 0; while (t < len) { const cyc = [[2, 22], [3, 28 - k * 5], [2, 16], [1, 14 + k * 6], [0, k % 2 ? 4 : 0]]; for (const [s, m] of cyc) { const mm = Math.max(0, Math.round(m + ((seed * (k + 3) * 7) % 9) - 4)); if (mm && t < len) { b.push([s, Math.min(mm, len - t)]); t += mm; } } k++; } return { start, blocks: b }; };
  const NIGHTS = [mk(3, 105, 402), mk(5, 90, 432), mk(2, 150, 356), mk(7, 120, 388), mk(4, 80, 470), mk(6, 140, 362), mk(1, 100, 444)];
  const HABITS = [{ id: 'caf', name: 'Late coffee', icon: 'coffee', eff: -9, note: 'Caffeine after 3 pm usually costs you about 20 minutes of deep sleep.' }, { id: 'ex', name: 'Evening run', icon: 'dumbbell', eff: 4, note: 'Exercise before 7 pm tends to lengthen your deep sleep a little.' }, { id: 'read', name: 'Read in bed', icon: 'book', eff: 3, note: 'Reading on paper, not a screen, helped you fall asleep faster.' }, { id: 'meal', name: 'Late meal', icon: 'apple', eff: -6, note: 'Eating within two hours of bed raised your heart rate overnight.' }, { id: 'stress', name: 'Stressful day', icon: 'brain', eff: -5, note: 'High-stress days show more short wake-ups in the first half of the night.' }];
  const logged = NIGHTS.map((_, i) => new Set([['ex', 'read'], ['read'], ['caf', 'stress'], ['meal'], ['ex', 'read'], ['caf', 'meal'], ['read', 'ex']][i]));
  let night = NIGHTS.length - 1, hl = '';
  const sum = (n, s) => n.blocks.reduce((a, [k, m]) => a + (k === s ? m : 0), 0), total = (n) => n.blocks.reduce((a, b) => a + b[1], 0);
  const asleep = (n) => total(n) - sum(n, 0), hm = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
  const clock = (m) => { const t = (21 * 60 + m) % 1440, h = Math.floor(t / 60); return `${h % 12 || 12}:${String(t % 60).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };
  const score = (i) => { const n = NIGHTS[i]; return Math.max(30, Math.min(99, Math.round(34 + asleep(n) / 14 + sum(n, 3) / 7 - sum(n, 0) / 2 + [...logged[i]].reduce((a, h) => a + HABITS.find((x) => x.id === h).eff, 0)))); };
  const ROOM = [{ icon: 'thermo', name: 'Temperature', sub: 'Ideal is 16–19 °C', v: ['18.2 °C', '18.6 °C', '20.4 °C', '19.1 °C', '17.8 °C', '20.9 °C', '18.0 °C'] }, { icon: 'drop', name: 'Humidity', sub: 'Ideal is 40–60%', v: ['48%', '51%', '44%', '55%', '50%', '39%', '47%'] }, { icon: 'speaker', name: 'Noise', sub: 'Loudest moment', v: ['38 dB', '41 dB', '52 dB', '36 dB', '34 dB', '49 dB', '35 dB'] }, { icon: 'sun', name: 'Light', sub: 'Before you fell asleep', v: ['Dark', 'Dark', 'Dim', 'Dark', 'Dark', 'Dim', 'Dark'] }];

  // ---------------------------------------------------------------- renderers
  function render() {
    const n = NIGHTS[night], s = score(night), date = dayOffset(night - NIGHTS.length), word = s >= 85 ? 'restful' : s >= 70 ? 'solid' : s >= 55 ? 'light' : 'restless';
    $('[data-date]').textContent = `Night of ${fmtDate(date, { weekday: 'long', month: 'long', day: 'numeric' })}`;
    $('[data-headline]').innerHTML = `A ${word} night, <em>${hm(asleep(n)).replace(' h ', ' hours ')} minutes asleep</em>`;
    $('[data-chips]').innerHTML = `<span>In bed ${clock(n.start)}</span><span>Up ${clock(n.start + total(n))}</span><span>${n.blocks.filter((b) => b[0] === 0).length} wake-ups</span>`;
    $('[data-score]').innerHTML = `<div role="img" aria-label="Sleep score ${s} out of 100">${arcGauge(s / 100, { size: 180, w: 10, from: -140, to: 140, color: '--accent' })}</div><p><b class="num">${s}</b>Sleep score</p>`;
    // timeline
    const T = total(n); let t = 0;
    const segs = n.blocks.map(([k, m]) => { const el = `<span class="ls-seg${STAGES[k].id === hl ? ' hl' : ''}" style="left:${((t / T) * 100).toFixed(2)}%;width:calc(${((m / T) * 100).toFixed(2)}% - 2px);top:${k * 34}px;--c:var(${STAGES[k].c})"></span>`; t += m; return el; }).join('');
    const box = $('[data-hyp]'); hl ? box.setAttribute('data-hl', hl) : box.removeAttribute('data-hl');
    box.innerHTML = `<div class="ls-rows" aria-hidden="true">${STAGES.map((x) => `<span>${x.name}</span>`).join('')}</div><div class="ls-track" role="img" aria-label="Sleep stages from ${clock(n.start)} to ${clock(n.start + T)}: ${STAGES.map((x, k) => `${x.name} ${sum(n, k)} minutes`).join(', ')}">${segs}</div><div class="ls-times num">${[0, 0.25, 0.5, 0.75, 1].map((f) => `<span>${clock(n.start + Math.round(T * f))}</span>`).join('')}</div>`;
    // split
    $('[data-split]').innerHTML = `<div class="ls-donut">${donut(STAGES.map((x, k) => ({ value: sum(n, k) || 0.01, color: x.c })), { size: 190, w: 22, gap: 1.2 })}<p><span><b class="num">${Math.round((sum(n, 3) / T) * 100)}%</b><br>deep sleep</span></p></div>
      <ul class="ls-sl">${STAGES.map((x, k) => `<li><i style="--c:var(${x.c})"></i>${x.name}<b class="num">${hm(sum(n, k)).replace(/^0 h /, '')}${sum(n, k) < 60 ? ' min' : ''}</b><small class="num">${Math.round((sum(n, k) / T) * 100)}%</small></li>`).join('')}</ul>`;
    // stats
    const eff = Math.round((asleep(n) / T) * 100), lat = 6 + ((night * 5) % 17), hr = 52 + ((night * 3) % 9);
    $('[data-stats]').innerHTML = [['Time asleep', hm(asleep(n)), ''], ['Efficiency', eff, '%'], ['Fell asleep in', lat, 'min'], ['Lowest heart rate', hr, 'bpm']].map(([l, v, u]) => `<div><dt>${l}</dt><dd class="num">${v}<small>${u}</small></dd></div>`).join('');
    // week
    barChart($('[data-week]'), { labels: NIGHTS.map((_, i) => fmtDate(dayOffset(i - NIGHTS.length), { weekday: 'short' })), series: [{ name: 'Asleep', color: '--chart-1', values: NIGHTS.map((x) => +(asleep(x) / 60).toFixed(1)) }], fmt: (v) => v + ' h', h: 150, ticks: 3, max: 9, active: night, onPick: (i) => { night = i; render(); $$('[data-week] .ls-col')[i].focus(); }, label: 'Hours asleep for each of the last seven nights' });
    // habits
    $('[data-habits]').innerHTML = HABITS.map((h) => `<li><button data-habit="${h.id}" aria-pressed="${logged[night].has(h.id)}">${svg(h.icon)}${h.name}</button></li>`).join('');
    const on = HABITS.filter((h) => logged[night].has(h.id));
    $('[data-habit-note]').textContent = on.length ? on.sort((a, b) => Math.abs(b.eff) - Math.abs(a.eff))[0].note : 'Nothing logged for this night. Tap a tag to log it and see how it changes your score.';
    $('[data-room]').innerHTML = ROOM.map((r) => `<li><span>${svg(r.icon)}</span><span>${r.name}<small>${r.sub}</small></span><b class="num">${r.v[night]}</b></li>`).join('');
  }
  function renderLegend() { $('[data-legend]').innerHTML = STAGES.map((x) => `<button data-stage="${x.id}" style="--c:var(${x.c})" aria-pressed="${x.id === hl}">${x.name}</button>`).join(''); }

  // ---------------------------------------------------------------- events
  $('[data-legend]').addEventListener('click', (e) => { const b = e.target.closest('[data-stage]'); if (!b) return; hl = hl === b.dataset.stage ? '' : b.dataset.stage; renderLegend(); render(); });
  $('[data-habits]').addEventListener('click', (e) => { const b = e.target.closest('[data-habit]'); if (!b) return; const set = logged[night], id = b.dataset.habit; set.has(id) ? set.delete(id) : set.add(id); render(); $(`[data-habit="${id}"]`).focus(); });
  renderLegend(); render();
/* === DB multipage bootstrap (generated; polish pass replaces stubs) === */
  (function wirePages() {
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"vitals","name":"Vitals","pattern":"Report"},{"id":"appointments","name":"Appointments","pattern":"Calendar"},{"id":"records","name":"Records","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
