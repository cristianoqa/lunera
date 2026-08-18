import { describe, expect, it } from "vitest";
import {
  recalcularFasesDelCiclo,
  togglePeriodEnd,
  togglePeriodStart,
  createCycleRecord,
  computeVariability,
  validatePeriodStartDate,
} from "../src/services/cycleRecalculationService";
import type { UserProfile } from "../src/types/user";

const baseProfile: UserProfile = {
  id: "u1",
  authMode: "guest",
  goals: ["track_cycle"],
  lastPeriodStart: "2026-07-01",
  averageCycleLength: 28,
  averagePeriodLength: 5,
  onboardingCompleted: true,
  createdAt: "",
  updatedAt: "",
};

describe("cycleRecalculationService", () => {
  it("Caso C: nuevo día 1 rompe predicción y reinicia ciclo", () => {
    const cycles = [
      createCycleRecord("u1", "2026-07-01", "2026-07-05"),
      createCycleRecord("u1", "2026-08-05", null),
    ];
    const result = recalcularFasesDelCiclo({
      cycles,
      profile: baseProfile,
      today: "2026-08-10",
    });
    expect(result.prediction.currentCycleDay).toBe(6);
    expect(result.profilePatch.lastPeriodStart).toBe("2026-08-05");
  });

  it("Caso A: acorta regla al marcar fin antes", () => {
    let cycles = [createCycleRecord("u1", "2026-08-01", "2026-08-05")];
    cycles = togglePeriodEnd(cycles, "2026-08-03");
    expect(cycles[0].periodLength).toBe(3);
    expect(cycles[0].endDate).toBe("2026-08-03");
  });

  it("Caso B: alarga regla a 8 días", () => {
    let cycles = [createCycleRecord("u1", "2026-08-01", "2026-08-05")];
    cycles = togglePeriodEnd(cycles, "2026-08-08");
    expect(cycles[0].periodLength).toBe(8);
  });

  it("togglePeriodStart añade y elimina inicios", () => {
    let cycles = togglePeriodStart([], "u1", "2026-08-01");
    expect(cycles).toHaveLength(1);
    cycles = togglePeriodStart(cycles, "u1", "2026-08-01");
    expect(cycles).toHaveLength(0);
  });

  it("calcula variabilidad con últimos ciclos", () => {
    const cycles = recalcularFasesDelCiclo({
      cycles: [
        createCycleRecord("u1", "2026-05-01", "2026-05-05"),
        createCycleRecord("u1", "2026-05-26", "2026-05-30"),
        createCycleRecord("u1", "2026-06-28", "2026-07-02"),
      ],
      profile: baseProfile,
      today: "2026-07-10",
    }).cycles;
    const v = computeVariability(cycles);
    expect(v.messageKey).toBe("calendar_variability_range");
    expect(v.minDays).toBeGreaterThanOrEqual(21);
    expect(v.maxDays).toBeLessThanOrEqual(45);
  });

  it("ignora inicio futuro para anclar predicción en Home", () => {
    const cycles = [
      createCycleRecord("u1", "2026-08-01", "2026-08-05"),
      createCycleRecord("u1", "2026-09-20", null),
    ];
    const result = recalcularFasesDelCiclo({
      cycles,
      profile: { ...baseProfile, lastPeriodStart: "2026-08-01" },
      today: "2026-08-14",
    });
    expect(result.profilePatch.lastPeriodStart).toBe("2026-08-01");
    expect(result.prediction.daysUntilPeriod).toBeLessThan(20);
  });

  it("validatePeriodStartDate rechaza fechas futuras", () => {
    expect(validatePeriodStartDate("2026-09-01", "2026-08-14").ok).toBe(false);
    expect(validatePeriodStartDate("2026-08-14", "2026-08-14").ok).toBe(true);
  });

  it("proyecta ventana fértil en ciclos futuros, no solo en el actual", () => {
    const result = recalcularFasesDelCiclo({
      cycles: [createCycleRecord("u1", "2026-07-01", "2026-07-05")],
      profile: baseProfile,
      today: "2026-07-10",
    });
    expect(result.dayMarkers.get("2026-07-15")?.kinds).toContain("ovulation");
    expect(result.dayMarkers.get("2026-07-10")?.kinds).toContain("fertile");
    expect(result.dayMarkers.get("2026-08-12")?.kinds).toContain("ovulation");
    expect(result.dayMarkers.get("2026-08-07")?.kinds).toContain("fertile");
    expect(result.dayMarkers.get("2026-09-09")?.kinds).toContain("ovulation");
  });

  it("calendario mensual alinea día 1 bajo lunes-first (ISO)", () => {
    const result = recalcularFasesDelCiclo({
      cycles: [createCycleRecord("u1", "2026-07-01", "2026-07-05")],
      profile: baseProfile,
      today: "2026-07-10",
    });
    const july = result.calendarMonths.find((m) => m.year === 2026 && m.month === 7);
    expect(july).toBeTruthy();
    const idx = july!.days.findIndex((d) => d?.date === "2026-07-01");
    expect(idx).toBe(2);
  });

  it("al cambiar duración de regla 5→6 recalcula fases futuras", () => {
    const cycles = [
      {
        ...createCycleRecord("u1", "2026-08-01", "2026-08-05"),
        periodLength: 6,
        endDate: "2026-08-06",
      },
    ];
    const result = recalcularFasesDelCiclo({
      cycles,
      profile: { ...baseProfile, averagePeriodLength: 6, lastPeriodStart: "2026-08-01" },
      today: "2026-08-03",
    });
    expect(result.prediction.currentPhase).toBe("menstrual");
    expect(result.prediction.averagePeriodLength).toBe(6);
    expect(result.profilePatch.averagePeriodLength).toBe(6);
    // Proyección: el día 6 del ciclo (2026-08-06) sigue marcado como periodo
    const day6 = result.dayMarkers.get("2026-08-06");
    expect(day6?.kinds.some((k) => k.startsWith("period"))).toBe(true);
  });
});
