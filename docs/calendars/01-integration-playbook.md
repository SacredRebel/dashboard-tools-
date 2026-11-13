# Calendar integration playbook

Step-by-step for connecting a dashboard to real calendars. Stack assumed: Next.js on Vercel, Supabase (Postgres + RLS). The shapes carry over to any stack.

[← Calendar hub](README.md)

---

## 0. Data model first

Your database is the source of truth for the app. External calendars are mirrors.

```sql
create table meetings (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id),
  client_id     uuid references clients(id) on delete set null,
  title         text not null,
  starts_at     timestamptz not null,          -- UTC instant
  ends_at       timestamptz not null,
  time_zone     text not null default 'America/New_York', -- IANA zone the event was created in
  all_day       boolean not null default false,
  rrule         text,                          -- e.g. FREQ=WEEKLY;INTERVAL=2;BYDAY=TU
  location      text,
  meet_url      text,
  status        text not null default 'confirmed' check (status in ('tentative','confirmed','cancelled')),
  ical_uid      text unique not null default (gen_random_uuid()::text || '@yourapp'),
  provider      text check (provider in ('google','microsoft','caldav')),
  provider_event_id text,
  etag          text,                          -- provider version, for conflict checks
  updated_at    timestamptz not null default now()
);
alter table meetings enable row level security;
create policy "own meetings" on meetings for all using (owner_id = auth.uid());

create table calendar_connections (
  owner_id      uuid primary key references auth.users(id),
  provider      text not null,
  calendar_id   text not null default 'primary',
  refresh_token_encrypted bytea not null,      -- encrypt with a key in Vercel env, never plain
  sync_token    text,                          -- Google incremental sync cursor
  channel_id    text, channel_resource_id text, channel_expires_at timestamptz
);
alter table calendar_connections enable row level security;  -- server-only access via service role
```

Rules: times are `timestamptz`, the zone is stored separately, recurrence is a rule, and every event has a stable `ical_uid`.

---

## 1. Google Calendar (two-way sync)

### 1.1 Connect

1. Google Cloud project → enable **Google Calendar API** → OAuth consent screen → OAuth client (Web).
2. Scopes: start with `https://www.googleapis.com/auth/calendar.events` (read/write events). Add `calendar.readonly` for listing calendars only if needed. Avoid the full `calendar` scope.
3. Request `access_type=offline` and `prompt=consent` once, to get a refresh token. Encrypt it and store it in `calendar_connections`.
4. Client ID and secret live in **Vercel env vars**, never in the repo.

### 1.2 First sync, then incremental

```ts
// server route only (app/api/calendar/sync/route.ts)
import { google } from 'googleapis';

const cal = google.calendar({ version: 'v3', auth: oauthClientFor(user) });

async function sync(conn) {
  let pageToken, syncToken = conn.sync_token;
  do {
    const res = await cal.events.list({
      calendarId: conn.calendar_id,
      ...(syncToken ? { syncToken } : { timeMin: monthsAgo(3), singleEvents: false }),
      pageToken, maxResults: 250, showDeleted: true,
    }).catch((e) => { if (e.code === 410) return null; throw e; }); // token expired → full resync
    if (!res) { conn.sync_token = null; return sync(conn); }
    await upsertEvents(res.data.items);      // match on provider_event_id or iCalUID; cancelled → status
    pageToken = res.data.nextPageToken;
    if (res.data.nextSyncToken) await saveSyncToken(conn, res.data.nextSyncToken);
  } while (pageToken);
}
```

### 1.3 Push, never poll

```ts
await cal.events.watch({
  calendarId: 'primary',
  requestBody: { id: crypto.randomUUID(), type: 'web_hook', address: 'https://yourapp.com/api/calendar/webhook', token: perUserSecret },
});
```

- Google POSTs to the webhook when something changes. The body is empty. Check `X-Goog-Channel-Token` matches, then run **incremental sync** (1.2).
- Channels expire (Google sets `expiration`). Renew from a daily **Vercel Cron**, which is a scheduled job, not polling the calendar for changes. Renew only channels that expire within 48h.
- Also sync when the user opens the calendar screen and on `visibilitychange`.

### 1.4 Create an event with a Meet link

```ts
await cal.events.insert({
  calendarId: 'primary', conferenceDataVersion: 1, sendUpdates: 'all',   // only after the human approved
  requestBody: {
    summary: 'Discovery call · Harbor & Pine Interiors',
    start: { dateTime: '2026-11-18T15:00:00', timeZone: 'America/New_York' },
    end:   { dateTime: '2026-11-18T15:30:00', timeZone: 'America/New_York' },
    attendees: [{ email: 'client@example.com' }],
    iCalUID: meeting.ical_uid,
    conferenceData: { createRequest: { requestId: meeting.id, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
  },
});
```

Save `id`, `etag` and `hangoutLink` back to the row. On update, send `If-Match: etag`. On a 412, re-read and show the person what changed.

