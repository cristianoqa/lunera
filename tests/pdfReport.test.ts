import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "es" }],
}));

describe("buildMedicalReportHtml", () => {
  beforeAll(async () => {
    await import("../src/i18n");
  });

  it("traduce síntomas por id (no deja headache/joint_pain en inglés) y añade nota de escala", async () => {
    const { buildMedicalReportHtml } = await import("../src/services/pdfReportHtml");
    const html = buildMedicalReportHtml({
      locale: "es",
      profile: {
        id: "u1",
        authMode: "guest",
        displayName: "Test",
        emailHash: undefined,
        averageCycleLength: 28,
        averagePeriodLength: 5,
        lastPeriodStart: "2026-08-01",
        goals: ["track_cycle"],
        onboardingCompleted: true,
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
      },
      prediction: null,
      logs: [
        {
          id: "l1",
          userId: "u1",
          date: "2026-08-10",
          cycleDay: 10,
          phase: "follicular",
          bleeding: 4,
          bleedingDetails: {
            type: "period",
            flowLevel: 4,
            hasClots: true,
            padOrTamponCount: 7,
            notes: "abundante",
          },
          pain: 3,
          moods: [],
          symptoms: ["headache", "joint_pain", "constipation", "hot_flashes"],
          lifestyle: {
            sleepHours: null,
            exerciseMinutes: null,
            waterGlasses: null,
            stressLevel: 0,
          },
          notes: "",
          createdAt: "2026-08-10T00:00:00.000Z",
          updatedAt: "2026-08-10T00:00:00.000Z",
        },
      ],
      clinicalAlerts: [
        {
          code: "heavy_bleeding_pattern",
          severity: "urgent",
          titleKey: "alert_heavy_bleeding_title",
          bodyKey: "alert_heavy_bleeding_body",
        },
      ],
    });

    expect(html).toContain("Dolor de cabeza");
    expect(html).toContain("Dolor articular");
    expect(html).toContain("Estreñimiento");
    expect(html).toContain("Sofocos");
    expect(html).not.toContain(">headache<");
    expect(html).not.toContain("joint_pain");
    expect(html).not.toContain("hot_flashes");
    expect(html).toContain("Seguimiento clínico sugerido");
    expect(html).toContain("Con coágulos");
    expect(html).toMatch(/escala de dolor|NIVEL de intensidad/i);
  });
});
