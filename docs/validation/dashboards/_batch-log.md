# Dashboard gallery batch log

One row per reference image in `inputs/dashboards/` (not stored in the repo), in filename order.

| Image file | # | id | Name | Style family | Use cases | Mode | Status | Notes (what was hard, what you replaced) |
|---|---|---|---|---|---|---|---|---|
| 01-weather-skyview.jpg | 1 | horizon-weather | Horizon Weather | cinematic | weather, travel | dark | skipped (already built as dashboard 1) | Same reference as the existing gold-standard dashboard. |
| 02-violet-mint-dark.jpg | 2 | pulsar-analytics | Pulsar Analytics | dark-neon | analytics, saas-admin | dark | done | The render has no readable text, so the domain (product analytics), every label and all data are invented. Kept: ticked dial, glossy orbs, layered wave areas over a purple floor glow, tall gradient pillars. |
| 03-ember-arc-dark.jpg | 3 | solstice-energy | Solstice Energy | cinematic | analytics, smart-home | dark | done | Unreadable render, so the domain (solar monitoring) and all copy are invented. The arc became a sun path with a movable sun; mountain art and round thumbnails are SVG/CSS. The bar+line combo chart was simplified to bars. |
| 04-payroll-moonlit.jpg | 4 | kumo-payroll | Kumo Payroll | cinematic | hr, finance | dark | done | Painted scene redrawn as themed SVG (moon, ink hills, waves, blossom branch). Pagoda, koi and lotus art left out as too detailed to draw well in code. Added a pay-period stepper and a next-steps list in place of the script quote panel. |
| 05-leaf-landing.jpg | 5 | canopy-reforest | Canopy Reforest | soft | project, analytics | dark | done | A landing page, not a dashboard: kept the hero, band and tile grid and gave them real data (reforestation tracker). Leaf photos and the forest photo are SVG drawings. Tile greens and browns were darkened to reach 4.5:1 with cream text. |
| 06-mist-mountain-grey.jpg | 6 | ridgeline-trails | Ridgeline Trails | editorial | travel, analytics | light | done | Unreadable render: domain and copy invented, its title wordmark not reused. Mountain photo redrawn as SVG ridges with mist bands and triangle trees; it is flatter than the photo. Art is masked so it never sits behind the chart. |
| 07-realestate-glass.jpg | 7 | haven-listings | Haven Listings | glass | real-estate | light | done | Villa render replaced with an SVG house and sky (simpler than the photo); source brand, logo mark, avatar and copy dropped. Glass card kept near-opaque for contrast. Added listings, price history and viewings below the stage so it works as a dashboard. |
| 08-palette-navy-sand.jpg | | | | | | | skipped (not a dashboard: colour palette sheet) | |
| 09-palette-luxury.jpg | | | | | | | skipped (not a dashboard: colour palette sheet) | |
| 10-colorpsych-light.jpg | | | | | | | skipped (not a dashboard: colour psychology chart) | |
| 11-colorpsych-dark.jpg | | | | | | | skipped (not a dashboard: colour psychology chart) | |
| 12-wellness-ring-tablet.jpg | 8 | aura-ring | Aura Ring | glass | health | dark | done | Product photo of a tablet: rebuilt the screen only. Ring photo, 3D body figure and brain render replaced with an SVG ring, a simple figure with selectable points and a CSS orb. Background darkened from the reference so white text passes contrast. |
| 13-wellness-ring-flat.jpg | 9 | lull-sleep | Lull Sleep | soft | health | light | done | Same screen as 12. Built as a different dashboard (sleep detail page) using only its gradient, pills and two-weight headline, so the two are not copies. |
| 14-dental-mobile.jpg | 10 | smile-dental | Pearlwell Dental | soft | health | light | done | Six phone screens merged into one responsive portal (nearest layout). 3D teeth and props replaced with an SVG tooth, shield and tooth chart; profile photos replaced with initials. |
| 15-medical-mobile.jpg | 11 | vitalis-care | Vitalis Care | bento | health | light | done | Six phone screens merged into a bento desktop layout, kept distinct from Pearlwell Dental (same design set). Photos replaced with initials, 3D props with an SVG heart. |
| 16-music-clay.jpg | 12 | mallow-music | Mallow Music | skeuo | media | light | done | Cartoon character and photos replaced with SVG headphones, plant, room and generated covers. Player is a still state (no timers). |
| 17-pastel-3d-kit.jpg | 13 | taffy-analytics | Taffy Analytics | minimal | saas-admin | light | done | UI kit with placeholder text, built as the nearest dashboard (product analytics) using its capsule bars, round buttons and elastic switches. |
| 18-liquid-glass-kit.jpg | 14 | prism-workspace | Prism Workspace | glass | saas-admin | light | done | UI kit with placeholder text, built as the nearest dashboard (workspace settings) using its pills, orbs, suggestion list, switches and folder card. |
| 19-parrot-dark.jpg | 15 | plumage-survey | Plumage Bird Survey | cinematic | analytics | dark | done | Unlabelled render; given a bird-survey dataset. Painted parrot and leaves redrawn as simple SVG. |
| 20-gaming-chest.jpg | 16 | hollow-vault | Hollow Vault | dark-neon | media | dark | done | Reframed from paid crypto chests to keys earned by play, with drop rates shown and no purchases. Witch art and 3D items replaced with SVG relics. |
| 21-autumn-widgets.jpg | 17 | larchwood-lodge | Larchwood Lodge | bento | hospitality | dark | done | Small, unreadable widget sheet; given a cabin guest-hub job. Landscape painting redrawn as SVG layers. |
| 22-smarthome-amber.jpg | 18 | hearth-nest | Hearth Nest | cinematic | smart-home | dark | done | Warm amber smart-home: SVG living-room hero with device nodes, weather, AQI arc, thermostat, device toggles, power bars, brightness slider. NexHome brand dropped. |
| 23-smarthome-grey-glass.jpg | 19 | veil-rooms | Veil Rooms | glass | smart-home | dark | done | Grey glass lighting-first smart home; distinct from Hearth Nest. Fixture panel + device cards. |
| 24-smarthome-room-glass.jpg | 20 | atrium-living | Atrium Living | glass | smart-home | light | done | Glass panels over SVG atrium room; energy/climate/security angle. |
| 25-blue-radial.png | 21 | glacier-ops | Glacier Ops | data-dense | analytics | dark | done | Blue radial HUD with central topo dial and dense satellite charts. |
| 26-reading-tracker.png | 22 | folio-club | Folio Club | soft | education, media | dark | done | Reading tracker with metric tiles, leaderboard and activity; fictional books. |
| 27-bigscreen-blue.png | 23 | citadel-wall | Citadel Wall | data-dense | analytics, logistics | dark | done | Navy big-screen wall display with cyan glow and SVG core; English ops copy. |
| 28-glass-panels.png | 24 | aether-pane | Aether Pane | glass | analytics, saas-admin | dark | done | Cyan glass analytics HUD with revenue, performance and journey charts. |
| 29-fitness-photo.png | 25 | forge-fitness | Forge Fitness | cinematic | health | dark | done | Fitness over SVG gym silhouette (no real people); steps, sleep, heart, focus. |
| 30-health-lime.png | 26 | zest-health | Zest Health | bold | health | light | done | Lime health overview; distinct from Aura/Lull/Pearlwell/Vitalis. |
| 31-sales-lime.png | 27 | orchard-sales | Orchard Sales | bento | crm, analytics | light | done | Lime sales bento; distinct from Zest Health. |
| 32-finance-lilac.png | 28 | mauve-ledger | Mauve Ledger | glass | finance | light | done | Lilac finance glass; distinct from Kumo Payroll. |
| 33-cersanit-bath.jpg | 29 | tidebath-showroom | Tidebath | soft | ecommerce, hospitality | light | done | Landing reframed as bathroom showroom; SVG carousel rooms; brand not Cersanit. |
| 34-softui-dune.jpg | 30 | dune-panels | Dune Panels | skeuo | analytics | light | done | Soft-UI sand/sage board with fabric wave SVG and recessed donut well. |
| 35-softui-pebble.jpg | 31 | pebble-studio | Pebble Studio | skeuo | saas-admin | light | done | Cream/pink soft UI with blobs, knobs and torus dial. |
| 36-adroid-soc.jpg | 32 | copper-radar | Copper Radar | soft | analytics | light | done | Copper SOC radar; fictional vendors only. |
| 37-orbit-clay.jpg | 33 | orbit-clay | Orbit Clay | skeuo | media | light | done | Clay astronaut helmet + calibration landscape twin phones. |
| 38-ramadan-glass.jpg | 34 | saffron-dusk | Saffron Dusk | glass | health, education | light | done | Fasting-day wellness glass; invented people. |
| 39-climate-glass.jpg | 35 | clima-pane | Clima Pane | glass | smart-home | light | done | Glass climate dial distinct from prior smart-home boards. |
| 40-medit-soft.jpg | 36 | meridian-labs | Meridian Labs | soft | health | light | done | Soft diagnostics with SVG DNA; not medit brand. |
| 41-core-brain.jpg | 37 | cortex-well | Cortex Well | glass | health | light | done | Lilac glass health with SVG brain bowl. |
| 42-ahk-indoor.jpg | 38 | ember-rooms | Ember Rooms | skeuo | smart-home | light | done | Neumorphic lighting control; English invented copy. |
