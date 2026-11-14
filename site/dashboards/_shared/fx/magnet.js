/** Magnetic pull ≤ 6px toward pointer. */
export function mountMagnet(root = document) {
  if (matchMedia('(pointer: coarse)').matches) return () => {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const nodes = [...root.querySelectorAll('[data-fx="magnet"]')];
  if (!nodes.length) return () => {};
  const clean = [];
  nodes.forEach((el) => {
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const pull = Math.min(6, 80 / dist * 2);
      el.style.transform = `translate(${(dx / dist) * pull}px, ${(dy / dist) * pull}px)`;
    };
    const reset = () => { el.style.transform = ''; };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
    clean.push(() => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', reset);
    });
  });
  return () => clean.forEach((fn) => fn());
}
