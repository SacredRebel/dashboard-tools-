# Cursor prompt: three agents, three dashboards, to the contract

Paste into Cursor once. It starts three sub-agents, one per dashboard.

```
Start three sub-agents. Each owns exactly one dashboard and one new branch from the latest main. They do not share code or styles.

  Agent A: mauve-ledger   branch cursor/contract-mauve-ledger
  Agent B: ember-rooms    branch cursor/contract-ember-rooms
  Agent C: saffron-dusk   branch cursor/contract-saffron-dusk

The last round was merged to main by the builder and was not finished. That is not allowed again: open a pull request and stop. Only the maintainer merges, and only the maintainer writes layout.json.

EVERY AGENT, IN THIS ORDER

1. Read docs/dashboards/00-twin-contract.md completely. It is the contract. Then site/dashboards/<id>/layout.json: every note, every requirement. Then open site/dashboards/<id>/reference.* next to it.
2. Run: node scripts/dashboards-check.mjs <id>
   Read every failure. That list is your work. It is long on purpose.
3. Open docs/validation/dashboards/<id>-compare.jpg. It shows each box of the reference beside the current build. Write down what differs in each box using the table in section 6 of the contract.
4. Copy templates/polish-report.md to docs/validation/dashboards/<id>-polish.md. Fill "Tools used" before building each element, from the routing table in docs/dashboards/08-object-spec.md. If you cannot see images, use agent-vision-toolkit from the catalog to describe the reference and your screenshots.
5. Work the loop in section 5 of the contract. Do not start a step while the one before it fails.
6. After the check passes with zero failures, do at least three compare-sheet rounds: run the check, open the new sheet, name the differences, fix them, record the round in the report.
7. Click-test yourself: every nav item, every button, every page, at 1440px and at 375px. Record what you clicked.
8. Go down the whole requirements list (R1, R2, …) one last time at both widths and fill the table.
9. Push, open a pull request with the final check output, the compare sheet and the report. Stop. Do not merge.

HARD RULES
- Never edit layout.json, scripts/dashboards-check.mjs or catalog signature_tech. If a number looks wrong, say which and why in the pull request, and keep building to the spec.
- Never tag a hidden, empty or wrapper element to pass a box. Never make a button that only flips an invisible attribute.
- Never drop one requirement to satisfy another. Never reuse another dashboard's frame, nav labels or pages.
- Fictional sample data only. Never copy, trace or edit the reference image.

AGENT A: mauve-ledger
The layout is close. What is missing:
- "HR and Payroll" and "Peoples" open the same page as "Accounts". Build six real pages, one per tab, each with its own data and at least one working interaction, in the same frame and materials.
- The cards read as solid white. Add a data-ref="backdrop" layer (pale lilac-grey with a soft peach sweep from the lower left) and make frame and cards frosted glass over it, as the reference shows.
- Tiles: icon at the top, number and label together in the middle, no empty band. "$3,287.49" on one line.
- Header: match the logo mark, the tab pill, the four icon buttons and a generated photo avatar (not initials).
- Chart: bar heights vary by month as in the reference; they are not all near the same height.

AGENT B: ember-rooms
Do not touch lamp.js. What is missing:
- The sidebar has seven icons and five pages: "Airflow" and "Scenes" open another icon's page. Seven icons, seven real pages.
- Room buttons on the arc (Kitchen, Bedroom, Bath, Study) do nothing. Selecting a room changes the readout, intensity, schedule and donut.
- Then the compare-sheet rounds for card detail, shadows and type.

AGENT C: saffron-dusk
The reference shows two phone screens and no desktop. The desktop is designed in layout.json ("adaptation"): one wide dashboard that lays out the cards from both screens. The current desktop is two phone mockups on a page; that is rejected. Replace it; do not keep it beside the new one.
- Build the 1440px layout exactly to the boxes: vertical glass rail (Today, Progress, Sessions, Profile), title, date beads, arc card, water and gathering cards, dune panel, profile card, daily progress, upgrade strip.
- Liquid glass on every card at 1440px and at 375px. Poured tabs for the WATER label, Share, the Daily progress title and the bell line. Coloured glow under the teal and amber cards.
- Remove the nav labels that came from another dashboard (Vitals, Appointments, Records). The four pages are Today, Progress, Sessions, Profile.
- Every date bead, water step and day bar changes something when clicked.
- At 375px, Today matches the reference's left screen and Profile its right screen, with the bottom tab bar fully visible.
```
