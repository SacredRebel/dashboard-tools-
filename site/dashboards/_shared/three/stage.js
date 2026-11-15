/**
 * Shared Three.js stage for gallery dashboards.
 * createStage(canvas, opts) → { scene, camera, renderer, root, onFrame, loadGLB, envRoom, dispose }
 *
 * Transparent canvas, ResizeObserver, DPR ≤ 2, render only while visible + tab active,
 * reduced-motion = single frame, poster fallback, pointer parallax ≤ 8°.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const DEFAULTS = {
  fov: 35,
  dpr: typeof devicePixelRatio === 'number' ? Math.min(devicePixelRatio, 2) : 1,
  alpha: true,
  parallaxDeg: 8,
  idleSpin: true,
  idlePeriod: 14,
  toneMappingExposure: 1,
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {Partial<typeof DEFAULTS> & { poster?: string, near?: number, far?: number }} [opts]
 */
export function createStage(canvas, opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wrap = canvas.parentElement;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: cfg.alpha,
    antialias: true,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: false,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = cfg.toneMappingExposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(cfg.fov, 1, cfg.near ?? 0.1, cfg.far ?? 100);
  camera.position.set(0, 0.15, 3.2);

  const root = new THREE.Group();
  scene.add(root);

  // Soft contact shadow (blurred radial plane under the object)
  const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  // Bake a soft radial via canvas texture
  {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 4, 64, 64, 60);
    grd.addColorStop(0, 'rgba(0,0,0,0.55)');
    grd.addColorStop(0.45, 'rgba(0,0,0,0.18)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    shadowMat.map = new THREE.CanvasTexture(c);
    shadowMat.needsUpdate = true;
  }
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = -0.85;
  contactShadow.renderOrder = -1;
  scene.add(contactShadow);

  const key = new THREE.DirectionalLight(0xffffff, 1.35);
  key.position.set(2.2, 3.4, 2.8);
  key.castShadow = true;
  scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const fill = new THREE.DirectionalLight(0xa8c8ff, 0.45);
  fill.position.set(-2.5, 1.2, -1.5);
  scene.add(fill);

  let pmrem = null;
  let envTex = null;
  function envRoom() {
    if (envTex) return envTex;
    pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    envTex = pmrem.fromScene(room, 0.04).texture;
    scene.environment = envTex;
    room.dispose?.();
    return envTex;
  }

  const draco = new DRACOLoader();
  // Decoder paths optional — procedural scenes often skip GLB
  try {
    draco.setDecoderPath(new URL('../../_vendor/three@0.170.0/examples/jsm/libs/draco/', import.meta.url).href);
  } catch (_) { /* ignore */ }
  const gltf = new GLTFLoader();
  gltf.setDRACOLoader(draco);
  gltf.setMeshoptDecoder(MeshoptDecoder);

  function loadGLB(url) {
    return new Promise((resolve, reject) => {
      gltf.load(
        url,
        (asset) => resolve(asset),
        undefined,
        (err) => reject(err),
      );
    });
  }

  let w = 0;
  let h = 0;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const nextW = Math.max(1, Math.round(rect.width));
    const nextH = Math.max(1, Math.round(rect.height));
    if (nextW === w && nextH === h) return;
    w = nextW;
    h = nextH;
    const dpr = Math.min(cfg.dpr, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);
  resize();

  const frames = [];
  function onFrame(fn) {
    frames.push(fn);
    return () => {
      const i = frames.indexOf(fn);
      if (i >= 0) frames.splice(i, 1);
    };
  }

  let visible = false;
  let running = false;
  let raf = 0;
  let t0 = performance.now();
  let targetYaw = 0;
  let targetPitch = 0;
  let yaw = 0;
  let pitch = 0;

  function showPoster(on) {
    if (!cfg.poster || !wrap) return;
    let img = wrap.querySelector('[data-stage-poster]');
    if (on) {
      if (!img) {
        img = document.createElement('img');
        img.dataset.stagePoster = '';
        img.alt = '';
        img.decoding = 'async';
        img.src = cfg.poster;
        img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;';
        wrap.style.position = wrap.style.position || 'relative';
        wrap.appendChild(img);
      }
      canvas.style.visibility = 'hidden';
      img.hidden = false;
    } else if (img) {
      img.hidden = true;
      canvas.style.visibility = '';
    }
  }

  function paint(now) {
    const t = (now - t0) / 1000;
    yaw += (targetYaw - yaw) * 0.08;
    pitch += (targetPitch - pitch) * 0.08;
    root.rotation.y = yaw;
    root.rotation.x = pitch;
    if (cfg.idleSpin && !reduce) {
      root.rotation.y += Math.sin(t / (cfg.idlePeriod / (Math.PI * 2))) * 0.002;
      root.position.y = Math.sin(t * (Math.PI * 2) / cfg.idlePeriod) * 0.03;
    }
    for (const fn of frames) fn(t, { yaw, pitch, visible });
    renderer.render(scene, camera);
  }

  function loop(now) {
    if (!running) return;
    paint(now);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduce) return;
    running = true;
    showPoster(false);
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function onVis(v) {
    visible = v;
    if (reduce) {
      resize();
      paint(performance.now());
      return;
    }
    if (v) start();
    else stop();
  }

  if (window.DB?.onVisible) {
    window.DB.onVisible(canvas, onVis);
  } else {
    const io = new IntersectionObserver((es) => onVis(es[0]?.isIntersecting && !document.hidden));
    io.observe(canvas);
    document.addEventListener('visibilitychange', () => onVis(visible && !document.hidden));
  }

  // First paint / reduced motion
  resize();
  try {
    paint(performance.now());
  } catch (err) {
    console.warn('createStage: first paint failed', err);
    showPoster(true);
  }

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    showPoster(true);
  });
  canvas.addEventListener('webglcontextrestored', () => {
    showPoster(false);
    if (visible && !reduce) start();
    else paint(performance.now());
  });

  const maxRad = (cfg.parallaxDeg * Math.PI) / 180;
  function onPointer(e) {
    if (reduce) return;
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    targetYaw = nx * maxRad;
    targetPitch = -ny * maxRad * 0.6;
  }
  function onLeave() {
    targetYaw = 0;
    targetPitch = 0;
  }
  const ptrTarget = wrap || canvas;
  ptrTarget.addEventListener('pointermove', onPointer);
  ptrTarget.addEventListener('pointerleave', onLeave);

  function dispose() {
    stop();
    ro.disconnect();
    ptrTarget.removeEventListener('pointermove', onPointer);
    ptrTarget.removeEventListener('pointerleave', onLeave);
    shadowGeo.dispose();
    shadowMat.map?.dispose();
    shadowMat.dispose();
    envTex?.dispose?.();
    pmrem?.dispose?.();
    draco.dispose();
    renderer.dispose();
  }

  return {
    scene,
    camera,
    renderer,
    root,
    contactShadow,
    key,
    onFrame,
    loadGLB,
    envRoom,
    resize,
    dispose,
    THREE,
  };
}

export { THREE };
