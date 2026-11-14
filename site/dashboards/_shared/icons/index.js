/**
 * Shared animated icons. Usage:
 *   <span data-icon="bell" data-anim="hover"></span>
 *   import { paintIcons } from '../_shared/icons/index.js'; paintIcons();
 */
import { PATHS } from './paths.js';

export { PATHS };

export function svgFor(name, sw = 1.75) {
  const body = PATHS[name] || PATHS.sparkles;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><g class="ic-draw">${body}</g></svg>`;
}

export function paintIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    if (el.dataset.iconPainted === '1' && !el.dataset.iconForce) return;
    el.dataset.iconPainted = '1';
    el.innerHTML = svgFor(el.dataset.icon);
  });
}

if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./icons.css', import.meta.url).href;
  document.head.appendChild(link);
  const run = () => paintIcons();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  window.DB = window.DB || {};
  window.DB.icons = { paint: paintIcons, svg: svgFor, paths: PATHS };
}
