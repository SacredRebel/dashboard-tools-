# CRM feature menu

Use this menu with the client to sort features into v1 / v2 / later. Bold = recommended v1.

## Core (v1)

- **Add client quickly** (slide-over, name only required, `N` shortcut)
- **Pipeline board** with drag and keyboard *Move to…*, undo toast
- **Next step + due date** on every client, inline editable everywhere
- **Today view**: due, overdue, gone quiet
- **Log activity** (call / meeting / email / note) with timeline
- **Search** everything (`/`)
- **Clients list** with filters, sort, CSV import & export
- **Settings: stages** in the client's words
- **Login** (email magic link or Google)
- **Mobile-friendly** for logging on the go

## Automation-lite (v2)

- Paste a meeting transcript → summary + suggested next step + activity (`sales:call-summary` pattern)
- Gmail: show recent emails on the client page; draft follow-up (owner sends)
- Google Calendar: upcoming meetings on Today; book from client page
- Weekly email recap (Monday brief pattern)
- Gone-quiet nudges with drafted check-in message (`small-business:crm-autopilot`, `reactivate` patterns)
- Lead form on the client's website → new client in "New inquiry"

## Later

- Proposals / quotes generation (`small-business:proposal-builder`)
- Invoices & payment status (`small-business:invoice-chase`)
- Team members with roles
- MCP server so the client's Claude can read/update the CRM ("Claude, what's overdue?") (`anthropic-skills:mcp-builder`)
- Analytics deep dives, forecasting (`sales:forecast`)

## Automation principles

1. **Draft, don't send.** AI drafts emails; the owner sends.
2. **Suggest, don't overwrite.** Proposed field updates show as a diff the owner accepts.
3. **Explain why.** Every nudge says why it appeared ("No activity for 16 days").
4. **Easy to snooze.** Every reminder can be snoozed 1 day / 1 week.
