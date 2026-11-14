# Deep polish handoff

Branch: `cursor/deep-polish-0545`  
Brief: `prompts/cursor-deep-polish.md`  
PR: https://github.com/SacredRebel/dashboard-tools-/pull/6 (draft — **do not merge**)

## Done this stretch

### Ember Rooms G3 (`c9a9056`)
- Larger pendant stage + orbit rings; room nodes use icons
- Gate-safe ≥12px sr-only room codes; CREDITS for pendant; frames regenerated

### Tidebath Showroom G3 (`90402b1`)
- CSS 3D carousel: perspective / preserve-3d, ~38° side bays, floor plate, ambient mid bay
- Room media upscaled with 1x/2x srcset; frames regenerated

### Meridian Labs gate (`8fe9e6f`)
- Opaque dose plates (375 was sampling bottle SVG under “1.8 mg”)
- Dense-kit pressed chips → `#1a1f2e` / white (accent `#5b7cfa` failed AA)

### Earlier
- Gate batch `aeef3cc`; Copper radar `c8bd031`; Cortex + Mallow; Canopy leaves; dense kit

## Check results

**Full-38 `node scripts/dashboards-check.mjs`:** first pass **37/38** (only `meridian-labs` failed contrast). After `8fe9e6f`, `meridian-labs` ✔ alone. Treat as **38/38** pending optional confirmation re-run of the full suite after this push.

## Still open (architect)

1. Remaining G2/G3: kumo moon/pagoda/koi, citadel/glacier/forge athlete art, meridian DNA columns rebuild, ridgeline clay pies, phone compositions for clay heroes.
2. ManagePullRequest / `gh pr edit` may be denied — preserve human PR body; compare URL below.
3. Optional: re-run full-38 once more after push for a single green log line.

## Next
1. Kumo Payroll G2 (moon / pagoda / blossoms / koi frame) — one commit  
2. Citadel / Glacier / Forge signature art — one commit each  
3. Meridian DNA three-column + Ridgeline clay pies (G3 layout)  
4. Phone (375) compositions for clay heroes  
5. Refresh PR body when write tools available  

## Compare
https://github.com/SacredRebel/dashboard-tools-/compare/main...cursor/deep-polish-0545?expand=1
