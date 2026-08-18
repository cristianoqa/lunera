#!/usr/bin/env python3
"""QA emulador Lunera 1.1.7 — versión nativa + registro + card Home."""
from __future__ import annotations

import json
import re
import subprocess
import time
from pathlib import Path
from xml.etree import ElementTree as ET

ADB = r"C:\Users\Cristiano\AppData\Local\Android\Sdk\platform-tools\adb.exe"
S = "emulator-5554"
PKG = "com.flowhome.lunera"
APK = r"D:\Lunera\dist\lunera-1.1.7-release.apk"
OUT = Path(r"D:\Lunera\tools\qa-lunera-1.1.7")
OUT.mkdir(parents=True, exist_ok=True)

results = []


def adb(*a, timeout=120):
    return subprocess.run(
        [ADB, "-s", S, *a],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
    )


def check(name, cond, detail=""):
    results.append({"name": name, "pass": bool(cond), "detail": str(detail)[:400]})
    print(("PASS" if cond else "FAIL"), name, str(detail)[:180])


def dump(name: str) -> str:
    adb("shell", "uiautomator", "dump", "/sdcard/ui.xml")
    local = OUT / f"{name}.xml"
    adb("pull", "/sdcard/ui.xml", str(local))
    adb("shell", "screencap", "-p", f"/sdcard/{name}.png")
    adb("pull", f"/sdcard/{name}.png", str(OUT / f"{name}.png"))
    return local.read_text(encoding="utf-8", errors="replace") if local.exists() else ""


def blob(xml: str) -> str:
    root = ET.fromstring(xml)
    parts = []
    for n in root.iter("node"):
        for k in ("text", "content-desc"):
            v = n.attrib.get(k) or ""
            if v:
                parts.append(v)
    return " | ".join(parts)


def has(joined: str, *needles: str) -> bool:
    low = joined.lower()
    return any(n.lower() in low for n in needles)


def parse_bounds(n):
    m = re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", n.attrib.get("bounds", ""))
    if not m:
        return None
    x1, y1, x2, y2 = map(int, m.groups())
    return x1, y1, x2, y2


