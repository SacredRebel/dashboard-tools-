#!/usr/bin/env node
/**
 * dashboards-check.mjs: render every gallery dashboard, check it, and write its thumbnail + evidence.
 *
 *   node scripts/dashboards-check.mjs              # all dashboards in catalog/dashboards.json
 *   node scripts/dashboards-check.mjs horizon-weather other-id   # only these
 *
 * For each dashboard:
 *   - loads site/dashboards/<id>/index.html at 1440×900 and 375×812, and every variant at 1440×900
 *   - fails on console errors, page errors, failed local requests or horizontal page overflow
 *   - writes site/dashboards/<id>/thumb.jpg (1440×900 viewport, rendered at 720×450, default variant)
 *   - writes docs/validation/dashboards/<id>.json (evidence)
 * Exit code 1 if any dashboard has a problem. Requires Playwright (preinstalled in Claude cloud
 * sessions; elsewhere: npm i -D playwright && npx playwright install chromium).
 */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

let chromium;
try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = createRequire(import.meta.url)('playwright')); }

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cat = JSON.parse(readFileSync(join(root, 'catalog/dashboards.json'), 'utf8'));
const only = process.argv.slice(2);
const list = cat.dashboards.filter((d) => !only.length || only.includes(d.id));
if (!list.length) { console.error('No matching dashboards.'); process.exit(1); }
mkdirSync(join(root, 'docs/validation/dashboards'), { recursive: true });

const browser = await chromium.launch();
let failed = 0;
for (const d of list) {
  const dir = join(root, 'site/dashboards', d.id);
  const file = join(dir, 'index.html');
  const problems = [];
  const runs = [];
  if (!existsSync(file)) { console.error(`✖ ${d.id}: ${file} missing`); failed++; continue; }
  const shots = [[1440, 900, 'default'], [375, 812, 'default'], ...d.variants.filter((v) => v.id !== 'default').map((v) => [1440, 900, v.id])];
  for (const [w, h, variant] of shots) {
    const thumb = w === 1440 && variant === 'default';
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: thumb ? 0.5 : 1 });
    const errs = [];
    page.on('pageerror', (e) => errs.push('page error: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    page.on('requestfailed', (r) => { if (r.url().startsWith('file:')) errs.push('missing file: ' + r.url()); });
    const url = pathToFileURL(file).href + (variant === 'default' ? '' : `?variant=${variant}`);
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) errs.push(`horizontal overflow ${overflow}px`);
    if (thumb) await page.screenshot({ path: join(dir, 'thumb.jpg'), type: 'jpeg', quality: 82 });
    runs.push({ width: w, variant, overflow_px: overflow, errors: errs });
    problems.push(...errs.map((e) => `[${w} ${variant}] ${e}`));
    await page.close();
  }
  writeFileSync(join(root, 'docs/validation/dashboards', `${d.id}.json`), JSON.stringify({ id: d.id, checked: new Date().toISOString().slice(0, 10), ok: !problems.length, runs }, null, 2) + '\n');
  if (problems.length) { failed++; console.error(`✖ ${d.id}\n  ${problems.join('\n  ')}`); }
  else console.log(`✔ ${d.id}: ${runs.length} renders clean · thumb.jpg written`);
}
await browser.close();
if (failed) { console.error(`✖ ${failed} dashboard(s) failed`); process.exit(1); }
