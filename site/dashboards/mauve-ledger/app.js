/* Mauve Ledger: sample data, KPIs, sales bars, gauge, emails and interactions.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    phone: '<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    chevDown: '<path d="m6 9 6 6 6-6"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z"/><circle cx="16.5" cy="14.5" r="1"/>',
    pie: '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15.5 3.6A9 9 0 0 1 20.4 8.5L15.5 8.5z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/>',
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
  // Bar chart built from HTML columns (each column is a focusable button). Grouped by default, stacked with o.stacked.
  // o: { labels, series: [{ name, color, values }], fmt, h, label, max, ticks, active, onPick, stacked }
  function barChart(el, o) {
    const fmt = o.fmt || fmtNum, n = o.labels.length;
    const tot = o.labels.map((_, i) => (o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i]))));
    const { max, ticks } = scale(tot, { min: 0, max: o.max, ticks: o.ticks, step: o.step });
    el.innerHTML = `<div class="ml-plot ml-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="ml-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="ml-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="ml-cols">${o.labels.map((l, i) => `<button class="ml-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="ml-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="ml-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="ml-tip num" hidden></span>
    </div>`;
    const tip = $('.ml-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `ml-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.ml-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.ml-cols', el).addEventListener('mouseleave', () => show(-1));
  }
  // Arc gauge. Angles in degrees, 0 = up, clockwise. Returns an SVG string with a track and a value arc.
  const polar = (cx, cy, r, deg) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const arcPath = (cx, cy, r, a0, a1) => { const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  function arcGauge(pct, { size = 160, w = 12, from = -120, to = 120, color = '--accent', knob = false } = {}) {
    const c = size / 2, r = (size - w) / 2 - (knob ? 4 : 0), end = from + (to - from) * Math.max(0, Math.min(1, pct)), [kx, ky] = polar(c, c, r, end);
    return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><path class="track" d="${arcPath(c, c, r, from, to)}" fill="none" stroke-width="${w}" stroke-linecap="round"/><path d="${arcPath(c, c, r, from, Math.max(end, from + 0.01))}" fill="none" stroke-width="${w}" stroke-linecap="round" style="stroke:var(${color})"/>${knob ? `<circle class="knob" cx="${kx.toFixed(2)}" cy="${ky.toFixed(2)}" r="${w * 0.75}"/>` : ''}</svg>`;
  }
  paintIcons();

  $('[data-today]').textContent = fmtDate(dayOffset(0), { weekday: 'long', month: 'long', day: 'numeric' });

  const KPIS = [
    { icon: 'wallet', value: '$143,624', label: 'Your bank balance' },
    { icon: 'pie', value: '12', label: 'Uncategorized transactions' },
    { icon: 'users', value: '7', label: 'Employees working today' },
    { icon: 'card', value: '$3,287.49', label: 'This week’s card spending' },
  ];
  $('[data-kpis]').innerHTML = KPIS.map((k) => `<article class="ml-kpi"><span class="ml-kpi-ic">${svg(k.icon)}</span><div><b class="num">${k.value}</b><span>${k.label}</span></div></article>`).join('');

  const PERIODS = {
    current: {
      offline: '$12,201.00', offDelta: '-11%', offCls: 'bad',
      online: '$100,799.00', onDelta: '+6%', onCls: 'good',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      offlineV: [42, 48, 45, 52, 61, 55, 58, 63, 57],
      onlineV: [70, 74, 72, 80, 92, 88, 90, 95, 93],
    },
    last: {
      offline: '$13,740.00', offDelta: '-4%', offCls: 'bad',
      online: '$95,120.00', onDelta: '+3%', onCls: 'good',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      offlineV: [40, 44, 50, 48, 55, 52, 49, 54, 51],
      onlineV: [66, 70, 68, 75, 84, 82, 86, 88, 85],
    },
  };
  let period = 'current';
  let salesDay = 4;

  function renderSales() {
    const p = PERIODS[period];
    $('[data-channels]').innerHTML =
      `<div>Offline: <b class="num">${p.offline}</b><span class="ml-delta ${p.offCls}">${p.offDelta}</span></div>` +
      `<div>Online: <b class="num">${p.online}</b><span class="ml-delta ${p.onCls}">${p.onDelta}</span></div>`;
    barChart($('[data-sales-chart]'), {
      labels: p.labels,
      h: 180,
      active: salesDay,
      onPick: true,
      label: 'Average sales by month, offline and online',
      series: [
        { name: 'Offline', color: '--bar-soft', values: p.offlineV },
        { name: 'Online', color: '--chart-1', values: p.onlineV },
      ],
      fmt: (v) => '$' + (v * 10),
    });
    $('[data-sales-note]').textContent = `${p.labels[salesDay]} · offline $${p.offlineV[salesDay] * 10}.00 · online $${p.onlineV[salesDay] * 10}.00`;
  }

  // segmented success gauge (custom, not plain arc only)
  function renderGauge() {
    const pct = 0.512;
    const segs = 24;
    const filled = Math.round(segs * pct);
    const size = 200, cx = 100, cy = 100, r = 78, w = 14;
    const from = -180, to = 0;
    let paths = '';
    for (let i = 0; i < segs; i++) {
      const a0 = from + (to - from) * (i / segs) + 1.2;
      const a1 = from + (to - from) * ((i + 1) / segs) - 1.2;
      const rad = (d) => (d * Math.PI) / 180;
      const p = (ang, rr) => [cx + rr * Math.cos(rad(ang)), cy + rr * Math.sin(rad(ang))];
      const [x0, y0] = p(a0, r), [x1, y1] = p(a1, r);
      const col = i < filled ? 'var(--accent)' : 'var(--accent-soft)';
      paths += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="butt"/>`;
    }
    $('[data-gauge]').innerHTML = `<svg viewBox="0 0 ${size} ${size / 1.15}" role="img" aria-label="Success rate 51.2 percent">${paths}</svg>`;
  }

  const MAIL = [
    { av: 'HM', name: 'Hannah Morgan', sub: 'Meeting scheduled', who: '4 invited', urg: 'Urgent', time: '1:24 PM' },
    { av: 'MC', name: 'Megan Clark', sub: 'Update on marketing campaign', who: '2 invited', urg: 'Pending', time: '12:08 PM' },
    { av: 'AR', name: 'Amina Rahman', sub: 'Invoice #4418 follow-up', who: 'You', urg: 'Urgent', time: '11:40 AM' },
    { av: 'TS', name: 'Theo Santos', sub: 'Q3 budget draft attached', who: '3 invited', urg: 'Pending', time: '9:15 AM' },
    { av: 'EL', name: 'Elena Park', sub: 'Vendor onboarding checklist', who: '5 invited', urg: 'Pending', time: 'Yesterday' },
  ];
  let mailFilter = 'all';
  function renderMail() {
    const list = MAIL.filter((m) => mailFilter === 'all' || m.urg === 'Urgent');
    $('[data-mail-empty]').hidden = list.length > 0;
    $('[data-mails]').innerHTML = list.map((m) => `<li>
      <span class="ml-av" aria-hidden="true">${m.av}</span>
      <span><b>${m.name}</b></span>
      <span>${m.sub}<small>${m.who}</small></span>
      <span class="ml-urg${m.urg === 'Pending' ? ' pending' : ''}">${m.urg}</span>
      <time>${m.time}</time>
    </li>`).join('');
  }

  seg($('[data-nav]'), (v) => {
    $('[data-lead]').textContent = v === 'dashboard'
      ? `Here’s your ledger for ${fmtDate(dayOffset(0), { weekday: 'long', month: 'long', day: 'numeric' })}.`
      : `Browsing ${v.replace(/-/g, ' ')} (sample view).`;
  });
  seg($('[data-period]'), (v) => { period = v; salesDay = 4; renderSales(); });
  seg($('[data-mail-filter]'), (v) => { mailFilter = v; renderMail(); });
  $('[data-sales-chart]').addEventListener('click', (e) => {
    const cols = $$('.PFX-col', $('[data-sales-chart]'));
    const b = e.target.closest('.PFX-col'); if (!b) return;
    salesDay = cols.indexOf(b);
    renderSales();
  });
  $('[data-status]').addEventListener('click', () => {
    $('[data-cheer]').textContent = 'Formation packet is with legal review — next update in 2 business days (sample).';
  });

  renderSales();
  renderGauge();
  renderMail();
  document.documentElement.dataset.ready = 'true';
})();
