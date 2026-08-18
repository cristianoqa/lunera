import { vi } from "vitest";

vi.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "es" }],
}));
