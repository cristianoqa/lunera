import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import OrganicCard from "../ui/OrganicCard";
import { LuneraTypography } from "../../constants/theme";
import { useAppTheme } from "../../theme/AppThemeProvider";
import type { BodyInsight } from "../../utils/bodyInsight";
import { AI_DISCLAIMER } from "../../services/luneraAiService";

interface Props {
  title: string;
  insight: BodyInsight;
  askLabel?: string;
  onAskAi?: () => void;
}

export default function BodyTodayCard({ title, insight, askLabel, onAskAi }: Props) {
  const colors = useAppTheme();
  return (
    <OrganicCard style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${insight.accent}18` }]}>
          <MaterialCommunityIcons name="creation" size={20} color={insight.accent} />
        </View>
        <Text style={[styles.kicker, { color: colors.accent }]}>{title}</Text>
      </View>
      <Text style={[styles.insightTitle, { fontFamily: LuneraTypography.serif, color: colors.textSerif }]}>
        {insight.title}
      </Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{insight.body}</Text>
      {onAskAi && askLabel ? (
        <Pressable
          style={[styles.askBtn, { backgroundColor: colors.primarySoft }]}
          onPress={onAskAi}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="robot-happy-outline" size={18} color={colors.primary} />
          <Text style={[styles.askText, { color: colors.primary }]}>{askLabel}</Text>
        </Pressable>
      ) : null}
      <Text style={[styles.disclaimer, { color: colors.textMuted }]}>{AI_DISCLAIMER}</Text>
    </OrganicCard>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 8 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: {
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    lineHeight: 26,
  },
  body: {
    ...LuneraTypography.body,
  },
  askBtn: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  askText: { fontWeight: "800", fontSize: 13 },
  disclaimer: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 16,
  },
});
