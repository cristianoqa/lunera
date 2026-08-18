import { describe, expect, it } from "vitest";
import {
  SYMPTOMS,
  MOODS,
  CORE_EXTRA_SYMPTOMS,
  PREGNANCY_EXTRA_SYMPTOMS,
  visibleExtraSymptoms,
  MUCUS_OPTIONS,
  SEX_OPTIONS,
} from "../src/constants/symptoms";

describe("symptoms catalog", () => {
  it("keeps a complete but non-vague daily set", () => {
    const total = MOODS.length + SYMPTOMS.length + CORE_EXTRA_SYMPTOMS.length;
    expect(total).toBeGreaterThanOrEqual(40);
    expect(visibleExtraSymptoms("MENSTRUATION_TRACKING")).not.toContain("sym_eye");
    expect(visibleExtraSymptoms("MENSTRUATION_TRACKING")).not.toContain("sym_heartburn");
  });

  it("adds pregnancy-only extras in PREGNANCY_CARE", () => {
    const vis = visibleExtraSymptoms("PREGNANCY_CARE", false);
    for (const key of PREGNANCY_EXTRA_SYMPTOMS) {
      expect(vis).toContain(key);
    }
    expect(visibleExtraSymptoms("PREGNANCY_CARE", true)).not.toContain("sym_fetal_move");
  });

  it("offers mucus and sex as exclusive optional choices", () => {
    expect(MUCUS_OPTIONS.map((o) => o.id)).toEqual(["dry", "sticky", "creamy", "egg_white", "watery"]);
    expect(SEX_OPTIONS.map((o) => o.id)).toEqual(["none", "protected", "unprotected"]);
  });
});

describe("log pill colors match Registro sections", () => {
  it("maps bleeding/pain/mood/symptom to section accents", async () => {
    const { logSectionForItemId, LogSectionColors } = await import("../src/constants/logColors");
    expect(logSectionForItemId("bleeding")).toBe("bleeding");
    expect(logSectionForItemId("pain")).toBe("pain");
    expect(logSectionForItemId("happy")).toBe("moods");
    expect(logSectionForItemId("cramps")).toBe("symptoms");
    expect(logSectionForItemId("sym_sweat")).toBe("symptoms");
    expect(LogSectionColors.symptoms.accent).toBe("#8B7BA8");
  });
});
