import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, Divider } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAppStore } from "../../store/appStore";
import { clearSessionFlags, logoutToGuest, saveProfile } from "../../services/localAuthService";
import { APP_VERSION } from "../../constants/appVersion";
import { loadCycles, saveCycles } from "../../services/localStorage";
import { addDays } from "../../services/cyclePredictor";

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const hydrate = useAppStore((s) => s.hydrate);
  const recalculateAll = useAppStore((s) => s.recalculateAll);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [cycleLength, setCycleLength] = useState(String(profile?.averageCycleLength ?? 28));
  const [periodLength, setPeriodLength] = useState(String(profile?.averagePeriodLength ?? 5));
  const [lastPeriod, setLastPeriod] = useState(profile?.lastPeriodStart ?? "");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { padding: 24, backgroundColor: colors.bgLinen, paddingBottom: 48 },
        title: { fontWeight: "800", fontSize: 22, color: colors.text },
        meta: { color: colors.textMuted, marginBottom: 16, marginTop: 6 },
        input: { marginBottom: 10, backgroundColor: colors.surface },
        btn: { marginTop: 10, borderRadius: 12 },
        div: { marginVertical: 20 },
        hint: { color: colors.textMuted, fontSize: 13, marginBottom: 8, lineHeight: 18 },
      }),
    [colors]
  );

  if (!profile) return null;

  // Compat con authMode legacy de builds anteriores.
  const isGuest = profile.authMode === "guest";

  const onSave = async () => {
    setSaving(true);
    try {
      const periodLen = Math.min(10, Math.max(2, Number(periodLength) || 5));
      const cycleLen = Math.min(45, Math.max(21, Number(cycleLength) || 28));
      const next = {
        ...profile,
        displayName: displayName.trim() || profile.displayName,
        averageCycleLength: cycleLen,
        averagePeriodLength: periodLen,
        lastPeriodStart: lastPeriod || profile.lastPeriodStart,
        updatedAt: new Date().toISOString(),
      };
      await saveProfile(next);
      setProfile(next);

      // Sincroniza el ciclo ancla para que el calendario proyecte con la nueva duración
      const all = await loadCycles();
      const mine = all.filter((c) => c.userId === next.id).sort((a, b) => a.startDate.localeCompare(b.startDate));
      if (mine.length && next.lastPeriodStart) {
        const anchor = mine.find((c) => c.startDate === next.lastPeriodStart) ?? mine[mine.length - 1];
        const updated = all.map((c) =>
          c.id === anchor.id
            ? {
                ...c,
                periodLength: periodLen,
                endDate: addDays(c.startDate, periodLen - 1),
                cycleLength: c.cycleLength ?? cycleLen,
                source: "confirmed" as const,
              }
            : c
        );
        await saveCycles(updated);
        useAppStore.setState({ cycles: updated.filter((c) => c.userId === next.id) });
      }

      await hydrate(next.id);
      await recalculateAll();
      Alert.alert(t("profile_title"), t("profile_saved"));
    } finally {
      setSaving(false);
    }
  };

  const onLogout = () => {
    Alert.alert(t("profile_logout"), t("profile_logout_confirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("profile_logout"),
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            // Si hubo sesión Supabase, cerrarla también para evitar re-login fantasma.
            try {
              const auth = await import("../../services/authService");
              await auth.signOut();
            } catch {}
            const guest = await logoutToGuest(profile);
            await clearSessionFlags();
            setProfile(guest);
            await hydrate(guest.id);
            Alert.alert(t("profile_logout"), t("profile_logout_done"));
            navigation.reset({ index: 0, routes: [{ name: "SettingsMain" }] });
          } catch {
            Alert.alert(t("profile_logout"), t("auth_error"));
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t("profile_title")}</Text>
      <Text style={styles.meta}>
        {isGuest ? t("settings_login_sync_hint") : t("settings_account_synced")} · Lunera {APP_VERSION}
      </Text>

      <TextInput
        mode="outlined"
        label={t("profile_display_name")}
        value={displayName}
        onChangeText={setDisplayName}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label={t("last_period")}
        value={lastPeriod ?? ""}
        onChangeText={setLastPeriod}
        placeholder="YYYY-MM-DD"
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label={t("cycle_length")}
        value={cycleLength}
        onChangeText={setCycleLength}
        keyboardType="number-pad"
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label={t("period_length")}
        value={periodLength}
        onChangeText={setPeriodLength}
        keyboardType="number-pad"
        style={styles.input}
      />

      <Button mode="contained" onPress={onSave} loading={saving} style={styles.btn}>
        {t("profile_save")}
      </Button>

      {isGuest ? (
        <Button mode="outlined" onPress={() => navigation.navigate("Account")} style={styles.btn}>
          {t("settings_login_sync")}
        </Button>
      ) : (
        <>
          <Divider style={styles.div} />
          <Text style={styles.hint}>{t("profile_link_hint")}</Text>
          <Button
            mode="outlined"
            textColor={colors.pillRed}
            onPress={onLogout}
            style={styles.btn}
            loading={loggingOut}
            disabled={loggingOut}
          >
            {t("profile_logout")}
          </Button>
        </>
      )}
    </ScrollView>
  );
}
