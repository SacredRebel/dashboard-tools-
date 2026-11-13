#!/usr/bin/env node
/**
 * dashboards-check.mjs: render every gallery dashboard the way a real host serves it, check it,
 * and write its thumbnail + evidence.
 *
 *   node scripts/dashboards-check.mjs              # all dashboards in catalog/dashboards.json
 *   node scripts/dashboards-check.mjs horizon-weather other-id   # only these
 *
 * Why an HTTP server and not file://: Vercel "clean URLs" rewrite /dashboards/<id>/index.html to
 * /dashboards/<id> (no trailing slash). Without the slash, relative links (style.css, app.js,
 * ../_shared/…) resolve one folder too high and the dashboard renders unstyled. file:// never
 * shows that bug, so this script serves site/ with the WORST-CASE rules:
 *   /x/index.html → 308 → /x      (strips index.html AND the slash)
 *   /x            → serves /x/index.html directly (no redirect, relative URLs break)
 *   /x/           → serves /x/index.html
 *   /x.html       → 308 → /x ;  /x → x.html
 * A dashboard passes only if it renders correctly from every URL form below.
 *
 * For each dashboard it loads, over that server:
 *   /dashboards/<id>/ , /dashboards/<id> , /dashboards/<id>/index.html   at 1440×900
 *   /dashboards/<id>/ at 375×812, and ?variant=<v> for every extra variant at 1440×900
 *   the gallery detail page /#/dashboards/<id> and inspects the preview iframe
 * and fails on: console/page errors, any HTTP response >= 400, unstyled page (body background
 * transparent), app.js not finished (<html data-ready="true"> missing), horizontal overflow.
 * Writes site/dashboards/<id>/thumb.jpg (720×450) and docs/validation/dashboards/<id>.json.
 * Exit 1 on any problem. Requires Playwright (preinstalled in Claude cloud sessions; elsewhere:
 * npm install --no-save playwright && npx playwright install chromium).
 */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

let chromium;
try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = createRequire(import.meta.url)('playwright')); }

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'site');
const cat = JSON.parse(readFileSync(join(root, 'catalog/dashboards.json'), 'utf8'));
const only = process.argv.slice(2);
const list = cat.dashboards.filter((d) => !only.length || only.includes(d.id));
if (!list.length) { console.error('No matching dashboards.'); process.exit(1); }
mkdirSync(join(root, 'docs/validation/dashboards'), { recursive: true });

// ---------------------------------------------------------------- worst-case "clean URLs" static server
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const isFile = (p) => existsSync(p) && statSync(p).isFile();
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const path = decodeURIComponent(url.pathname);
  const send = (file) => { res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file)); };
  const redirect = (to) => { res.writeHead(308, { Location: to + url.search }); res.end(); };
  const fsPath = normalize(join(site, path));
  if (!fsPath.startsWith(site)) { res.writeHead(403); return res.end(); }
  if (path.endsWith('/index.html')) return redirect(path.slice(0, -'/index.html'.length) || '/');
  if (path.endsWith('.html') && path !== '/index.html') return redirect(path.slice(0, -5));
  if (path.endsWith('/') && isFile(join(fsPath, 'index.html'))) return send(join(fsPath, 'index.html'));
  if (isFile(fsPath)) return send(fsPath);
  if (isFile(join(fsPath, 'index.html'))) return send(join(fsPath, 'index.html')); // the dangerous case
  if (isFile(fsPath + '.html')) return send(fsPath + '.html');
  res.writeHead(404); res.end('Not found');
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

// ---------------------------------------------------------------- checks
const browser = await chromium.launch();
let failed = 0;

