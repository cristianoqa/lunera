import { Platform } from "react-native";
import type { CyclePhase } from "../types/cycle";
import type { AppThemeColors } from "./appThemes";
import { APP_THEMES, DEFAULT_THEME_ID } from "./appThemes";

const base = APP_THEMES[DEFAULT_THEME_ID];

/**
 * Objeto mutable compartido — applyThemeToLuneraColors() lo actualiza al cambiar tema.
 * Los componentes que leen LuneraColors.* en render / useMemo ven los nuevos valores
 * tras remount por key=themeId en AppThemeProvider.
 */
export const LuneraColors = {
  primary: base.primary,
  primaryDeep: base.primaryDeep,
  primarySoft: base.primarySoft,
  accent: base.accent,
  accentSoft: base.accentSoft,
  bronze: base.bronze,
  lavender: base.lavender,
  bgLinen: base.bgLinen,
  bgMist: base.bgMist,
  surface: base.surface,
  surfaceGlass: base.surfaceGlass,
  text: base.text,
  textMuted: base.textMuted,
  textSerif: base.textSerif,
  menstrualStart: base.menstrualStart,
  menstrualEnd: base.menstrualEnd,
  fertileStart: base.fertileStart,
  fertileEnd: base.fertileEnd,
  ringTrack: base.ringTrack,
  ringGlass: base.ringGlass,
  pillGreen: base.pillGreen,
  pillRed: base.pillRed,
  pillAmber: base.pillAmber,
  pillLavender: base.pillLavender,
  background: base.background,
  primaryDark: base.primaryDark,
  success: base.success,
};

export function applyThemeToLuneraColors(colors: AppThemeColors): void {
  LuneraColors.primary = colors.primary;
  LuneraColors.primaryDeep = colors.primaryDeep;
  LuneraColors.primarySoft = colors.primarySoft;
  LuneraColors.accent = colors.accent;
  LuneraColors.accentSoft = colors.accentSoft;
  LuneraColors.bronze = colors.bronze;
  LuneraColors.lavender = colors.lavender;
  LuneraColors.bgLinen = colors.bgLinen;
  LuneraColors.bgMist = colors.bgMist;
  LuneraColors.surface = colors.surface;
  LuneraColors.surfaceGlass = colors.surfaceGlass;
  LuneraColors.text = colors.text;
  LuneraColors.textMuted = colors.textMuted;
  LuneraColors.textSerif = colors.textSerif;
  LuneraColors.menstrualStart = colors.menstrualStart;
  LuneraColors.menstrualEnd = colors.menstrualEnd;
  LuneraColors.fertileStart = colors.fertileStart;
  LuneraColors.fertileEnd = colors.fertileEnd;
  LuneraColors.ringTrack = colors.ringTrack;
  LuneraColors.ringGlass = colors.ringGlass;
  LuneraColors.background = colors.background;
  LuneraColors.primaryDark = colors.primaryDark;
  LuneraTheme.colors.primary = colors.primary;
  LuneraTheme.colors.secondary = colors.accent;
  LuneraTheme.colors.background = colors.background;
  LuneraTheme.colors.surface = colors.surface;
  LuneraTheme.colors.onSurface = colors.text;

  // Phase backgrounds tinted toward theme
  PhaseBackgrounds.menstrual = [colors.bgLinen, "#FAF5F4", "#F8F0F2"];
  PhaseBackgrounds.follicular = [colors.bgLinen, colors.bgMist, colors.bgMist];
  PhaseBackgrounds.ovulation = [colors.bgLinen, "#FBF5F0", "#F9EFE8"];
  PhaseBackgrounds.luteal = [colors.bgLinen, colors.bgMist, colors.bgMist];
  if (colors.id === "midnight") {
    PhaseBackgrounds.menstrual = [colors.bgLinen, "#1E1528", "#241828"];
    PhaseBackgrounds.follicular = [colors.bgLinen, colors.bgMist, "#1A2230"];
    PhaseBackgrounds.ovulation = [colors.bgLinen, "#241E30", "#2A1830"];
    PhaseBackgrounds.luteal = [colors.bgLinen, colors.bgMist, "#1A1528"];
  }
}

/** Fondos dinámicos según fase del ciclo */
export const PhaseBackgrounds: Record<CyclePhase, [string, string, string]> = {
  menstrual: ["#FBF9F6", "#FAF5F4", "#F8F0F2"],
  follicular: ["#FBF9F6", "#F9F8FB", "#F4F2F8"],
  ovulation: ["#FFF9F6", "#FBF5F0", "#F9EFE8"],
  luteal: ["#FBF9F6", "#F8F6FA", "#F3EFF6"],
};

export const PhaseRingGradients: Record<CyclePhase, [string, string]> = {
  menstrual: ["#E85D4C", "#D9467A"],
  follicular: ["#5B9A8B", "#8ECAB8"],
  ovulation: ["#E879A9", "#F5B8D4"],
  luteal: ["#4A3F6B", "#9A8BB8"],
};

export const LuneraTypography = {
  serif: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
  sans: Platform.select({ ios: "System", android: "sans-serif", default: "System" }),
  displayHuge: { fontSize: 64, fontWeight: "900" as const, letterSpacing: -2 },
  title: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.6 },
  cardTitle: { fontSize: 15, fontWeight: "700" as const },
  body: { fontSize: 15, lineHeight: 23, fontWeight: "400" as const },
  caption: { fontSize: 12, fontWeight: "500" as const },
};

export const LuneraShadows = {
  card: {
    shadowColor: "rgba(165, 145, 175, 1)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 6,
  },
  ringOuter: {
    shadowColor: "#4A3F6B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 10,
  },
  ringInner: {
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
};

export const LuneraTheme = {
  roundness: 24,
  colors: {
    primary: LuneraColors.primary,
    secondary: LuneraColors.accent,
    background: LuneraColors.bgLinen,
    surface: LuneraColors.surface,
    onSurface: LuneraColors.text,
  },
};
