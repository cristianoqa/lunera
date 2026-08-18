import { describe, expect, it } from "vitest";
import {
  addDays,
  buildPhaseWindows,
  computeAverageCycleLength,
  deriveCyclesFromPeriodStarts,
  predictCycle,
  resolvePhaseForDay,
} from "../src/services/cyclePredictor";
import type { CycleRecord } from "../src/types/cycle";

describe("cyclePredictor", () => {
  it("computes weighted average cycle length", () => {
    const history: CycleRecord[] = [
      { id: "1", userId: "u", startDate: "2026-01-01", endDate: null, cycleLength: 28, periodLength: 5, source: "manual", createdAt: "" },
      { id: "2", userId: "u", startDate: "2026-01-29", endDate: null, cycleLength: 30, periodLength: 5, source: "manual", createdAt: "" },
      { id: "3", userId: "u", startDate: "2026-02-28", endDate: null, cycleLength: 29, periodLength: 5, source: "manual", createdAt: "" },
    ];
    const avg = computeAverageCycleLength(history);
    expect(avg).toBeGreaterThanOrEqual(28);
    expect(avg).toBeLessThanOrEqual(30);
  });

  it("resolves four phases across cycle day", () => {
    expect(resolvePhaseForDay(3, 5, 28)).toBe("menstrual");
    expect(resolvePhaseForDay(10, 5, 28)).toBe("follicular");
    expect(resolvePhaseForDay(14, 5, 28)).toBe("ovulation");
    expect(resolvePhaseForDay(22, 5, 28)).toBe("luteal");
  });

  it("predicts next period and fertile window", () => {
    const prediction = predictCycle({
      lastPeriodStart: "2026-08-01",
      today: "2026-08-14",
      history: [],
      averageCycleLength: 28,
      averagePeriodLength: 5,
    });

    expect(prediction.currentCycleDay).toBe(14);
    expect(prediction.currentPhase).toBe("ovulation");
    expect(prediction.predictedNextPeriodStart).toBe("2026-08-29");
    expect(prediction.daysUntilPeriod).toBe(15);
    expect(prediction.phases).toHaveLength(4);
    expect(prediction.fertileWindowStart).toBe("2026-08-10");
    expect(prediction.fertileWindowEnd).toBe("2026-08-16");
  });

  it("builds phase windows with ISO dates", () => {
    const windows = buildPhaseWindows("2026-08-01", 5, 28);
    expect(windows[0].startDate).toBe("2026-08-01");
    expect(addDays("2026-08-01", 27)).toBe("2026-08-28");
  });

  it("derives cycle lengths from period starts", () => {
    const cycles = deriveCyclesFromPeriodStarts("u1", ["2026-06-01", "2026-07-01", "2026-08-01"]);
    expect(cycles).toHaveLength(3);
    expect(cycles[0].cycleLength).toBe(30);
    expect(cycles[2].cycleLength).toBeNull();
  });
});
