/** FLIP insert/remove for live feeds. Exposes el.fxList = { add, remove }. */
export function mountList(root = document) {
  const hosts = [...root.querySelectorAll('[data-fx="list"]')];
  if (!hosts.length) return () => {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  hosts.forEach((host) => {
    const measure = () => {
      const map = new Map();
      [...host.children].forEach((c) => map.set(c, c.getBoundingClientRect()));
      return map;
    };
    const flip = (before) => {
      if (reduce) return;
      [...host.children].forEach((c) => {
        const b = before.get(c);
        const a = c.getBoundingClientRect();
        if (!b) {
          c.classList.add('is-enter');
          requestAnimationFrame(() => c.classList.remove('is-enter'));
          return;
        }
        const dx = b.left - a.left;
        const dy = b.top - a.top;
        if (!dx && !dy) return;
        c.style.transform = `translate(${dx}px, ${dy}px)`;
        c.style.transition = 'none';
        requestAnimationFrame(() => {
          c.style.transition = '';
          c.style.transform = '';
        });
      });
    };

    host.fxList = {
      add(node, at = null) {
        const before = measure();
        if (at == null) host.appendChild(node);
        else host.insertBefore(node, host.children[at] || null);
        node.classList.add('fx-list-item');
        flip(before);
      },
      remove(node) {
        const before = measure();
        if (reduce) { node.remove(); return; }
        node.classList.add('is-leave');
        const done = () => { node.remove(); flip(before); };
        node.addEventListener('transitionend', done, { once: true });
        setTimeout(done, 220);
      },
    };
  });

  return () => {};
}
