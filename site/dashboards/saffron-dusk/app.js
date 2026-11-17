/* Saffron Dusk — one-wide liquid-glass fasting board (fictional sample). */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const DAYS = [8, 9, 10, 11, 12];
  const WINDOWS = {
    8: { imsak: '4:18AM', iftar: '6:05PM', left: 'Iftar in 2hr 10min', pct: 0.72 },
    9: { imsak: '4:15AM', iftar: '6:08PM', left: 'Iftar in 1hr 34min', pct: 0.86 },
    10: { imsak: '4:13AM', iftar: '6:10PM', left: 'Iftar in 3hr 02min', pct: 0.64 },
    11: { imsak: '4:11AM', iftar: '6:12PM', left: 'Iftar in 45min', pct: 0.94 },
    12: { imsak: '4:09AM', iftar: '6:14PM', left: 'Iftar in 4hr 20min', pct: 0.48 },
  };
  const WEEK = [
    { lab: 'Th', v: 42 }, { lab: 'Fr', v: 68 }, { lab: 'Sa', v: 55 },
    { lab: 'Su', v: 88 }, { lab: 'Mo', v: 48 }, { lab: 'Tu', v: 72 }, { lab: 'We', v: 64 },
  ];
  const GOAL = 8, LITERS = 2.5;
  let day = 9, glasses = 6, activeDay = 3, remind = false, gatherOn = false, built = false;
  const liveEl = $('[data-live]');
  const live = (msg) => {
    if (!liveEl) return;
    liveEl.textContent = msg; liveEl.dataset.on = '1';
    clearTimeout(live._t); live._t = setTimeout(() => { liveEl.dataset.on = '0'; }, 2200);
  };
  function sunArc(pct) {
    const p = Math.max(0.02, Math.min(1, pct)); const pts = [];
    for (let i = 0; i <= 32; i++) { const t = i / 32; pts.push(`${(8 + t * 184).toFixed(1)},${(52 - Math.sin(Math.PI * t) * 40).toFixed(1)}`); }
    const sx = 8 + p * 184, sy = 52 - Math.sin(Math.PI * p) * 40;
    return `<svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="sd-arc-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.45"/><stop offset="0.5" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#f0c878" stop-opacity="0.95"/></linearGradient><filter id="sd-sun-glow" x="-180%" y="-180%" width="460%" height="460%"><feGaussianBlur stdDeviation="4.2" result="b"/><feGaussianBlur stdDeviation="2.2" result="b2"/><feMerge><feMergeNode in="b"/><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><polyline points="${pts.join(' ')}" fill="none" stroke="url(#sd-arc-g)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="11" fill="rgba(255,230,160,.28)" filter="url(#sd-sun-glow)"/><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="6.4" fill="rgba(255,245,210,.55)" filter="url(#sd-sun-glow)"/><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3.6" fill="#fffef6" stroke="rgba(255,236,190,.95)" stroke-width="1.1"/><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="1.6" fill="#fff"/></svg>`;
  }
  function ensureControls() {
    if (built) return; built = true;
    const dates = $('[data-dates]');
    if (dates) dates.innerHTML = DAYS.map((d) => `<button type="button" role="tab" data-ref="date" aria-selected="${d === day}" data-day="${d}">${d}</button>`).join('');
    const segs = $('[data-segs]');
    if (segs) segs.innerHTML = Array.from({ length: GOAL }, (_, i) => { const n = i + 1; return `<button type="button" data-glass="${n}" aria-pressed="${n <= glasses}" aria-label="${n} of ${GOAL} glasses"></button>`; }).join('');
    const max = Math.max(...WEEK.map((d) => d.v), 1);
    const barHtml = WEEK.map((d, i) => { const h = Math.max(18, Math.round((d.v / max) * 100)); return `<button type="button" data-wd="${i}" aria-current="${i === activeDay}" aria-label="${d.lab} ${d.v} percent"><span class="bar" style="--h:${h}%" data-ref="day-bar"></span><span class="lab">${d.lab}</span></button>`; }).join('');
    $$('[data-daybars], [data-daybars-m]').forEach((host) => { host.innerHTML = barHtml; });
    const chart = $('[data-p-bars]');
    if (chart) chart.innerHTML = WEEK.map((d, i) => `<i style="--h:${d.v}%" data-i="${i}" class="${i === activeDay ? 'on' : ''}"></i>`).join('');
  }
  function syncDates() { $$('[data-dates] [data-day]').forEach((b) => b.setAttribute('aria-selected', String(+b.dataset.day === day))); $$('[data-daynum]').forEach((el) => { el.textContent = String(day); }); }
  function syncArc() {
    const w = WINDOWS[day] || WINDOWS[9];
    const imsak = $('[data-imsak]'); const iftar = $('[data-iftar]'); const countdown = $('[data-countdown]'); const arc = $('[data-arc]');
    if (imsak) imsak.textContent = w.imsak; if (iftar) iftar.textContent = w.iftar;
    if (countdown) countdown.textContent = remind ? `Reminder on · ${w.left}` : w.left;
    if (arc) arc.innerHTML = sunArc(w.pct);
  }
  function syncWater() {
    $$('[data-glass]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.glass <= glasses)));
    const liters = ((glasses / GOAL) * LITERS).toFixed(1);
    const label = $('[data-water-label]'); if (label) label.textContent = `${glasses} of ${GOAL}`;
    const lit = $('[data-liters]'); if (lit) lit.textContent = `${liters} LITERS of ${LITERS.toFixed(1)} LITERS`;
    const streak = $('[data-p-streak]'); if (streak) streak.textContent = String(Math.max(1, Math.min(7, glasses - 2)));
  }
  function syncBars() {
    $$('[data-wd]').forEach((b) => b.setAttribute('aria-current', String(+b.dataset.wd === activeDay)));
    const note = `${WEEK[activeDay].lab} · ${WEEK[activeDay].v}% of daily intention`;
    $$('[data-day-note], [data-day-note-m]').forEach((el) => { el.textContent = note; });
    const weekAvg = $('[data-p-week]'); if (weekAvg) weekAvg.textContent = `${Math.round(WEEK.reduce((s, d) => s + d.v, 0) / WEEK.length)}%`;
    $$('[data-p-bars] i').forEach((el) => el.classList.toggle('on', +el.dataset.i === activeDay));
  }
  function showPage(id) {
    $$('[data-db-page]').forEach((el) => { el.hidden = el.getAttribute('data-db-page') !== id; });
    $$('.sd-rail [data-route]').forEach((a) => { if (a.dataset.route === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }
  ensureControls(); syncDates(); syncArc(); syncWater(); syncBars();
  $('[data-dates]')?.addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (!b) return; day = +b.dataset.day; syncDates(); syncArc(); live(`Ramadan ${day} · sample fasting window.`); });
  $('[data-segs]')?.addEventListener('click', (e) => { const b = e.target.closest('[data-glass]'); if (!b) return; const n = +b.dataset.glass; glasses = glasses === n ? Math.max(0, n - 1) : n; syncWater(); live(`Water ${glasses} of ${GOAL} glasses.`); });
  function onDayBarClick(e) { const b = e.target.closest('[data-wd]'); if (!b) return; activeDay = +b.dataset.wd; syncBars(); live(`${WEEK[activeDay].lab}: ${WEEK[activeDay].v}% of daily intention.`); }
  $('[data-daybars]')?.addEventListener('click', onDayBarClick);
  $('[data-daybars-m]')?.addEventListener('click', onDayBarClick);
  $('[data-remind]')?.addEventListener('click', () => { remind = !remind; $('[data-remind]').setAttribute('aria-pressed', String(remind)); syncArc(); const lab = $('[data-remind-label]'); if (lab) lab.textContent = remind ? '20 minutes before' : 'Off'; live(remind ? 'Reminder set for 20 minutes before iftar.' : 'Iftar reminder cleared.'); });
  $('[data-gather]')?.addEventListener('click', () => { gatherOn = !gatherOn; $('[data-gather]').setAttribute('aria-pressed', String(gatherOn)); const t = $('[data-gather-time]'); if (t) t.textContent = gatherOn ? 'RSVP kept · 6:00 PM' : '6:00 PM'; live(gatherOn ? 'RSVP kept for Laila House (sample).' : 'Gather card reset.'); });
  function doShare(btn) { btn?.setAttribute('data-shared', String(Date.now())); live('Share link copied for Mira Nazari (sample).'); }
  $('[data-share]')?.addEventListener('click', (e) => doShare(e.currentTarget));
  $('[data-share-m]')?.addEventListener('click', (e) => doShare(e.currentTarget));
  function doUpgrade(btn) { $$('[data-journeys], [data-journeys-m]').forEach((el) => { el.textContent = '3'; }); btn?.setAttribute('data-upgraded', String(Date.now())); live('Upgrade preview · Journeys unlocked in sample mode.'); }
  $('[data-upgrade]')?.addEventListener('click', (e) => doUpgrade(e.currentTarget));
  $('[data-upgrade-m]')?.addEventListener('click', (e) => doUpgrade(e.currentTarget));
  $('[data-settings]')?.addEventListener('click', () => { if (window.DB?.route) location.hash = '#/profile'; else location.hash = '#/profile'; live('Opening profile settings.'); });
  $('[data-settings-m]')?.addEventListener('click', () => { remind = !remind; $('[data-settings-m]').setAttribute('aria-pressed', String(remind)); const lab = $('[data-remind-label]'); if (lab) lab.textContent = remind ? '20 minutes before' : 'Off'; live(remind ? 'Reminder preference on.' : 'Reminder preference off.'); });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'edit-name') { const n = $('[data-name]'); if (n) n.textContent = n.textContent === 'Mira Nazari' ? 'Mira N. (sample)' : 'Mira Nazari'; }
    else if (act === 'edit-city') { const c = $('[data-city]'); if (c) c.textContent = c.textContent === 'Cedar Bay' ? 'Olive Ridge' : 'Cedar Bay'; }
    else if (act === 'edit-remind') { remind = !remind; const lab = $('[data-remind-label]'); if (lab) lab.textContent = remind ? '20 minutes before' : 'Off'; }
    else if (act === 'streak') { glasses = Math.min(GOAL, glasses + 1); syncWater(); }
    else if (act === 'week-detail') { activeDay = (activeDay + 1) % WEEK.length; syncBars(); }
    b.setAttribute('data-used', String(Date.now())); live(`${b.textContent.trim()} · sample action.`);
  });
  const pages = [
    { id: 'overview', name: 'Today' },
    { id: 'progress', name: 'Progress' },
    { id: 'sessions', name: 'Sessions' },
    { id: 'profile', name: 'Profile' },
  ];
  if (window.DB && typeof window.DB.route === 'function') {
    window.DB.route(pages, (id) => showPage(id));
  } else {
    const route = () => { const id = (location.hash.replace(/^#\/?/, '') || 'overview').split('?')[0]; const known = pages.map((p) => p.id); showPage(known.includes(id) ? id : 'overview'); document.documentElement.dataset.page = known.includes(id) ? id : 'overview'; };
    window.addEventListener('hashchange', route); route();
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.querySelector('[data-db-app]');
  if (!reduce && window.Motion?.animate) {
    const frame = $('[data-ref="frame"]');
    if (frame) window.Motion.animate(frame, { opacity: [0.92, 1], transform: ['scale(0.988)', 'scale(1)'] }, { duration: 0.45, easing: [0.22, 1, 0.36, 1] });
  }
  if (!reduce && root) {
    let raf = 0;
    root.addEventListener('pointermove', (e) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const r = root.getBoundingClientRect(); document.documentElement.style.setProperty('--spec-x', `${(((e.clientX - r.left) / Math.max(1, r.width)) * 100).toFixed(1)}%`); document.documentElement.style.setProperty('--spec-y', `${(((e.clientY - r.top) / Math.max(1, r.height)) * 100).toFixed(1)}%`); }); }, { passive: true });
  }
  document.documentElement.dataset.ready = 'true';
})();
