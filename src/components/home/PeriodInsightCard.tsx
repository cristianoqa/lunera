import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import OrganicCard from "../ui/OrganicCard";
import { LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";

interface Props {
  label: string;
  value: string;
  fertileHint: string;
  onPress?: () => void;
}

export default function PeriodInsightCard({ label, value, fertileHint, onPress }: Props) {
  const colors = useAppTheme();
  const content = (
    <>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
          <MaterialCommunityIcons name="calendar-star" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: colors.primary }]}>{value}</Text>
      <View style={styles.hintRow}>
        <MaterialCommunityIcons name="flower-outline" size={16} color={colors.lavender} />
        <Text style={[styles.hint, { color: colors.textMuted }]}>{fertileHint}</Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        <OrganicCard>{content}</OrganicCard>
      </Pressable>
    );
  }

  return <OrganicCard>{content}</OrganicCard>;
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { ...LuneraTypography.cardTitle, flex: 1 },
  value: {
    fontSize: 32,
    fontWeight: "900",
    marginTop: 8,
    letterSpacing: -0.8,
  },
  hintRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 12 },
  hint: { flex: 1, fontSize: 13, lineHeight: 19 },
});
