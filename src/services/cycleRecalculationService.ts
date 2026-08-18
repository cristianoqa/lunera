/**
 * Motor de recálculo flexible para ciclos irregulares.
 * Toma fechas reales confirmadas, actualiza medias móviles y proyecta el calendario.
 */

import type { CalendarDayKind, CalendarDayMarker, CalendarMonthGrid, CycleVariability } from "../types/calendar";
import type { CyclePrediction, CycleRecord } from "../types/cycle";
import type { UserProfile } from "../types/user";
import type { AppConfig } from "../types/config";
import {
  addDays,
  clampCycleLength,
  computeAverageCycleLength,
  computeAveragePeriodLength,
  diffDays,
  formatISODate,
  parseISODate,
  predictCycle,
  todayISOLocal,
} from "./cyclePredictor";
import { expandCombinedPillDays, shouldPaintPeriodOnCalendar, shouldShowFertileWindow } from "./lifeCycleService";

const LUTEAL_PHASE_DAYS = 14;
const HISTORY_WINDOW = 3;
const PROJECTED_CYCLES = 3;
const CALENDAR_MONTHS_BACK = 6;
const CALENDAR_MONTHS_FORWARD = 6;

export interface RecalcResult {
  cycles: CycleRecord[];
  prediction: CyclePrediction;
  calendarMonths: CalendarMonthGrid[];
  dayMarkers: Map<string, CalendarDayMarker>;
  variability: CycleVariability;
  profilePatch: Pick<UserProfile, "lastPeriodStart" | "averageCycleLength" | "averagePeriodLength" | "updatedAt">;
}

function sortCycles(cycles: CycleRecord[]): CycleRecord[] {
  return [...cycles].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function normalizeCycleLengths(cycles: CycleRecord[], today?: string): CycleRecord[] {
  const ref = today ?? todayISOLocal();
  const sorted = sortCycles(cycles);
  return sorted.map((c, i) => {
    const next = sorted[i + 1];
    const cycleLength =
      next && next.startDate <= ref
        ? clampCycleLength(diffDays(c.startDate, next.startDate))
        : c.cycleLength;
    const periodLength =
      c.endDate != null
        ? Math.min(10, Math.max(2, diffDays(c.startDate, c.endDate) + 1))
        : c.periodLength;
    return { ...c, cycleLength, periodLength };
  });
}

/** Cierra ciclos abiertos al salir del seguimiento menstrual (menopausia / embarazo). */
export function closeOpenCycles(cycles: CycleRecord[], today: string): CycleRecord[] {
  const yesterday = addDays(today, -1);
  return cycles.map((c) => {
    if (c.endDate) return c;
    const guessed = c.periodLength ? addDays(c.startDate, c.periodLength - 1) : c.startDate;
    let end = guessed;
    if (end >= today) {
      end = yesterday < c.startDate ? c.startDate : yesterday;
    }
    return {
      ...c,
      endDate: end,
      periodLength: Math.max(1, diffDays(c.startDate, end) + 1),
    };
  });
}

export function createCycleRecord(
  userId: string,
  startDate: string,
  endDate: string | null = null,
  source: CycleRecord["source"] = "confirmed"
): CycleRecord {
  const periodLength = endDate ? diffDays(startDate, endDate) + 1 : null;
  return {
    id: `cycle-${startDate}`,
    userId,
    startDate,
    endDate,
    cycleLength: null,
    periodLength,
    source,
    createdAt: new Date().toISOString(),
  };
}

/** Semilla inicial desde onboarding */
export function seedCyclesFromProfile(profile: UserProfile): CycleRecord[] {
  if (!profile.lastPeriodStart) return [];
  const endDate = addDays(profile.lastPeriodStart, profile.averagePeriodLength - 1);
  return normalizeCycleLengths([
    createCycleRecord(profile.id, profile.lastPeriodStart, endDate, "manual"),
  ]);
}

export function getLatestPeriodStart(cycles: CycleRecord[]): string | null {
  const sorted = sortCycles(cycles);
  return sorted.length ? sorted[sorted.length - 1].startDate : null;
}

/** Último Día 1 confirmado en el pasado o hoy — evita anclar Home a fechas futuras */
export function getLatestPeriodStartOnOrBefore(cycles: CycleRecord[], today?: string): string | null {
  const ref = today ?? todayISOLocal();
  const sorted = sortCycles(cycles).filter((c) => c.startDate <= ref);
  return sorted.length ? sorted[sorted.length - 1].startDate : null;
}

export function validatePeriodStartDate(
  date: string,
  today?: string
): { ok: true } | { ok: false; reason: "future" } {
  const ref = today ?? todayISOLocal();
  if (date > ref) return { ok: false, reason: "future" };
  return { ok: true };
}

export function isPeriodStart(cycles: CycleRecord[], date: string): boolean {
  return cycles.some((c) => c.startDate === date);
}

export function isPeriodEnd(cycles: CycleRecord[], date: string): boolean {
  return cycles.some((c) => c.endDate === date);
}

export function findCycleContainingDate(cycles: CycleRecord[], date: string): CycleRecord | null {
  const sorted = sortCycles(cycles);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const c = sorted[i];
    if (date < c.startDate) continue;
    const nextStart = sorted[i + 1]?.startDate;
    if (nextStart && date >= nextStart) continue;
    return c;
  }
  return null;
}

