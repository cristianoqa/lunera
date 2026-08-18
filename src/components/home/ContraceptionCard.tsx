import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import OrganicCard from "../ui/OrganicCard";
import { LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { ContraceptionMethod } from "../../types/lifeCycle";

interface Props {
  method: ContraceptionMethod;
  timeLabel: string;
  title: string;
  body: string;
}

const ICONS: Record<
  ContraceptionMethod,
  "pill" | "bandage" | "needle" | "shield-check-outline" | "circle-slice-8"
> = {
  pill_daily: "pill",
  mini_pill: "pill",
  patch_weekly: "bandage",
  ring_monthly: "circle-slice-8",
  injection_monthly: "needle",
  iud_implant: "shield-check-outline",
};

export default function ContraceptionCard({ method, timeLabel, title, body }: Props) {
  const colors = useAppTheme();
  return (
    <OrganicCard>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
          <MaterialCommunityIcons name={ICONS[method]} size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.kicker, { color: colors.accent }]}>{title}</Text>
          {timeLabel ? (
            <Text style={[styles.time, { color: colors.text }]}>{timeLabel}</Text>
          ) : null}
        </View>
      </View>
      <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
    </OrganicCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: { fontWeight: "700", fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase" },
  time: { fontSize: 22, fontWeight: "900", marginTop: 2, letterSpacing: -0.4 },
  body: { ...LuneraTypography.body },
});
