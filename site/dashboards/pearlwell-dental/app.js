/* Pearlwell Dental: sample data, tooth artwork, booking and interactions.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    tooth: '<path d="M7.5 3C5 3 3.5 5 4 8c.4 2.5 1 3.5 1.5 6.500S6.5 21 8 21s1.5-5 4-5 2.5 5 4 5 2-3.5 2.5-6.500S19.6 10.5 20 8c.5-3-1-5-3.5-5-1.8 0-2.8 1-4.5 1s-2.7-1-4.5-1z"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
    file: '<path d="M6 2.500h8l5 5V21a.5.5 0 0 1-.5.500h-12.500A.5.5 0 0 1 5.5 21V3a.5.5 0 0 1 .5-.5z"/><path d="M14 2.500V8h5M9 13h6M9 17h6"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    chevLeft: '<path d="m15 18-6-6 6-6"/>',
    chevRight: '<path d="m9 6 6 6-6 6"/>',
    sparkle: '<path d="M12 3l1.8 5.200L19 10l-5.2 1.800L12 17l-1.8-5.200L5 10l5.2-1.800zM19 16l.8 2.200L22 19l-2.2.8L19 22l-.8-2.200L16 19l2.2-.8z"/>',
    shield: '<path d="M12 2 4 5v6c0 5.2 3.4 9.3 8 11 4.6-1.7 8-5.8 8-11V5z"/>',
    stethoscope: '<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a4.5 4.5 0 0 0 9 0v-2"/><circle cx="19" cy="12" r="2"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.500a4.5 4.5 0 0 0 7 0M9 9.500h.01M15 9.500h.01"/>',
    cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
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
  $('[data-tooth]').innerHTML = `<svg viewBox="0 0 150 150"><defs><linearGradient id="pd-t" x1="0" y1="0" x2="1" y2="1">${st(0, '--tooth-1')}${st(1, '--tooth-2')}</linearGradient></defs>
    <ellipse cx="75" cy="78" rx="66" ry="20" fill="none" stroke="var(--on-hero)" stroke-opacity="0.45" stroke-width="2"/>
    <path d="M40,40 C40,18 62,16 75,26 C88,16 110,18 110,40 C110,62 102,72 100,96 C98,124 88,130 84,110 C81,96 79,88 75,88 C71,88 69,96 66,110 C62,130 52,124 50,96 C48,72 40,62 40,40 Z" fill="url(#pd-t)"/>
    <path d="M92,58 l18,-6 l18,6 v14 c0,14 -10,22 -18,26 c-8,-4 -18,-12 -18,-26 Z" fill="var(--shield)" stroke="var(--tooth-1)" stroke-width="3"/><path d="M110,64 v20 M100,74 h20" stroke="var(--tooth-1)" stroke-width="4" stroke-linecap="round"/></svg>`;

  const DOCS = [{ id: 'mo', name: 'Dr. Mira Okafor', role: 'General dentist', ini: 'MO' }, { id: 'lv', name: 'Dr. Luca Varga', role: 'Orthodontist', ini: 'LV' }];
  const TREAT = [{ cat: 'General', icon: 'sparkle', name: 'Check-up and clean', d: 'Exam, scale and polish', p: 85 }, { cat: 'General', icon: 'tooth', name: 'Filling', d: 'Tooth-coloured composite', p: 140 }, { cat: 'Cosmetic', icon: 'smile', name: 'Whitening', d: 'Two in-chair sessions', p: 320 }, { cat: 'Cosmetic', icon: 'sparkle', name: 'Bonding', d: 'Repair chips and gaps', p: 260 }, { cat: 'Ortho', icon: 'shield', name: 'Clear aligners', d: 'Twelve-month plan', p: 2900 }, { cat: 'Surgery', icon: 'cross', name: 'Implant', d: 'Post, crown and fitting', p: 1950 }];
  const CATS = ['All', 'General', 'Cosmetic', 'Ortho', 'Surgery'], SLOTS = ['9:00', '9:45', '10:30', '11:15', '1:30', '2:15', '3:00', '3:45', '4:30'];
  const TEETH = { 3: 'Small cavity found at your last visit. A filling is advised.', 12: 'Worn edge. Watch for sensitivity.', 22: 'Old filling in good condition.' };
  const today = dayOffset(0), upcoming = { date: dayOffset(9), time: '10:30', doc: 'mo', what: 'Check-up and clean' };
  let view = new Date(today.getFullYear(), today.getMonth(), 1), pick = (() => { let d = dayOffset(1); while (d.getDay() === 0) d = dayOffset(Math.round((d - today) / 864e5) + 1); return d.getMonth() === today.getMonth() ? d : null; })(), slot = '', doc = 'mo', cat = 'All', tooth = 3;
  const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
  const taken = (d) => SLOTS.filter((_, i) => (d.getDate() * 7 + i * 3) % 5 === 0);
  const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning, Theo' : h < 18 ? 'Good afternoon, Theo' : 'Good evening, Theo'; };

  function renderNext() {
    const u = upcoming, dr = DOCS.find((x) => x.id === u.doc);
    $('[data-next]').innerHTML = `<h3>${dr.name}</h3><p>${u.what} · ${dr.role}</p><p class="pd-when num">${fmtDate(u.date, { weekday: 'long', month: 'long', day: 'numeric' })} · ${u.time}${+u.time.split(':')[0] < 8 ? ' pm' : ' am'}</p>
      <div class="pd-acts"><button data-resched>Reschedule</button><button data-addcal>Add to calendar</button></div>`;
  }
  function renderScore() {
    const s = 85; $('[data-ring]').innerHTML = `<div role="img" aria-label="Dental health score ${s}%">${donut([{ value: s, color: '--accent' }, { value: 100 - s, color: '--surface-2' }], { size: 96, w: 10, gap: 0, round: true })}</div><b class="num">${s}%</b>`;
    $('[data-score-note]').innerHTML = '<b>Doing well</b>Brushing is consistent. One small cavity to fix this month.';
  }
  function renderCal() {
    const y = view.getFullYear(), m = view.getMonth(), first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
    $('[data-month]').textContent = fmtDate(view, { month: 'long', year: 'numeric' });
    $('[data-mon="-1"]').disabled = y === today.getFullYear() && m === today.getMonth();
    $('[data-cal]').innerHTML = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => `<span class="dow" aria-hidden="true">${d}</span>`).join('') + '<span></span>'.repeat(first) +
      Array.from({ length: days }, (_, i) => { const d = new Date(y, m, i + 1), off = d < today && !sameDay(d, today) || d.getDay() === 0; return `<button data-day="${i + 1}" class="num${sameDay(d, today) ? ' today' : ''}" aria-pressed="${sameDay(d, pick)}" aria-label="${fmtDate(d, { weekday: 'long', month: 'long', day: 'numeric' })}${off ? ', closed' : ''}"${off ? ' disabled' : ''}>${i + 1}</button>`; }).join('');
    renderSlots();
  }
  function renderSlots() {
    const t = pick ? taken(pick) : [];
    $('[data-slots]').innerHTML = SLOTS.map((s) => `<button class="num" data-slot="${s}" aria-pressed="${s === slot}"${t.includes(s) ? ' disabled class="num taken" aria-label="' + s + ', taken"' : pick ? '' : ' disabled'}>${s}</button>`).join('');
    $('[data-docs]').innerHTML = DOCS.map((d) => `<button data-doc="${d.id}" aria-pressed="${d.id === doc}"><i>${d.ini}</i><span>${d.name}<small>${d.role}</small></span></button>`).join('');
    $('[data-confirm]').disabled = !(pick && slot);
    if (!pick) $('[data-msg]').textContent = 'Pick a day to see open times.'; else if (!slot) $('[data-msg]').textContent = `${fmtDate(pick, { weekday: 'long', day: 'numeric', month: 'short' })}: pick a time.`;
  }
  function renderTreat() {
    const q = $('[data-q]').value.trim().toLowerCase(), list = TREAT.filter((t) => (cat === 'All' || t.cat === cat) && (!q || (t.name + t.d).toLowerCase().includes(q)));
    $('[data-cats]').innerHTML = CATS.map((c) => `<button data-v="${c}" aria-pressed="${c === cat}">${c}</button>`).join('');
    $('[data-treat]').innerHTML = list.length ? list.map((t) => `<li><span>${svg(t.icon)}</span><span><b>${t.name}</b><small>${t.d}</small></span><span class="num">$${fmtNum(t.p)}</span></li>`).join('') : `<li class="pd-none">No treatments match “${q}”. Try another word or pick All.</li>`;
  }
  function renderArch() {
    const pts = Array.from({ length: 28 }, (_, i) => { const up = i < 14, k = up ? i : i - 14, a = Math.PI * (0.08 + (k / 13) * 0.84), rx = 130, ry = up ? 96 : 84; return [165 - rx * Math.cos(a), up ? 118 - ry * Math.sin(a) : 142 + ry * Math.sin(a), up]; });
    $('[data-arch]').innerHTML = `<svg viewBox="0 0 330 250" role="group" aria-label="Tooth chart, 28 teeth"><path d="M30,120 C40,0 290,0 300,120 Z M30,140 C40,250 290,250 300,140 Z" fill="var(--gum)" opacity="0.35"/>` +
      pts.map(([x, y], i) => `<g class="t${TEETH[i] ? ' watch' : ''}" tabindex="0" role="button" data-t="${i}" aria-pressed="${i === tooth}" aria-label="Tooth ${i + 1}${TEETH[i] ? ', has a note' : ''}"><path d="M${(x - 9).toFixed(1)},${(y - 9).toFixed(1)} q9,-5 18,0 q3,9 0,18 q-9,5 -18,0 q-3,-9 0,-18 Z"/></g>`).join('') + '</svg>';
    $('[data-tooth-note]').innerHTML = `<b>Tooth ${tooth + 1}.</b> ${TEETH[tooth] || 'Healthy. Nothing to do.'}`;
  }

  // ---------------------------------------------------------------- events
  $('[data-greet]').textContent = greet();
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, .t'); if (!t) return;
    if (t.dataset.mon) { view = new Date(view.getFullYear(), view.getMonth() + +t.dataset.mon, 1); renderCal(); }
    else if (t.dataset.day) { pick = new Date(view.getFullYear(), view.getMonth(), +t.dataset.day); slot = ''; renderCal(); $(`[data-day="${t.dataset.day}"]`).focus(); }
    else if (t.dataset.slot) { slot = t.dataset.slot; renderSlots(); $(`[data-slot="${slot}"]`).focus(); $('[data-msg]').textContent = ''; }
    else if (t.dataset.doc) { doc = t.dataset.doc; renderSlots(); $(`[data-doc="${doc}"]`).focus(); }
    else if ('confirm' in t.dataset) { Object.assign(upcoming, { date: pick, time: slot, doc }); renderNext(); const m = `Booked: ${fmtDate(pick, { weekday: 'long', month: 'long', day: 'numeric' })} at ${slot} with ${DOCS.find((x) => x.id === doc).name}.`; pick = null; slot = ''; renderCal(); $('[data-msg]').textContent = m; }
    else if ('resched' in t.dataset) { $('[data-cal] button:not(:disabled)').focus(); $('[data-msg]').textContent = 'Pick a new day and time, then confirm.'; }
    else if ('addcal' in t.dataset) { t.textContent = 'Added'; t.disabled = true; }
    else if (t.dataset.t) { tooth = +t.dataset.t; renderArch(); $(`[data-t="${tooth}"]`).focus(); }
  });
  $('[data-arch]').addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.t) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
  seg($('[data-cats]'), (v) => { cat = v; renderTreat(); $(`[data-cats] [data-v="${v}"]`).focus(); });
  $('[data-q]').addEventListener('input', renderTreat);
  renderNext(); renderScore(); renderCal(); renderTreat(); renderArch();
/* === DB multipage bootstrap (generated; polish pass replaces stubs) === */
  (function wirePages() {
    const PAGES = [{"id":"overview","name":"Overview","pattern":"Dashboard"},{"id":"vitals","name":"Vitals","pattern":"Report"},{"id":"appointments","name":"Appointments","pattern":"Calendar"},{"id":"records","name":"Records","pattern":"List"},{"id":"settings","name":"Settings","pattern":"Settings"}];
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
        if (on) {
          ch.hidden = false;
          ch.removeAttribute('data-db-overview-hide');
        } else {
          ch.hidden = true;
          ch.setAttribute('data-db-overview-hide', '');
        }
      });
      stub.hidden = on;
    }
    function renderStub(page) {
      const rows = [
        ['Status', 'Sample · ready'],
        ['Records', '24'],
        ['Updated', 'Today'],
      ];
      stub.innerHTML = '<h1>' + page.name + '</h1>'
        + '<p class="db-sample">Sample data · fictional</p>'
        + '<p>This page is part of the multi-page shell. The polish pass fills it with real ' + page.name.toLowerCase() + ' UI in the same design language as Overview.</p>'
        + '<div class="db-stub-panel" role="list">'
        + rows.map(([k, v]) => '<div class="db-stub-row" role="listitem"><span>' + k + '</span><strong class="num">' + v + '</strong></div>').join('')
        + '</div>';
    }
    document.querySelectorAll('a[href]').forEach((a) => {
      const label = (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!label) return;
      const hit = PAGES.find((p) => p.name.toLowerCase() === label || p.id === label
        || (label === 'home' && p.id === 'overview')
        || (label === 'dashboard' && p.id === 'overview'));
      if (hit) a.setAttribute('href', '#/' + hit.id);
    });
    if (!window.DB || typeof window.DB.route !== 'function') {
      console.error('DB.route missing — is ../_shared/frame.js loaded before app.js?');
      return;
    }
    window.DB.route(PAGES, (id, page) => {
      if (id === PAGES[0].id) setOverviewVisible(true);
      else { setOverviewVisible(false); renderStub(page); }
    });
  })();
/* === /DB multipage bootstrap === */
  document.documentElement.dataset.ready = 'true'; // contract: tells dashboards-check.mjs the script ran to the end
})();
