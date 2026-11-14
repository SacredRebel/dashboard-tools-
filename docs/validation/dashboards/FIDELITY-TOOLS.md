# Fidelity tools (external + local)

Short log of screenshot/OCR tooling evaluated for gallery polish. No third-party apps are vendored into `site/`.

## Adopted (this environment)

| Tool | License | How used |
|---|---|---|
| **tesseract-ocr** (apt) | Apache-2.0 | Local OCR of `site/dashboards/<id>/reference.jpg` and `shot.jpg` to extract visible labels, headings, and CTA copy before polishing. Fallback when Umi-OCR GUI is unavailable. |
| **Pillow** | HPND | Approximate palette sampling (quantize + counter) from reference vs shot to nudge token accents. |
| **Cursor GenerateImage** | — | A3 imagery for missing 3D/clay heroes (e.g. Vitalis doctor + heart) saved under each dashboard’s `media/`. |
| **Visual Read compare** | — | Side-by-side description of `reference.*` vs `shot.jpg` to rank layout/density/imagery gaps. |

## Evaluated, not run end-to-end

| Repo | License | Why skipped / notes |
|---|---|---|
| [hiroi-sora/Umi-OCR](https://github.com/hiroi-sora/Umi-OCR) | MIT | Offline OCR suite; ships Windows RapidOCR builds. Prefer tesseract here (no GUI / no GPU pack). |
| [s-smits/ui-screenshot-to-prompt](https://github.com/s-smits/ui-screenshot-to-prompt) | MIT | Layout-region + OCR → prompt idea is useful; full pipeline needs OpenAI Vision keys + EasyOCR weights. Method reused conceptually (OCR + grid notes → brief). |
| [abi/screenshot-to-code](https://github.com/abi/screenshot-to-code) | MIT | Needs model API keys; output is a hard-coded sketch — do not paste into gallery. Structure ideas only. |
| [mostafasadeghi97/design2code](https://github.com/mostafasadeghi97/design2code) | MIT | Same: Next/Tailwind converter needing API keys. |
| [emilwallner/Screenshot-to-code](https://github.com/emilwallner/Screenshot-to-code) | MIT | Classic research repo; API/model dependent. |
| [leigest519/ScreenCoder](https://github.com/leigest519/ScreenCoder) | Apache-2.0 | Research pipeline; heavy deps / API. |
| [riccardoperra/codeimage](https://github.com/riccardoperra/codeimage) | MIT | Code → pretty screenshot (wrong direction for fidelity). |
| [oil-oil/draw-ui](https://github.com/oil-oil/draw-ui) | *no LICENSE in clone* | Needs API keys; skip for gallery. |
| [oncework/Codeexpander](https://github.com/oncework/Codeexpander) | *no LICENSE* | Skip. |
| [Mrxyy/screenshot-to-page](https://github.com/Mrxyy/screenshot-to-page) | *no LICENSE* | Qwen API path; skip. |

## Rules we keep

1. Re-implement in our tokens + vanilla stack; never paste generated third-party HTML/CSS into gallery apps.
2. No hotlinked CDNs in gallery dashboards (fonts already use Google Fonts per existing convention; no new CDNs).
3. Prefer offline OCR + visual compare; only call cloud vision tools when keys exist.
4. Credit imagery sources in catalog `source.note` when GenerateImage or other assets land in `media/`.
