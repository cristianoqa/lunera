import React, { useMemo } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Text, Button, Checkbox } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { legalUrls } from "../settings/legalUrls";

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const { t, i18n } = useTranslation();
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();
  const [accepted, setAccepted] = React.useState(false);
  const lang = (i18n.language?.slice(0, 2) ?? "es") as "es" | "en" | "pt";
  const legal = legalUrls(lang);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flex: 1,
          backgroundColor: colors.background,
          paddingHorizontal: 24,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
          justifyContent: "space-between",
        },
        hero: { flex: 1, justifyContent: "center" },
        emoji: { fontSize: 56, marginBottom: 16 },
        title: { fontWeight: "800", color: colors.text, marginBottom: 12 },
        body: { color: colors.textMuted, lineHeight: 24 },
        disclaimer: { color: colors.textMuted, fontSize: 13, lineHeight: 20, marginTop: 16 },
        legalRow: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 },
        legalText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18 },
        link: { color: colors.primary, fontWeight: "700" },
        btn: { borderRadius: 14, paddingVertical: 6 },
      }),
    [colors, insets.bottom, insets.top]
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🌙</Text>
        <Text variant="headlineMedium" style={styles.title}>
          {t("onboarding_welcome_title")}
        </Text>
        <Text variant="bodyLarge" style={styles.body}>
          {t("onboarding_welcome_body")}
        </Text>
        <Text style={styles.disclaimer}>{t("health_disclaimer_short")}</Text>
        <View style={styles.legalRow}>
          <Checkbox
            status={accepted ? "checked" : "unchecked"}
            onPress={() => setAccepted((v) => !v)}
          />
          <Text style={styles.legalText}>
            {t("onboarding_legal_accept")}{" "}
            <Text style={styles.link} onPress={() => Linking.openURL(legal.privacy)}>
              {t("settings_privacy")}
            </Text>
            {" "}
            {t("onboarding_legal_and")}{" "}
            <Text style={styles.link} onPress={() => Linking.openURL(legal.terms)}>
              {t("settings_terms")}
            </Text>
          </Text>
        </View>
      </View>
      <Button
        mode="contained"
        disabled={!accepted}
        onPress={() => navigation.navigate("CycleSetup")}
        style={styles.btn}
      >
        {t("continue")}
      </Button>
    </View>
  );
}
