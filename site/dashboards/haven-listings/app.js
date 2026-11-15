/* Haven Listings: one poured frame, four pages. Sample data is fictional. No polling; state lives in memory. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const HOMES = [
    { id: 'lunette', name: 'Lunette House', place: 'Marrow Bay', street: '18 Tidewater Lane', type: 'Villa', mode: 'buy', price: 1240000, area: 312, yard: 126, beds: 4, baths: 3, likes: 4412, saves: 157, pos: '62% 58%', posM: '70% 50%', zoom: '190%', tint: 'none', hist: [1.08, 1.1, 1.09, 1.14, 1.18, 1.17, 1.21, 1.24], desc: 'A long curved shell of glass and plaster that follows the dune line, with a heated deck facing the evening light.' },
    { id: 'saltgrass', name: 'Saltgrass Villa', place: 'Marrow Bay', street: '4 Kelp Row', type: 'Villa', mode: 'buy', price: 892000, area: 248, yard: 90, beds: 3, baths: 2, likes: 2980, saves: 96, pos: '78% 44%', posM: '84% 40%', zoom: '250%', tint: 'hue-rotate(-12deg) saturate(1.1)', hist: [0.8, 0.82, 0.81, 0.85, 0.86, 0.88, 0.87, 0.89], desc: 'Upper-floor living under one sweeping roof, with a reading loft that looks straight down the beach path.' },
    { id: 'cedar', name: 'Cedar Step', place: 'Pinecrest', street: '9 Larch Rise', type: 'Cabin', mode: 'buy', price: 468000, area: 132, yard: 410, beds: 2, baths: 1, likes: 1873, saves: 64, pos: '36% 62%', posM: '40% 60%', zoom: '260%', tint: 'hue-rotate(18deg) saturate(0.9)', hist: [0.41, 0.42, 0.44, 0.43, 0.45, 0.46, 0.46, 0.47], desc: 'A low glass-fronted cabin on a quiet rise. Wood stove, covered porch and a ten-minute walk to the trailhead.' },
    { id: 'harbor', name: 'Harbor Row 12', place: 'Old Harbour', street: '12 Chandlers Quay', type: 'Loft', mode: 'buy', price: 615000, area: 118, yard: 0, beds: 2, baths: 2, likes: 2204, saves: 88, pos: '52% 70%', posM: '56% 68%', zoom: '300%', tint: 'saturate(0.8) brightness(1.05)', hist: [0.55, 0.57, 0.58, 0.58, 0.6, 0.6, 0.61, 0.615], desc: 'A warehouse loft with full-height windows over the quay, an open kitchen and a mezzanine study.' },
    { id: 'tern', name: 'Tern Point', place: 'Marrow Bay', street: '31 Lighthouse Walk', type: 'Villa', mode: 'buy', price: 1480000, area: 356, yard: 220, beds: 5, baths: 4, likes: 3610, saves: 132, pos: '70% 30%', posM: '74% 30%', zoom: '280%', tint: 'saturate(1.15) brightness(1.04)', hist: [1.3, 1.31, 1.35, 1.38, 1.4, 1.43, 1.46, 1.48], desc: 'The largest home on the point: a double-height living room, a cliff-edge terrace and a guest wing with its own entrance.' },
    { id: 'quarry', name: 'Quarry Lane 3', place: 'Pinecrest', street: '3 Quarry Lane', type: 'Cabin', mode: 'buy', price: 389000, area: 104, yard: 280, beds: 2, baths: 1, likes: 1204, saves: 47, pos: '30% 70%', posM: '34% 68%', zoom: '340%', tint: 'hue-rotate(24deg) saturate(0.85) brightness(1.05)', hist: [0.35, 0.36, 0.36, 0.37, 0.38, 0.38, 0.385, 0.389], desc: 'A compact two-bedroom cabin with a sleeping loft and a workshop, set back from the lane among birch trees.' },
    { id: 'sailmaker', name: 'Sailmakers 2B', place: 'Old Harbour', street: '2 Sailmakers Court', type: 'Loft', mode: 'buy', price: 540000, area: 102, yard: 0, beds: 1, baths: 1, likes: 1688, saves: 71, pos: '60% 74%', posM: '62% 72%', zoom: '360%', tint: 'saturate(0.9) hue-rotate(-6deg)', hist: [0.49, 0.5, 0.51, 0.52, 0.52, 0.53, 0.535, 0.54], desc: 'A one-bedroom loft above the old sail works, with timber beams, a wood floor and a small balcony over the court.' },
    { id: 'gull', name: 'Gull Terrace 9', place: 'Marrow Bay', street: '9 Gull Terrace', type: 'Loft', mode: 'rent', price: 2400, area: 84, yard: 0, beds: 1, baths: 1, likes: 990, saves: 33, pos: '48% 40%', posM: '50% 40%', zoom: '380%', tint: 'brightness(1.08)', hist: [2.1, 2.2, 2.2, 2.3, 2.3, 2.4, 2.4, 2.4], desc: 'A sea-facing one-bedroom with a sheltered terrace, two streets back from the promenade.' },
    { id: 'foundry', name: 'Foundry Loft 6', place: 'Old Harbour', street: '6 Foundry Yard', type: 'Loft', mode: 'rent', price: 2900, area: 96, yard: 0, beds: 2, baths: 1, likes: 1320, saves: 41, pos: '44% 66%', posM: '48% 64%', zoom: '320%', tint: 'hue-rotate(8deg)', hist: [2.5, 2.6, 2.6, 2.7, 2.8, 2.8, 2.9, 2.9], desc: 'Bright corner loft with brick walls and a shared roof garden, five minutes from the ferry.' },
    { id: 'dune', name: 'Dune Court', place: 'Pinecrest', street: '2 Sandpiper Close', type: 'Villa', mode: 'rent', price: 4200, area: 210, yard: 180, beds: 3, baths: 2, likes: 1766, saves: 59, pos: '84% 52%', posM: '88% 48%', zoom: '230%', tint: 'hue-rotate(-20deg) saturate(1.2)', hist: [3.8, 3.9, 3.9, 4, 4.1, 4.1, 4.2, 4.2], desc: 'A single-storey courtyard villa with sliding glass on three sides and a sheltered outdoor kitchen.' },
  ];
  const TIMES = ['9:30 am', '11:00 am', '1:30 pm', '3:00 pm', '4:30 pm'];
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
  const dayKey = (d) => d.toISOString().slice(0, 10);
  const S = {
    mode: 'buy', place: '', type: '', max: '', sel: 'lunette', liked: new Set(), saved: new Set(['cedar']), q: '', sort: 'price-asc', view: 'ready',
    day: dayKey(days[1]), showings: [
      { id: 's1', home: 'lunette', day: dayKey(days[1]), time: '11:00 am', who: 'Mira Chen' },
      { id: 's2', home: 'cedar', day: dayKey(days[1]), time: '3:00 pm', who: 'Mira Chen' },
      { id: 's3', home: 'harbor', day: dayKey(days[4]), time: '9:30 am', who: 'Mira Chen' },
    ],
    profile: { name: 'Mira Chen', email: 'mira@haven.example', alerts: true, digest: false, sms: true },
  };
  const money = (h) => (h.mode === 'rent' ? `$${h.price.toLocaleString('en-US')} / month` : `$${h.price.toLocaleString('en-US')}`);
  const short = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'K' : String(n));
  const home = (id) => HOMES.find((h) => h.id === id);
  const matches = () => HOMES.filter((h) => h.mode === S.mode && (!S.place || h.place === S.place) && (!S.type || h.type === S.type) && (!S.max || h.price <= +S.max));

  /* ---------- toast (with optional undo) ---------- */
  function toast(msg, undo) {
    const t = $('[data-toast]'); t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button">Undo</button>' : ''}`; t.hidden = false;
    if (undo) $('button', t).onclick = () => { undo(); t.hidden = true; };
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, undo ? 6000 : 2800);
  }

  /* ---------- header filters (shared by every page) ---------- */
  const form = $('[data-filters]');
  function fillFilters() {
    const opt = (v, l, cur) => `<option value="${esc(v)}"${String(cur) === String(v) ? ' selected' : ''}>${esc(l)}</option>`;
    const pool = HOMES.filter((h) => h.mode === S.mode);
    form.place.innerHTML = opt('', 'Anywhere', S.place) + [...new Set(pool.map((h) => h.place))].map((p) => opt(p, p, S.place)).join('');
    form.type.innerHTML = opt('', 'Any type', S.type) + [...new Set(pool.map((h) => h.type))].map((p) => opt(p, p, S.type)).join('');
    const caps = S.mode === 'buy' ? [[500000, '$500,000'], [1000000, '$1,000,000'], [1500000, '$1,500,000']] : [[3000, '$3,000'], [5000, '$5,000']];
    form.max.innerHTML = opt('', 'Any price', S.max) + caps.map(([v, l]) => opt(v, l, S.max)).join('');
  }
  form.addEventListener('change', () => { S.place = form.place.value; S.type = form.type.value; S.max = form.max.value; afterFilter(); });
  $$('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    if (S.mode === b.dataset.mode) return;
    S.mode = b.dataset.mode; S.place = S.type = S.max = '';
    $$('[data-mode]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    fillFilters(); afterFilter(); toast(S.mode === 'buy' ? 'Showing homes to buy' : 'Showing homes to rent');
  }));
  function afterFilter() { const m = matches(); if (!m.some((h) => h.id === S.sel)) S.sel = m[0]?.id || null; render(); }

  /* ---------- overview ---------- */
  const card = $('[data-card]'), photo = $('[data-photo]'), frame = $('[data-frame]');
  function paintCard(animate) {
    const m = matches(), h = home(S.sel);
    $('[data-find-n]').textContent = m.length;
    $('[data-find-copy]').textContent = m.length ? `${m.length === 1 ? 'One home matches' : m.length + ' homes match'} your filters${S.place ? ' in ' + S.place : ''}. Step through them with the arrow, or open the full list.` : 'No homes match these filters. Widen the price or pick "Anywhere" to see more.';
    card.hidden = !h; $('.hl-brand').hidden = !h; if (!h) return;
    const set = (k, v) => { $(`[data-c="${k}"]`, card).textContent = v; };
    set('name', h.name); set('addr', `${h.street}, ${h.place}`); set('desc', h.desc); set('price', money(h));
    $('[data-c="spec"]', card).innerHTML = [`${h.area} m²`, h.yard ? `${h.yard} m² yard` : 'No yard', `${h.beds} bedrooms`, `${h.baths} baths`].map((x) => `<li>${esc(x)}</li>`).join('');
    set('likes', short(h.likes + (S.liked.has(h.id) ? 1 : 0))); set('saves', short(h.saves + (S.saved.has(h.id) ? 1 : 0)));
    $('[data-act="like"]', card).setAttribute('aria-pressed', S.liked.has(h.id)); $('[data-act="save"]', card).setAttribute('aria-pressed', S.saved.has(h.id));
    frame.style.setProperty('--pos', h.pos); frame.style.setProperty('--pos-m', h.posM);
    if (animate && !reduce) { card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap'); photo.classList.add('is-swap'); setTimeout(() => photo.classList.remove('is-swap'), 220); }
  }
  /* pointer parallax on the photo + moving specular on the glass (stops when the pointer leaves) */
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    frame.addEventListener('pointermove', (e) => { const r = frame.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      frame.style.setProperty('--px', (-x * 10).toFixed(1) + 'px'); frame.style.setProperty('--py', (-y * 8).toFixed(1) + 'px'); card.style.setProperty('--spec', (x * 24).toFixed(1) + 'px'); });
    frame.addEventListener('pointerleave', () => { frame.style.setProperty('--px', '0px'); frame.style.setProperty('--py', '0px'); });
  }
  $$('[data-tone]').forEach((b) => b.addEventListener('click', () => { frame.dataset.tone = b.dataset.tone; $$('[data-tone]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }));

  /* ---------- shared bits for inner pages ---------- */
  const stateBox = (items, emptyMsg, emptyBtn, body) => {
    if (S.view === 'loading') return '<div class="hl-grid"><div class="hl-skel"></div><div class="hl-skel"></div><div class="hl-skel"></div></div>';
    if (S.view === 'error') return '<div class="hl-state"><p>We couldn’t load this just now. Check your connection, then try again.</p><button class="hl-btn hl-btn--main" data-act="retry">Try again</button></div>';
    if (S.view === 'empty' || !items.length) return `<div class="hl-state"><p>${esc(emptyMsg)}</p>${emptyBtn}</div>`;
    return body(items);
  };
  const spark = (v) => { const w = 300, h = 90, mx = Math.max(...v), mn = Math.min(...v); const p = v.map((y, i) => [(i / (v.length - 1)) * w, h - 10 - ((y - mn) / (mx - mn || 1)) * (h - 24)]); const d = p.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
    return `<svg class="hl-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Asking price over the last eight quarters, from ${v[0]} to ${v.at(-1)}"><path pathLength="1" d="${d}"/><path d="${d} L ${w} ${h} L 0 ${h} Z"/></svg>`; };

  const pages = {
    overview() { paintCard(false); },
    listings(el) {
      const q = S.q.trim().toLowerCase();
      let list = matches().filter((h) => !q || (h.name + h.place + h.type).toLowerCase().includes(q));
      const [k, dir] = S.sort.split('-'); list = list.sort((a, b) => (k === 'price' ? a.price - b.price : a.area - b.area) * (dir === 'asc' ? 1 : -1));
      el.innerHTML = `<div class="hl-sheet-head"><div><h1>Homes to ${S.mode === 'buy' ? 'buy' : 'rent'}</h1><p class="hl-sub">${list.length} of ${HOMES.filter((h) => h.mode === S.mode).length} shown. The filters above apply here too.</p></div>
        <div class="hl-tools"><input class="hl-field" type="search" placeholder="Search by name or place" aria-label="Search homes" value="${esc(S.q)}" data-q>
          <select class="hl-field" aria-label="Sort homes" data-sort>${[['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['area-desc', 'Largest first']].map(([v, l]) => `<option value="${v}"${S.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div></div>
        ${stateBox(list, q ? `No homes match “${S.q}”.` : 'No homes match these filters.', '<button class="hl-btn hl-btn--main" data-act="clear">Clear search and filters</button>', (items) => `<div class="hl-grid">${items.map((h, i) => `
          <button type="button" class="hl-home" style="--i:${i}" data-open="${h.id}"><span class="hl-home-pic" style="--pos:${h.pos};--zoom:${h.zoom};--tint:${h.tint}"></span>${S.saved.has(h.id) ? '<span class="hl-tag hl-tag--badge">Saved</span>' : ''}
            <span class="hl-home-body"><b>${esc(h.name)}</b><small>${esc(h.place)} · ${esc(h.type)} · ${h.beds} bed · ${h.area} m²</small><span class="hl-home-row"><strong class="num">${money(h)}</strong><span class="hl-tag">View</span></span></span></button>`).join('')}</div>`)}`;
    },
    showings(el) {
      const list = S.showings.filter((s) => s.day === S.day).sort((a, b) => TIMES.indexOf(a.time) - TIMES.indexOf(b.time));
      const fmt = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const cur = days.find((d) => dayKey(d) === S.day);
      el.innerHTML = `<div class="hl-sheet-head"><div><h1>Your viewings</h1><p class="hl-sub">${S.showings.length} booked over the next seven days.</p></div></div>
        <div class="hl-three"><div class="hl-stat"><b class="num">${S.showings.length}</b><small>Viewings booked</small></div><div class="hl-stat"><b class="num">${new Set(S.showings.map((s) => s.home)).size}</b><small>Different homes</small></div><div class="hl-stat"><b>${S.showings.length ? esc(home([...S.showings].sort((a, b) => a.day.localeCompare(b.day) || TIMES.indexOf(a.time) - TIMES.indexOf(b.time))[0].home).name) : 'None yet'}</b><small>Next viewing</small></div></div>
        <div class="hl-week" role="group" aria-label="Pick a day">${days.map((d) => `<button type="button" class="hl-day" data-day="${dayKey(d)}" aria-pressed="${dayKey(d) === S.day}" data-has="${S.showings.some((s) => s.day === dayKey(d)) ? 1 : 0}" aria-label="${fmt(d)}"><small>${d.toLocaleDateString('en-US', { weekday: 'short' })}</small><b class="num">${d.getDate()}</b><i></i></button>`).join('')}</div>
        <div class="hl-cols"><section class="hl-panel"><h2>${fmt(cur)}</h2>
          ${stateBox(list, 'Nothing booked on this day.', '<a class="hl-btn hl-btn--main" href="#/listings" style="display:inline-flex;align-items:center;text-decoration:none">Browse homes</a>', (items) => items.map((s) => `<div class="hl-view"><time>${s.time}</time><div><b>${esc(home(s.home).name)}</b><small>${esc(home(s.home).street)}, ${esc(home(s.home).place)}</small></div>
            <div class="hl-tools"><select class="hl-field" aria-label="Move the ${esc(home(s.home).name)} viewing to another time" data-move="${s.id}">${TIMES.map((t) => `<option${t === s.time ? ' selected' : ''}>${t}</option>`).join('')}</select><button class="hl-btn hl-btn--quiet" data-cancel="${s.id}">Cancel viewing</button></div></div>`).join(''))}</section>
          <form class="hl-panel" data-book novalidate><h2>Book a viewing</h2>
            <label class="hl-label">Home<select class="hl-field" name="home">${HOMES.map((h) => `<option value="${h.id}"${h.id === S.sel ? ' selected' : ''}>${esc(h.name)} · ${esc(h.place)}</option>`).join('')}</select></label>
            <label class="hl-label">Time on ${cur.toLocaleDateString('en-US', { weekday: 'long' })}<select class="hl-field" name="time">${TIMES.map((t) => `<option>${t}</option>`).join('')}</select></label>
            <label class="hl-label">Your name<input class="hl-field" name="who" value="${esc(S.profile.name)}" aria-describedby="err-who"></label><p class="hl-err" id="err-who" role="alert"></p>
            <button class="hl-btn hl-btn--main">Book this viewing</button></form></div>
        <section class="hl-panel"><h2>All upcoming</h2>${S.showings.length ? [...S.showings].sort((a, b) => a.day.localeCompare(b.day) || TIMES.indexOf(a.time) - TIMES.indexOf(b.time)).map((s) => { const h = home(s.home), d = days.find((x) => dayKey(x) === s.day); return `<div class="hl-saved"><span class="hl-home-pic" style="--pos:${h.pos};--zoom:${h.zoom};--tint:${h.tint}"></span><div><b>${esc(h.name)}</b><small>${d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · ${s.time} · ${esc(h.place)}</small></div><button class="hl-btn" data-day="${s.day}">Show day</button></div>`; }).join('') : '<p class="hl-sub">No viewings booked. Pick a day above and book one.</p>'}</section>`;
    },
    settings(el) {
      const p = S.profile, sw = (k, l) => `<label class="hl-switch"><span>${l}</span><input type="checkbox" data-pref="${k}"${p[k] ? ' checked' : ''}></label>`;
      el.innerHTML = `<div class="hl-sheet-head"><div><h1>Settings</h1><p class="hl-sub">Your details and how we reach you.</p></div></div>
        <div class="hl-cols"><form class="hl-panel" data-profile novalidate><h2>Profile</h2>
            <label class="hl-label">Name<input class="hl-field" name="name" value="${esc(p.name)}" aria-describedby="err-name"></label><p class="hl-err" id="err-name" role="alert"></p>
            <label class="hl-label">Email<input class="hl-field" type="email" name="email" value="${esc(p.email)}" aria-describedby="err-email"></label><p class="hl-err" id="err-email" role="alert"></p>
            <label class="hl-label">Phone<input class="hl-field" name="phone" value="(555) 014-2200"></label>
            <button class="hl-btn hl-btn--main">Save profile</button>
            <h2 style="margin-top:8px">Saved homes</h2>${S.saved.size ? [...S.saved].map((id) => { const h = home(id); return `<div class="hl-saved"><span class="hl-home-pic" style="--pos:${h.pos};--zoom:${h.zoom};--tint:${h.tint}"></span><div><b>${esc(h.name)}</b><small>${esc(h.place)} · ${money(h)}</small></div><button type="button" class="hl-btn" data-unsave="${h.id}">Remove</button></div>`; }).join('') : '<p class="hl-sub">Nothing saved yet. Tap the bookmark on any home.</p>'}</form>
          <div style="display:grid;gap:16px"><section class="hl-panel"><h2>Alerts</h2>${sw('alerts', 'New homes that match my filters')}${sw('sms', 'Text me a reminder before a viewing')}${sw('digest', 'Weekly price changes by email')}</section>
            <section class="hl-panel"><h2>Your agent</h2><div class="hl-saved"><span class="hl-home-pic" style="--pos:70% 40%;--zoom:400%"></span><div><b>Jonah Hale</b><small>Marrow Bay office · replies within a day</small></div><button type="button" class="hl-btn" data-act="msg">Message</button></div><div class="hl-three"><div class="hl-stat"><b class="num">(555) 014-2218</b><small>Office</small></div><div class="hl-stat"><b>9 to 6</b><small>Weekdays</small></div><div class="hl-stat"><b class="num">${S.showings.length}</b><small>Viewings with you</small></div></div></section>
            <section class="hl-panel"><h2>Preview a state</h2><p class="hl-sub">For design review: how lists look while loading, empty or failing.</p>
              <label class="hl-label">Lists show<select class="hl-field" data-view>${['ready', 'loading', 'empty', 'error'].map((v) => `<option${S.view === v ? ' selected' : ''}>${v}</option>`).join('')}</select></label></section></div></div>`;
    },
  };

  /* ---------- detail drawer ---------- */
  let lastFocus = null;
  function openHome(id) {
    const h = home(id); if (!h) return; S.sel = id; lastFocus = document.activeElement;
    $('[data-drawer-panel]').innerHTML = `<div class="hl-drawer-top"><div><h2 id="hl-drawer-title">${esc(h.name)}</h2><p class="hl-sub">${esc(h.street)}, ${esc(h.place)}</p></div><button class="hl-x" data-act="close" aria-label="Close"><svg><use href="#i-x"/></svg></button></div>
      <div class="hl-home-pic" style="--pos:${h.pos};--zoom:${h.zoom};--tint:${h.tint}"></div><p>${esc(h.desc)}</p>
      <div class="hl-facts"><div><b class="num">${h.area} m²</b><small>Inside</small></div><div><b class="num">${h.yard || '–'}${h.yard ? ' m²' : ''}</b><small>Yard</small></div><div><b class="num">${h.beds}</b><small>Bedrooms</small></div><div><b class="num">${h.baths}</b><small>Baths</small></div></div>
      <section class="hl-panel" style="background:var(--surface-2)"><h2>${h.mode === 'rent' ? 'Rent' : 'Asking price'} over two years</h2>${spark(h.hist)}<strong class="num" style="font:700 22px/1 var(--font-display)">${money(h)}</strong></section>
      <div class="hl-tools"><button class="hl-btn hl-btn--main" data-act="book">Book a viewing</button><button class="hl-btn" data-act="save" aria-pressed="${S.saved.has(h.id)}">${S.saved.has(h.id) ? 'Remove from saved' : 'Save this home'}</button></div>`;
    $('[data-drawer]').hidden = false; $('.hl-x').focus();
  }
  function closeDrawer() { $('[data-drawer]').hidden = true; lastFocus?.focus?.(); }

  /* ---------- events ---------- */
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-drawer]')) return closeDrawer();
    const t = e.target.closest('[data-act],[data-open],[data-day],[data-cancel],[data-unsave]'); if (!t) return;
    if (t.dataset.unsave) { const id = t.dataset.unsave; S.saved.delete(id); render(); return toast(`${home(id).name} removed from saved`, () => { S.saved.add(id); render(); }); }
    const h = home(S.sel);
    if (t.dataset.open) return openHome(t.dataset.open);
    if (t.dataset.day) { S.day = t.dataset.day; return render(); }
    if (t.dataset.cancel) { const i = S.showings.findIndex((s) => s.id === t.dataset.cancel), gone = S.showings.splice(i, 1)[0]; render(); return toast(`Viewing of ${home(gone.home).name} cancelled`, () => { S.showings.splice(i, 0, gone); render(); }); }
    switch (t.dataset.act) {
      case 'next': { const m = matches(); if (m.length < 2) return toast('This is the only home that matches'); S.sel = m[(m.findIndex((x) => x.id === S.sel) + 1) % m.length].id; return paintCard(true); }
      case 'like': S.liked.has(h.id) ? S.liked.delete(h.id) : S.liked.add(h.id); return paintCard(false);
      case 'save': { const on = !S.saved.has(h.id); on ? S.saved.add(h.id) : S.saved.delete(h.id); if (!$('[data-drawer]').hidden) openHome(h.id); render(); return toast(on ? `${h.name} saved` : `${h.name} removed from saved`); }
      case 'share': return toast(`Link to ${h.name} copied`);
      case 'book': closeDrawer(); DBR.go('showings'); return toast(`Pick a day and time for ${h.name}`);
      case 'alerts': return toast('2 new homes match your filters');
      case 'msg': return toast('Message to Jonah Hale started');
      case 'close': return closeDrawer();
      case 'retry': S.view = 'ready'; return render();
      case 'clear': S.q = ''; S.place = S.type = S.max = ''; fillFilters(); return afterFilter();
    }
  });
  document.addEventListener('keydown', (e) => {
    const d = $('[data-drawer]'); if (d.hidden) return;
    if (e.key === 'Escape') return closeDrawer();
    if (e.key === 'Tab') { const f = $$('button,select,input,a[href]', d), a = f[0], z = f.at(-1); if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
  document.addEventListener('input', (e) => { if (e.target.matches('[data-q]')) { S.q = e.target.value; render(); const q = $('[data-q]'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); } });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-sort]')) { S.sort = t.value; render(); }
    if (t.matches('[data-move]')) { const s = S.showings.find((x) => x.id === t.dataset.move); s.time = t.value; render(); toast(`${home(s.home).name} moved to ${s.time}`); }
    if (t.matches('[data-pref]')) { S.profile[t.dataset.pref] = t.checked; toast(t.checked ? 'Turned on' : 'Turned off'); }
    if (t.matches('[data-view]')) { S.view = t.value; toast(`Lists now show the ${S.view} state`); }
  });
  document.addEventListener('submit', (e) => {
    e.preventDefault(); const f = e.target, d = Object.fromEntries(new FormData(f));
    if (f.matches('[data-book]')) {
      if (!d.who.trim()) { $('#err-who').textContent = 'Enter your name so the agent knows who to expect.'; return f.who.focus(); }
      if (S.showings.some((s) => s.day === S.day && s.time === d.time)) { $('#err-who').textContent = `You already have a viewing at ${d.time}. Pick another time.`; return f.time.focus(); }
      S.showings.push({ id: 's' + Date.now(), home: d.home, day: S.day, time: d.time, who: d.who.trim() }); render(); toast(`Viewing of ${home(d.home).name} booked for ${d.time}`);
    }
    if (f.matches('[data-profile]')) {
      $('#err-name').textContent = d.name.trim() ? '' : 'Enter your name.'; $('#err-email').textContent = /^\S+@\S+\.\S+$/.test(d.email) ? '' : 'Enter an email address like name@example.com.';
      if (!d.name.trim()) return f.name.focus(); if (!/^\S+@\S+\.\S+$/.test(d.email)) return f.email.focus();
      Object.assign(S.profile, { name: d.name.trim(), email: d.email }); toast('Profile saved');
    }
  });

  /* ---------- routing ---------- */
  let current = 'overview';
  function render() { const el = $(`[data-db-page="${current}"]`); pages[current](el); }
  fillFilters();
  const DBR = window.DB.route([{ id: 'overview', name: 'Overview' }, { id: 'listings', name: 'Listings' }, { id: 'showings', name: 'Showings' }, { id: 'settings', name: 'Settings' }], (id) => {
    current = id; $$('[data-db-page]').forEach((s) => { s.hidden = s.dataset.dbPage !== id; });
    $$('.hl-rail a').forEach((a) => { a.hash === '#/' + id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
    render();
  });
  document.documentElement.dataset.ready = 'true';
})();
