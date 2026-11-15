---
name: wrap-up
description: Closes a work session the right size. "Done" = a short close that logs only what's really new (or "nothing to log"); "project done" = a full summary of what was built, which Claude Code tools were used, what worked, what to do differently and which skills to keep. Use when the user says "done", "we're done", "that's it for today", "wrap up", "project done", "we finished the project", or in Hebrew "סיימנו", "זהו להיום", "סיימנו פרויקט", "סגרנו את הפרויקט". Not for a mid-task status update.
---

# Wrap-up: close the session the right size

Reply in the language the user writes in.

## Which one?
- **"Done" / "סיימנו"** (just closing for now) → short close
- **"Project done" / "סיימנו פרויקט"** → full summary
- Not sure? Short close, and offer the full one in one line

## Short close
1. Look back over this conversation only. Did a new lesson, decision or technique come up, something that will matter again?
2. Yes → append ONE entry to `docs/LEARNINGS.md` in the project (create it if missing):
   ```
   ## YYYY-MM-DD: [short title]
   [2-4 lines: what happened, what we learned, what to do next time]
   ```
3. A real decision was made → also one line in `docs/DECISIONS.md`
4. Tasks were finished → mark them `[x]` in `docs/TASKS.md`
5. Nothing new → one line "nothing to log", and don't touch any file
6. Tasks still open → list them in up to 3 lines, most urgent first

## Full summary ("project done")
Append to `docs/LEARNINGS.md`:
```
## YYYY-MM-DD: Project summary - [name]
**What we built:** ...
**Claude Code tools and features we used:** (skills, subagents, hooks, MCP connectors, scheduled tasks, plan mode...)
**What worked:** ...
**What didn't:** ...
**What I'd do differently:** ...
**Skills worth keeping or building:** ... (new ideas also go as a row in ~/.claude/suggested-skills.md)
```
Then tell the user in 3-5 lines what was logged and where.

## Rules
- Real facts from this conversation only, no padding
- One rich entry beats five thin ones
- Never delete or rewrite earlier entries
