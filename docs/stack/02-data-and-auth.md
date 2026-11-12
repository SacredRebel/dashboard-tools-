# Data & auth (Supabase)

## Setup steps

1. Create a Supabase project (region near the client). Save the project URL and anon key.
2. Run the SQL in [docs/crm/data-model.md](../crm/data-model.md) (SQL editor or a migration file in `supabase/migrations/`).
3. Auth: enable Email (magic link) and optionally Google. Set Site URL + redirect URLs to the Vercel production and preview domains.
4. Add env vars locally (`.env.local`) and in Vercel (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only, only if truly needed; never `NEXT_PUBLIC_`)
5. Use `@supabase/ssr` for server components and middleware session refresh (check current docs).
6. Seed **fake** data for previews; never copy production data into previews.

## Security rules (non-negotiable)

- RLS enabled on **every** table, with owner policies. Test: sign in as user B and try to read user A's rows. It must return nothing.
- The service role key never reaches the browser.
- Validate every write with Zod on the server, even if the form validated already.
- Escape/handle user text: React escapes by default; never `dangerouslySetInnerHTML` user content.
- Backups: enable point-in-time recovery or schedule daily dumps before real data goes in.
- Privacy: the client's clients are real people. Keep data in the client's accounts, minimize fields, and support export/delete.

Skills: `agent-protocols:security-and-hardening`, `/security-review`.
