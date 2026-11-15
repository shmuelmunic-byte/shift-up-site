---
name: handoff
description: Writes a short "where we stopped" file (the task, what's done, what's not, the next step, files that matter) plus a one-line opening prompt to paste into a new conversation, so a fresh chat or another agent continues from the same point without re-explaining. Use at the end of a heavy task, when the conversation got very long or usage is running low, or when the user says "where did we stop", "continue in a new chat", "hand this off", "save our place", or in Hebrew "איפה עצרנו", "נמשיך בשיחה חדשה", "תשמור איפה אנחנו", "המכסה נגמרת".
---

# Handoff: continue in a new conversation without losing anything

Reply in the language the user writes in.

## Steps
1. Write `docs/where-we-stopped.md` in the current project (create `docs/` if needed). If one exists, replace its content, it's about now:
   ```
   # Where we stopped - YYYY-MM-DD HH:MM
   **The task:** [one sentence, in the user's words]
   **Done:** [short list, with file paths]
   **Not done yet:** [short list]
   **Next step:** [the exact first action]
   **Files that matter:** [paths]
   **Decisions made on the way:** [only ones that would otherwise be re-asked]
   **Watch out:** [traps already hit, things that didn't work]
   ```
2. Give the user an opening prompt in a code block, ready to paste in a new conversation:
   ```
   Read docs/where-we-stopped.md and continue from the next step
   ```
   (in the user's language, with the full path if the new chat may open elsewhere)
3. One line: suggest opening the new conversation now, since a long chat re-reads everything on every step

## Rules
- Up to ~30 lines. It's a map, not a log
- Facts from this conversation only. Something unverified gets marked "unverified"
- No passwords, keys or personal details in the file
