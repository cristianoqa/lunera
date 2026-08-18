/** Paleta compartida Log ↔ Home (píldoras) */
export const LogSectionColors = {
  bleeding: { accent: "#C45B7A", soft: "rgba(196, 91, 122, 0.12)", labelKey: "log_bleeding" },
  pain: { accent: "#C75B5B", soft: "rgba(199, 91, 91, 0.12)", labelKey: "log_pain" },
  moods: { accent: "#6B9E78", soft: "rgba(107, 158, 120, 0.12)", labelKey: "log_moods" },
  symptoms: { accent: "#8B7BA8", soft: "rgba(139, 123, 168, 0.12)", labelKey: "log_symptoms" },
  lifestyle: { accent: "#B8956B", soft: "rgba(184, 149, 107, 0.14)", labelKey: "log_sleep" },
} as const;

export type LogSectionId = keyof typeof LogSectionColors;

const MOOD_IDS = new Set([
  "happy",
  "calm",
  "anxious",
  "sad",
  "irritable",
  "energetic",
  "tired",
  "focused",
]);

/** Misma sección visual que en Registro — no un color suelto por síntoma. */
export function logSectionForItemId(id: string): LogSectionId {
  if (id === "bleeding") return "bleeding";
  if (id === "pain") return "pain";
  if (MOOD_IDS.has(id)) return "moods";
  if (id === "sleep" || id === "water" || id === "stress" || id === "exercise" || id.startsWith("habit")) {
    return "lifestyle";
  }
  return "symptoms";
}

export function colorsForLogItem(id: string): { color: string; bg: string } {
  const section = LogSectionColors[logSectionForItemId(id)];
  return { color: section.accent, bg: section.soft };
}

