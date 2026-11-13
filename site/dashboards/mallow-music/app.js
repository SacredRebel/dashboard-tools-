/* Mallow Music: sample data, clay artwork, player state and interactions.
   All data is fictional sample data. No timers, no network: the player is a still state you can scrub. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    play: '<path d="M7 4.500v15l12-7.500z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flame: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 2 2 3 3 3 0-3-1-5 0-7Z"/>',
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
  // Bar chart built from HTML columns (each column is a focusable button). Grouped by default, stacked with o.stacked.
  // o: { labels, series: [{ name, color, values }], fmt, h, label, max, ticks, active, onPick, stacked }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="mm-plot mm-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="mm-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="mm-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="mm-cols">${o.labels.map((l, i) => `<button class="mm-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="mm-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="mm-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="mm-tip num" hidden></span>
    </div>`;
    const tip = $('.mm-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `mm-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.mm-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.mm-cols', el).addEventListener('mouseleave', () => show(-1));
  }
  // Donut from stroked circles. parts: [{ value, color: '--chart-1' }] (values in any unit). Returns an SVG string.
  function donut(parts, { size = 120, w = 14, gap = 1.5, round = false } = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0), r = (size - w) / 2, c = size / 2; let off = 0;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}"/>${parts.map((p) => {
      const len = (p.value / total) * 100, seg = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}" pathLength="100" stroke-dasharray="${Math.max(0.01, len - gap).toFixed(2)} ${(100 - len + gap).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})" style="stroke:var(${p.color})"${round ? ' stroke-linecap="round"' : ''}/>`;
      off += len; return seg;
    }).join('')}</svg>`;
  }
  paintIcons();
  const st = (o, c) => `<stop offset="${o}" style="stop-color:var(${c})"/>`;
  const phones = (s) => `<svg viewBox="0 0 120 110"><defs><linearGradient id="mm-hp${s}" x1="0" y1="0" x2="1" y2="1">${st(0, '--g1')}${st(1, '--accent')}</linearGradient></defs>
    <path d="M18,66 C18,26 102,26 102,66" fill="none" stroke="url(#mm-hp${s})" stroke-width="11" stroke-linecap="round"/>
    <rect x="8" y="58" width="26" height="40" rx="13" fill="url(#mm-hp${s})"/><rect x="86" y="58" width="26" height="40" rx="13" fill="url(#mm-hp${s})"/>
    <rect x="14" y="64" width="8" height="18" rx="4" fill="var(--surface)" opacity="0.45"/><rect x="92" y="64" width="8" height="18" rx="4" fill="var(--surface)" opacity="0.45"/></svg>`;
  $('[data-avatar]').innerHTML = phones('a');
  $('[data-hero]').innerHTML = `<svg viewBox="0 0 220 170"><ellipse cx="110" cy="156" rx="90" ry="10" fill="var(--wood-2)" opacity="0.18"/>
    <g transform="translate(40 30) scale(1.2)">${phones('h').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
    <g fill="var(--accent)" opacity="0.8"><circle cx="30" cy="40" r="7"/><rect x="35" y="12" width="3.500" height="28" rx="2"/><circle cx="190" cy="30" r="6"/><rect x="194" y="6" width="3" height="24" rx="2"/><path d="M196,6 l12,4 v6 l-12,-4Z"/></g></svg>`;
  $('[data-plant]').innerHTML = `<svg viewBox="0 0 140 170"><path d="M70,110 C40,90 20,60 34,40 C56,52 66,80 70,110 Z" fill="var(--leaf)"/><path d="M70,110 C96,86 118,62 104,34 C82,50 72,80 70,110 Z" fill="var(--leaf-2)"/><path d="M70,110 C64,70 66,40 74,16 C86,44 82,80 70,110 Z" fill="var(--leaf)"/>
    <path d="M34,108 h72 l-8,54 a6,6 0 0 1 -6,5 h-44 a6,6 0 0 1 -6,-5 Z" fill="var(--pot)"/><rect x="30" y="102" width="80" height="14" rx="7" fill="var(--pot)" stroke="var(--wood)" stroke-opacity="0.3"/></svg>`;
  $('[data-crown]').innerHTML = `<svg viewBox="0 0 60 44"><path d="M6,36 L2,10 L18,22 L30,4 L42,22 L58,10 L54,36 Z" fill="var(--gold)"/><rect x="6" y="34" width="48" height="8" rx="4" fill="var(--gold)"/><circle cx="30" cy="20" r="4" fill="var(--surface)" opacity="0.6"/></svg>`;
  const ROOMS = [{ name: 'Slow Sunday', n: 64, sofa: '--sofa' }, { name: 'Rainy desk', n: 48, sofa: '--g5' }, { name: 'Kitchen dance', n: 72, sofa: '--g2' }];
  const room = (r) => `<svg viewBox="0 0 320 170"><rect width="320" height="170" fill="var(--t3)"/><rect y="124" width="320" height="46" fill="var(--wood)" opacity="0.55"/>
    <rect x="200" y="22" width="56" height="44" rx="6" fill="var(--surface)" opacity="0.7"/><rect x="206" y="28" width="44" height="32" rx="4" fill="var(--t4)"/>
    <path d="M60,74 h88 a16,16 0 0 1 16,16 v34 h-120 v-34 a16,16 0 0 1 16,-16 Z" style="fill:var(${r.sofa})"/><rect x="34" y="96" width="22" height="40" rx="11" style="fill:var(${r.sofa})"/><rect x="152" y="96" width="22" height="40" rx="11" style="fill:var(${r.sofa})"/>
    <rect x="44" y="118" width="120" height="18" rx="8" style="fill:var(${r.sofa})" opacity="0.85"/><path d="M92,92 c-8,-10 6,-16 12,-6 c6,-10 20,-4 12,6 l-12,12Z" fill="var(--g1)"/>
    <rect x="270" y="56" width="4" height="70" fill="var(--wood-2)"/><path d="M256,40 h32 l-6,20 h-20 Z" fill="var(--lamp)"/><ellipse cx="272" cy="70" rx="40" ry="26" fill="var(--lamp)" opacity="0.25"/>
    <rect x="200" y="104" width="56" height="26" rx="4" fill="var(--wood-2)"/><ellipse cx="228" cy="100" rx="20" ry="5" fill="var(--text)" opacity="0.75"/></svg>`;

  const cover = (i) => { const c = ['--g1', '--g2', '--g3', '--g4', '--g5', '--g6']; return `<svg viewBox="0 0 52 52"><rect width="52" height="52" style="fill:var(${c[i % 6]})"/><circle cx="${14 + (i * 7) % 24}" cy="${18 + (i * 5) % 14}" r="10" fill="var(--surface)" opacity="0.6"/><path d="M0,40 C14,${28 + i % 3 * 4} 30,46 52,34 V52 H0Z" style="fill:var(${c[(i + 2) % 6]})"/></svg>`; };
  const TRACKS = [{ t: 'Porch Light', a: 'Juniper Lane', len: 204 }, { t: 'Paper Boats', a: 'The Tidepools', len: 187 }, { t: 'Warm Static', a: 'Okoro & Fen', len: 231 }, { t: 'Sundial', a: 'Mira Calloway', len: 176 }, { t: 'Low Tide Café', a: 'Bramble Kids', len: 219 }];
  const GENRES = [{ n: 'Indie pop', v: 38, c: '--g1' }, { n: 'Lo-fi', v: 24, c: '--g2' }, { n: 'Folk', v: 16, c: '--g3' }, { n: 'Soul', v: 12, c: '--g4' }, { n: 'Other', v: 10, c: '--g5' }];
  const WEEK = { this: [2.1, 4.4, 3.2, 5.6, 3.6, 6.8, 6.1], last: [3.4, 2.8, 4.1, 3.0, 5.2, 4.6, 3.9] };
  let cur = 0, playing = false, favs = new Set(), genre = -1, week = 'this', mix = 0;
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
  const h = new Date().getHours(); $('[data-greet]').textContent = `${h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}, Juno`;

  function renderPlayer() {
    const t = TRACKS[cur], pos = +$('[data-pos]').value;
    $('[data-cover]').innerHTML = cover(cur); $('[data-now-t]').textContent = t.t; $('[data-now-a]').textContent = (playing ? 'Playing · ' : 'Paused · ') + t.a;
    $('[data-toggle]').innerHTML = svg(playing ? 'pause' : 'play'); $('[data-toggle]').setAttribute('aria-label', playing ? 'Pause' : 'Play');
    $('[data-pos]').setAttribute('aria-valuetext', `${mmss((pos / 100) * t.len)} of ${mmss(t.len)}`);
    $('[data-time]').textContent = `${mmss((pos / 100) * t.len)} / ${mmss(t.len)}`;
  }
  function renderTracks() {
    const q = $('[data-q]').value.trim().toLowerCase(), list = TRACKS.map((t, i) => ({ ...t, i })).filter((t) => !q || (t.t + t.a).toLowerCase().includes(q));
    $('[data-count]').textContent = q ? `${list.length} of ${TRACKS.length}` : 'Today';
    $('[data-tracks]').innerHTML = list.length ? list.map((t) => `<li class="${t.i === cur ? 'on' : ''}"><span class="mm-cover">${cover(t.i)}</span><span><b>${t.t}</b><small>${t.a} · ${mmss(t.len)}</small></span>
      <button class="mm-fav" data-fav="${t.i}" aria-pressed="${favs.has(t.i)}" aria-label="Favourite ${t.t}">${svg('heart')}</button>
      <button class="mm-round" data-play="${t.i}" aria-label="${t.i === cur && playing ? 'Pause' : 'Play'} ${t.t}">${svg(t.i === cur && playing ? 'pause' : 'play')}</button></li>`).join('') : `<li class="mm-none">Nothing called “${q}” played today. Try an artist name.</li>`;
    $('[data-favs]').textContent = 128 + favs.size;
  }
  function renderBars() {
    const lab = Array.from({ length: 7 }, (_, i) => fmtDate(dayOffset(i - 6), { weekday: 'short' }));
    barChart($('[data-bars]'), { labels: lab, series: [{ name: 'Listened', color: '--chart-1', values: WEEK[week] }], fmt: (v) => v + ' h', h: 170, ticks: 3, max: 8, label: `Hours listened per day, ${week === 'this' ? 'this' : 'last'} week` });
  }
  function renderGenres() {
    $('[data-donut]').innerHTML = `<div role="img" aria-label="Top genres: ${GENRES.map((g) => `${g.n} ${g.v}%`).join(', ')}">${donut(GENRES.map((g, i) => ({ value: g.v, color: genre < 0 || genre === i ? g.c : '--surface-2' })), { size: 160, w: 34, gap: 1.5 })}</div>`;
    $('[data-legend]').innerHTML = GENRES.map((g, i) => `<li><button data-g="${i}" aria-pressed="${genre === i}"><i style="background:var(${g.c})"></i>${g.n}<span class="num">${g.v}%</span></button></li>`).join('');
  }
  function renderMix() { const r = ROOMS[mix]; $('[data-room]').innerHTML = room(r); $('[data-mixname]').textContent = r.name; $('[data-mixcount]').textContent = `${r.n} songs · picked for you`; }

  // ---------------------------------------------------------------- events
  const play = (i) => { if (i === cur) playing = !playing; else { cur = i; playing = true; $('[data-pos]').value = 0; } renderPlayer(); renderTracks(); };
  $('[data-tracks]').addEventListener('click', (e) => { const p = e.target.closest('[data-play]'), f = e.target.closest('[data-fav]');
    if (p) { play(+p.dataset.play); $(`[data-play="${p.dataset.play}"]`).focus(); }
    if (f) { const i = +f.dataset.fav; favs.has(i) ? favs.delete(i) : favs.add(i); renderTracks(); $(`[data-fav="${i}"]`).focus(); } });
  $('[data-toggle]').addEventListener('click', () => play(cur));
  $('[data-playmix]').addEventListener('click', () => { cur = 0; playing = true; renderPlayer(); renderTracks(); });
  $('[data-playroom]').addEventListener('click', () => { cur = (mix + 2) % TRACKS.length; playing = true; renderPlayer(); renderTracks(); });
  $('[data-nextmix]').addEventListener('click', () => { mix = (mix + 1) % ROOMS.length; renderMix(); });
  $('[data-pos]').addEventListener('input', renderPlayer);
  $('[data-q]').addEventListener('input', renderTracks);
  $('[data-legend]').addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (!b) return; genre = genre === +b.dataset.g ? -1 : +b.dataset.g; renderGenres(); $(`[data-g="${b.dataset.g}"]`).focus(); });
  $('[data-plus]').addEventListener('click', (e) => { e.target.textContent = 'Trial started'; e.target.disabled = true; });
  seg($('[data-week]'), (v) => { week = v; renderBars(); });
  renderPlayer(); renderTracks(); renderBars(); renderGenres(); renderMix();
  document.documentElement.dataset.ready = 'true'; // contract: tells dashboards-check.mjs the script ran to the end
})();
