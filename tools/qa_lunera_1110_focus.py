#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import subprocess
import time
from pathlib import Path
from xml.etree import ElementTree as ET

ADB = r"C:\Users\Cristiano\AppData\Local\Android\Sdk\platform-tools\adb.exe"
SERIAL = "emulator-5554"
PKG = "com.flowhome.lunera"
APK = r"D:\Lunera\dist\lunera-1.1.10-release.apk"
OUT = Path(r"D:\Lunera\releases\qa-lunera-1.1.10-focus")
OUT.mkdir(parents=True, exist_ok=True)

results: list[dict[str, str | bool]] = []


def adb(*args: str, timeout: int = 120) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [ADB, "-s", SERIAL, *args],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
    )


def check(name: str, ok: bool, detail: str = "") -> None:
    results.append({"name": name, "pass": bool(ok), "detail": detail[:500]})
    print(("PASS" if ok else "FAIL"), name, detail[:180])


def dump(tag: str) -> str:
    ensure_lunera_foreground()
    adb("shell", "uiautomator", "dump", "/sdcard/ui.xml")
    xml_path = OUT / f"{tag}.xml"
    adb("pull", "/sdcard/ui.xml", str(xml_path))
    adb("shell", "screencap", "-p", f"/sdcard/{tag}.png")
    adb("pull", f"/sdcard/{tag}.png", str(OUT / f"{tag}.png"))
    return xml_path.read_text(encoding="utf-8", errors="replace") if xml_path.exists() else ""


def ensure_lunera_foreground() -> None:
    focus = adb("shell", "dumpsys", "window", "windows").stdout
    if "com.flowhome.lunera" in focus:
        return
    adb("shell", "am", "start", "-n", f"{PKG}/.MainActivity")
    time.sleep(1.2)


def parse_bounds(node: ET.Element) -> tuple[int, int, int, int] | None:
    m = re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", node.attrib.get("bounds", ""))
    if not m:
        return None
    return tuple(map(int, m.groups()))


def center(bounds: tuple[int, int, int, int]) -> tuple[int, int]:
    x1, y1, x2, y2 = bounds
    return (x1 + x2) // 2, (y1 + y2) // 2


def tap_text(xml: str, needle: str, prefer_bottom: bool = False) -> bool:
    root = ET.fromstring(xml)
    rows: list[tuple[int, tuple[int, int, int, int]]] = []
    n = needle.lower()
    for node in root.iter("node"):
        text = ((node.attrib.get("text") or "") + " " + (node.attrib.get("content-desc") or "")).lower()
        if n not in text:
            continue
        b = parse_bounds(node)
        if not b:
            continue
        rows.append((b[1], b))
    if not rows:
        return False
    rows.sort(key=lambda r: r[0], reverse=prefer_bottom)
    x, y = center(rows[0][1])
    adb("shell", "input", "tap", str(x), str(y))
    return True


def tap_first_edittext(xml: str, label_hint: str | None = None) -> bool:
    root = ET.fromstring(xml)
    target: tuple[int, int, int, int] | None = None
    if label_hint:
        hint = label_hint.lower()
        for node in root.iter("node"):
            txt = (node.attrib.get("text") or "").lower()
            if hint in txt:
                b = parse_bounds(node)
                if b:
                    target = b
                    break
    if target:
        x, y = center(target)
        adb("shell", "input", "tap", str(x), str(y + 70))
        return True
    edits = [n for n in root.iter("node") if "EditText" in (n.attrib.get("class") or "")]
    if not edits:
        return False
    b = parse_bounds(edits[0])
    if not b:
        return False
    x, y = center(b)
    adb("shell", "input", "tap", str(x), str(y))
    return True


def clear_and_type(text: str) -> None:
    for _ in range(14):
        adb("shell", "input", "keyevent", "67")
    adb("shell", "input", "text", text.replace(" ", "%s"))


def tap_tab(tab: str) -> None:
    # Pixel 7 1080x2400
    points = {
        "home": (108, 2260),
        "calendar": (280, 2260),
        "log": (454, 2260),
        "insights": (626, 2260),
        "learn": (799, 2260),
        "settings": (972, 2260),
    }
    x, y = points[tab]
    adb("shell", "input", "tap", str(x), str(y))


def all_texts(xml: str) -> str:
    root = ET.fromstring(xml)
    values: list[str] = []
    for node in root.iter("node"):
        t = node.attrib.get("text") or ""
        d = node.attrib.get("content-desc") or ""
        if t:
            values.append(t)
        if d:
            values.append(d)
    return " | ".join(values)


def extract_month_label(joined: str) -> str:
    months = (
        r"(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|"
        r"january|february|march|april|may|june|july|august|september|october|november|december)"
    )
    m = re.search(months + r"\s+\d{4}", joined.lower())
    return m.group(0) if m else ""


