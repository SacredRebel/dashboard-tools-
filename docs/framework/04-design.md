# Phase 4: Design

**Goal:** specify every screen: its pattern, layout, components, states, interactions and copy. The design is done when an agent could build it without guessing.

**Gate:** a screen inventory (`docs/screens.md`) where every screen lists its pattern, the four data states, its primary actions and its copy.

## Steps

1. **Information architecture.** Navigation with ≤ 6 top-level items. For a CRM: *Today · Pipeline · Clients · Insights · Settings* (Insights optional in v1).
2. **For each screen, name the page pattern** ([03-page-patterns.md](../design/03-page-patterns.md)) and sketch it as a text wireframe:

   ```
   Pipeline (Board)
   Heading "Pipeline" · one-line description · [+ Add client]
   [Search] [Filters] [Board | List]
   Columns = stages (count + total value) · cards = client name, value, next step, days in stage
   Card click → slide-over with details
   ```

3. **Choose surfaces** for each action (`vectorlab-ux-skills:surfaces`): inline edit (one field), slide-over (< 10 s task), page (longer). Destructive actions get a named confirmation.
4. **Specify states** for every data region: loading (skeleton > 1 s), empty (what goes here + primary action), filtered-empty (clear filters), error (what happened + retry), populated.
5. **Interactions** (`design-skills:interaction-design`): drag to change stage + keyboard alternative, quick-add (`N` shortcut), inline edit next-step, undo toast after moves/deletes.
6. **Data viz** (`dataviz` skill / [04-data-viz.md](../design/04-data-viz.md)): pick charts from questions ("Is the pipeline growing?" → line; "Where are deals stuck?" → bar by stage).
7. **Copy** (`design-skills:ux-writing`): button verbs, empty-state text, error text, in the client's vocabulary.
8. **Component inventory.** List components and map each to shadcn/ui (Button, Sheet, Dialog, Table, Card, Badge, Command, DropdownMenu, Tabs, Toast…). See the *Components* tab of the showcase for styled references.

## Tools

| Tier | Tools |
|---|---|
| Core | `vectorlab-ux-skills:page-patterns`, `vectorlab-ux-skills:surfaces`, `design-skills:interaction-design`, `design-skills:ux-writing`, `dataviz`, `vectorlab-ux-skills:empty-states`, `vectorlab-ux-skills:loaders` |
| Recommended | `design-superpowers:design`, `design-skills:design-critique`, `sales:daily-briefing` + `sales:deal-signals` (what Today should show) |
| Optional | `superdesign:superdesign` (layout variations), Figma skills if the client uses Figma |
