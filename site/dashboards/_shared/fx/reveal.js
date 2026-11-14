/** Stagger reveal: cards enter 12px up + fade, 40ms stagger, once per page view. */
export function mountReveal(root = document) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes = [...root.querySelectorAll('[data-fx="reveal"]')];
  if (!nodes.length) return () => {};
  if (reduce) {
    nodes.forEach((el) => el.classList.add('is-in'));
    return () => {};
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const i = Number(el.dataset.fxOrder || nodes.indexOf(el));
      el.style.transitionDelay = `${i * 40}ms`;
      el.classList.add('is-in');
      io.unobserve(el);
    });
  }, { threshold: 0.12 });
  nodes.forEach((el, i) => {
    if (!el.dataset.fxOrder) el.dataset.fxOrder = String(i);
    io.observe(el);
  });
  return () => io.disconnect();
}
