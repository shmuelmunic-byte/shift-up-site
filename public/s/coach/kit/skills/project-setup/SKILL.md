---
name: project-setup
description: Sets up a project folder once so Claude knows it from the first message - a project CLAUDE.md, a short docs/SPEC.md, docs/TASKS.md with every task spotted, and an empty docs/DECISIONS.md. Fills in only what's missing, never overwrites. Use when opening a new project or entering a project folder for real work, or when the user says "set up the project", "new project", "get to know this folder", or in Hebrew "פרויקט חדש", "תכיר את התיקייה", "תסדר את הפרויקט". Not for a quick question or a single file.
---

# Project setup: once per project

Reply in the language the user writes in. Do it quietly and briefly, then get to work.

## Steps
1. Look at the folder: file names, README, package files, existing docs, a few key files. Don't read everything
2. Check what exists. Create only what's missing:
   - **`CLAUDE.md`** (project root, under ~60 lines): what the project is, who it's for, the folder layout, how to run or build it, rules that apply only here. Facts from the folder only, unknowns as an open question at the end
   - **`docs/SPEC.md`** (short): what the project is, what it needs to do, what is NOT in the plan
   - **`docs/TASKS.md`**: `[ ]` for every task you spotted (TODOs in code, open items in docs, what the user asked for), most important first
   - **`docs/DECISIONS.md`**: empty, with one line on top: `Decisions and why, newest first`
3. Everything already there → say "the project is set up" and go straight to work
4. Report in one or two lines: what was created, plus up to 3 open questions that only the user can answer

## Rules
- Never overwrite or "improve" an existing file here. Missing details go in as a suggestion, not an edit
- No guessing facts about the business or the client. Unknown = open question
- Keep CLAUDE.md short. It loads in every conversation in this folder, and every line costs usage
