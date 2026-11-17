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
 *   a thin page (< 28 content elements in <main>, content < 70% of main width or < 60% of first screen),
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
  // Let entrance animations finish first: sampling mid-fade reads the backdrop instead of the surface.
  await page.evaluate(() => Promise.race([
    Promise.all(document.getAnimations().filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {}))),
    new Promise((r) => setTimeout(r, 3000)),
  ]));
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
      const r = document.createRange(); r.selectNodeContents(t); let rc = r.getBoundingClientRect();
      if (rc.width < 2 || rc.height < 2) continue;
      // Only the part of the text that is actually painted counts: clip its box to every ancestor that clips
      // (scroll containers, and the element's own box when it truncates with an ellipsis).
      let L = rc.left, T = rc.top, Rr = rc.right, B = rc.bottom;
      for (let a = el; a && a !== document.body; a = a.parentElement) {
        const cs = getComputedStyle(a); if (cs.overflowY === 'visible' && cs.overflowX === 'visible') continue;
        const ar = a.getBoundingClientRect(); L = Math.max(L, ar.left); T = Math.max(T, ar.top); Rr = Math.min(Rr, ar.right); B = Math.min(B, ar.bottom);
      }
      if (Rr - L < 2 || B - T < 2) continue;
      if (B - T < rc.height * 0.6) continue;   // mostly scrolled out of view
      rc = { left: L, top: T, width: Rr - L, height: B - T };
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

  // Layout spec (docs/dashboards/07-layout-spec.md): the overview at 1440, plus any measured phone/tablet/page views.
  const specPath = join(dir, 'layout.json');
  const SPEC = isFile(specPath) ? JSON.parse(readFileSync(specPath, 'utf8')) : null;
  const WIDTHS = [[1440, 900], [375, 812]];
  for (const v of (SPEC && SPEC.views) || []) if (!WIDTHS.some(([x]) => x === v.width)) WIDTHS.push([v.width, v.height || 1180]);
  const viewsFor = (pgId, vId, w) => { if (!SPEC || vId !== 'default') return []; const out = [];
    if (pgId === d.pages[0].id && w === 1440) out.push({ ...SPEC, __label: 'overview 1440', __suffix: '' });
    for (const x of SPEC.views || []) if (x.page === pgId && x.width === w) out.push({ ...x, __label: `${x.page} ${x.width}`, __suffix: `-${x.page}-${x.width}` });
    return out; };
  // Compare sheet: every box, reference crop beside build crop. The builder must open it.
  const writeCompare = async (page, spec, sdir) => { const suffix = spec.__suffix;
    try {
            const refFile = ['reference.png', 'reference.jpg', 'reference.jpeg', 'reference.webp'].map((f) => join(sdir, f)).find(isFile);
            const rows = [];
            for (const [name, b] of Object.entries(spec.boxes || {})) {
              let r = b.ref;
              if (!r && spec.ref_frame && [b.x, b.y, b.w, b.h].every((v) => v != null)) { const [fx, fy, fw] = spec.ref_frame; r = [fx + b.x * fw / 100, fy + b.y * fw / 100, b.w * fw / 100, b.h * fw / 100]; }
              if (!r || !refFile) continue;
              const loc = page.locator(`[data-ref="${name}"]`).first();
              if (!(await loc.count()) || !(await loc.isVisible())) continue;
              rows.push({ name, r, note: b.note || '', shot: (await loc.screenshot({ type: 'jpeg', quality: 82 })).toString('base64') });
            }
            if (rows.length) {
              const refUrl = `data:${TYPES[extname(refFile)].split(';')[0]};base64,${readFileSync(refFile).toString('base64')}`;
              const sheet = await browser.newPage({ viewport: { width: 1100, height: 800 } });
              await sheet.setContent(`<body style="margin:16px;font:14px system-ui;background:#fff;color:#111"><h2>${d.id}: ${spec.__label}: reference (left) and build (right), box by box</h2><div id="o"></div></body>`);
              await sheet.evaluate(async ({ rows, refUrl }) => {
                const img = new Image(); img.src = refUrl; await img.decode(); const o = document.getElementById('o');
                for (const row of rows) {
                  const [x, y, w, h] = row.r; const H = Math.min(300, Math.max(70, h * (500 / w))); const W = Math.min(500, w * (H / h));
                  const wrap = document.createElement('div'); wrap.style.cssText = 'margin:0 0 18px;border-top:1px solid #ccc;padding-top:8px';
                  wrap.innerHTML = `<b>${row.name}</b> <span style="color:#444">${row.note}</span><div style="display:flex;gap:16px;align-items:flex-start;margin-top:6px"><canvas width="${Math.round(W)}" height="${Math.round(H)}" style="border:1px solid #999"></canvas><img style="height:${Math.round(H)}px;max-width:520px;object-fit:contain;border:1px solid #999" src="data:image/jpeg;base64,${row.shot}"></div>`;
                  wrap.querySelector('canvas').getContext('2d').drawImage(img, x, y, w, h, 0, 0, W, H); o.appendChild(wrap);
                }
              }, { rows, refUrl });
              const outDir = join(root, 'docs/validation/dashboards'); mkdirSync(outDir, { recursive: true });
              await sheet.screenshot({ path: join(outDir, `${d.id}-compare${suffix}.jpg`), type: 'jpeg', quality: 72, fullPage: true });
              await sheet.close();
            }
    } catch (e) { return [`compare sheet ${spec.__label} could not be written: ${e.message}`]; }
    return []; };

  // Every catalog page × default + each variant at 1440 and 375
  for (const pg of d.pages) {
    for (const variant of d.variants) {
      for (const [w, h] of WIDTHS) {
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
        // Scroll through the page once so on-view effects (reveal, count-up) run before gates and the full capture.
        await page.evaluate(async () => {
          const h = document.documentElement.scrollHeight;
          for (let y = 0; y < h; y += Math.max(300, innerHeight * 0.8)) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
          scrollTo(0, 0); await new Promise((r) => setTimeout(r, 900));
        });
        // Polish gates (architect review 2): no placeholder pages, no focus ring on load, real density.
        const gate = await page.evaluate(async (wide) => {
          const out = [];
          const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
          const stub = document.querySelector('[data-db-stub]');
          if (stub && !stub.hidden && vis(stub)) out.push('placeholder page: [data-db-stub] is visible (build the real page UI)');
          // Architect review 3: the shared "dense kit" (same KPI row + pulse card + alpha/bravo table on every
          // dashboard) is a placeholder too. Secondary pages must be designed for the product.
          const kit = [...document.querySelectorAll('[class*="db-dense"]')].filter(vis);
          if (kit.length) out.push(`generic page kit: ${kit.length} visible .db-dense-* elements (design this page for this product; no shared page template)`);
          const mainText = (document.querySelector('main') || document.body).innerText || '';
          const filler = mainText.match(/\b\w+ (alpha|bravo|cedar|delta|echo|folio|grove|haven)\b/gi) || [];
          if (filler.length >= 3) out.push(`filler rows: "${filler.slice(0, 3).join('", "')}" (use believable domain data)`);
          for (const el of document.querySelectorAll('[data-fx~="count"], [data-count], [data-fx~="odo"]')) {
            if (!vis(el)) continue;
            const target = parseFloat(el.dataset.to ?? el.dataset.count ?? '');
            if (target && /^\D*0(\.0+)?\D*$/.test(el.textContent.trim())) { out.push(`count-up stuck at 0 (target ${target}): "${el.textContent.trim()}"`); break; }
          }
          const a = document.activeElement;
          if (a && a !== document.body) {
            const cs = getComputedStyle(a);
            if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) out.push(`focus ring visible on load (${a.tagName.toLowerCase()})`);
          }
          // Full-pixel imagery: every visible <img> wider than 160px needs ≥ 1.5× its rendered width in source pixels.
          for (const img of document.querySelectorAll('img')) {
            if (!vis(img) || !img.complete) continue;
            const rw = img.getBoundingClientRect().width;
            // With srcset + sizes, naturalWidth is density-corrected; measure the file the browser actually chose.
            let nat = img.naturalWidth;
            if (img.srcset && img.currentSrc) nat = await new Promise((res) => { const t = new Image(); t.onload = () => res(t.naturalWidth); t.onerror = () => res(img.naturalWidth); t.src = img.currentSrc; });
            if (rw > 160 && nat && nat < rw * 1.5) out.push(`low-res image: ${(img.currentSrc || img.src).split('/').slice(-2).join('/')} is ${nat}px for ${Math.round(rw)}px rendered (need ≥ ${Math.ceil(rw * 1.5)}px or a srcset 2x)`);
          }
          const m = document.querySelector('main');
          if (m && wide) {
            // Content elements: anything visible that carries its own text, is media, or is a control.
            // (A stub page has ~10. A sparse hero page built to its reference has 30+.)
            const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
            const leaves = [...m.querySelectorAll('*')].filter((el) => vis(el) && !el.closest('svg svg, svg > *') && (ownText(el) || el.matches('svg,canvas,img,picture,video,input,select,textarea,button')));
            if (leaves.length < 28) out.push(`thin page: ${leaves.length} content elements in <main> (need ≥ 28 at 1440)`);
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
        // Architect review 4: the overview must really use the techniques its reference calls for (catalog signature_tech).
        if (pg.id === d.pages[0].id && variant.id === 'default' && w === 1440 && d.signature_tech?.length) {
          const tech = await page.evaluate((need) => {
            const out = [];
            const big = (el, min) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width >= min && r.height >= min * 0.5 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
            const all = [...document.querySelectorAll('body *')];
            if (need.includes('webgl')) {
              const ok = [...document.querySelectorAll('canvas')].some((c) => big(c, 220) && (c.getContext('webgl2') || c.getContext('webgl')));
              if (!ok) out.push('signature_tech webgl: no visible WebGL canvas ≥ 220px (the reference has a real 3D object; a photo of one does not count)');
            }
            if (need.includes('shape')) {
              const ok = all.some((el) => { if (!big(el, 300)) return false; const cs = getComputedStyle(el); return (cs.clipPath && cs.clipPath !== 'none') || ((cs.maskImage || cs.webkitMaskImage || 'none') !== 'none'); })
                || [...document.querySelectorAll('svg path[data-shape], svg clipPath path')].length > 0;
              if (!ok) out.push('signature_tech shape: no element ≥ 300px with a clip-path or mask (the reference has cut, notched or organic outlines; rounded rectangles do not count)');
            }
            if (need.includes('glass')) {
              const n = all.filter((el) => { if (!big(el, 160)) return false; const cs = getComputedStyle(el); const bf = cs.backdropFilter || cs.webkitBackdropFilter || 'none'; return bf !== 'none'; }).length;
              if (n < 3) out.push(`signature_tech glass: ${n} surfaces with backdrop-filter (need ≥ 3 real glass panes over a backdrop)`);
            }
            if (need.includes('tilt3d')) {
              const ok = all.some((el) => { if (!big(el, 300)) return false; const cs = getComputedStyle(el); return cs.perspective !== 'none' || /matrix3d/.test(cs.transform); });
              if (!ok) out.push('signature_tech tilt3d: no element ≥ 300px with CSS 3D perspective or a 3D transform');
            }
            return out;
          }, d.signature_tech);
          errs.push(...tech);
        }
        // Layout spec: the overview must match the measured reference (site/dashboards/<id>/layout.json, docs/dashboards/07-layout-spec.md).
        for (const spec of viewsFor(pg.id, variant.id, w)) {
          spec.__debug = !!process.env.LAYOUT_DEBUG;
          const lay = await page.evaluate(async (spec) => {
            const out = [];
            const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
            const q = (name) => [...document.querySelectorAll(`[data-ref="${name}"]`)].filter(vis);
            const frameEl = q('frame')[0];
            if (!frameEl) return ['layout: no visible element with data-ref="frame"'];
            const F = frameEl.getBoundingClientRect();
            const pct = (v) => Math.round((v / F.width) * 1000) / 10;
            const f = spec.frame || {};
            const vw = Math.round((F.width / innerWidth) * 1000) / 10; const asp = Math.round((F.height / F.width) * 100) / 100;
            if (f.min_w_vw && vw < f.min_w_vw) out.push(`layout frame: width is ${vw}% of the viewport, reference needs ≥ ${f.min_w_vw}%`);
            if (f.max_w_vw && vw > f.max_w_vw) out.push(`layout frame: width is ${vw}% of the viewport, reference needs ≤ ${f.max_w_vw}%`);
            if (f.aspect && (asp < f.aspect[0] || asp > f.aspect[1])) out.push(`layout frame: height/width is ${asp}, reference needs ${f.aspect[0]}–${f.aspect[1]}`);
            for (const [name, b] of Object.entries(spec.boxes || {})) {
              const els = q(name);
              const need = b.count || 1;
              if (els.length < need) { out.push(`layout ${name}: found ${els.length} visible data-ref="${name}", need ${need}${b.note ? ' — ' + b.note : ''}`); continue; }
              for (const el of (b.count ? els : els.slice(0, 1))) {
                const r = el.getBoundingClientRect();
                const got = { x: pct(r.left - F.left), y: pct(r.top - F.top), w: pct(r.width), h: pct(r.height) };
                const bad = [];
                for (const k of ['x', 'y', 'w', 'h']) {
                  if (b[k] == null) continue;
                  const tol = b.tol ?? ((k === 'x' || k === 'y') ? 3 : Math.max(1.5, b[k] * 0.25));
                  if (Math.abs(got[k] - b[k]) > tol) bad.push(`${k} ${got[k]} (want ${b[k]} ±${Math.round(tol * 10) / 10})`);
                }
                for (const [k, lim] of [['min_w', 'w'], ['min_h', 'h']]) if (b[k] != null && got[lim] < b[k]) bad.push(`${lim} ${got[lim]} (want ≥ ${b[k]})`);
                for (const [k, lim] of [['max_w', 'w'], ['max_h', 'h']]) if (b[k] != null && got[lim] > b[k]) bad.push(`${lim} ${got[lim]} (want ≤ ${b[k]})`);
                if (b.within) {
                  const cx = got.x + got.w / 2, cy = got.y + got.h / 2; const [x0, x1] = b.within.x || [-1e9, 1e9]; const [y0, y1] = b.within.y || [-1e9, 1e9];
                  if (cx < x0 || cx > x1 || cy < y0 || cy > y1) bad.push(`centre ${Math.round(cx * 10) / 10},${Math.round(cy * 10) / 10} outside x ${x0}–${x1}, y ${y0}–${y1}`);
                }
                if (b.object) {
                  // Object spec: measure the rendered 3D object's silhouette and shading (docs/dashboards/08-object-spec.md).
                  const o = b.object; let url = null;
                  try { url = window.DBHero && window.DBHero.poster && window.DBHero.poster(); } catch { url = null; }
                  if (!url) bad.push('object: window.DBHero.poster() is missing, so the 3D object cannot be measured (is WebGL running?)');
                  else {
                    const img = new Image(); img.src = url; await img.decode();
                    const c = document.createElement('canvas'); const W = c.width = Math.min(img.naturalWidth, 400); const H = c.height = Math.max(1, Math.round(img.naturalHeight * W / img.naturalWidth));
                    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, W, H); const px = g.getImageData(0, 0, W, H).data;
                    const rows = []; let x0 = W, x1 = -1, y0 = -1, y1 = -1, n = 0, sum = 0, sq = 0;
                    for (let y = 0; y < H; y++) {
                      let a0 = -1, a1 = -1;
                      for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (px[i + 3] > 128) { if (a0 < 0) a0 = x; a1 = x; const l = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255; n++; sum += l; sq += l * l; } }
                      rows.push(a0 < 0 ? 0 : a1 - a0 + 1);
                      if (a0 >= 0) { if (y0 < 0) y0 = y; y1 = y; x0 = Math.min(x0, a0); x1 = Math.max(x1, a1); }
                    }
                    if (n < 50) bad.push('object: the canvas is empty or fully transparent');
                    else {
                      const bw = x1 - x0 + 1, bh = y1 - y0 + 1, r2 = (v) => Math.round(v * 100) / 100;
                      const maxRow = Math.max(...rows); const shade = Math.sqrt(Math.max(0, sq / n - (sum / n) ** 2));
                      const fill = [r2(bw / W), r2(bh / H)], asp = r2(bw / bh);
                      const prof = (o.profile ? o.profile.at : []).map((t) => r2(rows[Math.min(y1, Math.round(y0 + t * (bh - 1)))] / maxRow));
                      if (spec.__debug) out.push(`info object ${name}: fill ${fill} aspect ${asp} profile ${prof} shade ${r2(shade)}`);
                      if (o.min_fill && (fill[0] < o.min_fill[0] || fill[1] < o.min_fill[1])) bad.push(`object fills ${fill[0]}×${fill[1]} of its box (want ≥ ${o.min_fill[0]}×${o.min_fill[1]}): too small or badly framed`);
                      if (o.aspect && Math.abs(asp - o.aspect) > (o.aspect_tol ?? 0.2)) bad.push(`object silhouette width/height ${asp} (want ${o.aspect} ±${o.aspect_tol ?? 0.2})`);
                      if (o.profile) { const tol = o.profile.tol ?? 0.15; o.profile.width.forEach((want, i) => { if (Math.abs(prof[i] - want) > tol) bad.push(`object silhouette at ${Math.round(o.profile.at[i] * 100)}% of its height is ${prof[i]} of its full width (want ${want} ±${tol})`); }); }
                      if (o.min_shade && shade < o.min_shade) bad.push(`object shading spread ${r2(shade)} (want ≥ ${o.min_shade}): it reads as a flat blob, give it form with material and light`);
                      if (o.no_clip && (x0 === 0 || x1 === W - 1 || y1 === H - 1)) bad.push('object touches the left, right or bottom edge of its canvas: it is cut off');
                    }
                  }
                }
                // Material (docs/dashboards/00-twin-contract.md gate 3) and shape grammar (docs/dashboards/09-image-to-dashboard.md).
                { const cs = getComputedStyle(el); const alpha = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return null; const p = m[1].split(/[,\s/]+/).filter(Boolean); return p.length >= 4 ? parseFloat(p[3]) : 1; };
                  if (b.material === 'clay') { const layers = cs.boxShadow === 'none' ? 0 : cs.boxShadow.split(/,(?![^(]*\))/).length;
                    if (layers < 2) bad.push(`not clay: ${layers} shadow layer(s) (want a soft dark drop shadow plus a light highlight)`);
                    if (parseFloat(cs.borderTopLeftRadius) < 12 && cs.clipPath === 'none') bad.push(`not clay: corner radius ${cs.borderTopLeftRadius} (want ≥ 12px)`); }
                  if (b.material === 'glass') { const blur = +((/blur\(([\d.]+)px\)/.exec(cs.backdropFilter || cs.webkitBackdropFilter || '') || [])[1] || 0);
                    if (blur < 8) bad.push(`not glass: backdrop blur ${blur}px (want ≥ 8px)`);
                    const fill = alpha(cs.backgroundColor); const stops = [...cs.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map((m) => alpha(m[0]));
                    if ((fill != null && fill > 0.62) || (stops.length && Math.min(...stops) > 0.62)) bad.push(`not glass: fill nearly opaque (want alpha ≤ 0.62)`);
                    if (!(/inset/.test(cs.boxShadow) || (parseFloat(cs.borderTopWidth) > 0 && (alpha(cs.borderTopColor) ?? 1) < 1))) bad.push('not glass: no light edge (inset highlight or translucent border)'); }
                  if (b.shape) { const R = el.getBoundingClientRect(); const cut = (e, pseudo) => { const c = getComputedStyle(e, pseudo); return (c.clipPath && c.clipPath !== 'none') || ((c.maskImage || c.webkitMaskImage || 'none') !== 'none'); };
                    const big = (e) => { const r = e.getBoundingClientRect(); return r.width * r.height >= R.width * R.height * 0.4; };
                    const ok = cut(el) || cut(el, '::before') || cut(el, '::after') || [...el.querySelectorAll('*')].some((e) => big(e) && cut(e)) || !!el.querySelector('svg path[data-shape]') || !!el.closest('[data-shape]') && cut(el.closest('[data-shape]'));
                    if (!ok) bad.push(`shape "${b.shape}" missing: no clip-path, mask or svg path[data-shape] on it (a rounded rectangle is not ${b.shape}; use site/dashboards/_shared/shapes.js)`); } }
                if (bad.length) { out.push(`layout ${name}: ${bad.join('; ')}${b.note ? ' — ' + b.note : ''}`); if (b.count) break; }
              }
            }
            return out;
          }, spec);
          errs.push(...lay.map((e) => `[${spec.__label}] ${e} [% of frame width, from the frame's top-left]`));
          errs.push(...(await writeCompare(page, spec, dir)));
        }
        errs.push(...gate);
        // Page style (docs/dashboards/09-image-to-dashboard.md §5): every page keeps the overview's backdrop, nav and card material.
        if (SPEC && SPEC.page_style && variant.id === 'default') {
          errs.push(...(await page.evaluate((ps) => {
            const out = []; const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
            const F = document.querySelector('[data-ref="frame"]'); const bd = document.querySelector('[data-ref="backdrop"]');
            if (!bd || !vis(bd) || (F && bd.getBoundingClientRect().width < F.getBoundingClientRect().width * 0.7)) out.push('page style: the backdrop is missing or hidden on this page (every page sits on the same backdrop)');
            if (ps.nav && ![...document.querySelectorAll(`[data-ref="${ps.nav}"]`)].some(vis)) out.push(`page style: the nav (data-ref="${ps.nav}") is not visible on this page`);
            const cards = [...document.querySelectorAll(ps.card)].filter((el) => vis(el) && el.closest('[data-db-page]:not([hidden])'));
            const alpha = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return 1; const p = m[1].split(/[,\s/]+/).filter(Boolean); return p.length >= 4 ? parseFloat(p[3]) : 1; };
            const good = cards.filter((el) => { const cs = getComputedStyle(el);
              if (ps.material === 'glass') return /blur\(/.test(cs.backdropFilter || cs.webkitBackdropFilter || '') && alpha(cs.backgroundColor) <= 0.62;
              if (ps.material === 'clay') return cs.boxShadow !== 'none' && cs.boxShadow.split(/,(?![^(]*\))/).length >= 2;
              return true; });
            if (good.length < (ps.min || 3)) out.push(`page style: ${good.length} ${ps.material || ''} cards matching "${ps.card}" on this page (want ≥ ${ps.min || 3}; inner pages use the overview's card material, not plain boxes)`);
            if (ps.shapes) { const cut = (e) => { const c = getComputedStyle(e); const b = getComputedStyle(e, '::before'); return [c, b].some((x) => (x.clipPath && x.clipPath !== 'none') || (x.maskImage || x.webkitMaskImage || 'none') !== 'none'); };
              const n = cards.filter(cut).length + document.querySelectorAll('[data-db-page]:not([hidden]) svg path[data-shape]').length;
              if (n < ps.shapes) out.push(`page style: ${n} shaped elements (tab, notch, bridge, organic) on this page (want ≥ ${ps.shapes}; the reference's shape grammar applies to every page)`); }
            // Hero: every page opens with a signature surface from the reference (not only the overview).
            if (ps.hero && ![...document.querySelectorAll(ps.hero)].some((el) => vis(el) && el.closest('[data-db-page]:not([hidden])'))) out.push(`page style: no hero surface ("${ps.hero}") on this page (each page needs one signature element from the reference, not only a grid of cards)`);
            // Covered or clipped text: sample points inside each text box; the topmost element there must be the text itself.
            const root = document.querySelector('[data-db-page]:not([hidden])') || document.querySelector('main') || document.body;
            const bad = [];
            for (const el of root.querySelectorAll('*')) {
              if (bad.length >= 6) break;
              const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
              if (!own.length || !vis(el)) continue;
              const rg = document.createRange(); rg.setStartBefore(own[0]); rg.setEndAfter(own[own.length - 1]); const rs = [...rg.getClientRects()].filter((q) => q.width > 0); const r = rs.length === 1 ? rs[0] : (() => { const t = document.createRange(); t.selectNodeContents(own[0]); return t.getBoundingClientRect(); })();
              if (r.width < 6 || r.height < 6 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
              // Visible window: intersect with every scrolling/clipping ancestor (text scrolled out of a panel is not "covered").
              let vx0 = 0, vy0 = 0, vx1 = innerWidth, vy1 = innerHeight;
              for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) { const c = getComputedStyle(n); if (/(auto|scroll|hidden|clip)/.test(c.overflow + c.overflowY)) { const nr = n.getBoundingClientRect(); vx0 = Math.max(vx0, nr.left); vy0 = Math.max(vy0, nr.top); vx1 = Math.min(vx1, nr.right); vy1 = Math.min(vy1, nr.bottom); } }
              if (r.top < vy0 || r.bottom > vy1) continue;
              let clipAnc = null; for (let n = el; n && n !== document.body; n = n.parentElement) if (getComputedStyle(n).clipPath !== 'none') { clipAnc = n; break; }
              for (const [fx, fy] of [[0.06, 0.5], [0.5, 0.5], [0.94, 0.5], [0.3, 0.2], [0.7, 0.2], [0.5, 0.85]]) {
                const x = r.left + r.width * fx, y = r.top + r.height * fy; if (x < 1 || y < 1 || x > innerWidth - 1 || y > innerHeight - 1) continue;
                const top = document.elementFromPoint(x, y);
                const paints = (t) => { const tr = t.getBoundingClientRect(); if (x < tr.left || x > tr.right || y < tr.top || y > tr.bottom) return false; // only a pseudo-element hit area
                  const c = getComputedStyle(t); if (/^(IMG|SVG|CANVAS|VIDEO|PICTURE)$/i.test(t.tagName) || c.backgroundImage !== 'none') return true;
                  const m = /rgba?\(([^)]+)\)/.exec(c.backgroundColor); const al = m ? (m[1].split(/[,\s/]+/).filter(Boolean)[3] ?? 1) : 0; return +al > 0.05 || [...t.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); };
                const fixed = (t) => { for (let n = t; n && n !== document.body; n = n.parentElement) { const ps = getComputedStyle(n).position; if (ps === 'fixed' || ps === 'sticky') return true; } return false; };
                if (top && clipAnc && (() => { const cr = clipAnc.getBoundingClientRect(); return x > cr.left + 2 && x < cr.right - 2 && y > cr.top + 2 && y < cr.bottom - 2; })() && !clipAnc.contains(top) && top !== el && !el.contains(top) && !top.contains(el) && !fixed(top) && !top.closest('[data-shape]')?.contains(el)) { bad.push(`"${el.textContent.trim().slice(0, 24)}" covered by ${top.tagName.toLowerCase()} or cut off by its card's clip-path`); break; }
                if (top && top !== el && !el.contains(top) && !top.contains(el) && paints(top) && !fixed(top)) { bad.push(`"${el.textContent.trim().slice(0, 24)}" under ${top.tagName.toLowerCase()}${top.className && typeof top.className === 'string' ? '.' + top.className.split(' ')[0] : ''}`); break; }
                if (!top) { bad.push(`"${el.textContent.trim().slice(0, 24)}" clipped`); break; }
              }
            }
            if (bad.length) out.push(`covered or clipped text: ${bad.join('; ')} (text must be fully visible: move it clear of avatars, tabs and clip-path cuts)`);
            return out;
          }, SPEC.page_style)));
        }
        errs.push(...(await textAudit(page)));
        if (!errs.length && variant.id === 'default' && w === 1440) {
          await capture(page, join(pagesDir, `${pg.id}.jpg`));
          // Full-length capture so reviewers see everything below the fold, not just 1440×900.
          await page.screenshot({ path: join(pagesDir, `${pg.id}-full.jpg`), type: 'jpeg', quality: 80, fullPage: true });
        }
        // Strict gates for dashboards with a layout.json (docs/dashboards/00-twin-contract.md): compare sheet, materials, report, nav pages, dead controls.
        if (pg.id === d.pages[0].id && variant.id === 'default' && w === 1440 && isFile(join(site, 'dashboards', d.id, 'layout.json'))) {
          const spec = JSON.parse(readFileSync(join(site, 'dashboards', d.id, 'layout.json'), 'utf8'));
          const sdir = join(site, 'dashboards', d.id); const strict = []; const kept = errs.slice(); // in-page navigation below clears errs (see watch), so keep what was found so far
          const startHash = await page.evaluate(() => { scrollTo(0, 0); return location.hash; });
          // 2. Materials and backdrop.
          strict.push(...(await page.evaluate((spec) => {
            const out = []; const alpha = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return null; const p = m[1].split(/[,\s/]+/).filter(Boolean); return p.length >= 4 ? parseFloat(p[3]) : 1; };
            if (spec.frame && spec.frame.backdrop) {
              const el = document.querySelector('[data-ref="backdrop"]'); const F = document.querySelector('[data-ref="frame"]');
              if (!el) out.push(`backdrop: no element with data-ref="backdrop" — ${spec.frame.backdrop}`);
              else { const cs = getComputedStyle(el); const rich = cs.backgroundImage !== 'none' || el.querySelector('img,canvas,svg'); const r = el.getBoundingClientRect();
                if (!rich) out.push(`backdrop: it is a flat colour — ${spec.frame.backdrop}`);
                if (F && r.width < F.getBoundingClientRect().width * 0.7) out.push('backdrop: it covers less than 70% of the frame width'); }
            }
            return out;
          }, spec)));
          // Design DNA sheet (docs/dashboards/09-image-to-dashboard.md §2), written before code.
          { const dna = join(sdir, 'dna.md');
            if (!isFile(dna)) strict.push(`dna: site/dashboards/${d.id}/dna.md is missing (write the design DNA sheet before code: docs/dashboards/09-image-to-dashboard.md §2)`);
            else { const t = readFileSync(dna, 'utf8'); const miss = ['Backdrop', 'Shape grammar', 'Materials', 'Palette', 'Nav', 'Composition', 'Element inventory'].filter((h) => !new RegExp('^#{2,3}\\s*' + h, 'mi').test(t));
              if (miss.length) strict.push(`dna: dna.md has no section for ${miss.join(', ')}`); } }
          // 3. The recorded report: tools used and every owner requirement answered.
          const reportPath = join(root, 'docs/validation/dashboards', `${d.id}-polish.md`);
          if (!isFile(reportPath)) strict.push(`report: docs/validation/dashboards/${d.id}-polish.md is missing (copy templates/polish-report.md and fill it)`);
          else { const rep = readFileSync(reportPath, 'utf8');
            if (!/Tools used/i.test(rep)) strict.push('report: no "Tools used" table');
            for (const q of spec.requirements || []) if (!rep.includes(q.id)) strict.push(`report: owner requirement ${q.id} is not answered ("${q.text}")`);
            // Review rounds (docs/dashboards/09-image-to-dashboard.md §6): at least 3 rounds against the reference, and a final score ≥ 4 of 5 for every box.
            const rounds = (rep.match(/^#{2,4}\s*Round\s+\d/gim) || []).length;
            if (rounds < 3) strict.push(`report: ${rounds} review round(s) recorded (want ≥ 3 "### Round N" sections, each comparing every box with the reference)`);
            const names = new Set([...Object.keys(spec.boxes || {}), ...(spec.views || []).flatMap((v) => Object.keys(v.boxes || {}))]);
            const low = [], missing = [];
            for (const n of names) { const lines = rep.split('\n').filter((l) => new RegExp('^\\|\\s*`?' + n.replace(/[-]/g, '\\-') + '`?\\s*\\|').test(l));
              if (!lines.length) { missing.push(n); continue; }
              const cells = lines[lines.length - 1].split('|').map((c) => c.trim()).filter(Boolean); const sc = cells.map(Number).filter((v) => !Number.isNaN(v) && v >= 0 && v <= 5).pop();
              if (sc == null) missing.push(n); else if (sc < 4) low.push(`${n} ${sc}`); }
            if (missing.length) strict.push(`report: no fidelity score for ${missing.join(', ')} (a table row "| name | what differs | score |" per box, score 0–5)`);
            if (low.length) strict.push(`report: boxes scored below 4 of 5: ${low.join(', ')} (fix them before the PR)`); }
          // 4. Every nav item opens its own page with its own content.
          if (spec.nav) {
            const sel = `[data-ref="${spec.nav.ref || 'nav'}"] :is(a, button, [role="tab"])`; const n = await page.locator(sel).count(); const seen = new Map();
            if (n < (spec.nav.min_routes || 1)) strict.push(`nav: ${n} items, the reference has ${spec.nav.min_routes}`);
            for (let i = 0; i < n; i++) {
              const el = page.locator(sel).nth(i); if (!(await el.isVisible())) continue;
              const label = ((await el.innerText()) || (await el.getAttribute('aria-label')) || `item ${i + 1}`).trim();
              await el.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(400);
              const st = await page.evaluate(() => { const m = [...document.querySelectorAll('[data-db-page]')].find((e) => !e.hidden && getComputedStyle(e).display !== 'none') || document.querySelector('main') || document.body; return { hash: location.hash, text: m.innerText.replace(/\s+/g, ' ').trim() }; });
              if (seen.has(st.hash)) strict.push(`nav "${label}" opens the same route as "${seen.get(st.hash).label}" (${st.hash}): every nav item needs its own working page`);
              else { if ([...seen.values()].some((v) => v.text === st.text)) strict.push(`nav "${label}" shows the same content as another page`);
                if (st.text.length < 60) strict.push(`nav "${label}" opens a page with almost no content (${st.text.length} characters)`);
                seen.set(st.hash, { label, text: st.text }); }
            }
            await page.evaluate((h) => { location.hash = h; }, startHash); await page.waitForTimeout(500);
          }
          // 5. No dead controls: every visible button on the overview changes something when clicked.
          const dead = await page.evaluate(async (navRef) => {
            const vis = (e) => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return r.width > 4 && r.height > 4 && c.visibility !== 'hidden' && c.display !== 'none' && r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && r.right > 0; };
            const els = [...document.querySelectorAll('button, [role="tab"], [role="button"], a[href]')].filter((e) => vis(e) && !e.disabled && !/^#\//.test(e.getAttribute('href') || '') && !e.closest(`[data-ref="${navRef}"]`)).slice(0, 80);
            const out = [];
            for (const el of els) {
              let changed = false; const mo = new MutationObserver(() => { changed = true; }); mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
              const h = location.hash; el.click(); await new Promise((r) => setTimeout(r, 200)); mo.disconnect();
              if (!changed && location.hash === h) out.push((el.getAttribute('aria-label') || el.textContent || el.className || '').trim().slice(0, 28));
            }
            return out;
          }, (spec.nav && spec.nav.ref) || 'nav');
          if (dead.length) strict.push(`dead controls: clicking does nothing: ${dead.map((x) => `"${x}"`).join(', ')}. Wire each to a visible change, or make it plain text instead of a button`);
          errs.length = 0; errs.push(...kept, ...strict);
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
