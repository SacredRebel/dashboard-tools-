# Cursor prompt: rebuild ONE dashboard as a reference twin

> Paste everything below the line into a **new** Cursor chat. One chat per dashboard. Replace `<id>` with the dashboard's id.

---

Rebuild the gallery dashboard `<id>` in the repo `SacredRebel/dashboard-tools-` so it matches `site/dashboards/<id>/reference.*`.

**Do exactly this, in this order. Do not improvise a different method.**

1. Pull `main`. Create branch `cursor/twin-<id>`.
2. Start a local server and keep it running: `python3 -m http.server 8080 -d site`.
3. Open both finished examples at 1440×900 and at 375×812 and click through every page:
   - `http://localhost:8080/dashboards/haven-listings/` (a picture frame with poured shapes and glass)
   - `http://localhost:8080/dashboards/meridian-labs/` (a flat board around a live 3D object)
   Decide which one your reference is closer to. Read **all** of that example's files (`index.html`, `style.css`, `app.js`, and `helix.js` for Meridian). If your dashboard's `signature_tech` includes `webgl`, read `meridian-labs/helix.js` whichever example you chose.
4. Read `docs/dashboards/02-reference-twin-playbook.md` completely.
5. Follow the playbook Step 0 to Step 12 for `<id>`. Use the architect's spec for this dashboard in `prompts/cursor-fidelity-r4.md` §6 as the content list.
6. After **every** playbook step that changes the page: take a screenshot, open the image, and write one line in `docs/validation/dashboards/fidelity/<id>.md` saying what you see and what is wrong. If you did not open the image, you did not do the step.
7. Run `node scripts/build.mjs` and `node scripts/dashboards-check.mjs <id>` until it prints `✔ <id>`. Never edit the check script or `signature_tech`.
8. Do the three compare rounds from playbook Step 11. Put the reference crop and your overview side by side in one image, save it as `docs/validation/dashboards/fidelity/<id>-compare.jpg`, open it, and list the differences each round.
9. If the dashboard has a WebGL hero, make its poster: `node scripts/hero-poster.mjs <id> site/dashboards/<id>/media/hero-poster.png`.
10. Commit `Twin: <Name>`, push the branch, open a PR, **do not merge**. In the PR body paste: the compare image, the list of what still differs, and any step you could not complete.

**Hard stops. If any of these is true, you are not done:**

- The layout at 1440 is one narrow column, or more than a quarter of the frame is empty and the reference is not.
- A block that is poured, scooped, tabbed or chamfered in the reference is a plain rounded rectangle in yours.
- A 3D object in the reference is a picture inside a rectangle in yours.
- Inner pages are bare cards on a blank background instead of a sheet inside the same frame.
- Any page shows placeholder rows, repeated numbers from another dashboard, or lorem text.
- On the phone full-page capture, any two blocks overlap, or the page scrolls sideways.
- A heading breaks into a different number of lines than in the reference.
- A 3D object is cut off by the edge of its canvas, or there is no poster image for it.
- You have not opened your own screenshots.

If a tool you want (image-to-3D, screenshot-to-code, image generation) cannot run, use the default route in `docs/dashboards/03-asset-and-tool-map.md` and say so in the PR. Do not wait for it and do not substitute a flat photo.

Work on this one dashboard only. Touch no other dashboard's files and no shared files except to fix a real bug, and say so if you do.
