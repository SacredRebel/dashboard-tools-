/* Orbit Clay — WebGL astronaut helmet (compound clay object).
   Exposes window.DBHero { poster, recolor, setSpin } and dispatches db-hero-ready. */
import { createStage } from '../_shared/three/stage.js';

const canvas = document.querySelector('[data-hero-canvas]');
const hero = document.querySelector('[data-hero]');
if (!canvas || !hero) throw new Error('orbit-clay: hero canvas missing');

const css = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};
const col = (name, fallback) => {
  const v = css(name, fallback);
  try { return new THREE.Color(v); } catch { return new THREE.Color(fallback); }
};

const stage = createStage(canvas, {
  fov: 35,
  idleSpin: false,
  parallaxDeg: 7,
});
const { scene, camera, renderer, root, onFrame, envRoom, THREE } = stage;

/* ---- materials: one per role, recolored from CSS tokens ---- */
const TOKENS = {
  shell: ['--oc-shell', '#33503f'],
  cup: ['--oc-cup', '#eef3da'],
  gold: ['--oc-gold', '#c9a24a'],
  goldHi: ['--oc-gold-hi', '#e0c078'],
  visor: ['--oc-visor', '#0c100d'],
  mesh: ['--oc-mesh', '#d8b878'],
  ink: ['--oc-green-deep', '#1d2f26'],
};
const MAT = {};
function buildMaterials() {
  for (const k of Object.keys(MAT)) MAT[k].dispose();
  MAT.shell = new THREE.MeshPhysicalMaterial({ color: col(...TOKENS.shell), roughness: 0.78, metalness: 0.02, clearcoat: 0.22, clearcoatRoughness: 0.7, envMapIntensity: 0.7 });
  MAT.cup = new THREE.MeshPhysicalMaterial({ color: col(...TOKENS.cup), roughness: 0.8, metalness: 0.02, clearcoat: 0.12, clearcoatRoughness: 0.8, envMapIntensity: 0.55 });
  MAT.gold = new THREE.MeshPhysicalMaterial({ color: col(...TOKENS.gold), roughness: 0.38, metalness: 0.85, clearcoat: 0.5, clearcoatRoughness: 0.35, envMapIntensity: 1.15 });
  MAT.goldHi = new THREE.MeshPhysicalMaterial({ color: col(...TOKENS.goldHi), roughness: 0.3, metalness: 0.9, clearcoat: 0.55, clearcoatRoughness: 0.3, envMapIntensity: 1.25 });
  MAT.visor = new THREE.MeshPhysicalMaterial({ color: col(...TOKENS.visor), roughness: 0.12, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.3 });
  MAT.mesh = new THREE.MeshPhysicalMaterial({ color: col(...TOKENS.mesh), roughness: 0.5, metalness: 0.7, wireframe: true, envMapIntensity: 0.8 });
  MAT.ink = new THREE.MeshPhysicalMaterial({ color: col(...TOKENS.ink), roughness: 0.85, metalness: 0.02, clearcoat: 0.1, clearcoatRoughness: 0.8, envMapIntensity: 0.5 });
}
buildMaterials();
envRoom();

/* ---- compound helmet ---- */
const model = new THREE.Group();
root.add(model);
const parts = []; // {mesh, key}
const add = (mesh, key) => { model.add(mesh); parts.push({ mesh, key }); return mesh; };

const shell = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 36), MAT.shell);
shell.scale.set(1.1, 1.0, 0.95);
shell.position.y = 0.16;
add(shell, 'shell');

const band = new THREE.Mesh(new THREE.TorusGeometry(0.615, 0.055, 20, 56), MAT.cup);
band.rotation.x = Math.PI / 2;
band.position.y = -0.5;
band.scale.set(1.02, 0.94, 1);
add(band, 'cup');

const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.26, 40), MAT.ink);
collar.position.y = -0.78;
add(collar, 'ink');
const collarRim = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.045, 16, 48), MAT.goldHi);
collarRim.rotation.x = Math.PI / 2;
collarRim.position.y = -0.66;
add(collarRim, 'goldHi');