export function isDateInPeriod(cycles: CycleRecord[], date: string): boolean {
  const cycle = findCycleContainingDate(cycles, date);
  if (!cycle) return false;
  const end = cycle.endDate ?? addDays(cycle.startDate, (cycle.periodLength ?? 5) - 1);
  return date >= cycle.startDate && date <= end;
}

/** Caso C: nuevo Día 1 rompe predicción anterior */
export function togglePeriodStart(cycles: CycleRecord[], userId: string, date: string): CycleRecord[] {
  if (isPeriodStart(cycles, date)) {
    return normalizeCycleLengths(cycles.filter((c) => c.startDate !== date));
  }

  const withoutOverlap = cycles.filter((c) => {
    if (c.startDate === date) return false;
    const end = c.endDate ?? addDays(c.startDate, (c.periodLength ?? 5) - 1);
    return !(date >= c.startDate && date <= end);
  });

  const next = [
    ...withoutOverlap.filter((c) => c.startDate !== date),
    createCycleRecord(userId, date, null, "confirmed"),
  ];
  return normalizeCycleLengths(next);
}

/** Casos A/B: acortar o alargar sangrado real */
export function togglePeriodEnd(cycles: CycleRecord[], date: string): CycleRecord[] {
  const cycle = findCycleContainingDate(cycles, date);
  if (!cycle) return cycles;

  const next = cycles.map((c) => {
    if (c.id !== cycle.id) return c;
    if (c.endDate === date) {
      return { ...c, endDate: null, periodLength: null, source: "confirmed" as const };
    }
    if (date < c.startDate) return c;
    return {
      ...c,
      endDate: date,
      periodLength: diffDays(c.startDate, date) + 1,
      source: "confirmed" as const,
    };
  });

  return normalizeCycleLengths(next);
}

export function computeVariability(cycles: CycleRecord[]): CycleVariability {
  const lengths = sortCycles(cycles)
    .map((c) => c.cycleLength)
    .filter((n): n is number => typeof n === "number" && n >= 21 && n <= 45)
    .slice(-HISTORY_WINDOW);

  if (lengths.length < 2) {
    return { minDays: null, maxDays: null, sampleCount: lengths.length, messageKey: "calendar_variability_none" };
  }

  return {
    minDays: Math.min(...lengths),
    maxDays: Math.max(...lengths),
    sampleCount: lengths.length,
    messageKey: "calendar_variability_range",
  };
}

