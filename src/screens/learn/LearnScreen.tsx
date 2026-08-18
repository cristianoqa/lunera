import React, { useMemo, useState } from "react";
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, UIManager, View } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LuneraShadows, LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";
import { ENCYCLOPEDIA_DISCLAIMER_ES, ENCYCLOPEDIA_ES } from "../../content/encyclopedia/es";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LearnScreen() {
  const { t } = useTranslation();
  const colors = useAppTheme();
  const [openCategory, setOpenCategory] = useState<string | null>(ENCYCLOPEDIA_ES[0]?.id ?? null);
  const [openArticle, setOpenArticle] = useState<string | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: {
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 130,
          backgroundColor: colors.bgLinen,
        },
        heroTitle: {
          fontFamily: LuneraTypography.serif,
          fontSize: 28,
          fontWeight: "800",
          color: colors.textSerif,
          letterSpacing: -0.5,
        },
        heroSub: {
          color: colors.textMuted,
          marginTop: 6,
          marginBottom: 20,
          lineHeight: 22,
        },
        card: {
          backgroundColor: colors.surfaceGlass,
          borderRadius: 24,
          marginBottom: 14,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(165,145,175,0.15)",
          ...LuneraShadows.card,
        },
        categoryHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 18,
        },
        categoryTitle: {
          flex: 1,
          fontFamily: LuneraTypography.serif,
          fontSize: 17,
          fontWeight: "700",
          color: colors.text,
          paddingRight: 12,
        },
        articleWrap: {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "rgba(165,145,175,0.2)",
        },
        articleHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 14,
          gap: 12,
        },
        articleTitle: {
          flex: 1,
          fontSize: 15,
          fontWeight: "600",
          color: colors.textSerif,
          lineHeight: 21,
        },
        articleBody: {
          paddingHorizontal: 20,
          paddingBottom: 16,
          color: colors.textMuted,
          lineHeight: 22,
          fontSize: 14,
        },
        disclaimer: {
          flexDirection: "row",
          gap: 10,
          marginTop: 8,
          padding: 16,
          borderRadius: 24,
          backgroundColor: "rgba(74,63,107,0.06)",
        },
        disclaimerText: {
          flex: 1,
          fontSize: 12,
          lineHeight: 18,
          color: colors.textMuted,
        },
      }),
    [colors]
  );

  const toggleCategory = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenCategory((prev) => (prev === id ? null : id));
    setOpenArticle(null);
  };

  const toggleArticle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenArticle((prev) => (prev === id ? null : id));
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.heroTitle}>{t("learn_title")}</Text>
      <Text style={styles.heroSub}>{t("learn_subtitle")}</Text>

      {ENCYCLOPEDIA_ES.map((category) => {
        const catOpen = openCategory === category.id;
        return (
          <View key={category.id} style={styles.card}>
            <Pressable
              onPress={() => toggleCategory(category.id)}
              style={styles.categoryHeader}
              accessibilityRole="button"
              accessibilityState={{ expanded: catOpen }}
            >
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <MaterialCommunityIcons
                name={catOpen ? "chevron-up" : "chevron-down"}
                size={22}
                color={colors.primary}
              />
            </Pressable>

            {catOpen
              ? category.articles.map((article) => {
                  const artOpen = openArticle === article.id;
                  return (
                    <View key={article.id} style={styles.articleWrap}>
                      <Pressable
                        onPress={() => toggleArticle(article.id)}
                        style={styles.articleHeader}
                        accessibilityRole="button"
                        accessibilityState={{ expanded: artOpen }}
                      >
                        <Text style={styles.articleTitle}>{article.title}</Text>
                        <MaterialCommunityIcons
                          name={artOpen ? "minus-circle-outline" : "plus-circle-outline"}
                          size={20}
                          color={colors.accent}
                        />
                      </Pressable>
                      {artOpen ? <Text style={styles.articleBody}>{article.body}</Text> : null}
                    </View>
                  );
                })
              : null}
          </View>
        );
      })}

      <View style={styles.disclaimer}>
        <MaterialCommunityIcons name="information-outline" size={18} color={colors.textMuted} />
        <Text style={styles.disclaimerText}>{ENCYCLOPEDIA_DISCLAIMER_ES}</Text>
      </View>
    </ScrollView>
  );
}
