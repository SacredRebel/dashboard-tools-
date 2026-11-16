/* Pulsar Analytics twin: soft-3D board + WebGL ridge terrain. Sample data only. */
import * as THREE from 'three';
import { createStage } from '../_shared/three/stage.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const METRICS = [
  { id: 'users', name: 'Active users', icon: 'i-users', value: 18420, delta: '+8.4%', series: [11, 13, 12, 15, 18, 17, 19, 21, 20, 22, 24, 23] },
  { id: 'sessions', name: 'Sessions', icon: 'i-bolt', value: 96200, delta: '+4.1%', series: [40, 42, 38, 45, 48, 50, 47, 52, 55, 54, 58, 61] },
  { id: 'errors', name: 'Error rate', icon: 'i-warn', value: 0.42, unit: '%', delta: '−0.08%', series: [0.7, 0.65, 0.6, 0.55, 0.5, 0.48, 0.52, 0.46, 0.44, 0.43, 0.41, 0.42] },
  { id: 'latency', name: 'p95 latency', icon: 'i-pulse', value: 186, unit: 'ms', delta: '−12ms', series: [220, 210, 205, 198, 190, 195, 188, 184, 190, 182, 180, 186] },
];

const CHANNELS = [
  { id: 'web', name: 'Web', fill: 78, h: 92 },
  { id: 'ios', name: 'iOS', fill: 64, h: 76 },
  { id: 'android', name: 'Android', fill: 52, h: 68 },
  { id: 'api', name: 'API', fill: 88, h: 98 },
  { id: 'edge', name: 'Edge', fill: 41, h: 54 },
  { id: 'bots', name: 'Bots', fill: 22, h: 36 },
];

const EVENTS = [
  { id: 'e1', name: 'checkout.completed', count: 8420, region: 'US-East', severity: 'info' },
  { id: 'e2', name: 'auth.login', count: 22140, region: 'EU-West', severity: 'info' },
  { id: 'e3', name: 'billing.retry', count: 612, region: 'US-West', severity: 'warn' },
  { id: 'e4', name: 'edge.cache_miss', count: 3180, region: 'APAC', severity: 'info' },
  { id: 'e5', name: 'job.timeout', count: 94, region: 'US-East', severity: 'error' },
  { id: 'e6', name: 'feature.flag_on', count: 1560, region: 'EU-West', severity: 'info' },
  { id: 'e7', name: 'stream.lag', count: 210, region: 'SA-East', severity: 'warn' },
  { id: 'e8', name: 'search.query', count: 11980, region: 'US-East', severity: 'info' },
  { id: 'e9', name: 'webhook.delivered', count: 4020, region: 'EU-Central', severity: 'info' },
  { id: 'e10', name: 'quota.exceeded', count: 37, region: 'APAC', severity: 'error' },
];

const REGIONS = [
  { id: 'us-east', name: 'US-East', rps: 18400, health: 96, bars: [62, 70, 68, 74, 80, 78, 84] },
  { id: 'us-west', name: 'US-West', rps: 11200, health: 93, bars: [48, 52, 50, 55, 58, 60, 57] },
  { id: 'eu-west', name: 'EU-West', rps: 15600, health: 97, bars: [55, 58, 62, 60, 66, 70, 68] },
  { id: 'eu-central', name: 'EU-Central', rps: 8200, health: 91, bars: [36, 40, 38, 42, 44, 43, 46] },
  { id: 'apac', name: 'APAC', rps: 9800, health: 89, bars: [40, 44, 42, 48, 50, 52, 49] },
  { id: 'sa-east', name: 'SA-East', rps: 3100, health: 86, bars: [18, 20, 22, 21, 24, 26, 25] },
  { id: 'af-south', name: 'AF-South', rps: 1400, health: 84, bars: [10, 12, 11, 13, 14, 15, 14] },
  { id: 'me-central', name: 'ME-Central', rps: 2200, health: 88, bars: [14, 16, 15, 17, 18, 19, 18] },
];

const HOURS = [22, 18, 14, 12, 16, 28, 40, 55, 70, 82, 88, 76, 64, 58, 62, 70, 78, 85, 80, 66, 48, 36, 30, 26];
const WAVE = [12, 18, 16, 24, 30, 28, 36, 42, 40, 48, 55, 52, 58, 62, 60, 66];

