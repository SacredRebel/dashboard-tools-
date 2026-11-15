# Asset and tool map

Which outside tools help build a gallery dashboard, what each is good for, and what to do when it cannot run. Read this with [02-reference-twin-playbook.md](02-reference-twin-playbook.md).

**The honest constraint:** most 3D-generation and image-generation projects need a GPU and several gigabytes of model weights. A coding agent in an editor or a cloud sandbox usually cannot run them. So every row below has a "when it can't run" column, and the default route for this gallery needs none of them.

## Default route (always available)

| Need | Use | Where |
|---|---|---|
| 3D hero object, geometric | three.js geometry and physical materials | playbook Step 7, `_vendor/three@*`, `_shared/three/stage.js` |
| Organic outlines | CSS radial-gradient fillets, CSS masks, inline SVG paths | playbook Step 4 |
| Glass, clay, HUD surfaces | layered CSS | playbook Step 5, `docs/design/10-materials.md` |
| Rock, paper, sand backdrops | SVG `feTurbulence` + `feDiffuseLighting` | `haven-listings/index.html` `#hl-rock` |
| Motion | Motion (vendored, the engine behind Framer Motion), GSAP (vendored), CSS keyframes | `docs/design/09-motion-system.md` |
| Structure from a screenshot | measure with Pillow | playbook Step 1 |

## 3D from an image or text (GPU tools)

