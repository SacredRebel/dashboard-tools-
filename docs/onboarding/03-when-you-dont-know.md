# Onboarding 3: when you don't know how

**You are an AI model building a dashboard and you hit something you are unsure about:** a syntax you half remember, a library you have not used, a concept the person mentioned, a technique a reference needs. Do not guess and do not skip it. Look it up, in this order, then continue.

## The lookup order

| # | Look here | For | How |
|---|---|---|---|
| 1 | **This repo** | How *this toolkit* does it: shapes, glass, 3D heroes, motion, page patterns, states, copy, checks | [02-reference-twin-playbook.md](../dashboards/02-reference-twin-playbook.md), the two worked examples (`site/dashboards/haven-listings/`, `site/dashboards/meridian-labs/`), [02-rulebook.md](../design/02-rulebook.md), `catalog/tools.json` (`fallback` docs) |
| 2 | **[quickref.me](https://quickref.me/index.html)** | Exact syntax, fast: CSS (grid, flexbox, selectors, animation), JavaScript, TypeScript, HTML, regex, Git, npm, Bash, SQL, Tailwind, React, Next.js, Docker, HTTP status codes, keyboard shortcuts | Open `https://quickref.me/<topic>.html` (for example `css3`, `javascript`, `typescript`, `git`, `regex`, `tailwindcss`, `react`, `postgres`, `bash`). One page per topic, grouped tables with examples. Read the section you need, not the page |
| 3 | **[learn-anything.xyz](https://learn-anything.xyz/explore)** | Understanding a topic you don't know: a field the business works in (bookkeeping, logistics, nutrition), or a technology area (WebGL, databases, accessibility, design systems). Curated learning paths and links to the best sources | Search the topic on the Explore page, read the short guide, follow one or two of its top links |
| 4 | **The library's own documentation** | The current API of a specific library or service (three.js, Motion, Supabase, Next.js, Vercel) | Read the official docs for the version in use. For libraries vendored here, the version is in the folder name (`_vendor/three@0.170.0`) |
| 5 | **The person** | Anything about *their* business, data, words or taste | Ask one short question with a recommended default. Never invent business facts |

## Rules

- **Repo first.** If this repo says how to do something, do it that way, even if another source shows a different way. The checks here enforce the repo's way.
- **Look up before you write, not after it breaks.** If you are less than sure about a syntax or an API, a quickref page costs seconds; a wrong guess costs a rebuild.
- **Learn the domain before you design for it.** If the person runs a kind of business you don't know well, spend one lookup on how that business works (what they track, the usual steps, the words they use) *before* the intake's second round. Then confirm with the person; their words win.
- **Don't paste what you read.** Use sources to understand, then write your own code and copy. Never copy third-party text or code into the project without checking its license.
- **Say what you looked up** when it changed a decision: one line in the brief or the hand-over ("Checked CSS container units on quickref; used `cqw` for the frame").
- **No web access?** Use steps 1 and 5, state what you could not verify, and keep to techniques the worked examples already show.

## Common situations

| You need | Go to |
|---|---|
| A CSS property's exact syntax (`mask`, `clip-path`, `container-type`, grid tracks) | quickref `css3`, then copy the pattern from the playbook |
| How a business type usually works | learn-anything (search the field), then `catalog/recipes.json` for the matching recipe |
| A three.js class or material option | `site/dashboards/meridian-labs/helix.js` first, then the three.js docs for r170 |
| A regex, a date format, a Git command | quickref `regex`, `javascript`, `git` |
| How to structure a database table or auth | `docs/stack/02-data-and-auth.md`, then quickref `postgres` |
| What a design term means (bento, neumorphic, glass) | `docs/design/10-materials.md`, `catalog/dashboards.json` style families |
| An accessibility rule | `docs/design/02-rulebook.md`, then learn-anything "accessibility" |
