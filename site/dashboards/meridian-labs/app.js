/* Meridian Labs: soft health diagnostics. Fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    file: '<path d="M6 2.500h8l5 5V21a.5.5 0 0 1-.5.500h-12.500A.5.5 0 0 1 5.5 21V3a.5.5 0 0 1 .5-.5z"/><path d="M14 2.500V8h5M9 13h6M9 17h6"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    chevDown: '<path d="m6 9 6 6 6-6"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevLeft: '<path d="m15 18-6-6 6-6"/>',
    chevRight: '<path d="m9 6 6 6-6 6"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    pill: '<rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="m9 9 6 6"/>',
    flask: '<path d="M9 3h6M10 3v6l-5.5 9.500A1.5 1.5 0 0 0 5.8 21h12.400a1.5 1.5 0 0 0 1.3-2.500L14 9V3"/><path d="M7.5 15h9"/>',
    stethoscope: '<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a4.5 4.5 0 0 0 9 0v-2"/><circle cx="19" cy="12" r="2"/>',
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
  // Tiny trend line. Returns an SVG string; stretches to its box.
  function spark(vals, { color = '--chart-1', fill = 0.25, w = 120, h = 36 } = {}) {
    const mn = Math.min(...vals), mx = Math.max(...vals), pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 6)]);
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `me-s${++sparkId}`;
    return `<svg class="me-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }
  let sparkId = 0;

  paintIcons();

  const FILTERS = ['All', 'Advice', 'Tests', 'Labs', 'Docs'];
  const TESTS = [
    { id: 'bp', kind: 'Tests', title: 'Blood Pressure Test', date: dayOffset(-12), doc: 'Wesley Cain', role: 'Cardiologist', initials: 'WC', chart: 'bars', vals: [18, 28, 22, 40, 26, 20, 24] },
    { id: 'ecg', kind: 'Tests', title: 'Cardiogram Test', date: dayOffset(-3), doc: 'Sofia Frank', role: 'Cardiologist', initials: 'SF', chart: 'line', vals: [42, 48, 40, 55, 46, 52, 44, 50, 47] },
    { id: 'lipid', kind: 'Labs', title: 'Lipid Panel', date: dayOffset(-20), doc: 'Amira Holt', role: 'Lab analyst', initials: 'AH', chart: 'bars', vals: [30, 22, 34, 28, 36, 24] },
    { id: 'advice', kind: 'Advice', title: 'Recovery Plan', date: dayOffset(-1), doc: 'Noah Reed', role: 'Advisor', initials: 'NR', chart: 'line', vals: [20, 24, 28, 26, 32, 30, 34] },
    { id: 'docs', kind: 'Docs', title: 'Referral Packet', date: dayOffset(-8), doc: 'Priya Shah', role: 'Records', initials: 'PS', chart: 'bars', vals: [12, 16, 14, 18, 15, 20] },
  ];
  const VITS = [
    [
      { n: 'OMEGA 3', dose: '2.5 mg', art: 'bottle', tint: '--accent' },
      { n: 'Aflubin', dose: '200 mg', art: 'caps', tint: '--chart-2' },
      { n: 'Timestin', dose: '300 mg', art: 'bottle', tint: '--ok' },
      { n: 'Vitamin C', dose: '1.8 mg', art: 'bottle', tint: '--highlight' },
    ],
    [
      { n: 'Mag Citrate', dose: '200 mg', art: 'caps', tint: '--accent' },
      { n: 'D3 Softgel', dose: '25 µg', art: 'bottle', tint: '--chart-2' },
      { n: 'Zinc Plus', dose: '15 mg', art: 'bottle', tint: '--ok' },
      { n: 'B-Complex', dose: '50 mg', art: 'caps', tint: '--highlight' },
    ],
  ];

  let filter = 'Tests';
  let selectedTest = 'ecg';
  let vitPage = 0;
  let selectedVit = 0;
  let weekOffset = 0;
  let selectedDay = 4; // Friday-ish in strip
  let dnaTool = 'heart';
  let listState = 'populated';

  function initialsArt(init) {
    return `<span class="me-av">${init}</span>`;
  }

  function bottleSvg(tint) {
    return `<svg viewBox="0 0 64 72" aria-hidden="true">
      <rect x="22" y="4" width="20" height="10" rx="3" style="fill:var(${tint})" opacity=".85"/>
      <path d="M18 14 h28 l4 10 v36 a8 8 0 0 1-8 8 H22 a8 8 0 0 1-8-8 V24 Z" style="fill:var(${tint})" opacity=".35"/>
      <path d="M22 28 h20 v8 H22z" style="fill:var(--surface)"/>
      <circle cx="32" cy="48" r="8" style="fill:var(${tint})" opacity=".55"/>
      <rect x="26" y="44" width="12" height="8" rx="2" style="fill:var(--surface)" opacity=".9"/>
    </svg>`;
  }
  function capsSvg(tint) {
    return `<svg viewBox="0 0 64 72" aria-hidden="true">
      <g transform="rotate(-28 24 40)">
        <rect x="8" y="34" width="28" height="12" rx="6" style="fill:var(${tint})"/>
        <rect x="22" y="34" width="14" height="12" rx="6" style="fill:var(--chart-2)"/>
      </g>
      <g transform="rotate(18 44 48)">
        <rect x="30" y="42" width="26" height="11" rx="5.5" style="fill:var(--accent)" opacity=".7"/>
        <rect x="43" y="42" width="13" height="11" rx="5.5" style="fill:var(--surface)"/>
      </g>
    </svg>`;
  }

  function renderHelix() {
    const w = 200, h = 420, cx = 100;
    let paths = '', nodes = '';
    for (let i = 0; i < 18; i++) {
      const t = i / 17;
      const y = 20 + t * 380;
      const amp = 48;
      const phase = t * Math.PI * 5;
      const x1 = cx + Math.sin(phase) * amp;
      const x2 = cx + Math.sin(phase + Math.PI) * amp;
      const rungs = i % 2 === 0;
      if (rungs) {
        paths += `<line x1="${x1.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y.toFixed(1)}" style="stroke:var(--dna-2)" stroke-width="3" opacity=".55"/>`;
      }
      nodes += `<circle cx="${x1.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5" style="fill:var(--dna)"/>`;
      nodes += `<circle cx="${x2.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5" style="fill:var(--dna-2)"/>`;
    }
    // ribbon strokes
    let d1 = '', d2 = '';
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const y = 20 + t * 380;
      const phase = t * Math.PI * 5;
      const x1 = cx + Math.sin(phase) * 48;
      const x2 = cx + Math.sin(phase + Math.PI) * 48;
      d1 += (i ? ' L' : 'M') + `${x1.toFixed(1)},${y.toFixed(1)}`;
      d2 += (i ? ' L' : 'M') + `${x2.toFixed(1)},${y.toFixed(1)}`;
    }
    const glow = dnaTool === 'pulse' ? '0.35' : dnaTool === 'scan' ? '0.2' : '0.12';
    $('[data-helix]').innerHTML = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="DNA double helix, B structure">
      <defs>
        <linearGradient id="me-dna-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:var(--dna)" stop-opacity=".3"/>
          <stop offset="1" style="stop-color:var(--dna-2)" stop-opacity=".9"/>
        </linearGradient>
        <filter id="me-soft"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
      <ellipse cx="100" cy="210" rx="70" ry="160" fill="var(--accent)" opacity="${glow}" filter="url(#me-soft)"/>
      <path d="${d1}" fill="none" stroke="url(#me-dna-g)" stroke-width="10" stroke-linecap="round"/>
      <path d="${d2}" fill="none" style="stroke:var(--dna-2)" stroke-width="10" stroke-linecap="round" opacity=".85"/>
      ${paths}${nodes}
    </svg>`;
    $('[data-angstrom]').textContent = dnaTool === 'scan' ? '23.8' : dnaTool === 'pulse' ? '22.9' : '23.3';
  }

  function renderFilters() {
    $('[data-filters]').innerHTML = FILTERS.map((f) =>
      `<button type="button" data-v="${f}" aria-pressed="${f === filter}">${f}</button>`
    ).join('');
  }

  function renderTests() {
    const el = $('[data-tests]');
    const st = $('[data-tests-state]');
    if (listState === 'loading') {
      el.innerHTML = '';
      st.textContent = 'Loading tests…';
      return;
    }
    if (listState === 'error') {
      el.innerHTML = '';
      st.textContent = 'Couldn’t load tests. Switch to Labs or try again.';
      return;
    }
    const items = TESTS.filter((t) => filter === 'All' || t.kind === filter);
    if (listState === 'empty' || !items.length) {
      el.innerHTML = '';
      st.textContent = filter === 'All' ? 'No tests on file yet.' : `No ${filter.toLowerCase()} items. Try All.`;
      return;
    }
    st.textContent = '';
    el.innerHTML = items.map((t) => `
      <button type="button" class="me-tcard" data-test="${t.id}" aria-pressed="${t.id === selectedTest}">
        <div class="me-tdoc">${initialsArt(t.initials)}<span><b>Dr. ${t.doc}</b><small>${t.role}</small></span></div>
        <h3>${t.title}</h3>
        <p class="me-date">${fmtDate(t.date, { day: 'numeric', month: 'short' })}</p>
        <div class="me-chartbox" data-chart="${t.id}"></div>
      </button>`).join('');
    items.forEach((t) => {
      const box = $(`[data-chart="${t.id}"]`);
      if (!box) return;
      if (t.chart === 'bars') {
        const mx = Math.max(...t.vals);
        box.innerHTML = `<div class="me-minibars" role="img" aria-label="${t.title} readings">${t.vals.map((v, i) => {
          const on = v === mx;
          return `<span class="${on ? 'on' : ''}" style="height:${Math.max(12, (v / mx) * 100)}%"></span>`;
        }).join('')}</div>`;
      } else {
        box.innerHTML = spark(t.vals, { color: '--chart-1', fill: 0.28, w: 220, h: 64 });
        box.setAttribute('role', 'img');
        box.setAttribute('aria-label', `${t.title} trend`);
      }
    });
  }

  function renderVits() {
    const page = VITS[vitPage] || VITS[0];
    $('[data-vits]').innerHTML = page.map((v, i) => `
      <button type="button" class="me-vcard" data-vit="${i}" aria-pressed="${i === selectedVit}">
        <span class="me-num">${String(i + 1 + vitPage * 4).padStart(2, '0')}</span>
        <h3>${v.n}</h3>
        <span class="me-dose">${v.dose}</span>
        <div class="me-vart">${v.art === 'caps' ? capsSvg(v.tint) : bottleSvg(v.tint)}</div>
      </button>`).join('');
    $('[data-vitpages]').innerHTML = VITS.map((_, i) =>
      `<button type="button" data-vpage="${i}" aria-label="Page ${i + 1}" aria-current="${i === vitPage ? 'true' : 'false'}"></button>`
    ).join('');
  }

  function weekStart() {
    const d = dayOffset(weekOffset * 7);
    const day = d.getDay(); // 0 Sun
    const mondayOffset = day === 0 ? -6 : 1 - day;
    return dayOffset(weekOffset * 7 + mondayOffset);
  }

  function renderWeek() {
    const start = weekStart();
    $('[data-month]').textContent = fmtDate(start, { month: 'long', year: 'numeric' });
    const events = [
      [{ t: '2:00 p.m.', label: '2 Tests', icon: 'flask' }],
      [{ t: '9:00 a.m.', label: 'Vitamin C', icon: 'pill' }],
      [],
      [{ t: '11:00 a.m.', label: 'OMEGA 3', icon: 'pill' }],
      [{ t: '2:00 p.m.', label: '1 Advice', icon: 'stethoscope' }],
      [{ t: '4:00 p.m.', label: 'Labs', icon: 'flask' }],
      [{ t: '8:00 a.m.', label: 'Vitamin C', icon: 'pill' }],
    ];
    const st = $('[data-week-state]');
    if (listState === 'loading') {
      $('[data-week]').innerHTML = '';
      st.textContent = 'Loading week…';
      return;
    }
    if (listState === 'empty') {
      $('[data-week]').innerHTML = '';
      st.textContent = 'No events this week. Add a test or supplement.';
      return;
    }
    if (listState === 'error') {
      $('[data-week]').innerHTML = '';
      st.textContent = 'Schedule unavailable. Try the previous week.';
      return;
    }
    st.textContent = '';
    $('[data-week]').innerHTML = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const ev = events[i] || [];
      const wd = fmtDate(d, { weekday: 'short' });
      return `<button type="button" class="me-day" role="listitem" data-day="${i}" aria-pressed="${i === selectedDay}">
        <span class="me-wd">${wd}${ev.length ? '<i aria-hidden="true"></i>' : ''}</span>
        <span class="me-dd num">${d.getDate()}</span>
        <span class="me-ev">${ev.map((e) => `<span>${svg(e.icon)} ${e.label}</span><span>${e.t}</span>`).join('') || '<span>Free</span>'}</span>
      </button>`;
    }).join('');
  }

  // Events
  seg($('[data-filters]'), (v) => {
    filter = v;
    listState = 'populated';
    const first = TESTS.find((t) => filter === 'All' || t.kind === filter);
    selectedTest = first ? first.id : selectedTest;
    renderTests();
  });

  $('[data-tests]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-test]');
    if (!b) return;
    selectedTest = b.dataset.test;
    renderTests();
  });

  $('[data-nav]').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-v]');
    if (!b) return;
    $$('[data-nav] button').forEach((x) => x.removeAttribute('aria-current'));
    b.setAttribute('aria-current', 'page');
    if (b.dataset.v === 'tests') { filter = 'Tests'; renderFilters(); renderTests(); }
    if (b.dataset.v === 'calendar') {
      document.querySelector('.me-week')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (b.dataset.v === 'settings') {
      const order = ['populated', 'loading', 'empty', 'error'];
      listState = order[(order.indexOf(listState) + 1) % order.length];
      renderTests();
      renderWeek();
    }
  });

  $('[data-back]').addEventListener('click', () => {
    filter = 'All';
    renderFilters();
    renderTests();
  });

  $('[data-dnatools]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tool]');
    if (!b) return;
    dnaTool = b.dataset.tool;
    $$('[data-dnatools] button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderHelix();
  });

  $('[data-vits]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-vit]');
    if (!b) return;
    selectedVit = +b.dataset.vit;
    renderVits();
  });
  $('[data-vitpages]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-vpage]');
    if (!b) return;
    vitPage = +b.dataset.vpage;
    selectedVit = 0;
    renderVits();
  });
  $('[data-vitnext]').addEventListener('click', () => {
    vitPage = (vitPage + 1) % VITS.length;
    selectedVit = 0;
    renderVits();
  });

  $$('[data-wk]').forEach((b) => b.addEventListener('click', () => {
    weekOffset += +b.dataset.wk;
    listState = 'populated';
    renderWeek();
  }));

  $('[data-week]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]');
    if (!b) return;
    selectedDay = +b.dataset.day;
    renderWeek();
  });

  renderFilters();
  renderTests();
  renderHelix();
  renderVits();
  renderWeek();
  document.documentElement.dataset.ready = 'true';
})();
