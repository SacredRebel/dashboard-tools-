# Calendars: the hub

Anything that shows, books, syncs or reminds about a date starts here. This folder tells you **which approach** to take, **which visual style** each screen should use, and **which repo** to reach for, with the reasons.

| File | Read it when |
|---|---|
| This file | Choosing the approach (first) |
| [01-integration-playbook.md](01-integration-playbook.md) | Connecting real calendars: Google, Outlook, CalDAV, ICS, Meet links, agents |
| [02-calendar-ui-rules.md](02-calendar-ui-rules.md) | Designing or building any calendar view |
| [catalog.md](catalog.md) | Browsing all repos with use / avoid / integrate (generated) |
| [../../catalog/calendars.json](../../catalog/calendars.json) | Machine-readable source: repos, styles, approaches, licenses |

Live versions of all eight styles, in every theme: showcase site → **Calendars**.

---

## 1. Decide in four questions

Answer in order. Stop at the first "yes" that covers the need, and add more layers only when a later question also says yes.

| # | Question | If yes | Picks |
|---|---|---|---|
| 1 | Do events need to show up in the client's **real calendar** (Google, Outlook)? | **Provider API.** Your backend syncs with the provider | Google Calendar API v3 · laravel-google-calendar · Microsoft Graph |
| 2 | Do people only need to **see** your app's events in their calendar app? | **ICS feed.** A private subscribe link, read-only | ical-generator · ical.js · rrule |
| 3 | Should **clients book their own time**? | **Booking page.** Embed, receive bookings by webhook | Cal.com · Calendly connector |
| 4 | Does the app need its **own calendar screen**? | **UI.** Small: build from tokens. Full scheduling: a library | shadcn Calendar · FullCalendar · Schedule-X · react-native-calendars |
| + | Should an **AI agent** read or draft events? | **Agent connector**, behind an approval gate | Google Calendar connector · google-calendar-mcp · gcalcli |
| + | Each event needs a **video link**? | Attach Google Meet via `conferenceData`. **Never build video for a CRM** | Google Calendar API · googleapis (Meet REST) |
| + | Calendar must live **off Google**, on the client's server? | **CalDAV** server | Nextcloud Calendar |

### Default for a CRM (the friend's-business case)

1. **v1:** a token-built *Agenda* card on the Today view and a *Picker* for follow-up dates (shadcn Calendar). Meetings are rows in your own `meetings` table. No external sync yet.
2. **v1.5:** *Add to calendar* (ICS) on each meeting, plus a private subscribe feed of follow-ups.
3. **v2:** two-way Google sync (sync token + push channel), Meet links on new meetings, booking page for discovery calls that creates the client by webhook.
4. **Agent:** the Google Calendar connector for "what's my week" and "find a slot", always proposing, never sending without a yes.

## 2. Pick a style per screen

Every calendar screen uses exactly one of these styles (the calendar version of "every screen has a named page pattern"):

| Style | Use for | Not for |
|---|---|---|
| **Month grid** | Planning across weeks, all-day events | Busy days with many timed events |
| **Week time grid** | Timed meetings, finding gaps | Phones under 400px |
| **Agenda list** | Phones, Today card, screen readers | Spotting free time |
| **Date / range picker** | Form fields, report filters | Birthdays (type them) |
| **Year heatmap** | Activity rhythm over months | Exact values without labels |
| **Booking slots** | Clients choosing a call time | Internal scheduling |
| **Week strip** | Phone day-by-day flows | Desktop planning |
| **Meeting grid** | Video room or meeting recap | A CRM that can just link to Meet |

Rules for each style: [02-calendar-ui-rules.md](02-calendar-ui-rules.md).

## 3. Licenses: what you may do with each repo

| Class | Licenses | You may |
|---|---|---|
| Permissive | MIT, Apache-2.0, BSD | Use in any project; keep the notice |
| File copyleft | MPL-2.0 | Use as a dependency; changes to its files stay open |
| Copyleft | GPL-3.0, AGPL-3.0 | Study, run as a separate service, or fork as open source. **Never paste into the client's closed app** |
| Look only | No license, all rights reserved | Read for ideas. **Do not copy code** |

Of the repos you'll meet here: Nextcloud Calendar (AGPL) and Fossify Calendar (GPL) are copyleft. Video-Meeting, google-meet-clone, Google-Meet-Scheduler and google-meet-grid-view are look-only.

## 4. Hard rules

1. **No polling.** Provider changes arrive by push (Google `events.watch`, Microsoft Graph subscriptions, booking webhooks). Refetch on open, on user action and on `visibilitychange`. The only timer allowed is the current-time line, once a minute, paused offscreen.
2. **Store times as UTC instants plus the event's IANA time zone.** Display in the viewer's zone, and say which zone when it differs.
3. **Store recurrence as a rule (RRULE), expand only the visible range.**
4. **A stable ID per event** (`iCalUID` / your UUID) so updates replace instead of duplicating.
5. **Agents propose, people approve.** No invite, booking or cancellation is sent without a human yes.
6. **OAuth only.** Never store a user's Google password (see Google-Meet-Scheduler in the catalog for the anti-example). Refresh tokens are encrypted server-side, scopes are the narrowest that work.
7. **Real data stays private.** Demo calendars use fictional people and businesses.
