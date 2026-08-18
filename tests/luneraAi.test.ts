import { describe, expect, it } from "vitest";
import {
  askLuneraAi,
  detectMedicalEmergency,
  generateBodyTodayAi,
  type AiUserContext,
} from "../src/services/luneraAiService";
import type { CyclePrediction } from "../src/types/cycle";

const prediction: CyclePrediction = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  currentCycleDay: 26,
  currentPhase: "luteal",
  predictedNextPeriodStart: "2026-08-16",
  fertileWindowStart: "2026-08-01",
  fertileWindowEnd: "2026-08-07",
  ovulationDate: "2026-08-06",
  daysUntilPeriod: 2,
  confidence: "medium",
  phases: [],
};

const baseCtx: AiUserContext = {
  cycleDay: 26,
  phase: "luteal",
  todaySymptoms: ["migraine", "fatigue"],
  todayPain: 3,
  todayBleeding: 0,
  todayMoods: [],
  recentLogs: [],
  cycles: [],
  prediction,
  locale: "es",
};

describe("luneraAiService", () => {
  it("genera insight Body Today con síntomas", () => {
    const insight = generateBodyTodayAi(baseCtx);
    expect(insight.title).toContain("26");
    expect(insight.body.toLowerCase()).toMatch(/migra|estrógeno|progesterona|descanso/);
  });

  it("detecta emergencias médicas", () => {
    expect(detectMedicalEmergency("tengo hemorragia fuerte")).toBe(true);
    expect(detectMedicalEmergency("dolor insoportable")).toBe(true);
    expect(detectMedicalEmergency("¿es normal el flujo?")).toBe(false);
  });

  it("responde chat con contexto fértil", async () => {
    const ctx = { ...baseCtx, cycleDay: 13, phase: "ovulation" as const, todaySymptoms: [] };
    const res = await askLuneraAi("¿Es normal tener tanto flujo elástico hoy?", ctx);
    expect(res.kind).toBe("reply");
    expect(res.text.toLowerCase()).toMatch(/flujo|fértil|ovul/);
  });

  it("interrumpe chat en emergencia", async () => {
    const res = await askLuneraAi("tengo sangrado hemorrágico", baseCtx);
    expect(res.kind).toBe("emergency");
  });

  it("en menopausia no habla de fase menstrual", () => {
    const insight = generateBodyTodayAi({ ...baseCtx, appMode: "MENOPAUSE_SUPPORT" });
    expect(insight.title.toLowerCase()).toMatch(/menopaus/);
    expect(insight.title.toLowerCase()).not.toMatch(/menstrual/);
    expect(insight.body.toLowerCase()).not.toMatch(/día 26/);
  });
});
