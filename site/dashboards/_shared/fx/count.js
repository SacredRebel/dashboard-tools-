/** Count-up: tabular numbers, locale + decimals, runs when visible. */
export function mountCount(root = document) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes = [...root.querySelectorAll('[data-fx~="count"]')];
  if (!nodes.length) return () => {};

  function run(el) {
    if (el.dataset.fxDone === '1') return;
    el.dataset.fxDone = '1';
    const target = Number(el.dataset.to ?? el.textContent.replace(/[^0-9.-]/g, ''));
    const decimals = Number(el.dataset.decimals ?? (String(el.dataset.to || '').includes('.') ? 1 : 0));
    const locale = el.dataset.locale || undefined;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const fmt = (n) => prefix + n.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + suffix;
    if (reduce || !Number.isFinite(target)) {
      el.textContent = fmt(Number.isFinite(target) ? target : 0);
      return;
    }
    const dur = Math.min(300, Number(el.dataset.dur) || 280);
    const t0 = performance.now();
    const from = 0;
    const tick = (now) => {
      if (document.documentElement.dataset.motionPaused === '1') {
        requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - (1 - p) ** 3;
      el.textContent = fmt(from + (target - from) * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target);
    };
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        run(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  nodes.forEach((el) => io.observe(el));
  return () => io.disconnect();
}
