# Phase 7: Ship

**Goal:** a production URL the client can rely on.

**Gate:** production live, real login works, backups on, rollback path written down.

## Checklist

- [ ] `/security-review` run; RLS verified by trying to read another user's row (must fail)
- [ ] Production env vars set in Vercel (Supabase URL + anon key; service key only server-side)
- [ ] Supabase: point-in-time recovery or daily backups enabled; auth email templates branded
- [ ] Custom domain (optional) connected in Vercel; HTTPS automatic
- [ ] Seed/demo data removed from production; real data imported (CSV import tested on a copy first)
- [ ] Error visibility: Vercel runtime logs reviewed; (optional) an error tracker
- [ ] Rollback: Vercel → Deployments → *Promote* the previous deployment (instant). Write this in the README.
- [ ] Favicon, page titles, app name, PWA icon if they'll "install" it on the phone
- [ ] Client logs in on their own phone and laptop

## Tools

`agent-protocols:shipping-and-launch` · `engineering:deploy-checklist` · `/security-review` · Vercel MCP (`get_runtime_errors`, `get_runtime_logs`, domains, env) · `superpowers:verification-before-completion`
