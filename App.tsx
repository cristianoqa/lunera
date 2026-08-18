import React, { useMemo } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import "./src/i18n";
import RootNavigator from "./src/navigation/RootNavigator";
import { AppThemeProvider, useAppTheme } from "./src/theme/AppThemeProvider";
import { LuneraTheme } from "./src/constants/theme";

function ThemedApp() {
  const colors = useAppTheme();
  const isDark = colors.id === "midnight";
  const theme = useMemo(
    () => ({
      ...(isDark ? MD3DarkTheme : MD3LightTheme),
      roundness: LuneraTheme.roundness,
      colors: {
        ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
        primary: colors.primary,
        secondary: colors.accent,
        background: colors.background,
        surface: colors.surface,
        onSurface: colors.text,
      },
    }),
    [colors, isDark]
  );

  return (
    <PaperProvider theme={theme}>
      <RootNavigator />
      <StatusBar style={isDark ? "light" : "dark"} />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <ThemedApp />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
