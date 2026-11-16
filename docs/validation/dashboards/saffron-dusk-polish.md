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
- Captures looked at: overview ☑ · overview full length ☑ · every page ☑ · phone full length ☑ · each variant ☑ · tablet 768 ☑
- `node scripts/dashboards-check.mjs saffron-dusk`: ✔

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
| 10 | Phone reads correctly top to bottom | Yes | Today left / Profile right; bottom rail |
| 11 | Every variant is designed and readable | Yes | dawn/night |

## Owner rejection rounds (responsive + liquid)

### Round A — look (pre-fix)

| Width | What was wrong |
|------:|---|
| 1440 | Wide board present; glass rims/glows still short of reference liquid language |
| 768 | Tiny scaled desktop (aspect-ratio lock → ~722×448); not a tablet layout |
| 375 | Tab bar at **top** (DOM order); Today/Profile stacks otherwise OK |

### Round A — fix

- Added `@media (max-width:1100px) and (min-width:721px)` tablet: unlock aspect-ratio, grid reflow, px side rail
- Mobile: `order` puts rail at bottom; fixed frame height so tab bar stays in-view on tall pages
- Boosted liquid glass: blur 28px, brighter rims, stronger teal/amber glows, larger poured `--f`

### Round B — look (post-fix screenshots opened)

| Width | What I saw | Still wrong |
|------:|---|---|
| 1440 | One-wide board; vertical rail; glows on water/gather/daily; poured WATER/Share/Daily/bell | Title flourishes + arc sun still softer than reference |
| 768 | Tall grid board; side rail; 2-col water\|gather + person\|daily; distinct from phone & desktop | Gather pill could be taller; rail labels a bit tight |
| 375 | Bottom tab fully visible; Today≈left; Profile≈right; countdown untruncated | Upgrade contrast failed check → darkened m-upgrade |

### Round B — fix

- Gather overflow visible so amber glow escapes; mobile arc mask off for full bell text
- Stronger date-bead + rail active glow; glowing flame well on upgrade
- Opaque dark m-upgrade for WCAG on profile 375

## Used

- Interactions: all four routes at 1440 / 768 / 375; date beads + water segments; rail `aria-current`
- Keyboard / reduced motion: focus-visible rings; motion gated

## Result

**Finished with a stated gap**

Remaining: reference still denser on title flourishes and arc sun; poured fillets can go another notch on rail icons. Spec gates green. Do not merge.

## Owner requirements

| Id | What was done | Holds at 1440 | Holds at 768 | Holds at 375 |
|---|---|---|---|---|
| R1 | One-wide cqw board; no phone mockups | Yes | Yes (reflow, not phones) | Yes |
| R2 | Liquid glass + teal/amber glows | Yes | Yes | Yes |
| R3 | Poured WATER / Share / Daily / bell | Yes | Yes | Yes |
| R4 | Rail Today/Progress/Sessions/Profile | Yes | Yes | Yes |
| R5 | 375 Today=left, Profile=right, bottom bar | n/a | n/a | Yes |
| R6 | Controls mutate | Yes | Yes | Yes |
| NEW | Desktop ≠ tablet ≠ mobile | desktop board | intermediate grid | phone stack |

## Compare-sheet rounds

| Round | Differences I named | Fixed |
|---|---|---|
| 1–3 | Twin phones; flat rail; weak glows | Prior rebuild |
| 4 | Tablet was tiny-desktop; mobile rail on top | Tablet breakpoint; bottom `order` |
| 5 | Gather glow clipped; bell truncated; upgrade contrast | overflow/mask/opaque upgrade |
