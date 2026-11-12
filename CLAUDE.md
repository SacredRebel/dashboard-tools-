# CLAUDE.md

This repository is a toolkit and playbook for designing and building beautiful, functional dashboards (CRM first).

@AGENTS.md

## Claude-specific notes

- Skills listed in `catalog/tools.json` with `kind: "skill"` are invoked by name with the Skill tool (e.g. `vectorlab-ux-skills:page-patterns`). If a skill isn't installed, read its `fallback` doc instead. Don't stop.
- Prefer the Vercel MCP tools for deploys, env vars and logs. For GitHub, use the `gh` CLI or the GitHub connector.
- When a design decision is genuinely the human's (theme, pipeline stages, what's in v1), ask, with a recommendation first.
- After editing `catalog/tools.json`, `design-system/`, or `docs/`, run `node scripts/build.mjs` and commit the regenerated files.
