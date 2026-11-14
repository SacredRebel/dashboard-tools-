#!/usr/bin/env python3
"""Upgrade generated DB multipage stubs to richer pages + motion helpers.

Usage: python3 scripts/polish-stub-upgrade.py <dashboard-id> [--prefix CSS_PREFIX]
Does not invent media; caller adds media/CSS fidelity separately.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = json.loads((ROOT / "catalog/dashboards.json").read_text())


def dash(id: str) -> dict:
    for d in CATALOG["dashboards"]:
        if d["id"] == id:
            return d
    raise SystemExit(f"unknown dashboard {id}")


def page_cards(page_id: str, name: str) -> str:
    # Domain-ish sample rows per common page id
    samples = {
        "rooms": [("Living Room", "21.5°"), ("Bedroom", "20°"), ("Kitchen", "22°"), ("Bathroom", "23°")],
        "devices": [("Thermostat", "Online"), ("Air purifier", "Online"), ("Boiler", "Standby"), ("Sensors", "12")],
        "energy": [("Today", "18.4 kWh"), ("This week", "112 kWh"), ("vs last week", "−6%")],
        "settings": [("Units", "Celsius"), ("Eco mode", "On"), ("Alerts", "Push")],
        "routes": [("Summit Loop", "12.4 km"), ("Lake Spur", "6.1 km"), ("Ridge Run", "9.8 km")],
        "journal": [("Misty morning", "Today"), ("Gold hour", "Yesterday"), ("Storm pause", "Tue")],
        "library": [("Pinned", "12"), ("Albums", "8"), ("Shared", "3")],
        "activity": [("Plays today", "48"), ("Focus hours", "3.2"), ("New saves", "6")],
        "reports": [("Incidents", "4"), ("MTTR", "18m"), ("Open", "1")],
        "segments": [("Critical", "2"), ("Warn", "5"), ("Info", "11")],
        "transactions": [("Payroll", "−$12,400"), ("Transfer in", "+$3,200"), ("Vendors", "−$890")],
        "budgets": [("Ops", "72%"), ("Travel", "41%"), ("Tools", "88%")],
        "pipeline": [("Qualified", "14"), ("Proposal", "7"), ("Won", "3")],
        "accounts": [("Northwind", "Active"), ("Kestrel", "Active"), ("Harbor", "Paused")],
        "people": [("Noor Abbasi", "Owner"), ("Kai Lindgren", "Admin"), ("Marta Ruiz", "Member")],
        "payroll": [("This run", "$184k"), ("Pending", "12"), ("Exceptions", "2")],
        "progress": [("Pages", "214/320"), ("Streak", "12d"), ("Club rank", "4")],
        "vitals": [("Resting HR", "62"), ("Sleep", "7h 12m"), ("Recovery", "81%")],
        "appointments": [("Form check", "Tue 07:30"), ("Review", "Thu 18:00"), ("Plan", "Sat 09:00")],
        "records": [("Lab panel", "Ready"), ("Imaging", "Queued"), ("Notes", "3")],
        "forecast": [("Today", "Sunny"), ("Tomorrow", "Clouds"), ("Weekend", "Clear")],
        "maps": [("Radar", "On"), ("Wind", "Off"), ("Precip", "On")],
        "workspace": [("Name", "Studio"), ("Slug", "studio"), ("Region", "US-West")],
    }
    rows = samples.get(page_id) or [(f"{name} item {i+1}", "Ready") for i in range(3)]
    cards = "".join(
        f'<article class="dbp-card"><div class="dbp-row"><strong>{k}</strong>'
        f'<span class="dbp-chip">{v}</span></div></article>'
        for k, v in rows
    )
    return cards


def make_bootstrap(d: dict, prefix: str) -> str:
    pages = d["pages"]
    pages_js = json.dumps(pages, separators=(",", ":"))
    # Build pageHtml branches
    branches = []
    for p in pages:
        if p["id"] == "overview":
            continue
        pid, pname = p["id"], p["name"]
        cards = page_cards(pid, pname)
        # first non-overview gets loading/empty/error states
        if not branches:
            branches.append(
                f"""
    if (page.id === '{pid}') {{
      return `<section class="dbp-page" data-db-page="{pid}" aria-labelledby="p-h">
        <h1 id="p-h">{pname}</h1>
        <p class="dbp-lead">Sample data · fictional.</p>
        <div class="dbp-seg" role="group" aria-label="{pname} state" data-dbp-tabs>
          <button type="button" data-v="ready" aria-pressed="true">Ready</button>
          <button type="button" data-v="loading" aria-pressed="false">Loading</button>
          <button type="button" data-v="empty" aria-pressed="false">Empty</button>
          <button type="button" data-v="error" aria-pressed="false">Error</button>
        </div>
        <div data-dbp-body></div>
      </section>`;
    }}"""
            )
            body_pid = pid
        else:
            branches.append(
                f"""
    if (page.id === '{pid}') {{
      return `<section class="dbp-page" data-db-page="{pid}" aria-labelledby="p-h">
        <h1 id="p-h">{pname}</h1>
        <p class="dbp-lead">Sample data · fictional.</p>
        <div class="dbp-grid">{cards}</div>
        <button type="button" class="dbp-btn" data-dbp-action>Open {pname.lower()}</button>
      </section>`;
    }}"""
            )
    first_non = next(p["id"] for p in pages if p["id"] != "overview")
    first_cards = page_cards(first_non, next(p["name"] for p in pages if p["id"] == first_non))

    return f"""
