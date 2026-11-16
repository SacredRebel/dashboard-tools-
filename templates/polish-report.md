# Polish report: <dashboard name> (`<id>`)

> Fill this in for every build or finishing pass. Method: [docs/dashboards/06-verification.md](../docs/dashboards/06-verification.md). Save as `docs/validation/dashboards/fidelity/<id>.md`.

## Identity (written before any code)

```
Form:        
Frameworks:  
Signature:   
Not this:    
```

## Evidence

- Side-by-side (reference | ours): `docs/validation/dashboards/fidelity/<id>-compare.jpg`
- Captures looked at: overview ☐ · overview full length ☐ · every page ☐ · phone full length ☐ · each variant ☐
- `node scripts/build.mjs`: ✔ / ✖ · `node scripts/dashboards-check.mjs <id>`: ✔ / ✖

## The eleven questions

| # | Question | Yes / No | Note |
|---|---|---|---|
| 1 | Same form as its own reference, and unlike other dashboards | | |
| 2 | Blocks and heading breaks in the reference's places | | |
| 3 | Uses the screen as the reference does | | |
| 4 | Right style framework and depth on each surface | | |
| 5 | Art is part of its surface; 3D is really 3D | | |
| 6 | Charts match their numbers | | |
| 7 | Nothing spilling, overlapping or empty below the fold | | |
| 8 | Inner pages belong to this product | | |
| 9 | All content is this dashboard's own | | |
| 10 | Phone reads correctly top to bottom | | |
| 11 | Every variant is designed and readable | | |

## Rounds

| Round | What I saw | What I changed |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |

## Used

- Interactions tested: 
- Keyboard and reduced motion tested: 

## Result

**Polished / Finished with a stated gap / Not finished**

Remaining gaps and why: 

## Tools used (required)

One row per element. Ids come from `catalog/tools.json`; the routing table is in [docs/dashboards/08-object-spec.md](../docs/dashboards/08-object-spec.md#tool-routing-required-recorded).

| Element | Tool or method used | Why this one | If a first choice could not run, what replaced it |
|---|---|---|---|
| Layout | | | |
| Hero object | | | |
| Images | | | |
| Motion | | | |

## Owner requirements (required)

One row per requirement id in `layout.json`. Check every row again before every push, at both widths.

| Id | What was done | Evidence (screenshot or compare-sheet box) | Holds at 1440 | Holds at 375 |
|---|---|---|---|---|
| R1 | | | | |

## Compare-sheet rounds (required)

| Round | Differences I named | Fixed |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |

