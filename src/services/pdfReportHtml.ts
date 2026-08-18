import type { DailyLog } from "../types/dailyLog";
import type { UserProfile } from "../types/user";
import type { CyclePrediction } from "../types/cycle";
import type { ClinicalAlert } from "../types/clinical";
import i18n from "../i18n";
import { EXTRA_SYMPTOM_LABELS, MOODS, SYMPTOMS } from "../constants/symptoms";

const PHASE_KEYS: Record<string, string> = {
  menstrual: "phase_menstrual",
  follicular: "phase_follicular",
  ovulation: "phase_ovulation",
  luteal: "phase_luteal",
};

const SYMPTOM_LABEL_KEYS: Record<string, string> = Object.fromEntries([
  ...SYMPTOMS.map((s) => [s.id, s.labelKey] as const),
  ...MOODS.map((m) => [m.id, m.labelKey] as const),
  ...EXTRA_SYMPTOM_LABELS.map((k) => [k, k] as const),
]);

function t(key: string, lng: string, opts?: Record<string, unknown>): string {
  return i18n.t(key, { lng, ...(opts ?? {}) });
}

function localizePhase(phase: string | null | undefined, lng: string): string {
  if (!phase) return "—";
  const key = PHASE_KEYS[phase];
  return key ? t(key, lng) : phase;
}

function localizeSymptomId(id: string, lng: string): string {
  const key =
    SYMPTOM_LABEL_KEYS[id] ??
    (id.startsWith("sym_") || id.startsWith("mood_") ? id : `sym_${id}`);
  const translated = t(key, lng);
  if (translated !== key) return translated;
  return id.replace(/^sym_/, "").replace(/_/g, " ");
}

function localizeSymptoms(symptoms: string[], lng: string): string {
  if (!symptoms.length) return "—";
  return symptoms.map((s) => localizeSymptomId(s, lng)).join(", ");
}

function describeBleeding(log: DailyLog, lng: string): string {
  if (!log.bleedingDetails) return String(log.bleeding);
  const type = t(`bleeding_type_${log.bleedingDetails.type}`, lng);
  const products =
    typeof log.bleedingDetails.padOrTamponCount === "number" ? ` · ${log.bleedingDetails.padOrTamponCount}` : "";
  const clots = log.bleedingDetails.hasClots ? ` · ${t("log_bleeding_clots", lng)}` : "";
  return `${type} (${log.bleedingDetails.flowLevel}/5)${products}${clots}`;
}

export function buildMedicalReportHtml(input: {
  profile: UserProfile;
  prediction: CyclePrediction | null;
  logs: DailyLog[];
  locale?: string;
  clinicalAlerts?: ClinicalAlert[];
}): string {
  const lng = (input.locale ?? i18n.language ?? "es").slice(0, 2);
  const avg =
    input.prediction?.averageCycleLength ?? input.profile.averageCycleLength;
  const phase = localizePhase(input.prediction?.currentPhase, lng);
  const generated = new Date().toLocaleString(lng === "en" ? "en-US" : lng === "pt" ? "pt-BR" : "es-ES");

  const rows = input.logs
    .slice(0, 90)
    .map((l) => {
      const extras: string[] = [];
      if (l.cervicalMucus) extras.push(t(`mucus_${l.cervicalMucus === "egg_white" ? "egg" : l.cervicalMucus}`, lng));
      if (l.sex && l.sex !== "none") extras.push(t(l.sex === "protected" ? "sex_protected" : "sex_unprotected", lng));
      if (l.pillTaken === true) extras.push(t("log_pill_taken", lng));
      const allSymptoms = [...(l.symptoms ?? []), ...(l.extraSymptoms ?? []), ...extras];
      return `<tr><td>${l.date}</td><td>${localizePhase(l.phase, lng)}</td><td>${describeBleeding(l, lng)}</td><td>${l.pain}</td><td>${localizeSymptoms(allSymptoms, lng)}</td><td>${(l.notes || "—").replace(/</g, "&lt;")}</td></tr>`;
    })
    .join("");

  const alerts = (input.clinicalAlerts ?? [])
    .map((alert) => `<li><strong>${t(alert.titleKey, lng)}</strong>: ${t(alert.bodyKey, lng)}</li>`)
    .join("");

  return `<!DOCTYPE html><html lang="${lng}"><head><meta charset="utf-8"/><style>
    body{font-family:sans-serif;padding:24px;color:#2A2238}
    h1{color:#4A3F6B} table{width:100%;border-collapse:collapse;margin-top:16px}
    th,td{border:1px solid #ddd;padding:8px;font-size:12px} th{background:#F5F0F8}
    .note{margin-top:10px;font-size:12px;color:#8B8399;font-style:italic}
  </style></head><body>
    <h1>${t("pdf_title", lng)}</h1>
    <p>${t("pdf_generated", lng)}: ${generated}</p>
    <p>${t("pdf_avg_cycle", lng)}: ${avg} ${t("home_days", lng)}</p>
    <p>${t("pdf_current_phase", lng)}: ${phase}</p>
    ${alerts ? `<h2>${t("home_alerts_title", lng)}</h2><ul>${alerts}</ul>` : ""}
    <table><thead><tr>
      <th>${t("pdf_col_date", lng)}</th>
      <th>${t("pdf_col_phase", lng)}</th>
      <th>${t("pdf_col_bleeding", lng)}</th>
      <th>${t("pdf_col_pain", lng)}</th>
      <th>${t("pdf_col_symptoms", lng)}</th>
      <th>${t("pdf_col_notes", lng)}</th>
    </tr></thead>
    <tbody>${rows || `<tr><td colspan='6'>${t("pdf_empty", lng)}</td></tr>`}</tbody></table>
    <p class="note">${t("pdf_pain_scale_note", lng)}</p>
    <p><small>${t("pdf_disclaimer", lng)}</small></p>
  </body></html>`;
}
