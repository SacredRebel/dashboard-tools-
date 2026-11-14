#!/usr/bin/env node
/**
 * Screenshot pages of a site at phone (375) and desktop (1280) widths and report console errors.
 * Usage: node scripts/screenshot.mjs [baseUrl] [outDir]
 *   baseUrl defaults to file://<repo>/site/index.html
 * Requires Playwright (preinstalled in Claude cloud sessions; otherwise `npm i -D playwright`).
 * Reuse this pattern in client projects to check every slice before showing it.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

let chromium;
try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = createRequire(import.meta.url)('playwright')); }

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] || pathToFileURL(join(root, 'site/index.html')).href;
const out = process.argv[3] || join(root, 'screenshots');
mkdirSync(out, { recursive: true });
const routes = ['', 'framework', 'tools', 'themes', 'showcase', 'calendars', 'components', 'demo', 'fx', 'docs/AGENTS.md', 'docs/docs/calendars/catalog.md', 'dashboards', 'dashboards/horizon-weather', 'docs/docs/dashboards/catalog.md'];
const widths = [375, 1280];

const browser = await chromium.launch();
let problems = 0;
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  page.on('pageerror', (e) => { problems++; console.error(`[${w}] page error:`, e.message); });
  page.on('console', (m) => { if (m.type() === 'error') { problems++; console.error(`[${w}] console:`, m.text()); } });
  for (const r of routes) {
    await page.goto(base + '#/' + r);
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) { problems++; console.error(`[${w}] #/${r}: horizontal overflow ${overflow}px`); }
    const file = join(out, `${(r || 'home').replace(/[^\w]+/g, '-')}-${w}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log('✔', file);
  }
  await page.close();
}
await browser.close();
if (problems) { console.error(`✖ ${problems} problem(s)`); process.exit(1); }
console.log('✔ no console errors, no horizontal overflow');
