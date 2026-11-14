/** Pointer + scroll parallax ≤ 12px for layered hero art. */
export function mountParallax(root = document) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const hosts = [...root.querySelectorAll('[data-fx="parallax"]')];
  if (!hosts.length) return () => {};
  const clean = [];

  hosts.forEach((host) => {
    const layers = [...host.querySelectorAll('[data-fx-layer]')];
    let mx = 0; let my = 0; let sy = 0; let visible = true;

    const paint = () => {
      if (!visible || document.documentElement.dataset.motionPaused === '1') return;
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.fxLayer) || 1;
        const max = Math.min(12, depth * 4);
        layer.style.transform = `translate3d(${mx * max}px, ${my * max + sy * max * 0.3}px, 0)`;
      });
    };

    const onPointer = (e) => {
      const r = host.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      paint();
    };
    const onScroll = () => {
      const r = host.getBoundingClientRect();
      sy = Math.max(-1, Math.min(1, -r.top / (window.innerHeight || 1)));
      paint();
    };

    host.addEventListener('pointermove', onPointer);
    window.addEventListener('scroll', onScroll, { passive: true });
    if (window.DB?.onVisible) {
      window.DB.onVisible(host, (v) => { visible = v; });
    }
    clean.push(() => {
      host.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
    });
  });

  return () => clean.forEach((fn) => fn());
}
