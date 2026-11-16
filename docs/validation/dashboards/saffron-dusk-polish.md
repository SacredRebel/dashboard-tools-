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
- Captures looked at: overview ☑ · overview full length ☑ · every page ☑ · phone full length ☑ · each variant ☑
- `node scripts/build.mjs`: ✔ · `node scripts/dashboards-check.mjs saffron-dusk`: ✔

## The eleven questions

| # | Question | Yes / No | Note |
|---|---|---|---|
| 1 | Same form as its own reference, and unlike other dashboards | Yes | Wide adaptation, not twin phones |
| 2 | Blocks and heading breaks in the reference's places | Yes | layout.json boxes |
| 3 | Uses the screen as the reference does | Yes | |
| 4 | Right style framework and depth on each surface | Yes | F2+F7 |
| 5 | Art is part of its surface; 3D is really 3D | N/A | no WebGL |
| 6 | Charts match their numbers | Yes | day bars vary |
| 7 | Nothing spilling, overlapping or empty below the fold | Yes | check green |
| 8 | Inner pages belong to this product | Yes | Progress/Sessions/Profile |
| 9 | All content is this dashboard's own | Yes | Mira Nazari sample |
| 10 | Phone reads correctly top to bottom | Yes | Today left / Profile right |
| 11 | Every variant is designed and readable | Yes | dawn/night |

## Rounds

| Round | What I saw | What I changed |
|---|---|---|
| 1 | Twin phones on desktop | Rebuilt as one-wide cqw board to layout.json |
| 2 | Dead controls from re-render; mobile rail overlay | In-place sync; rail in document flow at 375 |
| 3 | Compare: rail flat, title heavy, dates weak glow, upgrade flame side | Glassier rail, thinner Fraunces, date glow, upgrade flame right |

## Used

- Interactions tested: rail Today/Progress/Sessions/Profile at 1440 and 375; date beads, water steps, day bars (desktop), remind, gather, share, upgrade at 1440; Today controls + Profile stack at 375
- Keyboard and reduced motion tested: focus-visible rings present; motion gated on prefers-reduced-motion

## Result

**Finished with a stated gap**

Remaining gaps and why: Compare sheet still shows thinner liquid edge / poured fillet fidelity vs reference on rail and arc (visual polish within layout boxes). Spec numbers and gates are green. Only maintainer merges.

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
| R1 | One-wide `cqw` board; no phone mockups | `saffron-dusk-compare.jpg` · `frames/desktop.jpg` | Yes | Yes |
| R2 | Liquid glass on cards; teal/amber glows under water/gather/progress | compare water/gather/progress | Yes | Yes |
| R3 | Poured tabs: WATER, Share, Daily progress, bell line | compare water/person/progress/arc | Yes | Yes |
| R4 | Rail: Today, Progress, Sessions, Profile each with own page | click-test log `/tmp/saffron-click/log.txt` | Yes | Yes |
| R5 | 375 Today=left stack, Profile=right stack, bottom bar fully visible | `frames/phone.jpg` · m375 profile click | n/a | Yes |
| R6 | Date beads, water steps, day bars, buttons mutate visible state | check dead-controls ✔ · click-test | Yes | Yes (day bars/share on Profile page) |

## Compare-sheet rounds (required)

| Round | Differences I named | Fixed |
|---|---|---|
| 1 | Desktop was twin phone mockups | Replaced with adaptation layout boxes |
| 2 | Rail too solid; title too heavy; date active glow weak; upgrade flame on wrong side | Glassier rail, weight 300 title, warmer bead glow, flex-direction row-reverse on upgrade |
| 3 | Water drop well flat; dune clip clipped gear | Radial well on drop; softer dune clip-path |