function expandPeriodDays(start: string, end: string): string[] {
  const days: string[] = [];
  let cur = start;
  while (cur <= end) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

function projectFuturePeriods(
  anchorStart: string,
  avgCycle: number,
  avgPeriod: number,
  count: number
): Array<{ start: string; end: string }> {
  const out: Array<{ start: string; end: string }> = [];
  let start = anchorStart;
  for (let i = 0; i < count; i++) {
    start = addDays(start, avgCycle);
    out.push({ start, end: addDays(start, avgPeriod - 1) });
  }
  return out;
}

function monthStart(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1));
}

function buildMonthGrid(year: number, month: number, markers: Map<string, CalendarDayMarker>): CalendarMonthGrid {
  const first = monthStart(year, month);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // Lunes = columna 0 (ISO / convención ES-EU)
  const offset = (first.getUTCDay() + 6) % 7;
  const cells: (CalendarDayMarker | null)[] = [];

  for (let i = 0; i < offset; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = formatISODate(new Date(Date.UTC(year, month - 1, day)));
    cells.push(markers.get(iso) ?? { date: iso, kinds: [] });
  }

  return { year, month, days: cells };
}

export function buildCalendarMonths(
  today: string,
  markers: Map<string, CalendarDayMarker>
): CalendarMonthGrid[] {
  const base = parseISODate(today);
  const months: CalendarMonthGrid[] = [];

  for (let offset = -CALENDAR_MONTHS_BACK; offset <= CALENDAR_MONTHS_FORWARD; offset++) {
    const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + offset, 1));
    months.push(buildMonthGrid(d.getUTCFullYear(), d.getUTCMonth() + 1, markers));
  }

  return months;
}

export function buildDayMarkers(input: {
  cycles: CycleRecord[];
  prediction: CyclePrediction;
  today?: string;
  config?: AppConfig | null;
}): Map<string, CalendarDayMarker> {
  const today = input.today ?? todayISOLocal();
  const map = new Map<string, CalendarDayMarker>();
  const predictPeriods = shouldPaintPeriodOnCalendar(input.config);
  const showFertile = shouldShowFertileWindow(input.config);

  const touch = (date: string, kind: CalendarDayKind, extra?: Partial<CalendarDayMarker>) => {
    const prev = map.get(date) ?? { date, kinds: [] };
    const kinds = prev.kinds.includes(kind) ? prev.kinds : [...prev.kinds, kind];
    map.set(date, { ...prev, ...extra, kinds });
  };

  if (predictPeriods) {
    for (const cycle of sortCycles(input.cycles)) {
      touch(cycle.startDate, "period_confirmed", { isPeriodStart: true });
      const end =
        cycle.endDate ?? addDays(cycle.startDate, (cycle.periodLength ?? input.prediction.averagePeriodLength) - 1);
      touch(end, "period_confirmed", { isPeriodEnd: true });
      for (const d of expandPeriodDays(cycle.startDate, end)) {
        touch(d, "period_confirmed");
      }
    }
  }

  const markFertileWindow = (cycleStart: string, cycleLength: number) => {
    if (!showFertile) return;
    const { ovulationDate, fertileWindowStart, fertileWindowEnd } = fertileWindowForCycleStart(
      cycleStart,
      cycleLength,
      input.prediction.averagePeriodLength
    );
    let d = fertileWindowStart;
    while (d <= fertileWindowEnd) {
      touch(d, d === ovulationDate ? "ovulation" : "fertile");
      d = addDays(d, 1);
    }
  };

  const lastStart =
    getLatestPeriodStartOnOrBefore(input.cycles, today) ?? input.prediction.phases[0]?.startDate;
  if (lastStart) {
    markFertileWindow(lastStart, input.prediction.averageCycleLength);

    if (predictPeriods) {
      const projected = projectFuturePeriods(
        lastStart,
        input.prediction.averageCycleLength,
        input.prediction.averagePeriodLength,
        PROJECTED_CYCLES
      );
      for (const p of projected) {
        if (p.end < today) continue;
        touch(p.start, "period_predicted", { isPeriodStart: true });
        touch(p.end, "period_predicted", { isPeriodEnd: true });
        for (const d of expandPeriodDays(p.start, p.end)) {
          if (d >= today) touch(d, "period_predicted");
        }
        if (p.start >= today) {
          markFertileWindow(p.start, input.prediction.averageCycleLength);
        }
      }
    }
  } else if (showFertile) {
    const fertileStart = input.prediction.fertileWindowStart;
    const fertileEnd = input.prediction.fertileWindowEnd;
    let cur = fertileStart;
    while (cur <= fertileEnd) {
      touch(cur, cur === input.prediction.ovulationDate ? "ovulation" : "fertile");
      cur = addDays(cur, 1);
    }
  }

  const pack = input.config?.contraception;
  if (input.config?.appMode === "CONTRACEPTION_CONTROL" && pack?.combinedPill && pack.packStartDate) {
    const from = addDays(today, -90);
    const to = addDays(today, 120);
    for (const { date, kind } of expandCombinedPillDays(pack.packStartDate, from, to)) {
      touch(date, kind);
    }
  }

  touch(today, "today");
  return map;
}

