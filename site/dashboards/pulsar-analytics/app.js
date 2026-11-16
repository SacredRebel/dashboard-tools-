/* Pulsar Analytics: a board of tiles around one live scene (terrain.js), plus three pages. Sample data is fictional.
   No polling; state lives in memory. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const k = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n));

  const RANGES = { '24h': 0.16, '7d': 1, '30d': 4.1 };
  const METRICS = { users: { name: 'Active users', base: 18400, fmt: k, delta: '+22%', face: 'repeating-linear-gradient(180deg, var(--amber) 0 12%, transparent 12% 24%)', glow: 'var(--amber)' },
    sessions: { name: 'Sessions', base: 96200, fmt: k, delta: '+4.1%', face: 'radial-gradient(circle, var(--mint) 0 14%, transparent 15%) 0 0 / 34% 34%, #123a36', glow: 'var(--mint)' },
    errors: { name: 'Error rate', base: 0.42, fmt: (n) => n.toFixed(2) + '%', flat: true, delta: '−0.08%', face: 'radial-gradient(circle at 40% 35%, #f0d4ff, var(--violet) 60%)', glow: 'var(--violet)' },
    latency: { name: 'p95 latency', base: 186, fmt: (n) => Math.round(n) + ' ms', flat: true, delta: '−12 ms', face: 'linear-gradient(135deg, var(--mint), var(--pink))', glow: 'var(--pink)' } };
  const CHANNELS = [['Search', 34, 'violet'], ['Direct', 38, 'violet'], ['Social', 42, 'violet'], ['Email', 46, 'violet'], ['Referral', 50, 'violet'], ['Paid', 44, 'teal'], ['Partners', 52, 'mint'], ['API', 58, 'mint'], ['App', 56, 'mint']].map(([name, h, top], i) => ({ id: 'c' + i, name, h, top, share: Math.round(h / 4.2) }));
  const TAGS = [['Checkout', '62%', 24, 9, 'violet'], ['API gateway', 'steady', 2, 11, 'mint'], ['Search', '18.4k', 41, 18, 'pink'], ['Auth', '99.9%', 41, 29, 'violet'], ['Jobs queue', '412 waiting', 0, 34, 'amber'], ['Peak · Thu 19:00', '', 17, 35, 'mint'], ['EU-west', '42 ms', 55, 39, 'mint'], ['Cache', 'warm', 51, 53, 'amber'], ['Pool', '71% used', 23, 86, 'violet'], ['Edge', '0.2% errors', 34, 86, 'pink']];
  const EVENTS = [['checkout.completed', 'Checkout', 18420, 'OK', '2 min ago'], ['plan.upgraded', 'Billing', 12880, 'OK', '4 min ago'], ['invite.sent', 'Growth', 9610, 'OK', '6 min ago'], ['report.exported', 'Product', 6240, 'OK', '9 min ago'], ['search.performed', 'Product', 4975, 'OK', '11 min ago'], ['payment.failed', 'Billing', 312, 'Error', '14 min ago'], ['login.blocked', 'Auth', 148, 'Error', '21 min ago'], ['webhook.retried', 'API', 96, 'Error', '33 min ago'], ['trial.started', 'Growth', 2210, 'OK', '40 min ago'], ['seat.added', 'Billing', 1630, 'OK', '52 min ago']].map(([name, area, n, status, ago], i) => ({ id: 'e' + i, name, area, n, status, ago }));
  const REGIONS = [['US-east', 22400, 38, 99.98], ['EU-west', 18900, 42, 99.97], ['AP-south', 12600, 71, 99.91], ['SA-east', 6800, 96, 99.84], ['AF-south', 4100, 118, 99.79], ['AP-north', 5100, 64, 99.93]].map(([name, rps, ms, up], i) => ({ id: 'r' + i, name, rps, ms, up }));
  const S = { range: '7d', metric: 'users', tag: 0, channel: 'c7', q: '', area: 'All', sort: 'n', dir: -1, region: 'r0', view: 'ready', watches: [{ id: 'w1', region: 'r3', ms: 110 }] };
  const mult = () => RANGES[S.range];

  function toast(msg, undo) { const t = $('[data-toast]'); t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button">Undo</button>' : ''}`; t.hidden = false; if (undo) $('button', t).onclick = () => { undo(); t.hidden = true; };
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, undo ? 6000 : 2800); }
  const line = (v, w = 120, h = 50) => { const mx = Math.max(...v), mn = Math.min(...v); return v.map((y, i) => (i ? 'L' : 'M') + ((i / (v.length - 1)) * w).toFixed(1) + ' ' + (h - 5 - ((y - mn) / (mx - mn || 1)) * (h - 10)).toFixed(1)).join(' '); };
  const series = (seed, n = 14) => [...Array(n)].map((_, i) => 30 + Math.sin(i * 0.7 + seed) * 14 + ((i * seed * 7) % 11) + i * (seed % 3));

  /* ---------- static pieces ---------- */
  $('[data-range]').innerHTML = Object.keys(RANGES).map((r) => `<button type="button" data-range-v="${r}" aria-pressed="${S.range === r}">${r}</button>`).join('');
  $('[data-stars]').innerHTML = [[120, 150, 330, 60], [330, 60, 520, 190], [520, 190, 700, 110], [240, 300, 430, 250], [430, 250, 640, 330], [640, 330, 860, 250], [90, 420, 260, 360]].map(([a, b, c, d]) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/><circle cx="${a}" cy="${b}" r="1.8"/><circle cx="${c}" cy="${d}" r="1.8"/>`).join('');
  $('[data-dial]').innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${[...Array(48)].map((_, i) => `<line x1="50" y1="${i % 4 ? 9 : 7}" x2="50" y2="14" stroke="${i > 30 ? 'var(--violet)' : 'var(--text-subtle)'}" stroke-width="${i % 4 ? 0.8 : 1.4}" transform="rotate(${i * 7.5} 50 50)"/>`).join('')}
    <circle cx="50" cy="50" r="29" fill="none" stroke="var(--violet)" stroke-width="5" stroke-linecap="round" stroke-dasharray="52 200" transform="rotate(-150 50 50)" opacity="0.9"/><circle cx="50" cy="50" r="22" fill="#1d1b24"/>
    <g class="hand" data-hand1><line x1="50" y1="50" x2="50" y2="24" stroke="var(--violet)" stroke-width="2.4" stroke-linecap="round"/></g><g class="hand" data-hand2><line x1="50" y1="50" x2="76" y2="50" stroke="var(--mint)" stroke-width="2.4" stroke-linecap="round"/></g><circle cx="50" cy="50" r="2.6" fill="#ffffff"/></svg>`;

  /* ---------- overview ---------- */
  function paintOverview() {
    const m = METRICS[S.metric], x = mult(), val = (key) => { const d = METRICS[key]; return d.fmt(d.flat ? d.base * (1 + (x - 1) * 0.03) : d.base * x); };
    $('[data-mini]').innerHTML = [['Requests', k(Math.round(4.2e6 * x))], ['Errors', k(Math.round(17600 * x))], ['Apdex', '0.94'], ['p50', '48 ms'], ['p95', '186 ms'], ['p99', '412 ms'], ['Deploys', String(Math.max(1, Math.round(6 * x)))], ['Rollbacks', x > 2 ? '1' : '0'], ['Incidents', x > 2 ? '2' : '0']].map(([l, v]) => `<span><small>${l}</small><b class="num">${v}</b></span>`).join('');
    $('[data-hand1]').style.transform = `rotate(${-40 + x * 30}deg)`; $('[data-hand2]').style.transform = `rotate(${20 + Object.keys(METRICS).indexOf(S.metric) * 28}deg)`;
    $('[data-checks]').innerHTML = [['API', 96], ['Jobs', 84], ['Edge', 78], ['Database', 91], ['Cache', 88]].map(([n, v]) => `<li><span>${n}</span><b class="num">${v}</b></li>`).join('');
    const segs = [['--mint', 34], ['--amber', 14], ['--violet', 24], ['--pink', 16]]; let off = 0;
    $('[data-ring]').innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="rgb(0 0 0 / 0.35)" stroke-width="8"/>${segs.map(([c, len]) => { const o = off; off += len + 2; return `<circle class="seg" cx="50" cy="50" r="40" stroke="var(${c})" stroke-width="8" pathLength="100" stroke-dasharray="${len} ${100 - len}" stroke-dashoffset="${-o}" transform="rotate(-120 50 50)"/>`; }).join('')}</svg><b class="num">88<small>health</small></b>`;
    $('[data-hours]').innerHTML = [...Array(18)].map((_, i) => `<i style="--k:${i};height:${28 + ((i * 37) % 60)}%;--b1:var(${i % 3 ? '--mint' : '--violet'});--b2:var(${i % 3 ? '--teal' : '--violet'})"></i>`).join('');
    $('[data-deploys]').innerHTML = [['v4.12', 'cache keys', '2 h', '--mint'], ['v4.11', 'checkout retry', '1 d', '--violet'], ['v4.10', 'search index', '3 d', '--amber']].map(([v, n, t, c]) => `<li><i style="--c:var(${c})"></i><span><b>${v}</b> ${n}</span><span>${t}</span></li>`).join('');
    $('[data-orbs]').innerHTML = Object.entries(METRICS).map(([id, d]) => `<button type="button" class="pz-orb" data-metric="${id}" aria-pressed="${S.metric === id}"><span style="--face:${d.face};--glow:${d.glow}"></span><b class="num">${val(id)}</b>${esc(d.name)}</button>`).join('');
    $('[data-metric-name]').textContent = m.name; $('[data-delta]').textContent = m.delta;
    $('[data-tags]').innerHTML = TAGS.map(([n, v, l, t, c], i) => `<button type="button" class="pz-tag" style="left:${l}%;top:${t}%;--i:${i};--c:var(--${c})" data-tag="${i}" aria-pressed="${S.tag === i}"><i></i>${esc(n)}${v ? ` <small>${esc(v)}</small>` : ''}</button>`).join('');
    const tg = TAGS[S.tag]; $('[data-focus]').innerHTML = `<small>Selected</small><b>${esc(tg[0])}</b><p>${tg[1] ? esc(tg[1]) + ' · ' : ''}${esc(m.name.toLowerCase())} ${m.delta} over ${S.range}.</p><p>Tap a tag in the scene to inspect it.</p>`;
    $('[data-stats]').innerHTML = [`<i class="pz-live"></i>${k(Math.round(6830 * (0.9 + x * 0.1)))} rps`, 'p95 186 ms · steady', `${k(Math.round(8234 * (0.8 + x * 0.2)))} online`].map((t) => `<span class="pz-chip">${t}</span>`).join('');
    $('[data-sparks]').innerHTML = [['Sign-ups', 3, '--mint'], ['Churn', 5, '--pink'], ['Latency', 8, '--amber'], ['Regions', 4, '--violet']].map(([n, seed, c]) => `<div class="pz-spark"><small>${n}</small><svg viewBox="0 0 120 50" preserveAspectRatio="none" aria-hidden="true"><path d="${line(series(seed))} L 120 50 L 0 50 Z" fill="var(${c})" opacity="0.16"/><path class="ln" pathLength="1" d="${line(series(seed))}" stroke="var(${c})"/></svg></div>`).join('');
    $('[data-streams]').innerHTML = EVENTS.slice(0, 6).map((e, i) => `<li><button type="button" data-stream="${e.area}" aria-label="${esc(e.name)}, ${k(e.n)} events. Open in Events."><i style="--c:var(${i % 2 ? '--mint' : '--pink'})"></i><span style="--c:var(${i % 2 ? '--mint' : '--pink'});--w:${40 + ((i * 23) % 55)}%"></span></button></li>`).join('');
    const q = Math.min(96, Math.round(52 + x * 20)); $('[data-quota]').textContent = q + '%'; $('[data-quota-bar]').style.width = q + '%';
    $('[data-pills]').innerHTML = CHANNELS.map((c, i) => `<button type="button" class="pz-pill" style="--h:${c.h}%;--k:${i};--top:var(--${c.top})" data-channel="${c.id}" aria-pressed="${S.channel === c.id}" aria-label="${esc(c.name)}, ${c.share}% of traffic. Open in Traffic."><i></i></button>`).join('');
    $('[data-rev]').textContent = '$' + k(Math.round(271300 * x));
    $('[data-weeks]').innerHTML = [38, 30, 52, 44, 66, 56, 46, 60, 72].map((h, i) => `<i style="--k:${i};height:${h}%"></i>`).join('');
    window.DBHero?.setMode(S.metric);
  }
  document.addEventListener('db-hero-ready', () => window.DBHero.setMode(S.metric));

  /* ---------- inner pages ---------- */
  const stateBox = (items, empty, body) => S.view === 'loading' ? '<div class="pz-skel"></div><div class="pz-skel"></div><div class="pz-skel"></div>' : S.view === 'error' ? '<div class="pz-state"><p>We couldn’t load this. Check your connection, then try again.</p><button class="pz-btn pz-btn--main" data-act="retry">Try again</button></div>' : (S.view === 'empty' || !items.length) ? `<div class="pz-state"><p>${esc(empty)}</p><button class="pz-btn" data-act="clear">Clear filters</button></div>` : body(items);
  const pages = {
    overview: paintOverview,
    traffic(el) { const q = S.q.trim().toLowerCase(), list = CHANNELS.filter((c) => !q || c.name.toLowerCase().includes(q)).sort((a, b) => b.h - a.h), cur = CHANNELS.find((c) => c.id === S.channel);
      el.innerHTML = `<div class="pz-sheet-head"><div><h1>Traffic</h1><p class="pz-sub">Share of requests by channel over ${S.range}. Pick a channel to see its day.</p></div><div class="pz-tools"><input class="pz-field" type="search" placeholder="Filter channels" aria-label="Filter channels" value="${esc(S.q)}" data-q></div></div>
        ${stateBox(list, `No channels match “${S.q}”.`, (it) => `<div class="pz-grid">${it.map((c, i) => `<button type="button" class="pz-card" style="--k:${i}" data-channel="${c.id}" aria-pressed="${S.channel === c.id}"><span class="bar" aria-hidden="true"><i style="height:${c.h * 1.6}%"></i></span><small>${esc(c.name)}</small><b class="num">${c.share}%</b><small>${k(Math.round(c.share * 4200 * mult()))} requests</small></button>`).join('')}</div>`)}
        <section class="pz-panel"><h2>${esc(cur.name)}: requests by hour</h2><div class="pz-hours" role="img" aria-label="Requests per hour for ${esc(cur.name)}, peaking in the early evening">${[...Array(24)].map((_, h) => `<i style="--k:${h};height:${Math.min(100, 20 + Math.round(60 * Math.max(0, Math.sin((h - 5) / 24 * Math.PI * 1.6)) + ((h * (cur.h + 3)) % 17)))}%"></i>`).join('')}</div><p class="pz-axis"><span>Midnight</span><span>6 am</span><span>Noon</span><span>6 pm</span><span>Now</span></p></section>`; },
    events(el) { const q = S.q.trim().toLowerCase(), list = EVENTS.filter((e) => (S.area === 'All' || e.area === S.area) && (!q || (e.name + e.area).toLowerCase().includes(q))).sort((a, b) => (S.sort === 'n' ? a.n - b.n : a[S.sort].localeCompare(b[S.sort])) * S.dir);
      const th = (key, l) => `<th aria-sort="${S.sort === key ? (S.dir > 0 ? 'ascending' : 'descending') : 'none'}"><button data-sort="${key}">${l}</button></th>`;
      el.innerHTML = `<div class="pz-sheet-head"><div><h1>Events</h1><p class="pz-sub">${list.length} of ${EVENTS.length} event types in ${S.range}.</p></div><div class="pz-tools"><input class="pz-field" type="search" placeholder="Search events" aria-label="Search events" value="${esc(S.q)}" data-q></div></div>
        <div class="pz-tools" role="group" aria-label="Area">${['All', ...new Set(EVENTS.map((e) => e.area))].map((a) => `<button class="pz-btn" data-area="${a}" aria-pressed="${S.area === a}">${a}</button>`).join('')}</div>
        <section class="pz-panel">${stateBox(list, q ? `No events match “${S.q}”.` : 'No events in this area.', (it) => `<table class="pz-table"><thead><tr>${th('name', 'Event')}${th('status', 'Status')}${th('area', 'Area')}${th('n', 'Count')}</tr></thead><tbody>${it.map((e) => `<tr tabindex="0" data-event="${e.id}"><td><b>${esc(e.name)}</b></td><td><span class="pz-pilltag" data-s="${e.status}">${e.status}</span></td><td>${e.area}</td><td class="num">${k(Math.round(e.n * mult()))}</td></tr>`).join('')}</tbody></table>`)}</section>`; },
    regions(el) { const r = REGIONS.find((x) => x.id === S.region), max = Math.max(...REGIONS.map((x) => x.ms));
      el.innerHTML = `<div class="pz-sheet-head"><div><h1>Regions</h1><p class="pz-sub">Latency and uptime by region. Pick one to see it and set a watch.</p></div></div>
        <div class="pz-cols"><section class="pz-panel">${stateBox(REGIONS, 'No regions reporting.', (it) => it.map((x) => `<button type="button" class="pz-row" data-region="${x.id}" aria-pressed="${S.region === x.id}"><span><b>${x.name}</b><small>${k(Math.round(x.rps * (0.8 + mult() * 0.2)))} rps · ${x.up}% up</small><span class="pz-meter"><i style="width:${(x.ms / max) * 100}%"></i></span></span><b class="num">${x.ms} ms</b></button>`).join(''))}</section>
          <div style="display:grid;gap:16px"><section class="pz-panel"><h2>${r.name}</h2><div class="pz-row"><span>p95 latency</span><b class="num">${r.ms} ms</b></div><div class="pz-row"><span>Throughput</span><b class="num">${k(r.rps)} rps</b></div><div class="pz-row"><span>Uptime</span><b class="num">${r.up}%</b></div></section>
            <form class="pz-panel" data-watch novalidate><h2>Watch ${r.name}</h2><label class="pz-label">Alert me above (ms)<input class="pz-field" name="ms" inputmode="numeric" value="${r.ms + 30}" aria-describedby="err-ms"></label><p class="pz-err" id="err-ms" role="alert"></p><button class="pz-btn pz-btn--main">Save watch</button>
              ${S.watches.map((w) => `<div class="pz-row"><span><b>${REGIONS.find((x) => x.id === w.region).name}</b><small>above ${w.ms} ms</small></span><button type="button" class="pz-btn" data-unwatch="${w.id}">Remove</button></div>`).join('')}</form>
            <section class="pz-panel"><h2>Preview a state</h2><label class="pz-label">Lists show<select class="pz-field" data-view>${['ready', 'loading', 'empty', 'error'].map((v) => `<option${S.view === v ? ' selected' : ''}>${v}</option>`).join('')}</select></label></section></div></div>`; },
  };

  /* ---------- drawer ---------- */
  let lastFocus = null;
  function openEvent(id) { const e = EVENTS.find((x) => x.id === id); lastFocus = document.activeElement;
    $('[data-drawer-panel]').innerHTML = `<div class="pz-drawer-top"><div><h2 id="pz-drawer-title">${esc(e.name)}</h2><p class="pz-sub">${e.area} · last seen ${e.ago}</p></div><button class="pz-x" data-act="close" aria-label="Close">×</button></div>
      <section class="pz-panel"><div class="pz-row"><span>Count in ${S.range}</span><b class="num">${k(Math.round(e.n * mult()))}</b></div><div class="pz-row"><span>Status</span><span class="pz-pilltag" data-s="${e.status}">${e.status}</span></div><div class="pz-row"><span>Share of all events</span><b class="num">${((e.n / EVENTS.reduce((s, x) => s + x.n, 0)) * 100).toFixed(1)}%</b></div></section>
      <div class="pz-tools"><button class="pz-btn pz-btn--main" data-act="mute" data-name="${esc(e.name)}">Mute alerts for 1 hour</button><button class="pz-btn" data-act="copy" data-name="${esc(e.name)}">Copy event name</button></div>`;
    $('[data-drawer]').hidden = false; $('.pz-x').focus(); }
  function closeDrawer() { $('[data-drawer]').hidden = true; lastFocus?.focus?.(); }

  /* ---------- events ---------- */
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-drawer]')) return closeDrawer();
    const t = e.target.closest('[data-range-v],[data-metric],[data-tag],[data-channel],[data-stream],[data-act],[data-area],[data-sort],[data-event],[data-region],[data-unwatch]'); if (!t) return; const d = t.dataset;
    if (d.rangeV) { S.range = d.rangeV; $$('[data-range-v]').forEach((b) => b.setAttribute('aria-pressed', String(b === t))); return render(); }
    if (d.metric) { S.metric = d.metric; return render(); } if (d.tag) { S.tag = +d.tag; return render(); }
    if (d.channel) { S.channel = d.channel; if (current === 'overview') { location.hash = '#/traffic'; return; } return render(); }
    if (d.stream) { S.area = d.stream; S.q = ''; location.hash = '#/events'; return; }
    if (d.area) { S.area = d.area; return render(); } if (d.sort) { S.dir = S.sort === d.sort ? -S.dir : 1; S.sort = d.sort; return render(); }
    if (d.event) return openEvent(d.event); if (d.region) { S.region = d.region; return render(); }
    if (d.unwatch) { const i = S.watches.findIndex((w) => w.id === d.unwatch), gone = S.watches.splice(i, 1)[0]; render(); return toast('Watch removed', () => { S.watches.splice(i, 0, gone); render(); }); }
    switch (d.act) { case 'bell': return toast('2 alerts: payment.failed is up; AF-south latency above 110 ms'); case 'close': return closeDrawer(); case 'mute': closeDrawer(); return toast(`Alerts for ${d.name} muted for 1 hour`); case 'copy': return toast(`${d.name} copied`);
      case 'retry': S.view = 'ready'; return render(); case 'clear': S.q = ''; S.area = 'All'; S.view = 'ready'; return render(); }
  });
  document.addEventListener('keydown', (e) => { const dr = $('[data-drawer]'); if (e.key === 'Enter' && e.target.matches('tr[data-event]')) return openEvent(e.target.dataset.event); if (dr.hidden) return; if (e.key === 'Escape') return closeDrawer();
    if (e.key === 'Tab') { const f = $$('button,select,input,a[href]', dr), a = f[0], z = f.at(-1); if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } });
  document.addEventListener('input', (e) => { if (e.target.matches('[data-q]')) { S.q = e.target.value; render(); const q = $('[data-q]'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); } });
  document.addEventListener('change', (e) => { if (e.target.matches('[data-view]')) { S.view = e.target.value; toast(`Lists now show the ${S.view} state`); render(); } });
  document.addEventListener('submit', (e) => { e.preventDefault(); const f = e.target; if (!f.matches('[data-watch]')) return; const ms = parseInt(f.ms.value, 10);
    if (!Number.isFinite(ms) || ms < 10 || ms > 2000) { $('#err-ms').textContent = 'Enter a number of milliseconds between 10 and 2000.'; return f.ms.focus(); }
    S.watches = S.watches.filter((w) => w.region !== S.region); S.watches.push({ id: 'w' + Date.now(), region: S.region, ms }); render(); toast(`Watching ${REGIONS.find((x) => x.id === S.region).name} above ${ms} ms`); });

  /* ---------- routing ---------- */
  let current = 'overview';
  function render() { pages[current]($(`[data-db-page="${current}"]`)); }
  window.DB.route([{ id: 'overview', name: 'Overview' }, { id: 'traffic', name: 'Traffic' }, { id: 'events', name: 'Events' }, { id: 'regions', name: 'Regions' }], (id) => {
    current = id; if (id !== 'events') S.q = S.q; $$('[data-db-page]').forEach((s) => { s.hidden = s.dataset.dbPage !== id; });
    $$('.pz-nav a').forEach((a) => { a.hash === '#/' + id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); }); render();
  });
  new MutationObserver(() => window.DBHero?.recolor()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-variant'] });
  document.documentElement.dataset.ready = 'true';
})();
