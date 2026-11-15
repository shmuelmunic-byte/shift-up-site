# -*- coding: utf-8 -*-
"""Decode Hebrew text typed while the keyboard was set to English (standard Israeli layout).
Usage: python decode.py "cut brt nv ha kapr"   ->  בוא נראה מה יש לשפר
"""
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

MAP = {
    "q": "/", "w": "'", "e": "ק", "r": "ר", "t": "א", "y": "ט", "u": "ו", "i": "ן", "o": "ם", "p": "פ",
    "a": "ש", "s": "ד", "d": "ג", "f": "כ", "g": "ע", "h": "י", "j": "ח", "k": "ל", "l": "ך", ";": "ף", "'": ",",
    "z": "ז", "x": "ס", "c": "ב", "v": "ה", "b": "נ", "n": "מ", "m": "צ", ",": "ת", ".": "ץ", "/": ".",
}


def decode(text: str) -> str:
    return "".join(MAP.get(ch.lower(), ch) if ch.isascii() else ch for ch in text)


if __name__ == "__main__":
    print(decode(" ".join(sys.argv[1:]) if len(sys.argv) > 1 else sys.stdin.read()))
