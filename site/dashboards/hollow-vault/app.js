/* Hollow Vault: sample data, relic wheel, honest drop rates, haul and guild chat.
   All data is fictional sample data. Keys are earned in play, no purchases. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    box: '<path d="m12 2 9 5v10l-9 5-9-5V7z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.500V7a4 4 0 0 1 8 0v3.5"/>',
    send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
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
  // relic glyphs: tiny SVGs built from shapes, coloured by tokens
  const G = {
    cauldron: '<ellipse cx="32" cy="20" rx="18" ry="6" style="fill:var(--brew)"/><path d="M12 22 Q12 52 32 52 Q52 52 52 22Z" style="fill:var(--surface)" stroke="currentColor" stroke-width="3"/><circle cx="26" cy="14" r="3" style="fill:var(--brew)"/><circle cx="36" cy="10" r="2" style="fill:var(--brew)"/>',
    potion: '<rect x="27" y="6" width="10" height="10" rx="2" style="fill:var(--wood)"/><path d="M27 16 L27 24 Q14 30 14 42 Q14 56 32 56 Q50 56 50 42 Q50 30 37 24 L37 16Z" style="fill:var(--r-rare)"/><path d="M18 40 Q32 46 46 40 Q46 54 32 54 Q18 54 18 40Z" style="fill:var(--r-epic)"/>',
    mushroom: '<path d="M8 32 Q8 10 32 10 Q56 10 56 32Z" style="fill:var(--r-legend)"/><circle cx="22" cy="22" r="4" style="fill:var(--text)"/><circle cx="40" cy="18" r="3" style="fill:var(--text)"/><rect x="25" y="32" width="14" height="20" rx="6" style="fill:var(--text)"/>',
    hat: '<path d="M32 4 L46 44 L18 44Z" style="fill:var(--r-epic)"/><ellipse cx="32" cy="46" rx="26" ry="7" style="fill:var(--wood)"/><rect x="22" y="36" width="20" height="5" style="fill:var(--r-legend)"/>',
    broom: '<rect x="30" y="4" width="4" height="34" rx="2" transform="rotate(20 32 32)" style="fill:var(--wood)"/><path d="M16 38 L40 34 L44 58 L12 60Z" style="fill:var(--r-legend)"/><rect x="15" y="36" width="27" height="5" transform="rotate(-8 28 38)" style="fill:var(--r-epic)"/>',
    crystal: '<path d="M32 4 L48 22 L32 60 L16 22Z" style="fill:var(--r-rare)"/><path d="M32 4 L40 22 L32 60 L24 22Z" style="fill:var(--accent-soft)" opacity=".6"/>',
    tome: '<rect x="12" y="10" width="40" height="46" rx="4" style="fill:var(--wood)"/><rect x="16" y="14" width="32" height="38" rx="2" style="fill:var(--wood-d)"/><circle cx="32" cy="33" r="8" style="fill:var(--r-legend)"/>',
    feather: '<path d="M48 6 Q20 14 16 52 L20 56 Q52 44 48 6Z" style="fill:var(--r-common)"/><path d="M46 10 L18 54" stroke="currentColor" stroke-width="2"/>'
  };
  const glyph = (k) => `<svg viewBox="0 0 64 64" aria-hidden="true">${G[k]}</svg>`;
  const RAR = { common: ['Common', '--r-common'], rare: ['Rare', '--r-rare'], epic: ['Epic', '--r-epic'], legend: ['Legendary', '--r-legend'] };
  const RELICS = [
    { k: 'potion', n: 'Draught of Dusk', r: 'epic', p: 8 }, { k: 'tome', n: 'Moonwell Tome', r: 'rare', p: 14 }, { k: 'crystal', n: 'Tidecrystal', r: 'rare', p: 14 }, { k: 'broom', n: 'Gale Broom', r: 'epic', p: 8 },
    { k: 'feather', n: 'Owl Quill', r: 'common', p: 24 }, { k: 'mushroom', n: 'Glowcap', r: 'common', p: 24 }, { k: 'hat', n: 'Witchwarden Hat', r: 'legend', p: 3 }, { k: 'cauldron', n: 'Ember Cauldron', r: 'legend', p: 5 }
  ];
  const QUESTS = [{ n: 'Clear the marsh ruins', d: 'Daily', key: 1, done: true }, { n: 'Win 3 arena rounds', d: 'Daily', key: 1, done: false }, { n: 'Help a guildmate', d: 'Weekly', key: 2, done: false }];
  const PEOPLE = { Maren: '--r-rare', Tobi: '--r-epic', Ilse: '--r-legend', Quill: '--brew' };
  const MSGS = [
    { w: 'Maren', t: '18:02', m: 'Anyone up for the marsh ruins run? Need a healer.' }, { w: 'Tobi', t: '18:05', m: 'Got a Gale Broom from the Moonwell chest!' },
    { sys: 'Ilse found Ember Cauldron (legendary).', t: '18:09' }, { w: 'Ilse', t: '18:10', m: 'Took me 40 keys, the 5% is real 😅' }, { w: 'Quill', t: '18:14', m: 'Arena opens in the evening, meet at the gate.' }
  ];
  let keys = 3, seed = 7, win = -1, rar = 'all';
  const haul = [];

  // ---------------------------------------------------------------- wheel
  function renderWheel() {
    const core = $('.hv-core');
    $$('.hv-slot').forEach((s) => s.remove());
    RELICS.forEach((r, i) => {
      const a = (i / RELICS.length) * Math.PI * 2 - Math.PI / 2, b = document.createElement('div');
      b.className = 'hv-slot' + (i === win ? ' is-win' : ''); b.style.left = 50 + Math.cos(a) * 37.5 + '%'; b.style.top = 50 + Math.sin(a) * 37.5 + '%';
      b.innerHTML = `${glyph(r.k)}<span>${r.n}</span>`; b.setAttribute('aria-hidden', 'true');
      core.before(b);
    });
    const btn = $('[data-open]');
    btn.disabled = keys < 1; btn.textContent = keys < 1 ? 'No keys left' : 'Open chest';
    $('[data-keys]').textContent = keys;
  }
  $('[data-chest]').innerHTML = `<svg viewBox="0 0 120 96"><rect x="10" y="40" width="100" height="50" rx="8" style="fill:var(--wood)"/><path d="M10 44 Q10 10 60 10 Q110 10 110 44Z" style="fill:var(--wood-d)"/><rect x="10" y="40" width="100" height="8" style="fill:var(--metal)"/><rect x="52" y="34" width="16" height="22" rx="3" style="fill:var(--metal)"/><circle cx="60" cy="46" r="3" style="fill:var(--wood-d)"/><rect x="24" y="12" width="8" height="78" style="fill:var(--metal)" opacity=".85"/><rect x="88" y="12" width="8" height="78" style="fill:var(--metal)" opacity=".85"/></svg>`;

  // ---------------------------------------------------------------- lists
  function renderItems() {
    const ok = (r) => rar === 'all' || (rar === 'rare' ? r.r !== 'common' : r.r === 'legend');
    const list = RELICS.filter(ok);
    $('[data-items]').innerHTML = list.map((r) => `<li style="--rar:var(${RAR[r.r][1]})">${glyph(r.k)}${r.n}<em>${RAR[r.r][0]}</em><small class="num">${r.p}% drop rate</small></li>`).join('');
  }
  function renderHaul() {
    $('[data-invcount]').textContent = haul.length ? `${haul.length} ${haul.length === 1 ? 'relic' : 'relics'} this session` : '';
    $('[data-inv]').innerHTML = haul.length ? haul.map((i) => { const r = RELICS[i]; return `<li style="--rar:var(${RAR[r.r][1]})">${glyph(r.k)}${r.n}<small>${RAR[r.r][0]}</small></li>`; }).join('') : `<li class="hv-none">Nothing yet. Open the chest above to win your first relic.</li>`;
  }
  function renderQuests() { $('[data-quests]').innerHTML = QUESTS.map((q, i) => `<li><button data-q="${i}" aria-pressed="${q.done}"><span>${q.n}<small>${q.d}${q.done ? ' · claimed' : ''}</small></span><b>+${q.key} key${q.key > 1 ? 's' : ''}</b></button></li>`).join(''); }
  function renderMsgs() {
    $('[data-msgs]').innerHTML = MSGS.map((m) => m.sys ? `<li class="is-sys"><p>${m.sys} <time>${m.t}</time></p></li>` : `<li><span class="hv-ava" style="background:var(${PEOPLE[m.w] || '--accent'})" aria-hidden="true">${m.w[0]}</span><div><b>${m.w}<time>${m.t}</time></b><p></p></div></li>`).join('');
    $$('[data-msgs] li:not(.is-sys) p').forEach((p, i) => { p.textContent = MSGS.filter((m) => !m.sys)[i].m; });
    const box = $('[data-msgs]'); box.scrollTop = box.scrollHeight;
  }

  // ---------------------------------------------------------------- events
  $('[data-open]').addEventListener('click', () => {
    if (keys < 1) return;
    seed = (seed * 9301 + 49297) % 233280; let roll = (seed / 233280) * 100;
    win = RELICS.findIndex((r) => (roll -= r.p) < 0); if (win < 0) win = 0;
    keys -= 1; haul.unshift(win);
    const r = RELICS[win];
    $('[data-result]').textContent = `You found ${r.n} (${RAR[r.r][0].toLowerCase()}).`;
    if (r.r === 'legend' || r.r === 'epic') { MSGS.push({ sys: `You found ${r.n} (${RAR[r.r][0].toLowerCase()}).`, t: 'now' }); renderMsgs(); }
    renderWheel(); renderHaul();
    if (keys < 1) $('[data-result]').textContent += ' Finish a quest to earn more keys.';
  });
  $('[data-quests]').addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (!b) return; const q = QUESTS[+b.dataset.q]; if (q.done) return; q.done = true; keys += q.key; renderQuests(); renderWheel(); $(`[data-q="${b.dataset.q}"]`).focus(); });
  seg($('[data-rarity]'), (v) => { rar = v; renderItems(); });
  $('[data-say]').addEventListener('submit', (e) => { e.preventDefault(); const v = $('[data-msg]').value.trim(); if (!v) return; MSGS.push({ w: 'You', t: 'now', m: v }); $('[data-msg]').value = ''; renderMsgs(); });
  renderWheel(); renderItems(); renderHaul(); renderQuests(); renderMsgs();
  document.documentElement.dataset.ready = 'true'; // contract: tells dashboards-check.mjs the script ran to the end
})();
