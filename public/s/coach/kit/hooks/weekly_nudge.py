"""SessionStart hook (matcher: startup): nobody remembers to run the weekly review, so Claude offers it.

If the newest report in ~/claude-review/ is older than 7 days (or there is none and the kit was
installed more than 7 days ago), Claude gets one line asking it to offer the review. Once per day.
Part of "Claude that gets better" (shiftup.marketing/s/coach).
"""
import glob
import json
import os
import sys
import time

DAYS = 7
HOME = os.path.expanduser("~")
REVIEWS = os.path.join(HOME, "claude-review")
STATE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "state")


def main():
    try:
        sys.stdin.read()
    except Exception:
        pass
    now = time.time()
    os.makedirs(STATE, exist_ok=True)
    installed = os.path.join(STATE, "installed.txt")
    if not os.path.exists(installed):
        open(installed, "w").write(str(now))
    reports = glob.glob(os.path.join(REVIEWS, "report-*.md"))
    last = max((os.path.getmtime(p) for p in reports), default=None)
    if last is None:
        try:
            last = float(open(installed).read().strip())
        except Exception:
            last = now
    if now - last < DAYS * 86400:
        return
    today = time.strftime("%Y-%m-%d")
    shown = os.path.join(STATE, "weekly_nudge_day.txt")
    try:
        if open(shown).read().strip() == today:
            return
    except Exception:
        pass
    open(shown, "w").write(today)
    msg = ("A week or more has passed since the last weekly review. At the end of your first reply in this "
           "conversation, add ONE short line in the user's language offering to run it now (the weekly-review "
           "skill, about 15 minutes, nothing changes without their approval). If they say yes, run it. "
           "Don't push if they decline.")
    sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": msg}}))


if __name__ == "__main__":
    main()
