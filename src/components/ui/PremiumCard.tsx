import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { LuneraColors, LuneraShadows } from "../../constants/theme";

interface Props {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  hint?: string;
  hintIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: ViewStyle;
}

/** Tarjeta flotante premium con sombra suave */
export default function PremiumCard({ label, value, icon, hint, hintIcon, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <MaterialCommunityIcons name={icon} size={18} color={LuneraColors.primary} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {hint ? (
        <View style={styles.hintRow}>
          {hintIcon ? (
            <MaterialCommunityIcons name={hintIcon} size={15} color={LuneraColors.textMuted} style={styles.hintIcon} />
          ) : null}
          <Text style={styles.hint}>{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: LuneraColors.surfaceGlass,
    borderRadius: 20,
    padding: 18,
    marginTop: 14,
    ...LuneraShadows.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: LuneraColors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: LuneraColors.textMuted, fontWeight: "600", fontSize: 14, flex: 1 },
  value: {
    fontSize: 28,
    fontWeight: "800",
    color: LuneraColors.primary,
    marginTop: 10,
    letterSpacing: -0.5,
  },
  hintRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  hintIcon: { marginRight: 6 },
  hint: { color: LuneraColors.textMuted, fontSize: 13, flex: 1, lineHeight: 18 },
});
