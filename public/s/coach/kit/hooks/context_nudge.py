"""UserPromptSubmit hook: one short nudge when the conversation's context gets big.

Price is driven by context size, not by message count: every step re-reads the whole
conversation. Fires once when the last turn crosses 250k tokens of context, then again
every +100k. Silent otherwise. Part of "Claude that gets better" (shiftup.marketing/s/coach).
"""
import json
import os
import sys

FIRST, STEP = 250_000, 100_000
STATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "state")


def last_context(path):
    try:
        size = os.path.getsize(path)
        with open(path, "rb") as f:
            f.seek(max(0, size - 3_000_000))
            tail = f.read().decode("utf-8", errors="replace").splitlines()
    except Exception:
        return 0
    for line in reversed(tail):
        if '"usage"' not in line:
            continue
        try:
            e = json.loads(line)
        except Exception:
            continue
        if e.get("type") != "assistant" or e.get("isSidechain"):
            continue
        u = (e.get("message") or {}).get("usage") or {}
        return (u.get("input_tokens", 0) + u.get("cache_read_input_tokens", 0)
                + u.get("cache_creation_input_tokens", 0))
    return 0


def main():
    try:
        data = json.loads(sys.stdin.read() or "{}")
    except Exception:
        return
    ctx = last_context(data.get("transcript_path") or "")
    if ctx < FIRST:
        return
    band = 1 + (ctx - FIRST) // STEP
    sid = "".join(c for c in (data.get("session_id") or "unknown") if c.isalnum() or c in "-_")[:40]
    state = os.path.join(STATE_DIR, f"nudge_{sid}.txt")
    try:
        done = int(open(state).read().strip())
    except Exception:
        done = 0
    if band <= done:
        return
    try:
        os.makedirs(STATE_DIR, exist_ok=True)
        open(state, "w").write(str(band))
    except Exception:
        pass
    msg = (f"Context-size nudge: this conversation is now ~{ctx // 1000}k tokens of context, and every step "
           "re-reads all of it, so usage burns faster from here. In your reply add ONE short 💡 line, in the "
           "language the user writes in: if this message opens a new topic, suggest a new conversation and give "
           "a one-line opening prompt they can paste; if it is the same topic, suggest /compact now. One line only.")
    sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "UserPromptSubmit", "additionalContext": msg}}))


if __name__ == "__main__":
    main()
