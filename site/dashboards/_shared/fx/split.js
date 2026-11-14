/** Per-word reveal for hero titles only. */
export function mountSplit(root = document) {
  const nodes = [...root.querySelectorAll('[data-fx~="split"]')];
  if (!nodes.length) return () => {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  nodes.forEach((el) => {
    if (el.dataset.fxSplit === '1') return;
    el.dataset.fxSplit = '1';
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.setAttribute('aria-label', text);
    el.innerHTML = words.map((w, i) =>
      `<span class="fx-word" style="transition-delay:${i * 40}ms">${w}</span>`
    ).join(' ');
    if (reduce) el.classList.add('is-in');
  });

  if (reduce) return () => {};

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  nodes.forEach((el) => io.observe(el));
  return () => io.disconnect();
}
