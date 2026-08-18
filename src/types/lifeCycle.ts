/** Modos excluyentes de ciclo de vida — transforman Home, calendario y notificaciones. */

export type AppMode =
  | "MENSTRUATION_TRACKING"
  | "CONTRACEPTION_CONTROL"
  | "PREGNANCY_CARE"
  | "MENOPAUSE_SUPPORT";

export type ContraceptionMethod =
  | "pill_daily"
  | "mini_pill"
  | "patch_weekly"
  | "ring_monthly"
  | "injection_monthly"
  | "iud_implant";

export interface PregnancyConfig {
  /** Última regla (LMP) usada para la regla de Naegele */
  lastMenstrualPeriod: string;
  /** Fecha probable de parto (YYYY-MM-DD) */
  dueDate: string;
  /** Fecha real de nacimiento — activa postparto */
  babyBornAt: string | null;
  prenatalVisitNotes?: string[];
  lastKickCountAt?: string | null;
}

export interface ContraceptionConfig {
  method: ContraceptionMethod;
  /** HH:mm local para píldora diaria */
  reminderTime: string;
  /** Píldoras combinadas 21 activas + 7 de descanso */
  combinedPill: boolean;
  /** Inicio del blíster actual (píldora) o fecha de colocación */
  packStartDate: string;
  reviewDate?: string | null;
}

export interface MenopauseConfig {
  lastBleedDate: string | null;
  mrsScore?: number | null;
  lastAssessmentAt?: string | null;
}

export const DEFAULT_APP_MODE: AppMode = "MENSTRUATION_TRACKING";
