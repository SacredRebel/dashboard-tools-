# Polish report: Mauve Ledger (`mauve-ledger`)

> Method: [docs/dashboards/06-verification.md](../../dashboards/06-verification.md). Template: [templates/polish-report.md](../../../../templates/polish-report.md).

## Identity (written before any code)

```
Form:        One large frosted-glass window (data-ref=frame) on a pale desk with lilac + peach sweep. Absolute cqw boxes from layout.json: pill nav, small greeting, four short KPI tiles, Average sales + Recent emails in the left column (emails directly under chart), Formation + Success stacked on the right. Not a scrolling Tidebath board and not Haven’s poured photo frame.
Frameworks:  F1 frosted glass (frame + panes) · F11 backdrop haze (lilac + peach bloom) · F12 colour · F13 type (Outfit) · F14 motion
Signature:   Wide stacked diagonally-hatched sales columns with May tip ($598 / $245), y-axis $0–$1.2k, segmented success arc + 51.2% tip
Not this:    Solid white cards, thin unhatched bars, emails full-width under a gap, Haven device frame, Pulsar dark tiles
```

## Layout gate

`site/dashboards/mauve-ledger/layout.json` boxes tagged with `data-ref` and sized in `cqw` from the frame container. Check: `node scripts/dashboards-check.mjs mauve-ledger` ✔

## Evidence

- Side-by-side (reference | ours): `docs/validation/dashboards/fidelity/mauve-ledger-compare.jpg`
- Captures: overview / overview-full / phone / variants via dashboards-check

## Pages QA (2026-11-16)

Click-tested all 4 hash routes at **1440** and **375** (local serve of this branch). Shell = same `.mv-frame` frosted window + haze; no bare blank cards. Console: only unrelated `/favicon.ico` 404. Nav works both directions (top nav + phone rail).

| Page | Route | Desktop 1440 | Phone 375 |
|---|---|---|---|
| Overview (Dashboard) | `#/overview` | pass | pass |
| Finance | `#/transactions` | pass | pass |
| Accounts | `#/budgets` | pass | pass |
| Contracts | `#/settings` | pass | pass |

`node scripts/dashboards-check.mjs mauve-ledger` ✔ (`pages=4, variants=3`).

**Future deployments / twin PRs:** before review, click every secondary page (not only overview) at desktop and phone — confirm frosted shell, real content, bidirectional nav, no sideways scroll. Overview-only checks miss blank/broken inner routes.

## Remaining gaps

- Header + email avatars are initials chips, not photo cut-outs from the reference.
- Peach bloom is procedural CSS; still a touch softer than the painted mock at the extreme corner.
- Success subtitle is product copy, not the reference’s “Lorem ipsum…”.
