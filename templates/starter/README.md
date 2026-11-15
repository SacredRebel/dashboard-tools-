# Starter: clickable prototype

A working skeleton for a Level 1 dashboard ([docs/onboarding/02-build-playbook.md](../../docs/onboarding/02-build-playbook.md)). No build step and no dependencies.

- `index.html`: app shell (sidebar, main, slide-over, toast). Set `data-theme` on `<html>`.
- `style.css`: layout and components, design tokens only. Phone layout under 860px.
- `app.js`: hash router, sample data, four pages (overview, list with search and sort, board with "Move to", settings), a slide-over form with validation, and loading, empty and error states for every list.

To use it: copy this folder, copy `design-system/tokens.css` next to it, change the stylesheet link to `tokens.css`, then replace `BRAND`, `STAGES`, `PAGES`, `DATA` and the render functions with the brief's content. Restyle it after the chosen gallery reference; the starter is deliberately plain.
