/* =========================================================================
   Showcase patterns: live reference implementations of
   docs/design/07-showcase-patterns.md. Vanilla JS, no polling, every clock
   pauses offscreen / in background tabs / under reduced motion.
   Showcase.render(mainEl, { theme, themes, onTheme })
   ========================================================================= */
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);

  // ---------------------------------------------------------------- visibility helper (offscreen + hidden tab)
  function watchVisible(el, cb) {
    let inView = false;
    const io = new IntersectionObserver((es) => { inView = es[0].isIntersecting; cb(inView && !document.hidden); }, { threshold: 0.15 });
    io.observe(el);
    const onVis = () => cb(inView && !document.hidden);
    document.addEventListener('visibilitychange', onVis);
    onCleanup(() => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); });
  }

  // ---------------------------------------------------------------- 1. story player + one-record machine + approval gate
  const STEPS = [
    { t: 'An inquiry arrives', c: 'A message comes in from the website form. It lands in the CRM, not in a crowded inbox.', col: -1, panel: 'inquiry' },
    { t: 'It becomes a client card', c: 'One click turns the message into a client with a next step and a due date.', col: 0, next: 'Book discovery call · Tomorrow', panel: 'card' },
    { t: 'Discovery call logged', c: 'The call summary lands on the card, and the card moves to Discovery call.', col: 1, next: 'Send proposal · Friday', panel: 'activity' },
    { t: 'Follow-up drafted', c: 'The assistant drafts the follow-up. Nothing is sent until you approve it.', col: 1, next: 'Waiting for your approval', panel: 'approval', gate: true },
    { t: 'Proposal sent', c: 'Approved and sent. The card moves on, with the email saved in its history.', col: 2, next: 'Check in · Next Tuesday', panel: 'sent' },
    { t: 'Won, invoice ready', c: 'Marked as won. The deposit invoice is drafted from the proposal for you to review.', col: 3, next: 'Kickoff meeting · Monday', panel: 'invoice' },
  ];
  const COLS = ['New inquiry', 'Discovery call', 'Proposal sent', 'Won'];
  const HOLD = 4800, RESULT = 6000, CLICK_HOLD = 8000;

  function panelHtml(p) {
    switch (p) {
      case 'inquiry': return `<div class="sc-label">Website form · just now</div>
        <div class="sp-msg"><div class="from"><span class="avatar">ML</span>Maya Lindqvist · Harbor & Pine Interiors</div><p>“Hi! We're refreshing our showroom this spring and would love a proposal. Budget around $8k. Can we talk next week?”</p></div>
        <button class="btn btn-primary" data-sp-go="1">${icon('plus')}Create client from message</button>`;
      case 'card': return `<div class="sc-label">New client</div>
        <dl class="crm-dl" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0"><div><dt>Stage</dt><dd><span class="badge badge-accent">New inquiry</span></dd></div><div><dt>Value</dt><dd class="num">$8,400</dd></div><div><dt>Source</dt><dd>Website form</dd></div><div><dt>Next step</dt><dd>Book discovery call</dd></div></dl>`;
      case 'activity': return `<div class="sc-label">Activity</div>
        <ol class="timeline"><li><div class="tl-icon">${icon('phone')}</div><div><div class="tl-title">Discovery call</div><div class="tl-body">Wants two layout options and natural materials. Decision by end of month.</div><div class="tl-when">Today</div></div></li>
        <li><div class="tl-icon">${icon('note')}</div><div><div class="tl-title">Created from website form</div><div class="tl-when">Yesterday</div></div></li></ol>`;
      case 'approval': return `<div class="sp-gate">${icon('alert')}<span>Paused at the approval gate. A person decides.</span></div>
        <div class="sp-msg"><div class="from">${icon('mail')}Draft · To Maya Lindqvist</div><p>“Thanks for the call today. Attached are two layout options with natural oak and linen, as discussed. Happy to walk through them Friday.”</p></div>
        <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" data-sp-edit>Edit draft</button><button class="btn btn-primary" data-sp-approve>${icon('check')}Approve & send</button></div>`;
      case 'sent': return `<div class="sc-label">Activity</div>
        <ol class="timeline"><li><div class="tl-icon">${icon('mail')}</div><div><div class="tl-title">Proposal sent (approved by you)</div><div class="tl-body">Two layout options · $8,400</div><div class="tl-when">Just now · sample, nothing was sent</div></div></li>
        <li><div class="tl-icon">${icon('phone')}</div><div><div class="tl-title">Discovery call</div><div class="tl-when">Today</div></div></li></ol>`;
      case 'invoice': return `<div class="sc-label">Draft invoice #318 · review before sending</div>
        <div class="sp-invoice"><div class="ln"><span>Showroom concept, 2 options</span><span class="num">$8,400</span></div><div class="ln"><span>Deposit (40%)</span><span class="num">$3,360</span></div><div class="ln"><span>Due on signing</span><span class="num">$3,360</span></div></div>
        <span class="badge badge-success" style="justify-self:start">Won · this month</span>`;
    }
    return '';
  }

  function storyPlayer(root) {
    root.innerHTML = `<div class="sp" aria-roledescription="story player" aria-label="How one client moves through the CRM">
      <div class="sp-steps" role="group" aria-label="Story steps">${STEPS.map((s, i) => `<button class="sp-step" data-sp-step="${i}"><b>${i + 1}${s.gate ? ' · needs you' : ''}</b>${esc(s.t)}<span class="bar"></span></button>`).join('')}</div>
      <div class="sp-body">
        <div class="sc-glass sp-screen">
          <div class="sp-screen-top"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="sc-label">Pipeline · sample data</span></div>
          <div class="sp-board" data-sp-board>${COLS.map((c, i) => `<div class="sp-col" data-col="${i}"><h4><span>${c}</span><span class="num">${[2, 1, 2, 3][i]}</span></h4>${'<div class="sp-ghost"></div>'.repeat([2, 1, 2, 2][i])}</div>`).join('')}
            <div class="sp-card hidden" data-sp-card aria-live="polite"><strong>Maya Lindqvist</strong><span>Harbor & Pine Interiors</span><span data-sp-next></span><span class="v">$8,400</span></div>
          </div>
        </div>
        <div class="sc-glass sp-side" data-sp-side aria-live="polite"></div>
      </div>
      <div class="sp-progress" aria-hidden="true"><span data-sp-prog></span></div>
      <div class="sp-foot">
        <p class="sp-caption" data-sp-cap></p>
        <div style="display:grid;gap:6px;justify-items:end">
          <div class="sp-controls"><button class="btn" data-sp-play aria-pressed="true"></button><button class="btn" data-sp-replay>${icon('arrowRight')}Replay</button></div>
          <span class="sp-status" data-sp-status></span>
        </div>
      </div>
    </div>`;
    const $ = (s) => root.querySelector(s);
    const card = $('[data-sp-card]'), board = $('[data-sp-board]'), prog = $('[data-sp-prog]');
    const st = { i: 0, t: 0, playing: !reduced(), visible: false, hold: 0, raf: 0, last: 0, lastPaint: 0 };

    function placeCard() {
      const s = STEPS[st.i];
      const cols = board.querySelectorAll('.sp-col');
      const col = cols[Math.max(0, s.col)];
      card.style.width = col.offsetWidth - 16 + 'px';
      card.style.transform = `translate(${col.offsetLeft + 8}px, 0)`;
      card.classList.toggle('hidden', s.col < 0);
      cols.forEach((c, k) => c.classList.toggle('target', k === s.col));
    }
    function show(i) {
      st.i = i; st.t = 0;
      const s = STEPS[i];
      root.querySelectorAll('[data-sp-step]').forEach((b, k) => { b.classList.toggle('done', k < i); if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); b.querySelector('.bar').style.transform = k < i ? 'scaleX(1)' : 'scaleX(0)'; });
      $('[data-sp-next]').textContent = s.next || '';
      $('[data-sp-side]').innerHTML = `<div class="sp-panel">${panelHtml(s.panel)}</div>`;
      $('[data-sp-cap]').innerHTML = `<b>${i + 1}. ${esc(s.t)}</b>${esc(s.c)}`;
      placeCard(); paintProgress(true); status();
    }
    const dur = () => (st.i === STEPS.length - 1 ? RESULT : HOLD);
    function status() {
      const s = STEPS[st.i];
      $('[data-sp-play]').innerHTML = st.playing ? `${icon('clock')}Pause` : `${icon('arrowRight')}Play`;
      $('[data-sp-play]').setAttribute('aria-pressed', String(st.playing));
      $('[data-sp-status]').textContent = s.gate ? 'Waiting for your approval. The story will not continue by itself.' : !st.playing ? (reduced() ? 'Reduced motion: press Play to start' : 'Paused') : st.hold > 0 ? 'Holding your selection' : st.visible ? '' : 'Paused while offscreen';
    }
    function paintProgress(force) {
      const now = performance.now();
      if (!force && now - st.lastPaint < 100) return; // ≤ 10 updates/s
      st.lastPaint = now;
      const f = STEPS[st.i].gate ? 0 : Math.min(1, st.t / dur());
      prog.style.transform = `scaleX(${f})`;
      const b = root.querySelector(`[data-sp-step="${st.i}"] .bar`); if (b) b.style.transform = `scaleX(${f})`;
    }
    function frame(now) {
      const dt = Math.min(100, now - (st.last || now)); st.last = now;
      if (st.hold > 0) { st.hold -= dt; if (st.hold <= 0) status(); }
      else if (!STEPS[st.i].gate) {
        st.t += dt;
        if (st.t >= dur()) show((st.i + 1) % STEPS.length);
      }
      paintProgress(false);
      st.raf = requestAnimationFrame(frame);
    }
    function sync() {
      const run = st.playing && st.visible;
      if (run && !st.raf) { st.last = 0; st.raf = requestAnimationFrame(frame); }
      if (!run && st.raf) { cancelAnimationFrame(st.raf); st.raf = 0; }
      status();
    }
    root.addEventListener('click', (e) => {
      const step = e.target.closest('[data-sp-step]');
      if (step) { show(+step.dataset.spStep); st.hold = CLICK_HOLD; status(); return; }
      if (e.target.closest('[data-sp-go]')) { show(1); st.hold = CLICK_HOLD; return; }
      if (e.target.closest('[data-sp-approve]')) { show(4); st.hold = 0; return; }
      if (e.target.closest('[data-sp-edit]')) { const p = root.querySelector('.sp-panel .sp-msg p'); p.contentEditable = 'true'; p.focus(); return; }
      if (e.target.closest('[data-sp-play]')) { st.playing = !st.playing; st.hold = 0; sync(); return; }
      if (e.target.closest('[data-sp-replay]')) { show(0); st.hold = 0; st.playing = true; sync(); }
    });
    root.addEventListener('keydown', (e) => {
      if (e.target.isContentEditable || e.target.closest('input,textarea')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); show(Math.min(STEPS.length - 1, st.i + 1)); st.hold = CLICK_HOLD; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(Math.max(0, st.i - 1)); st.hold = CLICK_HOLD; }
    });
    const ro = new ResizeObserver(() => placeCard()); ro.observe(board); onCleanup(() => ro.disconnect());
    watchVisible(root, (v) => { st.visible = v; sync(); });
    onCleanup(() => cancelAnimationFrame(st.raf));
    show(0);
    return { go: (i) => { show(i); st.hold = CLICK_HOLD; status(); root.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' }); } };
  }

  // ---------------------------------------------------------------- 2. device frames
  function devices(root, theme) {
    root.innerHTML = `<div class="dev-row" data-dev-row>
      <div class="dev dev-laptop" data-dev><div class="bezel"><div class="screen"><div class="mount" data-mount="1280"></div></div></div><div class="base"></div></div>
      <div class="dev dev-phone" data-dev><div class="bezel"><div class="screen"><div class="mount" data-mount="390" data-view="pipeline"></div></div></div></div>
    </div>
    <div class="dev-controls" role="group" aria-label="Turn the devices"><button class="btn btn-sm" data-tilt="-1">Turn left</button><button class="btn btn-sm" data-tilt="0">Front</button><button class="btn btn-sm" data-tilt="1">Turn right</button></div>`;
    root.querySelectorAll('[data-mount]').forEach((m) => {
      CRM.mount(m, { theme, static: true, view: m.dataset.view || 'today' });
      const w = +m.dataset.mount;
      const fit = () => { const box = m.parentElement; const s = box.clientWidth / w; m.style.width = w + 'px'; m.style.height = box.clientHeight / s + 'px'; m.style.transform = `scale(${s})`; };
      fit(); const ro = new ResizeObserver(fit); ro.observe(m.parentElement); onCleanup(() => ro.disconnect());
    });
    const devs = root.querySelectorAll('[data-dev]');
    const set = (rx, ry) => devs.forEach((d, i) => (d.style.transform = `rotateX(${rx}deg) rotateY(${ry + (i ? -4 : 4)}deg)`));
    set(0, 0);
    root.addEventListener('click', (e) => { const b = e.target.closest('[data-tilt]'); if (b) set(0, +b.dataset.tilt * 14); });
    if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced()) {
      const row = root.querySelector('[data-dev-row]');
      row.addEventListener('pointermove', (e) => {
        const r = row.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        set(-y * 7, x * 7); // bounded ≤ 7°
      });
      row.addEventListener('pointerleave', () => set(0, 0));
    }
  }

  // ---------------------------------------------------------------- 3. before / after
  function beforeAfter(root, theme) {
    const rows = [
      ['Maya L', 'harbor pine', '8400?', 'called?? follow up', '11/10', 'y'],
      ['Theo M.', 'Marchetti', '3200', 'disc call 2pm', 'today', ''],
      ['ava', 'northlight studio', '', 'REPLY!!', '', 'r'],
      ['Jonah Reyes', 'Reyes Arch', '12,600', 'terms', '11/13', 'g'],
      ['Priya', 'Bloom', '5800', 'proposal sent? check', '', 'y'],
      ['Lucas F', '', '1.8k', 'book intro', '', ''],
      ['Elliot Park', 'Park + co', '4100', 'case studies (who?)', '???', 'r'],
      ['Felix B', 'Brandt Hotels', '15800', 'agenda', '11/18', ''],
      ['Hana S', 'sato ceramics', '6900', 'contract', '', 'g'],
      ['Ruben', 'Ortiz', '3600', 'budget?', 'tmrw', ''],
      ['Isla M', 'Morgan Events', '4700', 'questions', '', 'y'],
    ];
    root.innerHTML = `<div class="ba" style="--pos:50%">
      <div class="ba-layer ba-after"><div class="mount" data-mount="1280"></div></div>
      <div class="ba-layer ba-before"><div class="sheet-xls"><div class="bar"><span>File</span><span>Edit</span><span>View</span><span>clients_FINAL_v3 (2).xlsx</span></div>
        <table><thead><tr><th></th><th>A name</th><th>B company</th><th>C $</th><th>D notes</th><th>E when</th></tr></thead><tbody>${rows.map((r, i) => `<tr><th>${i + 1}</th>${r.slice(0, 5).map((c, k) => `<td class="${k === 3 ? r[5] : ''}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>
      <span class="ba-tag l">Before: the spreadsheet</span><span class="ba-tag r">After: the Today view</span>
      <div class="ba-line"></div>
      <input type="range" min="0" max="100" value="50" aria-label="Compare before and after. Left shows the spreadsheet, right shows the dashboard" data-ba>
      <div class="ba-knob" aria-hidden="true">${icon('move')}</div>
    </div>`;
    const m = root.querySelector('[data-mount]');
    CRM.mount(m, { theme, static: true });
    const fit = () => { const box = root.querySelector('.ba'); const s = Math.min(1, box.clientWidth / 1280) ; m.style.width = '1280px'; m.style.height = box.clientHeight / s + 'px'; m.style.transform = `scale(${s})`; };
    fit(); const ro = new ResizeObserver(fit); ro.observe(root.querySelector('.ba')); onCleanup(() => ro.disconnect());
    const input = root.querySelector('[data-ba]');
    input.addEventListener('input', () => root.querySelector('.ba').style.setProperty('--pos', input.value + '%'));
  }

  // ---------------------------------------------------------------- 4. approval gate / agent deck
  function agentDeck(root) {
    const time = () => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date()).replace(/\s?[AP]M/, '');
    root.innerHTML = `<div class="agent">
      <section class="sc-glass agent-card" aria-labelledby="ag-h">
        <div class="agent-head"><div class="agent-who"><span class="avatar lg">BK</span><div><h3 id="ag-h" style="font-size:var(--text-lg);font-weight:var(--weight-semibold)">Bookkeeper assistant</h3><p class="muted" style="font-size:var(--text-sm)">Prepared 2 invoice reminders · sample</p></div></div>
          <label style="display:flex;gap:10px;align-items:center;font-size:var(--text-sm)"><span data-ag-state>Active</span><button class="switch" role="switch" aria-checked="true" aria-label="Assistant active" data-ag-switch></button></label></div>
        <div class="draft"><input type="checkbox" checked id="d1" data-ag-pick><label for="d1"><strong style="font-size:var(--text-sm)">Harbor & Pine Interiors: invoice #318</strong><p>7 days overdue · friendly reminder with payment link</p></label></div>
        <div class="draft"><input type="checkbox" checked id="d2" data-ag-pick><label for="d2"><strong style="font-size:var(--text-sm)">Bloom Wellness: invoice #322</strong><p>Due tomorrow · gentle heads-up</p></label></div>
        <div class="agent-actions"><span class="sc-label" data-ag-cost>Cost of this run: $0.02</span><button class="btn" data-ag-edit>Edit wording</button><button class="btn btn-primary" data-ag-approve>${icon('check')}<span>Approve & send 2 reminders</span></button></div>
      </section>
      <section class="sc-glass agent-card" aria-labelledby="log-h">
        <h3 id="log-h" style="font-size:var(--text-md);font-weight:var(--weight-semibold)">Activity log</h3>
        <ul class="log" data-ag-log><li><time>9:58</time><span>Checked 14 open invoices</span></li><li><time>9:58</time><span>Drafted 2 reminders · <strong>waiting for review</strong></span></li></ul>
        <div class="field"><label class="label" for="ag-budget">Monthly spending limit</label><input class="range" type="range" id="ag-budget" min="1" max="20" value="5" data-ag-budget><div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-muted)"><span>Used $0.31</span><span data-ag-limit>Limit $5</span></div><div class="meter"><span data-ag-meter style="width:6.2%"></span></div></div>
      </section></div>`;
    const $ = (s) => root.querySelector(s);
    const log = (msg) => { const li = document.createElement('li'); li.className = 'new'; li.innerHTML = `<time>${time()}</time><span>${msg}</span>`; $('[data-ag-log]').prepend(li); };
    const count = () => root.querySelectorAll('[data-ag-pick]:checked').length;
    const label = () => { const n = count(); $('[data-ag-approve] span').textContent = n ? `Approve & send ${n} reminder${n > 1 ? 's' : ''}` : 'Select a reminder'; $('[data-ag-approve]').disabled = !n || $('[data-ag-switch]').getAttribute('aria-checked') === 'false'; };
    root.addEventListener('change', (e) => {
      if (e.target.matches('[data-ag-pick]')) label();
      if (e.target.matches('[data-ag-budget]')) { const v = +e.target.value; $('[data-ag-limit]').textContent = `Limit $${v}`; $('[data-ag-meter]').style.width = Math.min(100, (0.31 / v) * 100) + '%'; log(`You set the monthly limit to $${v}`); }
    });
    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-ag-switch]')) {
        const sw = $('[data-ag-switch]'); const on = sw.getAttribute('aria-checked') !== 'true';
        sw.setAttribute('aria-checked', String(on)); $('[data-ag-state]').textContent = on ? 'Active' : 'Paused'; log(on ? 'You resumed the assistant' : 'You paused the assistant. Nothing will run.'); label();
      }
      if (e.target.closest('[data-ag-edit]')) {
        root.querySelectorAll('.draft').forEach((d) => { if (!d.querySelector('textarea')) { const t = document.createElement('textarea'); t.className = 'textarea'; t.value = 'Hi! A friendly reminder that invoice ' + d.querySelector('strong').textContent.split(': ')[1] + ' is ready to pay. Thank you!'; t.setAttribute('aria-label', 'Reminder wording'); d.querySelector('label').append(t); } });
        root.querySelector('.draft textarea').focus();
      }
      if (e.target.closest('[data-ag-approve]')) {
        const n = count(); if (!n) return;
        log(`<strong>You approved ${n} reminder${n > 1 ? 's' : ''}</strong> · sent (sample, nothing left this page)`);
        const b = $('[data-ag-approve]'); b.disabled = true; b.querySelector('span').textContent = 'Sent · sample';
        root.querySelectorAll('[data-ag-pick]').forEach((c) => (c.disabled = true));
      }
    });
  }

  // ---------------------------------------------------------------- 5. spring physics (damped spring, RK4)
  function springDemo(root) {
    root.innerHTML = `<div class="spring-wrap">
      <div class="spring-area" data-sg-area><div class="home" aria-hidden="true"></div>
        <div class="spring-card" data-sg-card tabindex="0" role="button" aria-label="Draggable card. Press Enter to nudge it."><strong style="font-size:var(--text-sm)">Drag me, then let go</strong><span class="muted" style="font-size:var(--text-xs)">Springs home with tension and friction</span><span class="badge badge-accent" style="justify-self:start">Direct manipulation</span></div></div>
      <div class="sc-glass spring-controls">
        <div class="field"><label class="label" for="sg-t">Tension <output data-sg-to>100</output></label><input class="range" type="range" id="sg-t" min="20" max="400" value="100" data-sg-t></div>
        <div class="field"><label class="label" for="sg-f">Friction <output data-sg-fo>20</output></label><input class="range" type="range" id="sg-f" min="4" max="60" value="20" data-sg-f></div>
        <button class="btn" data-sg-nudge>${icon('move')}Nudge the card</button>
        <p class="hint">Springs belong to things people move. Ambient UI motion stays on the 100–300 ms tokens without overshoot.</p>
      </div></div>`;
    const card = root.querySelector('[data-sg-card]'), area = root.querySelector('[data-sg-area]');
    let k = 100, c = 20, x = 0, y = 0, vx = 0, vy = 0, raf = 0, drag = null, last = 0;
    const apply = () => (card.style.transform = `translate(${x}px, ${y}px) rotate(${x * 0.03}deg)`);
    const acc = (p, v) => -k * p - c * v; // unit mass
    function step(dt) { // RK4 for each axis
      const rk = (p, v) => {
        const a1v = v, a1a = acc(p, v);
        const a2v = v + a1a * dt / 2, a2a = acc(p + a1v * dt / 2, a2v);
        const a3v = v + a2a * dt / 2, a3a = acc(p + a2v * dt / 2, a3v);
        const a4v = v + a3a * dt, a4a = acc(p + a3v * dt, a4v);
        return [p + (dt / 6) * (a1v + 2 * a2v + 2 * a3v + a4v), v + (dt / 6) * (a1a + 2 * a2a + 2 * a3a + a4a)];
      };
      [x, vx] = rk(x, vx); [y, vy] = rk(y, vy);
    }
    function loop(now) {
      const dt = Math.min(0.032, (now - (last || now)) / 1000); last = now;
      for (let i = 0; i < 4; i++) step(dt / 4);
      apply();
      if (Math.abs(x) + Math.abs(y) < 0.3 && Math.abs(vx) + Math.abs(vy) < 0.3) { x = y = vx = vy = 0; apply(); raf = 0; return; }
      raf = requestAnimationFrame(loop);
    }
    const release = () => { if (reduced()) { x = y = vx = vy = 0; apply(); return; } if (!raf) { last = 0; raf = requestAnimationFrame(loop); } };
    card.addEventListener('pointerdown', (e) => { cancelAnimationFrame(raf); raf = 0; drag = { sx: e.clientX - x, sy: e.clientY - y, t: e.timeStamp, px: e.clientX, py: e.clientY }; card.setPointerCapture(e.pointerId); });
    card.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const r = area.getBoundingClientRect(); const lim = (v, m) => Math.max(-m, Math.min(m, v));
      const dt = Math.max(1, e.timeStamp - drag.t) / 1000;
      vx = (e.clientX - drag.px) / dt; vy = (e.clientY - drag.py) / dt; drag.px = e.clientX; drag.py = e.clientY; drag.t = e.timeStamp;
      x = lim(e.clientX - drag.sx, r.width / 2 - 60); y = lim(e.clientY - drag.sy, r.height / 2 - 40); apply();
    });
    const end = () => { if (drag) { drag = null; release(); } };
    card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
    const nudge = () => { x = 140; y = -60; vx = 0; vy = 0; apply(); release(); };
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nudge(); } });
    root.querySelector('[data-sg-nudge]').addEventListener('click', nudge);
    root.addEventListener('input', (e) => {
      if (e.target.matches('[data-sg-t]')) { k = +e.target.value; root.querySelector('[data-sg-to]').textContent = k; }
      if (e.target.matches('[data-sg-f]')) { c = +e.target.value; root.querySelector('[data-sg-fo]').textContent = c; }
    });
    onCleanup(() => cancelAnimationFrame(raf));
  }

  // ---------------------------------------------------------------- 6. view transitions (tile → detail)
  function viewTransitions(root) {
    const tiles = [
      { id: 'pipe', label: 'Open pipeline', value: '$69k', delta: '▲ 12% vs last month', series: [[38, 'Jun'], [44, 'Jul'], [41, 'Aug'], [52, 'Sep'], [58, 'Oct'], [69, 'Nov']] },
      { id: 'won', label: 'Won this month', value: '$25k', delta: '3 clients', series: [[8, 'Jun'], [12, 'Jul'], [9, 'Aug'], [15, 'Sep'], [14, 'Oct'], [25, 'Nov']] },
      { id: 'rate', label: 'Win rate · 90 days', value: '60%', delta: '5 closed', series: [[40, 'Jun'], [45, 'Jul'], [50, 'Aug'], [48, 'Sep'], [55, 'Oct'], [60, 'Nov']] },
    ];
    let open = null;
    const unit = (t, v) => (t.id === 'rate' ? v + '%' : '$' + v + 'k');
    function render() {
      root.innerHTML = open
        ? (() => { const t = tiles.find((x) => x.id === open); return `<div class="vt-detail" style="view-transition-name:vt-${t.id}"><div class="vt-detail-head"><div><p class="kpi-label">${t.label}</p><p class="kpi-value" style="font-size:var(--text-3xl)">${t.value}</p><p class="kpi-delta">${t.delta}</p></div><button class="btn" data-vt-back>${icon('x')}Back to overview</button></div>${CRM.columns(t.series.map(([v, l]) => ({ value: v, label: l, display: unit(t, v) })), { label: t.label + ' by month' })}</div>`; })()
        : `<div class="vt-grid">${tiles.map((t) => `<button class="vt-tile" data-vt="${t.id}" style="view-transition-name:vt-${t.id}" aria-label="${t.label}: ${t.value}. Open details"><span class="kpi-label">${t.label}</span><span class="kpi-value">${t.value}</span><span class="kpi-delta">${t.delta}</span></button>`).join('')}</div>`;
    }
    function change(next, focusSel) {
      const run = () => { open = next; render(); const f = root.querySelector(focusSel); f && f.focus(); };
      if (document.startViewTransition && !reduced()) document.startViewTransition(run); else run();
    }
    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-vt]'); if (t) change(t.dataset.vt, '[data-vt-back]');
      if (e.target.closest('[data-vt-back]')) { const prev = open; change(null, `[data-vt="${prev}"]`); }
    });
    render();
  }

  // ---------------------------------------------------------------- 7. feature cards with pointer light
  function features(root, player) {
    const F = [
      ['inbox', 'Never miss an inquiry', 'Website messages become clients with a next step.', 0],
      ['phone', 'Every call on record', 'Call notes land on the client and move the card.', 2],
      ['shield', 'Drafts wait for you', 'The assistant prepares; you approve before anything is sent.', 3],
      ['check', 'Won means invoiced', 'A deposit invoice is drafted the moment you win.', 5],
    ];
    root.innerHTML = `<div class="feat-grid">${F.map(([ic, t, d, step]) => `<button class="feat" data-feat="${step}"><span class="feat-icon">${icon(ic)}</span><h3>${t}</h3><p>${d}</p><span class="go">See it in the story →</span></button>`).join('')}</div>`;
    root.addEventListener('pointermove', (e) => {
      const f = e.target.closest('.feat'); if (!f) return;
      const r = f.getBoundingClientRect(); f.style.setProperty('--mx', e.clientX - r.left + 'px'); f.style.setProperty('--my', e.clientY - r.top + 'px');
    });
    root.addEventListener('click', (e) => { const f = e.target.closest('[data-feat]'); if (f && player) player.go(+f.dataset.feat); });
  }

  // ---------------------------------------------------------------- 8. glass do / don't
  function glassRules(root) {
    const text = 'Harbor & Pine Interiors · Proposal sent · $8,400 · Send revised quote · Bloom Wellness · Follow up · Theo Marchetti · Discovery call at 2 pm · Reyes Architecture · Final terms · ';
    root.innerHTML = `<div class="gl-pair">
      <div><div class="gl-demo"><div class="bgtext" aria-hidden="true">${text.repeat(3)}</div><div class="over bad">Next step: Send revised quote · due Friday</div></div><p class="s-small" style="margin:10px 0 0"><b style="color:#c0392b">Don't:</b> <span class="s-muted">data on glass. The text behind it fights the text on top.</span></p></div>
      <div><div class="gl-demo"><div class="bgtext" aria-hidden="true">${text.repeat(3)}</div><div class="over good">Next step: Send revised quote · due Friday</div></div><p class="s-small" style="margin:10px 0 0"><b style="color:#2e8b57">Do:</b> <span class="s-muted">data on an opaque surface. Save glass for frames, captions and nav.</span></p></div>
    </div>`;
  }

  // ---------------------------------------------------------------- page
  const SECTIONS = [
    ['story', 'Story player', 'Workflow story player + one-record machine', 'Explain the product in 20 seconds: one client travels across the pipeline, one step at a time. The visitor controls it, and it stops at the approval gate.', ['Steps hold ~5 s, result 6 s; a click holds 8 s', 'The same card moves (transform only)', 'Pauses offscreen, in background tabs and under reduced motion', 'Keyboard: ← → on the player']],
    ['devices', 'Device frames', 'Real HTML in device frames', 'The live app inside CSS laptop and phone frames with bevel, glass highlight and contact shadow. Not screenshots.', ['Tilt ≤ 7°, mouse only; buttons for everyone else', 'Text inside stays flat', 'The phone uses the app\'s real narrow layout']],
    ['compare', 'Before / after', 'Before / after reveal', 'Show the change a client is paying for. Built on a native range input, so keyboard and screen readers work for free.', ['Drag, or focus and use ← →', 'Label both sides', 'Align the two panes']],
    ['approval', 'Approval gate', 'AI assistant with an approval gate', 'Automation earns trust when its work is visible, editable and waits for a person. Show the cost, a pause switch, a spending limit and a log.', ['Approve is a specific, labeled action', 'Paused means nothing runs', 'Every action lands in the log']],
    ['spring', 'Spring physics', 'Spring physics for direct manipulation', 'A damped spring (RK4) makes dragged things feel physical. Tune tension and friction and feel the difference.', ['Use only for what people drag or press', 'Reduced motion jumps to the end state', 'Default tension 100, friction 20']],
    ['continuity', 'View transitions', 'Continuity with View Transitions', 'A KPI tile morphs into its detail view with the native View Transitions API. Without support it simply switches.', ['Matching view-transition-name on both states', 'Focus moves to the new view and back', 'Skipped under reduced motion']],
    ['features', 'Feature cards', 'Feature cards that open the story', 'Physical icons, material depth and pointer light. Each card jumps the story player to the step that proves it.', ['Lighting follows pointer and keyboard focus', 'Actions open the relevant step, not a generic page']],
    ['glass', 'Glass rules', 'Glass worlds: where glass belongs', 'Cinematic themes use glass for showcase chrome. Data always sits on an opaque surface.', ['Thread gradient for lines, progress and focus only', 'At most two accents']],
  ];

  function render(main, opts) {
    cleanups.splice(0).forEach((f) => f());
    let theme = opts.theme && opts.themes.find((t) => t.id === opts.theme) ? opts.theme : 'grove';
    main.innerHTML = `
      <div class="s-wrap"><div class="s-pagehead" style="padding-bottom:16px"><div><p class="s-eyebrow">Showcase patterns · live references for docs/design/07-showcase-patterns.md</p><h1 class="s-h1" style="font-size:clamp(36px,5vw,56px)">Show it like a product</h1>
        <p class="s-lead">Ways to present a working dashboard at handover, on a landing page or in a pitch. The working app is the hero: every sequence is visitor-controlled, pauses when unseen, and stops for human approval.</p></div>
        <a class="s-btn" href="#/docs/docs/design/07-showcase-patterns.md">${icon('book')}Read the pattern guide</a></div></div>
      <div class="sc-nav"><div class="sc-nav-in"><div class="sc-nav-links">${SECTIONS.map(([id, short]) => `<button data-sc-jump="${id}">${short}</button>`).join('')}</div>
        <label class="s-small" style="display:flex;gap:8px;align-items:center">Theme <select class="s-select" data-sc-theme>${['cinematic', 'classic'].map((fam) => `<optgroup label="${fam === 'cinematic' ? 'Cinematic glass' : 'Classic'}">${opts.themes.filter((t) => (t.family || 'classic') === fam).map((t) => `<option value="${t.id}" ${t.id === theme ? 'selected' : ''}>${t.name}</option>`).join('')}</optgroup>`).join('')}</select></label></div></div>
      ${SECTIONS.map(([id, , title, lead, rules], n) => `
        <section class="sc-sec" id="sc-${id}" aria-labelledby="sc-h-${id}"><div class="s-wrap">
          <div class="sc-head"><div><p class="s-eyebrow">Pattern ${n + 1}</p><h2 class="s-h2" id="sc-h-${id}">${title}</h2><p class="s-lead">${lead}</p></div><ul class="sc-rules">${rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>
          <div class="sc-stage themed" data-theme="${theme}" data-sc="${id}"></div>
        </div></section>`).join('')}`;
    const stage = (id) => main.querySelector(`[data-sc="${id}"]`);
    const build = () => {
      cleanups.splice(0).forEach((f) => f());
      const player = storyPlayer(stage('story'));
      devices(stage('devices'), theme);
      beforeAfter(stage('compare'), theme);
      agentDeck(stage('approval'));
      springDemo(stage('spring'));
      viewTransitions(stage('continuity'));
      features(stage('features'), player);
      glassRules(stage('glass'));
      // section nav current marker
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) main.querySelectorAll('[data-sc-jump]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.scJump === e.target.id.slice(3)))); }), { rootMargin: '-45% 0px -50% 0px' });
      main.querySelectorAll('.sc-sec').forEach((s) => io.observe(s)); onCleanup(() => io.disconnect());
    };
    build();
    main.querySelector('[data-sc-theme]').addEventListener('change', (e) => {
      theme = e.target.value; opts.onTheme && opts.onTheme(theme);
      main.querySelectorAll('[data-sc]').forEach((s) => (s.dataset.theme = theme));
      build();
    });
    main.addEventListener('click', (e) => { const b = e.target.closest('[data-sc-jump]'); if (b) document.getElementById('sc-' + b.dataset.scJump).scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' }); });
  }
  window.Showcase = { render, destroy: () => cleanups.splice(0).forEach((f) => f()) };
})();
