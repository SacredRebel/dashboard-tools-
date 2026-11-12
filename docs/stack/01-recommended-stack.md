# Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js** (App Router, TypeScript) | First-class on Vercel; AI agents know it extremely well, so the client's AI can maintain it |
| Styling | **Tailwind CSS** + CSS variables from `tokens.css` | Fast, consistent, themeable; tokens map 1:1 |
| Components | **shadcn/ui** (Radix primitives) | Accessible, owned in-repo (no lock-in), CSS-variable theming |
| Data + Auth | **Supabase** (Postgres, Auth, RLS, Storage) | Real database, login out of the box, free tier, row-level security |
| Forms | React Hook Form + **Zod** | One schema for form + server validation |
| Tables | TanStack Table | Sorting/filtering/pagination without UI lock-in |
| Drag & drop | **dnd-kit** | Accessible, keyboard support |
| Charts | **Recharts** (via shadcn charts) | Composable, themeable with CSS vars |
| Motion | CSS transitions; Motion (Framer) for layout animations | Keep it light |
| Icons | **Lucide** | One consistent set |
| Fonts | `next/font/google` | Self-hosted, no layout shift |
| Hosting | **Vercel** | Preview URL per change, instant rollback |
| Code | **GitHub** | PRs + previews = safe change loop for the client |

## Alternatives (when and why)

| Instead of | Consider | When |
|---|---|---|
| Supabase | Google Sheets as DB | Tiny scale, client lives in Sheets, read-mostly |
| Supabase | Neon/Vercel Postgres + Auth.js | Team prefers plain Postgres, fewer vendor features |
| Next.js app | Single HTML artifact / prototype | Pre-sales demo or throwaway |
| Custom CRM | HubSpot free / Attio / Folk | Client needs integrations now and won't customize |

Be honest with the client: if an off-the-shelf CRM fits 95% and they don't care about owning or customizing, recommend it.

## Project skeleton (target)

```
app/
  (auth)/login/page.tsx
  (app)/layout.tsx          ← shell: sidebar + header
  (app)/today/page.tsx      ← Dashboard pattern
  (app)/pipeline/page.tsx   ← Board pattern
  (app)/clients/page.tsx    ← List pattern
  (app)/clients/[id]/page.tsx ← Detail pattern
  (app)/settings/page.tsx
components/ui/               ← shadcn components (themed by tokens)
components/crm/              ← KpiTile, StageColumn, ClientCard, ActivityTimeline, EmptyState…
lib/data/                    ← all DB access (server only)
lib/format.ts                ← Intl money/date helpers
styles/tokens.css            ← copied from this toolkit
AGENTS.md  CLAUDE.md  HOW-TO-CHANGE-THINGS.md
```
