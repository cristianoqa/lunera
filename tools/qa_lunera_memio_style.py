#!/usr/bin/env python3
"""Memio-style QA for Lunera 1.1.4 on emulator."""
from __future__ import annotations

import json
import re
import subprocess
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from xml.etree import ElementTree as ET

ADB = r"C:\Users\Cristiano\AppData\Local\Android\Sdk\platform-tools\adb.exe"
S = "emulator-5554"
PKG = "com.flowhome.lunera"
OUT = Path(r"D:\Lunera\releases\qa-memio-style-2026-08-16")
OUT.mkdir(parents=True, exist_ok=True)


@dataclass
class Check:
    id: str
    title: str
    status: str
    notes: str


CHECKS: list[Check] = []


def adb(*a, timeout=90):
    return subprocess.run(
        [ADB, "-s", S, *a],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
    )


def dump(n: str) -> str:
    adb("shell", "uiautomator", "dump", "/sdcard/ui.xml")
    p = OUT / f"{n}.xml"
    adb("pull", "/sdcard/ui.xml", str(p))
    adb("shell", "screencap", "-p", f"/sdcard/{n}.png")
    adb("pull", f"/sdcard/{n}.png", str(OUT / f"{n}.png"))
    return p.read_text(encoding="utf-8", errors="replace")


def texts(x: str) -> list[str]:
    return [t for t in re.findall(r'text="([^"]*)"', x) if t]


def nodes(x: str):
    root = ET.fromstring(x)
    return [
        {
            "text": n.attrib.get("text", ""),
            "desc": n.attrib.get("content-desc", ""),
            "cls": n.attrib.get("class", ""),
            "bounds": n.attrib.get("bounds", ""),
        }
        for n in root.iter("node")
    ]


def center(b: str):
    m = re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", b)
    if not m:
        return None
    x1, y1, x2, y2 = map(int, m.groups())
    return (x1 + x2) // 2, (y1 + y2) // 2


def tap(needle: str, xml: str) -> bool:
    needle = needle.lower()
    for n in nodes(xml):
        if needle in f"{n['text']} {n['desc']}".lower() and n["bounds"]:
            c = center(n["bounds"])
            if c:
                adb("shell", "input", "tap", str(c[0]), str(c[1]))
                return True
    return False


def tap_edit(xml: str, i: int = 0) -> bool:
    edits = [n for n in nodes(xml) if "EditText" in n["cls"]]
    if i >= len(edits):
        return False
    c = center(edits[i]["bounds"])
    if not c:
        return False
    adb("shell", "input", "tap", str(c[0]), str(c[1]))
    return True


def type_text(s: str) -> None:
    adb("shell", "input", "text", s.replace(" ", "%s"))


def rec(ok: bool, cid: str, title: str, notes: str) -> None:
    CHECKS.append(Check(cid, title, "PASS" if ok else "FAIL", notes))
    print(f"[{'PASS' if ok else 'FAIL'}] {cid}: {title} -- {notes[:160]}")


def launch():
    adb("shell", "am", "force-stop", "com.android.chrome")
    adb("shell", "am", "force-stop", PKG)
    time.sleep(0.8)
    adb("shell", "monkey", "-p", PKG, "-c", "android.intent.category.LAUNCHER", "1")
    time.sleep(6)


