# High-end checklist — premium vs generic

Sixty concrete checks. Each has a **why** and a **how to check**. Template-grade means these pass alongside fidelity levels L1–L5 in [08-polish-standard.md](08-polish-standard.md).

1. **Optical icon alignment in buttons** — Why: icons that sit low look cheap. How: icon center shares the text cap-height midline.
2. **Tabular numbers in every KPI** — Why: digits jump on update. How: `font-variant-numeric: tabular-nums` / `.num`.
3. **Chart gridlines at 6–10% ink** — Why: grids must not compete with data. How: sample grid stroke vs canvas.
4. **Axis labels muted, data ink strong** — Why: hierarchy. How: axes use `--text-muted`; series use `--chart-*`.
5. **1px inner top highlight on raised surfaces** — Why: light direction. How: `inset 0 1px 0` present on cards.
6. **Nested radius = outer − padding** — Why: concentric corners. How: measure outer radius and padding.
7. **No orphan words in titles** — Why: ragged single words look unfinished. How: `text-wrap: balance` on titles.
8. **`text-wrap: pretty` on paragraphs** — Why: fewer lonely last words. How: prose blocks set pretty.
9. **Consistent icon stroke width** — Why: mixed weights look like clip-art. How: one stroke (≈1.75) per dashboard.
10. **Focus rings match accent** — Why: focus is part of the brand. How: `--focus` / outline uses accent.
11. **Empty states with a next action** — Why: empty without a verb is a dead end. How: button or link present.
12. **Skeletons match final layout** — Why: CLS and trust. How: skeleton blocks mirror card geometry.
13. **No layout shift on load** — Why: CLS &lt; 0.1. How: reserved media boxes; fonts don’t reflow KPIs.
14. **Hover on every interactive card** — Why: affordance. How: pointer + lift/spotlight.
15. **`cursor: pointer` only on real actions** — Why: fake pointers train distrust. How: non-buttons stay default.
16. **Real units and plausible numbers** — Why: demo credibility. How: units present; no `999999` spam.
17. **One date format** — Why: mixed formats feel unfinished. How: scan all dates on a page.
18. **8px grid audit** — Why: rhythm. How: gaps/padding are `--space-*`.
19. **Shadow tinted to background** — Why: pure black shadows dirty light UIs. How: shadow uses canvas hue.
20. **Scrims under text on art** — Why: AA on photos. How: contrast audit on hero type.
21. **Tap targets ≥ 44px** — Why: mobile. How: measure hit areas at 375.
22. **Body ≥ 14px, nothing under 12px** — Why: rulebook. How: computed styles sample.
23. **Max 3 font weights** — Why: type discipline. How: count used weights.
24. **≤ 5 KPI tiles on overview** — Why: anti-pattern. How: count hero metrics.
25. **Loading / empty / error / populated** — Why: four states. How: View-state control or manual toggle.
26. **Keyboard: Esc closes overlays** — Why: a11y. How: open drawer, press Esc, focus returns.
27. **Visible focus never on load shots** — Why: screenshots. How: no outline on first paint.
28. **Route transition ≤ 180ms** — Why: continuity without delay. How: hash change feels instant.
29. **Ambient loops pause offscreen** — Why: battery + rulebook. How: scroll away; anim pauses.
30. **Reduced motion final state** — Why: vestibular safety. How: emulate reduce; end state shows.
31. **Hero art ≥ 1.5× rendered width** — Why: gate. How: `dashboards-check` image gate.
32. **`srcset` for large images** — Why: sharpness + budget. How: inspect network.
33. **Media ≤ 1.5 MB per dashboard** — Why: budget. How: `du -sb media`.
34. **JS ≤ 120 KB excluding vendor** — Why: budget. How: size `app.js`.
35. **Full-bleed backgrounds on scroll** — Why: no 900px seam. How: full-length frame.
36. **Phone composition designed** — Why: not just stacked. How: read `frames/phone.jpg`.
37. **Secondary pages dense (≥ 60 leaves)** — Why: gate. How: check at 1440.
38. **Content spans ≥ 70% main width** — Why: gate. How: check.
39. **First screen ≥ 60% filled** — Why: gate. How: check.
40. **No `[data-db-stub]`** — Why: placeholders banned. How: DOM query.
41. **Materials from recipes** — Why: no one-off shadows. How: classes / `--mat-*`.
42. **Type character matches reference** — Why: G6. How: display face vs reference.
43. **Signature art present and sharp** — Why: G2. How: fidelity sheet.
44. **Connector lines / orbit chips when referenced** — Why: composition. How: vs reference.
45. **Variant palettes still designed** — Why: not hue swaps only. How: check each variant shot.
46. **Destructive confirms name the item** — Why: copy. How: read dialog.
47. **Verb-first buttons** — Why: UX writing. How: scan CTAs.
48. **Errors say what to do next** — Why: recovery. How: trigger error state.
49. **Filter / search / sort work with state** — Why: interaction depth. How: exercise controls.
50. **Cross-page selection via sessionStorage** — Why: continuity. How: pick on overview → detail page.
51. **Approval gate for AI actions** — Why: showcase rule. How: if AI present, confirm step.
52. **No polling** — Why: privacy/perf. How: no `setInterval` fetch.
53. **No real brands / real PII** — Why: privacy. How: copy scan.
54. **Credits for media** — Why: license. How: `media/CREDITS.md`.
55. **Vendored libs have LICENSE** — Why: compliance. How: `_vendor/*/LICENSE*`.
56. **Catalog `fx` + `materials` accurate** — Why: build validates. How: `node scripts/build.mjs`.
57. **Fidelity before/after sheets** — Why: honest audit. How: `fidelity/<id>.jpg` + `-after.jpg`.
58. **Honest POLISH-AUDIT scores** — Why: G7. How: reasons differ per axis.
59. **No rainbow gradient buttons** — Why: anti-pattern. How: visual scan.
60. **Replace, don’t fork** — Why: dead v1. How: no `-old` classes or stub hosts left behind.
