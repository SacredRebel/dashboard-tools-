# Cursor prompt: rebuild TWO dashboards with two sub-agents

> Paste everything below the line into a new Cursor chat (Multitask / background agents on).

---

You are the coordinator. Start **two background agents**, one per dashboard, in the repo `SacredRebel/dashboard-tools-`. They work at the same time, on separate branches, and never touch each other's files or any shared file.

| Agent | Dashboard | Branch | Frameworks it will need (confirm from the reference) |
|---|---|---|---|
| A | `mauve-ledger` | `cursor/twin-mauve-ledger` | F1 frosted glass, F11 backdrop haze, F12 colour, F13 type, F14 motion |
| B | `ember-rooms` | `cursor/twin-ember-rooms` | F5 neumorphic, F8 3D object (the pendant lamp), F12, F13, F14 |

These two are different on purpose. If your two results share a frame, a header or a layout, one of them is wrong.

## Give each agent exactly these instructions (replace `<id>`)

1. Pull `main`. Create your branch. Run `python3 -m http.server 8080 -d site` and keep it running.
2. Read, completely and in this order:
   - `docs/dashboards/05-style-frameworks.md` (rule zero and the frameworks named for your dashboard)
   - `docs/dashboards/02-reference-twin-playbook.md`
   - `docs/dashboards/06-verification.md`
   - `docs/dashboards/04-finishing-pass.md`
3. Open `site/dashboards/<id>/reference.*`. **Before any code**, create `docs/validation/dashboards/fidelity/<id>.md` from `templates/polish-report.md` and fill in the four identity lines (Form, Frameworks, Signature, Not this) and the measurement table from playbook Step 1.
4. Open the finished examples in the browser to learn **techniques only**: `haven-listings` (glass, poured shapes), `meridian-labs` (3D object), `tidebath-showroom` (CSS 3D), `mallow-music` (clay), `pulsar-analytics` (soft-3D tiles, ridges). Read the files of the one whose *technique* you need. Do not copy any example's frame, header or layout: your form comes from your own reference.
5. Rebuild the dashboard **from empty files** (`index.html`, `style.css`, `app.js`, plus a hero module if it has WebGL), following the playbook steps in order and the framework recipes. Content list for your dashboard: `prompts/cursor-fidelity-r4.md` §6.
6. After every step that changes the page: capture, **open the image**, write one line in the report.
7. Verify with `docs/dashboards/06-verification.md`, all seven sections: captures, gates, the eleven questions, using it, the decision table. Do at least three look-fix-look rounds. Then do the finishing pass.
8. If the dashboard has WebGL: `node scripts/hero-poster.mjs <id> site/dashboards/<id>/media/hero-poster.png`.
9. `node scripts/build.mjs` and `node scripts/dashboards-check.mjs <id>` must print `✔`. Never edit the check script or `signature_tech`.
10. One commit `Twin: <Name>`. Push. Open a pull request. **Do not merge.** PR body: the side-by-side image, the filled-in report, and the remaining gaps in plain words.

## Notes for each dashboard

**mauve-ledger.** The reference is light and airy: near-white frosted panes over a lilac haze with a peach bloom at the bottom corners. A pill nav with a white active pill; four small KPI panes with line icons; an "Average sales" pane with two big values whose decimals are dimmed, pale translucent bars with one hatched purple selected bar and a tooltip; a "Formation status" pane with a hatched progress bar; a "Success rate" pane with a segmented arc gauge of rounded ticks; recent emails in one wide pane. Clean geometric sans, no serif. **Not this:** opaque lilac cards, dark ink blocks, or Haven's rounded photo frame.

**ember-rooms.** The reference is white-grey neumorphic. The hero is a brushed-aluminium pendant lamp hanging from the top edge on a thin cord, at the centre of large soft concentric rings, with "12/7" in thin numerals and a round power button under it; round room chips sit around the rings; an icon rail in a soft pill on the left; an intensity slider, schedule times and an orange ring gauge; chart tiles and a dark room-view tile on the right. The lamp is a real three.js object (a lathe shade, a cord, an emissive disc), transparent canvas, and its glow follows the intensity slider. A second page carries the reference's thermostat knob scene. **Not this:** a photo of a lamp in a white rectangle, flat grey cards, or Meridian's layout.

## Hard stops (either agent)

- You did not write the four identity lines before coding.
- The result shares its frame, header or layout with another dashboard.
- Any of the eleven verification questions is "no" for a reason code can fix.
- A 3D object is a picture; a render sits in a visible box; a chart does not match its numbers.
- Anything overlaps or scrolls sideways on the full-length phone capture.
- You did not open your own captures.

## When both are done

Report to the user: the two PR links, each agent's result line from its report (Polished / Finished with a stated gap / Not finished), and the gaps. Do not merge. Do not start other dashboards.
