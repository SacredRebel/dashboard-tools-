# START: build a dashboard from one prompt

**You are an AI model. A person gave you a link to this repository and asked for a dashboard.** This file is your entry point. Follow it top to bottom. It tells you what to read, what to ask, what to build and when you are done.

> People: paste the prompt from [README.md](README.md#one-prompt-start) into any capable AI and answer its questions.

---

## 1. Work out how you can operate (don't ask the person; check)

| Mode | You can… | How you read this repo | What you deliver |
|---|---|---|---|
| **A. Coding agent** (Claude Code, Cursor, Codex, Devin…) | read and write files, run commands, open a browser | Clone or open the repo. Read files directly. | A project folder or repo with the dashboard, run and screenshotted by you, deployed to a preview when you have Vercel access |
| **B. Chat model with web access** (ChatGPT, Claude, Gemini… in a chat window) | fetch URLs, write code into the chat or a canvas/artifact | Fetch [`llms.txt`](llms.txt), then the raw files it lists (`https://raw.githubusercontent.com/SacredRebel/dashboard-tools-/main/<path>`) | One self-contained HTML file (CSS and JS inline) the person can open, plus the brief |
| **C. Chat model, no web access** | only read what is pasted | Ask the person to paste `START.md`, `docs/onboarding/01-intake.md`, `docs/design/02-rulebook.md` and `design-system/tokens.css` | Same as B |

Say in one line which mode you're in, then continue. In modes B and C you can't run the repo's skills or scripts: use the written method in each doc instead (every core skill has a `fallback` doc in `catalog/tools.json`).

## 2. Read these, in this order (and nothing else yet)

1. This file.
2. [docs/onboarding/01-intake.md](docs/onboarding/01-intake.md): the interview you run.
3. [catalog/recipes.json](catalog/recipes.json): starting points by business type (pages, records, numbers, look).
4. [docs/design/02-rulebook.md](docs/design/02-rulebook.md): the hard design rules.
5. [AGENTS.md](AGENTS.md) §0 (ground rules), §5 (definition of done) and §6 (always wrong).

Read the rest when the step that needs it says so. Loading everything first wastes your context.

**Unsure how to do something at any point?** Don't guess. Follow [docs/onboarding/03-when-you-dont-know.md](docs/onboarding/03-when-you-dont-know.md): this repo first, then [quickref.me](https://quickref.me/index.html) for exact syntax, then [learn-anything.xyz](https://learn-anything.xyz/explore) to understand a topic or the person's field, then the library's own docs, then ask the person.

## 3. The flow

```
 INTAKE ──▶ BRIEF + LOOK ──▶ BUILD ──▶ POLISH ──▶ DELIVER
 3 short     one approval     in slices  checklist   preview +
 rounds      from the person             + your eyes  next steps
```

There are **two approvals**: the brief with the chosen look (after Intake), and the finished dashboard. Everything between runs without stopping unless you hit a decision only the person can make. This is the fast path through the full eight-phase framework ([docs/framework/00-overview.md](docs/framework/00-overview.md)); use the full framework with all its gates when the person asks for a careful client project.

### Step 1 · Intake

Run [docs/onboarding/01-intake.md](docs/onboarding/01-intake.md) exactly: use what the person already told you, match a recipe, ask three short rounds, offer a default for every question. If they say "just build it", take every default and say which ones you took.

### Step 2 · Brief + look (approval 1)

1. Fill [templates/brief.md](templates/brief.md) from the answers and save it as `docs/brief.md` in the project (mode B/C: show it in the chat).
2. Pick the look. Choose 2–3 reference dashboards from [catalog/dashboards.json](catalog/dashboards.json) that fit the business and the mood words, and give their live links: `https://dashboard-tools-three.vercel.app/#/dashboards/<id>`. Recommend one. Name the theme from [design-system/themes.json](design-system/themes.json) it maps to. Guide: [docs/dashboards/README.md](docs/dashboards/README.md).
3. Show the person **one message**: the brief in a few lines, the page list, the numbers on the overview, the recommended look with links, and what you will deliver. Ask: "Build this?"
4. Wait for yes or edits. This is the only stop before the build.

### Step 3 · Build

Follow [docs/onboarding/02-build-playbook.md](docs/onboarding/02-build-playbook.md). In short:

- **Level 1, clickable prototype** (default): static HTML, CSS and JS with believable sample data, every page from the brief, working navigation and interactions. Same file layout as the gallery dashboards. Ready in one session.
- **Level 2, working app**: Next.js + Tailwind + shadcn/ui + Supabase with login and real data, built in slices on Vercel previews ([docs/stack/](docs/stack/01-recommended-stack.md), [docs/framework/05-build.md](docs/framework/05-build.md)). Build Level 1 first, get it approved, then upgrade: the look and the pages carry over.

Build order: tokens and theme → app shell and navigation → overview page → the main list and its detail → the board or calendar → remaining pages → states (loading, empty, error) → motion → phone layout.

### Step 4 · Polish

Run the checks in [docs/onboarding/02-build-playbook.md](docs/onboarding/02-build-playbook.md#polish): the rulebook pass, [templates/qa-checklist.md](templates/qa-checklist.md), [docs/design/13-high-end-checklist.md](docs/design/13-high-end-checklist.md), and a look at your own screenshots at 375px and 1280px. Fix what you find before you show anything.

### Step 5 · Deliver (approval 2)

Give the person: the link or file, three screenshots (overview, one inner page, phone), what works, what is sample data, and the next step (connect real data, add a page, deploy). Then ask what to change.

## 4. Which tools at which step

The catalog ([catalog/tools.json](catalog/tools.json)) has every tool with *use when / avoid when / how / fallback*. Filter by `phases` and take the `core` tier. The short version:

| Step | Use (skill ids) | If the skill isn't installed, read |
|---|---|---|
| Intake | `brainstorming`, `research-synthesis`, `journey-mapping` | [01-intake.md](docs/onboarding/01-intake.md), [01-discover.md](docs/framework/01-discover.md) |
| Brief | `spec-driven-development`, `planning-and-task-breakdown` | [templates/brief.md](templates/brief.md), [02-define.md](docs/framework/02-define.md) |
| Look | `dashboard-gallery`, `creative-direction`, `frontend-design` | [docs/dashboards/README.md](docs/dashboards/README.md), [06-themes.md](docs/design/06-themes.md) |
| Screens | `page-patterns`, `surfaces`, `interaction-design`, `ux-writing`, `dataviz` | [03-page-patterns.md](docs/design/03-page-patterns.md), [04-data-viz.md](docs/design/04-data-viz.md) |
| Build | `frontend-ui-engineering`, `incremental-implementation`, `calendar-hub` (anything with dates) | [05-build.md](docs/framework/05-build.md), [docs/calendars/](docs/calendars/README.md) |
| Motion and depth | FX library, materials, shape kit | [09-motion-system.md](docs/design/09-motion-system.md), [10-materials.md](docs/design/10-materials.md), [12-microinteractions.md](docs/design/12-microinteractions.md) |
| Shapes, glass, 3D hero, phone layout | the reference-twin playbook and its two worked examples | [02-reference-twin-playbook.md](docs/dashboards/02-reference-twin-playbook.md), `site/dashboards/haven-listings/`, `site/dashboards/meridian-labs/` |
| Any step, when unsure | `quickref`, `learn-anything` | [03-when-you-dont-know.md](docs/onboarding/03-when-you-dont-know.md) |
| Polish | `anti-slop`, `ux-audit-vectorlab`, `ux-ui-audit`, `browser-testing`, `verification-before-completion` | [02-rulebook.md](docs/design/02-rulebook.md), [13-high-end-checklist.md](docs/design/13-high-end-checklist.md) |
| Ship (Level 2) | `vercel`, `github`, `security-review`, `shipping-and-launch` | [07-ship.md](docs/framework/07-ship.md) |

## 5. Rules you may not break

- **Ask before you assume the business.** Never invent what the person sells, who their customers are or what they track. Use their words for stages, fields and buttons.
- **Sample data is labelled** and fictional (made-up names, 555 phone numbers). Never present sample numbers as real.
- **Tokens only.** Colors, spacing, radius, shadows and fonts come from [design-system/tokens.css](design-system/tokens.css) and the chosen theme.
- **Every page has a named pattern** and every data view has loading, empty, error and populated states.
- **At most 5 KPI tiles** on the overview, and nothing editable there.
- **No polling**, no auto-advancing carousels, no AI action without an approval step.
- **Check before you claim.** Open it, screenshot it at 375px and 1280px, read the console. Say plainly what you could not verify.
- **Private by default** at Level 2: login required, row-level security on, secrets in environment variables.

## 6. Done means

- [ ] The person approved the brief and the look before you built
- [ ] Every page in the brief exists, is reachable from the navigation and does its job
- [ ] The overview answers "what needs my attention today?" in five seconds
- [ ] Interactions work: search, filter, sort, open a record, add or edit one, move a card or book a slot
- [ ] It matches the chosen reference's style: materials, shapes, type, spacing, motion. A reference with glass, organic outlines or a 3D object has them here too, built as the playbook shows, not as flat rectangles
- [ ] You opened your own screenshots (desktop, and the full phone page) and compared them with the reference
- [ ] It passes [AGENTS.md §5](AGENTS.md) at 375px and 1280px
- [ ] The person has the link or file, screenshots, and a clear next step
