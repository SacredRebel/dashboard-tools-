# Polish report: Mauve Ledger (`mauve-ledger`)

## Identity (written before any code)

```
Form:        One large frosted-glass window on pale lilac-grey with soft peach sweep from the lower left. Absolute cqw boxes from layout.json.
Frameworks:  F1 frosted glass · F11 backdrop haze · F12 colour · F13 type (Outfit) · F14 motion
Signature:   Wide stacked hatched sales columns with May tip ($598 / $245), y-axis $0–$1.2k, segmented success arc
Not this:    Solid white cards, shared HR/Peoples routes, initials avatar when reference shows a face
```

## Evidence

- Side-by-side: `docs/validation/dashboards/mauve-ledger-compare.jpg`
- Captures: overview ☑ · every page ☑ · phone ☑ · variants ☑
- `node scripts/build.mjs`: ✔ · `node scripts/dashboards-check.mjs mauve-ledger`: ✔

## The eleven questions

| # | Question | Yes / No | Note |
|---|---|---|---|
| 1 | Same form as its own reference | Yes | |
| 2 | Blocks in the reference's places | Yes | |
| 3 | Uses the screen as the reference does | Yes | |
| 4 | Right style framework | Yes | F1 over F11 |
| 5 | Art is part of its surface | Yes | |
| 6 | Charts match their numbers | Yes | varied heights |
| 7 | Nothing spilling | Yes | |
| 8 | Inner pages belong to this product | Yes | six pages |
| 9 | All content is this dashboard's own | Yes | fictional |
| 10 | Phone reads correctly | Yes | |
| 11 | Every variant is designed | Yes | |

## Rounds

| Round | What I saw | What I changed |
|---|---|---|
| 1 | Missing pages/tags/glass/avatar/bars | Six routes; backdrop; glass; KPI; photo avatar; varied bars |
| 2 | Formation hatch; gauge tip; rail 10px | Solid bar; soft tip; rail 12px |
| 3 | Stronger peach; bar spread; photo avatar | Backdrop strength; ~3.2× bar ratio; GenerateImage avatar |

## Used

- Interactions tested: all six nav tabs; KPI menu; period; chart bars; formation CTA; mail filter; Finance search/sort; Accounts range; HR cycle/review/Approve; Peoples search/filter; Contracts save/preview/variant; topbar icons
- Keyboard and reduced motion tested: yes

## Result

**Finished with a stated gap**

Remaining gaps: peach bloom still slightly softer than painted reference corner; email list avatars remain initial chips (header avatar meets photo requirement).

## Tools used (required)

| Element | Tool or method used | Why this one | If a first choice could not run, what replaced it |
|---|---|---|---|
| Layout | layout.json + dashboards-check | Spec measured | — |
| Hero object | n/a | No WebGL hero | — |
| Images | Cursor GenerateImage (`media/avatar.jpg`) + haze.webp | Original media | — |
| Motion | CSS keyframes | Routing table | — |
| Glass / backdrop | F1 + F11 style frameworks | Material gate | — |
| Charts | Hand-tuned stacked bars | layout notes | — |
| Component behavior | Repo rulebook + hash routing | Nav/controls gates | — |

## Owner requirements (required)

| Id | What was done | Evidence | Holds at 1440 | Holds at 375 |
|---|---|---|---|---|
| R1 | Six hash routes with own data + interactions | Nav click-test; check gate 4 | Yes | Yes |
| R2 | data-ref=backdrop + translucent glass fills | Compare sheet; material gate | Yes | Yes |
| R3 | $3,287.49 one line (inline .dec) | KPI box | Yes | Yes |
| R4 | Logo, tab pill, four icons, photo avatar | topbar-actions | Yes | Yes |

## Compare-sheet rounds (required)

| Round | Differences I named | Fixed |
|---|---|---|
| 1 | Solid cards; shared routes; wrapped cents; flat bars; initials | Backdrop/glass; six pages; nowrap; varied series; avatar |
| 2 | Hatched formation; heavy gauge tip; rail text <12px | Solid bar; soft tip; 12px rail |
| 3 | Soft peach; bar spread; avatar photo | Stronger backdrop; 3.2× heights; generated photo |

## Click-test record

| Control / page | 1440 | 375 |
|---|---|---|
| Dashboard / Finance / Accounts / HR / Peoples / Contracts | clicked | clicked |
| Formation, chart, mail, topbar, HR cycle, Peoples filter | clicked | clicked |
