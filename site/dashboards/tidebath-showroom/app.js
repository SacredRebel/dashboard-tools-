/* Tidebath Showroom: photo room carousel, hotspots, multipage + motion.
   Fictional brand and data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = $('[data-db-app]') || document.body;
  function toast(msg) {
    const t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(() => { t.hidden = true; }, 2200);
  }
  const ICON = {
    chevLeft: '<path d="m15 18-6-6 6-6"/>',
    chevRight: '<path d="m9 6 6 6-6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    wave: '<path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>',
    phone: '<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/>',
    twitter: '<path d="M22 5.8c-.7.3-1.5.5-2.3.6A4 4 0 0 0 21.4 4a8 8 0 0 1-2.6 1 4 4 0 0 0-6.9 3.7A11.4 11.4 0 0 1 3.2 4.7a4 4 0 0 0 1.3 5.4 4 4 0 0 1-1.8-.5v.1a4 4 0 0 0 3.2 4 4 4 0 0 1-1.8.1 4 4 0 0 0 3.8 2.8A8.1 8.1 0 0 1 2 18.6a11.4 11.4 0 0 0 6.2 1.8c7.4 0 11.5-6.2 11.5-11.5v-.5A8 8 0 0 0 22 5.8z"/>',
    rss: '<path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.5"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    youtube: '<path d="M22.5 7.2a2.8 2.8 0 0 0-2-2C18.9 4.8 12 4.8 12 4.8s-6.9 0-8.5.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1.2 12a29 29 0 0 0 .3 4.8 2.8 2.8 0 0 0 2 2c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22.8 12a29 29 0 0 0-.3-4.8z"/><path d="m10 15.2 5.2-3.2L10 8.8z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
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
  paintIcons();

  $('[data-mark]').innerHTML = `<svg viewBox="0 0 36 28" aria-hidden="true">
    <path d="M2 16c3.5-5 7-5 10.5 0s7 5 10.5 0 7-5 11 0" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M4 22c3-4 6-4 9 0s6 4 9 0 6-4 10 0" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" opacity="0.55"/>
    <circle cx="18" cy="8" r="3.2" fill="var(--accent)"/>
  </svg>`;

  /* —— rooms (fictional layouts + photo media) —— */
  const ROOMS = [
    {
      id: 'coral',
      name: 'Coral Compact · 6 m²',
      size: '6',
      photo: 'media/room-coral.webp',
      fixtures: [
        { id: 'tub', label: 'Oval tub', detail: 'Cast acrylic · 150 cm · soft overflow', x: 38, y: 62 },
        { id: 'tap', label: 'Wall tap', detail: 'Brushed chrome mixer · dual handle', x: 48, y: 36 },
        { id: 'vanity', label: 'Orange vanity', detail: 'Lacquered oak · two drawers', x: 68, y: 52 },
      ],
    },
    {
      id: 'mist',
      name: 'Mist Round · 5.5 m²',
      size: '5.5',
      photo: 'media/room-mist.webp',
      fixtures: [
        { id: 'mirror', label: 'Round mirror', detail: 'Frosted rim · LED halo 3000 K', x: 50, y: 28 },
        { id: 'basin', label: 'Pedestal basin', detail: 'Fine ceramic · soft overflow', x: 42, y: 58 },
        { id: 'shower', label: 'Walk-in glass', detail: '8 mm clear · brushed rail', x: 72, y: 48 },
      ],
    },
    {
      id: 'timber',
      name: 'Timber Check · 7 m²',
      size: '7',
      photo: 'media/room-timber.webp',
      fixtures: [
        { id: 'wc', label: 'Wall-hung WC', detail: 'Rimless · soft-close seat', x: 28, y: 58 },
        { id: 'cabinet', label: 'Walnut cabinet', detail: 'Solid walnut · matte lacquer', x: 68, y: 48 },
        { id: 'floor', label: 'Checkered floor', detail: 'Porcelain 20×20 · matte', x: 50, y: 78 },
      ],
    },
    {
      id: 'slate',
      name: 'Slate Niche · 6.5 m²',
      size: '6.5',
      photo: 'media/room-slate.webp',
      fixtures: [
        { id: 'niche', label: 'Shower niche', detail: 'Recessed tile · LED strip', x: 70, y: 40 },
        { id: 'bench', label: 'Stone bench', detail: 'Honed basalt · heated', x: 55, y: 62 },
        { id: 'rain', label: 'Rain head', detail: '250 mm · brushed steel', x: 62, y: 28 },
      ],
    },
  ];

  let idx = 0;
  let activeHot = 0;

  function renderCarousel() {
    const n = ROOMS.length;
    const left = ROOMS[(idx - 1 + n) % n];
    const mid = ROOMS[idx];
    const right = ROOMS[(idx + 1) % n];
    const host = $('[data-carousel]');
    const bay = (room, side) => `<article class="tb-bay tb-bay-${side}${side === 'mid' ? ' tb-ambient' : ''}" aria-hidden="${side !== 'mid'}">
      <img src="${room.photo}" width="1024" height="1024" alt="" decoding="async">
      ${side === 'mid' ? '<div class="tb-hots" data-hots></div>' : ''}
    </article>`;
    host.innerHTML = `<div class="tb-platform" aria-hidden="true"></div>
      <div class="tb-bays" role="img" aria-label="${mid.name}">
        ${bay(left, 'left')}${bay(mid, 'mid')}${bay(right, 'right')}
      </div>`;

    const hots = mid.fixtures.map((f, i) => `<button type="button" class="tb-hot" style="left:${f.x}%;top:${f.y}%" data-hot="${i}"
        aria-pressed="${i === activeHot}" aria-label="${f.label}">
        ${svg('wave', 1.8)}
        ${i === activeHot ? `<span class="tb-hot-label">Look closer</span>` : ''}
      </button>`).join('');
    $('[data-hots]', host).innerHTML = hots;

    $('[data-roomname]').textContent = mid.name;
    $('.tb-badge .num').textContent = mid.size;

    $$('[data-hot]', host).forEach((btn) => {
      btn.addEventListener('click', () => {
        activeHot = +btn.dataset.hot;
        renderCarousel();
        showTip(mid.fixtures[activeHot]);
        toast(`${mid.fixtures[activeHot].label} · sample`);
        $(`[data-hot="${activeHot}"]`, host)?.focus();
      });
    });
  }

  function showTip(f) {
    const tip = $('[data-tip]');
    $('[data-tip-title]').textContent = f.label;
    $('[data-tip-body]').textContent = f.detail;
    tip.hidden = false;
    clearTimeout(showTip._t);
    showTip._t = setTimeout(() => { tip.hidden = true; }, 4200);
  }

  $('[data-prev]').addEventListener('click', () => {
    idx = (idx - 1 + ROOMS.length) % ROOMS.length;
    activeHot = 0;
    renderCarousel();
    toast(`${ROOMS[idx].name} · sample`);
  });
  $('[data-next]').addEventListener('click', () => {
    idx = (idx + 1) % ROOMS.length;
    activeHot = 0;
    renderCarousel();
    toast(`${ROOMS[idx].name} · sample`);
  });

  /* —— lower board —— */
  const SOCIAL = [
    { id: 'twitter', label: 'Tidebath on X', href: '#' },
    { id: 'rss', label: 'Inspiration feed', href: '#' },
    { id: 'facebook', label: 'Community board', href: '#' },
    { id: 'youtube', label: 'Install videos', href: '#' },
  ];
  $('[data-social]').innerHTML = SOCIAL.map((s) =>
    `<li><a href="${s.href}"><span aria-hidden="true">${svg(s.id)}</span>${s.label}</a></li>`).join('');

  const PRODUCTS = [
    { id: 'bidet', label: 'Bidet' },
    { id: 'shower', label: 'Shower' },
    { id: 'sink', label: 'Basin' },
    { id: 'tap', label: 'Tap' },
    { id: 'tub', label: 'Bath' },
  ];
  function productArt(id) {
    const arts = {
      bidet: `<svg viewBox="0 0 36 36"><ellipse cx="18" cy="24" rx="12" ry="6" fill="var(--chrome)"/><rect x="10" y="12" width="16" height="12" rx="4" fill="var(--tile-w)" stroke="var(--chrome)"/><circle cx="18" cy="18" r="3" fill="var(--surface-2)"/></svg>`,
      shower: `<svg viewBox="0 0 36 36"><rect x="12" y="6" width="12" height="22" rx="2" fill="var(--glass)" stroke="var(--chrome)"/><path d="M18 6v-2M14 10h8" stroke="var(--chrome)" stroke-width="1.5"/><circle cx="18" cy="14" r="2" fill="var(--accent)"/></svg>`,
      sink: `<svg viewBox="0 0 36 36"><ellipse cx="18" cy="20" rx="12" ry="7" fill="var(--tile-w)" stroke="var(--chrome)"/><rect x="16" y="10" width="4" height="8" fill="var(--chrome)"/><circle cx="18" cy="10" r="2.5" fill="var(--chrome)"/></svg>`,
      tap: `<svg viewBox="0 0 36 36"><path d="M12 22h12v3H12z" fill="var(--chrome)"/><path d="M18 10v12M14 10h8" stroke="var(--chrome)" stroke-width="2.5" stroke-linecap="round"/><circle cx="18" cy="8" r="3" fill="var(--accent)"/></svg>`,
      tub: `<svg viewBox="0 0 36 36"><ellipse cx="18" cy="22" rx="14" ry="7" fill="var(--tile-w)" stroke="var(--chrome)" stroke-width="1.5"/><path d="M8 18h20" stroke="var(--chrome)" stroke-width="2"/><rect x="10" y="12" width="4" height="6" rx="1" fill="var(--orange)"/></svg>`,
    };
    return arts[id] || arts.sink;
  }
  let prod = 0;
  function renderProducts() {
    $('[data-products]').innerHTML = PRODUCTS.map((p, i) =>
      `<button type="button" class="tb-prod" role="listitem" data-prod="${i}" aria-pressed="${i === prod}" aria-label="${p.label}">${productArt(p.id)}</button>`).join('');
  }
  renderProducts();
  $('[data-products]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-prod]');
    if (!b) return;
    prod = +b.dataset.prod;
    renderProducts();
    $('[data-download] span').textContent = `Download ${PRODUCTS[prod].label} sheet`;
    $(`[data-prod="${prod}"]`)?.focus();
  });
  $('[data-download]').addEventListener('click', (e) => {
    e.preventDefault();
    e.currentTarget.querySelector('span').textContent = 'Saved to downloads';
  });

  const DOWNLOADS = [
    { t: 'Dimension tables', href: '#' },
    { t: 'Certificates', href: '#' },
    { t: 'CAD blocks', href: '#' },
    { t: 'Warranty cards', href: '#' },
  ];
  $('[data-downloads]').innerHTML = DOWNLOADS.map((d) =>
    `<li><a href="${d.href}">${d.t}</a></li>`).join('');

  $('[data-contact]').innerHTML = `
    <li><span class="tb-ico">${svg('phone')}</span><a href="tel:+15550148213">+1 (555) 014-8213</a></li>
    <li><span class="tb-ico">${svg('mail')}</span><a href="mailto:hello@tidebath.example">hello@tidebath.example</a></li>`;

  const STORES = {
    portland: { city: 'Portland', addr: '214 Reed Avenue · open today until 18:00' },
    austin: { city: 'Austin', addr: '88 Lavaca Street · open today until 19:00' },
    seattle: { city: 'Seattle', addr: '41 Pike Place annex · closed Sundays' },
    denver: { city: 'Denver', addr: '9 Wynkoop Lane · open today until 17:30' },
  };

  function setStoreMsg(html, cls) {
    const el = $('[data-storemsg]');
    el.className = 'tb-storemsg' + (cls ? ' ' + cls : '');
    el.innerHTML = html;
  }

  $('[data-store-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('[data-city]').value.trim().toLowerCase();
    if (!q) {
      setStoreMsg('Enter a town to find a Tidebath partner.', 'is-empty');
      return;
    }
    const hit = Object.values(STORES).find((s) => s.city.toLowerCase().includes(q) || q.includes(s.city.toLowerCase().slice(0, 4)));
    if (!hit) {
      setStoreMsg(`No partner store near “${$('[data-city]').value.trim()}”. Try Portland, Austin, Seattle or Denver.`, 'is-error');
      return;
    }
    setStoreMsg(`<b>${hit.city}</b> — ${hit.addr}`);
  });
  $('[data-map]').addEventListener('click', (e) => {
    e.preventDefault();
    const msg = $('[data-storemsg]');
    if (!msg.textContent || msg.classList.contains('is-empty') || msg.classList.contains('is-error')) {
      setStoreMsg('Search a town first, then open the map.', 'is-empty');
    } else {
      setStoreMsg(msg.innerHTML + ' · map preview ready');
    }
  });

  renderCarousel();

  function staggerReveal() {
    $$('.tb-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 45 * i}ms`);
      el.classList.add('tb-reveal-in');
    });
  }

  const PAGES = [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'catalog', name: 'Catalog', pattern: 'List' },
    { id: 'orders', name: 'Orders', pattern: 'List' },
    { id: 'settings', name: 'Settings', pattern: 'Settings' },
  ];
  const main = $('[data-main]');
  const overview = $('[data-page-panel="overview"]');
  let stub = null;
  const seenPages = new Set();
  function ensureStub() {
    if (stub) return stub;
    stub = document.createElement('div');
    stub.setAttribute('data-db-stub-host-legacy', '');
    stub.hidden = true;
    main.appendChild(stub);
    return stub;
  }
  function setNav(id) {
    $$('.tb-pages a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href === `#/${id}`) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  function pageHtml(page) {
    if (page.id === 'catalog') {
      return `<section class="tb-page" data-db-page="catalog" aria-labelledby="p-h">
        <h1 id="p-h">Catalog</h1>
        <p class="tb-page-lead">Fixtures for compact layouts. English copy · fictional Tidebath line.</p>
        <div class="tb-page-seg" role="group" aria-label="Catalog state" data-cat-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-cat-body></div>
      </section>`;
    }
    if (page.id === 'orders') {
      return `<section class="tb-page" data-db-page="orders" aria-labelledby="p-h">
        <h1 id="p-h">Orders</h1>
        <p class="tb-page-lead">Showroom sample orders.</p>
        <div class="tb-page-grid">
          <article class="tb-page-card"><div class="tb-row"><strong>Coral Compact kit</strong><span>Packed</span></div></article>
          <article class="tb-page-card"><div class="tb-row"><strong>Mist Round taps</strong><span>Shipped</span></div></article>
        </div>
        <button type="button" class="tb-btn" data-new-order>Place sample order</button>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="tb-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="tb-page-lead">Locale stays English for this fictional brand.</p>
        <div class="tb-page-grid">
          <article class="tb-page-card"><div class="tb-row"><strong>Language</strong><span>English</span></div></article>
          <article class="tb-page-card"><div class="tb-row"><strong>Units</strong><span>Metric</span></div></article>
        </div>
        <button type="button" class="tb-btn ghost" data-save-settings>Save preferences</button>
      </section>`;
    }
    return `<section class="tb-page"><h1>${page.name}</h1></section>`;
  }
  function wirePage(host, page) {
    if (page.id === 'catalog') {
      const body = host.querySelector('[data-cat-body]');
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="tb-loading" role="status"><p>Loading catalog…</p><div class="tb-skel"></div><div class="tb-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="tb-empty"><p>No fixtures in this filter.</p></div>`;
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="tb-error"><p>Could not load catalog.</p><button type="button" class="tb-btn ghost" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="tb-page-grid">
          <article class="tb-page-card"><div class="tb-row"><span>Oval tub</span><strong>Coral</strong></div></article>
          <article class="tb-page-card"><div class="tb-row"><span>Walk-in glass</span><strong>Mist</strong></div></article>
          <article class="tb-page-card"><div class="tb-row"><span>Walnut vanity</span><strong>Timber</strong></div></article>
        </div>`;
      };
      paint('ready');
      seg(host.querySelector('[data-cat-tabs]'), (v) => paint(v));
    }
    if (page.id === 'orders') {
      host.querySelector('[data-new-order]')?.addEventListener('click', () => toast('Order placed · sample'));
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
    window.DB._legacyRouteDisabled && window.DB.route(PAGES, (id, page) => {
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

  
/* === DB multipage polish (dense kit) === */
(function wirePages() {
  const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"catalog","name":"Catalog","pattern":"List"},{"id":"orders","name":"Orders","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Tidebath Showroom" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
