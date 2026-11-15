# Fidelity Round 4 — Batch 1 handoff

Branch: `cursor/fidelity-r4-batch1-0545`  
Base: `main`  
PR: draft — **do not merge** (architect review of Batch 1 only)  
Next: **Batch 2** (after architect sign-off)

## Framework (first commits)

1. **Vendor three.js 0.170.0** — `site/dashboards/_vendor/three@0.170.0/` (MIT: `three.module.min.js` + GLTFLoader, DRACOLoader, MeshoptDecoder, RoomEnvironment, OrbitControls). No CDN.
2. **`_shared/three/stage.js`** — `createStage(canvas, opts)`: alpha clear, ResizeObserver, DPR≤2, `DB.onVisible` + tab-active loop, reduced-motion single frame, poster fallback, pointer parallax ≤8°, ACES + RoomEnvironment.
3. **Shape kit** — `_shared/shape/` + `docs/design/14-shape-language.md`: `notchFrame`, `scoop`, `tabCard`, `chamfer`, `wave`, `blob`, `arcSlot` (SVG paths / clip-path, ResizeObserver, drop-shadow wrappers).
4. **Liquid glass** — `_shared/fx/materials.css` + `docs/design/10-materials.md`: 5-layer `mat-glass-frost|liquid|dark|holo`.
5. **Deleted** `_shared/dense-pages.js` / `.css` and every call site → `_shared/ui/` primitives only (table, drawer, field, segmented, calendar, skeleton, toast).

## Batch 1 boards

| Board | Tech | 3D source | Screenshot-to-code | Check | Remaining visible diffs |
|---|---|---|---|---|---|
| **haven-listings** | shape, glass | none (alpine CSS/SVG backdrop) | unreachable — Pillow blueprint | ✔ | Notch geometry / listing scoop vs crop still ~few px; agent strip removed from overview as specified |
| **glacier-ops** | webgl, shape | procedural three.js mountain-in-hemisphere lens | unreachable — Pillow blueprint | ✔ | Dial arc + topo grain softer than ref; cyan chart density lighter on secondary |
| **citadel-wall** | webgl, shape | procedural hologram cube (nested BoxGeometry + edges + torus pedestal + light cone); Network glass globe | unreachable — Pillow blueprint | ✔ | HUD chamfer corners vs ref; globe land masses abstract |
| **mauve-ledger** | glass | none | unreachable — Pillow blueprint | ✔ | Hatched bars / arc gauge proportions; greeting weight vs ref |
| **saffron-dusk** | glass, shape | none (CSS liquid-glass twin phones — not photos-in-boxes) | unreachable — Pillow blueprint | ✔ | Phone chrome bevels; sun-arc illustration simpler than ref; day chips 8–13 |

## Hard notes for architect

- **Image-to-3D / screenshot-to-code unreachable** in this environment — noted once here and in per-board `media/CREDITS.md` + `docs/validation/dashboards/fidelity/<id>.md`. Heroes are procedural three.js or CSS/SVG shapes — never photo-in-rectangle.
- Gates passed via real surfaces (WebGL ≥220px where required; shape clip/mask/path ≥300px; glass ≥3×≥160px backdrop-filter) — not token canvases.
- One commit per dashboard after framework commits. **Stop after Batch 1.**

## Check results

```
✔ haven-listings
✔ glacier-ops
✔ citadel-wall
✔ mauve-ledger
✔ saffron-dusk
```

(`node scripts/dashboards-check.mjs <id>` each ✔)

## Compare

https://github.com/SacredRebel/dashboard-tools-/compare/main...cursor/fidelity-r4-batch1-0545?expand=1
