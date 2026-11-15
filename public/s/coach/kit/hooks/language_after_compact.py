"""SessionStart hook (matcher: compact).

Right after /compact the conversation summary is in English, and Claude tends to drift
into English with it. This reminds it once to keep the user's language.
Part of "Claude that gets better" (shiftup.marketing/s/coach).
"""
import json
import sys

try:
    sys.stdin.read()
except Exception:
    pass

msg = ("The conversation was just compacted. Keep replying in the language the user writes in, judged by "
       "their own recent messages and not by the English summary or tool output. That includes summaries, "
       "questions, buttons and captions.")
sys.stdout.reconfigure(encoding="utf-8")
print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": msg}}))
