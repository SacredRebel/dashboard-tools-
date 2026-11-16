# Onboarding 2: the build playbook

**Start here only after the person approved the brief and the look** ([START.md step 2](../../START.md#step-2--brief--look-approval-1)).
**Input:** `docs/brief.md`. **Output:** the finished dashboard, checked by you, shown to the person.

## Choose the level

| | Level 1: clickable prototype | Level 2: working app |
|---|---|---|
| What it is | Static HTML, CSS and JavaScript. Believable sample data held in memory. Every page, real navigation, working interactions. | Next.js + Tailwind + shadcn/ui + Supabase. Login, database, row-level security, deployed on Vercel. |
| When | Default. First version, pitches, getting the look and the pages agreed. Any chat-only model. | The person will put real data in it. |
| Time | One session | One to three days in slices |
| Start from | [templates/starter/](../../templates/starter/) + the chosen gallery reference | Level 1 result + [docs/stack/](../stack/01-recommended-stack.md) + [docs/framework/05-build.md](../framework/05-build.md) |

Always build Level 1 first. It settles the look and the pages while changes are cheap, and its tokens, layout and copy carry straight into Level 2.

## Level 1, step by step

### 1. Set up

- **Coding agent:** copy `templates/starter/` into the project (for example `app/`), copy `design-system/tokens.css` next to it and change the stylesheet link to `tokens.css`. Open the reference dashboard's folder `site/dashboards/<id>/` and read its `style.css` and `app.js` to see how the style is made.
- **Chat model:** write one HTML file. Inline the token block for the chosen theme from `design-system/tokens.css` (the `:root` block plus the one `[data-theme="…"]` block), then the styles, then the script.
- Set `<html data-theme="…">` to the brief's theme. Add brand overrides as a small block of token overrides (`--accent`, `--font-display`…), never as raw values scattered in the CSS.

### 2. Shell and navigation

App shell from the starter: sidebar on desktop, bottom bar on phone, one `<main>`, hash routes (`#/overview`). One nav item per page in the brief, in the order the person will use them. Put the business name in the brand slot.

### 3. Sample data

Write the data first, as one object, from the brief's records and fields. Make it believable for *this* business: realistic names, amounts in a sensible range, dates around today, a spread of statuses, one or two awkward cases (a long name, an overdue item, a zero). 12–40 records for the main list. Never real people or companies; phone numbers use 555. Keep one "Sample data" label visible.

### 4. Pages, in this order

For each page: name its pattern ([03-page-patterns.md](../design/03-page-patterns.md)), follow that pattern's "Must" lines, then build.

1. **Overview** (Dashboard): up to 5 numbers from the brief, the "needs attention" list, one chart that answers a question, upcoming items. Nothing editable here; rows open the record.
2. **Main list** (List): search, sort, at least one filter, an "Add" button, rows open the detail.
3. **Record** (Detail): header with the key facts and the next step, then sections or tabs. Edit in a slide-over with validation.
4. **Flow** (Board or Calendar): the brief's steps as columns with drag **and** a keyboard "Move to" control, or a calendar ([docs/calendars/](../calendars/README.md) for the right calendar style).
5. **Remaining pages**, then **Settings** last.

Every list and chart shows four states: loading (skeleton shaped like the content), empty (says what to do next, with the button), error (says what to do next, with retry) and populated.

### 5. Make it look like the reference

The reference dashboard sets the style. Take from it, in this order: background and atmosphere, surface material ([10-materials.md](../design/10-materials.md)), type pairing and sizes, spacing rhythm, chart style, icon style, then its signature element (the brief names it). Use the reference's techniques where it has them: layered glass, cut or organic shapes, a 3D or illustrated hero, depth and soft shadows. A dashboard that has the reference's colors but flat rectangles has not matched it.

**How to build those techniques:** follow [docs/dashboards/02-reference-twin-playbook.md](../dashboards/02-reference-twin-playbook.md). It has copy-ready code for the scaling frame, poured and scooped shapes, layered glass, a live 3D hero and the phone layout, taken from two finished dashboards you can read end to end: `site/dashboards/haven-listings/` (photo frame, glass, organic shapes) and `site/dashboards/meridian-labs/` (flat board around a 3D object). Start a new dashboard by copying whichever is closer, then replace its content with the brief's.

Do not copy the reference's content, business or images. Make new imagery for this business ([11-hero-art-direction.md](../design/11-hero-art-direction.md)).

### 6. Motion

Match the brief's motion level ([09-motion-system.md](../design/09-motion-system.md), [12-microinteractions.md](../design/12-microinteractions.md)):

- **Calm:** pages fade and rise 8px, charts draw in once, numbers count up, controls respond in 100–200ms.
- **Lively:** calm, plus staggered card entrances, sliding nav indicator, hover depth on cards, animated icons.
- **Cinematic:** lively, plus a hero that reacts to the pointer, ambient background movement, shared-element page transitions.

Always: only transform and opacity, nothing loops offscreen, everything lands in its final state under `prefers-reduced-motion`.

### 7. Phone

Design the 375px layout; don't just let it stack. Bottom navigation, tap targets of 44px or more, tables become cards or scroll inside their own container, no horizontal page scroll.

<a id="polish"></a>
## Polish (before you show anything)

Run all of these and fix what they find. Coding agents run the skills; chat models walk the docs.

1. **Rulebook pass:** check every screen against [02-rulebook.md](../design/02-rulebook.md) and [05-anti-patterns.md](../design/05-anti-patterns.md).
2. **High-end pass:** [13-high-end-checklist.md](../design/13-high-end-checklist.md): alignment, number formatting, chart polish, nested radii, hover and focus states.
3. **Words:** verb-first buttons, errors that say what to do, no "Submit", no lorem, the person's vocabulary everywhere (`ux-writing` skill, or the Copy section of the rulebook).
4. **Function:** click every button, fill every form wrong and right, use it with the keyboard only, resize to 375px.
5. **Look at it:** take screenshots at 375px and 1280px of every page and read them. Check the console is clean. Compare the overview side by side with the reference: same level of finish?
6. **Checklist:** [templates/qa-checklist.md](../../templates/qa-checklist.md) and [AGENTS.md §5](../../AGENTS.md).

A chat model that can't run a browser says so, and asks the person to open the file and send a screenshot of anything that looks off.

## Deliver

One message with:

- the link or the file
- screenshots: overview, one inner page, phone
- what works (pages, interactions)
- what is sample data and what isn't built yet (from the brief's "Later")
- the next step you recommend: connect real data (Level 2), add a page, or deploy

Then ask what to change. Apply changes by replacing what was there (no "v2" next to the old one).

## Level 2 in brief

When the person wants the working app: follow [docs/framework/05-build.md](../framework/05-build.md) slice by slice (skeleton → auth and data → list → detail → board → overview → settings), with the data model from the brief ([docs/crm/data-model.md](../crm/data-model.md) for a CRM), tokens mapped to Tailwind ([04-tokens-to-tailwind.md](../stack/04-tokens-to-tailwind.md)), privacy and performance rules from [05-performance-and-privacy.md](../stack/05-performance-and-privacy.md), then [06-polish.md](../framework/06-polish.md), [07-ship.md](../framework/07-ship.md) and [08-handover.md](../framework/08-handover.md). Each slice goes on a preview link the person can click.