/** Etiquetas por id; el color de píldora sale de colorsForLogItem (sección del Registro). */
export const SymptomColorMap: Record<string, { color: string; bg: string; labelKey?: string }> = {
  bleeding: { color: LogSectionColors.bleeding.accent, bg: LogSectionColors.bleeding.soft, labelKey: "pill_bleeding" },
  pain: { color: LogSectionColors.pain.accent, bg: LogSectionColors.pain.soft, labelKey: "pill_pain" },
  cramps: { color: "#C75B5B", bg: "rgba(199, 91, 91, 0.12)", labelKey: "sym_cramps" },
  headache: { color: "#8B7BA8", bg: "rgba(139, 123, 168, 0.12)", labelKey: "sym_headache" },
  bloating: { color: "#A591B8", bg: "rgba(165, 145, 175, 0.15)", labelKey: "sym_bloating" },
  breast_tenderness: { color: "#C45B7A", bg: "rgba(196, 91, 122, 0.12)", labelKey: "sym_breast" },
  acne: { color: "#9A7B4F", bg: "rgba(154, 123, 79, 0.12)", labelKey: "sym_acne" },
  nausea: { color: "#5B9A8B", bg: "rgba(91, 154, 139, 0.12)", labelKey: "sym_nausea" },
  back_pain: { color: "#C75B5B", bg: "rgba(199, 91, 91, 0.12)", labelKey: "sym_back" },
  insomnia: { color: "#4A3F6B", bg: "rgba(74, 63, 107, 0.12)", labelKey: "sym_insomnia" },
  cravings: { color: "#C49A3C", bg: "rgba(196, 154, 60, 0.12)", labelKey: "sym_cravings" },
  spotting: { color: "#E879A9", bg: "rgba(232, 121, 169, 0.12)", labelKey: "sym_spotting" },
  hot_flashes: { color: "#E85D4C", bg: "rgba(232, 93, 76, 0.12)", labelKey: "sym_hot" },
  dizziness: { color: "#8B7BA8", bg: "rgba(139, 123, 168, 0.12)", labelKey: "sym_dizzy" },
  joint_pain: { color: "#9A7B4F", bg: "rgba(154, 123, 79, 0.12)", labelKey: "sym_joint" },
  constipation: { color: "#A591B8", bg: "rgba(165, 145, 175, 0.15)", labelKey: "sym_constipation" },
  diarrhea: { color: "#5B9A8B", bg: "rgba(91, 154, 139, 0.12)", labelKey: "sym_diarrhea" },
  vaginal_dryness: { color: "#B8956B", bg: "rgba(184, 149, 107, 0.14)", labelKey: "sym_dryness" },
  libido_high: { color: "#E879A9", bg: "rgba(232, 121, 169, 0.12)", labelKey: "sym_libido_high" },
  libido_low: { color: "#8B7BA8", bg: "rgba(139, 123, 168, 0.12)", labelKey: "sym_libido_low" },
  brain_fog: { color: "#4A3F6B", bg: "rgba(74, 63, 107, 0.12)", labelKey: "sym_fog" },
  migraine: { color: "#C75B5B", bg: "rgba(199, 91, 91, 0.14)", labelKey: "sym_migraine" },
  happy: { color: "#6B9E78", bg: "rgba(107, 158, 120, 0.12)", labelKey: "mood_happy" },
  calm: { color: "#5B9A8B", bg: "rgba(91, 154, 139, 0.12)", labelKey: "mood_calm" },
  anxious: { color: "#C49A3C", bg: "rgba(196, 154, 60, 0.12)", labelKey: "mood_anxious" },
  sad: { color: "#8B7BA8", bg: "rgba(139, 123, 168, 0.12)", labelKey: "mood_sad" },
  irritable: { color: "#E85D4C", bg: "rgba(232, 93, 76, 0.12)", labelKey: "mood_irritable" },
  energetic: { color: "#6B9E78", bg: "rgba(107, 158, 120, 0.14)", labelKey: "mood_energetic" },
  tired: { color: "#9A7B4F", bg: "rgba(154, 123, 79, 0.12)", labelKey: "mood_tired" },
  focused: { color: "#4A3F6B", bg: "rgba(74, 63, 107, 0.12)", labelKey: "mood_focused" },
  sym_fatigue: { color: "#C49A3C", bg: "rgba(196, 154, 60, 0.12)", labelKey: "sym_fatigue" },
  sym_tender: { color: "#C45B7A", bg: "rgba(196, 91, 122, 0.12)", labelKey: "sym_tender" },
  sym_swelling: { color: "#A591B8", bg: "rgba(165, 145, 175, 0.15)", labelKey: "sym_swelling" },
  sym_pelvic: { color: "#C75B5B", bg: "rgba(199, 91, 91, 0.12)", labelKey: "sym_pelvic" },
  sym_leg: { color: "#9A7B4F", bg: "rgba(154, 123, 79, 0.12)", labelKey: "sym_leg" },
  sym_chest: { color: "#C45B7A", bg: "rgba(196, 91, 122, 0.12)", labelKey: "sym_chest" },
  sym_neck: { color: "#8B7BA8", bg: "rgba(139, 123, 168, 0.12)", labelKey: "sym_neck" },
  sym_eye: { color: "#5B9A8B", bg: "rgba(91, 154, 139, 0.12)", labelKey: "sym_eye" },
  sym_skin: { color: "#B8956B", bg: "rgba(184, 149, 107, 0.14)", labelKey: "sym_skin" },
  sym_hair: { color: "#9A7B4F", bg: "rgba(154, 123, 79, 0.12)", labelKey: "sym_hair" },
  sym_appetite_up: { color: "#C49A3C", bg: "rgba(196, 154, 60, 0.12)", labelKey: "sym_appetite_up" },
  sym_appetite_down: { color: "#8B7BA8", bg: "rgba(139, 123, 168, 0.12)", labelKey: "sym_appetite_down" },
  sym_thirst: { color: "#5B9A8B", bg: "rgba(91, 154, 139, 0.12)", labelKey: "sym_thirst" },
  sym_chills: { color: "#4A3F6B", bg: "rgba(74, 63, 107, 0.12)", labelKey: "sym_chills" },
  sym_sweat: { color: "#E85D4C", bg: "rgba(232, 93, 76, 0.12)", labelKey: "sym_sweat" },
  sym_tinnitus: { color: "#8B7BA8", bg: "rgba(139, 123, 168, 0.12)", labelKey: "sym_tinnitus" },
  sym_palpitations: { color: "#C75B5B", bg: "rgba(199, 91, 91, 0.12)", labelKey: "sym_palpitations" },
  sym_shortness: { color: "#4A3F6B", bg: "rgba(74, 63, 107, 0.12)", labelKey: "sym_shortness" },
  sym_uti: { color: "#C45B7A", bg: "rgba(196, 91, 122, 0.12)", labelKey: "sym_uti" },
  sym_yeast: { color: "#A591B8", bg: "rgba(165, 145, 175, 0.15)", labelKey: "sym_yeast" },
  sym_discharge: { color: "#B8956B", bg: "rgba(184, 149, 107, 0.14)", labelKey: "sym_discharge" },
  sym_heartburn: { color: "#C49A3C", bg: "rgba(196, 154, 60, 0.12)", labelKey: "sym_heartburn" },
  sym_fetal_move: { color: "#E879A9", bg: "rgba(232, 121, 169, 0.12)", labelKey: "sym_fetal_move" },
  sym_braxton: { color: "#8B7BA8", bg: "rgba(139, 123, 168, 0.12)", labelKey: "sym_braxton" },
};
