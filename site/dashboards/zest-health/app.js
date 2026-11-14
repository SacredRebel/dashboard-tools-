/* Zest Health: sample data, bubbles, wellness dots, sleep bars and interactions.
   All data is fictional sample data. No timers, no network. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    apple: '<path d="M12 7c-2-1.5-6-1-7 3s1.5 10 4.5 10c1 0 1.5-.5 2.5-.5s1.5.5 2.5.500c3 0 5.5-6 4.5-10s-5-4.5-7-3z"/><path d="M12 7c0-2 1-3.5 3-4"/>',
    file: '<path d="M6 2.500h8l5 5V21a.5.5 0 0 1-.5.500h-12.500A.5.5 0 0 1 5.5 21V3a.5.5 0 0 1 .5-.5z"/><path d="M14 2.500V8h5M9 13h6M9 17h6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    run: '<circle cx="14.5" cy="4.5" r="1.8"/><path d="m7 21 3-5 3 2v4M10 16l1-6 4 1 2 3h3M11 10 7.5 11 6 14"/>',
    moon: '<path d="M20 14.500A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.500z"/>',
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
    el.innerHTML = `<div class="zh-plot zh-barplot" style="--plot-h:${o.h || 200}px" role="group" aria-label="${o.label}">
      ${o.noAxis ? '' : ticks.map((v) => `<span class="zh-y num" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})">${fmt(v)}</span><span class="zh-gl" style="top:calc(var(--plot-h) * ${(1 - v / max).toFixed(4)})"></span>`).join('')}
      <div class="zh-cols">${o.labels.map((l, i) => `<button class="zh-col${o.stacked ? ' stack' : ''}${o.active === i ? ' on' : ''}" aria-label="${l}: ${o.series.map((s) => `${s.name ? s.name + ' ' : ''}${fmt(s.values[i])}`).join(', ')}"${o.onPick ? ` aria-pressed="${o.active === i}"` : ''}>${o.series.map((s) => `<span class="zh-bar" style="height:${((s.values[i] / max) * 100).toFixed(2)}%;--bar:var(${s.color})"></span>`).join('')}</button>`).join('')}</div>
      <div class="zh-xs">${o.labels.map((l) => `<span>${l}</span>`).join('')}</div>
      <span class="zh-tip num" hidden></span>
    </div>`;
    const tip = $('.zh-tip', el);
    const show = (i) => {
      tip.hidden = i < 0; if (i < 0) return;
      tip.innerHTML = `<b>${o.labels[i]}</b> ${o.series.map((s) => fmt(s.values[i])).join(' · ')}`;
      tip.className = `zh-tip num${i === 0 ? ' l' : i === n - 1 ? ' r' : ''}`;
      tip.style.left = ((i + 0.5) / n) * 100 + '%'; tip.style.top = `calc(var(--plot-h) * ${(1 - tot[i] / max).toFixed(4)})`;
    };
    $$('.zh-col', el).forEach((b, i) => { b.addEventListener('mouseenter', () => show(i)); b.addEventListener('focus', () => show(i)); b.addEventListener('blur', () => show(-1)); if (o.onPick) b.addEventListener('click', () => o.onPick(i)); });
    $('.zh-cols', el).addEventListener('mouseleave', () => show(-1));
  }
  paintIcons();

  $('[data-today]').textContent = fmtDate(dayOffset(0), { day: 'numeric', month: 'long', year: 'numeric' });

  $('[data-rocket]').innerHTML = `<svg viewBox="0 0 160 72" aria-hidden="true">
    <ellipse cx="118" cy="48" rx="22" ry="10" style="fill:var(--lilac)" opacity=".85"/>
    <path d="M40 50 L70 22 L98 36 L68 58 Z" style="fill:var(--ink)"/>
    <path d="M70 22 L88 10 L104 28 L98 36 Z" style="fill:var(--sidebar-text)"/>
    <circle cx="86" cy="28" r="5" style="fill:var(--accent)"/>
    <path d="M48 54 L36 66 L52 58 Z" style="fill:var(--lilac)"/>
    <path d="M40 44 C20 40 12 28 18 22" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" opacity=".4"/>
  </svg>`;

  const RANGES = {
    today: { kcal: '4.3k', hr: 62, km: '5.8', well: '78%', bubbles: [['2.6k', 'b1'], ['1.2k', 'b2'], ['500', 'b3']], bars: [['Running', 45, ''], ['Workouts', 30, 'ink'], ['Walking', 25, 'lime']] },
    week: { kcal: '28.1k', hr: 64, km: '34.2', well: '81%', bubbles: [['16k', 'b1'], ['8.4k', 'b2'], ['3.7k', 'b3']], bars: [['Running', 40, ''], ['Workouts', 35, 'ink'], ['Walking', 25, 'lime']] },
    month: { kcal: '112k', hr: 63, km: '128', well: '76%', bubbles: [['64k', 'b1'], ['31k', 'b2'], ['17k', 'b3']], bars: [['Running', 38, ''], ['Workouts', 32, 'ink'], ['Walking', 30, 'lime']] },
  };
  let range = 'today';

  function renderEnergy() {
    const r = RANGES[range];
    $('[data-kcal]').innerHTML = `${r.kcal} <small>kcal ${range === 'today' ? 'today' : 'total'}</small>`;
    $('[data-hr]').innerHTML = `${r.hr} <small>bpm</small>`;
    $('[data-km]').innerHTML = `${r.km} <small>km</small>`;
    $('[data-well]').textContent = r.well;
    $('[data-bubbles]').innerHTML = r.bubbles.map(([v, cls]) => `<div class="zh-bubble zh-${cls}"><span class="num">${v}<small>kcal</small></span></div>`).join('');
    $('[data-energy-bars]').innerHTML = r.bars.map(([n, p, c]) => `<li><span>${n}</span><span class="zh-track"><i class="zh-fill ${c}" style="width:${p}%"></i></span><span class="num">${p}%</span></li>`).join('');
    $('[data-energy-empty]').hidden = true;
  }

  // wellness dots: 8 rows × 10 cols, rising lilac columns
  function renderDots() {
    const hotCols = range === 'month' ? [5, 6, 7, 8] : range === 'week' ? [6, 7, 8, 9] : [4, 5, 6, 7, 8];
    let html = '';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 10; col++) {
        const fillFrom = 8 - Math.min(8, 2 + hotCols.indexOf(col) * 1.4 + (col > 3 ? 2 : 0));
        const on = hotCols.includes(col) && row >= fillFrom;
        const hot = on && row >= 6;
        html += `<span class="${hot ? 'hot' : on ? 'on' : ''}"></span>`;
      }
    }
    $('[data-dots]').innerHTML = html;
  }

  const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const SLEEP_M = [[70, 55], [65, 50], [72, 58], [92, 80], [68, 52], [74, 60], [70, 56]];
  const SLEEP_W = Array.from({ length: 7 }, (_, i) => {
    const d = fmtDate(dayOffset(i - 6), { weekday: 'short' });
    return [d, 55 + ((i * 13) % 35), 45 + ((i * 9) % 30)];
  });
  let sleepMode = 'monthly';
  let sleepFocus = 3;

  function renderSleep() {
    $('[data-sleep-err]').hidden = true;
    if (sleepMode === 'weekly') {
      $('[data-eff]').textContent = '82%';
      $('[data-dur]').textContent = '7h 02m';
      $('[data-sleep-chart]').innerHTML = `<div class="zh-month-row">${SLEEP_W.map((x, i) => {
        const on = i === sleepFocus;
        return `<button class="zh-month${on ? ' on' : ''}" data-m="${i}" aria-pressed="${on}" aria-label="${x[0]} efficiency ${x[1]}% duration index ${x[2]}"><span class="zh-month-bars"><i style="height:${x[1]}%"></i><i style="height:${x[2]}%"></i></span>${x[0]}</button>`;
      }).join('')}</div>`;
      return;
    }
    $('[data-eff]').textContent = '85%';
    $('[data-dur]').textContent = '7h 15m';
    $('[data-sleep-chart]').innerHTML = `<div class="zh-month-row">${MONTHS.map((m, i) => {
      const [a, b] = SLEEP_M[i];
      const on = i === sleepFocus;
      return `<button class="zh-month${on ? ' on' : ''}" data-m="${i}" aria-pressed="${on}" aria-label="${m} efficiency ${a}% duration index ${b}"><span class="zh-month-bars"><i style="height:${a}%"></i><i style="height:${b}%"></i></span>${m}</button>`;
    }).join('')}</div>`;
  }

  seg($('[data-range]'), (v) => {
    range = v;
    if (v === 'month' && false) { /* placeholder */ }
    renderEnergy();
    renderDots();
  });
  seg($('[data-sleep-range]'), (v) => {
    sleepMode = v;
    sleepFocus = v === 'weekly' ? 5 : 3;
    renderSleep();
  });
  $('[data-sleep-chart]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-m]'); if (!b) return;
    sleepFocus = +b.dataset.m;
    renderSleep();
    $(`[data-m="${sleepFocus}"]`).focus();
  });
  $('[data-upgrade]').addEventListener('click', () => {
    $('[data-energy-empty]').hidden = false;
    $('[data-energy-empty]').textContent = 'Pro preview unlocked for this session (sample). Coaching plans stay fictional.';
  });
  $('[data-search]').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const q = e.target.value.trim().toLowerCase();
    if (q.includes('sleep')) {
      sleepMode = 'weekly';
      $$('[data-sleep-range] [data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === 'weekly')));
      renderSleep();
    } else if (!q) {
      $('[data-sleep-err]').hidden = false;
      $('[data-sleep-err]').textContent = 'Type a metric name (sleep, energy, heart) and press Enter.';
    }
  });

  renderEnergy();
  renderDots();
  renderSleep();
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
  document.documentElement.dataset.ready = 'true';
})();
