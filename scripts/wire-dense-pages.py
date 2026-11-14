#!/usr/bin/env python3
"""Wire DB.dense into gallery dashboards that still use [data-db-stub].

  python3 scripts/wire-dense-pages.py              # all with stubs
  python3 scripts/wire-dense-pages.py canopy-reforest ember-rooms
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CAT = json.loads((ROOT / "catalog/dashboards.json").read_text())
DASH = ROOT / "site/dashboards"

LINK_CSS = '  <link rel="stylesheet" href="../_shared/dense-pages.css">\n'
LINK_JS = '  <script src="../_shared/dense-pages.js"></script>\n'
FX_CSS = '  <link rel="stylesheet" href="../_shared/fx/fx.css">\n'
FX_MOD = '  <script type="module" src="../_shared/fx/index.js"></script>\n'


def ensure_head(html: str) -> str:
    if "dense-pages.css" not in html:
        html = html.replace(
            'href="../_shared/base.css">\n',
            'href="../_shared/base.css">\n' + FX_CSS + LINK_CSS,
            1,
        )
    if "dense-pages.js" not in html:
        html = html.replace(
            'src="../_shared/frame.js"></script>\n',
            'src="../_shared/frame.js"></script>\n' + LINK_JS + FX_MOD,
            1,
        )
    return html


def rewrite_app(js: str, brand: str, pages_json: str) -> str | None:
    # Prefer replacing known polish-stub markers
    start = js.find("/* === DB multipage polish")
    end = js.find("/* === /DB multipage polish === */")
    if start >= 0 and end >= 0:
        end = js.find("\n", end) + 1
        block = f'''/* === DB multipage polish (dense kit) === */
  (function wirePages() {{
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PAGES = {pages_json};
    const root = document.querySelector('[data-db-app]') || document.body;
    const main = document.querySelector('main') || document.body;
    let overview = main.querySelector('[data-page-panel="overview"]');
    if (!overview) {{
      overview = document.createElement('div');
      overview.setAttribute('data-page-panel', 'overview');
      const keep = [];
      [...main.children].forEach((ch) => {{
        if (ch.hasAttribute && ch.hasAttribute('data-db-stub')) return;
        if (ch.getAttribute && ch.getAttribute('data-db-page-host') != null) return;
        keep.push(ch);
      }});
      keep.forEach((ch) => overview.appendChild(ch));
      main.insertBefore(overview, main.firstChild);
    }}
    main.querySelectorAll('[data-db-stub]').forEach((el) => el.remove());
    document.querySelectorAll('a[href]').forEach((a) => {{
      const label = (a.textContent || '').replace(/\\s+/g, ' ').trim().toLowerCase();
      if (!label) return;
      const hit = PAGES.find((p) => p.name.toLowerCase() === label || p.id === label
        || (label === 'home' && p.id === 'overview')
        || (label === 'dashboard' && p.id === 'overview'));
      if (hit) a.setAttribute('href', '#/' + hit.id);
    }});
    if (window.DB?.onVisible) {{
      window.DB.onVisible(root, (visible) => {{
        document.documentElement.dataset.motionPaused = visible ? '' : '1';
      }});
    }}
    if (!window.DB?.dense) {{
      console.error('DB.dense missing — load ../_shared/dense-pages.js');
      return;
    }}
    window.DB.dense.mount({{ main, overview, pages: PAGES, brand: {json.dumps(brand)} }});
    if (window.DB?.fx) window.DB.fx.remount(overview);
    void reduce;
  }})();
/* === /DB multipage polish === */
'''
        return js[:start] + block + js[end:]

    # Fallback: append before data-ready if stub host present
    if "data-db-stub" not in js and "ensureStub" not in js:
        return None
    marker = "document.documentElement.dataset.ready"
    idx = js.rfind(marker)
    if idx < 0:
        return None
    inject = f'''
/* === DB multipage polish (dense kit) === */
(function wirePages() {{
  const PAGES = {pages_json};
  const root = document.querySelector('[data-db-app]') || document.body;
  const main = document.querySelector('main') || document.body;
  let overview = main.querySelector('[data-page-panel="overview"]');
  if (!overview) {{
    overview = document.createElement('div');
    overview.setAttribute('data-page-panel', 'overview');
    [...main.children].forEach((ch) => {{
      if (ch.hasAttribute && (ch.hasAttribute('data-db-stub') || ch.getAttribute('data-db-page-host') != null)) return;
      overview.appendChild(ch);
    }});
    main.insertBefore(overview, main.firstChild);
  }}
  main.querySelectorAll('[data-db-stub]').forEach((el) => el.remove());
  if (window.DB?.onVisible) window.DB.onVisible(root, (v) => {{ document.documentElement.dataset.motionPaused = v ? '' : '1'; }});
  if (window.DB?.dense) window.DB.dense.mount({{ main, overview, pages: PAGES, brand: {json.dumps(brand)} }});
}})();
/* === /DB multipage polish === */
'''
    return js[:idx] + inject + js[idx:]


def main() -> int:
    only = set(sys.argv[1:])
    stub_ids = []
    for d in CAT["dashboards"]:
        if only and d["id"] not in only:
            continue
        app = DASH / d["id"] / "app.js"
        html = DASH / d["id"] / "index.html"
        if not app.is_file():
            continue
        js = app.read_text()
        if "data-db-stub" not in js and "[data-db-stub]" not in js and "ensureStub" not in js:
            # also scan html
            if html.is_file() and "data-db-stub" not in html.read_text():
                continue
        stub_ids.append(d)

    print(f"candidates: {len(stub_ids)}")
    for d in stub_ids:
        folder = DASH / d["id"]
        app = folder / "app.js"
        html_p = folder / "index.html"
        pages_json = json.dumps(d["pages"], separators=(",", ":"))
        js = app.read_text()
        new_js = rewrite_app(js, d["name"], pages_json)
        if not new_js:
            print(f"skip {d['id']}: could not rewrite")
            continue
        app.write_text(new_js)
        if html_p.is_file():
            html_p.write_text(ensure_head(html_p.read_text()))
        # seed fx
        if "route" not in d.get("fx", []):
            d.setdefault("fx", [])
            for fx in ("reveal", "count", "draw", "route"):
                if fx not in d["fx"]:
                    d["fx"].append(fx)
        print(f"wired {d['id']}")

    (ROOT / "catalog/dashboards.json").write_text(json.dumps(CAT, indent=2, ensure_ascii=False) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
