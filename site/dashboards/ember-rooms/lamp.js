/* Ember Rooms hero: bell-shaped pendant shade, built to layout.json "lamp.object".
   The canvas is the shade only; the cord is a CSS line above it and the light pool is CSS below it. */
import * as THREE from 'three';
import { createStage } from '../_shared/three/stage.js';

const canvas = document.querySelector('[data-hero-canvas]');
const hero = document.querySelector('[data-hero]');
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

try {
  const stage = createStage(canvas, { fov: 30, parallaxDeg: 4, idleSpin: false, toneMappingExposure: 1.05 });
  stage.envRoom();
  stage.contactShadow.visible = false;

  // Silhouette first. Profile measured from the reference: [distance from the top 0..1, radius 0..1].
  const H = 1.3;
  const profile = [[0, 0.085], [0.07, 0.085], [0.11, 0.1], [0.15, 0.2], [0.22, 0.36], [0.32, 0.53], [0.5, 0.72], [0.7, 0.88], [0.9, 0.975], [1, 1]];
  const curve = new THREE.SplineCurve(profile.map(([t, r]) => new THREE.Vector2(r, H * (1 - t))));
  const outline = [new THREE.Vector2(0, H), ...curve.getPoints(72)];

  const shadeMat = new THREE.MeshPhysicalMaterial({
    color: css('--lamp') || '#c3c8d2', metalness: 0.62, roughness: 0.34, clearcoat: 0.25, clearcoatRoughness: 0.5, envMapIntensity: 1.1, side: THREE.DoubleSide,
  });
  const lamp = new THREE.Group();
  lamp.add(new THREE.Mesh(new THREE.LatheGeometry(outline, 96), shadeMat));
  // Rolled lip at the rim: catches a highlight and gives the edge thickness.
  const lip = new THREE.Mesh(new THREE.TorusGeometry(1, 0.016, 12, 96), shadeMat);
  lip.rotation.x = Math.PI / 2;
  lamp.add(lip);
  // Warm underside, seen as a thin sliver at the rim when the light is on.
  const glowMat = new THREE.MeshBasicMaterial({ color: '#ffb070', toneMapped: false, transparent: true });
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.985, 64), glowMat);
  glow.rotation.x = Math.PI / 2; glow.position.y = 0.012;
  lamp.add(glow);
  lamp.scale.setScalar(0.9);
  lamp.position.y = -H * 0.45 + 0.1; // neck meets the top edge (and the CSS cord); the rim clears the bottom edge
  stage.root.add(lamp);

  // Camera: slightly above the rim, so the near rim curves down as in the reference. Distance fits the taller side.
  stage.camera.position.set(0, 0.32, 3.55);
  stage.camera.lookAt(0, 0, 0);
  stage.key.position.set(-2.2, 2.6, 3.2); stage.key.intensity = 2.1;
  const rim = new THREE.DirectionalLight('#ffffff', 0.7); rim.position.set(2.6, 0.4, -1.5); stage.scene.add(rim);

  let spin = 0, drag = null, intensity = 0.68, power = true;
  function applyGlow() {
    const v = power ? intensity : 0;
    glowMat.opacity = v; glow.visible = v > 0.02;
    glowMat.color.setHSL(0.075, 0.9, 0.6 + v * 0.14);
    hero.style.setProperty('--er-glow', v.toFixed(2));
  }
  applyGlow();

  stage.onFrame(() => { if (!drag) spin += 0.0008; lamp.rotation.y = spin; });
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, s: spin }; canvas.setPointerCapture(e.pointerId); hero.dataset.drag = '1'; });
  canvas.addEventListener('pointermove', (e) => { if (drag) spin = drag.s + (e.clientX - drag.x) * 0.01; });
  const end = () => { drag = null; delete hero.dataset.drag; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') spin -= 0.28; if (e.key === 'ArrowRight') spin += 0.28; });

  window.DBHero = {
    setMode() {},
    setIntensity(v) { intensity = Math.max(0, Math.min(1, Number(v) || 0)); applyGlow(); },
    setPower(on) { power = !!on; applyGlow(); },
    recolor() { shadeMat.color.set(css('--lamp') || '#c3c8d2'); },
    poster() { stage.renderer.render(stage.scene, stage.camera); return canvas.toDataURL('image/png'); },
  };
  hero.dataset.live = '1';
  document.dispatchEvent(new CustomEvent('db-hero-ready'));
} catch (err) {
  hero.dataset.live = '0';
  console.warn('Ember Rooms lamp WebGL failed', err);
}
