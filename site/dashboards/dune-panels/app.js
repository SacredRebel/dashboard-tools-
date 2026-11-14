/* Dune Panels: neumorphic soft-UI analytics — fabric wave, dual donuts, recessed well.
   Fictional metrics. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    pie: '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15.5 3.6A9 9 0 0 1 20.4 8.5L15.5 8.5z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    trendUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
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
  paintIcons();

  /* —— fabric wave SVG —— */
  $('[data-wave]').innerHTML = `<svg viewBox="0 0 1400 700" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="du-fab" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="var(--wave-2)"/>
        <stop offset="0.45" stop-color="var(--wave)"/>
        <stop offset="1" stop-color="var(--slate-2)"/>
      </linearGradient>
      <pattern id="du-rib" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
        <rect width="8" height="8" fill="transparent"/>
        <path d="M0 0h2" stroke="rgb(255 255 255 / 0.12)" stroke-width="1"/>
      </pattern>
      <filter id="du-soft" x="-5%" y="-10%" width="110%" height="130%">
        <feGaussianBlur stdDeviation="1.2"/>
      </filter>
    </defs>
    <path d="M-40 420
      C120 280, 220 520, 380 400
      S620 220, 780 360
      S1040 560, 1220 380
      S1480 260, 1520 320
      L1520 720 L-40 720 Z" fill="url(#du-fab)" opacity="0.85"/>
    <path d="M-40 440
      C140 300, 240 540, 400 420
      S640 250, 800 380
      S1060 570, 1240 400
      S1480 280, 1520 340
      L1520 720 L-40 720 Z" fill="url(#du-rib)" opacity="0.9"/>
    <path d="M-40 400
      C160 260, 260 500, 420 380
      S660 200, 820 340
      S1080 540, 1260 360
      S1500 240, 1520 300"
      fill="none" stroke="rgb(255 255 255 / 0.18)" stroke-width="3" filter="url(#du-soft)"/>
    <path d="M80 480 C240 360, 360 560, 520 460 S780 320, 940 460 S1200 620, 1360 480"
      fill="none" stroke="rgb(45 62 78 / 0.15)" stroke-width="14" stroke-linecap="round" opacity="0.5"/>
  </svg>`;

  /* —— data —— */
  const RANGES = {
    24: {
      dual: [
        [{ n: 'Organic', v: 42, c: '--yellow' }, { n: 'Direct', v: 28, c: '--sage-2' }, { n: 'Paid', v: 30, c: '--teal' }],
        [{ n: 'Desktop', v: 62, c: '--white' }, { n: 'Mobile', v: 38, c: '--teal' }],
      ],
      well: [
        { n: 'Browse', v: 36, c: '--teal' },
        { n: 'Cart', v: 24, c: '--yellow' },
        { n: 'Checkout', v: 18, c: '--pink' },
        { n: 'Other', v: 22, c: '--white' },
      ],
      quad: [
        { n: 'Uptime', v: 98, c: '--teal', icon: 'shield' },
        { n: 'Latency', v: 72, c: '--yellow', icon: 'bolt' },
        { n: 'Errors', v: 12, c: '--pink', icon: 'activity' },
        { n: 'Reach', v: 84, c: '--sage', icon: 'globe' },
      ],
      pulses: [
        { who: 'North hub', detail: 'Mix shift +2.1%', val: '+2.1%', initials: 'NH' },
        { who: 'Cart well', detail: 'Share climbed to 24%', val: '24%', initials: 'CW' },
        { who: 'Edge cache', detail: 'Latency under target', val: '118 ms', initials: 'EC' },
      ],
    },
    48: {
      dual: [
        [{ n: 'Organic', v: 38, c: '--yellow' }, { n: 'Direct', v: 32, c: '--sage-2' }, { n: 'Paid', v: 30, c: '--teal' }],
        [{ n: 'Desktop', v: 55, c: '--white' }, { n: 'Mobile', v: 45, c: '--teal' }],
      ],
      well: [
        { n: 'Browse', v: 30, c: '--teal' },
        { n: 'Cart', v: 28, c: '--yellow' },
        { n: 'Checkout', v: 22, c: '--pink' },
        { n: 'Other', v: 20, c: '--white' },
      ],
      quad: [
        { n: 'Uptime', v: 96, c: '--teal', icon: 'shield' },
        { n: 'Latency', v: 68, c: '--yellow', icon: 'bolt' },
        { n: 'Errors', v: 18, c: '--pink', icon: 'activity' },
        { n: 'Reach', v: 88, c: '--sage', icon: 'globe' },
      ],
      pulses: [
        { who: 'Paid lane', detail: 'Spend held flat', val: '±0%', initials: 'PL' },
        { who: 'Mobile share', detail: 'Grew to 45%', val: '45%', initials: 'MS' },
        { who: 'Checkout', detail: 'Conversion +0.6 pts', val: '+0.6', initials: 'CK' },
        { who: 'South hub', detail: 'Brief blip recovered', val: 'OK', initials: 'SH' },
      ],
    },
    72: {
      dual: [
        [{ n: 'Organic', v: 45, c: '--yellow' }, { n: 'Direct', v: 25, c: '--sage-2' }, { n: 'Paid', v: 30, c: '--teal' }],
        [{ n: 'Desktop', v: 58, c: '--white' }, { n: 'Mobile', v: 42, c: '--teal' }],
      ],
      well: [
        { n: 'Browse', v: 40, c: '--teal' },
        { n: 'Cart', v: 20, c: '--yellow' },
        { n: 'Checkout', v: 16, c: '--pink' },
        { n: 'Other', v: 24, c: '--white' },
      ],
      quad: [
        { n: 'Uptime', v: 99, c: '--teal', icon: 'shield' },
        { n: 'Latency', v: 80, c: '--yellow', icon: 'bolt' },
        { n: 'Errors', v: 8, c: '--pink', icon: 'activity' },
        { n: 'Reach', v: 91, c: '--sage', icon: 'globe' },
      ],
      pulses: [
        { who: 'Weekend lift', detail: 'Organic led the mix', val: '45%', initials: 'WL' },
        { who: 'Reach', detail: 'Crossed 90% mark', val: '91%', initials: 'RH' },
      ],
    },
  };

  const SHORTCUTS = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'users', label: 'Cohorts', icon: 'users' },
    { id: 'mail', label: 'Inbox', icon: 'mail' },
    { id: 'bolt', label: 'Bursts', icon: 'bolt' },
    { id: 'globe', label: 'Regions', icon: 'globe' },
    { id: 'shield', label: 'Trust', icon: 'shield' },
    { id: 'target', label: 'Goals', icon: 'target' },
    { id: 'clock', label: 'SLA', icon: 'clock' },
    { id: 'settings', label: 'Prefs', icon: 'settings' },
  ];

  let range = '24';
  let wellFocus = -1;
  let shelf = -1;
  let quadFocus = -1;

  function renderDual() {
    const [a, b] = RANGES[range].dual;
    const pct = (parts) => parts.reduce((s, p) => s + p.value, 0);
    $('[data-dual]').innerHTML = [a, b].map((parts, i) => {
      const label = i === 0 ? 'Channels' : 'Devices';
      const top = parts.slice().sort((x, y) => y.v - x.v)[0];
      return `<figure class="du-donut" data-dual-i="${i}" role="img" aria-label="${label}: ${parts.map((p) => `${p.n} ${p.v}%`).join(', ')}">
        ${donut(parts.map((p) => ({ value: p.v, color: p.c })), { size: 150, w: 22, gap: 1.5 })}
        <figcaption><b>${top.v}%</b>${top.n}</figcaption>
      </figure>`;
    }).join('');
    $('[data-dual-note]').innerHTML = `<b>${range}h</b> · channels sum ${pct(a)} · devices sum ${pct(b)}. Tap a shelf or well segment to filter the feed.`;
  }

  function renderWell() {
    const parts = RANGES[range].well.map((p, i) => ({
      value: p.v,
      color: wellFocus < 0 || wellFocus === i ? p.c : '--surface-2',
    }));
    $('[data-well]').innerHTML = donut(parts, { size: 180, w: 28, gap: 1.8, round: false });
    $('[data-well-legend]').innerHTML = RANGES[range].well.map((p, i) =>
      `<li><button type="button" data-w="${i}" aria-pressed="${wellFocus === i}">
        <i style="background:var(${p.c})"></i>${p.n}<span class="num">${p.v}%</span>
      </button></li>`).join('');
  }

  function renderIcons() {
    $('[data-icons]').innerHTML = SHORTCUTS.map((s, i) =>
      `<button type="button" class="du-shelf" data-shelf="${i}" aria-pressed="${shelf === i}" aria-label="${s.label}">
        <span class="du-shelfplat">${svg(s.icon)}</span>
        <small>${s.label}</small>
      </button>`).join('');
    $('[data-icon-note]').innerHTML = shelf < 0
      ? 'Press a shelf to pin a shortcut filter.'
      : `Pinned <b>${SHORTCUTS[shelf].label}</b> · filter applied to pulses.`;
  }

  function renderQuad() {
    $('[data-quad]').innerHTML = RANGES[range].quad.map((q, i) => {
      const rest = Math.max(0, 100 - q.v);
      return `<button type="button" class="du-qcell" data-quad="${i}" aria-pressed="${quadFocus === i}"
        aria-label="${q.n} ${q.v}%">
        ${donut([{ value: q.v, color: q.c }, { value: rest, color: '--slate' }], { size: 72, w: 10, gap: 1, round: true })}
        <span class="du-qmeta"><i>${svg(q.icon, 2)}</i>${q.n} · ${q.v}%</span>
      </button>`;
    }).join('');
    $('[data-quad-note]').innerHTML = quadFocus < 0
      ? `Signal grid for the last <b>${range} hours</b>.`
      : `Focusing <b>${RANGES[range].quad[quadFocus].n}</b> at ${RANGES[range].quad[quadFocus].v}%.`;
  }

  function renderFeed() {
    const q = ($('[data-q]')?.value || '').trim().toLowerCase();
    let list = RANGES[range].pulses.slice();
    if (shelf >= 0) {
      const tag = SHORTCUTS[shelf].label.toLowerCase();
      list = list.filter((p) => (p.who + p.detail).toLowerCase().includes(tag.slice(0, 3)) || tag.length < 3 || list.length <= 2);
      if (list.length === 0) list = RANGES[range].pulses.slice(0, 1);
    }
    if (wellFocus >= 0) {
      const name = RANGES[range].well[wellFocus].n.toLowerCase();
      const filtered = list.filter((p) => (p.who + p.detail).toLowerCase().includes(name.slice(0, 4)));
      if (filtered.length) list = filtered;
    }
    if (q) list = list.filter((p) => (p.who + p.detail + p.val).toLowerCase().includes(q));

    const host = $('[data-pulses]');
    const msg = $('[data-feed-msg]');
    if (!list.length) {
      host.innerHTML = `<li class="du-none">No pulses match “${q || 'this filter'}”. Clear search or pick another range.</li>`;
      msg.textContent = 'Empty feed · try another filter.';
      return;
    }
    host.innerHTML = list.map((p) =>
      `<li>
        <span class="du-dot" aria-hidden="true">${p.initials}</span>
        <span><b>${p.who}</b><small>${p.detail}</small></span>
        <span class="num">${p.val}</span>
      </li>`).join('');
    msg.innerHTML = `Showing <b>${list.length}</b> pulse${list.length === 1 ? '' : 's'} · ${range}h window.`;
  }

  function renderAll() {
    renderDual();
    renderWell();
    renderIcons();
    renderQuad();
    renderFeed();
  }

  seg($('[data-range]'), (v) => {
    range = v;
    wellFocus = -1;
    quadFocus = -1;
    renderAll();
  });

  $('[data-well-legend]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-w]');
    if (!b) return;
    wellFocus = wellFocus === +b.dataset.w ? -1 : +b.dataset.w;
    renderWell();
    renderFeed();
    $(`[data-w="${b.dataset.w}"]`)?.focus();
  });

  $('[data-icons]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-shelf]');
    if (!b) return;
    shelf = shelf === +b.dataset.shelf ? -1 : +b.dataset.shelf;
    renderIcons();
    renderFeed();
    $(`[data-shelf="${b.dataset.shelf}"]`)?.focus();
  });

  $('[data-quad]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-quad]');
    if (!b) return;
    quadFocus = quadFocus === +b.dataset.quad ? -1 : +b.dataset.quad;
    renderQuad();
    $(`[data-quad="${b.dataset.quad}"]`)?.focus();
  });

  $('[data-q]').addEventListener('input', renderFeed);

  renderAll();
/* === DB multipage bootstrap (generated; polish pass replaces stubs) === */
  (function wirePages() {
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"reports","name":"Reports","pattern":"Report"},{"id":"segments","name":"Segments","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
