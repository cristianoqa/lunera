import React from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { List, Text, Divider, SegmentedButtons } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAppStore } from "../../store/appStore";
import { exportEncryptedBackup, shareBackup, importEncryptedBackup } from "../../services/backupService";
import { ensureNotificationPermission } from "../../services/notificationService";
import SettingsPremiumBanner from "../../components/settings/SettingsPremiumBanner";
import type { AppThemeId, LocaleCode } from "../../types/config";
import { APP_THEME_IDS, APP_THEMES } from "../../constants/appThemes";
import { APP_VERSION } from "../../constants/appVersion";

function legalUrls(lang: LocaleCode) {
  const privacy =
    lang === "en"
      ? "https://cristianoqa.github.io/policies/lunera.html"
      : lang === "pt"
        ? "https://cristianoqa.github.io/policies/lunera-pt.html"
        : "https://cristianoqa.github.io/policies/lunera-es.html";
  const terms =
    lang === "en"
      ? "https://cristianoqa.github.io/policies/lunera-terms.html"
      : lang === "pt"
        ? "https://cristianoqa.github.io/policies/lunera-terms-pt.html"
        : "https://cristianoqa.github.io/policies/lunera-terms-es.html";
  return { privacy, terms };
}

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const { t, i18n } = useTranslation();
  const colors = useAppTheme();
  const profile = useAppStore((s) => s.profile);
  const config = useAppStore((s) => s.config);
  const prediction = useAppStore((s) => s.prediction);
  const logs = useAppStore((s) => s.logs);
  const clinicalAlerts = useAppStore((s) => s.clinicalAlerts);
  const updateConfig = useAppStore((s) => s.updateConfig);

  // Compat: perfiles antiguos pueden traer authMode legacy; todo lo que no sea guest
  // se trata como sesión iniciada para no ocultar acciones de cuenta/logout.
  const isGuest = profile?.authMode === "guest";
  const premiumActive = !!config?.premiumActive;
  const lang = (config?.locale ?? (i18n.language.startsWith("pt") ? "pt" : i18n.language.startsWith("en") ? "en" : "es")) as LocaleCode;
  const legal = legalUrls(lang);

  const setLanguage = async (locale: LocaleCode) => {
    await i18n.changeLanguage(locale);
    if (config) await updateConfig({ locale });
  };

  const toggleLock = async (value: boolean) => {
    if (!config) return;
    await updateConfig({ appLockEnabled: value });
  };

  const toggleReminders = async (value: boolean) => {
    if (!config) return;
    if (value) {
      const ok = await ensureNotificationPermission();
      if (!ok) return;
    }
    await updateConfig({ dailyReminderEnabled: value });
  };

  const openAccountOrProfile = () => {
    if (isGuest) navigation.navigate("Account");
    else navigation.navigate("Profile");
  };

  const exportPdf = async () => {
    if (!profile || !premiumActive) {
      navigation.navigate("Premium");
      return;
    }
    const { Alert } = await import("react-native");
    const { runMedicalPdfAction, saveMedicalPdf } = await import("../../services/pdfReportService");
    Alert.alert(t("pdf_export_title"), t("pdf_export_body"), [
      {
        text: t("pdf_action_save"),
        onPress: async () => {
          const res = await saveMedicalPdf({ profile, prediction, logs, locale: lang, clinicalAlerts });
          Alert.alert(
            res.savedToDownloads ? t("pdf_saved_title") : t("pdf_save_as_title"),
            res.message
          );
        },
      },
      {
        text: t("pdf_action_share"),
        onPress: () => runMedicalPdfAction("share", { profile, prediction, logs, locale: lang, clinicalAlerts }),
      },
      {
        text: t("pdf_action_both"),
        onPress: async () => {
          const res = await saveMedicalPdf({ profile, prediction, logs, locale: lang, clinicalAlerts });
          await runMedicalPdfAction("share", { profile, prediction, logs, locale: lang, clinicalAlerts });
          Alert.alert(
            res.savedToDownloads ? t("pdf_saved_title") : t("pdf_save_as_title"),
            res.message
          );
        },
      },
      { text: t("cancel"), style: "cancel" },
    ]);
  };

  const backup = async () => {
    const path = await exportEncryptedBackup();
    await shareBackup(path);
  };

  const restore = async () => {
    const ok = await importEncryptedBackup();
    if (ok && profile) await useAppStore.getState().hydrate(profile.id);
  };

  return (
    <ScrollView
      style={[styles.wrap, { backgroundColor: colors.bgLinen }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <SettingsPremiumBanner
        title={t("settings_pro_title")}
        subtitle={t("settings_pro_subtitle")}
        cta={t("settings_pro_cta")}
        features={[t("premium_feat_pdf"), t("premium_feat_insights"), t("premium_feat_sync")]}
        active={premiumActive}
        activeLabel={t("premium_active")}
        onPress={() => navigation.navigate("Premium")}
      />

      <List.Section>
        <List.Subheader style={[styles.sectionTitle, { color: colors.textMuted }]}>
          {t("settings_account_security")}
        </List.Subheader>
        <View style={[styles.card, { backgroundColor: colors.surfaceGlass }]}>
          <List.Item
            title={isGuest ? t("settings_login_sync") : t("profile_manage")}
            description={
              isGuest
                ? t("settings_login_sync_hint")
                : profile?.displayName ?? t("settings_account_synced")
            }
            left={(p) => (
              <List.Icon
                {...p}
                icon={isGuest ? "account-plus-outline" : "account-cog-outline"}
                color={colors.primary}
              />
            )}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={openAccountOrProfile}
            titleStyle={[styles.rowTitle, { color: colors.text }]}
          />
          <Divider />
          <List.Item
            title={t("settings_app_lock")}
            description={t("settings_app_lock_hint")}
            left={(p) => <List.Icon {...p} icon="fingerprint" color={colors.primary} />}
            right={() => (
              <Switch
                value={!!config?.appLockEnabled}
                onValueChange={toggleLock}
                trackColor={{ false: "#D8D2E0", true: colors.lavender }}
                thumbColor={config?.appLockEnabled ? colors.primary : "#f4f3f4"}
              />
            )}
            titleStyle={[styles.rowTitle, { color: colors.text }]}
          />
          <Divider />
          <List.Item
            title={t("life_mode_title")}
            description={t(`life_mode_${config?.appMode ?? "MENSTRUATION_TRACKING"}`)}
            left={(p) => <List.Icon {...p} icon="heart-pulse" color={colors.primary} />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() => navigation.navigate("LifeMode")}
            titleStyle={[styles.rowTitle, { color: colors.text }]}
          />
          <Divider />
          <List.Item
            title={t("settings_reminders")}
            left={(p) => <List.Icon {...p} icon="bell-outline" color={colors.primary} />}
            right={() => (
              <Switch
                value={!!config?.dailyReminderEnabled}
                onValueChange={toggleReminders}
                trackColor={{ false: "#D8D2E0", true: colors.lavender }}
                thumbColor={config?.dailyReminderEnabled ? colors.primary : "#f4f3f4"}
              />
            )}
            titleStyle={[styles.rowTitle, { color: colors.text }]}
          />
          <Divider />
          <View style={styles.langBlock}>
            <Text style={[styles.langLabel, { color: colors.text }]}>{t("settings_language")}</Text>
            <SegmentedButtons
              value={lang}
              onValueChange={(v) => setLanguage(v as LocaleCode)}
              buttons={[
                { value: "es", label: "ES" },
                { value: "en", label: "EN" },
                { value: "pt", label: "PT" },
              ]}
            />
          </View>
          <Divider />
          <List.Item
            title={t("emoji_customize_title")}
            description={t("emoji_customize_hint")}
            left={(p) => <List.Icon {...p} icon="emoticon-outline" color={colors.primary} />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() => navigation.navigate("CustomizeIcons")}
            titleStyle={[styles.rowTitle, { color: colors.text }]}
          />
          <Divider />
          <List.Item
            title={t("ai_chat_title")}
            description={t("ai_chat_hint")}
            left={(p) => <List.Icon {...p} icon="robot-happy-outline" color={colors.primary} />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() => {
              const root = navigation.getParent()?.getParent() ?? navigation.getParent() ?? navigation;
              root.navigate("AiChat");
            }}
            titleStyle={[styles.rowTitle, { color: colors.text }]}
          />
          <Divider />
          <View style={styles.langBlock}>
            <Text style={[styles.langLabel, { color: colors.text }]}>{t("settings_theme")}</Text>
            <View style={styles.themeGrid}>
              {APP_THEME_IDS.map((id) => {
                const theme = APP_THEMES[id];
                const selected = (config?.appThemeId ?? "linen") === id;
                return (
                  <Pressable
                    key={id}
                    onPress={() => updateConfig({ appThemeId: id as AppThemeId })}
                    style={[
                      styles.themeCard,
                      { backgroundColor: colors.bgMist },
                      selected && { borderColor: colors.primary },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <View style={styles.themeSwatches}>
                      {theme.preview.map((c) => (
                        <View key={c} style={[styles.swatch, { backgroundColor: c }]} />
                      ))}
                    </View>
                    <Text style={[styles.themeName, { color: colors.text }]}>{t(theme.nameKey)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </List.Section>

      <List.Section>
        <List.Subheader style={[styles.sectionTitle, { color: colors.textMuted }]}>
          {t("settings_data")}
        </List.Subheader>
        <View style={[styles.card, { backgroundColor: colors.surfaceGlass }]}>
          <List.Item
            title={t("settings_backup")}
            left={(p) => <List.Icon {...p} icon="export" color={colors.bronze} />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={backup}
            titleStyle={[styles.rowTitle, { color: colors.text }]}
          />
          <Divider />
          <List.Item
            title={t("settings_restore")}
            left={(p) => <List.Icon {...p} icon="import" color={colors.bronze} />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={restore}
            titleStyle={[styles.rowTitle, { color: colors.text }]}
          />
          <Divider />
          <List.Item
            title={t("settings_pdf")}
            description={premiumActive ? t("settings_pdf_ok") : t("premium_locked")}
            left={(p) => <List.Icon {...p} icon="file-pdf-box" color={colors.bronze} />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={exportPdf}
            titleStyle={[styles.rowTitle, { color: colors.text }]}
          />
        </View>
      </List.Section>

      <List.Section>
        <List.Subheader style={[styles.sectionTitle, { color: colors.textMuted }]}>
          {t("settings_legal_support")}
        </List.Subheader>
        <View style={[styles.card, { backgroundColor: colors.surfaceGlass }]}>
          <List.Item
            title={t("settings_privacy")}
            left={(p) => <List.Icon {...p} icon="shield-check-outline" color={colors.primary} />}
            right={(p) => <List.Icon {...p} icon="open-in-new" />}
            onPress={() => Linking.openURL(legal.privacy)}
            titleStyle={[styles.rowTitle, { color: colors.text }]}
          />
          <Divider />
          <List.Item
            title={t("settings_terms")}
            left={(p) => <List.Icon {...p} icon="file-document-outline" color={colors.primary} />}
            right={(p) => <List.Icon {...p} icon="open-in-new" />}
            onPress={() => Linking.openURL(legal.terms)}
            titleStyle={[styles.rowTitle, { color: colors.text }]}
          />
          <Divider />
          <List.Item
            title={t("settings_contact_support")}
            left={(p) => <List.Icon {...p} icon="lifebuoy" color={colors.primary} />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() => navigation.navigate("Support")}
            titleStyle={[styles.rowTitle, { color: colors.text }]}
          />
        </View>
      </List.Section>

      <List.Section>
        <List.Subheader style={[styles.sectionTitle, { color: colors.textMuted }]}>
          {t("settings_about")}
        </List.Subheader>
        <View style={[styles.card, { backgroundColor: colors.surfaceGlass }]}>
          <List.Item
            title={t("about_title")}
            description={`${t("version_label")} ${APP_VERSION} · ${t("about_credits")}`}
            left={(p) => <List.Icon {...p} icon="information-outline" color={colors.primary} />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() => navigation.navigate("About")}
            titleStyle={[styles.rowTitle, { color: colors.text }]}
          />
        </View>
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  content: { paddingBottom: 120 },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  rowTitle: { fontWeight: "600" },
  langBlock: { paddingHorizontal: 16, paddingVertical: 12 },
  langLabel: { fontWeight: "700", marginBottom: 10 },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  themeCard: {
    width: "47%",
    borderRadius: 14,
    padding: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  themeSwatches: { flexDirection: "row", gap: 4, marginBottom: 8 },
  swatch: { flex: 1, height: 18, borderRadius: 6 },
  themeName: { fontSize: 12, fontWeight: "700" },
});
