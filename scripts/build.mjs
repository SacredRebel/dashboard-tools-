#!/usr/bin/env node
/**
 * build.mjs: validate the catalog and regenerate derived files.
 *
 *   node scripts/build.mjs
 *
 * Reads   catalog/tools.json, catalog/calendars.json, catalog/dashboards.json, catalog/inventory.json, design-system/themes.json, docs, templates
 * Writes  docs/tools/*.md, docs/calendars/catalog.md, docs/dashboards/catalog.md, site/data/data.js, site/assets/tokens.css
 * Exits 1 if the catalog is invalid (duplicate ids, broken pairs_with, missing fallback files…).
 * No dependencies: plain Node >= 18.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rd = (p) => readFileSync(join(root, p), 'utf8');
const json = (p) => JSON.parse(rd(p));
const errors = [];

// ---------------------------------------------------------------- validate
const catalog = json('catalog/tools.json');
const inventory = json('catalog/inventory.json');
const themes = json('design-system/themes.json');

const catIds = new Set(catalog.categories.map((c) => c.id));
const phaseIds = new Set(catalog.phases.map((p) => p.id));
const tierIds = new Set(catalog.tiers.map((t) => t.id));
const kindIds = new Set(catalog.kinds.map((k) => k.id));
const ids = new Set();

for (const t of catalog.tools) {
  const where = `tool "${t.id}"`;
  if (!/^[a-z0-9-]+$/.test(t.id)) errors.push(`${where}: id must be kebab-case`);
  if (ids.has(t.id)) errors.push(`${where}: duplicate id`);
  ids.add(t.id);
  for (const k of ['name', 'invoke', 'kind', 'category', 'tier', 'summary']) if (!t[k]) errors.push(`${where}: missing ${k}`);
  if (!catIds.has(t.category)) errors.push(`${where}: unknown category ${t.category}`);
  if (!tierIds.has(t.tier)) errors.push(`${where}: unknown tier ${t.tier}`);
  if (!kindIds.has(t.kind)) errors.push(`${where}: unknown kind ${t.kind}`);
  for (const p of t.phases || []) if (!phaseIds.has(p)) errors.push(`${where}: unknown phase ${p}`);
  if (!t.use_when?.length) errors.push(`${where}: use_when is empty`);
  if (t.fallback && !existsSync(join(root, t.fallback.split('#')[0]))) errors.push(`${where}: fallback file not found ${t.fallback}`);
}
for (const t of catalog.tools) for (const p of t.pairs_with || []) if (!ids.has(p)) errors.push(`tool "${t.id}": pairs_with unknown id ${p}`);

// calendars.json: repos, styles, approaches
const cal = json('catalog/calendars.json');
const calSets = Object.fromEntries(['licenses', 'statuses', 'platforms', 'categories', 'styles', 'approaches', 'repos'].map((k) => [k, new Set(cal[k].map((x) => x.id))]));
const calIds = new Set();
for (const r of cal.repos) {
  const where = `calendar repo "${r.id}"`;
  if (calIds.has(r.id)) errors.push(`${where}: duplicate id`);
  calIds.add(r.id);
  for (const k of ['name', 'repo', 'category', 'license', 'license_class', 'status', 'summary']) if (!r[k]) errors.push(`${where}: missing ${k}`);
  if (!calSets.categories.has(r.category)) errors.push(`${where}: unknown category ${r.category}`);
  if (!calSets.licenses.has(r.license_class)) errors.push(`${where}: unknown license_class ${r.license_class}`);
  if (!calSets.statuses.has(r.status)) errors.push(`${where}: unknown status ${r.status}`);
  for (const p of r.platforms || []) if (!calSets.platforms.has(p)) errors.push(`${where}: unknown platform ${p}`);
  for (const st of r.styles || []) if (!calSets.styles.has(st)) errors.push(`${where}: unknown style ${st}`);
  if (!r.use_when?.length || !r.avoid_when?.length || !r.integrate?.length) errors.push(`${where}: use_when, avoid_when and integrate are required`);
  if (r.tool_id && !ids.has(r.tool_id)) errors.push(`${where}: tool_id ${r.tool_id} not in tools.json`);
}
for (const a of cal.approaches) for (const p of a.picks) if (!calSets.repos.has(p)) errors.push(`calendar approach "${a.id}": unknown pick ${p}`);

// dashboards.json: gallery dashboards
const dash = json('catalog/dashboards.json');
{
  const fam = new Set(dash.style_families.map((x) => x.id)), uc = new Set(dash.use_cases.map((x) => x.id));
  const seen = new Set(), nums = new Set();
  for (const d of dash.dashboards) {
    const where = `dashboard "${d.id}"`;
    if (!/^[a-z0-9-]+$/.test(d.id)) errors.push(`${where}: id must be kebab-case`);
    if (seen.has(d.id)) errors.push(`${where}: duplicate id`); seen.add(d.id);
    if (nums.has(d.number)) errors.push(`${where}: duplicate number ${d.number}`); nums.add(d.number);
    for (const k of ['name', 'style_family', 'mode', 'status', 'summary', 'signature', 'path']) if (!d[k]) errors.push(`${where}: missing ${k}`);
    if (!fam.has(d.style_family)) errors.push(`${where}: unknown style_family ${d.style_family}`);
    if (!['dark', 'light'].includes(d.mode)) errors.push(`${where}: mode must be dark or light`);
    if (!['ready', 'draft'].includes(d.status)) errors.push(`${where}: status must be ready or draft`);
    if (!d.use_cases?.length) errors.push(`${where}: use_cases is empty`);
    for (const u of d.use_cases || []) if (!uc.has(u)) errors.push(`${where}: unknown use_case ${u}`);
    for (const k of ['best_for', 'avoid_when', 'components', 'mood']) if (!d[k]?.length) errors.push(`${where}: ${k} is empty`);
    for (const k of ['pattern', 'structure', 'responsive']) if (!d.layout?.[k]) errors.push(`${where}: layout.${k} missing`);
    for (const k of ['bg', 'surface', 'text', 'muted', 'accent']) if (!/^#[0-9a-f]{6}$/i.test(d.palette?.[k] || '')) errors.push(`${where}: palette.${k} must be a #rrggbb hex`);
    if (!d.fonts?.display || !d.fonts?.sans) errors.push(`${where}: fonts.display and fonts.sans required`);
    if (!d.variants?.length || d.variants[0].id !== 'default') errors.push(`${where}: variants must start with {"id":"default"}`);
    if (d.maps_to_theme && !themes.themes.some((t) => t.id === d.maps_to_theme)) errors.push(`${where}: maps_to_theme ${d.maps_to_theme} is not a toolkit theme`);
    if (d.path !== `site/dashboards/${d.id}/`) errors.push(`${where}: path must be site/dashboards/${d.id}/`);
    for (const f of ['index.html', 'style.css', 'thumb.jpg', 'shot.jpg']) if (!existsSync(join(root, d.path, f))) errors.push(`${where}: ${d.path}${f} missing${f === 'thumb.jpg' || f === 'shot.jpg' ? ' (run node scripts/dashboards-check.mjs ' + d.id + ')' : ''}`);
    if (d.reference) {
      if (!/^reference\.(jpe?g|png|webp)$/i.test(d.reference)) errors.push(`${where}: reference must be reference.jpg|jpeg|png|webp (got ${d.reference})`);
      else if (!existsSync(join(root, d.path, d.reference))) errors.push(`${where}: ${d.path}${d.reference} missing`);
    }
    if (existsSync(join(root, d.path, 'style.css'))) {
      const css = rd(d.path + 'style.css');
      for (const v of (d.variants || []).slice(1)) if (!css.includes(`[data-variant="${v.id}"]`)) errors.push(`${where}: style.css has no [data-variant="${v.id}"] block`);
      for (const t of ['--bg', '--surface', '--text', '--text-muted', '--accent', '--font-sans']) if (!css.includes(t + ':')) errors.push(`${where}: style.css must define ${t}`);
    }
    if (existsSync(join(root, d.path, 'index.html'))) {
      const html = rd(d.path + 'index.html');
      for (const need of ['../_shared/base.css', '../_shared/frame.js', 'style.css', 'name="viewport"']) if (!html.includes(need)) errors.push(`${where}: index.html must include ${need}`);
      const guardAt = html.indexOf("location.replace(location.pathname + '/'"), firstLink = html.search(/<link|<script src/);
      if (guardAt < 0 || (firstLink >= 0 && guardAt > firstLink)) errors.push(`${where}: index.html needs the URL guard script before any <link>/<script src> (copy it from horizon-weather; see docs/dashboards/01-add-a-dashboard.md "URL guard")`);
      if (/(href|src)="\/(?!\/)/.test(html)) errors.push(`${where}: index.html uses root-absolute paths (href="/…"); use relative paths like style.css and ../_shared/`);
    }
    if (existsSync(join(root, d.path, 'app.js'))) {
      if (!rd(d.path + 'app.js').includes("dataset.ready = 'true'")) errors.push(`${where}: app.js must end with document.documentElement.dataset.ready = 'true'`);
    }
  }
}

const themeCss = rd('design-system/tokens.css');
for (const th of themes.themes) {
  if (!themeCss.includes(`[data-theme="${th.id}"]`)) errors.push(`theme "${th.id}" missing in tokens.css`);
}

if (errors.length) {
  console.error('✖ Catalog validation failed:\n  ' + errors.join('\n  '));
  process.exit(1);
}

// ---------------------------------------------------------------- docs/tools
mkdirSync(join(root, 'docs/tools'), { recursive: true });
const phaseName = Object.fromEntries(catalog.phases.map((p) => [p.id, p.name]));
const byCat = (c) => catalog.tools.filter((t) => t.category === c).sort((a, b) => tierRank(a) - tierRank(b) || a.name.localeCompare(b.name));
function tierRank(t) { return ['core', 'recommended', 'optional', 'situational'].indexOf(t.tier); }
const rel = (p) => '../../' + p; // from docs/tools/ to repo root

const header = '<!-- GENERATED by scripts/build.mjs from catalog/tools.json. Do not edit by hand. -->\n\n';
let index = header + '# Tools by category\n\n';
index += `${catalog.tools.length} curated tools in ${catalog.categories.length} categories. Source of truth: [catalog/tools.json](../../catalog/tools.json). Visual browser: showcase site → Tools.\n\n`;
index += '**Tiers:** ' + catalog.tiers.map((t) => `\`${t.id}\` ${t.meaning}`).join(' · ') + '\n\n';
index += '| Category | Tools | Core | What it covers |\n|---|---|---|---|\n';
for (const c of catalog.categories) {
  const list = byCat(c.id);
  index += `| [${c.name}](${c.id}.md) | ${list.length} | ${list.filter((t) => t.tier === 'core').length} | ${c.blurb} |\n`;
}
index += '\n## By phase (core + recommended)\n\n';
for (const p of catalog.phases) {
  const list = catalog.tools.filter((t) => t.phases.includes(p.id) && (t.tier === 'core' || t.tier === 'recommended'));
  index += `**${p.n}. ${p.name}**: ` + list.map((t) => `[${t.name}](${t.category}.md#${t.id})`).join(' · ') + '\n\n';
}
writeFileSync(join(root, 'docs/tools/README.md'), index);

for (const c of catalog.categories) {
  let md = header + `# ${c.name}\n\n${c.blurb}\n\n[← All categories](README.md)\n\n`;
  for (const t of byCat(c.id)) {
    md += `<a id="${t.id}"></a>\n### ${t.name}\n\n`;
    md += `\`${t.invoke}\` · ${t.kind} · **${t.tier}** · phases: ${t.phases.map((p) => phaseName[p]).join(', ')}\n\n`;
    md += `${t.summary}\n\n`;
    if (t.use_when?.length) md += `**Use when**\n${t.use_when.map((x) => `- ${x}`).join('\n')}\n\n`;
    if (t.avoid_when?.length) md += `**Avoid when**\n${t.avoid_when.map((x) => `- ${x}`).join('\n')}\n\n`;
    if (t.how_to_use?.length) md += `**How to use**\n${t.how_to_use.map((x) => `- ${x}`).join('\n')}\n\n`;
    if (t.pairs_with?.length) md += `**Pairs with:** ${t.pairs_with.map((p) => { const o = catalog.tools.find((x) => x.id === p); return `[${o.name}](${o.category}.md#${p})`; }).join(' · ')}\n\n`;
    if (t.fallback) md += `**If not installed:** follow [${t.fallback}](${rel(t.fallback)})\n\n`;
    if (t.requires) md += `**Requires:** ${t.requires}\n\n`;
    if (t.url) md += `**Docs:** ${t.url}\n\n`;
    md += '---\n\n';
  }
  writeFileSync(join(root, `docs/tools/${c.id}.md`), md);
}

// ---------------------------------------------------------------- docs/calendars/catalog.md
{
  const lic = Object.fromEntries(cal.licenses.map((l) => [l.id, l]));
  const plat = Object.fromEntries(cal.platforms.map((p) => [p.id, p.name]));
  const sty = Object.fromEntries(cal.styles.map((p) => [p.id, p.name]));
  let md = header.replace('catalog/tools.json', 'catalog/calendars.json') + `# Calendar repo catalog\n\n${cal.repos.length} repos and APIs, ${cal.styles.length} styles, ${cal.approaches.length} approaches. Source: [catalog/calendars.json](../../catalog/calendars.json) (snapshot ${cal.snapshot_date}). Start with the [hub](README.md) to choose an approach.\n\n`;
  md += '## Approaches\n\n| Approach | Use when | Not when | Picks |\n|---|---|---|---|\n';
  for (const a of cal.approaches) md += `| **${a.name}** | ${a.when} | ${a.not_when} | ${a.picks.map((p) => `[${cal.repos.find((r) => r.id === p).name}](#${p})`).join(', ')} |\n`;
  md += '\n## At a glance\n\n| Repo | Category | Platforms | License | Status |\n|---|---|---|---|---|\n';
  for (const r of cal.repos) md += `| [${r.name}](#${r.id}) | ${cal.categories.find((c) => c.id === r.category).name} | ${r.platforms.map((p) => plat[p]).join(', ')} | ${r.license} (${lic[r.license_class].name}) | ${r.status} |\n`;
  for (const c of cal.categories) {
    md += `\n## ${c.name}\n\n${c.blurb}\n\n`;
    for (const r of cal.repos.filter((x) => x.category === c.id)) {
      md += `<a id="${r.id}"></a>\n### ${r.name}\n\n${r.repo} · ${r.language} · **${r.license}** (${lic[r.license_class].name}: ${lic[r.license_class].meaning}) · ${r.status}${r.last_commit ? ` (last commit ${r.last_commit})` : ''}${r.source === 'added' ? ' · added by the toolkit' : ''}\n\n${r.summary}\n\n`;
      if (r.styles.length) md += `**Styles:** ${r.styles.map((s) => sty[s]).join(', ')}\n\n`;
      md += `**Use when**\n${r.use_when.map((x) => `- ${x}`).join('\n')}\n\n**Avoid when**\n${r.avoid_when.map((x) => `- ${x}`).join('\n')}\n\n**How to integrate**\n${r.integrate.map((x) => `1. ${x}`).join('\n')}\n\n**Lesson:** ${r.learn_from}\n\n`;
      if (r.tool_id) md += `**Catalog entry:** [${r.tool_id}](../tools/calendar.md#${r.tool_id})\n\n`;
      md += '---\n\n';
    }
  }
  md += '## Styles\n\n';
  for (const s2 of cal.styles) md += `### ${s2.name}\n\n${s2.summary} Pattern: ${s2.pattern}.\n\n- **Use when:** ${s2.use_when.join('; ')}\n- **Avoid when:** ${s2.avoid_when.join('; ')}\n- **Rules:** ${s2.rules.join('; ')}\n- **Repos:** ${cal.repos.filter((r) => r.styles.includes(s2.id)).map((r) => `[${r.name}](#${r.id})`).join(', ')}\n\n`;
  mkdirSync(join(root, 'docs/calendars'), { recursive: true });
  writeFileSync(join(root, 'docs/calendars/catalog.md'), md);
}

// ---------------------------------------------------------------- docs/dashboards/catalog.md
{
  const famName = Object.fromEntries(dash.style_families.map((f) => [f.id, f.name]));
  const ucName = Object.fromEntries(dash.use_cases.map((u) => [u.id, u.name]));
  let md = header.replace('catalog/tools.json', 'catalog/dashboards.json') + `# Dashboard gallery catalog\n\n${dash.dashboards.length} dashboards in ${dash.style_families.length} style families. Source: [catalog/dashboards.json](../../catalog/dashboards.json). How to choose and how to add: [README](README.md).\n\n`;
  md += '| # | Dashboard | Style | Use cases | Mode | Variants | Folder |\n|---|---|---|---|---|---|---|\n';
  for (const d of [...dash.dashboards].sort((a, b) => a.number - b.number)) md += `| ${d.number} | [${d.name}](#${d.id}) | ${famName[d.style_family]} | ${d.use_cases.map((u) => ucName[u]).join(', ')} | ${d.mode} | ${d.variants.map((v) => v.name).join(', ')} | [${d.path}](../../${d.path}) |\n`;
  for (const f of dash.style_families) {
    const list = dash.dashboards.filter((d) => d.style_family === f.id);
    md += `\n## ${f.name}\n\n${f.blurb}\n\n${list.length ? '' : '_No dashboards yet._\n\n'}`;
    for (const d of list) {
      const heroImg = d.reference ? `${d.path}${d.reference}` : `${d.path}shot.jpg`;
      const heroCap = d.reference
        ? `_${d.name} · original owner reference (\`${d.reference}\`; recreation \`shot.jpg\`, card \`thumb.jpg\`)._`
        : `_${d.name} · 1440×900 recreation screenshot (also \`thumb.jpg\` for cards)._`;
      md += `<a id="${d.id}"></a>\n### ${d.number}. ${d.name}\n\n![${d.name} ${d.reference ? 'original reference' : 'recreation shot'}](../../${heroImg})\n\n${heroCap}\n\n${d.summary}\n\n`;
      md += `- **Use cases:** ${d.use_cases.map((u) => ucName[u]).join(', ')} · **Mode:** ${d.mode} · **Mood:** ${d.mood.join(', ')}\n- **Signature:** ${d.signature}\n- **Layout:** ${d.layout.structure}\n- **Responsive:** ${d.layout.responsive}\n- **Fonts:** ${d.fonts.display} / ${d.fonts.sans} · **Palette:** ${Object.entries(d.palette).map(([k, v]) => `${k} \`${v}\``).join(', ')}\n- **Variants:** ${d.variants.map((v) => v.name).join(', ')}${d.maps_to_theme ? ` · **Closest toolkit theme:** \`${d.maps_to_theme}\`` : ''}\n\n`;
      md += `**Best for**\n${d.best_for.map((x) => `- ${x}`).join('\n')}\n\n**Avoid when**\n${d.avoid_when.map((x) => `- ${x}`).join('\n')}\n\n**Components:** ${d.components.join(' · ')}\n\n---\n\n`;
    }
  }
  mkdirSync(join(root, 'docs/dashboards'), { recursive: true });
  writeFileSync(join(root, 'docs/dashboards/catalog.md'), md);
}

// ---------------------------------------------------------------- docs bundle for the site
const docGroups = [
  ['Start', ['README.md', 'AGENTS.md', 'prompts/README.md']],
  ['Framework', listDir('docs/framework')],
  ['Design', [...listDir('docs/design'), 'design-system/README.md']],
  ['CRM', listDir('docs/crm')],
  ['Dashboards', ['docs/dashboards/README.md', ...listDir('docs/dashboards').filter((f) => !f.endsWith('README.md'))]],
  ['Calendars', ['docs/calendars/README.md', ...listDir('docs/calendars').filter((f) => !f.endsWith('README.md'))]],
  ['Stack', listDir('docs/stack')],
  ['Templates', listDir('templates')],
  ['Tools', ['docs/tools/README.md', ...catalog.categories.map((c) => `docs/tools/${c.id}.md`)]],
];
function listDir(d) {
  return readdirSync(join(root, d)).filter((f) => f.endsWith('.md')).sort().map((f) => `${d}/${f}`);
}
const docs = [];
for (const [group, files] of docGroups) {
  for (const path of files) {
    const md = rd(path);
    const title = (md.match(/^#\s+(.+)$/m) || [, path])[1].replace(/`/g, '');
    docs.push({ group, path, title, md });
  }
}

// ---------------------------------------------------------------- site data
mkdirSync(join(root, 'site/data'), { recursive: true });
const inv = {
  total: inventory.total,
  snapshot_date: inventory.snapshot_date,
  plugins: inventory.plugins.map((p) => ({ plugin: p.plugin, relevance: p.relevance, note: p.note, count: p.count, skills: p.skills })),
};
const banner = '/* GENERATED by scripts/build.mjs. Do not edit. */\n';
writeFileSync(
  join(root, 'site/data/data.js'),
  banner +
    `window.CATALOG=${JSON.stringify(catalog)};\n` +
    `window.THEMES=${JSON.stringify(themes)};\n` +
    `window.CALENDARS=${JSON.stringify(cal)};\n` +
    `window.DASHBOARDS=${JSON.stringify(dash)};\n` +
    `window.INVENTORY=${JSON.stringify(inv)};\n` +
    `window.DOCS=${JSON.stringify(docs)};\n`,
);
mkdirSync(join(root, 'site/assets'), { recursive: true });
copyFileSync(join(root, 'design-system/tokens.css'), join(root, 'site/assets/tokens.css'));

console.log(`✔ ${catalog.tools.length} tools · ${catalog.categories.length} categories · ${cal.repos.length} calendar repos · ${dash.dashboards.length} gallery dashboards · ${themes.themes.length} themes · ${docs.length} docs · ${inv.total} inventoried skills`);
