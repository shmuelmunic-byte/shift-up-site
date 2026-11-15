---
name: memory-cleanup
description: Tidies Claude's memory notes - merges duplicates and overlapping notes, deletes what turned out wrong or outdated, fixes relative dates, and rebuilds a short index (one line per note), so the memory that loads in every conversation stays small and correct. Shows the plan and waits for approval before changing anything. Use when the user says "clean up your memory", "merge the memory", "the memory is a mess", "what do you remember about me", or in Hebrew "תסדר את הזיכרון", "תאחד את הזיכרון", "מה אתה זוכר עליי", or when the weekly review flags over ~40 notes.
---

# Memory cleanup

Reply in the language the user writes in.

## Where memory lives
- Claude Code's memory folders: `~/.claude/projects/<project>/memory/` (notes + an index file such as `MEMORY.md`)
- Also look at `~/.claude/CLAUDE.md` and project `CLAUDE.md` files only to spot duplicates. Don't edit them here

## Steps
1. Back up first: copy each memory folder to `~/.claude/memory-backup-YYYY-MM-DD/<project>/`
2. Read every note. Group them by topic
3. Build a plan, as a table: action (merge / delete / fix / keep) · notes involved · why
   - **Merge:** notes on the same topic → one rich note that keeps every still-true fact
   - **Delete:** facts that turned out wrong, finished one-off details, anything already written in CLAUDE.md or the code
   - **Fix:** relative dates ("tomorrow", "last week") → full dates. Missing "why" on a rule → ask
4. Show the plan with the counts (for example "52 notes → 18") and wait for approval
5. After approval: write the merged notes, delete the merged-away files, and rebuild the index: one line per note, `- [Title](file.md) — short hook`, grouped by topic
6. Report: before/after counts, and where the backup is

## Rules
- Never lose a fact that's still true. When unsure whether to delete → keep and ask
- No passwords, keys or other people's personal details in memory. Found some → flag them to the user
- The index loads in every conversation: short lines, no content inside it