/**
 * Recalcula fases, proyección de 3 meses, calendario continuo y métricas de irregularidad.
 */
export function recalcularFasesDelCiclo(input: {
  cycles: CycleRecord[];
  profile: UserProfile;
  today?: string;
  config?: AppConfig | null;
}): RecalcResult {
  const today = input.today ?? todayISOLocal();
  const normalized = normalizeCycleLengths(input.cycles, today);
  const confirmed = sortCycles(normalized).filter((c) => c.startDate <= today);
  const recent = confirmed.slice(-HISTORY_WINDOW);

  const averageCycleLength = computeAverageCycleLength(recent.length ? recent : confirmed.length ? confirmed : normalized);
  const fromHistory = computeAveragePeriodLength(recent.length ? recent : confirmed.length ? confirmed : normalized);
  const latestConfirmed = confirmed.length ? confirmed[confirmed.length - 1] : null;
  // Prioriza la duración del ciclo más reciente (lo que la usuaria acaba de marcar) para proyectar a futuro
  const averagePeriodLength =
    latestConfirmed?.periodLength ??
    fromHistory ??
    input.profile.averagePeriodLength ??
    5;
  const anchorStart =
    getLatestPeriodStartOnOrBefore(normalized, today) ??
    (input.profile.lastPeriodStart && input.profile.lastPeriodStart <= today
      ? input.profile.lastPeriodStart
      : null);

  if (!anchorStart) {
    throw new Error("missing_last_period_start");
  }
  const lastPeriodStart = anchorStart;

  const prediction = predictCycle({
    lastPeriodStart,
    today,
    history: normalized,
    averageCycleLength,
    averagePeriodLength,
  });

  const dayMarkers = buildDayMarkers({ cycles: normalized, prediction, today, config: input.config });
  const calendarMonths = buildCalendarMonths(today, dayMarkers);
  const variability = computeVariability(normalized);

  return {
    cycles: normalized,
    prediction,
    calendarMonths,
    dayMarkers,
    variability,
    profilePatch: {
      lastPeriodStart,
      averageCycleLength,
      averagePeriodLength,
      updatedAt: new Date().toISOString(),
    },
  };
}

/** Utilidad para ventanas fértiles proyectadas en ciclos futuros */
export function fertileWindowForCycleStart(cycleStart: string, cycleLength: number, periodLength: number) {
  const ovulationDate = addDays(cycleStart, cycleLength - LUTEAL_PHASE_DAYS);
  return {
    ovulationDate,
    fertileWindowStart: addDays(ovulationDate, -5),
    fertileWindowEnd: addDays(ovulationDate, 1),
  };
}
