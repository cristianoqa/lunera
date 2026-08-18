import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Chip, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import type { AgeBand, KnownCondition, UserGoal } from "../../types/user";
import type { AppMode, ContraceptionMethod } from "../../types/lifeCycle";
import { useAppTheme } from "../../theme/AppThemeProvider";

const GOALS: { id: UserGoal; labelKey: string }[] = [
  { id: "track_cycle", labelKey: "goal_track" },
  { id: "try_pregnancy", labelKey: "goal_pregnancy" },
  { id: "learn_body", labelKey: "goal_learn" },
];

const AGE_BANDS: { id: AgeBand; labelKey: string }[] = [
  { id: "under_20", labelKey: "age_band_under_20" },
  { id: "20_29", labelKey: "age_band_20_29" },
  { id: "30_39", labelKey: "age_band_30_39" },
  { id: "40_49", labelKey: "age_band_40_49" },
  { id: "50_plus", labelKey: "age_band_50_plus" },
];

const CONDITIONS: { id: KnownCondition; labelKey: string }[] = [
  { id: "pcos", labelKey: "condition_pcos" },
  { id: "endometriosis", labelKey: "condition_endometriosis" },
  { id: "fibroids", labelKey: "condition_fibroids" },
  { id: "adenomyosis", labelKey: "condition_adenomyosis" },
  { id: "thyroid_disorder", labelKey: "condition_thyroid" },
];

const STAGES: { id: AppMode; labelKey: string }[] = [
  { id: "MENSTRUATION_TRACKING", labelKey: "life_mode_MENSTRUATION_TRACKING" },
  { id: "CONTRACEPTION_CONTROL", labelKey: "life_mode_CONTRACEPTION_CONTROL" },
  { id: "PREGNANCY_CARE", labelKey: "life_mode_PREGNANCY_CARE" },
  { id: "MENOPAUSE_SUPPORT", labelKey: "life_mode_MENOPAUSE_SUPPORT" },
];

const METHODS: { id: ContraceptionMethod; labelKey: string }[] = [
  { id: "pill_daily", labelKey: "life_method_pill_daily" },
  { id: "mini_pill", labelKey: "life_method_mini_pill" },
  { id: "patch_weekly", labelKey: "life_method_patch_weekly" },
  { id: "ring_monthly", labelKey: "life_method_ring_monthly" },
  { id: "injection_monthly", labelKey: "life_method_injection_monthly" },
  { id: "iud_implant", labelKey: "life_method_iud_implant" },
];

export default function GoalsScreen({ navigation, route }: { navigation: any; route: any }) {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const [selected, setSelected] = useState<UserGoal[]>(["track_cycle"]);
  const [ageBand, setAgeBand] = useState<AgeBand>("20_29");
  const [knownConditions, setKnownConditions] = useState<KnownCondition[]>([]);
  const [appMode, setAppMode] = useState<AppMode>("MENSTRUATION_TRACKING");
  const [contraceptionMethod, setContraceptionMethod] = useState<ContraceptionMethod>("pill_daily");

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { flex: 1, backgroundColor: colors.background, padding: 24 },
        title: { fontWeight: "800", color: colors.text, marginBottom: 8 },
        body: { color: colors.textMuted, marginBottom: 20 },
        sectionTitle: { fontWeight: "700", color: colors.text, marginTop: 12, marginBottom: 10 },
        chips: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
        chip: { marginBottom: 4 },
        btn: { marginTop: "auto", borderRadius: 14 },
      }),
    [colors]
  );

  const toggle = (goal: UserGoal) => {
    setSelected((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleCondition = (condition: KnownCondition) => {
    setKnownConditions((prev) =>
      prev.includes(condition) ? prev.filter((item) => item !== condition) : [...prev, condition]
    );
  };

  const onFinish = () => {
    navigation.navigate("Auth", {
      ...route.params,
      goals: selected.length ? selected : (["track_cycle"] as UserGoal[]),
      ageBand,
      knownConditions,
      initialMode: appMode,
      contraceptionMethod: appMode === "CONTRACEPTION_CONTROL" ? contraceptionMethod : null,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <Text variant="headlineSmall" style={styles.title}>
        {t("onboarding_goals_title")}
      </Text>
      <Text variant="bodyMedium" style={styles.body}>
        {t("onboarding_goals_body")}
      </Text>

      <Text style={styles.sectionTitle}>{t("onboarding_section_goal")}</Text>
      <View style={styles.chips}>
        {GOALS.map((g) => (
          <Chip
            key={g.id}
            selected={selected.includes(g.id)}
            onPress={() => toggle(g.id)}
            style={styles.chip}
            showSelectedOverlay
          >
            {t(g.labelKey)}
          </Chip>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{t("onboarding_section_age")}</Text>
      <View style={styles.chips}>
        {AGE_BANDS.map((item) => (
          <Chip
            key={item.id}
            selected={ageBand === item.id}
            onPress={() => setAgeBand(item.id)}
            style={styles.chip}
            showSelectedOverlay
          >
            {t(item.labelKey)}
          </Chip>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{t("onboarding_section_stage")}</Text>
      <View style={styles.chips}>
        {STAGES.map((item) => (
          <Chip
            key={item.id}
            selected={appMode === item.id}
            onPress={() => setAppMode(item.id)}
            style={styles.chip}
            showSelectedOverlay
          >
            {t(item.labelKey)}
          </Chip>
        ))}
      </View>

      {appMode === "CONTRACEPTION_CONTROL" ? (
        <>
          <Text style={styles.sectionTitle}>{t("onboarding_section_method")}</Text>
          <View style={styles.chips}>
            {METHODS.map((item) => (
              <Chip
                key={item.id}
                selected={contraceptionMethod === item.id}
                onPress={() => setContraceptionMethod(item.id)}
                style={styles.chip}
                showSelectedOverlay
              >
                {t(item.labelKey)}
              </Chip>
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>{t("onboarding_section_conditions")}</Text>
      <View style={styles.chips}>
        {CONDITIONS.map((item) => (
          <Chip
            key={item.id}
            selected={knownConditions.includes(item.id)}
            onPress={() => toggleCondition(item.id)}
            style={styles.chip}
            showSelectedOverlay
          >
            {t(item.labelKey)}
          </Chip>
        ))}
      </View>

      <Button mode="contained" onPress={onFinish} style={styles.btn}>
        {t("start")}
      </Button>
    </ScrollView>
  );
}
