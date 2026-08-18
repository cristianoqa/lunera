import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import OrganicCard from "../ui/OrganicCard";
import { LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { PregnancyWeekCopy } from "../../content/pregnancyWeeks";

interface Props {
  week: number;
  dueDate: string;
  copy: PregnancyWeekCopy;
  bornLabel: string;
  checklistLine?: string;
  onBabyBorn: () => void;
}

export default function PregnancyWeekCard({ week, dueDate, copy, bornLabel, checklistLine, onBabyBorn }: Props) {
  const colors = useAppTheme();
  return (
    <OrganicCard>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
          <MaterialCommunityIcons name="baby-face-outline" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.kicker, { color: colors.accent }]}>{`Semana ${week}`}</Text>
      </View>
      <Text style={[styles.title, { fontFamily: LuneraTypography.serif, color: colors.textSerif }]}>
        {`Tamaño de una ${copy.fruit}`}
      </Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{copy.development}</Text>
      <Text style={[styles.body, { color: colors.textMuted, marginTop: 8 }]}>{copy.advice}</Text>
      {checklistLine ? <Text style={[styles.due, { color: colors.text }]}>{checklistLine}</Text> : null}
      <Text style={[styles.due, { color: colors.textMuted }]}>{`FPP · ${dueDate}`}</Text>
      <Pressable
        onPress={onBabyBorn}
        style={[styles.btn, { backgroundColor: colors.primarySoft }]}
        accessibilityRole="button"
      >
        <Text style={[styles.btnText, { color: colors.primary }]}>{bornLabel}</Text>
      </Pressable>
    </OrganicCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: { fontWeight: "700", fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 8, lineHeight: 26 },
  body: { ...LuneraTypography.body },
  due: { marginTop: 12, fontSize: 13, fontWeight: "600" },
  btn: {
    marginTop: 14,
    alignSelf: "flex-start",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  btnText: { fontWeight: "800", fontSize: 14 },
});
