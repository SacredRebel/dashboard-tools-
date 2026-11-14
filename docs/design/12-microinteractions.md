# Microinteractions — control states and FX mapping

Every interactive control has rest → hover → press → focus → selected → disabled → loading → success/error where it applies. Durations and easing come from [09-motion-system.md](09-motion-system.md). Effects live in `site/dashboards/_shared/fx/`.

---

## State matrix

| Control | Rest | Hover | Press | Focus | Selected | Disabled | Loading | Success / error |
|---|---|---|---|---|---|---|---|---|
| Button | fill + edge | lift 1px / brighter | scale 0.98 100ms | accent ring | — | 40% opacity, no pointer | spinner replaces label | check / shake once |
| Icon button | muted | accent color | scale 0.96 | ring | filled weight | muted | — | — |
| Segmented | quiet track | item brighten | squash thumb | ring on group | solid pill | locked | — | — |
| Toggle | track off | — | thumb squash | ring | track accent | muted | — | — |
| Slider | track | thumb scale 1.04 | thumb squash | ring | fill to value | muted | — | — |
| Card (action) | surface | spotlight or lift | scale 0.995 | ring | border accent | — | skeleton | — |
| Row / list | — | surface-2 | — | ring | selected fill | — | shimmer | — |
| Input | border | border stronger | — | accent ring | — | muted | — | error border + message |
| Nav pill | muted | brighten | — | ring | shared-element morph | — | — | — |

---

## Duration map

| Moment | Token | Cap |
|---|---|---|
| Icon / press | `--dur-1` | 100ms |
| Hover on/off | `--dur-2` | 150ms |
| Card enter / route fade | `--dur-3` | 200ms |
| Count-up / chart draw | `--dur-4` | 300ms |
| Ambient loop | 8–20s | pause offscreen |
| Route transition | 180ms | View Transitions or cross-fade |

Easing: enter `--ease-out`, exit `--ease-in`, press `--spring-snappy`. No bouncy motion on data charts.

---

## FX library mapping

| `data-fx` | Use on | Avoid on |
|---|---|---|
| `reveal` | Card grids on first view | Dense tables mid-scroll |
| `count` / `odo` | KPIs | Body copy |
| `draw` | Charts | Decorative SVGs without meaning |
| `spotlight` | Hero / marketing cards | Spreadsheet rows |
| `tilt` | Hero art cards (≤ 4°) | Data tables, forms |
| `magnet` | Primary CTA | Every button |
| `split` | One hero title | Subheads |
| `shine` | Premium label once | Body text |
| `parallax` / `ambient` | Layered hero | Text panels |
| `sparks` | Click feedback only | Continuous loops |
| `list` | Live feeds | Static tables |
| `route` | Auto in `DB.route` | Manual timers |

Animated icons: `data-icon` + `data-anim="hover"|"active"` from `_shared/icons/`.

Lottie: only 3–6 meaningful moments gallery-wide (success, empty, weather, loading orb). Pause offscreen.
