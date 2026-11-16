# Saffron Dusk · fidelity

Form: twin liquid-glass phones as the reference hero; desktop wraps them in the **same** liquid family — dune/silk world, frosted chrome, tinted gutter panes — not a bolted-on opaque dashboard.
Frameworks: F1 frosted 5-layer + F2 liquid (bright rim, hue glow, specular, optional refraction) · F7 dune/upgrade organic cuts · F11 dune-silk atmosphere · F14 entrance/specular/route.
Signature: cream Today (olive sun-arc, teal water, saffron gather) beside olive Profile (cream person, amber day bars, cut upgrade), framed by gold–sage gutter glass.
Not this: not Mauve frosted board, not Haven single device, not opaque cream tiles or flat slate cards.

## Liquid look-fix-look

### Round 1 (materials)
- Dropped opaque cream (~0.88–0.92) fills; rebuilt shared `.sd-liquid` / desk / page panes as 5-layer glass (blur 26 / saturate 175, tint gradient, bright inset rim, soft-light specular, soft shadow).
- Phone cards + shells made see-through so dune/silk reads through; brighter rims; stronger SVG displacement.
- **Still wrong vs ref:** light text on arc/water washed out (AA fail); silk asset undersized; some secondary pages too thin on night.

### Round 2 (materials + AA)
- Raised dark-card tints (~0.76–0.82) and muted specular wash on arc/water/nav so light type hits ≥3.9 while rims/blur stay.
- Cream panes ~0.68–0.82 with rim + specular (not solid tiles); day-bar labels on mini glass pills; silk upscaled.
- Check → ✔.

## Desktop vs phone
| Surface | Liquid treatment |
|---|---|
| Desktop chrome / gutters / page tiles | Same 5-layer recipe + per-pane hue tint (gold / teal / olive / cream) matching phone cards |
| Twin phones | Translucent shells; liquid cards with bright rims; silk visible through profile |

## Check
`node scripts/dashboards-check.mjs saffron-dusk` → ✔

## Remaining gaps (honest)
- Reference characters / painted dune illustration inside phones still differ (generated avatars + CSS dunes).
- Arc/water are denser than the most milky reference panes so AA holds — liquid reads via rim/blur/specular more than extreme see-through.
- `url(#sd-liquid)` refraction is progressive-enhancement only.
- Desk modules hide below ~1100px.
