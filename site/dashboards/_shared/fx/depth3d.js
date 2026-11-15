/**
 * Subtle CSS 3D helpers — cylindrical floors, card tilt shells, curved stages.
 * data-fx="depth3d" on a stage; optional data-fx-depth="cylinder|stage".
 */
function reduced() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function mountDepth3d(root = document) {
  const nodes = [...root.querySelectorAll('[data-fx~="depth3d"]')];
  if (!nodes.length) return () => {};

  const cleanups = nodes.map((el) => {
    el.classList.add('fx-depth3d');
    const kind = el.dataset.fxDepth || 'stage';
    el.dataset.fxDepthKind = kind;
    if (kind === 'cylinder' && !el.querySelector('.fx-depth-floor')) {
      const floor = document.createElement('div');
      floor.className = 'fx-depth-floor';
      floor.setAttribute('aria-hidden', 'true');
      el.prepend(floor);
    }
    if (reduced()) return () => {};

    let raf = 0;
    const onMove = (e) => {
      if (document.documentElement.dataset.motionPaused === '1') return;
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--fx-depth-rx', `${(-y * 3).toFixed(2)}deg`);
        el.style.setProperty('--fx-depth-ry', `${(x * 4).toFixed(2)}deg`);
      });
    };
    const reset = () => {
      el.style.setProperty('--fx-depth-rx', '0deg');
      el.style.setProperty('--fx-depth-ry', '0deg');
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', reset);
    };
  });

  return () => cleanups.forEach((fn) => fn && fn());
}
