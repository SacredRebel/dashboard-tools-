# GitHub + Vercel workflow

## One-time setup

1. **GitHub:** create the repo (private for client projects). Add `README.md`, `AGENTS.md`, `CLAUDE.md`, `.gitignore` (include `.env*`).
2. **Vercel:** *Add New → Project → Import* the GitHub repo. Framework preset: Next.js. Add env vars for Production and Preview.
3. Every push to any branch → **Preview deployment** with its own URL. Every merge to `main` → **Production**.
4. Protect `main` (optional): require PRs.

## Everyday loop

```bash
git checkout -b feat/pipeline-board
# … build the slice …
git add -A && git commit -m "Add pipeline board with keyboard move"
git push -u origin feat/pipeline-board
gh pr create --fill          # Vercel comments the preview URL on the PR
# human reviews preview on phone + laptop
gh pr merge --squash         # → production
```

## Agent tooling

- Vercel MCP: create/inspect projects, list deployments, read build logs, `get_runtime_errors` → `get_runtime_logs` for production bugs, manage env vars and domains.
- `gh` CLI / GitHub connector: repos, PRs, issues, transfers.

## Rollback

Vercel → Project → Deployments → pick the last good one → **Promote to Production**. Instant, no git needed. Then fix forward on a branch.

## Handover transfer

See [docs/framework/08-handover.md](../framework/08-handover.md#1-transfer-ownership).

## This toolkit repo on Vercel

This repo itself deploys as a static site: `vercel.json` runs `node scripts/build.mjs` and serves `site/`. Import it in Vercel once; every push updates the showcase.
