/* Copper Radar: soft-light SOC ops — radar arcs, live feed, severity, timeline.
   Fictional sample data only. No timers, no network. No real vendor marks. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    file: '<path d="M6 2.500h8l5 5V21a.5.5 0 0 1-.5.500h-12.500A.5.5 0 0 1 5.5 21V3a.5.5 0 0 1 .5-.5z"/><path d="M14 2.500V8h5M9 13h6M9 17h6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.500h5v5h-5zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.500h.01M7 16.500h.01"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    tv: '<rect x="2.5" y="5" width="19" height="12.5" rx="2"/><path d="M8 21h8"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12 18.5 5.5"/>',
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
    const top = (py) => `calc(var(--plot-h) * ${(py / H).toFixed(4)})`, uid = `cp-g${++chartId}`;
    const sets = o.series.map((s) => { const pts = s.values.map((v, i) => [x(i), y(v)]); return { ...s, pts, d: o.curve === false ? 'M' + pts.map((p) => p.join(',')).join(' L') : smooth(pts) }; });
    const every = o.xEvery || (n > 8 ? 2 : 1);
    el.innerHTML = `<div class="cp-plot" style="--plot-h:${o.h || 200}px">
      ${ticks.map((v) => `<span class="cp-y num" style="top:${top(y(v))}">${fmt(v)}</span>`).join('')}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${o.label}">
        <defs>${sets.map((s, k) => `<linearGradient id="${uid}-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${s.color});stop-opacity:${s.fill ?? 0.35}"/><stop offset="1" style="stop-color:var(${s.color});stop-opacity:0"/></linearGradient>`).join('')}</defs>
        <g class="grid">${ticks.map((v) => `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" vector-effect="non-scaling-stroke"/>`).join('')}</g>
        ${sets.map((s, k) => `${s.fill === 0 ? '' : `<path d="${s.d} L${W},${H} L0,${H} Z" fill="url(#${uid}-${k})"/>`}<path class="line" d="${s.d}" style="stroke:var(${s.color})"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} vector-effect="non-scaling-stroke"/>`).join('')}
      </svg>
      ${o.dots ? sets[0].pts.map(([px, py]) => `<span class="cp-dot" style="left:${(px / W) * 100}%;top:${top(py)}"></span>`).join('') : ''}
      ${o.labels.map((l, i) => (i % every === 0 ? `<span class="cp-x${(i / every) % 2 ? ' alt' : ''}" style="left:${(x(i) / W) * 100}%">${l}</span>` : '')).join('')}
      <div class="cp-hit">${o.labels.map((l, i) => `<button aria-label="${l}: ${sets.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"></button>`).join('')}</div>
      <span class="cp-cursor" hidden></span><span class="cp-tip num" hidden></span>
    </div>`;
    const tip = $('.cp-tip', el), cur = $('.cp-cursor', el), dots = $$('.cp-dot', el);
    const show = (i) => {
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      tip.hidden = cur.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${sets.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `cp-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = cur.style.left = (x(i) / W) * 100 + '%'; tip.style.top = top(Math.min(...sets.map((s) => s.pts[i][1])));
    };
    $$('.cp-hit button', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.cp-hit', el).addEventListener('mouseleave', () => show(-1));
  }
  // Tiny trend line. Returns an SVG string; stretches to its box.
  function spark(vals, { color = '--chart-1', fill = 0.25, w = 120, h = 36 } = {}) {
    const mn = Math.min(...vals), mx = Math.max(...vals), pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 6)]);
    const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), id = `cp-s${++sparkId}`;
    return `<svg class="cp-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(${color});stop-opacity:${fill}"/><stop offset="1" style="stop-color:var(${color});stop-opacity:0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(${color})" vector-effect="non-scaling-stroke"/></svg>`;
  }
  let sparkId = 0;
  paintIcons();

  const VENDORS = [
    { id: 'nimbus', label: 'NimbusID', r: 0.92, a: -150, mark: 'N' },
    { id: 'ridge', label: 'RidgeHost', r: 0.78, a: -110, mark: 'R' },
    { id: 'cobalt', label: 'CobaltGate', r: 0.95, a: -55, mark: 'C' },
    { id: 'maple', label: 'MapleDNS', r: 0.7, a: -20, mark: 'M' },
    { id: 'harbor', label: 'HarborMesh', r: 0.88, a: 25, mark: 'H' },
    { id: 'quill', label: 'QuillAuth', r: 0.62, a: 55, mark: 'Q' },
  ];
  const FLAGS = [
    { r: 0.84, a: -125, kind: 'warn' },
    { r: 0.74, a: 10, kind: 'M' },
    { r: 0.9, a: 40, kind: 'C' },
  ];

  const INJECT = { '24h': [42, 48, 45, 52, 58, 61, 55, 63, 70, 68, 74, 78], '7d': [38, 44, 41, 50, 47, 55, 62, 58, 66, 71, 69, 75, 72, 80] };
  const OPEN = [
    { id: 'C', label: 'Critical', n: 1, cls: 'c' },
    { id: 'H', label: 'High', n: 2, cls: 'h' },
    { id: 'M', label: 'Medium', n: 5, cls: 'm' },
    { id: 'L', label: 'Low', n: 7, cls: 'l' },
  ];
  const FEED = {
    '24h': [
      { id: 548, title: 'Incident Created — ID: #548', detail: 'QuillAuth token spike on edge-west', hot: false },
      { id: 2, title: '3 Incidents reopened', detail: 'HarborMesh · MapleDNS · CobaltGate', hot: false },
      { id: 3, title: 'RidgeHost Connection Error', detail: 'Probe timeout · region dusk-3', hot: true },
      { id: 4, title: 'Playbook waiting for analysis', detail: 'Auto-triage paused on #541', hot: false },
    ],
    '7d': [
      { id: 510, title: 'Incident Created — ID: #510', detail: 'NimbusID directory sync lag', hot: false },
      { id: 6, title: '12 Incidents closed', detail: 'Weekend sweep complete', hot: false },
      { id: 7, title: 'CobaltGate rule drift', detail: 'Policy pack v3.2 pending', hot: true },
      { id: 8, title: 'MapleDNS cache warm', detail: 'Latency back under 40ms', hot: false },
      { id: 9, title: 'HarborMesh node joined', detail: 'mesh-node-14 · green', hot: false },
    ],
  };
  const SOURCES = [
    { n: 'XDR Agent', c: 40, icon: 'shield' },
    { n: 'XDR Analytics BIOS', c: 35, icon: 'cpu' },
    { n: 'XDR BIOS', c: 23, icon: 'server' },
  ];
  const ASSETS = [
    { n: 'ws-ops01', detail: 'Endpoint · active', ok: true },
    { n: 'lap-it20', detail: 'Laptop · watch', ok: false },
    { n: 'ip-4a2c', detail: 'Sensor · active', ok: true },
    { n: 'edge-dusk3', detail: 'Gateway · active', ok: true },
  ];
  const SEV = [
    { n: 'High', v: 28, c: '--sev-high' },
    { n: 'Medium', v: 18, c: '--sev-med' },
    { n: 'Neutral', v: 14, c: '--sev-neu' },
    { n: 'Low', v: 36, c: '--sev-low' },
    { n: 'Errors', v: 5, c: '--sev-err' },
  ];
  const STEPS = [
    { n: 'Playbooks Complete', detail: '14 finished overnight' },
    { n: 'Waiting for analysis', detail: '3 queued for review' },
    { n: 'Playbook Recommendations', detail: '6 ready to approve' },
  ];

  let feedWin = '24h', sevFilter = null, step = 1, feedState = 'populated', resolved = 15;

  function polar(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }
  function arc(cx, cy, r, a0, a1) {
    const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
    return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }

  function renderRadar() {
    const W = 640, H = 360, cx = 320, cy = 320;
    const rings = [70, 130, 190, 250];
    const ticks = Array.from({ length: 36 }, (_, i) => {
      const a = -180 + (i / 35) * 180;
      const [x1, y1] = polar(cx, cy, 258, a);
      const [x2, y2] = polar(cx, cy, i % 3 === 0 ? 248 : 252, a);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--text-muted)" stroke-opacity="0.45" stroke-width="1.5"/>`;
    }).join('');
    const nodes = VENDORS.map((v) => {
      const [x, y] = polar(cx, cy, v.r * 250, v.a);
      const w = Math.max(72, 18 + v.label.length * 7);
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <circle r="6" fill="#1a120f" stroke="#fff7f2" stroke-width="2"/>
      </g>`;
    }).join('');
    const flags = FLAGS.map((f) => {
      const [x, y] = polar(cx, cy, f.r * 250, f.a);
      if (f.kind === 'warn') {
        return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
          <path d="M0,-8 L7,6 H-7 Z" fill="var(--sev-high)" stroke="var(--surface)" stroke-width="1"/>
          
        </g>`;
      }
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <circle r="12" fill="#fff7f2" stroke="#1a120f" stroke-width="1.5"/>
        
      </g>`;
    }).join('');
    const sweep = resolved / 100;
    const sweepEnd = -180 + 180 * Math.min(1, sweep + 0.35);
    $('[data-radar]').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Radar with ${VENDORS.length} fictional vendors and ${resolved}% manually resolved">
      ${rings.map((r, i) => `<path d="${arc(cx, cy, r, -180, 0)}" fill="none" stroke="var(--border)" stroke-width="${i === rings.length - 1 ? 1.5 : 1}" ${i === rings.length - 1 ? 'stroke-dasharray="3 5"' : ''}/>`).join('')}
      <path d="${arc(cx, cy, 236, -180, sweepEnd)}" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
      ${ticks}
      <line x1="${cx - 260}" y1="${cy}" x2="${cx + 260}" y2="${cy}" stroke="var(--border)" stroke-width="1"/>
      ${nodes}${flags}
    </svg>`;
    $('[data-resolved-pct]').textContent = `${resolved}%`;
    const legend = $('[data-radar-legend]');
    if (legend) {
      legend.innerHTML = VENDORS.map((v) =>
        `<span class="cp-rlab"><i aria-hidden="true">${v.mark}</i>${v.label}</span>`
      ).join('') + FLAGS.map((f) =>
        `<span class="cp-rlab cp-rflag" aria-hidden="true">${f.kind === 'warn' ? '!' : f.kind}</span>`
      ).join('');
    }

  }

  function renderInject() {
    const vals = INJECT[feedWin];
    $('[data-inject-total]').textContent = String(vals[vals.length - 1]);
    $('[data-inject-spark]').innerHTML = spark(vals, { color: '--chart-1', fill: 0.2, w: 180, h: 56 });
  }

  function renderOpen() {
    $('[data-sevchips]').innerHTML = OPEN.map((o) => `<li>
      <button type="button" class="${o.cls}" data-sev="${o.id}" aria-pressed="${sevFilter === o.id}" aria-label="${o.label}: ${o.n} open">${o.n}</button>
      <span>${o.id}</span>
    </li>`).join('');
  }

  function renderFeed() {
    const box = $('[data-feed]'), msg = $('[data-feedmsg]');
    msg.hidden = true;
    if (feedState === 'loading') {
      box.innerHTML = `<li class="cp-skel" aria-hidden="true"></li><li class="cp-skel" aria-hidden="true"></li><li class="cp-skel" aria-hidden="true"></li>`;
      return;
    }
    if (feedState === 'error') {
      box.innerHTML = '';
      msg.hidden = false;
      msg.textContent = 'Live feed paused. Switch window to retry.';
      return;
    }
    let list = FEED[feedWin];
    if (sevFilter) {
      const map = { C: /critical|error/i, H: /error|reopen|drift/i, M: /waiting|created|spike/i, L: /warm|joined|closed/i };
      list = list.filter((f) => map[sevFilter].test(f.title + ' ' + f.detail));
    }
    if (!list.length || feedState === 'empty') {
      box.innerHTML = '';
      msg.hidden = false;
      msg.textContent = sevFilter ? `No ${sevFilter}-class events in this window.` : 'Feed is quiet. New probes will land here.';
      return;
    }
    box.innerHTML = list.map((f) => `<li class="${f.hot ? 'hot' : ''}"><b>${f.title}</b><small>${f.detail}</small></li>`).join('');
  }

  function renderSources() {
    $('[data-sources]').innerHTML = SOURCES.map((s) => `<li>
      <span class="cp-ic">${svg(s.icon)}</span>
      <span><b>${s.n}</b><small>Telemetry source</small></span>
      <span class="num">${s.c}</span>
    </li>`).join('');
  }
  function renderAssets() {
    $('[data-assets]').innerHTML = ASSETS.map((a) => `<li>
      <span class="cp-ic">${svg('tv')}</span>
      <span><b>${a.n}</b><small>${a.detail}</small></span>
      <span class="cp-status ${a.ok ? '' : 'warn'}" aria-label="${a.ok ? 'healthy' : 'attention'}"></span>
    </li>`).join('');
  }
  function renderSev() {
    const max = Math.max(...SEV.map((s) => s.v));
    const tot = SEV.reduce((a, s) => a + s.v, 0);
    $('[data-alert-total]').textContent = `${tot} open`;
    $('[data-sevbars]').innerHTML = SEV.map((s) => `<li>
      <span>${s.n}</span>
      <span class="cp-track" style="--sev:var(${s.c})"><i class="cp-fill" style="width:${((s.v / max) * 100).toFixed(1)}%"></i></span>
      <span class="num">${s.v}</span>
    </li>`).join('');
  }
  function renderSteps() {
    $('[data-steps]').innerHTML = STEPS.map((s, i) => `<li>
      <button type="button" data-step="${i}" aria-current="${i === step ? 'step' : 'false'}">
        <i>${String(i + 1).padStart(2, '0')}</i>
        <span>${s.n}<small style="display:block;font-weight:500;color:var(--text-muted)">${s.detail}</small></span>
        ${svg('arrowRight')}
      </button>
    </li>`).join('');
  }
  function renderTimeline() {
    const base = dayOffset(0);
    const fmt = (h, m, s) => {
      const d = new Date(base); d.setHours(h, m, s, 0);
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' });
    };
    const items = [
      { label: 'Created on', who: 'NK', when: fmt(9, 12, 38) },
      { label: 'Last alert added on', who: '+', when: fmt(11, 4, 2), plus: true },
      { label: 'Assigned on', who: 'JR', when: fmt(12, 42, 38) },
    ];
    $('[data-timeline]').innerHTML = items.map((t) => `<li>
      <span class="cp-av${t.plus ? ' plus' : ''}" aria-hidden="true">${t.who}</span>
      <b>${t.label}</b>
      <time>${t.when}</time>
    </li>`).join('');
  }

  seg($('[data-tabs]'), (v) => {
    if (v === 'alerts') { feedState = 'populated'; sevFilter = 'H'; }
    else if (v === 'insights') { feedState = 'empty'; sevFilter = null; }
    else if (v === 'exec') { step = 2; feedState = 'populated'; sevFilter = null; }
    else if (v === 'more') { feedState = 'error'; sevFilter = null; }
    else { feedState = 'populated'; sevFilter = null; }
    renderOpen(); renderFeed(); renderSteps();
  });
  seg($('[data-feedwin]'), (v) => {
    feedWin = v;
    feedState = 'populated';
    renderInject();
    renderFeed();
  });

  $('[data-sevchips]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sev]'); if (!b) return;
    sevFilter = sevFilter === b.dataset.sev ? null : b.dataset.sev;
    feedState = 'populated';
    renderOpen(); renderFeed();
  });
  $('[data-steps]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]'); if (!b) return;
    step = +b.dataset.step;
    resolved = [12, 15, 22][step] || 15;
    renderSteps(); renderRadar();
  });
  $('[data-alerts-table]').addEventListener('click', () => {
    feedState = 'loading';
    renderFeed();
    // no timers: flip to populated on next user gesture via feed window
    feedState = 'populated';
    feedWin = '24h';
    $$('[data-feedwin] button[data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === '24h')));
    renderFeed();
    $('[data-tabs] button[data-v="alerts"]').click();
  });
  $('[data-view-tl]').addEventListener('click', (e) => {
    e.target.closest('button').textContent = 'Timeline pinned';
    resolved = Math.min(40, resolved + 5);
    renderRadar();
  });

  // paint icons that were added after first paintIcons for dynamic lists
  renderInject(); renderOpen(); renderRadar(); renderFeed();
  renderSources(); renderAssets(); renderSev(); renderSteps(); renderTimeline();
  paintIcons();
/* === DB multipage polish (auto-upgraded) === */
  (function wirePages() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"reports","name":"Reports","pattern":"Report"},{"id":"segments","name":"Segments","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
    const root = document.querySelector('[data-db-app]') || document.body;
    let toastEl = document.querySelector('[data-toast]');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'dbp-toast';
      toastEl.setAttribute('data-toast', '');
      toastEl.hidden = true;
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    function toast(msg) {
      toastEl.textContent = msg; toastEl.hidden = false;
      clearTimeout(toast._id); toast._id = setTimeout(() => { toastEl.hidden = true; }, 2200);
    }
    const main = document.querySelector('main') || document.body;
    let stub = document.querySelector('[data-db-stub]');
    if (!stub) {
      stub = document.createElement('section');
      stub.setAttribute('data-db-stub', '');
      stub.hidden = true;
      stub.setAttribute('aria-live', 'polite');
      main.appendChild(stub);
    }
    function setOverviewVisible(on) {
      [...main.children].forEach((ch) => {
        if (ch === stub) return;
        if (on) { ch.hidden = false; ch.removeAttribute('data-db-overview-hide'); }
        else { ch.hidden = true; ch.setAttribute('data-db-overview-hide', ''); }
      });
      stub.hidden = on;
    }
    function pageHtml(page) {

    if (page.id === 'reports') {
      return `<section class="dbp-page" data-db-page="reports" aria-labelledby="p-h">
        <h1 id="p-h">Reports</h1>
        <p class="dbp-lead">Sample data · fictional.</p>
        <div class="dbp-seg" role="group" aria-label="Reports state" data-dbp-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-dbp-body></div>
      </section>`;
    }
    if (page.id === 'segments') {
      return `<section class="dbp-page" data-db-page="segments" aria-labelledby="p-h">
        <h1 id="p-h">Segments</h1>
        <p class="dbp-lead">Sample data · fictional.</p>
        <div class="dbp-grid"><article class="dbp-card"><div class="dbp-row"><strong>Critical</strong><span class="dbp-chip">2</span></div></article><article class="dbp-card"><div class="dbp-row"><strong>Warn</strong><span class="dbp-chip">5</span></div></article><article class="dbp-card"><div class="dbp-row"><strong>Info</strong><span class="dbp-chip">11</span></div></article></div>
        <button type="button" class="dbp-btn" data-dbp-action>Open segments</button>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="dbp-page" data-db-page="settings" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="dbp-lead">Sample data · fictional.</p>
        <div class="dbp-grid"><article class="dbp-card"><div class="dbp-row"><strong>Units</strong><span class="dbp-chip">Celsius</span></div></article><article class="dbp-card"><div class="dbp-row"><strong>Eco mode</strong><span class="dbp-chip">On</span></div></article><article class="dbp-card"><div class="dbp-row"><strong>Alerts</strong><span class="dbp-chip">Push</span></div></article></div>
        <button type="button" class="dbp-btn" data-dbp-action>Open settings</button>
      </section>`;
    }
      return `<section class="dbp-page"><h1>${page.name}</h1></section>`;
    }
    function wirePage(page) {
      if (page.id === 'reports') {
        const body = stub.querySelector('[data-dbp-body]');
        const paint = (state = 'ready') => {
          if (state === 'loading') {
            body.innerHTML = `<div class="dbp-state"><p>Loading…</p><div class="dbp-skel"></div><div class="dbp-skel"></div></div>`;
            return;
          }
          if (state === 'empty') {
            body.innerHTML = `<div class="dbp-state"><p>Nothing here yet.</p></div>`;
            return;
          }
          if (state === 'error') {
            body.innerHTML = `<div class="dbp-state"><p>Could not load.</p><button type="button" class="dbp-btn" data-retry>Retry</button></div>`;
            stub.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
            return;
          }
          body.innerHTML = `<div class="dbp-grid"><article class="dbp-card"><div class="dbp-row"><strong>Incidents</strong><span class="dbp-chip">4</span></div></article><article class="dbp-card"><div class="dbp-row"><strong>MTTR</strong><span class="dbp-chip">18m</span></div></article><article class="dbp-card"><div class="dbp-row"><strong>Open</strong><span class="dbp-chip">1</span></div></article></div>`;
        };
        paint('ready');
        const tabs = stub.querySelector('[data-dbp-tabs]');
        tabs?.addEventListener('click', (e) => {
          const b = e.target.closest('button[data-v]'); if (!b) return;
          tabs.querySelectorAll('button[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          paint(b.dataset.v);
        });
      }
      stub.querySelector('[data-dbp-action]')?.addEventListener('click', () => toast(page.name + ' · sample'));
      stub.querySelector('[data-save-settings], [data-dbp-action]')?.addEventListener('click', () => {});
    }
    document.querySelectorAll('a[href]').forEach((a) => {
      const label = (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!label) return;
      const hit = PAGES.find((p) => p.name.toLowerCase() === label || p.id === label
        || (label === 'home' && p.id === 'overview')
        || (label === 'dashboard' && p.id === 'overview'));
      if (hit) a.setAttribute('href', '#/' + hit.id);
    });
    // map common rail buttons if present
    document.querySelectorAll('[data-rail] button[data-v]').forEach((b) => {
      const map = { home: 'overview', climate: 'rooms', fan: 'devices', eco: 'energy', settings: 'settings' };
      const id = map[b.dataset.v] || b.dataset.v;
      if (PAGES.some((p) => p.id === id)) {
        b.addEventListener('click', () => { location.hash = '#/' + id; });
      }
    });
    if (window.DB?.onVisible) {
      window.DB.onVisible(root, (visible) => {
        document.documentElement.dataset.motionPaused = visible ? '' : '1';
      });
    }
    if (!window.DB || typeof window.DB.route !== 'function') {
      console.error('DB.route missing — is ../_shared/frame.js loaded before app.js?');
      return;
    }
    const seen = new Set();
    window.DB.route(PAGES, (id, page) => {
      if (id === PAGES[0].id) {
        setOverviewVisible(true);
        if (!seen.has('overview')) {
          seen.add('overview');
          document.querySelectorAll('.cp-reveal, .dbp-reveal').forEach((el, i) => {
            el.style.setProperty('--reveal-delay', (reduce ? 0 : 40 * i) + 'ms');
            el.classList.add('cp-reveal-in', 'dbp-reveal-in');
          });
        }
      } else {
        setOverviewVisible(false);
        stub.innerHTML = pageHtml(page);
        wirePage(page);
      }
      seen.add(id);
    });
  })();
/* === /DB multipage polish === */
  document.documentElement.dataset.ready = 'true';
})();
