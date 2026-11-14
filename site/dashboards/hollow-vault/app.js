/* Hollow Vault: painted relics/chest, multipage + motion. Sample data only. Keys earned in play. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = $('[data-db-app]') || document.body;
  const ICON = {
    map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    box: '<path d="m12 2 9 5v10l-9 5-9-5V7z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  };
  const svg = (n, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n] || ''}</svg>`;
  const paintIcons = (host = document) => $$('[data-icon]', host).forEach((el) => { el.innerHTML = svg(el.dataset.icon); });

  function seg(group, onChange) {
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      $$('button[data-v]', group).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onChange(b.dataset.v, b);
    });
  }
  function countUp(el, to, { duration = 500, format = (n) => String(Math.round(n)) } = {}) {
    if (reduce) { el.textContent = format(to); return; }
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = format((1 - Math.pow(1 - t, 3)) * to);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function toast(msg) {
    const t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(() => { t.hidden = true; }, 2200);
  }

  paintIcons();

  const RAR = { common: ['Common', '--r-common'], rare: ['Rare', '--r-rare'], epic: ['Epic', '--r-epic'], legend: ['Legendary', '--r-legend'] };
  const RELICS = [
    { k: 'potion', n: 'Draught of Dusk', r: 'epic', p: 8 },
    { k: 'tome', n: 'Moonwell Tome', r: 'rare', p: 14 },
    { k: 'crystal', n: 'Tidecrystal', r: 'rare', p: 14 },
    { k: 'broom', n: 'Gale Broom', r: 'epic', p: 8 },
    { k: 'feather', n: 'Owl Quill', r: 'common', p: 24 },
    { k: 'mushroom', n: 'Glowcap', r: 'common', p: 24 },
    { k: 'hat', n: 'Witchwarden Hat', r: 'legend', p: 3 },
    { k: 'cauldron', n: 'Ember Cauldron', r: 'legend', p: 5 },
  ];
  const QUESTS = [
    { n: 'Clear the marsh ruins', d: 'Daily', key: 1, done: true },
    { n: 'Win 3 arena rounds', d: 'Daily', key: 1, done: false },
    { n: 'Help a guildmate', d: 'Weekly', key: 2, done: false },
  ];
  const PEOPLE = { Maren: '--r-rare', Tobi: '--r-epic', Ilse: '--r-legend', Quill: '--brew', You: '--accent' };
  const MSGS = [
    { w: 'Maren', t: '18:02', m: 'Anyone up for the marsh ruins run? Need a healer.' },
    { w: 'Tobi', t: '18:05', m: 'Got a Gale Broom from the Moonwell chest!' },
    { sys: 'Ilse found Ember Cauldron (legendary).', t: '18:09' },
    { w: 'Ilse', t: '18:10', m: 'Took me 40 keys, the 5% is real.' },
    { w: 'Quill', t: '18:14', m: 'Arena opens in the evening, meet at the gate.' },
  ];
  const LIVE = [
    { who: 'Angelica', i: 7 },
    { who: 'Katya', i: 3 },
    { who: 'Madina', i: 0 },
    { who: 'Max', i: 5 },
    { who: 'Ilse', i: 7 },
  ];

  let keys = 3, seed = 7, win = -1, rar = 'all', focus = 6;
  const haul = [];
  const art = (k) => `<img src="media/${k}.webp" width="96" height="96" alt="" decoding="async">`;

  function renderWheel() {
    const core = $('.hv-core');
    $$('.hv-slot', $('[data-wheel]')).forEach((s) => s.remove());
    RELICS.forEach((r, i) => {
      const a = (i / RELICS.length) * Math.PI * 2 - Math.PI / 2;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hv-slot' + (i === win ? ' is-win' : '') + (i === focus ? ' is-focus' : '');
      b.style.left = 50 + Math.cos(a) * 37.5 + '%';
      b.style.top = 50 + Math.sin(a) * 37.5 + '%';
      b.innerHTML = `${art(r.k)}<span>${r.n}</span>`;
      b.dataset.slot = String(i);
      b.setAttribute('aria-label', `${r.n}, ${RAR[r.r][0]}, ${r.p}% drop rate`);
      core.before(b);
    });
    const btn = $('[data-open]');
    btn.disabled = keys < 1;
    btn.textContent = keys < 1 ? 'No keys left' : 'Open chest';
    countUp($('[data-keys]'), keys);
    renderFloat(focus);
  }

  function renderFloat(i) {
    const el = $('[data-float]');
    if (!el) return;
    const r = RELICS[i];
    if (!r) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = `${art(r.k)}<div><b>${r.n}</b><em style="color:var(${RAR[r.r][1]})">${RAR[r.r][0]}</em><small class="num">${r.p}% drop rate</small></div>`;
  }

  function renderItems() {
    const ok = (r) => rar === 'all' || (rar === 'rare' ? r.r !== 'common' : r.r === 'legend');
    const list = RELICS.filter(ok);
    $('[data-items]').innerHTML = list.length
      ? list.map((r) => `<li style="--rar:var(${RAR[r.r][1]})">${art(r.k)}<span>${r.n}</span><em>${RAR[r.r][0]}</em><small class="num">${r.p}% drop rate</small></li>`).join('')
      : `<li class="hv-none">No relics match this filter.</li>`;
  }

  function renderHaul() {
    $('[data-invcount]').textContent = haul.length ? `${haul.length} ${haul.length === 1 ? 'relic' : 'relics'} this session` : '';
    $('[data-inv]').innerHTML = haul.length
      ? haul.map((i) => {
        const r = RELICS[i];
        return `<li style="--rar:var(${RAR[r.r][1]})">${art(r.k)}${r.n}<small>${RAR[r.r][0]}</small></li>`;
      }).join('')
      : `<li class="hv-none">Nothing yet. Open the chest above to win your first relic.</li>`;
  }

  function renderLive() {
    const feed = LIVE.concat(haul.slice(0, 3).map((i) => ({ who: 'You', i })));
    $('[data-live]').innerHTML = feed.map((row) => {
      const r = RELICS[row.i];
      return `<article class="hv-live-item" role="listitem" style="--rar:var(${RAR[r.r][1]})">${art(r.k)}<span><b>${r.n}</b><small>${row.who}</small></span></article>`;
    }).join('');
  }

  function renderQuests() {
    $('[data-quests]').innerHTML = QUESTS.map((q, i) =>
      `<li><button type="button" data-q="${i}" aria-pressed="${q.done}"><span>${q.n}<small>${q.d}${q.done ? ' · claimed' : ''}</small></span><b>+${q.key} key${q.key > 1 ? 's' : ''}</b></button></li>`
    ).join('');
  }

  function renderMsgs() {
    $('[data-msgs]').innerHTML = MSGS.map((m) =>
      m.sys
        ? `<li class="is-sys"><p>${m.sys}</p><time>${m.t}</time></li>`
        : `<li><span class="hv-ava" aria-hidden="true">${m.w[0]}</span><div class="hv-msgbody"><div class="hv-msgmeta"><b>${m.w}</b><time>${m.t}</time></div><p></p></div></li>`
    ).join('');
    $$('[data-msgs] li:not(.is-sys) p').forEach((p, i) => {
      p.textContent = MSGS.filter((m) => !m.sys)[i].m;
    });
    const box = $('[data-msgs]');
    box.scrollTop = box.scrollHeight;
  }

  $('[data-open]').addEventListener('click', () => {
    if (keys < 1) return;
    seed = (seed * 9301 + 49297) % 233280;
    let roll = (seed / 233280) * 100;
    win = RELICS.findIndex((r) => (roll -= r.p) < 0);
    if (win < 0) win = 0;
    keys -= 1;
    haul.unshift(win);
    focus = win;
    const r = RELICS[win];
    $('[data-result]').textContent = `You found ${r.n} (${RAR[r.r][0].toLowerCase()}).`;
    if (r.r === 'legend' || r.r === 'epic') {
      MSGS.push({ sys: `You found ${r.n} (${RAR[r.r][0].toLowerCase()}).`, t: 'now' });
      renderMsgs();
    }
    renderWheel();
    renderHaul();
    renderLive();
    toast(`Opened · ${r.n}`);
    if (!reduce) {
      const slot = $(`.hv-slot[data-slot="${win}"]`);
      if (slot) {
        slot.classList.add('hv-pulse');
        setTimeout(() => slot.classList.remove('hv-pulse'), 600);
      }
    }
    if (keys < 1) $('[data-result]').textContent += ' Finish a quest to earn more keys.';
  });

  $('[data-wheel]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-slot]');
    if (!b) return;
    focus = +b.dataset.slot;
    renderWheel();
  });

  $('[data-quests]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    const q = QUESTS[+b.dataset.q];
    if (q.done) return;
    q.done = true;
    keys += q.key;
    renderQuests();
    renderWheel();
    toast(`Quest claimed · +${q.key} key${q.key > 1 ? 's' : ''}`);
    $(`[data-q="${b.dataset.q}"]`)?.focus();
  });

  seg($('[data-rarity]'), (v) => { rar = v; renderItems(); });

  $('[data-say]').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('[data-msg]').value.trim();
    if (!v) return;
    MSGS.push({ w: 'You', t: 'now', m: v });
    $('[data-msg]').value = '';
    renderMsgs();
  });

  renderWheel();
  renderItems();
  renderHaul();
  renderLive();
  renderQuests();
  renderMsgs();

  function staggerReveal() {
    $$('.hv-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 40 * i}ms`);
      el.classList.add('hv-reveal-in');
    });
  }

  const PAGES = [
    { id: 'overview', name: 'Quest vault', pattern: 'Dashboard' },
    { id: 'quests', name: 'Quest board', pattern: 'List' },
    { id: 'arena', name: 'Arena', pattern: 'Board' },
    { id: 'guild', name: 'Guild hall', pattern: 'List' },
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

  function pageHtml(page) {
    if (page.id === 'quests') {
      return `<section class="hv-page" data-db-page="quests" aria-labelledby="p-h">
        <h1 id="p-h">Quest board</h1>
        <p class="hv-page-lead">Daily and weekly tasks that earn keys. Sample data · fictional.</p>
        <div class="hv-seg" role="group" aria-label="Quest state" data-quest-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Open</button>
          <button type="button" data-v="loading" aria-pressed="false">Syncing</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-quest-body></div>
      </section>`;
    }
    if (page.id === 'arena') {
      return `<section class="hv-page" data-db-page="arena" aria-labelledby="p-h">
        <h1 id="p-h">Arena</h1>
        <p class="hv-page-lead">Tonight’s matches. Win rounds to earn keys.</p>
        <div class="hv-page-grid" data-arena-list></div>
      </section>`;
    }
    if (page.id === 'guild') {
      return `<section class="hv-page" data-db-page="guild" aria-labelledby="p-h">
        <h1 id="p-h">Guild hall</h1>
        <p class="hv-page-lead">Members online and recent activity.</p>
        <div class="hv-page-grid" data-guild-list></div>
      </section>`;
    }
    return `<section class="hv-page"><h1>${page.name}</h1><p class="hv-page-lead">Sample data · fictional</p></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'quests') {
      const body = host.querySelector('[data-quest-body]');
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="hv-loading" role="status"><p>Syncing board…</p><div class="hv-skel"></div><div class="hv-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="hv-empty"><p>No open quests. Check back after reset.</p></div>`;
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="hv-error"><p>Could not load quests.</p><button type="button" class="hv-btn ghost" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="hv-page-grid">${QUESTS.map((q) =>
          `<article class="hv-page-card"><div class="hv-row"><strong>${q.n}</strong><span class="num">+${q.key}</span></div><p class="hv-meta" style="margin:0">${q.d}${q.done ? ' · claimed' : ''}</p></article>`
        ).join('')}</div>`;
      };
      paint('ready');
      seg(host.querySelector('[data-quest-tabs]'), (v) => paint(v));
    }
    if (page.id === 'arena') {
      host.querySelector('[data-arena-list]').innerHTML = [
        { name: 'Marsh gate skirmish', when: 'Tonight · 19:00', reward: '+1 key' },
        { name: 'Moonwell duel', when: 'Tonight · 21:30', reward: '+2 keys' },
      ].map((a) =>
        `<article class="hv-page-card"><div class="hv-row"><strong>${a.name}</strong><span>${a.reward}</span></div><p class="hv-meta" style="margin:0">${a.when}</p></article>`
      ).join('');
    }
    if (page.id === 'guild') {
      host.querySelector('[data-guild-list]').innerHTML = Object.keys(PEOPLE).filter((n) => n !== 'You').map((n) =>
        `<article class="hv-page-card"><div class="hv-row"><strong>${n}</strong><span class="hv-meta"><i class="hv-on"></i> online</span></div></article>`
      ).join('');
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

  
/* reveal-boot */
if (typeof staggerReveal === "function") staggerReveal();
/* === DB multipage polish (dense kit) === */
(function wirePages() {
  const PAGES = [{"id":"overview","name":"Quest vault","pattern":"Dashboard"},{"id":"quests","name":"Quest board","pattern":"List"},{"id":"arena","name":"Arena","pattern":"Board"},{"id":"guild","name":"Guild hall","pattern":"List"}];
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
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Hollow Vault" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
