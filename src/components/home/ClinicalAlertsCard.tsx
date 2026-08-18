import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import OrganicCard from "../ui/OrganicCard";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { ClinicalAlert } from "../../types/clinical";

interface Props {
  title: string;
  alerts: ClinicalAlert[];
  translate: (key: string, opts?: Record<string, unknown>) => string;
}

const severityColor = {
  info: "#8B7BA8",
  warning: "#C7791A",
  urgent: "#B42318",
} as const;

export default function ClinicalAlertsCard({ title, alerts, translate }: Props) {
  const colors = useAppTheme();
  if (!alerts.length) return null;

  return (
    <OrganicCard>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {alerts.map((alert) => (
        <View key={alert.code} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: severityColor[alert.severity] }]} />
          <View style={styles.copy}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              {translate(alert.titleKey, alert.metadata)}
            </Text>
            <Text style={[styles.itemBody, { color: colors.textMuted }]}>
              {translate(alert.bodyKey, alert.metadata)}
            </Text>
          </View>
        </View>
      ))}
    </OrganicCard>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "800", fontSize: 18, marginBottom: 10 },
  item: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  copy: { flex: 1 },
  itemTitle: { fontWeight: "700", fontSize: 14, lineHeight: 20 },
  itemBody: { marginTop: 2, fontSize: 13, lineHeight: 19 },
});
