import * as Localization from "expo-localization";
import type { LocaleCode } from "../types/config";

/** Maps the device language to the three locales Lunera ships. */
export function resolveDeviceLocale(): LocaleCode {
  const code = (Localization.getLocales()[0]?.languageCode ?? "es").toLowerCase();
  if (code.startsWith("en")) return "en";
  if (code.startsWith("pt")) return "pt";
  return "es";
}
