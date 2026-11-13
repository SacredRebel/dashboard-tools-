# Performance, privacy & engineering contract

Rules distilled from shipping real client sites. They apply to every app built with this toolkit.

## Two rules that override convenience

### 1. No polling. Subscribe to events.
Never ask a server for data on a timer (`setInterval` + `fetch`, "check every few seconds"). It looks fine in testing and drains batteries and frame rate for real users.

Load data when something happens:
- page open, or a user action (save, refresh button)
- `visibilitychange` when the tab comes back
- a real push from the backend: **Supabase Realtime**, webhooks, server-sent events

UI-only timers (animations, demo clocks, relative "2 min ago" labels) must stop while offscreen or in a background tab.

```js
// ✅ refresh on return, not on a timer
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
// ✅ realtime instead of polling
supabase.channel('clients').on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, onChange).subscribe();
```

### 2. No fallback versions. Replace, then verify.
When changing a feature, change it. Don't build "version 2" next to "version 1 just in case". Don't keep `-old` classes, `?v=old` switches, duplicate selectors or compatibility shims. Delete what the new version replaces **in the same change**, then verify the new version (tests, screenshots, computed-style comparisons). Dead code confuses the next AI session about which version is live.

User-facing safety nets are fine *when they are the feature*, e.g. "Open in my email app" when a form can't send.

## Performance budget

| Metric | Budget | How to check |
|---|---|---|
| Frame rate during interaction/animation | 60 fps at **4× CPU throttle** | DevTools → Performance → CPU 4× slowdown |
| Layout shift (CLS) | **< 0.1** on every page | Lighthouse / web-vitals |
| Today view interactive | < 2 s on a phone on 4G | Lighthouse mobile |
| JS per page | Only what the page uses | Bundle analyzer |

Practices:
- Animate `transform`/`opacity` only. Avoid `backdrop-filter` on moving elements.
- Reserve space for async content (image `width`/`height`, skeletons, fixed badge slots).
- Destroy WebGL/canvas contexts and observers when a view closes. Cap ambient rendering at ~30 fps.
- `next/font` for fonts: no layout shift, no third-party requests.

## Privacy by default

- **No trackers.** No ad pixels, third-party cookies, social widgets or third-party fonts/CDNs. Self-host fonts (`next/font` does this). Use first-party, cookieless analytics only, if any (e.g. Vercel Web Analytics).
- **Content-Security-Policy.** Allow only your own origin plus the services you actually use. Adding any outside script, font, frame or API means updating the CSP **and** the privacy page in the same change.
- **A real privacy page** that says exactly what is collected and where it is stored.
- **Never publish private details.** Keep the owner's home town, area code, surname, personal accounts and real client names out of page text, meta tags, JSON-LD, preview images, demo data and `llms.txt`. Private notes live in folders excluded from deploys (`.vercelignore`).
- **Demo data is neutral.** Made-up businesses, made-up places, `555` phone numbers, `.example` emails.

Example `vercel.json` header:

```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "Content-Security-Policy", "value": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' https://YOUR-PROJECT.supabase.co wss://YOUR-PROJECT.supabase.co; frame-ancestors 'none'" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "X-Content-Type-Options", "value": "nosniff" }
    ]
  }]
}
```

## Evidence files

Each significant pass (a new screen, a polish round, a release) leaves a small JSON evidence file in `docs/validation/`: what was checked, at which widths, what passed, with screenshot paths. See [templates/validation.json](../../templates/validation.json). This is "evidence before claims" written down, so the next session (or the client's AI) can see what was verified.

## Every button must work

Before handover, click every button, link and menu item at 375px and 1280px. A dead button costs more trust than a missing feature.
