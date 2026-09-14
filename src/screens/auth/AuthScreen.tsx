import React, { useMemo, useState } from "react";
import { Alert, Linking, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { buildProfileFromOnboarding, useAppStore } from "../../store/appStore";
import type { UserGoal } from "../../types/user";
import { defaultConfig, saveConfig, migrateUserData, loadCycles, saveCycles } from "../../services/localStorage";
import { seedCyclesFromProfile } from "../../services/cycleRecalculationService";
import { ensureNotificationPermission } from "../../services/notificationService";
import { registerLocalAccount } from "../../services/localAuthService";
import { sincronizarDatosLocalesAlServidor } from "../../services/cloudSyncService";
import { isSupabaseConfigured } from "../../services/supabaseConfig";
import { naegeleDueDate } from "../../services/pregnancyService";
import { legalUrls } from "../settings/legalUrls";
import type { LocaleCode } from "../../types/config";

const KEY_ONBOARDING = "lunera:onboarding_done";

export default function AuthScreen({ navigation, route }: { navigation: any; route: any }) {
  const { t, i18n } = useTranslation();
  const colors = useAppTheme();
  const lang = (i18n.language?.slice(0, 2) ?? "es") as LocaleCode;
  const legal = legalUrls(lang === "pt" ? "pt" : lang === "en" ? "en" : "es");
  const setProfile = useAppStore((s) => s.setProfile);
  const hydrate = useAppStore((s) => s.hydrate);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { flexGrow: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" },
        title: { fontWeight: "800", color: colors.text, marginBottom: 24, textAlign: "center" },
        primary: { borderRadius: 14, marginBottom: 8 },
        secondary: { marginTop: 16, borderRadius: 14 },
        hint: { color: colors.textMuted, textAlign: "center", marginBottom: 16 },
        form: { marginTop: 12 },
        formHint: { color: colors.textMuted, marginBottom: 12, lineHeight: 20 },
        input: { marginBottom: 10, backgroundColor: colors.surface },
        pwdHint: { color: colors.textMuted, fontSize: 12, marginBottom: 12 },
        error: { color: colors.pillRed, fontWeight: "700", marginBottom: 12, lineHeight: 18 },
        privacy: { color: colors.textMuted, textAlign: "center", marginTop: 16, fontSize: 13, lineHeight: 20 },
        privacyLink: { color: colors.primary, fontWeight: "700" },
      }),
    [colors]
  );

  const onboardingBase = () => ({
    lastPeriodStart: route.params?.lastPeriodStart,
    averageCycleLength: route.params?.averageCycleLength ?? 28,
    averagePeriodLength: route.params?.averagePeriodLength ?? 5,
    goals: (route.params?.goals ?? ["track_cycle"]) as UserGoal[],
    ageBand: route.params?.ageBand ?? null,
    knownConditions: route.params?.knownConditions ?? [],
    hasPartner: route.params?.hasPartner ?? null,
  });

  const configFromOnboarding = (userId: string) => {
    const initialMode = route.params?.initialMode;
    const contraceptionMethod = route.params?.contraceptionMethod;
    const config = defaultConfig(userId);
    if (initialMode === "PREGNANCY_CARE" && route.params?.lastPeriodStart) {
      config.appMode = "PREGNANCY_CARE";
      config.pregnancy = {
        lastMenstrualPeriod: route.params.lastPeriodStart,
        dueDate: naegeleDueDate(route.params.lastPeriodStart),
        babyBornAt: null,
        prenatalVisitNotes: [],
        lastKickCountAt: null,
      };
    } else if (initialMode === "MENOPAUSE_SUPPORT") {
      config.appMode = "MENOPAUSE_SUPPORT";
      config.menopause = { lastBleedDate: route.params?.lastPeriodStart ?? null, mrsScore: null, lastAssessmentAt: null };
    } else if (initialMode === "CONTRACEPTION_CONTROL") {
      config.appMode = "CONTRACEPTION_CONTROL";
      config.contraception = {
        method: contraceptionMethod ?? "pill_daily",
        reminderTime: "09:00",
        combinedPill: contraceptionMethod === "pill_daily",
        packStartDate: route.params?.lastPeriodStart ?? new Date().toISOString().slice(0, 10),
        reviewDate: null,
      };
    }
    return config;
  };

  const finishGuest = async () => {
    if (busy) return;
    setBusy(true);
    setFormError(null);
    try {
    const id = `guest_${Date.now()}`;
    const profile = buildProfileFromOnboarding({ id, ...onboardingBase() });
    const config = configFromOnboarding(id);
    await AsyncStorage.setItem(KEY_ONBOARDING, "1");
    await AsyncStorage.setItem("lunera:profile", JSON.stringify(profile));
    await saveConfig(config);
    const existing = await loadCycles();
    await saveCycles([...existing, ...seedCyclesFromProfile(profile)]);
    await ensureNotificationPermission();
    setProfile(profile);
    await hydrate(id);
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } catch {
      setFormError(t("auth_error"));
    } finally {
      setBusy(false);
    }
  };

  const finishWithAccount = async () => {
    if (busy) return;
    if (!email.includes("@") || password.length < 6) {
      const msg = t("auth_invalid");
      setFormError(msg);
      if (Platform.OS !== "web") Alert.alert(t("auth_title"), msg);
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      const guestId = `guest_${Date.now()}`;
      const guest = buildProfileFromOnboarding({ id: guestId, ...onboardingBase() });
      await AsyncStorage.setItem(KEY_ONBOARDING, "1");
      await AsyncStorage.setItem("lunera:profile", JSON.stringify(guest));
      await saveConfig(configFromOnboarding(guestId));

      let upgraded = guest;
      if (isSupabaseConfigured()) {
        const auth = await import("../../services/authService");
        upgraded = await auth.signUpWithEmail(email.trim(), password);
      } else {
        upgraded = await registerLocalAccount({ email, password, profile: guest });
      }

      await migrateUserData(guestId, upgraded.id);
      const existing = await loadCycles();
      await saveCycles([...existing.filter((c) => c.userId !== upgraded.id), ...seedCyclesFromProfile(upgraded)]);
      await saveConfig({ ...configFromOnboarding(upgraded.id) });
      await ensureNotificationPermission();
      setProfile(upgraded);
      await hydrate(upgraded.id);
      void sincronizarDatosLocalesAlServidor(upgraded).catch(() => {});
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } catch (e: unknown) {
      const code = String((e as { message?: string })?.message ?? e);
      const map: Record<string, string> = {
        email_taken: t("auth_email_taken"),
        invalid_credentials: t("auth_invalid"),
        "User already registered": t("auth_email_taken"),
      };
      const msg = map[code] ?? (code.includes("already") ? t("auth_email_taken") : t("auth_error"));
      setFormError(msg);
      if (Platform.OS !== "web") Alert.alert(t("auth_title"), msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <Text variant="headlineSmall" style={styles.title}>
        {t("auth_title")}
      </Text>

      <Button mode="contained" onPress={finishGuest} loading={busy} disabled={busy} style={styles.primary}>
        {t("auth_guest")}
      </Button>
      <Text variant="bodySmall" style={styles.hint}>
        {t("auth_guest_hint")}
      </Text>
      {formError ? (
        <Text style={styles.error}>{formError}</Text>
      ) : null}

      {!showForm ? (
        <Button mode="outlined" onPress={() => setShowForm(true)} style={styles.secondary}>
          {t("auth_email")}
        </Button>
      ) : (
        <View style={styles.form}>
          <Text style={styles.formHint}>{t("auth_account_body")}</Text>
          <TextInput
            mode="outlined"
            label={t("auth_email_label")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label={t("auth_password_label")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <Text style={styles.pwdHint}>{t("auth_password_hint")}</Text>
          <Button mode="contained" loading={busy} disabled={busy} onPress={finishWithAccount} style={styles.primary}>
            {t("auth_register")}
          </Button>
        </View>
      )}

      <Button mode="text" onPress={finishGuest} disabled={busy}>
        {t("auth_later")}
      </Button>
      <Text style={styles.privacy}>
        {t("onboarding_legal_accept")}{" "}
        <Text style={styles.privacyLink} onPress={() => Linking.openURL(legal.privacy)}>
          {t("settings_privacy")}
        </Text>
        {" "}
        {t("onboarding_legal_and")}{" "}
        <Text style={styles.privacyLink} onPress={() => Linking.openURL(legal.terms)}>
          {t("settings_terms")}
        </Text>
      </Text>
    </ScrollView>
  );
}

export async function isOnboardingDone(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY_ONBOARDING)) === "1";
}

export async function loadStoredProfile(): Promise<ReturnType<typeof buildProfileFromOnboarding> | null> {
  const raw = await AsyncStorage.getItem("lunera:profile");
  return raw ? JSON.parse(raw) : null;
}
