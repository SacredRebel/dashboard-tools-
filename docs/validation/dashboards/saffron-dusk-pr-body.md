<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
## Contract twin — Saffron Dusk (do not merge)

Branch `cursor/contract-saffron-dusk-0545`. Maintainer merges only.

### Final check
```
✔ saffron-dusk: pages=4, variants=3, frames + shot@2x · pixel contrast · text ≥ 12px
```

### Owner rejection fix (responsive separation + liquid polish)

**Desktop (~1440)** — one wide adapted board (layout.json boxes). Vertical glass rail, title, date beads, arc/water/gathering, dune, profile, daily progress, upgrade. Not twin phones. Not a phone UI scaled up.

**Tablet (~768)** — distinct intermediate: frame unlocks aspect-ratio; CSS grid reflow (2 columns); vertical side rail in px; cards stack/reflow. Neither phone stack nor tiny-desktop.

**Mobile (~375)** — Today ≈ reference left; Profile ≈ right; bottom tab bar pinned in-view on every page (`order:2` + fixed frame height). No desktop gutter/rail as phone chrome.

### Liquid glass
Bright rims, lower-alpha translucency, stronger teal/amber glows, larger poured fillets on WATER / Share / Daily progress / bell — at all three widths.

### Look-fix-look
≥2 rounds with screenshots opened at 1440 / 768 / 375 (logged in `saffron-dusk-polish.md`). Click-test all four routes at each width (`saffron-dusk-click.txt`).

### Remaining gaps
Reference still wins on title flourishes and arc sun intensity; poured fillets can go another notch denser on the rail icons. Spec gates are green.

### Do not merge — maintainer review only.
<!-- CURSOR_AGENT_PR_BODY_END -->
