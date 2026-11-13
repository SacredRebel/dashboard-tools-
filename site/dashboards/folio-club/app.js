/* Folio Club: reading tracker sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 21a2 2 0 0 0 2 2h14v-4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.500l6.1-.9z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
    trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0z"/><path d="M8 6H4.500v1.500A3.5 3.5 0 0 0 8 11M16 6h3.500v1.500A3.5 3.5 0 0 1 16 11M12 14v4M8.5 21h7M10 18h4"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `fc-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="fc-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="fc-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="fc-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="fc-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="fc-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="fc-cursor" hidden></span><span class="fc-tip num" hidden></span>
    </div>`;
    const tip = $('.fc-tip', el), cur = $('.fc-cursor', el), dots = $$('.fc-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `fc-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.fc-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.fc-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  // Bar chart built from HTML columns (each column is a focusable button). Grouped by default, stacked with o.stacked.
  // o: { labels, series: [{ name, color, values }], fmt, h, label, max, ticks, active, onPick, stacked }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="fc-plot fc-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="fc-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="fc-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="fc-cols">${o.labels.map((l, i) => `<button class="fc-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="fc-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="fc-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="fc-tip num" hidden></span>
    </div>`;
    const tip = $('.fc-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `fc-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.fc-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.fc-cols', el).addEventListener('mouseleave', () => show(-1));
  }
  // Donut from stroked circles. parts: [{ value, color: '--chart-1' }] (values in any unit). Returns an SVG string.
  function donut(parts, { size = 120, w = 14, gap = 1.5, round = false } = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0), r = (size - w) / 2, c = size / 2; let off = 0;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}"/>${parts.map((p) => {
      const len = (p.value / total) * 100, seg = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}" pathLength="100" stroke-dasharray="${Math.max(0.01, len - gap).toFixed(2)} ${(100 - len + gap).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})" style="stroke:var(${p.color})"${round ? ' stroke-linecap="round"' : ''}/>`;
      off += len; return seg;
    }).join('')}</svg>`;
  }
  // Arc gauge. Angles in degrees, 0 = up, clockwise. Returns an SVG string with a track and a value arc.
  const polar = (cx, cy, r, deg) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const arcPath = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  function arcGauge(pct, { size = 160, w = 12, from = -120, to = 120, color = '--accent', knob = false } = {}) {
    const c = size / 2, r = (size - w) / 2 - (knob ? 4 : 0), end = from + (to - from) * Math.max(0, Math.min(1, pct)), [kx, ky] = polar(c, c, r, end);
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><path class="track" d="${arcPath(c, c, r, from, to)}" fill="none" stroke-width="${w}" stroke-linecap="round"/><path d="${arcPath(c, c, r, from, Math.max(end, from + 0.01))}" fill="none" stroke-width="${w}" stroke-linecap="round" style="stroke:var(${color})"/>${knob ? `<circle class="knob" cx="${kx.toFixed(2)}" cy="${ky.toFixed(2)}" r="${w * 0.75}"/>` : ''}</svg>`;
  }
  // Tiny trend line. Returns an SVG string; stretches to its box.
  function spark(vals, { color = '--chart-1', fill = 0.25, w = 120, h = 36 } = {}) {
    const mn = Math.min(...vals), mx = Math.max(...vals), pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 6)]);
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `fc-s${++sparkId}`;
    return `<svg class="fc-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }
  let sparkId = 0;
  paintIcons();

  const BOOKS = [
    { id: 'meridian', title: 'The Meridian Atlas', author: 'Nora Vale', pages: 750, read: 354, c1: '#3d5a80', c2: '#1b2a40', tone: '#e8d5a3' },
    { id: 'salt', title: 'Saltwater Hymns', author: 'Elias Crowe', pages: 412, read: 98, c1: '#2a6f6a', c2: '#143834', tone: '#b8e0d8' },
    { id: 'glass', title: 'Glass Orchard', author: 'Mira Chen', pages: 528, read: 528, c1: '#6b3a5a', c2: '#3a1e30', tone: '#f0c8d8' },
    { id: 'orion', title: 'Night Bus to Orion', author: 'Jules Hart', pages: 336, read: 40, c1: '#2a3a6b', c2: '#121828', tone: '#a8c0f0' },
    { id: 'copper', title: 'Copper Maps', author: 'Theo Voss', pages: 640, read: 210, c1: '#8a4a28', c2: '#3a2010', tone: '#f0c090' },
  ];
  const FRIENDS = [
    { n: 'Brielle Santos', i: 'BS', c: 'var(--av-2)' },
    { n: 'Tessa Gray', i: 'TG', c: 'var(--av-3)' },
    { n: 'Casey Parker', i: 'CP', c: 'var(--av-4)' },
    { n: 'Devon Hale', i: 'DH', c: 'var(--av-5)' },
    { n: 'Riley Moss', i: 'RM', c: 'var(--av-1)' },
    { n: 'Jordan Lee', i: 'JL', c: 'var(--av-3)' },
    { n: 'Sam Okonkwo', i: 'SO', c: 'var(--av-2)' },
  ];
  const FEED = [
    { n: 'Brielle Santos', i: 'BS', c: 'var(--av-2)', h: -2, t: 'Finished chapter 12 of Meridian — the map room twist hit hard. Anyone else catching the cipher clues?' },
    { n: 'Tessa Gray', i: 'TG', c: 'var(--av-3)', h: -3, t: 'Saltwater Hymns is slower than I expected but the tide metaphors are gorgeous. Halfway through.' },
    { n: 'Casey Parker', i: 'CP', c: 'var(--av-4)', h: -5, t: 'Club pick for next month: Glass Orchard. Voting closes Friday — drop a yes if you’re in.' },
    { n: 'Devon Hale', i: 'DH', c: 'var(--av-5)', h: -8, t: 'Hit a 14-day streak. The badge for “midnight reader” finally unlocked. Worth the late nights.' },
    { n: 'Riley Moss', i: 'RM', c: 'var(--av-1)', h: -12, t: 'Night Bus to Orion has the best opening line I’ve read this year. No spoilers — just start it.' },
  ];
  const BOARD = {
    friends: { rank: 5, points: 12480, pct: 'Top 12%', out: 'of 48 friends' },
    club: { rank: 14, points: 88242, pct: 'Top 8%', out: 'of 186 club readers' },
    global: { rank: 2339, points: 88242, pct: 'Top 1%', out: 'out of 3,276,487 readers' },
  };

  let bookId = 'meridian';
  let boardTab = 'global';
  let friendsShown = 5;
  const replies = {};

  function coverSvg(b, w = 200, h = 300) {
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="${w}" height="${h}" fill="${b.c2}"/>
      <rect x="0" y="0" width="14" height="${h}" fill="${b.c1}" opacity=".9"/>
      <rect x="18" y="36" width="${w - 36}" height="4" fill="${b.tone}" opacity=".35"/>
      <text x="28" y="90" fill="${b.tone}" font-family="Georgia, serif" font-size="18" font-weight="700">${b.title.split(' ').slice(0, 2).join(' ')}</text>
      <text x="28" y="118" fill="${b.tone}" font-family="Georgia, serif" font-size="16">${b.title.split(' ').slice(2).join(' ') || ''}</text>
      <circle cx="${w - 48}" cy="${h - 56}" r="28" fill="${b.c1}" opacity=".7"/>
      <text x="28" y="${h - 36}" fill="${b.tone}" font-family="system-ui,sans-serif" font-size="12" opacity=".9">${b.author}</text>
    </svg>`;
  }

  function renderBooks() {
    $('[data-books]').innerHTML = BOOKS.map((b) =>
      `<li><button type="button" role="option" aria-selected="${b.id === bookId}" aria-pressed="${b.id === bookId}" data-book="${b.id}">
        <span class="fc-book-thumb" style="--c1:${b.c1};--c2:${b.c2}" aria-hidden="true"></span>
        <span>${b.title}</span>
      </button></li>`
    ).join('');
  }

  function renderFriends() {
    const list = FRIENDS.slice(0, friendsShown);
    $('[data-friends]').innerHTML = list.map((f) =>
      `<li><span class="fc-av" style="--av:${f.c}" aria-hidden="true">${f.i}</span>${f.n}</li>`
    ).join('');
    const more = $('[data-more-friends]');
    more.hidden = friendsShown >= FRIENDS.length;
    more.textContent = friendsShown >= FRIENDS.length ? 'All friends' : 'See more';
  }

  function renderHero() {
    const b = BOOKS.find((x) => x.id === bookId) || BOOKS[0];
    $('[data-cover]').innerHTML = coverSvg(b);
    $('[data-title]').textContent = b.title;
    $('[data-author]').textContent = b.author;
  }

  function renderMetrics() {
    const b = BOOKS.find((x) => x.id === bookId) || BOOKS[0];
    const pct = Math.round((b.read / b.pages) * 100);
    const hours = Math.max(1, Math.round(b.read / 55));
    const mins = String((b.read * 7) % 60).padStart(2, '0');
    $('[data-metrics]').innerHTML = `
      <article class="fc-tile progress" aria-label="Progress ${b.read} of ${b.pages} pages">
        <div class="fc-tile-top"><span data-icon="book"></span>Progress</div>
        <p class="num">${fmtNum(b.read)}</p>
        <p>Out of ${fmtNum(b.pages)} pages</p>
        <div class="fc-prog" style="--pct:${pct}%"><i></i></div>
        <div class="fc-prog-avs" aria-hidden="true">
          ${FRIENDS.slice(0, 5).map((f) => `<span class="fc-av fc-av-sm" style="--av:${f.c}">${f.i}</span>`).join('')}
        </div>
        <p class="fc-hint">Rank #5 among friends</p>
      </article>
      <article class="fc-tile time" aria-label="Read time ${hours}:${mins}">
        <div class="fc-tile-top"><span data-icon="clock"></span>Time</div>
        <p class="num">${hours}:${mins}</p>
        <p>Global avg. read time for your progress: ${hours + 1}:${String((+mins + 14) % 60).padStart(2, '0')}</p>
        <p class="fc-hint">23% faster</p>
      </article>
      <article class="fc-tile level" aria-label="Level 2">
        <div class="fc-tile-top"><span data-icon="star"></span>Level</div>
        <p class="num">2</p>
        <p>145 reader points to level up!</p>
        <p class="fc-hint">Top 5% for this book</p>
      </article>
      <article class="fc-tile streak" aria-label="7 day streak">
        <div class="fc-tile-top"><span data-icon="bolt"></span>Streak</div>
        <p class="num">7</p>
        <p>Day streak — come back tomorrow to keep it up!</p>
        <p class="fc-hint">10% more consistent</p>
      </article>
      <article class="fc-tile badges" aria-label="Badges earned">
        <div class="fc-tile-top">Badges</div>
        <div class="fc-badge-grid" aria-hidden="true">
          <span><span data-icon="trophy"></span></span>
          <span><span data-icon="check"></span></span>
          <span><span data-icon="shield"></span></span>
          <span><span data-icon="hourglass"></span></span>
        </div>
      </article>`;
    paintIcons($('[data-metrics]'));
  }

  function renderBoard() {
    const empty = $('[data-board-empty]');
    const err = $('[data-board-error]');
    const body = $('[data-board]');
    empty.hidden = true; err.hidden = true; body.hidden = false;
    if (boardTab === 'club' && false) { /* reserved for empty demo */ }
    const d = BOARD[boardTab];
    $('[data-rank]').textContent = '#' + fmtNum(d.rank);
    $('[data-points]').textContent = fmtNum(d.points);
    $('[data-pct]').textContent = d.pct;
    $('[data-out-of]').textContent = d.out;
  }

  function renderFeed() {
    const el = $('[data-feed]');
    const empty = $('[data-feed-empty]');
    if (!FEED.length) { el.innerHTML = ''; empty.hidden = false; return; }
    empty.hidden = true;
    el.innerHTML = FEED.map((p, idx) => {
      const when = fmtDate(dayOffset(Math.floor(p.h / 24) || 0), { weekday: 'short' });
      const ago = Math.abs(p.h) < 24 ? `${Math.abs(p.h)}h` : when;
      return `<li class="fc-post">
        <div class="fc-post-h">
          <span class="fc-av" style="--av:${p.c}" aria-hidden="true">${p.i}</span>
          <b>${p.n}</b>
          <time datetime="${dayOffset(0).toISOString()}">${ago}</time>
        </div>
        <p>${p.t}</p>
        <button type="button" class="fc-reply" data-reply="${idx}" aria-pressed="${!!replies[idx]}">${replies[idx] ? 'Replied' : 'Reply'}</button>
      </li>`;
    }).join('');
  }

  $('[data-books]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-book]'); if (!b) return;
    bookId = b.dataset.book; renderBooks(); renderHero(); renderMetrics();
    $(`[data-book="${bookId}"]`).focus();
  });
  $('[data-more-friends]').addEventListener('click', () => {
    friendsShown = Math.min(FRIENDS.length, friendsShown + 3); renderFriends();
  });
  seg($('[data-board-tabs]'), (v) => { boardTab = v; renderBoard(); });
  $('[data-feed]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-reply]'); if (!b) return;
    const i = +b.dataset.reply; replies[i] = !replies[i]; renderFeed();
    $(`[data-reply="${i}"]`)?.focus();
  });

  renderBooks(); renderFriends(); renderHero(); renderMetrics(); renderBoard(); renderFeed();
  document.documentElement.dataset.ready = 'true';
})();
