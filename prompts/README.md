# Copy-paste prompts

Paste into any capable AI agent that has this repo available (cloned, or attached in Claude Code). Replace `<…>`.

---

## 0. Kickoff (start any new dashboard project)

```
You are building a dashboard for <client / business>. Use the toolkit repo
<github.com/OWNER/dashboard-tools-> as your playbook:
1. Read AGENTS.md fully, then docs/framework/00-overview.md.
2. Tell me which phase we're in and which core tools you'll use (from catalog/tools.json).
3. Follow the phase doc step by step. Stop at each gate and show me the artifact.
Inputs I have: <voice memo transcript / meeting notes / playbook / screenshots>.
```

## 1. Discover: synthesize inputs

```
Phase 1 (Discover). Here are my inputs: <paste or attach>.
Use research-synthesis (or follow docs/framework/01-discover.md if unavailable).
Produce docs/discovery.md in the shape the phase doc specifies, quote the client
verbatim for every pain, and list open questions. Then give me the 5 most important
questions from templates/discovery-questions.md that the inputs don't answer.
```

## 2. Define: write the spec

```
Phase 2 (Define). Using docs/discovery.md, fill templates/spec.md into docs/spec.md.
Derive stages from the client's journey (docs/crm/pipeline-and-views.md), trim the data
model (docs/crm/data-model.md) to fields that serve a job, max 5 KPIs, and sort features
into v1/v2/later (docs/crm/features.md). Keep v1 small enough to build in 2–3 days.
```

## 3. Direction: show me looks

```
Phase 3 (Direction). Brief: <3 adjectives, references, brand colors/logo>.
Propose 3 directions based on design-system/themes.json, adapted to the brief.
For each: theme base, accent hex, typefaces, signature detail, and a screenshot of the
demo dashboard in that theme. Recommend one. After I choose, write the token block
and .ux-profile.md from templates/ux-profile.md.
```

## 4. Design: screens

```
Phase 4 (Design). For every screen in docs/spec.md: name the page pattern
(docs/design/03-page-patterns.md), draw a text wireframe, define loading/empty/error
states, surfaces for each action (docs/design/02-rulebook.md §2), and final copy.
Write it to docs/screens.md.
```

## 5. Build: next slice

```
Phase 5 (Build). Implement the next slice from docs/plans/v1.md on a new branch,
following docs/framework/05-build.md. Tokens only. When done: screenshot at 375 and
1280, fix rulebook violations, push, and give me the Vercel preview URL.
```

## 6. Polish: make it premium

```
Phase 6 (Polish). Run the QA checklist (templates/qa-checklist.md) on <preview URL>.
Use ux-audit / anti-slop / ux-ui-audit if installed, else walk docs/design/02-rulebook.md
and docs/design/05-anti-patterns.md. Report findings by severity, then fix sev 1 and 2.
Finally propose ONE signature detail that would elevate the design.
```

## 8. Handover

```
Phase 8 (Handover). Write AGENTS.md, CLAUDE.md and HOW-TO-CHANGE-THINGS.md for the
client repo (templates/handover-guide.md), tailored to this project. Then give me a
step-by-step checklist to transfer the GitHub repo, Vercel project and Supabase project.
```

## Quick: audit an existing dashboard

```
Here is a screenshot/URL of a dashboard. Using docs/design/02-rulebook.md and
05-anti-patterns.md, list every violation by severity with the exact fix
(token, size, pattern). Then show the improved version.
```
