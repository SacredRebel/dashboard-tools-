/* Vitalis Care: sample data, heart artwork, doctor directory, booking and records.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    heartPulse: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/><path d="M3.5 12h5l1.5-3 3 6 1.5-3h6"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    phone: '<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    file: '<path d="M6 2.500h8l5 5V21a.5.5 0 0 1-.5.500h-12.500A.5.5 0 0 1 5.5 21V3a.5.5 0 0 1 .5-.5z"/><path d="M14 2.500V8h5M9 13h6M9 17h6"/>',
    stethoscope: '<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a4.5 4.5 0 0 0 9 0v-2"/><circle cx="19" cy="12" r="2"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    chevRight: '<path d="m9 6 6 6-6 6"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `vc-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="vc-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="vc-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="vc-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="vc-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="vc-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="vc-cursor" hidden></span><span class="vc-tip num" hidden></span>
    </div>`;
    const tip = $('.vc-tip', el), cur = $('.vc-cursor', el), dots = $$('.vc-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `vc-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.vc-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.vc-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  // Bar chart built from HTML columns (each column is a focusable button). Grouped by default, stacked with o.stacked.
  // o: { labels, series: [{ name, color, values }], fmt, h, label, max, ticks, active, onPick, stacked }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="vc-plot vc-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="vc-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="vc-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="vc-cols">${o.labels.map((l, i) => `<button class="vc-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="vc-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="vc-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="vc-tip num" hidden></span>
    </div>`;
    const tip = $('.vc-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `vc-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.vc-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.vc-cols', el).addEventListener('mouseleave', () => show(-1));
  }
  paintIcons();
  const st = (o, c) => `<stop offset="${o}" style="stop-color:var(${c})"/>`;
  $('[data-heart]').innerHTML = `<svg viewBox="0 0 64 60"><defs><linearGradient id="vc-h" x1="0" y1="0" x2="1" y2="1">${st(0, '--heart-1')}${st(1, '--heart-2')}</linearGradient></defs><path d="M32,56 C10,42 2,30 4,18 C6,6 22,2 32,14 C42,2 58,6 60,18 C62,30 54,42 32,56 Z" fill="url(#vc-h)"/><path d="M14,18 C16,12 22,10 26,12" fill="none" stroke="var(--surface)" stroke-opacity="0.7" stroke-width="3" stroke-linecap="round"/></svg>`;
  const ecg = Array.from({ length: 48 }, (_, i) => [50, 50, 52, 46, 50, 90, 10, 58, 50, 54, 50, 50][i % 12]);
  lineChart($('[data-ecg]'), { labels: ecg.map((_, i) => i), series: [{ name: 'Pulse', color: '--coral', values: ecg }], h: 64, ticks: 2, min: 0, max: 100, curve: false, fmt: (v) => v, label: 'Pulse trace' });

  const SPECS = ['All', 'Family', 'Cardiology', 'Dermatology', 'Eye care'];
  const DOCS = [{ id: 'aw', name: 'Dr. Amara Whitlock', spec: 'Family', ini: 'AW', r: 4.9, n: 312, yrs: 14 }, { id: 'kd', name: 'Dr. Kenji Dahl', spec: 'Cardiology', ini: 'KD', r: 4.8, n: 204, yrs: 11 }, { id: 'so', name: 'Dr. Sofia Oyelaran', spec: 'Dermatology', ini: 'SO', r: 4.7, n: 188, yrs: 8 }, { id: 'tm', name: 'Dr. Tomas Merino', spec: 'Eye care', ini: 'TM', r: 4.9, n: 141, yrs: 17 }, { id: 'lh', name: 'Dr. Lena Hart', spec: 'Family', ini: 'LH', r: 4.6, n: 97, yrs: 5 }];
  const TIMES = ['9:00 am', '10:00 am', '11:00 am', '2:00 pm', '3:00 pm', '4:30 pm'];
  const RECS = [{ icon: 'file', name: 'Prescription', d: 12 }, { icon: 'activity', name: 'Blood test results', d: 4, isNew: true }, { icon: 'eye', name: 'Eye exam', d: 41 }, { icon: 'shield', name: 'Vaccinations', d: 96 }, { icon: 'stethoscope', name: 'Annual check-up', d: 150 }];
  const ACT = { steps: [6420, 8810, 5230, 9940, 7300, 11850, 4120], sleep: [6.8, 7.2, 6.1, 7.6, 6.9, 8.1, 7.4] };
  const days = (() => { const out = []; let k = 1; while (out.length < 5) { const d = dayOffset(k++); if (d.getDay() !== 0 && d.getDay() !== 6) out.push(d); } return out; })();
  let spec = 'All', doc = 'aw', day = 0, time = '', measure = 'steps';
  const next = { doc: 'kd', date: dayOffset(6), time: '10:00 am' };
  const D = (id) => DOCS.find((d) => d.id === id), taken = (di, ti) => (di * 5 + ti * 7 + doc.charCodeAt(0)) % 4 === 0;

  function renderNext() { const d = D(next.doc); $('[data-next]').innerHTML = `<div class="vc-nextbody"><i>${d.ini}</i><span><b>${d.name}</b><small>${d.spec}</small></span></div><div class="vc-when"><span>${fmtDate(next.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span><span>${next.time}</span><span>Room 4</span></div>`; }
  function renderDocs() {
    const q = $('[data-q]').value.trim().toLowerCase(), list = DOCS.filter((d) => (spec === 'All' || d.spec === spec) && (!q || (d.name + d.spec).toLowerCase().includes(q)));
    $('[data-specs]').innerHTML = SPECS.map((s) => `<button data-v="${s}" aria-pressed="${s === spec}">${s}</button>`).join('');
    $('[data-docs]').innerHTML = list.length ? list.map((d) => `<li class="vc-doc${d.id === doc ? ' on' : ''}"><i>${d.ini}</i><span><b>${d.name}</b><small>${d.spec} · <span class="star">★</span> ${d.r} (${d.n} reviews) · ${d.yrs} yrs</small></span><span class="vc-docact"><a href="tel:555-01${String(40 + DOCS.indexOf(d)).padStart(2, '0')}" aria-label="Call ${d.name}">${svg('phone')}</a><button data-doc="${d.id}" aria-pressed="${d.id === doc}">${d.id === doc ? 'Selected' : 'Book'}</button></span></li>`).join('') : `<li class="vc-none">No doctors match “${q}”. Try a speciality instead.</li>`;
  }
  function renderBook() {
    const d = D(doc); $('[data-book-doc]').textContent = d.name.replace('Dr. ', 'Dr ');
    $('[data-days]').innerHTML = days.map((x, i) => `<button data-day="${i}" aria-pressed="${i === day}" aria-label="${fmtDate(x, { weekday: 'long', month: 'long', day: 'numeric' })}"><span>${fmtDate(x, { weekday: 'short' })}</span><b class="num">${x.getDate()}</b></button>`).join('');
    $('[data-times]').innerHTML = TIMES.map((t, i) => `<button data-time="${t}" aria-pressed="${t === time}"${taken(day, i) ? ` disabled aria-label="${t}, taken"` : ''}>${t}</button>`).join('');
    $('[data-summary]').innerHTML = [['Doctor', d.name], ['Speciality', d.spec], ['When', time ? `${fmtDate(days[day], { weekday: 'short', day: 'numeric', month: 'short' })}, ${time}` : 'Pick a time']].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    $('[data-confirm]').disabled = !time;
  }
  function renderAct() {
    const v = ACT[measure], lab = Array.from({ length: 7 }, (_, i) => fmtDate(dayOffset(i - 6), { weekday: 'short' }));
    barChart($('[data-act]'), { labels: lab, series: [{ name: measure === 'steps' ? 'Steps' : 'Sleep', color: '--chart-1', values: v }], fmt: measure === 'steps' ? (x) => fmtNum(x) : (x) => x + ' h', h: 130, ticks: 3, active: 5, label: measure === 'steps' ? 'Steps per day this week' : 'Hours slept per night this week' });
  }
  function renderRecs() { $('[data-recs]').innerHTML = RECS.map((r) => `<li><button><span>${svg(r.icon)}</span><span>${r.name}<small>Updated ${fmtDate(dayOffset(-r.d), { month: 'short', day: 'numeric' })}</small></span>${r.isNew ? '<span class="new">New</span>' : svg('chevRight')}</button></li>`).join(''); }

  // ---------------------------------------------------------------- events
  const h = new Date().getHours(); $('[data-greet]').textContent = `${h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}, Priya`;
  seg($('[data-specs]'), (v) => { spec = v; renderDocs(); $(`[data-specs] [data-v="${v}"]`).focus(); });
  seg($('[data-measure]'), (v) => { measure = v; renderAct(); });
  $('[data-q]').addEventListener('input', renderDocs);
  $('[data-docs]').addEventListener('click', (e) => { const b = e.target.closest('[data-doc]'); if (!b) return; doc = b.dataset.doc; time = ''; renderDocs(); renderBook(); $('[data-days] button').focus(); });
  $('[data-days]').addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (!b) return; day = +b.dataset.day; time = ''; renderBook(); $(`[data-day="${day}"]`).focus(); });
  $('[data-times]').addEventListener('click', (e) => { const b = e.target.closest('[data-time]'); if (!b) return; time = b.dataset.time; renderBook(); $(`[data-time="${time}"]`).focus(); $('[data-msg]').textContent = ''; });
  $('[data-confirm]').addEventListener('click', () => { Object.assign(next, { doc, date: days[day], time }); renderNext(); $('[data-msg]').textContent = `Booked with ${D(doc).name}, ${fmtDate(days[day], { weekday: 'long' })} at ${time}.`; time = ''; renderBook(); });
  $('[data-add]').addEventListener('click', () => { RECS.unshift({ icon: 'file', name: 'New upload', d: 0, isNew: true }); renderRecs(); $('[data-recs] button').focus(); });
  renderNext(); renderDocs(); renderBook(); renderAct(); renderRecs();
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
