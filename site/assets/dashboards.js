/* =========================================================================
   Dashboards gallery: browse catalog/dashboards.json (window.DASHBOARDS)
   grouped by style family or use case; detail view previews the live
   dashboard (site/dashboards/<id>/) in Desktop / Tablet / Phone with its
   variants. Dashboards.render(main, id?) · Dashboards.destroy()
   ========================================================================= */
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const REPO = 'https://github.com/SacredRebel/dashboard-tools-';
  const cleanups = [];
  const state = { q: '', group: 'family', mode: '', uc: '', fam: '' };
  try { Object.assign(state, JSON.parse(sessionStorage.getItem('dt-dash') || '{}')); } catch (e) { /* storage blocked */ }
  const save = () => { try { sessionStorage.setItem('dt-dash', JSON.stringify(state)); } catch (e) { /* ignore */ } };
  // Folder URL with a trailing slash so relative CSS/JS inside the dashboard resolve on any host;
  // file:// can't serve a folder, so it gets index.html explicitly.
  const dashUrl = (id) => `dashboards/${id}/${location.protocol === 'file:' ? 'index.html' : ''}`;
  const DEVICES = { desktop: [1440, 900, 'Desktop'], tablet: [834, 1112, 'Tablet'], phone: [390, 844, 'Phone'] };

  function toast(msg) { const t = document.createElement('div'); t.className = 's-toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.append(t); setTimeout(() => t.remove(), 1800); }
  async function copy(text, msg = 'Copied to clipboard') {
    try { await navigator.clipboard.writeText(text); } catch (e) { const ta = document.createElement('textarea'); ta.value = text; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toast(msg);
  }

  function render(main, id) {
    cleanups.splice(0).forEach((f) => f());
    const D = window.DASHBOARDS;
    const fam = Object.fromEntries(D.style_families.map((f) => [f.id, f]));
    const uc = Object.fromEntries(D.use_cases.map((u) => [u.id, u]));
    const list = [...D.dashboards].sort((a, b) => a.number - b.number);
    const swatches = (d) => `<span class="dg-sw" aria-label="Palette">${['bg', 'surface', 'accent', 'text', 'muted'].map((k) => `<i style="background:${d.palette[k]}" title="${k} ${d.palette[k]}"></i>`).join('')}</span>`;
    if (id) return detail(main, list.find((d) => d.id === id), list, fam, uc, swatches);

    const usedFam = D.style_families.filter((f) => list.some((d) => d.style_family === f.id));
    const usedUc = D.use_cases.filter((u) => list.some((d) => d.use_cases.includes(u.id)));
    main.innerHTML = `
      <div class="s-wrap"><div class="s-pagehead" style="padding-bottom:16px"><div>
        <p class="s-eyebrow">Dashboards · ${list.length} ${list.length === 1 ? 'style' : 'styles'} · ${D.style_families.length} style families · every one themeable</p>
        <h1 class="s-h1" style="font-size:clamp(36px,5vw,56px)">Pick a dashboard style</h1>
        <p class="s-lead">Complete, working reference dashboards, each with its own theme and variants. Browse by look or by what you're building; open one to preview it live on desktop, tablet and phone. Agents pick from the same list in <code>catalog/dashboards.json</code>.</p></div>
        <div class="cx-head-actions"><a class="s-btn" href="#/docs/docs/dashboards/README.md">${icon('book')}How to choose</a><a class="s-btn" href="#/docs/docs/dashboards/01-add-a-dashboard.md">${icon('plus')}Add a dashboard</a></div></div></div>
      <div class="sc-nav"><div class="sc-nav-in dg-bar">
        <div class="s-search dg-search">${icon('search')}<label class="vh" for="dg-q">Search dashboards</label><input id="dg-q" type="search" placeholder="Search name, mood, component…" value="${esc(state.q)}"></div>
        <div class="dg-ctrls">
          <div class="dg-seg" role="group" aria-label="Group by"><button data-group="family" aria-pressed="${state.group === 'family'}">By style</button><button data-group="usecase" aria-pressed="${state.group === 'usecase'}">By use case</button></div>
          <label class="s-small">Style <select class="s-select" data-f="fam"><option value="">All</option>${usedFam.map((f) => `<option value="${f.id}" ${state.fam === f.id ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}</select></label>
          <label class="s-small">Use case <select class="s-select" data-f="uc"><option value="">All</option>${usedUc.map((u) => `<option value="${u.id}" ${state.uc === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select></label>
          <label class="s-small">Mode <select class="s-select" data-f="mode"><option value="">Any</option><option value="dark" ${state.mode === 'dark' ? 'selected' : ''}>Dark</option><option value="light" ${state.mode === 'light' ? 'selected' : ''}>Light</option></select></label>
        </div></div></div>
      <div class="s-wrap"><p class="s-results-meta" data-meta aria-live="polite"></p><div data-groups class="dg-groups"></div></div>`;

    function draw() {
      const q = state.q.trim().toLowerCase();
      const hits = list.filter((d) => (!state.mode || d.mode === state.mode) && (!state.uc || d.use_cases.includes(state.uc)) && (!state.fam || d.style_family === state.fam)
        && (!q || [d.name, d.summary, d.signature, fam[d.style_family].name, ...d.mood, ...d.components, ...d.use_cases.map((u) => uc[u].name)].join(' ').toLowerCase().includes(q)));
      main.querySelector('[data-meta]').textContent = `${hits.length} of ${list.length} shown`;
      const groups = state.group === 'family'
        ? D.style_families.map((f) => [f.name, f.blurb, hits.filter((d) => d.style_family === f.id)])
        : D.use_cases.map((u) => [u.name, '', hits.filter((d) => d.use_cases.includes(u.id))]);
      const shown = groups.filter(([, , l]) => l.length);
      main.querySelector('[data-groups]').innerHTML = shown.length ? shown.map(([name, blurb, l]) => `
        <section class="dg-group"><div class="dg-group-head"><h2 class="s-h2">${esc(name)} <span class="dg-count">${l.length}</span></h2>${blurb ? `<p class="s-muted">${esc(blurb)}</p>` : ''}</div>
          <div class="dg-grid">${l.map((d) => `
            <a class="dg-card" href="#/dashboards/${d.id}" aria-label="${esc(d.name)}: ${esc(fam[d.style_family].name)}, ${d.mode}. Open preview">
              <span class="dg-thumb"><img src="dashboards/${d.id}/thumb.jpg" alt="" width="720" height="450" loading="lazy" decoding="async"><span class="dg-num num">${String(d.number).padStart(2, '0')}</span></span>
              <span class="dg-card-body">
                <span class="dg-card-top"><b>${esc(d.name)}</b>${swatches(d)}</span>
                <span class="dg-card-sum">${esc(d.summary)}</span>
                <span class="dg-tags"><span class="s-tag">${esc(fam[d.style_family].name)}</span>${d.use_cases.map((u) => `<span class="s-tag">${esc(uc[u].name)}</span>`).join('')}<span class="s-tag">${d.mode}</span><span class="s-tag">${d.variants.length} variants</span></span>
              </span></a>`).join('')}</div></section>`).join('')
        : `<div class="s-empty">No dashboards match. <button class="s-btn s-btn-sm" data-reset>Clear filters</button></div>`;
      save();
    }
    draw();
    main.querySelector('#dg-q').addEventListener('input', (e) => { state.q = e.target.value; draw(); });
    main.addEventListener('change', (e) => { const f = e.target.closest('[data-f]'); if (f) { state[f.dataset.f] = f.value; draw(); } });
    main.addEventListener('click', (e) => {
      const g = e.target.closest('[data-group]'); if (g) { state.group = g.dataset.group; main.querySelectorAll('[data-group]').forEach((b) => b.setAttribute('aria-pressed', String(b === g))); draw(); }
      if (e.target.closest('[data-reset]')) { Object.assign(state, { q: '', mode: '', uc: '', fam: '' }); render(main); }
    });
  }

  function detail(main, d, list, fam, uc, swatches) {
    if (!d) { main.innerHTML = `<div class="s-wrap"><div class="s-empty" style="margin:64px 0">That dashboard doesn't exist. <a class="s-btn s-btn-sm" href="#/dashboards">See all dashboards</a></div></div>`; return; }
    const i = list.indexOf(d), prev = list[i - 1], next = list[i + 1];
    const pages = d.pages?.length ? d.pages : [{ id: 'overview', name: 'Overview', pattern: 'Dashboard' }];
    let device = 'desktop', variant = 'default', view = 'live', pageId = pages[0].id;
    const src = () => `${dashUrl(d.id)}?embed=1${variant === 'default' ? '' : `&variant=${variant}`}#/${pageId}`;
    const prompt = `Use the "${d.name}" dashboard style from the Dashboard Tools gallery for <project>.
1. Read catalog/dashboards.json → entry "${d.id}" and open site/dashboards/${d.id}/ (index.html, style.css, app.js, shot.jpg).
2. Copy the :root tokens from style.css into the project theme (token names match design-system/tokens.css).${d.variants.length > 1 ? ` Variants available: ${d.variants.map((v) => v.id).join(', ')}.` : ''}
3. Rebuild the layout (${d.layout.pattern}): ${d.layout.structure}. Pages: ${pages.map((p) => p.id).join(', ')}.
4. Keep the signature: ${d.signature}
5. Replace all sample copy and data with the client's real words and fields; follow AGENTS.md and the rulebook.
Show me the screen plan before building.`;
    const refFile = d.reference || null;
    const motion = d.motion || [];
    const files = ['index.html', 'style.css', 'app.js', 'thumb.jpg', 'shot.jpg'].concat(refFile ? [refFile] : []);
    const viewBtns = refFile
      ? [['live', 'Live'], ['original', 'Original reference'], ['compare', 'Compare']]
      : [];
    main.innerHTML = `
      <div class="s-wrap dg-detail">
        <nav class="dg-crumbs" aria-label="Breadcrumb"><a class="s-link" href="#/dashboards">← All dashboards</a><span class="s-muted s-small">${esc(fam[d.style_family].name)}</span></nav>
        <div class="dg-head">
          <div>
            <p class="s-eyebrow">Dashboard ${String(d.number).padStart(2, '0')} · ${esc(fam[d.style_family].name)} · ${d.mode}${motion.length ? ` · <span class="dg-motion-badge" title="Motion patterns">${motion.map(esc).join(' · ')}</span>` : ''}</p>
            <h1 class="s-h1" style="font-size:clamp(34px,4.6vw,52px)">${esc(d.name)}</h1>
            <p class="s-lead">${esc(d.summary)}</p>
          </div>
          <div class="cx-head-actions"><a class="s-btn" href="${dashUrl(d.id)}#/${pageId}" target="_blank" rel="noopener">${icon('external')}Open full page</a><button class="s-btn s-btn-primary" data-copy-prompt>${icon('agent')}Copy agent prompt</button></div>
        </div>
        <div class="dg-toolbar">
          <div class="dg-seg" role="tablist" aria-label="Pages">${pages.map((pg) => `<button role="tab" data-page="${pg.id}" aria-selected="${pg.id === pageId}" aria-pressed="${pg.id === pageId}">${esc(pg.name)}</button>`).join('')}</div>
          ${viewBtns.length ? `<div class="dg-seg" role="group" aria-label="View">${viewBtns.map(([k, l]) => `<button data-view="${k}" aria-pressed="${k === 'live'}">${l}</button>`).join('')}</div>` : ''}
          <div class="dg-seg" role="group" aria-label="Device" data-device-seg>${Object.entries(DEVICES).map(([k, [, , l]]) => `<button data-device="${k}" aria-pressed="${k === device}">${l}</button>`).join('')}</div>
          <div class="dg-variants" role="group" aria-label="Variant">${d.variants.map((v) => `<button data-variant="${v.id}" aria-pressed="${v.id === variant}"><i style="background:${v.swatch || d.palette.accent}"></i>${esc(v.name)}</button>`).join('')}</div>
        </div>
        <div class="dg-stage" data-stage>
          <div class="dg-frame" data-frame><iframe title="${esc(d.name)} live preview" src="${src()}" loading="lazy"></iframe></div>
          ${refFile ? `<figure class="dg-shot" data-original hidden>
            <img src="dashboards/${d.id}/${esc(refFile)}" alt="${esc(d.name)} original reference image" loading="lazy" decoding="async">
            <figcaption class="s-small s-muted">Original owner reference · <a class="s-link" href="dashboards/${d.id}/${esc(refFile)}" target="_blank" rel="noopener">Open ${esc(refFile)}</a></figcaption>
          </figure>
          <div class="dg-compare" data-compare hidden>
            <div class="dg-compare-track" data-compare-track>
              <img class="dg-compare-back" src="dashboards/${d.id}/${esc(refFile)}" alt="" decoding="async">
              <div class="dg-compare-fore" data-compare-fore style="--split:50%">
                <img src="dashboards/${d.id}/shot.jpg" alt="" decoding="async">
              </div>
              <label class="vh" for="dg-split-${d.id}">Compare slider</label>
              <input id="dg-split-${d.id}" class="dg-compare-range" data-compare-range type="range" min="0" max="100" value="50" aria-valuetext="50 percent live over original">
            </div>
            <p class="s-small s-muted dg-compare-cap"><span>Original</span><span>Our recreation (shot.jpg)</span></p>
          </div>` : ''}
        </div>
        <div class="dg-info">
          <section class="s-panel dg-pad"><h2 class="s-h3">Style</h2>
            <dl class="dg-dl"><div><dt>Use cases</dt><dd>${d.use_cases.map((u) => esc(uc[u].name)).join(', ')}</dd></div><div><dt>Mood</dt><dd>${d.mood.map(esc).join(', ')}</dd></div>
            <div><dt>Signature</dt><dd>${esc(d.signature)}</dd></div><div><dt>Fonts</dt><dd>${esc(d.fonts.display)} · ${esc(d.fonts.sans)}</dd></div>
            <div><dt>Pages</dt><dd>${pages.map((pg) => `${esc(pg.name)} (${esc(pg.pattern)})`).join(' · ')}</dd></div>
            ${motion.length ? `<div><dt>Motion</dt><dd>${motion.map(esc).join(', ')}</dd></div>` : ''}
            ${d.maps_to_theme ? `<div><dt>Closest toolkit theme</dt><dd><a class="s-link" href="#/themes">${esc(d.maps_to_theme)}</a></dd></div>` : ''}</dl>
            <h3 class="dg-sub">Palette</h3><div class="dg-pal">${Object.entries(d.palette).map(([k, v]) => `<button data-hex="${v}" title="Copy ${v}"><i style="background:${v}"></i><span>${esc(k)}</span><code>${v}</code></button>`).join('')}</div></section>
          <section class="s-panel dg-pad"><h2 class="s-h3">Layout</h2>
            <dl class="dg-dl"><div><dt>Pattern</dt><dd>${esc(d.layout.pattern)}</dd></div><div><dt>Structure</dt><dd>${esc(d.layout.structure)}</dd></div><div><dt>Responsive</dt><dd>${esc(d.layout.responsive)}</dd></div></dl>
            <h3 class="dg-sub">Components</h3><ul class="dg-list">${d.components.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section>
          <section class="s-panel dg-pad"><h2 class="s-h3">When to use it</h2>
            <h3 class="dg-sub">Best for</h3><ul class="dg-list use">${d.best_for.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
            <h3 class="dg-sub">Avoid when</h3><ul class="dg-list avoid">${d.avoid_when.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
            <h3 class="dg-sub">Files</h3><ul class="dg-files">${files.map((f) => `<li><a class="s-link" href="${REPO}/blob/main/${d.path}${f}" target="_blank" rel="noopener">${d.path}${f}</a></li>`).join('')}</ul>
            <p class="s-small s-muted" style="margin:12px 0 0">${esc(d.source.note)}</p></section>
        </div>
        <nav class="dg-pager" aria-label="More dashboards">${prev ? `<a class="s-btn" href="#/dashboards/${prev.id}">← ${esc(prev.name)}</a>` : '<span></span>'}${next ? `<a class="s-btn" href="#/dashboards/${next.id}">${esc(next.name)} →</a>` : '<span></span>'}</nav>
      </div>`;
    document.title = d.name + ' · Dashboards · Dashboard Tools';
    const stage = main.querySelector('[data-stage]'), frame = main.querySelector('[data-frame]'), ifr = frame.querySelector('iframe');
    const original = main.querySelector('[data-original]');
    const compare = main.querySelector('[data-compare]');
    const deviceSeg = main.querySelector('[data-device-seg]');
    const pageSeg = () => main.querySelectorAll('[data-page]');
    function syncView() {
      const live = view === 'live';
      frame.hidden = !live;
      if (original) original.hidden = view !== 'original';
      if (compare) compare.hidden = view !== 'compare';
      deviceSeg.hidden = !(live);
      pageSeg().forEach((b) => { const on = b.dataset.page === pageId; b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-selected', String(on)); });
      main.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
      if (live) fit();
    }
    function fit() {
      if (view !== 'live') return;
      const [w, h] = DEVICES[device];
      const avail = stage.clientWidth - 2;
      const maxH = device === 'desktop' ? Infinity : Math.max(520, Math.min(window.innerHeight * 0.82, 900));
      const s = Math.min(1, avail / w, maxH / h);
      ifr.style.width = w + 'px'; ifr.style.height = h + 'px'; ifr.style.transform = `scale(${s})`;
      frame.style.width = Math.round(w * s) + 'px'; frame.style.height = Math.round(h * s) + 'px';
      frame.dataset.device = device;
    }
    const range = main.querySelector('[data-compare-range]');
    const fore = main.querySelector('[data-compare-fore]');
    if (range && fore) {
      const applySplit = () => { fore.style.setProperty('--split', range.value + '%'); range.setAttribute('aria-valuetext', `${range.value} percent live over original`); };
      range.addEventListener('input', applySplit); applySplit();
    }
    const ro = new ResizeObserver(fit); ro.observe(stage); cleanups.push(() => ro.disconnect());
    syncView();
    main.addEventListener('click', (e) => {
      const pg = e.target.closest('[data-page]'); if (pg) { pageId = pg.dataset.page; ifr.src = src(); syncView(); return; }
      const vw = e.target.closest('[data-view]'); if (vw) { view = vw.dataset.view; syncView(); return; }
      const dv = e.target.closest('[data-device]'); if (dv) { device = dv.dataset.device; main.querySelectorAll('[data-device]').forEach((b) => b.setAttribute('aria-pressed', String(b === dv))); fit(); return; }
      const v = e.target.closest('[data-variant]'); if (v) { variant = v.dataset.variant; main.querySelectorAll('[data-variant]').forEach((b) => b.setAttribute('aria-pressed', String(b === v))); ifr.src = src(); return; }
      const hx = e.target.closest('[data-hex]'); if (hx) { copy(hx.dataset.hex, `Copied ${hx.dataset.hex}`); return; }
      if (e.target.closest('[data-copy-prompt]')) copy(prompt, 'Agent prompt copied');
    });
  }

  window.Dashboards = { render, destroy: () => cleanups.splice(0).forEach((f) => f()) };
})();