def main():
    pkg = adb("shell", "dumpsys", "package", PKG).stdout
    vn = re.search(r"versionName=([^\s]+)", pkg)
    vc = re.search(r"versionCode=(\d+)", pkg)
    rec(
        (vn.group(1) if vn else "") == "1.1.4" and (vc.group(1) if vc else "") == "12",
        "L00",
        "Installed 1.1.4 / vc12",
        f"vn={vn.group(1) if vn else '?'} vc={vc.group(1) if vc else '?'}",
    )

    launch()
    xml = dump("01-launch")
    ts = texts(xml)
    print("LAUNCH", ts[:30])
    joined = " ".join(ts)

    # Onboarding / auth / home
    if any(k in joined for k in ("Bienvenida", "Welcome", "Empezar", "Get started", "Continuar", "Continue")):
        tap("Empezar", xml) or tap("Get started", xml) or tap("Continuar", xml) or tap("Continue", xml)
        time.sleep(2)
        xml = dump("02-onboard")
        ts = texts(xml)
        joined = " ".join(ts)
        # try advance a few onboarding steps
        for i in range(5):
            if tap("Continuar", xml) or tap("Continue", xml) or tap("Siguiente", xml) or tap("Next", xml):
                time.sleep(1.5)
                xml = dump(f"02-onboard-{i}")
            else:
                break

    xml = dump("03-auth-or-home")
    ts = texts(xml)
    joined = " ".join(ts)
    print("AUTH/HOME", ts[:30])

    # Local auth create/login if needed
    if any(k in joined.lower() for k in ("contraseña", "password", "crear cuenta", "iniciar", "registr")):
        # Try create account path
        tap("Crear", xml) or tap("Registr", xml) or tap("Sign up", xml)
        time.sleep(1)
        xml = dump("04-auth")
        if tap_edit(xml, 0):
            for _ in range(20):
                adb("shell", "input", "keyevent", "KEYCODE_DEL")
            type_text("QaLunera2026")
        time.sleep(0.3)
        xml = dump("04b")
        if tap_edit(xml, 1):
            for _ in range(20):
                adb("shell", "input", "keyevent", "KEYCODE_DEL")
            type_text("QaLunera2026")
        time.sleep(0.3)
        xml = dump("04c")
        tap("Crear", xml) or tap("Registrar", xml) or tap("Continuar", xml) or tap("Guardar", xml) or tap("Entrar", xml)
        time.sleep(3)
        xml = dump("05-after-auth")
        ts = texts(xml)
        joined = " ".join(ts)

    rec(
        any(k in joined for k in ("Hoy", "Today", "Registro", "Log", "Calendario", "Calendar", "Inicio", "Home", "Ciclo")),
        "L01",
        "Reach main app shell",
        f"sample={ts[:20]}",
    )

    # Theme: open settings / appearance
    home = dump("06-home")
    opened = (
        tap("Ajustes", home)
        or tap("Settings", home)
        or tap("Más", home)
        or tap("More", home)
        or tap("Perfil", home)
        or tap("Profile", home)
    )
    time.sleep(2)
    st = dump("07-settings")
    # try theme midnight
    for lab in ("Medianoche", "Midnight", "Tema", "Theme", "Apariencia", "Appearance", "Oscuro", "Dark"):
        if tap(lab, st):
            time.sleep(1)
            st = dump("08-theme")
            break
    # pick midnight if listed
    st2 = dump("09-theme2")
    tapped = tap("Medianoche", st2) or tap("Midnight", st2) or tap("Lino", st2) or tap("Linen", st2)
    time.sleep(1.5)
    themed = dump("10-after-theme")
    rec(
        opened or "Tema" in " ".join(texts(st)) or "Theme" in " ".join(texts(st)),
        "L02",
        "Settings/theme reachable",
        f"opened={opened} tapped={tapped} texts={texts(themed)[:20]}",
    )

    # Back to home / log
    for _ in range(3):
        adb("shell", "input", "keyevent", "KEYCODE_BACK")
        time.sleep(0.6)
    home = dump("11-home")
    tap("Registro", home) or tap("Log", home) or tap("Hoy", home) or tap("Today", home)
    time.sleep(2)
    log = dump("12-log")
    rec(
        any(k in " ".join(texts(log)).lower() for k in ("sangrado", "bleed", "dolor", "pain", "ánimo", "mood", "síntoma", "symptom", "guardar", "save")),
        "L03",
        "Log/Registro screen",
        f"texts={texts(log)[:25]}",
    )

    adb("shell", "input", "keyevent", "KEYCODE_BACK")
    time.sleep(0.8)
    home = dump("13-home")
    tap("Calendario", home) or tap("Calendar", home)
    time.sleep(2)
    cal = dump("14-cal")
    rec(
        any(k in " ".join(texts(cal)).lower() for k in ("mes", "month", "año", "year", "anual", "calendar", "ciclo")),
        "L04",
        "Calendar screen",
        f"texts={texts(cal)[:25]}",
    )

    # AI chat
    adb("shell", "input", "keyevent", "KEYCODE_BACK")
    time.sleep(0.8)
    home = dump("15-home")
    opened_ai = tap("IA", home) or tap("Chat", home) or tap("Asistente", home) or tap("AI", home)
    time.sleep(2)
    ai = dump("16-ai")
    if not opened_ai:
        # try settings path or fab
        for lab in ("Preguntar", "Ask", "Lunera AI", "Consejo"):
            if tap(lab, home):
                time.sleep(2)
                ai = dump("16-ai")
                opened_ai = True
                break
    ai_j = " ".join(texts(ai)).lower()
    has_input = len([n for n in nodes(ai) if "EditText" in n["cls"]]) >= 1
    rec(
        opened_ai and (has_input or "enviar" in ai_j or "send" in ai_j or "escribe" in ai_j or "message" in ai_j),
        "L05",
        "AI chat opens with input",
        f"opened={opened_ai} input={has_input} texts={texts(ai)[:20]}",
    )

    # Learn / Insights
    adb("shell", "input", "keyevent", "KEYCODE_BACK")
    time.sleep(0.8)
    home = dump("17-home")
    tap("Aprender", home) or tap("Learn", home) or tap("Insights", home) or tap("Análisis", home)
    time.sleep(2)
    learn = dump("18-learn")
    rec(
        any(k in " ".join(texts(learn)).lower() for k in ("aprender", "learn", "insight", "fase", "phase", "artículo", "article")),
        "L06",
        "Learn/Insights opens",
        f"texts={texts(learn)[:20]}",
    )

    report = {
        "pass": sum(1 for c in CHECKS if c.status == "PASS"),
        "fail": sum(1 for c in CHECKS if c.status == "FAIL"),
        "checks": [asdict(c) for c in CHECKS],
    }
    (OUT / "REPORT.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    lines = [f"# Lunera QA 1.1.4", "", f"PASS {report['pass']} / FAIL {report['fail']}", ""]
    for c in CHECKS:
        lines.append(f"- **{c.status}** `{c.id}` {c.title}: {c.notes[:140]}")
    (OUT / "REPORT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("=== DONE ===", report["pass"], "pass /", report["fail"], "fail")


if __name__ == "__main__":
    main()
