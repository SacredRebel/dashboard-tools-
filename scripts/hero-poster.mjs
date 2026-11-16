#!/usr/bin/env node
/**
 * Saves the transparent poster image for a dashboard's WebGL hero.
 *   node scripts/hero-poster.mjs <dashboard-id> [output.png]
 * The dashboard's hero module must expose  window.DBHero.poster()  returning a PNG data URL
 * (render one frame, then canvas.toDataURL). See site/dashboards/meridian-labs/helix.js.
 * The poster is what people see without WebGL, on file://, and before the module loads.
 */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const id = process.argv[2]; if (!id) { console.error('usage: node scripts/hero-poster.mjs <dashboard-id> [output.png]'); process.exit(1); }
const out = process.argv[3] || join(root, 'dashboards', id, 'media', 'hero-poster.png');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm' };
const server = createServer((req, res) => {
  let p = join(root, decodeURIComponent(req.url.split('?')[0])); if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p));
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${port}/dashboards/${id}/`, { waitUntil: 'load' });
await page.waitForFunction(() => window.DBHero && typeof window.DBHero.poster === 'function', null, { timeout: 15000 }).catch(() => {});
const data = await page.evaluate(() => (window.DBHero && window.DBHero.poster ? window.DBHero.poster() : null));
await browser.close(); server.close();
if (!data) { console.error(`✖ ${id}: window.DBHero.poster() is missing (the hero module did not load or does not expose it)`); process.exit(1); }
writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
console.log(`✔ poster saved: ${out}`);
