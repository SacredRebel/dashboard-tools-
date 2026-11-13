# Dashboard gallery batch log

One row per reference image in `inputs/dashboards/` (not stored in the repo), in filename order.

| Image file | # | id | Name | Style family | Use cases | Mode | Status | Notes (what was hard, what you replaced) |
|---|---|---|---|---|---|---|---|---|
| 01-weather-skyview.jpg | 1 | horizon-weather | Horizon Weather | cinematic | weather, travel | dark | skipped (already built as dashboard 1) | Same reference as the existing gold-standard dashboard. |
| 02-violet-mint-dark.jpg | 2 | pulsar-analytics | Pulsar Analytics | dark-neon | analytics, saas-admin | dark | done | The render has no readable text, so the domain (product analytics), every label and all data are invented. Kept: ticked dial, glossy orbs, layered wave areas over a purple floor glow, tall gradient pillars. |
| 03-ember-arc-dark.jpg | 3 | solstice-energy | Solstice Energy | cinematic | analytics, smart-home | dark | done | Unreadable render, so the domain (solar monitoring) and all copy are invented. The arc became a sun path with a movable sun; mountain art and round thumbnails are SVG/CSS. The bar+line combo chart was simplified to bars. |
| 04-payroll-moonlit.jpg | 4 | kumo-payroll | Kumo Payroll | cinematic | hr, finance | dark | done | Painted scene redrawn as themed SVG (moon, ink hills, waves, blossom branch). Pagoda, koi and lotus art left out as too detailed to draw well in code. Added a pay-period stepper and a next-steps list in place of the script quote panel. |