const S = {
  range: '7d',
  metric: 'users',
  channel: 'api',
  q: '',
  view: 'ready',
  sort: 'count-desc',
  region: 'us-east',
  alerts: true,
  digest: true,
};

const fmt = (m) => {
  if (m.unit === '%') return m.value.toFixed(2) + '%';
  if (m.unit === 'ms') return m.value + ' ms';
  return m.value >= 1000 ? (m.value / 1000).toFixed(m.value >= 10000 ? 1 : 2).replace(/\.0$/, '') + 'k' : String(m.value);
};

function toast(msg) {
  const t = $('[data-toast]');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ---------- clock ticks ---------- */
(function ticks() {
  const g = $('[data-ticks]');
  if (!g) return;
  let html = '';
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const major = i % 5 === 0;
    const r0 = major ? 72 : 78;
    const r1 = 86;
    const x0 = 100 + Math.cos(a) * r0, y0 = 100 + Math.sin(a) * r0;
    const x1 = 100 + Math.cos(a) * r1, y1 = 100 + Math.sin(a) * r1;
    html += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${major ? 'rgb(196 155 255 / 0.75)' : 'rgb(196 155 255 / 0.28)'}" stroke-width="${major ? 2.2 : 1.2}"/>`;
  }
  g.innerHTML = html;
})();

function setHands() {
  const now = new Date();
  const h = ((now.getHours() % 12) + now.getMinutes() / 60) / 12 * 360;
  const m = (now.getMinutes() + now.getSeconds() / 60) / 60 * 360;
  const hh = $('[data-hand-h]'), mm = $('[data-hand-m]');
  if (hh) hh.style.transform = `rotate(${h}deg)`;
  if (mm) mm.style.transform = `rotate(${m}deg)`;
}
setHands();
if (!reduce) setInterval(setHands, 30000);

/* ---------- overview widgets ---------- */
function paintOrbs() {
  const el = $('[data-orbs]');
  el.innerHTML = METRICS.map((m) => `
    <button type="button" class="pa-orb" data-metric="${m.id}" aria-pressed="${S.metric === m.id}" aria-label="${esc(m.name)} ${fmt(m)}">
      <svg><use href="#${m.icon}"/></svg>
      <b class="num">${esc(fmt(m))}</b>
      <small>${esc(m.delta)}</small>
    </button>`).join('');
}

function paintHours() {
  const max = Math.max(...HOURS);
  $('[data-hours]').innerHTML = HOURS.map((v, i) => `<span class="bar" style="--i:${i};height:${Math.max(12, (v / max) * 100)}%" title="Hour ${i}: ${v}"></span>`).join('');
}

function paintPills() {
  $('[data-pills]').innerHTML = CHANNELS.map((c) => `
    <button type="button" class="pa-pill" style="--h:${c.h};--fill:${c.fill}" data-channel="${c.id}" aria-pressed="${S.channel === c.id}" aria-label="${esc(c.name)} ${c.fill}%">
      <span>${esc(c.name)}</span>
    </button>`).join('');
}

function paintWave() {
  const w = 280, h = 120;
  const mx = Math.max(...WAVE), mn = Math.min(...WAVE);
  const pts = WAVE.map((v, i) => {
    const x = (i / (WAVE.length - 1)) * w;
    const y = h - 12 - ((v - mn) / (mx - mn || 1)) * (h - 28);
    return [x, y];
  });
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  $('[data-wave-area]').setAttribute('d', area);
  $('[data-wave-line]').setAttribute('d', line);
  $('[data-wave-n]').textContent = EVENTS.length + ' streams';
}

function paintRbars() {
  const vals = REGIONS.slice(0, 7).map((r) => r.rps);
  const mx = Math.max(...vals);
  $('[data-rbars]').innerHTML = vals.map((v, i) => `<span class="pa-rbar" style="--i:${i};--h:${Math.max(18, (v / mx) * 100)}" title="${esc(REGIONS[i].name)}"></span>`).join('');
}

