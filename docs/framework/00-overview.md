# The Dashboard Framework: overview

Eight phases. Each has one goal, a short list of core tools, and a **gate**: an artifact the human approves before the next phase starts.

```
 1 DISCOVER ─▶ 2 DEFINE ─▶ 3 DIRECTION ─▶ 4 DESIGN ─▶ 5 BUILD ─▶ 6 POLISH ─▶ 7 SHIP ─▶ 8 HANDOVER
 understand    scope it    choose the     screens,    slices on   rulebook,   prod,      client owns
 the job       on a page   look & feel    states      previews    audits      backups    & can change
```

| # | Phase | Goal | Gate (must exist before moving on) | Doc |
|---|---|---|---|---|
| 1 | Discover | Understand the business, the people and the job the dashboard must do | `docs/discovery.md`, confirmed by the client | [01-discover.md](01-discover.md) |
| 2 | Define | Needs → scoped spec: data model, screens, v1 features, non-goals | `docs/spec.md` approved; v1 fits on one page | [02-define.md](02-define.md) |
| 3 | Direction | Look and feel: theme, type, palette, tone | One direction chosen; tokens + `.ux-profile.md` written | [03-direction.md](03-direction.md) |
| 4 | Design | Information architecture, page patterns, components, states, copy | Screen inventory with pattern + 4 states each | [04-design.md](04-design.md) |
| 5 | Build | Implement in small deployable slices | Each slice on a Vercel preview, checked in a browser | [05-build.md](05-build.md) |
| 6 | Polish & QA | Rulebook pass, audits, phone + desktop testing | QA checklist green; no severity-1 findings | [06-polish.md](06-polish.md) |
| 7 | Ship | Production deploy, domain, backups, monitoring | Production live; rollback path known | [07-ship.md](07-ship.md) |
| 8 | Handover | Transfer ownership; teach the client's AI loop | Client makes one change themselves | [08-handover.md](08-handover.md) |

## Time guide (small-business CRM, one builder + AI)

| Phase | Typical effort |
|---|---|
| Discover + Define | 1 conversation + 1–2 hours of synthesis |
| Direction | 1–2 hours, plus one review with the client |
| Design | 2–4 hours |
| Build v1 | 1–3 days in slices |
| Polish + Ship | 0.5–1 day |
| Handover | 1 hour together |

## Why gates?

AI agents are fast enough to build the wrong thing beautifully in an afternoon. Gates are cheap checkpoints where a human says "yes, that's it" before effort compounds. **A gate is passed only when the human has seen the artifact**, not when the agent thinks it is good.

## Loops are allowed

Going back is normal: Polish findings can send you to Design, and a client comment in Build can send you to Define. When you loop back, update the earlier artifact (spec, tokens, screen list) so the docs stay true.