def tap_text(xml: str, needle: str, prefer_clickable=True, prefer_bottom=False) -> bool:
    root = ET.fromstring(xml)
    needle_l = needle.lower()
    candidates = []
    for n in root.iter("node"):
        t = ((n.attrib.get("text") or "") + " " + (n.attrib.get("content-desc") or "")).lower()
        if needle_l not in t:
            continue
        b = parse_bounds(n)
        if not b:
            continue
        clickable = n.attrib.get("clickable") == "true"
        candidates.append((clickable, b[1], n, b))
    if not candidates:
        return False
    if prefer_clickable and any(c[0] for c in candidates):
        candidates = [c for c in candidates if c[0]]
    candidates.sort(key=lambda c: c[1], reverse=prefer_bottom)
    _clickable, _y, _n, (x1, y1, x2, y2) = candidates[0]
    adb("shell", "input", "tap", str((x1 + x2) // 2), str((y1 + y2) // 2))
    return True


def swipe_up():
    adb("shell", "input", "swipe", "540", "1600", "540", "700", "400")


def swipe_down():
    adb("shell", "input", "swipe", "540", "700", "540", "1600", "400")


print("=== install 1.1.7 ===")
adb("shell", "am", "force-stop", "com.android.chrome")
adb("shell", "am", "force-stop", PKG)
inst = adb("install", "-r", APK)
check("install_apk", inst.returncode == 0, (inst.stderr or "")[-200:] + (inst.stdout or "")[-200:])
dumpsys = adb("shell", "dumpsys", "package", PKG).stdout
vn = re.search(r"versionName=([^\s]+)", dumpsys)
vc = re.search(r"versionCode=(\d+)", dumpsys)
check(
    "version_1_1_7",
    vn is not None and vn.group(1).strip() == "1.1.7",
    f"versionName={vn.group(1) if vn else '?'} versionCode={vc.group(1) if vc else '?'}",
)
check(
    "version_code_15",
    vc is not None and vc.group(1) == "15",
    f"versionCode={vc.group(1) if vc else '?'}",
)

adb("shell", "am", "start", "-n", f"{PKG}/.MainActivity")
time.sleep(6)

xml = dump("01_home")
joined = blob(xml)
check("home_opened", has(joined, "Hoy", "ciclo", "Lunera"), joined[:300])
check("home_no_ir_a_registro", not has(joined, "Ir a Registro", "Ir ao Registro"))

found_card = has(joined, "Registros recientes", "Recent logs")
if not found_card:
    for i in range(4):
        swipe_up()
        time.sleep(0.5)
        xml = dump(f"01b_home_scroll_{i}")
        joined += " | " + blob(xml)
        if has(joined, "Registros recientes", "Recent logs"):
            found_card = True
            xml = dump("01c_home_card")
            break
check("home_logs_card", found_card, joined[-250:])

ok = tap_text(xml, "Registro", prefer_bottom=True)
if not ok:
    ok = tap_text(xml, "Log", prefer_bottom=True)
check("tap_registro_tab", ok)
time.sleep(2)

xml = dump("02_log")
joined = blob(xml)
check("log_title", has(joined, "Registro diario", "Daily log"), joined[:250])
check("log_mucus", has(joined, "Moco cervical", "Cervical mucus"), joined[:300])

found_sex = has(joined, "Relaciones")
found_habits = has(joined, "Hábitos de hoy", "Habitos de hoy", "Habits")
found_water = has(joined, "Vasos de agua", "Glasses of water")
all_join = joined
for i in range(6):
    if found_sex and found_habits and found_water:
        break
    swipe_up()
    time.sleep(0.55)
    xml = dump(f"03_log_scroll_{i}")
    chunk = blob(xml)
    all_join += " | " + chunk
    found_sex = found_sex or has(chunk, "Relaciones")
    found_habits = found_habits or has(chunk, "Hábitos", "Habitos", "Habits")
    found_water = found_water or has(chunk, "Vasos de agua", "Glasses of water")

check("log_sex", found_sex, all_join[-300:])
check("log_habits", found_habits, all_join[-300:])
check("log_water", found_water)
check("log_no_vague_ojos", "Ojos" not in all_join)
check("log_no_vague_cabello", "Cabello" not in all_join)

for _ in range(6):
    swipe_down()
    time.sleep(0.25)
xml = dump("04_log_top")
tapped = tap_text(xml, "Clara de huevo") or tap_text(xml, "Egg-white")
check("tap_mucus_egg", tapped)
time.sleep(0.4)
xml = dump("05_after_mucus")
tapped_save = tap_text(xml, "Guardar registro") or tap_text(xml, "Save log")
if not tapped_save:
    for i in range(8):
        swipe_up()
        time.sleep(0.4)
        xml = dump(f"05b_save_{i}")
        tapped_save = tap_text(xml, "Guardar registro") or tap_text(xml, "Save log")
        if tapped_save:
            break
check("tap_save", tapped_save)
time.sleep(2)
xml = dump("06_after_save")
joined = blob(xml)
check("saved_feedback", has(joined, "Guardado", "Saved") or tapped_save, joined[:250])

xml = dump("07_nav")
tap_text(xml, "Inicio", prefer_bottom=True) or tap_text(xml, "Home", prefer_bottom=True)
time.sleep(2)
xml = dump("08_home_after")
joined = blob(xml)
if not has(joined, "Registros recientes"):
    for i in range(4):
        swipe_up()
        time.sleep(0.45)
        xml = dump(f"08b_home_scroll_{i}")
        joined = blob(xml)
        if has(joined, "Registros recientes"):
            break
check("home_after_log", has(joined, "Registros recientes", "Hoy"))
tapped_card = tap_text(xml, "Registros recientes")
check("tap_logs_card", tapped_card)
time.sleep(2)
xml = dump("09_from_card")
joined = blob(xml)
check(
    "card_opens_log",
    has(joined, "Registro diario", "Moco cervical", "Daily log"),
    joined[:300],
)

report = {"pass": sum(1 for r in results if r["pass"]), "total": len(results), "results": results}
(OUT / "REPORT.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
md = [f"# Lunera 1.1.7 emulator QA", "", f"**{report['pass']}/{report['total']}**", ""]
for r in results:
    md.append(f"- {'PASS' if r['pass'] else 'FAIL'} **{r['name']}**: {r['detail'][:180]}")
(OUT / "REPORT.md").write_text("\n".join(md), encoding="utf-8")
print("DONE", report["pass"], "/", report["total"])
