/** Chart draw-in: stroke dash for lines, scaleY for bars, sweep for arcs. */
export function mountDraw(root = document) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hosts = [...root.querySelectorAll('[data-fx="draw"]')];
  if (!hosts.length) return () => {};

  function prep(host) {
    host.querySelectorAll('path.line, path.fx-draw-line, .line').forEach((p) => {
      p.classList.add('fx-draw-line');
      try {
        const len = p.getTotalLength?.() || 1000;
        p.style.setProperty('--fx-len', String(len));
      } catch (_) {
        p.style.setProperty('--fx-len', '1000');
      }
    });
    host.querySelectorAll('.cx-bar, .fx-draw-bar, [data-bar]').forEach((b) => b.classList.add('fx-draw-bar'));
    host.querySelectorAll('path.fx-draw-arc, .arc-value').forEach((p) => {
      p.classList.add('fx-draw-arc');
      try {
        const len = p.getTotalLength?.() || 1000;
        p.style.setProperty('--fx-len', String(len));
      } catch (_) {
        p.style.setProperty('--fx-len', '1000');
      }
    });
  }

  hosts.forEach(prep);
  if (reduce) {
    hosts.forEach((h) => h.classList.add('is-in'));
    return () => {};
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  hosts.forEach((h) => io.observe(h));
  return () => io.disconnect();
}
