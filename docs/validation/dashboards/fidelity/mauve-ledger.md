# Polish report: Mauve Ledger (`mauve-ledger`)

> Method: [docs/dashboards/06-verification.md](../../dashboards/06-verification.md). Template: [templates/polish-report.md](../../../../templates/polish-report.md).

## Identity (written before any code)

```
Form:        No outer device frame — light full-bleed desk. Soft lilac/peach haze behind the UI. Top: round purple logo + glass pill nav (white active pill) + line utility icons + avatar. Greeting, then four small frosted KPI panes in a row. Below: left “Average sales” pane (~60%) with two big channel values and pale bars (one hatched purple + tooltip); right column “Formation status” (hatched progress) + “Success rate” (segmented arc of rounded ticks). Bottom: one wide “Recent emails” pane. Scrolling board (Tidebath-style container), not a Haven picture frame. Density: airy, generous padding, near-white glass.
Frameworks:  F1 frosted glass (all panes) · F11 backdrop haze (lilac + peach bloom, fixed full-page) · F12 colour (lilac/peach/purple tokens) · F13 type (clean geometric sans only — no serif) · F14 motion (stagger rise, chart grow, hover lift, reduced-motion finals)
Signature:   Diagonally hatched purple selected sales bar with dual-value tooltip + segmented success-rate arc of rounded purple ticks fading to pale
Not this:    Opaque lilac cards, dark ink blocks, or Haven’s rounded photo frame / poured notch header
```

## Step 1 · Measure the reference

Reference: `site/dashboards/mauve-ledger/reference.png` (**689 × 502**).

UI rectangle (full mock — no outer chrome): **x0,y0,x1,y1 = 0, 0, 689, 502** → **W = 689, H = 502** (aspect ≈ **1.373**).

Vertical units use **cqw = px ÷ W × 100**.

| Block | left % of W | top (cqw) | width % of W | height (cqw) | corner (cqw) | made of | outline |
|---|---|---|---|---|---|---|---|
| Backdrop haze | fixed | 0 | 100vw | 100vh | — | lilac top + peach bottom blooms | scene |
| Logo | 3.5 | 4.6 | 5.2 | 5.2 | 50% | solid purple disc | circle |
| Pill nav | 18 | 4.4 | 48 | 6.2 | 3.1 | near-white glass; active white pill | pill |
| Utility icons + avatar | 72 | 4.6 | 24 | 5.8 | — | thin line icons + photo circle | — |
| Greeting | 3.5 | 12.5 | 55 | 5.0 | — | geometric sans headline | text |
| KPI × 4 | 3.5 / ~19 / ~34.5 / ~50 | 17.8 | 14.5 each | 11.5 | 2.2 | frosted glass + line icon | rounded rect |
| Average sales | 3.5 | 31.0 | 61 | 28.0 | 2.5 | frosted glass; pale bars; hatched May | rounded rect |
| Formation status | 67.5 | 31.0 | 28.5 | 11.5 | 2.2 | frosted glass; hatched progress | rounded rect |
| Success rate | 67.5 | 44.0 | 28.5 | 15.0 | 2.2 | frosted glass; segmented arc ticks | rounded rect |
| Recent emails | 3.5 | 60.5 | 92.5 | 10.5 | 2.2 | frosted glass; avatar rows | rounded rect |

### Sampled colors (Pillow)

| Role | RGB | Hex |
|---|---|---|
| Backdrop (near-white / warm) | (235, 231, 228) | `#ebe7e4` |
| Main glass surface | (247, 246, 252) | `#f7f6fc` |
| Accent purple | (122, 99, 199) | `#7a63c7` |
| Text ink | (45, 44, 49) | `#2d2c31` |
| Peach bloom | (224, 172, 185) | `#e0acb9` |

## Evidence

- Side-by-side (reference | ours): `docs/validation/dashboards/fidelity/mauve-ledger-compare.jpg`
- Captures looked at: overview ☑ · overview full length ☑ · every page ☑ · phone full length ☑ · each variant ☑
- `node scripts/build.mjs`: ✔ · `node scripts/dashboards-check.mjs mauve-ledger`: ✔

## The eleven questions

| # | Question | Yes / No | Note |
|---|---|---|---|
| 1 | Same form as its own reference, and unlike other dashboards | Yes | Light scrolling glass desk; no Haven frame |
| 2 | Blocks and heading breaks in the reference's places | Yes | Greeting → KPIs → sales+side → emails |
| 3 | Uses the screen as the reference does | Yes | Width-led board ~1104px |
| 4 | Right style framework and depth on each surface | Yes | F1 five-layer frost 55%/42% tint + blur 24px; haze through panes |
| 5 | Art is part of its surface; 3D is really 3D | Yes | Procedural CSS haze only (no WebGL) |
| 6 | Charts match their numbers | Yes | Online $100,799 readable; May tallest + hatched; gauge ~51% ticks |
| 7 | Nothing spilling, overlapping or empty below the fold | Yes | Full-length: emails + peach bloom through glass |
| 8 | Inner pages belong to this product | Yes | Finance / Accounts / Contracts glass sheets |
| 9 | All content is this dashboard's own | Yes | Fictional Mauve Ledger copy |
| 10 | Phone reads correctly top to bottom | Yes | 2×2 KPIs, stacked panes, rail; no sideways scroll |
| 11 | Every variant is designed and readable | Yes | Lilac / Blush / Slate pass pixel contrast |

## Rounds

| Round | What I saw | What I changed |
|---|---|---|
| 1 | Form right; glass opaque-ish; haze weak; gauge continuous; tip covered Online | Lower glass tint; stronger blooms; radial ticks; tip hover-only; ≥12px; enrich inner pages |
| 2 | Compare + phone + Finance: hatched May/formation match; avatar initials | Phone mail grid; budget % chip |
| 3 | Final overview/full/phone: layout matches; gates ✔ | Stated photo-avatar gap |
| 4 (frameworks reinforce) | Opened `/tmp/mauve-r2/after-overview.png` + compare: Online covered by always-on tip; glass milky; peach weak; `.49` wrapped; formation short vs ref | Stronger peach/lilac (#e89aab); glass 55%/42% + blur 24/saturate 165; tip hover-only; formation 78%; dimmed KPI decimals nowrap; clearer hatch stripes |

## Step log (screenshot → open → note)

- Reinforcement before: opened `/tmp/mauve-r2/overview.png` — Online obscured by tip; glass milky; peach soft.
- After harden: opened `/tmp/mauve-r2/final2.png` — Offline $12,201.00 + Online $100,799.00 both clear; hatched May; peach bloom stronger through emails on full capture.
- Tip hover: opened `/tmp/mauve-r2/after-tip.png` — May tooltip Offline $612 · Online $1,008.
- Full length: opened `/tmp/mauve-r2/final2-full.jpg` — emails pane; peach shows through frost.
- Compare: opened `mauve-ledger-compare.jpg` — same desk kind; glass + haze closer.

## Used

- Interactions tested: period select, bar pick + hover tip, mail All/Urgent, formation View status, Finance search/sort, Accounts range, Contracts save + Preview a state + variant, toasts, bottom rail
- Keyboard and reduced motion tested: Tab through bars/filters; reduced-motion kills rise/grow

## Result

**Finished with a stated gap**

Remaining gaps and why: reference photo avatars (header + emails) are initials chips here — needs generated/cut-out photos. Peach bloom still slightly softer than the painted mock (procedural CSS). No remaining code-fixable “no” on the eleven questions.
