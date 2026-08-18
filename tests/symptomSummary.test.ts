import { describe, expect, it } from "vitest";
import { summarizeRecentSymptoms } from "../src/utils/symptomSummary";
import type { DailyLog } from "../src/types/dailyLog";

const t = (key: string) => key;

function makeLog(date: string, patch: Partial<DailyLog> = {}): DailyLog {
  return {
    id: `log-${date}`,
    userId: "u1",
    date,
    cycleDay: 5,
    phase: "follicular",
    bleeding: 0,
    pain: 0,
    moods: [],
    symptoms: [],
    extraSymptoms: [],
    cervicalMucus: null,
    sex: null,
    pillTaken: null,
    lifestyle: { sleepHours: null, exerciseMinutes: null, waterGlasses: null, stressLevel: 0 },
    notes: "",
    createdAt: "2026-08-18T10:00:00.000Z",
    updatedAt: "2026-08-18T10:00:00.000Z",
    ...patch,
  };
}

describe("summarizeRecentSymptoms", () => {
  it("prioriza datos del registro más reciente incluyendo hábitos y moco/relaciones", () => {
    const yesterday = makeLog("2026-08-17", {
      moods: ["sad"],
      symptoms: ["cravings"],
      extraSymptoms: ["sym_chills"],
    });
    const today = makeLog("2026-08-18", {
      cervicalMucus: "dry",
      sex: "none",
      lifestyle: { sleepHours: 7, exerciseMinutes: null, waterGlasses: 5, stressLevel: 1 },
      symptoms: ["headache"],
    });

    const pills = summarizeRecentSymptoms([yesterday, today], t);
    const labels = pills.map((p) => p.label);

    expect(labels).toContain("water · 5");
    expect(labels).toContain("sleep · 7h");
    expect(labels).toContain("log_mucus: mucus_dry");
    expect(labels).toContain("log_sex: sex_none");
  });

  it("devuelve vacío si no hay registros", () => {
    expect(summarizeRecentSymptoms([], t)).toEqual([]);
  });

  it("limita el resumen sin duplicar ids", () => {
    const logs = [
      makeLog("2026-08-18", { pain: 3, symptoms: ["cramps"], moods: ["sad"] }),
      makeLog("2026-08-17", { symptoms: ["cramps", "headache"], moods: ["sad", "anxious"] }),
      makeLog("2026-08-16", { extraSymptoms: ["sym_chills"] }),
    ];

    const pills = summarizeRecentSymptoms(logs, t);
    const ids = pills.map((p) => p.id);
    const unique = new Set(ids);

    expect(pills.length).toBeLessThanOrEqual(6);
    expect(unique.size).toBe(ids.length);
  });
});
