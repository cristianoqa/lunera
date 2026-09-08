import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { List, Text, Divider } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { SCENE_TAB_CLEARANCE } from "../../utils/tabBarLayout";

interface FaqEntry {
  /** i18n key for the question */
  q: string;
  /** i18n key for the answer */
  a: string;
  /** Material Community icon name */
  icon: string;
}

/** All FAQ items, ordered by user journey: how it works → account → settings. */
const FAQ_ENTRIES: FaqEntry[] = [
  { q: "faq_q_prediction",  a: "faq_a_prediction",  icon: "chart-bell-curve" },
  { q: "faq_q_logging",     a: "faq_a_logging",     icon: "pencil-outline" },
  { q: "faq_q_guest",       a: "faq_a_guest",       icon: "account-question-outline" },
  { q: "faq_q_backup",      a: "faq_a_backup",      icon: "lock-outline" },
  { q: "faq_q_notifications", a: "faq_a_notifications", icon: "bell-outline" },
  { q: "faq_q_premium",     a: "faq_a_premium",     icon: "star-outline" },
  { q: "faq_q_settings",    a: "faq_a_settings",    icon: "cog-outline" },
  { q: "faq_q_learn_diff",  a: "faq_a_learn_diff",  icon: "book-open-outline" },
];

/**
 * Help / FAQ screen — explains how to USE Lunera (predictions, logging, account,
 * notifications, Premium, life-stage settings).
 *
 * This screen is intentionally separate from the Learn tab, which is a scientific
 * health encyclopedia.  Navigate here from Settings → FAQ.
 */
export default function FaqScreen() {
  const { t } = useTranslation();
  const colors = useAppTheme();
  // Only one accordion open at a time to reduce visual noise.
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggle = (key: string) =>
    setOpenKey((prev) => (prev === key ? null : key));

  return (
    <ScrollView
      style={[styles.wrap, { backgroundColor: colors.bgLinen }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {t("faq_subtitle")}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surfaceGlass }]}>
        {FAQ_ENTRIES.map(({ q, a, icon }, idx) => (
          <React.Fragment key={q}>
            {idx > 0 && <Divider />}
            <List.Accordion
              title={t(q)}
              titleStyle={[styles.qTitle, { color: colors.text }]}
              titleNumberOfLines={3}
              left={(p) => (
                <List.Icon {...p} icon={icon} color={colors.primary} />
              )}
              expanded={openKey === q}
              onPress={() => toggle(q)}
              style={styles.accordion}
            >
              <View
                style={[styles.answerWrap, { backgroundColor: colors.bgMist }]}
              >
                <Text style={[styles.answer, { color: colors.textMuted }]}>
                  {t(a)}
                </Text>
              </View>
            </List.Accordion>
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  content: { padding: 16, paddingBottom: SCENE_TAB_CLEARANCE },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  accordion: { backgroundColor: "transparent" },
  qTitle: { fontWeight: "600", fontSize: 14 },
  answerWrap: { paddingHorizontal: 20, paddingVertical: 12 },
  answer: { fontSize: 14, lineHeight: 22 },
});
