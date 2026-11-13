# Anti-patterns (the "AI slop" list)

Agents fall into these by default. Check every screen against this list before showing a human.

| Anti-pattern | Why it's bad | Do instead |
|---|---|---|
| Rainbow / multi-hue gradient buttons | Screams template; competes with content | Solid accent fill, hover one step darker |
| Glass behind data or body text | Contrast changes as content scrolls under it; blur drops frames | Data on opaque `--surface`. Glass only for showcase chrome (frames, captions, nav) in cinematic themes, with a visible edge |
| Auto-advancing carousels / sliders | People can't read or control them | Visitor-controlled story player with readable holds |
| AI demo that "sends" by itself | Teaches distrust | Approval gate: the sequence waits for a person |
| Polling timers (`setInterval` + fetch) | Drains battery, burns frames | Events: open, action, `visibilitychange`, realtime |
| Keeping v1 "just in case" next to v2 | Confuses the next session about what's live | Replace, delete, verify, record evidence |
| Cartoon people / mascots in empty states | Patronizing, off-brand | Headline + sentence + primary action |
| Pastel pills around every piece of metadata | Visual noise, no meaning | Plain text; chips only for interactive filters or real status |
| Decorative icons in every input | Clutter; hurts scanning | Only functional icons (search, clear, show password) |
| 6+ KPI tiles / "everything" dashboards | Nothing stands out | ≤ 5 tiles, each drives a decision |
| Big number + tiny label + gradient accent as the default hero | The most generated layout on the internet | Earn it: only if that number is the point |
| Fade-and-slide-up on every section | Feels generated and slow | One meaningful moment, or none |
| Bouncy / elastic hover effects | Cheap, distracting | Border or background shift, 150 ms |
| Full-page spinners | Feels slow, hides structure | Skeleton matching the layout |
| Hover-only actions | Impossible on phones and keyboards | Visible button or ⋯ menu |
| 12px table text | Unreadable, fatiguing | 14px secondary / 16px body |
| ALL-CAPS labels everywhere | Shouty, hard to read | Sentence case; caps only for rare overlines |
| One accented word in a headline | Generated-page tell | Let the typeface do the work |
| `01 / 02 / 03` numbering on non-sequences | Fake structure | Numbers only for real steps |
| "Are you sure?" dialogs | Vague, gets clicked through | Name the item; prefer undo |
| "Submit" / "OK" buttons | Meaningless | Verb + object |
| Placeholder as label | Disappears while typing; inaccessible | Visible label above input |
| Stacked modals | Lost context | Promote to a page |
| Color as the only signal | Fails color-blind users | Color + icon/text |
| Mixing icon sets/stroke widths | Unpolished | One set (Lucide), one stroke |
| Fake "real" numbers in demos | Erodes trust | Clearly labeled sample data |

**Anti-slop deletes decoration, not structure.** If removing pills and gradients leaves a table with no frame or a search with no visible field, you over-corrected.
