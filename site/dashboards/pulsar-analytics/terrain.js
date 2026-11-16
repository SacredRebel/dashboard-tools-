/* Pulsar Analytics hero: layered ridge terrain (procedural three.js).
   Same pattern as meridian-labs/helix.js: createStage → root mesh → window.DBHero API. */
import * as THREE from 'three';
import { createStage } from '../_shared/three/stage.js';

const canvas = document.querySelector('[data-hero-canvas]');
const hero = document.querySelector('[data-hero]');
if (!canvas || !hero) throw new Error('pulsar terrain: missing [data-hero-canvas] / [data-hero]');

try {
  const stage = createStage(canvas, { fov: 38, parallaxDeg: 6, idlePeriod: 16, toneMappingExposure: 1.05 });
  stage.envRoom();
  stage.camera.position.set(0, 1.55, 3.85);
  stage.camera.lookAt(0, 0.05, 0);
  stage.contactShadow.position.y = -0.62;
  stage.contactShadow.scale.set(1.8, 1.8, 1);
  stage.key.intensity = 1.15;
  stage.key.position.set(1.6, 3.4, 2.4);
  const violet = new THREE.PointLight(0xbf00ff, 2.4, 9); violet.position.set(0, -0.15, 0.5); stage.scene.add(violet);
  const mint = new THREE.PointLight(0x00ffcc, 1.2, 7); mint.position.set(-1.5, 0.9, 0.7); stage.scene.add(mint);

  const geo = new THREE.PlaneGeometry(4.4, 3.2, 120, 90);
  const pos = geo.attributes.position; const colors = [];
  const cMint = new THREE.Color('#00ffcc'), cViolet = new THREE.Color('#bf00ff'), cPeach = new THREE.Color('#ffcc99');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const n1 = Math.sin(x * 1.85) * Math.cos(y * 1.45);
    const n2 = Math.sin(x * 3.4 + y * 1.9) * 0.42;
    const n3 = Math.cos(x * 0.85 - y * 2.4) * 0.28;
    const ridge = Math.pow(Math.max(0, n1), 1.4) * 0.9;
    const h = (ridge + n2 + n3) * 0.62 + 0.06;
    pos.setZ(i, h);
    const tt = (h + 0.35) / 1.25;
    const col = cMint.clone().lerp(cViolet, Math.min(1, Math.max(0, tt)));
    if (x > 0.4) col.lerp(cPeach, Math.min(1, (x - 0.4) / 1.6) * 0.85);
    colors.push(col.r, col.g, col.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  // Finishing pass: the reference is glowing ridge lines over dark glass, not a pale translucent sheet.
  // Faces are near-black versions of the ridge colors, so a ridge in front hides the ones behind it;
  // one additive polyline per row draws the neon ridges on top.
  const dark = new Float32Array(colors.length); for (let i = 0; i < colors.length; i++) dark[i] = colors[i] * 0.16;
  geo.setAttribute('color', new THREE.BufferAttribute(dark, 3));
  const terrainMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.96, side: THREE.DoubleSide, toneMapped: false });
  const mesh = new THREE.Mesh(geo, terrainMat);
  mesh.rotation.x = -Math.PI / 2.35; mesh.position.y = -0.1; mesh.scale.setScalar(0.92);
  stage.root.add(mesh);

  const COLS = 121, ROWS = 91;
  const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const line = new THREE.Group();
  for (let r = 0; r < ROWS; r += 3) {
    const p = new Float32Array(COLS * 3), c = new Float32Array(COLS * 3);
    for (let k = 0; k < COLS; k++) { const i = r * COLS + k; p[k * 3] = pos.getX(i); p[k * 3 + 1] = pos.getY(i); p[k * 3 + 2] = pos.getZ(i) + 0.006; c[k * 3] = colors[i * 3]; c[k * 3 + 1] = colors[i * 3 + 1]; c[k * 3 + 2] = colors[i * 3 + 2]; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    line.add(new THREE.Line(g, lineMat));
  }
  mesh.add(line);

  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.35, 48), new THREE.MeshBasicMaterial({ color: 0xbf00ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  pool.rotation.x = -Math.PI / 2; pool.position.y = -0.55; stage.root.add(pool);

  let metric = 'users';
  const tintFor = { users: '#ffffff', sessions: '#9fe8ff', errors: '#ff9db0', latency: '#ffd9a0' };
  stage.onFrame((t) => {
    mesh.position.y = -0.1 + Math.sin(t * 0.6) * 0.02;
    pool.material.opacity = 0.28 + Math.sin(t * 0.9) * 0.08;
    lineMat.opacity = 0.85 + Math.sin(t * 1.3) * 0.1;
  });

  window.DBHero = {
    setMode(next) { metric = next || 'users'; lineMat.color.set(tintFor[metric] || tintFor.users); },
    poster() { stage.renderer.render(stage.scene, stage.camera); return canvas.toDataURL('image/png'); },
  };
  window.DBHero.setMode('users');
  hero.dataset.live = '1';
  document.dispatchEvent(new CustomEvent('db-hero-ready'));
} catch (err) {
  console.warn('pulsar terrain failed', err);
  hero.dataset.live = '0';
}
