# HOW TO CHANGE THINGS

*(Copy into the client's repo as `HOW-TO-CHANGE-THINGS.md` and personalize.)*

Your dashboard is yours. You can change almost anything by asking your AI in plain words. Nothing goes live until you say so.

## The loop

1. Open **claude.ai/code** and pick your repository **<repo-name>**.
2. Describe the change (examples below).
3. Claude makes the change on a separate copy (a "branch") and opens a **pull request**.
4. A **Preview** link appears on the pull request after about a minute. Open it on your phone and laptop.
5. Happy? Tell Claude "merge it" (or click **Merge** on GitHub). It's live in about a minute.
6. Not happy? Tell Claude what to adjust. Or close the pull request and nothing changes.

## Undo anything

Vercel → your project → **Deployments** → find yesterday's version → **⋯ → Promote to Production**. That's an instant undo.

## Example requests

- "Rename the stage *Proposal* to *Offer sent*."
- "Add a field *Referral from* to clients, optional, shown on the client page."
- "Change the accent color to a deeper green that matches my logo (attached)."
- "On the Today page, show birthdays this week."
- "Make the pipeline cards show the phone number."
- "Add a filter for clients from Instagram."
- "Export all clients to a spreadsheet."

## Tips for great results

- One change per request. Small changes are easier to check.
- Say *where* (which page) and *what* it should look like.
- Attach a screenshot and draw on it if that's easier.
- Ask "what would you recommend?" when unsure. The AI knows the design rules in `AGENTS.md`.

## Things to ask a human about first

- Deleting data or fields that contain data
- Changing login or who can see data
- Connecting new services that need passwords/keys

## Your accounts

| Service | What it does | Login |
|---|---|---|
| GitHub | Stores the code and history | <account> |
| Vercel | Runs the website | <account> |
| Supabase | Stores your data | <account> |
| Claude | Your AI helper | <account> |
