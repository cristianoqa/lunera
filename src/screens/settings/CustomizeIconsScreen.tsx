import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { useAppStore } from "../../store/appStore";
import {
  DEFAULT_EMOJI_CONFIG,
  EMOJI_OPTIONS,
  normalizeEmojiConfig,
  type EmojiCategory,
} from "../../constants/calendarEmojis";

const CATEGORIES: { key: EmojiCategory; titleKey: string; hintKey: string }[] = [
  { key: "menstruation", titleKey: "emoji_cat_menstruation", hintKey: "emoji_cat_menstruation_hint" },
  { key: "ovulation", titleKey: "emoji_cat_ovulation", hintKey: "emoji_cat_ovulation_hint" },
  { key: "fertility", titleKey: "emoji_cat_fertility", hintKey: "emoji_cat_fertility_hint" },
];

export default function CustomizeIconsScreen() {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const config = useAppStore((s) => s.config);
  const updateConfig = useAppStore((s) => s.updateConfig);
  const emojis = normalizeEmojiConfig(config?.calendarEmojis);
  const [expanded, setExpanded] = useState<EmojiCategory | null>("menstruation");

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { flex: 1, backgroundColor: colors.bgLinen },
        content: { padding: 20, paddingBottom: 120 },
        lead: { color: colors.textMuted, lineHeight: 22, marginBottom: 20 },
        card: {
          backgroundColor: colors.surfaceGlass,
          borderRadius: 18,
          padding: 14,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.7)",
        },
        row: { flexDirection: "row", alignItems: "center", gap: 12 },
        preview: {
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        },
        previewEmoji: { fontSize: 24 },
        copy: { flex: 1 },
        title: { fontWeight: "800", color: colors.text, fontSize: 16 },
        hint: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
        chevron: { color: colors.textMuted, fontSize: 16, paddingHorizontal: 4 },
        options: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingTop: 14, paddingBottom: 4 },
        option: {
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: colors.bgMist,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: "transparent",
        },
        optionSelected: {
          borderColor: colors.primary,
          backgroundColor: colors.primarySoft,
        },
        optionEmoji: { fontSize: 26 },
        reset: { marginTop: 8, borderRadius: 14, borderColor: colors.lavender },
      }),
    [colors]
  );

  const selectEmoji = async (category: EmojiCategory, emoji: string) => {
    if (!config) return;
    await updateConfig({
      calendarEmojis: { ...emojis, [category]: emoji },
    });
  };

  const resetDefaults = async () => {
    if (!config) return;
    await updateConfig({ calendarEmojis: { ...DEFAULT_EMOJI_CONFIG } });
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.lead}>{t("emoji_customize_body")}</Text>

      {CATEGORIES.map((cat) => {
        const current = emojis[cat.key];
        const open = expanded === cat.key;
        return (
          <View key={cat.key} style={styles.card}>
            <Pressable
              onPress={() => setExpanded(open ? null : cat.key)}
              style={styles.row}
              accessibilityRole="button"
            >
              <View style={styles.preview}>
                <Text style={styles.previewEmoji}>{current}</Text>
              </View>
              <View style={styles.copy}>
                <Text style={styles.title}>{t(cat.titleKey)}</Text>
                <Text style={styles.hint}>{t(cat.hintKey)}</Text>
              </View>
              <Text style={styles.chevron}>{open ? "▲" : "▼"}</Text>
            </Pressable>

            {open ? (
              <View style={styles.options}>
                {EMOJI_OPTIONS[cat.key].map((opt) => {
                  const selected = opt === current;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => selectEmoji(cat.key, opt)}
                      style={[styles.option, selected && styles.optionSelected]}
                    >
                      <Text style={styles.optionEmoji}>{opt}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}

      <Button mode="outlined" onPress={resetDefaults} style={styles.reset} textColor={colors.primary}>
        {t("emoji_reset_defaults")}
      </Button>
    </ScrollView>
  );
}
