/**
 * Temas visuales de Lunera — 5+ packs Wellness.
 * Cada tema redefine la paleta base usada en toda la UI.
 */

export type AppThemeId = "linen" | "lavender" | "rose" | "sage" | "midnight" | "peach";

export interface AppThemeColors {
  id: AppThemeId;
  nameKey: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  bronze: string;
  lavender: string;
  bgLinen: string;
  bgMist: string;
  surface: string;
  surfaceGlass: string;
  text: string;
  textMuted: string;
  textSerif: string;
  menstrualStart: string;
  menstrualEnd: string;
  fertileStart: string;
  fertileEnd: string;
  ringTrack: string;
  ringGlass: string;
  pillGreen: string;
  pillRed: string;
  pillAmber: string;
  pillLavender: string;
  background: string;
  primaryDark: string;
  success: string;
  preview: [string, string, string];
}

const baseTokens = {
  menstrualStart: "#E85D4C",
  menstrualEnd: "#D9467A",
  fertileStart: "#E879A9",
  fertileEnd: "#F0ABCF",
  ringTrack: "rgba(165, 145, 175, 0.22)",
  ringGlass: "rgba(255, 255, 255, 0.55)",
  pillGreen: "#6B9E78",
  pillRed: "#C75B5B",
  pillAmber: "#C49A3C",
  pillLavender: "#8B7BA8",
  success: "#6B9E78",
};

export const APP_THEMES: Record<AppThemeId, AppThemeColors> = {
  linen: {
    id: "linen",
    nameKey: "theme_linen",
    primary: "#4A3F6B",
    primaryDeep: "#2E2640",
    primarySoft: "rgba(74, 63, 107, 0.10)",
    accent: "#B8956B",
    accentSoft: "rgba(184, 149, 107, 0.15)",
    bronze: "#9A7B4F",
    lavender: "#A591B8",
    bgLinen: "#FBF9F6",
    bgMist: "#F5F0F8",
    surface: "#FFFFFF",
    surfaceGlass: "rgba(255, 255, 255, 0.85)",
    text: "#2A2238",
    textMuted: "#8B8399",
    textSerif: "#3D3450",
    background: "#FBF9F6",
    primaryDark: "#2E2640",
    preview: ["#FBF9F6", "#4A3F6B", "#B8956B"],
    ...baseTokens,
  },
  lavender: {
    id: "lavender",
    nameKey: "theme_lavender",
    primary: "#6B4C9A",
    primaryDeep: "#3D2A5C",
    primarySoft: "rgba(107, 76, 154, 0.12)",
    accent: "#C9A0DC",
    accentSoft: "rgba(201, 160, 220, 0.18)",
    bronze: "#9B7EBD",
    lavender: "#B8A0D4",
    bgLinen: "#F7F3FB",
    bgMist: "#EFE8F7",
    surface: "#FFFFFF",
    surfaceGlass: "rgba(255, 255, 255, 0.88)",
    text: "#2C1F3D",
    textMuted: "#8A7A9E",
    textSerif: "#3F2F55",
    background: "#F7F3FB",
    primaryDark: "#3D2A5C",
    preview: ["#F7F3FB", "#6B4C9A", "#C9A0DC"],
    ...baseTokens,
  },
  rose: {
    id: "rose",
    nameKey: "theme_rose",
    primary: "#9B3D5A",
    primaryDeep: "#5C2436",
    primarySoft: "rgba(155, 61, 90, 0.10)",
    accent: "#E8A0B0",
    accentSoft: "rgba(232, 160, 176, 0.18)",
    bronze: "#C47A8A",
    lavender: "#D4A0B0",
    bgLinen: "#FFF6F7",
    bgMist: "#FCEEF1",
    surface: "#FFFFFF",
    surfaceGlass: "rgba(255, 255, 255, 0.88)",
    text: "#3A1F28",
    textMuted: "#9A7A84",
    textSerif: "#4A2A34",
    background: "#FFF6F7",
    primaryDark: "#5C2436",
    preview: ["#FFF6F7", "#9B3D5A", "#E8A0B0"],
    ...baseTokens,
  },
  sage: {
    id: "sage",
    nameKey: "theme_sage",
    primary: "#3F6B5C",
    primaryDeep: "#244038",
    primarySoft: "rgba(63, 107, 92, 0.10)",
    accent: "#A3B89A",
    accentSoft: "rgba(163, 184, 154, 0.18)",
    bronze: "#7A9B6E",
    lavender: "#8FAE9A",
    bgLinen: "#F5F8F5",
    bgMist: "#EAF1EB",
    surface: "#FFFFFF",
    surfaceGlass: "rgba(255, 255, 255, 0.88)",
    text: "#1F2E28",
    textMuted: "#6F857A",
    textSerif: "#2A3D34",
    background: "#F5F8F5",
    primaryDark: "#244038",
    preview: ["#F5F8F5", "#3F6B5C", "#A3B89A"],
    ...baseTokens,
  },
  midnight: {
    id: "midnight",
    nameKey: "theme_midnight",
    primary: "#9B8EC4",
    primaryDeep: "#1A1528",
    primarySoft: "rgba(155, 142, 196, 0.18)",
    accent: "#D4B896",
    accentSoft: "rgba(212, 184, 150, 0.15)",
    bronze: "#C4A574",
    lavender: "#A89BC8",
    bgLinen: "#16122A",
    bgMist: "#1E1836",
    surface: "#241E3D",
    surfaceGlass: "rgba(36, 30, 61, 0.92)",
    text: "#F2EEF8",
    textMuted: "#A89BB8",
    textSerif: "#E8E0F4",
    background: "#16122A",
    primaryDark: "#0E0B18",
    preview: ["#16122A", "#9B8EC4", "#D4B896"],
    ...baseTokens,
    ringTrack: "rgba(155, 142, 196, 0.25)",
    ringGlass: "rgba(36, 30, 61, 0.7)",
  },
  peach: {
    id: "peach",
    nameKey: "theme_peach",
    primary: "#C46B4A",
    primaryDeep: "#6B3524",
    primarySoft: "rgba(196, 107, 74, 0.10)",
    accent: "#F0B890",
    accentSoft: "rgba(240, 184, 144, 0.20)",
    bronze: "#D4926A",
    lavender: "#E0A898",
    bgLinen: "#FFF8F3",
    bgMist: "#FCEEE4",
    surface: "#FFFFFF",
    surfaceGlass: "rgba(255, 255, 255, 0.90)",
    text: "#3A2A22",
    textMuted: "#9A7E70",
    textSerif: "#4A3228",
    background: "#FFF8F3",
    primaryDark: "#6B3524",
    preview: ["#FFF8F3", "#C46B4A", "#F0B890"],
    ...baseTokens,
  },
};

export const APP_THEME_IDS = Object.keys(APP_THEMES) as AppThemeId[];
export const DEFAULT_THEME_ID: AppThemeId = "linen";

export function resolveAppTheme(id?: string | null): AppThemeColors {
  if (id && id in APP_THEMES) return APP_THEMES[id as AppThemeId];
  return APP_THEMES[DEFAULT_THEME_ID];
}
