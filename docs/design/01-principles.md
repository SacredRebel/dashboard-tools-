# Design principles for dashboards that feel premium

Seven principles. The [rulebook](02-rulebook.md) turns them into checkable rules.

## 1. One job per screen
Every screen answers one question: "What needs my attention today?", "Where is each client?", "Who is this client?" If a screen answers three questions, split it. The page pattern ([03-page-patterns.md](03-page-patterns.md)) is how you commit to the job.

## 2. Glance, then act
A dashboard is read in seconds. Put the most decision-relevant information top-left. Numbers that matter get big, calm typography. Everything else gets out of the way. Actions are one click away, never hidden behind hover.

## 3. Grounded, not generic
Premium design comes from **specificity**. Take palette, type and vocabulary from the client's world: an interior designer's warm paper and ink, a wellness coach's sage and linen, a luxury broker's black and champagne. Use the client's words for stages and buttons. Avoid anything that looks like the default output of a template.

## 4. Restraint is the luxury
- One accent color carries every action. Everything else is neutral (60-30-10).
- Depth from 1px borders and barely-there shadows, not heavy cards and glows.
- Two typefaces max, three weights max.
- One signature detail (a serif page title, beautiful numerals, a subtle canvas texture), not ten effects.

## 5. Every state is designed
Empty, loading, error, filtered-to-nothing, one record, a thousand records, a very long name. Real products live in these states. The empty state is the onboarding.

## 6. Calm motion that explains change
Motion shows where something came from and went (a card moving stages, a drawer sliding in). 100–300 ms, ease-out in, ease-in out, transform and opacity only. Nothing loops for decoration. Respect reduced-motion.

## 7. Works for everyone, everywhere
Phone at 375px and laptop at 1280px. Keyboard-only. Screen reader labels. AA contrast. Tap targets ≥ 44px. Accessibility is a quality bar, not a feature.

---

## The premium checklist (what clients notice)

| They notice | What creates it |
|---|---|
| "It feels calm" | Generous, consistent spacing (8pt), neutral surfaces, single accent |
| "It feels expensive" | Distinctive display type, tight heading line-height, tabular numerals, hairline borders |
| "It's so fast" | No spinners under 100 ms, skeletons that match the layout, optimistic updates |
| "It's easy" | Their own words, verb-first buttons, smart defaults, one obvious next action |
| "It's smooth" | 150–200 ms transitions, no layout shift, focus never lost |
| "It's mine" | Their colors/logo, their stages, their sample-free real data |

## Inspiration (study, don't copy)

Linear (restraint, speed), Attio (modern CRM data density), Notion (calm neutrals), Stripe Dashboard (data typography), Things 3 (warmth, focus), Superhuman (keyboard-first). Borrow principles, never visual identity.
