/** Citadel Wall — procedural hologram cube + network globe. */
import { createStage } from '../_shared/three/stage.js';
import * as THREE from 'three';

export function mountHoloCube(canvas) {
  const stage = createStage(canvas, { fov: 38, parallaxDeg: 8, idlePeriod: 12, poster: 'media/holo@2x.webp' });
  stage.envRoom();
  stage.camera.position.set(0, 0.4, 3.4);
  stage.key.intensity = 1.5;
  stage.key.position.set(2, 4, 3);

  const shellMat = (opacity, emissive = '#00e5ff') => new THREE.MeshPhysicalMaterial({
    color: '#7adfff',
    metalness: 0.1,
    roughness: 0.12,
    transmission: 0.95,
    thickness: 0.6,
    ior: 1.4,
    transparent: true,
    opacity,
    emissive: new THREE.Color(emissive),
    emissiveIntensity: 0.15,
    side: THREE.DoubleSide,
  });

  const outer = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.35, 1.35), shellMat(0.35));
  const mid = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), shellMat(0.45, '#5cf0ff'));
  const inner = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), shellMat(0.55, '#a0f0ff'));
  // fix typo

  const edges = (mesh, color = '#9ef6ff') => {
    const e = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 }),
    );
    mesh.add(e);
  };
  edges(outer); edges(mid, '#5cf0ff'); edges(inner, '#fff6a0');

  // Inner lattice of small cubes
  const lattice = new THREE.Group();
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue;
        const c = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.12, 0.12),
          new THREE.MeshBasicMaterial({ color: '#c8fff8', transparent: true, opacity: 0.7 }),
        );
        c.position.set(x * 0.22, y * 0.22, z * 0.22);
        lattice.add(c);
      }
    }
  }
  inner.add(lattice);

  const cube = new THREE.Group();
  cube.add(outer, mid, inner);
  stage.root.add(cube);

  // Torus + ring pedestal
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.04, 12, 64),
    new THREE.MeshStandardMaterial({ color: '#00e5ff', emissive: '#00a0c0', emissiveIntensity: 0.8, metalness: 0.6, roughness: 0.3 }),
  );
  torus.rotation.x = Math.PI / 2;
  torus.position.y = -1.05;
  stage.root.add(torus);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.95, 48),
    new THREE.MeshBasicMaterial({ color: '#00e5ff', transparent: true, opacity: 0.25, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -1.05;
  stage.root.add(ring);

  // Light cone
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 2.2, 32, 1, true),
    new THREE.MeshBasicMaterial({ color: '#66e8ff', transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false }),
  );
  cone.position.y = -0.1;
  stage.root.add(cone);

  stage.onFrame((t) => {
    outer.rotation.y = t * 0.25;
    mid.rotation.y = -t * 0.35;
    inner.rotation.y = t * 0.45;
    lattice.rotation.x = t * 0.2;
  });

  stage.contactShadow.position.y = -1.15;
  return { stage, cube, pulse() { outer.material.emissiveIntensity = 0.55; setTimeout(() => { outer.material.emissiveIntensity = 0.15; }, 400); } };
}

export function mountNetworkGlobe(canvas) {
  const stage = createStage(canvas, { fov: 40, parallaxDeg: 5, idlePeriod: 18, poster: 'media/holo@2x.webp' });
  stage.envRoom();
  stage.camera.position.set(0, 0.2, 3.2);
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 64, 48),
    new THREE.MeshPhysicalMaterial({
      color: '#6ad8ff',
      metalness: 0,
      roughness: 0.15,
      transmission: 0.88,
      thickness: 0.8,
      ior: 1.35,
      transparent: true,
      clearcoat: 1,
    }),
  );
  stage.root.add(globe);
  // grid floor
  const grid = new THREE.GridHelper(6, 24, 0x00e5ff, 0x0a3048);
  grid.position.y = -1.2;
  stage.scene.add(grid);
  // icon bubbles
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 24, 16),
      new THREE.MeshStandardMaterial({ color: '#9ef6ff', emissive: '#00a8c8', emissiveIntensity: 0.6 }),
    );
    b.position.set(Math.cos(a) * 0.55, Math.sin(a * 1.3) * 0.35, Math.sin(a) * 0.55);
    globe.add(b);
  }
  stage.onFrame((t) => { globe.rotation.y = t * 0.15; });
  stage.contactShadow.position.y = -1.2;
  return stage;
}
