# Data visualization

Charts exist to answer a question. Start from the question, not the chart type.

## Question → chart

| Question | Chart | Notes |
|---|---|---|
| How much right now? | **KPI tile** (number + label + delta) | Big tabular number, small label, delta with ▲▼ and text, not color alone |
| How is it changing over time? | **Line** (or area for one series) | Time on x; ≤ 3 lines; label lines directly instead of a legend |
| How do categories compare? | **Horizontal bar**, sorted | Bars start at zero; sort descending; direct labels |
| Where are things stuck? (stages) | **Funnel-as-bars** or stacked bar | Show count and value per stage |
| What share of a whole? (2–4 parts) | **Stacked bar** or a single donut | Donuts only for ≤ 4 parts with labels |
| Trend in a tiny space | **Sparkline** inside a KPI tile | No axes; highlight last point |
| Two measures related? | Scatter | Rare on a CRM overview; belongs in Analytics |

**Never:** 3D charts, pie charts with 6+ slices, dual y-axes, rainbow palettes, gradient-filled bars, animated chart entrances longer than 300 ms.

## KPI tile anatomy

```
Pipeline value            ← label, 14px, --text-muted
€48,200                   ← 28–36px display, tabular-nums, --text
▲ 12% vs last month       ← 12–14px, --success + arrow + words
```

Max 5 tiles. Each one must answer "so what do I do?" Good CRM KPIs: *Open pipeline value*, *Follow-ups due today*, *New leads this month*, *Won this month*, *Win rate (90 days)*.

## Color in charts

- One series: `--accent`. Multiple categories: `--chart-1 … --chart-5` in that order. Never more than 5. Group the rest as "Other".
- Status colors (`--success/--danger`) only for meaning (won/lost), always with labels.
- Gridlines: `--border` at low contrast, horizontal only. Axes: no heavy lines.
- Same chart must read in light and dark themes. Every theme in tokens.css defines its own `--chart-*`.

## Interaction

- Tooltip on hover **and** focus, showing exact values with units.
- Clicking a bar/stage navigates to the filtered list (e.g. Pipeline → Proposal).
- Empty chart: keep axes and show "No won clients yet this month" in the plot area.

## Implementation

Recharts (or shadcn/ui charts, which wrap Recharts). Set colors from CSS variables, e.g. `stroke="var(--chart-1)"`. The showcase site's charts are dependency-free HTML/CSS (text never scales below 12px); use them as visual references.

Deep skill: `dataviz` (chart system), `data:build-dashboard` (HTML report dashboards), `design-skills:design-elevation` (Tufte data-ink ratio).
