/* Haven Listings r4: notchFrame overview + product secondary pages. Sample data only. */
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
    arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
    bed: '<path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="10.5" r="1.8"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    ruler: '<path d="m3 16 13-13 5 5L8 21z"/><path d="m7 12 2 2M10 9l2 2M13 6l2 2"/>',
    moon: '<path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
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

  const HOMES = [
    { id: 'h1', name: 'Dusk Curve Villa', place: 'Cedar Ridge', type: 'Villa', price: 2480000, rent: 9200, beds: 4, baths: 3, area: 3120, yard: '0.4 ac', blurb: 'Warm glass walls face the snow line; open kitchen under a soft shell roof.' },
    { id: 'h2', name: 'Mist Hollow Loft', place: 'Harbor Mill', type: 'Loft', price: 1180000, rent: 4800, beds: 2, baths: 2, area: 1480, yard: 'Roof deck', blurb: 'North light and a deep balcony over the mill race.' },
    { id: 'h3', name: 'Pine Court Residence', place: 'Alpine Reach', type: 'House', price: 1750000, rent: 6400, beds: 3, baths: 2, area: 2240, yard: '0.2 ac', blurb: 'Quiet court living with a courtyard fireplace and study.' },
    { id: 'h4', name: 'River Glass Flat', place: 'South Quay', type: 'Apartment', price: 890000, rent: 3600, beds: 2, baths: 1, area: 1120, yard: 'Balcony', blurb: 'Floor-to-ceiling river views with a soft clay kitchen island.' },
    { id: 'h5', name: 'Summit Pavilion', place: 'Cedar Ridge', type: 'Villa', price: 3120000, rent: 11000, beds: 5, baths: 4, area: 4280, yard: '1.1 ac', blurb: 'Pavilion wings around a heated courtyard pool.' },
  ];
  const PLACES = [...new Set(HOMES.map((h) => h.place))];
  const TYPES = [...new Set(HOMES.map((h) => h.type))];
  const viewings = [
    { home: 'h1', day: 2, time: '10:30' },
    { home: 'h3', day: 4, time: '15:00' },
    { home: 'h2', day: 6, time: '11:15' },
    { home: 'h5', day: 9, time: '16:45' },
  ];

  let mode = 'buy';
  let idx = 0;
  const fmt = (n) => n.toLocaleString('en-US');
  const money = (n) => mode === 'rent' ? `$${fmt(n)}/mo` : `$${fmt(n)}`;
  const dayOffset = (n) => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate() + n); };
  const fmtDate = (d, o = { month: 'short', day: 'numeric' }) => d.toLocaleDateString('en-US', o);

  function filtered() {
    const form = $('[data-filters]');
    const place = form?.place?.value || '';
    const type = form?.type?.value || '';
    const max = Number(form?.max?.value || 0) || Infinity;
    return HOMES.filter((h) => {
      if (place && h.place !== place) return false;
      if (type && h.type !== type) return false;
      const p = mode === 'rent' ? h.rent : h.price;
      return p <= max;
    });
  }

  function renderDetail(home) {
    const el = $('[data-detail]');
    if (!el || !home) return;
    const price = mode === 'rent' ? home.rent : home.price;
    el.innerHTML = `
      <h2>${home.name}</h2>
      <p class="hl-addr"><span data-icon="pin"></span>${home.place} · ${home.type}</p>
      <p class="hl-desc">${home.blurb}</p>
      <div class="hl-specs">
        <div><span data-icon="ruler"></span><strong class="num">${fmt(home.area)} ft²</strong><span>Area</span></div>
        <div><span data-icon="drop"></span><strong>${home.yard}</strong><span>Yard</span></div>
        <div><span data-icon="bed"></span><strong class="num">${home.beds}</strong><span>Beds</span></div>
        <div><span data-icon="drop"></span><strong class="num">${home.baths}</strong><span>Baths</span></div>
      </div>
      <p class="num" style="margin:0 0 12px;font-size:1.25rem;font-weight:600">${money(price)}</p>
      <div class="hl-actions">
        <button type="button" data-act="like" aria-label="Like">${svg('heart')}</button>
        <button type="button" data-act="save" aria-label="Save">${svg('bookmark')}</button>
        <button type="button" data-act="share" aria-label="Share">${svg('send')}</button>
      </div>`;
    paintIcons(el);
    el.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => toast(`${b.dataset.act} · sample`)));
  }

  function refresh() {
    const list = filtered();
    if (!list.length) idx = 0;
    else idx = idx % list.length;
    const home = list[idx] || HOMES[0];
    renderDetail(home);
    const note = $('[data-find-note]');
    if (note) note.textContent = list.length
      ? `${list.length} homes match your filters in this sample market.`
      : 'No homes match — clear a filter to see sample listings.';
    const count = $('[data-count]');
    if (count) {
      const n = Math.max(list.length * 2000, 1200);
      count.dataset.to = String(n);
      count.textContent = `${fmt(Math.round(n / 1000))}K+`;
    }
  }

  function fillFilters() {
    const form = $('[data-filters]');
    if (!form) return;
    form.place.innerHTML = `<option value="">Any</option>` + PLACES.map((p) => `<option value="${p}">${p}</option>`).join('');
    form.type.innerHTML = `<option value="">Any</option>` + TYPES.map((t) => `<option value="${t}">${t}</option>`).join('');
    const caps = mode === 'rent'
      ? [3000, 5000, 8000, 12000]
      : [1000000, 2000000, 3000000, 5000000];
    form.max.innerHTML = `<option value="">Any</option>` + caps.map((c) => `<option value="${c}">${money(c)}</option>`).join('');
  }

  // Interactions
  $$('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    mode = b.dataset.mode;
    $$('[data-mode]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    fillFilters();
    refresh();
    const photo = $('.hl-photo');
    if (photo && !reduce) {
      photo.style.opacity = '0.7';
      setTimeout(() => { photo.style.opacity = '1'; }, 180);
    }
  }));
  $('[data-filters]')?.addEventListener('change', () => { idx = 0; refresh(); });
  $('[data-next]')?.addEventListener('click', () => { idx += 1; refresh(); toast('Next match · sample'); });
  $('[data-detail-next]')?.addEventListener('click', () => { location.hash = '#/listings'; });
  $('[data-book]')?.addEventListener('click', () => toast('Agent notified · sample'));
  $('[data-tour]')?.addEventListener('click', () => toast('Tour booked · sample'));
  $('[data-agent]')?.addEventListener('click', () => toast('Agent Mira Chen · sample'));
  $$('[data-theme]').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.theme;
    const url = new URL(location.href);
    if (v === 'default') url.searchParams.delete('variant');
    else url.searchParams.set('variant', v);
    location.href = url.pathname + url.search + (location.hash || '#/overview');
  }));

  // Parallax ≤ 10px on photo
  const scene = $('[data-scene]');
  const photo = $('[data-parallax]');
  if (scene && photo && !reduce) {
    scene.addEventListener('pointermove', (e) => {
      const r = scene.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      photo.style.transform = `scale(1.04) translate(${nx * -8}px, ${ny * -6}px)`;
    });
    scene.addEventListener('pointerleave', () => { photo.style.transform = 'scale(1.02)'; });
  }

  // Entrance
  if (!reduce && window.Motion) {
    const { animate, stagger } = window.Motion;
    const device = $('.hl-device');
    if (device) animate(device, { opacity: [0, 1], scale: [0.98, 1] }, { duration: 0.45, easing: [0.22, 1, 0.36, 1] });
    animate($$('.hl-copy, .hl-find, .hl-detail-wrap'), { opacity: [0, 1], y: [16, 0] }, { delay: stagger(0.04), duration: 0.4 });
  }

  paintIcons();
  fillFilters();
  refresh();

  const PAGES = [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'listings', name: 'Listings', pattern: 'List' },
    { id: 'showings', name: 'Showings', pattern: 'Calendar' },
    { id: 'settings', name: 'Settings', pattern: 'Settings' },
  ];

  function priceHistorySvg(home) {
    const vals = [0.82, 0.88, 0.86, 0.92, 0.95, 1].map((f) => Math.round(home.price * f / 1000));
    const max = Math.max(...vals), min = Math.min(...vals);
    const pts = vals.map((v, i) => {
      const x = 20 + (i / (vals.length - 1)) * 260;
      const y = 120 - ((v - min) / (max - min || 1)) * 90;
      return [x, y];
    });
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) d += ` L${pts[i][0]},${pts[i][1]}`;
    const area = `${d} L${pts.at(-1)[0]},130 L${pts[0][0]},130 Z`;
    return `<svg viewBox="0 0 300 140" role="img" aria-label="Price history for ${home.name}">
      <path d="${area}" fill="color-mix(in srgb, var(--accent) 18%, transparent)"/>
      <path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
  }

  function renderPage(page) {
    if (page.id === 'listings') {
      const rows = HOMES.map((h) => `
        <article class="hl-page-card mat-glass-frost" tabindex="0" data-home="${h.id}">
          <div class="hl-row"><h3>${h.name}</h3><strong class="num">${money(mode === 'rent' ? h.rent : h.price)}</strong></div>
          <p class="hl-meta">${h.place} · ${h.type} · ${h.beds} bed · ${fmt(h.area)} ft² · ${h.yard}</p>
          <p class="hl-meta">${h.blurb}</p>
          <div class="hl-chart">${priceHistorySvg(h)}</div>
          <div class="hl-actions" style="margin-top:8px">
            <button type="button" data-act="like" aria-label="Like ${h.name}">${svg('heart')}</button>
            <button type="button" data-act="save" aria-label="Save ${h.name}">${svg('bookmark')}</button>
            <button type="button" data-act="share" aria-label="Share ${h.name}">${svg('send')}</button>
          </div>
        </article>`).join('');
      const notes = [
        'Mira prefers morning light shots for Cedar Ridge.',
        'Summit Pavilion needs a resurvey of the courtyard pool heater.',
        'River Glass Flat HOA packet is ready for buyers.',
        'Mist Hollow loft staging softens the north wall.',
        'Pine Court study can double as a nursery.',
      ].map((n,i)=>`<article class="hl-page-card"><p class="hl-meta">Note ${i+1}</p><p>${n}</p></article>`).join('');
      return `<div class="hl-page">
        <div class="hl-page-head">
          <div><h1>Listings</h1><p class="hl-meta">Matching homes, price history and agent notes · fictional sample</p></div>
          <div class="db-ui-seg" role="group" aria-label="Mode" data-list-mode>
            <button type="button" data-v="buy" aria-pressed="${mode === 'buy'}">Buy</button>
            <button type="button" data-v="rent" aria-pressed="${mode === 'rent'}">Rent</button>
          </div>
        </div>
        <div class="db-ui-grid" style="margin-bottom:14px">
          <div class="hl-page-card db-ui-kpi"><b class="num">${HOMES.length}</b><span>Homes in market</span></div>
          <div class="hl-page-card db-ui-kpi"><b class="num">3</b><span>Open houses</span></div>
          <div class="hl-page-card db-ui-kpi"><b class="num">12</b><span>Saved searches</span></div>
          <div class="hl-page-card db-ui-kpi"><b class="num">4</b><span>Agent notes</span></div>
        </div>
        <div class="hl-page-grid" data-list-grid>${rows}</div>
        <h2 style="margin:20px 0 10px;font-size:1.1rem">Agent notes</h2>
        <div class="hl-page-grid">${notes}</div>
        <p style="margin-top:12px"><button type="button" class="hl-btn" data-note-toast>Ping Mira</button></p>
      </div>`;
    }
    if (page.id === 'showings') {
      const cards = viewings.map((v) => {
        const d = dayOffset(v.day);
        const h = HOMES.find((x) => x.id === v.home);
        return `<article class="hl-page-card mat-glass-frost">
          <div class="hl-row"><h3>${h.name}</h3><span class="num">${fmtDate(d)}</span></div>
          <p class="hl-meta">${fmtDate(d, { weekday: 'long' })} · ${v.time} · ${h.place}</p>
          <p class="hl-meta">${h.blurb}</p>
          <button type="button" class="hl-btn" data-reschedule="${v.home}">Reschedule</button>
        </article>`;
      }).join('');
      const extras = HOMES.slice(0,4).map((h,i)=>`<article class="hl-page-card"><div class="hl-row"><strong>${h.name}</strong><span class="hl-meta">Waitlist ${i+1}</span></div><p class="hl-meta">${h.place}</p><button type="button" class="hl-btn" data-wait="${h.id}">Join waitlist</button></article>`).join('');
      return `<div class="hl-page">
        <div class="hl-page-head">
          <div><h1>Showings</h1><p class="hl-meta">Your viewings · fictional calendar</p></div>
          <button type="button" class="hl-btn primary" data-book-page>Book a viewing</button>
        </div>
        <div class="db-ui-grid" style="margin-bottom:14px">
          <div class="hl-page-card db-ui-kpi"><b class="num">${viewings.length}</b><span>Upcoming</span></div>
          <div class="hl-page-card db-ui-kpi"><b class="num">2</b><span>This week</span></div>
          <div class="hl-page-card db-ui-kpi"><b class="num">1</b><span>Needs confirm</span></div>
        </div>
        ${window.DB?.ui ? window.DB.ui.calendar({ days: 28, active: 12 }) : ''}
        <div class="hl-page-grid" style="margin-top:16px">${cards}</div>
        <h2 style="margin:20px 0 10px;font-size:1.1rem">Waitlist</h2>
        <div class="hl-page-grid">${extras}</div>
      </div>`;
    }
    if (page.id === 'settings') {
      const toggles = ['Email alerts','SMS reminders','Open-house digests','Price drops','New matches in Cedar Ridge','Share activity with team','Weekly digest','Quiet hours','Calendar sync','Export CSV','Partner MLS feed','Staging checklist']
        .map((l,i)=>`<label class="hl-page-card" style="display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:56px"><span>${l}</span><input type="checkbox" ${i<3?'checked':''} style="width:20px;height:20px"></label>`).join('');
      return `<div class="hl-page">
        <div class="hl-page-head">
          <div><h1>Settings</h1><p class="hl-meta">Preferences · fictional</p></div>
          <div class="db-ui-seg" role="group" aria-label="View state" data-ui-state>
            <button type="button" data-v="ready" aria-pressed="true">Ready</button>
            <button type="button" data-v="loading" aria-pressed="false">Loading</button>
            <button type="button" data-v="empty" aria-pressed="false">Empty</button>
            <button type="button" data-v="error" aria-pressed="false">Error</button>
          </div>
        </div>
        <div data-settings-body>
          <div class="db-ui-grid" style="margin-bottom:14px">
            <div class="hl-page-card db-ui-kpi"><b class="num">6</b><span>Alert rules</span></div>
            <div class="hl-page-card db-ui-kpi"><b class="num">2</b><span>Markets</span></div>
            <div class="hl-page-card db-ui-kpi"><b class="num">1</b><span>Agent seat</span></div>
          </div>
          <div class="hl-page-grid">
            <div class="hl-page-card mat-glass-frost">${window.DB?.ui?.field({ label: 'Display name', value: 'Mira Chen', id: 'dn' }) || ''}</div>
            <div class="hl-page-card mat-glass-frost">${window.DB?.ui?.field({ label: 'Alert email', value: 'mira@haven.example', id: 'em', type: 'email' }) || ''}</div>
            <div class="hl-page-card mat-glass-frost">${window.DB?.ui?.field({ label: 'Default market', id: 'mkt', options: PLACES.map((p) => ({ value: p, label: p })) }) || ''}</div>
            <div class="hl-page-card mat-glass-frost">${window.DB?.ui?.field({ label: 'Phone', value: '+1 (555) 014-2200', id: 'ph' }) || ''}</div>
          </div>
          <h2 style="margin:20px 0 10px;font-size:1.1rem">Notifications</h2>
          <div class="hl-page-grid">${toggles}</div>
          <h2 style="margin:20px 0 10px;font-size:1.1rem">Team seats</h2>
          <div class="db-ui-table-wrap"><table class="db-ui-table"><thead><tr><th>Name</th><th>Role</th><th>Markets</th></tr></thead>
          <tbody>
            <tr tabindex="0"><td>Mira Chen</td><td>Lead agent</td><td>Cedar Ridge</td></tr>
            <tr tabindex="0"><td>Jonah Hale</td><td>Buyer specialist</td><td>Harbor Mill</td></tr>
            <tr tabindex="0"><td>Rae Okonkwo</td><td>Staging</td><td>All</td></tr>
            <tr tabindex="0"><td>Samir Patel</td><td>Transactions</td><td>South Quay</td></tr>
            <tr tabindex="0"><td>Elena Vogt</td><td>Photography</td><td>Alpine Reach</td></tr>
          </tbody></table></div>
          <p style="margin-top:16px"><button type="button" class="hl-btn primary" data-save-settings>Save preferences</button>
          <button type="button" class="hl-btn" data-export>Export sample data</button></p>
        </div>
      </div>`;
    }
    return '';
  }

  function wirePage(host, page) {
    paintIcons(host);
    host.querySelector('[data-list-mode]')?.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      mode = b.dataset.v;
      host.querySelectorAll('[data-list-mode] button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const grid = host.querySelector('[data-list-grid]');
      if (grid) {
        grid.innerHTML = HOMES.map((h) => `
          <article class="hl-page-card mat-glass-frost" tabindex="0">
            <div class="hl-row"><h3>${h.name}</h3><strong class="num">${money(mode === 'rent' ? h.rent : h.price)}</strong></div>
            <p class="hl-meta">${h.place} · ${h.type} · ${h.beds} bed</p>
            <div class="hl-chart">${priceHistorySvg(h)}</div>
          </article>`).join('');
      }
    });
    host.querySelector('[data-note-toast]')?.addEventListener('click', () => toast('Note sent · sample'));
    host.querySelector('[data-book-page]')?.addEventListener('click', () => toast('Slot requested · sample'));
    host.querySelectorAll('[data-reschedule]').forEach((b) => b.addEventListener('click', () => toast('Reschedule · sample')));
    host.querySelector('[data-save-settings]')?.addEventListener('click', () => toast('Preferences saved · sample'));
    host.querySelector('[data-export]')?.addEventListener('click', () => toast('Export ready · sample'));
    host.querySelectorAll('[data-wait]').forEach((b) => b.addEventListener('click', () => toast('Waitlist · sample')));
    host.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => toast(`${b.dataset.act} · sample`)));
    const body = host.querySelector('[data-settings-body]');
    const ready = body?.innerHTML;
    host.querySelector('[data-ui-state]')?.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b || !body) return;
      host.querySelectorAll('[data-ui-state] button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const v = b.dataset.v;
      if (v === 'loading') body.innerHTML = `<div class="hl-page-card" role="status"><p>Loading…</p>${window.DB?.ui?.skeleton(3) || ''}</div>`;
      else if (v === 'empty') body.innerHTML = `<div class="hl-page-card"><p>No preferences yet.</p><button type="button" class="hl-btn" data-fill>Load defaults</button></div>`;
      else if (v === 'error') body.innerHTML = `<div class="hl-page-card"><p>Could not load settings.</p><button type="button" class="hl-btn" data-retry>Retry</button></div>`;
      else body.innerHTML = ready;
      body.querySelector('[data-fill],[data-retry]')?.addEventListener('click', () => { body.innerHTML = ready; paintIcons(host); });
    });
    host.querySelectorAll('.db-ui-cal-day').forEach((b) => b.addEventListener('click', () => {
      host.querySelectorAll('.db-ui-cal-day').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      toast(`Day ${b.dataset.day} · sample`);
    }));
  }

  const main = $('main[data-main]') || $('main');
  const overview = $('[data-page-panel="overview"]');

  if (window.DB?.onVisible) {
    window.DB.onVisible(root, (v) => { document.documentElement.dataset.motionPaused = v ? '' : '1'; });
  }

  if (window.DB?.ui) {
    window.DB.ui.mount({
      main,
      overview,
      pages: PAGES,
      brand: 'Haven Listings',
      renderPage: (page) => {
        const html = renderPage(page);
        queueMicrotask(() => {
          const host = main.querySelector('[data-db-page-host]');
          if (host) wirePage(host, page);
        });
        return html;
      },
    });
  } else if (window.DB?.route) {
    window.DB.route(PAGES, (id, page) => {
      overview.hidden = id !== 'overview';
    });
  }

  // Keep notch depth responsive
  const device = $('.hl-device');
  if (device && window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      const h = device.getBoundingClientRect().height;
      const depth = Math.round(Math.max(56, Math.min(88, h * 0.09)));
      const opts = JSON.parse(device.dataset.shapeOpts || '{}');
      if (opts.notches?.[0]) opts.notches[0].depth = depth;
      device.dataset.shapeOpts = JSON.stringify(opts);
      import('../_shared/shape/bind.js').then((m) => m.bindShape(device)).catch(() => {});
    });
    ro.observe(device);
  }

  document.documentElement.dataset.ready = 'true';
})();
