/* Saffron Dusk: fictional fasting-day wellness — glass twin phones, invented people. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 1.800v2.400M12 19.800v2.400M4.8 4.800l1.7 1.700M17.5 17.500l1.7 1.700M1.8 12h2.400M19.8 12h2.400M4.8 19.200l1.7-1.700M17.5 6.500l1.7-1.7"/>',
    hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    sparkle: '<path d="M12 3l1.8 5.200L19 10l-5.2 1.800L12 17l-1.8-5.200L5 10l5.2-1.800zM19 16l.8 2.200L22 19l-2.2.8L19 22l-.8-2.200L16 19l2.2-.8z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    flame: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 2 2 3 3 3 0-3-1-5 0-7Z"/>',
    moon: '<path d="M20 14.500A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.500z"/>',
    leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M4 21c2-6 6-10 11-12"/>',
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
  paintIcons();

  const DAYS = [8, 9, 10, 11, 12, 13, 14];
  const WINDOWS = {
    8: { imsak: '4:18 AM', iftar: '6:05 PM', left: 'Iftar in 2 hr 10 min', pct: 0.72 },
    9: { imsak: '4:15 AM', iftar: '6:08 PM', left: 'Iftar in 1 hr 34 min', pct: 0.86 },
    10: { imsak: '4:13 AM', iftar: '6:10 PM', left: 'Iftar in 3 hr 02 min', pct: 0.64 },
    11: { imsak: '4:11 AM', iftar: '6:12 PM', left: 'Iftar in 45 min', pct: 0.94 },
    12: { imsak: '4:09 AM', iftar: '6:14 PM', left: 'Iftar in 4 hr 20 min', pct: 0.48 },
    13: { imsak: '4:08 AM', iftar: '6:15 PM', left: 'Iftar in 5 hr 05 min', pct: 0.36 },
    14: { imsak: '4:06 AM', iftar: '6:17 PM', left: 'Iftar in 6 hr 12 min', pct: 0.22 },
  };
  const WEEK = [
    { lab: 'Th', v: 42 },
    { lab: 'Fr', v: 68 },
    { lab: 'Sa', v: 55 },
    { lab: 'Su', v: 80 },
    { lab: 'Mo', v: 48 },
    { lab: 'Tu', v: 72 },
    { lab: 'We', v: 90 },
  ];

  let day = 9;
  let glasses = 6;
  const GOAL = 8;
  const LITERS = 2.5;
  let activeDay = 6;
  let remind = false;

  $('[data-crescent]').innerHTML = svg('moon');
  $('[data-star]').innerHTML = svg('sparkle');
  $('[data-tree]').innerHTML = svg('leaf');

  const h = new Date().getHours();
  $('[data-greet]').textContent = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  $('[data-dow]').textContent = fmtDate(new Date(), { weekday: 'short' });

  function renderDates() {
    $('[data-dates]').innerHTML = DAYS.map((d) =>
      `<button type="button" role="tab" aria-selected="${d === day}" data-day="${d}">${d}</button>`
    ).join('');
  }

  function sunArc(pct) {
    const p = Math.max(0.02, Math.min(1, pct));
    // Sample a gentle parabola from left (imsak) to right (iftar)
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const x = 24 + t * 252;
      const y = 88 - Math.sin(Math.PI * t) * 62;
      pts.push([x, y]);
    }
    const d = 'M' + pts.map((pt) => pt.map((n) => n.toFixed(1)).join(',')).join(' L');
    const ti = Math.round(p * 24);
    const [kx, ky] = pts[ti];
    return `<svg viewBox="0 0 300 110" aria-hidden="true">
      <path d="${d}" fill="none" stroke="rgb(255 255 255 / 0.85)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" opacity="0.35" stroke-dasharray="4 8"/>
      <circle cx="${kx.toFixed(1)}" cy="${ky.toFixed(1)}" r="9" fill="var(--saffron)" stroke="rgb(255 255 255 / 0.9)" stroke-width="2"/>
      <circle cx="${kx.toFixed(1)}" cy="${ky.toFixed(1)}" r="16" fill="none" stroke="var(--saffron)" stroke-width="2" opacity="0.35"/>
    </svg>`;
  }

  function renderArc() {
    const w = WINDOWS[day];
    $('[data-daynum]').textContent = String(day);
    $('[data-imsak]').textContent = w.imsak;
    $('[data-iftar]').textContent = w.iftar;
    $('[data-countdown]').textContent = w.left;
    $('[data-arc]').innerHTML = `<div role="img" aria-label="Sun path ${Math.round(w.pct * 100)} percent toward iftar">${sunArc(w.pct)}</div>`;
  }

  function renderWater() {
    $('[data-segs]').innerHTML = Array.from({ length: GOAL }, (_, i) =>
      `<button type="button" aria-pressed="${i < glasses}" aria-label="Glass ${i + 1} of ${GOAL}" data-glass="${i + 1}"></button>`
    ).join('');
    $('[data-water-label]').textContent = `${glasses} of ${GOAL}`;
    const liters = ((glasses / GOAL) * LITERS).toFixed(1);
    $('[data-liters]').textContent = `${liters} liters of ${LITERS.toFixed(1)} liters`;
  }

  function renderBars() {
    const empty = WEEK.every((d) => d.v === 0);
    $('[data-daily-empty]').hidden = !empty;
    $('[data-daybars]').hidden = empty;
    if (empty) return;
    $('[data-daybars]').innerHTML = WEEK.map((d, i) =>
      `<div class="sd-daycol">
        <button type="button" aria-pressed="${i === activeDay}" data-wd="${i}" aria-label="${d.lab} ${d.v} percent">
          <i class="sd-dayfill" style="height:${Math.max(8, d.v)}%"></i>
        </button>
        <span class="sd-daylab" aria-hidden="true">${d.lab}</span>
      </div>`
    ).join('');
  }

  function syncNav(target) {
    $$('.sd-nav button').forEach((b) => {
      const on = b.dataset.nav === target;
      if (on) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    const live = {
      today: 'Showing Today fasting board.',
      progress: 'Progress focuses the daily bars.',
      sessions: 'Sessions · 8 logged this month.',
      profile: 'Showing Profile and daily progress.',
    };
    $('[data-live]').textContent = live[target] || '';
    if (target === 'progress' || target === 'profile') {
      $('[data-panel="profile"]').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      $('[data-panel="today"]').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  $('[data-dates]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]');
    if (!b) return;
    day = +b.dataset.day;
    renderDates();
    renderArc();
    b.focus();
  });

  $('[data-segs]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-glass]');
    if (!b) return;
    const n = +b.dataset.glass;
    glasses = glasses === n ? n - 1 : n;
    renderWater();
    $(`[data-glass="${Math.max(1, glasses) || 1}"]`)?.focus();
  });

  $('[data-daybars]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-wd]');
    if (!b) return;
    activeDay = +b.dataset.wd;
    renderBars();
    $('[data-live]').textContent = `${WEEK[activeDay].lab}: ${WEEK[activeDay].v}% of daily intention.`;
    b.focus();
  });

  $$('.sd-nav').forEach((nav) => {
    nav.addEventListener('click', (e) => {
      const b = e.target.closest('[data-nav]');
      if (!b) return;
      syncNav(b.dataset.nav);
    });
  });

  $('[data-remind]').addEventListener('click', () => {
    remind = !remind;
    $('[data-remind]').setAttribute('aria-pressed', String(remind));
    $('[data-live]').textContent = remind ? 'Reminder set for 20 minutes before iftar.' : 'Iftar reminder cleared.';
  });

  $('[data-share]').addEventListener('click', () => {
    $('[data-live]').textContent = 'Share link copied for Noor El-Amin (sample).';
  });

  $('[data-upgrade]').addEventListener('click', () => {
    $('[data-live]').textContent = 'Upgrade preview · Journeys unlocked in sample mode.';
    $('[data-journeys]').textContent = '3';
  });

  $('[data-settings]').addEventListener('click', () => {
    $('[data-live]').textContent = 'Settings stay on-device in this sample.';
  });

  renderDates();
  renderArc();
  renderWater();
  renderBars();
/* === DB multipage polish (dense kit) === */
  (function wirePages() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"vitals","name":"Vitals","pattern":"Report"},{"id":"appointments","name":"Appointments","pattern":"Calendar"},{"id":"records","name":"Records","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
    const root = document.querySelector('[data-db-app]') || document.body;
    const main = document.querySelector('main') || document.body;
    let overview = main.querySelector('[data-page-panel="overview"]');
    if (!overview) {
      overview = document.createElement('div');
      overview.setAttribute('data-page-panel', 'overview');
      const keep = [];
      [...main.children].forEach((ch) => {
        if (ch.hasAttribute && ch.hasAttribute('data-db-stub')) return;
        if (ch.getAttribute && ch.getAttribute('data-db-page-host') != null) return;
        keep.push(ch);
      });
      keep.forEach((ch) => overview.appendChild(ch));
      main.insertBefore(overview, main.firstChild);
    }
    main.querySelectorAll('[data-db-stub]').forEach((el) => el.remove());
    document.querySelectorAll('a[href]').forEach((a) => {
      const label = (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!label) return;
      const hit = PAGES.find((p) => p.name.toLowerCase() === label || p.id === label
        || (label === 'home' && p.id === 'overview')
        || (label === 'dashboard' && p.id === 'overview'));
      if (hit) a.setAttribute('href', '#/' + hit.id);
    });
    if (window.DB?.onVisible) {
      window.DB.onVisible(root, (visible) => {
        document.documentElement.dataset.motionPaused = visible ? '' : '1';
      });
    }
    if (!window.DB?.dense) {
      console.error('DB.dense missing — load ../_shared/dense-pages.js');
      return;
    }
    window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Saffron Dusk" });
    if (window.DB?.fx) window.DB.fx.remount(overview);
    void reduce;
  })();
/* === /DB multipage polish === */
  document.documentElement.dataset.ready = 'true';
})();