async function inspect(frameOrPage) {
  return frameOrPage.evaluate(() => ({
    bg: getComputedStyle(document.body).backgroundColor,
    ready: document.documentElement.dataset.ready === 'true',
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    path: location.pathname,
  }));
}
function judge(info, errs, { checkOverflow = true } = {}) {
  if (info.bg === 'rgba(0, 0, 0, 0)' || info.bg === 'transparent') errs.push(`unstyled page at ${info.path} (style.css or _shared/base.css did not load)`);
  if (!info.ready) errs.push(`app.js did not finish at ${info.path} (missing <html data-ready="true">: script failed or did not load)`);
  if (checkOverflow && info.overflow > 1) errs.push(`horizontal overflow ${info.overflow}px`);
}
function watch(page, errs) {
  // a client-side URL-guard redirect starts a new document: only judge the document that finally loads
  page.on('framenavigated', (f) => { if (f === page.mainFrame()) errs.length = 0; });
  page.on('pageerror', (e) => errs.push('page error: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(base)) errs.push(`HTTP ${r.status()} ${r.url().replace(base, '')}`); });
  page.on('requestfailed', (r) => { if (r.url().startsWith(base)) errs.push('request failed: ' + r.url().replace(base, '')); });
}

for (const d of list) {
  const dir = join(site, 'dashboards', d.id);
  const problems = [];
  const runs = [];
  if (!existsSync(join(dir, 'index.html'))) { console.error(`✖ ${d.id}: site/dashboards/${d.id}/index.html missing`); failed++; continue; }
  const p = `/dashboards/${d.id}`;
  const shots = [
    [1440, 900, `${p}/`, 'default', true],
    [1440, 900, p, 'default'],
    [1440, 900, `${p}/index.html`, 'default'],
    [375, 812, `${p}/`, 'default'],
    ...d.variants.filter((v) => v.id !== 'default').map((v) => [1440, 900, `${p}/?variant=${v.id}`, v.id]),
  ];
  for (const [w, h, url, variant, thumb] of shots) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: thumb ? 0.5 : 1 });
    const errs = []; watch(page, errs);
    await page.goto(base + url, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const info = await inspect(page);
    judge(info, errs);
    if (variant !== 'default' && !(await page.evaluate((v) => document.documentElement.dataset.variant === v, variant))) errs.push(`variant ${variant} not applied`);
    if (thumb && !errs.length) await page.screenshot({ path: join(dir, 'thumb.jpg'), type: 'jpeg', quality: 82 });
    runs.push({ url, width: w, variant, final_path: info.path, overflow_px: info.overflow, errors: errs });
    problems.push(...errs.map((e) => `[${w} ${url}] ${e}`));
    await page.close();
  }
  // gallery detail page: the preview iframe must render the dashboard, not a bare skeleton
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errs = []; watch(page, errs);
    await page.goto(`${base}/#/dashboards/${d.id}`, { waitUntil: 'load' });
    await page.waitForTimeout(1800);
    const frame = page.frames().find((f) => f !== page.mainFrame() && f.url().includes(`/dashboards/${d.id}/`));
    if (!frame) errs.push('gallery preview iframe did not load');
    else judge(await inspect(frame), errs, { checkOverflow: false });
    runs.push({ url: `/#/dashboards/${d.id}`, width: 1280, variant: 'gallery preview', errors: errs });
    problems.push(...errs.map((e) => `[gallery #/dashboards/${d.id}] ${e}`));
    await page.close();
  }
  writeFileSync(join(root, 'docs/validation/dashboards', `${d.id}.json`), JSON.stringify({ id: d.id, checked: new Date().toISOString().slice(0, 10), ok: !problems.length, server: 'worst-case clean URLs (see scripts/dashboards-check.mjs)', runs }, null, 2) + '\n');
  if (problems.length) { failed++; console.error(`✖ ${d.id}\n  ${problems.join('\n  ')}`); }
  else console.log(`✔ ${d.id}: ${runs.length} renders clean (3 URL forms, phone, ${d.variants.length - 1} variants, gallery preview) · thumb.jpg written`);
}
await browser.close();
server.close();
if (failed) { console.error(`✖ ${failed} dashboard(s) failed`); process.exit(1); }
