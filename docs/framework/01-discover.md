# Phase 1: Discover

**Goal:** understand the business, the people who'll use the dashboard, and the one job each screen must do. No pixels, no code.

**Gate:** `docs/discovery.md` exists in the project repo and the client has confirmed "yes, that's my business".

## Inputs you may receive

- Voice memos (transcribe first), meeting recordings/transcripts (Fathom, Otter, Fireflies, Zoom)
- A playbook or process document (PDF, Doc, Notion)
- Existing tools: spreadsheet of clients, notebook photos, an old CRM export
- Screenshots of apps the client likes

## Steps

1. **Collect everything into one folder** (`docs/inputs/` in the project repo). Never commit sensitive client data to a public repo. Use a private repo or keep inputs out of git.
2. **Extract.** For each input, write bullet notes: facts, quotes, numbers, names of stages, pains.
   - Transcripts → `design:research-synthesis` (or `sales:call-summary` for action items).
   - PDFs/sheets → `anthropic-skills:pdf` / `xlsx`; profile contact sheets with `data:explore-data`.
3. **Map the client's client journey** with `design-skills:journey-mapping`. From first contact to paid and repeat. The stages usually become the pipeline columns.
4. **Fill the gaps.** Prepare questions from [templates/discovery-questions.md](../../templates/discovery-questions.md). Ask only what the material doesn't answer. Ask one question at a time if chatting live (`superpowers:brainstorming`).
5. **Write `docs/discovery.md`** with this shape:

```markdown
# Discovery: <business>
## The business in 3 sentences
## Who uses the dashboard (role, device, how often)
## The client journey (stages, with the client's own names)
## Jobs to be done (the 3–5 things they must be able to do in under 30 seconds)
## Pains today (verbatim quotes)
## What "great" looks like (their words)
## Data they have today (where, how much, quality)
## Constraints (budget, privacy, devices, languages, team size)
## Open questions
```

6. **Confirm** with the client. Read it back as a story ("So a new lead usually comes from Instagram, you have a discovery call within a week…"). Corrections go into the doc.

## Tools for this phase

| Tier | Tools |
|---|---|
| Core | `superpowers:brainstorming`, `design:research-synthesis`, `design-skills:journey-mapping` |
| Recommended | `design:user-research`, `sales:call-summary`, file reading (pdf/docx/xlsx), Google Drive connector |
| Optional | `anthropic-skills:deep-research` (industry norms), `agent-protocols:idea-refine` |

## Don'ts

- Don't propose screens or colors yet. That anchors the client too early.
- Don't use sales-team jargon ("opportunity", "ARR", "SQL") unless the client does.
- Don't invent requirements to fill a gap. List it as an open question.
