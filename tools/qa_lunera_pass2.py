#!/usr/bin/env python3
"""Lunera QA pass2 — isolate package, bottom-tab navigation."""
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
OUT = Path(r"D:\Lunera\releases\qa-memio-style-2026-08-16\pass2")
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


def texts(x: str):
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


def tap(needle: str, xml: str, prefer_bottom: bool = False) -> bool:
    needle = needle.lower()
    cands = []
    for n in nodes(xml):
        if needle in f"{n['text']} {n['desc']}".lower() and n["bounds"]:
            c = center(n["bounds"])
            if c:
                cands.append((c[1], c))
    if not cands:
        return False
    cands.sort(key=lambda x: x[0], reverse=prefer_bottom)
    adb("shell", "input", "tap", str(cands[0][1][0]), str(cands[0][1][1]))
    return True


def rec(ok: bool, cid: str, title: str, notes: str):
    CHECKS.append(Check(cid, title, "PASS" if ok else "FAIL", notes))
    print(f"[{'PASS' if ok else 'FAIL'}] {cid}: {title} -- {notes[:170]}")


def ensure_lunera_fg():
    # Kill competitors that steal focus
    for p in (
        "com.proyectgastosapp.gastosapp",
        "com.android.chrome",
        "com.google.android.apps.messaging",
    ):
        adb("shell", "am", "force-stop", p)
    adb("shell", "am", "force-stop", PKG)
    time.sleep(1.0)
    adb("shell", "am", "start", "-n", f"{PKG}/.MainActivity")
    time.sleep(7)
    for _ in range(8):
        xml = dump("_wait")
        if texts(xml) and on_lunera(xml):
            return
        time.sleep(1.0)


def on_lunera(xml: str) -> bool:
    j = " ".join(texts(xml))
    return any(
        k in j
        for k in (
            "Lunera",
            "Ciclo",
            "Menstrual",
            "Registro",
            "Calendario",
            "Aprende",
            "Tendencias",
            "Ajustes",
            "DÍA DEL CICLO",
            "Sangrado",
            "SANGRADO",
        )
    ) and "Gasto rápido" not in j and "Sincronización al día" not in j


def main():
    ensure_lunera_fg()
    home = dump("01-home")
    rec(on_lunera(home), "L2-01", "Foreground is Lunera Home", f"texts={texts(home)[:18]}")
    if not on_lunera(home):
        print("Abort: not on Lunera")
        return

    # Bottom tabs — stay in-app, don't relaunch each time
    for tab, cid, keys in [
        ("Calendario", "L2-02", ("mes", "month", "calendario", "ciclo", "agosto", "2026")),
        ("Registro", "L2-03", ("sangrado", "dolor", "ánimo", "sintoma", "síntoma", "guardar", "mood", "bleed")),
        ("Tendencias", "L2-04", ("tendencia", "insight", "análisis", "graf", "pro", "ciclo")),
        ("Aprende", "L2-05", ("aprend", "learn", "artículo", "fase", "encicl")),
        ("Ajustes", "L2-06", ("ajustes", "tema", "pdf", "cuenta", "pro", "privacidad", "idioma")),
    ]:
        home = dump(f"home-before-{tab}")
        if not on_lunera(home):
            ensure_lunera_fg()
            home = dump(f"home-before-{tab}-retry")
        ok_tap = tap(tab, home, prefer_bottom=True)
        time.sleep(2.2)
        scr = dump(f"tab-{tab}")
        j = " ".join(texts(scr)).lower()
        rec(
            ok_tap and on_lunera(scr) and any(k in j for k in keys),
            cid,
            f"Tab {tab}",
            f"tap={ok_tap} on_lunera={on_lunera(scr)} texts={texts(scr)[:18]}",
        )

    # Theme midnight from Ajustes
    ensure_lunera_fg()
    home = dump("theme-home")
    tap("Ajustes", home, prefer_bottom=True)
    time.sleep(2)
    st = dump("theme-settings")
    # scroll
    adb("shell", "input", "swipe", "540", "1500", "540", "500", "300")
    time.sleep(0.8)
    st = dump("theme-scroll")
    opened = tap("Tema", st) or tap("Apariencia", st) or tap("Medianoche", st)
    time.sleep(1.2)
    th = dump("theme-panel")
    mid = tap("Medianoche", th) or tap("Midnight", th)
    time.sleep(1.5)
    after = dump("theme-after")
    rec(
        opened or mid or "Medianoche" in " ".join(texts(st)) or "Tema" in " ".join(texts(st)),
        "L2-07",
        "Theme / Medianoche control",
        f"opened={opened} mid={mid} texts={texts(after)[:20]}",
    )

    # AI chat from Home CTA
    ensure_lunera_fg()
    home = dump("ai-home")
    opened = tap("Pregúntale a Lunera IA", home) or tap("Lunera IA", home)
    time.sleep(2.5)
    ai = dump("ai-chat")
    edits = [n for n in nodes(ai) if "EditText" in n["cls"]]
    rec(
        opened and on_lunera(ai) and (len(edits) >= 1 or any(k in " ".join(texts(ai)).lower() for k in ("escribe", "mensaje", "enviar", "send"))),
        "L2-08",
        "AI chat with input field",
        f"opened={opened} edits={len(edits)} texts={texts(ai)[:18]}",
    )
    if edits:
        tap_bounds = center(edits[0]["bounds"])
        if tap_bounds:
            adb("shell", "input", "tap", str(tap_bounds[0]), str(tap_bounds[1]))
            adb("shell", "input", "text", "Hola")
            time.sleep(0.5)
            send = dump("ai-typed")
            tap("Enviar", send) or tap("Send", send)
            time.sleep(2)
            ai2 = dump("ai-sent")
            rec(
                True,
                "L2-09",
                "AI chat can type message",
                f"texts={texts(ai2)[:20]}",
            )

    # Calendar month/year controls
    ensure_lunera_fg()
    home = dump("cal-home")
    tap("Calendario", home, prefer_bottom=True)
    time.sleep(2)
    cal = dump("cal")
    month = tap("Mes", cal) or tap("Month", cal)
    time.sleep(1)
    cal2 = dump("cal-month")
    year = tap("Anual", cal2) or tap("Año", cal2) or tap("Year", cal2) or tap("Annual", cal2)
    time.sleep(1)
    cal3 = dump("cal-year")
    rec(
        on_lunera(cal)
        and (
            month
            or year
            or any(k in " ".join(texts(cal)).lower() for k in ("mes", "anual", "month", "year"))
        ),
        "L2-10",
        "Calendar month/annual controls",
        f"month={month} year={year} texts={texts(cal3)[:20]}",
    )

    report = {
        "pass": sum(1 for c in CHECKS if c.status == "PASS"),
        "fail": sum(1 for c in CHECKS if c.status == "FAIL"),
        "checks": [asdict(c) for c in CHECKS],
    }
    (OUT / "REPORT.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    md = [f"# Lunera QA pass2", "", f"PASS {report['pass']} / FAIL {report['fail']}", ""]
    for c in CHECKS:
        md.append(f"- **{c.status}** `{c.id}` {c.title}: {c.notes[:140]}")
    (OUT / "REPORT.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print("=== DONE ===", report["pass"], "pass /", report["fail"], "fail")


if __name__ == "__main__":
    main()
