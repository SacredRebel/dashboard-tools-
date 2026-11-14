/* Lull Sleep — glass wellness overview matching owner reference.
   Fictional sample data. No polling / network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ICON = {
    spark: '<path d="M12 2l1.2 4.2L17 8l-3.8 1.8L12 14l-1.2-4.2L7 8l3.8-1.8z"/><path d="M19 13l.7 2.3L22 16l-2.3.7L19 19l-.7-2.3L16 16l2.3-.7z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
  };
  const svg = (n, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || ''}</svg>`;
  $$('[data-icon]').forEach((el) => { el.innerHTML = svg(el.dataset.icon); });

  const PAGES = [
    { id: 'overview', name: 'Overview', pattern: 'Dashboard' },
    { id: 'sleep', name: 'Sleep', pattern: 'Report' },
    { id: 'recovery', name: 'Recovery', pattern: 'Report' },
    { id: 'activity', name: 'Activity', pattern: 'List' },
    { id: 'settings', name: 'Settings', pattern: 'Settings' },
  ];

  const HR = [62, 64, 61, 63, 70, 78, 88, 92, 85, 76, 72, 69, 74, 80, 77, 71, 68, 66];
  const STRESS = [40, 48, 55, 62, 70, 76, 72, 68];
  const SLEEP = [6.2, 6.8, 7.1, 6.5, 7.4, 7.0, 7.2];

  function toast(msg) {
    const t = $('[data-toast]');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(() => { t.hidden = true; }, 2200);
  }

  function spark(el, data, color) {
    if (!el) return;
    const w = 160, h = 48, max = Math.max(...data), min = Math.min(...data);
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - 6 - ((v - min) / (max - min || 1)) * (h - 14);
      return [x, y];
    });
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    const fill = `${d} L${w},${h} L0,${h} Z`;
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${fill}" fill="${color}" opacity="0.22"/><path class="ls-line" d="${d}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
  }

  function wreath(el) {
    if (!el) return;
    el.innerHTML = `<svg viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke="#d4a0c0" stroke-width="1.2" opacity="0.7">
        <path d="M60 18c8 6 10 16 6 24M60 18c-8 6-10 16-6 24"/>
        <path d="M92 40c-2 10-10 16-20 16M28 40c2 10 10 16 20 16"/>
        <path d="M98 72c-8 6-18 6-26-2M22 72c8 6 18 6 26-2"/>
        <path d="M78 98c-8-2-14-10-12-20M42 98c8-2 14-10 12-20"/>
      </g>
      <g fill="#e8b4c8" opacity="0.85">
        <circle cx="60" cy="22" r="3.5"/><circle cx="88" cy="38" r="3"/><circle cx="96" cy="70" r="3.2"/>
        <circle cx="78" cy="96" r="3"/><circle cx="42" cy="96" r="3"/><circle cx="24" cy="70" r="3.2"/>
        <circle cx="32" cy="38" r="3"/><circle cx="70" cy="30" r="2.4" fill="#c9b8ff"/>
        <circle cx="50" cy="30" r="2.4" fill="#9fd6c2"/>
      </g>
    </svg>`;
  }

  function hrChart(el) {
    if (!el) return;
    const w = 420, h = 150, pad = 8;
    const max = Math.max(...HR), min = Math.min(...HR);
    const pts = HR.map((v, i) => {
      const x = pad + (i / (HR.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (v - min) / (max - min)) * (h - pad * 2);
      return [x, y];
    });
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    const area = `${d} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;
    const marks = [2, 7, 11, 15].map((i) => `<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="4" fill="var(--accent)" stroke="#fff" stroke-width="2"/>`).join('');
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="ls-hr-svg">
      <path d="${area}" fill="var(--chart-1)" opacity="0.12"/>
      <path d="${d}" fill="none" stroke="var(--chart-1)" stroke-width="2.5" vector-effect="non-scaling-stroke" class="ls-hr-path"/>
      ${marks}
    </svg>`;
  }

  function countUp(node) {
    const target = +node.dataset.count;
    const span = node.querySelector('span');
    if (reduce) {
      if (span) node.innerHTML = `${target}<span>${span.textContent}</span>`;
      else node.textContent = String(target);
      return;
    }
    const start = performance.now();
    const dur = 700;
    const suffixHtml = span ? span.outerHTML : '';
    function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) ** 3;
      const val = Math.round(target * eased);
      if (suffixHtml) node.innerHTML = `${val}${suffixHtml}`;
      else node.textContent = String(val);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function animateOverview() {
    const root = $('[data-page-panel="overview"]');
    if (!root || root.hidden) return;
    $$('[data-count]', root).forEach(countUp);
    const gauge = $('.ls-gauge-val', root);
    if (gauge) gauge.setAttribute('stroke-dasharray', reduce ? '50 100' : '0 100');
    if (gauge && !reduce) {
      requestAnimationFrame(() => { gauge.setAttribute('stroke-dasharray', '50 100'); });
    }
    const path = $('.ls-hr-path', root);
    if (path && !reduce) {
      const len = path.getTotalLength?.() || 800;
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = String(len);
      path.getBoundingClientRect();
      path.style.transition = 'stroke-dashoffset 700ms var(--ease, ease)';
      path.style.strokeDashoffset = '0';
    }
    const cards = $$('.ls-glass, .ls-hero-copy', root);
    cards.forEach((c, i) => {
      c.style.opacity = reduce ? '1' : '0';
      c.style.transform = reduce ? 'none' : 'translateY(10px)';
      if (!reduce) {
        setTimeout(() => {
          c.style.transition = 'opacity 220ms var(--ease, ease), transform 220ms var(--ease, ease)';
          c.style.opacity = '1';
          c.style.transform = 'none';
        }, 40 * i);
      }
    });
  }

  // paint overview art
  spark($('[data-spark="stress"]'), STRESS, 'var(--chart-1)');
  spark($('[data-spark="sleep"]'), SLEEP, 'var(--chart-2)');
  wreath($('[data-wreath]'));
  hrChart($('[data-hr]'));

  /* drawer */
  const drawer = $('[data-drawer]');
  const panel = $('.ls-drawer-panel', drawer);
  let lastFocus = null;
  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    panel.focus();
  }
  function closeDrawer() {
    drawer.hidden = true;
    lastFocus?.focus?.();
  }
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); }
    if (e.key !== 'Tab') return;
    const focusables = $$('button, [href], input, select, textarea', panel).filter((el) => !el.disabled);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  $('[data-drawer-close]')?.addEventListener('click', closeDrawer);
  $('[data-drawer-save]')?.addEventListener('click', () => { closeDrawer(); toast('Device prefs saved (sample)'); });
  drawer.addEventListener('click', (e) => { if (e.target === drawer) closeDrawer(); });

  $('[data-tips]')?.addEventListener('click', () => toast('Tip: dim lights 45 minutes before bed'));
  $('[data-ai]')?.addEventListener('click', () => toast('Opening analysis… (sample)'));
  $('[data-device]')?.addEventListener('click', openDrawer);
  $('[data-body-btn]')?.addEventListener('click', () => toast('Body report (sample)'));

  const main = $('[data-main]');
  const overview = $('[data-page-panel="overview"]');

  function pageHtml(page) {
    if (page.id === 'sleep') {
      return `<section class="ls-page" aria-labelledby="p-h">
        <h1 id="p-h">Sleep</h1>
        <p class="ls-page-lead">Last night’s stages and efficiency. Sample data · fictional.</p>
        <div class="ls-toolbar">
          <div class="ls-seg" role="group" aria-label="Range">
            <button type="button" aria-pressed="true" data-range="night">Last night</button>
            <button type="button" aria-pressed="false" data-range="week">7 days</button>
          </div>
          <button type="button" class="ls-chip-btn" data-refresh>Refresh</button>
        </div>
        <div data-sleep-body>
          <div class="ls-page-grid">
            <article class="ls-glass"><h2>Time asleep</h2><p class="ls-mini-val num">7h 12m</p><p class="ls-meta">Efficiency 94%</p></article>
            <article class="ls-glass"><h2>Deep sleep</h2><p class="ls-mini-val num">1h 28m</p><p class="ls-meta">+12 min vs baseline</p></article>
            <article class="ls-glass"><h2>Wake-ups</h2><p class="ls-mini-val num">2</p><p class="ls-meta">Both under 4 minutes</p></article>
          </div>
        </div>
      </section>`;
    }
    if (page.id === 'recovery') {
      return `<section class="ls-page" aria-labelledby="p-h">
        <h1 id="p-h">Recovery</h1>
        <p class="ls-page-lead">Readiness for today based on HRV and overnight rest.</p>
        <div class="ls-toolbar"><button type="button" class="ls-chip-btn" data-sim-err>Simulate sync error</button></div>
        <div data-rec-body>
          <article class="ls-glass"><div class="ls-row"><span>Recovery score</span><strong class="num">82</strong></div>
            <div class="ls-row"><span>HRV</span><strong class="num">64 ms</strong></div>
            <div class="ls-row"><span>Resting HR</span><strong class="num">52 bpm</strong></div></article>
        </div>
      </section>`;
    }
    if (page.id === 'activity') {
      return `<section class="ls-page" aria-labelledby="p-h">
        <h1 id="p-h">Activity</h1>
        <p class="ls-page-lead">Steps and movement that may have shaped last night’s sleep.</p>
        <div class="ls-toolbar">
          <label class="ls-row" style="gap:8px">Search <input data-filter type="search" placeholder="Filter activities" style="min-height:44px;padding:0 12px;border-radius:12px;border:1px solid var(--border);background:var(--surface-2)"></label>
        </div>
        <div class="ls-page-grid" data-act-list>
          <article class="ls-glass" data-act="walk"><div class="ls-row"><span>Evening walk</span><strong class="num">3,210 steps</strong></div></article>
          <article class="ls-glass" data-act="desk"><div class="ls-row"><span>Desk day</span><strong class="num">5,210 steps</strong></div></article>
          <article class="ls-glass ls-empty" data-act="empty"><p>No workouts logged today.</p><button type="button" class="ls-chip-btn" data-log>Log a workout</button></article>
        </div>
      </section>`;
    }
    if (page.id === 'settings') {
      return `<section class="ls-page" aria-labelledby="p-h">
        <h1 id="p-h">Settings</h1>
        <p class="ls-page-lead">Preferences for Lull. Nothing is saved in this demo.</p>
        <form class="ls-glass" data-settings onsubmit="return false">
          <label class="ls-row">Bedtime goal <input name="bed" type="time" value="22:30" style="min-height:44px;padding:0 10px;border-radius:12px;border:1px solid var(--border);background:var(--surface-2)"></label>
          <label class="ls-row">Wake goal <input name="wake" type="time" value="06:30" style="min-height:44px;padding:0 10px;border-radius:12px;border:1px solid var(--border);background:var(--surface-2)"></label>
          <label class="ls-row">Quiet hours <button type="button" class="ls-chip-btn" data-quiet aria-pressed="false">Off</button></label>
          <p class="ls-error" data-form-err hidden style="color:#b42318;margin-top:8px">Enter both times to save.</p>
          <button type="submit" class="ls-chip-btn" style="margin-top:12px">Save goals</button>
        </form>
      </section>`;
    }
    return `<section class="ls-page"><h1>${page.name}</h1><p class="ls-page-lead">Sample data · fictional</p></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'sleep') {
      host.querySelectorAll('[data-range]').forEach((btn) => {
        btn.addEventListener('click', () => {
          host.querySelectorAll('[data-range]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
          toast(btn.dataset.range === 'week' ? 'Showing 7-day average (sample)' : 'Showing last night (sample)');
        });
      });
      host.querySelector('[data-refresh]')?.addEventListener('click', () => {
        const body = host.querySelector('[data-sleep-body]');
        body.innerHTML = `<div class="ls-loading" role="status"><p>Syncing sleep stages…</p><div class="ls-skel"></div><div class="ls-skel"></div><div class="ls-skel"></div></div>`;
        setTimeout(() => {
          body.innerHTML = `<div class="ls-page-grid">
            <article class="ls-glass"><h2>Time asleep</h2><p class="ls-mini-val num">7h 12m</p><p class="ls-meta">Efficiency 94%</p></article>
            <article class="ls-glass"><h2>Deep sleep</h2><p class="ls-mini-val num">1h 28m</p><p class="ls-meta">+12 min vs baseline</p></article>
            <article class="ls-glass"><h2>Wake-ups</h2><p class="ls-mini-val num">2</p><p class="ls-meta">Both under 4 minutes</p></article>
          </div>`;
          toast('Sleep data refreshed (sample)');
        }, reduce ? 0 : 700);
      });
    }
    if (page.id === 'recovery') {
      host.querySelector('[data-sim-err]')?.addEventListener('click', () => {
        const body = host.querySelector('[data-rec-body]');
        body.innerHTML = `<div class="ls-error" role="alert"><p>Couldn’t sync recovery from the ring.</p><button type="button" class="ls-chip-btn" data-retry>Try again</button></div>`;
        body.querySelector('[data-retry]')?.addEventListener('click', () => {
          body.innerHTML = `<article class="ls-glass"><div class="ls-row"><span>Recovery score</span><strong class="num">82</strong></div>
            <div class="ls-row"><span>HRV</span><strong class="num">64 ms</strong></div>
            <div class="ls-row"><span>Resting HR</span><strong class="num">52 bpm</strong></div></article>`;
          toast('Recovery restored (sample)');
        });
      });
    }
    if (page.id === 'activity') {
      host.querySelector('[data-log]')?.addEventListener('click', () => toast('Workout logged (sample)'));
      const filter = host.querySelector('[data-filter]');
      filter?.addEventListener('input', () => {
        const q = filter.value.trim().toLowerCase();
        host.querySelectorAll('[data-act]').forEach((row) => {
          if (row.dataset.act === 'empty') { row.hidden = !!q; return; }
          row.hidden = q ? !row.textContent.toLowerCase().includes(q) : false;
        });
      });
    }
    if (page.id === 'settings') {
      const form = host.querySelector('[data-settings]');
      const quiet = host.querySelector('[data-quiet]');
      quiet?.addEventListener('click', () => {
        const on = quiet.getAttribute('aria-pressed') !== 'true';
        quiet.setAttribute('aria-pressed', String(on));
        quiet.textContent = on ? 'On' : 'Off';
        toast(on ? 'Quiet hours on' : 'Quiet hours off');
      });
      form?.addEventListener('submit', () => {
        const err = host.querySelector('[data-form-err]');
        const bed = form.bed.value, wake = form.wake.value;
        if (!bed || !wake) { err.hidden = false; return; }
        err.hidden = true;
        toast(`Goals saved · bed ${bed}, wake ${wake}`);
      });
    }
  }

  let stub = null;
  function ensureStub() {
    if (stub) return stub;
    stub = document.createElement('div');
    stub.setAttribute('data-db-stub-host-legacy', '');
    stub.hidden = true;
    main.appendChild(stub);
    return stub;
  }

  window.DB._legacyRouteDisabled && window.DB.route(PAGES, (id, page) => {
    const isOverview = id === 'overview';
    overview.hidden = !isOverview;
    const host = ensureStub();
    host.hidden = isOverview;
    if (!isOverview) {
      host.innerHTML = pageHtml(page);
      wirePage(host, page);
    } else {
      animateOverview();
    }
  });

  // Pause ambient scan when offscreen
  const scanRoot = $('.ls-body-wrap');
  if (scanRoot && window.DB?.onVisible) {
    window.DB.onVisible(scanRoot, (vis) => {
      const scan = scanRoot.querySelector('.ls-body-scan');
      if (scan) scan.style.animationPlayState = vis && !reduce ? 'running' : 'paused';
    });
  }

  
/* === DB multipage polish (dense kit) === */
(function wirePages() {
  const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"sleep","name":"Sleep","pattern":"Report"},{"id":"recovery","name":"Recovery","pattern":"Report"},{"id":"activity","name":"Activity","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Lull Sleep" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
