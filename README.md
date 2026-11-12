# Dashboard Tools

**A toolkit, design system and step-by-step playbook for building beautiful, functional dashboards with AI.** CRM first, but the framework works for any dashboard.

Point any capable AI agent (Claude, or another LLM with repo access) at this repository and it has everything it needs: which skills and tools to use and when, the design rules that make a dashboard feel premium, six ready themes, reference components, a CRM blueprint, and a phase-by-phase process with human approval gates.

> **AI agent?** Read [AGENTS.md](AGENTS.md) first. It is your operating manual.

---

## What's inside

| | What | Where |
|---|---|---|
| 🧭 | **Framework**: 8 phases (Discover → Define → Direction → Design → Build → Polish → Ship → Handover), each with steps, tools and a gate | [docs/framework/](docs/framework/00-overview.md) |
| 🧰 | **Tool catalog**: 171 curated skills, connectors, agents and libraries with *use when / avoid when / how / pairs with / fallback* | [catalog/tools.json](catalog/tools.json) · [docs/tools/](docs/tools/README.md) |
| 📋 | **Full inventory**: all 499 installed skills across 40 plugins, rated for relevance | [catalog/inventory.json](catalog/inventory.json) |
| 📐 | **Design rulebook**: hard rules for patterns, surfaces, color, type, spacing, motion, states, forms, copy, accessibility, responsive | [docs/design/02-rulebook.md](docs/design/02-rulebook.md) |
| 🎨 | **Design system**: tokens + 6 themes (Atelier, Linen, Coastal, Blush, Noir, Midnight), Tailwind/shadcn mapping | [design-system/](design-system/README.md) |
| 🗂 | **CRM blueprint**: data model + SQL, pipeline stages, views, feature menu | [docs/crm/](docs/crm/data-model.md) |
| 🏗 | **Stack & workflow**: Next.js + Tailwind + shadcn/ui + Supabase on GitHub + Vercel | [docs/stack/](docs/stack/01-recommended-stack.md) |
| 📝 | **Templates**: discovery questions, spec, design direction, UX profile, QA checklist, client handover guide | [templates/](templates/) |
| 💬 | **Prompts**: copy-paste prompts for every phase | [prompts/README.md](prompts/README.md) |
| 🖥 | **Showcase site**: browse tools, compare themes, inspect components, use a live demo CRM | [site/](site/index.html) |

## Quick start

### Use it to build a dashboard

1. Open your AI agent with this repo available (for example Claude Code on the web with this repo attached, or clone it into your project as `toolkit/`).
2. Paste the kickoff prompt:

```
You are building a dashboard for <client>. Use this toolkit repo as your playbook:
1. Read AGENTS.md fully, then docs/framework/00-overview.md.
2. Tell me which phase we're in and which core tools you'll use (from catalog/tools.json).
3. Follow the phase doc step by step. Stop at each gate and show me the artifact.
Inputs I have: <voice memo transcript / meeting notes / playbook / screenshots>.
```

3. Approve each gate. More prompts: [prompts/README.md](prompts/README.md).

### View the showcase site locally

No build tools needed:

```bash
npx serve site
```

Or open `site/index.html` directly in a browser.

### Deploy the showcase on Vercel

Import this repo in Vercel. `vercel.json` already sets the build (`node scripts/build.mjs`) and output (`site/`). Every push redeploys.

### Change the catalog or themes

```bash
# edit catalog/tools.json, design-system/tokens.css or any doc, then:
node scripts/build.mjs
```

The script validates the catalog (ids, links, fallback files, themes) and regenerates `docs/tools/` and `site/data/`.

## How an agent uses this repo

```
AGENTS.md ──▶ which phase am I in? ──▶ docs/framework/0N-phase.md (steps + gate)
                     │
                     ▼
        catalog/tools.json filtered by phase
        core → always · recommended → usually · situational → if use_when matches
                     │
         skill installed? ── yes ──▶ invoke it
                     │
                     no ──▶ read its `fallback` doc (the method is distilled here)
                     │
                     ▼
        build with design-system/tokens.css, follow docs/design/02-rulebook.md,
        check against templates/qa-checklist.md, ship via GitHub → Vercel
```

## Principles

1. **One job per screen.** Every page has a named pattern.
2. **Glance, then act.** The most decision-relevant info top-left; actions one click away.
3. **Grounded, not generic.** Palette, type and words come from the client's world.
4. **Restraint is the luxury.** One accent, neutrals, hairlines, two typefaces, one signature detail.
5. **Every state is designed.** Empty, loading, error, one record, a thousand.
6. **Calm motion that explains change.** 100–300 ms, transform/opacity, reduced-motion respected.
7. **Works for everyone.** 375px to 1280px, keyboard, screen readers, AA contrast.

## Repository map

```
AGENTS.md  CLAUDE.md  README.md
catalog/          tools.json · inventory.json
docs/framework/   00-overview … 08-handover
docs/design/      principles · rulebook · page patterns · data viz · anti-patterns · themes
docs/crm/         data model · pipeline & views · features
docs/stack/       stack · data & auth · GitHub + Vercel · tokens → Tailwind
docs/tools/       generated per-category tool guides
design-system/    tokens.css · themes.json · tailwind.preset.js
templates/        discovery · spec · design direction · ux-profile · QA · handover
prompts/          phase prompts
site/             showcase (static HTML/CSS/JS, no framework)
scripts/          build.mjs · screenshot.mjs
```

## Notes

- Skill descriptions in the catalog are written in our own words; the skills themselves belong to their respective plugin authors. Install the plugins from your Claude plugin directory for the full experience. Every core entry has a fallback doc, so nothing breaks without them.
- All names and numbers in demos are fictional sample data.

License: MIT (see [LICENSE](LICENSE)).
