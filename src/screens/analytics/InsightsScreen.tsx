import React, { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAppStore } from "../../store/appStore";
import { InsightBarChart, InsightLineChart } from "../../components/analytics/InsightCharts";
import { LogSectionColors } from "../../constants/logColors";

function shortLabel(iso: string): string {
  const parts = iso.split("-");
  return `${parts[2]}/${parts[1]}`;
}

export default function InsightsScreen() {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const navigation = useNavigation<any>();
  const logs = useAppStore((s) => s.logs);
  const config = useAppStore((s) => s.config);
  const prediction = useAppStore((s) => s.prediction);

  const sorted = useMemo(() => [...logs].sort((a, b) => a.date.localeCompare(b.date)).slice(-14), [logs]);

  const painSeries = useMemo(
    () => sorted.map((l) => ({ label: shortLabel(l.date), value: l.pain })),
    [sorted]
  );
  const bleedingSeries = useMemo(
    () => sorted.map((l) => ({ label: shortLabel(l.date), value: l.bleeding })),
    [sorted]
  );

  const lutealHeadache = useMemo(
    () => logs.filter((l) => l.phase === "luteal" && l.symptoms.includes("headache")).length,
    [logs]
  );

  const avgPainLuteal = useMemo(() => {
    const luteal = logs.filter((l) => l.phase === "luteal" && l.pain > 0);
    if (!luteal.length) return "—";
    return (luteal.reduce((a, b) => a + b.pain, 0) / luteal.length).toFixed(1);
  }, [logs]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { padding: 20, backgroundColor: colors.bgLinen, paddingBottom: 130 },
        title: { fontWeight: "800", marginBottom: 4, color: colors.text },
        sub: { color: colors.textMuted, marginBottom: 14, lineHeight: 20 },
        rowCards: { flexDirection: "row", gap: 10 },
        stat: {
          backgroundColor: colors.surfaceGlass,
          borderRadius: 14,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.7)",
        },
        premium: { borderColor: colors.accent },
        label: { color: colors.textMuted, fontWeight: "600", fontSize: 12 },
        value: { fontSize: 20, fontWeight: "800", color: colors.primary, marginTop: 6 },
      }),
    [colors]
  );

  const openPremium = () => navigation.navigate("SettingsTab", { screen: "Premium" });

  return (
    <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <Text variant="titleLarge" style={styles.title}>
        {t("insights_title")}
      </Text>
      <Text style={styles.sub}>{t("insights_subtitle")}</Text>

      <InsightLineChart
        title={t("insight_chart_pain")}
        points={painSeries}
        color={LogSectionColors.pain.accent}
        emptyLabel={t("insights_empty_chart")}
      />

      <InsightBarChart
        title={t("insight_chart_bleeding")}
        points={bleedingSeries}
        color={LogSectionColors.bleeding.accent}
        emptyLabel={t("insights_empty_chart")}
      />

      <View style={styles.rowCards}>
        <View style={[styles.stat, { flex: 1 }]}>
          <Text style={styles.label}>{t("insight_headache_luteal")}</Text>
          <Text style={styles.value}>
            {lutealHeadache} {t("insight_days")}
          </Text>
        </View>
        <View style={[styles.stat, { flex: 1 }]}>
          <Text style={styles.label}>{t("insight_pain_luteal")}</Text>
          <Text style={styles.value}>{avgPainLuteal}</Text>
        </View>
      </View>

      <View style={styles.stat}>
        <Text style={styles.label}>{t("insight_phase_today")}</Text>
        <Text style={styles.value}>
          {prediction ? t(`phase_${prediction.currentPhase}`) : "—"}
        </Text>
      </View>

      {!config?.premiumActive && (
        <View style={[styles.stat, styles.premium]}>
          <Text style={styles.label}>{t("premium_locked")}</Text>
          <Text style={styles.sub}>{t("premium_insights_hint")}</Text>
          <Button mode="contained" onPress={openPremium} style={{ marginTop: 8 }}>
            {t("premium_cta")}
          </Button>
        </View>
      )}
    </ScrollView>
  );
}
