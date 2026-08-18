import React, { createContext, useContext, useEffect, useMemo } from "react";
import {
  APP_THEMES,
  DEFAULT_THEME_ID,
  resolveAppTheme,
  type AppThemeColors,
  type AppThemeId,
} from "../constants/appThemes";
import { applyThemeToLuneraColors } from "../constants/theme";
import { useAppStore } from "../store/appStore";

const ThemeContext = createContext<AppThemeColors>(APP_THEMES[DEFAULT_THEME_ID]);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useAppStore((s) => s.config?.appThemeId ?? DEFAULT_THEME_ID);
  const colors = useMemo(() => resolveAppTheme(themeId), [themeId]);

  // Sync before paint so PhaseBackgrounds / mutable LuneraColors match the active theme
  applyThemeToLuneraColors(colors);

  useEffect(() => {
    applyThemeToLuneraColors(colors);
  }, [colors]);

  return (
    <ThemeContext.Provider value={colors}>
      {/* Remount UI tree so screens rebuild with the new palette */}
      <React.Fragment key={themeId}>{children}</React.Fragment>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeColors {
  return useContext(ThemeContext);
}

export function useAppThemeId(): AppThemeId {
  return useAppStore((s) => (s.config?.appThemeId as AppThemeId) ?? DEFAULT_THEME_ID);
}
