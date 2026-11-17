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
/* gold mesh texture for the visor — diagonal crosshatch over a gold gradient */
function meshTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#f6dc96'); grad.addColorStop(0.5, '#e2b95e'); grad.addColorStop(1, '#b98c3e');
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(96,64,20,0.5)'; g.lineWidth = 2.4;
  const s = 30;
  for (let i = -256; i < 512; i += s) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 256, 256); g.stroke();
    g.beginPath(); g.moveTo(i + 256, 0); g.lineTo(i, 256); g.stroke();
  }
  g.fillStyle = 'rgba(255,248,214,0.7)';
  for (let y = s / 2; y < 256; y += s) for (let x = s / 2; x < 256; x += s) {
    g.beginPath(); g.arc(x, y, 2.1, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const MAT = {};
let meshTex = null;
function buildMaterials() {
  for (const k of Object.keys(MAT)) MAT[k].dispose();
  if (meshTex) meshTex.dispose();
  meshTex = meshTexture();
  MAT.shell = new THREE.MeshPhysicalMaterial({ color: col(...TOKENS.shell), roughness: 0.74, metalness: 0.03, clearcoat: 0.28, clearcoatRoughness: 0.65, envMapIntensity: 0.75 });
  MAT.cup = new THREE.MeshPhysicalMaterial({ color: col(...TOKENS.cup), roughness: 0.78, metalness: 0.02, clearcoat: 0.14, clearcoatRoughness: 0.8, envMapIntensity: 0.6 });
  MAT.gold = new THREE.MeshPhysicalMaterial({ color: col(...TOKENS.gold), roughness: 0.36, metalness: 0.55, clearcoat: 0.5, clearcoatRoughness: 0.35, envMapIntensity: 1.15 });
  MAT.goldHi = new THREE.MeshPhysicalMaterial({ color: col(...TOKENS.goldHi), roughness: 0.3, metalness: 0.6, clearcoat: 0.55, clearcoatRoughness: 0.3, envMapIntensity: 1.25 });
  MAT.visor = new THREE.MeshPhysicalMaterial({ color: col(...TOKENS.visor), roughness: 0.16, metalness: 0.1, clearcoat: 0.9, clearcoatRoughness: 0.12, envMapIntensity: 1.1 });
  MAT.mesh = new THREE.MeshPhysicalMaterial({ map: meshTex, color: col(...TOKENS.goldHi), roughness: 0.38, metalness: 0.5, clearcoat: 0.5, clearcoatRoughness: 0.28, envMapIntensity: 1.2 });
  MAT.ink = new THREE.MeshPhysicalMaterial({ color: col(...TOKENS.ink), roughness: 0.85, metalness: 0.02, clearcoat: 0.1, clearcoatRoughness: 0.8, envMapIntensity: 0.5 });
}
buildMaterials();
envRoom();
/* warm frontal fill so the face port, ear discs and collar read as clay, not silhouette */
{
  const fill = new THREE.DirectionalLight('#ffe8c0', 0.55);
  fill.position.set(0.6, 0.4, 3.2);
  scene.add(fill);
  const under = new THREE.DirectionalLight('#d8e4c8', 0.3);
  under.position.set(-0.5, -2.2, 1.4);
  scene.add(under);
}

/* ---- compound helmet: rounded shell, face port (cream rim + gold mesh), ear discs, gold collar ---- */
const model = new THREE.Group();
root.add(model);
const parts = []; // {mesh, key}
const add = (mesh, key) => { model.add(mesh); parts.push({ mesh, key }); return mesh; };

/* shell — squashed sphere, deep green clay */
const shell = new THREE.Mesh(new THREE.SphereGeometry(0.6, 48, 36), MAT.shell);
shell.scale.set(1.1, 0.97, 0.9);
shell.position.y = 0.15;
add(shell, 'shell');

/* neck + gold collar ring at the base */
const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.36, 0.26, 36), MAT.ink);
neck.position.y = -0.6;
add(neck, 'ink');
const collar = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.055, 18, 56), MAT.gold);
collar.rotation.x = Math.PI / 2;
collar.position.y = -0.46;
add(collar, 'gold');
const collarLip = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.03, 14, 48), MAT.goldHi);
collarLip.rotation.x = Math.PI / 2;
collarLip.position.y = -0.73;
add(collarLip, 'goldHi');

/* face opening — three-quarter view: port sits front-right of the shell */
const FACE = new THREE.Vector3(0.13, 0.14, 0.52);
const cavity = new THREE.Mesh(new THREE.CircleGeometry(0.3, 44), MAT.visor);
cavity.position.set(FACE.x, FACE.y, FACE.z - 0.015);
add(cavity, 'visor');
const visorMesh = new THREE.Mesh(new THREE.CircleGeometry(0.302, 44), MAT.mesh);
visorMesh.position.set(FACE.x, FACE.y, FACE.z + 0.012);
add(visorMesh, 'mesh');
/* thick cream rim around the opening — the helmet's signature frame */
const rim = new THREE.Mesh(new THREE.TorusGeometry(0.318, 0.082, 20, 56), MAT.cup);
rim.scale.set(1.12, 0.88, 1);
rim.position.set(FACE.x, FACE.y, FACE.z + 0.03);
add(rim, 'cup');

/* round cream ear discs on both sides, gold hubs */
for (const side of [-1, 1]) {
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.07, 32), MAT.cup);
  disc.rotation.z = Math.PI / 2;
  disc.position.set(side * 0.7, 0.0, 0.08);
  add(disc, 'cup');
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.095, 24), MAT.gold);
  hub.rotation.z = Math.PI / 2;
  hub.position.set(side * 0.735, 0.0, 0.08);
  add(hub, 'gold');
  const hubCap = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), MAT.goldHi);
  hubCap.scale.set(0.45, 1, 1);
  hubCap.position.set(side * 0.78, 0.0, 0.08);
  add(hubCap, 'goldHi');
}

/* small gold crown stud */
const stud = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), MAT.goldHi);
stud.position.set(0.1, 0.74, 0.04);
add(stud, 'goldHi');

/* three-quarter side view, sitting low in frame */
model.rotation.y = 0.5;
model.rotation.x = 0.05;

/* camera framing — helmet sits low, fills the box */
camera.position.set(0, 0.32, 3.35);
camera.lookAt(0, -0.16, 0);
if (stage.contactShadow) {
  stage.contactShadow.position.y = -0.98;
  stage.contactShadow.scale.setScalar(0.8);
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
    model.rotation.y = 0.5; model.rotation.x = 0.05;
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