| Tool | What it does | When it helps here | When it can't run |
|---|---|---|---|
| [Hunyuan3D-1](https://github.com/Tencent-Hunyuan/Hunyuan3D-1) | Image or text to a textured mesh | Organic heroes: brain, helmet, tooth, heart, figure | Build from three.js primitives, or ask the owner to run it and drop the `.glb` in `media/models/` |
| [Wonder3D](https://github.com/xxlong0/Wonder3D) | One image to multi-view normals and a mesh | Same; better geometry from a clean object image | Same |
| [3DTopia](https://github.com/3DTopia/3DTopia) | Text to 3D in two stages | Simple props (clay icons, relics) | Same |
| [stable-dreamfusion](https://github.com/ashawkey/stable-dreamfusion) | Text to 3D by score distillation (slow) | Rarely worth it; prefer the three above | Same |
| [image-to-3dlab](https://github.com/Bingeljell/image-to-3dlab) | Local lab wrapping image-to-3D models | Convenient front end if the owner has a GPU | Same |
| [text2room](https://github.com/lukasHoel/text2room) | Text to a textured room mesh | Room scenes (smart-home dashboards) | Use a generated photo with pointer parallax |
| [mvs-texturing](https://github.com/nmoehrle/mvs-texturing), [stlTexturizer](https://github.com/CNCKitchen/stlTexturizer) | Texture an existing mesh | Clean up a generated mesh | Override with a three.js physical material; usually looks better than baked textures |
| [cube-3d-text](https://github.com/EaseCation/cube-3d-text) | 3D text in the browser | A 3D title or logo | three.js `TextGeometry` |
| [awesome_3DReconstruction_list](https://github.com/openMVG/awesome_3DReconstruction_list), [Awesome-Text-to-3D](https://github.com/yyeboah/Awesome-Text-to-3D) | Reading lists | Finding a newer model | n/a |
| [image-to-3d-bbox](https://github.com/experiencor/image-to-3d-bbox), [text-to-motion](https://github.com/EricGuo5513/text-to-motion) | 3D boxes for driving scenes; human motion | Not useful for dashboards | Skip |

**Any generated model must be:** made from an original image (never the reference), exported as `.glb`, optimized (`gltf-transform optimize --compress meshopt --texture-compress webp`, textures ≤ 1024px, file ≤ 1.5 MB), credited in `media/CREDITS.md`.

## Depth and parallax

| Tool | What it does | Use here | When it can't run |
|---|---|---|---|
| [DepthFlow](https://github.com/BrokenSource/DepthFlow) | Turns one image into a 2.5D parallax scene using a depth map | The idea is the useful part: give a hero photo depth | Cut the image into 2–3 transparent layers (sky, subject, foreground) and move them at different speeds on pointer move; or shift one image by a few pixels as Haven does |

## Images

| Tool | What it does | Use here | When it can't run |
|---|---|---|---|
| [stable-diffusion](https://github.com/CompVis/stable-diffusion), [text-to-image](https://github.com/paarthneekhara/text-to-image) | Text to image (GPU) | Hero photos, props, avatars | The agent's built-in image generation; or procedural SVG; or ask the owner for an image |

Every image is original, exported as WebP at 2× the rendered size with `srcset`, and credited.

## Screenshot to code

| Tool | What it does | Use here | When it can't run |
|---|---|---|---|
| [screenshot-to-code](https://github.com/abi/screenshot-to-code), [ScreenCoder](https://github.com/leigest519/ScreenCoder), [design2code](https://github.com/mostafasadeghi97/design2code), [draw-ui](https://github.com/oil-oil/draw-ui), [screenshot-to-page](https://github.com/Mrxyy/screenshot-to-page), [emilwallner/Screenshot-to-code](https://github.com/emilwallner/Screenshot-to-code) | Screenshot to HTML/CSS through a vision model (need API keys) | A first guess at structure and proportions only. Never ship their output: it is rectangles, which is the problem this playbook fixes | Measure the reference yourself (playbook Step 1). This is the default |
| [ui-screenshot-to-prompt](https://github.com/s-smits/ui-screenshot-to-prompt) | Screenshot to a written description | Drafting the Step 1 inventory | Write the inventory by looking |
| [Umi-OCR](https://github.com/hiroi-sora/Umi-OCR) | Offline OCR | Reading labels in a reference | `tesseract`, or read them by eye; reference text is often garbled and gets replaced anyway |
| [codeimage](https://github.com/riccardoperra/codeimage), [Codeexpander](https://github.com/oncework/Codeexpander) | Code screenshots; snippet manager | Not needed for building | Skip |

## Motion and component libraries

This gallery is plain HTML, CSS and JavaScript with no build step, so React libraries are sources of **patterns to rebuild**, not packages to install.

| Tool | Use here |
|---|---|
| [motion](https://github.com/motiondivision/motion) | Vendored. Springs, `animate`, `inView`, `scroll`, `stagger`. Same engine as Framer Motion |
| [react-bits](https://github.com/DavidHDev/react-bits) and [reactbits.dev/tools](https://reactbits.dev/tools) | Idea source: spotlight card, tilt card, split text, count-up, magnet, aurora, click spark. Rebuild in vanilla in `_shared/fx/` |
| [animata](https://github.com/codse/animata) | Idea source: bento cards, animated lists, text effects |
| [react-motion](https://github.com/chenglou/react-motion), [react-native-motion](https://github.com/xotahal/react-native-motion) | Older spring libraries; nothing to take beyond what Motion gives |
| [material-ui](https://github.com/mui/material-ui) | Reference for component behavior and accessibility (menus, dialogs, focus). Don't copy its look |

When a project built **from** this toolkit uses React (the Level 2 working app), these install normally: Motion for React, React Bits components, shadcn/ui.

## Design knowledge and agent skills

| Tool | Use here |
|---|---|
| [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | A design-intelligence skill (styles, palettes, font pairings). Useful at the Direction step for new dashboards; this repo's rulebook wins on conflicts |
| [hendurhance/ui-ux](https://github.com/hendurhance/ui-ux), [design-resources-for-developers](https://github.com/bradtraversy/design-resources-for-developers) | Link collections: icons, fonts, illustration and stock sources. Check each asset's license |
| [claude-howto](https://github.com/luongnv89/claude-howto), [vibe-coding-toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit), [UltraCode-Shim](https://github.com/OnlyTerp/UltraCode-Shim), [ultracode-skill](https://github.com/PabloNAX/ultracode-skill) | Guides and skills for running coding agents. Useful for setting up the agent, not for the dashboards themselves |
| [system-design-primer](https://github.com/donnemartin/system-design-primer) | Backend architecture reading for the Level 2 working app |

## Rule of thumb

If a tool would take more than ten minutes to get running, use the default route. A hand-built three.js object and CSS shapes that are finished beat a generated model that never loaded.
