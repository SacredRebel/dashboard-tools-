/* Ember Rooms hero: brushed-aluminium pendant lamp (lathe shade + cord + emissive disc).
   Pattern mirrors meridian-labs/helix.js: separate module, window.DBHero API, poster fallback. */
import * as THREE from 'three';
import { createStage } from '../_shared/three/stage.js';

const canvas = document.querySelector('[data-hero-canvas]');
const hero = document.querySelector('[data-hero]');
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

try {
  const stage = createStage(canvas, { fov: 32, parallaxDeg: 5, idleSpin: false, toneMappingExposure: 1.05 });
  stage.envRoom();
  stage.contactShadow.visible = false;
  stage.camera.position.set(0, 0.15, 4.2);
  stage.key.position.set(-1.2, 3.5, 4); stage.key.intensity = 1.35;

  const lamp = new THREE.Group();
  const cordMat = new THREE.MeshStandardMaterial({ color: '#3a3c42', roughness: 0.7, metalness: 0.15 });
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.55, 10), cordMat);
  cord.position.y = 1.55; lamp.add(cord);

  const canopyMat = new THREE.MeshStandardMaterial({ color: css('--lamp') || '#b5b9c5', roughness: 0.35, metalness: 0.85 });
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.08, 24), canopyMat);
  canopy.position.y = 2.28; lamp.add(canopy);

  const profile = [
    new THREE.Vector2(0.02, 0.55), new THREE.Vector2(0.18, 0.52), new THREE.Vector2(0.42, 0.38),
    new THREE.Vector2(0.58, 0.12), new THREE.Vector2(0.62, -0.05), new THREE.Vector2(0.55, -0.22),
    new THREE.Vector2(0.38, -0.32), new THREE.Vector2(0.22, -0.36), new THREE.Vector2(0.12, -0.28),
  ];
  const shadeMat = new THREE.MeshStandardMaterial({ color: css('--lamp') || '#b5b9c5', roughness: 0.28, metalness: 0.92, envMapIntensity: 1.2 });
  const shade = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), shadeMat);
  shade.position.y = 0.55; lamp.add(shade);

  const liner = new THREE.Mesh(
    new THREE.LatheGeometry([
      new THREE.Vector2(0.1, -0.26), new THREE.Vector2(0.34, -0.3),
      new THREE.Vector2(0.48, -0.18), new THREE.Vector2(0.42, 0.05),
    ], 32),
    new THREE.MeshStandardMaterial({ color: '#2a2c32', roughness: 0.85, metalness: 0.2, side: THREE.DoubleSide })
  );
  liner.position.y = 0.55; lamp.add(liner);

  const glowMat = new THREE.MeshStandardMaterial({ color: '#ffb070', emissive: new THREE.Color('#ff8a3d'), emissiveIntensity: 1.4, roughness: 0.6, metalness: 0 });
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.28, 32), glowMat);
  glow.rotation.x = -Math.PI / 2; glow.position.y = 0.22; lamp.add(glow);

  const bulb = new THREE.PointLight('#ffb070', 1.2, 6, 1.6);
  bulb.position.set(0, 0.15, 0); lamp.add(bulb);

  lamp.position.y = -0.55; lamp.scale.setScalar(0.92); stage.root.add(lamp);

  let spin = 0.15, drag = null, intensity = 0.68, power = true;
  function applyGlow() {
    const on = power && intensity > 0.02;
    glowMat.emissiveIntensity = on ? 0.35 + intensity * 2.4 : 0;
    glow.visible = on; bulb.intensity = on ? intensity * 2.2 : 0;
    const warm = new THREE.Color().setHSL(0.08, 0.85, 0.55 + intensity * 0.15);
    glowMat.emissive.copy(warm); bulb.color.copy(warm);
  }
  applyGlow();
  stage.onFrame(() => { if (!drag) spin += 0.0012; lamp.rotation.y = spin; });

  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, s: spin }; canvas.setPointerCapture(e.pointerId); hero.dataset.drag = '1'; });
  canvas.addEventListener('pointermove', (e) => { if (drag) spin = drag.s + (e.clientX - drag.x) * 0.01; });
  const end = () => { drag = null; delete hero.dataset.drag; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') spin -= 0.25; if (e.key === 'ArrowRight') spin += 0.25; });

  window.DBHero = {
    setMode() {},
    setIntensity(v) { intensity = Math.max(0, Math.min(1, Number(v) || 0)); applyGlow(); },
    setPower(on) { power = !!on; applyGlow(); },
    recolor() { shadeMat.color.set(css('--lamp') || '#b5b9c5'); canopyMat.color.set(css('--lamp') || '#b5b9c5'); applyGlow(); },
    poster() { stage.renderer.render(stage.scene, stage.camera); return canvas.toDataURL('image/png'); },
  };
  hero.dataset.live = '1';
  document.dispatchEvent(new CustomEvent('db-hero-ready'));
} catch (err) {
  hero.dataset.live = '0';
  console.warn('Ember Rooms lamp WebGL failed', err);
}
