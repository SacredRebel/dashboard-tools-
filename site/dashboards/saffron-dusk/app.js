/* Saffron Dusk: fictional fasting-day wellness — twin liquid-glass phones. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const DAYS = [8, 9, 10, 11, 12];
  const WINDOWS = {
    8: { imsak: '4:18AM', iftar: '6:05PM', left: 'Iftar in 2HR 10MIN', pct: 0.72 },
    9: { imsak: '4:15AM', iftar: '6:08PM', left: 'Iftar in 1HR 34MIN', pct: 0.86 },
    10: { imsak: '4:13AM', iftar: '6:10PM', left: 'Iftar in 3HR 02MIN', pct: 0.64 },
    11: { imsak: '4:11AM', iftar: '6:12PM', left: 'Iftar in 45MIN', pct: 0.94 },
    12: { imsak: '4:09AM', iftar: '6:14PM', left: 'Iftar in 4HR 20MIN', pct: 0.48 },
  };
  const WEEK = [
    { lab: 'Th', v: 42 }, { lab: 'Fr', v: 68 }, { lab: 'Sa', v: 55 },
    { lab: 'Su', v: 88 }, { lab: 'Mo', v: 48 }, { lab: 'Tu', v: 72 }, { lab: 'We', v: 64 },
  ];
  let day = 9, glasses = 6, activeDay = 3, remind = false, viewState = 'ready';
  const GOAL = 8, LITERS = 2.5;
  $('[data-greet]').textContent = 'Good evening';
  const live = (msg) => { $('[data-live]').textContent = msg; };

  function renderDates() {
    $('[data-dates]').innerHTML = DAYS.map((d) =>
      `<button type="button" role="tab" data-ref="date" aria-selected="${d === day}" data-day="${d}">${d}</button>`
    ).join('');
    $('[data-daynum]').textContent = String(day);
  }
  function sunArc(pct) {
    const p = Math.max(0.02, Math.min(1, pct));
    const pts = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      pts.push(`${(8 + t * 184).toFixed(1)},${(52 - Math.sin(Math.PI * t) * 40).toFixed(1)}`);
    }
    const sx = 8 + p * 184, sy = 52 - Math.sin(Math.PI * p) * 40;
    return `<svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="sd-arc-g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="0.55" stop-color="#fff" stop-opacity="0.95"/>
        <stop offset="1" stop-color="#e8c078" stop-opacity="0.9"/></linearGradient>
        <filter id="sd-sun-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <polyline points="${pts.join(' ')}" fill="none" stroke="url(#sd-arc-g)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="5.2" fill="#fff" filter="url(#sd-sun-glow)"/>
      <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="2.4" fill="#fff6d8"/>
    </svg>`;
  }
  function renderArc() {
    const w = WINDOWS[day] || WINDOWS[9];
    $('[data-imsak]').textContent = w.imsak;
    $('[data-iftar]').textContent = w.iftar;
    $('[data-countdown]').textContent = w.left;
    $('[data-arc]').innerHTML = sunArc(w.pct);
  }
  function renderWater() {
    $('[data-segs]').innerHTML = Array.from({ length: GOAL }, (_, i) => {
      const n = i + 1;
      return `<button type="button" data-glass="${n}" aria-pressed="${n <= glasses}" aria-label="${n} of ${GOAL} glasses"></button>`;
    }).join('');
    $('[data-water-label]').textContent = `${glasses} of ${GOAL}`;
    const liters = ((glasses / GOAL) * LITERS).toFixed(1);
    $('[data-liters]').textContent = `${liters} LITERS of ${LITERS.toFixed(1)} LITERS`;
    const mini = $('[data-v-segs]');
    if (mini) mini.innerHTML = Array.from({ length: GOAL }, (_, i) => `<i class="${i < glasses ? 'on' : ''}"></i>`).join('');
    const vw = $('[data-v-water]');
    if (vw) vw.textContent = `${liters} L`;
  }
  function renderBars() {
    const max = Math.max(...WEEK.map((d) => d.v), 1);
    $('[data-daybars]').innerHTML = WEEK.map((d, i) => {
      const h = Math.max(18, Math.round((d.v / max) * 100));
      return `<button type="button" data-wd="${i}" aria-current="${i === activeDay}" aria-label="${d.lab} ${d.v} percent">
        <span class="bar" style="--h:${h}%" data-ref="day-bar"></span><span class="lab">${d.lab}</span></button>`;
    }).join('');
  }
  function syncNav(which) {
    $$('.sd-nav').forEach((nav) => {
      $$('button[data-nav]', nav).forEach((b) => {
        if (b.dataset.nav === which) b.setAttribute('aria-current', 'page');
        else b.removeAttribute('aria-current');
      });
    });
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (which === 'profile') $('[data-ref="phone-right"]')?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    else if (which === 'today') $('[data-ref="phone-left"]')?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    else live(`${which[0].toUpperCase()}${which.slice(1)} opens on phone in this sample.`);
  }
  function applyViewState() {
    const note = $('[data-state-note]'), empty = $('[data-appt-empty]'), list = $('.sd-list'), records = $('[data-records]');
    if (viewState === 'empty') {
      if (list) list.hidden = true; if (empty) empty.hidden = false; if (records) records.innerHTML = '';
      if (note) note.textContent = 'Showing empty states where a module has no rows.';
    } else if (viewState === 'loading') {
      if (list) list.hidden = false; if (empty) empty.hidden = true;
      if (records) records.innerHTML = '<tr><td colspan="4">Loading sample records…</td></tr>';
      if (note) note.textContent = 'Showing loading placeholders.';
    } else if (viewState === 'error') {
      if (list) list.hidden = false; if (empty) empty.hidden = true;
      if (records) records.innerHTML = '<tr><td colspan="4">Could not load records. Try Save preferences again.</td></tr>';
      if (note) note.textContent = 'Showing an error state. Prefer Ready for demos.';
    } else {
      if (list) list.hidden = false; if (empty) empty.hidden = true;
      if (records) records.innerHTML = `<tr><td>Wed 9</td><td>Fasting day</td><td>6 / 8</td><td>On track</td></tr>
        <tr><td>Tue 8</td><td>Fasting day</td><td>5 / 8</td><td>Missed afternoon glass</td></tr>
        <tr><td>Mon 7</td><td>Journey · Olive path</td><td>7 / 8</td><td>Evening walk</td></tr>
        <tr><td>Sun 6</td><td>Fasting day</td><td>8 / 8</td><td>Complete</td></tr>
        <tr><td>Sat 5</td><td>Community circle</td><td>6 / 8</td><td>Shared recipes</td></tr>
        <tr><td>Fri 4</td><td>Fasting day</td><td>7 / 8</td><td>Steady</td></tr>`;
      if (note) note.textContent = 'Showing ready sample data.';
    }
  }
  function showPage(id) {
    $$('[data-page]').forEach((el) => {
      if (el.classList.contains('sd-frame') || el.classList.contains('sd-page')) el.hidden = el.getAttribute('data-page') !== id;
    });
    $$('.sd-pages [data-route]').forEach((a) => {
      if (a.dataset.route === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.documentElement.dataset.page = id;
    applyViewState();
  }
  function route() {
    const id = (location.hash.replace(/^#\/?/, '') || 'overview').split('?')[0];
    const known = ['overview', 'vitals', 'appointments', 'records', 'settings'];
    showPage(known.includes(id) ? id : 'overview');
  }

  $('[data-dates]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]'); if (!b) return;
    day = +b.dataset.day; renderDates(); renderArc(); b.focus();
  });
  $('[data-segs]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-glass]'); if (!b) return;
    const n = +b.dataset.glass; glasses = glasses === n ? n - 1 : n; renderWater();
  });
  $('[data-daybars]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-wd]'); if (!b) return;
    activeDay = +b.dataset.wd; renderBars(); live(`${WEEK[activeDay].lab}: ${WEEK[activeDay].v}% of daily intention.`); b.focus();
  });
  $$('.sd-nav').forEach((nav) => nav.addEventListener('click', (e) => {
    const b = e.target.closest('[data-nav]'); if (!b) return; syncNav(b.dataset.nav);
  }));
  $('[data-remind]').addEventListener('click', () => {
    remind = !remind; $('[data-remind]').setAttribute('aria-pressed', String(remind));
    live(remind ? 'Reminder set for 20 minutes before iftar.' : 'Iftar reminder cleared.');
  });
  $('[data-share]').addEventListener('click', () => live('Share link copied for Mira Nazari (sample).'));
  $('[data-upgrade]').addEventListener('click', () => { live('Upgrade preview · Journeys unlocked in sample mode.'); $('[data-journeys]').textContent = '3'; });
  $('[data-settings]').addEventListener('click', () => { location.hash = '#/settings'; });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const map = { rsvp: 'RSVP kept for Laila House.', reschedule: 'Reschedule sheet opened (sample).', join: 'Joining community circle (sample).' };
    live(map[b.dataset.act] || `${b.textContent.trim()} · sample action.`);
  });
  const form = $('[data-settings-form]');
  if (form) {
    form.addEventListener('submit', (e) => { e.preventDefault(); live('Preferences saved on-device for this sample.'); });
    form.addEventListener('click', (e) => {
      const b = e.target.closest('[data-state]'); if (!b) return;
      viewState = b.dataset.state;
      $$('[data-state]', form).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      applyViewState();
    });
  }
  renderDates(); renderArc(); renderWater(); renderBars();
  window.addEventListener('hashchange', route); route();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && window.Motion?.animate) {
    const frame = $('[data-ref="frame"]');
    if (frame) window.Motion.animate(frame, { opacity: [0.92, 1], transform: ['scale(0.985)', 'scale(1)'] }, { duration: 0.45, easing: [0.22, 1, 0.36, 1] });
  }
  if (window.DB?.onVisible) {
    window.DB.onVisible(document.querySelector('[data-db-app]'), (visible) => {
      document.documentElement.dataset.motionPaused = visible ? '' : '1';
    });
  }
  document.documentElement.dataset.ready = 'true';
})();
