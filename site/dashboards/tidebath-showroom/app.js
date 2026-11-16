/* Tidebath Showroom: a curved wall of room layouts (CSS 3D) and four pages. Sample data is fictional. No polling; state in memory. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$' + n.toLocaleString('en-US');

  const ROOMS = [
    { id: 'coral', name: 'Coral Compact', size: 6, img: 'room-coral', tint: 'none', pins: [['corner-tub', 44, 62], ['wall-toilet', 22, 68], ['slim-basin', 76, 58]] },
    { id: 'mist', name: 'Mist Studio', size: 4, img: 'room-mist', tint: 'none', pins: [['slim-basin', 38, 60], ['mirror-cab', 40, 30]] },
    { id: 'slate', name: 'Slate Wetroom', size: 5, img: 'room-slate', tint: 'none', pins: [['walk-shower', 62, 48], ['rain-mixer', 56, 30], ['towel-rail', 24, 44]] },
    { id: 'timber', name: 'Timber Nook', size: 3, img: 'room-timber', tint: 'none', pins: [['slim-basin', 50, 58], ['mirror-cab', 50, 28]] },
    { id: 'dune', name: 'Dune Ensuite', size: 7, img: 'room-coral', tint: 'hue-rotate(18deg) saturate(0.7) brightness(1.06)', pins: [['corner-tub', 44, 62], ['rain-mixer', 70, 40]] },
    { id: 'fjord', name: 'Fjord Loft', size: 5, img: 'room-slate', tint: 'hue-rotate(-20deg) saturate(0.8)', pins: [['walk-shower', 62, 48], ['wall-toilet', 26, 66]] },
  ];
  const PRODUCTS = [
    { id: 'slim-basin', name: 'Slim basin 45', type: 'Basins', price: 189, w: 45, d: 28, fits: 3, art: 'basin', note: 'A shallow basin for walls under 90 cm wide.' },
    { id: 'walk-shower', name: 'Walk-in cabin 80', type: 'Showers', price: 640, w: 80, d: 80, fits: 4, art: 'cabin', note: 'Frameless corner cabin with a low tray.' },
    { id: 'low-tray', name: 'Low tray 80', type: 'Showers', price: 210, w: 80, d: 80, fits: 4, art: 'tray', note: 'A 3 cm acrylic tray with a hidden waste.' },
    { id: 'rain-mixer', name: 'Rain mixer tall', type: 'Taps', price: 264, w: 6, d: 18, fits: 3, art: 'tap', note: 'Single-lever mixer with a swivel spout.' },
    { id: 'corner-tub', name: 'Corner tub 130', type: 'Baths', price: 890, w: 130, d: 130, fits: 6, art: 'tub', note: 'A corner bath that leaves the door swing free.' },
    { id: 'wall-toilet', name: 'Wall toilet short', type: 'Toilets', price: 312, w: 36, d: 48, fits: 3, art: 'toilet', note: 'Short-projection pan with a concealed cistern.' },
    { id: 'mirror-cab', name: 'Mirror cabinet 60', type: 'Storage', price: 228, w: 60, d: 14, fits: 3, art: 'cabinet', note: 'Slim mirrored cabinet with a shaver socket.' },
    { id: 'towel-rail', name: 'Towel rail ladder', type: 'Storage', price: 146, w: 50, d: 9, fits: 3, art: 'rail', note: 'Heated ladder rail, 500 W.' },
    { id: 'deep-basin', name: 'Deep basin 60', type: 'Basins', price: 245, w: 60, d: 42, fits: 5, art: 'basin', note: 'A deeper bowl with a tap ledge.' },
    { id: 'soak-tub', name: 'Soak tub 150', type: 'Baths', price: 1120, w: 150, d: 70, fits: 7, art: 'tub', note: 'Straight bath with a wide rim seat.' },
  ];
  const STORES = [['Marrow Bay', 'Tidewater Lane 18'], ['Old Harbour', 'Harbor Row 4'], ['Pinecrest', 'Larch Rise 9'], ['Saltmere', 'Quay Street 31'], ['Wren Hollow', 'Mill Lane 2']];
  const S = { room: 0, q: '', type: 'All', sort: 'price', fit: false, view: 'ready', status: 'All', basket: { 'slim-basin': 1, 'rain-mixer': 1 },
    orders: [{ id: 'T-2048', date: 'Nov 12', status: 'On its way', items: { 'walk-shower': 1, 'low-tray': 1 } }, { id: 'T-2031', date: 'Nov 3', status: 'Delivered', items: { 'mirror-cab': 2 } }, { id: 'T-1987', date: 'Oct 21', status: 'Delivered', items: { 'corner-tub': 1, 'rain-mixer': 2 } }, { id: 'T-2052', date: 'Nov 15', status: 'Being packed', items: { 'towel-rail': 1 } }],
    profile: { name: 'Mira Chen', email: 'mira@tidebath.example', news: true, cm: true, sms: false } };
  const prod = (id) => PRODUCTS.find((p) => p.id === id);
  const total = (items) => Object.entries(items).reduce((s, [id, n]) => s + prod(id).price * n, 0);

  function toast(msg, undo) { const t = $('[data-toast]'); t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button">Undo</button>' : ''}`; t.hidden = false; if (undo) $('button', t).onclick = () => { undo(); t.hidden = true; };
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, undo ? 6000 : 2800); }

  /* ---------- product drawings (clay-coloured, inline SVG) ---------- */
  const G = '<defs><linearGradient id="cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--clay-1)"/><stop offset="1" stop-color="var(--clay-2)"/></linearGradient></defs>';
  const ART = {
    basin: '<path d="M14 34h72l-8 22a8 8 0 0 1-8 6H30a8 8 0 0 1-8-6z" fill="url(#cl)" stroke="var(--clay-3)"/><ellipse cx="50" cy="34" rx="36" ry="9" fill="var(--clay-1)" stroke="var(--clay-3)"/><ellipse cx="50" cy="35" rx="26" ry="5.5" fill="var(--clay-2)"/><path d="M50 16v12M44 16h12" stroke="var(--clay-3)" stroke-width="3" stroke-linecap="round"/>',
    cabin: '<path d="M22 12h56v62H22z" fill="#ffffff" fill-opacity=".55" stroke="var(--clay-3)"/><path d="M50 12v62M22 74l28 8 28-8" fill="none" stroke="var(--clay-3)"/><path d="M22 74l28 8 28-8v4l-28 8-28-8z" fill="url(#cl)" stroke="var(--clay-3)"/><path d="M58 40v10" stroke="var(--clay-3)" stroke-width="2.5" stroke-linecap="round"/>',
    tray: '<path d="M10 48l40-14 40 14-40 16z" fill="var(--clay-1)" stroke="var(--clay-3)"/><path d="M10 48v8l40 16 40-16v-8l-40 16z" fill="url(#cl)" stroke="var(--clay-3)"/><ellipse cx="50" cy="48" rx="6" ry="2.5" fill="var(--clay-3)"/>',
    tap: '<rect x="42" y="30" width="12" height="44" rx="5" fill="#e9eaec" stroke="#9aa0a8"/><path d="M48 32V20a6 6 0 0 1 6-6h14a6 6 0 0 1 6 6v6" fill="none" stroke="#9aa0a8" stroke-width="5" stroke-linecap="round"/><path d="M54 44h14" stroke="#9aa0a8" stroke-width="4" stroke-linecap="round"/><ellipse cx="48" cy="76" rx="14" ry="4" fill="#cfd2d6"/>',
    tub: '<path d="M8 38h84v10a22 22 0 0 1-22 22H30A22 22 0 0 1 8 48z" fill="url(#cl)" stroke="var(--clay-3)"/><ellipse cx="50" cy="38" rx="42" ry="10" fill="var(--clay-1)" stroke="var(--clay-3)"/><ellipse cx="50" cy="39" rx="33" ry="6.5" fill="var(--clay-2)"/><path d="M24 70v6M76 70v6" stroke="var(--clay-3)" stroke-width="4" stroke-linecap="round"/>',
    toilet: '<rect x="30" y="12" width="40" height="22" rx="4" fill="url(#cl)" stroke="var(--clay-3)"/><path d="M26 40h48a8 8 0 0 1 0 16c-4 12-12 20-24 20S30 68 26 56a8 8 0 0 1 0-16z" fill="url(#cl)" stroke="var(--clay-3)"/><ellipse cx="50" cy="46" rx="22" ry="7" fill="var(--clay-1)" stroke="var(--clay-3)"/>',
    cabinet: '<rect x="18" y="14" width="64" height="60" rx="4" fill="url(#cl)" stroke="var(--clay-3)"/><rect x="23" y="19" width="26" height="50" rx="2" fill="#eef3f8" stroke="var(--clay-3)"/><rect x="51" y="19" width="26" height="50" rx="2" fill="#e3ebf3" stroke="var(--clay-3)"/><path d="M27 60l14-34M56 54l10-24" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>',
    rail: '<path d="M30 10v70M70 10v70" stroke="#aeb3ba" stroke-width="6" stroke-linecap="round"/><path d="M30 20h40M30 34h40M30 48h40M30 62h40" stroke="#c9cdd3" stroke-width="5" stroke-linecap="round"/><path d="M36 36h28v18a4 4 0 0 1-4 4H40a4 4 0 0 1-4-4z" fill="url(#cl)" stroke="var(--clay-3)"/>',
  };
  const art = (kind, cls = '') => `<svg class="${cls}" viewBox="0 0 100 90" aria-hidden="true">${G}${ART[kind]}</svg>`;

  /* ---------- the curved wall ---------- */
  const ring = $('[data-ring]');
  ring.innerHTML = ROOMS.map((r, i) => `<div class="tb-room" data-i="${i}" role="group" aria-label="${esc(r.name)}, ${r.size} square metres" style="--tint:${r.tint}">
      <img src="media/${r.img}.webp" srcset="media/${r.img}.webp 1600w, media/${r.img}@2x.webp 3200w" sizes="(max-width: 720px) 70vw, 360px" alt="" draggable="false">
      <p class="tb-look">Look<small>closer</small></p>${r.pins.map(([p, x, y]) => `<button type="button" class="tb-pin" style="left:${x}%;top:${y}%" data-open="${p}" aria-label="${esc(prod(p).name)}"></button>`).join('')}</div>`).join('');
  function turn(to, quiet) {
    const n = ROOMS.length; S.room = ((to % n) + n) % n;
    $$('.tb-room', ring).forEach((el, i) => { let o = i - S.room; if (o > n / 2) o -= n; if (o < -n / 2) o += n; el.dataset.o = o; el.setAttribute('aria-hidden', o !== 0); $$('button', el).forEach((b) => { b.tabIndex = o === 0 ? 0 : -1; }); });
    const r = ROOMS[S.room]; $('[data-size]').textContent = r.size; $('[data-room-name]').textContent = `${r.name} · ${r.size} m²`;
    $('.tb-size').setAttribute('aria-label', `${r.name} is ${r.size} square metres. Show products that fit.`); if (!quiet && current === 'catalog') render();
  }
  ring.addEventListener('click', (e) => { const el = e.target.closest('.tb-room'); if (el && !e.target.closest('.tb-pin') && el.dataset.o !== '0') turn(+el.dataset.i); });
  let drag = null; const stage = $('[data-stage]');
  stage.addEventListener('pointerdown', (e) => { if (!e.target.closest('button')) drag = e.clientX; });
  stage.addEventListener('pointerup', (e) => { if (drag === null) return; const dx = e.clientX - drag; drag = null; if (Math.abs(dx) > 40) turn(S.room + (dx < 0 ? 1 : -1)); });
  stage.tabIndex = 0; stage.addEventListener('keydown', (e) => { if (e.target !== stage) return; if (e.key === 'ArrowLeft') turn(S.room - 1); if (e.key === 'ArrowRight') turn(S.room + 1); });

  /* ---------- overview extras ---------- */
  $('[data-social]').innerHTML = [['t', 'Tidebath on Chirp'], ['◉', 'Inspiration feed'], ['f', 'Community board'], ['▶', 'Install videos']].map(([g, l]) => `<li><button type="button" data-social="${esc(l)}" aria-label="${esc(l)}">${g}</button></li>`).join('');
  $('[data-strip]').innerHTML = ['corner-tub', 'walk-shower', 'low-tray', 'rain-mixer', 'slim-basin'].map((id) => `<button type="button" data-open="${id}" aria-label="${esc(prod(id).name)}">${art(prod(id).art)}</button>`).join('');
  $('[data-dl]').innerHTML = ['Dimension tables', 'Certificates', 'CAD blocks', 'Warranty cards'].map((d) => `<li><button type="button" data-dl="${d}">${d}</button></li>`).join('');

  /* ---------- inner pages ---------- */
  const stateBox = (items, empty, body) => S.view === 'loading' ? '<div class="tb-grid"><div class="tb-skel"></div><div class="tb-skel"></div><div class="tb-skel"></div></div>' : S.view === 'error' ? '<div class="tb-state"><p>We couldn’t load this. Check your connection, then try again.</p><button class="tb-btn tb-btn--main" data-act="retry">Try again</button></div>' : (S.view === 'empty' || !items.length) ? `<div class="tb-state"><p>${esc(empty)}</p><button class="tb-btn" data-act="clear">Clear filters</button></div>` : body(items);
  const pages = {
    overview() {},
    catalog(el) { const room = ROOMS[S.room], q = S.q.trim().toLowerCase();
      const list = PRODUCTS.filter((p) => (S.type === 'All' || p.type === S.type) && (!S.fit || p.fits <= room.size) && (!q || (p.name + p.type).toLowerCase().includes(q))).sort((a, b) => S.sort === 'price' ? a.price - b.price : S.sort === 'price-d' ? b.price - a.price : a.w - b.w);
      el.innerHTML = `<div class="tb-head"><div><h1>Product catalog</h1><p class="tb-sub">${list.length} of ${PRODUCTS.length} products. Turn the wall above to change the room.</p></div>
          <div class="tb-tools"><input class="tb-field" type="search" placeholder="Search products" aria-label="Search products" value="${esc(S.q)}" data-q><select class="tb-field" aria-label="Sort" data-sort>${[['price', 'Price: low to high'], ['price-d', 'Price: high to low'], ['width', 'Narrowest first']].map(([v, l]) => `<option value="${v}"${S.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div></div>
        <div class="tb-tools" role="group" aria-label="Type">${['All', ...new Set(PRODUCTS.map((p) => p.type))].map((t) => `<button class="tb-btn" data-type="${t}" aria-pressed="${S.type === t}">${t}</button>`).join('')}<button class="tb-btn" data-act="fit" aria-pressed="${S.fit}">Fits ${esc(room.name)} (${room.size} m²)</button></div>
        ${stateBox(list, q ? `No products match “${S.q}”.` : 'No products match these filters.', (it) => `<div class="tb-grid">${it.map((p, i) => `<button type="button" class="tb-prod" style="--i:${i}" data-open="${p.id}">${art(p.art)}<b>${esc(p.name)}</b><small>${p.type} · ${p.w} × ${p.d} cm · rooms from ${p.fits} m²</small><span class="tb-prod-row"><strong class="num">${money(p.price)}</strong><span class="tb-tag">View</span></span></button>`).join('')}</div>`)}`; },
    orders(el) { const list = S.orders.filter((o) => S.status === 'All' || o.status === S.status), b = Object.entries(S.basket);
      el.innerHTML = `<div class="tb-head"><div><h1>Orders</h1><p class="tb-sub">${S.orders.length} orders. ${b.length ? `${b.reduce((s, [, n]) => s + n, 0)} items waiting in your basket.` : 'Your basket is empty.'}</p></div></div>
        <div class="tb-three"><div class="tb-stat"><b class="num">${S.orders.filter((o) => o.status !== 'Delivered').length}</b><small>Open orders</small></div><div class="tb-stat"><b class="num">${money(S.orders.reduce((s, o) => s + total(o.items), 0))}</b><small>Ordered this season</small></div><div class="tb-stat"><b class="num">${money(total(S.basket))}</b><small>In your basket</small></div></div>
        <div class="tb-cols"><section class="tb-panel"><div class="tb-tools" role="group" aria-label="Status">${['All', 'Being packed', 'On its way', 'Delivered'].map((s) => `<button class="tb-btn" data-status="${s}" aria-pressed="${S.status === s}">${s}</button>`).join('')}</div>
            ${stateBox(list, 'No orders with this status.', (it) => it.map((o) => `<button type="button" class="tb-row" data-order="${o.id}"><span><b>${o.id} · ${Object.keys(o.items).map((id) => esc(prod(id).name)).join(', ')}</b><small>${o.date} · ${money(total(o.items))}</small></span><span class="tb-tag" data-s="${o.status}">${o.status}</span></button>`).join(''))}</section>
          <form class="tb-panel" data-place novalidate><h2>Your basket</h2>${b.length ? b.map(([id, n]) => `<div class="tb-row"><span><b>${esc(prod(id).name)}</b><small>${money(prod(id).price)} each</small></span><span class="tb-qty"><button type="button" data-less="${id}" aria-label="One fewer ${esc(prod(id).name)}">−</button><b class="num">${n}</b><button type="button" data-more="${id}" aria-label="One more ${esc(prod(id).name)}">+</button></span></div>`).join('') : '<p class="tb-sub">Nothing here yet. Add products from the catalog.</p>'}
            <div class="tb-row"><span><b>Total</b></span><strong class="num">${money(total(S.basket))}</strong></div>
            <label class="tb-label">Deliver to (postcode)<input class="tb-field" name="post" inputmode="numeric" aria-describedby="err-post"></label><p class="tb-err" id="err-post" role="alert"></p><button class="tb-btn tb-btn--main"${b.length ? '' : ' disabled'}>Place this order</button></form></div>`; },
    settings(el) { const p = S.profile, sw = (k, l) => `<label class="tb-switch"><span>${l}</span><input type="checkbox" data-pref="${k}"${p[k] ? ' checked' : ''}></label>`;
      el.innerHTML = `<div class="tb-head"><div><h1>Settings</h1><p class="tb-sub">Your details, units and what we send you.</p></div></div>
        <div class="tb-cols"><form class="tb-panel" data-profile novalidate><h2>Profile</h2><label class="tb-label">Name<input class="tb-field" name="name" value="${esc(p.name)}" aria-describedby="err-name"></label><p class="tb-err" id="err-name" role="alert"></p>
            <label class="tb-label">Email<input class="tb-field" type="email" name="email" value="${esc(p.email)}" aria-describedby="err-email"></label><p class="tb-err" id="err-email" role="alert"></p><label class="tb-label">Phone<input class="tb-field" name="phone" value="(555) 014-8200"></label><button class="tb-btn tb-btn--main">Save profile</button></form>
          <div style="display:grid;gap:16px"><section class="tb-panel"><h2>Preferences</h2>${sw('cm', 'Show sizes in centimetres')}${sw('news', 'Email me the new catalog')}${sw('sms', 'Text me when an order ships')}</section>
            <section class="tb-panel"><h2>Your stores</h2>${STORES.slice(0, 3).map(([t, a]) => `<div class="tb-row"><span><b>${t}</b><small>${a} · open 9 to 6</small></span><span class="tb-tag">Saved</span></div>`).join('')}</section>
            <section class="tb-panel"><h2>Preview a state</h2><p class="tb-sub">For design review: how lists look while loading, empty or failing.</p><label class="tb-label">Lists show<select class="tb-field" data-view>${['ready', 'loading', 'empty', 'error'].map((v) => `<option${S.view === v ? ' selected' : ''}>${v}</option>`).join('')}</select></label></section></div></div>`; },
  };

  /* ---------- drawer ---------- */
  let lastFocus = null;
  function drawer(html) { lastFocus = document.activeElement; $('[data-drawer-panel]').innerHTML = html; $('[data-drawer]').hidden = false; $('.tb-x').focus(); }
  function closeDrawer() { $('[data-drawer]').hidden = true; lastFocus?.focus?.(); }
  const top = (t, s) => `<div class="tb-drawer-top"><div><h2 id="tb-drawer-title">${esc(t)}</h2><p class="tb-sub">${esc(s)}</p></div><button class="tb-x" data-act="close" aria-label="Close">×</button></div>`;
  function openProd(id) { const p = prod(id), room = ROOMS[S.room], ok = p.fits <= room.size;
    drawer(`${top(p.name, `${p.type} · ${p.w} × ${p.d} cm`)}${art(p.art, 'art')}<p>${esc(p.note)}</p><div class="tb-panel"><div class="tb-row"><span><b>Price</b></span><strong class="num">${money(p.price)}</strong></div><div class="tb-row"><span><b>${esc(room.name)} (${room.size} m²)</b><small>${ok ? 'Fits with the door swing clear' : `Needs a room of at least ${p.fits} m²`}</small></span><span class="tb-tag" data-s="${ok ? 'Delivered' : 'On its way'}">${ok ? 'Fits' : 'Too big'}</span></div></div><div class="tb-tools"><button class="tb-btn tb-btn--main" data-add="${p.id}">Add to basket</button><button class="tb-btn" data-dl="${esc(p.name)} sheet">Download sheet</button></div>`); }
  function openOrder(id) { const o = S.orders.find((x) => x.id === id);
    drawer(`${top('Order ' + o.id, `${o.date} · ${o.status}`)}<div class="tb-panel">${Object.entries(o.items).map(([pid, n]) => `<div class="tb-row"><span><b>${esc(prod(pid).name)}</b><small>${n} × ${money(prod(pid).price)}</small></span><strong class="num">${money(prod(pid).price * n)}</strong></div>`).join('')}<div class="tb-row"><span><b>Total</b></span><strong class="num">${money(total(o.items))}</strong></div></div><div class="tb-tools"><button class="tb-btn tb-btn--main" data-again="${o.id}">Order these again</button></div>`); }

  /* ---------- events ---------- */
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-drawer]')) return closeDrawer();
    const t = e.target.closest('[data-act],[data-open],[data-social],[data-dl],[data-type],[data-status],[data-order],[data-add],[data-again],[data-less],[data-more]'); if (!t) return; const d = t.dataset;
    if (d.open) return openProd(d.open); if (d.social) return toast(`Opening ${d.social}`); if (d.dl) return toast(`${d.dl} saved to your downloads`);
    if (d.type) { S.type = d.type; return render(); } if (d.status) { S.status = d.status; return render(); } if (d.order) return openOrder(d.order);
    if (d.add) { S.basket[d.add] = (S.basket[d.add] || 0) + 1; closeDrawer(); if (current === 'orders') render(); return toast(`${prod(d.add).name} added to your basket`); }
    if (d.again) { const o = S.orders.find((x) => x.id === d.again); for (const [id, n] of Object.entries(o.items)) S.basket[id] = (S.basket[id] || 0) + n; closeDrawer(); render(); return toast('Added to your basket'); }
    if (d.more) { S.basket[d.more]++; return render(); }
    if (d.less) { const id = d.less, was = S.basket[id]; if (was > 1) { S.basket[id]--; return render(); } delete S.basket[id]; render(); return toast(`${prod(id).name} removed`, () => { S.basket[id] = was; render(); }); }
    switch (d.act) {
      case 'prev': return turn(S.room - 1); case 'next': return turn(S.room + 1);
      case 'size': S.fit = true; S.type = 'All'; return location.hash === '#/catalog' ? render() : (location.hash = '#/catalog');
      case 'fit': S.fit = !S.fit; return render();
      case 'dl-cat': return toast('Catalog (PDF, 8 MB) saved to your downloads'); case 'map': return toast('Opening the map of 5 stores');
      case 'close': return closeDrawer(); case 'retry': S.view = 'ready'; return render(); case 'clear': S.q = ''; S.type = 'All'; S.fit = false; S.status = 'All'; S.view = 'ready'; return render();
    }
  });
  document.addEventListener('keydown', (e) => { const dr = $('[data-drawer]'); if (dr.hidden) return; if (e.key === 'Escape') return closeDrawer();
    if (e.key === 'Tab') { const f = $$('button,select,input,a[href]', dr), a = f[0], z = f.at(-1); if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } });
  document.addEventListener('input', (e) => { if (e.target.matches('[data-q]')) { S.q = e.target.value; render(); const q = $('[data-q]'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); } });
  document.addEventListener('change', (e) => { const t = e.target; if (t.matches('[data-sort]')) { S.sort = t.value; render(); }
    if (t.matches('[data-pref]')) { S.profile[t.dataset.pref] = t.checked; toast(t.checked ? 'Turned on' : 'Turned off'); } if (t.matches('[data-view]')) { S.view = t.value; toast(`Lists now show the ${S.view} state`); } });
  document.addEventListener('submit', (e) => { e.preventDefault(); const f = e.target, d = Object.fromEntries(new FormData(f));
    if (f.matches('[data-find]')) { const town = d.town.trim(), err = $('#tb-town-err'); if (!town) { err.textContent = 'Type the name of your town.'; return f.town.focus(); }
      const hit = STORES.find(([t]) => t.toLowerCase().startsWith(town.toLowerCase())) || STORES[town.length % STORES.length]; err.textContent = ''; $('[data-nearest]').textContent = `${hit[1]} · ${hit[0]}`; return toast(`Nearest store: ${hit[0]}`); }
    if (f.matches('[data-place]')) { if (!/^\d{5}$/.test(d.post.trim())) { $('#err-post').textContent = 'Enter a five-digit postcode, for example 90210.'; return f.post.focus(); }
      const id = 'T-' + (2053 + S.orders.length); S.orders.unshift({ id, date: 'Today', status: 'Being packed', items: { ...S.basket } }); S.basket = {}; render(); return toast(`Order ${id} placed`); }
    if (f.matches('[data-profile]')) { const okN = d.name.trim(), okE = /^\S+@\S+\.\S+$/.test(d.email); $('#err-name').textContent = okN ? '' : 'Enter your name.'; $('#err-email').textContent = okE ? '' : 'Enter an email address like name@example.com.'; if (!okN) return f.name.focus(); if (!okE) return f.email.focus(); Object.assign(S.profile, { name: okN, email: d.email }); toast('Profile saved'); } });

  /* ---------- routing ---------- */
  let current = 'overview';
  function render() { pages[current]($(`[data-db-page="${current}"]`)); }
  turn(0, true);
  window.DB.route([{ id: 'overview', name: 'Showroom' }, { id: 'catalog', name: 'Catalog' }, { id: 'orders', name: 'Orders' }, { id: 'settings', name: 'Settings' }], (id) => {
    current = id; $$('[data-db-page]').forEach((s) => { s.hidden = s.dataset.dbPage !== id; });
    $$('.tb-nav > a:not(.tb-logo), .tb-foot a').forEach((a) => { a.hash === '#/' + id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); }); render();
  });
  document.documentElement.dataset.ready = 'true';
})();
