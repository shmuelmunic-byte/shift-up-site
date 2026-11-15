"""PreToolUse hook (Bash / PowerShell): stop before code from GitHub gets installed.

Triggers on git clone, gh repo clone, npx skills add, pip/uv/pipx install git+..., and
curl|sh / iwr|iex. Skills and plugins from strangers can carry hidden instructions,
auto-updates or scripts, so the user gets a confirmation box first.

If NVIDIA SkillSpector is installed (free, open source, runs locally), the repo is scanned
first: a clean scan lets the command run, serious findings show up in the box.
Without the scanner, every such command asks for approval with a short checklist.
Part of "Claude that gets better" (shiftup.marketing/s/coach).
"""
import json
import os
import re
import shutil
import subprocess
import sys
import time

LANG = "en"  # set to "he" for Hebrew messages
TIMEOUT = 110  # keep under the hook timeout in settings.json (120)
REPORTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scan-reports")

TRIGGER = re.compile(
    r"\bgit\s+clone\b|\bgh\s+repo\s+clone\b|\bnpx\s+skills\s+add\b|"
    r"\b(pip|pip3|uv\s+pip|uv\s+tool|pipx)\s+install\b[^\n]*git\+|"
    r"\bcurl\b[^\n|]*\|\s*(sh|bash)\b|\biwr\b[^\n|]*\|\s*iex\b",
    re.I,
)
GH_URL = re.compile(r"github\.com[/:]([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)")
GH_SHORT = re.compile(r"\bgh\s+repo\s+clone\s+([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)")
NPX_SHORT = re.compile(r"\bnpx\s+skills\s+add\s+([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)")

TEXT = {
    "en": {
        "check": ("This command downloads and installs outside code: {what}\n"
                  "Before approving: let Claude read every file first (hooks, scripts, MCP, network calls, "
                  "auto-update, hidden instructions), and prefer copying a skill by hand over a plugin that updates itself."),
        "timeout": "The security scan of {url} did not finish in {t}s, so it was not fully checked. Approve only if you trust it.",
        "unreadable": "Could not read the scan result for {url}. Approve only if you trust it.",
        "found": "The security scan stopped this download:\n{notes}",
        "hits": "{url}: {n} serious findings (out of {total})",
        "report": "Full report: {path}",
    },
    "he": {
        "check": ("הפקודה הזו מורידה ומתקינה קוד חיצוני: {what}\n"
                  "לפני שמאשרים: לתת לקלוד לקרוא קודם את כל הקבצים (hooks, סקריפטים, MCP, פניות לרשת, "
                  "עדכון אוטומטי, הוראות חבויות), ועדיף להעתיק סקיל ידנית מאשר פלאגין שמתעדכן לבד."),
        "timeout": "בדיקת האבטחה של {url} לא הסתיימה תוך {t} שניות, כך שהיא לא נבדקה עד הסוף. לאשר רק אם סומכים עליו.",
        "unreadable": "לא הצלחתי לקרוא את תוצאת הבדיקה של {url}. לאשר רק אם סומכים עליו.",
        "found": "בדיקת האבטחה עצרה את ההורדה:\n{notes}",
        "hits": "{url}: {n} ממצאים חמורים (מתוך {total})",
        "report": "דוח מלא: {path}",
    },
}


def t(key, **kw):
    return TEXT.get(LANG, TEXT["en"])[key].format(**kw)


def repos_in(cmd):
    found = []
    for m in list(GH_URL.finditer(cmd)) + list(GH_SHORT.finditer(cmd)) + list(NPX_SHORT.finditer(cmd)):
        owner, repo = m.group(1), re.sub(r"\.git$", "", m.group(2).split("@")[0])
        url = f"https://github.com/{owner}/{repo}"
        if url.lower() not in [u.lower() for u in found]:
            found.append(url)
    return found


def find_scanner():
    p = shutil.which("skillspector")
    if p:
        return p
    for c in (os.path.expanduser("~/.local/bin/skillspector.exe"), os.path.expanduser("~/.local/bin/skillspector")):
        if os.path.exists(c):
            return c
    return None


def serious(issue):
    sev = str(issue.get("severity", "")).upper()
    iid = str(issue.get("id", "")).upper()
    line = (issue.get("location") or {}).get("start_line") or 0
    if iid.startswith(("YR1", "YR2")):  # malware / webshell signatures
        return True
    if sev not in ("HIGH", "CRITICAL"):
        return False
    if iid.startswith("P2") and int(line) <= 1:  # byte-order mark at the start of a file
        return False
    return bool(re.match(r"^(P\d|SC\d)", iid))  # prompt injection / supply chain


def ask(reason):
    sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "ask",
        "permissionDecisionReason": reason,
    }}, ensure_ascii=False))
    sys.exit(0)


def main():
    try:
        data = json.loads(sys.stdin.buffer.read().decode("utf-8", "replace") or "{}")
    except Exception:
        sys.exit(0)
    if data.get("tool_name") not in ("Bash", "PowerShell"):
        sys.exit(0)
    cmd = (data.get("tool_input") or {}).get("command", "")
    if not TRIGGER.search(cmd):
        sys.exit(0)
    repos = repos_in(cmd)
    scanner = find_scanner()
    if not repos or not scanner:
        ask(t("check", what=", ".join(repos) or cmd[:200]))

    os.makedirs(REPORTS, exist_ok=True)
    notes = []
    for url in repos:
        try:
            r = subprocess.run([scanner, "scan", url, "--no-llm", "--format", "json"], capture_output=True,
                               text=True, encoding="utf-8", errors="replace", timeout=TIMEOUT)
        except subprocess.TimeoutExpired:
            ask(t("timeout", url=url, t=TIMEOUT))
        out = r.stdout or ""
        try:
            report = json.loads(out[out.index("{"):])
        except Exception:
            ask(t("unreadable", url=url))
        name = re.sub(r"[^A-Za-z0-9_.-]", "_", url.split("github.com/")[-1])
        path = os.path.join(REPORTS, f"{time.strftime('%Y%m%d-%H%M%S')}_{name}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=1)
        issues = report.get("issues") or []
        hits = [i for i in issues if serious(i)]
        if hits:
            lines = [f"- {i.get('id')} {i.get('severity')} {i.get('category', '')} @ "
                     f"{(i.get('location') or {}).get('file', '?')}:{(i.get('location') or {}).get('start_line', '?')}"
                     for i in hits[:12]]
            notes.append(t("hits", url=url, n=len(hits), total=len(issues)) + "\n" + "\n".join(lines)
                         + "\n" + t("report", path=path))
    if notes:
        ask(t("found", notes="\n\n".join(notes)))
    sys.exit(0)


if __name__ == "__main__":
    main()
