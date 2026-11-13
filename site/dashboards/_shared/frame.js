/* Shared runtime for gallery dashboards.
   - ?variant=<id>  sets <html data-variant> (variants are declared in catalog/dashboards.json)
   - ?embed=1       sets <html data-embed> (gallery preview iframes; dashboards may hide nothing, it is a hint)
   - window.DB.onVisible(el, cb) runs cb(true/false) when el enters/leaves view or the tab hides (no polling). */
(function () {
  const q = new URLSearchParams(location.search);
  const html = document.documentElement;
  if (q.get('variant')) html.dataset.variant = q.get('variant');
  if (q.get('embed')) html.dataset.embed = '1';
  window.DB = {
    variant: html.dataset.variant || 'default',
    onVisible(el, cb) {
      let seen = false;
      const io = new IntersectionObserver((es) => { seen = es[0].isIntersecting; cb(seen && !document.hidden); });
      io.observe(el);
      document.addEventListener('visibilitychange', () => cb(seen && !document.hidden));
    },
  };
})();
