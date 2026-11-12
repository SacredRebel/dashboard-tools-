# Phase 5: Build

**Goal:** implement the design in small, deployable slices on the recommended stack.

**Gate:** each slice is on a Vercel preview URL, checked in a real browser at 375px and 1280px, and seen by the human.

## Stack (default)

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Postgres + Auth + RLS) · Recharts · dnd-kit · Lucide icons · Zod + React Hook Form · hosted on Vercel, code on GitHub. Rationale and alternatives: [docs/stack/01-recommended-stack.md](../stack/01-recommended-stack.md).

## Slice order for a CRM v1

1. **Skeleton:** repo, Next.js, Tailwind + tokens ([04-tokens-to-tailwind.md](../stack/04-tokens-to-tailwind.md)), shadcn init, app shell (sidebar + header, collapses on phone), deploy to Vercel. *Preview: empty shell with the theme.*
2. **Auth + data:** Supabase project, tables from [data-model.md](../crm/data-model.md), RLS policies, login page, seed with **fake** sample data.
3. **Clients list:** table, search, filters, empty states, add-client slide-over.
4. **Client detail:** header, tabs (Overview · Activity · Notes), log activity, edit next step inline.
5. **Pipeline board:** columns = stages, drag + keyboard "Move to…", counts and values, card → slide-over.
6. **Today / Overview:** KPI strip (≤ 5), *Needs attention* list (overdue next steps, gone quiet), upcoming follow-ups, one chart.
7. **Settings:** stages (rename/reorder), profile, CSV import/export.
8. **Polish pass** → Phase 6.

## The slice loop (repeat for every slice)

1. Branch: `git checkout -b feat/<slice>`
2. Build with `agent-protocols:incremental-implementation` + `agent-protocols:frontend-ui-engineering`. Tokens only.
3. Check docs for any library API you're unsure of (`agent-protocols:source-driven-development`).
4. Logic gets tests (`agent-protocols:test-driven-development`), e.g. "days in stage", "overdue" math.
5. Run locally, screenshot at 375 and 1280 (`scripts/screenshot.mjs` pattern), fix rulebook violations.
6. Push → Vercel preview → share the link with the human.
7. Merge to `main` after approval → production.

## Rules while building

- Server-side data access only through one data module (`lib/data/*.ts`). UI components never talk to Supabase directly.
- Every list/board/table component takes `loading`, `error`, `empty` states as part of its contract.
- Dates and money via `Intl` formatters, in the client's locale and currency.
- No secrets in code. Use `.env.local` locally and Vercel env vars remotely. `.env*` is in `.gitignore`.
- Don't add libraries beyond the stack without writing down why (`docs/decisions/`).

## Tools

| Tier | Tools |
|---|---|
| Core | `agent-protocols:frontend-ui-engineering`, `agent-protocols:incremental-implementation`, `agent-protocols:security-and-hardening`, Vercel, GitHub, Playwright |
| Recommended | `agent-protocols:source-driven-development`, `agent-protocols:test-driven-development`, `agent-protocols:git-workflow-and-versioning`, `21st:21st-ui`, `agent-protocols:karpathy-guidelines` |
| Situational | `superpowers:subagent-driven-development` (large builds), `agent-protocols:internationalization-and-localization` |
