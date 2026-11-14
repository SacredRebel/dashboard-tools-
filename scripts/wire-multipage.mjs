#!/usr/bin/env node
/**
 * Wire every gallery dashboard to DB.route using catalog pages.
 * Injects an idempotent bootstrap before dataset.ready in each app.js.
 * Nav hrefs are rewritten at runtime to #/<page-id> when labels match.
 *
 *   node scripts/wire-multipage.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cat = JSON.parse(readFileSync(join(root, 'catalog/dashboards.json'), 'utf8'));
const MARK_START = '/* === DB multipage bootstrap (generated; polish pass replaces stubs) === */';
const MARK_END = '/* === /DB multipage bootstrap === */';

function bootstrapSource(pagesJson) {
  return `${MARK_START}
  (function wirePages() {
    const PAGES = ${pagesJson};
    const main = document.querySelector('main') || document.body;
    let stub = document.querySelector('[data-db-stub]');
    if (!stub) {
      stub = document.createElement('section');
      stub.setAttribute('data-db-stub', '');
      stub.hidden = true;
      stub.setAttribute('aria-live', 'polite');
      main.appendChild(stub);
    }
    function setOverviewVisible(on) {
      [...main.children].forEach((ch) => {
        if (ch === stub) return;
        if (on) {
          ch.hidden = false;
          ch.removeAttribute('data-db-overview-hide');
        } else {
          ch.hidden = true;
          ch.setAttribute('data-db-overview-hide', '');
        }
      });
      stub.hidden = on;
    }
    function renderStub(page) {
      const rows = [
        ['Status', 'Sample · ready'],
        ['Records', '24'],
        ['Updated', 'Today'],
      ];
      stub.innerHTML = '<h1>' + page.name + '</h1>'
        + '<p class="db-sample">Sample data · fictional</p>'
        + '<p>This page is part of the multi-page shell. The polish pass fills it with real ' + page.name.toLowerCase() + ' UI in the same design language as Overview.</p>'
        + '<div class="db-stub-panel" role="list">'
        + rows.map(([k, v]) => '<div class="db-stub-row" role="listitem"><span>' + k + '</span><strong class="num">' + v + '</strong></div>').join('')
        + '</div>';
    }
    document.querySelectorAll('a[href]').forEach((a) => {
      const label = (a.textContent || '').replace(/\\s+/g, ' ').trim().toLowerCase();
      if (!label) return;
      const hit = PAGES.find((p) => p.name.toLowerCase() === label || p.id === label
        || (label === 'home' && p.id === 'overview')
        || (label === 'dashboard' && p.id === 'overview'));
      if (hit) a.setAttribute('href', '#/' + hit.id);
    });
    if (!window.DB || typeof window.DB.route !== 'function') {
      console.error('DB.route missing — is ../_shared/frame.js loaded before app.js?');
      return;
    }
    window.DB.route(PAGES, (id, page) => {
      if (id === PAGES[0].id) setOverviewVisible(true);
      else { setOverviewVisible(false); renderStub(page); }
    });
  })();
${MARK_END}`;
}

function stripOldBootstrap(app) {
  const start = app.indexOf(MARK_START);
  if (start < 0) return app;
  const end = app.indexOf(MARK_END, start);
  if (end < 0) throw new Error('bootstrap start without end');
  return app.slice(0, start) + app.slice(end + MARK_END.length);
}

let n = 0;
for (const d of cat.dashboards) {
  const appPath = join(root, 'site/dashboards', d.id, 'app.js');
  let app = stripOldBootstrap(readFileSync(appPath, 'utf8'));
  const readyRe = /([ \t]*)document\.documentElement\.dataset\.ready\s*=\s*'true'[^;]*;/;
  if (!readyRe.test(app)) throw new Error(`${d.id}: dataset.ready line not found`);
  const boot = bootstrapSource(JSON.stringify(d.pages));
  app = app.replace(readyRe, (m, ind) => `${boot}\n${ind}${m.trim()}`);
  writeFileSync(appPath, app);
  n++;
}
console.log(`✔ wired DB.route into ${n} dashboards`);
