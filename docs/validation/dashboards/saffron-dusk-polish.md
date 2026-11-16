# Polish report: Saffron Dusk (`saffron-dusk`)

## Identity (written before any code)

```
Form:        One wide dusk board (no phone shells on desktop); vertical glass rail; left Today cards; right Profile cards. At 375: Today = left reference screen, Profile = right, bottom tab bar.
Frameworks:  F2 Liquid glass · F7 Organic poured tabs · F11 procedural dusk backdrop · F13 Fraunces + Plus Jakarta · F14 Motion
Signature:   Twin-phone liquid language adapted to one desktop board; sun-arc with poured bell tab; teal/amber glows
Not this:    Not twin phone mockups; not Vitals/Appointments/Records; not Haven poured frame
```

## Evidence

- Side-by-side: `docs/validation/dashboards/saffron-dusk-compare.jpg`
- Captures looked at: overview ☐ · overview full length ☐ · every page ☐ · phone full length ☐ · each variant ☐
- `node scripts/build.mjs`: pending · `node scripts/dashboards-check.mjs saffron-dusk`: pending

## The eleven questions

| # | Question | Yes / No | Note |
|---|---|---|---|
| 1 | Same form as its own reference, and unlike other dashboards | Yes | Wide adaptation |
| 2 | Blocks and heading breaks in the reference's places | pending | compare sheet |
| 3 | Uses the screen as the reference does | Yes | |
| 4 | Right style framework and depth on each surface | Yes | F2+F7 |
| 5 | Art is part of its surface; 3D is really 3D | N/A | no WebGL |
| 6 | Charts match their numbers | Yes | day bars |
| 7 | Nothing spilling, overlapping or empty below the fold | pending | |
| 8 | Inner pages belong to this product | Yes | Progress/Sessions/Profile |
| 9 | All content is this dashboard's own | Yes | Mira Nazari sample |
| 10 | Phone reads correctly top to bottom | pending | |
| 11 | Every variant is designed and readable | pending | dawn/night |

## Rounds

| Round | What I saw | What I changed |
|---|---|---|
| 1 | Twin phones on desktop | Rebuilt as one-wide cqw board |
| 2 | Dead controls from re-render | In-place attribute sync |
| 3 | Mobile rail overlay contrast | Rail in document flow at 375 |

## Used

- Interactions tested: pending click-test at 1440 and 375
- Keyboard and reduced motion tested: pending

## Result

**Not finished** — check loop in progress after rebuild.

Remaining gaps and why: awaiting check ✔ and ≥3 compare-sheet rounds with evidence.

## Tools used (required)

| Element | Tool or method used | Why this one | If a first choice could not run, what replaced it |
|---|---|---|---|
| Layout | `layout.json` boxes in `cqw` | Spec measured by maintainer | — |
| Hero object | N/A | No `object` in spec | — |
| Images | Existing `media/` avatars + procedural SVG dunes/stars | Backdrop must be no-photo | Procedural CSS/SVG |
| Motion | Motion (vendored) + CSS | Catalog motion | — |
| Glass / poured tabs | Style frameworks F2 + F7 | Liquid glass + poured fillets | — |
| Component behavior | Repo rulebook | Focus, 44px, reduced motion | — |

## Owner requirements (required)

| Id | What was done | Evidence (screenshot or compare-sheet box) | Holds at 1440 | Holds at 375 |
|---|---|---|---|---|
| R1 | One-wide `cqw` board; no phone mockups | compare sheet | pending | pending |
| R2 | Liquid glass on cards; teal/amber glows | compare water/gather/progress | pending | pending |
| R3 | Poured tabs: WATER, Share, Daily progress, bell | compare water/person/progress/arc | pending | pending |
| R4 | Rail: Today, Progress, Sessions, Profile | nav click-test | pending | pending |
| R5 | 375 Today=left, Profile=right, bottom bar visible | frames/phone | n/a | pending |
| R6 | Date beads, water steps, day bars, buttons mutate | dead-controls gate | pending | pending |

## Compare-sheet rounds (required)

| Round | Differences I named | Fixed |
|---|---|---|
| 1 | Desktop was twin phones | Replaced with adaptation layout |
| 2 | pending | |
| 3 | pending | |