const visorGeo = new THREE.SphereGeometry(0.655, 40, 24, Math.PI / 2 - 0.82, 1.64, 0.62, 1.15);
const visor = new THREE.Mesh(visorGeo, MAT.visor);
visor.scale.set(1.0, 1.1, 0.92);
visor.position.set(0, 0.16, 0.02);
add(visor, 'visor');
const meshV = new THREE.Mesh(visorGeo, MAT.mesh);
meshV.scale.set(1.005, 1.105, 0.925);
meshV.position.copy(visor.position);
add(meshV, 'mesh');
const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 14, 48, Math.PI * 1.15), MAT.goldHi);
rim.position.set(0, 0.3, 0.56);
rim.rotation.set(0.35, 0, Math.PI * 0.92);
rim.scale.set(1.15, 0.85, 1);
add(rim, 'goldHi');

for (const side of [-1, 1]) {
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.34, 28), MAT.cup);
  cup.rotation.z = Math.PI / 2;
  cup.position.set(side * 0.72, -0.02, 0.06);
  add(cup, 'cup');
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.36, 24), MAT.gold);
  hub.rotation.z = Math.PI / 2;
  hub.position.set(side * 0.72, -0.02, 0.06);
  add(hub, 'gold');
  const hubCap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), MAT.goldHi);
  hubCap.scale.set(0.5, 1, 1);
  hubCap.position.set(side * 0.9, -0.02, 0.06);
  add(hubCap, 'goldHi');
}

// crown ridge — wide blunt band around the dome's upper third (helmet seal ring)
const crown = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.07, 18, 56), MAT.cup);
crown.rotation.x = Math.PI / 2;
crown.position.y = 0.42;
crown.scale.set(1.08, 0.95, 1);
add(crown, 'cup');

const stud = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), MAT.goldHi);
stud.position.set(0.14, 0.8, 0.1);
add(stud, 'goldHi');

model.rotation.y = -0.42;
model.rotation.x = 0.06;
model.scale.setScalar(0.8);

/* camera framing */
camera.position.set(0, 0.24, 3.15);
camera.lookAt(0, 0.02, 0);
if (stage.contactShadow) {
  stage.contactShadow.position.y = -1.05;
  stage.contactShadow.scale.setScalar(0.72);
}

/* ---- interaction ---- */
let dragging = false, lastX = 0, lastY = 0, velY = 0, velX = 0;
let spinOn = true, idleT = 0;

canvas.addEventListener('pointerdown', (e) => {
  dragging = true; lastX = e.clientX; lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  lastX = e.clientX; lastY = e.clientY;
  model.rotation.y += dx * 0.011;
  model.rotation.x = THREE.MathUtils.clamp(model.rotation.x + dy * 0.007, -0.5, 0.5);
  velY = dx * 0.011; velX = dy * 0.007;
});
const endDrag = () => { dragging = false; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('keydown', (e) => {
  const step = 0.14;
  if (e.key === 'ArrowLeft') { model.rotation.y -= step; e.preventDefault(); }
  if (e.key === 'ArrowRight') { model.rotation.y += step; e.preventDefault(); }
  if (e.key === 'ArrowUp') { model.rotation.x = Math.min(0.5, model.rotation.x + step * 0.6); e.preventDefault(); }
  if (e.key === 'ArrowDown') { model.rotation.x = Math.max(-0.5, model.rotation.x - step * 0.6); e.preventDefault(); }
});

onFrame((t, { visible }) => {
  if (!visible) return;
  idleT += 1 / 60;
  if (!dragging) {
    model.rotation.y += velY;
    model.rotation.x = THREE.MathUtils.clamp(model.rotation.x + velX, -0.5, 0.5);
    velY *= 0.94; velX *= 0.94;
    if (spinOn && Math.abs(velY) < 0.001) model.rotation.y += Math.sin(idleT * 0.45) * 0.0016;
  }
});

/* ---- DBHero API ---- */
window.DBHero = {
  poster() {
    const ry = model.rotation.y, rx = model.rotation.x;
    model.rotation.y = -0.42; model.rotation.x = 0.06;
    const sh = stage.contactShadow;
    if (sh) sh.visible = false;
    renderer.render(scene, camera);
    const url = canvas.toDataURL('image/png');
    if (sh) sh.visible = true;
    model.rotation.y = ry; model.rotation.x = rx;
    return url;
  },
  recolor() {
    buildMaterials();
    for (const { mesh, key } of parts) mesh.material = MAT[key];
  },
  setSpin(on) { spinOn = !!on; },
};

hero.dataset.live = '1';
window.dispatchEvent(new CustomEvent('db-hero-ready', { detail: { id: 'orbit-clay' } }));
