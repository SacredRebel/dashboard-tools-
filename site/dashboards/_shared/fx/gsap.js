/**
 * Lazy GSAP loader for gallery dashboards (vendored, zero CDN).
 *   import { withGsap } from '../_shared/fx/gsap.js';
 *   withGsap((gsap) => { gsap.to(...); });
 * Honors prefers-reduced-motion and DB.onVisible pause via data-motion-paused.
 */
const GSAP_URL = new URL('../../_vendor/gsap@3.13.0/gsap.min.js', import.meta.url).href;
const ST_URL = new URL('../../_vendor/gsap@3.13.0/ScrollTrigger.min.js', import.meta.url).href;

let loading;
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if ([...document.scripts].some((s) => s.src === src)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export function reducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export async function loadGsap({ scrollTrigger = false } = {}) {
  if (window.gsap && (!scrollTrigger || window.ScrollTrigger)) return window.gsap;
  if (!loading) {
    loading = loadScript(GSAP_URL).then(async () => {
      if (scrollTrigger) await loadScript(ST_URL);
      if (window.gsap && window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
      return window.gsap;
    });
  }
  return loading;
}

/**
 * Run a GSAP timeline only while the root is visible and motion is allowed.
 * Returns a cleanup that kills the timeline.
 */
export async function withGsap(fn, { scrollTrigger = false, root = document.documentElement } = {}) {
  if (reducedMotion()) return () => {};
  const gsap = await loadGsap({ scrollTrigger });
  if (!gsap) return () => {};
  const ctx = gsap.context(() => {
    fn(gsap, window.ScrollTrigger);
  }, root);
  const pause = () => {
    if (document.documentElement.dataset.motionPaused === '1') ctx.animations?.forEach?.(() => {});
    gsap.globalTimeline?.paused(document.documentElement.dataset.motionPaused === '1');
  };
  const onVis = () => pause();
  document.addEventListener('visibilitychange', onVis);
  const mo = new MutationObserver(pause);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion-paused'] });
  pause();
  return () => {
    document.removeEventListener('visibilitychange', onVis);
    mo.disconnect();
    ctx.revert();
  };
}

window.DB = window.DB || {};
window.DB.gsap = { load: loadGsap, withGsap, reducedMotion };
