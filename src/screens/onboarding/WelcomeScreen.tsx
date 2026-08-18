import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../theme/AppThemeProvider";

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const { t } = useTranslation();
  const colors = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "space-between" },
        hero: { flex: 1, justifyContent: "center" },
        emoji: { fontSize: 56, marginBottom: 16 },
        title: { fontWeight: "800", color: colors.text, marginBottom: 12 },
        body: { color: colors.textMuted, lineHeight: 24 },
        btn: { borderRadius: 14, paddingVertical: 6 },
      }),
    [colors]
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
      </View>
      <Button mode="contained" onPress={() => navigation.navigate("CycleSetup")} style={styles.btn}>
        {t("continue")}
      </Button>
    </View>
  );
}
