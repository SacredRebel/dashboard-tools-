/* Ember Rooms hero: brushed-aluminium pendant lamp (lathe shade + cord + emissive disc).
   Pattern mirrors meridian-labs/helix.js: separate module, window.DBHero API, poster fallback. */
import * as THREE from 'three';
import { createStage } from '../_shared/three/stage.js';

const canvas = document.querySelector('[data-hero-canvas]');
const hero = document.querySelector('[data-hero]');
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

try {
  const stage = createStage(canvas, { fov: 28, parallaxDeg: 6, idleSpin: false, toneMappingExposure: 1.08 });
  stage.envRoom();
  stage.contactShadow.visible = false;
  // Frame so cord meets the top edge with clear margin around the shade
  stage.camera.position.set(0, 0.55, 4.6);
  stage.key.position.set(-1.4, 3.8, 4.2); stage.key.intensity = 1.45;

  const lamp = new THREE.Group();

  // Long cord from above the frame (reads as hanging from the top edge)
  const cordMat = new THREE.MeshStandardMaterial({ color: '#2e3036', roughness: 0.65, metalness: 0.2 });
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 2.35, 12), cordMat);
  cord.position.y = 2.05;
  lamp.add(cord);

  // Small ceiling canopy (kept inside canvas)
  const canopyMat = new THREE.MeshStandardMaterial({
    color: css('--lamp') || '#b5b9c5', roughness: 0.32, metalness: 0.9, envMapIntensity: 1.15,
  });
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.06, 28), canopyMat);
  canopy.position.y = 3.2;
  lamp.add(canopy);

  // Classic pendant bell: narrow neck → flared rim (LatheGeometry)
  const profile = [
    new THREE.Vector2(0.015, 0.72),
    new THREE.Vector2(0.09, 0.7),
    new THREE.Vector2(0.14, 0.62),
    new THREE.Vector2(0.22, 0.48),
    new THREE.Vector2(0.38, 0.28),
    new THREE.Vector2(0.55, 0.06),
    new THREE.Vector2(0.64, -0.12),
    new THREE.Vector2(0.66, -0.22),
    new THREE.Vector2(0.58, -0.34),
    new THREE.Vector2(0.4, -0.4),
    new THREE.Vector2(0.22, -0.38),
    new THREE.Vector2(0.12, -0.28),
  ];
  const shadeMat = new THREE.MeshStandardMaterial({
    color: css('--lamp') || '#b5b9c5',
    roughness: 0.22,
    metalness: 0.95,
    envMapIntensity: 1.35,
  });
  const shade = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), shadeMat);
  shade.position.y = 0.35;
  shade.castShadow = false;
  lamp.add(shade);

  // Dark inner liner
  const liner = new THREE.Mesh(
    new THREE.LatheGeometry([
      new THREE.Vector2(0.1, -0.26),
      new THREE.Vector2(0.36, -0.34),
      new THREE.Vector2(0.52, -0.2),
      new THREE.Vector2(0.4, 0.08),
      new THREE.Vector2(0.16, 0.2),
    ], 40),
    new THREE.MeshStandardMaterial({ color: '#1c1e24', roughness: 0.9, metalness: 0.15, side: THREE.DoubleSide })
  );
  liner.position.y = 0.35;
  lamp.add(liner);

  // Emissive disc — glow follows intensity slider
  const glowMat = new THREE.MeshStandardMaterial({
    color: '#ffc090',
    emissive: new THREE.Color('#ff8a3d'),
    emissiveIntensity: 1.6,
    roughness: 0.55,
    metalness: 0,
    toneMapped: false,
  });
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.32, 40), glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -0.02;
  lamp.add(glow);

  const bulb = new THREE.PointLight('#ffb070', 1.4, 7, 1.5);
  bulb.position.set(0, -0.05, 0);
  lamp.add(bulb);

  lamp.position.y = -0.85;
  lamp.scale.setScalar(0.78); // clear space from canvas edges (F8 rule 4)
  stage.root.add(lamp);

  let spin = 0.12, drag = null, intensity = 0.68, power = true;

  function applyGlow() {
    const on = power && intensity > 0.02;
    const e = on ? 0.25 + intensity * 2.8 : 0;
    glowMat.emissiveIntensity = e;
    glow.visible = on;
    bulb.intensity = on ? intensity * 2.6 : 0;
    const warm = new THREE.Color().setHSL(0.075, 0.9, 0.52 + intensity * 0.18);
    glowMat.emissive.copy(warm);
    bulb.color.copy(warm);
  }
  applyGlow();

  stage.onFrame(() => {
    if (!drag) spin += 0.001;
    lamp.rotation.y = spin;
  });

  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, s: spin };
    canvas.setPointerCapture(e.pointerId);
    hero.dataset.drag = '1';
  });
  canvas.addEventListener('pointermove', (e) => {
    if (drag) spin = drag.s + (e.clientX - drag.x) * 0.01;
  });
  const end = () => { drag = null; delete hero.dataset.drag; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') spin -= 0.28;
    if (e.key === 'ArrowRight') spin += 0.28;
  });

  window.DBHero = {
    setMode() {},
    setIntensity(v) { intensity = Math.max(0, Math.min(1, Number(v) || 0)); applyGlow(); },
    setPower(on) { power = !!on; applyGlow(); },
    recolor() {
      const c = css('--lamp') || '#b5b9c5';
      shadeMat.color.set(c); canopyMat.color.set(c); applyGlow();
    },
    poster() {
      stage.renderer.render(stage.scene, stage.camera);
      return canvas.toDataURL('image/png');
    },
  };
  hero.dataset.live = '1';
  document.dispatchEvent(new CustomEvent('db-hero-ready'));
} catch (err) {
  hero.dataset.live = '0';
  console.warn('Ember Rooms lamp WebGL failed', err);
}
