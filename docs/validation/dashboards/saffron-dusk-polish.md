# Polish report: Saffron Dusk (`saffron-dusk`)

## Identity (written before any code)

```
Form:        One wide dusk board (adaptation of twin phones); vertical glass rail; left Today + right Profile at 1440; at 375 Today=left, Profile=right, bottom tab bar
Frameworks:  F2 Liquid glass · F7 Organic poured tabs · F11 Backdrop/hero art · F12 Colour · F13 Fraunces + Plus Jakarta · F14 Motion
Signature:   Twin-phone liquid language on one desktop board; sun-arc with poured bell; teal water + amber gather glows; dune silk greeting
Not this:    Not Haven poured device frame; not Pulsar tiles; not twin phone shells on desktop
```

## Evidence

- Side-by-side: `docs/validation/dashboards/saffron-dusk-compare.jpg`
- Captures: overview ☑ · full length ☑ · every page ☑ · phone 375 ☑ · tablet 820 ☑ · checker tablet 1024 ☑ · variants ☑
- `node scripts/dashboards-check.mjs saffron-dusk`: ✔ (pages=4, variants=3, frames + shot@2x · pixel contrast · text ≥ 12px)

## The eleven questions

| # | Question | Yes / No | Note |
|---|---|---|---|
| 1 | Same form as its own reference | Yes | Wide adaptation, not twin phones |
| 2 | Blocks where the reference's are | Yes | layout.json boxes incl. rail-item, arc-times, bell, dune-line |
| 3 | Uses the screen as the reference does | Yes | |
| 4 | Right style framework / depth | Yes | F2+F7+F11 |
| 5 | Art part of its surface | Yes | atmosphere + dune panel + ridge lines |
| 6 | Charts match numbers | Yes | day bars vary |
| 7 | Nothing spilling / empty below fold | Yes | person card fills lower half |
| 8 | Inner pages belong | Yes | Progress/Sessions/Profile |
| 9 | Own content | Yes | Mira Nazari sample |
| 10 | Phone top-to-bottom correct | Yes | bottom rail pinned |
| 11 | Variants designed | Yes | dawn/night |

## Tools used (required)

| Element | Tool or method used | Why this one | If a first choice could not run, what replaced it |
|---|---|---|---|
| Layout | `layout.json` boxes in `cqw` + three media queries (desktop / tablet / phone) | Spec measured by maintainer; R7 distinct layouts | — |
| Glass / liquid (F2) | `docs/dashboards/05-style-frameworks.md` F2 + Haven `.hl-card` recipe | Liquid rim, glow, specular, refraction filter | surfaces skill not installed |
| Poured tabs (F7) | F7 radial-fillet recipe | WATER / Share / Daily / bell scoop | — |
| Backdrop (F11) | Cursor `GenerateImage` → `media/atmosphere-dunes.webp` | Luminous dune haze behind glass | Procedural SVG dunes kept as multiply layer |
| Dune panel (F11) | Cursor `GenerateImage` → `media/dune-panel.webp` + SVG `dune-line` ridges | Silk greeting + ≥3 layered ridge lines | Prior `dune-silk` kept as archive |
| Arc / sun | Inline SVG polyline ending at the sun + CSS cream disc and halo (`--cream`, `--gold`, `--saffron`) | Stretched SVG circles inherited a dark stroke and read as a black bullseye | — |
| Arc lower half | Shell `linear-gradient` frost (cream → olive → deep green), times row transparent | Solid black stripe on `.sd-arc-times` had a hard edge | — |
| Profile name | Copy block offset with `margin-left` clear of the overlapping avatar | Avatar covered “Mira Nazari” | — |
| Water litres | Plain `.sd-meta` under the segments, no fill, radius, or shadow | Dark chip behind the litres line | — |
| Gather pill | `border-radius: 999px` on a short wide card (desktop height 11cqw, within the layout tolerance) | Stadium on the tall box read as a round blob | — |
| Rail | Transparent glass items + circular active glow ring on icon | Reference: no black tiles | — |
| Colour (F12) | Pillow sample of `reference.jpg` regions | Sage/cream/olive/amber/teal tokens | — |
| Type (F13) | Fraunces thin display + Plus Jakarta tracked caps (`_vendor/fonts`) | R8: RAMADAN / Good evening thin high-contrast serif | — |
| Motion (F14) | Motion vendored + CSS | Entrance / live toast gated | — |
| Avatars | Existing `media/gather.webp`, `profile.webp` | Fictional faces already original | — |
| Component behavior | Repo rulebook | 44px, focus, reduced motion | — |
| Judging | Compare sheet + opened screenshots at 1440, 820, and 375 (round 4) | Twin contract §6 | — |

