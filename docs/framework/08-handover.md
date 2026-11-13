# Phase 8: Handover

**Goal:** the client owns everything and can change their dashboard with their own AI, safely.

**Gate:** the client has made one real change themselves (e.g. renamed a stage or changed the accent color), seen it on a preview URL, and published it.

## 1. Transfer ownership

| What | How |
|---|---|
| GitHub repo | Repo → Settings → *Transfer ownership* to the client's account (or `gh repo transfer`, if available). Or create it in their account from the start and add the builder as collaborator. |
| Vercel project | Project → Settings → *Transfer project* to the client's Vercel account/team. Re-link the GitHub repo if prompted. |
| Supabase | Organization → invite client as Owner, then remove builder (or transfer the project). |
| Domain | Registrar stays in the client's name. |
| Secrets | Rotate keys after transfer (Supabase anon/service keys) and update Vercel env vars. |

## 2. Set up the client's AI loop

1. Client creates a Claude account and opens **Claude Code on the web** (claude.ai/code), connects GitHub, and selects their repo.
2. The repo contains `AGENTS.md` + `CLAUDE.md` (copied/adapted from this toolkit) so their Claude knows the rules, tokens and patterns.
3. Optional: install the same plugins listed in `catalog/tools.json` for the best results. Without them, the agent uses the `fallback` docs.

## 3. The change loop (teach this)

```
"Claude, rename the stage 'Proposal' to 'Offer sent'"
   → Claude edits on a new branch and opens a pull request
   → Vercel posts a Preview link on the PR
   → Client clicks the link, checks on phone and laptop
   → Client says "merge it" (or clicks Merge) → live in ~1 minute
   → Something wrong? Vercel → Deployments → Promote previous → instant undo
```

## 4. Leave these files in the client repo

- `HOW-TO-CHANGE-THINGS.md` from [templates/handover-guide.md](../../templates/handover-guide.md), with example requests
- `docs/spec.md`, `docs/screens.md`, `docs/decisions/` (why things are the way they are)
- `AGENTS.md` (project-specific: stack, tokens, patterns, don'ts)

## 4b. Present it like a product

Open the handover with a short **story player** of their own workflow (inquiry → call → proposal → won) on their real dashboard, inside a device frame, using [07-showcase-patterns.md](../design/07-showcase-patterns.md). People remember the journey of one client better than a tour of menus.

## 5. Walkthrough session (1 hour)

1. Daily use: Today → Pipeline → log a call → move a card (10 min)
2. Settings: stages, import/export (10 min)
3. Change loop live: two small changes with their Claude (30 min)
4. Where to get help + how to undo (10 min)

## Tools

`agent-protocols:documentation-and-adrs` · `agent-protocols:context-engineering` · `small-business:smb-onboard` · `claude-code-guide` agent · GitHub · Vercel
