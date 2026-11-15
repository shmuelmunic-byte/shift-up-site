---
name: weekly-review
description: Weekly review of your own Claude Code history. Reads the local conversation files (JSONL) and returns an evidence-based report - corrections you keep repeating, context you keep re-explaining, skills that should exist, work worth automating, where tokens go, stale rules to remove, and 3 tips of the week. Use when the user says "weekly review", "review my Claude history", "improve my setup", "what do I keep correcting you on", "which skills am I missing", "why does my usage run out", "tips of the week", or in Hebrew "סקירה שבועית", "סקירת שישי", "תשפר את המערכת", "תעבור על ההיסטוריה שלי", "מה אני מתקן אותך שוב ושוב", "טיפים של השבוע", "למה המכסה נגמרת". Local only, nothing leaves the computer, nothing changes before the user approves. Not for reviewing code or business work.
---

# Weekly review: Claude that gets better every week

Once a week, read what actually happened in the user's conversations and turn it into a short list of fixes.
The user approves, and only then anything changes.
Write the report and every message in the language the user writes in.

## Window
- Since the last report in `~/claude-review/`. No report yet = the last 30 days.
- History is kept only as long as `cleanupPeriodDays` in `~/.claude/settings.json` (default is short). If it is missing or under 90, suggest setting it to 365, so next month's review has something to read.

## How to read the history
1. Conversations live in `~/.claude/projects/<project>/<session-id>.jsonl`. Never load them raw into the chat, they are huge.
2. Write a small Python script (run with `PYTHONIOENCODING=utf-8`) that pulls, per conversation: project, date, every message the user typed (`type: "user"` with text, not tool results, not `isSidechain`), the assistant lines that start with 💡, and the tools that ran. Save the extract to `~/claude-review/extract/`.
3. Read the extract project by project. Lots of material = one subagent per project on a cheaper model, each returns a summary.
4. Read the current setup so you don't suggest what already exists: `~/.claude/CLAUDE.md`, `~/.claude/skills/`, each project's `CLAUDE.md` and `.claude/skills/`, the memory folders, and `~/.claude/suggested-skills.md`.

## What to look for
1. **Corrections.** Moments the user said you got it wrong, asked to redo, or stopped you. Group by cause
2. **Re-explaining.** Context the user gave in several conversations: who they are, the business, the tone, the file layout, the tools
3. **Repeating tasks.** The same request with similar steps in 3+ conversations
4. **Slow manual work.** Long conversations where most of the time went on a fixed pattern
5. **Stale setup.** Rules, memories or skills that recent conversations contradict or never use
6. **Tokens.** Here also count subagents and scheduled runs:
   - totals from the `usage` fields (input, cache, output), split by model
   - the 10 heaviest conversations and what they did
   - how much was spent after a conversation passed 200k context
   - subagents doing mechanical work on the most expensive model
   - how big the always-loaded files are (CLAUDE.md, memory index) vs last week
7. **💡 tips.** How many were given this week. Target: about 10 a week, not dozens

## Rules
- Every finding has evidence: how many conversations, dates, a short quote of the user
- A pattern needs 3 occurrences. Fewer = "too early to tell"
- No flattery, no padding. Nothing solid in a section = say so
- Never copy passwords, API keys, tokens or other people's personal details into the report. Replace with [REDACTED]. The report stays local

## The report
Write `~/claude-review/report-YYYY-MM-DD.md`:
- **A. Numbers:** conversations, period, projects, the 10 most common requests
- **B. Where it breaks:** the top 5 repeated corrections, each with the exact rule to add and which file it goes in
- **C. What you keep explaining:** the context written once, ready to paste
- **D. Skills that should exist:** up to 5, ranked by (times it came up × time it takes). Start from `~/.claude/suggested-skills.md`. For each: name, the user's own words that should trigger it, steps, the conversations behind it
- **E. Automations:** what can run as one command, a hook or a schedule, and what's left for the user to check. A tip that repeated 3+ times belongs here, not in I
- **F. Cleanup:** rules and skills to delete or rewrite
- **G. Tokens:** table of source · tokens a week · exact step · estimated saving, biggest first
- **H. Vs last report:** what got fixed, what still repeats
- **I. 3 tips of the week:** from all this week's 💡 lines, only 3 worth remembering that have no automation. One line each: what to do, and when it matters

Then stop. Show a summary of up to 15 lines and ask which items to apply.
**Do not create or change any skill, CLAUDE.md, memory or setting before the user approves specific items.**

## After approval
- A general preference → `~/.claude/CLAUDE.md`. A fact about one project → that project's `CLAUDE.md`. Something that must happen every time → a hook
- A new skill → `~/.claude/skills/`. Its description uses the words the user really types (quote 3 past requests it must catch). Any skill that sends, publishes or deletes ends with an approval step
- Build at most 2 new skills per round. Mark them as built in `~/.claude/suggested-skills.md`

## Rhythm
- Every week: the review, apply 1-2 rules and the biggest token saving (about 15 minutes)
- Once a month: build the top skill from D and delete what F marked
- Every quarter: run it on the full history and reread every CLAUDE.md