def main() -> None:
    adb("wait-for-device")
    install = adb("install", "-r", APK)
    check("install_apk_1_1_10", install.returncode == 0, (install.stdout + install.stderr).strip())
    pkg = adb("shell", "dumpsys", "package", PKG).stdout
    vn = re.search(r"versionName=([^\s]+)", pkg)
    check("version_1_1_10", bool(vn and vn.group(1) == "1.1.10"), vn.group(0) if vn else "missing")

    adb("shell", "am", "force-stop", PKG)
    adb("shell", "monkey", "-p", PKG, "-c", "android.intent.category.LAUNCHER", "1")
    time.sleep(7)

    home = dump("01_home")
    check("home_loaded", "Registros recientes" in all_texts(home) or "Recent logs" in all_texts(home), all_texts(home)[:250])

    # Registro: completar datos de hoy
    tap_tab("log")
    time.sleep(2)
    log = dump("02_log")
    check("open_log_tab", "Registro diario" in all_texts(log) or "Daily log" in all_texts(log), all_texts(log)[:250])

    # Moco seco
    tap_text(log, "Seco") or tap_text(log, "Dry")
    # Relaciones: No
    tap_text(log, "No")

    # Ir a hábitos y poner agua/sueño
    log2 = log
    for _ in range(2):
        adb("shell", "input", "swipe", "540", "1900", "540", "900", "220")
        time.sleep(0.6)
        log2 = dump("03_log_mid")
    tap_first_edittext(log2, "Horas de sueño") or tap_first_edittext(log2, "Sleep hours")
    clear_and_type("7")
    tap_first_edittext(log2, "Vasos de agua") or tap_first_edittext(log2, "Glasses of water")
    clear_and_type("5")
    adb("shell", "input", "keyevent", "4")
    time.sleep(0.4)
    saved = False
    for i in range(5):
        xml_try = dump(f"03b_log_save_{i}")
        if tap_text(xml_try, "Guardar") or tap_text(xml_try, "Save"):
            saved = True
            break
        adb("shell", "input", "swipe", "540", "1900", "540", "900", "220")
        time.sleep(0.5)
    time.sleep(2)
    log_after = dump("04_log_saved")
    check("save_log", saved, all_texts(log_after)[:250])

    # Volver a Home y validar recientes
    tap_tab("home")
    time.sleep(1.2)
    home2 = dump("05_home_after_log")
    joined_home = all_texts(home2)
    recent_ok = any(
        token in joined_home
        for token in [
            "Vasos de agua",
            "Sleep hours",
            "Moco cervical",
            "Cervical mucus",
            "Relaciones",
            "Sex:",
        ]
    )
    check("recent_logs_reflect_today", recent_ok, joined_home[:350])

    # Calendario: mes "agosto 2026" sin "de" y swipe cambia mes
    tap_tab("calendar")
    time.sleep(2)
    cal1 = dump("06_calendar")
    joined_cal1 = all_texts(cal1)
    month1 = extract_month_label(joined_cal1)
    check("month_format_without_de", bool(month1) and " de " not in month1, month1 or joined_cal1[:300])
    adb("shell", "input", "swipe", "930", "1180", "140", "1180", "240")
    time.sleep(1.4)
    cal2 = dump("07_calendar_swipe")
    month2 = extract_month_label(all_texts(cal2))
    check("calendar_swipe_changes_month", bool(month1 and month2 and month1 != month2), f"{month1} -> {month2}")

    # Logout/login flow
    tap_tab("settings")
    time.sleep(2)
    st = dump("08_settings")
    if "Iniciar sesión / Sincronizar cuenta" in all_texts(st) or "Sign in / Sync account" in all_texts(st):
        tap_text(st, "Iniciar sesión / Sincronizar cuenta") or tap_text(st, "Sign in / Sync account")
        time.sleep(2)
        acc = dump("08b_account")
        # crear cuenta local para poder validar logout
        tap_text(acc, "Registrar") or tap_text(acc, "Register")
        unique = str(int(time.time()))
        tap_first_edittext(acc, "Email")
        clear_and_type(f"qa{unique}%40mail.com")
        tap_first_edittext(acc, "Contraseña") or tap_first_edittext(acc, "Password")
        clear_and_type("QaLunera2026")
        tap_text(acc, "Registrar") or tap_text(acc, "Register")
        time.sleep(3)
        st = dump("08c_settings_post_login")
    opened_profile = tap_text(st, "Gestionar perfil") or tap_text(st, "Manage profile")
    time.sleep(2)
    prof = dump("09_profile")
    has_logout = "Cerrar sesión" in all_texts(prof) or "Sign out" in all_texts(prof)
    if has_logout:
        tap_text(prof, "Cerrar sesión") or tap_text(prof, "Sign out")
        time.sleep(1)
        confirm = dump("10_logout_confirm")
        tap_text(confirm, "Cerrar sesión") or tap_text(confirm, "Sign out")
        time.sleep(2)
        st2 = dump("11_settings_after_logout")
        logout_ok = "Iniciar sesión / Sincronizar cuenta" in all_texts(st2) or "Sign in / Sync account" in all_texts(st2)
        check("logout_works", logout_ok, all_texts(st2)[:300])
    else:
        check("logout_works", False, "No se encontró botón de cerrar sesión (perfil en modo invitado o flujo roto).")
    check("open_profile_screen", opened_profile, all_texts(prof)[:250])

    report = {
        "pass": sum(1 for r in results if r["pass"]),
        "total": len(results),
        "results": results,
    }
    (OUT / "REPORT.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print("DONE", report["pass"], "/", report["total"])


if __name__ == "__main__":
    main()
