import type { DailyLog } from "../types/dailyLog";
import { SymptomColorMap, colorsForLogItem } from "../constants/logColors";

export interface SymptomPill {
  id: string;
  label: string;
  color: string;
  bg: string;
}

type Translate = (key: string, opts?: Record<string, unknown>) => string;

function pillFromId(id: string, t: Translate, suffix?: string): SymptomPill {
  const meta = SymptomColorMap[id];
  const section = colorsForLogItem(id);
  const base = meta?.labelKey ? t(meta.labelKey) : id.replace(/^sym_/, "").replace(/_/g, " ");
  return {
    id,
    label: suffix ? `${base} ${suffix}` : base,
    color: section.color,
    bg: section.bg,
  };
}

function latestLifestylePills(latest: DailyLog, t: Translate): SymptomPill[] {
  const pills: SymptomPill[] = [];
  const water = latest.lifestyle?.waterGlasses ?? null;
  const sleep = latest.lifestyle?.sleepHours ?? null;
  const mucus = latest.cervicalMucus ?? null;
  const sex = latest.sex ?? null;

  if (typeof water === "number" && water > 0) {
    pills.push(pillFromId("water", t, `· ${water}`));
  }
  if (typeof sleep === "number" && sleep > 0) {
    pills.push(pillFromId("sleep", t, `· ${sleep}h`));
  }
  if (mucus) {
    pills.push({
      id: `mucus_${mucus}`,
      label: `${t("log_mucus")}: ${t(`mucus_${mucus === "egg_white" ? "egg" : mucus}`)}`,
      ...colorsForLogItem("mucus"),
    });
  }
  if (sex) {
    pills.push({
      id: `sex_${sex}`,
      label: `${t("log_sex")}: ${t(`sex_${sex}`)}`,
      ...colorsForLogItem("sex"),
    });
  }

  return pills;
}

/**
 * Resume síntomas recientes para Home.
 * Incluye sangrado/dolor del último registro + top síntomas/ánimos.
 */
export function summarizeRecentSymptoms(logs: DailyLog[], t: Translate, limit = 7): SymptomPill[] {
  if (!logs.length) return [];

  const recent = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  const latest = recent[0];
  const pills: SymptomPill[] = [];

  if (latest.bleeding > 0) {
    pills.push(pillFromId("bleeding", t, `· ${latest.bleeding}`));
  }
  if (latest.pain > 0) {
    pills.push(pillFromId("pain", t, `· ${latest.pain}`));
  }
  pills.push(...latestLifestylePills(latest, t));

  const counts = new Map<string, number>();
  for (const log of recent) {
    for (const s of log.symptoms ?? []) counts.set(s, (counts.get(s) ?? 0) + 1);
    for (const m of log.moods ?? []) counts.set(m, (counts.get(m) ?? 0) + 1);
    for (const e of log.extraSymptoms ?? []) counts.set(e, (counts.get(e) ?? 0) + 1);
  }

  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => pillFromId(id, t))
    .filter((p) => !pills.some((x) => x.id === p.id));

  const merged = [...pills, ...top].slice(0, 6);
  return merged;
}