## Owner requirements

| Id | What was done | Evidence | 1440 | 768 | 375 |
|---|---|---|---|---|---|
| R1 | One-wide cqw board; no phone mockups | frames/desktop.jpg · compare | Yes | Yes | Yes |
| R2 | Liquid glass + teal/amber glows | water/gather/daily | Yes | Yes | Yes |
| R3 | Poured WATER / Share / Daily / bell | compare + overview | Yes | Yes | Yes |
| R4 | Today/Progress/Sessions/Profile pages | click log | Yes | Yes | Yes |
| R5 | 375 Today≈left, Profile≈right, bottom bar | frames/phone.jpg | n/a | n/a | Yes |
| R6 | Beads, water, day bars, buttons mutate | dead-controls ✔ | Yes | Yes | Yes |
| R7 | Three distinct layouts: desktop absolute cqw board; tablet two-column reflow + journey strip; phone Today=left screen / Profile=right screen with bottom bar — never swaps one for another | frames/desktop.jpg · frames/tablet.jpg · frames/phone.jpg · style.css media queries | Yes | Yes | Yes |
| R8 | Thin high-contrast Fraunces for RAMADAN + Good evening; small tracked caps for IMSAK/IFTAR/WATER/labels | overview + dune panel + compare | Yes | Yes | Yes |
| R9 | Backdrop layers on every page and size: sage→charcoal gradient, molded cream tray with relief ridges around Today, hanging stars on threads under Gather, dark dune sky behind Evening/Profile, frosted nav band | `.sd-backdrop*`, `.sd-tray`, `.sd-stars`, `.sd-evening`, `.sd-m-veil`, `.sd-dune`, `.sd-m-greet` in style.css; visible in all page captures | Yes | Yes | Yes |
| R10 | Organic shapes via `shapes.js`: WATER left tab, DAILY PROGRESS right tab, avatar notch with break-out, Share cut tab, Upgrade sloped top, nav raised dome on active item | `data-shape` + `data-shape-opts` on water/daily/person/share/upgrade/nav/tile cards; clip-path verified in DOM | Yes | Yes | Yes |
| R11 | Bottom frosted nav bar at desktop, tablet and phone; icon over small tracked label; raised dome (bump) on the active item; no dark side rail | `.sd-rail` bottom-docked at all sizes; `data-ref="nav"`; bump clip-path on `[aria-current]` | Yes | Yes | Yes |
| R12 | At 375 Today matches the reference's left screen and Profile matches the right screen box by box (stars under Gather included); bottom tab bar fully visible | `saffron-dusk-compare-overview-375.jpg` + `saffron-dusk-compare-profile-375.jpg`; all view boxes pass layout gate | n/a | n/a | Yes |
| R13 | Progress, Sessions and Profile keep the same backdrop, bottom nav, glass cards (blur + translucent fill + light edge) and shape grammar; no plain settings rows | page_style gate green on all four pages at 1440/375/820 and all variants; `.sd-card` tiles + shaped tab/wave/slant cards on inner pages | Yes | Yes | Yes |
| R14 | Clip-wrap refactor: `.sd-clip` wrappers carry `data-shape` + clip-path while inner `.sd-card.sd-glass` panes carry backdrop-filter (Chrome does not clip an element's own backdrop-filter). Pour labels are `nowrap` inside the tab silhouette at every size; stats padding clears the avatar; tray diagonal stripes replaced by smooth cream + soft relief | `probe-notch-final.mjs` pixel samples: water notch 239,231,209 cream / daily notch 174→165 warm wash at 1440, same at 820/375; DOM rects show label inside tab bounds and "8" clear of avatar; `backgroundImage` has no `repeating-` on `.sd-tray` | Yes | Yes | Yes |
| R15 | Every inner page opens with a hero surface (`.sd-hero` dune-sky band, `data-hero`; phone Profile uses the `.sd-m-greet` sky band) then mixes overview card types: teal + amber glass tiles, tab/notch/wave clip tiles, thread-of-stars sessions list, restyled week chart | hero probe: `.sd-hero` 1256×257 @1440, 734×150 @820, 335×112 @375 on progress/sessions/profile; `.sd-m-greet` 359×202 @375 profile; page grids carry teal/amber/clip/thread cards | Yes | Yes | Yes |

## Material look-for-look (this pass)

| Round | What I saw (opened screenshots) | What I changed |
|---|---|---|
| 1 | Black rail tiles; times stacked with labels; missing data-refs; water chip; empty person; bell clipped by mask | Transparent rail + glow; labels above / times in band; tagged boxes; plain water count; shell+bell outside mask |
| 2 | Rectangular active “tile” look; bell over iftar time @375; person lower empty; sun hard-edged | Circular icon-only glow; times clear of bell; soft sun glow layers; person stats flex fill |
| 3 | Compare: rail glass+ring OK; arc times+bell readable; person still airy below stats | Stats stretch with notes; divider full height; refreshed frames + compare |
| 4 | Black time stripe, bullseye sun, name under avatar, litres chip, round gather | Frosted lower half with no hard edge; cream sun; name clear; plain litres; wide pill. Layouts stay desktop / tablet reflow / phone stack |

## Compare-sheet rounds (required)

| Round | Differences I named | Fixed |
|---|---|---|
| 1 | Rail black tiles vs light-on-glass; times not in darker band; missing ridge lines; water chip; empty person; bell text clipped | Yes |
| 2 | Active glow read as dark tile; bell overlapped 6:08PM at 375; sun ring hard; person empty band | Yes |
| 3 | Person lower half still sparse vs reference; iftar gold vs cream balance | Yes |
| 4 | Arc: hard black time stripe; sun was a black bullseye; iftar not under IFTAR. Profile name under the avatar. Litres in a dark chip. Gather a round blob | Yes — soft frost gradient, cream sun with halo, iftar right-aligned, name beside the avatar, plain litres, wide pill. Checked at 1440, 820, and 375 |

## Result

**Finished with a stated gap**

Remaining: reference title flourishes and painted character art still denser than generated avatars; poured junctions can go denser at 200% zoom. The desktop gather pill is as wide as the 18.5×14 box tolerance allows (height 11cqw) and is still taller than the reference phone pill. Spec gates green. Do not merge.

## This pass (arc, sun, profile, water, gather)

Five fixes, three layouts left in place (absolute board at 1440, two-column reflow at 820, stacked Today / Profile at 375). Liquid glass, blur, rims, and glows kept.

| Fix | 1440 | 820 | 375 |
|---|---|---|---|
| Arc lower half | Soft cream-to-olive frost; imsak left, iftar under IFTAR; bell tab below the times | Same gradient; times sit above the bell, iftar at the right | Same; no opaque `#12160f` bar |
| Sun | Small cream disc, gold rim, saffron halo; arc stroke ends at the sun | Same circular marker (not stretched) | Same |
| Profile name | “Mira Nazari” starts to the right of the overlapping avatar | Same offset in the reflow card | Profile page avatar overlaps the corner; name and email sit to its right |
| Litres | Plain cream line under the segments, no chip | Plain line | Plain line on one row |
| Gather | Wide amber pill, avatar on the right | Wide pill in the right column | Full-width pill, not a circle |

## Maintainer polish (after PR 18)

- Water card is now light teal liquid glass with dark text, as in the reference (was dark green).
- Rail is frosted light glass with dark labels, as the reference nav bar (was near-black); night variant keeps a dark rail.
- Removed the grey box behind the profile stats.
- Phone: stars fill the empty sky between the gathering pill and the nav bar.
- Checked at 1440, 820 and 375 plus the Profile page; check passes on all pages and variants.

## Unfold rounds (layout.json contract, devin/saffron-unfold)

### Round 1 — structure pass

First full unfold: tray/stars/evening/sky/journey markup added, every box repositioned in cqw per the three size tables, `sd-card` + `data-shape` wired on inner pages, shapes.js imported, nav bump sync in app.js.

| box | what differs | fix | score |
|---|---|---|---|
| title | right column, weight ok; swash flourishes simplified | kept Fraunces WONK axis | 3 |
| dates | bead band position ok; beads small vs reference | widened hit area, kept glass pill | 3 |
| date | beads render; selected halo reads gold | verified ring + glow | 3 |
| arc | shell + sun + bell present; times row sat inside the mask cut | moved times up, padded right | 3 |
| water | teal tab cut works; tab label collided with tab corner | label repositioned | 3 |
| gather | saffron pill ok; avatar size approximate | kept generated avatar | 3 |
| stars | ornament added; thread/star sizes approximate | tuned % sizes per breakpoint | 3 |
| sky | dune panel + ridges + star present; greet weight ok | verified box | 3 |
| person | notch + avatar breakout + share tab; copy margin wrong at tablet | margin-left fix to clear avatar | 3 |
| daily | amber right tab; pour label failed contrast on dark composite | gradient/label fixes in round 2 | 3 |
| day-bar | bars render; today highlight ok | verified | 3 |
| upgrade | slant cut works; fill too light for its text | darkened with inner veil | 3 |
| journey | designed region present; text failed on light composite | darkened with inner veil | 3 |
| nav | frosted bar + bump dome; fill alpha too high, labels thin at 820 | alpha + label colour fixes | 3 |

### Round 2 — material and contrast pass

Checker run after round 1: all layout boxes inside tolerance; failures were contrast (journey/upgrade text, daily pour label, arc-times in the notch mask, person name over avatar at 820, nav labels at 820, 11.55px ramadan sup, nav glass alpha) and the profile desk grid hidden at desktop/tablet.

| box | what differs | fix | score |
|---|---|---|---|
| title | sup "9" measured 11.55px | font floor 12px | 4 |
| dates | ok | — | 4 |
| date | ok | — | 4 |
| arc | times row clipped by bell-tab mask zone | times moved above mask, right padding added | 4 |
| water | ok after alpha token fix | stops ≤ 0.62 | 4 |
| gather | ok | — | 4 |
| stars | ok | — | 4 |
| sky | ok | — | 4 |
| person | name sat under avatar at 820 | copy margin-left 33 percent | 4 |
| daily | pour label on corner arc + dark composite | label moved inward; medium dusk wash | 4 |
| day-bar | ok | — | 4 |
| upgrade | smoked tray read mid-grey; text failed | inner dark veil layer keeps glass alpha | 4 |
| journey | same composite problem | inner dark veil layer | 4 |
| nav | fill alpha over glass limit; labels failed at 820 | alpha ≤ 0.62; darker label colour | 4 |

### Round 3 — final verification

`node scripts/dashboards-check.mjs saffron-dusk`: zero failures — every layout box inside tolerance at 1440/820/375, all page_style gates (backdrop, nav, ≥3 glass cards, ≥1 shape per page), material glass checks, contrast and text-size audits, dead-control and nav-page checks green on all four pages and three variants. Captures: `saffron-dusk-1440|820|375-{overview,progress,sessions,profile}.jpg` plus checker compare sheets.

| box | what differs | fix | score |
|---|---|---|---|
| title | thin Fraunces caps match weight/spacing; reference's hand-painted swash flourishes are simplified to the font's WONK axis | documented residual | 4 |
| dates | frosted pill + bead strip matches; bead gloss is CSS-approximated | documented residual | 4 |
| date | circular beads, selected gold halo ring | verified | 4 |
| arc | cream-to-smoked shell, gold sun, bell tab, times band; curve smoother than the reference's sketchy arc | documented residual | 4 |
| water | teal left tab, drop icon, eight segments, litres line | verified | 4 |
| gather | saffron pill with round avatar; copy breaks slightly differently | documented residual | 4 |
| stars | three hanging four-point stars on threads + dots; ink-drawn in reference, CSS-drawn here | documented residual | 4 |
| sky | dark dune panel, layered ridges, thin-serif greet, gear, one bright star | verified | 4 |
| person | notch bite, avatar break-out, share cut-tab, stats row | verified | 4 |
| daily | amber right tab, tree glyph, seven day bars, note line | verified | 4 |
| day-bar | rounded bars, current day highlighted | verified | 4 |
| upgrade | smoked slant tray, flame medallion, tracked caps | verified | 4 |
| journey | designed region (not in the reference): vertical thread of stars and times | contract-designed | 4 |
| nav | frosted bottom bar, icon over tracked label, raised dome on active | verified | 4 |

Remaining honest differences: the reference's title flourishes and painted character art are denser than the font axes and generated avatars; the journey card is a maintainer-designed region with no reference counterpart; poured-tab junctions are cleaner vector cuts than the reference's inked edges.

## Round 2 defects pass (maintainer review, devin/saffron-unfold)

The maintainer found eight defects my earlier rounds scored ≥4. Root cause for the tab blocks: Chrome does not clip an element's own `backdrop-filter`/`filter` output by its `clip-path`, so the glow + glass on the shaped card itself painted into the notch region beside the tab. Fix pattern: `.sd-clip` wrapper owns `data-shape`/clip-path/drop-shadow; inner `.sd-card.sd-glass` owns backdrop-filter and `data-ref`.

### Round 4 — defect audit (before fixes)

| box | what differs | fix | score |
|---|---|---|---|
| title | ok | — | 4 |
| dates | ok | — | 4 |
| date | ok | — | 4 |
| arc | ok | — | 4 |
| water | pale block right of tab at all sizes — unclipped glass/glow in notch | clip-wrap refactor | 2 |
| gather | ok | — | 4 |
| stars | ok | — | 4 |
| sky | ok | — | 4 |
| person | avatar covers the "8" in SESSIONS at 1440 | stats padding-left 34% | 3 |
| daily | label clipped to "LY PROGRESS"; olive block left of tab | nowrap label inside tab + clip-wrap | 2 |
| day-bar | ok | — | 4 |
| upgrade | text right-aligned, left half empty | flex row, tracked caps left, flame right | 2 |
| journey | tablet: empty dark slab, labels in one row; nav outside frame on dark strip | 4-col thread grid; frame height cap; nav inside | 3 |
| nav | bottom bar correct at 1440/375, sat outside frame at 820 | tablet frame aspect + rail inside | 3 |

Also found (not scored boxes): tray diagonal stripes the reference does not have; inner pages were uniform cream tiles with no hero and Progress ended in grey blob bars; phone Profile repeated the daily-label clip.

### Round 5 — fix pass, first verification

Clip-wrap applied to water, daily, person, upgrade and both phone-profile clones; `data-ref` moved onto the glass panes; pour labels `nowrap` + repositioned; stats clear the avatar; tray stripes → smooth cream + inset relief; evening wash → soft radial; tablet journey → composed grid; inner pages → `data-hero` dune band + teal/amber/tab/notch/wave/thread variety; week chart restyled off grey blobs.

| box | what differs | fix | score |
|---|---|---|---|
| title | ok | — | 4 |
| dates | ok | — | 4 |
| date | ok | — | 4 |
| arc | ok | — | 4 |
| water | notch now shows tray cream (pixel-verified 239,231,209); label inside tab | verified | 4 |
| gather | ok | — | 4 |
| stars | ok | — | 4 |
| sky | ok | — | 4 |
| person | "8" clear of avatar at 1440 and 820 (rect probe) | verified | 4 |
| daily | notch shows soft evening wash not a block; full "Daily progress" inside tab at 1440/820/375 | verified | 4 |
| day-bar | ok | — | 4 |
| upgrade | left caps + right flame correct; text still wrapped inconsistently across sizes | `em` set to block for deterministic two lines | 3 |
| journey | tablet grid composed, 7 thread items; nav inside frame | verified | 4 |
| nav | inside frame bottom at all three sizes | verified | 4 |

### Round 6 — final verification

`node scripts/dashboards-check.mjs saffron-dusk`: zero failures — layout boxes in tolerance at 1440/820/375, page_style + hero gates green on all four pages and three variants, glass material, contrast, covered/clipped-text audit, dead controls and nav-page checks all pass. Pixel probes confirm backdrop through every tab notch; DOM rects confirm labels inside silhouettes and stats clear of the avatar.

| box | what differs | fix | score |
|---|---|---|---|
| title | thin Fraunces caps; reference's hand-painted swash flourishes remain simplified to the font's WONK axis | documented residual | 4 |
| dates | frosted pill + bead strip; bead gloss CSS-approximated | documented residual | 4 |
| date | circular beads, selected gold halo | verified | 4 |
| arc | cream-to-smoked shell, gold sun, bell tab, times band; curve smoother than the reference's sketchy arc | documented residual | 4 |
| water | teal left tab, label fully inside, backdrop through the notch at every size | verified by pixel probe | 4 |
| gather | saffron pill, round avatar; copy breaks slightly differently | documented residual | 4 |
| stars | three hanging four-point stars on threads; CSS-drawn vs ink-drawn | documented residual | 4 |
| sky | dark dune band, layered ridges, thin-serif greet, gear, bright star | verified | 4 |
| person | notch bite, avatar break-out, share tab, stats clear of avatar | verified | 4 |
| daily | amber right tab, full tracked label inside, backdrop through notch | verified by pixel + rect probes | 4 |
| day-bar | rounded bars, current day highlighted | verified | 4 |
| upgrade | slant tray, two-line tracked caps left, flame right | verified | 4 |
| journey | desktop vertical thread; tablet 4-column grid; designed region with no reference counterpart | contract-designed | 4 |
| nav | frosted bottom bar inside frame at every size, icon over tracked label, raised dome on active | verified | 4 |

## Round 7 — maintainer round 3: page-area blocker + phone 1:1 pass

New page-area gate merged from main. Maintainer found: inner pages rendered hero + empty cream panel (each `[data-db-page]` was a 244px scrolling box hiding every card); tablet bottom bar still on a dark strip; Profile card had a dead area under the avatar; and a phone 1:1 gap list against the twin-phone references.

Fixes: `.sd-main` is now the single scroller (`overflow-y:auto`), `.sd-page` is in-flow `position:relative;height:auto`, `showPage()` resets `scrollTop=0` so every page opens at its hero; tablet tray height extended under the rail; person stats moved under the name with Share tucked lower-left; phone pass rebuilt title/crescent, bead rings, arc bands + times, water glass, gather bar, stars path, nav labels and the whole Profile screen.

DOM probes at 375 (this pass): crescent at x300 top-right with light star; 5 ring beads on one cream band, selected bead dark + warm double glow; arc plot top −26.5px above the card with sun right of peak, IMSAK/IIFTAR tracked caps at the sides, times on the darker taupe band with small-caps AM/PM, bell tab hanging at the card's bottom edge; water = cyan glass + WATER tab + 42px drop lens + cup glyph + 8 thin segments + right-aligned litres; gather = saturated saffron with dark left bar; molded cream path + 3 hanging stars (dark green / pale teal / dark) + 6 dots under it; nav = light frosted band, active raised dome + glowing icon, inactive grey small caps. Profile: brown-olive sky + one big four-point star + two-line Fraunces greeting + gear top-right; avatar breaks out top-left on an orange rounded square; 8/2 in display serif; Share light tab joining the Daily tab; bright amber daily with tree + 7 gauges; translucent olive upgrade + slanted shelf + molded diagonal slope. Tablet 820: rail bottom 1131.8 inside frame bottom 1147.5, tray bottom 1139.7 covers it — no dark strip; journey = 7-item thread grid. Desktop 1440 inner pages: hero 1256×257, 10–13 visible cards each, scrollH > clientH on Progress/Sessions, scrollTop 0 on open.

Checker re-run after the pass: `node scripts/dashboards-check.mjs saffron-dusk` → zero failures (the new covered/clipped-text gate initially caught Imsak/Iftar — the arc plot painted over the labels because the shell's `pointer-events:none` subtree lost the hit test; labels/times moved out of the masked shell as z-indexed siblings — and arc-times contrast needed a darker taupe lower band plus a soft scrim).

| box | what differs | fix | score |
|---|---|---|---|
| title | crescent now top-right with a small light star; WED small caps; sup 9; swash flourishes still font-axis (WONK) not hand-painted | documented residual | 4 |
| dates | beads are rings on one continuous cream band; selected dark grey + soft warm glow ring | verified | 4 |
| date | same bead treatment at all sizes | verified | 4 |
| arc | light taupe top / IMSAK·IFTAR sides / white arc above the card edge / sun right of peak / darker taupe band / light 4:15AM + small-caps meridiem / bold saffron 6:08PM / bell tab below; band is a translucent gradient, not painted glass | documented residual | 4 |
| water | brighter cyan liquid glass, WATER tab cut, drop lens left, cup before "6 of 8", one thin segmented bar, litres right-aligned | verified | 4 |
| gather | saturated saffron (was pale peach), thin dark vertical bar at left | verified | 4 |
| stars | molded cream path curving down + hanging stars on thin threads (dark green, pale teal) + tiny dots | verified; SVG stroke not molded geometry | 4 |
| sky | verified | — | 4 |
| person | stats start under the name; Share tucked lower-left; phone avatar breaks out on orange rounded square | verified | 4 |
| daily | bright amber on phone with tree + tall thin gauges; tab label inside | verified | 4 |
| day-bar | verified | — | 4 |
| upgrade | translucent olive phone card, slanted shelf, molded diagonal slope below; desktop/tablet tracked caps + flame | verified | 4 |
| journey | tablet composed 4-column thread (7 items); designed region, no reference counterpart | contract-designed | 4 |
| nav | light frosted band, active raised dome + glowing icon, inactive light grey small caps — not a dark pill | verified | 4 |

Honest residuals this round: title flourishes and the painted reference art remain approximations (font axes + generated images); the arc's taupe bands and the molded path are gradients/SVG, not painted surfaces; the Share↔Daily join on the phone profile overlaps by a few px rather than inked edges; inner-page heroes reuse the overview dune band.

Remaining honest differences: title flourishes and painted character art are denser in the reference than font axes and generated avatars; the journey card is a maintainer-designed region; poured-tab junctions are cleaner vector cuts than the reference's inked edges; inner-page heroes reuse the overview dune band rather than per-page reference art (the reference only shows the phone screens).

## Round 8 — maintainer round 4 (final): 6px shape-edge gate + residual defects

New gate merged from main: text inside shaped cards must keep ≥6px from the clip edge. Maintainer's defect list: stats text ("JOURNEYS", "olive · cedar") and phone "Share" running into card/tab edges; Progress page notch bite on "SLEEP DEBT", "FASTING DAYS" crossing its tab edge, and the grid stopping short of the hero; arc lower band reading near-black; phone arc not visibly rising, molded path a thin "smile", hanging-star threads clipped; phone Profile "DAILY PROGRESS" riding the tab's top edge.

Fixes: stats gained real inner padding (`padding-right` on `.sd-stats`, `.sd-m-share`); Progress tiles got top-padding floors and shape opts re-tuned (`tab h:9%→4%`, `notch at:70%` clear of left labels); `.sd-page-grid`/`.sd-list`/`.sd-week-chart` `max-width:none` so they span hero width; arc shell gradient lifted to warm taupe `#4f4738→#3e382c` range with a lighter scrim; phone arc plot `top:-24%;height:80%` so the arc clears the card edge; molded path widened (viewBox 100×30, band ≈33% height, `blur(.7px)`) and star threads un-clipped by moving `clip-path` onto `.hs::after` plus 1.5px/.72-alpha threads; `.sd-m-daily .sd-pour-daily` centred in the tab lip (`top:3px`, verified 3–21px inside the 25px band).

Gate-discovered regressions fixed in the same pass: the wider grid pushed bottom-row text into the rail's overlay band (rail is `position:absolute` over `.sd-main`'s bottom ~67–87px at every size) — solved by introducing `.sd-pages`, an inner scroller ending above the rail (`bottom:5.8cqw` desktop, `12.2cqw` tablet; in-flow on phone where the rail already sits below), with `.sd-over` raised to `z-index:2` so the empty wrapper never intercepts overview hit-tests; `.sd-thread` had no background of its own so tray relief ridges showed through the glass and failed pixel contrast — given the same cream gradient surface as `.sd-tile`/`.sd-list`; `showPage()` now resets `.sd-pages.scrollTop`.

Verification: `node scripts/dashboards-check.mjs saffron-dusk` → zero failures after each stage (edge gate → covered-text/contrast → final). DOM probes: grid/chart right edge == hero right edge (1348.1 @1440, 776.8 @820, 355 @375); arc plot top 40.3px above card top @375; pour label 3–21px inside 25.1px lip; band pixels sample rgb(55–65,49–59,39–47) warm taupe not black; stats right gap clears the 6px rule at all sizes. Fresh captures: 12 shots (4 pages × 1440/820/375) + compare sheets + frames/{desktop,tablet,phone}.jpg regenerated.

| box | what differs | fix | score |
|---|---|---|---|
| title | unchanged this round | — | 4 |
| dates | unchanged | — | 4 |
| date | unchanged | — | 4 |
| arc | lower band now warm taupe gradient (sampled rgb ~57,51,41 / 65,59,47) not near-black; phone arc rises 40px above the card edge; times keep small-caps meridiem | verified; still gradient not painted glass | 4 |
| water | unchanged | — | 4 |
| gather | unchanged | — | 4 |
| stars | path widened to a soft cream band (~33% height, blurred); threads now render (1.5px, .72 alpha, unclipped) | verified; SVG/CSS not molded geometry | 4 |
| sky | unchanged | — | 4 |
| person | stats padding-right clears card edge ≥6px at 1440/820/375-profile; Share padding clears its tab | verified | 4 |
| daily | phone pour label centred inside tab lip (3–21px of 25px) | verified | 4 |
| day-bar | unchanged | — | 4 |
| upgrade | unchanged | — | 4 |
| journey | unchanged | — | 4 |
| nav | unchanged; rail band no longer covers checkable text (`.sd-pages` ends above it) | verified | 4 |
| inner pages | grid/list/chart now span hero width; tile padding keeps labels inside tab/notch shapes; Sleep-debt notch clear of its label | verified | 4 |

Honest residuals this round: the arc's warm taupe is a translucent gradient (sampled ≈#393329–#413b2f, inside the requested #4f4738–#3e382c neighbourhood), not painted glass; the molded path and star threads are SVG/CSS approximations; tile/tab inner padding is uniform rather than reference-measured; `.sd-pages` means inner pages scroll in a slightly shorter port than the overview's full frame.
