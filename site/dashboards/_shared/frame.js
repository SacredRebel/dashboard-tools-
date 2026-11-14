/* Shared runtime for gallery dashboards.
   - ?variant=<id>  sets <html data-variant> (variants are declared in catalog/dashboards.json)
   - ?embed=1       sets <html data-embed> (gallery preview iframes; dashboards may hide nothing, it is a hint)
   - window.DB.onVisible(el, cb) runs cb(true/false) when el enters/leaves view or the tab hides (no polling).
   - window.DB.route(pages, render) hash router for multi-page dashboards (#/overview, #/devices…).
     Keeps ?variant= / ?embed= intact. Updates aria-current, document.title, focus, Back/Forward. */
(function () {
  const q = new URLSearchParams(location.search);
  const html = document.documentElement;
  if (q.get('variant')) html.dataset.variant = q.get('variant');
  if (q.get('embed')) html.dataset.embed = '1';

  function searchKeep() {
    const s = location.search || '';
    return s;
  }

  function normalizePages(pages) {
    if (!Array.isArray(pages) || !pages.length) throw new Error('DB.route: pages must be a non-empty array');
    return pages.map((p) => {
      if (typeof p === 'string') return { id: p, name: p.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) };
      if (!p || !p.id) throw new Error('DB.route: each page needs an id');
      return { id: String(p.id), name: p.name || String(p.id), pattern: p.pattern };
    });
  }

  function pageIdFromHash(list) {
    const raw = (location.hash || '').replace(/^#\/?/, '').split(/[/?#]/)[0];
    if (raw && list.some((p) => p.id === raw)) return raw;
    return list[0].id;
  }

  function setNavCurrent(id) {
    document.querySelectorAll('a[href^="#/"]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const pid = href.replace(/^#\/?/, '').split(/[/?#]/)[0];
      if (pid === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function focusPageHeading() {
    const heading = document.querySelector('[data-db-page]:not([hidden]) h1, [data-db-page]:not([hidden]) h2, main h1, main h2');
    if (!heading) return;
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    try { heading.focus({ preventScroll: true }); } catch (_) { /* ignore */ }
  }

  window.DB = {
    variant: html.dataset.variant || 'default',
    page: null,
    onVisible(el, cb) {
      let seen = false;
      const io = new IntersectionObserver((es) => { seen = es[0].isIntersecting; cb(seen && !document.hidden); });
      io.observe(el);
      document.addEventListener('visibilitychange', () => cb(seen && !document.hidden));
    },
    /** @param {{id:string,name?:string,pattern?:string}[]|string[]} pages @param {(id:string, page:object) => void} render */
    route(pages, render) {
      if (typeof render !== 'function') throw new Error('DB.route: render callback required');
      const list = normalizePages(pages);
      const byId = Object.fromEntries(list.map((p) => [p.id, p]));

      let first = true;
      function apply(id, { replace } = {}) {
        const page = byId[id] || list[0];
        const hash = `#/${page.id}`;
        const next = searchKeep() + hash;
        const cur = searchKeep() + (location.hash || '');
        if (cur !== next) {
          if (replace) history.replaceState(null, '', next);
          else history.pushState(null, '', next);
        } else if (!location.hash) {
          history.replaceState(null, '', next);
        }
        html.dataset.page = page.id;
        window.DB.page = page.id;
        setNavCurrent(page.id);
        const baseTitle = (document.title.split('·')[0] || document.title).trim();
        document.title = `${page.name} · ${baseTitle}`;
        render(page.id, page);
        // Move focus only on in-app navigation. Focusing on first load draws a focus ring in screenshots
        // and steals the screen reader's start position.
        if (!first) focusPageHeading();
        first = false;
      }

      function syncFromLocation() {
        apply(pageIdFromHash(list), { replace: true });
      }

      window.addEventListener('hashchange', syncFromLocation);
      window.addEventListener('popstate', syncFromLocation);

      // Default page when hash is empty or unknown
      if (!location.hash || location.hash === '#' || location.hash === '#/') {
        history.replaceState(null, '', searchKeep() + `#/${list[0].id}`);
      }
      syncFromLocation();

      return {
        pages: list,
        go(id) {
          if (!byId[id]) return;
          location.hash = `#/${id}`;
        },
        current() { return window.DB.page; },
      };
    },
  };
})();
