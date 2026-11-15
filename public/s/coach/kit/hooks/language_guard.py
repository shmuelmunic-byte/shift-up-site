"""Stop hook: if the user writes in a non-Latin language (Hebrew, Arabic, Russian...) and the
final reply came out mostly in English prose, send it back once to be rewritten.

Code blocks, inline code, URLs, paths and links are ignored, so a code-only answer passes.
Never loops: when Claude is already continuing because of this hook, it lets the reply through.
Part of "Claude that gets better" (shiftup.marketing/s/coach).
"""
import json
import re
import sys

LATIN = re.compile(r"[A-Za-z]")
OTHER = re.compile(r"[Ͱ-ϿЀ-ӿ֐-׿؀-ۿ฀-๿぀-ヿ一-鿿가-힯]")


def clean(text):
    t = re.sub(r"<system-reminder>.*?</system-reminder>", " ", text, flags=re.S)
    t = re.sub(r"```.*?```", " ", t, flags=re.S)
    t = re.sub(r"`[^`\n]*`", " ", t)
    t = re.sub(r"\[[^\]]*\]\([^)]*\)", " ", t)
    t = re.sub(r"https?://\S+", " ", t)
    t = re.sub(r"(?:[A-Za-z]:)?[\\/][^\s)\]]+", " ", t)
    return t


def counts(text):
    t = clean(text)
    return len(OTHER.findall(t)), len(LATIN.findall(t))


def read_transcript(path):
    """Return (last user text, last assistant text) from the transcript."""
    try:
        lines = open(path, encoding="utf-8", errors="replace").read().splitlines()[-600:]
    except Exception:
        return "", ""
    reply, user = [], ""
    for line in reversed(lines):
        try:
            r = json.loads(line)
        except Exception:
            continue
        if r.get("isSidechain"):
            continue
        m = r.get("message") or {}
        c = m.get("content")
        if r.get("type") == "assistant" and not user:
            for x in reversed(c or []):
                if isinstance(x, dict) and x.get("type") == "text":
                    reply.append(x.get("text", ""))
        elif r.get("type") == "user":
            if isinstance(c, str):
                user = c
            elif isinstance(c, list):
                texts = [x.get("text", "") for x in c if isinstance(x, dict) and x.get("type") == "text"]
                user = "\n".join(texts)
            if clean(user).strip():
                break
            user = ""
    return user, "\n".join(reversed(reply))


def main():
    try:
        data = json.loads(sys.stdin.buffer.read().decode("utf-8", "replace") or "{}")
    except Exception:
        return
    if data.get("stop_hook_active"):
        return
    user, reply = read_transcript(data.get("transcript_path") or "")
    if isinstance(data.get("last_assistant_message"), str):
        reply = data["last_assistant_message"]
    if not user or not reply:
        return
    u_other, u_lat = counts(user)
    if u_other < 10 or u_other / max(u_other + u_lat, 1) < 0.6:
        return  # the user writes in English (or too little to tell)
    r_other, r_lat = counts(reply)
    if r_lat < 200 or r_other / max(r_other + r_lat, 1) >= 0.3:
        return
    reason = ("Your last reply is mostly in English, but the user writes in another language. Rewrite that same "
              "reply in full in the user's language now (keep code, commands, paths and names as they are). "
              "Do not apologize and do not mention this check.")
    sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps({"decision": "block", "reason": reason}))


if __name__ == "__main__":
    main()
