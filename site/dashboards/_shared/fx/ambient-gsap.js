/**
 * GSAP ambient loops for cinematic boards (moon drift, sun pulse, petal float).
 * Mark nodes with data-gsap="drift|pulse|float". Pauses via data-motion-paused.
 */
import { withGsap, reducedMotion } from './gsap.js';

export async function bootAmbientGsap(root = document) {
  if (reducedMotion()) return () => {};
  const nodes = [...root.querySelectorAll('[data-gsap]')];
  if (!nodes.length) return () => {};

  return withGsap((gsap) => {
    nodes.forEach((el) => {
      const kind = el.dataset.gsap || 'drift';
      const dur = Number(el.dataset.gsapDur) || (kind === 'pulse' ? 3.2 : 12);
      if (kind === 'pulse') {
        gsap.to(el, {
          scale: 1.045,
          filter: 'brightness(1.08)',
          duration: dur,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      } else if (kind === 'float') {
        gsap.to(el, {
          y: -10,
          x: 6,
          rotation: 2,
          duration: dur,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      } else {
        gsap.to(el, {
          y: -8,
          x: 4,
          duration: dur,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      }
    });
  }, { root });
}

if (typeof document !== 'undefined' && document.querySelector('[data-gsap]')) {
  const run = () => bootAmbientGsap();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  window.DB = window.DB || {};
  window.DB.gsapAmbient = { boot: bootAmbientGsap };
}
