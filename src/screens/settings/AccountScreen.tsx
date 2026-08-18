import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Button, Text, TextInput, SegmentedButtons } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAppStore } from "../../store/appStore";
import { loginLocalAccount, registerLocalAccount } from "../../services/localAuthService";
import { saveConfig, loadConfig, migrateUserData } from "../../services/localStorage";
import { sincronizarDatosLocalesAlServidor } from "../../services/cloudSyncService";

type Mode = "login" | "register";

export default function AccountScreen({ navigation }: { navigation: any }) {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const hydrate = useAppStore((s) => s.hydrate);
  const [mode, setMode] = useState<Mode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { padding: 24, backgroundColor: colors.bgLinen, paddingBottom: 48 },
        title: { fontWeight: "800", fontSize: 22, color: colors.text, marginBottom: 8 },
        body: { color: colors.textMuted, marginBottom: 16, lineHeight: 20 },
        seg: { marginBottom: 16 },
        input: { marginBottom: 10, backgroundColor: colors.surface },
        hint: { color: colors.textMuted, fontSize: 12, marginBottom: 12 },
        btn: { borderRadius: 12, marginTop: 4 },
        footer: { color: colors.textMuted, fontSize: 12, marginTop: 16, lineHeight: 18 },
      }),
    [colors]
  );

  const onSubmit = async () => {
    if (!profile) return;
    if (!email.includes("@") || password.length < 6) {
      Alert.alert(t("auth_title"), t("auth_invalid"));
      return;
    }
    setBusy(true);
    try {
      if (mode === "register") {
        const oldId = profile.id;
        const upgraded = await registerLocalAccount({ email, password, profile });
        await migrateUserData(oldId, upgraded.id);
        const oldCfg = await loadConfig(upgraded.id);
        await saveConfig({ ...oldCfg, userId: upgraded.id });
        setProfile(upgraded);
        await hydrate(upgraded.id);
        await sincronizarDatosLocalesAlServidor(upgraded).catch(() => {});
        Alert.alert(t("auth_title"), t("auth_register_ok"));
      } else {
        const logged = await loginLocalAccount(email, password);
        setProfile(logged);
        await hydrate(logged.id);
        await sincronizarDatosLocalesAlServidor(logged).catch(() => {});
        Alert.alert(t("auth_title"), t("auth_login_ok"));
      }
      navigation.navigate("Profile");
    } catch (e: any) {
      const code = String(e?.message ?? e);
      const map: Record<string, string> = {
        email_taken: t("auth_email_taken"),
        wrong_password: t("auth_wrong_password"),
        wrong_email: t("auth_wrong_email"),
        no_account: t("auth_no_account"),
        invalid_credentials: t("auth_invalid"),
      };
      Alert.alert(t("auth_title"), map[code] ?? t("auth_error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t("settings_login_sync")}</Text>
      <Text style={styles.body}>{t("auth_account_body")}</Text>

      <SegmentedButtons
        value={mode}
        onValueChange={(v) => setMode(v as Mode)}
        buttons={[
          { value: "register", label: t("auth_register") },
          { value: "login", label: t("auth_login") },
        ]}
        style={styles.seg}
      />

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
      <Text style={styles.hint}>{t("auth_password_hint")}</Text>

      <Button mode="contained" onPress={onSubmit} loading={busy} style={styles.btn}>
        {mode === "register" ? t("auth_register") : t("auth_login")}
      </Button>
      <Text style={styles.footer}>{t("auth_link_guest_hint")}</Text>
    </ScrollView>
  );
}
