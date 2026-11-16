# Cursor prompt: finishing pass on ONE dashboard

> Paste everything below the line into a **new** Cursor chat. Replace `<id>`.

---

Do a finishing pass on the gallery dashboard `<id>` in `SacredRebel/dashboard-tools-`. It is already built and passes the checks. Your job is to find what is still wrong by looking at it, and fix that.

1. Pull `main`. Branch `cursor/finish-<id>`.
2. Read `docs/dashboards/04-finishing-pass.md` completely. Follow its eleven steps in order.
3. Step 1 is not optional: capture the overview, the **full-length** overview, every other page and the **full-length phone page**; put the reference next to the overview; open every image; write the list of defects in `docs/validation/dashboards/fidelity/<id>.md` **before you change any file**.
4. Fix one kind of defect at a time. After each fix: capture, open the image, confirm the defect is gone and nothing else moved.
5. Read only the code a defect points to. Do not rewrite files that are not on your list.
6. Do not copy another dashboard's frame, header or layout onto this one. The form comes from `site/dashboards/<id>/reference.*`.
7. Never edit `scripts/dashboards-check.mjs` or `signature_tech`.
8. Finish with `node scripts/build.mjs` and `node scripts/dashboards-check.mjs <id>` printing `✔`, a new side-by-side image, and one commit `Finish: <Name>`. Push, open a PR, **do not merge**.

In the PR body: the before and after side-by-side, the defect list with each item marked fixed or left (and why), and anything you could not do.

You are not done if any of these is true: an image sits in a visible box; a chart does not match its numbers; anything spills out of its card on the full-length captures; the board is much narrower than the screen while the reference fills it; an inner page is plain text cards; a name or number comes from the reference image; you did not open your own captures.
