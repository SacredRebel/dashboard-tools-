# Phase 3: Direction (look & feel)

**Goal:** choose how the product should *feel*, and lock it into tokens.

**Gate:** client picked one direction; `tokens.css` theme block and `.ux-profile.md` exist in the project.

## Steps

1. **Collect references.** Ask for 2–3 apps or websites the client loves, plus their logo, brand colors and website if any. Extract with `design-superpowers:map-design` or `small-business:brand-style`.
2. **Write a one-paragraph brief** ([templates/design-direction.md](../../templates/design-direction.md)): personality (3 adjectives), audience, the materials and vocabulary of their world, and what to avoid.
3. **Generate 2–3 distinct directions.** Start from the ten themes (6 classic, 4 cinematic) in [design-system/themes.json](../../design-system/themes.json) (see the live gallery on the showcase site, *Themes* tab). For each, adapt the accent, typeface and density to the brief (`design-superpowers:creative`, `frontend-design:frontend-design`).
   - Show directions **as the real dashboard with realistic sample data**, not as mood adjectives. The showcase's demo CRM switches theme live; screenshot it per theme.
4. **Client chooses.** Mixing is fine ("Atelier's warmth but Coastal's blue"). Record the decision.
5. **Lock it in:**
   - Copy `design-system/tokens.css` into the project and edit the chosen theme block (or add a new one).
   - Write `.ux-profile.md` from [templates/ux-profile.md](../../templates/ux-profile.md). The VectorLab polish skills read it (`vectorlab-ux-skills:setup-ui-ux-skills`).
6. **Contrast check.** Text on surfaces must be ≥ 4.5:1, accent on surface ≥ 3:1 for UI. Fix tokens now, not per component later.
7. **Classic or cinematic?** Classic themes for data-dense daily use. Cinematic glass themes (Grove, Tide, Ember, Aurora) for premium dark products and for the *showcase* layer (handover deck, landing page). Many projects use a classic theme in the app and a cinematic theme to present it.
8. **Write the art direction file** once the first screens render ([templates/art-direction.md](../../templates/art-direction.md)): palette roles, the accent thread, type scale, shape, motion holds, mood in five words, do/don't.

## How to make it feel premium (not generic)

- **Ground it in the subject.** An interior designer's CRM can borrow warm paper and ink. A fitness coach's can borrow energy and clean contrast. Choose type and color from their world.
- **Restraint wins.** One accent hue, neutrals for everything else (60-30-10). Depth from 1px borders and very soft shadows.
- **Type carries personality.** A distinctive display face for page titles + a highly legible UI face. Max two families, three weights.
- **One signature detail**, not ten: e.g. a serif page title, a subtle paper texture on the canvas, or a beautifully set number style for KPIs.

## Tools

| Tier | Tools |
|---|---|
| Core | `design-superpowers:creative`, `frontend-design:frontend-design`, `vectorlab-ux-skills:setup-ui-ux-skills` |
| Recommended | `brand-studio:brand-brief`, `design-superpowers:map-design`, `small-business:brand-style`, `superdesign:superdesign` |
| Optional | `brand-studio:brand-identity-system` (logo), `codesign:create` (mood board), `image-generation` |
