/* Meridian Labs: one board, five pages, a 3D helix (helix.js). Sample data is fictional. No polling; state in memory. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ini = (n) => n.replace(/^Dr\. /, '').split(' ').map((w) => w[0]).join('').slice(0, 2);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const monday = (d) => addDays(d, -((d.getDay() + 6) % 7));

  const TESTS = [
    { id: 't1', kind: 'Labs', doc: 'Dr. Ines Okafor', role: 'Endocrinologist', title: 'Thyroid panel', sub: 'Results', date: 'Nov 9', plot: 'wave', result: 'TSH 2.1 mIU/L, inside the usual range.', next: 'Repeat in 6 months.' },
    { id: 't2', kind: 'Tests', doc: 'Dr. Wesley Cain', role: 'Cardiologist', title: 'Blood pressure', sub: 'Test', date: 'Nov 12', plot: 'range', result: 'Average 118 / 76 over 14 readings. Two readings above 135 in the evening.', next: 'Keep the evening log for two more weeks.' },
    { id: 't3', kind: 'Tests', doc: 'Dr. Sofia Frank', role: 'Cardiologist', title: 'Cardiogram', sub: 'Test', date: 'Nov 14', plot: 'ecg', result: 'Regular rhythm, 62 beats a minute at rest.', next: 'No follow-up needed.' },
    { id: 't4', kind: 'Advice', doc: 'Dr. Amara Whitlock', role: 'Family doctor', title: 'Sleep and iron', sub: 'Advice', date: 'Nov 16', plot: 'wave', result: 'Ferritin on the low side of normal. Sleep averaging 6 h 20 min.', next: 'Start iron with vitamin C in the morning; review in 8 weeks.' },
    { id: 't5', kind: 'Docs', doc: 'Dr. Kenji Dahl', role: 'Dermatologist', title: 'Skin check', sub: 'Summary letter', date: 'Nov 3', plot: 'range', result: 'Nothing of concern. One mole photographed for comparison.', next: 'Annual check next November.' },
    { id: 't6', kind: 'Labs', doc: 'Dr. Ines Okafor', role: 'Endocrinologist', title: 'Vitamin D', sub: 'Results', date: 'Oct 28', plot: 'ecg', result: '48 nmol/L, slightly below target.', next: 'Daily supplement through winter.' },
  ];
  const VITS = [
    { id: 'omega', name: 'Omega 3', dose: '2.5 mg', art: 'jar', hue: 205, when: 'sun', note: 'One capsule with breakfast.' },
    { id: 'aflu', name: 'Aflubin', dose: '200 mg', art: 'caps', hue: 290, when: 'moon', note: 'Two capsules after dinner, five days.' },
    { id: 'time', name: 'Timestin', dose: '300 mg', art: 'bottle', hue: 140, when: 'moon', note: 'One tablet before bed.' },
    { id: 'vitc', name: 'Vitamin C', dose: '1.8 mg', art: 'gummy', hue: 345, when: 'moon', note: 'One gummy with the iron, mornings.' },
    { id: 'iron', name: 'Iron', dose: '14 mg', art: 'bottle', hue: 18, when: 'sun', note: 'One tablet on an empty stomach.' },
    { id: 'vitd', name: 'Vitamin D', dose: '25 µg', art: 'caps', hue: 45, when: 'sun', note: 'One capsule with lunch.' },
    { id: 'mag', name: 'Magnesium', dose: '250 mg', art: 'jar', hue: 260, when: 'moon', note: 'One capsule an hour before sleep.' },
    { id: 'zinc', name: 'Zinc', dose: '10 mg', art: 'gummy', hue: 170, when: 'sun', note: 'One gummy with a meal.' },
  ];
  const DOCS = ['Dr. Wesley Cain · Cardiologist', 'Dr. Sofia Frank · Cardiologist', 'Dr. Ines Okafor · Endocrinologist', 'Dr. Amara Whitlock · Family doctor'];
  const SLOTS = ['9:00 am', '10:30 am', '2:00 pm', '4:00 pm'];
  const METRICS = { hr: { name: 'Resting heart rate', unit: 'bpm', now: 62, delta: '2 lower than last week', data: [66, 65, 64, 66, 63, 64, 62, 63, 61, 62, 63, 62, 61, 62] },
    bp: { name: 'Blood pressure', unit: 'mmHg', now: '118/76', delta: 'Steady', data: [121, 119, 122, 118, 120, 117, 119, 118, 121, 117, 116, 118, 119, 118] },
    sleep: { name: 'Sleep', unit: 'h', now: 6.4, delta: '20 min more than last week', data: [5.9, 6.1, 6, 6.4, 5.8, 6.6, 7.1, 6.2, 6.3, 6.5, 6.1, 6.7, 6.9, 6.4] },
    spo2: { name: 'Blood oxygen', unit: '%', now: 98, delta: 'Steady', data: [97, 98, 98, 97, 98, 99, 98, 98, 97, 98, 98, 99, 98, 98] } };
  const MODES = { dna: ['B', '23.3', 'Angstrom', [['Base pair 6', 'Folate pathway · usual'], ['Base pair 13', 'Caffeine response · slow'], ['Base pair 20', 'Vitamin D uptake · lower'], ['Base pair 26', 'Lactose · tolerant']]],
    heart: ['62', '118/76', 'bpm · mmHg', [['Lipid marker', 'LDL response · usual'], ['Rhythm marker', 'No variants found'], ['Pressure marker', 'Salt sensitivity · mild']]],
    scan: ['2', '98.4', '% read quality', [['Region 10', 'Read twice, matched'], ['Region 18', 'Queued for the next panel']]] };

  const S = { chip: 'All', mode: 'dna', vitPage: 0, vit: null, week: 0, day: key(today), taken: new Set(), metric: 'hr', range: 14, q: '', kind: 'All', sort: 'date', dir: -1, view: 'ready',
    apptDay: key(addDays(today, 2)), appts: [{ id: 'a1', day: key(addDays(today, 2)), time: '10:30 am', doc: DOCS[0], why: 'Blood pressure review' }, { id: 'a2', day: key(addDays(today, 9)), time: '2:00 pm', doc: DOCS[2], why: 'Thyroid follow-up' }],
    profile: { name: 'Ilse Varga', email: 'ilse@meridian.example', remind: true, share: false, metric: true } };

  function toast(msg, undo) { const t = $('[data-toast]'); t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button">Undo</button>' : ''}`; t.hidden = false; if (undo) $('button', t).onclick = () => { undo(); t.hidden = true; };
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, undo ? 6000 : 2800); }

  /* ---------- small drawings ---------- */
  const plots = {
    wave: () => `<svg viewBox="0 0 160 60" preserveAspectRatio="none" aria-hidden="true"><path class="ln" pathLength="1" stroke="var(--chart-2)" d="M0 34 C 20 8, 40 8, 60 30 S 100 52, 120 30 S 150 10, 160 22"/></svg>`,
    ecg: () => `<svg viewBox="0 0 160 60" preserveAspectRatio="none" aria-hidden="true"><path class="ln" pathLength="1" stroke="var(--chart-1)" d="M0 34 H22 l5-5 5 5 h8 l4-22 5 34 4-12 h22 l5-5 5 5 h8 l4-22 5 34 4-12 h20 l5-4 5 4 h10"/></svg>`,
    range: () => `<svg viewBox="0 0 160 60" aria-hidden="true">${[...Array(14)].map((_, i) => { const h = 10 + ((i * 37) % 23), y = 14 + ((i * 13) % 12), hot = i === 3 || i === 8; return `<rect class="br" style="--k:${i}" x="${12 + i * 10.4}" y="${hot ? y - 6 : y}" width="2.6" height="${hot ? h + 8 : h}" rx="1.3" fill="var(${hot ? '--chart-2' : '--chart-1'})"/>`; }).join('')}<path d="M6 30H154" stroke="var(--border)" stroke-dasharray="2 3"/></svg>`,
  };
  const art = (kind, hue) => { const c = `hsl(${hue} 62% 62%)`, d = `hsl(${hue} 50% 42%)`, l = `hsl(${hue} 70% 88%)`;
    if (kind === 'caps') return `<svg viewBox="0 0 64 64" aria-hidden="true"><g transform="rotate(-32 32 32)"><rect x="12" y="20" width="40" height="22" rx="11" fill="${l}"/><path d="M32 20h9a11 11 0 0 1 0 22h-9z" fill="${c}"/><rect x="16" y="23" width="14" height="5" rx="2.5" fill="#fff" opacity=".7"/></g><g transform="rotate(38 40 40)"><rect x="26" y="34" width="30" height="16" rx="8" fill="#fff" stroke="${l}" stroke-width="2"/><path d="M41 34h7a8 8 0 0 1 0 16h-7z" fill="hsl(${(hue + 160) % 360} 60% 66%)"/></g></svg>`;
    if (kind === 'gummy') return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="20" y="6" width="24" height="9" rx="3" fill="#f4f4f6" stroke="#d9d9de"/><rect x="15" y="14" width="34" height="44" rx="8" fill="${l}" stroke="${c}" stroke-width="1.5"/>${[[23, 26], [33, 24], [41, 30], [26, 36], [36, 38], [22, 46], [32, 48], [42, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${c}"/><circle cx="${x - 1.5}" cy="${y - 1.5}" r="1.5" fill="#fff" opacity=".7"/>`).join('')}<rect x="19" y="30" width="26" height="12" rx="2" fill="#fff" opacity=".85"/><rect x="23" y="34" width="18" height="2.5" rx="1.2" fill="${d}"/></svg>`;
    if (kind === 'bottle') return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="22" y="5" width="20" height="10" rx="3" fill="${d}"/><path d="M19 22a6 6 0 0 1 6-6h14a6 6 0 0 1 6 6v30a6 6 0 0 1-6 6H25a6 6 0 0 1-6-6z" fill="${c}"/><rect x="19" y="28" width="26" height="20" fill="#fff" opacity=".88"/><rect x="24" y="33" width="16" height="3" rx="1.5" fill="${d}"/><rect x="24" y="39" width="10" height="2.5" rx="1.2" fill="${c}"/><path d="M23 20v34" stroke="#fff" stroke-width="2" opacity=".35" stroke-linecap="round"/></svg>`;
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="19" y="5" width="26" height="9" rx="3" fill="#3b3d46"/><rect x="15" y="13" width="34" height="46" rx="7" fill="${l}" stroke="${c}" stroke-width="1.5"/>${[...Array(18)].map((_, i) => `<ellipse cx="${21 + (i % 4) * 7.3}" cy="${21 + Math.floor(i / 4) * 8}" rx="3.4" ry="2.3" fill="${c}" transform="rotate(${(i * 47) % 90} ${21 + (i % 4) * 7.3} ${21 + Math.floor(i / 4) * 8})"/>`).join('')}<rect x="20" y="30" width="24" height="16" rx="2" fill="#1f2026"/><text x="32" y="42.5" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="sans-serif">3</text></svg>`; };
  const pillIcon = (v) => `<svg class="pill" viewBox="0 0 64 64" aria-hidden="true">${art(v.art, v.hue).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`;

  /* ---------- overview ---------- */
  let firstPaint = true;
  function paintTests() {
    $('[data-chips]').innerHTML = ['All', 'Advice', 'Tests', 'Labs', 'Docs'].map((c) => `<button type="button" data-chip="${c}" aria-pressed="${S.chip === c}">${c}</button>`).join('');
    const list = TESTS.filter((t) => S.chip === 'All' || t.kind === S.chip);
    $('[data-cards]').innerHTML = list.length ? list.map((t, i) => `<button type="button" class="ml-test" style="--i:${i}" data-test="${t.id}">
      <span class="ml-doc"><i>${ini(t.doc)}</i><span><b>${esc(t.doc)}</b><small>${esc(t.role)}</small></span></span>
      <span class="ml-test-t">${esc(t.title)}<b>${esc(t.sub)}</b><small>${t.date}</small></span><span class="ml-plot">${plots[t.plot]()}</span></button>`).join('') : `<p class="ml-sub" style="padding:12px">Nothing filed under ${esc(S.chip)} yet.</p>`;
    // like the reference, the row starts mid-scroll so it reads as a carousel (desktop only)
    if (firstPaint && matchMedia('(min-width: 721px)').matches) { firstPaint = false; const c = $('[data-cards]'), w = c.firstElementChild?.offsetWidth || 0; c.style.scrollBehavior = 'auto'; c.scrollLeft = w * 0.62; c.style.scrollBehavior = ''; }
  }
  function paintVits() {
    const page = VITS.slice(S.vitPage * 4, S.vitPage * 4 + 4);
    $('[data-shelf]').innerHTML = page.map((v, i) => `<button type="button" class="ml-vit" style="--i:${i}" data-vit="${v.id}" aria-pressed="${S.vit === v.id}"><span><em>${String(S.vitPage * 4 + i + 1).padStart(2, '0')}</em><b>${esc(v.name)}</b><small>${esc(v.dose)}</small></span><span class="ml-vit-art">${art(v.art, v.hue)}</span></button>`).join('');
    $('[data-dots]').innerHTML = [0, 1].map((p) => `<button type="button" data-vpage="${p}" aria-pressed="${S.vitPage === p}" aria-label="Supplements ${p * 4 + 1} to ${p * 4 + 4}"></button>`).join('');
  }
  const plan = (d) => { const n = Math.round((d - monday(today)) / 864e5), i = ((n % 7) + 7) % 7, w = Math.floor(n / 7);
    if (i === 0) return { k: 'tests', time: '2:00 pm', label: `${2 + (((w % 2) + 2) % 2)} tests` }; if (i === 4) return { k: 'advice', time: '2:00 pm', label: '1 advice' };
    const v = VITS[(i + w * 3 + 64) % VITS.length]; return { k: 'vit', time: i % 2 ? '2:00 pm' : '4:00 pm', v, n: 1 + ((i + w) & 1) }; };
  function paintWeek() {
    const start = addDays(monday(today), S.week * 7), mid = addDays(start, 3);
    $('[data-month]').innerHTML = `${mid.toLocaleDateString('en-US', { month: 'long' })}, <span>${mid.getFullYear()}</span>`;
    $('[data-days]').innerHTML = [...Array(7)].map((_, i) => { const d = addDays(start, i), p = plan(d);
      return `<div class="ml-dow"${key(d) === key(today) ? ' data-today' : ''}><span>${d.toLocaleDateString('en-US', { weekday: 'short' })}</span>${p.k !== 'vit' ? `<i data-k="${p.k}"></i>` : ''}</div>`; }).join('') +
      [...Array(7)].map((_, i) => { const d = addDays(start, i), p = plan(d), k = key(d);
        return `<button type="button" class="ml-day" style="--i:${i}" data-day="${k}" data-k="${p.k}" aria-pressed="${S.day === k}" aria-label="${d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}"><b class="num">${d.getDate()}</b><time>${p.time}</time>
          <span class="ml-day-what">${p.k === 'vit' ? `${pillIcon(p.v)}<span>${esc(p.v.name)}</span><span class="ml-n">${p.n}</span><span class="ml-tod"><svg><use href="#m-${p.v.when}"/></svg></span>` : `<i class="dot"></i><span>${p.label.replace(/^\d+ ./, (m) => m.toUpperCase())}</span>`}</span></button>`; }).join('');
  }
  function paintMode() { const [form, val, unit, pins] = MODES[S.mode];
    $('[data-s="form"]').textContent = form; $('[data-s="val"]').textContent = val; $('[data-s="unit"]').textContent = unit; $('.ml-struct small').textContent = S.mode === 'dna' ? 'Structure' : S.mode === 'heart' ? 'Resting' : 'Passes';
    $$('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === S.mode)));
    $('[data-pins]').innerHTML = pins.map(([a], i) => `<button type="button" data-pin="${i}" aria-expanded="false" aria-label="${esc(a)}"></button>`).join('');
    window.DBHero?.setMode(S.mode); }
  document.addEventListener('db-hero-ready', () => window.DBHero.setMode(S.mode));

  /* ---------- inner pages ---------- */
  const stateBox = (items, empty, body) => S.view === 'loading' ? '<div class="ml-skel"></div><div class="ml-skel"></div><div class="ml-skel"></div>' : S.view === 'error' ? '<div class="ml-state"><p>We couldn’t load this. Check your connection, then try again.</p><button class="ml-btn ml-btn--main" data-act="retry">Try again</button></div>' : (S.view === 'empty' || !items.length) ? `<div class="ml-state"><p>${esc(empty)}</p><button class="ml-btn" data-act="clear">Clear filters</button></div>` : body(items);
  function bigChart(m) { const v = m.data.slice(-S.range), w = 640, h = 220, mx = Math.max(...v), mn = Math.min(...v), pad = (mx - mn) * 0.25 || 1;
    const pt = v.map((y, i) => [30 + (i / (v.length - 1)) * (w - 50), 20 + (1 - (y - mn + pad) / (mx - mn + pad * 2)) * (h - 60)]), d = pt.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    return `<svg class="ml-big" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(m.name)} over the last ${S.range} days, from ${v[0]} to ${v.at(-1)} ${esc(m.unit)}">${[0, 1, 2].map((i) => `<line x1="30" x2="${w - 20}" y1="${20 + i * (h - 60) / 2}" y2="${20 + i * (h - 60) / 2}"/>`).join('')}<path class="ar" d="${d} L ${pt.at(-1)[0]} ${h - 40} L 30 ${h - 40} Z"/><path class="ln" pathLength="1" d="${d}"/><circle cx="${pt.at(-1)[0]}" cy="${pt.at(-1)[1]}" r="5"/></svg>`; }
  const pages = {
    overview() { paintTests(); paintVits(); paintWeek(); paintMode(); },
    vitals(el) { const m = METRICS[S.metric];
      el.innerHTML = `<div class="ml-head"><div><h1>Vitals</h1><p class="ml-sub">Synced from your wrist band this morning.</p></div><div class="ml-tools" role="group" aria-label="Range">${[7, 14].map((r) => `<button class="ml-btn" data-range="${r}" aria-pressed="${S.range === r}">${r} days</button>`).join('')}</div></div>
        <div class="ml-four">${Object.entries(METRICS).map(([k, x]) => `<button type="button" class="ml-metric" data-metric="${k}" aria-pressed="${S.metric === k}"><small>${esc(x.name)}</small><b class="num">${x.now} <span>${esc(x.unit)}</span></b><em>${esc(x.delta)}</em></button>`).join('')}</div>
        <section class="ml-panel"><h2>${esc(m.name)}</h2>${bigChart(m)}<p class="ml-axis"><span>${S.range} days ago</span><span>Highest ${Math.max(...m.data.slice(-S.range))} ${esc(m.unit)}</span><span>Today</span></p></section>
        <div class="ml-cols"><section class="ml-panel"><h2>Recent readings</h2>${stateBox(m.data.slice(-5).reverse(), 'No readings yet.', (r) => r.map((y, i) => `<div class="ml-row"><span>${i ? addDays(today, -i).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Today'}<small>Morning, at rest</small></span><b class="num">${y} ${esc(m.unit)}</b></div>`).join(''))}</section>
          <form class="ml-panel" data-reading novalidate><h2>Add a reading</h2><label class="ml-label">${esc(m.name)} (${esc(m.unit)})<input class="ml-field" name="val" inputmode="decimal" aria-describedby="err-val"></label><p class="ml-err" id="err-val" role="alert"></p><button class="ml-btn ml-btn--main">Save reading</button></form></div>`; },
    appointments(el) { const first = new Date(today.getFullYear(), today.getMonth(), 1), lead = (first.getDay() + 6) % 7, n = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const has = (k) => S.appts.some((a) => a.day === k), list = S.appts.filter((a) => a.day === S.apptDay), cur = new Date(S.apptDay + 'T00:00');
      el.innerHTML = `<div class="ml-head"><div><h1>Appointments</h1><p class="ml-sub">${S.appts.length} booked. Pick a day to see it or book.</p></div></div>
        <div class="ml-cols"><section class="ml-panel"><h2>${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2><div class="ml-mgrid">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => `<small>${d}</small>`).join('')}${'<span></span>'.repeat(lead)}${[...Array(n)].map((_, i) => { const d = new Date(today.getFullYear(), today.getMonth(), i + 1), k = key(d), past = d < today;
          return `<button type="button" class="ml-mday num" data-aday="${k}" aria-pressed="${S.apptDay === k}"${has(k) ? ' data-has' : ''}${past ? ' disabled' : ''} aria-label="${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}${has(k) ? ', has an appointment' : ''}">${i + 1}<i></i></button>`; }).join('')}</div></section>
          <div style="display:grid;gap:16px"><section class="ml-panel"><h2>${cur.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>${stateBox(list, 'Nothing booked on this day.', (it) => it.map((a) => `<div class="ml-row"><span><b>${esc(a.time)} · ${esc(a.why)}</b><small>${esc(a.doc)}</small></span><button class="ml-btn ml-btn--quiet" data-cancel="${a.id}">Cancel visit</button></div>`).join(''))}</section>
            <form class="ml-panel" data-book novalidate><h2>Book a visit</h2><label class="ml-label">Doctor<select class="ml-field" name="doc">${DOCS.map((d) => `<option>${esc(d)}</option>`).join('')}</select></label><label class="ml-label">Time<select class="ml-field" name="time">${SLOTS.map((t) => `<option>${t}</option>`).join('')}</select></label>
              <label class="ml-label">What is it about?<input class="ml-field" name="why" aria-describedby="err-why"></label><p class="ml-err" id="err-why" role="alert"></p><button class="ml-btn ml-btn--main">Book this visit</button></form></div></div>
        <section class="ml-panel"><h2>All upcoming</h2>${S.appts.length ? [...S.appts].sort((a, b) => a.day.localeCompare(b.day)).map((a) => `<div class="ml-row"><span><b>${new Date(a.day + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${esc(a.time)}</b><small>${esc(a.why)} · ${esc(a.doc)}</small></span><button class="ml-btn" data-aday="${a.day}">Show day</button></div>`).join('') : '<p class="ml-sub">No visits booked.</p>'}</section>`; },
    records(el) { const q = S.q.trim().toLowerCase(); const ord = (t) => new Date(t.date + ' 2026').getTime();
      const list = TESTS.filter((t) => (S.kind === 'All' || t.kind === S.kind) && (!q || (t.title + t.doc + t.kind).toLowerCase().includes(q))).sort((a, b) => (S.sort === 'date' ? ord(a) - ord(b) : a[S.sort].localeCompare(b[S.sort])) * S.dir);
      const th = (k, l) => `<th aria-sort="${S.sort === k ? (S.dir > 0 ? 'ascending' : 'descending') : 'none'}"><button data-sort="${k}">${l}</button></th>`;
      el.innerHTML = `<div class="ml-head"><div><h1>Records</h1><p class="ml-sub">${list.length} of ${TESTS.length} shown.</p></div><div class="ml-tools"><input class="ml-field" type="search" placeholder="Search records" aria-label="Search records" value="${esc(S.q)}" data-q></div></div>
        <div class="ml-tools" role="group" aria-label="Type">${['All', 'Advice', 'Tests', 'Labs', 'Docs'].map((k) => `<button class="ml-btn" data-kind="${k}" aria-pressed="${S.kind === k}">${k}</button>`).join('')}</div>
        <section class="ml-panel">${stateBox(list, q ? `No records match “${S.q}”.` : 'No records of this type.', (it) => `<table class="ml-table"><thead><tr>${th('title', 'Record')}${th('kind', 'Type')}${th('doc', 'From')}${th('date', 'Date')}</tr></thead><tbody>${it.map((t) => `<tr tabindex="0" data-test="${t.id}"><td><b>${esc(t.title)}</b></td><td><span class="ml-tag" data-k="${t.kind}">${t.kind}</span></td><td>${esc(t.doc)}</td><td class="num">${t.date}</td></tr>`).join('')}</tbody></table>`)}</section>
        <section class="ml-panel"><h2>Shared with</h2>${DOCS.slice(0, 3).map((d) => `<div class="ml-row"><span><b>${esc(d.split(' · ')[0])}</b><small>${esc(d.split(' · ')[1])} · can read results and letters</small></span><span class="ml-tag">Read only</span></div>`).join('')}</section>`; },
    settings(el) { const p = S.profile, sw = (k, l) => `<label class="ml-switch"><span>${l}</span><input type="checkbox" data-pref="${k}"${p[k] ? ' checked' : ''}></label>`;
      el.innerHTML = `<div class="ml-head"><div><h1>Settings</h1><p class="ml-sub">Your details, reminders and units.</p></div></div>
        <div class="ml-cols"><form class="ml-panel" data-profile novalidate><h2>Profile</h2><label class="ml-label">Name<input class="ml-field" name="name" value="${esc(p.name)}" aria-describedby="err-name"></label><p class="ml-err" id="err-name" role="alert"></p>
            <label class="ml-label">Email<input class="ml-field" type="email" name="email" value="${esc(p.email)}" aria-describedby="err-email"></label><p class="ml-err" id="err-email" role="alert"></p><label class="ml-label">Phone<input class="ml-field" name="phone" value="(555) 010-4471"></label><button class="ml-btn ml-btn--main">Save profile</button></form>
          <div style="display:grid;gap:16px"><section class="ml-panel"><h2>Reminders and sharing</h2>${sw('remind', 'Remind me when a dose is due')}${sw('share', 'Share new results with my family doctor')}${sw('metric', 'Use metric units')}</section>
            <section class="ml-panel"><h2>Your supplements</h2>${VITS.slice(0, 4).map((v) => `<div class="ml-row"><span><b>${esc(v.name)} · ${esc(v.dose)}</b><small>${esc(v.note)}</small></span><span class="ml-tag">${v.when === 'sun' ? 'Morning' : 'Evening'}</span></div>`).join('')}</section>
            <section class="ml-panel"><h2>Preview a state</h2><p class="ml-sub">For design review: how lists look while loading, empty or failing.</p><label class="ml-label">Lists show<select class="ml-field" data-view>${['ready', 'loading', 'empty', 'error'].map((v) => `<option${S.view === v ? ' selected' : ''}>${v}</option>`).join('')}</select></label></section></div></div>`; },
  };

  /* ---------- drawer ---------- */
  let lastFocus = null;
  function drawer(html) { lastFocus = document.activeElement; $('[data-drawer-panel]').innerHTML = html; $('[data-drawer]').hidden = false; $('.ml-x').focus(); }
  function closeDrawer() { $('[data-drawer]').hidden = true; lastFocus?.focus?.(); }
  const head = (t, s) => `<div class="ml-drawer-top"><div><h2 id="ml-drawer-title">${esc(t)}</h2><p class="ml-sub">${esc(s)}</p></div><button class="ml-x" data-act="close" aria-label="Close"><svg><use href="#m-x"/></svg></button></div>`;
  function openTest(id) { const t = TESTS.find((x) => x.id === id); drawer(`${head(`${t.title}`, `${t.doc} · ${t.role} · ${t.date}`)}<div class="ml-panel"><span class="ml-plot" style="min-height:90px">${plots[t.plot]()}</span></div><section class="ml-panel"><h2>What it found</h2><p>${esc(t.result)}</p></section><section class="ml-panel"><h2>What happens next</h2><p>${esc(t.next)}</p></section><div class="ml-tools"><a class="ml-btn ml-btn--main" href="#/appointments" data-act="close" style="display:inline-flex;align-items:center;text-decoration:none">Book a follow-up</a><button class="ml-btn" data-act="dl">Download summary</button></div>`); }
  function openDay(k) { const d = new Date(k + 'T00:00'), p = plan(d); const items = p.k === 'vit' ? [`${p.v.name} · ${p.v.dose} · ${p.n} to take`] : p.k === 'tests' ? ['Fasting blood draw · 8:30 am', 'Blood pressure check · 2:00 pm'] : ['Call with Dr. Amara Whitlock · 2:00 pm'];
    drawer(`${head(d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }), p.k === 'vit' ? p.v.note : 'Tap an item when it is done.')}<section class="ml-panel"><h2>Plan for the day</h2>${items.map((it, i) => `<label class="ml-check"><input type="checkbox" data-take="${k}-${i}"${S.taken.has(`${k}-${i}`) ? ' checked' : ''}>${esc(it)}</label>`).join('')}</section>`); }

  /* ---------- events ---------- */
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-drawer]')) return closeDrawer();
    const t = e.target.closest('[data-chip],[data-test],[data-vit],[data-vpage],[data-day],[data-mode],[data-pin],[data-act],[data-metric],[data-range],[data-aday],[data-cancel],[data-kind],[data-sort]'); if (!t) { $('.ml-pin-tip')?.remove(); return; } const d = t.dataset;
    if (d.chip) { S.chip = d.chip; paintTests(); $('[data-cards]').scrollLeft = 0; return; }
    if (d.test) return openTest(d.test);
    if (d.vit) { S.vit = S.vit === d.vit ? null : d.vit; paintVits(); const v = VITS.find((x) => x.id === d.vit); return S.vit && toast(`${v.name} · ${v.note}`); }
    if (d.vpage) { S.vitPage = +d.vpage; return paintVits(); }
    if (d.day) { S.day = d.day; paintWeek(); return openDay(d.day); }
    if (d.mode) { S.mode = d.mode; $('.ml-pin-tip')?.remove(); return paintMode(); }
    if (d.pin) { $('.ml-pin-tip')?.remove(); const [a, b] = MODES[S.mode][3][+d.pin]; const tip = document.createElement('div'); tip.className = 'ml-pin-tip'; tip.innerHTML = `<b>${esc(a)}</b>${esc(b)}`; tip.style.transform = t.style.transform; $('[data-pins]').append(tip); return; }
    if (d.metric) { S.metric = d.metric; return render(); } if (d.range) { S.range = +d.range; return render(); }
    if (d.aday) { S.apptDay = d.aday; return render(); } if (d.kind) { S.kind = d.kind; return render(); }
    if (d.sort) { S.dir = S.sort === d.sort ? -S.dir : 1; S.sort = d.sort; return render(); }
    if (d.cancel) { const i = S.appts.findIndex((a) => a.id === d.cancel), gone = S.appts.splice(i, 1)[0]; render(); return toast(`Visit with ${gone.doc.split(' · ')[0]} cancelled`, () => { S.appts.splice(i, 0, gone); render(); }); }
    switch (d.act) {
      case 'tests-prev': { const c = $('[data-cards]'); return c.scrollBy({ left: c.scrollLeft < 10 ? c.scrollWidth : -c.clientWidth * 0.6 }); }
      case 'vits-next': S.vitPage = (S.vitPage + 1) % 2; return paintVits();
      case 'week-prev': S.week--; return paintWeek(); case 'week-next': S.week++; return paintWeek();
      case 'close': return closeDrawer(); case 'dl': return toast('Summary saved to your downloads');
      case 'retry': S.view = 'ready'; return render(); case 'clear': S.q = ''; S.kind = 'All'; S.view = 'ready'; return render();
    }
  });
  document.addEventListener('keydown', (e) => { const dr = $('[data-drawer]');
    if (e.key === 'Enter' && e.target.matches('tr[data-test]')) return openTest(e.target.dataset.test);
    if (dr.hidden) return; if (e.key === 'Escape') return closeDrawer();
    if (e.key === 'Tab') { const f = $$('button,select,input,a[href]', dr), a = f[0], z = f.at(-1); if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } });
  document.addEventListener('input', (e) => { if (e.target.matches('[data-q]')) { S.q = e.target.value; render(); const q = $('[data-q]'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); } });
  document.addEventListener('change', (e) => { const t = e.target;
    if (t.matches('[data-take]')) { t.checked ? S.taken.add(t.dataset.take) : S.taken.delete(t.dataset.take); toast(t.checked ? 'Marked as done' : 'Marked as not done'); }
    if (t.matches('[data-pref]')) { S.profile[t.dataset.pref] = t.checked; toast(t.checked ? 'Turned on' : 'Turned off'); }
    if (t.matches('[data-view]')) { S.view = t.value; toast(`Lists now show the ${S.view} state`); } });
  document.addEventListener('submit', (e) => { e.preventDefault(); const f = e.target, d = Object.fromEntries(new FormData(f));
    if (f.matches('[data-reading]')) { const v = parseFloat(d.val); if (!Number.isFinite(v) || v <= 0) { $('#err-val').textContent = 'Enter a number, for example 62.'; return f.val.focus(); } const m = METRICS[S.metric]; m.data.push(v); if (S.metric !== 'bp') m.now = v; render(); toast(`${m.name} reading saved`); }
    if (f.matches('[data-book]')) { if (!d.why.trim()) { $('#err-why').textContent = 'Say briefly what the visit is about, so the doctor can prepare.'; return f.why.focus(); } if (S.appts.some((a) => a.day === S.apptDay && a.time === d.time)) { $('#err-why').textContent = `You already have a visit at ${d.time}. Pick another time.`; return f.time.focus(); }
      S.appts.push({ id: 'a' + Date.now(), day: S.apptDay, time: d.time, doc: d.doc, why: d.why.trim() }); render(); toast(`Visit booked for ${d.time}`); }
    if (f.matches('[data-profile]')) { const okN = d.name.trim(), okE = /^\S+@\S+\.\S+$/.test(d.email); $('#err-name').textContent = okN ? '' : 'Enter your name.'; $('#err-email').textContent = okE ? '' : 'Enter an email address like name@example.com.'; if (!okN) return f.name.focus(); if (!okE) return f.email.focus();
      Object.assign(S.profile, { name: okN, email: d.email }); $('[data-user-name]').textContent = okN; toast('Profile saved'); } });

  /* ---------- routing ---------- */
  let current = 'overview';
  function render() { pages[current]($(`[data-db-page="${current}"]`)); }
  window.DB.route([{ id: 'overview', name: 'Overview' }, { id: 'vitals', name: 'Vitals' }, { id: 'appointments', name: 'Appointments' }, { id: 'records', name: 'Records' }, { id: 'settings', name: 'Settings' }], (id) => {
    current = id; $$('[data-db-page]').forEach((s) => { s.hidden = s.dataset.dbPage !== id; });
    $$('.ml-nav a').forEach((a) => { a.hash === '#/' + id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); }); render();
  });
  new MutationObserver(() => window.DBHero?.recolor()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-variant'] });
  document.documentElement.dataset.ready = 'true';
})();
