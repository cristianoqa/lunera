import { describe, expect, it } from "vitest";
import { buildClinicalAlerts } from "../src/services/clinicalRulesService";
import { defaultConfig } from "../src/services/localStorage";
import type { UserProfile } from "../src/types/user";
import type { DailyLog } from "../src/types/dailyLog";
import type { CycleRecord } from "../src/types/cycle";

const profile: UserProfile = {
  id: "u1",
  authMode: "guest",
  goals: ["track_cycle"],
  ageBand: "30_39",
  knownConditions: [],
  lastPeriodStart: "2026-05-01",
  averageCycleLength: 34,
  averagePeriodLength: 5,
  onboardingCompleted: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const cycles: CycleRecord[] = [
  { id: "c1", userId: "u1", startDate: "2026-01-01", endDate: "2026-01-05", cycleLength: 36, periodLength: 5, source: "manual", createdAt: "" },
  { id: "c2", userId: "u1", startDate: "2026-02-06", endDate: "2026-02-10", cycleLength: 39, periodLength: 5, source: "manual", createdAt: "" },
  { id: "c3", userId: "u1", startDate: "2026-03-17", endDate: "2026-03-21", cycleLength: 37, periodLength: 5, source: "manual", createdAt: "" },
];

function buildLog(overrides: Partial<DailyLog>): DailyLog {
  return {
    id: "l1",
    userId: "u1",
    date: "2026-06-20",
    cycleDay: 45,
    phase: "luteal",
    bleeding: 4,
    bleedingDetails: {
      type: "spotting",
      flowLevel: 4,
      hasClots: true,
      padOrTamponCount: 7,
      notes: "",
    },
    pain: 2,
    moods: [],
    symptoms: ["spotting"],
    lifestyle: { sleepHours: 7, exerciseMinutes: 20, waterGlasses: 6, stressLevel: 2 },
    notes: "",
    extraSymptoms: [],
    cervicalMucus: null,
    sex: null,
    pillTaken: null,
    menopauseSymptoms: null,
    fetalMovement: null,
    bloodPressure: { systolic: null, diastolic: null },
    pregnancyAlertSymptoms: [],
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("buildClinicalAlerts", () => {
  it("detects long cycles, amenorrhea, spotting and heavy bleeding patterns", () => {
    const alerts = buildClinicalAlerts({
      profile,
      config: defaultConfig("u1"),
      cycles,
      logs: [
        buildLog({ id: "a", date: "2026-06-20" }),
        buildLog({ id: "b", date: "2026-06-15" }),
        buildLog({ id: "c", date: "2026-06-10" }),
      ],
      today: "2026-06-20",
    });

    expect(alerts.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        "long_cycle_pattern",
        "amenorrhea_possible",
        "repeated_spotting",
        "heavy_bleeding_pattern",
      ])
    );
  });

  it("detects pregnancy warning signs and high blood pressure", () => {
    const config = {
      ...defaultConfig("u1"),
      appMode: "PREGNANCY_CARE" as const,
      pregnancy: {
        lastMenstrualPeriod: "2026-01-01",
        dueDate: "2026-10-08",
        babyBornAt: null,
        prenatalVisitNotes: [],
        lastKickCountAt: null,
      },
    };

    const alerts = buildClinicalAlerts({
      profile,
      config,
      cycles: [],
      logs: [
        buildLog({
          bleeding: 1,
          bleedingDetails: { type: "pregnancy", flowLevel: 1, hasClots: false, padOrTamponCount: null, notes: "" },
          pregnancyAlertSymptoms: ["bleeding", "severe_pain"],
          fetalMovement: { movementCount: 6, durationMinutes: 60, concern: true },
          bloodPressure: { systolic: 145, diastolic: 92 },
        }),
      ],
      today: "2026-08-20",
    });

    expect(alerts.map((item) => item.code)).toEqual(
      expect.arrayContaining(["pregnancy_warning_signs", "reduced_fetal_movement", "elevated_blood_pressure"])
    );
  });
});
