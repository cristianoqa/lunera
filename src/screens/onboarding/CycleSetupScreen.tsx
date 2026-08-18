import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { clampCycleLength, todayISOLocal } from "../../services/cyclePredictor";
import { useAppTheme } from "../../theme/AppThemeProvider";

export default function CycleSetupScreen({ navigation, route }: { navigation: any; route: any }) {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const today = todayISOLocal();
  const [lastPeriodStart, setLastPeriodStart] = useState(today);
  const [averageCycleLength, setAverageCycleLength] = useState("28");
  const [averagePeriodLength, setAveragePeriodLength] = useState("5");

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { flexGrow: 1, backgroundColor: colors.background, padding: 24 },
        title: { fontWeight: "800", color: colors.text, marginBottom: 8 },
        body: { color: colors.textMuted, marginBottom: 20 },
        input: { marginBottom: 12, backgroundColor: colors.surface },
        btn: { marginTop: 8, borderRadius: 14 },
      }),
    [colors]
  );

  const onContinue = () => {
    navigation.navigate("Goals", {
      ...route.params,
      lastPeriodStart,
      averageCycleLength: clampCycleLength(Number(averageCycleLength) || 28),
      averagePeriodLength: Math.min(10, Math.max(2, Number(averagePeriodLength) || 5)),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <Text variant="headlineSmall" style={styles.title}>
        {t("onboarding_cycle_title")}
      </Text>
      <Text variant="bodyMedium" style={styles.body}>
        {t("onboarding_cycle_body")}
      </Text>

      <TextInput
        mode="outlined"
        label={t("last_period")}
        value={lastPeriodStart}
        onChangeText={setLastPeriodStart}
        placeholder="YYYY-MM-DD"
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label={t("cycle_length")}
        value={averageCycleLength}
        onChangeText={setAverageCycleLength}
        keyboardType="number-pad"
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label={t("period_length")}
        value={averagePeriodLength}
        onChangeText={setAveragePeriodLength}
        keyboardType="number-pad"
        style={styles.input}
      />

      <Button mode="contained" onPress={onContinue} style={styles.btn}>
        {t("continue")}
      </Button>
    </ScrollView>
  );
}
