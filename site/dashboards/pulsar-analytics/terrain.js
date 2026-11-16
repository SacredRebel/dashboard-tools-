/* Pulsar Analytics hero: layered ridge silhouettes over a glowing pool (three.js primitives, no model file).
   Each ridge is a vertical ribbon: bright along its crest, fading to nothing at its base, with an additive crest line.
   Ridges sit at different depths, so the pointer parallax separates them. Same wiring as meridian-labs/helix.js. */
import * as THREE from 'three';
import { createStage } from '../_shared/three/stage.js';

const canvas = document.querySelector('[data-hero-canvas]');
const hero = document.querySelector('[data-hero]');
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

try {
  const stage = createStage(canvas, { fov: 26, parallaxDeg: 5, idleSpin: false });
  stage.contactShadow.visible = false;
  stage.camera.position.set(0, 0, 10);            // visible area is about 7.2 wide and 4.6 high at z = 0

  const N = 160;
  function ribbon(profile, x0, x1, base, z, topCol, lowCol, topA) {
    const pos = new Float32Array(N * 2 * 3), col = new Float32Array(N * 2 * 4), idx = [], crest = new Float32Array(N * 3), crestCol = new Float32Array(N * 3);
    const a = new THREE.Color(), b = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1), x = x0 + (x1 - x0) * u, h = Math.max(0.02, profile(x, u));
      pos.set([x, h, 0, x, 0, 0], i * 6);
      a.set(typeof topCol === 'function' ? topCol(u) : topCol); b.set(lowCol);
      const edge = Math.min(1, u * 8, (1 - u) * 8);                // fade the ends so a ribbon never ends in a hard cut
      col.set([a.r, a.g, a.b, topA * edge, b.r, b.g, b.b, 0], i * 8);
      crest.set([x, h, 0.01], i * 3); crestCol.set([a.r * edge, a.g * edge, a.b * edge], i * 3);
      if (i < N - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 4)); g.setIndex(idx);
    const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(crest, 3)); lg.setAttribute('color', new THREE.BufferAttribute(crestCol, 3));
    const line = new THREE.Line(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    const inner = new THREE.Group(); inner.add(mesh, line); inner.scale.y = 0.74;   // overall ridge height, tuned against the reference
    const grp = new THREE.Group(); grp.add(inner); grp.position.set(0, base, z); stage.root.add(grp); return grp;
  }
  const G = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
  const C = () => ({ mint: css('--mint') || '#3dffc0', teal: css('--teal') || '#0f6f66', peach: css('--peach') || '#ffc08a', pink: css('--pink') || '#ff7fb0', violet: css('--violet') || '#b26bff', glow: css('--pool') || '#e9c8ff', deep: css('--deep') || '#14121c' });
  let c = C(), ridges = [];
  function build() {
    ridges.forEach((r) => { stage.root.remove(r); r.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); }); }); c = C();
    const peach = ribbon((x, u) => 0.25 + 1.75 * u ** 1.35 + 0.12 * Math.sin(x * 2.4) + 0.3 * G(x, 0.9, 0.6), -0.4, 3.9, -1.25, -0.9, (u) => new THREE.Color(c.pink).lerp(new THREE.Color(c.peach), u), c.deep, 0.5);
    const back = ribbon((x) => 0.5 + 0.9 * G(x, -2.0, 0.9) + 0.7 * G(x, 0.9, 1.0), -3.7, 2.4, -1.45, -0.45, c.teal, c.deep, 0.55);
    const mint = ribbon((x) => 0.18 + 1.25 * G(x, -1.55, 0.5) + 1.7 * G(x, -0.15, 0.46) + 0.5 * G(x, -0.85, 1.2) + 0.35 * G(x, 0.9, 0.7), -3.7, 2.2, -1.5, 0, c.mint, c.teal, 0.78);
    const front = ribbon((x) => 0.12 + 0.55 * G(x, -1.0, 1.1) + 0.3 * G(x, 0.8, 0.8), -3.7, 2.6, -1.62, 0.5, c.teal, c.deep, 0.75);
    const pool = ribbon((x) => 0.5 + 0.1 * Math.sin(x * 1.3 + 0.6) + 0.05 * Math.sin(x * 3.1), -3.7, 1.9, -2.35, 0.9, c.glow, c.violet, 0.95);
    ridges = [peach, back, mint, front, pool];
  }
  build();

  // a few fine "signal" lines and dots floating above the ridges
  const pts = [], seg = []; let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 46; i++) pts.push(new THREE.Vector3(-3.4 + rnd() * 6.2, -0.9 + rnd() * 2.9, -0.4 + rnd() * 1.0));
  for (let i = 0; i < 16; i++) { const a = pts[Math.floor(rnd() * pts.length)], b = pts[Math.floor(rnd() * pts.length)]; if (a.distanceTo(b) < 2.6) seg.push(a, b); }
  const dots = new THREE.Points(new THREE.BufferGeometry().setFromPoints(pts), new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.6, toneMapped: false }));
  const web = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, toneMapped: false }));
  stage.root.add(dots, web);

  const SHAPE = { users: [1, 1, 1], sessions: [1.18, 0.82, 1], errors: [0.8, 0.7, 1.25], latency: [1.3, 0.9, 0.9] };   // peach, mint, pool
  let target = SHAPE.users; const cur = [1, 1, 1];
  stage.onFrame((t) => {
    for (let i = 0; i < 3; i++) cur[i] += (target[i] - cur[i]) * 0.06;
    ridges[0].scale.y = cur[0] * (1 + Math.sin(t * 0.5) * 0.015); ridges[2].scale.y = cur[1] * (1 + Math.sin(t * 0.7 + 1) * 0.02);
    ridges[1].scale.y = 1 + Math.sin(t * 0.4 + 2) * 0.02; ridges[4].scale.y = cur[2] * (1 + Math.sin(t * 0.9) * 0.05);
    dots.material.opacity = 0.45 + Math.sin(t * 1.1) * 0.15;
  });

  window.DBHero = {
    setMode(m) { target = SHAPE[m] || SHAPE.users; },
    recolor() { build(); },
    poster() { stage.renderer.render(stage.scene, stage.camera); return canvas.toDataURL('image/png'); },
  };
  hero.dataset.live = '1';
  document.dispatchEvent(new CustomEvent('db-hero-ready'));
} catch (err) { hero.dataset.live = '0'; }
