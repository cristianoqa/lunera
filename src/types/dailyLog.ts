/** Registro diario — >40 síntomas modelados por categoría */

export type BleedingLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type BleedingType = "none" | "period" | "spotting" | "withdrawal" | "pregnancy" | "postpartum" | "other";
export type FlowProduct = "pad" | "tampon" | "cup" | "disc" | "period_underwear";
export type MenopauseSymptomId = "hot_flashes" | "night_sweats" | "sleep_change" | "mood_change" | "vaginal_dryness" | "brain_fog";
export type PregnancyAlertSymptomId =
  | "bleeding"
  | "severe_pain"
  | "fluid_loss"
  | "headache"
  | "reduced_fetal_movement";

export type MoodId =
  | "happy"
  | "calm"
  | "anxious"
  | "sad"
  | "irritable"
  | "energetic"
  | "tired"
  | "focused";

export type SymptomId =
  | "cramps"
  | "headache"
  | "bloating"
  | "breast_tenderness"
  | "acne"
  | "nausea"
  | "back_pain"
  | "insomnia"
  | "cravings"
  | "spotting"
  | "hot_flashes"
  | "dizziness"
  | "joint_pain"
  | "constipation"
  | "diarrhea"
  | "vaginal_dryness"
  | "libido_high"
  | "libido_low"
  | "brain_fog"
  | "migraine";

export type CervicalMucus = "dry" | "sticky" | "creamy" | "egg_white" | "watery";
export type SexActivity = "none" | "protected" | "unprotected";

export interface LifestyleSnapshot {
  sleepHours: number | null;
  exerciseMinutes: number | null;
  waterGlasses: number | null;
  stressLevel: PainLevel;
}

export interface BleedingObservation {
  type: BleedingType;
  flowLevel: BleedingLevel;
  hasClots: boolean;
  padOrTamponCount: number | null;
  notes: string;
}

export interface MenopauseDailySymptoms {
  hotFlashes: PainLevel;
  nightSweats: PainLevel;
  sleepChanges: PainLevel;
  moodChanges: PainLevel;
  vaginalDryness: PainLevel;
  brainFog: PainLevel;
}

export interface FetalMovementSession {
  durationMinutes: number;
  movementCount: number;
  concern: boolean;
}

export interface BloodPressureReading {
  systolic: number | null;
  diastolic: number | null;
}

export interface DailyLog {
  id: string;
  userId: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  cycleDay: number | null;
  phase: import("./cycle").CyclePhase | null;
  bleeding: BleedingLevel;
  bleedingDetails?: BleedingObservation;
  pain: PainLevel;
  moods: MoodId[];
  symptoms: SymptomId[];
  lifestyle: LifestyleSnapshot;
  notes: string;
  extraSymptoms?: import("../constants/symptoms").ExtraSymptomKey[];
  cervicalMucus?: CervicalMucus | null;
  sex?: SexActivity | null;
  /** Solo relevante con píldora diaria */
  pillTaken?: boolean | null;
  menopauseSymptoms?: MenopauseDailySymptoms | null;
  fetalMovement?: FetalMovementSession | null;
  bloodPressure?: BloodPressureReading | null;
  pregnancyAlertSymptoms?: PregnancyAlertSymptomId[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyLogRow {
  id: string;
  user_id: string;
  date: string;
  payload_json: string;
  created_at: string;
  updated_at: string;
}
