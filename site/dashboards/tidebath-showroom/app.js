/* Tidebath Showroom: curved 3-bay SVG carousel, hotspots, store search.
   Fictional brand and data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
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

  /* —— rooms (fictional layouts) —— */
  const ROOMS = [
    {
      id: 'coral',
      name: 'Coral Compact · 6 m²',
      size: '6',
      wall: '#f0f2f5',
      floor: '#3a414c',
      accent: 'var(--orange)',
      accentD: 'var(--orange-d)',
      fixtures: [
        { id: 'tub', label: 'Oval tub', detail: 'Cast acrylic · 150 cm · soft overflow', x: 52, y: 58 },
        { id: 'tap', label: 'Wall tap', detail: 'Brushed chrome mixer · dual handle', x: 48, y: 38 },
        { id: 'vanity', label: 'Orange vanity', detail: 'Lacquered oak · two drawers', x: 72, y: 48 },
      ],
    },
    {
      id: 'mist',
      name: 'Mist Round · 5.5 m²',
      size: '5.5',
      wall: '#e8eef2',
      floor: '#5a6a78',
      accent: '#7a93a8',
      accentD: '#5a7388',
      fixtures: [
        { id: 'mirror', label: 'Round mirror', detail: 'Frosted rim · LED halo 3000 K', x: 50, y: 32 },
        { id: 'basin', label: 'Pedestal basin', detail: 'Fine ceramic · soft overflow', x: 50, y: 52 },
        { id: 'shower', label: 'Walk-in glass', detail: '8 mm clear · brushed rail', x: 78, y: 45 },
      ],
    },
    {
      id: 'timber',
      name: 'Timber Check · 7 m²',
      size: '7',
      wall: '#f5f0ea',
      floor: '#2c241c',
      accent: '#8b5a3c',
      accentD: '#6a4028',
      fixtures: [
        { id: 'wc', label: 'Wall-hung WC', detail: 'Rimless · soft-close seat', x: 30, y: 55 },
        { id: 'cabinet', label: 'Walnut cabinet', detail: 'Solid walnut · matte lacquer', x: 68, y: 48 },
        { id: 'floor', label: 'Checkered floor', detail: 'Porcelain 20×20 · matte', x: 50, y: 78 },
      ],
    },
    {
      id: 'slate',
      name: 'Slate Niche · 6.5 m²',
      size: '6.5',
      wall: '#eceff3',
      floor: '#2a323c',
      accent: '#4a6fa5',
      accentD: '#345380',
      fixtures: [
        { id: 'niche', label: 'Shower niche', detail: 'Recessed tile · LED strip', x: 70, y: 40 },
        { id: 'bench', label: 'Stone bench', detail: 'Honed basalt · heated', x: 55, y: 62 },
        { id: 'rain', label: 'Rain head', detail: '250 mm · brushed steel', x: 62, y: 28 },
      ],
    },
  ];

  let idx = 0;
  let activeHot = 0;

  function bayInterior(r, w, h, ox) {
    const floorY = h * 0.62;
    const tiles = [];
    for (let y = 8; y < floorY - 4; y += 14) {
      for (let x = 6; x < w - 6; x += 14) {
        tiles.push(`<rect x="${ox + x}" y="${y}" width="12" height="12" fill="var(--tile-w)" opacity="0.55" rx="1"/>`);
      }
    }
    const floorTiles = [];
    for (let y = floorY; y < h - 10; y += 12) {
      for (let x = 4; x < w - 4; x += 12) {
        const odd = ((x / 12) + (y / 12)) % 2 < 1;
        floorTiles.push(`<rect x="${ox + x}" y="${y}" width="11" height="11" fill="${odd ? r.floor : '#4a525c'}" opacity="0.95" rx="0.5"/>`);
      }
    }
    /* fixtures vary slightly by room id */
    let fixtures = '';
    if (r.id === 'coral' || r.id === 'slate') {
      fixtures = `
        <ellipse cx="${ox + w * 0.38}" cy="${floorY + 18}" rx="38" ry="16" fill="var(--tile-w)" stroke="var(--chrome)" stroke-width="2"/>
        <ellipse cx="${ox + w * 0.38}" cy="${floorY + 16}" rx="30" ry="10" fill="var(--surface-2)"/>
        <rect x="${ox + w * 0.62}" y="${floorY - 48}" width="48" height="58" rx="4" fill="${r.accent}"/>
        <rect x="${ox + w * 0.64}" y="${floorY - 42}" width="40" height="8" rx="2" fill="${r.accentD}" opacity="0.5"/>
        <rect x="${ox + w * 0.64}" y="${floorY - 28}" width="40" height="8" rx="2" fill="${r.accentD}" opacity="0.5"/>
        <ellipse cx="${ox + w * 0.74}" cy="${floorY - 56}" rx="16" ry="6" fill="var(--tile-w)" stroke="var(--chrome)" stroke-width="1.5"/>
        <rect x="${ox + w * 0.18}" y="${floorY - 36}" width="22" height="36" rx="4" fill="var(--tile-w)" stroke="var(--chrome)" stroke-width="1.5"/>
        <circle cx="${ox + w * 0.48}" cy="${floorY - 8}" r="3" fill="var(--chrome)"/>
        <path d="M${ox + w * 0.48} ${floorY - 20} v12" stroke="var(--chrome)" stroke-width="2"/>`;
    } else if (r.id === 'mist') {
      fixtures = `
        <circle cx="${ox + w * 0.5}" cy="${h * 0.28}" r="28" fill="none" stroke="var(--chrome)" stroke-width="3"/>
        <circle cx="${ox + w * 0.5}" cy="${h * 0.28}" r="22" fill="var(--surface)" opacity="0.4"/>
        <ellipse cx="${ox + w * 0.5}" cy="${floorY + 8}" rx="22" ry="10" fill="var(--tile-w)" stroke="var(--chrome)" stroke-width="1.5"/>
        <rect x="${ox + w * 0.46}" y="${floorY - 28}" width="8" height="32" rx="2" fill="var(--chrome)"/>
        <rect x="${ox + w * 0.72}" y="${h * 0.2}" width="4" height="${floorY - h * 0.2}" fill="var(--chrome)" opacity="0.7"/>
        <rect x="${ox + w * 0.72}" y="${h * 0.2}" width="36" height="${floorY - h * 0.2}" fill="var(--glass)" stroke="var(--chrome)" stroke-width="1"/>`;
    } else {
      fixtures = `
        <rect x="${ox + w * 0.18}" y="${floorY - 40}" width="28" height="40" rx="6" fill="var(--tile-w)" stroke="var(--chrome)" stroke-width="1.5"/>
        <rect x="${ox + w * 0.55}" y="${floorY - 52}" width="56" height="62" rx="3" fill="${r.accent}"/>
        <rect x="${ox + w * 0.58}" y="${floorY - 46}" width="50" height="10" rx="2" fill="${r.accentD}" opacity="0.45"/>
        <path d="M${ox + 8} ${floorY} h${w - 16}" stroke="${r.floor}" stroke-width="2" opacity="0.3"/>
        <g opacity="0.35">${Array.from({ length: 6 }, (_, i) =>
          `<rect x="${ox + 12 + i * 22}" y="${floorY + 4}" width="18" height="18" fill="${i % 2 ? '#fff' : r.floor}"/>`).join('')}</g>`;
    }
    return `
      <rect x="${ox}" y="0" width="${w}" height="${h}" fill="${r.wall}"/>
      ${tiles.join('')}
      <rect x="${ox}" y="${floorY}" width="${w}" height="${h - floorY}" fill="${r.floor}" opacity="0.35"/>
      ${floorTiles.join('')}
      ${fixtures}
      <rect x="${ox}" y="0" width="6" height="${h}" fill="var(--surface)" opacity="0.85"/>
      <rect x="${ox + w - 6}" y="0" width="6" height="${h}" fill="var(--surface)" opacity="0.85"/>`;
  }

  function renderCarousel() {
    const n = ROOMS.length;
    const left = ROOMS[(idx - 1 + n) % n];
    const mid = ROOMS[idx];
    const right = ROOMS[(idx + 1) % n];
    const W = 920, H = 420;

    const platform = `
      <ellipse cx="460" cy="390" rx="420" ry="48" fill="var(--stage-deep)" opacity="0.55"/>
      <path d="M40 340 Q460 420 880 340 L860 300 Q460 370 60 300 Z" fill="var(--stage)"/>
      <path d="M60 300 Q460 370 860 300" fill="none" stroke="var(--surface)" stroke-width="3" opacity="0.7"/>
      <path d="M80 310 Q460 378 840 310" fill="none" stroke="var(--stage-deep)" stroke-width="1.5" opacity="0.5"/>`;

    /* three perspective bays on the curved stage */
    const bayW = 220, bayH = 250;
    const bays = [
      { room: left, x: 70, y: 70, skew: -0.18, scale: 0.88, opacity: 0.72 },
      { room: mid, x: 350, y: 40, skew: 0, scale: 1, opacity: 1 },
      { room: right, x: 630, y: 70, skew: 0.18, scale: 0.88, opacity: 0.72 },
    ];

    const baySvg = bays.map((b, i) => {
      const ox = 0;
      const inner = bayInterior(b.room, bayW, bayH, ox);
      const tx = b.x + (1 - b.scale) * bayW * 0.15;
      const ty = b.y + (1 - b.scale) * 20;
      return `<g transform="translate(${tx} ${ty}) scale(${b.scale}) skewX(${b.skew * 40})" opacity="${b.opacity}">
        <rect x="-4" y="-8" width="${bayW + 8}" height="${bayH + 16}" rx="4" fill="var(--surface)" filter="url(#tb-shade)"/>
        ${inner}
        <rect x="-2" y="-6" width="8" height="${bayH + 12}" fill="var(--surface)"/>
        <rect x="${bayW - 6}" y="-6" width="8" height="${bayH + 12}" fill="var(--surface)"/>
        ${i === 1 ? '' : `<rect x="0" y="0" width="${bayW}" height="${bayH}" fill="var(--bg)" opacity="0.15"/>`}
      </g>`;
    }).join('');

    const host = $('[data-carousel]');
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${mid.name}">
      <defs>
        <filter id="tb-shade" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#283246" flood-opacity="0.18"/>
        </filter>
        <linearGradient id="tb-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--surface)" stop-opacity="0.9"/>
          <stop offset="1" stop-color="var(--stage)" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#tb-glow)" opacity="0.01"/>
      ${platform}
      ${baySvg}
    </svg>
    <div class="tb-hots" data-hots></div>`;

    /* hotspots for center bay only */
    const hots = mid.fixtures.map((f, i) => {
      const leftPct = 38 + (f.x - 50) * 0.42;
      const topPct = 18 + f.y * 0.55;
      return `<button type="button" class="tb-hot" style="left:${leftPct}%;top:${topPct}%" data-hot="${i}"
        aria-pressed="${i === activeHot}" aria-label="${f.label}">
        ${svg('wave', 1.8)}
        ${i === activeHot ? `<span class="tb-hot-label">Look closer</span>` : ''}
      </button>`;
    }).join('');
    $('[data-hots]', host).innerHTML = hots;

    $('[data-roomname]').textContent = mid.name;
    $('.tb-badge .num').textContent = mid.size;

    $$('[data-hot]', host).forEach((btn) => {
      btn.addEventListener('click', () => {
        activeHot = +btn.dataset.hot;
        renderCarousel();
        showTip(mid.fixtures[activeHot]);
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
  });
  $('[data-next]').addEventListener('click', () => {
    idx = (idx + 1) % ROOMS.length;
    activeHot = 0;
    renderCarousel();
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
  document.documentElement.dataset.ready = 'true';
})();