/* === DB multipage polish (auto-upgraded) === */
  (function wirePages() {{
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PAGES = {pages_js};
    const root = document.querySelector('[data-db-app]') || document.body;
    let toastEl = document.querySelector('[data-toast]');
    if (!toastEl) {{
      toastEl = document.createElement('div');
      toastEl.className = 'dbp-toast';
      toastEl.setAttribute('data-toast', '');
      toastEl.hidden = true;
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }}
    function toast(msg) {{
      toastEl.textContent = msg; toastEl.hidden = false;
      clearTimeout(toast._id); toast._id = setTimeout(() => {{ toastEl.hidden = true; }}, 2200);
    }}
    const main = document.querySelector('main') || document.body;
    let stub = document.querySelector('[data-db-stub]');
    if (!stub) {{
      stub = document.createElement('section');
      stub.setAttribute('data-db-stub', '');
      stub.hidden = true;
      stub.setAttribute('aria-live', 'polite');
      main.appendChild(stub);
    }}
    function setOverviewVisible(on) {{
      [...main.children].forEach((ch) => {{
        if (ch === stub) return;
        if (on) {{ ch.hidden = false; ch.removeAttribute('data-db-overview-hide'); }}
        else {{ ch.hidden = true; ch.setAttribute('data-db-overview-hide', ''); }}
      }});
      stub.hidden = on;
    }}
    function pageHtml(page) {{
{''.join(branches)}
      return `<section class="dbp-page"><h1>${{page.name}}</h1></section>`;
    }}
    function wirePage(page) {{
      if (page.id === '{first_non}') {{
        const body = stub.querySelector('[data-dbp-body]');
        const paint = (state = 'ready') => {{
          if (state === 'loading') {{
            body.innerHTML = `<div class="dbp-state"><p>Loading…</p><div class="dbp-skel"></div><div class="dbp-skel"></div></div>`;
            return;
          }}
          if (state === 'empty') {{
            body.innerHTML = `<div class="dbp-state"><p>Nothing here yet.</p></div>`;
            return;
          }}
          if (state === 'error') {{
            body.innerHTML = `<div class="dbp-state"><p>Could not load.</p><button type="button" class="dbp-btn" data-retry>Retry</button></div>`;
            stub.querySelector('[data-retry]')?.addEventListener('click', () => paint('ready'));
            return;
          }}
          body.innerHTML = `<div class="dbp-grid">{first_cards}</div>`;
        }};
        paint('ready');
        const tabs = stub.querySelector('[data-dbp-tabs]');
        tabs?.addEventListener('click', (e) => {{
          const b = e.target.closest('button[data-v]'); if (!b) return;
          tabs.querySelectorAll('button[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          paint(b.dataset.v);
        }});
      }}
      stub.querySelector('[data-dbp-action]')?.addEventListener('click', () => toast(page.name + ' · sample'));
      stub.querySelector('[data-save-settings], [data-dbp-action]')?.addEventListener('click', () => {{}});
    }}
    document.querySelectorAll('a[href]').forEach((a) => {{
      const label = (a.textContent || '').replace(/\\s+/g, ' ').trim().toLowerCase();
      if (!label) return;
      const hit = PAGES.find((p) => p.name.toLowerCase() === label || p.id === label
        || (label === 'home' && p.id === 'overview')
        || (label === 'dashboard' && p.id === 'overview'));
      if (hit) a.setAttribute('href', '#/' + hit.id);
    }});
    // map common rail buttons if present
    document.querySelectorAll('[data-rail] button[data-v]').forEach((b) => {{
      const map = {{ home: 'overview', climate: 'rooms', fan: 'devices', eco: 'energy', settings: 'settings' }};
      const id = map[b.dataset.v] || b.dataset.v;
      if (PAGES.some((p) => p.id === id)) {{
        b.addEventListener('click', () => {{ location.hash = '#/' + id; }});
      }}
    }});
    if (window.DB?.onVisible) {{
      window.DB.onVisible(root, (visible) => {{
        document.documentElement.dataset.motionPaused = visible ? '' : '1';
      }});
    }}
    if (!window.DB || typeof window.DB.route !== 'function') {{
      console.error('DB.route missing — is ../_shared/frame.js loaded before app.js?');
      return;
    }}
    const seen = new Set();
    window.DB.route(PAGES, (id, page) => {{
      if (id === PAGES[0].id) {{
        setOverviewVisible(true);
        if (!seen.has('overview')) {{
          seen.add('overview');
          document.querySelectorAll('.{prefix}-reveal, .dbp-reveal').forEach((el, i) => {{
            el.style.setProperty('--reveal-delay', (reduce ? 0 : 40 * i) + 'ms');
            el.classList.add('{prefix}-reveal-in', 'dbp-reveal-in');
          }});
        }}
      }} else {{
        setOverviewVisible(false);
        stub.innerHTML = pageHtml(page);
        wirePage(page);
      }}
      seen.add(id);
    }});
  }})();
/* === /DB multipage polish === */
"""


CSS_SNIPPET = """
/* --- polish multipage + motion (shared) --- */
.dbp-page {
  margin: 12px 0 20px; padding: 20px; border-radius: 18px;
  background: var(--surface, #fff); color: var(--text, #111);
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.08); display: grid; gap: 14px; max-width: 960px;
}
.dbp-page h1 { margin: 0; font-size: clamp(26px, 3vw, 34px); }
.dbp-lead {
  margin: 0; font-weight: 550; color: var(--text, #111);
  display: inline-block; padding: 6px 10px; border-radius: 10px;
  background: var(--surface-2, #f3f3f3);
}
.dbp-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
.dbp-card { padding: 14px 16px; border-radius: 14px; background: var(--surface-2, #f6f6f6); }
.dbp-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.dbp-chip {
  display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 13px; font-weight: 650;
  background: var(--surface, #fff); color: var(--text, #111); border: 1px solid rgb(0 0 0 / 0.08);
}
.dbp-seg { display: inline-flex; flex-wrap: wrap; gap: 2px; padding: 4px; border-radius: 999px; background: var(--surface-2, #eee); }
.dbp-seg button { border: 0; background: none; min-height: 36px; padding: 0 12px; border-radius: 999px; font-weight: 650; color: var(--text-muted, #555); }
.dbp-seg button[aria-pressed="true"] { background: var(--surface, #fff); color: var(--text, #111); }
.dbp-btn { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border: 0; border-radius: 999px; font-weight: 650; background: var(--accent, #444); color: var(--accent-fg, #fff); }
.dbp-state { padding: 16px; border-radius: 14px; background: var(--surface-2, #f3f3f3); display: grid; gap: 10px; color: var(--text-muted, #555); }
.dbp-skel { height: 44px; border-radius: 10px; background: linear-gradient(90deg, #e8e8e8, #f7f7f7, #e8e8e8); background-size: 200% 100%; animation: dbp-skel 1.2s linear infinite; }
.dbp-toast { position: fixed; right: 20px; bottom: 20px; z-index: 50; min-height: 44px; padding: 12px 16px; border-radius: 12px; background: var(--surface, #fff); color: var(--text, #111); box-shadow: 0 12px 32px rgb(0 0 0 / 0.18); max-width: min(360px, calc(100vw - 32px)); }
.dbp-toast[hidden] { display: none !important; }
.dbp-reveal { opacity: 0; transform: translateY(8px); }
.dbp-reveal-in { opacity: 1; transform: none; transition: opacity 280ms ease, transform 280ms ease; transition-delay: var(--reveal-delay, 0ms); }
@keyframes dbp-skel { to { background-position: -200% 0; } }
[data-motion-paused="1"] .dbp-skel { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .dbp-reveal, .dbp-reveal-in { opacity: 1; transform: none; transition: none; }
  .dbp-skel { animation: none !important; }
}
"""


def ensure_motion_script(html: str) -> str:
    if "motion@12.23.12/motion.js" in html:
        return html
    return html.replace(
        '<script src="../_shared/frame.js"></script>',
        '<script src="../_shared/frame.js"></script>\n  <script src="../_vendor/motion@12.23.12/motion.js"></script>',
        1,
    )


def ensure_data_db_app(html: str, wrapper_guess: str | None) -> str:
    if "data-db-app" in html:
        return html
    # add to first major wrapper div after body
    return re.sub(
        r"(<body[^>]*>\s*)(<div class=\"[^\"]+\")",
        r'\1\2 data-db-app',
        html,
        count=1,
    )


def mark_motion_catalog(d: dict) -> None:
    d["motion"] = [
        "count-up", "stagger", "hover-lift", "press", "page-transition",
        "ambient", "skeleton", "toast", "icon-state",
    ]


def upgrade(id: str, prefix: str) -> None:
    d = dash(id)
    folder = ROOT / "site/dashboards" / id
    app = folder / "app.js"
    css = folder / "style.css"
    html = folder / "index.html"
    text = app.read_text()
    if "DB multipage polish (auto-upgraded)" in text:
        print(f"{id}: already upgraded")
    else:
        pat = re.compile(
            r"/\* === DB multipage bootstrap \(generated; polish pass replaces stubs\) === \*/.*?/\* === /DB multipage bootstrap === \*/",
            re.S,
        )
        if not pat.search(text):
            raise SystemExit(f"{id}: stub block not found")
        repl = make_bootstrap(d, prefix).strip()
        text = pat.sub(lambda _m: repl, text)
        app.write_text(text)
        print(f"{id}: app.js upgraded")

    css_text = css.read_text()
    if "polish multipage + motion (shared)" not in css_text:
        css.write_text(css_text.rstrip() + "\n" + CSS_SNIPPET)
        print(f"{id}: style.css appended")
    else:
        print(f"{id}: style.css already has snippet")

    html_text = html.read_text()
    html_text2 = ensure_motion_script(html_text)
    html_text2 = ensure_data_db_app(html_text2, prefix)
    if html_text2 != html_text:
        html.write_text(html_text2)
        print(f"{id}: index.html patched")

    # catalog motion
    cat = json.loads((ROOT / "catalog/dashboards.json").read_text())
    for item in cat["dashboards"]:
        if item["id"] == id:
            mark_motion_catalog(item)
            break
    (ROOT / "catalog/dashboards.json").write_text(json.dumps(cat, indent=2) + "\n")
    print(f"{id}: catalog motion set")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("usage: polish-stub-upgrade.py <id> [prefix]")
    upgrade(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "x")
