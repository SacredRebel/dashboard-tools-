# CRM data model (starter)

Start here and **delete** what the client doesn't need. Every field must serve a job from discovery. Names below are technical. Show the client's own words in the UI.

## Entities

```
contacts ──< deals >── stages
    │          │
    └──< activities >──┘
tasks (follow-ups) → contact and/or deal
```

For many small businesses **one person = one deal at a time**, so `contacts` and `deals` can be merged into a single `clients` table with a `stage`. Start merged; split only if the client really has multiple deals per person.

### `clients` (merged contact + deal, recommended for v1)

| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| owner_id | uuid | → auth.users; RLS key |
| name | text | required |
| company | text | optional |
| email, phone | text | optional |
| stage_id | uuid | → stages |
| value | numeric | optional; currency from settings |
| source | text | e.g. Referral, Instagram, Website (configurable list) |
| next_step | text | the single most useful field in a small CRM |
| next_step_due | date | drives "due / overdue" |
| last_activity_at | timestamptz | updated by trigger on activity insert; drives "gone quiet" |
| stage_changed_at | timestamptz | drives "days in stage" |
| tags | text[] | optional |
| notes | text | free text (long-form notes go in activities) |
| archived_at | timestamptz | soft delete |
| created_at, updated_at | timestamptz | |

### `stages`

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| owner_id | uuid | |
| name | text | the client's words, e.g. "Discovery call" |
| position | int | order on the board |
| kind | enum `open` / `won` / `lost` | won/lost drive KPIs |
| color | text | optional token name, not a hex |

### `activities`

| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| owner_id | uuid | |
| client_id | uuid | → clients |
| type | enum `call` / `meeting` / `email` / `note` / `stage_change` | |
| body | text | summary or note; transcript summaries land here |
| occurred_at | timestamptz | default now |

### `settings` (one row per owner)

currency · locale · gone_quiet_days (default 14) · default_follow_up_days (default 3) · sources[] · business_name · logo_url

## Derived values (compute, don't store)

- **Overdue:** `next_step_due < today` and stage kind = open
- **Gone quiet:** `last_activity_at < now() - gone_quiet_days` and stage open
- **Days in stage:** `today - stage_changed_at`
- **Pipeline value:** sum(value) where stage open
- **Win rate (90d):** won / (won + lost) among clients that closed in last 90 days

## Security

- RLS on every table: `owner_id = auth.uid()` for select/insert/update/delete.
- For a small team later: add `team_id` and a `memberships` table; policies check membership.

## Supabase SQL starter

```sql
create type stage_kind as enum ('open','won','lost');
create type activity_type as enum ('call','meeting','email','note','stage_change');

create table stages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade default auth.uid(),
  name text not null, position int not null, kind stage_kind not null default 'open'
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade default auth.uid(),
  name text not null, company text, email text, phone text,
  stage_id uuid references stages on delete set null,
  value numeric, source text, next_step text, next_step_due date,
  last_activity_at timestamptz, stage_changed_at timestamptz default now(),
  tags text[] default '{}', notes text, archived_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade default auth.uid(),
  client_id uuid not null references clients on delete cascade,
  type activity_type not null, body text, occurred_at timestamptz default now()
);

alter table stages enable row level security;
alter table clients enable row level security;
alter table activities enable row level security;

create policy "own stages" on stages for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own clients" on clients for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own activities" on activities for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
```

Verify against current Supabase docs before running (`agent-protocols:source-driven-development`).