function sparkPath(series, color) {
  const w = 160, h = 40;
  const mx = Math.max(...series), mn = Math.min(...series);
  const pts = series.map((v, i) => {
    const x = (i / (series.length - 1)) * w;
    const y = h - 4 - ((v - mn) / (mx - mn || 1)) * (h - 8);
    return [x, y];
  });
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = `${d} L ${w} ${h} L 0 ${h} Z`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path class="area" d="${area}" style="fill:${color}22"/><path class="line" d="${d}" style="stroke:${color}"/></svg>`;
}

function paintSparks() {
  const picks = [METRICS[0], METRICS[1], METRICS[2]];
  const colors = ['#00ffcc', '#c49bff', '#ff7ab8'];
  $('[data-sparks]').innerHTML = picks.map((m, i) => `
    <article class="pa-spark">
      <h3>${esc(m.name)}</h3>
      <b class="num">${esc(fmt(m))}</b>
      ${sparkPath(m.series, colors[i])}
    </article>`).join('');
}

function paintHeroMeta() {
  const m = METRICS.find((x) => x.id === S.metric) || METRICS[0];
  $('[data-hero-title]').textContent = m.name;
  $('[data-hero-sub]').textContent = S.range + ' ridge · ' + m.delta;
  $('[data-hero-labels]').innerHTML = `
    <span style="left:12%;top:18%">Peak ${fmt(m)}</span>
    <span style="left:58%;top:30%">${esc(CHANNELS.find((c) => c.id === S.channel)?.name || 'API')}</span>
    <span style="left:34%;top:62%">Pool</span>`;
  $('[data-constellation]').innerHTML = `<svg viewBox="0 0 400 260" preserveAspectRatio="none">
    <g stroke="rgb(255 255 255 / 0.35)" stroke-width="1" fill="none">
      <path d="M40 180 L120 90 L200 140 L280 60 L360 110"/>
      <path d="M80 200 L160 150 L240 170 L320 100"/>
    </g>
    <g fill="#00ffcc">${[[40,180],[120,90],[200,140],[280,60],[360,110],[160,150],[320,100]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="2.5"/>`).join('')}</g>
  </svg>`;
}

/* ---------- WebGL terrain ---------- */
let stage = null;
let terrainMat = null;
function buildTerrain() {
  const canvas = $('canvas[data-hero]');
  if (!canvas) return;
  stage = createStage(canvas, {
    poster: 'media/hero-poster.png',
    fov: 42,
    parallaxDeg: 7,
    idlePeriod: 16,
    toneMappingExposure: 1.05,
  });
  stage.envRoom();
  stage.camera.position.set(0, 1.35, 3.4);
  stage.camera.lookAt(0, 0.1, 0);
  stage.contactShadow.position.y = -0.55;
  stage.contactShadow.scale.set(1.6, 1.6, 1);
  stage.key.intensity = 1.1;
  stage.key.position.set(1.5, 3.2, 2.2);
  const violet = new THREE.PointLight(0xbf00ff, 2.2, 8);
  violet.position.set(0, -0.2, 0.4);
  stage.scene.add(violet);
  const mint = new THREE.PointLight(0x00ffcc, 1.1, 6);
  mint.position.set(-1.4, 0.8, 0.6);
  stage.scene.add(mint);

  const geo = new THREE.PlaneGeometry(4.6, 3.4, 120, 90);
  const pos = geo.attributes.position;
  const colors = [];
  const cMint = new THREE.Color('#00ffcc');
  const cViolet = new THREE.Color('#bf00ff');
  const cPeach = new THREE.Color('#ffcc99');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const n1 = Math.sin(x * 1.85) * Math.cos(y * 1.45);
    const n2 = Math.sin(x * 3.4 + y * 1.9) * 0.42;
    const n3 = Math.cos(x * 0.85 - y * 2.4) * 0.28;
    const ridge = Math.pow(Math.max(0, n1), 1.4) * 0.9;
    const h = (ridge + n2 + n3) * 0.72 + 0.08;
    pos.setZ(i, h);
    const tt = (h + 0.35) / 1.35;
    const col = cMint.clone().lerp(cViolet, Math.min(1, Math.max(0, tt)));
    if (x > 0.4) col.lerp(cPeach, Math.min(1, (x - 0.4) / 1.6) * 0.85);
    colors.push(col.r, col.g, col.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  terrainMat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.22,
    metalness: 0.08,
    transmission: 0.72,
    thickness: 0.85,
    transparent: true,
    opacity: 0.82,
    flatShading: true,
    side: THREE.DoubleSide,
    emissive: new THREE.Color('#3a1860'),
    emissiveIntensity: 0.32,
  });
  const mesh = new THREE.Mesh(geo, terrainMat);
  mesh.rotation.x = -Math.PI / 2.35;
  mesh.position.y = -0.15;
  stage.root.add(mesh);

  // glowing ridge lines
  const edges = new THREE.EdgesGeometry(geo, 22);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
  }));
  line.rotation.copy(mesh.rotation);
  line.position.copy(mesh.position);
  line.position.y += 0.01;
  stage.root.add(line);

  // purple pool disc
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(1.5, 48),
    new THREE.MeshBasicMaterial({ color: 0xbf00ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = -0.52;
  stage.root.add(pool);

  stage.onFrame((t) => {
    mesh.position.y = -0.15 + Math.sin(t * 0.6) * 0.02;
    line.position.y = mesh.position.y + 0.01;
    pool.material.opacity = 0.28 + Math.sin(t * 0.9) * 0.08;
    const boost = S.metric === 'errors' ? 0.55 : S.metric === 'latency' ? 0.35 : 0.25;
    terrainMat.emissiveIntensity = boost + Math.sin(t) * 0.05;
  });
}

function applyMetricToTerrain() {
  if (!terrainMat) return;
  const map = { users: '#00ffcc', sessions: '#c49bff', errors: '#ff7ab8', latency: '#ffcc33' };
  terrainMat.emissive = new THREE.Color(map[S.metric] || '#2a1040');
}

/* ---------- range / interactions ---------- */
$$('[data-range] [data-v]').forEach((b) => b.addEventListener('click', () => {
  S.range = b.dataset.v;
  $$('[data-range] [data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  paintHeroMeta();
  toast('Range set to ' + S.range);
  render();
}));

$('[data-q]')?.addEventListener('input', (e) => { S.q = e.target.value; if (window.DB?.page && window.DB.page !== 'overview') render(); });

$('[data-act="alerts"]')?.addEventListener('click', () => toast('3 alerts: job.timeout, quota.exceeded, stream.lag'));

document.addEventListener('click', (e) => {
  const orb = e.target.closest('[data-metric]');
  if (orb) {
    S.metric = orb.dataset.metric;
    paintOrbs();
    paintHeroMeta();
    applyMetricToTerrain();
    toast('Terrain keyed to ' + (METRICS.find((m) => m.id === S.metric)?.name || S.metric));
    return;
  }
  const ch = e.target.closest('[data-channel]');
  if (ch) {
    S.channel = ch.dataset.channel;
    paintPills();
    paintHeroMeta();
    toast('Channel ' + ch.dataset.channel);
  }
});

const frame = $('[data-frame]');
if (!reduce && matchMedia('(pointer: fine)').matches && frame) {
  frame.addEventListener('pointermove', (e) => {
    const r = frame.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    $$('.pa-glass').forEach((el) => el.style.setProperty('--spec', (x * 28).toFixed(1) + 'px'));
  });
}

/* ---------- inner pages ---------- */
const stateBox = (items, emptyMsg, emptyBtn, body) => {
  if (S.view === 'loading') return '<div class="pa-grid"><div class="pa-skel"></div><div class="pa-skel"></div><div class="pa-skel"></div></div>';
  if (S.view === 'error') return '<div class="pa-state"><p>We couldn’t load this slice. Check the connection, then try again.</p><button class="pa-btn pa-btn--main" data-act="retry">Try again</button></div>';
  if (S.view === 'empty' || !items.length) return `<div class="pa-state"><p>${esc(emptyMsg)}</p>${emptyBtn}</div>`;
  return body(items);
};

const pages = {
  overview() {
    paintOrbs(); paintHours(); paintPills(); paintWave(); paintRbars(); paintSparks(); paintHeroMeta();
  },
  traffic(el) {
    const q = S.q.trim().toLowerCase();
    let list = CHANNELS.filter((c) => !q || c.name.toLowerCase().includes(q));
    el.innerHTML = `<div class="pa-sheet-head"><div><h1>Traffic</h1><p class="pa-sub">Channel share for ${esc(S.range)}. Tap a channel to key the overview terrain.</p></div>
      <div class="pa-tools"><input class="pa-field" type="search" placeholder="Filter channels" aria-label="Filter channels" value="${esc(S.q)}" data-page-q>
        <select class="pa-field" aria-label="Sort channels" data-sort>${[['h-desc','Tallest first'],['fill-desc','Fill first'],['name-asc','Name A–Z']].map(([v,l]) => `<option value="${v}"${S.sort===v?' selected':''}>${l}</option>`).join('')}</select></div></div>
      <div class="pa-kpi"><div><small>Total RPS</small><b class="num">${REGIONS.reduce((a,r)=>a+r.rps,0).toLocaleString('en-US')}</b></div>
        <div><small>Active channel</small><b>${esc(CHANNELS.find(c=>c.id===S.channel)?.name||'—')}</b></div>
        <div><small>Health</small><b class="num">88</b></div></div>
      ${stateBox(list, q ? `No channels match “${S.q}”.` : 'No channels in this range.', '<button class="pa-btn pa-btn--main" data-act="clear">Clear search</button>', (items) => {
        if (S.sort === 'name-asc') items = [...items].sort((a,b)=>a.name.localeCompare(b.name));
        if (S.sort === 'fill-desc') items = [...items].sort((a,b)=>b.fill-a.fill);
        if (S.sort === 'h-desc') items = [...items].sort((a,b)=>b.h-a.h);
        return `<div class="pa-grid">${items.map((c,i)=>`<button type="button" class="pa-tile" style="--i:${i}" data-channel="${c.id}" aria-pressed="${S.channel===c.id}"><small>${esc(c.name)}</small><b class="num">${c.fill}%</b><small>pillar height ${c.h}</small></button>`).join('')}</div>`;
      })}`;
  },
  events(el) {
    const q = S.q.trim().toLowerCase();
    let list = EVENTS.filter((e) => !q || (e.name + e.region).toLowerCase().includes(q));
    if (S.sort === 'count-asc') list = [...list].sort((a,b)=>a.count-b.count);
    else list = [...list].sort((a,b)=>b.count-a.count);
    el.innerHTML = `<div class="pa-sheet-head"><div><h1>Events</h1><p class="pa-sub">${list.length} streams in the ${esc(S.range)} window.</p></div>
      <div class="pa-tools"><input class="pa-field" type="search" placeholder="Search events" aria-label="Search events" value="${esc(S.q)}" data-page-q>
        <select class="pa-field" data-sort aria-label="Sort events">${[['count-desc','Highest count'],['count-asc','Lowest count']].map(([v,l])=>`<option value="${v}"${S.sort===v?' selected':''}>${l}</option>`).join('')}</select></div></div>
      ${stateBox(list, q ? `No events match “${S.q}”.` : 'No events yet.', '<button class="pa-btn pa-btn--main" data-act="clear">Clear search</button>', (items) => `
        <table class="pa-table"><thead><tr><th>Event</th><th>Region</th><th>Count</th><th>Severity</th><th></th></tr></thead>
        <tbody>${items.map((e)=>`<tr><td>${esc(e.name)}</td><td>${esc(e.region)}</td><td class="num">${e.count.toLocaleString('en-US')}</td><td>${esc(e.severity)}</td>
          <td><button class="pa-btn" data-pin="${e.id}" aria-pressed="${S.region===e.region.toLowerCase().replace(/\s+/g,'-')?'false':'false'}">Inspect</button></td></tr>`).join('')}</tbody></table>`)}`;
  },
  regions(el) {
    const q = S.q.trim().toLowerCase();
    const list = REGIONS.filter((r) => !q || r.name.toLowerCase().includes(q));
    const cur = REGIONS.find((r) => r.id === S.region) || REGIONS[0];
    el.innerHTML = `<div class="pa-sheet-head"><div><h1>Regions</h1><p class="pa-sub">Throughput and health by edge. Selected: ${esc(cur.name)}.</p></div>
      <div class="pa-tools"><input class="pa-field" type="search" placeholder="Filter regions" aria-label="Filter regions" value="${esc(S.q)}" data-page-q>
        <label class="pa-label">Preview a state<select class="pa-field" data-view>${[['ready','Populated'],['loading','Loading'],['empty','Empty'],['error','Error']].map(([v,l])=>`<option value="${v}"${S.view===v?' selected':''}>${l}</option>`).join('')}</select></label></div></div>
      ${stateBox(list, 'No regions match.', '<button class="pa-btn pa-btn--main" data-act="clear">Clear search</button>', (items) => `
        <div class="pa-grid">${items.map((r,i)=>`<button type="button" class="pa-tile" style="--i:${i}" data-region="${r.id}" aria-pressed="${S.region===r.id}">
          <small>${esc(r.name)}</small><b class="num">${r.rps.toLocaleString('en-US')}</b><small>rps · health ${r.health}</small>
          <svg viewBox="0 0 120 28" aria-hidden="true">${r.bars.map((v,j)=>{const mx=Math.max(...r.bars);return `<rect x="${j*16+2}" y="${28-v/mx*24}" width="10" height="${v/mx*24}" rx="3" fill="${S.region===r.id?'#00ffcc':'#c49bff'}" opacity="0.85"/>`;}).join('')}</svg>
        </button>`).join('')}</div>
        <form class="pa-glass" data-region-form style="padding:18px;display:grid;gap:12px;border-radius:20px">
          <h2>Watch ${esc(cur.name)}</h2>
          <label class="pa-label">Alert email<input class="pa-field" name="email" type="email" required placeholder="ops@pulsar.example" value="ops@pulsar.example"></label>
          <p class="pa-err" data-form-err hidden></p>
          <div class="pa-switch"><span>Page on health &lt; 90</span><input type="checkbox" name="alerts" ${S.alerts?'checked':''}></div>
          <div class="pa-switch"><span>Daily digest</span><input type="checkbox" name="digest" ${S.digest?'checked':''}></div>
          <button class="pa-btn pa-btn--main" type="submit">Save watch</button>
        </form>`)}`;
  },
};

function bindSheet(el) {
  $('[data-page-q]', el)?.addEventListener('input', (e) => { S.q = e.target.value; render(); });
  $('[data-sort]', el)?.addEventListener('change', (e) => { S.sort = e.target.value; render(); });
  $('[data-view]', el)?.addEventListener('change', (e) => { S.view = e.target.value; render(); });
  $('[data-act="clear"]', el)?.addEventListener('click', () => { S.q = ''; S.view = 'ready'; render(); });
  $('[data-act="retry"]', el)?.addEventListener('click', () => { S.view = 'ready'; render(); });
  $$('[data-region]', el).forEach((b) => b.addEventListener('click', () => { S.region = b.dataset.region; toast('Watching ' + S.region); render(); }));
  $$('[data-pin]', el).forEach((b) => b.addEventListener('click', () => {
    const ev = EVENTS.find((x) => x.id === b.dataset.pin);
    if (ev) { toast('Inspecting ' + ev.name); S.q = ev.name; }
  }));
  $$('[data-channel]', el).forEach((b) => b.addEventListener('click', () => {
    S.channel = b.dataset.channel; paintPills(); paintHeroMeta(); toast('Channel ' + S.channel); render();
  }));
  const form = $('[data-region-form]', el);
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const err = $('[data-form-err]', form);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.hidden = false; err.textContent = 'Enter a valid email so we can page on-call.'; form.email.focus(); return; }
    err.hidden = true;
    S.alerts = form.alerts.checked; S.digest = form.digest.checked;
    toast('Watch saved for ' + S.region);
  });
}

function render() {
  const id = window.DB?.page || 'overview';
  $$('[data-db-page]').forEach((sec) => { sec.hidden = sec.dataset.dbPage !== id; });
  if (id === 'overview') pages.overview();
  else {
    const el = $(`[data-db-page="${id}"]`);
    if (el) { pages[id]?.(el); bindSheet(el); }
  }
}

DB.route([
  { id: 'overview', name: 'Overview' },
  { id: 'traffic', name: 'Traffic' },
  { id: 'events', name: 'Events' },
  { id: 'regions', name: 'Regions' },
], () => render());

buildTerrain();
applyMetricToTerrain();
render();
document.documentElement.dataset.ready = 'true';
