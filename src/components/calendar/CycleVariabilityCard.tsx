import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import OrganicCard from "../ui/OrganicCard";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { CycleVariability } from "../../types/calendar";

interface Props {
  variability: CycleVariability;
}

export default function CycleVariabilityCard({ variability }: Props) {
  const { t } = useTranslation();
  const colors = useAppTheme();

  const body =
    variability.messageKey === "calendar_variability_range" && variability.minDays != null && variability.maxDays != null
      ? t("calendar_variability_range", { min: variability.minDays, max: variability.maxDays })
      : t("calendar_variability_none");

  return (
    <OrganicCard>
      <View style={styles.header}>
        <MaterialCommunityIcons name="heart-pulse" size={22} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>{t("calendar_variability_title")}</Text>
      </View>
      <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
    </OrganicCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: "800", flex: 1 },
  body: { lineHeight: 22, fontSize: 14 },
});
