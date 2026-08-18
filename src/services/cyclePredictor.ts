/**
 * Motor predictivo del ciclo menstrual.
 * Ajusta medias según histórico real; calcula 4 fases y ventana fértil.
 */

import type { CyclePhase, CyclePrediction, CycleRecord, PhaseWindow } from "../types/cycle";

const DEFAULT_CYCLE = 28;
const DEFAULT_PERIOD = 5;
const MIN_CYCLE = 21;
const MAX_CYCLE = 45;
const LUTEAL_PHASE_DAYS = 14;

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Fecha civil local YYYY-MM-DD (evita el desfase UTC que resta un día por la noche en ES). */
export function todayISOLocal(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return formatISODate(d);
}

export function diffDays(fromIso: string, toIso: string): number {
  const a = parseISODate(fromIso).getTime();
  const b = parseISODate(toIso).getTime();
  return Math.round((b - a) / 86400000);
}

export function clampCycleLength(n: number): number {
  return Math.min(MAX_CYCLE, Math.max(MIN_CYCLE, Math.round(n)));
}

/** Media móvil ponderada: ciclos recientes pesan más */
export function computeAverageCycleLength(cycles: CycleRecord[]): number {
  const lengths = cycles
    .map((c) => c.cycleLength)
    .filter((n): n is number => typeof n === "number" && n >= MIN_CYCLE && n <= MAX_CYCLE);

  if (lengths.length === 0) return DEFAULT_CYCLE;
  if (lengths.length === 1) return clampCycleLength(lengths[0]);

  let weighted = 0;
  let totalWeight = 0;
  lengths.slice(-6).forEach((len, idx, arr) => {
    const w = idx + 1;
    weighted += len * w;
    totalWeight += w;
  });
  return clampCycleLength(weighted / totalWeight);
}

export function computeAveragePeriodLength(cycles: CycleRecord[]): number {
  const lengths = cycles
    .map((c) => c.periodLength)
    .filter((n): n is number => typeof n === "number" && n >= 2 && n <= 10);

  if (lengths.length === 0) return DEFAULT_PERIOD;
  const sum = lengths.slice(-6).reduce((a, b) => a + b, 0);
  return Math.round(sum / Math.min(6, lengths.length));
}

export function resolvePhaseForDay(cycleDay: number, periodLength: number, cycleLength: number): CyclePhase {
  if (cycleDay <= periodLength) return "menstrual";
  const ovulationDay = Math.max(periodLength + 1, cycleLength - LUTEAL_PHASE_DAYS);
  if (cycleDay < ovulationDay - 1) return "follicular";
  if (cycleDay <= ovulationDay + 1) return "ovulation";
  return "luteal";
}

export function buildPhaseWindows(
  cycleStart: string,
  periodLength: number,
  cycleLength: number
): PhaseWindow[] {
  const ovulationDay = Math.max(periodLength + 1, cycleLength - LUTEAL_PHASE_DAYS);

  const windows: Array<{ phase: CyclePhase; startDay: number; endDay: number }> = [
    { phase: "menstrual", startDay: 1, endDay: periodLength },
    { phase: "follicular", startDay: periodLength + 1, endDay: ovulationDay - 2 },
    { phase: "ovulation", startDay: ovulationDay - 1, endDay: ovulationDay + 1 },
    { phase: "luteal", startDay: ovulationDay + 2, endDay: cycleLength },
  ];

  return windows.map((w) => ({
    ...w,
    startDate: addDays(cycleStart, w.startDay - 1),
    endDate: addDays(cycleStart, w.endDay - 1),
  }));
}

export interface PredictInput {
  lastPeriodStart: string;
  today?: string;
  history: CycleRecord[];
  averageCycleLength?: number;
  averagePeriodLength?: number;
}

export function predictCycle(input: PredictInput): CyclePrediction {
  const today = input.today ?? todayISOLocal();
  const avgCycle = clampCycleLength(input.averageCycleLength ?? computeAverageCycleLength(input.history));
  const avgPeriod = input.averagePeriodLength ?? computeAveragePeriodLength(input.history);

  // Ancla al último inicio REAL confirmado — no avanza ciclos teóricos (soporta retrasos/adelantos).
  const currentCycleStart = input.lastPeriodStart;
  const currentCycleDay = Math.max(1, diffDays(currentCycleStart, today) + 1);

  const currentPhase = resolvePhaseForDay(currentCycleDay, avgPeriod, avgCycle);
  const phases = buildPhaseWindows(currentCycleStart, avgPeriod, avgCycle);

  const predictedNextPeriodStart = addDays(currentCycleStart, avgCycle);
  const daysUntilPeriod = Math.max(0, diffDays(today, predictedNextPeriodStart));
  const ovulationDate = addDays(currentCycleStart, avgCycle - LUTEAL_PHASE_DAYS);
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);

  const historyCount = input.history.filter((c) => c.cycleLength).length;
  const confidence: CyclePrediction["confidence"] =
    historyCount >= 6 ? "high" : historyCount >= 3 ? "medium" : "low";

  return {
    averageCycleLength: avgCycle,
    averagePeriodLength: avgPeriod,
    currentCycleDay,
    currentPhase,
    predictedNextPeriodStart,
    fertileWindowStart,
    fertileWindowEnd,
    ovulationDate,
    daysUntilPeriod,
    confidence,
    phases,
  };
}

/**
 * V2.0 — Esqueleto para conectar un modelo de IA (p. ej. detección de SOP).
 * Sustituirá o complementará el promedio móvil cuando exista endpoint seguro.
 */
export async function consultarModeloPredictivoIA(
  historialUsuaria: CycleRecord[]
): Promise<CyclePrediction | null> {
  // TODO v2: POST /predict con historial anonimizado + consentimiento explícito.
  // Ejemplo de payload: { cycleLengths, periodLengths, symptomFlags, ageBand }
  // Respuesta esperada: { predictedNextPeriodStart, anomalyHints: ['long_cycle'] }
  void historialUsuaria;
  return null;
}

/** Deriva CycleRecord[] a partir de fechas de inicio de regla */
export function deriveCyclesFromPeriodStarts(
  userId: string,
  starts: string[],
  periodLengths?: Record<string, number>
): CycleRecord[] {
  const sorted = [...starts].sort();
  return sorted.map((startDate, i) => {
    const next = sorted[i + 1];
    const cycleLength = next ? diffDays(startDate, next) : null;
    const pl = periodLengths?.[startDate];
    const endDate = pl ? addDays(startDate, pl - 1) : null;
    return {
      id: `cycle-${startDate}`,
      userId,
      startDate,
      endDate,
      cycleLength: cycleLength ? clampCycleLength(cycleLength) : null,
      periodLength: pl ?? null,
      source: "manual" as const,
      createdAt: new Date().toISOString(),
    };
  });
}
