/* Motion & FX showcase page (#/fx) — live demos of gallery effects + icons. */
window.FxPage = {
  render(main) {
    const D = window.DASHBOARDS || {};
    const effects = D.fx_effects || [];
    const mats = D.material_recipes || [];
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    main.innerHTML = `
      <div class="s-wrap fx-page">
        <div class="cx-head" style="margin-bottom:28px">
          <div>
            <p class="s-eyebrow">Shared gallery runtime</p>
            <h1 class="s-h1" style="font-size:clamp(32px,4vw,48px)">Motion &amp; FX</h1>
            <p class="s-lead">Every <code>data-fx</code> effect and animated icon used by gallery dashboards. Toggle reduced motion to see the final state with no animation.</p>
          </div>
          <div class="cx-head-actions">
            <label class="s-btn" style="display:inline-flex;gap:8px;align-items:center;cursor:pointer">
              <input type="checkbox" data-fx-reduce> Reduced motion
            </label>
            <a class="s-btn" href="#/dashboards">Dashboards</a>
          </div>
        </div>

        <section class="s-panel" style="padding:20px;margin-bottom:24px">
          <h2 class="s-h3">Effects catalog</h2>
          <p class="s-muted s-small">${effects.length} effects · import <code>site/dashboards/_shared/fx/index.js</code></p>
          <div class="fx-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:16px">
            ${effects.map((e) => `<article class="s-panel" style="padding:16px" data-fx-demo="${esc(e.id)}">
              <h3 class="s-h3" style="font-size:16px">${esc(e.name)} <code class="s-small">data-fx="${esc(e.id)}"</code></h3>
              <p class="s-small s-muted">${esc(e.summary)}</p>
              <div class="fx-demo-stage" style="margin-top:12px;min-height:88px;display:grid;place-items:center;background:var(--s-panel-2,var(--s-bg));border-radius:12px;padding:12px"></div>
              <pre class="s-small" style="margin:12px 0 0;overflow:auto"><code data-snip>&lt;div data-fx="${esc(e.id)}"&gt;…&lt;/div&gt;</code></pre>
              <button type="button" class="s-btn s-btn-sm" data-copy>Copy snippet</button>
            </article>`).join('')}
          </div>
        </section>

        <section class="s-panel" style="padding:20px;margin-bottom:24px">
          <h2 class="s-h3">Animated icons</h2>
          <p class="s-muted s-small">Lucide-compatible paths · <code>data-icon</code> + <code>data-anim="hover"</code></p>
          <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:16px" data-icon-row></div>
        </section>

        <section class="s-panel" style="padding:20px;margin-bottom:64px">
          <h2 class="s-h3">Materials</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-top:16px">
            ${mats.map((m) => `<div class="mat-${esc(m.id === 'glass-dark' ? 'glass' : m.id)}" style="padding:20px;border-radius:16px;min-height:80px"><strong>${esc(m.name)}</strong><br><code class="s-small">${esc(m.id)}</code></div>`).join('')}
          </div>
        </section>
      </div>`;

    // Wire demos
    const stages = {
      reveal: (el) => { el.innerHTML = `<div data-fx="reveal" class="s-panel" style="padding:12px 16px">Reveal card</div>`; },
      count: (el) => { el.innerHTML = `<span data-fx="count" data-to="1280" class="num" style="font-size:28px;font-weight:600">0</span>`; },
      draw: (el) => { el.innerHTML = `<svg data-fx="draw" width="160" height="48" viewBox="0 0 160 48"><path class="fx-draw-line line" d="M4 40 C40 8 80 48 156 12" fill="none" stroke="currentColor" stroke-width="3"/></svg>`; },
      spotlight: (el) => { el.innerHTML = `<div data-fx="spotlight" class="s-panel" style="padding:24px;width:100%">Move pointer</div>`; },
      tilt: (el) => { el.innerHTML = `<div data-fx="tilt" class="s-panel" style="padding:24px">Tilt me</div>`; },
      magnet: (el) => { el.innerHTML = `<button type="button" class="s-btn s-btn-primary" data-fx="magnet">Magnetic</button>`; },
      split: (el) => { el.innerHTML = `<h3 data-fx="split" style="margin:0;font-size:22px">Split hero title</h3>`; },
      shine: (el) => { el.innerHTML = `<span data-fx="shine" style="font-weight:600;font-size:18px">Premium label</span>`; },
      parallax: (el) => { el.innerHTML = `<div data-fx="parallax" style="position:relative;height:64px;width:100%"><span data-fx-layer="1" style="position:absolute;inset:12px;background:var(--s-accent);opacity:.35;border-radius:8px"></span><span data-fx-layer="3" style="position:absolute;left:20%;right:20%;top:20px;height:24px;background:var(--s-ink);opacity:.2;border-radius:8px"></span></div>`; },
      ambient: (el) => { el.innerHTML = `<div data-fx="ambient" data-fx-dur="10" style="width:48px;height:48px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,var(--s-accent))"></div>`; },
      sparks: (el) => { el.innerHTML = `<button type="button" class="s-btn" data-fx="sparks" style="position:relative">Click for sparks</button>`; },
      list: (el) => { el.innerHTML = `<ul data-fx="list" style="list-style:none;margin:0;padding:0;width:100%"><li class="fx-list-item s-panel" style="padding:8px;margin:4px 0">Feed item A</li><li class="fx-list-item s-panel" style="padding:8px;margin:4px 0">Feed item B</li></ul>`; },
      odo: (el) => { el.innerHTML = `<span data-fx="odo" data-to="42" class="num" style="font-size:28px;font-weight:600">42</span>`; },
      route: (el) => { el.innerHTML = `<p class="s-small s-muted" style="margin:0">Auto in <code>DB.route</code> — View Transitions or 180ms fade.</p>`; },
    };

    main.querySelectorAll('[data-fx-demo]').forEach((card) => {
      const id = card.dataset.fxDemo;
      const stage = card.querySelector('.fx-demo-stage');
      (stages[id] || (() => {}))(stage);
      card.querySelector('[data-copy]')?.addEventListener('click', async () => {
        const snip = card.querySelector('[data-snip]')?.textContent || '';
        try { await navigator.clipboard.writeText(snip); } catch (_) {}
      });
    });

    const icons = ['home','chart','calendar','bell','user','settings','search','play','heart','sun','moon','cloud','drop','bolt','lock','thermometer','plus','shield','flame','music','headphones','camera','grid','sliders','activity','clock','star','sparkles','wallet','map'];
    const row = main.querySelector('[data-icon-row]');
    row.innerHTML = icons.map((n) => `<button type="button" class="s-iconbtn" title="${n}" aria-label="${n}" data-icon="${n}" data-anim="hover" style="width:44px;height:44px"></button>`).join('');

    // Load shared FX + icons modules
    const base = new URL('../dashboards/_shared/', import.meta?.url || location.href);
    // import.meta may be unavailable in classic script — use relative paths from site root
    const fxHref = 'dashboards/_shared/fx/index.js';
    const icHref = 'dashboards/_shared/icons/index.js';
    import(new URL(fxHref, location.href).href).then((m) => m.bootFx(main)).catch(() => {});
    import(new URL(icHref, location.href).href).then((m) => m.paintIcons(main)).catch(() => {});

    const box = main.querySelector('[data-fx-reduce]');
    box?.addEventListener('change', () => {
      document.documentElement.classList.toggle('fx-page-reduce', box.checked);
      if (box.checked) {
        main.querySelectorAll('[data-fx="reveal"],[data-fx="split"],[data-fx="draw"]').forEach((el) => el.classList.add('is-in'));
      }
    });
  },
  destroy() {},
};
