# Phase 6: Polish & QA

**Goal:** go from "works" to "feels premium, works everywhere, accessible".

**Gate:** [templates/qa-checklist.md](../../templates/qa-checklist.md) fully checked; no open severity-1 findings.

## Steps

1. **Screenshot everything** at 375px and 1280px, in each state (empty, loading, populated, error).
2. **Rulebook audit:** run `vectorlab-ux-skills:ux-audit`, or walk [02-rulebook.md](../design/02-rulebook.md) section by section. Fix hard-rule failures first.
3. **Anti-slop pass** (`vectorlab-ux-skills:anti-slop`): delete decoration that has no function. Keep structure.
4. **Measured audit** on the deployed preview (`ux-ui-audit`): contrast ratios, tap targets, focus rings, accessible names.
5. **Accessibility** (`design-skills:accessibility-audit`): keyboard-only run of every critical journey; screen-reader labels on icon buttons.
6. **Journeys:** replay the critical user journeys (`ux-agent-skills:audit-cuj`, or Playwright tests).
7. **Data sanity:** KPI math against hand calculation (`data:validate-data`); long names, 0 records, 2,000 records.
8. **Design review** with fresh eyes (`design-superpowers:design-review` or `design-skills:design-critique`).
9. **Code review** (`/code-review`, `agent-protocols:code-review-and-quality`).
10. **Elevation pass** (`design-skills:design-elevation`): one signature detail, consistent rhythm, chart polish.
11. **Performance:** CLS < 0.1, 60 fps at 4× CPU throttle, no polling, timers pause offscreen ([05-performance-and-privacy.md](../stack/05-performance-and-privacy.md)).
12. **Record evidence** in `docs/validation/<date>-<pass>.json` ([templates/validation.json](../../templates/validation.json)).

## Severity scale

| Sev | Meaning | Example |
|---|---|---|
| 1 | Blocks a job, loses data, or is inaccessible | Can't move a card with keyboard; RLS missing |
| 2 | Hurts usability or trust | No empty state; text 12px in table; layout shift on edit |
| 3 | Polish | Spacing off-grid by 2px; inconsistent icon stroke |

## Tools

| Tier | Tools |
|---|---|
| Core | `vectorlab-ux-skills:ux-audit`, `vectorlab-ux-skills:anti-slop`, `ux-ui-audit`, `agent-protocols:browser-testing-with-devtools`, `superpowers:verification-before-completion`, `design-skills:design-elevation` |
| Recommended | `design-skills:accessibility-audit`, `ux-agent-skills:ux-audit`, `design-superpowers:design-review`, `/code-review`, `sales:crm-hygiene-check` |
