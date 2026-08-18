#!/usr/bin/env python3
"""QA Lunera 1.1.8 — etapa menopausia: calendario sin regla, chip Home, IA."""
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
APK = r"D:\Lunera\dist\lunera-1.1.8-release.apk"
OUT = Path(r"D:\Lunera\tools\qa-lunera-1.1.8")
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
    return tuple(map(int, m.groups()))


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
        candidates.append((clickable, b[1], b))
    if not candidates:
        return False
    if prefer_clickable and any(c[0] for c in candidates):
        candidates = [c for c in candidates if c[0]]
    candidates.sort(key=lambda c: c[1], reverse=prefer_bottom)
    x1, y1, x2, y2 = candidates[0][2]
    adb("shell", "input", "tap", str((x1 + x2) // 2), str((y1 + y2) // 2))
    return True


print("=== install 1.1.8 ===")
adb("shell", "am", "force-stop", PKG)
inst = adb("install", "-r", APK)
check("install_apk", inst.returncode == 0, (inst.stdout or "")[-120:])
dumpsys = adb("shell", "dumpsys", "package", PKG).stdout
vn = re.search(r"versionName=([^\s]+)", dumpsys)
vc = re.search(r"versionCode=(\d+)", dumpsys)
check("version_1_1_8", vn is not None and vn.group(1).strip() == "1.1.8", vn.group(0) if vn else "no")
check("version_code_16", vc is not None and vc.group(1) == "16", vc.group(0) if vc else "no")

adb("shell", "am", "start", "-n", f"{PKG}/.MainActivity")
time.sleep(6)
xml = dump("01_home")
joined = blob(xml)
check("home_life_chip", has(joined, "Etapa de vida"), joined[:250])
check("home_ai", has(joined, "Pregúntale a Lunera IA", "Tu Cuerpo Hoy"), joined[:250])

ok = tap_text(xml, "Etapa de vida") or tap_text(xml, "Ajustes", prefer_bottom=True)
check("tap_life_or_settings", ok)
time.sleep(2)
xml = dump("02_after_chip")
joined = blob(xml)
if has(joined, "Ajustes") and not has(joined, "Perimenopausia"):
    tap_text(xml, "Etapa de vida")
    time.sleep(1.5)
    xml = dump("03_life_mode")
    joined = blob(xml)
check("life_mode_screen", has(joined, "Perimenopausia", "Menopausia", "Etapa de vida"), joined[:300])

tapped = tap_text(xml, "Perimenopausia") or tap_text(xml, "menopausia")
check("tap_menopause", tapped)
time.sleep(0.6)
xml = dump("04_meno_selected")
tapped_save = tap_text(xml, "Guardar modo")
check("tap_save_mode", tapped_save)
time.sleep(1.2)
xml = dump("05_confirm")
joined = blob(xml)
check("confirm_dialog", has(joined, "Cambiar de etapa", "Cambiar etapa", "calendario"), joined[:300])
tap_text(xml, "Cambiar etapa") or tap_text(xml, "OK")
time.sleep(2)
xml = dump("06_saved")
joined = blob(xml)
if has(joined, "Ir a Inicio"):
    tap_text(xml, "Ir a Inicio")
    time.sleep(2)
xml = dump("07_home_meno")
joined = blob(xml)
check("home_after_meno", has(joined, "Perimenopausia") or has(joined, "Transición"), joined[:300])
check("home_ai_after", has(joined, "Pregúntale a Lunera IA", "Tu Cuerpo Hoy"))
check("home_no_cycle_day", "DÍA DEL CICLO" not in joined, joined[:200])

xml = dump("08_nav")
tap_text(xml, "Calendario", prefer_bottom=True)
time.sleep(2)
xml = dump("09_cal")
joined = blob(xml)
check("cal_no_period_legend", not has(joined, "Menstruación") and not has(joined, "Ovulación"), joined[:300])
check("cal_stage_copy", has(joined, "no pinta", "síntomas", "etapa"), joined[:300])

report = {"pass": sum(1 for r in results if r["pass"]), "total": len(results), "results": results}
(OUT / "REPORT.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
print("DONE", report["pass"], "/", report["total"])
