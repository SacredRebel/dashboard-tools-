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

## Remaining gaps

- Header + email avatars are initials chips, not photo cut-outs from the reference.
- Peach bloom is procedural CSS; still a touch softer than the painted mock at the extreme corner.
- Success subtitle is product copy, not the reference’s “Lorem ipsum…”.
