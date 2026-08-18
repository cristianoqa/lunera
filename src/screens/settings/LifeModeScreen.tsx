import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, SegmentedButtons, Text, TextInput } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAppStore } from "../../store/appStore";
import type { AppMode, ContraceptionMethod } from "../../types/lifeCycle";
import { DEFAULT_APP_MODE } from "../../types/lifeCycle";
import { naegeleDueDate } from "../../services/pregnancyService";
import { todayISOLocal } from "../../services/cyclePredictor";
import { saveProfile } from "../../services/localAuthService";
import { closeOpenCycles } from "../../services/cycleRecalculationService";
import { validateLifeModeInput } from "../../services/lifeCycleService";

const MODES: AppMode[] = [
  "MENSTRUATION_TRACKING",
  "CONTRACEPTION_CONTROL",
  "PREGNANCY_CARE",
  "MENOPAUSE_SUPPORT",
];

const METHODS: ContraceptionMethod[] = [
  "pill_daily",
  "mini_pill",
  "patch_weekly",
  "ring_monthly",
  "injection_monthly",
  "iud_implant",
];

export default function LifeModeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const colors = useAppTheme();
  const config = useAppStore((s) => s.config);
  const profile = useAppStore((s) => s.profile);
  const cycles = useAppStore((s) => s.cycles);
  const updateConfig = useAppStore((s) => s.updateConfig);
  const setProfile = useAppStore((s) => s.setProfile);
  const recalculateAll = useAppStore((s) => s.recalculateAll);

  const [mode, setMode] = useState<AppMode>(config?.appMode ?? DEFAULT_APP_MODE);
  const [lmp, setLmp] = useState(config?.pregnancy?.lastMenstrualPeriod ?? profile?.lastPeriodStart ?? todayISOLocal());
  const [method, setMethod] = useState<ContraceptionMethod>(config?.contraception?.method ?? "pill_daily");
  const [combined, setCombined] = useState(config?.contraception?.combinedPill ?? true);
  const [time, setTime] = useState(config?.contraception?.reminderTime ?? "09:00");
  const [packStart, setPackStart] = useState(config?.contraception?.packStartDate ?? todayISOLocal());
  const [saving, setSaving] = useState(false);

  const duePreview = useMemo(() => {
    try {
      return /^\d{4}-\d{2}-\d{2}$/.test(lmp) ? naegeleDueDate(lmp) : "";
    } catch {
      return "";
    }
  }, [lmp]);

  const goHome = () => {
    const tabs = navigation.getParent();
    tabs?.navigate("HomeTab");
  };

  const persistMode = async () => {
    if (!config || !profile) return;
    const today = todayISOLocal();
    const check = validateLifeModeInput({
      mode,
      lmp,
      packStart,
      reminderTime: time,
      today,
    });
    if (!check.ok) {
      Alert.alert(t("life_mode_title"), t(check.messageKey));
      return;
    }

    setSaving(true);
    try {
      if (mode === "MENOPAUSE_SUPPORT" || mode === "PREGNANCY_CARE") {
        useAppStore.setState({ cycles: closeOpenCycles(cycles, today) });
      }

      if (mode === "PREGNANCY_CARE") {
        const dueDate = naegeleDueDate(lmp);
        await updateConfig({
          appMode: mode,
          pregnancy: {
            lastMenstrualPeriod: lmp,
            dueDate,
            babyBornAt: config.pregnancy?.babyBornAt ?? null,
          },
        });
        const next = { ...profile, lastPeriodStart: lmp, updatedAt: new Date().toISOString() };
        await saveProfile(next);
        setProfile(next);
      } else if (mode === "CONTRACEPTION_CONTROL") {
        await updateConfig({
          appMode: mode,
          contraception: {
            method,
            reminderTime: time,
            combinedPill: method === "pill_daily" ? combined : false,
            packStartDate: packStart,
            reviewDate: config.contraception?.reviewDate ?? null,
          },
        });
      } else if (mode === "MENOPAUSE_SUPPORT") {
        await updateConfig({
          appMode: mode,
          menopause: { lastBleedDate: profile.lastPeriodStart },
        });
      } else {
        await updateConfig({ appMode: mode });
      }
      await recalculateAll();
      Alert.alert(t("life_mode_title"), t("life_mode_saved_home"), [
        { text: t("life_mode_go_home"), onPress: goHome },
      ]);
    } catch {
      Alert.alert(t("life_mode_title"), t("life_mode_save_error"));
    } finally {
      setSaving(false);
    }
  };

  const apply = () => {
    if (!config || !profile) return;
    const today = todayISOLocal();
    const check = validateLifeModeInput({
      mode,
      lmp,
      packStart,
      reminderTime: time,
      today,
    });
    if (!check.ok) {
      Alert.alert(t("life_mode_title"), t(check.messageKey));
      return;
    }
    Alert.alert(t("life_mode_confirm_title"), t(`life_mode_confirm_${mode}`), [
      { text: t("cancel"), style: "cancel" },
      { text: t("life_mode_confirm_ok"), onPress: () => persistMode() },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgLinen }}
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.lead, { color: colors.textMuted }]}>{t("life_mode_body")}</Text>

      {MODES.map((id) => {
        const selected = mode === id;
        return (
          <Pressable
            key={id}
            onPress={() => setMode(id)}
            style={[
              styles.modeCard,
              { backgroundColor: colors.surfaceGlass, borderColor: selected ? colors.primary : "transparent" },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.modeTitle, { color: colors.text }]}>{t(`life_mode_${id}`)}</Text>
            <Text style={[styles.modeHint, { color: colors.textMuted }]}>{t(`life_mode_${id}_hint`)}</Text>
          </Pressable>
        );
      })}

      {mode === "PREGNANCY_CARE" ? (
        <View style={styles.block}>
          <TextInput
            mode="outlined"
            label={t("life_mode_lmp")}
            value={lmp}
            onChangeText={setLmp}
            placeholder="YYYY-MM-DD"
            style={[styles.input, { backgroundColor: colors.surface }]}
          />
          {duePreview ? (
            <Text style={{ color: colors.textMuted, marginBottom: 8 }}>
              {t("life_mode_due_preview", { date: duePreview })}
            </Text>
          ) : null}
        </View>
      ) : null}

      {mode === "CONTRACEPTION_CONTROL" ? (
        <View style={styles.block}>
          <Text style={[styles.blockTitle, { color: colors.text }]}>{t("life_mode_method")}</Text>
          {METHODS.map((m) => (
            <Pressable
              key={m}
              onPress={() => setMethod(m)}
              style={[
                styles.methodRow,
                { borderColor: method === m ? colors.primary : "rgba(165,145,175,0.25)" },
              ]}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>{t(`life_method_${m}`)}</Text>
            </Pressable>
          ))}
          {method === "pill_daily" ? (
            <>
              <Text style={[styles.blockTitle, { color: colors.text, marginTop: 12 }]}>
                {t("life_mode_combined")}
              </Text>
              <SegmentedButtons
                value={combined ? "yes" : "no"}
                onValueChange={(v) => setCombined(v === "yes")}
                buttons={[
                  { value: "yes", label: t("life_mode_yes") },
                  { value: "no", label: t("life_mode_no") },
                ]}
              />
              <TextInput
                mode="outlined"
                label={t("life_mode_pill_time")}
                value={time}
                onChangeText={setTime}
                placeholder="09:00"
                style={[styles.input, { backgroundColor: colors.surface, marginTop: 12 }]}
              />
            </>
          ) : (
            <TextInput
              mode="outlined"
              label={t("life_mode_reminder_time")}
              value={time}
              onChangeText={setTime}
              placeholder="09:00"
              style={[styles.input, { backgroundColor: colors.surface, marginTop: 12 }]}
            />
          )}
          <TextInput
            mode="outlined"
            label={t("life_mode_pack_start")}
            value={packStart}
            onChangeText={setPackStart}
            placeholder="YYYY-MM-DD"
            style={[styles.input, { backgroundColor: colors.surface }]}
          />
        </View>
      ) : null}

      <Button mode="contained" onPress={apply} loading={saving} style={styles.btn}>
        {t("life_mode_apply")}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 48 },
  lead: { lineHeight: 20, marginBottom: 16 },
  modeCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
  },
  modeTitle: { fontWeight: "800", fontSize: 16 },
  modeHint: { marginTop: 4, fontSize: 13, lineHeight: 18 },
  block: { marginTop: 8, marginBottom: 12 },
  blockTitle: { fontWeight: "700", marginBottom: 8 },
  methodRow: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  input: { marginBottom: 10 },
  btn: { marginTop: 8, borderRadius: 14 },
});
