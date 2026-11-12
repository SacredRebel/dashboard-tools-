# QA checklist (Polish gate)

Run on the deployed **preview URL**. Screenshot every screen at **375px** and **1280px**.

## Structure
- [ ] Every page has a named pattern and follows its Must lines
- [ ] Nav ≤ 6 items; current page clearly indicated
- [ ] Overview has ≤ 5 KPI tiles and nothing editable

## States
- [ ] Loading: nothing < 100 ms, inline 100 ms–1 s, skeleton > 1 s (throttle network to test)
- [ ] Empty: headline + why + primary action, on every list/board/chart
- [ ] Filtered-empty: Clear filters
- [ ] Error: plain message + retry; input preserved (simulate offline)
- [ ] Long names, 0 records, 1 record, 1,000+ records

## Visual
- [ ] Only tokens (grep for `#`, `rgb(`, `px` in components)
- [ ] 60-30-10 color; accent only on actions/active/links/focus
- [ ] ≤ 3 font weights; no text < 12px; table text ≥ 14px; tabular numbers
- [ ] Spacing on 4/8 grid; consistent icon set and size
- [ ] Anti-patterns list clean (docs/design/05-anti-patterns.md)
- [ ] Dark/light (if offered) both checked

## Interaction
- [ ] Single-field edits inline with zero layout shift
- [ ] Slide-overs for quick tasks; no stacked modals
- [ ] Destructive confirms name the item; Cancel focused by default
- [ ] Undo after move/archive
- [ ] Motion 100–300 ms, transform/opacity only; reduced-motion respected

## Responsive
- [ ] No horizontal page scroll at 375 and 1280
- [ ] Sidebar collapses on phone; slide-overs full screen
- [ ] Tap targets ≥ 44px; no hover-only actions

## Accessibility
- [ ] Keyboard-only: complete every critical journey
- [ ] Visible focus ring everywhere; focus trapped/restored in overlays
- [ ] Icon buttons have names + tooltips
- [ ] Contrast AA (text 4.5:1, UI 3:1); color never the only signal
- [ ] Automated audit (axe / ux-ui-audit) zero serious issues

## Data & security
- [ ] KPI numbers match a manual calculation
- [ ] RLS: other users' data unreachable
- [ ] No secrets in repo; env vars set in Vercel
- [ ] CSV import handles duplicates and bad rows gracefully

## Copy
- [ ] Verb-first buttons; client's vocabulary; sentence case
- [ ] Errors say what to do next

## Performance
- [ ] Today view interactive < 2 s on a phone on 4G
- [ ] No console errors or warnings
