import { describe, expect, it } from "vitest";
import { ENCYCLOPEDIA_DISCLAIMER_ES, ENCYCLOPEDIA_ES } from "../src/content/encyclopedia/es";

describe("encyclopedia", () => {
  it("tiene 5 categorías médicas", () => {
    expect(ENCYCLOPEDIA_ES).toHaveLength(5);
    const ids = ENCYCLOPEDIA_ES.map((c) => c.id);
    expect(ids).toEqual(["phases", "pain", "contraception", "alerts", "fertility"]);
  });

  it("incluye descargo legal OMS/ACOG", () => {
    expect(ENCYCLOPEDIA_DISCLAIMER_ES).toContain("OMS");
    expect(ENCYCLOPEDIA_DISCLAIMER_ES).toContain("ACOG");
    expect(ENCYCLOPEDIA_DISCLAIMER_ES).toContain("no provee diagnósticos");
  });
});
