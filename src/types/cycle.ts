/** Ciclo menstrual y predicción de fases */

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface CycleRecord {
  id: string;
  userId: string;
  /** Primer día de sangrado */
  startDate: string;
  /** Último día de sangrado (inclusive) */
  endDate: string | null;
  cycleLength: number | null;
  periodLength: number | null;
  source: "manual" | "predicted" | "confirmed";
  createdAt: string;
}

export interface PhaseWindow {
  phase: CyclePhase;
  startDay: number;
  endDay: number;
  startDate: string;
  endDate: string;
}

export interface CyclePrediction {
  /** Media móvil de duración de ciclo */
  averageCycleLength: number;
  averagePeriodLength: number;
  /** Día actual del ciclo (1-indexed) */
  currentCycleDay: number;
  currentPhase: CyclePhase;
  /** ISO dates */
  predictedNextPeriodStart: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  ovulationDate: string;
  daysUntilPeriod: number;
  confidence: "low" | "medium" | "high";
  phases: PhaseWindow[];
}

export interface CycleRow {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  cycle_length: number | null;
  period_length: number | null;
  source: string;
  created_at: string;
}
