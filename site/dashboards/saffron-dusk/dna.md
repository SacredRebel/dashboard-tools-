# Saffron Dusk · design DNA

Worked example of the DNA sheet ([docs/dashboards/09-image-to-dashboard.md §2](../../../docs/dashboards/09-image-to-dashboard.md)), written by the maintainer from `reference.jpg` (1200×900, two phones: Today at x 200–540, Profile at x 628–965). Pixel values are at reference scale.

## Backdrop
1. Canvas: smooth sage-grey to slate gradient, lighter top-left (#9aa59f) to darker bottom-right (#4f5b57). No texture.
2. Left screen body: warm cream frosted glass (#f3eedb → #e9e4cf), very soft. Behind the cards a **molded relief**: the surface rises in soft ridges that follow the cards' outlines, about 8–12px wide, light rim on the upper-left of each ridge, soft shadow on the lower-right. The cards look pressed into one continuous liquid tray, not placed on top of it.
3. Under the gathering card: a sage hollow (#b8c1b1) with **hanging four-point stars**, each on a thin vertical thread (1px, 40–90px long, alpha 0.35): two dark-green stars (14–20px), one pale teal star (16px), plus 6–8 tiny dots. The threads drop from the gathering card's bottom edge like lanterns.
4. Right screen: the top 190px is a **dark dune sky** (#3b3524 → #1f1d14) with three layered sand ridges in lighter taupe, a few faint dots, and one large bright four-point star (34px, cream glow) near the top centre. The bottom half of the right screen is muted olive-taupe frosted glass (#8b8569 → #a49d80) with diagonal light bands.
5. Nav area: the bottom 80px of each screen is a slightly lighter frosted band whose top edge curves gently.

## Shape grammar
- **Tab** (left, top): WATER, 86×28, rises from the teal card's top-left with concave fillets (r ≈ 10) into the card's top edge.
- **Tab** (right, top): DAILY PROGRESS, about 150×30, on the amber card's top-right; the profile card's bottom sits just above it.
- **Notch / break-out**: the avatar (85×85, rounded square r 18) sits at the profile card's top-left, about 30% outside the card's left and top edges; the card outline wraps around it.
- **Cut tab** (bottom-left): Share, 125×40, cut out of the profile card's lower-left in a lighter glass with a sparkle icon.
- **Bell line**: "Iftar in 1hr 34min" sits in the arc card's lower band, right-aligned, with a small bell; the band itself flows down into the Water tab.
- **Slant**: Upgrade tray's top edge rises from left to right (about 18px over 295px); its right side flares out like a shelf.
- **Bump**: the active nav item sits in a raised dome (about 50px wide, 14px high) on the nav band's top edge, with a light ring.
- **Pills**: the gathering card is a full pill (r = h/2), saffron-orange, with a thin dark vertical bar at the left.
- Overlaps everywhere: avatar over card edge; Share over profile card; profile over daily; the sky behind the profile card.

## Materials
| surface | material |
|---|---|
| Arc card top | cream frosted glass, alpha ~0.55, blur ~20px, white rim 1.5px |
| Arc card lower band | taupe smoked glass (#8c8370 → #6f6754), alpha ~0.7 look, soft top edge (no hard line) |
| Water card | bright teal liquid glass (#7fd6dc → #4fb9c6), inner light top-left, teal glow below (blur 24px) |
| Gathering pill | saffron glass (#f2b061 → #e08e3c), warm glow below |
| Profile card | cream frosted glass (#f1ead6), alpha ~0.6, white rim |
| Daily card | amber glass (#f4c66a → #e7a948), bright inner glow, bars dark olive |
| Upgrade tray | olive smoked glass (#7b7660), light rim, flame icon cream |
| Nav band | pale frosted glass, active dome with teal-tinted icon (#3c8f86) |

## Palette and type
- Ink #2a2e22 (labels), deep olive #3c4a34 (crescent, icons), cream #f8f4e6, saffron #e8a04c, amber #f2c264, teal #5cc3cb, taupe #8c8370.
- Display: thin high-contrast serif with flourished swashes (RAMADAN, Good evening), weight ~300, wide tracking on RAMADAN (about 0.08em); superscript "9".
- Labels: small tracked caps (IMSAK, IFTAR, WATER, SESSIONS), 11–12px at reference scale, weight 600, tracking 0.12em.
- Numbers: 4:15AM light, 6:08PM bold saffron with small-caps AM/PM; "8" and "2" in the profile card set in the display serif.

## Nav
Bottom band on both screens: four items (Today, Progress, Sessions, Profile), outline icon over a small tracked caps label, evenly spaced. The active item (Today on the left screen, Profile on the right) sits in the raised dome with a soft white ring and a teal-tinted icon and label. Inactive items: olive-grey ink. No dark rail anywhere.

## Composition
- Left screen reads top to bottom in one centred column (x 228–513): title, date beads, arc card, water card, gathering pill, star hollow, nav. Gaps about 20–25px.
- Right screen: the dark sky fills the top 40%; the profile card overlaps its bottom edge; daily and upgrade follow, each tucked under the previous one.
- Empty space is deliberate: the star hollow on the left, the sky on the right.

## Element inventory
| element | construction | tool / primitive | box name |
|---|---|---|---|
| Title | display serif, WED small caps, superscript 9, crescent with star | Google Fonts serif + inline SVG | title |
| Date beads | 5 convex glass lenses on one frosted connector band; selected is dark with saffron halo | CSS glass + radial gradients | dates, date |
| Arc card | cream glass top with SVG sun arc and glowing sun; taupe lower band with times; bell line | SVG + CSS glass | arc |
| Water card | teal liquid glass, tab, drop in glass lens, 8-segment meter, litres text | shapes.js `tab` | water |
| Gathering pill | saffron glass pill, dark left bar, title and time, avatar right | CSS | gather |
| Star hollow | 3 stars on threads + dots | inline SVG | stars |
| Dune sky | layered ridges, big four-point star, Good evening, gear | SVG paths + gradients | sky |
| Profile card | cream glass, avatar break-out, name/email, 8 SESSIONS / 2 JOURNEYS, Share tab | shapes.js `notch` + cut tab | person |
| Daily progress | amber glass, tab top-right, tree icon, 7 gauges | shapes.js `tab` (right) | daily, day-bar |
| Upgrade tray | olive glass, sloped top, caps label, flame | shapes.js `slant` | upgrade |
| Nav | frosted band, 4 items, raised dome on active | shapes.js `bump` | nav |
| Journey (desktop/tablet only) | designed: this week's sessions on a thread of stars, dark dune glass | SVG + CSS glass | journey |
