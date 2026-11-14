/* Haven Listings: dusk villa photo hero, multipage + motion. Sample data only. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = $('[data-db-app]') || document.body;
  const ICON = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    building: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z"/><circle cx="16.5" cy="14.5" r="1"/>',
    arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
    bed: '<path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="10.5" r="1.8"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    ruler: '<path d="m3 16 13-13 5 5L8 21z"/><path d="m7 12 2 2M10 9l2 2M13 6l2 2"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
  };
  const svg = (n, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n] || ''}</svg>`;
  const paintIcons = (host = document) => $$('[data-icon]', host).forEach((el) => { el.innerHTML = svg(el.dataset.icon); });
  function toast(msg) {
    const t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(() => { t.hidden = true; }, 2200);
  }
  function countUp(el, to, { duration = 600, format = (n) => String(Math.round(n)) } = {}) {
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `hl-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="hl-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="hl-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="hl-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="hl-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="hl-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="hl-cursor" hidden></span><span class="hl-tip num" hidden></span>
    </div>`;
    const tip = $('.hl-tip', el), cur = $('.hl-cursor', el), dots = $$('.hl-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `hl-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.hl-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.hl-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  paintIcons();

  // ---------------------------------------------------------------- sample data
  const HOMES = [
    { id: 'h1', mode: 'buy', name: 'Lunette House', place: 'Marrow Bay', type: 'Villa', price: 1240000, beds: 4, baths: 3, area: 312, addr: '18 Tidewater Lane', blurb: 'A long curved shell of glass and plaster that follows the dune line, with a heated deck facing the evening light.' },
    { id: 'h2', mode: 'buy', name: 'Cedar Step', place: 'Pinecrest', type: 'Cabin', price: 468000, beds: 2, baths: 1, area: 96, addr: '4 Quillback Road', blurb: 'A stepped timber cabin on a wooded slope. Wood stove, sleeping loft and a creek at the end of the garden.' },
    { id: 'h3', mode: 'buy', name: 'Foundry Loft 6', place: 'Old Harbour', type: 'Loft', price: 615000, beds: 2, baths: 2, area: 128, addr: '22 Anchor Street', blurb: 'A top-floor loft in a converted foundry: steel windows, a mezzanine study and a shared roof terrace.' },
    { id: 'h4', mode: 'buy', name: 'Saltgrass Villa', place: 'Marrow Bay', type: 'Villa', price: 892000, beds: 3, baths: 2, area: 204, addr: '7 Heron Walk', blurb: 'Single-storey courtyard villa a short walk from the beach, rebuilt two years ago with solar and a cistern.' },
    { id: 'h5', mode: 'rent', name: 'Kiln Yard Loft', place: 'Old Harbour', type: 'Loft', price: 2450, beds: 1, baths: 1, area: 74, addr: '3 Kiln Yard', blurb: 'Bright one-bedroom loft above a ceramics studio. Bills included, bikes welcome, six-month minimum.' },
    { id: 'h6', mode: 'rent', name: 'Larch Hollow', place: 'Pinecrest', type: 'Cabin', price: 1980, beds: 2, baths: 1, area: 88, addr: '31 Larch Hollow', blurb: 'A quiet two-bedroom cabin at the edge of the forest with a covered porch and room for a garden.' },
    { id: 'h7', mode: 'rent', name: 'Tern Court Villa', place: 'Marrow Bay', type: 'Villa', price: 4600, beds: 4, baths: 3, area: 240, addr: '2 Tern Court', blurb: 'Furnished family villa with a pool and a guest wing, available for a year from next month.' },
  ];
  const MAX = { buy: [[0, 'Any price'], [500000, '$500,000'], [750000, '$750,000'], [1000000, '$1,000,000']], rent: [[0, 'Any price'], [2000, '$2,000'], [2500, '$2,500'], [5000, '$5,000']] };
  const money = (v) => '$' + fmtNum(v), shortM = (v) => (v >= 1e6 ? '$' + (v / 1e6).toFixed(2) + 'M' : v >= 1e4 ? '$' + Math.round(v / 1000) + 'k' : '$' + fmtNum(v));
  const state = { mode: 'buy', place: '', type: '', max: 0, sel: 'h1' }, saved = new Set(['h4']), kept = new Set(), viewings = [{ home: 'h4', day: 2, time: '10:30 am' }, { home: 'h3', day: 5, time: '4:00 pm' }];
  const form = $('[data-filters]');
  const matches = () => HOMES.filter((h) => h.mode === state.mode && (!state.place || h.place === state.place) && (!state.type || h.type === state.type) && (!state.max || h.price <= state.max));
  const current = () => matches().find((h) => h.id === state.sel) || matches()[0] || null;
  const history = (h) => Array.from({ length: 8 }, (_, i) => Math.round(h.price * (0.84 + i * 0.022 + 0.015 * Math.sin(i * 1.7 + h.beds))));

  // ---------------------------------------------------------------- renderers
  function fillSelects() {
    const opts = (list, cur) => list.map(([v, l]) => `<option value="${v}"${String(v) === String(cur) ? ' selected' : ''}>${l}</option>`).join('');
    form.place.innerHTML = opts([['', 'Anywhere'], ...[...new Set(HOMES.map((h) => h.place))].map((p) => [p, p])], state.place);
    form.type.innerHTML = opts([['', 'Any type'], ...[...new Set(HOMES.map((h) => h.type))].map((p) => [p, p])], state.type);
    form.max.innerHTML = opts(MAX[state.mode], state.max);
  }
  function render() {
    const list = matches(), h = current(), per = state.mode === 'rent' ? ' / month' : '';
    countUp($('[data-count]'), list.length);
    $('[data-find-note]').textContent = list.length ? `${list.length === 1 ? 'One home' : list.length + ' homes'} to ${state.mode} ${state.place ? 'in ' + state.place : 'across three areas'}. Use the arrow to step through them.` : 'Nothing fits these filters yet.';
    $('[data-next]').disabled = list.length < 2; $('[data-clear]').hidden = !(state.place || state.type || state.max);
    $('[data-detail]').innerHTML = h ? `<div class="hl-detail-head"><div><h2>${h.name}</h2><address>${svg('pin')}${h.addr}, ${h.place}</address></div></div>
        <p>${h.blurb}</p><p class="hl-price num">${money(h.price)}<small>${per}</small></p>
        <ul class="hl-specs"><li>${svg('ruler')}${h.area} m²</li><li>${svg('bed')}${h.beds} bedroom${h.beds > 1 ? 's' : ''}</li><li>${svg('drop')}${h.baths} bath${h.baths > 1 ? 's' : ''}</li><li>${svg('building')}${h.type}</li></ul>
        <div class="hl-acts"><button type="button" data-act="save" aria-pressed="${saved.has(h.id)}">${svg('heart')}${saved.has(h.id) ? 'Saved' : 'Save'}</button><button type="button" data-act="keep" aria-pressed="${kept.has(h.id)}">${svg('bookmark')}${kept.has(h.id) ? 'Comparing' : 'Compare'}</button><button type="button" data-act="share">${svg('send')}Share</button></div>`
      : `<h2>No homes match</h2><p class="hl-none">Try a higher max price or a different area, or clear the filters to see everything to ${state.mode}.</p>`;
    $('[data-homes]').innerHTML = list.length ? list.map((x) => `<li><button type="button" class="hl-home" data-home="${x.id}" aria-pressed="${h && x.id === h.id}"><span class="hl-thumb${x.type === 'Villa' ? ' photo' : ''}" style="--tr:${x.type === 'Villa' ? '18px 18px 3px 3px' : x.type === 'Cabin' ? '50% 50% 0 0' : '2px'}"></span><span><b>${x.name}</b><small>${x.place} · ${x.type} · ${x.beds} bed</small></span><span class="num">${shortM(x.price)}</span></button></li>`).join('') : '<li class="hl-none">No homes match these filters.</li>';
    if (h) { const v = history(h); $('[data-price-meta]').textContent = h.name;
      lineChart($('[data-price]'), { labels: Array.from({ length: 8 }, (_, i) => fmtDate(new Date(new Date().getFullYear(), new Date().getMonth() - 21 + i * 3, 1), { month: 'short', year: '2-digit' })), series: [{ name: per ? 'Rent' : 'Price', color: '--chart-1', values: v }], fmt: shortM, h: 170, ticks: 3, xEvery: 2, label: `Price history for ${h.name} over two years` });
    } else { $('[data-price-meta]').textContent = ''; $('[data-price]').innerHTML = '<p class="hl-none">Pick a home to see its price history.</p>'; }
    const hasView = h && viewings.some((v) => v.home === h.id);
    $('[data-book]').disabled = !h || hasView; $('[data-book]').textContent = !h ? 'Book a viewing' : hasView ? 'Viewing booked' : `Book a viewing of ${h.name}`;
    $('[data-views]').innerHTML = viewings.map((v) => { const d = dayOffset(v.day), x = HOMES.find((q) => q.id === v.home); return `<li><time><span><b class="num">${d.getDate()}</b><br>${fmtDate(d, { month: 'short' })}</span></time><span>${x.name}<small>${fmtDate(d, { weekday: 'long' })}, ${v.time}</small></span></li>`; }).join('');
  }

  // ---------------------------------------------------------------- events
  seg($('[data-mode]'), (v) => { Object.assign(state, { mode: v, max: 0 }); fillSelects(); render(); toast(`${v === 'buy' ? 'Buy' : 'Rent'} · sample`); });
  form.addEventListener('change', () => { Object.assign(state, { place: form.place.value, type: form.type.value, max: +form.max.value }); render(); });
  form.addEventListener('submit', (e) => e.preventDefault());
  $('[data-clear]').addEventListener('click', () => { Object.assign(state, { place: '', type: '', max: 0 }); fillSelects(); render(); form.place.focus(); toast('Filters cleared · sample'); });
  $('[data-next]').addEventListener('click', () => { const l = matches(), i = l.indexOf(current()); state.sel = l[(i + 1) % l.length].id; render(); toast('Next match · sample'); });
  $('[data-homes]').addEventListener('click', (e) => { const b = e.target.closest('[data-home]'); if (!b) return; state.sel = b.dataset.home; render(); $(`[data-home="${state.sel}"]`).focus(); });
  $('[data-detail]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'), h = current(); if (!b || !h) return;
    if (b.dataset.act === 'share') { toast('Share link · sample'); return; }
    const set = b.dataset.act === 'save' ? saved : b.dataset.act === 'keep' ? kept : null;
    if (!set) return;
    set.has(h.id) ? set.delete(h.id) : set.add(h.id);
    render();
    $(`[data-act="${b.dataset.act}"]`)?.focus();
    toast(`${b.dataset.act === 'save' ? 'Saved' : 'Compare'} · sample`);
  });
  $('[data-book]').addEventListener('click', () => { const h = current(); if (!h) return; viewings.push({ home: h.id, day: 7 + viewings.length, time: '11:00 am' }); render(); toast('Viewing booked · sample'); });
  fillSelects(); render();

  function staggerReveal() {
    $$('.hl-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 40 * i}ms`);
      el.classList.add('hl-reveal-in');
    });
  }

  const PAGES = [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'listings', name: 'Listings', pattern: 'List' },
    { id: 'showings', name: 'Showings', pattern: 'Calendar' },
    { id: 'settings', name: 'Settings', pattern: 'Settings' },
  ];
  const main = $('[data-main]');
  const overview = $('[data-page-panel="overview"]');
  let stub = null;
  const seenPages = new Set();
  function ensureStub() {
    if (stub) return stub;
    stub = document.createElement('div');
    stub.setAttribute('data-db-stub-host', '');
    stub.hidden = true;
    main.appendChild(stub);
    return stub;
  }
  function setNav(id) {
    $$('.hl-rail a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href === `#/${id}`) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  function pageHtml(page) {
    if (page.id === 'listings') {
      return `<section class="hl-page" data-db-page="listings" aria-labelledby="p-h">
        <h1 id="p-h">Listings</h1>
        <p class="hl-page-lead">All curated homes. Sample data · fictional.</p>
        <div class="hl-seg" role="group" aria-label="Listings state" data-list-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-list-body></div>
      </section>`;
    }
    if (page.id === 'showings') {
      return `<section class="hl-page" data-db-page="showings" aria-labelledby="p-h">
        <h1 id="p-h">Showings</h1>
        <p class="hl-page-lead">Upcoming viewings on the calendar.</p>
        <div class="hl-page-grid" data-show-list></div>
        <button type="button" class="hl-btn" data-book-page>Request a slot</button>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="hl-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="hl-page-lead">Alerts and preference stubs.</p>
        <div class="hl-page-grid">
          <article class="hl-page-card"><div class="hl-row"><strong>Price alerts</strong><span>On</span></div></article>
          <article class="hl-page-card"><div class="hl-row"><strong>New listings</strong><span>Daily</span></div></article>
          <article class="hl-page-card"><div class="hl-row"><strong>Saved searches</strong><span>2</span></div></article>
        </div>
        <button type="button" class="hl-btn ghost" data-save-settings>Save preferences</button>
      </section>`;
    }
    return `<section class="hl-page"><h1>${page.name}</h1></section>`;
  }
  function wirePage(host, page) {
    if (page.id === 'listings') {
      const body = host.querySelector('[data-list-body]');
      const paint = (stateName = 'ready') => {
        if (stateName === 'loading') {
          body.innerHTML = `<div class="hl-loading" role="status"><p>Syncing listings…</p><div class="hl-skel"></div><div class="hl-skel"></div></div>`;
          return;
        }
        if (stateName === 'empty') {
          body.innerHTML = `<div class="hl-empty"><p>No listings in this market yet.</p></div>`;
          return;
        }
        if (stateName === 'error') {
          body.innerHTML = `<div class="hl-error"><p>Could not load listings.</p><button type="button" class="hl-btn ghost" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="hl-page-grid">${HOMES.map((h) =>
          `<article class="hl-page-card"><div class="hl-row"><strong>${h.name}</strong><span class="num">${shortM(h.price)}</span></div><p class="hl-meta">${h.place} · ${h.type} · ${h.beds} bed</p></article>`
        ).join('')}</div>`;
      };
      paint('ready');
      seg(host.querySelector('[data-list-tabs]'), (v) => paint(v));
    }
    if (page.id === 'showings') {
      host.querySelector('[data-show-list]').innerHTML = viewings.map((v) => {
        const d = dayOffset(v.day), x = HOMES.find((q) => q.id === v.home);
        return `<article class="hl-page-card"><div class="hl-row"><strong>${x.name}</strong><span class="num">${d.getDate()} ${fmtDate(d, { month: 'short' })}</span></div><p class="hl-meta">${fmtDate(d, { weekday: 'long' })}, ${v.time}</p></article>`;
      }).join('');
      host.querySelector('[data-book-page]')?.addEventListener('click', () => toast('Slot requested · sample'));
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
    window.DB.route(PAGES, (id, page) => {
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

  document.documentElement.dataset.ready = 'true';
})();
