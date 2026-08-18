import re
from pathlib import Path
t = Path(r"D:\Lunera\tools\qa-debug-lunera.xml").read_text(encoding="utf-8", errors="replace")
print("len", len(t))
print([x for x in re.findall(r'text="([^"]*)"', t) if x][:50])
