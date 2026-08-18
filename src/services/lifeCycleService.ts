import type { AppConfig } from "../types/config";
import type { AppMode, ContraceptionMethod } from "../types/lifeCycle";
import { DEFAULT_APP_MODE } from "../types/lifeCycle";
import { addDays, diffDays } from "./cyclePredictor";

export function resolveAppMode(config: AppConfig | null | undefined): AppMode {
  return config?.appMode ?? DEFAULT_APP_MODE;
}

export function isPostpartumMode(config: AppConfig | null | undefined): boolean {
  return resolveAppMode(config) === "PREGNANCY_CARE" && Boolean(config?.pregnancy?.babyBornAt);
}

/** Predicción rígida de regla / alerta de retraso: off en embarazo, postparto y menopausia. */
export function shouldPredictPeriods(config: AppConfig | null | undefined): boolean {
  const mode = resolveAppMode(config);
  if (mode === "PREGNANCY_CARE") return false;
  if (mode === "MENOPAUSE_SUPPORT") return false;
  if (mode === "CONTRACEPTION_CONTROL") return false;
  return true;
}

export function shouldShowFertileWindow(config: AppConfig | null | undefined): boolean {
  const mode = resolveAppMode(config);
  if (mode === "PREGNANCY_CARE" || mode === "MENOPAUSE_SUPPORT") return false;
  if (mode === "CONTRACEPTION_CONTROL") return false;
  return true;
}

/** Calendario: sin celdas de regla / ovulación si el modo no predice ciclo. */
export function shouldPaintPeriodOnCalendar(config: AppConfig | null | undefined): boolean {
  return shouldPredictPeriods(config);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HH_MM = /^([01]?\d|2[0-3]):[0-5]\d$/;

export function validateLifeModeInput(input: {
  mode: AppMode;
  lmp?: string;
  packStart?: string;
  reminderTime?: string;
  today: string;
}): { ok: true } | { ok: false; messageKey: string } {
  if (input.mode === "PREGNANCY_CARE") {
    if (!input.lmp || !ISO_DATE.test(input.lmp)) {
      return { ok: false, messageKey: "life_mode_date_invalid" };
    }
    if (input.lmp > input.today) {
      return { ok: false, messageKey: "life_mode_lmp_future" };
    }
  }
  if (input.mode === "CONTRACEPTION_CONTROL") {
    if (input.reminderTime && !HH_MM.test(input.reminderTime.trim())) {
      return { ok: false, messageKey: "life_mode_time_invalid" };
    }
    if (input.packStart && !ISO_DATE.test(input.packStart)) {
      return { ok: false, messageKey: "life_mode_date_invalid" };
    }
    if (input.packStart && input.packStart > input.today) {
      return { ok: false, messageKey: "life_mode_lmp_future" };
    }
  }
  return { ok: true };
}

export type PillDayKind = "pill_active" | "pill_rest" | "withdrawal";

export function combinedPillDayKind(
  packStartDate: string,
  date: string
): PillDayKind {
  const offset = ((diffDays(packStartDate, date) % 28) + 28) % 28;
  if (offset < 21) return "pill_active";
  return offset === 21 ? "withdrawal" : "pill_rest";
}

export function expandCombinedPillDays(
  packStartDate: string,
  fromDate: string,
  toDate: string
): Array<{ date: string; kind: PillDayKind }> {
  const out: Array<{ date: string; kind: PillDayKind }> = [];
  let cur = fromDate;
  while (cur <= toDate) {
    out.push({ date: cur, kind: combinedPillDayKind(packStartDate, cur) });
    cur = addDays(cur, 1);
  }
  return out;
}

export function contraceptionReminderLabel(method: ContraceptionMethod): string {
  switch (method) {
    case "pill_daily":
    case "mini_pill":
      return "pill";
    case "patch_weekly":
      return "patch";
    case "ring_monthly":
      return "ring";
    case "injection_monthly":
      return "injection";
    case "iud_implant":
      return "iud";
  }
}
