# Phase 2: Define

**Goal:** turn discovery into a scoped, testable spec.

**Gate:** `docs/spec.md` (from [templates/spec.md](../../templates/spec.md)) approved by the client; v1 scope fits on one page.

## Steps

1. **Name the jobs.** Rewrite each job from discovery as "When ___, I want to ___, so I can ___." 3–5 jobs max for v1.
2. **Draft the data model.** Start from [docs/crm/data-model.md](../crm/data-model.md) and delete what the client doesn't need. Every field must trace back to a job. Fewer fields = more usage.
3. **Derive the screens.** One screen per job cluster. Give each screen a page pattern ([03-page-patterns.md](../design/03-page-patterns.md)):
   - Today / Overview → *Dashboard* · Pipeline → *Board* · Clients → *List* · Client → *Detail* · Settings → *Settings*
4. **Choose metrics** (max 5 KPI tiles). Each must change a decision. If nobody would act on a number, drop it (`superme:choose-metrics`, `design-skills:ux-strategy`).
5. **Cut scope.** Put each feature in *v1 / v2 / later*. v1 = the smallest thing the client would use daily. Integrations (Gmail, Calendar, transcripts) are usually v2.
6. **Acceptance criteria.** Every v1 feature gets a testable line: "Given a client in *Proposal sent* with no activity for 7 days, the Today view lists it under *Needs a nudge*."
7. **Critical user journeys.** Write 3–5 journeys that must never break (`ux-agent-skills:spec-cuj`), e.g. *Add a lead → log a call → move to Won*.
8. **Plan.** Break into slices with `agent-protocols:planning-and-task-breakdown` and save to `docs/plans/v1.md`.

## Tools

| Tier | Tools |
|---|---|
| Core | `agent-protocols:spec-driven-development`, `agent-protocols:planning-and-task-breakdown`, `sales:pipeline-review` (stage logic) |
| Recommended | `superpowers:writing-plans`, `ux-agent-skills:spec-cuj`, `small-business:crm-autopilot` (as spec for automations) |
| Situational | `superme:choose-what-to-build`, `superme:choose-metrics`, `design-skills:ux-strategy` |

## Decision: spreadsheet or app?

| Choose a **Google Sheet** when | Choose the **web app** when |
|---|---|
| < 50 active clients, one user, no budget for upkeep | Daily use, wants it to feel premium, phone use, > 1 user |
| They already live in Sheets | They want a pipeline board, reminders, a Today view |
| Throwaway / trial | They want to own and evolve it with their AI |

A Sheet can be the v0 that becomes the import file for the app.
