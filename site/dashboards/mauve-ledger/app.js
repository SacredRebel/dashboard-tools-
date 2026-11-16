/* Mauve Ledger — sample data, stacked hatched bars, y-axis, tip, gauge.
   All data is fictional. No polling. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ICON = {
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z"/><circle cx="16.5" cy="14.5" r="1"/>',
    pie: '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15.5 3.6A9 9 0 0 1 20.4 8.5H15.5z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
    dots: '<circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/>',
  };
  const svg = (n) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON[n] || ''}</svg>`;

  function moneyParts(str) {
    const m = String(str).match(/^(.*?)(\.\d{2})$/);
    if (!m) return { whole: str, dec: '' };
    return { whole: m[1], dec: m[2] };
  }

  const KPIS = [
    { icon: 'wallet', value: '$143,624', label: 'Your bank balance', menu: true },
    { icon: 'pie', value: '12', label: 'Uncategorized transactions' },
    { icon: 'users', value: '7', label: 'Employees working today' },
    { icon: 'card', value: '$3,287.49', label: "This week's card spending" },
  ];

  /* Tip values on May match the reference dual tooltip ($598 / $245). */
  const PERIODS = {
    current: {
      offline: '$12,201.00', offDelta: '-11%', offCls: 'bad',
      online: '$100,799.00', onDelta: '+6%', onCls: 'good',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      offlineV: [320, 360, 340, 400, 245, 380, 410, 430, 390],
      onlineV: [520, 560, 540, 600, 598, 640, 660, 700, 680],
    },
    last: {
      offline: '$13,740.00', offDelta: '-4%', offCls: 'bad',
      online: '$95,120.00', onDelta: '+3%', onCls: 'good',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      offlineV: [300, 330, 360, 350, 280, 340, 320, 360, 310],
      onlineV: [480, 520, 500, 560, 540, 580, 600, 620, 590],
    },
  };

  const MAIL = [
    { av: 'HM', name: 'Hannah Morgan', sub: 'Meeting scheduled', who: '4 invited', urg: 'Urgent', time: '1:24 PM' },
    { av: 'MC', name: 'Megan Clark', sub: 'Update on marketing campaign', who: '2 invited', urg: 'Pending', time: '12:08 PM' },
    { av: 'AR', name: 'Amina Rahman', sub: 'Invoice #4418 follow-up', who: 'You', urg: 'Urgent', time: '11:40 AM' },
    { av: 'TS', name: 'Theo Santos', sub: 'Q3 budget draft attached', who: '3 invited', urg: 'Pending', time: '9:15 AM' },
    { av: 'EL', name: 'Elena Park', sub: 'Vendor onboarding checklist', who: '5 invited', urg: 'Pending', time: 'Yesterday' },
    { av: 'JK', name: 'Jordan Kim', sub: 'Payroll cut-off reminder', who: 'HR', urg: 'Urgent', time: 'Yesterday' },
  ];

  const TX = [
    { who: 'Northwind Studio', memo: 'Design retainers · Apr', amt: -4200, when: 'Today', dir: 'out' },
    { who: 'Stripe Payout', memo: 'Online sales batch #8841', amt: 12840, when: 'Today', dir: 'in' },
    { who: 'Cloudflare', memo: 'Workers plan', amt: -86.4, when: 'Yesterday', dir: 'out' },
    { who: 'Lumen & Co', memo: 'Office lease · Unit 4', amt: -3100, when: 'Yesterday', dir: 'out' },
    { who: 'Client — Harbor Dental', memo: 'Invoice #4412 paid', amt: 6400, when: 'Mon', dir: 'in' },
    { who: 'Figma', memo: 'Org seats × 8', amt: -180, when: 'Mon', dir: 'out' },
    { who: 'Payroll', memo: 'Bi-weekly run', amt: -18420, when: 'Fri', dir: 'out' },
    { who: 'Client — Peak Trail', memo: 'Milestone 2', amt: 9200, when: 'Fri', dir: 'in' },
    { who: 'AWS', memo: 'Compute · us-east-1', amt: -412.18, when: 'Thu', dir: 'out' },
    { who: 'Transfer · Ops', memo: 'Buffer to savings', amt: -2500, when: 'Thu', dir: 'out' },
  ];

  const BUDGETS = [
    { name: 'Payroll', used: 62, cap: '$48,000', spent: '$29,760' },
    { name: 'Software', used: 44, cap: '$4,200', spent: '$1,848' },
    { name: 'Marketing', used: 71, cap: '$6,500', spent: '$4,615' },
    { name: 'Facilities', used: 38, cap: '$9,800', spent: '$3,724' },
    { name: 'Travel', used: 22, cap: '$3,000', spent: '$660' },
    { name: 'Contingency', used: 12, cap: '$5,000', spent: '$600' },
  ];

  const S = {
    period: 'current',
    salesIdx: 4,
    mailFilter: 'all',
    txQ: '',
    txSort: 'newest',
    statePreview: 0,
  };

  const toastEl = $('[data-toast-el]');
  let toastTimer = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2400);
  }

  function seg(group, onChange) {
    if (!group) return;
    group.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]');
      if (!b) return;
      $$('button[data-v]', group).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onChange(b.dataset.v);
    });
  }

  function renderKpis() {
    $('[data-kpis]').innerHTML = KPIS.map((k, i) => {
      const parts = moneyParts(k.value);
      const val = parts.dec
        ? `${parts.whole}<span class="dec">${parts.dec}</span>`
        : k.value;
      return `
      <article class="mv-kpi" data-ref="kpi" style="--d:${80 + i * 40}ms">
        <div class="mv-kpi-top">
          <span class="mv-kpi-ic">${svg(k.icon)}</span>
          ${k.menu ? `<button type="button" class="mv-kpi-menu" aria-label="Balance options" data-toast="Balance options (sample).">${svg('dots')}</button>` : '<span></span>'}
        </div>
        <div>
          <b class="num" data-ref="kpi-value">${val}</b>
          <span>${k.label}</span>
        </div>
      </article>`;
    }).join('');
  }

  function renderChannels() {
    const p = PERIODS[S.period];
    const off = moneyParts(p.offline);
    const on = moneyParts(p.online);
    $('[data-channels]').innerHTML = `
      <div>
        <div class="lab">Offline</div>
        <div class="val num">${off.whole}<span class="dec">${off.dec}</span>
          <span class="mv-delta ${p.offCls}">${p.offDelta}</span>
        </div>
      </div>
      <div>
        <div class="lab">Online</div>
        <div class="val num">${on.whole}<span class="dec">${on.dec}</span>
          <span class="mv-delta ${p.onCls}">${p.onDelta}</span>
        </div>
      </div>`;
  }

  function fmtTip(n) {
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function renderSalesChart() {
    const p = PERIODS[S.period];
    const totals = p.labels.map((_, i) => p.offlineV[i] + p.onlineV[i]);
    const max = 1200; /* matches y-axis $0–$1.2k */
    const el = $('[data-sales-chart]');
    el.innerHTML = `
      <div class="mv-axis" data-ref="chart-axis" aria-hidden="true">
        <span>$1.2k</span><span>$900</span><span>$600</span><span>$300</span><span>$0</span>
      </div>
      <div class="mv-bars-wrap">
        <div class="mv-bars" role="group" aria-label="Average sales by month">
          ${p.labels.map((lab, i) => {
            const offH = ((p.offlineV[i] / max) * 100).toFixed(2);
            const onH = ((p.onlineV[i] / max) * 100).toFixed(2);
            const on = i === S.salesIdx ? ' on' : '';
            return `<button type="button" class="mv-bar${on}" data-ref="chart-bar" aria-pressed="${i === S.salesIdx}" aria-label="${lab}: offline ${fmtTip(p.offlineV[i])}, online ${fmtTip(p.onlineV[i])}" data-i="${i}"><span class="stack" style="height:${((totals[i] / max) * 100).toFixed(2)}%"><i class="seg" style="height:${(p.offlineV[i] / totals[i] * 100).toFixed(2)}%"></i><i class="seg seg--top" style="height:${(p.onlineV[i] / totals[i] * 100).toFixed(2)}%"></i></span></button>`;
          }).join('')}
        </div>
        <div class="mv-tip" data-ref="chart-tip" data-tip></div>
      </div>
      <div class="mv-xs">${p.labels.map((l) => `<span>${l}</span>`).join('')}</div>`;

    const tip = $('[data-tip]', el);
    const show = (i) => {
      if (i < 0) i = S.salesIdx;
      tip.hidden = false;
      tip.innerHTML = `<b>${fmtTip(p.onlineV[i])}</b>${fmtTip(p.offlineV[i])}`;
      tip.style.left = ((i + 0.5) / p.labels.length) * 100 + '%';
      tip.style.top = `${(1 - totals[i] / max) * 100}%`;
    };
    $$('.mv-bar', el).forEach((b) => {
      const i = +b.dataset.i;
      b.addEventListener('mouseenter', () => show(i));
      b.addEventListener('focus', () => show(i));
      b.addEventListener('click', () => {
        S.salesIdx = i;
        renderSalesChart();
      });
    });
    show(S.salesIdx);
  }

  function renderGauge() {
    const pct = 0.512;
    const segs = 32;
    const filled = Math.round(segs * pct);
    const cx = 100, cy = 102;
    const rOuter = 86, rInner = 68;
    const from = Math.PI;
    const to = 0;
    let paths = '';
    for (let i = 0; i < segs; i++) {
      const t = (i + 0.5) / segs;
      const a = from + (to - from) * t;
      const x0 = cx + rInner * Math.cos(a);
      const y0 = cy - rInner * Math.sin(a);
      const x1 = cx + rOuter * Math.cos(a);
      const y1 = cy - rOuter * Math.sin(a);
      const col = i < filled ? 'var(--accent)' : 'rgb(200 190 230 / 0.55)';
      paths += `<path d="M${x0.toFixed(2)} ${y0.toFixed(2)} L${x1.toFixed(2)} ${y1.toFixed(2)}" fill="none" stroke="${col}" stroke-width="5.2" stroke-linecap="round"/>`;
    }
    $('[data-gauge]').innerHTML =
      `<svg viewBox="0 0 200 130" role="img" aria-label="Success rate 51.2 percent">${paths}</svg>`;
  }

  function renderMail() {
    const list = MAIL.filter((m) => S.mailFilter === 'all' || m.urg === 'Urgent');
    $('[data-mail-empty]').hidden = list.length > 0;
    $('[data-mails]').innerHTML = list.map((m) => `
      <li>
        <span class="mv-av" aria-hidden="true">${m.av}</span>
        <b>${m.name}</b>
        <span class="sub">${m.sub}<small>${m.who}</small></span>
        <span class="mv-urg${m.urg === 'Pending' ? ' pending' : ''}">${m.urg}</span>
        <time>${m.time}</time>
      </li>`).join('');
  }

  function renderTx() {
    let rows = TX.slice();
    const q = S.txQ.trim().toLowerCase();
    if (q) rows = rows.filter((t) => (t.who + ' ' + t.memo).toLowerCase().includes(q));
    if (S.txSort === 'amount') rows.sort((a, b) => Math.abs(b.amt) - Math.abs(a.amt));
    $('[data-tx-empty]').hidden = rows.length > 0;
    $('[data-tx]').innerHTML = rows.map((t) => {
      const sign = t.dir === 'out' ? '−' : '+';
      const abs = Math.abs(t.amt).toLocaleString('en-US', { minimumFractionDigits: t.amt % 1 ? 2 : 0, maximumFractionDigits: 2 });
      return `<li>
        <span class="mv-av" aria-hidden="true">${t.who.slice(0, 2).toUpperCase()}</span>
        <span><b>${t.who}</b><small>${t.memo}</small></span>
        <span class="amt ${t.dir} num">${sign}$${abs}</span>
        <time>${t.when}</time>
      </li>`;
    }).join('');
  }

  function renderBudgets() {
    $('[data-budgets]').innerHTML = BUDGETS.map((b) => `
      <article class="mv-pane mv-budget">
        <div class="row"><h2>${b.name}</h2><span class="pct num">${b.used}%</span></div>
        <div class="mv-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${b.used}" aria-label="${b.name} ${b.used} percent used">
          <i style="width:${b.used}%"></i>
        </div>
        <p class="mv-sub">${b.spent} of ${b.cap}</p>
      </article>`).join('');
  }

  function stateBox(kind) {
    const box = $('[data-statebox]');
    const states = {
      loading: '<p>Loading preferences…</p><div class="mv-progress"><i style="width:40%"></i></div>',
      empty: '<p>No contracts synced yet. Connect a mailbox from Finance to populate this list.</p>',
      error: '<p>Could not save preferences. Check your connection, then try Save preferences again.</p>',
      populated: '<p>Preferences saved for James Okoro. Urgent alerts on · formation updates on.</p>',
    };
    const keys = Object.keys(states);
    const k = kind || keys[S.statePreview % keys.length];
    box.hidden = false;
    box.innerHTML = states[k];
    box.dataset.state = k;
  }

  function render() {
    renderChannels();
    renderSalesChart();
    renderMail();
    renderTx();
  }

  renderKpis();
  renderGauge();
  renderBudgets();
  render();

  $('[data-period]').addEventListener('change', (e) => {
    S.period = e.target.value;
    S.salesIdx = 4;
    render();
  });
  seg($('[data-mail-filter]'), (v) => { S.mailFilter = v; renderMail(); });
  seg($('[data-tx-sort]'), (v) => { S.txSort = v; renderTx(); });
  seg($('[data-budget-range]'), (v) => {
    if (v === 'quarter') {
      $('[data-bud-committed]').textContent = '$214,600';
      $('[data-bud-spent]').textContent = '$118,440';
      $('[data-bud-left]').textContent = '$96,160';
    } else {
      $('[data-bud-committed]').textContent = '$76,200';
      $('[data-bud-spent]').textContent = '$41,207';
      $('[data-bud-left]').textContent = '$34,993';
    }
    toast(v === 'quarter' ? 'Showing quarter envelopes (sample).' : 'Showing this month (sample).');
  });
  $('[data-tx-q]').addEventListener('input', (e) => { S.txQ = e.target.value; renderTx(); });

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toast]');
    if (t) toast(t.getAttribute('data-toast'));
    const act = e.target.closest('[data-act]');
    if (!act) return;
    if (act.dataset.act === 'formation') {
      $('[data-cheer]').textContent = 'Formation packet is with legal review — next update in 2 business days (sample).';
      toast('Opened formation status (sample).');
    }
    if (act.dataset.act === 'search') {
      location.hash = '#/transactions';
      requestAnimationFrame(() => { const i = $('[data-tx-q]'); if (i) i.focus(); });
    }
  });

  const form = $('[data-settings]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = $('[data-settings-err]');
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    if (name.length < 2) {
      err.hidden = false;
      err.textContent = 'Enter a display name (at least 2 characters).';
      form.name.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.hidden = false;
      err.textContent = 'Enter a valid alert email, then save again.';
      form.email.focus();
      return;
    }
    err.hidden = true;
    stateBox('populated');
    toast('Preferences saved (sample).');
  });
  $('[data-preview-state]').addEventListener('click', () => {
    S.statePreview += 1;
    stateBox();
  });
  $('[data-variant-select]').addEventListener('change', (e) => {
    const v = e.target.value;
    const url = new URL(location.href);
    if (v === 'default') url.searchParams.delete('variant');
    else url.searchParams.set('variant', v);
    history.replaceState(null, '', url.pathname + url.search + url.hash);
    document.documentElement.dataset.variant = v === 'default' ? '' : v;
    if (!document.documentElement.dataset.variant) delete document.documentElement.dataset.variant;
  });
  const curVar = document.documentElement.dataset.variant || 'default';
  $('[data-variant-select]').value = curVar;

  if (!reduce) {
    document.addEventListener('pointermove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 18;
      document.documentElement.style.setProperty('--spec', `${x.toFixed(1)}px`);
    });
  }

  const PAGES = [
    { id: 'overview', name: 'Overview' },
    { id: 'transactions', name: 'Finance' },
    { id: 'budgets', name: 'Accounts' },
    { id: 'settings', name: 'Contracts' },
  ];

  function showPage(id) {
    $$('[data-db-page]').forEach((sec) => {
      const on = sec.getAttribute('data-db-page') === id;
      sec.hidden = !on;
    });
    $$('.mv-nav a[data-nav]').forEach((a) => {
      if (a.dataset.nav === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
      a.classList.toggle('is-active', a.dataset.nav === 'overview' && id === 'overview');
    });
    $$('.mv-nav a[data-nav="overview"]').forEach((a) => {
      if (id === 'overview') a.setAttribute('aria-current', 'page');
    });
    $$('.mv-rail a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const pid = href.replace(/^#\//, '');
      if (pid === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  if (window.DB?.route) {
    window.DB.route(PAGES, (id) => showPage(id));
  } else {
    showPage('overview');
    window.addEventListener('hashchange', () => {
      const id = (location.hash.replace(/^#\/?/, '') || 'overview').split(/[/?#]/)[0];
      showPage(PAGES.some((p) => p.id === id) ? id : 'overview');
    });
  }

  if (window.DB?.onVisible) {
    window.DB.onVisible(document.querySelector('[data-db-app]'), (visible) => {
      document.documentElement.dataset.motionPaused = visible ? '' : '1';
    });
  }

  document.documentElement.dataset.ready = 'true';
})();
