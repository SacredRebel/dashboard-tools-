/* Ember Rooms hero: pale dome pendant lamp (real three.js mesh — F8).
   data-ref="lamp" is on the shade-sized canvas; cord is a separate CSS line. */
import * as THREE from 'three';
import { createStage } from '../_shared/three/stage.js';

const canvas = document.querySelector('[data-hero-canvas]');
const hero = document.querySelector('[data-hero]');
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

try {
  const stage = createStage(canvas, { fov: 32, parallaxDeg: 5, idleSpin: false, toneMappingExposure: 1.12 });
  stage.envRoom();
  stage.contactShadow.visible = false;
  // Frame the dome shade to fill the lamp box (cord lives in CSS above)
  stage.camera.position.set(0, 0.05, 3.15);
  stage.key.position.set(-1.2, 2.4, 3.6); stage.key.intensity = 1.55;

  const lamp = new THREE.Group();

  // Short stub of cord at the top of the shade canvas
  const cordMat = new THREE.MeshStandardMaterial({ color: '#2e2c2a', roughness: 0.7, metalness: 0.15 });
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.55, 12), cordMat);
  cord.position.y = 0.95;
  lamp.add(cord);

  const canopyMat = new THREE.MeshStandardMaterial({
    color: css('--lamp') || '#c4c6cc', roughness: 0.38, metalness: 0.55, envMapIntensity: 0.9,
  });
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.05, 24), canopyMat);
  canopy.position.y = 1.2;
  lamp.add(canopy);

  // Large pale dome shade (hemisphere) — centre of the screen
  // Large pale matte dome (not a dark metal cone)
  const shadeMat = new THREE.MeshStandardMaterial({
    color: css('--lamp') || '#d2d4da',
    roughness: 0.62,
    metalness: 0.12,
    envMapIntensity: 0.45,
    side: THREE.DoubleSide,
  });
  const shade = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 64, 48, 0, Math.PI * 2, 0, Math.PI * 0.62),
    shadeMat
  );
  shade.position.y = 0.18;
  lamp.add(shade);

  // Soft inner bowl
  const liner = new THREE.Mesh(
    new THREE.SphereGeometry(0.98, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.58),
    new THREE.MeshStandardMaterial({
      color: '#f6f4ef', roughness: 0.92, metalness: 0.02, side: THREE.BackSide,
    })
  );
  liner.position.y = 0.18;
  lamp.add(liner);

  const glowMat = new THREE.MeshStandardMaterial({
    color: '#ffd4a8',
    emissive: new THREE.Color('#ff8a3d'),
    emissiveIntensity: 1.4,
    roughness: 0.55,
    metalness: 0,
    toneMapped: false,
  });
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.42, 40), glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -0.28;
  lamp.add(glow);

  const bulb = new THREE.PointLight('#ffb070', 1.5, 6, 1.4);
  bulb.position.set(0, -0.15, 0);
  lamp.add(bulb);

  lamp.position.y = -0.05;
  lamp.scale.setScalar(1.05);
  stage.root.add(lamp);

  let spin = 0.08, drag = null, intensity = 0.68, power = true;

  function applyGlow() {
    const on = power && intensity > 0.02;
    const e = on ? 0.3 + intensity * 2.4 : 0;
    glowMat.emissiveIntensity = e;
    glow.visible = on;
    bulb.intensity = on ? intensity * 2.4 : 0;
    const warm = new THREE.Color().setHSL(0.075, 0.85, 0.55 + intensity * 0.16);
    glowMat.emissive.copy(warm);
    bulb.color.copy(warm);
  }
  applyGlow();

  stage.onFrame(() => {
    if (!drag) spin += 0.0008;
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
      const c = css('--lamp') || '#c4c6cc';
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
