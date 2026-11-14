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
 * transparent), app.js not finished (<html data-ready="true"> missing), horizontal overflow,
 * text smaller than 12px, and text contrast measured on the REAL pixels behind each text
 * (works over gradients, images and SVG art): fails below 3.9:1 for normal text or 2.6:1 for
 * large text (WCAG 4.5 / 3 with a margin for anti-aliasing). Disabled controls and
 * gradient-clipped text are skipped.
 * Writes:
 *   site/dashboards/<id>/thumb.jpg  — 720×450 gallery card (viewport 1440×900 @ 0.5× DPR)
 *   site/dashboards/<id>/shot.jpg   — 1440×900 recreation screenshot (@ 1× DPR)
 *   site/dashboards/<id>/shot@2x.jpg — 1440×900 @ 2× DPR
 *   site/dashboards/<id>/frames/desktop.jpg|tablet.jpg|phone.jpg — overview device frames
 *   site/dashboards/<id>/frames/pages/<page>.jpg — each catalog page @ 1440×900
 *   site/dashboards/<id>/frames/pages/<page>-full.jpg — each catalog page, full length @ 1440
 * Polish gates per page: fails on a visible [data-db-stub] placeholder, a focus ring on load, and at 1440
 *   a thin page (< 60 visible elements in <main>, content < 70% of main width or < 60% of first screen),
 *   and any visible <img> wider than 160px whose source is under 1.5× its rendered width.
 *   site/dashboards/<id>/reference.* — optional owner-supplied original (catalog "reference")
 *   docs/validation/dashboards/<id>.json — check evidence
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

