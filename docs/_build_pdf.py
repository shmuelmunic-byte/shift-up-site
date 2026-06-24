# -*- coding: utf-8 -*-
"""Build a styled RTL Hebrew HTML from RESEARCH.md (for Chrome -> PDF)."""
import markdown, pathlib

src = pathlib.Path(r"C:\dev\shift-up-site\docs\RESEARCH.md").read_text(encoding="utf-8")

html_body = markdown.markdown(
    src,
    extensions=["tables", "fenced_code", "toc", "sane_lists"],
)

template = """<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<title>Shift Up — מסמך אפיון ומחקר</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 18mm 16mm 20mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Heebo', Arial, sans-serif;
    direction: rtl; text-align: right;
    color: #1a1f2e; font-size: 11pt; line-height: 1.7;
    margin: 0;
  }
  h1, h2, h3, h4 { font-weight: 800; line-height: 1.3; color: #0b1220; }
  h1 { font-size: 24pt; margin: 0 0 4pt; padding-bottom: 8pt;
       border-bottom: 4px solid #16a34a; }
  h2 { font-size: 16pt; margin: 22pt 0 8pt; padding-top: 6pt;
       border-top: 1px solid #e5e7eb; color: #15803d; }
  h3 { font-size: 13pt; margin: 14pt 0 6pt; color: #166534; }
  h4 { font-size: 11.5pt; margin: 10pt 0 4pt; }
  p { margin: 6pt 0; }
  a { color: #15803d; text-decoration: none; }
  blockquote {
    margin: 10pt 0; padding: 8pt 14pt;
    background: #f0fdf4; border-right: 4px solid #16a34a;
    border-radius: 6px; color: #14532d;
  }
  blockquote p { margin: 3pt 0; }
  ul, ol { margin: 6pt 0; padding-right: 22pt; padding-left: 0; }
  li { margin: 3pt 0; }
  code {
    font-family: Consolas, monospace; direction: ltr; unicode-bidi: embed;
    background: #f3f4f6; padding: 1px 5px; border-radius: 4px; font-size: 9.5pt;
  }
  pre {
    background: #0b1220; color: #e5e7eb; padding: 12pt; border-radius: 8px;
    direction: ltr; text-align: left; overflow-x: auto; font-size: 9pt; line-height: 1.5;
  }
  pre code { background: none; color: inherit; padding: 0; }
  table {
    width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 10pt;
    page-break-inside: avoid;
  }
  th, td { border: 1px solid #d1d5db; padding: 6pt 9pt; text-align: right; vertical-align: top; }
  th { background: #16a34a; color: #fff; font-weight: 700; }
  tr:nth-child(even) td { background: #f9fafb; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 18pt 0; }
  h2 { page-break-after: avoid; }
  table, pre, blockquote { page-break-inside: avoid; }
</style>
</head>
<body>
__BODY__
</body>
</html>
"""

out = template.replace("__BODY__", html_body)
pathlib.Path(r"C:\dev\shift-up-site\docs\_research.html").write_text(out, encoding="utf-8")
print("HTML built")
