import { describe, expect, it, vi, beforeEach } from "vitest";
import { predictCycle, clampCycleLength } from "../src/services/cyclePredictor";

describe("cyclePredictor edge cases", () => {
  it("handles 21-day short cycle", () => {
    const p = predictCycle({
      lastPeriodStart: "2026-08-01",
      today: "2026-08-11",
      history: [],
      averageCycleLength: 21,
      averagePeriodLength: 5,
    });
    expect(p.averageCycleLength).toBe(21);
    expect(p.currentCycleDay).toBe(11);
    expect(p.currentPhase).toBe("luteal");
    expect(p.daysUntilPeriod).toBeGreaterThan(0);
  });

  it("handles 35-day long cycle from real anchor", () => {
    const p = predictCycle({
      lastPeriodStart: "2026-07-01",
      today: "2026-08-14",
      history: [],
      averageCycleLength: 35,
      averagePeriodLength: 5,
    });
    expect(p.currentCycleDay).toBe(45);
    expect(p.daysUntilPeriod).toBe(0);
    expect(p.predictedNextPeriodStart).toBe("2026-08-05");
  });

  it("handles late period without rolling to synthetic next cycle", () => {
    const p = predictCycle({
      lastPeriodStart: "2026-07-01",
      today: "2026-08-08",
      history: [],
      averageCycleLength: 28,
      averagePeriodLength: 5,
    });
    expect(p.currentCycleDay).toBe(39);
    expect(p.daysUntilPeriod).toBe(0);
    expect(p.predictedNextPeriodStart).toBe("2026-07-29");
  });

  it("never returns negative daysUntilPeriod", () => {
    const p = predictCycle({
      lastPeriodStart: "2026-01-01",
      today: "2026-08-14",
      history: [],
      averageCycleLength: 28,
      averagePeriodLength: 5,
    });
    expect(p.daysUntilPeriod).toBeGreaterThanOrEqual(0);
    expect(p.currentCycleDay).toBeGreaterThanOrEqual(1);
  });

  it("clamps extreme cycle lengths", () => {
    expect(clampCycleLength(15)).toBe(21);
    expect(clampCycleLength(60)).toBe(45);
  });
});

describe("localStorage saveLog", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("persists and deduplicates logs by user+date", async () => {
    const store = new Map<string, string>();
    vi.doMock("@react-native-async-storage/async-storage", () => ({
      default: {
        getItem: (k: string) => Promise.resolve(store.get(k) ?? null),
        setItem: (k: string, v: string) => {
          store.set(k, v);
          return Promise.resolve();
        },
      },
    }));

    const { saveLog, loadLogs, getLogByDate } = await import("../src/services/localStorage");

    const log1 = {
      id: "log-2026-08-14",
      userId: "u1",
      date: "2026-08-14",
      cycleDay: 14,
      phase: "ovulation" as const,
      bleeding: 0 as const,
      pain: 3 as const,
      moods: ["anxious" as const],
      symptoms: ["cramps" as const],
      extraSymptoms: [],
      lifestyle: { sleepHours: 7, exerciseMinutes: null, waterGlasses: null, stressLevel: 3 as const },
      notes: "test",
      createdAt: "2026-08-14T10:00:00Z",
      updatedAt: "2026-08-14T10:00:00Z",
    };

    await saveLog(log1);
    const updated = { ...log1, pain: 5 as const, notes: "updated", updatedAt: "2026-08-14T11:00:00Z" };
    await saveLog(updated);

    const all = await loadLogs();
    expect(all).toHaveLength(1);
    expect(all[0].pain).toBe(5);
    expect(all[0].notes).toBe("updated");

    const byDate = await getLogByDate("u1", "2026-08-14");
    expect(byDate?.symptoms).toContain("cramps");
  });
});

describe("symptomSummary", () => {
  it("aggregates moods, symptoms and extraSymptoms", async () => {
    const { summarizeRecentSymptoms } = await import("../src/utils/symptomSummary");
    const t = (key: string) => key;
    const pills = summarizeRecentSymptoms(
      [
        {
          id: "1",
          userId: "u",
          date: "2026-08-14",
          cycleDay: 1,
          phase: "menstrual",
          bleeding: 3,
          pain: 5,
          moods: ["energetic"],
          symptoms: ["headache"],
          extraSymptoms: ["sym_fatigue"],
          lifestyle: { sleepHours: 6, exerciseMinutes: null, waterGlasses: null, stressLevel: 5 },
          notes: "",
          createdAt: "",
          updatedAt: "",
        },
      ],
      t
    );
    expect(pills.length).toBeGreaterThan(0);
    const ids = pills.map((p) => p.id);
    expect(ids).toContain("bleeding");
    expect(ids).toContain("pain");
    expect(ids.some((id) => ["headache", "energetic", "sym_fatigue"].includes(id))).toBe(true);
  });
});
