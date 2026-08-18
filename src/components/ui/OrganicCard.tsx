import React, { useMemo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LuneraShadows } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Tarjeta flotante orgánica — colores del tema activo */
export default function OrganicCard({ children, style }: Props) {
  const colors = useAppTheme();
  const themed = useMemo(
    () => ({
      backgroundColor: colors.surfaceGlass,
      borderColor: colors.id === "midnight" ? "rgba(255,255,255,0.08)" : "rgba(255, 255, 255, 0.7)",
    }),
    [colors]
  );
  return <View style={[styles.card, themed, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginTop: 16,
    ...LuneraShadows.card,
    borderWidth: 1,
  },
});
