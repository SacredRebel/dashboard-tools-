/** Digit-roll odometer for KPIs that change on interaction. */
export function mountOdo(root = document) {
  const nodes = [...root.querySelectorAll('[data-fx="odo"]')];
  if (!nodes.length) return () => {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  nodes.forEach((el) => {
    const set = (value) => {
      const next = String(value);
      if (reduce || el.dataset.fxOdoInit !== '1') {
        el.textContent = next;
        el.dataset.fxOdoInit = '1';
        el.dataset.value = next;
        return;
      }
      const prev = el.dataset.value || el.textContent || '0';
      el.dataset.value = next;
      const maxLen = Math.max(prev.length, next.length);
      const a = prev.padStart(maxLen, ' ');
      const b = next.padStart(maxLen, ' ');
      el.innerHTML = '';
      for (let i = 0; i < maxLen; i++) {
        const span = document.createElement('span');
        span.style.cssText = 'display:inline-block;overflow:hidden;height:1.1em;vertical-align:bottom';
        const inner = document.createElement('span');
        inner.style.cssText = 'display:block;transition:transform 200ms cubic-bezier(0.16,1,0.3,1)';
        inner.textContent = a[i] === ' ' ? '\u00a0' : a[i];
        span.appendChild(inner);
        el.appendChild(span);
        if (a[i] !== b[i]) {
          requestAnimationFrame(() => {
            inner.style.transform = 'translateY(-100%)';
            const n2 = document.createElement('span');
            n2.style.cssText = 'display:block';
            n2.textContent = b[i] === ' ' ? '\u00a0' : b[i];
            inner.parentElement.appendChild(n2);
            setTimeout(() => { span.textContent = b[i] === ' ' ? '\u00a0' : b[i]; }, 220);
          });
        }
      }
    };
    el.fxOdo = { set };
    if (el.dataset.to != null) set(el.dataset.to);
  });

  return () => {};
}
