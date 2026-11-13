/* Orbit Clay: twin-phone clay console — fictional missions, helmet SVG, calibration rail. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ICON = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
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
  paintIcons();

  const MISSIONS = [
    { name: 'Mission Nova', score: 227, signal: 11009 },
    { name: 'Mission Drift', score: 184, signal: 9820 },
    { name: 'Mission Halo', score: 301, signal: 12440 },
    { name: 'Mission Quill', score: 156, signal: 8712 },
    { name: 'Mission Ember', score: 268, signal: 10555 },
  ];
  const MODES = {
    orbit: { thrust: 3007, label: 'Orbit hold' },
    drift: { thrust: 2140, label: 'Soft drift' },
    dock: { thrust: 980, label: 'Dock approach' },
  };

  let page = 0;
  let base = 'alpha';
  let mode = 'orbit';
  let running = false;
  let locked = false;

  function helmetSvg() {
    return `<svg viewBox="0 0 220 220" aria-hidden="true">
      <defs>
        <linearGradient id="oc-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="var(--gold-2)"/><stop offset="55%" stop-color="var(--gold)"/><stop offset="1" stop-color="var(--gold-deep)"/>
        </linearGradient>
        <linearGradient id="oc-helm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--forest-2)"/><stop offset="1" stop-color="var(--forest)"/>
        </linearGradient>
        <radialGradient id="oc-wellg" cx="40%" cy="35%" r="60%">
          <stop offset="0" stop-color="var(--cream)"/><stop offset="1" stop-color="var(--cream-2)"/>
        </radialGradient>
      </defs>
      <circle cx="110" cy="110" r="100" fill="url(#oc-wellg)"/>
      <circle cx="110" cy="110" r="86" fill="none" stroke="url(#oc-gold)" stroke-width="14"/>
      <circle cx="110" cy="110" r="74" fill="none" stroke="var(--cream)" stroke-width="3" opacity="0.5"/>
      <!-- helmet shell -->
      <ellipse cx="110" cy="118" rx="48" ry="56" fill="url(#oc-helm)"/>
      <path d="M70 118 C70 78 150 78 150 118 L150 148 C150 168 130 178 110 178 C90 178 70 168 70 148 Z" fill="url(#oc-helm)"/>
      <!-- visor -->
      <ellipse cx="118" cy="112" rx="28" ry="30" fill="none" stroke="url(#oc-gold)" stroke-width="5"/>
      <ellipse cx="118" cy="112" rx="22" ry="24" fill="var(--forest)" opacity="0.35"/>
      <path d="M100 100 C112 96 128 100 134 112" fill="none" stroke="var(--gold-2)" stroke-width="2" opacity="0.55"/>
      <!-- ear mesh -->
      <rect x="58" y="100" width="16" height="36" rx="6" fill="url(#oc-gold)"/>
      <path d="M62 108 h8 M62 116 h8 M62 124 h8" stroke="var(--forest)" stroke-width="1.5" opacity="0.55"/>
      <rect x="146" y="100" width="16" height="36" rx="6" fill="url(#oc-gold)" opacity="0.85"/>
      <!-- collar -->
      <path d="M78 168 C90 180 130 180 142 168" fill="none" stroke="url(#oc-gold)" stroke-width="6" stroke-linecap="round"/>
    </svg>`;
  }

  function landSvg() {
    return `<svg viewBox="0 0 380 420" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="oc-clayg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--cream)"/><stop offset="1" stop-color="var(--cream-2)"/>
        </linearGradient>
      </defs>
      <path d="M0 90 L40 110 L70 40 L110 120 L160 20 L200 100 L235 10 L280 95 L330 50 L380 110 V420 H0 Z" fill="url(#oc-clayg)"/>
      <path d="M0 160 L60 140 L120 180 L180 130 L240 170 L300 145 L380 175 V420 H0 Z" fill="var(--cream-2)" opacity="0.85"/>
      <path d="M0 240 L80 220 L160 260 L240 230 L320 250 L380 235 V420 H0 Z" fill="var(--surface-2)" opacity="0.55"/>
      <ellipse cx="90" cy="300" rx="40" ry="14" fill="var(--forest)" opacity="0.06"/>
      <ellipse cx="280" cy="320" rx="50" ry="16" fill="var(--forest)" opacity="0.05"/>
    </svg>`;
  }

  function fmt(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function render() {
    const m = MISSIONS[page];
    const alt = +$('[data-alt]').value;
    const thrustBase = MODES[mode].thrust;
    const altitude = Math.round(1800 + alt * 28);
    const thrust = Math.round(thrustBase + alt * 6 + (running ? 220 : 0));
    const signal = Math.round(m.signal + alt * 8 - (locked ? 0 : 40));

    $('[data-score]').textContent = String(m.score + (running ? 12 : 0));
    $('[data-kpi-a]').textContent = fmt(altitude);
    $('[data-kpi-b]').textContent = fmt(signal);
    $('[data-kpi-c]').textContent = fmt(thrust);
    $('[data-foot-l]').textContent = String(page);
    $('[data-foot-r]').textContent = String(Math.round(alt / 20));

    const baseName = base === 'alpha' ? 'Base Alpha' : 'Base Beta';
    $('[data-mission]').textContent = `${m.name} · ${baseName}`;

    let note = `${MODES[mode].label} · altitude ${fmt(altitude)}`;
    if (running) note = `Running · ${m.name} · ${fmt(altitude)} m`;
    if (locked) note = `Locked rail · ${note}`;
    $('[data-runnote]').textContent = note;

    $('[data-start]').textContent = running ? 'RUNNING' : 'START';
    $('[data-start]').setAttribute('aria-pressed', String(running));
    $('[data-lock]').setAttribute('aria-pressed', String(locked));
    $('[data-lock]').textContent = locked ? 'LOCKED' : 'LOCK';
    $('[data-alt]').disabled = locked;
  }

  $('[data-helmet]').innerHTML = helmetSvg();
  $('[data-land]').innerHTML = landSvg();

  seg($('[data-modes]'), (v) => { mode = v; render(); });

  $('[data-pager]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-page]');
    if (!b) return;
    page = +b.dataset.page;
    $$('[data-pager] [data-page]').forEach((el) => el.setAttribute('aria-selected', String(el === b)));
    render();
    b.focus();
  });

  $$('[data-base]').forEach((btn) => {
    btn.addEventListener('click', () => {
      base = btn.dataset.base;
      $$('[data-base]').forEach((el) => el.setAttribute('aria-pressed', String(el === btn)));
      render();
    });
  });

  $('[data-start]').addEventListener('click', () => {
    running = !running;
    render();
  });

  $('[data-lock]').addEventListener('click', () => {
    locked = !locked;
    render();
  });

  $('[data-knob]').addEventListener('click', () => {
    const on = $('[data-knob]').getAttribute('aria-pressed') === 'true';
    $('[data-knob]').setAttribute('aria-pressed', String(!on));
  });

  $('[data-alt]').addEventListener('input', render);

  render();
  document.documentElement.dataset.ready = 'true';
})();
