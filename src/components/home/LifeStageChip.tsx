import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../theme/AppThemeProvider";

interface Props {
  kicker: string;
  label: string;
  onPress: () => void;
}

/** Acceso visible en Inicio para ver / cambiar la etapa de vida. */
export default function LifeStageChip({ kicker, label, onPress }: Props) {
  const colors = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${kicker}: ${label}`}
      style={({ pressed }) => [
        styles.wrap,
        { backgroundColor: colors.surfaceGlass, borderColor: `${colors.primary}33` },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
        <MaterialCommunityIcons name="heart-pulse" size={18} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.kicker, { color: colors.textMuted }]}>{kicker}</Text>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1 },
  kicker: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" },
  label: { fontSize: 15, fontWeight: "800", marginTop: 2 },
});
