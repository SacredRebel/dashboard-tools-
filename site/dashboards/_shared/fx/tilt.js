/** Max 4° tilt + glare; disabled on touch. */
export function mountTilt(root = document) {
  if (matchMedia('(pointer: coarse)').matches) return () => {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const nodes = [...root.querySelectorAll('[data-fx~="tilt"]')];
  if (!nodes.length) return () => {};
  const clean = [];
  nodes.forEach((el) => {
    if (!el.querySelector('.fx-glare')) {
      const g = document.createElement('span');
      g.className = 'fx-glare';
      g.setAttribute('aria-hidden', 'true');
      el.appendChild(g);
    }
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const rx = Math.max(-4, Math.min(4, -py * 8));
      const ry = Math.max(-4, Math.min(4, px * 8));
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      el.classList.add('is-tilting');
    };
    const reset = () => {
      el.style.transform = '';
      el.classList.remove('is-tilting');
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
    clean.push(() => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', reset);
    });
  });
  return () => clean.forEach((fn) => fn());
}
