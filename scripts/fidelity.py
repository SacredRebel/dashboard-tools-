#!/usr/bin/env python3
"""Build side-by-side fidelity sheets: reference | our full-page frame.

  python3 scripts/fidelity.py <id>
  python3 scripts/fidelity.py --all
  python3 scripts/fidelity.py <id> --after   # writes <id>-after.jpg as well

Requires Pillow. Reads site/dashboards/<id>/reference.* and
frames/pages/<overview>-full.jpg (falls back to shot@2x.jpg / shot.jpg).
Writes docs/validation/dashboards/fidelity/<id>.jpg
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CAT = json.loads((ROOT / "catalog/dashboards.json").read_text())
OUT = ROOT / "docs/validation/dashboards/fidelity"
DASH = ROOT / "site/dashboards"


def find_ref(folder: Path) -> Path | None:
    for name in ("reference.jpg", "reference.jpeg", "reference.png", "reference.webp"):
        p = folder / name
        if p.is_file():
            return p
    return None


def find_ours(folder: Path, overview_id: str = "overview") -> Path | None:
    candidates = [
        folder / "frames" / "pages" / f"{overview_id}-full.jpg",
        folder / "frames" / "pages" / f"{overview_id}.jpg",
        folder / "shot@2x.jpg",
        folder / "shot.jpg",
        folder / "frames" / "desktop.jpg",
    ]
    for p in candidates:
        if p.is_file():
            return p
    return None


def label_font(size: int = 18):
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ):
        if Path(path).is_file():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def sheet(ref: Image.Image, ours: Image.Image, title: str, width: int = 720) -> Image.Image:
    def fit(im: Image.Image) -> Image.Image:
        im = im.convert("RGB")
        ratio = width / im.width
        h = max(1, int(im.height * ratio))
        return im.resize((width, h), Image.Resampling.LANCZOS)

    a, b = fit(ref), fit(ours)
    gap = 16
    header = 40
    h = header + max(a.height, b.height) + 12
    canvas = Image.new("RGB", (width * 2 + gap, h), (18, 18, 22))
    canvas.paste(a, (0, header))
    canvas.paste(b, (width + gap, header))
    draw = ImageDraw.Draw(canvas)
    font = label_font(16)
    draw.text((12, 12), f"REFERENCE · {title}", fill=(220, 220, 230), font=font)
    draw.text((width + gap + 12, 12), "OURS", fill=(220, 220, 230), font=font)
    return canvas


def build_one(d: dict, after: bool = False) -> Path | None:
    folder = ROOT / d["path"] if d.get("path") else DASH / d["id"]
    if not folder.is_dir():
        folder = DASH / d["id"]
    ref_p = find_ref(folder)
    pages = d.get("pages") or [{"id": "overview"}]
    overview_id = pages[0]["id"] if isinstance(pages[0], dict) else pages[0]
    ours_p = find_ours(folder, overview_id)
    if not ref_p:
        print(f"skip {d['id']}: no reference.*", file=sys.stderr)
        return None
    if not ours_p:
        print(f"skip {d['id']}: no ours frame/shot", file=sys.stderr)
        return None
    OUT.mkdir(parents=True, exist_ok=True)
    img = sheet(Image.open(ref_p), Image.open(ours_p), d.get("name") or d["id"])
    dest = OUT / (f"{d['id']}-after.jpg" if after else f"{d['id']}.jpg")
    img.save(dest, "JPEG", quality=85, optimize=True)
    print(f"wrote {dest.relative_to(ROOT)} ({dest.stat().st_size} bytes)")
    return dest


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--after", action="store_true")
    args = ap.parse_args()
    dashboards = CAT["dashboards"]
    if args.all:
        targets = dashboards
    elif args.ids:
        want = set(args.ids)
        targets = [d for d in dashboards if d["id"] in want]
        missing = want - {d["id"] for d in targets}
        if missing:
            print(f"unknown ids: {', '.join(sorted(missing))}", file=sys.stderr)
            return 1
    else:
        ap.print_help()
        return 1
    ok = 0
    for d in targets:
        if build_one(d, after=args.after):
            ok += 1
    print(f"done: {ok}/{len(targets)}")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
