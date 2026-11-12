# Pipeline & views

## Deriving stages from the client's playbook

1. List every step a client goes through, in the client's words (journey map from Discover).
2. Merge steps that never need separate tracking. Aim for **4–7 open stages** + **Won** + **Lost**.
3. Each stage gets an **exit criterion** ("Proposal sent = the client has the PDF in their inbox"). Put them in Settings as help text; they make the board honest.
4. Typical shapes:

| Business type | Example stages |
|---|---|
| Consultant / coach | New inquiry → Discovery call → Proposal sent → Negotiating → Won / Lost |
| Interior designer / studio | Lead → Site visit → Concept → Quote sent → Signed → In progress → Delivered |
| Agency / B2B | Lead → Qualified → Meeting → Proposal → Contract → Won / Lost |
| Events / weddings | Inquiry → Call booked → Date held → Contract → Planning → Completed |

## Views

<a id="today"></a>
### Today (Dashboard pattern): the home screen

The most-used screen. It answers: **"Who do I need to contact, and is business healthy?"**

1. Greeting + date + one-line summary ("4 follow-ups due, 1 overdue")
2. KPI strip (≤ 5): Follow-ups due · Open pipeline · New this month · Won this month · Win rate
3. **Needs attention:** overdue next steps, then gone-quiet clients. Each row: name, why ("Overdue 2 days: Send quote"), quick action (Log / Snooze)
4. **Upcoming:** next 7 days of next-step dues (and calendar meetings in v2)
5. One chart: pipeline value by stage (bars) or won per month (line)

### Pipeline (Board pattern)

Columns = open stages (+ Won / Lost collapsed at the end). Card: name, value, next step + due, days in stage. Aging hint: subtle warning dot after N days in stage. Drag + *Move to…* menu. Column header: count + total value.

### Clients (List pattern)

Table columns: Name (+ company) · Stage · Value · Next step · Due · Last activity · Source. Search, filters (stage, source, tag, overdue, gone quiet), sort, CSV import/export, bulk archive.

### Client (Detail pattern)

Header: name, stage badge, value, next step (inline editable). Tabs: Overview (fields) · Activity (timeline + *Log activity*) · Notes. Actions: Log activity · Edit (slide-over) · ⋯ (Archive, Delete with named confirm).

### Insights (Analytics pattern, optional v1)

Won per month, conversion by stage, average days to win, leads by source. Date range filter.

### Settings

Stages (rename, reorder, set kind, exit criteria) · Sources · Defaults (follow-up days, gone-quiet days, currency) · Import/Export · Profile.
