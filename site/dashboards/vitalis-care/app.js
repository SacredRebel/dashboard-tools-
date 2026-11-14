/* Vitalis Care: clay doctor/heart, booking, multipage + motion. Sample data only. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = $('[data-db-app]') || document.body;
  const ICON = {
    heartPulse: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/><path d="M3.5 12h5l1.5-3 3 6 1.5-3h6"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    file: '<path d="M6 2.5h8l5 5V21a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5z"/><path d="M14 2.5V8h5M9 13h6M9 17h6"/>',
    stethoscope: '<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a4.5 4.5 0 0 0 9 0v-2"/><circle cx="19" cy="12" r="2"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    chevRight: '<path d="m9 6 6 6-6 6"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/>',
    pill: '<path d="m10.5 10.5 3 3M7 14a4.5 4.5 0 0 0 6.4 6.4l3.5-3.5a4.5 4.5 0 0 0-6.4-6.4z"/><path d="M14 7a4.5 4.5 0 0 0-6.4-6.4L4.1 4.1a4.5 4.5 0 0 0 6.4 6.4z"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17h.01"/>',
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
  function smooth(pts) {
    let p = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      p += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return p;
  }
  let chartId = 0;

  function lineChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length, W = 600, H = 200;
    const { min, max, ticks } = scale(o.series.flatMap((s) => s.values), o);
    const x = (i) => (n > 1 ? (i / (n - 1)) * W : W / 2), y = (v) => H - ((v - min) / (max - min)) * H;
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `vc-g${++chartId}`;
    const sets = o.series.map((s) => {
      const pts = s.values.map((v, i) => [x(i), y(v)]);
      return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) };
    });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="vc-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="vc-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line vc-draw" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="vc-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="vc-hit">${o.labels.map((l, i) => `<button type="button" aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="vc-cursor" hidden></span><span class="vc-tip num" hidden></span>
    </div>`;
    const tip = $('.vc-tip', el), cur = $('.vc-cursor', el);
    const show = (i) => {
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `vc-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%';
      tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.vc-hit button', el).forEach((b, i) => {
      b.addEventListener('mouseenter', () => show(i));
      b.addEventListener('focus', () => show(i));
      b.addEventListener('blur', () => show(-1));
    });
    $('.vc-hit', el).addEventListener('mouseleave', () => show(-1));
  }

  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => Math.max(...o.series.map((s) => s.values[i])));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="vc-plot vc-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="vc-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="vc-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="vc-cols">${o.labels.map((l, i) => `<button type="button" class="vc-col${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => fmt(s.values[i])).join(', ')}">${o.series.map((s) => `<span class="vc-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="vc-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="vc-tip num" hidden></span>
    </div>`;
    const tip = $('.vc-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `vc-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%';
      tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.vc-col', el).forEach((b, i) => {
      b.addEventListener('mouseenter', () => show(i));
      b.addEventListener('focus', () => show(i));
      b.addEventListener('blur', () => show(-1));
    });
    $('.vc-cols', el).addEventListener('mouseleave', () => show(-1));
    if (!reduce) {
      $$('.vc-bar', el).forEach((b, i) => {
        b.style.transform = 'scaleY(0)';
        requestAnimationFrame(() => {
          b.style.transition = `transform 380ms cubic-bezier(0.16,1,0.3,1) ${i * 30}ms`;
          b.style.transform = 'scaleY(1)';
        });
      });
    }
  }

  function donut(parts, { size = 160, w = 16, gap = 2 } = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0), r = (size - w) / 2, c = size / 2; let off = 0;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="${w}"/>${parts.map((p) => {
      const len = (p.value / total) * 100;
      const seg = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}" pathLength="100" stroke-dasharray="${Math.max(0.01, len - gap).toFixed(2)} ${(100 - len + gap).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})" style="stroke:var(${p.color})" stroke-linecap="round"/>`;
      off += len; return seg;
    }).join('')}</svg>`;
  }

  function countUp(el, to, { duration = 700, format = (n) => String(Math.round(n)) } = {}) {
    if (reduce) { el.textContent = format(to); return; }
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = format((1 - Math.pow(1 - t, 3)) * to);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function toast(msg) {
    const t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(() => { t.hidden = true; }, 2200);
  }

  paintIcons();

  // Floating medical props (code-drawn stand-ins for reference collage objects)
  const PROP = {
    steth: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M18 8v18a14 14 0 0 0 28 0V8" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/><circle cx="18" cy="8" r="5" fill="var(--coral)"/><circle cx="46" cy="8" r="5" fill="var(--coral)"/><path d="M46 40c0 8 6 12 12 12" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round"/><circle cx="58" cy="52" r="5" fill="var(--chart-1)"/></svg>`,
    pills: `<svg viewBox="0 0 56 56" aria-hidden="true"><rect x="6" y="22" width="28" height="14" rx="7" fill="var(--coral)" transform="rotate(-28 20 29)"/><rect x="20" y="22" width="28" height="14" rx="7" fill="var(--accent)" transform="rotate(18 34 29)"/><circle cx="40" cy="14" r="6" fill="var(--chart-1)" opacity="0.85"/></svg>`,
    thermo: `<svg viewBox="0 0 40 72" aria-hidden="true"><rect x="15" y="4" width="10" height="44" rx="5" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"/><rect x="18" y="18" width="4" height="28" rx="2" fill="var(--coral)"/><circle cx="20" cy="58" r="11" fill="var(--coral)"/><circle cx="20" cy="58" r="6" fill="#fff" opacity="0.35"/></svg>`,
    kit: `<svg viewBox="0 0 64 52" aria-hidden="true"><rect x="4" y="14" width="56" height="34" rx="8" fill="var(--accent)"/><rect x="20" y="6" width="24" height="12" rx="4" fill="var(--coat-deep)"/><rect x="26" y="24" width="12" height="4" rx="2" fill="#fff"/><rect x="30" y="20" width="4" height="12" rx="2" fill="#fff"/></svg>`,
  };
  $$('[data-prop]').forEach((el) => { el.innerHTML = PROP[el.dataset.prop] || ''; });

  const ecg = Array.from({ length: 48 }, (_, i) => [50, 50, 52, 46, 50, 90, 10, 58, 50, 54, 50, 50][i % 12]);
  lineChart($('[data-ecg]'), {
    labels: ecg.map((_, i) => i),
    series: [{ name: 'Pulse', color: '--coral', values: ecg, fill: 0 }],
    h: 64, ticks: 2, min: 0, max: 100, curve: false, fmt: (v) => v, label: 'Pulse trace',
  });
  if (!reduce) {
    $$('.vc-draw').forEach((path) => {
      try {
        const len = path.getTotalLength();
        path.style.strokeDasharray = String(len);
        path.style.strokeDashoffset = String(len);
        path.getBoundingClientRect();
        path.style.transition = 'stroke-dashoffset 800ms cubic-bezier(0.16,1,0.3,1)';
        path.style.strokeDashoffset = '0';
      } catch (_) { /* ignore */ }
    });
  }

  const SPECS = ['All', 'Family', 'Cardiology', 'Dermatology', 'Eye care'];
  const DOCS = [
    { id: 'aw', name: 'Dr. Amara Whitlock', spec: 'Family', ini: 'AW', r: 4.9, n: 312, yrs: 14 },
    { id: 'kd', name: 'Dr. Kenji Dahl', spec: 'Cardiology', ini: 'KD', r: 4.8, n: 204, yrs: 11 },
    { id: 'so', name: 'Dr. Sofia Oyelaran', spec: 'Dermatology', ini: 'SO', r: 4.7, n: 188, yrs: 8 },
    { id: 'tm', name: 'Dr. Tomas Merino', spec: 'Eye care', ini: 'TM', r: 4.9, n: 141, yrs: 17 },
    { id: 'lh', name: 'Dr. Lena Hart', spec: 'Family', ini: 'LH', r: 4.6, n: 97, yrs: 5 },
  ];
  const TIMES = ['9:00 am', '10:00 am', '11:00 am', '2:00 pm', '3:00 pm', '4:30 pm'];
  const RECS = [
    { icon: 'file', name: 'Prescription', d: 12 },
    { icon: 'activity', name: 'Blood test results', d: 4, isNew: true },
    { icon: 'eye', name: 'Eye exam', d: 41 },
    { icon: 'shield', name: 'Vaccinations', d: 96 },
    { icon: 'stethoscope', name: 'Annual check-up', d: 150 },
  ];
  const ACT = { steps: [6420, 8810, 5230, 9940, 7300, 11850, 4120], sleep: [6.8, 7.2, 6.1, 7.6, 6.9, 8.1, 7.4] };
  const QUICK = [
    { id: 'lab', name: 'Lab test', icon: 'flask' },
    { id: 'meds', name: 'Medicines', icon: 'pill' },
    { id: 'reports', name: 'Reports', icon: 'file' },
    { id: 'er', name: 'Emergency', icon: 'alert' },
  ];
  const days = (() => {
    const out = []; let k = 1;
    while (out.length < 5) { const d = dayOffset(k++); if (d.getDay() !== 0 && d.getDay() !== 6) out.push(d); }
    return out;
  })();
  let spec = 'All', doc = 'aw', day = 0, time = '', measure = 'steps';
  const next = { doc: 'kd', date: dayOffset(6), time: '10:00 am' };
  const D = (id) => DOCS.find((d) => d.id === id);
  const taken = (di, ti) => (di * 5 + ti * 7 + doc.charCodeAt(0)) % 4 === 0;
  const seenPages = new Set();

  function renderQuick() {
    $('[data-quick]').innerHTML = QUICK.map((q) =>
      `<button type="button" class="vc-qbtn" data-quick-id="${q.id}"><span>${svg(q.icon)}</span>${q.name}</button>`
    ).join('');
  }
  function renderNext() {
    const d = D(next.doc);
    $('[data-next]').innerHTML = `<div class="vc-nextbody"><i>${d.ini}</i><span><b>${d.name}</b><small>${d.spec}</small></span></div><div class="vc-when"><span>${fmtDate(next.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span><span>${next.time}</span><span>Room 4</span></div>`;
  }
  function renderDocs() {
    const q = $('[data-q]').value.trim().toLowerCase();
    const list = DOCS.filter((d) => (spec === 'All' || d.spec === spec) && (!q || (d.name + d.spec).toLowerCase().includes(q)));
    $('[data-specs]').innerHTML = SPECS.map((s) => `<button type="button" data-v="${s}" aria-pressed="${s === spec}">${s}</button>`).join('');
    $('[data-docs]').innerHTML = list.length
      ? list.map((d) => `<li class="vc-doc${d.id === doc ? ' on' : ''}"><i>${d.ini}</i><span><b>${d.name}</b><small>${d.spec} · <span class="star">★</span> ${d.r} (${d.n} reviews) · ${d.yrs} yrs</small></span><span class="vc-docact"><a href="tel:555-01${String(40 + DOCS.indexOf(d)).padStart(2, '0')}" aria-label="Call ${d.name}">${svg('phone')}</a><button type="button" data-doc="${d.id}" aria-pressed="${d.id === doc}">${d.id === doc ? 'Selected' : 'Book'}</button></span></li>`).join('')
      : `<li class="vc-none">No doctors match “${q}”. Try a speciality instead.</li>`;
  }
  function renderBook() {
    const d = D(doc);
    $('[data-book-doc]').textContent = d.name.replace('Dr. ', 'Dr ');
    $('[data-days]').innerHTML = days.map((x, i) =>
      `<button type="button" data-day="${i}" aria-pressed="${i === day}" aria-label="${fmtDate(x, { weekday: 'long', month: 'long', day: 'numeric' })}"><span>${fmtDate(x, { weekday: 'short' })}</span><b class="num">${x.getDate()}</b></button>`
    ).join('');
    $('[data-times]').innerHTML = TIMES.map((t, i) =>
      `<button type="button" data-time="${t}" aria-pressed="${t === time}"${taken(day, i) ? ` disabled aria-label="${t}, taken"` : ''}>${t}</button>`
    ).join('');
    $('[data-summary]').innerHTML = [['Doctor', d.name], ['Speciality', d.spec], ['When', time ? `${fmtDate(days[day], { weekday: 'short', day: 'numeric', month: 'short' })}, ${time}` : 'Pick a time']]
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    $('[data-confirm]').disabled = !time;
  }
  function renderAct() {
    const v = ACT[measure];
    const lab = Array.from({ length: 7 }, (_, i) => fmtDate(dayOffset(i - 6), { weekday: 'short' }));
    barChart($('[data-act]'), {
      labels: lab,
      series: [{ name: measure === 'steps' ? 'Steps' : 'Sleep', color: '--chart-1', values: v }],
      fmt: measure === 'steps' ? (x) => fmtNum(x) : (x) => x + ' h',
      h: 130, ticks: 3, active: 5,
      label: measure === 'steps' ? 'Steps per day this week' : 'Hours slept per night this week',
    });
  }
  function renderRecs() {
    $('[data-recs]').innerHTML = RECS.map((r) =>
      `<li><button type="button"><span>${svg(r.icon)}</span><span>${r.name}<small>Updated ${fmtDate(dayOffset(-r.d), { month: 'short', day: 'numeric' })}</small></span>${r.isNew ? '<span class="new">New</span>' : svg('chevRight')}</button></li>`
    ).join('');
  }

  const h = new Date().getHours();
  $('[data-greet]').textContent = `${h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}, Priya`;

  seg($('[data-specs]'), (v) => { spec = v; renderDocs(); $(`[data-specs] [data-v="${v}"]`)?.focus(); });
  seg($('[data-measure]'), (v) => { measure = v; renderAct(); });
  const syncSearch = (from) => {
    const hero = $('[data-hero-q]');
    const q = $('[data-q]');
    if (!hero || !q) return;
    if (from === 'hero') q.value = hero.value;
    else hero.value = q.value;
    renderDocs();
  };
  $('[data-q]').addEventListener('input', () => syncSearch('docs'));
  $('[data-hero-q]')?.addEventListener('input', () => syncSearch('hero'));
  $('[data-docs]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-doc]'); if (!b) return;
    doc = b.dataset.doc; time = ''; renderDocs(); renderBook(); $('[data-days] button')?.focus();
  });
  $('[data-days]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]'); if (!b) return;
    day = +b.dataset.day; time = ''; renderBook(); $(`[data-day="${day}"]`)?.focus();
  });
  $('[data-times]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-time]'); if (!b) return;
    time = b.dataset.time; renderBook(); $(`[data-time="${time}"]`)?.focus(); $('[data-msg]').textContent = '';
  });
  $('[data-confirm]').addEventListener('click', () => {
    Object.assign(next, { doc, date: days[day], time });
    renderNext();
    $('[data-msg]').textContent = `Booked with ${D(doc).name}, ${fmtDate(days[day], { weekday: 'long' })} at ${time}.`;
    toast('Appointment confirmed (sample)');
    time = ''; renderBook();
  });
  $('[data-add]').addEventListener('click', () => {
    RECS.unshift({ icon: 'file', name: 'New upload', d: 0, isNew: true });
    renderRecs();
    $('[data-recs] button')?.focus();
    toast('Record added (sample)');
  });
  $('[data-quick]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-quick-id]'); if (!b) return;
    const map = { lab: 'vitals', meds: 'records', reports: 'records', er: 'appointments' };
    location.hash = '#/' + (map[b.dataset.quickId] || 'overview');
    toast(`${b.textContent.trim()} · sample`);
  });
  $('[data-notify]')?.addEventListener('click', () => toast('2 kit sync notes · sample'));

  renderQuick(); renderNext(); renderDocs(); renderBook(); renderAct(); renderRecs();

  function staggerReveal() {
    if (reduce) return;
    $$('.vc-reveal').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      setTimeout(() => {
        el.style.transition = 'opacity 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)';
        el.style.opacity = '1';
        el.style.transform = 'none';
      }, 40 * i);
    });
  }
  function animateCounts() {
    const bpm = $('[data-bpm]'); if (bpm) countUp(bpm, 72);
    const sugar = $('[data-sugar]'); if (sugar) countUp(sugar, 96);
  }

  // multipage
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
  function ensureStub() {
    if (stub) return stub;
    stub = document.createElement('div');
    stub.setAttribute('data-db-stub-host-legacy', '');
    stub.hidden = true;
    main.appendChild(stub);
    return stub;
  }

  function pageHtml(page) {
    if (page.id === 'vitals') {
      return `<section class="vc-page" data-db-page="vitals" aria-labelledby="p-h">
        <h1 id="p-h">Vitals</h1>
        <p class="vc-page-lead">Home-kit readings for today. Sample data · fictional.</p>
        <div class="vc-seg" role="group" aria-label="Vital focus" data-vital-tabs>
          <button type="button" data-v="overview" aria-pressed="true">Overview</button>
          <button type="button" data-v="heart" aria-pressed="false">Heart</button>
          <button type="button" data-v="activity" aria-pressed="false">Activity</button>
          <button type="button" data-v="sleep" aria-pressed="false">Sleep</button>
        </div>
        <div class="vc-donut-wrap" data-vital-donut></div>
        <div class="vc-page-grid" data-vital-grid></div>
        <button type="button" class="vc-btn ghost" data-vital-refresh>Sync kit</button>
        <div data-vital-body></div>
      </section>`;
    }
    if (page.id === 'appointments') {
      return `<section class="vc-page" data-db-page="appointments" aria-labelledby="p-h">
        <h1 id="p-h">Appointments</h1>
        <p class="vc-page-lead">Upcoming visits across the clinic.</p>
        <div class="vc-seg" role="group" aria-label="Appointment filter" data-appt-tabs>
          <button type="button" data-v="upcoming" aria-pressed="true">Upcoming</button>
          <button type="button" data-v="past" aria-pressed="false">Past</button>
        </div>
        <div class="vc-page-grid" data-appt-list></div>
      </section>`;
    }
    if (page.id === 'records') {
      return `<section class="vc-page" data-db-page="records" aria-labelledby="p-h">
        <h1 id="p-h">Records</h1>
        <p class="vc-page-lead">Prescriptions, labs and exams.</p>
        <label class="vc-field">Search records<input data-rec-q type="search" placeholder="Filter by name"></label>
        <div class="vc-page-grid" data-rec-list></div>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="vc-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="vc-page-lead">Kit sync preferences. Nothing is saved in this demo.</p>
        <form class="vc-page-card" data-settings onsubmit="return false">
          <label class="vc-field">Reminder channel
            <select name="channel"><option value="">Select…</option><option>Email</option><option>SMS</option><option>Push</option></select>
          </label>
          <label class="vc-field">Morning sync hour
            <input name="hour" type="number" min="5" max="11" value="7">
          </label>
          <p class="vc-error" data-form-err hidden>Choose a reminder channel.</p>
          <button type="submit" class="vc-btn">Save prefs</button>
        </form>
      </section>`;
    }
    return `<section class="vc-page"><h1>${page.name}</h1><p class="vc-page-lead">Sample data · fictional</p></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'vitals') {
      const donutEl = host.querySelector('[data-vital-donut]');
      const grid = host.querySelector('[data-vital-grid]');
      const paint = (tab = 'overview') => {
        const bpm = tab === 'heart' ? 72 : tab === 'activity' ? 8840 : tab === 'sleep' ? 7.2 : 72;
        const label = tab === 'heart' ? 'bpm' : tab === 'activity' ? 'steps' : tab === 'sleep' ? 'hrs' : 'bpm';
        const center = tab === 'heart' || tab === 'overview'
          ? `<img class="vc-donut-heart" src="media/heart.webp" width="72" height="72" alt="" decoding="async"><b class="num">${typeof bpm === 'number' && bpm > 100 ? fmtNum(bpm) : bpm}<small>${label} · Normal</small></b>`
          : `<b class="num">${typeof bpm === 'number' && bpm > 100 ? fmtNum(bpm) : bpm}<small>${label} · Normal</small></b>`;
        donutEl.innerHTML = `${donut([
          { value: 72, color: '--coral' },
          { value: 18, color: '--chart-1' },
          { value: 10, color: '--accent-soft' },
        ])}${center}`;
        const cards = tab === 'activity'
          ? [['Steps', '8,840'], ['Calories', '412'], ['Active min', '48']]
          : tab === 'sleep'
            ? [['Asleep', '7.2 h'], ['Deep', '1.8 h'], ['REM', '1.4 h']]
            : [['Heart rate', '72 bpm'], ['Blood pressure', '118/78'], ['Blood sugar', '96 mg/dL']];
        grid.innerHTML = cards.map(([k, v]) => `<article class="vc-page-card"><div class="vc-row"><span>${k}</span><strong class="num">${v}</strong></div></article>`).join('');
      };
      paint('overview');
      seg(host.querySelector('[data-vital-tabs]'), (v) => paint(v));
      host.querySelector('[data-vital-refresh]')?.addEventListener('click', () => {
        const body = host.querySelector('[data-vital-body]');
        body.innerHTML = `<div class="vc-loading" role="status"><p>Syncing home kit…</p><div class="vc-skel"></div><div class="vc-skel"></div></div>`;
        setTimeout(() => {
          body.innerHTML = '';
          paint(host.querySelector('[aria-pressed="true"]')?.dataset.v || 'overview');
          toast('Kit synced (sample)');
        }, reduce ? 0 : 650);
      });
    }
    if (page.id === 'appointments') {
      const list = host.querySelector('[data-appt-list]');
      const rows = {
        upcoming: [
          { who: D(next.doc).name, when: `${fmtDate(next.date, { weekday: 'short', month: 'short', day: 'numeric' })} · ${next.time}`, where: 'Room 4' },
          { who: 'Dr. Lena Hart', when: `${fmtDate(dayOffset(12), { weekday: 'short', month: 'short', day: 'numeric' })} · 2:00 pm`, where: 'Telehealth' },
        ],
        past: [
          { who: 'Dr. Tomas Merino', when: `${fmtDate(dayOffset(-18), { weekday: 'short', month: 'short', day: 'numeric' })} · 11:00 am`, where: 'Room 2' },
        ],
      };
      const paint = (filter = 'upcoming') => {
        const data = rows[filter] || [];
        if (!data.length) {
          list.innerHTML = `<div class="vc-empty"><p>No ${filter} appointments.</p></div>`;
          return;
        }
        list.innerHTML = data.map((a) =>
          `<article class="vc-page-card"><div class="vc-row"><strong>${a.who}</strong><span>${a.where}</span></div><p class="vc-sub" style="margin:0">${a.when}</p></article>`
        ).join('');
      };
      paint('upcoming');
      seg(host.querySelector('[data-appt-tabs]'), (v) => paint(v));
    }
    if (page.id === 'records') {
      const list = host.querySelector('[data-rec-list]');
      const paint = (q = '') => {
        const rows = RECS.filter((r) => !q || r.name.toLowerCase().includes(q));
        if (!rows.length) {
          list.innerHTML = `<div class="vc-empty"><p>No records match.</p></div>`;
          return;
        }
        list.innerHTML = rows.map((r) =>
          `<article class="vc-page-card"><div class="vc-row"><strong>${r.name}</strong>${r.isNew ? '<span class="new">New</span>' : ''}</div><p class="vc-sub" style="margin:0">Updated ${fmtDate(dayOffset(-r.d), { month: 'short', day: 'numeric' })}</p></article>`
        ).join('');
      };
      paint();
      host.querySelector('[data-rec-q]')?.addEventListener('input', (e) => paint(e.target.value.trim().toLowerCase()));
    }
    if (page.id === 'settings') {
      const form = host.querySelector('[data-settings]');
      form?.addEventListener('submit', () => {
        const err = host.querySelector('[data-form-err]');
        if (!form.channel.value) { err.hidden = false; return; }
        err.hidden = true;
        toast(`Prefs saved · ${form.channel.value} at ${form.hour.value}:00`);
      });
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
      if (!isOverview) {
        host.innerHTML = pageHtml(page);
        paintIcons(host);
        wirePage(host, page);
      } else if (!seenPages.has('overview')) {
        seenPages.add('overview');
        staggerReveal();
        animateCounts();
      }
      seenPages.add(id);
    });
  }

  
/* reveal-boot */
if (typeof staggerReveal === "function") staggerReveal();
/* === DB multipage polish (dense kit) === */
(function wirePages() {
  const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"vitals","name":"Vitals","pattern":"Report"},{"id":"appointments","name":"Appointments","pattern":"Calendar"},{"id":"records","name":"Records","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Vitalis Care" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
