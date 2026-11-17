# The twin contract

**Read this first when you build or change a gallery dashboard.** It is the one page that says what "done" means, in what order to work, and what you may not do. Everything else in this folder is detail for one of its steps.

It exists because builders kept delivering work that passed its own review and was wrong: the layout was off, tabs opened nothing, glass was solid white, a desktop view was a phone pasted on a page, and an earlier request was lost while fixing a later one. Each of those is now a check that fails.

## 1. Who decides what

| | Maintainer | Builder (any model) |
|---|---|---|
| `layout.json` (the spec) | writes and edits | reads; never edits, never writes a new one |
| `scripts/dashboards-check.mjs`, catalog `signature_tech` | edits | never edits |
| The dashboard's code | reviews | writes |
| Merge to `main` | does it | never does it |
| A number or requirement that looks wrong | fixes the spec | says so in the pull request and keeps building to the spec |

## 2. The gates

`node scripts/dashboards-check.mjs <id>` runs all of them on a dashboard that has a `layout.json`. Zero failures is the entry ticket to review, not the finish.

| # | Gate | What it catches | Spec key | Detail |
|---|---|---|---|---|
| 1 | Layout | wrong place or size, missing parts, a phone pasted on desktop | `frame`, `boxes` | [07](07-layout-spec.md) |
| 2 | Object | a 3D hero that is tiny, a blob, flat or cut off | `boxes.<name>.object` | [08](08-object-spec.md) |
| 3 | Material | "glass" that is opaque, unblurred or edgeless; "clay" that is flat or sharp-cornered; a flat backdrop | `boxes.<name>.material`, `frame.backdrop` | [05](05-style-frameworks.md) |
| 4 | Navigation | a nav item with no page of its own, or an empty page | `nav` | below |
| 5 | Controls | a button that does nothing when clicked | always on | below |
| 6 | Record | no report, no tools table, an owner requirement left unanswered, fewer than 3 review rounds, any box scored below 4 | `requirements`, every box name | [templates/polish-report.md](../../templates/polish-report.md) |
| 7 | Shape | a tab, notch, bump, slope or organic edge built as a plain rounded rectangle | `boxes.<name>.shape` | [09](09-image-to-dashboard.md) §3 |
| 8 | Views | phone or tablet that is not the reference's composition | `views` | [09](09-image-to-dashboard.md) §4 |
| 9 | Page style | an inner page without the backdrop, the nav, the card material or the shape grammar | `page_style` | [09](09-image-to-dashboard.md) §5 |
| 10 | DNA | building before reading: no `dna.md` design DNA sheet | always on with a spec | [09](09-image-to-dashboard.md) §2 |

**How to build to these gates, step by step, from one image: [09-image-to-dashboard.md](09-image-to-dashboard.md).**

Older gates still apply to every dashboard: console errors, contrast, text size, thin pages, image resolution, required techniques.

**Navigation.** Every control inside the nav element opens its own route, and each route shows its own content. Six tabs in the reference means six working pages. A page is real when it has its own data, at least one working interaction, and the same frame, materials and type as the overview.

**Controls.** Every visible `button`, tab and non-route link on the overview must cause a visible change when clicked: a value, a selection, a panel, a dialog. If something should not be clickable, do not make it a button.

**Record.** `docs/validation/dashboards/<id>-polish.md`, from the template, with the "Tools used" table filled and one answer per requirement id (R1, R2…) saying what was done and which screenshot shows it.

## 3. Owner requirements never get lost

Each spec has a `requirements` list. It is the running record of what the owner asked for, in the order they asked. **A change request adds a line; it never replaces one.** Before every push, go down the whole list, not just the newest line, and confirm each at 1440px and at 375px. Fixing R3 by breaking R1 is a failed push.

## 4. When the reference shows only one screen size

A reference may show only phones, or only a desktop. The other size is then **designed by the maintainer** and written into the spec (`adaptation`, with boxes for 1440). The builder does not invent it and does not place device mockups on a page. Each box carries a `ref` rectangle pointing at the part of the reference it must look like.

## 5. The loop

Do these in order. Do not start a step while the one before it fails.

1. **Read** this page, `layout.json` (every `note` and every requirement), and the reference image. Then the detail docs for the gates the spec uses.
2. **Route tools.** For each element pick the tool from the routing table in [08](08-object-spec.md#tool-routing-required-recorded) and start the "Tools used" table.
3. **Structure.** Frame as a container, every box a real tagged element in `cqw`. Run the check until gate 1 passes.
4. **Objects.** Silhouette first, then framing, then material. Gate 2.
5. **Materials and backdrop.** Build each surface from its style framework. Gate 3.
6. **Pages and controls.** Every nav item, every button. Gates 4 and 5.
7. **Detail pass with the compare sheet.** The check writes `docs/validation/dashboards/<id>-compare.jpg`: each box, reference on the left, your build on the right. Open it. For every box write down what still differs (section 6) and fix it. Run the check again to refresh the sheet. Repeat until you cannot name a difference. Three rounds is normal.
8. **Phone.** 375px: every page, no horizontal scroll, bottom bars fully visible, 44px targets.
9. **Record.** Finish the report: tools, one answer per requirement, the last compare sheet, the final check output.
10. **Open a pull request and stop.** Do not merge.

## 6. What to compare in each box

The numbers check position and size. These are the things only the compare sheet shows.

| Element | Look at |
|---|---|
| Header | logo mark shape, tab pill fill and shadow, icon set and stroke weight, avatar (photo or generated, not initials when the reference has a face) |
| Card | fill tint and transparency, corner radius, edge highlight, shadow softness and colour, inner padding, where content sits vertically |
| Glass | what shows through it, blur strength, the light edge, any coloured glow underneath |
| Buttons and chips | height, radius, fill, label weight, icon; pressed and hover states exist |
| Numbers and type | family, weight, size relative to the card, muted decimals, one line |
| Charts | bar width and shape, stacking, hatching, axis and gridlines, tooltip, how values vary (not all the same height) |
| Backdrop | gradient colours and direction, sweeps, dunes, stars, grain |
| Icons and images | present, same metaphor, same size; images original, sharp, credited |
| Shadows and depth | direction consistent, soft, tinted with the surface colour rather than grey |

## 7. Never

- Never claim a page, button or look is done without the check output and the compare sheet from this push.
- Never satisfy a gate with a hidden, empty or wrapper element, or a button that only toggles an invisible attribute.
- Never reuse another dashboard's frame, nav labels or page set. Nav labels and pages come from this reference.
- Never drop a material or a requirement to make another one easier.
- Never copy, trace or edit the reference image, or give it to an outside tool.
- Never merge.
