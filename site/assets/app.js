/* =========================================================================
   Showcase site: router + pages. Data comes from data/data.js (generated).
   ========================================================================= */
(function () {
  const C = window.CATALOG, TH = window.THEMES.themes, DOCS = window.DOCS, INV = window.INVENTORY;
  const REPO = 'https://github.com/SacredRebel/dashboard-tools-';
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const main = $('#main');
  const docPaths = new Set(DOCS.map((d) => d.path));
  const toolById = Object.fromEntries(C.tools.map((t) => [t.id, t]));
  const catById = Object.fromEntries(C.categories.map((c) => [c.id, c]));
  const phaseById = Object.fromEntries(C.phases.map((p) => [p.id, p]));
  const tierRank = { core: 0, recommended: 1, optional: 2, situational: 3 };
  const catIcon = { process: 'compass', research: 'search', brand: 'palette', uiux: 'layout', polish: 'sparkles', dataviz: 'chart', crm: 'users', build: 'code', quality: 'shield', ship: 'rocket', integrations: 'plug', media: 'image', libraries: 'package', handover: 'book' };
  let current = { theme: 'atelier' };
  try { current.theme = localStorage.getItem('dt-theme') || 'atelier'; } catch (e) { /* storage blocked */ }
  const saveTheme = (t) => { current.theme = t; try { localStorage.setItem('dt-theme', t); } catch (e) { /* ignore */ } };

  function toast(msg) {
    const t = document.createElement('div'); t.className = 's-toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.append(t); setTimeout(() => t.remove(), 1800);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = text; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Copied'); }
  }
  const tierTag = (t) => `<span class="s-tag ${t}">${t}</span>`;
  const phaseDoc = (p) => (DOCS.find((d) => d.path.startsWith(`docs/framework/0${p.n}-`)) || {}).path;

  // ---------------------------------------------------------------- site theme toggle
  const root = document.documentElement;
  try { const s = localStorage.getItem('dt-site'); if (s) root.dataset.siteTheme = s; } catch (e) { /* ignore */ }
  $('#site-theme').addEventListener('click', () => {
    const dark = root.dataset.siteTheme ? root.dataset.siteTheme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.siteTheme = dark ? 'light' : 'dark';
    try { localStorage.setItem('dt-site', root.dataset.siteTheme); } catch (e) { /* ignore */ }
    $('#site-theme').innerHTML = icon(dark ? 'moon' : 'sun');
  });

  // ---------------------------------------------------------------- pages
  function pageHome() {
    const stats = [[C.tools.length, 'curated tools'], [C.categories.length, 'categories'], [C.phases.length, 'phases with gates'], [TH.length, 'live themes'], [INV.total, 'skills inventoried']];
    const starts = [
      ['agent', 'For AI agents', 'AGENTS.md is the operating manual: read order, phase gates, tool routing, definition of done.', '#/docs/AGENTS.md', 'Read AGENTS.md'],
      ['compass', 'The framework', 'Eight phases from discovery to handover, each with a goal, core tools and a gate the human approves.', '#/framework', 'See the phases'],
      ['package', 'Tool catalog', `${C.tools.length} skills, connectors and libraries with when to use, when not to, and how.`, '#/tools', 'Browse tools'],
      ['palette', 'Themes', 'Six complete visual directions built on one token set. See them on a real dashboard.', '#/themes', 'Compare themes'],
      ['layout', 'Components', 'Buttons to pipeline boards: every building block with its rules, in every theme.', '#/components', 'Open the library'],
      ['kanban', 'Live demo', 'A working CRM built with the framework: drag, keyboard, empty states, undo.', '#/demo', 'Try the demo'],
    ];
    main.innerHTML = `
      <div class="s-wrap">
        <section class="s-hero">
          <div>
            <p class="s-eyebrow">Dashboard Tools · toolkit, design system and playbook</p>
            <h1 class="s-h1">Build dashboards that look considered and work beautifully.</h1>
            <p class="s-lead">One repository that any AI agent can read step by step: a curated catalog of skills and tools, a design rulebook, six ready themes, reference components, a CRM blueprint, and a phase-by-phase framework from first conversation to handover.</p>
            <div class="s-hero-actions">
              <a class="s-btn s-btn-primary" href="#/demo">${icon('kanban')}Try the live demo</a>
              <a class="s-btn" href="#/docs/AGENTS.md">${icon('agent')}Agent playbook</a>
              <a class="s-btn" href="${REPO}" target="_blank" rel="noopener">${icon('github')}GitHub</a>
            </div>
          </div>
          <div class="s-hero-preview" aria-label="Preview of the demo CRM in the Atelier theme"><div id="hero-demo"></div></div>
        </section>
        <div class="s-stats">${stats.map(([n, l]) => `<div class="s-stat"><b>${n}</b><span>${l}</span></div>`).join('')}</div>
      </div>
      <section class="s-section"><div class="s-wrap">
        <p class="s-eyebrow">Start here</p><h2 class="s-h2">Six ways in</h2>
        <div class="s-grid s-grid-3" style="margin-top:24px">${starts.map(([ic, t, d, href, cta]) => `
          <a class="s-panel s-start" href="${href}"><span class="s-start-icon">${icon(ic)}</span><h3 class="s-h3">${t}</h3><p class="s-muted s-small" style="margin:0">${d}</p><span class="s-arrow">${cta} →</span></a>`).join('')}</div>
      </div></section>
      <section class="s-section"><div class="s-wrap">
        <p class="s-eyebrow">The framework</p><h2 class="s-h2">Eight phases, eight gates</h2>
        <p class="s-lead">Agents are fast enough to build the wrong thing beautifully in an afternoon. Gates are cheap checkpoints where a human says “yes, that's it” before effort compounds.</p>
        <div class="s-phases" style="margin-top:28px">${C.phases.map((p) => `<a class="s-phase" href="#/docs/${phaseDoc(p)}"><span class="s-phase-n">${p.n}</span><span class="s-phase-name">${p.name}</span><span class="s-phase-goal">${esc(p.goal)}</span></a>`).join('')}</div>
      </div></section>
      <section class="s-section"><div class="s-wrap">
        <p class="s-eyebrow">For the agent that picks this up</p><h2 class="s-h2">Point your AI at the repo</h2>
        <div class="s-grid s-grid-2" style="margin-top:24px;align-items:start">
          <div class="s-prose"><p>Clone or attach this repository, then paste the kickoff prompt. The agent reads <code>AGENTS.md</code>, finds its phase, filters <code>catalog/tools.json</code> by that phase, and follows the phase doc until the gate. If a skill isn't installed, every catalog entry has a <code>fallback</code> doc that carries the method.</p>
          <p>Everything visual uses <code>design-system/tokens.css</code>, so a theme switch or a brand tweak is one block of CSS.</p>
          <p><a href="#/docs/prompts/README.md">All copy-paste prompts →</a></p></div>
          <div class="s-panel" style="padding:4px"><pre style="margin:0;padding:18px;overflow:auto;font-size:13px;line-height:1.6;white-space:pre-wrap"><code>You are building a dashboard for &lt;client&gt;. Use the toolkit repo
${REPO.replace('https://', '')} as your playbook:
1. Read AGENTS.md fully, then docs/framework/00-overview.md.
2. Tell me which phase we're in and which core tools you'll
   use (from catalog/tools.json).
3. Follow the phase doc step by step. Stop at each gate and
   show me the artifact.
Inputs I have: &lt;voice memo / meeting notes / playbook&gt;.</code></pre>
          <div style="padding:0 14px 14px"><button class="s-btn s-btn-sm" data-copy-kickoff>${icon('copy')}Copy prompt</button></div></div>
        </div>
      </div></section>`;
    const host = $('#hero-demo');
    CRM.mount(host, { theme: 'atelier', static: true });
    fitPreview(host, 1280);
    main.querySelector('[data-copy-kickoff]').addEventListener('click', (e) => copy(e.target.closest('.s-panel').querySelector('code').textContent));
  }
  function fitPreview(el, designW) {
    const box = el.parentElement;
    const apply = () => { const s = box.clientWidth / designW; el.style.width = designW + 'px'; el.style.height = box.clientHeight / s + 'px'; el.style.transform = `scale(${s})`; };
    apply(); new ResizeObserver(apply).observe(box);
  }

  // ---------------------------------------------------------------- tools
  const tf = { cat: 'all', phase: '', tiers: new Set(), kind: '', q: '' };
  function pageTools(openId) {
    if (!main.querySelector('[data-tools]')) {
      main.innerHTML = `<div class="s-wrap">
        <div class="s-pagehead"><div><p class="s-eyebrow">Catalog · ${C.tools.length} curated from ${INV.total} installed skills</p><h1 class="s-h1" style="font-size:clamp(36px,5vw,56px)">Tools & skills</h1>
          <p class="s-lead">Every entry says when to use it, when not to, how, what it pairs with, and what to read if it isn't installed.</p></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="s-btn" href="#/inventory">${icon('list')}All ${INV.total} installed skills</a><a class="s-btn" href="${REPO}/blob/main/catalog/tools.json" target="_blank" rel="noopener">${icon('code')}tools.json</a></div></div>
        <div class="s-tools" data-tools>
          <aside class="s-filters" aria-label="Filters">
            <div><p class="s-filter-title">Category</p><div class="s-filter-cats" data-cats></div></div>
            <div><p class="s-filter-title">Phase</p><div class="s-pills" data-phases></div></div>
            <div><p class="s-filter-title">Tier</p><div class="s-pills" data-tiers></div></div>
            <div><p class="s-filter-title">Kind</p><div class="s-pills" data-kinds></div></div>
          </aside>
          <div style="min-width:0">
            <label class="s-search"><span class="vh">Search tools</span>${icon('search')}<input data-q type="search" placeholder="Search, e.g. empty states, pipeline, Vercel, accessibility" autocomplete="off"></label>
            <div class="s-results-meta" data-meta></div>
            <div data-results></div>
          </div>
        </div></div>`;
      const q = $('[data-q]'); q.value = tf.q;
      q.addEventListener('input', () => { tf.q = q.value; renderTools(); });
      main.querySelector('[data-tools]').addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.cat) { tf.cat = b.dataset.cat; renderTools(); }
        if (b.dataset.phase !== undefined) { tf.phase = tf.phase === b.dataset.phase ? '' : b.dataset.phase; renderTools(); }
        if (b.dataset.tier) { tf.tiers.has(b.dataset.tier) ? tf.tiers.delete(b.dataset.tier) : tf.tiers.add(b.dataset.tier); renderTools(); }
        if (b.dataset.kind !== undefined) { tf.kind = tf.kind === b.dataset.kind ? '' : b.dataset.kind; renderTools(); }
        if (b.dataset.tool) location.hash = '#/tools/' + b.dataset.tool;
        if (b.dataset.reset !== undefined) { Object.assign(tf, { cat: 'all', phase: '', kind: '', q: '' }); tf.tiers.clear(); $('[data-q]').value = ''; renderTools(); }
      });
      renderTools();
    }
    if (openId && toolById[openId]) openTool(openId); else closeDrawer(true);
  }
  function filtered() {
    const q = tf.q.trim().toLowerCase();
    return C.tools.filter((t) => (tf.cat === 'all' || t.category === tf.cat) && (!tf.phase || t.phases.includes(tf.phase)) && (!tf.tiers.size || tf.tiers.has(t.tier)) && (!tf.kind || t.kind === tf.kind) &&
      (!q || [t.name, t.invoke, t.summary, t.plugin, ...t.use_when, ...(t.how_to_use || [])].join(' ').toLowerCase().includes(q)))
      .sort((a, b) => tierRank[a.tier] - tierRank[b.tier] || a.name.localeCompare(b.name));
  }
  function renderTools() {
    const counts = (fn) => C.tools.filter(fn).length;
    $('[data-cats]').innerHTML = `<button data-cat="all" aria-pressed="${tf.cat === 'all'}"><span>All tools</span><span class="count">${C.tools.length}</span></button>` +
      C.categories.map((c) => `<button data-cat="${c.id}" aria-pressed="${tf.cat === c.id}"><span>${c.name}</span><span class="count">${counts((t) => t.category === c.id)}</span></button>`).join('');
    $('[data-phases]').innerHTML = C.phases.map((p) => `<button class="s-pill" data-phase="${p.id}" aria-pressed="${tf.phase === p.id}">${p.n}. ${p.name}</button>`).join('');
    $('[data-tiers]').innerHTML = C.tiers.map((t) => `<button class="s-pill" data-tier="${t.id}" aria-pressed="${tf.tiers.has(t.id)}" title="${esc(t.meaning)}">${t.id}</button>`).join('');
    $('[data-kinds]').innerHTML = C.kinds.map((k) => `<button class="s-pill" data-kind="${k.id}" aria-pressed="${tf.kind === k.id}" title="${esc(k.meaning)}">${k.id}</button>`).join('');
    const list = filtered();
    const active = tf.cat !== 'all' || tf.phase || tf.tiers.size || tf.kind || tf.q;
    $('[data-meta]').innerHTML = `<span>${list.length} tool${list.length === 1 ? '' : 's'}${tf.phase ? ` for phase ${phaseById[tf.phase].n} · ${phaseById[tf.phase].name}` : ''}</span>${active ? '<button class="s-chipbtn" data-reset>Clear filters</button>' : ''}`;
    const cardHtml = (t) => `<button class="s-tool" data-tool="${t.id}">
        <div class="s-tool-top"><span class="s-tool-name">${esc(t.name)}</span>${tierTag(t.tier)}</div>
        <span class="s-tool-inv">${esc(t.invoke)}</span>
        <span class="s-tool-sum">${esc(t.summary)}</span>
        <span class="s-tool-foot"><span class="s-tag">${t.kind}</span>${t.phases.slice(0, 3).map((p) => `<span class="s-tag">${phaseById[p].name}</span>`).join('')}${t.requires ? '<span class="s-tag" title="Needs a connection">needs connection</span>' : ''}</span>
      </button>`;
    let html = '';
    if (!list.length) html = `<div class="s-empty"><p style="margin:0 0 12px"><strong>No tools match these filters.</strong></p><button class="s-btn s-btn-sm" data-reset>Clear filters</button></div>`;
    else if (tf.cat === 'all' && !tf.q) {
      for (const c of C.categories) {
        const items = list.filter((t) => t.category === c.id); if (!items.length) continue;
        html += `<div class="s-cathead"><h2>${c.name}</h2><p>${esc(c.blurb)}</p></div><div class="s-toolgrid">${items.map(cardHtml).join('')}</div>`;
      }
    } else {
      if (tf.cat !== 'all') html += `<div class="s-cathead"><h2>${catById[tf.cat].name}</h2><p>${esc(catById[tf.cat].blurb)}</p></div>`;
      html += `<div class="s-toolgrid">${list.map(cardHtml).join('')}</div>`;
    }
    $('[data-results]').innerHTML = html;
  }

  let drawer = null;
  function openTool(id) {
    const t = toolById[id];
    const trigger = document.activeElement;
    closeDrawer(true);
    const scrim = document.createElement('div'); scrim.className = 's-scrim';
    const d = document.createElement('aside'); d.className = 's-drawer'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', t.name);
    const fb = t.fallback ? (docPaths.has(t.fallback.split('#')[0]) ? `#/docs/${t.fallback}` : `${REPO}/blob/main/${t.fallback}`) : '';
    const list = (arr, cls) => (arr && arr.length ? `<ul class="${cls}">${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="s-muted s-small" style="margin:0">—</p>');
    d.innerHTML = `
      <div class="s-drawer-head">
        <div class="s-drawer-head-top"><div><p class="s-eyebrow" style="margin:0 0 4px">${esc(catById[t.category].name)}</p><h2 class="s-h2" style="font-size:34px">${esc(t.name)}</h2></div>
          <button class="s-iconbtn" data-close aria-label="Close">${icon('x')}</button></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${tierTag(t.tier)}<span class="s-tag">${t.kind}</span>${t.plugin ? `<span class="s-tag">plugin: ${esc(t.plugin)}</span>` : ''}${t.phases.map((p) => `<span class="s-tag">${phaseById[p].n}. ${phaseById[p].name}</span>`).join('')}</div>
        <div class="s-invoke"><code>${esc(t.invoke)}</code><button class="s-chipbtn" data-copy="${esc(t.invoke)}">${icon('copy').replace('<svg', '<svg width="14" height="14"')} Copy</button></div>
      </div>
      <div class="s-drawer-body">
        <p style="margin:0;font-size:17px">${esc(t.summary)}</p>
        <div><h3>Use when</h3>${list(t.use_when, 'use')}</div>
        <div><h3>Avoid when</h3>${list(t.avoid_when, 'avoid')}</div>
        ${t.how_to_use && t.how_to_use.length ? `<div><h3>How to use it well</h3>${list(t.how_to_use, '')}</div>` : ''}
        ${t.pairs_with.length ? `<div><h3>Pairs with</h3><div style="display:flex;gap:6px;flex-wrap:wrap">${t.pairs_with.map((p) => `<a class="s-chipbtn" style="display:inline-flex;align-items:center;text-decoration:none" href="#/tools/${p}">${esc(toolById[p].name)}</a>`).join('')}</div></div>` : ''}
        ${fb ? `<div><h3>If it isn't installed</h3><p style="margin:0">Follow <a class="s-link" href="${fb}">${esc(t.fallback)}</a>. It carries the method without the plugin.</p></div>` : ''}
        ${t.requires ? `<div><h3>Requires</h3><p style="margin:0">${esc(t.requires)}</p></div>` : ''}
        ${t.url ? `<div><h3>Docs</h3><a class="s-link" href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.url)} ↗</a></div>` : ''}
        <div><h3>Source</h3><a class="s-link" href="#/docs/docs/tools/${t.category}.md#${t.id}">docs/tools/${t.category}.md</a> · <a class="s-link" href="${REPO}/blob/main/catalog/tools.json" target="_blank" rel="noopener">catalog/tools.json ↗</a></div>
      </div>`;
    document.body.append(scrim, d);
    drawer = { scrim, d, trigger };
    scrim.addEventListener('click', () => (location.hash = '#/tools'));
    d.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) location.hash = '#/tools';
      const c = e.target.closest('[data-copy]'); if (c) copy(c.dataset.copy);
    });
    d.querySelector('[data-close]').focus();
  }
  function closeDrawer(instant) {
    if (!drawer) return;
    const { scrim, d, trigger } = drawer; drawer = null;
    if (instant) { scrim.remove(); d.remove(); }
    else { scrim.classList.add('out'); d.classList.add('out'); setTimeout(() => { scrim.remove(); d.remove(); }, 160); }
    if (trigger && document.contains(trigger)) trigger.focus();
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer) { location.hash = '#/tools'; }
    if (e.key === 'Tab' && drawer) {
      const f = [...drawer.d.querySelectorAll('a, button')];
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // ---------------------------------------------------------------- framework
  function pageFramework() {
    main.innerHTML = `<div class="s-wrap">
      <div class="s-pagehead"><div><p class="s-eyebrow">Framework</p><h1 class="s-h1" style="font-size:clamp(36px,5vw,56px)">From voice note to handover</h1>
      <p class="s-lead">Follow the phases in order. Each ends with a gate, an artifact the human approves. Loops back are normal: update the earlier artifact when you do.</p></div>
      <a class="s-btn" href="#/docs/docs/framework/00-overview.md">${icon('book')}Read the overview</a></div>
      <div class="s-timeline">${C.phases.map((p) => {
        const tools = C.tools.filter((t) => t.phases.includes(p.id) && (t.tier === 'core' || t.tier === 'recommended')).sort((a, b) => tierRank[a.tier] - tierRank[b.tier]);
        return `<article class="s-panel s-ph"><div class="s-ph-n">${p.n}</div><div>
          <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:baseline"><h2 class="s-h2" style="font-size:32px">${p.name}</h2><a class="s-link s-small" href="#/docs/${phaseDoc(p)}">Step-by-step guide →</a></div>
          <p style="margin:6px 0 0;font-size:17px">${esc(p.goal)}</p>
          <div class="s-ph-gate"><b>Gate</b><span>${esc(p.gate)}</span></div>
          <div class="s-ph-tools">${tools.map((t) => `<a class="s-chipbtn" style="display:inline-flex;align-items:center;gap:6px;text-decoration:none" href="#/tools/${t.id}">${t.tier === 'core' ? '<span class="dot" style="width:6px;height:6px;border-radius:50%;background:var(--s-ink)"></span>' : ''}${esc(t.name)}</a>`).join('')}</div>
          <p class="s-small s-muted" style="margin:10px 0 0">● = core. <a class="s-link" href="#/tools" data-phase-link="${p.id}">See all ${C.tools.filter((t) => t.phases.includes(p.id)).length} tools for this phase</a></p>
        </div></article>`;
      }).join('')}</div></div>`;
    main.querySelectorAll('[data-phase-link]').forEach((a) => a.addEventListener('click', () => { Object.assign(tf, { cat: 'all', phase: a.dataset.phaseLink, kind: '', q: '' }); tf.tiers.clear(); }));
  }

  // ---------------------------------------------------------------- themes
  function pageThemes() {
    main.innerHTML = `<div class="s-wrap">
      <div class="s-pagehead"><div><p class="s-eyebrow">Design system · ${TH.length} themes, one token set</p><h1 class="s-h1" style="font-size:clamp(36px,5vw,56px)">Themes</h1>
      <p class="s-lead">Each theme is a block of CSS variables in <code class="s-code">design-system/tokens.css</code>. Same components, same layout, different personality. Show clients the real dashboard, not mood adjectives.</p></div>
      <a class="s-btn" href="#/docs/docs/design/06-themes.md">${icon('book')}How to make a custom theme</a></div>
      <div class="s-grid s-grid-2" style="padding-bottom:64px">${TH.map((t) => `
        <article class="s-panel s-theme-card">
          <div class="s-theme-preview"><div data-preview="${t.id}"></div></div>
          <div class="s-theme-info">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><h2 class="s-theme-name">${t.name}</h2><div class="s-swatches">${t.swatches.map((s) => `<span style="background:${s}" title="${s}"></span>`).join('')}</div></div>
            <p class="s-muted" style="margin:0">${esc(t.description)}</p>
            <div class="s-theme-meta"><span class="s-tag">${t.mode}</span>${t.mood.map((m) => `<span class="s-tag">${m}</span>`).join('')}<span class="s-tag">${esc(t.fonts.display)}${t.fonts.display !== t.fonts.sans ? ' + ' + esc(t.fonts.sans) : ''}</span></div>
            <p class="s-small" style="margin:0"><b>Best for:</b> <span class="s-muted">${t.best_for.join(', ')}</span></p>
            <p class="s-small" style="margin:0"><b>Signature:</b> <span class="s-muted">${esc(t.signature)}</span></p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><a class="s-btn s-btn-sm s-btn-primary" href="#/demo" data-use-theme="${t.id}">Open in demo</a><a class="s-btn s-btn-sm" href="#/components" data-use-theme="${t.id}">See components</a></div>
          </div>
        </article>`).join('')}</div></div>`;
    main.querySelectorAll('[data-preview]').forEach((el) => CRM.mount(el, { theme: el.dataset.preview, static: true }));
    main.querySelectorAll('[data-use-theme]').forEach((a) => a.addEventListener('click', () => saveTheme(a.dataset.useTheme)));
  }

  // ---------------------------------------------------------------- components
  function pageComponents() {
    const sec = (id, title, desc, body, dos, donts) => `<section class="s-comp" id="c-${id}">
      <div class="s-comp-head"><div><h2 class="s-h3" style="font-size:20px">${title}</h2><p>${desc}</p></div><button class="s-chipbtn" data-copy-html="${id}">${icon('copy').replace('<svg', '<svg width="14" height="14"')} Copy HTML</button></div>
      <div class="s-stage themed" data-theme="${current.theme}" data-stage="${id}">${body}</div>
      <div class="s-rules"><div class="do"><b>Do</b>${dos}</div><div class="dont"><b>Don't</b>${donts}</div></div></section>`;
    const k = CRM;
    main.innerHTML = `<div class="s-wrap">
      <div class="s-pagehead" style="padding-bottom:8px"><div><p class="s-eyebrow">Reference components · token-only CSS</p><h1 class="s-h1" style="font-size:clamp(36px,5vw,56px)">Components</h1>
      <p class="s-lead">The building blocks of a premium dashboard, each with its rule. Port them to shadcn/ui + Tailwind using the same tokens. Switch the theme to see one system adapt.</p></div></div>
      <div class="s-themebar"><span class="s-small s-muted">Theme</span><div class="s-pills" data-theme-pills>${TH.map((t) => `<button class="s-pill" data-set-theme="${t.id}" aria-pressed="${current.theme === t.id}">${t.name}</button>`).join('')}</div></div>

      ${sec('buttons', 'Buttons', 'One primary action per view. Verb + object labels. Loading state lives on the button that was pressed.', `
        <div class="s-demo-row"><button class="btn btn-primary">${icon('plus')}Add client</button><button class="btn">${icon('phone')}Log call</button><button class="btn btn-ghost">Cancel</button><button class="btn btn-danger">Delete client</button>
        <button class="btn btn-icon" aria-label="Export clients" title="Export (E)">${icon('download')}</button><button class="btn btn-primary" aria-busy="true" disabled>Saving…</button><span class="kbd">N</span></div>`,
        'Verb-first labels; one primary per area; tooltip + accessible name on icon buttons; 40px+ height.', '“Submit”, “OK”; gradient or multi-color fills; spinner overlay on the whole page.')}

      ${sec('forms', 'Inputs & forms', 'Visible labels, format hints only in placeholders, validation on blur, helpful errors.', `
        <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));max-width:820px">
          <div class="field"><label class="label" for="cf1">Client name</label><input class="input" id="cf1" value="Maya Lindqvist"></div>
          <div class="field has-error"><label class="label" for="cf2">Email</label><input class="input" id="cf2" value="maya@" aria-invalid="true"><span class="field-error">${icon('alert').replace('<svg', '<svg width="14" height="14"')}Add the part after @, like maya@studio.com</span></div>
          <div class="field"><label class="label" for="cf3">Stage</label><select class="select" id="cf3"><option>Proposal sent</option></select><span class="hint">Where this client is right now.</span></div>
          <label class="search" style="align-self:end"><span class="vh">Search</span>${icon('search')}<input class="input" placeholder="Search clients"><span class="kbd">/</span></label>
        </div>`,
        'Label above every input; mark optional fields instead of required ones; smart defaults.', 'Placeholder as label; decorative icons in inputs; errors that blame the user.')}

      ${sec('badges', 'Status, badges & chips', 'Color carries meaning only, and always with text. Chips are for active filters you can remove.', `
        <div class="s-demo-row"><span class="badge badge-accent">New inquiry</span><span class="badge badge-info">Proposal sent</span><span class="badge badge-warning">Negotiating</span><span class="badge badge-success">Won</span><span class="badge">Lost</span><span class="badge badge-danger">2 days overdue</span>
        <span class="chip">Stage: Proposal<button aria-label="Remove filter">${icon('x').replace('<svg', '<svg width="12" height="12"')}</button></span><span class="avatar">ML</span></div>`,
        'One badge style per meaning; a dot + label; plain text for static metadata.', 'Pastel pills around every timestamp; color as the only signal.')}

      ${sec('kpis', 'KPI tiles', 'Max five on an overview. Big tabular number, quiet label, delta in words.', `
        <div class="kpis">
          <div class="card kpi"><div class="kpi-label"><span>Open pipeline</span>${k.sparkline([22, 26, 25, 31, 30, 36, 41, 39, 46, 49])}</div><div class="kpi-value">$49k</div><div class="kpi-delta"><span class="up">▲ 12%</span> vs last month</div></div>
          <div class="card kpi"><div class="kpi-label"><span>Follow-ups due</span></div><div class="kpi-value">4</div><div class="kpi-delta"><span class="down">2 overdue</span></div></div>
          <div class="card kpi"><div class="kpi-label"><span>Won this month</span></div><div class="kpi-value">$24.5k</div><div class="kpi-delta">3 clients</div></div>
          <div class="card kpi"><div class="kpi-label"><span>Win rate · 90 days</span></div><div class="kpi-value">60%</div><div class="kpi-delta">5 closed</div></div>
        </div>`,
        'Each KPI drives a decision; tabular numerals; ▲▼ plus words.', 'Six+ tiles; giant gradient numbers; deltas shown only by color.')}

      ${sec('charts', 'Charts', 'Start from the question. Sorted bars, direct labels, one accent, quiet gridlines.', `
        <div style="display:grid;gap:24px;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))">
          <div class="card card-pad"><p class="card-title" style="margin-bottom:12px">Pipeline by stage</p>${k.hbars([{ label: 'New inquiry', value: 7900, display: '$7.9k', color: 'var(--chart-1)' }, { label: 'Discovery call', value: 23100, display: '$23k', color: 'var(--chart-2)' }, { label: 'Proposal sent', value: 18900, display: '$19k', color: 'var(--chart-3)' }, { label: 'Negotiating', value: 19500, display: '$20k', color: 'var(--chart-4)' }])}</div>
          <div class="card card-pad"><p class="card-title" style="margin-bottom:12px">Won per month</p>${k.columns([{ label: 'Jun', value: 8, display: '$8k' }, { label: 'Jul', value: 12, display: '$12k' }, { label: 'Aug', value: 9, display: '$9k' }, { label: 'Sep', value: 15, display: '$15k' }, { label: 'Oct', value: 14, display: '$14k' }, { label: 'Nov', value: 21, display: '$21k' }])}</div>
        </div>
        <div style="margin-top:20px;display:grid;gap:8px;max-width:520px"><div class="stagebar"><span style="width:18%;background:var(--chart-1)"></span><span style="width:33%;background:var(--chart-2)"></span><span style="width:24%;background:var(--chart-3)"></span><span style="width:25%;background:var(--chart-4)"></span></div>
        <div class="legend"><span><i class="dot" style="background:var(--chart-1)"></i>New</span><span><i class="dot" style="background:var(--chart-2)"></i>Discovery</span><span><i class="dot" style="background:var(--chart-3)"></i>Proposal</span><span><i class="dot" style="background:var(--chart-4)"></i>Negotiating</span></div></div>`,
        'Bars from zero; ≤ 5 series; label values directly; highlight the current period.', '3D, pies with 6+ slices, dual axes, rainbow palettes.')}

      ${sec('board', 'Pipeline board', 'Columns are stages with live counts and totals. Drag is never the only way: every card has “Move to…”.', `
        <div class="board" style="grid-auto-columns:minmax(240px,300px)">
          <section class="col"><div class="col-head"><h3 class="col-title">Proposal sent <span class="col-count">2</span></h3><span class="col-sum">$14k</span></div>
            <article class="deal"><div class="deal-top"><div><div class="deal-name">Maya Lindqvist</div><div class="deal-co">Harbor & Pine Interiors</div></div><button class="btn btn-ghost btn-icon btn-sm" aria-label="Move Maya">${icon('more')}</button></div><div class="deal-next overdue">${icon('alert')}<span>Send revised quote · 2 days overdue</span></div><div class="deal-meta"><span class="deal-value">$8,400</span><span>9d in stage</span></div></article>
            <article class="deal"><div class="deal-top"><div><div class="deal-name">Isla Morgan</div><div class="deal-co">Morgan Events</div></div><button class="btn btn-ghost btn-icon btn-sm" aria-label="Move Isla">${icon('more')}</button></div><div class="deal-next">${icon('clock')}<span>Answer questions · Monday</span></div><div class="deal-meta"><span class="deal-value">$4,700</span><span>4d in stage</span></div></article>
            <button class="btn btn-ghost btn-sm col-add">${icon('plus')}Add</button></section>
          <section class="col"><div class="col-head"><h3 class="col-title"><span class="dot" style="background:var(--success)"></span>Won <span class="col-count">0</span></h3><span class="col-sum">$0</span></div><p class="hint" style="padding:8px">No clients here yet. Drag one in when they sign.</p><button class="btn btn-ghost btn-sm col-add">${icon('plus')}Add</button></section>
        </div>`,
        'Keep empty columns visible with “+ Add”; ≤ 4 lines per card; days-in-stage as aging hint.', 'Hiding stages when filtered; cards with every field; drag-only interaction.')}

      ${sec('table', 'Data table', 'Framed surface, hairline rows, 14px text, sticky header, row click opens detail.', `
        <div class="table-frame"><div class="table-scroll"><table class="table"><thead><tr><th>Client</th><th>Stage</th><th class="right">Value</th><th>Next step</th><th>Due</th></tr></thead><tbody>
          <tr><td><div class="cell-name"><div class="avatar">JR</div><div><strong>Jonah Reyes</strong><span>Reyes Architecture</span></div></div></td><td><span class="badge badge-warning">Negotiating</span></td><td class="right num">$12,600</td><td>Final terms call</td><td>Tomorrow</td></tr>
          <tr><td><div class="cell-name"><div class="avatar">PN</div><div><strong>Priya Nair</strong><span>Bloom Wellness</span></div></div></td><td><span class="badge badge-info">Proposal sent</span></td><td class="right num">$5,800</td><td>Follow up on proposal</td><td style="color:var(--danger)">Yesterday</td></tr>
          <tr><td><div class="cell-name"><div class="avatar">AC</div><div><strong>Ava Chen</strong><span>Northlight Studio</span></div></div></td><td><span class="badge badge-accent">New inquiry</span></td><td class="right num">$2,500</td><td>Reply to inquiry</td><td>Today</td></tr>
        </tbody></table></div><div class="table-foot"><span>Showing 3 of 16</span><div style="display:flex;gap:8px"><button class="btn btn-sm" disabled>Previous</button><button class="btn btn-sm">Next</button></div></div></div>`,
        'Right-align numbers; tabular figures; pagination always rendered; actions in a ⋯ menu.', '12px cells; zebra stripes plus borders plus cards; hover-only actions.')}

      ${sec('timeline', 'Activity timeline', 'The history of a relationship, newest first, with type icons and relative dates.', `
        <div class="card card-pad" style="max-width:520px"><ol class="timeline">
          <li><div class="tl-icon">${icon('phone')}</div><div><div class="tl-title">Call logged</div><div class="tl-body">Agreed to a site visit next Tuesday.</div><div class="tl-when">Today</div></div></li>
          <li><div class="tl-icon">${icon('move')}</div><div><div class="tl-title">Moved to Proposal sent</div><div class="tl-when">3 days ago</div></div></li>
          <li><div class="tl-icon">${icon('mail')}</div><div><div class="tl-title">Email sent</div><div class="tl-body">Shared portfolio and pricing guide.</div><div class="tl-when">8 days ago</div></div></li>
        </ol></div>`,
        'Short summaries; relative dates; one icon per activity type.', 'Full email bodies inline; mixed icon styles.')}

      ${sec('empty', 'Empty states', 'Say what belongs here, why it is worth it, and offer one primary action. Filtered-empty offers a way out.', `
        <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))">
          <div class="table-frame"><div class="empty"><div class="empty-icon">${icon('users')}</div><h3>No clients yet</h3><p>Add your first client to start tracking next steps and your pipeline.</p><div class="actions"><button class="btn btn-primary">${icon('plus')}Add your first client</button><button class="btn">${icon('upload')}Import CSV</button></div></div></div>
          <div class="table-frame"><div class="empty"><div class="empty-icon">${icon('search')}</div><h3>No clients match these filters</h3><p>Try a broader search or clear the filters to see everyone.</p><div class="actions"><button class="btn">Clear filters</button></div></div></div>
        </div>`,
        'Keep the frame of the page pattern; one primary action; typography and a simple icon.', 'Cartoon people; “No data.” with no action; replacing the whole page.')}

      ${sec('loading', 'Loading skeleton', 'Under 100 ms show nothing, up to 1 s show an inline indicator, beyond that a skeleton that mirrors the real layout.', `
        <div class="kpis" aria-hidden="true">${[1, 2, 3, 4].map(() => `<div class="card kpi"><div class="skel" style="height:14px;width:60%"></div><div class="skel" style="height:30px;width:45%;margin-top:6px"></div><div class="skel" style="height:12px;width:70%;margin-top:4px"></div></div>`).join('')}</div>
        <div class="table-frame" style="margin-top:16px" aria-hidden="true">${[1, 2, 3].map(() => `<div class="row"><div class="skel" style="width:28px;height:28px;border-radius:50%"></div><div class="row-main"><div class="skel" style="height:12px;width:40%"></div><div class="skel" style="height:10px;width:25%;margin-top:6px"></div></div><div class="skel" style="height:28px;width:72px"></div></div>`).join('')}</div>`,
        'Match the final geometry; calm shimmer; honor reduced motion.', 'Full-page spinners; skeletons for 80 ms loads; layout jumps when data arrives.')}

      ${sec('overlays', 'Slide-over, confirm & toast', 'Quick tasks slide in from the right; destructive actions name the thing; reversible actions offer undo.', `
        <div class="s-demo-row"><button class="btn btn-primary" data-ov="sheet">${icon('plus')}Open slide-over</button><button class="btn" data-ov="dialog">${icon('archive')}Archive client…</button><button class="btn" data-ov="toast">Move with undo toast</button></div>`,
        'Cancel focused by default in destructive dialogs; Escape closes; focus returns to the trigger.', '“Are you sure?”; stacked modals; toasts without undo for destructive actions.')}
    </div>`;

    const setTheme = (t) => { saveTheme(t); main.querySelectorAll('[data-stage]').forEach((s) => (s.dataset.theme = t)); main.querySelectorAll('[data-set-theme]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.setTheme === t)); };
    main.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.setTheme) setTheme(b.dataset.setTheme);
      if (b.dataset.copyHtml) copy(main.querySelector(`[data-stage="${b.dataset.copyHtml}"]`).innerHTML.trim().replace(/\n\s+/g, '\n'));
      if (b.dataset.ov) overlayDemo(b.dataset.ov, b);
    });
  }
  function overlayDemo(kind, trigger) {
    const host = document.createElement('div'); host.className = 'themed'; host.dataset.theme = current.theme; host.style.cssText = 'position:fixed;inset:0;z-index:80;background:none;pointer-events:none';
    document.body.append(host);
    const close = () => { host.querySelectorAll('.sheet,.scrim,.toast').forEach((x) => x.classList.add('out')); setTimeout(() => host.remove(), 160); trigger.focus(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    if (kind === 'toast') {
      host.innerHTML = `<div class="toasts" style="pointer-events:auto"><div class="toast"><span>Maya Lindqvist moved to Negotiating</span><button>Undo</button></div></div>`;
      host.querySelector('button').addEventListener('click', close); setTimeout(close, 4000); return;
    }
    host.style.pointerEvents = 'auto';
    host.innerHTML = kind === 'sheet'
      ? `<div class="scrim" data-x></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Add client"><div class="sheet-head"><div><h2 class="display" style="font-size:var(--text-xl)">Add client</h2><p class="muted" style="font-size:var(--text-sm)">Only the name is required.</p></div><button class="btn btn-ghost btn-icon" data-x aria-label="Close">${icon('x')}</button></div>
         <div class="sheet-body"><div class="field"><label class="label" for="ovn">Name</label><input class="input" id="ovn"></div><div class="field"><label class="label" for="ovc">Company <span class="subtle">(optional)</span></label><input class="input" id="ovc"></div><div class="field"><label class="label" for="ovs">Next step</label><input class="input" id="ovs" value="Intro call"></div></div>
         <div class="sheet-foot"><button class="btn" data-x>Cancel</button><button class="btn btn-primary" data-x>Add client</button></div></div>`
      : `<div class="scrim" data-x></div><div class="dialog" role="alertdialog" aria-modal="true" aria-label="Archive client"><h2>Archive client “Harbor & Pine Interiors”?</h2><p>It will be hidden from your pipeline and lists. You can undo this right after.</p><div class="actions"><button class="btn" data-x data-default>Cancel</button><button class="btn btn-danger" data-x>Archive client</button></div></div>`;
    host.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) close(); });
    document.addEventListener('keydown', onKey);
    (host.querySelector('[data-default]') || host.querySelector('input')).focus();
  }

  // ---------------------------------------------------------------- demo
  function pageDemo() {
    main.innerHTML = `<div class="s-wrap">
      <div class="s-demo-bar"><div><h1 class="s-h3" style="font-size:22px">Demo CRM</h1><p class="s-small s-muted" style="margin:2px 0 0">A working reference built with this framework. Fictional sample data; nothing is saved. Try dragging cards, <span class="s-code">/</span> to search, <span class="s-code">N</span> to add.</p></div>
        <label style="display:flex;gap:8px;align-items:center" class="s-small">Theme <select class="s-select" data-demo-theme>${TH.map((t) => `<option value="${t.id}" ${current.theme === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}</select></label></div>
      <div class="s-demo-frame"><div data-demo style="height:100%"></div></div></div>`;
    const app = CRM.mount($('[data-demo]'), { theme: current.theme, shortcuts: true });
    $('[data-demo-theme]').addEventListener('change', (e) => { saveTheme(e.target.value); app.setTheme(e.target.value); });
  }

  // ---------------------------------------------------------------- docs
  function pageDocs(path, anchor) {
    const doc = DOCS.find((d) => d.path === path) || DOCS[0];
    if (!main.querySelector('[data-docs]')) {
      const groups = [...new Set(DOCS.map((d) => d.group))];
      main.innerHTML = `<div class="s-wrap"><div class="s-docs" data-docs>
        <nav class="s-docnav" aria-label="Documentation"><details open><summary>Documentation</summary>${groups.map((g) => `<h4>${g}</h4>${DOCS.filter((d) => d.group === g).map((d) => `<a href="#/docs/${d.path}" data-doc="${d.path}">${esc(d.title)}</a>`).join('')}`).join('')}</details></nav>
        <article class="s-prose" data-doc-body></article></div></div>`;
      if (matchMedia('(max-width: 900px)').matches) main.querySelector('.s-docnav details').open = false;
    }
    main.querySelectorAll('[data-doc]').forEach((a) => a.setAttribute('aria-current', a.dataset.doc === doc.path ? 'page' : 'false'));
    const body = $('[data-doc-body]');
    body.innerHTML = `<div class="s-doc-meta"><span>${esc(doc.path)}</span><a class="s-link" href="${REPO}/blob/main/${doc.path}" target="_blank" rel="noopener">View on GitHub ↗</a></div>` + renderMarkdown(doc.md, doc.path, docPaths);
    document.title = doc.title + ' · Dashboard Tools';
    if (anchor) { const t = document.getElementById(anchor); if (t) { t.scrollIntoView(); return; } }
    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------- inventory
  function pageInventory() {
    const linked = (s) => s.catalog_id && toolById[s.catalog_id];
    main.innerHTML = `<div class="s-wrap">
      <div class="s-pagehead"><div><p class="s-eyebrow">Inventory · snapshot ${INV.snapshot_date}</p><h1 class="s-h1" style="font-size:clamp(36px,5vw,56px)">All ${INV.total} installed skills</h1>
      <p class="s-lead">Every skill in the authoring environment, grouped by plugin and rated for dashboard work. Highlighted names are in the curated catalog; click to open them.</p></div></div>
      <div class="s-inv" style="padding-bottom:64px">${INV.plugins.map((p) => `
        <details ${p.relevance === 'high' ? 'open' : ''}><summary><b>${esc(p.plugin)}</b><span class="note">${esc(p.note)}</span><span style="display:flex;gap:6px"><span class="s-tag rel-${p.relevance}">${p.relevance}</span><span class="s-tag">${p.count}</span></span></summary>
        <div class="s-inv-list">${p.skills.map((s) => linked(s) ? `<a class="s-tag linked" style="text-decoration:none" href="#/tools/${s.catalog_id}">${esc(s.name)}</a>` : `<span class="s-tag">${esc(s.name)}</span>`).join('')}</div></details>`).join('')}</div></div>`;
  }

  // ---------------------------------------------------------------- router
  const titles = { '': 'Dashboard Tools', tools: 'Tools', framework: 'Framework', themes: 'Themes', components: 'Components', demo: 'Demo', docs: 'Docs', inventory: 'Inventory' };
  let lastPage = null;
  function route() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [pathPart, anchor] = (() => { const i = raw.indexOf('#'); return i < 0 ? [raw, ''] : [raw.slice(0, i), raw.slice(i + 1)]; })();
    const [page, ...rest] = pathPart.split('/');
    const sub = rest.join('/');
    if (page !== 'tools') closeDrawer(true);
    const samePage = lastPage === page && (page === 'tools' || page === 'docs');
    if (!samePage) main.innerHTML = '';
    lastPage = page;
    document.querySelectorAll('.s-nav a').forEach((a) => a.setAttribute('aria-current', a.dataset.page === (page || 'home') ? 'page' : 'false'));
    document.title = (titles[page] && page ? titles[page] + ' · ' : '') + 'Dashboard Tools';
    switch (page) {
      case 'tools': pageTools(sub); break;
      case 'framework': pageFramework(); break;
      case 'themes': pageThemes(); break;
      case 'components': pageComponents(); break;
      case 'demo': pageDemo(); break;
      case 'docs': pageDocs(sub || 'README.md', anchor); break;
      case 'inventory': pageInventory(); break;
      default: pageHome();
    }
    if (!samePage && page !== 'docs') window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
