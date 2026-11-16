/* Mallow Music: clay listening board. Sample data is fictional. No polling; state in memory. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TRACKS = [
    { id: 't1', t: 'Sunset Drive', a: 'Lofi Chill', cover: 'media/cover-1.webp', cover2: 'media/cover-1@2x.webp', len: 214, genre: 'Lo-fi' },
    { id: 't2', t: 'Golden Hour', a: 'JVKE', cover: 'media/cover-2.webp', cover2: 'media/cover-2@2x.webp', len: 199, genre: 'Pop' },
    { id: 't3', t: 'Coffee Shop', a: 'Beabadoobee', cover: 'media/cover-3.webp', cover2: 'media/cover-3@2x.webp', len: 187, genre: 'Indie' },
    { id: 't4', t: 'Porch Light', a: 'Juniper Lane', cover: 'media/cover-1.webp', cover2: 'media/cover-1@2x.webp', len: 204, genre: 'Folk' },
    { id: 't5', t: 'Paper Boats', a: 'The Tidepools', cover: 'media/cover-2.webp', cover2: 'media/cover-2@2x.webp', len: 176, genre: 'Pop' },
    { id: 't6', t: 'Warm Static', a: 'Okoro & Fen', cover: 'media/cover-3.webp', cover2: 'media/cover-3@2x.webp', len: 231, genre: 'Soul' },
    { id: 't7', t: 'Low Tide Café', a: 'Bramble Kids', cover: 'media/cover-1.webp', cover2: 'media/cover-1@2x.webp', len: 219, genre: 'Lo-fi' },
    { id: 't8', t: 'Night Bus', a: 'Mira Calloway', cover: 'media/cover-2.webp', cover2: 'media/cover-2@2x.webp', len: 192, genre: 'Hip Hop' },
    { id: 't9', t: 'Velvet Room', a: 'Aster Park', cover: 'media/cover-3.webp', cover2: 'media/cover-3@2x.webp', len: 245, genre: 'Jazz' },
    { id: 't10', t: 'Soft Launch', a: 'Pixel Fern', cover: 'media/cover-1.webp', cover2: 'media/cover-1@2x.webp', len: 168, genre: 'Pop' },
  ];
  const PLAYLISTS = [
    { id: 'p1', name: 'Chill Vibes', n: 80, cover: 'media/daily-mix.webp' },
    { id: 'p2', name: 'Morning Stretch', n: 42, cover: 'media/cover-2.webp' },
    { id: 'p3', name: 'Desk Focus', n: 56, cover: 'media/cover-1.webp' },
    { id: 'p4', name: 'Kitchen Dance', n: 31, cover: 'media/cover-3.webp' },
  ];
  const PODCASTS = [
    { id: 'c1', name: 'Clay & Sound', ep: 'Episode 12 · Soft edges', cover: 'media/cover-2.webp' },
    { id: 'c2', name: 'Weekend Mix Notes', ep: 'Guest: Lofi Chill', cover: 'media/cover-3.webp' },
    { id: 'c3', name: 'Tiny Venues', ep: 'A café in Marrow Bay', cover: 'media/cover-1.webp' },
  ];
  const GENRES = [
    { n: 'Pop', v: 45, c: '--g4' },
    { n: 'Lo-fi', v: 25, c: '--g2' },
    { n: 'Hip Hop', v: 15, c: '--g3' },
    { n: 'Rock', v: 10, c: '--g6' },
    { n: 'Other', v: 5, c: '--g5' },
  ];
  const WEEK = {
    this: [3.2, 4.8, 2.6, 5.4, 3.9, 5.8, 4.1],
    last: [2.4, 3.1, 3.8, 2.9, 4.6, 5.1, 3.3],
  };
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const BAR_COLORS = ['--g1', '--g2', '--g3', '--g4', '--g5', '--g6', '--g7'];

  const S = {
    week: 'this', playing: null, favs: new Set(['t2', 't3', 't5']), genre: -1, day: -1,
    lib: 'all', q: '', view: 'ready', sort: 'recent',
    profile: { name: 'Juno Reed', email: 'juno@mallow.example', notify: true, offline: true, hifi: false },
  };

  /* decorative SVG bits */
  const _crown=$('.mm-crown'); if(_crown) _crown.innerHTML = `<svg viewBox="0 0 60 44" aria-hidden="true"><path d="M6 36 2 10l16 12L30 4l12 18 16-12-4 26z" fill="var(--gold)"/><rect x="6" y="34" width="48" height="8" rx="4" fill="var(--gold)"/><circle cx="30" cy="20" r="3.5" fill="var(--card)" opacity=".7"/></svg>`;
  const _plant=$('.mm-plant'); if(_plant) _plant.innerHTML = `<svg viewBox="0 0 140 170" aria-hidden="true"><path d="M70 110C40 90 20 60 34 40c22 12 32 40 36 70Z" fill="var(--leaf)"/><path d="M70 110c26-24 48-48 34-76-22 16-32 46-34 76Z" fill="var(--leaf-2)"/><path d="M70 110c-6-40-4-70 4-94 12 28 8 64-4 94Z" fill="var(--leaf)"/><path d="M34 108h72l-8 54a6 6 0 0 1-6 5H48a6 6 0 0 1-6-5Z" fill="var(--pot)"/><rect x="30" y="102" width="80" height="14" rx="7" fill="var(--pot)" stroke="var(--wood)" stroke-opacity=".35"/></svg>`;

  const h = new Date().getHours();
  const greet = h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
  const _greet=$('[data-greet]'); if(_greet) _greet.innerHTML = `${greet}, Juno! <span aria-hidden="true">${h < 12 ? '☀️' : h < 18 ? '🌤️' : '🌙'}</span>`;

  function toast(msg, undo) {
    const t = $('[data-toast]');
    t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button">Undo</button>' : ''}`;
    t.hidden = false;
    if (undo) $('button', t).onclick = () => { undo(); t.hidden = true; };
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, undo ? 6000 : 2800);
  }

  function paintBars() {
    const vals = WEEK[S.week];
    const max = Math.max(...vals) || 1;
    $('[data-bars]').innerHTML = DAYS.map((d, i) => `<button type="button" class="mm-bar" data-day="${i}" aria-pressed="${S.day === i}" aria-label="${d}: ${vals[i]} hours"><i style="--bar:var(${BAR_COLORS[i]});--k:${i};height:${(vals[i] / max * 100).toFixed(1)}%"></i><span>${d}</span></button>`).join('');
    $('[data-week-label]').textContent = S.week === 'this' ? 'This Week' : 'Last Week';
  }

  function paintDonut() {
    const size = 120, w = 18, gap = 2.2, r = (size - w) / 2, c = size / 2;
    const total = GENRES.reduce((a, g) => a + g.v, 0);
    let off = 0;
    const segs = GENRES.map((g, i) => {
      const len = (g.v / total) * 100;
      const active = S.genre === i;
      const sw = active ? w + 2 : w;
      const seg = `<circle class="seg" cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${sw}" pathLength="100" stroke-dasharray="${Math.max(0.01, len - gap).toFixed(2)} ${(100 - len + gap).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})" style="stroke:var(${g.c})" pathLength="100"/>`;
      off += len; return seg;
    }).join('');
    const label = S.genre < 0 ? ['Top', 'mix'] : [GENRES[S.genre].v + '%', GENRES[S.genre].n];
    $('[data-donut]').innerHTML = `<div class="mm-donut-wrap"><svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--surface)" stroke-width="${w}"/>${segs}<circle cx="${c}" cy="${c}" r="${r - w / 2 - 4}" fill="var(--card)"/></svg><span class="mm-donut-label"><b>${label[0]}</b><small>${esc(label[1])}</small></span></div>`;
    // force draw animation by setting dashoffset via CSS class already
    $('[data-legend]').innerHTML = GENRES.map((g, i) => `<li><button type="button" data-genre="${i}" aria-pressed="${S.genre === i}"><i class="mm-dot" style="--dot:var(${g.c})"></i><b>${esc(g.n)}</b><small>${g.v}%</small></button></li>`).join('');
  }

  function paintTracks() {
    const q = S.q.trim().toLowerCase();
    const list = TRACKS.filter((t) => !q || (t.t + t.a).toLowerCase().includes(q)).slice(0, 3);
    $('[data-tracks]').innerHTML = list.map((t) => `<li>
      <img src="${t.cover}" srcset="${t.cover} 1x, ${t.cover2} 2x" width="96" height="96" alt="" decoding="async">
      <span><b>${esc(t.t)}</b><small>${esc(t.a)}</small></span>
      <button type="button" class="mm-play" data-play="${t.id}" aria-pressed="${S.playing === t.id}" aria-label="${S.playing === t.id ? 'Pause' : 'Play'} ${esc(t.t)}"><svg><use href="#i-${S.playing === t.id ? 'pause' : 'play'}"/></svg></button>
    </li>`).join('') || `<li class="mm-sub" style="display:block;padding:12px">No tracks match “${esc(S.q)}”.</li>`;
  }

  function paintOverview() {
    paintBars(); paintDonut(); paintTracks();
    $('[data-kpi="favs"]').textContent = String(125 + S.favs.size); // baseline 128 with 3 hearts
  }

  const stateBox = (items, empty, body) => {
    if (S.view === 'loading') return '<div class="mm-skel"></div><div class="mm-skel"></div><div class="mm-skel"></div>';
    if (S.view === 'error') return '<div class="mm-state"><p>We couldn’t load this just now. Check your connection, then try again.</p><button class="mm-btn-soft mm-btn-soft--main" data-act="retry">Try again</button></div>';
    if (S.view === 'empty' || !items.length) return `<div class="mm-state"><p>${esc(empty)}</p><button class="mm-btn-soft" data-act="clear">Clear filters</button></div>`;
    return body(items);
  };

  function spark(vals) {
    const w = 640, h = 180, mx = Math.max(...vals), mn = Math.min(...vals);
    const pt = vals.map((y, i) => [20 + (i / (vals.length - 1)) * (w - 40), 20 + (1 - (y - mn) / (mx - mn || 1)) * (h - 50)]);
    const d = pt.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    return `<svg class="mm-spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="Listening hours over the last two weeks"><path class="ar" d="${d} L ${pt.at(-1)[0]} ${h - 20} L 20 ${h - 20} Z"/><path class="ln" pathLength="1" d="${d}"/></svg>`;
  }

  const titles = { overview: 'Dashboard', library: 'My Music', activity: 'Activity', settings: 'Settings' };
  const pages = {
    overview() { paintOverview(); },
    library(el) {
      const q = S.q.trim().toLowerCase();
      const filterLib = S.lib || 'all';
      let tracks = TRACKS.filter((t) => !q || (t.t + t.a + t.genre).toLowerCase().includes(q));
      if (filterLib === 'favs') tracks = tracks.filter((t) => S.favs.has(t.id));
      const body = () => {
        if (filterLib === 'playlists') {
          const list = PLAYLISTS.filter((p) => !q || p.name.toLowerCase().includes(q));
          return stateBox(list, 'No playlists match.', (it) => `<div class="mm-grid">${it.map((p) => `<button type="button" class="mm-tile" data-act="open-pl" data-id="${p.id}"><img src="${p.cover}" alt="" width="112" height="112" decoding="async"><span><b>${esc(p.name)}</b><small>${p.n} songs</small></span><span class="mm-play" aria-hidden="true"><svg><use href="#i-play"/></svg></span></button>`).join('')}</div>`);
        }
        if (filterLib === 'podcasts') {
          const list = PODCASTS.filter((p) => !q || (p.name + p.ep).toLowerCase().includes(q));
          return stateBox(list, 'No podcasts match.', (it) => `<div class="mm-grid">${it.map((p) => `<button type="button" class="mm-tile" data-act="open-pod" data-id="${p.id}"><img src="${p.cover}" alt="" width="112" height="112" decoding="async"><span><b>${esc(p.name)}</b><small>${esc(p.ep)}</small></span><span class="mm-play" aria-hidden="true"><svg><use href="#i-play"/></svg></span></button>`).join('')}</div>`);
        }
        return stateBox(tracks, q ? `No songs match “${S.q}”.` : 'No songs in this shelf yet.', (it) => `<div class="mm-grid">${it.map((t) => `<button type="button" class="mm-tile" data-play="${t.id}"><img src="${t.cover}" srcset="${t.cover} 1x, ${t.cover2} 2x" alt="" width="112" height="112" decoding="async"><span><b>${esc(t.t)}</b><small>${esc(t.a)} · ${esc(t.genre)}</small></span><span class="mm-play" aria-pressed="${S.playing === t.id}" aria-hidden="true"><svg><use href="#i-${S.playing === t.id ? 'pause' : 'play'}"/></svg></span></button>`).join('')}</div>`);
      };
      el.innerHTML = `<div class="mm-head"><div><h1>My Music</h1><p class="mm-sub">${filterLib === 'favs' ? 'Tracks you hearted.' : filterLib === 'playlists' ? 'Playlists you keep close.' : filterLib === 'podcasts' ? 'Shows in your queue.' : 'Everything in your library.'}</p></div>
        <div class="mm-tools" role="group" aria-label="Library shelf">${[['all', 'All'], ['favs', 'Favorites'], ['playlists', 'Playlists'], ['podcasts', 'Podcasts']].map(([v, l]) => `<button type="button" class="mm-btn-soft" data-lib="${v}" aria-pressed="${filterLib === v}">${l}</button>`).join('')}</div></div>
        <section class="mm-panel"><h2>${filterLib === 'playlists' ? 'Playlists' : filterLib === 'podcasts' ? 'Podcasts' : 'Tracks'}</h2>${body()}</section>`;
    },
    activity(el) {
      const series = [...WEEK.last, ...WEEK.this];
      const recent = TRACKS.slice(0, 6);
      el.innerHTML = `<div class="mm-head"><div><h1>Activity</h1><p class="mm-sub">Hours, streaks and what you played lately.</p></div>
        <div class="mm-tools" role="group" aria-label="Week">${[['this', 'This week'], ['last', 'Last week']].map(([v, l]) => `<button type="button" class="mm-btn-soft" data-act="set-week" data-v="${v}" aria-pressed="${S.week === v}">${l}</button>`).join('')}</div></div>
        <section class="mm-panel"><h2>Listening hours</h2>${spark(series)}<p class="mm-sub">Peak day: ${DAYS[WEEK[S.week].indexOf(Math.max(...WEEK[S.week]))]} · ${Math.max(...WEEK[S.week])} h</p></section>
        <div class="mm-cols">
          <section class="mm-panel"><h2>Recently played</h2>${stateBox(recent, 'Nothing played yet.', (it) => it.map((t) => `<div class="mm-row"><span><b>${esc(t.t)}</b><small>${esc(t.a)}</small></span><button type="button" class="mm-btn-soft" data-play="${t.id}">${S.playing === t.id ? 'Pause' : 'Play'}</button></div>`).join(''))}</section>
          <section class="mm-panel"><h2>Favorites</h2>${[...S.favs].map((id) => { const t = TRACKS.find((x) => x.id === id); return `<div class="mm-row"><span><b>${esc(t.t)}</b><small>${esc(t.a)}</small></span><button type="button" class="mm-btn-soft" data-unfav="${id}">Remove</button></div>`; }).join('') || '<p class="mm-sub">Heart a track to keep it here.</p>'}</section>
        </div>`;
    },
    settings(el) {
      const p = S.profile;
      const sw = (k, l) => `<label class="mm-switch"><span>${l}</span><input type="checkbox" data-pref="${k}"${p[k] ? ' checked' : ''}></label>`;
      el.innerHTML = `<div class="mm-head"><div><h1>Settings</h1><p class="mm-sub">Profile, playback, devices and preview states.</p></div></div>
        <div class="mm-cols">
          <form class="mm-panel" data-profile novalidate>
            <h2>Profile</h2>
            <label class="mm-label">Name<input class="mm-field" name="name" value="${esc(p.name)}" aria-describedby="err-name"></label>
            <p class="mm-err" id="err-name" role="alert"></p>
            <label class="mm-label">Email<input class="mm-field" type="email" name="email" value="${esc(p.email)}" aria-describedby="err-email"></label>
            <p class="mm-err" id="err-email" role="alert"></p>
            <label class="mm-label">Display name<input class="mm-field" name="display" value="Juno" aria-describedby="hint-display"></label><p class="mm-sub" id="hint-display">Shown on shared playlists</p>
            <label class="mm-label">Home city<input class="mm-field" name="city" value="Marrow Bay"></label>
            <button class="mm-btn-soft mm-btn-soft--main">Save profile</button>
          </form>
          <div style="display:grid;gap:14px">
            <section class="mm-panel"><h2>Playback</h2>${sw('notify', 'Notify me about new mixes')}${sw('offline', 'Download for offline')}${sw('hifi', 'Prefer HiFi when on Wi‑Fi')}</section>
            <section class="mm-panel"><h2>Connected devices</h2>
              <div class="mm-row"><span><b>Studio MacBook</b><small>Last active · today</small></span><span class="mm-chip">This device</span></div>
              <div class="mm-row"><span><b>Kitchen speaker</b><small>Cast · idle</small></span><button type="button" class="mm-btn-soft" data-act="bell">Disconnect</button></div>
              <div class="mm-row"><span><b>Juno’s phone</b><small>iOS · yesterday</small></span><button type="button" class="mm-btn-soft" data-act="bell">Remove</button></div>
            </section>
            <section class="mm-panel"><h2>Preview a state</h2><p class="mm-sub">For design review: how lists look while loading, empty or failing.</p>
              <label class="mm-label">Lists show<select class="mm-field" data-view>${['ready', 'loading', 'empty', 'error'].map((v) => `<option${S.view === v ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
            </section>
            <section class="mm-panel"><h2>Mallow Plus</h2><p class="mm-sub">Ad-free listening, offline mixes and lossless sound.</p><button type="button" class="mm-btn-soft mm-btn-soft--main" data-act="upgrade">Upgrade Now</button></section>
          </div>
        </div>`;
    },
  };

  /* drawer */
  let lastFocus = null;
  function drawer(html) {
    lastFocus = document.activeElement;
    $('[data-drawer-panel]').innerHTML = html;
    $('[data-drawer]').hidden = false;
    $('.mm-x')?.focus();
  }
  function closeDrawer() { $('[data-drawer]').hidden = true; lastFocus?.focus?.(); }
  const head = (t, s) => `<div class="mm-drawer-top"><div><h2 id="mm-drawer-title">${esc(t)}</h2><p class="mm-sub">${esc(s)}</p></div><button type="button" class="mm-x" data-act="close" aria-label="Close"><svg><use href="#i-x"/></svg></button></div>`;
  function openTrack(id) {
    const t = TRACKS.find((x) => x.id === id); if (!t) return;
    drawer(`${head(t.t, `${t.a} · ${t.genre}`)}
      <img src="${t.cover}" srcset="${t.cover} 1x, ${t.cover2} 2x" alt="" width="400" height="400" style="width:100%;border-radius:24px;box-shadow:var(--clay-soft)" decoding="async">
      <div class="mm-tools">
        <button type="button" class="mm-btn-soft mm-btn-soft--main" data-play="${t.id}">${S.playing === t.id ? 'Pause' : 'Play'}</button>
        <button type="button" class="mm-btn-soft" data-fav="${t.id}">${S.favs.has(t.id) ? 'Remove favorite' : 'Add to favorites'}</button>
      </div>
      <section class="mm-panel"><h2>About</h2><p class="mm-sub">${esc(t.t)} sits in your ${esc(t.genre)} shelf. Sample track — nothing streams from here.</p></section>`);
  }

  /* events */
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-drawer]')) return closeDrawer();
    const t = e.target.closest('[data-act],[data-play],[data-day],[data-genre],[data-lib],[data-fav],[data-unfav],[data-nav]');
    if (!t) return;
    const d = t.dataset;

    if (d.play) {
      S.playing = S.playing === d.play ? null : d.play;
      const tr = TRACKS.find((x) => x.id === d.play);
      toast(S.playing ? `Playing ${tr.t}` : `Paused ${tr.t}`);
      if (!$('[data-drawer]').hidden) openTrack(d.play);
      return render();
    }
    if (d.day != null) { S.day = S.day === +d.day ? -1 : +d.day; paintBars(); return toast(`${DAYS[S.day >= 0 ? S.day : 0]} · ${WEEK[S.week][S.day >= 0 ? S.day : 0]} hours`); }
    if (d.genre != null) { S.genre = S.genre === +d.genre ? -1 : +d.genre; paintDonut(); return toast(S.genre < 0 ? 'Showing all genres' : `${GENRES[S.genre].n} · ${GENRES[S.genre].v}%`); }
    if (d.lib) { S.lib = d.lib; location.hash = '#/library'; return render(); }
    if (d.fav) {
      const on = !S.favs.has(d.fav);
      on ? S.favs.add(d.fav) : S.favs.delete(d.fav);
      toast(on ? 'Added to favorites' : 'Removed from favorites');
      openTrack(d.fav); return render();
    }
    if (d.unfav) {
      const id = d.unfav; S.favs.delete(id); render();
      return toast('Removed from favorites', () => { S.favs.add(id); render(); });
    }

    switch (d.act) {
      case 'week':
        S.week = S.week === 'this' ? 'last' : 'this'; paintBars(); return toast(S.week === 'this' ? 'This week' : 'Last week');
      case 'set-week':
        S.week = d.v; return render();
      case 'play-mix':
      case 'play-daily':
        S.playing = 't1'; render(); return toast('Playing Chill Vibes');
      case 'see-recent':
        location.hash = '#/library'; return;
      case 'see-mix':
        S.lib = 'playlists'; location.hash = '#/library'; return;
      case 'explore':
        location.hash = '#/library'; return toast('Opening discoveries in My Music');
      case 'bell':
        return toast('3 new: Chill Vibes refreshed, Golden Hour liked, Plus trial ends Friday');
      case 'upgrade':
        return toast('Mallow Plus starts with a 14-day trial — sample only');
      case 'open-pl': {
        const p = PLAYLISTS.find((x) => x.id === d.id);
        return drawer(`${head(p.name, `${p.n} songs`)}<img src="${p.cover}" alt="" style="width:100%;border-radius:24px" decoding="async"><button type="button" class="mm-btn-soft mm-btn-soft--main" data-act="play-daily">Play playlist</button>`);
      }
      case 'open-pod': {
        const p = PODCASTS.find((x) => x.id === d.id);
        return drawer(`${head(p.name, p.ep)}<p class="mm-sub">Sample podcast episode. Nothing streams from this gallery board.</p><button type="button" class="mm-btn-soft mm-btn-soft--main" data-act="play-mix">Play episode</button>`);
      }
      case 'close': return closeDrawer();
      case 'retry': S.view = 'ready'; return render();
      case 'clear': S.q = ''; S.lib = 'all'; S.view = 'ready'; return render();
    }
  });

  document.addEventListener('keydown', (e) => {
    const dr = $('[data-drawer]');
    if (dr.hidden) return;
    if (e.key === 'Escape') return closeDrawer();
    if (e.key === 'Tab') {
      const f = $$('button, [href], input, select', dr), a = f[0], z = f.at(-1);
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target.matches('[data-q]')) {
      S.q = e.target.value;
      if (current === 'overview') paintTracks();
      else render();
      const q = $('[data-q]'); q?.focus(); q?.setSelectionRange(q.value.length, q.value.length);
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-pref]')) { S.profile[t.dataset.pref] = t.checked; toast(t.checked ? 'Turned on' : 'Turned off'); }
    if (t.matches('[data-view]')) { S.view = t.value; toast(`Lists now show the ${S.view} state`); }
  });

  document.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (!f.matches('[data-profile]')) return;
    const d = Object.fromEntries(new FormData(f));
    const okN = d.name.trim(), okE = /^\S+@\S+\.\S+$/.test(d.email);
    $('#err-name').textContent = okN ? '' : 'Enter your name.';
    $('#err-email').textContent = okE ? '' : 'Enter an email like name@example.com.';
    if (!okN) return f.name.focus();
    if (!okE) return f.email.focus();
    Object.assign(S.profile, { name: okN, email: d.email });
    toast('Profile saved');
  });

  /* pointer parallax on hero art */
  const board = $('[data-board]');
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    board.addEventListener('pointermove', (e) => {
      const r = board.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      const art = $('.mm-hero-art');
      if (art) art.style.transform = `translate(${(-x * 8).toFixed(1)}px, ${(-y * 6).toFixed(1)}px)`;
    });
    board.addEventListener('pointerleave', () => { const art = $('.mm-hero-art'); if (art) art.style.transform = ''; });
  }

  /* routing */
  let current = 'overview';
  function syncNav(id) {
    $$('.mm-nav a').forEach((a) => {
      const nav = a.dataset.nav;
      const on = nav === id || (id === 'library' && nav === 'library' && (!a.dataset.lib || a.dataset.lib === S.lib || (S.lib === 'all' && a.dataset.lib === 'all')));
      // only one current: match page; for library prefer the matching shelf link
      let cur = false;
      if (id === 'overview') cur = nav === 'overview';
      else if (id === 'activity') cur = nav === 'activity';
      else if (id === 'settings') cur = nav === 'settings';
      else if (id === 'library') {
        if (S.lib === 'favs') cur = a.dataset.lib === 'favs';
        else if (S.lib === 'playlists') cur = a.dataset.lib === 'playlists';
        else if (S.lib === 'podcasts') cur = a.dataset.lib === 'podcasts';
        else cur = a.dataset.lib === 'all';
      }
      cur ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
    });
    $('[data-title]').textContent = titles[id] || 'Dashboard';
  }
  function render() {
    const el = $(`[data-db-page="${current}"]`);
    pages[current](el);
    syncNav(current);
  }

  // shelf deep-links from sidebar
  $$('.mm-nav a[data-lib]').forEach((a) => a.addEventListener('click', () => { S.lib = a.dataset.lib || 'all'; }));

  window.DB.route([
    { id: 'overview', name: 'Overview' },
    { id: 'library', name: 'Library' },
    { id: 'activity', name: 'Activity' },
    { id: 'settings', name: 'Settings' },
  ], (id) => {
    current = id;
    $$('[data-db-page]').forEach((s) => { s.hidden = s.dataset.dbPage !== id; });
    // hide overview chrome pieces? sidebar+header stay; overview blocks hide with section
    render();
  });

  document.documentElement.dataset.ready = 'true';
})();
