/* Pearlwell Dental: clay tooth/arch media, booking, multipage + motion. Sample data only. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = $('[data-db-app]') || document.body;
  const ICON = {
    tooth: '<path d="M7.5 3C5 3 3.5 5 4 8c.4 2.5 1 3.5 1.5 6.5S6.5 21 8 21s1.5-5 4-5 2.5 5 4 5 2-3.5 2.5-6.5S19.6 10.5 20 8c.5-3-1-5-3.5-5-1.8 0-2.8 1-4.5 1s-2.7-1-4.5-1z"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
    file: '<path d="M6 2.5h8l5 5V21a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5z"/><path d="M14 2.5V8h5M9 13h6M9 17h6"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    chevLeft: '<path d="m15 18-6-6 6-6"/>',
    chevRight: '<path d="m9 6 6 6-6 6"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
    cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17h.01"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  };
  const svg = (n, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n] || ''}</svg>`;
  const paintIcons = (host = document) => $$('[data-icon]', host).forEach((el) => { el.innerHTML = svg(el.dataset.icon); });
  const fmtNum = (v) => v.toLocaleString('en-US');
  const dayOffset = (n) => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate() + n); };
  const fmtDate = (d, o = { month: 'short', day: 'numeric' }) => d.toLocaleDateString('en-US', o);

  function seg(group, onChange) {
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      $$('button[data-v]', group).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onChange(b.dataset.v, b);
    });
  }
  function donut(parts, { size = 120, w = 14, gap = 1.5, round = false } = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0), r = (size - w) / 2, c = size / 2; let off = 0;
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}"/>${parts.map((p) => {
      const len = (p.value / total) * 100;
      const seg = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke-width="${w}" pathLength="100" stroke-dasharray="${Math.max(0.01, len - gap).toFixed(2)} ${(100 - len + gap).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${c} ${c})" style="stroke:var(${p.color})"${round ? ' stroke-linecap="round"' : ''}/>`;
      off += len; return seg;
    }).join('')}</svg>`;
  }
  function countUp(el, to, { duration = 700, format = (n) => String(Math.round(n)) } = {}) {
    if (reduce) { el.textContent = format(to); return; }
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = format((1 - Math.pow(1 - t, 3)) * to);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function toast(msg) {
    const t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._id);
    toast._id = setTimeout(() => { t.hidden = true; }, 2200);
  }

  paintIcons();

  const PROP = {
    brush: `<svg viewBox="0 0 48 72" aria-hidden="true"><rect x="18" y="4" width="12" height="28" rx="4" fill="var(--accent)"/><rect x="16" y="30" width="16" height="34" rx="6" fill="var(--surface)" stroke="var(--border)" stroke-width="2"/><rect x="20" y="36" width="8" height="18" rx="2" fill="var(--peach)"/></svg>`,
    mirror: `<svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="22" cy="22" r="16" fill="var(--surface)" stroke="var(--accent)" stroke-width="3"/><circle cx="22" cy="22" r="10" fill="var(--accent-soft)"/><path d="M34 34l14 14" stroke="var(--text-muted)" stroke-width="4" stroke-linecap="round"/></svg>`,
  };
  $$('[data-prop]').forEach((el) => { el.innerHTML = PROP[el.dataset.prop] || ''; });

  const DOCS = [
    { id: 'mo', name: 'Dr. Mira Okafor', role: 'General dentist', ini: 'MO' },
    { id: 'lv', name: 'Dr. Luca Varga', role: 'Orthodontist', ini: 'LV' },
  ];
  const TREAT = [
    { cat: 'General', icon: 'sparkle', name: 'Check-up and clean', d: 'Exam, scale and polish', p: 85 },
    { cat: 'General', icon: 'tooth', name: 'Filling', d: 'Tooth-coloured composite', p: 140 },
    { cat: 'Cosmetic', icon: 'smile', name: 'Whitening', d: 'Two in-chair sessions', p: 320 },
    { cat: 'Cosmetic', icon: 'sparkle', name: 'Bonding', d: 'Repair chips and gaps', p: 260 },
    { cat: 'Ortho', icon: 'shield', name: 'Clear aligners', d: 'Twelve-month plan', p: 2900 },
    { cat: 'Surgery', icon: 'cross', name: 'Implant', d: 'Post, crown and fitting', p: 1950 },
  ];
  const CATS = ['All', 'General', 'Cosmetic', 'Ortho', 'Surgery'];
  const SLOTS = ['9:00', '9:45', '10:30', '11:15', '1:30', '2:15', '3:00', '3:45', '4:30'];
  const TEETH = { 3: 'Small cavity found at your last visit. A filling is advised.', 12: 'Worn edge. Watch for sensitivity.', 22: 'Old filling in good condition.' };
  const QUICK = [
    { id: 'book', name: 'Book', icon: 'calendar', hash: 'overview' },
    { id: 'find', name: 'Find dentist', icon: 'search', hash: 'appointments' },
    { id: 'treat', name: 'Treatment', icon: 'sparkle', hash: 'overview' },
    { id: 'er', name: 'Emergency', icon: 'alert', hash: 'appointments' },
  ];
  const today = dayOffset(0);
  const upcoming = { date: dayOffset(9), time: '10:30', doc: 'mo', what: 'Check-up and clean' };
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let pick = (() => {
    let d = dayOffset(1);
    while (d.getDay() === 0) d = dayOffset(Math.round((d - today) / 864e5) + 1);
    return d.getMonth() === today.getMonth() ? d : null;
  })();
  let slot = '', doc = 'mo', cat = 'All', tooth = 3;
  const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
  const taken = (d) => SLOTS.filter((_, i) => (d.getDate() * 7 + i * 3) % 5 === 0);
  const greet = () => {
    const h = new Date().getHours();
    return `${h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}, Theo`;
  };

  function renderQuick() {
    $('[data-quick]').innerHTML = QUICK.map((q) =>
      `<button type="button" class="pd-qbtn" data-quick-id="${q.id}" data-hash="${q.hash}"><span>${svg(q.icon)}</span>${q.name}</button>`
    ).join('');
  }
  function renderNext() {
    const u = upcoming, dr = DOCS.find((x) => x.id === u.doc);
    $('[data-next]').innerHTML = `<h3>${dr.name}</h3><p>${u.what} · ${dr.role}</p><p class="pd-when num">${fmtDate(u.date, { weekday: 'long', month: 'long', day: 'numeric' })} · ${u.time}${+u.time.split(':')[0] < 8 ? ' pm' : ' am'}</p>
      <div class="pd-acts"><button type="button" data-resched>Reschedule</button><button type="button" data-addcal>Add to calendar</button></div>`;
  }
  function renderScore() {
    const s = 85;
    $('[data-ring]').innerHTML = `<div role="img" aria-label="Dental health score ${s}%">${donut([{ value: s, color: '--accent' }, { value: 100 - s, color: '--surface-2' }], { size: 96, w: 10, gap: 0, round: true })}</div><b class="num" data-score>${s}%</b>`;
    $('[data-score-note]').innerHTML = '<b>Doing well</b>Brushing is consistent. One small cavity to fix this month.';
    if (!reduce) {
      const el = $('[data-score]');
      if (el) countUp(el, s, { format: (n) => `${Math.round(n)}%` });
    }
  }
  function renderCal() {
    const y = view.getFullYear(), m = view.getMonth();
    const first = (new Date(y, m, 1).getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    $('[data-month]').textContent = fmtDate(view, { month: 'long', year: 'numeric' });
    $('[data-mon="-1"]').disabled = y === today.getFullYear() && m === today.getMonth();
    $('[data-cal]').innerHTML = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => `<span class="dow" aria-hidden="true">${d}</span>`).join('')
      + '<span></span>'.repeat(first)
      + Array.from({ length: days }, (_, i) => {
        const d = new Date(y, m, i + 1);
        const off = (d < today && !sameDay(d, today)) || d.getDay() === 0;
        return `<button type="button" data-day="${i + 1}" class="num${sameDay(d, today) ? ' today' : ''}" aria-pressed="${sameDay(d, pick)}" aria-label="${fmtDate(d, { weekday: 'long', month: 'long', day: 'numeric' })}${off ? ', closed' : ''}"${off ? ' disabled' : ''}>${i + 1}</button>`;
      }).join('');
    renderSlots();
  }
  function renderSlots() {
    const t = pick ? taken(pick) : [];
    $('[data-slots]').innerHTML = SLOTS.map((s) =>
      `<button type="button" class="num${t.includes(s) ? ' taken' : ''}" data-slot="${s}" aria-pressed="${s === slot}"${t.includes(s) ? ` disabled aria-label="${s}, taken"` : pick ? '' : ' disabled'}>${s}</button>`
    ).join('');
    $('[data-docs]').innerHTML = DOCS.map((d) =>
      `<button type="button" data-doc="${d.id}" aria-pressed="${d.id === doc}"><i>${d.ini}</i><span>${d.name}<small>${d.role}</small></span></button>`
    ).join('');
    $('[data-confirm]').disabled = !(pick && slot);
    if (!pick) $('[data-msg]').textContent = 'Pick a day to see open times.';
    else if (!slot) $('[data-msg]').textContent = `${fmtDate(pick, { weekday: 'long', day: 'numeric', month: 'short' })}: pick a time.`;
  }
  function renderTreat() {
    const q = $('[data-q]').value.trim().toLowerCase();
    const list = TREAT.filter((t) => (cat === 'All' || t.cat === cat) && (!q || (t.name + t.d).toLowerCase().includes(q)));
    $('[data-cats]').innerHTML = CATS.map((c) => `<button type="button" data-v="${c}" aria-pressed="${c === cat}">${c}</button>`).join('');
    $('[data-treat]').innerHTML = list.length
      ? list.map((t) => `<li><span>${svg(t.icon)}</span><span><b>${t.name}</b><small>${t.d}</small></span><span class="num">$${fmtNum(t.p)}</span></li>`).join('')
      : `<li class="pd-none">No treatments match “${q}”. Try another word or pick All.</li>`;
  }
  function renderArch() {
    const pts = Array.from({ length: 28 }, (_, i) => {
      const up = i < 14, k = up ? i : i - 14;
      const a = Math.PI * (0.08 + (k / 13) * 0.84), rx = 130, ry = up ? 96 : 84;
      return [165 - rx * Math.cos(a), up ? 118 - ry * Math.sin(a) : 142 + ry * Math.sin(a), up];
    });
    $('[data-arch]').innerHTML = `<svg viewBox="0 0 330 250" role="group" aria-label="Tooth chart, 28 teeth"><path d="M30,120 C40,0 290,0 300,120 Z M30,140 C40,250 290,250 300,140 Z" fill="var(--gum)" opacity="0.35"/>`
      + pts.map(([x, y], i) => `<g class="t${TEETH[i] ? ' watch' : ''}" tabindex="0" role="button" data-t="${i}" aria-pressed="${i === tooth}" aria-label="Tooth ${i + 1}${TEETH[i] ? ', has a note' : ''}"><path d="M${(x - 9).toFixed(1)},${(y - 9).toFixed(1)} q9,-5 18,0 q3,9 0,18 q-9,5 -18,0 q-3,-9 0,-18 Z"/></g>`).join('')
      + '</svg>';
    $('[data-tooth-note]').innerHTML = `<b>Tooth ${tooth + 1}.</b> ${TEETH[tooth] || 'Healthy. Nothing to do.'}`;
  }

  $('[data-greet]').textContent = greet();
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, .t'); if (!t) return;
    if (t.dataset.mon) { view = new Date(view.getFullYear(), view.getMonth() + +t.dataset.mon, 1); renderCal(); }
    else if (t.dataset.day) { pick = new Date(view.getFullYear(), view.getMonth(), +t.dataset.day); slot = ''; renderCal(); $(`[data-day="${t.dataset.day}"]`)?.focus(); }
    else if (t.dataset.slot) { slot = t.dataset.slot; renderSlots(); $(`[data-slot="${slot}"]`)?.focus(); $('[data-msg]').textContent = ''; }
    else if (t.dataset.doc) { doc = t.dataset.doc; renderSlots(); $(`[data-doc="${doc}"]`)?.focus(); }
    else if ('confirm' in t.dataset) {
      Object.assign(upcoming, { date: pick, time: slot, doc });
      renderNext();
      const m = `Booked: ${fmtDate(pick, { weekday: 'long', month: 'long', day: 'numeric' })} at ${slot} with ${DOCS.find((x) => x.id === doc).name}.`;
      pick = null; slot = ''; renderCal();
      $('[data-msg]').textContent = m;
      toast('Visit confirmed (sample)');
    } else if ('resched' in t.dataset) {
      $('[data-cal] button:not(:disabled)')?.focus();
      $('[data-msg]').textContent = 'Pick a new day and time, then confirm.';
    } else if ('addcal' in t.dataset) {
      t.textContent = 'Added'; t.disabled = true; toast('Added to calendar (sample)');
    } else if (t.dataset.t) {
      tooth = +t.dataset.t; renderArch(); $(`[data-t="${tooth}"]`)?.focus();
    } else if (t.dataset.quickId) {
      location.hash = '#/' + (t.dataset.hash || 'overview');
      toast(`${t.textContent.trim()} · sample`);
    }
  });
  $('[data-arch]').addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.t) {
      e.preventDefault();
      e.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });
  seg($('[data-cats]'), (v) => { cat = v; renderTreat(); $(`[data-cats] [data-v="${v}"]`)?.focus(); });
  $('[data-q]').addEventListener('input', renderTreat);

  renderQuick(); renderNext(); renderScore(); renderCal(); renderTreat(); renderArch();
  $$('[data-count]').forEach((el) => countUp(el, +el.dataset.count));

  function staggerReveal() {
    $$('.pd-reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${reduce ? 0 : 40 * i}ms`);
      el.classList.add('pd-reveal-in');
    });
  }

  const PAGES = [
    { id: 'overview', name: 'Home', pattern: 'Dashboard' },
    { id: 'appointments', name: 'Appointments', pattern: 'Calendar' },
    { id: 'records', name: 'Records', pattern: 'List' },
    { id: 'payments', name: 'Payments', pattern: 'List' },
    { id: 'profile', name: 'Profile', pattern: 'Settings' },
  ];
  const main = $('[data-main]');
  const overview = $('[data-page-panel="overview"]');
  let stub = null;
  const seenPages = new Set();
  function ensureStub() {
    if (stub) return stub;
    stub = document.createElement('div');
    stub.setAttribute('data-db-stub-host-legacy', '');
    stub.hidden = true;
    main.insertBefore(stub, $('[data-main] .pd-foot') || null);
    return stub;
  }

  function pageHtml(page) {
    if (page.id === 'appointments') {
      return `<section class="pd-page" data-db-page="appointments" aria-labelledby="p-h">
        <h1 id="p-h">Appointments</h1>
        <p class="pd-page-lead">Upcoming and past clinic visits. Sample data · fictional.</p>
        <div class="pd-seg" role="group" aria-label="Appointment filter" data-appt-tabs>
          <button type="button" data-v="upcoming" aria-pressed="true">Upcoming</button>
          <button type="button" data-v="past" aria-pressed="false">Past</button>
        </div>
        <div class="pd-page-grid" data-appt-list></div>
      </section>`;
    }
    if (page.id === 'records') {
      return `<section class="pd-page" data-db-page="records" aria-labelledby="p-h">
        <h1 id="p-h">Records</h1>
        <p class="pd-page-lead">Chart notes, x-rays and treatment plans.</p>
        <div class="pd-seg" role="group" aria-label="Record state" data-rec-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Syncing</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-rec-body></div>
      </section>`;
    }
    if (page.id === 'payments') {
      return `<section class="pd-page" data-db-page="payments" aria-labelledby="p-h">
        <h1 id="p-h">Payments</h1>
        <p class="pd-page-lead">Invoices and saved cards. Nothing is charged in this demo.</p>
        <div class="pd-page-grid" data-pay-list></div>
      </section>`;
    }
    if (page.id === 'profile') {
      return `<section class="pd-page" data-db-page="profile" aria-labelledby="p-h">
        <h1 id="p-h">Profile</h1>
        <p class="pd-page-lead">Clinic preferences for Theo Brandt.</p>
        <form class="pd-page-card" data-settings onsubmit="return false">
          <label class="pd-field">Reminder channel
            <select name="channel"><option value="">Select…</option><option>Email</option><option>SMS</option><option>Push</option></select>
          </label>
          <label class="pd-field">Preferred hygienist
            <input name="hygienist" type="text" placeholder="Optional">
          </label>
          <p class="pd-error" data-form-err hidden>Choose a reminder channel.</p>
          <button type="submit" class="pd-btn">Save prefs</button>
        </form>
      </section>`;
    }
    return `<section class="pd-page"><h1>${page.name}</h1><p class="pd-page-lead">Sample data · fictional</p></section>`;
  }

  function wirePage(host, page) {
    if (page.id === 'appointments') {
      const list = host.querySelector('[data-appt-list]');
      const rows = {
        upcoming: [
          { who: DOCS.find((d) => d.id === upcoming.doc).name, when: `${fmtDate(upcoming.date, { weekday: 'short', month: 'short', day: 'numeric' })} · ${upcoming.time} am`, what: upcoming.what },
          { who: 'Dr. Luca Varga', when: `${fmtDate(dayOffset(21), { weekday: 'short', month: 'short', day: 'numeric' })} · 2:15 pm`, what: 'Aligner check' },
        ],
        past: [
          { who: 'Dr. Mira Okafor', when: `${fmtDate(dayOffset(-40), { weekday: 'short', month: 'short', day: 'numeric' })} · 11:00 am`, what: 'Clean' },
        ],
      };
      const paint = (filter = 'upcoming') => {
        const data = rows[filter] || [];
        if (!data.length) {
          list.innerHTML = `<div class="pd-empty"><p>No ${filter} appointments.</p></div>`;
          return;
        }
        list.innerHTML = data.map((a) =>
          `<article class="pd-page-card"><div class="pd-row"><strong>${a.who}</strong><span>${a.what}</span></div><p class="pd-meta" style="margin:0">${a.when}</p></article>`
        ).join('');
      };
      paint('upcoming');
      seg(host.querySelector('[data-appt-tabs]'), (v) => paint(v));
    }
    if (page.id === 'records') {
      const body = host.querySelector('[data-rec-body]');
      const items = [
        { name: 'Bitewing x-rays', d: 18 },
        { name: 'Perio chart', d: 40 },
        { name: 'Treatment plan', d: 9 },
      ];
      const paint = (state = 'ready') => {
        if (state === 'loading') {
          body.innerHTML = `<div class="pd-loading" role="status"><p>Syncing chart…</p><div class="pd-skel"></div><div class="pd-skel"></div></div>`;
          return;
        }
        if (state === 'empty') {
          body.innerHTML = `<div class="pd-empty"><p>No records yet. Upload after your next visit.</p></div>`;
          return;
        }
        if (state === 'error') {
          body.innerHTML = `<div class="pd-error"><p>Could not load records. Try syncing again.</p><button type="button" class="pd-btn ghost" data-retry>Retry</button></div>`;
          host.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
          return;
        }
        body.innerHTML = `<div class="pd-page-grid">${items.map((r) =>
          `<article class="pd-page-card"><div class="pd-row"><strong>${r.name}</strong></div><p class="pd-meta" style="margin:0">Updated ${fmtDate(dayOffset(-r.d), { month: 'short', day: 'numeric' })}</p></article>`
        ).join('')}</div>`;
      };
      paint('ready');
      seg(host.querySelector('[data-rec-tabs]'), (v) => paint(v));
    }
    if (page.id === 'payments') {
      host.querySelector('[data-pay-list]').innerHTML = [
        { name: 'Check-up and clean', amt: '$85', when: fmtDate(dayOffset(-40), { month: 'short', day: 'numeric' }) },
        { name: 'Whitening deposit', amt: '$120', when: fmtDate(dayOffset(-12), { month: 'short', day: 'numeric' }) },
      ].map((p) =>
        `<article class="pd-page-card"><div class="pd-row"><strong>${p.name}</strong><span class="num">${p.amt}</span></div><p class="pd-meta" style="margin:0">Paid ${p.when}</p></article>`
      ).join('');
    }
    if (page.id === 'profile') {
      const form = host.querySelector('[data-settings]');
      form?.addEventListener('submit', () => {
        const err = host.querySelector('[data-form-err]');
        if (!form.channel.value) { err.hidden = false; return; }
        err.hidden = true;
        toast(`Prefs saved · ${form.channel.value}`);
      });
    }
  }

  if (window.DB?.onVisible) {
    window.DB.onVisible(root, (visible) => {
      document.documentElement.dataset.motionPaused = visible ? '' : '1';
    });
  }

  if (!window.DB || typeof window.DB.route !== 'function') {
    console.error('DB.route missing — is ../_shared/frame.js loaded before app.js?');
  } else {
    window.DB._legacyRouteDisabled && window.DB.route(PAGES, (id, page) => {
      const isOverview = id === 'overview';
      overview.hidden = !isOverview;
      const host = ensureStub();
      host.hidden = isOverview;
      if (!isOverview) {
        host.innerHTML = pageHtml(page);
        paintIcons(host);
        wirePage(host, page);
      } else if (!seenPages.has('overview')) {
        seenPages.add('overview');
        staggerReveal();
      }
      seenPages.add(id);
    });
  }

  
/* reveal-boot */
if (typeof staggerReveal === "function") staggerReveal();
/* === DB multipage polish (dense kit) === */
(function wirePages() {
  const PAGES = [{"id":"overview","name":"Home","pattern":"Dashboard"},{"id":"appointments","name":"Appointments","pattern":"Calendar"},{"id":"records","name":"Records","pattern":"List"},{"id":"payments","name":"Payments","pattern":"List"},{"id":"profile","name":"Profile","pattern":"Settings"}];
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
  if (window.DB?.dense) window.DB.dense.mount({ main, overview, pages: PAGES, brand: "Pearlwell Dental" });
})();
/* === /DB multipage polish === */
document.documentElement.dataset.ready = 'true';
})();
