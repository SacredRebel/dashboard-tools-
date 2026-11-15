# Onboarding 1: the intake interview

**Goal:** in three short rounds, learn enough to write a one-page brief the person says yes to.
**Output:** `docs/brief.md` from [templates/brief.md](../../templates/brief.md).
**Time:** five to ten minutes of the person's attention.

## How to run it

1. **Read first, ask second.** Go through everything the person already gave you (their message, files, a website, notes). Write down what you know. Never ask for something they already said.
2. **Match a recipe.** Compare the business to the `matches` words in [catalog/recipes.json](../../catalog/recipes.json) (readable version: [recipes.md](recipes.md)). Pick the closest one; if two fit, merge them; if none fit, use `custom`. The recipe gives you a proposed page list, records, numbers, stages and looks, so your questions become "is this right?" instead of blank questions.
3. **Three rounds, at most five questions each.** One message per round. Number the questions so they can answer "1 yes, 2 no, 3 …".
4. **Every question has a default.** Write it as "(default: …)". They can reply "defaults" to a whole round.
5. **Offer choices, not essays.** Where you can, give 2–4 options to pick from.
6. **Use their words back.** If they say "enquiries", the stage is "Enquiries", not "Leads".
7. **"Just build it."** If they say this at any point, stop asking, take the recipe defaults for everything left, and list the assumptions at the top of the brief.
8. If your environment has a question tool (buttons or a form), use it. Otherwise ask in plain text.

## Round 1 · The business and the job

Open with one line on what you understood, then ask only what is missing:

1. **The business.** "In one sentence: what do you offer, and to whom?"
2. **Who uses the dashboard**, and where: "Just you, or a team? Mostly phone, laptop or both?" (default: just you, both)
3. **The morning question.** "When you open it, what are the first three things you want to see or do?"
4. **What you track.** "What are the main things you keep track of?" Offer the recipe's records as the default ("clients, deals, tasks, notes: right?").
5. **Today.** "Where does this live now (spreadsheet, notebook, another tool), and what falls through the cracks?"

## Round 2 · Pages, numbers and data

Show the recipe's plan filled with their words, and ask them to correct it:

1. **Pages.** "Here are the pages I'd build: … Add, remove or rename any?" (default: as listed)
2. **Numbers.** "These would be the numbers at the top: … Which matter most? Up to five." (default: the recipe's)
3. **Steps.** If records move through steps: "What are the steps something goes through from start to finish, in your words?" (default: the recipe's stages)
4. **Data.** "Start with realistic sample data, import a spreadsheet you have, or connect a live system?" (default: sample data now, real data later)
5. **Connections.** "Should it connect to anything: calendar, email, payments, something else?" (default: none in the first version)

## Round 3 · Look and delivery

Before this round, pick 3 reference dashboards for them (see "Choosing looks" below) and send the live links.

1. **Look.** "Which of these three feels closest? Or give me three words for how it should feel." (default: your recommendation)
2. **Brand.** "Do you have a logo, brand colors or a font? A website I can match?" (default: use the reference's theme)
3. **Light or dark?** (default: follows the chosen reference)
4. **Motion.** "Calm, lively or cinematic?" (default: calm: small transitions, charts that draw in)
5. **What you get.** "A clickable prototype first (fast, sample data), or straight to a working app with login and a database?" (default: prototype first)

Stop here. Do not ask a fourth round. Anything still unknown becomes a stated assumption in the brief.

## Choosing looks

Filter [catalog/dashboards.json](../../catalog/dashboards.json):

1. `use_cases` contains the business's use case (the recipe's `gallery` list is a pre-made shortlist).
2. Narrow by mood words against `mood` and `style_family` (cinematic, glass, minimal, bento, data-dense, soft, editorial, bold, dark-neon, skeuo).
3. Respect `avoid_when`.
4. Offer three that differ from each other (for example one light and calm, one dark and rich, one bold), each with its link `https://dashboard-tools-three.vercel.app/#/dashboards/<id>` and one line on why it fits. Recommend one.

A reference sets the **style** (materials, type, spacing, motion, layout pattern). The **content** always comes from the brief. Never copy a reference's fictional business into the person's dashboard.

## What good answers let you write

By the end you can state, in the person's words:

- who opens it and what they need in the first five seconds
- the pages, each with a named pattern
- the records and the fields that matter on each
- up to five numbers and how each is calculated
- the steps a record moves through, if any
- where data comes from in version one
- the look: reference, theme, light or dark, motion level, brand overrides
- what is delivered first, and what is left for later

If you can't state one of these, either ask one more targeted question or write it as an assumption. Then go to [START.md step 2](../../START.md#step-2--brief--look-approval-1).
