/**
 * Gallery FX auto-wire. Import once after frame.js:
 *   <script type="module">import { bootFx } from '../_shared/fx/index.js'; bootFx();</script>
 * Or set data-fx-auto on <html> and include this module.
 * Effects honor prefers-reduced-motion and pause via DB.onVisible → data-motion-paused.
 */
import { mountReveal } from './reveal.js';
import { mountCount } from './count.js';
import { mountDraw } from './draw.js';
import { mountSpotlight } from './spotlight.js';
import { mountTilt } from './tilt.js';
import { mountMagnet } from './magnet.js';
import { mountSplit } from './split.js';
import { mountShine } from './shine.js';
import { mountParallax } from './parallax.js';
import { mountAmbient } from './ambient.js';
import { mountSparks } from './sparks.js';
import { mountList } from './list.js';
import { mountOdo } from './odo.js';

export const FX_IDS = [
  'reveal', 'count', 'draw', 'spotlight', 'tilt', 'magnet',
  'split', 'shine', 'parallax', 'ambient', 'sparks', 'list', 'odo', 'route',
];

const mounts = {
  reveal: mountReveal,
  count: mountCount,
  draw: mountDraw,
  spotlight: mountSpotlight,
  tilt: mountTilt,
  magnet: mountMagnet,
  split: mountSplit,
  shine: mountShine,
  parallax: mountParallax,
  ambient: mountAmbient,
  sparks: mountSparks,
  list: mountList,
  odo: mountOdo,
};

export function bootFx(root = document) {
  const cleanups = Object.values(mounts).map((fn) => fn(root));
  return () => cleanups.forEach((fn) => fn && fn());
}

export function remountFx(root = document) {
  return bootFx(root);
}

if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./fx.css', import.meta.url).href;
  if (![...document.styleSheets].some((s) => s.href && s.href.includes('/fx/fx.css'))) {
    document.head.appendChild(link);
  }
  if (document.documentElement.hasAttribute('data-fx-auto') || document.querySelector('[data-fx]')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => bootFx(), { once: true });
    } else {
      bootFx();
    }
  }
  window.DB = window.DB || {};
  window.DB.fx = { boot: bootFx, remount: remountFx, ids: FX_IDS };
}