// ---------------------------------------------------------------- pixel contrast + minimum text size
async function textAudit(page) {
  const items = await page.evaluate(() => {
    const res = []; const seen = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const t = walker.currentNode; if (!t.textContent.trim()) continue;
      const el = t.parentElement; if (seen.has(el)) continue; seen.add(el);
      const s = getComputedStyle(el);
      if (s.visibility === 'hidden' || +s.opacity === 0 || el.closest('.vh,[aria-hidden="true"],[disabled],[aria-disabled="true"],script,style,noscript')) continue;
      let clip = false; for (let a = el, k = 0; a && k < 4; a = a.parentElement, k++) { const cs = getComputedStyle(a); if (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text') clip = true; }
      if (clip) continue;
      const r = document.createRange(); r.selectNodeContents(t); const rc = r.getBoundingClientRect();
      if (rc.width < 2 || rc.height < 2) continue;
      res.push({ text: t.textContent.trim().slice(0, 32), color: s.color, size: parseFloat(s.fontSize), weight: +s.fontWeight || 400, x: rc.left + scrollX, y: rc.top + scrollY, w: rc.width, h: rc.height });
    }
    return res;
  });
  const style = await page.addStyleTag({ content: '*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}::placeholder{color:transparent!important}' });
  await page.waitForTimeout(120);
  const png = (await page.screenshot({ fullPage: true })).toString('base64');
  await style.evaluate((n) => n.remove());
  return page.evaluate(async ({ items, png }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0);
    const k = img.width / document.documentElement.clientWidth; // device scale
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const pc = document.createElement('canvas').getContext('2d');
    const rgba = (c) => { pc.clearRect(0, 0, 1, 1); pc.fillStyle = '#000'; pc.fillStyle = c; pc.fillRect(0, 0, 1, 1); const d = pc.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
    const out = [];
    for (const it of items) {
      if (it.size < 12) { out.push(`text below 12px (${it.size}px): "${it.text}"`); continue; }
      const x0 = Math.max(0, Math.floor(it.x * k)), y0 = Math.max(0, Math.floor(it.y * k)), w = Math.min(cv.width - x0, Math.ceil(it.w * k)), h = Math.min(cv.height - y0, Math.ceil(it.h * k));
      if (w < 1 || h < 1) continue;
      const data = cx.getImageData(x0, y0, w, h).data; const fg = rgba(it.color); const ratios = [];
      for (let i = 0; i < data.length; i += 4 * 3) {
        const a = fg[3], r = fg[0] * a + data[i] * (1 - a), g = fg[1] * a + data[i + 1] * (1 - a), b = fg[2] * a + data[i + 2] * (1 - a);
        const l1 = L(r, g, b), l2 = L(data[i], data[i + 1], data[i + 2]); ratios.push((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
      }
      ratios.sort((p, q) => p - q); const r10 = ratios[Math.floor(ratios.length / 10)];
      const large = it.size >= 24 || (it.size >= 18.66 && it.weight >= 600); const min = large ? 2.6 : 3.9;
      if (r10 < min) { const m = Math.floor(data.length / 8) * 4; out.push(`low contrast ${r10.toFixed(2)}:1 (${large ? 'large, needs 3' : 'needs 4.5'}) "${it.text}" ${it.size}px, text ${it.color} on ~rgb(${data[m]}, ${data[m + 1]}, ${data[m + 2]}) at x${Math.round(it.x)} y${Math.round(it.y)}`); }
    }
    return out;
  }, { items, png });
}

async function capture(page, path) {
  await page.screenshot({ path, type: 'jpeg', quality: 88 });
}

for (const d of list) {
  const dir = join(site, 'dashboards', d.id);
  const problems = [];
  const runs = [];
  if (!existsSync(join(dir, 'index.html'))) { console.error(`✖ ${d.id}: site/dashboards/${d.id}/index.html missing`); failed++; continue; }
  if (!d.pages?.length) { console.error(`✖ ${d.id}: catalog pages missing`); failed++; continue; }
  const p = `/dashboards/${d.id}`;
  const overviewHash = `#/${d.pages[0].id}`;
  const framesDir = join(dir, 'frames');
  const pagesDir = join(framesDir, 'pages');
  mkdirSync(pagesDir, { recursive: true });

  const shots = [
    [1440, 900, `${p}/${overviewHash}`, 'default', 'thumb'],
    [1440, 900, p + overviewHash, 'default', null],
    [1440, 900, `${p}/index.html${overviewHash}`, 'default', null],
    [375, 812, `${p}/${overviewHash}`, 'default', null],
    ...d.variants.filter((v) => v.id !== 'default').map((v) => [1440, 900, `${p}/?variant=${v.id}${overviewHash}`, v.id, null]),
  ];
  for (const [w, h, url, variant, shotKind] of shots) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: shotKind === 'thumb' ? 0.5 : 1 });
    const errs = []; watch(page, errs);
    await page.goto(base + url, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const info = await inspect(page);
    judge(info, errs);
    if (variant !== 'default' && !(await page.evaluate((v) => document.documentElement.dataset.variant === v, variant))) errs.push(`variant ${variant} not applied`);
    // empty main check
    const emptyMain = await page.evaluate(() => {
      const m = document.querySelector('main');
      if (!m) return 'no <main>';
      const text = (m.innerText || '').trim();
      return text.length < 8 ? 'empty <main>' : null;
    });
    if (emptyMain) errs.push(emptyMain);
    // nav links must point at known pages
    const badNav = await page.evaluate((ids) => {
      const bad = [];
      document.querySelectorAll('a[href^="#/"]').forEach((a) => {
        const id = (a.getAttribute('href') || '').replace(/^#\/?/, '').split(/[/?#]/)[0];
        if (id && !ids.includes(id)) bad.push(id);
      });
      return bad;
    }, d.pages.map((pg) => pg.id));
    if (badNav.length) errs.push(`nav points to unknown page(s): ${[...new Set(badNav)].join(', ')}`);
    if (url.includes('/#/') || url.endsWith(overviewHash) || url.includes('?variant=')) errs.push(...(await textAudit(page)));
    if (shotKind === 'thumb' && !errs.length) {
      await page.screenshot({ path: join(dir, 'thumb.jpg'), type: 'jpeg', quality: 82 });
      const full = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
      const ferrs = []; watch(full, ferrs);
      await full.goto(base + url, { waitUntil: 'load' });
      await full.waitForTimeout(800);
      judge(await inspect(full), ferrs);
      if (!ferrs.length) {
        await capture(full, join(dir, 'shot.jpg'));
        const hi = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
        const herrs = []; watch(hi, herrs);
        await hi.goto(base + url, { waitUntil: 'load' });
        await hi.waitForTimeout(800);
        judge(await inspect(hi), herrs);
        if (!herrs.length) await capture(hi, join(dir, 'shot@2x.jpg'));
        else problems.push(...herrs.map((e) => `[shot@2x] ${e}`));
        await hi.close();
      } else problems.push(...ferrs.map((e) => `[shot ${url}] ${e}`));
      await full.close();
    }
    runs.push({ url, width: w, variant, final_path: info.path, overflow_px: info.overflow, errors: errs });
    problems.push(...errs.map((e) => `[${w} ${url}] ${e}`));
    await page.close();
  }

  // Every catalog page × default + each variant at 1440 and 375
  for (const pg of d.pages) {
    for (const variant of d.variants) {
      for (const [w, h] of [[1440, 900], [375, 812]]) {
        const q = variant.id === 'default' ? '' : `?variant=${variant.id}`;
        const url = `${p}/${q}#/${pg.id}`;
        const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
        const errs = []; watch(page, errs);
        await page.goto(base + url, { waitUntil: 'load' });
        await page.waitForTimeout(700);
        judge(await inspect(page), errs);
        const emptyMain = await page.evaluate(() => {
          const m = document.querySelector('main');
          if (!m) return 'no <main>';
          return ((m.innerText || '').trim().length < 8) ? 'empty <main>' : null;
        });
        if (emptyMain) errs.push(emptyMain);
        if (await page.evaluate((id) => document.documentElement.dataset.page !== id, pg.id)) errs.push(`dataset.page != ${pg.id}`);
        // Polish gates (architect review 2): no placeholder pages, no focus ring on load, real density.
        const gate = await page.evaluate((wide) => {
          const out = [];
          const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
          const stub = document.querySelector('[data-db-stub]');
          if (stub && !stub.hidden && vis(stub)) out.push('placeholder page: [data-db-stub] is visible (build the real page UI)');
          const a = document.activeElement;
          if (a && a !== document.body) {
            const cs = getComputedStyle(a);
            if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) out.push(`focus ring visible on load (${a.tagName.toLowerCase()})`);
          }
          // Full-pixel imagery: every visible <img> wider than 160px needs ≥ 1.5× its rendered width in source pixels.
          for (const img of document.querySelectorAll('img')) {
            if (!vis(img) || !img.complete) continue;
            const rw = img.getBoundingClientRect().width;
            if (rw > 160 && img.naturalWidth && img.naturalWidth < rw * 1.5) out.push(`low-res image: ${(img.currentSrc || img.src).split('/').slice(-2).join('/')} is ${img.naturalWidth}px for ${Math.round(rw)}px rendered (need ≥ ${Math.ceil(rw * 1.5)}px or a srcset 2x)`);
          }
          const m = document.querySelector('main');
          if (m && wide) {
            const leaves = [...m.querySelectorAll('*')].filter((el) => vis(el) && (el.children.length === 0 || el.matches('svg,canvas,img,picture,video')));
            if (leaves.length < 60) out.push(`thin page: ${leaves.length} visible elements in <main> (need ≥ 60 at 1440)`);
            const mr = m.getBoundingClientRect();
            let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
            for (const el of leaves) { const r = el.getBoundingClientRect(); x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); }
            const vw = Math.min(mr.width, innerWidth), vh = Math.min(mr.height, innerHeight);
            const cover = leaves.length ? (Math.min(x1, mr.left + vw) - Math.max(x0, mr.left)) / vw : 0;
            if (cover < 0.7) out.push(`page content spans ${Math.round(cover * 100)}% of the main width (need ≥ 70%)`);
            if (leaves.length && (Math.min(y1, innerHeight) - Math.max(y0, 0)) / vh < 0.6) out.push('page content fills less than 60% of the first screen height');
          }
          return out;
        }, w >= 1280);
        errs.push(...gate);
        errs.push(...(await textAudit(page)));
        if (!errs.length && variant.id === 'default' && w === 1440) {
          await capture(page, join(pagesDir, `${pg.id}.jpg`));
          // Full-length capture so reviewers see everything below the fold, not just 1440×900.
          await page.screenshot({ path: join(pagesDir, `${pg.id}-full.jpg`), type: 'jpeg', quality: 80, fullPage: true });
        }
        runs.push({ url, width: w, variant: variant.id, page: pg.id, errors: errs });
        problems.push(...errs.map((e) => `[page ${pg.id} ${w} ${variant.id}] ${e}`));
        await page.close();
      }
    }
  }

  // Device frames of overview
  if (!problems.length) {
    for (const [name, w, h] of [['desktop', 1440, 900], ['tablet', 1024, 768], ['phone', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      const errs = []; watch(page, errs);
      await page.goto(`${base}${p}/#/${d.pages[0].id}`, { waitUntil: 'load' });
      await page.waitForTimeout(700);
      judge(await inspect(page), errs);
      if (!errs.length) await capture(page, join(framesDir, `${name}.jpg`));
      else problems.push(...errs.map((e) => `[frame ${name}] ${e}`));
      await page.close();
    }
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
  else console.log(`✔ ${d.id}: pages=${d.pages.length}, variants=${d.variants.length}, frames + shot@2x · pixel contrast · text ≥ 12px`);
}
await browser.close();
server.close();
if (failed) { console.error(`✖ ${failed} dashboard(s) failed`); process.exit(1); }
