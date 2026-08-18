import React from "react";
import { View, StyleSheet, Platform, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/AppThemeProvider";

const ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  HomeTab: "home-outline",
  CalendarTab: "calendar-month-outline",
  LogTab: "notebook-edit-outline",
  InsightsTab: "chart-line",
  LearnTab: "book-open-page-variant-outline",
  SettingsTab: "cog-outline",
};

export default function PremiumTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useAppTheme();
  const bottomPad = Math.max(insets.bottom, 10);
  const shellBg =
    Platform.OS === "android"
      ? colors.id === "midnight"
        ? "rgba(22, 18, 42, 0.94)"
        : "rgba(251, 249, 246, 0.94)"
      : "transparent";

  return (
    <View style={[styles.shell, { paddingBottom: bottomPad, backgroundColor: shellBg }]}>
      <BlurView intensity={Platform.OS === "ios" ? 80 : 56} tint={colors.id === "midnight" ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const focused = state.index === index;
          const color = focused ? colors.primary : colors.textMuted;
          const icon = ICONS[route.name] ?? "circle-outline";

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (event.defaultPrevented) return;
                // Home/Insights abren Premium dentro de Ajustes; al pulsar la pestaña
                // hay que volver siempre a la lista, no al paywall.
                if (route.name === "SettingsTab") {
                  navigation.navigate("SettingsTab", { screen: "SettingsMain" });
                  return;
                }
                if (!focused) navigation.navigate(route.name);
              }}
              style={styles.tab}
            >
              {focused ? <View style={[styles.activeCurve, { backgroundColor: colors.primary }]} /> : <View style={styles.curvePlaceholder} />}
              <MaterialCommunityIcons name={icon} size={focused ? 24 : 22} color={color} />
              <Text style={[styles.label, { color, fontWeight: focused ? "700" : "500" }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(165, 145, 175, 0.12)",
  },
  row: {
    flexDirection: "row",
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 3,
  },
  label: { fontSize: 10, marginTop: 2 },
  activeCurve: {
    width: 28,
    height: 4,
    borderRadius: 4,
    marginBottom: 4,
    opacity: 0.9,
  },
  curvePlaceholder: { width: 28, height: 4, marginBottom: 4 },
});
