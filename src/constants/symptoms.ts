import type { MoodId, SymptomId, CervicalMucus, SexActivity } from "../types/dailyLog";
import type { AppMode } from "../types/lifeCycle";

export const MOODS: { id: MoodId; labelKey: string }[] = [
  { id: "happy", labelKey: "mood_happy" },
  { id: "calm", labelKey: "mood_calm" },
  { id: "anxious", labelKey: "mood_anxious" },
  { id: "sad", labelKey: "mood_sad" },
  { id: "irritable", labelKey: "mood_irritable" },
  { id: "energetic", labelKey: "mood_energetic" },
  { id: "tired", labelKey: "mood_tired" },
  { id: "focused", labelKey: "mood_focused" },
];

export const SYMPTOMS: { id: SymptomId; labelKey: string }[] = [
  { id: "cramps", labelKey: "sym_cramps" },
  { id: "headache", labelKey: "sym_headache" },
  { id: "bloating", labelKey: "sym_bloating" },
  { id: "breast_tenderness", labelKey: "sym_breast" },
  { id: "acne", labelKey: "sym_acne" },
  { id: "nausea", labelKey: "sym_nausea" },
  { id: "back_pain", labelKey: "sym_back" },
  { id: "insomnia", labelKey: "sym_insomnia" },
  { id: "cravings", labelKey: "sym_cravings" },
  { id: "spotting", labelKey: "sym_spotting" },
  { id: "hot_flashes", labelKey: "sym_hot" },
  { id: "dizziness", labelKey: "sym_dizzy" },
  { id: "joint_pain", labelKey: "sym_joint" },
  { id: "constipation", labelKey: "sym_constipation" },
  { id: "diarrhea", labelKey: "sym_diarrhea" },
  { id: "vaginal_dryness", labelKey: "sym_dryness" },
  { id: "libido_high", labelKey: "sym_libido_high" },
  { id: "libido_low", labelKey: "sym_libido_low" },
  { id: "brain_fog", labelKey: "sym_fog" },
  { id: "migraine", labelKey: "sym_migraine" },
];

/** Extras claros — sin partes del cuerpo vagas (ojos, pelo, cuello…). */
export const CORE_EXTRA_SYMPTOMS = [
  "sym_fatigue",
  "sym_swelling",
  "sym_pelvic",
  "sym_appetite_up",
  "sym_appetite_down",
  "sym_thirst",
  "sym_chills",
  "sym_sweat",
  "sym_tinnitus",
  "sym_palpitations",
  "sym_shortness",
  "sym_uti",
  "sym_yeast",
  "sym_discharge",
] as const;

export const PREGNANCY_EXTRA_SYMPTOMS = ["sym_heartburn", "sym_fetal_move", "sym_braxton"] as const;

/** Claves antiguas: se conservan en logs viejos, ya no se ofrecen en UI. */
export const LEGACY_EXTRA_SYMPTOMS = [
  "sym_tender",
  "sym_leg",
  "sym_chest",
  "sym_neck",
  "sym_eye",
  "sym_skin",
  "sym_hair",
] as const;

export const EXTRA_SYMPTOM_LABELS = [
  ...CORE_EXTRA_SYMPTOMS,
  ...PREGNANCY_EXTRA_SYMPTOMS,
  ...LEGACY_EXTRA_SYMPTOMS,
] as const;

export type ExtraSymptomKey = (typeof EXTRA_SYMPTOM_LABELS)[number];

export const MUCUS_OPTIONS: { id: CervicalMucus; labelKey: string }[] = [
  { id: "dry", labelKey: "mucus_dry" },
  { id: "sticky", labelKey: "mucus_sticky" },
  { id: "creamy", labelKey: "mucus_creamy" },
  { id: "egg_white", labelKey: "mucus_egg" },
  { id: "watery", labelKey: "mucus_watery" },
];

export const SEX_OPTIONS: { id: SexActivity; labelKey: string }[] = [
  { id: "none", labelKey: "sex_none" },
  { id: "protected", labelKey: "sex_protected" },
  { id: "unprotected", labelKey: "sex_unprotected" },
];

export function visibleExtraSymptoms(mode: AppMode | undefined, postpartum = false): ExtraSymptomKey[] {
  const core = [...CORE_EXTRA_SYMPTOMS];
  if (mode === "PREGNANCY_CARE" && !postpartum) {
    return [...core, ...PREGNANCY_EXTRA_SYMPTOMS];
  }
  return core;
}
