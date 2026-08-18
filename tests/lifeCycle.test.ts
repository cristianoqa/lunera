import { describe, expect, it } from "vitest";
import { naegeleDueDate, pregnancyWeek } from "../src/services/pregnancyService";
import {
  combinedPillDayKind,
  shouldPredictPeriods,
  shouldShowFertileWindow,
  validateLifeModeInput,
} from "../src/services/lifeCycleService";
import { todayISOLocal } from "../src/services/cyclePredictor";
import { defaultConfig } from "../src/services/localStorage";
import { closeOpenCycles, createCycleRecord, recalcularFasesDelCiclo } from "../src/services/cycleRecalculationService";
import type { UserProfile } from "../src/types/user";

const profile: UserProfile = {
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

describe("todayISOLocal", () => {
  it("usa calendario local, no UTC", () => {
    const winter = new Date(2026, 0, 15, 1, 0, 0);
    expect(todayISOLocal(winter)).toBe("2026-01-15");
  });
});

describe("Naegele y semana de gestación", () => {
  it("calcula FPP con +7 días −3 meses +1 año", () => {
    expect(naegeleDueDate("2026-01-01")).toBe("2026-10-08");
    expect(naegeleDueDate("2026-04-10")).toBe("2027-01-17");
  });

  it("semana 12 a los 77–83 días", () => {
    expect(pregnancyWeek("2026-01-01", "2026-01-01")).toBe(1);
    expect(pregnancyWeek("2026-01-01", "2026-03-26")).toBe(13);
  });
});

describe("modos de ciclo de vida", () => {
  it("embarazo y menopausia desactivan predicción de regla y fértil", () => {
    const preg = { ...defaultConfig("u"), appMode: "PREGNANCY_CARE" as const };
    const meno = { ...defaultConfig("u"), appMode: "MENOPAUSE_SUPPORT" as const };
    const contra = { ...defaultConfig("u"), appMode: "CONTRACEPTION_CONTROL" as const };
    expect(shouldPredictPeriods(preg)).toBe(false);
    expect(shouldShowFertileWindow(preg)).toBe(false);
    expect(shouldPredictPeriods(meno)).toBe(false);
    expect(shouldPredictPeriods(contra)).toBe(false);
    expect(shouldPredictPeriods(defaultConfig("u"))).toBe(true);
  });

  it("píldora combinada 21 activos + 7 descanso", () => {
    expect(combinedPillDayKind("2026-08-01", "2026-08-01")).toBe("pill_active");
    expect(combinedPillDayKind("2026-08-01", "2026-08-21")).toBe("pill_active");
    expect(combinedPillDayKind("2026-08-01", "2026-08-22")).toBe("withdrawal");
    expect(combinedPillDayKind("2026-08-01", "2026-08-28")).toBe("pill_rest");
  });

  it("acepta minipíldora y anillo vaginal como métodos válidos en configuración", () => {
    expect(
      validateLifeModeInput({
        mode: "CONTRACEPTION_CONTROL",
        reminderTime: "08:30",
        packStart: "2026-08-01",
        today: "2026-08-17",
      }).ok
    ).toBe(true);
  });

  it("no proyecta regla futura en modo embarazo", () => {
    const cfg = {
      ...defaultConfig("u1"),
      appMode: "PREGNANCY_CARE" as const,
      pregnancy: { lastMenstrualPeriod: "2026-07-01", dueDate: "2027-04-08", babyBornAt: null },
    };
    const result = recalcularFasesDelCiclo({
      cycles: [createCycleRecord("u1", "2026-07-01", "2026-07-05")],
      profile,
      today: "2026-07-10",
      config: cfg,
    });
    const predicted = [...result.dayMarkers.values()].some((m) => m.kinds.includes("period_predicted"));
    const fertile = [...result.dayMarkers.values()].some((m) => m.kinds.includes("fertile"));
    const confirmed = [...result.dayMarkers.values()].some((m) => m.kinds.includes("period_confirmed"));
    expect(predicted).toBe(false);
    expect(fertile).toBe(false);
    expect(confirmed).toBe(false);
  });

  it("menopausia no pinta regla aunque el ciclo abierto dure 18 días", () => {
    const cfg = { ...defaultConfig("u1"), appMode: "MENOPAUSE_SUPPORT" as const };
    const open = { ...createCycleRecord("u1", "2026-08-01", null), periodLength: 18 };
    const result = recalcularFasesDelCiclo({
      cycles: [open],
      profile: { ...profile, lastPeriodStart: "2026-08-01", averagePeriodLength: 18 },
      today: "2026-08-17",
      config: cfg,
    });
    const kinds = [...result.dayMarkers.values()].flatMap((m) => m.kinds);
    expect(kinds.some((k) => k === "period_confirmed" || k === "period_predicted")).toBe(false);
    expect(kinds).not.toContain("fertile");
    expect(kinds).not.toContain("ovulation");
  });

  it("cierra ciclos abiertos al cambiar de etapa", () => {
    const closed = closeOpenCycles(
      [{ ...createCycleRecord("u1", "2026-08-01", null), periodLength: 18 }],
      "2026-08-17"
    );
    expect(closed[0].endDate).toBe("2026-08-16");
    expect(closed[0].periodLength).toBe(16);
  });

  it("valida LMP futura y hora de píldora", () => {
    expect(
      validateLifeModeInput({ mode: "PREGNANCY_CARE", lmp: "2026-12-01", today: "2026-08-17" }).ok
    ).toBe(false);
    expect(
      validateLifeModeInput({
        mode: "CONTRACEPTION_CONTROL",
        reminderTime: "25:00",
        packStart: "2026-08-01",
        today: "2026-08-17",
      }).ok
    ).toBe(false);
    expect(
      validateLifeModeInput({
        mode: "CONTRACEPTION_CONTROL",
        reminderTime: "09:00",
        packStart: "2026-08-01",
        today: "2026-08-17",
      }).ok
    ).toBe(true);
  });
});
