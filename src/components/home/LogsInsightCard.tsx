import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import OrganicCard from "../ui/OrganicCard";
import SymptomPills from "./SymptomPills";
import { LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { SymptomPill } from "../../utils/symptomSummary";

interface Props {
  label: string;
  pills: SymptomPill[];
  emptyHint: string;
  caption?: string;
  onPress?: () => void;
}

/** Resumen tappable de días recientes — sin número grande (se confundía con el día del ciclo). */
export default function LogsInsightCard({ label, pills, emptyHint, caption, onPress }: Props) {
  const colors = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityHint={onPress ? "Abre el registro de hoy" : undefined}
    >
      <OrganicCard>
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
            <MaterialCommunityIcons name="notebook-edit-outline" size={20} color={colors.bronze} />
          </View>
          <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        </View>
        {pills.length > 0 ? (
          <SymptomPills pills={pills} />
        ) : (
          <Text style={[styles.empty, { color: colors.textMuted }]}>{emptyHint}</Text>
        )}
        {caption ? <Text style={[styles.caption, { color: colors.textMuted }]}>{caption}</Text> : null}
      </OrganicCard>
    </Pressable>
  );
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
  empty: { fontSize: 13, marginTop: 12, lineHeight: 19 },
  caption: { fontSize: 12, marginTop: 12, lineHeight: 18, fontWeight: "500" },
});
