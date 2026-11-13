# Art direction: <product or page>

*An art direction file records the visual decisions **already rendered**, so every later change (by you, an agent, or the client's AI) stays in the same world. Extract values from the computed CSS in the browser at 1440px and 390px. Don't invent new ones here.*

Date extracted: ___ · Theme: `data-theme="___"` · Extracted from: ___

## One world
One paragraph: the ground, the surfaces, the one element allowed to cross every section (the "thread").

## Palette (roles, not just colors)

| Role | Value / token | Where it lives |
|---|---|---|
| Ground | `--bg` | body, hero, footer band |
| Surface | `--surface` | cards, tables, sidebar |
| Glass (showcase only) | `--glass-fill` / `--glass-edge` | frames, captions, nav bar |
| Accent | `--accent` | primary button, active nav, focus |
| Secondary accent | `--accent-2` | thread gradient end, glows |
| Text | `--text` / `--text-muted` / `--text-subtle` | headings / lead / meta |
| Role colors (carry meaning) | e.g. client · crew · money | badges, diagram nodes |

**The thread:** `--thread` appears as ___ and never as a fill behind body text.

## Type

| Element | Size | Weight · tracking · leading |
|---|---|---|
| h1 | clamp(…) | |
| h2 | | |
| Lead | | |
| Body | | |
| Meta | ≥ 12px | |

Families: display ___ · UI ___ · inside app mock-ups ___

## Shape
Radii (pills, cards, large frames) · line weight and alpha · shadow style.

## Motion
- Holds: story step ___ s · result ___ s
- Easing: entrances ___ · UI state ___
- Spring (only for direct manipulation): tension ___ / friction ___
- Loops in place (all pause offscreen): ___
- Reduced motion: static, complete states

## Mood in five words
___ · ___ · ___ · ___ · ___

## Do / don't

| Do | Don't |
|---|---|
| Let the working app be the hero; frame it, point at it | Add decorative objects unrelated to the workflow |
| Carry the thread across sections | Invent new colors per section |
| 12px / 15px floors, 44px targets, visible focus | Hover-only controls |
| Vary section rhythm with bands and frames | Same padding and width everywhere |
| Pause anything offscreen | Auto-advance faster than a person can read |
