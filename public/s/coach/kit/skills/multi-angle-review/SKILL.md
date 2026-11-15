---
name: multi-angle-review
description: Runs 2-3 subagents in parallel on the same problem, each from a different angle, then has each finding checked against the others before it reaches the final list - so you get findings that survived a challenge, not one confident opinion. For audits (a page, a campaign, a document, code), mystery bugs and decisions with several directions. Use when the user says "check this from several angles", "audit this", "stress-test this", "why is this broken", "which option is right", or in Hebrew "תבדוק מכמה זוויות", "תעשה אודיט", "למה זה לא עובד", "מה עדיף". Not for small questions or one-line fixes.
---

# Multi-angle review: findings that survived a challenge

Reply in the language the user writes in.

## Steps
1. **Frame it in one sentence:** what is being checked, and what "good" means here
2. **Pick 2-3 angles that pull in different directions**, for example:
   - audit of a page: the visitor (clarity, trust) · conversion (path to action) · technical (speed, mobile, forms)
   - bug: "it's the data" · "it's the code" · "it's the environment / config"
   - decision: the case for A · the case for B · "what would make both wrong"
3. **Run the subagents in parallel**, one per angle, on Sonnet (`model: "sonnet"`) unless the angle needs judgment of taste. Each gets the same material and its angle, and returns findings with evidence (file, line, screenshot, number) and a confidence score
4. **Cross-check round:** give each serious finding to a different agent (or check it yourself) with one question: "is this real, and what evidence contradicts it?". Drop what doesn't hold up
5. **Final list** for the user: confirmed findings only, most important first, each with its evidence and one concrete fix. Below it, one line: what was dropped and why

## Rules
- Tasks that depend on each other, or edits to the same file, stay with one agent
- Agents only read and report. Changes happen after the user approves
- Max 3 angles. More costs more usage without better results
