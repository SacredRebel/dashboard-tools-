/* Meridian Labs hero: a DNA double helix built from three.js primitives (no model file).
   Pattern for any procedural hero: build into stage.root, light it, expose a tiny API on window for app.js. */
import * as THREE from 'three';
import { createStage } from '../_shared/three/stage.js';

const canvas = document.querySelector('[data-hero-canvas]');
const hero = document.querySelector('[data-hero]');
const pinsEl = document.querySelector('[data-pins]');
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

try {
  const stage = createStage(canvas, { fov: 26, parallaxDeg: 6, idleSpin: false });
  stage.envRoom();
  stage.contactShadow.visible = false;           // the helix lies on the board; CSS drop-shadow gives the soft ground shadow
  stage.camera.position.set(0, 0, 7.4);
  stage.key.position.set(-2.5, 4, 5); stage.key.intensity = 1.6;

  // ---- geometry: two strands of chunky blocks + thin rungs ----
  const helix = new THREE.Group();
  const TURNS = 1.5, STEPS = 34, R = 0.78, LEN = 5.6;
  // One backbone segment: a flat tile, long along the strand, wide across it, thin radially. Slightly pillowed.
  const block = new THREE.BoxGeometry(0.27, 0.15, 0.38, 3, 2, 3);
  { const p = block.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const e = Math.abs(v.x) / 0.135, f = Math.abs(v.z) / 0.18; v.y *= 1 - 0.35 * Math.max(e, f) ** 3; v.x *= 1 - 0.06 * f * f; p.setXYZ(i, v.x, v.y, v.z); }
    block.computeVertexNormals(); }
  const strandMat = new THREE.MeshStandardMaterial({ color: css('--helix') || '#77787d', roughness: 0.5, metalness: 0.45 });
  const rungMat = new THREE.MeshStandardMaterial({ color: css('--helix-2') || '#c9cacd', roughness: 0.55, metalness: 0.25 });
  const rung = new THREE.CylinderGeometry(0.03, 0.03, 1, 10);
  const strands = [new THREE.InstancedMesh(block, strandMat, STEPS), new THREE.InstancedMesh(block, strandMat, STEPS)];
  const rungs = new THREE.InstancedMesh(rung, rungMat, STEPS);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
  const pts = [[], []];
  for (let i = 0; i < STEPS; i++) {
    const t = i / (STEPS - 1), a = t * TURNS * Math.PI * 2, y = (t - 0.5) * LEN;
    for (let s = 0; s < 2; s++) {
      const ang = a + s * Math.PI, pos = new THREE.Vector3(Math.cos(ang) * R, y, Math.sin(ang) * R);
      const tan = new THREE.Vector3(-Math.sin(ang) * R * TURNS * Math.PI * 2, LEN, Math.cos(ang) * R * TURNS * Math.PI * 2).normalize();
      const out = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)), side = new THREE.Vector3().crossVectors(tan, out).normalize();
      out.crossVectors(side, tan).normalize();                    // exact orthonormal frame: x = along strand, y = outward, z = across
      m.makeBasis(tan, out, side).setPosition(pos); strands[s].setMatrixAt(i, m); pts[s].push(pos);
    }
    const a0 = pts[0][i], a1 = pts[1][i], mid = a0.clone().add(a1).multiplyScalar(0.5), dir = a1.clone().sub(a0);
    q.setFromUnitVectors(up, dir.clone().normalize()); m.compose(mid, q, new THREE.Vector3(1, dir.length() * 0.9, 1)); rungs.setMatrixAt(i, m);
  }
  helix.add(...strands, rungs);
  helix.rotation.z = -0.44;                       // lean like the reference: top right, bottom left
  helix.rotation.x = 0.3;
  helix.scale.setScalar(0.52);
  stage.root.add(helix);

  // ---- hotspots: HTML buttons pinned to 3D points (so they are real, focusable controls) ----
  const SPOTS = { dna: [[0, 7], [1, 15], [0, 23], [1, 30]], heart: [[1, 5], [0, 17], [1, 26]], scan: [[0, 11], [1, 21]] };
  let mode = 'dna', spin = 0, drag = null, vel = 0.0025;
  const v3 = new THREE.Vector3();
  function placePins() {
    const r = canvas.getBoundingClientRect(); const list = SPOTS[mode];
    [...pinsEl.children].forEach((el, i) => {
      const s = list[i]; if (!s) { el.hidden = true; return; }
      v3.copy(pts[s[0]][s[1]]); helix.localToWorld(v3); const z = v3.clone().project(stage.camera);
      el.hidden = false; el.style.transform = `translate(${((z.x + 1) / 2) * r.width}px, ${((1 - z.y) / 2) * r.height}px)`;
      el.style.opacity = v3.z > -0.2 ? 1 : 0.35; el.style.zIndex = v3.z > -0.2 ? 2 : 0;
    });
  }
  stage.onFrame(() => { if (!drag) spin += vel; helix.rotation.y = spin; placePins(); });

  // ---- drag to turn (pointer + keyboard) ----
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, s: spin }; canvas.setPointerCapture(e.pointerId); hero.dataset.drag = '1'; });
  canvas.addEventListener('pointermove', (e) => { if (drag) spin = drag.s + (e.clientX - drag.x) * 0.012; });
  const end = () => { drag = null; delete hero.dataset.drag; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') spin -= 0.3; if (e.key === 'ArrowRight') spin += 0.3; });

  // ---- API for app.js ----
  window.DBHero = {
    setMode(next) { mode = next; vel = next === 'scan' ? 0 : next === 'heart' ? 0.006 : 0.0025;
      strandMat.color.set(next === 'heart' ? css('--helix-warm') : next === 'scan' ? css('--helix-cool') : css('--helix')); placePins(); },
    recolor() { this.setMode(mode); rungMat.color.set(css('--helix-2')); },
    poster() { stage.renderer.render(stage.scene, stage.camera); return canvas.toDataURL('image/png'); },
  };
  hero.dataset.live = '1';                        // hides the poster image
  document.dispatchEvent(new CustomEvent('db-hero-ready'));
} catch (err) {
  hero.dataset.live = '0';                        // no WebGL: the poster stays
}