### 1.5 Free/busy for booking

`freebusy.query({ timeMin, timeMax, items: [{ id: 'primary' }] })` returns busy blocks. Subtract them from working hours to show **only free slots** (Booking slots style).

---

## 2. Microsoft 365 / Outlook

Same shape with Microsoft Graph: OAuth (`Calendars.ReadWrite`, `offline_access`), `/me/calendarView/delta` for incremental sync, and **change notifications** (`POST /subscriptions`) for push, renewed before they expire. Teams links: `isOnlineMeeting: true`.

If the client lives in Outlook but the app only speaks Google, they can run **Outlook Google Calendar Sync** on their PC (see catalog). Document it in the handover guide. It's a user tool, not app code.

---

## 3. CalDAV (Nextcloud, iCloud, Fastmail)

- Use a CalDAV client library (for example `tsdav` in Node). Discover the calendar home, then `REPORT` with `sync-collection` for incremental changes using the `sync-token`.
- Parse with **ical.js** and expand recurrence for the visible range only.
- Nextcloud Calendar is the self-hosted front end. Your app talks to the server over CalDAV and never imports Nextcloud's AGPL code.

---

<a id="ics"></a>
## 4. ICS: subscribe feeds and Add to calendar

The cheapest integration, and it works with every calendar app.

```ts
// app/api/calendar/[token]/route.ts
import ical from 'ical-generator';
export async function GET(_, { params }) {
  const owner = await ownerForFeedToken(params.token);   // long random token, rotate to revoke
  if (!owner) return new Response('Not found', { status: 404 });
  const cal = ical({ name: 'Follow-ups', timezone: 'America/New_York' });
  for (const m of await meetingsFor(owner)) {
    cal.createEvent({ id: m.ical_uid, start: m.starts_at, end: m.ends_at, summary: m.title, url: `https://yourapp.com/clients/${m.client_id}` });
  }
  return new Response(cal.toString(), { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'private, max-age=900' } });
}
```

- **Add to calendar** button: the same generator for a single event, with `Content-Disposition: attachment; filename=meeting.ics`.
- Feeds are read-only, and calendar apps refresh them on their own schedule, from minutes to a day. Say so in the UI.
- Repeat rules: store `rrule`, emit it with `repeating`, and describe it with `rrule`'s `toText()`.

---

## 5. Booking pages

- **Embed** Cal.com (or link Calendly) on the website. Don't build availability logic for v1.
- Receive the `BOOKING_CREATED` webhook → find or create the client by email → insert a `meetings` row → put the card in the first stage. Verify the webhook signature.
- If you do build it yourself: working hours − free/busy − buffer = slots. Show the visitor's time zone with a way to change it, and a confirm step.

---

<a id="agents"></a>
## 6. Agents and calendars

| Tool | Use for | Notes |
|---|---|---|
| Google Calendar connector (hosted MCP) | "What's my week?", "Find 30 minutes with Maya", drafting events | First choice when available |
| google-calendar-mcp (open source) | Several Google accounts, conflict checks across them | Self-host, needs your own OAuth client |
| gcalcli | Seeding test calendars, quick agenda in a terminal | Dev only |
| `sales:schedule-meeting` skill | Find a time, book it and log it to the CRM | Confirm the slot first |

**The approval gate is mandatory:** the agent reads freely, proposes a change ("Book Tue 3:00–3:30 with Maya, Meet link, invite sent to maya@…?"), and acts only after a yes. That includes cancellations and reschedules. Log every agent action on the client's timeline.

---

## 7. Meetings and video

- For a CRM, a meeting = an event + a **Meet link** (1.4) or a Zoom link (`zoom-plugin` skills). Don't build WebRTC.
- After the call, notes come from a recorder (Fathom, Fireflies) or the **Meet REST API** (`google/apps/meet/v2` in googleapis: conference records, participants, transcripts). Match them to the meeting by Meet code or `ical_uid`, and attach the summary to the client's timeline.
- The video repos in the catalog (Video-Meeting, google-meet-clone, grid-view) are **layout references only**: no license or all rights reserved.

---

## 8. Checklist before you call it done

- [ ] Times stored as UTC + IANA zone; display shows the zone when it differs from the viewer's
- [ ] DST: an event at 9:00 every Monday stays at 9:00 local across the change (test March and November)
- [ ] Recurrence expanded only for the visible range; editing "this event" vs "all events" both work
- [ ] Incremental sync handles `410 Gone` (full resync) and cancelled events
- [ ] Push channel / subscription renewal scheduled; no polling anywhere
- [ ] Webhooks verify their token or signature
- [ ] Refresh tokens encrypted; scopes minimal; disconnect revokes the token and stops the channel
- [ ] Agent writes go through an approval step
- [ ] Loading, empty ("No meetings this week"), error ("Couldn't reach Google. Try again") and populated states
- [ ] Evidence (screenshots at 375 and 1280, sync log) saved in `docs/validation/`
