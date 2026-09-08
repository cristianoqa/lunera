import React, { useMemo } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { Text, Button, Divider } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { APP_VERSION } from "../../constants/appVersion";
import { SCENE_TAB_CLEARANCE } from "../../utils/tabBarLayout";

const KOFI = "https://ko-fi.com/cristianodeveloper";
const PAYPAL = "https://paypal.me/cristianodeveloper";

/**
 * Tip voluntario (Ko-fi / PayPal) SOLO aquí — no desbloquea Pro.
 */
export default function AboutScreen() {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const navigation = useNavigation<any>();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { padding: 24, backgroundColor: colors.bgLinen, paddingBottom: SCENE_TAB_CLEARANCE },
        title: { fontWeight: "800", color: colors.text, marginBottom: 12 },
        body: { color: colors.textMuted, lineHeight: 22, marginBottom: 12 },
        ver: { fontWeight: "700", color: colors.primary, marginBottom: 8 },
        credits: { color: colors.textMuted, marginBottom: 8 },
        divider: { marginVertical: 20 },
        tipBox: {
          backgroundColor: colors.surfaceGlass,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(165,145,175,0.2)",
        },
        tipTitle: { fontWeight: "700", color: colors.text, marginBottom: 8 },
        tipBody: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: 12 },
        btn: { marginTop: 8, borderRadius: 12, borderColor: colors.lavender },
        faqBtn: { marginTop: 4, marginBottom: 8, borderRadius: 12 },
      }),
    [colors]
  );

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text variant="headlineSmall" style={styles.title}>
        Lunera
      </Text>
      <Text style={styles.body}>{t("about_body")}</Text>
      <Text style={styles.ver}>
        {t("version_label")}: {APP_VERSION}
      </Text>
      <Text style={styles.credits}>{t("about_credits")}</Text>

      <Button
        mode="outlined"
        icon="frequently-asked-questions"
        onPress={() => navigation.navigate("Faq")}
        style={styles.faqBtn}
        textColor={colors.primary}
      >
        {t("about_open_faq")}
      </Button>

      <Divider style={styles.divider} />

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>{t("support_subtitle")}</Text>
        <Text style={styles.tipBody}>{t("about_tip_disclaimer")}</Text>
        <Button mode="outlined" onPress={() => Linking.openURL(KOFI)} style={styles.btn} textColor={colors.primary}>
          Ko-fi
        </Button>
        <Button mode="outlined" onPress={() => Linking.openURL(PAYPAL)} style={styles.btn} textColor={colors.primary}>
          PayPal
        </Button>
      </View>
    </ScrollView>
  );
}
