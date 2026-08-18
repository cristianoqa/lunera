import { describe, expect, it, vi } from "vitest";

const getLocales = vi.fn(() => [{ languageCode: "es" }]);

vi.mock("expo-localization", () => ({
  getLocales: () => getLocales(),
}));

import { resolveDeviceLocale } from "../src/i18n/locale";

describe("resolveDeviceLocale", () => {
  it("usa español por defecto", () => {
    getLocales.mockReturnValue([{ languageCode: "es" }]);
    expect(resolveDeviceLocale()).toBe("es");
  });

  it("mapea portugués del dispositivo", () => {
    getLocales.mockReturnValue([{ languageCode: "pt" }]);
    expect(resolveDeviceLocale()).toBe("pt");
  });

  it("mapea inglés y cae a español si no hay locale", () => {
    getLocales.mockReturnValue([{ languageCode: "en" }]);
    expect(resolveDeviceLocale()).toBe("en");
    getLocales.mockReturnValue([]);
    expect(resolveDeviceLocale()).toBe("es");
  });
});
