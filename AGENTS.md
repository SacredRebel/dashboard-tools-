# AGENTS.md: Operating manual for AI agents

You are an AI agent asked to **design and build a dashboard** (for example a CRM). This repository is your toolkit and your playbook. Read this file completely before doing anything else. It tells you what to read next, in what order, and which tools to use at each step.

> Humans: start at [README.md](README.md). This file is written for agents, but it is plain English and works as a checklist for people too.

---

## 0. Ground rules (always on)

1. **Follow the phases in order.** Discover → Define → Direction → Design → Build → Polish → Ship → Handover. Each phase ends with a **gate**: a concrete output the human approves. Do not start a phase before the previous gate passes. Small changes to an existing project can enter at Build. See §3.
2. **Function first, then beauty, then polish.** A beautiful dashboard that does the wrong job has failed. A working dashboard that looks generic is unfinished.
3. **The rulebook is law.** [docs/design/02-rulebook.md](docs/design/02-rulebook.md) has hard rules (spacing, type, color, motion, states, surfaces, responsive, copy). Break one only when the human explicitly asks, and note it in the project's decision log.
4. **Use tokens, never raw values.** Colors, spacing, radius, shadows, fonts and durations come from [design-system/tokens.css](design-system/tokens.css) (or the project's copy of it). A hard-coded `#3b82f6` or `13px` is a bug.
5. **Every screen has a named page pattern** (List, Detail, Board, Dashboard, Form, Settings…). Name it before writing its markup. See [docs/design/03-page-patterns.md](docs/design/03-page-patterns.md).
6. **Every data view has four states:** loading, empty, error and populated. Design all four.
7. **Evidence before claims.** Before you say "done", "works" or "deployed", run the check (browser screenshot at 375px and 1280px, the build, the tests) and read the output.
8. **Client data is private.** Login is required, row-level security is on, and secrets live in Vercel env vars, never in the repo. Never use real client data in demos, screenshots or this repo.
9. **Use the client's words.** Pipeline stages, field names and button labels come from the client's playbook and vocabulary, not generic sales jargon.
10. **Small slices.** One slice = one branch = one Vercel preview the human can click. Never a 3,000-line drop.

---

## 1. Read in this order

| # | File | Why |
|---|---|---|
| 1 | `AGENTS.md` (this file) | Process, rules, routing |
| 2 | [docs/framework/00-overview.md](docs/framework/00-overview.md) | The 8 phases on one page |
| 3 | The phase doc for the phase you are in: `docs/framework/0N-*.md` | Step-by-step instructions, inputs, outputs, tools |
| 4 | [docs/design/02-rulebook.md](docs/design/02-rulebook.md) | Hard design rules (before any UI work) |
| 5 | [docs/crm/](docs/crm/) (if building a CRM) | Data model, views, features |
| 6 | [docs/stack/](docs/stack/) (before Build) | Stack, data/auth, GitHub + Vercel workflow |
| 7 | [catalog/tools.json](catalog/tools.json) | Every tool with use / avoid / how, filtered by phase |

Don't load everything at once. Read the phase doc when you enter that phase.

---

## 2. How to use the tool catalog

[catalog/tools.json](catalog/tools.json) is the single source of truth. Each entry has:

```jsonc
{
  "id": "page-patterns",               // stable id used in docs and pairs_with
  "invoke": "vectorlab-ux-skills:page-patterns", // how to call it (skill name, connector, URL)
  "kind": "skill",                     // skill | builtin | agent | connector | cli | library
  "category": "polish",                // see categories[]
  "phases": ["design","build","polish"],
  "tier": "core",                      // core | recommended | optional | situational
  "use_when": [...], "avoid_when": [...], "how_to_use": [...],
  "pairs_with": [...],                 // ids of tools that work well with it
  "fallback": "docs/design/02-rulebook.md#page-patterns", // read this if the tool is NOT installed
  "requires": "Figma connector"        // account/connector prerequisites, if any
}
```

**Routing algorithm** (do this at the start of every phase):

1. Filter tools where `phases` contains the current phase.
2. Always use the `core` ones. Use `recommended` unless you have a stated reason not to. Use `optional` / `situational` only when a `use_when` line matches the situation.
3. Check `avoid_when` before invoking anything.
4. **If a skill is not installed in your environment, don't stop.** Open its `fallback` doc. This repo distills the essential knowledge of every core skill into its own docs, so you can follow the method without the plugin.
5. If a tool has `requires` and the connector is missing, tell the human what to connect and continue with the fallback.

Human-readable versions grouped by category: [docs/tools/](docs/tools/README.md). Visual browser: the showcase site (`site/`, deployed on Vercel), **Tools** tab.

---

## 3. Where to start

| Situation | Enter at | First action |
|---|---|---|
| Brand-new dashboard, only an idea or a voice note | **Discover** | `superpowers:brainstorming`, then [01-discover.md](docs/framework/01-discover.md) |
| Client notes / playbook / transcript exist | **Discover** (synthesis step) | `design:research-synthesis` on the material |
| Spec approved, no visual direction | **Direction** | [03-direction.md](docs/framework/03-direction.md) |
| Existing dashboard, "make it look premium" | **Polish** | Screenshot → `vectorlab-ux-skills:ux-audit` → fix by rulebook |
| Existing dashboard, new feature | **Define** (mini-spec) → **Build** | Write a 10-line spec in `docs/specs/`, then build a slice |
| Client wants to change something themselves | **Build** | [docs/framework/08-handover.md §Change loop](docs/framework/08-handover.md) |

---

## 4. Phase cheat-sheet

| Phase | Core tools | Output (gate) |
|---|---|---|
| 1 Discover | brainstorming · research-synthesis · journey-mapping · file-reading | `docs/discovery.md` confirmed by the client |
| 2 Define | spec-driven-development · planning-and-task-breakdown · pipeline-review | `docs/spec.md` (from [templates/spec.md](templates/spec.md)) approved |
| 3 Direction | creative-direction · frontend-design · setup-ui-ux-skills | Chosen theme + `tokens.css` + `.ux-profile.md` |
| 4 Design | page-patterns · surfaces · interaction-design · ux-writing · dataviz | Screen list with patterns, states and copy |
| 5 Build | frontend-ui-engineering · incremental-implementation · security-and-hardening · vercel · github | Working slices on preview URLs |
| 6 Polish | ux-audit-vectorlab · ux-ui-audit · anti-slop · browser-testing · verification-before-completion | [templates/qa-checklist.md](templates/qa-checklist.md) all green |
| 7 Ship | shipping-and-launch · security-review · vercel | Production URL, backups, rollback known |
| 8 Handover | documentation-and-adrs · github (transfer) · vercel (transfer) · smb-onboard | Client makes one change on their own |

---

## 5. Definition of done (any screen)

- [ ] Named page pattern; layout matches the pattern's "Must" lines
- [ ] Loading, empty, error and populated states are implemented
- [ ] Only design tokens, no raw colors or one-off spacing
- [ ] Max 3 font weights, body text ≥ 14px, line length ≤ 75ch
- [ ] Works at 375px and 1280px with no horizontal page scroll; tap targets ≥ 44px
- [ ] Keyboard: every action reachable, visible focus ring, overlays trap and restore focus
- [ ] Motion 100–300ms on transform/opacity only; honors `prefers-reduced-motion`
- [ ] Verb-first button labels; errors say what to do next; destructive confirms name the item
- [ ] Contrast WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Screenshot reviewed at both widths; no console errors
- [ ] Deployed to a preview URL and the human has seen it

---

## 6. Anti-patterns that are always wrong

Rainbow or multi-hue gradient buttons · glassmorphism · cartoon people in empty states · decorative pills around plain metadata · icons inside every input · more than 5 KPI tiles · editable records on the overview dashboard · full-page spinners · bouncy/elastic UI motion · hover-only actions · 12px table text · all-caps labels everywhere · one accented word in a headline · stacked modals · "Are you sure?" confirmations · "Submit"/"OK" buttons · placeholder-as-label · fake numbers in demos presented as real.

Details and the reasoning: [docs/design/05-anti-patterns.md](docs/design/05-anti-patterns.md).

---

## 7. Repository map

```
AGENTS.md                ← you are here (agent playbook)
CLAUDE.md                ← Claude Code entry; imports this file
README.md                ← human overview
catalog/
  tools.json             ← curated tools (source of truth)
  inventory.json         ← every installed skill, with relevance rating
docs/
  framework/             ← 8 phases, step by step
  design/                ← principles, rulebook, page patterns, data viz, anti-patterns, themes
  crm/                   ← CRM data model, views, features
  stack/                 ← tech stack, data & auth, GitHub + Vercel, tokens → Tailwind
  tools/                 ← generated: tools by category (do not edit; edit catalog)
design-system/
  tokens.css             ← all tokens + 6 themes (data-theme="…")
  themes.json            ← theme metadata (fonts, mood, best for)
  tailwind.preset.js     ← maps tokens to Tailwind / shadcn
templates/               ← spec, discovery questions, design direction, QA, handover…
prompts/                 ← copy-paste prompts for each phase
site/                    ← showcase site (static; deployed on Vercel)
scripts/build.mjs        ← validates catalog, regenerates site data + docs/tools
```

## 8. Maintaining this repo

- Add or change a tool: edit `catalog/tools.json`, then run `node scripts/build.mjs`. It validates ids, `pairs_with` links and `fallback` paths, and regenerates `docs/tools/` and `site/data/`.
- Add a theme: add a `[data-theme="…"]` block in `design-system/tokens.css` and an entry in `design-system/themes.json`, then rebuild.
- Never paste third-party skill text into this repo. Summarize in your own words and link the source.
