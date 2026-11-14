/** Canvas sparks ≤ 40 particles on click (feedback only). */
export function mountSparks(root = document) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const nodes = [...root.querySelectorAll('[data-fx~="sparks"]')];
  if (!nodes.length) return () => {};
  const clean = [];

  nodes.forEach((el) => {
    el.style.position = el.style.position || 'relative';
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let parts = [];
    let raf = 0;
    let visible = true;

    const resize = () => {
      const r = el.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(r.height * devicePixelRatio));
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();

    const tick = () => {
      if (!visible || document.documentElement.dataset.motionPaused === '1') {
        raf = requestAnimationFrame(tick);
        return;
      }
      const r = el.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      parts = parts.filter((p) => p.life > 0);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.03;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (parts.length) raf = requestAnimationFrame(tick);
      else raf = 0;
    };

    const burst = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const colors = ['var(--accent)', '#fff', 'var(--accent-2, #f59e0b)'];
      for (let i = 0; i < 18 && parts.length < 40; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1 + Math.random() * 3;
        parts.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          r: 1 + Math.random() * 2,
          life: 1,
          color: getComputedStyle(el).getPropertyValue('--accent').trim() || '#7c6cff',
        });
      }
      void colors;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    el.addEventListener('click', burst);
    window.addEventListener('resize', resize);
    if (window.DB?.onVisible) window.DB.onVisible(el, (v) => { visible = v; });
    clean.push(() => {
      el.removeEventListener('click', burst);
      window.removeEventListener('resize', resize);
      if (raf) cancelAnimationFrame(raf);
      canvas.remove();
    });
  });

  return () => clean.forEach((fn) => fn());
}
