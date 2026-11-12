# Page patterns

Pick exactly one per page. Ask: **"What is the user's one job on this URL?"**

| # | Pattern | One job | CRM example |
|---|---|---|---|
| 1 | **List / Index** | Find, filter, sort, bulk-act on many records | Clients |
| 2 | **Detail / Record** | Understand and update one record | Client: Harbor & Pine |
| 3 | **Form** | Create or edit something substantial | New proposal; login |
| 4 | **Dashboard / Overview** | Glance, then leave to act elsewhere | Today |
| 5 | **Settings** | Configure the product | Stages, profile, import |
| 6 | **Board / Kanban** | Move items through named stages | Pipeline |
| 7 | **Calendar** | See things in time | Follow-ups & meetings |
| 8 | **Split pane** | Scan a list while reading one item | Inbox-style activity |
| 9 | **Analytics** | Explore and filter data over time | Insights |
| 10 | **Inbox / Queue** | Work through items to zero | Leads to triage |

---

## Dashboard / Overview (the "Today" screen)

```
Good morning, Anna                                   [+ Add client]
Tuesday 12 November · 4 follow-ups due
──────────────────────────────────────────────────────────────
[KPI] [KPI] [KPI] [KPI]            ← max 5, each drives a decision
Needs attention (list)        │  Pipeline by stage (chart)
  overdue follow-ups          │
  gone quiet > 14 days        │  Upcoming (next 7 days)
```

- **Must:** read-only glance; ≤ 5 KPI tiles; every item links to where you act (detail / board).
- **Must not:** editable tables, date-range explorers (that's Analytics), 6+ tiles.
- **Narrow:** tiles 2 per row, lists full width, chart below.

## Board / Kanban (Pipeline)

```
Pipeline                                   [+ Add client] [⋯]
[Search] [Filters]                         [Board | List]
New (4) €12k   Discovery (3)   Proposal (2)   Won (5)   Lost
[card]         [card]          [card]
+ Add          + Add           + Add
```

- **Must:** every stage column visible even when filters empty it; live count (+ total value); "+ Add" in empty columns; keyboard *Move to…*; card click → slide-over.
- **Must not:** hide stages to "clean up"; use a board for data with no lifecycle.
- **Narrow:** columns snap-scroll horizontally inside the board region; stages stay visible.
- **Card content (max 4 lines):** name · value · next step (+ due) · days in stage / owner avatar.

## List / Index (Clients)

```
Clients                          [Import] [+ Add client]
All your clients and leads, newest first.
[Search  /] [Filters]          [Columns] [Export]
Stage: Proposal ×   Source: Instagram ×   Clear all
┌ table (sticky header, default sort, hairline rows) ┐
Pagination (always rendered)
```

- **Must:** search always visible (`/` focuses); one Filters control with active-filter chips; table on a framed surface; empty and filtered-empty states inside the frame.
- **Must not:** a row of 6 filter dropdowns; 12px cells; hover-only row actions.

## Detail / Record (Client)

```
Harbor & Pine Interiors                [Log activity] [Edit] [⋯]
Clients › Harbor & Pine
● Proposal · €8,400 · Next: Send revised quote · Fri
────────────────────────────────────────────────────────
Overview | Activity | Notes | Files
```

- **Must:** status + key metadata replace a description; tabs load independently; edits via inline/slide-over; delete via named confirm.
- **Must not:** one endless scroll of every field; 6+ horizontal tabs.

## Settings

Left sub-nav (or sections on narrow) · each section is a form card with its own Save · destructive zone at the bottom, visually separated.

## Analytics (Insights)

Filter bar (date range, segment) at top · primary chart · supporting charts in a grid · detail table. Different from Dashboard: here users explore and filter.
