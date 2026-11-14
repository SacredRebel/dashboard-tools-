/** Pointer-follow radial highlight on cards. */
export function mountSpotlight(root = document) {
  const nodes = [...root.querySelectorAll('[data-fx~="spotlight"]')];
  if (!nodes.length) return () => {};
  const clean = [];
  nodes.forEach((el) => {
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--fx-spot-x', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--fx-spot-y', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    el.addEventListener('pointermove', onMove);
    clean.push(() => el.removeEventListener('pointermove', onMove));
  });
  return () => clean.forEach((fn) => fn());
}
