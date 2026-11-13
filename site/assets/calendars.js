/* =========================================================================
   Calendars page: eight live calendar styles (each themeable), the
   approach chooser, the repo directory (window.CALENDARS from
   catalog/calendars.json), integration architecture and agent hand-off.
   Vanilla JS. No polling: the only timer is the week view's current-time
   line, once a minute, paused offscreen and in background tabs.
   Calendars.render(mainEl, { themes, onTheme })  ·  Calendars.destroy()
   ========================================================================= */
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);

  // ---------------------------------------------------------------- dates
  const DAY = 864e5;
  const sod = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const add = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const same = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const key = (d) => Math.round((sod(d) - new Date(2000, 0, 1)) / DAY);
  const fromKey = (k) => add(new Date(2000, 0, 1), +k);
  const fmt = (d, o) => d.toLocaleDateString('en-US', o);
  const weekStart = (d) => add(d, -d.getDay()); // US locale: Sunday
  const hm = (m) => { const h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'PM' : 'AM'; return `${((h + 11) % 12) + 1}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${ap}`; };
  const hmShort = (m) => hm(m).replace(' AM', 'a').replace(' PM', 'p');
  const TODAY = sod(new Date());

  // ---------------------------------------------------------------- fictional sample data
  const PEOPLE = [['Maya Lindqvist', 'Harbor & Pine Interiors'], ['Owen Brandt', 'Juniper Bakery'], ['Priya Natarajan', 'Northfield Dental'], ['Leo Okafor', 'Calder Studio'], ['Sofia Marín', 'Oak & Ember Café'], ['Jonah Weiss', 'Bluebird Florals'], ['Hana Sato', 'Kestrel Yoga'], ['Elena Petrov', 'Larkspur Law']];
  const TYPES = [
    { t: 'Discovery call', c: 1, d: 30, k: 'calls' }, { t: 'Proposal review', c: 2, d: 45, k: 'meetings' }, { t: 'Site visit', c: 3, d: 90, k: 'visits' },
    { t: 'Follow-up call', c: 4, d: 30, k: 'calls' }, { t: 'Kickoff', c: 5, d: 60, k: 'meetings' }, { t: 'Invoice check-in', c: 4, d: 15, k: 'calls' },
  ];
  const rnd = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const cache = new Map();
  function eventsOn(d) {
    const k = key(d);
    if (cache.has(k)) return cache.get(k);
    const wk = d.getDay() === 0 || d.getDay() === 6;
    const n = wk ? (rnd(k) > 0.8 ? 1 : 0) : Math.floor(rnd(k) * 4.2);
    const list = [];
    for (let i = 0; i < n; i++) {
      const ty = TYPES[Math.floor(rnd(k * 7 + i) * TYPES.length)];
      const p = PEOPLE[Math.floor(rnd(k * 13 + i) * PEOPLE.length)];
      const start = 8 * 60 + 30 + Math.floor(rnd(k * 3 + i * 5) * 17) * 30; // 8:30 … 16:30
      list.push({ id: `${k}-${i}`, title: ty.t, who: p[0], org: p[1], start, dur: ty.d, c: ty.c, kind: ty.k, day: d });
    }
    if (!wk && rnd(k * 31) > 0.9) list.push({ id: `${k}-ad`, title: 'Out of office', who: 'You', org: '', allDay: true, c: 3, kind: 'meetings', day: d, start: 0, dur: 0 });
    list.sort((a, b) => (b.allDay ? 1 : 0) - (a.allDay ? 1 : 0) || a.start - b.start);
    cache.set(k, list);
    return list;
  }
  const timed = (d) => eventsOn(d).filter((e) => !e.allDay);
  const chip = (e, cls = '') => `<span class="cl-chip ${cls}" style="--c:var(--chart-${e.c})">${e.allDay ? '' : `<span class="t num">${hmShort(e.start)}</span>`}${esc(e.title)}</span>`;
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function watchVisible(el, cb) {
    let inView = false;
    const io = new IntersectionObserver((es) => { inView = es[0].isIntersecting; cb(inView && !document.hidden); }, { threshold: 0.1 });
    io.observe(el);
    const onVis = () => cb(inView && !document.hidden);
    document.addEventListener('visibilitychange', onVis);
    onCleanup(() => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); });
  }
  const navBtns = (label) => `<div class="cl-nav"><button class="btn btn-sm" data-today>Today</button><button class="btn btn-sm btn-icon" data-prev aria-label="Previous ${label}">${icon('chevLeft')}</button><button class="btn btn-sm btn-icon" data-next aria-label="Next ${label}">${icon('chevRight')}</button></div>`;

  // shared keyboard model for day grids (month, picker)
  function gridKeys(e, focus) {
    const m = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (m[e.key] != null) return add(focus, m[e.key]);
    if (e.key === 'Home') return add(focus, -focus.getDay());
    if (e.key === 'End') return add(focus, 6 - focus.getDay());
    if (e.key === 'PageUp' || e.key === 'PageDown') { const n = new Date(focus.getFullYear(), focus.getMonth() + (e.key === 'PageUp' ? -1 : 1), 1); return new Date(n.getFullYear(), n.getMonth(), Math.min(focus.getDate(), new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate())); }
    return null;
  }

  // ================================================================ 1. Month grid
  function month(el) {
    let view = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1), sel = TODAY, focus = TODAY;
    function draw(refocus) {
      const first = weekStart(view), label = fmt(view, { month: 'long', year: 'numeric' });
      const days = Array.from({ length: 42 }, (_, i) => add(first, i));
      el.innerHTML = `<div class="cl-head"><h3 class="cl-title display">${label}</h3>${navBtns('month')}</div>
        <div class="cl-month" role="grid" aria-label="${label}">
          <div role="row" class="cl-dow">${DOW.map((d) => `<span role="columnheader">${d}</span>`).join('')}</div>
          ${[0, 1, 2, 3, 4, 5].map((r) => `<div role="row" class="cl-mrow">${days.slice(r * 7, r * 7 + 7).map((d) => {
            const ev = eventsOn(d), out = d.getMonth() !== view.getMonth();
            return `<div role="gridcell" class="cl-mcell${out ? ' out' : ''}${d.getDay() % 6 === 0 ? ' wkend' : ''}" data-k="${key(d)}" tabindex="${same(d, focus) ? 0 : -1}" aria-selected="${same(d, sel)}" aria-label="${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}${ev.length ? `, ${ev.length} event${ev.length > 1 ? 's' : ''}` : ', no events'}${same(d, TODAY) ? ', today' : ''}">
              <span class="cl-dnum num${same(d, TODAY) ? ' today' : ''}" aria-hidden="true">${d.getDate()}</span>
              <span class="cl-mchips" aria-hidden="true">${ev.slice(0, 2).map((e) => chip(e, e.allDay ? 'bar' : '')).join('')}${ev.length > 2 ? `<span class="cl-more">+${ev.length - 2} more</span>` : ''}</span>
              <span class="cl-dots" aria-hidden="true">${ev.slice(0, 3).map((e) => `<i style="--c:var(--chart-${e.c})"></i>`).join('')}</span></div>`;
          }).join('')}</div>`).join('')}
        </div>
        <div class="cl-dayag" aria-live="polite">${dayList(sel)}</div>`;
      if (refocus) el.querySelector('[tabindex="0"]').focus();
    }
    function dayList(d) {
      const ev = eventsOn(d);
      return `<div class="cl-dayag-h">${fmt(d, { weekday: 'long', month: 'short', day: 'numeric' })}</div>${ev.length ? `<ul>${ev.map((e) => `<li><span class="cl-bar" style="--c:var(--chart-${e.c})"></span><span class="num muted">${e.allDay ? 'All day' : hm(e.start)}</span><span>${esc(e.title)}${e.org ? ` · <span class="muted">${esc(e.org)}</span>` : ''}</span></li>`).join('')}</ul>` : '<p class="muted">Nothing scheduled. Click a day to see its events.</p>'}`;
    }
    function go(d, refocus) {
      focus = d;
      if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) view = new Date(d.getFullYear(), d.getMonth(), 1);
      draw(refocus);
    }
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-prev]')) { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); focus = view; draw(); return; }
      if (e.target.closest('[data-next]')) { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); focus = view; draw(); return; }
      if (e.target.closest('[data-today]')) { sel = TODAY; go(TODAY); return; }
      const c = e.target.closest('[data-k]'); if (c) { sel = fromKey(c.dataset.k); go(sel, true); }
    });
    el.addEventListener('keydown', (e) => {
      if (!e.target.closest('[data-k]')) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel = focus; draw(true); return; }
      const n = gridKeys(e, focus); if (n) { e.preventDefault(); go(n, true); }
    });
    draw();
  }

  // ================================================================ 2. Week time grid
  function week(el) {
    const H0 = 7, H1 = 19, PX = 44;
    let cursor = TODAY, n = 7, openId = null, nowTimer = null;
    function lanes(list) {
      const out = new Map(); let cluster = [], end = -1;
      const flush = () => { const cols = []; cluster.forEach((e) => { let i = cols.findIndex((c) => c <= e.start); if (i < 0) { i = cols.length; cols.push(0); } cols[i] = e.start + e.dur; out.set(e.id, { i }); }); cluster.forEach((e) => (out.get(e.id).n = cols.length)); cluster = []; };
      list.forEach((e) => { if (e.start >= end) flush(); cluster.push(e); end = Math.max(end, e.start + e.dur); });
      flush(); return out;
    }
    const nowTop = () => { const d = new Date(); return ((d.getHours() * 60 + d.getMinutes()) - H0 * 60) / 60 * PX; };
    function draw() {
      const start = n === 7 ? weekStart(cursor) : cursor;
      const days = Array.from({ length: n }, (_, i) => add(start, i));
      const label = n === 7 ? `${fmt(days[0], { month: 'short', day: 'numeric' })} – ${fmt(days[6], { month: days[0].getMonth() === days[6].getMonth() ? undefined : 'short', day: 'numeric' })}, ${days[6].getFullYear()}` : fmt(days[0], { month: 'long', year: 'numeric' });
      const all = days.flatMap((d) => eventsOn(d));
      const open = all.find((e) => e.id === openId);
      const cols = `48px repeat(${n}, minmax(0, 1fr))`;
      el.innerHTML = `<div class="cl-head"><h3 class="cl-title display">${label}</h3><span class="cl-tz muted">Times in your zone</span>${navBtns(n === 7 ? 'week' : 'days')}</div>
        <div class="cl-week" style="--cols:${cols}">
          <div class="cl-wk-head"><span></span>${days.map((d) => `<div class="cl-wk-day${same(d, TODAY) ? ' is-today' : ''}"><span>${DOW[d.getDay()]}</span><b class="num">${d.getDate()}</b></div>`).join('')}</div>
          <div class="cl-wk-allday"><span class="muted">All day</span>${days.map((d) => `<div>${eventsOn(d).filter((e) => e.allDay).map((e) => `<button class="cl-chip bar" style="--c:var(--chart-${e.c})" data-ev="${e.id}">${esc(e.title)}</button>`).join('')}</div>`).join('')}</div>
          <div class="cl-wk-scroll" tabindex="0" aria-label="Week schedule, scrollable">
            <div class="cl-wk-body" style="height:${(H1 - H0) * PX}px">
              <div class="cl-wk-gutter">${Array.from({ length: H1 - H0 }, (_, i) => `<span style="top:${i * PX}px">${i ? hmShort((H0 + i) * 60) : ''}</span>`).join('')}</div>
              ${days.map((d) => { const list = timed(d), L = lanes(list); return `<div class="cl-wk-col${same(d, TODAY) ? ' is-today' : ''}">${list.map((e) => { const l = L.get(e.id), top = (e.start - H0 * 60) / 60 * PX, h = Math.max(e.dur / 60 * PX - 2, 22); return `<button class="cl-wev${h < 36 ? ' short' : ''}${e.id === openId ? ' open' : ''}" data-ev="${e.id}" style="--c:var(--chart-${e.c});top:${top}px;height:${h}px;left:calc(${(l.i / l.n) * 100}% + 2px);width:calc(${100 / l.n}% - 4px)" aria-label="${esc(e.title)} with ${esc(e.who)}, ${fmt(d, { weekday: 'long' })} ${hm(e.start)} to ${hm(e.start + e.dur)}"><span class="num">${hmShort(e.start)}</span> ${esc(e.title)}</button>`; }).join('')}${same(d, TODAY) ? `<div class="cl-now" style="top:${nowTop()}px" aria-hidden="true"></div>` : ''}</div>`; }).join('')}
            </div>
          </div>
        </div>
        <div class="cl-detail" aria-live="polite">${open ? `<div><b>${esc(open.title)}</b><div class="muted">${fmt(open.day, { weekday: 'long', month: 'short', day: 'numeric' })} · ${open.allDay ? 'All day' : `${hm(open.start)} – ${hm(open.start + open.dur)}`}${open.org ? ` · ${esc(open.who)}, ${esc(open.org)}` : ''}</div></div><div class="cl-detail-actions">${open.allDay ? '' : `<button class="btn btn-sm" data-sample>${icon('video')}Join with Meet</button>`}<button class="btn btn-sm btn-primary" data-sample>Open client</button></div>` : '<span class="muted">Select an event to see its details.</span>'}</div>`;
      const sc = el.querySelector('.cl-wk-scroll'); sc.scrollTop = PX; // open at 8:00
    }
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-prev]')) { cursor = add(cursor, -n); openId = null; draw(); return; }
      if (e.target.closest('[data-next]')) { cursor = add(cursor, n); openId = null; draw(); return; }
      if (e.target.closest('[data-today]')) { cursor = TODAY; draw(); return; }
      if (e.target.closest('[data-sample]')) { const b = e.target.closest('[data-sample]'); b.textContent = 'Sample only'; b.disabled = true; return; }
      const ev = e.target.closest('[data-ev]'); if (ev) { const keep = el.querySelector('.cl-wk-scroll').scrollTop; openId = ev.dataset.ev; draw(); el.querySelector('.cl-wk-scroll').scrollTop = keep; el.querySelector(`[data-ev="${openId}"]`)?.focus(); }
    });
    const ro = new ResizeObserver(() => { const m = el.clientWidth < 560 ? 3 : 7; if (m !== n) { n = m; draw(); } });
    ro.observe(el); onCleanup(() => ro.disconnect());
    n = el.clientWidth && el.clientWidth < 560 ? 3 : 7;
    draw();
    watchVisible(el, (on) => {
      clearInterval(nowTimer); nowTimer = null;
      if (on) { const tick = () => { const l = el.querySelector('.cl-now'); if (l) l.style.top = nowTop() + 'px'; }; tick(); nowTimer = setInterval(tick, 60000); }
    });
    onCleanup(() => clearInterval(nowTimer));
  }

  // ================================================================ 3. Agenda list
  function agenda(el) {
    let from = TODAY, filter = 'all';
    const F = [['all', 'All'], ['calls', 'Calls'], ['meetings', 'Meetings'], ['visits', 'Visits']];
    function draw() {
      const days = Array.from({ length: 7 }, (_, i) => add(from, i));
      const groups = days.map((d) => [d, eventsOn(d).filter((e) => filter === 'all' || e.kind === filter)]).filter(([, l]) => l.length);
      el.innerHTML = `<div class="cl-head"><h3 class="cl-title display">${same(from, TODAY) ? 'Next 7 days' : `Week of ${fmt(from, { month: 'short', day: 'numeric' })}`}</h3>${navBtns('week')}</div>
        <div class="cl-seg" role="group" aria-label="Filter events">${F.map(([id, l]) => `<button aria-pressed="${filter === id}" data-f="${id}">${l}</button>`).join('')}</div>
        <div class="cl-agenda">${groups.map(([d, l]) => `<section><h4 class="cl-ag-day">${same(d, TODAY) ? 'Today · ' : same(d, add(TODAY, 1)) ? 'Tomorrow · ' : ''}${fmt(d, { weekday: 'short', month: 'short', day: 'numeric' })}</h4>
          <ul>${l.map((e) => `<li><span class="cl-ag-time num">${e.allDay ? 'All day' : `${hm(e.start)}<small>${hm(e.start + e.dur)}</small>`}</span><span class="cl-bar" style="--c:var(--chart-${e.c})"></span><span class="cl-ag-what"><b>${esc(e.title)}</b>${e.org ? `<span class="muted">${esc(e.who)} · ${esc(e.org)}</span>` : ''}</span></li>`).join('')}</ul></section>`).join('')}
          <p class="cl-ag-end muted">${groups.length ? 'Nothing else this week.' : 'Nothing matches this filter this week.'} <button class="btn btn-sm btn-ghost" data-next>See next week</button></p></div>`;
    }
    el.addEventListener('click', (e) => {
      const f = e.target.closest('[data-f]'); if (f) { filter = f.dataset.f; draw(); el.querySelector(`[data-f="${filter}"]`).focus(); return; }
      if (e.target.closest('[data-prev]')) { from = add(from, -7); draw(); }
      else if (e.target.closest('[data-next]')) { from = add(from, 7); draw(); }
      else if (e.target.closest('[data-today]')) { from = TODAY; draw(); }
    });
    draw();
  }

  // ================================================================ 4. Date and range picker
  function picker(el) {
    let view = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1), a = add(TODAY, 2), b = add(TODAY, 8), hover = null, focus = a, err = '';
    const label = (d) => fmt(d, { month: 'short', day: 'numeric' });
    const value = () => a && b ? `${label(a)} – ${label(b)}, ${b.getFullYear()}` : a ? `${label(a)} – …` : '';
    function draw(refocus) {
      const first = weekStart(view), mlabel = fmt(view, { month: 'long', year: 'numeric' });
      const end = b || (a && hover && hover > a ? hover : null);
      el.innerHTML = `<div class="cl-picker">
        <div class="field"><label class="label" for="cl-range-in">Follow-up window</label>
          <input class="input" id="cl-range-in" value="${esc(value())}" placeholder="Nov 18 – Nov 22" aria-describedby="cl-range-hint" ${err ? 'aria-invalid="true"' : ''}>
          <span class="hint" id="cl-range-hint" ${err ? 'style="color:var(--danger)"' : ''}>${err || 'Type a range or pick it below. Past dates are unavailable.'}</span></div>
        <div class="cl-mini">
          <div class="cl-mini-head"><button class="btn btn-sm btn-icon btn-ghost" data-prev aria-label="Previous month">${icon('chevLeft')}</button><b>${mlabel}</b><button class="btn btn-sm btn-icon btn-ghost" data-next aria-label="Next month">${icon('chevRight')}</button></div>
          <div class="cl-mini-grid" role="grid" aria-label="${mlabel}">
            <div role="row" class="cl-mini-row dow">${DOW.map((d) => `<span role="columnheader" aria-label="${d}">${d.slice(0, 2)}</span>`).join('')}</div>
            ${[0, 1, 2, 3, 4, 5].map((r) => `<div role="row" class="cl-mini-row">${Array.from({ length: 7 }, (_, c) => { const d = add(first, r * 7 + c), past = d < TODAY, out = d.getMonth() !== view.getMonth(); const isA = same(d, a), isB = same(d, end), mid = a && end && d > a && d < end;
              return `<div role="gridcell" aria-selected="${isA || isB || !!mid}" ${past ? 'aria-disabled="true"' : ''} class="cl-md${out ? ' out' : ''}${isA ? ' start' : ''}${isB ? ' end' : ''}${mid ? ' mid' : ''}${same(d, TODAY) ? ' today' : ''}" data-k="${key(d)}" tabindex="${same(d, focus) ? 0 : -1}" aria-label="${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}${past ? ', past date, unavailable' : ''}${isA ? ', range start' : ''}${isB ? ', range end' : ''}"><span class="num">${d.getDate()}</span></div>`; }).join('')}</div>`).join('')}
          </div>
        </div>
        <div class="cl-picker-foot"><span class="muted" aria-live="polite">${a && b ? `${Math.round((b - a) / DAY) + 1} days selected` : a ? 'Now pick an end date' : 'Pick a start date'}</span><span style="display:flex;gap:8px"><button class="btn btn-sm btn-ghost" data-clear>Clear</button><button class="btn btn-sm btn-primary" data-apply ${a && b ? '' : 'disabled'}>Set window</button></span></div>
      </div>`;
      if (refocus) el.querySelector('.cl-md[tabindex="0"]')?.focus();
    }
    function pick(d) {
      if (d < TODAY) return;
      if (!a || b || d < a) { a = d; b = null; } else b = d;
      err = ''; focus = d; draw(true);
    }
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-prev]')) { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); draw(); return; }
      if (e.target.closest('[data-next]')) { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); draw(); return; }
      if (e.target.closest('[data-clear]')) { a = b = null; err = ''; draw(); el.querySelector('#cl-range-in').focus(); return; }
      if (e.target.closest('[data-apply]')) { const btn = e.target.closest('[data-apply]'); btn.textContent = 'Window set (sample)'; return; }
      const c = e.target.closest('[data-k]'); if (c) pick(fromKey(c.dataset.k));
    });
    el.addEventListener('mouseover', (e) => { const c = e.target.closest('[data-k]'); if (c && a && !b) { const d = fromKey(c.dataset.k); if (!same(d, hover)) { hover = d; el.querySelectorAll('.cl-md').forEach((x) => { const k = fromKey(x.dataset.k); x.classList.toggle('mid', k > a && k < hover); x.classList.toggle('end', same(k, hover) && hover > a); }); } } });
    el.addEventListener('keydown', (e) => {
      if (!e.target.closest('[data-k]')) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(focus); return; }
      const n = gridKeys(e, focus); if (n) { e.preventDefault(); focus = n; if (n.getMonth() !== view.getMonth() || n.getFullYear() !== view.getFullYear()) view = new Date(n.getFullYear(), n.getMonth(), 1); draw(true); }
    });
    el.addEventListener('change', (e) => {
      if (e.target.id !== 'cl-range-in') return;
      const parts = e.target.value.split(/\s+(?:–|-|to)\s+|–/).map((s) => s.trim()).filter(Boolean);
      const parse = (s) => { if (!/^([A-Za-z]{3,9}\.?\s+\d{1,2}(,?\s+\d{4})?|\d{1,2}\/\d{1,2}(\/\d{2,4})?)$/.test(s)) return null; let d = new Date(s); if (isNaN(d)) d = new Date(`${s} ${TODAY.getFullYear()}`); return isNaN(d) ? null : sod(d); };
      const [x, y] = parts.map(parse);
      if (parts.length === 2 && x && y && y >= x && x >= TODAY) { a = x; b = y; err = ''; view = new Date(x.getFullYear(), x.getMonth(), 1); focus = x; }
      else err = x && x < TODAY ? 'That start date has passed. Pick today or later.' : 'Try a format like “Nov 18 – Nov 22”.';
      draw(); el.querySelector('#cl-range-in').focus();
    });
    draw();
  }

  // ================================================================ 5. Year heatmap
  function heatmap(el) {
    const end = add(weekStart(TODAY), 6), start = add(end, -53 * 7 + 1);
    const days = Array.from({ length: 53 * 7 }, (_, i) => add(start, i));
    const count = (d) => d > TODAY ? null : (d.getDay() % 6 === 0 ? Math.floor(rnd(key(d) * 5) * 2) : Math.floor(Math.pow(rnd(key(d) * 5), 1.6) * 9));
    const lvl = (c) => c == null ? -1 : c === 0 ? 0 : c <= 2 ? 1 : c <= 4 ? 2 : c <= 6 ? 3 : 4;
    const counts = days.map(count);
    const total = counts.reduce((s, c) => s + (c || 0), 0);
    let best = 0, bestW = 0; for (let w = 0; w < 53; w++) { const s = counts.slice(w * 7, w * 7 + 7).reduce((x, c) => x + (c || 0), 0); if (s > best) { best = s; bestW = w; } }
    let active = days.findIndex((d) => same(d, TODAY));
    const months = []; days.forEach((d, i) => { if (i % 7 === 0 && (i === 0 || d.getMonth() !== days[i - 7].getMonth())) months.push([Math.floor(i / 7), fmt(d, { month: 'short' })]); });
    const caption = (i) => { const d = days[i], c = counts[i]; return c == null ? `${fmt(d, { weekday: 'short', month: 'short', day: 'numeric' })}: in the future` : `${fmt(d, { weekday: 'short', month: 'short', day: 'numeric' })}: ${c} session${c === 1 ? '' : 's'}`; };
    el.innerHTML = `<div class="cl-head"><h3 class="cl-title display">Client sessions</h3><span class="muted cl-tz">Last 12 months</span></div>
      <p class="cl-heat-sum"><b class="num">${total}</b> sessions this year · busiest week of ${fmt(days[bestW * 7], { month: 'short', day: 'numeric' })} (<span class="num">${best}</span>)</p>
      <div class="cl-heat-wrap">
        <div class="cl-heat-months" aria-hidden="true">${months.map(([w, m]) => `<span style="grid-column:${w + 1}">${m}</span>`).join('')}</div>
        <div class="cl-heat" role="img" tabindex="0" aria-roledescription="heatmap" aria-label="Sessions per day for the last 12 months. ${total} total. Use arrow keys to read days.">${days.map((d, i) => `<i data-i="${i}" class="l${lvl(counts[i])}${i === active ? ' on' : ''}"></i>`).join('')}</div>
      </div>
      <div class="cl-heat-foot"><span class="cl-heat-cap muted" aria-live="polite">${caption(active)}</span><span class="cl-heat-legend" aria-label="Legend: none, 1 to 2, 3 to 4, 5 to 6, 7 or more">Less ${[0, 1, 2, 3, 4].map((l) => `<i class="l${l}"></i>`).join('')} More</span></div>`;
    const grid = el.querySelector('.cl-heat'), cap = el.querySelector('.cl-heat-cap');
    const set = (i) => { if (i < 0 || i >= days.length) return; grid.children[active].classList.remove('on'); active = i; grid.children[i].classList.add('on'); cap.textContent = caption(i); };
    grid.addEventListener('mouseover', (e) => { const t = e.target.closest('[data-i]'); if (t) set(+t.dataset.i); });
    grid.addEventListener('keydown', (e) => { const m = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 }[e.key]; if (m) { e.preventDefault(); set(active + m); } });
  }

  // ================================================================ 6. Booking slots (real time zones, real .ics)
  function booking(el) {
    const HOST_TZ = 'America/New_York';
    const mine = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const ZONES = [...new Set([mine, 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'])];
    let tz = mine, view = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1), day = null, slot = null, step = 'pick', booked = null, err = {};
    const offset = (date, zone) => { const p = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(date); const g = (t) => +p.find((x) => x.type === t).value; return (Date.UTC(g('year'), g('month') - 1, g('day'), g('hour') % 24, g('minute')) - date.getTime()) / 6e4; };
    const instant = (d, mins, zone) => { const guess = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, mins); return new Date(guess - offset(new Date(guess), zone) * 6e4); };
    const tfmt = (date) => date.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' });
    const dfmt = (date) => date.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric' });
    const zoneName = (z) => { try { return new Intl.DateTimeFormat('en-US', { timeZone: z, timeZoneName: 'short' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName').value; } catch (e) { return z; } };
    const slotsFor = (d) => {
      if (d <= TODAY || d.getDay() % 6 === 0 || d > add(TODAY, 28)) return [];
      const busy = timed(d).map((e) => [e.start - 15, e.start + e.dur + 15]);
      const out = []; for (let m = 9 * 60; m <= 16 * 60 + 30; m += 30) if (!busy.some(([s, e]) => m < e && m + 30 > s)) out.push(m);
      return out;
    };
    function draw(focusSel) {
      const first = weekStart(view), mlabel = fmt(view, { month: 'long', year: 'numeric' });
      const slots = day ? slotsFor(day) : [];
      el.innerHTML = `<div class="cl-book">
        <aside class="cl-book-host">
          <span class="avatar cl-av">AR</span>
          <div><div class="muted">Ava Reyes · Reyes Studio</div><h3 class="cl-title display">Discovery call</h3></div>
          <ul class="cl-book-facts"><li>${icon('clock')}30 minutes</li><li>${icon('video')}Google Meet link in the invite</li><li>${icon('globe')}<label class="vh" for="cl-tz">Time zone</label><select class="select cl-tzsel" id="cl-tz">${ZONES.map((z) => `<option value="${z}" ${z === tz ? 'selected' : ''}>${z.replace(/_/g, ' ')} (${zoneName(z)})${z === mine ? ' · yours' : ''}</option>`).join('')}</select></li></ul>
          <p class="muted cl-small">Fictional host and sample availability. Nothing is booked or sent.</p>
        </aside>
        ${step === 'done' ? `<div class="cl-book-done" tabindex="-1">
            <span class="cl-ok">${icon('check')}</span><h3 class="cl-title display">You're booked</h3>
            <p>${dfmt(booked.start)}<br><b class="num">${tfmt(booked.start)} – ${tfmt(booked.end)}</b> <span class="muted">(${zoneName(tz)})</span></p>
            <p class="muted cl-small">Sample only. In a real app the invite with the Meet link arrives by email and the client card is created in the CRM.</p>
            <div class="cl-row"><button class="btn btn-primary" data-ics>${icon('download')}Add to calendar (.ics)</button><button class="btn" data-again>Book another</button></div></div>`
        : step === 'confirm' ? `<form class="cl-book-form" novalidate>
            <button type="button" class="btn btn-sm btn-ghost" data-back>${icon('chevLeft')}Back</button>
            <div class="cl-book-sum"><b>${dfmt(instant(day, slot, HOST_TZ))}</b><span class="num">${tfmt(instant(day, slot, HOST_TZ))} – ${tfmt(instant(day, slot + 30, HOST_TZ))} (${zoneName(tz)})</span></div>
            <div class="field"><label class="label" for="cl-bn">Your name</label><input class="input" id="cl-bn" name="n" autocomplete="name" ${err.n ? 'aria-invalid="true" aria-describedby="cl-bn-e"' : ''}>${err.n ? `<span class="hint" id="cl-bn-e" style="color:var(--danger)">${err.n}</span>` : ''}</div>
            <div class="field"><label class="label" for="cl-be">Email</label><input class="input" id="cl-be" name="e" type="email" autocomplete="email" ${err.e ? 'aria-invalid="true" aria-describedby="cl-be-e"' : ''}>${err.e ? `<span class="hint" id="cl-be-e" style="color:var(--danger)">${err.e}</span>` : ''}</div>
            <div class="field"><label class="label" for="cl-bt">What should we talk about? <span class="muted">(optional)</span></label><textarea class="textarea" id="cl-bt" rows="2"></textarea></div>
            <button class="btn btn-primary" type="submit">Confirm booking</button></form>`
        : `<div class="cl-book-cal">
            <div class="cl-mini-head"><button class="btn btn-sm btn-icon btn-ghost" data-prev aria-label="Previous month" ${view <= new Date(TODAY.getFullYear(), TODAY.getMonth(), 1) ? 'disabled' : ''}>${icon('chevLeft')}</button><b>${mlabel}</b><button class="btn btn-sm btn-icon btn-ghost" data-next aria-label="Next month">${icon('chevRight')}</button></div>
            <div class="cl-mini-grid"><div class="cl-mini-row dow">${DOW.map((d) => `<span aria-hidden="true">${d.slice(0, 2)}</span>`).join('')}</div>
            ${[0, 1, 2, 3, 4, 5].map((r) => `<div class="cl-mini-row">${Array.from({ length: 7 }, (_, c) => { const d = add(first, r * 7 + c), ok = d.getMonth() === view.getMonth() && slotsFor(d).length;
              return ok ? `<button class="cl-md avail${same(d, day) ? ' start' : ''}" data-day="${key(d)}" aria-pressed="${same(d, day)}" aria-label="${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}, ${slotsFor(d).length} times free"><span class="num">${d.getDate()}</span></button>` : `<span class="cl-md${d.getMonth() !== view.getMonth() ? ' out' : ''}" aria-hidden="true"><span class="num">${d.getDate()}</span></span>`; }).join('')}</div>`).join('')}</div></div>
          <div class="cl-book-slots">${day ? `<h4>${fmt(day, { weekday: 'long', month: 'short', day: 'numeric' })}</h4><div class="cl-slots" role="group" aria-label="Free times">${slots.map((m) => `<button class="btn cl-slot" data-slot="${m}">${tfmt(instant(day, m, HOST_TZ))}</button>`).join('')}</div>` : `<p class="muted">Pick a day with free times. Only open slots are shown, so nothing fails later.</p>`}</div>`}
      </div>`;
      if (focusSel) el.querySelector(focusSel)?.focus();
    }
    function ics() {
      const z = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dashboard Tools//Calendar demo//EN', 'BEGIN:VEVENT', `UID:${booked.uid}`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(booked.start)}`, `DTEND:${z(booked.end)}`, 'SUMMARY:Discovery call with Ava Reyes (sample)', 'DESCRIPTION:Sample booking from the Dashboard Tools calendar demo. Fictional host.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = 'discovery-call-sample.ics'; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
    }
    el.addEventListener('change', (e) => { if (e.target.id === 'cl-tz') { tz = e.target.value; draw('#cl-tz'); } });
    el.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('[data-prev]')) { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); draw('[data-prev]'); }
      else if (t.closest('[data-next]')) { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); draw('[data-next]'); }
      else if (t.closest('[data-day]')) { day = fromKey(t.closest('[data-day]').dataset.day); draw('.cl-slot'); }
      else if (t.closest('[data-slot]')) { slot = +t.closest('[data-slot]').dataset.slot; step = 'confirm'; err = {}; draw('#cl-bn'); }
      else if (t.closest('[data-back]')) { step = 'pick'; draw(`[data-slot="${slot}"]`); }
      else if (t.closest('[data-again]')) { step = 'pick'; day = slot = null; draw(); }
      else if (t.closest('[data-ics]')) ics();
    });
    el.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target, n = f.querySelector('#cl-bn').value.trim(), m = f.querySelector('#cl-be').value.trim();
      err = {}; if (!n) err.n = 'Enter your name so Ava knows who is joining.'; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) err.e = 'Enter an email like name@example.com.';
      if (err.n || err.e) { const keep = { n, m }; draw(err.n ? '#cl-bn' : '#cl-be'); el.querySelector('#cl-bn').value = keep.n; el.querySelector('#cl-be').value = keep.m; return; }
      booked = { start: instant(day, slot, HOST_TZ), end: instant(day, slot + 30, HOST_TZ), uid: `${key(day)}-${slot}-${Math.random().toString(36).slice(2, 8)}@dashboard-tools.sample` };
      step = 'done'; draw('.cl-book-done');
    });
    draw();
  }

  // ================================================================ 7. Week strip (phone)
  function strip(el) {
    let sel = TODAY, from = weekStart(TODAY);
    function draw(focusSel) {
      const days = Array.from({ length: 7 }, (_, i) => add(from, i)), ev = eventsOn(sel);
      el.innerHTML = `<div class="cl-phone"><div class="cl-phone-in">
        <div class="cl-head"><h3 class="cl-title display">${fmt(sel, { month: 'long' })}</h3><div class="cl-nav"><button class="btn btn-sm btn-icon" data-prev aria-label="Previous week">${icon('chevLeft')}</button><button class="btn btn-sm btn-icon" data-next aria-label="Next week">${icon('chevRight')}</button></div></div>
        <div class="cl-strip" role="group" aria-label="Week of ${fmt(days[0], { month: 'long', day: 'numeric' })}">${days.map((d) => `<button class="cl-pill${same(d, TODAY) ? ' today' : ''}" data-k="${key(d)}" aria-pressed="${same(d, sel)}" aria-label="${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}${eventsOn(d).length ? ', has events' : ''}"><span>${DOW[d.getDay()].slice(0, 1)}</span><b class="num">${d.getDate()}</b><i ${eventsOn(d).length ? '' : 'hidden'}></i></button>`).join('')}</div>
        <div class="cl-strip-list" aria-live="polite"><div class="cl-dayag-h">${same(sel, TODAY) ? 'Today' : fmt(sel, { weekday: 'long' })}</div>
          ${ev.length ? ev.map((e) => `<div class="cl-card" style="--c:var(--chart-${e.c})"><span class="num muted">${e.allDay ? 'All day' : `${hm(e.start)} · ${e.dur} min`}</span><b>${esc(e.title)}</b>${e.org ? `<span class="muted">${esc(e.org)}</span>` : ''}</div>`).join('') : `<div class="cl-empty"><p class="muted">Nothing on ${fmt(sel, { weekday: 'long' })}.</p><button class="btn btn-sm" data-sample>${icon('plus')}Add a follow-up</button></div>`}
        </div></div></div>`;
      if (focusSel) el.querySelector(focusSel)?.focus();
    }
    el.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('[data-prev]')) { from = add(from, -7); sel = add(sel, -7); draw('[data-prev]'); }
      else if (t.closest('[data-next]')) { from = add(from, 7); sel = add(sel, 7); draw('[data-next]'); }
      else if (t.closest('[data-k]')) { sel = fromKey(t.closest('[data-k]').dataset.k); draw(`[data-k="${key(sel)}"]`); }
      else if (t.closest('[data-sample]')) { t.closest('[data-sample]').textContent = 'Sample only'; }
    });
    draw();
  }

  // ================================================================ 8. Meeting grid
  function meetgrid(el) {
    let count = 4, me = true, hideOff = false, speaker = 1, mic = true, cam = true, note = '';
    function draw(focusSel) {
      let ppl = PEOPLE.slice(0, count).map((p, i) => ({ name: p[0], org: p[1], i: i + 1, video: rnd(i * 3 + 1) > 0.35 }));
      if (me) ppl = [{ name: 'You', i: 0, video: cam }, ...ppl];
      if (hideOff) ppl = ppl.filter((p) => p.video);
      const n = ppl.length, cols = n <= 1 ? 1 : n <= 4 ? 2 : 3;
      const ini = (s) => s.split(' ').map((w) => w[0]).join('').slice(0, 2);
      el.innerHTML = `<div class="cl-meet">
        <div class="cl-meet-bar">
          <div class="cl-row"><span class="muted">Guests</span><button class="btn btn-sm btn-icon" data-less aria-label="Fewer guests" ${count <= 1 ? 'disabled' : ''}>–</button><b class="num" aria-live="polite">${count}</b><button class="btn btn-sm btn-icon" data-more aria-label="More guests" ${count >= 8 ? 'disabled' : ''}>+</button></div>
          <label class="cl-check"><input type="checkbox" data-me ${me ? 'checked' : ''}> Include me</label>
          <label class="cl-check"><input type="checkbox" data-hide ${hideOff ? 'checked' : ''}> Hide tiles without video</label>
        </div>
        <div class="cl-tiles" style="--cols:${cols}">${n ? ppl.map((p) => `<button class="cl-tile${p.video ? ' video' : ''}" data-sp="${p.i}" aria-pressed="${p.i === speaker}" style="--c:var(--chart-${(p.i % 5) + 1})" aria-label="${esc(p.name)}${p.video ? '' : ', camera off'}${p.i === speaker ? ', speaking' : ''}. Click to mark as speaker."><span class="cl-tile-av">${ini(p.name)}</span><span class="cl-tile-name">${esc(p.name)}${p.i === speaker ? ' · speaking' : ''}</span></button>`).join('') : '<p class="muted cl-tiles-empty">Nobody has video on.</p>'}</div>
        <div class="cl-meet-ctl" role="toolbar" aria-label="Call controls">
          <button class="btn btn-icon" data-mic aria-pressed="${!mic}" aria-label="${mic ? 'Mute microphone' : 'Unmute microphone'}">${icon('mic')}</button>
          <button class="btn btn-icon" data-cam aria-pressed="${!cam}" aria-label="${cam ? 'Turn camera off' : 'Turn camera on'}">${icon('video')}</button>
          <button class="btn btn-icon" data-share aria-label="Share screen">${icon('screen')}</button>
          <button class="btn btn-danger" data-leave>Leave call</button>
          <span class="muted cl-small" aria-live="polite">${note}</span>
        </div></div>`;
      if (focusSel) el.querySelector(focusSel)?.focus();
    }
    el.addEventListener('click', (e) => {
      const t = e.target; note = '';
      if (t.closest('[data-less]')) { count--; draw('[data-less]'); }
      else if (t.closest('[data-more]')) { count++; draw('[data-more]'); }
      else if (t.closest('[data-sp]')) { speaker = +t.closest('[data-sp]').dataset.sp; draw(`[data-sp="${speaker}"]`); }
      else if (t.closest('[data-mic]')) { mic = !mic; note = mic ? 'Microphone on' : 'Microphone muted'; draw('[data-mic]'); }
      else if (t.closest('[data-cam]')) { cam = !cam; note = cam ? 'Camera on' : 'Camera off'; draw('[data-cam]'); }
      else if (t.closest('[data-share]')) { note = 'Sample: screen sharing would start here.'; draw('[data-share]'); }
      else if (t.closest('[data-leave]')) { note = 'Sample: you would leave the call.'; draw('[data-leave]'); }
    });
    el.addEventListener('change', (e) => { if (e.target.matches('[data-me]')) { me = e.target.checked; draw('[data-me]'); } if (e.target.matches('[data-hide]')) { hideOff = e.target.checked; draw('[data-hide]'); } });
    draw();
  }

  const WIDGETS = { month, week, agenda, picker, heatmap, booking, strip, meetgrid };
  const DEFAULT_THEME = { month: 'atelier', week: 'midnight', agenda: 'linen', picker: 'coastal', heatmap: 'grove', booking: 'blush', strip: 'noir', meetgrid: 'aurora' };
  const WIDE = new Set(['week', 'booking', 'heatmap', 'meetgrid']);

  // ================================================================ integration snippets
  const SNIPPETS = [
    ['push', 'Push, not polling', `// Google tells you when anything changes. Renew the channel daily (Vercel Cron).
await calendar.events.watch({
  calendarId: 'primary',
  requestBody: {
    id: crypto.randomUUID(),
    type: 'web_hook',
    address: 'https://yourapp.com/api/calendar/webhook',
    token: perUserSecret, // checked on every webhook call
  },
});`],
    ['sync', 'Incremental sync', `// On webhook, on open and on visibilitychange: fetch only what changed.
const res = await calendar.events.list({
  calendarId: 'primary',
  syncToken: conn.sync_token,   // 410 Gone → clear it and do a full sync
  showDeleted: true,
});
await upsertMeetings(res.data.items);           // match on iCalUID
await saveSyncToken(res.data.nextSyncToken);`],
    ['meet', 'Event + Meet link', `// Only after the person approved the proposed booking.
await calendar.events.insert({
  calendarId: 'primary',
  conferenceDataVersion: 1,
  sendUpdates: 'all',
  requestBody: {
    summary: 'Discovery call · Harbor & Pine Interiors',
    start: { dateTime: '2026-11-18T15:00:00', timeZone: 'America/New_York' },
    end:   { dateTime: '2026-11-18T15:30:00', timeZone: 'America/New_York' },
    iCalUID: meeting.ical_uid,
    conferenceData: { createRequest: { requestId: meeting.id,
      conferenceSolutionKey: { type: 'hangoutsMeet' } } },
  },
});`],
    ['ics', 'Subscribe feed (ICS)', `// app/api/calendar/[token]/route.ts · read-only, works in every calendar app
import ical from 'ical-generator';
export async function GET(_req, { params }) {
  const owner = await ownerForFeedToken(params.token); // long random token
  if (!owner) return new Response('Not found', { status: 404 });
  const cal = ical({ name: 'Follow-ups' });
  for (const m of await meetingsFor(owner))
    cal.createEvent({ id: m.ical_uid, start: m.starts_at, end: m.ends_at, summary: m.title });
  return new Response(cal.toString(), { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}`],
  ];

  const KICKOFF = `Add calendar features to <project> using the Dashboard Tools calendar hub.
1. Read docs/calendars/README.md and answer its four questions for this project.
2. Pick one style per screen from catalog/calendars.json (styles) and follow docs/calendars/02-calendar-ui-rules.md.
3. For sync, booking, ICS or Meet links follow docs/calendars/01-integration-playbook.md step by step.
4. Only use repos whose license_class allows it (no copyleft code in a closed app, look-only repos are ideas only).
5. No polling: push channels, webhooks, refetch on open and visibilitychange.
6. Any agent action that books, moves or cancels stops for my approval.
Show me the plan (approach, styles, repos, data model changes) before building.`;

  // ================================================================ page
  function render(main, opts) {
    cleanups.splice(0).forEach((f) => f());
    const C = window.CALENDARS, themes = opts.themes;
    const lic = Object.fromEntries(C.licenses.map((l) => [l.id, l]));
    const plat = Object.fromEntries(C.platforms.map((p) => [p.id, p.name]));
    const cat = Object.fromEntries(C.categories.map((c) => [c.id, c]));
    const styleName = Object.fromEntries(C.styles.map((s) => [s.id, s.name]));
    const repoById = Object.fromEntries(C.repos.map((r) => [r.id, r]));
    const userCount = C.repos.filter((r) => r.source === 'user').length;
    const themeOpts = (sel, mixed) => `${mixed ? `<option value="mixed" ${sel === 'mixed' ? 'selected' : ''}>Mixed: each card its own</option>` : ''}${['classic', 'cinematic'].map((fam) => `<optgroup label="${fam === 'cinematic' ? 'Cinematic glass' : 'Classic'}">${themes.filter((t) => (t.family || 'classic') === fam).map((t) => `<option value="${t.id}" ${t.id === sel ? 'selected' : ''}>${t.name}</option>`).join('')}</optgroup>`).join('')}`;
    const SECTIONS = [['styles', 'Styles'], ['decide', 'Choose an approach'], ['directory', 'Repo directory'], ['integrate', 'Integrate'], ['agents', 'For AI agents']];
    const ghLabel = (u) => (u.includes('github.com') ? 'GitHub' : 'Docs');

    main.innerHTML = `
      <div class="s-wrap"><div class="s-pagehead" style="padding-bottom:16px"><div>
        <p class="s-eyebrow">Calendars · ${C.repos.length} repos & APIs · ${C.styles.length} styles · ${themes.length} themes</p>
        <h1 class="s-h1" style="font-size:clamp(36px,5vw,56px)">Every way to put time on a screen</h1>
        <p class="s-lead">Eight calendar styles you can try in any theme, a guide to choosing between a UI library, the Google API, an agent connector or an ICS feed, and a vetted directory of calendar repos with licenses and how to integrate each one. Agents read the same thing from <code>catalog/calendars.json</code>.</p></div>
        <div class="cx-head-actions"><a class="s-btn" href="#/docs/docs/calendars/README.md">${icon('book')}Calendar hub</a><a class="s-btn" href="#/docs/docs/calendars/01-integration-playbook.md">${icon('plug')}Integration playbook</a></div></div></div>
      <div class="sc-nav"><div class="sc-nav-in"><div class="sc-nav-links">${SECTIONS.map(([id, l]) => `<button data-cx-jump="${id}">${l}</button>`).join('')}</div>
        <label class="s-small" style="display:flex;gap:8px;align-items:center">Themes <select class="s-select" data-cx-theme>${themeOpts('mixed', true)}</select></label></div></div>

      <section class="sc-sec" id="cx-styles" aria-labelledby="cx-h-styles"><div class="s-wrap">
        <div class="sc-head"><div><p class="s-eyebrow">Eight styles</p><h2 class="s-h2" id="cx-h-styles">Calendar styles, live</h2><p class="s-lead">Each card is working code built only from the design tokens, so any theme applies. Change one card's theme, or set all of them from the bar above. Sample people and businesses are fictional.</p></div>
          <ul class="sc-rules"><li>One style per screen, named like a page pattern</li><li>Keyboard: arrows, Home/End, PageUp/PageDown, Enter</li><li>Event colors from chart tokens, contrast checked in every theme</li><li>No polling; the now-line pauses offscreen</li></ul></div>
        <div class="cx-styles">${C.styles.map((s) => { const repos = C.repos.filter((r) => r.styles.includes(s.id)); return `
          <article class="cx-style${WIDE.has(s.id) ? ' wide' : ''}" id="cx-style-${s.id}">
            <header class="cx-style-head"><div><h3 class="s-h3">${s.name}</h3><p class="s-muted s-small">${esc(s.summary)}</p></div>
              <label class="cx-theme-pick"><span class="vh">Theme for ${s.name}</span><select class="s-select" data-card-theme="${s.id}">${themeOpts(DEFAULT_THEME[s.id])}</select></label></header>
            <div class="cl-stage themed" data-theme="${DEFAULT_THEME[s.id]}" data-cl="${s.id}"></div>
            <footer class="cx-style-foot"><div><b>Use for</b> ${esc(s.use_when.join(' · '))}</div><div><b>Not for</b> ${esc(s.avoid_when.join(' · '))}</div>
              ${repos.length ? `<div class="cx-chips"><b>Seen in</b>${repos.map((r) => `<button class="s-chipbtn" data-repo="${r.id}">${esc(r.name)}</button>`).join('')}</div>` : ''}</footer>
          </article>`; }).join('')}</div>
      </div></section>

      <section class="sc-sec" id="cx-decide" aria-labelledby="cx-h-decide"><div class="s-wrap">
        <div class="sc-head"><div><p class="s-eyebrow">Choose</p><h2 class="s-h2" id="cx-h-decide">Which approach fits?</h2><p class="s-lead">Most products need one or two of these, not all. Start at the top: if events must land in a real calendar, that decides the backend; the UI comes after.</p></div>
          <div class="cx-crm s-panel"><b>Default for a small-business CRM</b><ol><li>v1: Agenda card on Today + date picker for follow-ups</li><li>v1.5: Add to calendar (.ics) and a private subscribe feed</li><li>v2: Google two-way sync, Meet links, booking page → new client by webhook</li><li>Agent: Google Calendar connector, proposals only</li></ol></div></div>
        <div class="cx-approaches">${C.approaches.map((a, i) => `<article class="s-panel cx-appr"><div class="cx-appr-top"><span class="cx-n num">${i + 1}</span><h3 class="s-h3">${a.name}</h3><span class="s-tag">effort: ${a.effort}</span></div>
          <p class="s-small"><b>Use when</b> ${esc(a.when)}</p><p class="s-small s-muted"><b>Not when</b> ${esc(a.not_when)}</p>
          <div class="cx-chips">${a.picks.map((p) => `<button class="s-chipbtn" data-repo="${p}">${esc(repoById[p].name)}</button>`).join('')}</div></article>`).join('')}</div>
      </div></section>

      <section class="sc-sec" id="cx-directory" aria-labelledby="cx-h-directory"><div class="s-wrap">
        <div class="sc-head"><div><p class="s-eyebrow">Directory</p><h2 class="s-h2" id="cx-h-directory">${C.repos.length} calendar repos and APIs</h2><p class="s-lead">${userCount} from your list, plus ${C.repos.length - userCount} the toolkit adds for gaps (web scheduling, ICS, recurrence, booking). Each has a license class: what you're allowed to do with it.</p></div>
          <ul class="cx-liclegend">${C.licenses.map((l) => `<li><span class="cx-lic ${l.id}">${l.name}</span>${esc(l.meaning)}</li>`).join('')}</ul></div>
        <div class="cx-filters">
          <div class="s-search">${icon('search')}<label class="vh" for="cx-q">Search calendar repos</label><input id="cx-q" type="search" placeholder="Search repos, platforms, uses…"></div>
          <div class="s-pills" role="group" aria-label="Category"><button class="s-pill" aria-pressed="true" data-cat="">All</button>${C.categories.map((c) => `<button class="s-pill" aria-pressed="false" data-cat="${c.id}">${c.name}</button>`).join('')}</div>
          <div class="cx-selects"><label class="s-small">Platform <select class="s-select" data-plat><option value="">Any</option>${C.platforms.map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}</select></label>
            <label class="s-small">License <select class="s-select" data-lic><option value="">Any</option>${C.licenses.map((l) => `<option value="${l.id}">${l.name}</option>`).join('')}</select></label>
            <label class="s-small">Source <select class="s-select" data-src><option value="">All</option><option value="user">Your list</option><option value="added">Added by the toolkit</option></select></label></div>
        </div>
        <p class="s-results-meta" data-cx-meta aria-live="polite"></p>
        <div class="cx-repos" data-cx-repos></div>
      </div></section>

      <section class="sc-sec" id="cx-integrate" aria-labelledby="cx-h-integrate"><div class="s-wrap">
        <div class="sc-head"><div><p class="s-eyebrow">Architecture</p><h2 class="s-h2" id="cx-h-integrate">How a calendar plugs in</h2><p class="s-lead">Your database is the source of truth; external calendars are mirrors kept in step by push, never by polling. Agents propose; people approve.</p></div>
          <ul class="sc-rules"><li>UTC instant + IANA zone on every event</li><li>Store the repeat rule, expand the visible range</li><li>Stable iCalUID so updates replace, not duplicate</li><li>OAuth, minimal scopes, encrypted refresh tokens</li></ul></div>
        <div class="cx-flows">
          ${[
            ['Two-way sync', [['Google · Outlook · CalDAV', 'provider'], ['push: watch channel / subscription', 'arrow'], ['/api/calendar/webhook', 'route'], ['incremental sync (sync token)', 'arrow'], ['meetings table · Postgres + RLS', 'db'], ['realtime / refetch on open', 'arrow'], ['Month · Week · Agenda views', 'ui']]],
            ['Agent', [['AI agent + calendar connector', 'agent'], ['proposes a booking', 'arrow'], ['Approval gate: a person says yes', 'gate'], ['approved', 'arrow'], ['Calendar API · invite + Meet link', 'provider']]],
            ['Booking & feeds', [['Booking page (Cal.com embed)', 'ui'], ['webhook: booking created', 'arrow'], ['client + meeting rows', 'db'], ['signed feed URL', 'arrow'], ['Any calendar app subscribes (.ics)', 'provider']]],
          ].map(([t, steps]) => `<div class="cx-flow"><b class="cx-flow-t">${t}</b><ol>${steps.map(([s, k]) => k === 'arrow' ? `<li class="cx-arrow"><span>${esc(s)}</span></li>` : `<li class="cx-node ${k}">${esc(s)}</li>`).join('')}</ol></div>`).join('')}
        </div>
        <div class="cx-code s-panel">
          <div class="cx-tabs" role="tablist" aria-label="Integration snippets">${SNIPPETS.map(([id, l], i) => `<button role="tab" id="cx-tab-${id}" aria-controls="cx-pane" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-snip="${id}">${l}</button>`).join('')}</div>
          <div class="cx-pane" id="cx-pane" role="tabpanel" aria-labelledby="cx-tab-${SNIPPETS[0][0]}"><button class="s-btn s-btn-sm cx-copy" data-copy-snip>${icon('copy')}Copy</button><pre class="cx-pre"><code data-snip-code>${esc(SNIPPETS[0][2])}</code></pre></div>
          <p class="s-small s-muted" style="margin:12px 0 0">Full walkthrough with the data model, Outlook, CalDAV, booking webhooks and a done checklist: <a class="s-link" href="#/docs/docs/calendars/01-integration-playbook.md">integration playbook</a>.</p>
        </div>
      </div></section>

      <section class="sc-sec" id="cx-agents" aria-labelledby="cx-h-agents"><div class="s-wrap">
        <div class="sc-head"><div><p class="s-eyebrow">For AI agents</p><h2 class="s-h2" id="cx-h-agents">Hand this to any agent</h2><p class="s-lead">Everything on this page is in the repo as plain files. Paste the prompt into Claude (or any agent with repo access) and it will plan calendar features the same way.</p></div></div>
        <div class="s-grid s-grid-2">
          <div class="s-panel"><h3 class="s-h3">Read in this order</h3><ol class="cx-files">
            <li><a class="s-link" href="#/docs/docs/calendars/README.md">docs/calendars/README.md</a><span class="s-muted s-small">Four questions → approach, styles, licenses, hard rules</span></li>
            <li><code>catalog/calendars.json</code><span class="s-muted s-small">Repos with use / avoid / integrate, styles, approaches. Machine-readable</span></li>
            <li><a class="s-link" href="#/docs/docs/calendars/02-calendar-ui-rules.md">docs/calendars/02-calendar-ui-rules.md</a><span class="s-muted s-small">Rules for each of the eight styles, theming third-party calendars</span></li>
            <li><a class="s-link" href="#/docs/docs/calendars/01-integration-playbook.md">docs/calendars/01-integration-playbook.md</a><span class="s-muted s-small">Data model, Google sync, push, Meet, ICS, booking, agents</span></li>
            <li><a class="s-link" href="#/tools">Tools → Calendars & Scheduling</a><span class="s-muted s-small">Installable tools and connectors with routing tiers</span></li></ol></div>
          <div class="s-panel"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h3 class="s-h3">Kickoff prompt</h3><button class="s-btn s-btn-sm" data-copy-kick>${icon('copy')}Copy</button></div><pre class="cx-pre wrap">${esc(KICKOFF)}</pre></div>
        </div>
      </div></section>`;

    // ---- widgets
    main.querySelectorAll('[data-cl]').forEach((el) => WIDGETS[el.dataset.cl](el));
    main.querySelector('[data-cx-theme]').addEventListener('change', (e) => {
      const v = e.target.value;
      main.querySelectorAll('[data-card-theme]').forEach((s) => { const t = v === 'mixed' ? DEFAULT_THEME[s.dataset.cardTheme] : v; s.value = t; main.querySelector(`[data-cl="${s.dataset.cardTheme}"]`).dataset.theme = t; });
      if (v !== 'mixed' && opts.onTheme) opts.onTheme(v);
    });
    main.addEventListener('change', (e) => { const s = e.target.closest('[data-card-theme]'); if (s) main.querySelector(`[data-cl="${s.dataset.cardTheme}"]`).dataset.theme = s.value; });

    // ---- directory
    const st = { q: '', cat: '', plat: '', lic: '', src: '' };
    const statusTag = { active: 'Active', stable: 'Stable', stale: 'Stale', retired: 'Retired' };
    function drawRepos() {
      const q = st.q.toLowerCase();
      const list = C.repos.filter((r) => (!st.cat || r.category === st.cat) && (!st.plat || r.platforms.includes(st.plat)) && (!st.lic || r.license_class === st.lic) && (!st.src || r.source === st.src)
        && (!q || [r.name, r.summary, r.language, ...r.use_when, ...r.platforms.map((p) => plat[p])].join(' ').toLowerCase().includes(q)));
      main.querySelector('[data-cx-meta]').textContent = `${list.length} of ${C.repos.length} shown`;
      main.querySelector('[data-cx-repos]').innerHTML = list.length ? list.map((r) => `
        <article class="s-panel cx-repo" id="cx-repo-${r.id}" tabindex="-1">
          <div class="cx-repo-top"><h3 class="s-h3">${esc(r.name)}</h3><a class="s-link s-small" href="${r.repo}" target="_blank" rel="noopener">${ghLabel(r.repo)} ↗</a></div>
          <div class="cx-meta"><span class="cx-lic ${r.license_class}" title="${esc(lic[r.license_class].meaning)}">${esc(r.license)}</span><span class="cx-status ${r.status}">${statusTag[r.status]}</span><span class="s-tag">${esc(cat[r.category].name)}</span>${r.platforms.map((p) => `<span class="s-tag">${esc(plat[p])}</span>`).join('')}${r.source === 'user' ? '<span class="s-tag cx-src">Your list</span>' : ''}</div>
          <p class="s-small">${esc(r.summary)}</p>
          <p class="s-small cx-lesson"><b>Lesson</b> ${esc(r.learn_from)}</p>
          ${r.styles.length ? `<div class="cx-chips"><b>Styles</b>${r.styles.map((s) => `<button class="s-chipbtn" data-style="${s}">${esc(styleName[s])}</button>`).join('')}</div>` : ''}
          <details><summary>Use, avoid, integrate</summary>
            <div class="cx-uai"><div><b>Use when</b><ul class="use">${r.use_when.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div><b>Avoid when</b><ul class="avoid">${r.avoid_when.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
            <div><b>How to integrate</b><ol>${r.integrate.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div></div>
            <p class="s-small s-muted">${esc(r.language)}${r.last_commit ? ` · last commit ${r.last_commit}` : ''}${r.tool_id ? ` · <a class="s-link" href="#/tools/${r.tool_id}">catalog entry</a>` : ''}</p>
          </details>
        </article>`).join('') : `<div class="s-empty">No repos match. <button class="s-btn s-btn-sm" data-reset>Clear filters</button></div>`;
    }
    drawRepos();
    const resetFilters = () => { Object.assign(st, { q: '', cat: '', plat: '', lic: '', src: '' }); main.querySelector('#cx-q').value = ''; main.querySelectorAll('[data-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === ''))); ['plat', 'lic', 'src'].forEach((k) => (main.querySelector(`[data-${k}]`).value = '')); drawRepos(); };
    main.querySelector('#cx-q').addEventListener('input', (e) => { st.q = e.target.value; drawRepos(); });
    ['plat', 'lic', 'src'].forEach((k) => main.querySelector(`[data-${k}]`).addEventListener('change', (e) => { st[k] = e.target.value; drawRepos(); }));

    // ---- clicks (jumps, filters, tabs, copy)
    const jump = (el) => { el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); };
    main.addEventListener('click', (e) => {
      const t = e.target;
      const j = t.closest('[data-cx-jump]'); if (j) { jump(document.getElementById('cx-' + j.dataset.cxJump)); return; }
      const c = t.closest('[data-cat]'); if (c) { st.cat = c.dataset.cat; main.querySelectorAll('[data-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b === c))); drawRepos(); return; }
      if (t.closest('[data-reset]')) { resetFilters(); return; }
      const r = t.closest('[data-repo]'); if (r) { if (!main.querySelector(`#cx-repo-${r.dataset.repo}`)) resetFilters(); const card = main.querySelector(`#cx-repo-${r.dataset.repo}`); card.querySelector('details').open = true; jump(card); card.classList.add('flash'); setTimeout(() => card.classList.remove('flash'), 1600); card.focus({ preventScroll: true }); return; }
      const s = t.closest('[data-style]'); if (s) { const card = main.querySelector(`#cx-style-${s.dataset.style}`); jump(card); return; }
      const sn = t.closest('[data-snip]'); if (sn) { selectTab(sn); return; }
      if (t.closest('[data-copy-snip]')) { copyText(main.querySelector('[data-snip-code]').textContent); return; }
      if (t.closest('[data-copy-kick]')) copyText(KICKOFF);
    });
    function selectTab(btn) {
      main.querySelectorAll('[data-snip]').forEach((b) => { const on = b === btn; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
      main.querySelector('#cx-pane').setAttribute('aria-labelledby', btn.id);
      main.querySelector('[data-snip-code]').textContent = SNIPPETS.find(([id]) => id === btn.dataset.snip)[2];
    }
    main.querySelector('.cx-tabs').addEventListener('keydown', (e) => {
      const tabs = [...main.querySelectorAll('[data-snip]')], i = tabs.indexOf(document.activeElement);
      const n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
      if (n >= 0) { e.preventDefault(); tabs[n].focus(); selectTab(tabs[n]); }
    });
    async function copyText(text) {
      try { await navigator.clipboard.writeText(text); } catch (err) { const ta = document.createElement('textarea'); ta.value = text; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      const n = document.createElement('div'); n.className = 's-toast'; n.setAttribute('role', 'status'); n.textContent = 'Copied to clipboard'; document.body.append(n); setTimeout(() => n.remove(), 1800);
    }
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) main.querySelectorAll('[data-cx-jump]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.cxJump === en.target.id.slice(3)))); }), { rootMargin: '-45% 0px -50% 0px' });
    main.querySelectorAll('.sc-sec').forEach((s) => io.observe(s)); onCleanup(() => io.disconnect());
  }

  window.Calendars = { render, destroy: () => cleanups.splice(0).forEach((f) => f()) };
})();
