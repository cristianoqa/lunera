import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import OrganicCard from "../ui/OrganicCard";
import { LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { MenopauseAdvice } from "../../content/menopauseAdvice";

interface Props {
  kicker: string;
  advice: MenopauseAdvice;
  symptomScore?: number | null;
}

export default function MenopausePanel({ kicker, advice, symptomScore }: Props) {
  const colors = useAppTheme();
  return (
    <OrganicCard>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <MaterialCommunityIcons name="spa-outline" size={20} color={colors.bronze} />
        </View>
        <Text style={[styles.kicker, { color: colors.accent }]}>{kicker}</Text>
      </View>
      <Text style={[styles.title, { fontFamily: LuneraTypography.serif, color: colors.textSerif }]}>
        {advice.title}
      </Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{advice.body}</Text>
      {typeof symptomScore === "number" ? (
        <Text style={[styles.check, { color: colors.text }]}>Carga reciente de síntomas: {symptomScore}/30</Text>
      ) : null}
      <Text style={[styles.check, { color: colors.textMuted }]}>{advice.checkup}</Text>
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
  check: { marginTop: 12, fontSize: 13, lineHeight: 19, fontWeight: "600" },
});
