/* Taffy Analytics: sample data, capsule chart, feature flags and release checklist.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    sparkle: '<path d="M12 3l1.8 5.200L19 10l-5.2 1.800L12 17l-1.8-5.200L5 10l5.2-1.800zM19 16l.8 2.200L22 19l-2.2.8L19 22l-.8-2.200L16 19l2.2-.8z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `tf-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="tf-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="tf-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="tf-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="tf-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="tf-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="tf-cursor" hidden></span><span class="tf-tip num" hidden></span>
    </div>`;
    const tip = $('.tf-tip', el), cur = $('.tf-cursor', el), dots = $$('.tf-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `tf-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.tf-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.tf-hit', el).addEventListener('mouseleave', () => show(-1));
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
  const APPS = [{ id: 'grid', c: '--c6', n: 'Overview' }, { id: 'chart', c: '--c5', n: 'Reports' }, { id: 'users', c: '--c3', n: 'Teams' }, { id: 'mail', c: '--c2', n: 'Lifecycle email' }, { id: 'sparkle', c: '--c1', n: 'Experiments' }];
  let app = 'grid';
  const renderApps = () => { $('[data-apps]').innerHTML = APPS.map((a) => `<button data-app="${a.id}" aria-pressed="${a.id === app}" aria-label="${a.n}" title="${a.n}" style="background:var(${a.c})">${svg(a.id)}</button>`).join(''); };

  const WAT = [612, 640, 655, 648, 690, 712, 735, 728, 760, 798, 812, 840, 866, 851, 902, 938];
  let range = 16;
  function renderWave() {
    const v = WAT.slice(-range), d = ((v[v.length - 1] - v[0]) / v[0]) * 100;
    $('[data-wat]').textContent = fmtNum(v[v.length - 1]); $('[data-wat-delta]').textContent = `+${d.toFixed(1)}% in ${range} weeks`;
    lineChart($('[data-wave]'), { labels: v.map((_, i) => fmtDate(dayOffset((i - v.length + 1) * 7), { month: 'short', day: 'numeric' })), series: [{ name: 'Active teams', color: '--chart-1', values: v, area: true }], h: 150, ticks: 3, min: 500, fmt: fmtNum, label: `Weekly active teams, last ${range} weeks` });
  }

  const CH = [{ n: 'Organic', v: 412, c: '--c1', note: 'Search and word of mouth, steady all month.' }, { n: 'Referral', v: 268, c: '--c2', note: 'Up after the two-for-one invite offer.' }, { n: 'Paid', v: 356, c: '--c3', note: 'Cost per sign-up fell to $18 this month.' }, { n: 'Partners', v: 174, c: '--c4', note: 'Two new agency partners started sending teams.' }, { n: 'Events', v: 302, c: '--c5', note: 'Spike from the online design meetup on the 12th.' }];
  let ch = 0;
  function renderCaps() {
    const max = Math.max(...CH.map((c) => c.v));
    $('[data-caps]').innerHTML = CH.map((c, i) => `<button data-ch="${i}" aria-pressed="${i === ch}" aria-label="${c.n}: ${c.v} sign-ups"><i style="height:${((c.v / max) * 92).toFixed(1)}%;--cap:var(${c.c});--cap-d:var(${c.c}-d)"></i><span class="num" style="color:var(${c.c}-ink, var(--cap-ink))">${c.v}</span></button>`).join('');
    const tot = CH.reduce((a, c) => a + c.v, 0);
    $('[data-capnote]').innerHTML = `<b>${CH[ch].n}</b>, ${Math.round((CH[ch].v / tot) * 100)}% of ${fmtNum(tot)} sign-ups. ${CH[ch].note}`;
  }

  const PLANS = [{ n: 'Starter', v: 52, c: '--c1' }, { n: 'Team', v: 33, c: '--c2-d' }, { n: 'Business', v: 15, c: '--c5-d' }];
  $('[data-ring]').innerHTML = `<div role="img" aria-label="Plan mix: ${PLANS.map((p) => `${p.n} ${p.v}%`).join(', ')}">${donut(PLANS.map((p) => ({ value: p.v, color: p.c })), { size: 190, w: 36, gap: 1.2, round: true })}</div><b>2,184<small>paying teams</small></b>`;
  $('[data-legend]').innerHTML = PLANS.map((p) => `<li><i style="background:var(${p.c})"></i>${p.n}<span class="num">${p.v}%</span></li>`).join('');

  const FLAGS = [{ id: 'mp', n: 'Multiplayer cursors', d: '40% of teams', on: true }, { id: 'ai', n: 'Auto-layout suggestions', d: 'Internal only', on: false }, { id: 'dm', n: 'Dark canvas', d: 'All teams', on: true }, { id: 'ex', n: 'PDF export v2', d: '10% of teams', on: false }, { id: 'cm', n: 'Comment threads', d: 'All teams', on: true }];
  function renderFlags() {
    const q = $('[data-q]').value.trim().toLowerCase(), list = FLAGS.filter((f) => !q || f.n.toLowerCase().includes(q));
    $('[data-flags]').innerHTML = list.length ? list.map((f) => `<li><span><b id="tf-f-${f.id}">${f.n}</b><small>${f.on ? 'On · ' : 'Off · '}${f.d}</small></span><button class="tf-switch" role="switch" aria-checked="${f.on}" aria-labelledby="tf-f-${f.id}" data-flag="${f.id}"></button></li>`).join('') : `<li class="tf-none">No flags match “${q}”. Clear the filter to see all ${FLAGS.length}.</li>`;
  }

  const CHECKS = [{ n: 'Freeze strings for translation', d: 'Copy team', done: true }, { n: 'Run accessibility pass', d: 'QA', done: true }, { n: 'Update help centre', d: 'Support', done: false }, { n: 'Write release notes', d: 'Product', done: false }, { n: 'Schedule in-app announcement', d: 'Lifecycle', done: false }];
  function renderChecks() {
    const n = CHECKS.filter((c) => c.done).length;
    $('[data-relcount]').textContent = `${n} of ${CHECKS.length} done`; $('[data-relbar]').style.width = (n / CHECKS.length) * 100 + '%';
    $('[data-checks]').innerHTML = CHECKS.map((c, i) => `<li><button data-check="${i}" aria-pressed="${c.done}"><i>${c.done ? svg('check') : ''}</i><span>${c.n}<small>${c.d}</small></span></button></li>`).join('');
  }

  // ---------------------------------------------------------------- events
  $('[data-apps]').addEventListener('click', (e) => { const b = e.target.closest('[data-app]'); if (!b) return; app = b.dataset.app; renderApps(); $(`[data-app="${app}"]`).focus(); });
  seg($('[data-range]'), (v) => { range = +v; renderWave(); });
  $('[data-caps]').addEventListener('click', (e) => { const b = e.target.closest('[data-ch]'); if (!b) return; ch = +b.dataset.ch; renderCaps(); $(`[data-ch="${ch}"]`).focus(); });
  $('[data-q]').addEventListener('input', renderFlags);
  $('[data-flags]').addEventListener('click', (e) => { const b = e.target.closest('[data-flag]'); if (!b) return; const f = FLAGS.find((x) => x.id === b.dataset.flag); f.on = !f.on; renderFlags(); $(`[data-flag="${f.id}"]`).focus(); $('[data-msg]').textContent = `${f.n} turned ${f.on ? 'on' : 'off'}.`; });
  $('[data-checks]').addEventListener('click', (e) => { const b = e.target.closest('[data-check]'); if (!b) return; const c = CHECKS[+b.dataset.check]; c.done = !c.done; renderChecks(); $(`[data-check="${b.dataset.check}"]`).focus(); });
  renderApps(); renderWave(); renderCaps(); renderFlags(); renderChecks();
  document.documentElement.dataset.ready = 'true'; // contract: tells dashboards-check.mjs the script ran to the end
})();
