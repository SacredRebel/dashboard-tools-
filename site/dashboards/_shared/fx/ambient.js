/** Ambient loop: slow drift/glow 8–20s; CSS anim; pauses via data-motion-paused. */
export function mountAmbient(root = document) {
  const nodes = [...root.querySelectorAll('[data-fx="ambient"]')];
  nodes.forEach((el) => {
    const dur = Number(el.dataset.fxDur) || 14;
    el.style.setProperty('--fx-ambient-dur', `${Math.min(20, Math.max(8, dur))}s`);
    if (el.dataset.fxAx) el.style.setProperty('--fx-ax', `${el.dataset.fxAx}px`);
    if (el.dataset.fxAy) el.style.setProperty('--fx-ay', `${el.dataset.fxAy}px`);
  });
  return () => {};
}
