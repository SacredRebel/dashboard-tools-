/** Glacier Ops — procedural mountain terrain inside a glass hemisphere lens. */
import { createStage } from '../_shared/three/stage.js';
import * as THREE from 'three';

function noise2(x, y) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}
function fbm(x, y) {
  let v = 0, a = 0.5;
  for (let i = 0; i < 5; i++) {
    v += a * noise2(x, y);
    x *= 2.05; y *= 2.05; a *= 0.5;
  }
  return v;
}

export function mountGlacierLens(canvas) {
  const stage = createStage(canvas, {
    fov: 32,
    parallaxDeg: 6,
    idlePeriod: 16,
    poster: 'media/dial@2x.webp',
  });
  stage.envRoom();
  stage.camera.position.set(0, 0.35, 2.6);
  stage.key.position.set(1.5, 2.8, 2.2);
  stage.key.intensity = 1.1;

  // Terrain plane displaced
  const seg = 96;
  const geo = new THREE.PlaneGeometry(2.2, 2.2, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = [];
  const cDeep = new THREE.Color('#041428');
  const cMid = new THREE.Color('#1a4a6e');
  const cSnow = new THREE.Color('#e8f4ff');
  const cRock = new THREE.Color('#6a8498');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const d = Math.hypot(x, z);
    let h = fbm(x * 1.4 + 2.1, z * 1.4 + 0.7);
    h = Math.pow(h, 1.35) * 0.85;
    h *= Math.max(0, 1 - d * 0.72);
    // water bowl
    if (d > 0.85) h = Math.min(h, -0.02);
    else h = h * 0.9 - 0.05;
    pos.setY(i, h);
    const t = Math.max(0, Math.min(1, (h + 0.05) / 0.7));
    const col = t < 0.15 ? cDeep.clone().lerp(cMid, t / 0.15)
      : t < 0.55 ? cMid.clone().lerp(cRock, (t - 0.15) / 0.4)
      : cRock.clone().lerp(cSnow, (t - 0.55) / 0.45);
    colors.push(col.r, col.g, col.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const terrain = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.82,
      metalness: 0.08,
      flatShading: false,
    }),
  );
  terrain.position.y = -0.55;
  terrain.castShadow = true;
  stage.root.add(terrain);

  // Glass hemisphere lens
  const lens = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshPhysicalMaterial({
      color: '#a8d8f0',
      metalness: 0,
      roughness: 0.08,
      transmission: 0.92,
      thickness: 0.45,
      ior: 1.42,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    }),
  );
  lens.position.y = -0.15;
  stage.root.add(lens);

  // Dark rim ring
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.06, 0.035, 12, 64),
    new THREE.MeshStandardMaterial({ color: '#0a1524', metalness: 0.7, roughness: 0.35 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.12;
  stage.root.add(rim);

  // Tick marks (red/white)
  const ticks = new THREE.Group();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const mat = new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? '#ff4d6a' : '#e8f4ff' });
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.06), mat);
    tick.position.set(Math.cos(a) * 0.92, -0.08, Math.sin(a) * 0.92);
    tick.lookAt(0, -0.08, 0);
    ticks.add(tick);
  }
  stage.root.add(ticks);

  stage.contactShadow.position.y = -0.7;
  stage.contactShadow.scale.set(1.2, 1.2, 1.2);

  return stage;
}
