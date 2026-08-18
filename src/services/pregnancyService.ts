/**
 * Gestación: regla de Naegele, semana actual y textos semanales (ES).
 */

import { diffDays, parseISODate, formatISODate } from "./cyclePredictor";
import type { PregnancyWeekCopy } from "../content/pregnancyWeeks";
import { getPregnancyWeekCopy } from "../content/pregnancyWeeks";

/**
 * Regla de Naegele: FPP = LMP + 7 días − 3 meses + 1 año.
 */
export function naegeleDueDate(lastMenstrualPeriod: string): string {
  const d = parseISODate(lastMenstrualPeriod);
  d.setUTCDate(d.getUTCDate() + 7);
  d.setUTCMonth(d.getUTCMonth() - 3);
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  return formatISODate(d);
}

/** Semana de gestación 1–42 a partir de la LMP (día 0 = inicio de semana 1). */
export function pregnancyWeek(lastMenstrualPeriod: string, today: string): number {
  const days = diffDays(lastMenstrualPeriod, today);
  if (days < 0) return 1;
  return Math.min(42, Math.floor(days / 7) + 1);
}

export function daysUntilDue(dueDate: string, today: string): number {
  return Math.max(0, diffDays(today, dueDate));
}

export function pregnancyProgress(lastMenstrualPeriod: string, today: string): {
  week: number;
  totalWeeks: number;
  copy: PregnancyWeekCopy;
} {
  const week = pregnancyWeek(lastMenstrualPeriod, today);
  return { week, totalWeeks: 40, copy: getPregnancyWeekCopy(week) };
}

export function isPostpartum(babyBornAt: string | null | undefined): boolean {
  return Boolean(babyBornAt);
}

export function shouldTrackFetalMovement(week: number): boolean {
  return week >= 28;
}

export function pregnancyMilestoneHint(week: number): string {
  if (week >= 37) return "Embarazo a término: prepara señales de parto y tu plan de apoyo.";
  if (week >= 28) return "Cuenta movimientos del bebé si notas cambios y registra cualquier preocupación.";
  if (week >= 20) return "Ya puedes empezar a notar movimientos y cambios más claros en tu energía.";
  if (week >= 12) return "Segundo trimestre en marcha: revisa tus próximas citas y analíticas.";
  return "Prioriza descanso, hidratación y control prenatal temprano.";
}
